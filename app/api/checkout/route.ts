import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { db, getSectionBySlug } from "@/lib/db";
import { createRazorpayOrder, publicKeyId } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { slug, email } = (await req.json()) as { slug?: string; email?: string };
    if (!slug || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    const section = await getSectionBySlug(slug);
    if (!section) return NextResponse.json({ error: "This section is no longer available." }, { status: 404 });

    const token = randomBytes(24).toString("hex");
    const order = await createRazorpayOrder(section.price, section.currency, `s${section.id}-${Date.now()}`);

    await db().query(
      `INSERT INTO orders (section_id, email, amount, currency, razorpay_order_id, download_token)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [section.id, email.toLowerCase(), section.price, section.currency, order.id, token]
    );

    return NextResponse.json({
      keyId: publicKeyId(),
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      title: section.title,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Checkout could not start. Try again in a minute." }, { status: 500 });
  }
}
