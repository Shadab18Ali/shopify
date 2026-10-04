import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let client: NeonQueryFunction<false, false> | null = null;

/** Lazily created so `next build` works without a database. */
export function db() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    client = neon(url);
  }
  return client;
}

export type Section = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  preview_url: string | null;
  demo_url: string | null;
  published: boolean;
  created_at: string;
};

/** Public columns only: file_url never leaves the server. */
export const PUBLIC_COLS =
  "id, slug, title, summary, description, category, price, currency, preview_url, demo_url, published, created_at";

export async function getPublishedSections(): Promise<Section[]> {
  return (await db().query(
    `SELECT ${PUBLIC_COLS} FROM sections WHERE published = true ORDER BY created_at DESC`
  )) as Section[];
}

export async function getSectionBySlug(slug: string): Promise<Section | null> {
  const rows = (await db().query(
    `SELECT ${PUBLIC_COLS} FROM sections WHERE slug = $1 AND published = true LIMIT 1`,
    [slug]
  )) as Section[];
  return rows[0] ?? null;
}

export function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount / 100);
}

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

/** Typed query helper. */
export async function q<T>(text: string, params: unknown[] = []): Promise<T[]> {
  return (await db().query(text, params)) as T[];
}
