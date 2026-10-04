import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | Liquid Shelf",
  description: "Refund and cancellation policy for digital Shopify sections.",
};

export default function RefundPolicy() {
  return (
    <main className="wrap narrow prose">
      <h1 className="h2">Refund Policy</h1>
      <p className="muted">Last updated: 4 October 2026</p>

      <p>
        Our products are digital files delivered instantly after payment. Because a download cannot be returned,
        the rules below apply.
      </p>

      <h2 className="h3">No refunds after download</h2>
      <p>
        Once you have downloaded a section, the sale is final and we cannot offer a refund or exchange. Please read
        the description and demo before you buy.
      </p>

      <h2 className="h3">Exception: broken files</h2>
      <p>
        If the file you downloaded is broken (for example it is corrupted, will not open, or is missing files that
        the product page says are included), email us within 7 days of purchase. We will first send you a working
        file. If we cannot fix the problem, we will refund you in full.
      </p>
      <p>
        A section that behaves differently in your particular theme is not a broken file, but we are happy to help
        you troubleshoot, and our paid customization service can adapt it to your theme.
      </p>

      <h2 className="h3">Failed or duplicate payments</h2>
      <p>
        If money was taken but you did not get your download link, use{" "}
        <a href="/find-my-purchases">Find my purchases</a> or email us with your payment ID. If you were charged
        twice for the same section, we will refund the duplicate payment.
      </p>

      <h2 className="h3">Customization work</h2>
      <p>
        Custom work is quoted in advance. If you cancel before work starts, you get a full refund. Once work has
        started, we will agree a fair partial refund based on what has been done.
      </p>

      <h2 className="h3">How refunds are paid</h2>
      <p>
        Approved refunds go back to the original payment method through Razorpay. Your bank usually takes 5 to 7
        working days to show it.
      </p>

      <h2 className="h3">How to ask</h2>
      <p>
        Email <a href="mailto:shadab18ali@gmail.com">shadab18ali@gmail.com</a> with the email address you used to buy
        and your payment ID.
      </p>
    </main>
  );
}
