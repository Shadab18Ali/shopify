"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window { Razorpay?: new (opts: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void } }
}

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function BuyButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function buy(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const ok = await loadRazorpay();
      if (!ok || !window.Razorpay) throw new Error("The payment window could not load. Check your connection and try again.");

      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, email }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const rzp = new window.Razorpay({
        key: data.keyId,
        order_id: data.orderId,
        amount: data.amount,
        currency: data.currency,
        name: "Liquid Shelf",
        description: data.title,
        prefill: { email },
        theme: { color: "#3B4BFF" },
        handler: async (resp: Record<string, string>) => {
          const v = await fetch("/api/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(resp) });
          const vd = await v.json();
          if (v.ok) router.push(`/download/${vd.token}`);
          else { setError(vd.error || "Payment could not be verified. Email me with your payment ID."); setBusy(false); }
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.on("payment.failed", () => { setError("The payment did not go through. No money was taken."); setBusy(false); });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={buy} className="buy">
      <label className="field">
        <span>Email for your download link</span>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@store.com" />
      </label>
      <button className="btn" disabled={busy}>{busy ? "Opening payment…" : "Buy and download"}</button>
      {error && <p className="error" role="alert">{error}</p>}
    </form>
  );
}
