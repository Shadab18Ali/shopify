import { db } from "./db";
import { sendEmail, escapeHtml } from "./email";

export type PaidOrder = { download_token: string; email: string; title: string };

type Provider = "razorpay" | "paypal";

const COLUMNS = {
  razorpay: { orderCol: "razorpay_order_id", paymentCol: "razorpay_payment_id" },
  paypal: { orderCol: "paypal_order_id", paymentCol: "paypal_capture_id" },
} as const;

/**
 * Marks an order paid. Safe to call more than once (e.g. from both /api/verify and the webhook):
 * only the call that flips pending to paid sends the emails. Returns null if the order doesn't exist.
 */
async function markPaid(provider: Provider, orderId: string, paymentId: string): Promise<PaidOrder | null> {
  const { orderCol, paymentCol } = COLUMNS[provider];
  const flipped = (await db().query(
    `UPDATE orders SET status = 'paid', ${paymentCol} = $2
     WHERE ${orderCol} = $1 AND status <> 'paid'
     RETURNING download_token, email, (SELECT title FROM sections WHERE id = orders.section_id) AS title`,
    [orderId, paymentId]
  )) as PaidOrder[];

  if (flipped[0]) {
    await sendPurchaseEmails(flipped[0]);
    return flipped[0];
  }

  const existing = (await db().query(
    `SELECT download_token, email, (SELECT title FROM sections WHERE id = orders.section_id) AS title
     FROM orders WHERE ${orderCol} = $1 AND status = 'paid'`,
    [orderId]
  )) as PaidOrder[];
  return existing[0] ?? null;
}

export const markOrderPaid = (orderId: string, paymentId: string) => markPaid("razorpay", orderId, paymentId);
export const markPaypalOrderPaid = (orderId: string, captureId: string) => markPaid("paypal", orderId, captureId);

async function sendPurchaseEmails(order: PaidOrder) {
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
}
