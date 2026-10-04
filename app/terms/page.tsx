import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Liquid Shelf",
  description: "The terms that apply when you buy or use Shopify sections from Liquid Shelf.",
};

export default function Terms() {
  return (
    <main className="wrap narrow prose">
      <h1 className="h2">Terms of Service</h1>
      <p className="muted">Last updated: 4 October 2026</p>

      <p>
        Liquid Shelf (&quot;we&quot;, &quot;us&quot;) is operated by Shadab Ali from Delhi, India. By buying or
        downloading anything from this site you agree to these terms.
      </p>

      <h2 className="h3">What you are buying</h2>
      <p>
        Each product is a digital file: a Shopify Liquid section, with any snippets, assets and install notes
        listed on its page. You receive a download link after payment is confirmed. Nothing is shipped.
      </p>

      <h2 className="h3">Licence</h2>
      <ul>
        <li>You may use a purchased section on any number of Shopify stores that you own or build for your clients.</li>
        <li>You may edit the code to suit your store.</li>
        <li>You may not resell, redistribute, share or publish the files, original or modified, as a product, template or free download.</li>
        <li>Ownership of the code stays with us. You are buying a licence to use it, not the copyright.</li>
      </ul>

      <h2 className="h3">Compatibility and support</h2>
      <p>
        Sections are built for Shopify Online Store 2.0 themes. Themes vary a lot, so we cannot promise a
        section works unchanged in every theme. Email us if something does not work and we will do our best to
        help. Custom changes to fit your theme are a separate paid service.
      </p>

      <h2 className="h3">Customization requests</h2>
      <p>
        Customization work is quoted in advance. Work begins only after you accept the quote and pay for it.
        The agreed scope in the quote is what we deliver.
      </p>

      <h2 className="h3">Payments</h2>
      <p>
        Payments are processed by Razorpay or PayPal, whichever you choose at checkout. We never see or store your card, UPI or PayPal login details. Prices are shown on
        each section page and include no hidden fees from us. Your bank or card issuer may add its own charges.
      </p>

      <h2 className="h3">Refunds</h2>
      <p>
        Please read our <a href="/refund-policy">Refund Policy</a>. It forms part of these terms.
      </p>

      <h2 className="h3">Warranty and liability</h2>
      <p>
        Sections are provided &quot;as is&quot;. Back up your theme before adding any code. To the extent the law
        allows, our total liability for any claim is limited to the amount you paid for the product the claim
        relates to. We are not liable for lost sales, lost profits or store downtime.
      </p>

      <h2 className="h3">Changes</h2>
      <p>
        We may update these terms. The version published on this page applies from the date shown above. Past
        purchases keep the licence that applied when you bought them.
      </p>

      <h2 className="h3">Governing law</h2>
      <p>These terms are governed by the laws of India. Courts in Delhi have jurisdiction over any dispute.</p>

      <h2 className="h3">Contact</h2>
      <p>
        Questions about these terms: <a href="mailto:shadab18ali@gmail.com">shadab18ali@gmail.com</a>. See also our{" "}
        <a href="/contact">Contact page</a>.
      </p>
    </main>
  );
}
