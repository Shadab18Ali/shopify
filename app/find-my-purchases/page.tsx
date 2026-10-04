import type { Metadata } from "next";
import FindForm from "./FindForm";

export const metadata: Metadata = {
  title: "Find my purchases | Liquid Shelf",
  description: "Lost your download link? Enter your email and we will send your links again.",
  robots: { index: false },
};

export default function FindMyPurchases() {
  return (
    <main className="wrap narrow">
      <h1 className="h2">Find my purchases</h1>
      <p className="lede">
        Enter the email you used at checkout. We will email you the download links for your paid purchases. Links are
        only ever sent to that address and are not shown on this page.
      </p>
      <FindForm />
    </main>
  );
}
