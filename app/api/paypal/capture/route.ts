import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { capturePaypalOrder, toPaypalValue } from "@/lib/paypal";
import { markPaypalOrderPaid } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { orderId } = (await req.json()) as { orderId?: string };
    if (!orderId || !/^[A-Za-z0-9]{10,40}$/.test(orderId)) {
      return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
    }

    // Only capture orders we created, and compare the captured amount with what we stored.
    const rows = (await db().query(
      `SELECT amount, currency, status, download_token FROM orders WHERE paypal_order_id = $1`,
      [orderId]
    )) as { amount: number; currency: string; status: string; download_token: string }[];
    const order = rows[0];
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    if (order.status === "paid") return NextResponse.json({ token: order.download_token });

    const result = await capturePaypalOrder(orderId);
    const capture = result.purchase_units?.[0]?.payments?.captures?.[0];
    if (
      result.status !== "COMPLETED" ||
      !capture ||
      capture.status !== "COMPLETED" ||
      capture.amount.value !== toPaypalValue(order.amount) ||
      capture.amount.currency_code !== order.currency
    ) {
      console.error("PayPal capture not accepted", orderId, JSON.stringify(result));
      return NextResponse.json({ error: "Payment could not be verified. Email me with your PayPal transaction ID." }, { status: 400 });
    }

    const paid = await markPaypalOrderPaid(orderId, capture.id);
    if (!paid) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    return NextResponse.json({ token: paid.download_token });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Payment could not be completed. If money was taken, email me with your PayPal transaction ID." }, { status: 500 });
  }
}
