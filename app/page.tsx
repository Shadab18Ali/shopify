import { getPublishedSections, formatPrice, type Section } from "@/lib/db";
import CustomizeForm from "./sections/[slug]/CustomizeForm";

export const dynamic = "force-dynamic";

const EDITOR_ITEMS = ["Announcement bar", "Before / after slider", "Bundle builder", "Size chart drawer", "Reviews carousel", "FAQ accordion"];

export default async function Home() {
  let sections: Section[] = [];
  try { sections = await getPublishedSections(); } catch (e) { console.error(e); }
  const categories = Array.from(new Set(sections.map((s) => s.category)));

  return (
    <main>
      <header className="hero wrap">
        <div className="hero-copy">
          <h1 className="h1">Shopify sections you add in two minutes.</h1>
          <p className="lede">
            Each section is a Liquid file built for Shopify 2.0 themes. Buy it, upload it to your theme,
            and edit everything from the theme editor. No app, no monthly fee.
          </p>
          <div className="row">
            <a className="btn" href="#sections">Browse sections</a>
            <a className="link" href="#custom">Need it adjusted for your store?</a>
          </div>
        </div>
        <aside className="editor" aria-label="Example of sections in the Shopify theme editor">
          <div className="editor-head">Template: Product</div>
          <ul>
            {EDITOR_ITEMS.map((t, i) => (
              <li key={t} style={{ animationDelay: `${0.25 + i * 0.12}s` }}>
                <span className="grip" aria-hidden>⋮⋮</span>{t}
              </li>
            ))}
          </ul>
          <div className="editor-add">+ Add section</div>
        </aside>
      </header>

      <section id="sections" className="wrap shelf">
        <div className="shelf-head">
          <h2 className="h2">Sections</h2>
          {categories.length > 1 && <p className="muted">{categories.join(", ")}</p>}
        </div>
        {sections.length === 0 ? (
          <p className="empty">New sections are on the way. Check back soon, or ask for a custom one below.</p>
        ) : (
          <ul className="grid">
            {sections.map((s) => (
              <li key={s.id} className="card">
                <a href={`/sections/${s.slug}`} className="card-link">
                  <div className="thumb">
                    {s.preview_url ? <img src={s.preview_url} alt="" loading="lazy" /> : <span className="thumb-fallback">{s.title}</span>}
                    <span className="sticker">{formatPrice(s.price, s.currency)}</span>
                  </div>
                  <h3 className="card-title">{s.title}</h3>
                  {s.summary && <p className="card-sum">{s.summary}</p>}
                  <p className="card-cat">{s.category}</p>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="custom" className="wrap custom">
        <div>
          <h2 className="h2">Want it to match your store exactly?</h2>
          <p className="lede">
            Send your store link and what you need: colours, layout changes, extra settings, or a section
            built from scratch. I reply with a fixed quote, usually within a day.
          </p>
        </div>
        <CustomizeForm />
      </section>
    </main>
  );
}
