"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type PaypalButtons = { render: (el: HTMLElement) => Promise<void>; close: () => void };
type PaypalApi = {
  Buttons: (opts: {
    style?: Record<string, unknown>;
    createOrder: () => Promise<string>;
    onApprove: (data: { orderID: string }) => Promise<void>;
    onCancel?: () => void;
    onError?: (err: unknown) => void;
  }) => PaypalButtons;
};

declare global {
  interface Window {
    paypal?: PaypalApi;
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void }
  }
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

function loadPaypal(clientId: string, currency: string) {
  return new Promise<boolean>((resolve) => {
    if (window.paypal) return resolve(true);
    const s = document.createElement("script");
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}&intent=capture&components=buttons`;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function BuyButton({ slug, currency, paypalClientId }: { slug: string; currency: string; paypalClientId?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const emailRef = useRef(email);
  emailRef.current = email;
  const paypalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!paypalClientId) return;
    let buttons: PaypalButtons | null = null;
    let cancelled = false;
    loadPaypal(paypalClientId, currency).then((ok) => {
      if (!ok || cancelled || !window.paypal || !paypalRef.current) return;
      buttons = window.paypal.Buttons({
        style: { layout: "horizontal", tagline: false, height: 45 },
        createOrder: async () => {
          setError("");
          if (!EMAIL_RE.test(emailRef.current)) {
            setError("Enter your email address first, then choose PayPal.");
            throw new Error("email required");
          }
          const res = await fetch("/api/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug, email: emailRef.current }),
          });
          const data = await res.json();
          if (!res.ok) { setError(data.error || "PayPal could not start."); throw new Error(data.error); }
          return data.orderId as string;
        },
        onApprove: async (data) => {
          const res = await fetch("/api/paypal/capture", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: data.orderID }),
          });
          const d = await res.json();
          if (res.ok) router.push(`/download/${d.token}`);
          else setError(d.error || "Payment could not be verified. Email me with your PayPal transaction ID.");
        },
        onError: () => setError((prev) => prev || "PayPal ran into a problem. No money was taken unless you see a PayPal receipt."),
      });
      buttons.render(paypalRef.current).catch(() => {});
    });
    return () => { cancelled = true; try { buttons?.close(); } catch {} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paypalClientId, currency, slug]);

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
      {paypalClientId && (
        <>
          <p className="muted small">or pay with PayPal</p>
          <div ref={paypalRef} />
        </>
      )}
      {error && <p className="error" role="alert">{error}</p>}
    </form>
  );
}
