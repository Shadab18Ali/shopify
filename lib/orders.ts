import { db } from "./db";
import { sendEmail, escapeHtml } from "./email";

export type PaidOrder = { download_token: string; email: string; title: string };

/**
 * Marks an order paid. Safe to call more than once (e.g. from both /api/verify and the webhook):
 * only the call that flips pending to paid sends the emails. Returns null if the order doesn't exist.
 */
export async function markOrderPaid(orderId: string, paymentId: string): Promise<PaidOrder | null> {
  const flipped = (await db().query(
    `UPDATE orders SET status = 'paid', razorpay_payment_id = $2
     WHERE razorpay_order_id = $1 AND status <> 'paid'
     RETURNING download_token, email, (SELECT title FROM sections WHERE id = orders.section_id) AS title`,
    [orderId, paymentId]
  )) as PaidOrder[];

  if (flipped[0]) {
    await sendPurchaseEmails(flipped[0]);
    return flipped[0];
  }

  const existing = (await db().query(
    `SELECT download_token, email, (SELECT title FROM sections WHERE id = orders.section_id) AS title
     FROM orders WHERE razorpay_order_id = $1 AND status = 'paid'`,
    [orderId]
  )) as PaidOrder[];
  return existing[0] ?? null;
}

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
