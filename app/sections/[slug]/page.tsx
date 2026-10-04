import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSectionBySlug, formatPrice } from "@/lib/db";
import BuyButton from "./BuyButton";
import CustomizeForm from "./CustomizeForm";
import { siteUrl } from "@/lib/site";
import { paypalAvailable } from "@/lib/paypal";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const s = await getSectionBySlug(params.slug).catch(() => null);
  if (!s) return {};
  const title = `${s.title} | Liquid Shelf`;
  const description = s.summary || undefined;
  const url = `${siteUrl()}/sections/${s.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: "Liquid Shelf",
      title,
      description,
      url,
      ...(s.preview_url ? { images: [{ url: s.preview_url, alt: `${s.title} preview` }] } : {}),
    },
    twitter: {
      card: s.preview_url ? "summary_large_image" : "summary",
      title,
      description,
      ...(s.preview_url ? { images: [s.preview_url] } : {}),
    },
  };
}

export default async function SectionPage({ params }: { params: { slug: string } }) {
  const s = await getSectionBySlug(params.slug);
  if (!s) notFound();

  const url = `${siteUrl()}/sections/${s.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: s.title,
    description: s.summary || s.description.slice(0, 300) || s.title,
    category: s.category,
    url,
    ...(s.preview_url ? { image: [s.preview_url] } : {}),
    brand: { "@type": "Brand", name: "Liquid Shelf" },
    offers: {
      "@type": "Offer",
      url,
      price: (s.price / 100).toFixed(2),
      priceCurrency: s.currency,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <main className="wrap detail">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <a href="/#sections" className="link back">All sections</a>
      <div className="detail-grid">
        <div>
          <div className="thumb big">
            {s.preview_url ? <img src={s.preview_url} alt={`${s.title} preview`} /> : <span className="thumb-fallback">{s.title}</span>}
          </div>
          {s.demo_url && <p><a className="link" href={s.demo_url} target="_blank" rel="noreferrer">Open the live demo</a></p>}
        </div>
        <div className="detail-info">
          <p className="card-cat">{s.category}</p>
          <h1 className="h2">{s.title}</h1>
          {s.summary && <p className="lede">{s.summary}</p>}
          <p className="price">{formatPrice(s.price, s.currency)}</p>
          <BuyButton slug={s.slug} currency={s.currency} paypalClientId={paypalAvailable(s.currency) ? process.env.PAYPAL_CLIENT_ID : undefined} />
          <div className="desc">{s.description}</div>
          <details className="howto">
            <summary>How to install</summary>
            <ol>
              <li>In Shopify admin, go to Online Store, then Themes, then Edit code.</li>
              <li>Under Sections, choose Add a new section and paste the file contents.</li>
              <li>Open Customize, choose Add section, and pick it from the list.</li>
            </ol>
          </details>
        </div>
      </div>

      <section className="custom inset" id="custom">
        <div>
          <h2 className="h3">Get this section adjusted for your store</h2>
          <p className="muted">Tell me what to change. You get a fixed quote before any work starts.</p>
        </div>
        <CustomizeForm slug={s.slug} />
      </section>
    </main>
  );
}
