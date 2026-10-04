import { NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { markOrderPaid } from "@/lib/orders";

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

  const order = await markOrderPaid(orderId, paymentId);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  return NextResponse.json({ token: order.download_token });
}
