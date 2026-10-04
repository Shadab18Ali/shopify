import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Liquid Shelf | Ready-made Shopify sections",
  description: "Drop-in Shopify 2.0 sections for $2 each, with optional customization for your store.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <nav className="nav wrap">
          <a href="/" className="logo">Liquid Shelf</a>
          <div className="nav-links">
            <a href="/#sections">Sections</a>
            <a href="/#custom">Custom work</a>
          </div>
        </nav>
        {children}
        <footer className="foot wrap">
          <p>Built and supported by Shadab Ali, Shopify developer in Delhi.</p>
          <nav className="foot-links" aria-label="Footer">
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
            <a href="/refund-policy">Refunds</a>
            <a href="/find-my-purchases">Find my purchases</a>
            <a href="/contact">Contact</a>
          </nav>
          <p><a href="mailto:shadab18ali@gmail.com">shadab18ali@gmail.com</a></p>
        </footer>
      </body>
    </html>
  );
}
