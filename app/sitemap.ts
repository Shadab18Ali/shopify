import type { MetadataRoute } from "next";
import { getPublishedSections } from "@/lib/db";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const pages = ["", "/terms", "/privacy", "/refund-policy", "/contact"].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "monthly" as const,
    priority: p === "" ? 1 : 0.3,
  }));
  const sections = await getPublishedSections().catch(() => []);
  return [
    ...pages,
    ...sections.map((s) => ({
      url: `${base}/sections/${s.slug}`,
      lastModified: new Date(s.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
