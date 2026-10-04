import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Liquid Shelf",
  description: "Get in touch with Liquid Shelf for support, refunds and custom Shopify work.",
};

export default function Contact() {
  return (
    <main className="wrap narrow prose">
      <h1 className="h2">Contact</h1>
      <p className="lede">Questions, problems with a download, or a custom section in mind? Email me.</p>

      <dl className="contact">
        <dt>Email</dt>
        <dd><a href="mailto:shadab18ali@gmail.com">shadab18ali@gmail.com</a></dd>
        <dt>Business</dt>
        <dd>Liquid Shelf, operated by Shadab Ali</dd>
        <dt>Location</dt>
        <dd>Delhi, India</dd>
        <dt>Response time</dt>
        <dd>Usually within one business day</dd>
      </dl>

      <p>
        Lost your download link? Use <a href="/find-my-purchases">Find my purchases</a>. For custom work, use the{" "}
        <a href="/#custom">request form</a> on the home page.
      </p>
    </main>
  );
}
