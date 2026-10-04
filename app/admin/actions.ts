"use server";

import { put, del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, slugify } from "@/lib/db";
import { checkPassword, endSession, requireAdmin, startSession } from "@/lib/auth";

export async function login(_: string | null, form: FormData) {
  if (!checkPassword(String(form.get("password") || ""))) return "Wrong password.";
  startSession();
  redirect("/admin");
}

export async function logout() {
  endSession();
  redirect("/admin/login");
}

function toMinorUnits(v: FormDataEntryValue | null) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return Number(process.env.DEFAULT_PRICE || 200);
  return Math.round(n * 100);
}

export async function createSection(_: string | null, form: FormData) {
  requireAdmin();
  const title = String(form.get("title") || "").trim();
  const file = form.get("file") as File | null;
  const preview = form.get("preview") as File | null;
  if (!title) return "Add a title.";
  if (!file || file.size === 0) return "Choose the section file (.zip or .liquid).";

  const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`;
  // addRandomSuffix makes file URLs unguessable; they're only handed out after payment.
  const stored = await put(`sections/${slug}/${file.name}`, file, { access: "public", addRandomSuffix: true });
  let previewUrl: string | null = null;
  if (preview && preview.size > 0) {
    previewUrl = (await put(`previews/${slug}-${preview.name}`, preview, { access: "public", addRandomSuffix: true })).url;
  }

  await db().query(
    `INSERT INTO sections (slug, title, summary, description, category, price, currency, preview_url, demo_url, file_url, published)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [
      slug,
      title,
      String(form.get("summary") || "").trim(),
      String(form.get("description") || "").trim(),
      String(form.get("category") || "General").trim() || "General",
      toMinorUnits(form.get("price")),
      String(form.get("currency") || process.env.DEFAULT_CURRENCY || "USD").toUpperCase(),
      previewUrl,
      String(form.get("demo") || "").trim() || null,
      stored.url,
      form.get("published") === "on",
    ]
  );
  revalidatePath("/");
  revalidatePath("/admin");
  return "Uploaded.";
}

export async function togglePublished(form: FormData) {
  requireAdmin();
  await db().query(`UPDATE sections SET published = NOT published WHERE id = $1`, [Number(form.get("id"))]);
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteSection(form: FormData) {
  requireAdmin();
  const rows = (await db().query(
    `DELETE FROM sections WHERE id = $1 RETURNING file_url, preview_url`,
    [Number(form.get("id"))]
  )) as { file_url: string; preview_url: string | null }[];
  const r = rows[0];
  if (r) await del([r.file_url, ...(r.preview_url ? [r.preview_url] : [])]).catch(() => {});
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function setRequestStatus(form: FormData) {
  requireAdmin();
  const status = String(form.get("status"));
  if (!["new", "quoted", "in_progress", "done"].includes(status)) return;
  await db().query(`UPDATE custom_requests SET status = $2 WHERE id = $1`, [Number(form.get("id")), status]);
  revalidatePath("/admin");
}
