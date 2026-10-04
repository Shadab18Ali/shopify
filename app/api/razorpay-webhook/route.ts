import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { markOrderPaid } from "@/lib/orders";

export const dynamic = "force-dynamic";

type CapturedEvent = {
  event?: string;
  payload?: { payment?: { entity?: { id?: string; order_id?: string; amount?: number; currency?: string } } };
};

/**
 * Backup for /api/verify: Razorpay calls this when a payment is captured, so the order is
 * still marked paid if the buyer closes the browser before the checkout handler runs.
 * Dashboard setup: Settings, Webhooks, URL = <SITE_URL>/api/razorpay-webhook, event = payment.captured,
 * secret = RAZORPAY_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  // The signature covers the exact raw bytes, so read the body as text before parsing.
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";

  try {
    if (!signature || !verifyWebhookSignature(raw, signature)) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 500 });
  }

  let evt: CapturedEvent;
  try {
    evt = JSON.parse(raw) as CapturedEvent;
  } catch {
    return NextResponse.json({ error: "Bad payload." }, { status: 400 });
  }

  // Acknowledge other events so Razorpay doesn't keep retrying them.
  if (evt.event !== "payment.captured") return NextResponse.json({ ok: true, ignored: true });

  const p = evt.payload?.payment?.entity;
  if (!p?.id || !p.order_id) return NextResponse.json({ ok: true, ignored: true });

  try {
    const rows = (await db().query(`SELECT amount, currency FROM orders WHERE razorpay_order_id = $1`, [p.order_id])) as {
      amount: number;
      currency: string;
    }[];
    const order = rows[0];
    if (!order) return NextResponse.json({ ok: true, ignored: true }); // not one of our orders

    if (order.amount !== p.amount || order.currency !== p.currency) {
      console.error("Webhook amount mismatch", p.order_id, order, p.amount, p.currency);
      return NextResponse.json({ ok: true, ignored: true });
    }

    await markOrderPaid(p.order_id, p.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    // A non-2xx makes Razorpay retry later.
    return NextResponse.json({ error: "Could not process webhook." }, { status: 500 });
  }
}
