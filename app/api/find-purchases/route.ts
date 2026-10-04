import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail, escapeHtml } from "@/lib/email";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_EMAIL = 3;
const MAX_PER_IP = 10;

// Best-effort throttle (per server instance) so the form can't be used to flood an inbox.
const hits = new Map<string, number[]>();

function tooMany(key: string, max: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  return false;
}

export async function POST(req: Request) {
  let email = "";
  try {
    const b = (await req.json()) as { email?: string };
    email = (b.email || "").trim().toLowerCase().slice(0, 200);
  } catch {
    // fall through to validation error
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooMany(`ip:${ip}`, MAX_PER_IP) || tooMany(`email:${email}`, MAX_PER_EMAIL)) {
    return NextResponse.json({ error: "Too many requests. Please try again in a few minutes." }, { status: 429 });
  }

  try {
    const site = (process.env.SITE_URL || "").replace(/\/+$/, "");
    if (!site) {
      console.error("find-purchases: SITE_URL is not set, cannot build download links");
    } else {
      const orders = (await db().query(
        `SELECT s.title, o.download_token
         FROM orders o JOIN sections s ON s.id = o.section_id
         WHERE lower(o.email) = $1 AND o.status = 'paid'
         ORDER BY o.created_at DESC`,
        [email]
      )) as { title: string; download_token: string }[];

      if (orders.length > 0) {
        const items = orders
          .map((o) => `<li><b>${escapeHtml(o.title)}</b><br><a href="${site}/download/${o.download_token}">Download</a></li>`)
          .join("");
        await sendEmail(
          email,
          "Your Liquid Shelf downloads",
          `<p>You asked us to resend your purchases. Here they are:</p>
           <ul>${items}</ul>
           <p>If you did not ask for this email, you can ignore it.</p>`
        );
      }
    }
  } catch (e) {
    console.error(e);
  }

  // Same answer whether or not the address has orders, so this can't be used to probe for customers.
  return NextResponse.json({ ok: true });
}
