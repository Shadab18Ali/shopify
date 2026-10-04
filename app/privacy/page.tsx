import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Liquid Shelf",
  description: "What personal data Liquid Shelf collects, why, and who it is shared with.",
};

export default function Privacy() {
  return (
    <main className="wrap narrow prose">
      <h1 className="h2">Privacy Policy</h1>
      <p className="muted">Last updated: 4 October 2026</p>

      <p>
        This policy explains what Liquid Shelf, operated by Shadab Ali from Delhi, India, does with your
        personal data.
      </p>

      <h2 className="h3">What we collect</h2>
      <ul>
        <li><b>Purchases:</b> your email address, the section you bought, the amount, and Razorpay order and payment IDs.</li>
        <li><b>Customization requests:</b> your name, email, store URL, budget and the details you write.</li>
        <li><b>Find my purchases:</b> the email address you type in, used only to look up your orders.</li>
      </ul>
      <p>
        We do not see or store your card, UPI or bank details. They go directly to Razorpay. We do not use
        advertising trackers.
      </p>

      <h2 className="h3">Why we use it</h2>
      <ul>
        <li>To take payment and deliver your download link.</li>
        <li>To email you your purchase and, if you ask, to resend your links.</li>
        <li>To reply to customization requests and support emails.</li>
        <li>To keep sales records as required by law.</li>
      </ul>

      <h2 className="h3">Who we share it with</h2>
      <p>We only use these service providers to run the site:</p>
      <ul>
        <li>Razorpay, for payments.</li>
        <li>Vercel, for hosting and file storage.</li>
        <li>Neon, for our database.</li>
        <li>Resend, for sending email.</li>
      </ul>
      <p>We do not sell your data.</p>

      <h2 className="h3">How long we keep it</h2>
      <p>
        Order records are kept as long as needed to provide downloads and meet accounting and tax obligations.
        Customization requests are kept while the work is ongoing and for a reasonable period afterwards.
      </p>

      <h2 className="h3">Cookies</h2>
      <p>
        The public site sets no cookies. A single sign-in cookie is used on the private admin area only.
        Razorpay&apos;s payment window may set its own cookies while you pay.
      </p>

      <h2 className="h3">Your choices</h2>
      <p>
        You can ask to see, correct or delete the personal data we hold about you by emailing{" "}
        <a href="mailto:shadab18ali@gmail.com">shadab18ali@gmail.com</a>. We may need to keep some order records
        where the law requires it.
      </p>

      <h2 className="h3">Changes</h2>
      <p>If we change this policy, the new version will be posted here with a new date.</p>
    </main>
  );
}
