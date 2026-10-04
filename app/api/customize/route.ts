import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail, escapeHtml } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const b = (await req.json()) as Record<string, string | undefined>;
  const name = b.name?.trim().slice(0, 120);
  const email = b.email?.trim().toLowerCase().slice(0, 200);
  const storeUrl = b.storeUrl?.trim().slice(0, 300);
  const details = b.details?.trim().slice(0, 4000);
  const budget = (b.budget || "").trim().slice(0, 60);

  if (!name || !email || !storeUrl || !details || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Fill in your name, email, store URL and what you need." }, { status: 400 });
  }

  let sectionId: number | null = null;
  if (b.slug) {
    const r = (await db().query(`SELECT id FROM sections WHERE slug = $1`, [b.slug])) as { id: number }[];
    sectionId = r[0]?.id ?? null;
  }

  await db().query(
    `INSERT INTO custom_requests (section_id, name, email, store_url, budget, details) VALUES ($1,$2,$3,$4,$5,$6)`,
    [sectionId, name, email, storeUrl, budget, details]
  );

  if (process.env.ADMIN_EMAIL) {
    await sendEmail(
      process.env.ADMIN_EMAIL,
      `Customization request from ${name}`,
      `<p><b>${escapeHtml(name)}</b> (${escapeHtml(email)})</p>
       <p>Store: ${escapeHtml(storeUrl)}<br>Budget: ${escapeHtml(budget || "not given")}<br>Section: ${escapeHtml(b.slug || "none")}</p>
       <p>${escapeHtml(details).replace(/\n/g, "<br>")}</p>`
    );
  }
  return NextResponse.json({ ok: true });
}
