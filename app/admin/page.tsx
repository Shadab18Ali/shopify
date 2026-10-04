import { q, formatPrice } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logout, togglePublished, deleteSection, setRequestStatus } from "./actions";
import UploadForm from "./UploadForm";

export const dynamic = "force-dynamic";

type Row = { id: number; title: string; slug: string; price: number; currency: string; published: boolean; sales: number };
type Order = { id: number; email: string; amount: number; currency: string; status: string; title: string; created_at: string; downloads: number };
type Req = { id: number; name: string; email: string; store_url: string; budget: string; details: string; status: string; title: string | null; created_at: string };

export default async function AdminPage() {
  requireAdmin();
  const [sections, orders, requests, totals] = await Promise.all([
    q<Row>(`SELECT s.id, s.title, s.slug, s.price, s.currency, s.published,
                 (SELECT count(*)::int FROM orders o WHERE o.section_id = s.id AND o.status = 'paid') AS sales
               FROM sections s ORDER BY s.created_at DESC`),
    q<Order>(`SELECT o.id, o.email, o.amount, o.currency, o.status, o.downloads, o.created_at, s.title
               FROM orders o JOIN sections s ON s.id = o.section_id
               WHERE o.status = 'paid' ORDER BY o.created_at DESC LIMIT 50`),
    q<Req>(`SELECT r.*, s.title FROM custom_requests r LEFT JOIN sections s ON s.id = r.section_id
               ORDER BY (r.status = 'done'), r.created_at DESC LIMIT 100`),
    q<{ currency: string; total: number; n: number }>(`SELECT currency, sum(amount)::int AS total, count(*)::int AS n FROM orders WHERE status = 'paid' GROUP BY currency`),
  ]);
  const open = requests.filter((r) => r.status !== "done").length;

  return (
    <main className="wrap admin">
      <header className="admin-head">
        <h1 className="h2">Your shop</h1>
        <form action={logout}><button className="link">Sign out</button></form>
      </header>

      <p className="totals">
        {totals.length === 0 ? "No sales yet." : totals.map((t) => `${formatPrice(t.total, t.currency)} from ${t.n} sales`).join(", ")}
        {" "}{open > 0 && <a href="#requests">{open} open customization request{open > 1 ? "s" : ""}</a>}
      </p>

      <section className="panel">
        <h2 className="h3">Upload a new section</h2>
        <UploadForm defaultCurrency={process.env.DEFAULT_CURRENCY || "USD"} />
      </section>

      <section className="panel">
        <h2 className="h3">Sections ({sections.length})</h2>
        {sections.length === 0 ? <p className="muted">Upload your first section above.</p> : (
          <div className="table-scroll"><table>
            <thead><tr><th>Title</th><th>Price</th><th>Sales</th><th>Status</th><th></th></tr></thead>
            <tbody>{sections.map((s) => (
              <tr key={s.id}>
                <td><a href={`/sections/${s.slug}`}>{s.title}</a></td>
                <td>{formatPrice(s.price, s.currency)}</td>
                <td>{s.sales}</td>
                <td>
                  <form action={togglePublished}><input type="hidden" name="id" value={s.id} />
                    <button className="link">{s.published ? "Live, hide it" : "Hidden, publish it"}</button></form>
                </td>
                <td>
                  <form action={deleteSection}><input type="hidden" name="id" value={s.id} />
                    <button className="link danger">Delete</button></form>
                </td>
              </tr>))}
            </tbody>
          </table></div>
        )}
      </section>

      <section className="panel" id="requests">
        <h2 className="h3">Customization requests</h2>
        {requests.length === 0 ? <p className="muted">Requests from the &ldquo;Customize it for my store&rdquo; form show up here.</p> : (
          <ul className="requests">{requests.map((r) => (
            <li key={r.id} className={`req req-${r.status}`}>
              <div className="req-top">
                <strong>{r.name}</strong>
                <a href={`mailto:${r.email}`}>{r.email}</a>
                <a href={r.store_url.startsWith("http") ? r.store_url : `https://${r.store_url}`} target="_blank" rel="noreferrer">{r.store_url}</a>
              </div>
              <p className="muted small">{r.title ? `For: ${r.title}` : "General request"}{r.budget ? `, budget ${r.budget}` : ""}, {new Date(r.created_at).toLocaleDateString("en-IN")}</p>
              <p className="req-body">{r.details}</p>
              <form action={setRequestStatus} className="row">
                <input type="hidden" name="id" value={r.id} />
                <select name="status" defaultValue={r.status}>
                  <option value="new">New</option><option value="quoted">Quoted</option>
                  <option value="in_progress">In progress</option><option value="done">Done</option>
                </select>
                <button className="btn small">Save</button>
              </form>
            </li>))}
          </ul>
        )}
      </section>

      <section className="panel">
        <h2 className="h3">Recent sales</h2>
        {orders.length === 0 ? <p className="muted">Paid orders appear here.</p> : (
          <div className="table-scroll"><table>
            <thead><tr><th>Date</th><th>Section</th><th>Buyer</th><th>Amount</th><th>Downloads</th></tr></thead>
            <tbody>{orders.map((o) => (
              <tr key={o.id}><td>{new Date(o.created_at).toLocaleDateString("en-IN")}</td><td>{o.title}</td><td>{o.email}</td><td>{formatPrice(o.amount, o.currency)}</td><td>{o.downloads}</td></tr>
            ))}</tbody>
          </table></div>
        )}
      </section>
    </main>
  );
}
