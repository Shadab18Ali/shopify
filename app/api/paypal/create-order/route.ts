import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { db, getSectionBySlug } from "@/lib/db";
import { createPaypalOrder, paypalAvailable } from "@/lib/paypal";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { slug, email } = (await req.json()) as { slug?: string; email?: string };
    if (!slug || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    const section = await getSectionBySlug(slug);
    if (!section) return NextResponse.json({ error: "This section is no longer available." }, { status: 404 });
    if (!paypalAvailable(section.currency)) {
      return NextResponse.json({ error: "PayPal is not available for this item." }, { status: 400 });
    }

    const token = randomBytes(24).toString("hex");
    const order = await createPaypalOrder(section.price, section.currency, `s${section.id}-${Date.now()}`);

    await db().query(
      `INSERT INTO orders (section_id, email, amount, currency, provider, paypal_order_id, download_token)
       VALUES ($1, $2, $3, $4, 'paypal', $5, $6)`,
      [section.id, email.toLowerCase(), section.price, section.currency, order.id, token]
    );

    return NextResponse.json({ orderId: order.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "PayPal checkout could not start. Try again in a minute." }, { status: 500 });
  }
}
