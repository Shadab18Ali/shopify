import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DownloadPage({ params }: { params: { token: string } }) {
  if (!/^[a-f0-9]{48}$/.test(params.token)) notFound();
  const rows = (await db().query(
    `SELECT s.title, s.slug, o.email FROM orders o JOIN sections s ON s.id = o.section_id
     WHERE o.download_token = $1 AND o.status = 'paid'`,
    [params.token]
  )) as { title: string; slug: string; email: string }[];
  const o = rows[0];
  if (!o) notFound();

  return (
    <main className="wrap narrow">
      <h1 className="h2">Payment received</h1>
      <p className="lede">{o.title} is yours. Bookmark this page to download it again later.</p>
      <a className="btn" href={`/api/download/${params.token}`}>Download {o.title}</a>
      <details className="howto" open>
        <summary>How to install</summary>
        <ol>
          <li>In Shopify admin, go to Online Store, then Themes, then Edit code.</li>
          <li>Under Sections, choose Add a new section, name it, and paste the file contents.</li>
          <li>Open Customize, choose Add section, and pick it from the list.</li>
        </ol>
      </details>
      <p className="muted">Want it changed to fit your store? <a href={`/sections/${o.slug}#custom`}>Request a customization</a>.</p>
    </main>
  );
}
