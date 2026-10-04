import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { sendEmail, escapeHtml } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: sig } = body;
  if (!orderId || !paymentId || !sig || !verifyPaymentSignature(orderId, paymentId, sig)) {
    return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
  }

  const rows = (await db().query(
    `UPDATE orders SET status = 'paid', razorpay_payment_id = $2
     WHERE razorpay_order_id = $1
     RETURNING download_token, email, (SELECT title FROM sections WHERE id = orders.section_id) AS title`,
    [orderId, paymentId]
  )) as { download_token: string; email: string; title: string }[];

  const order = rows[0];
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const site = process.env.SITE_URL || "";
  const link = `${site}/download/${order.download_token}`;
  await sendEmail(
    order.email,
    `Your download: ${order.title}`,
    `<p>Thanks for buying <b>${escapeHtml(order.title)}</b>.</p>
     <p><a href="${link}">Download your section</a></p>
     <p>Keep this link. It works whenever you need the file again.</p>`
  );
  if (process.env.ADMIN_EMAIL) {
    await sendEmail(process.env.ADMIN_EMAIL, `New sale: ${order.title}`, `<p>${escapeHtml(order.email)} bought ${escapeHtml(order.title)}.</p>`);
  }

  return NextResponse.json({ token: order.download_token });
}
