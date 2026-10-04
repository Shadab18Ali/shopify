"use client";

import { useState } from "react";

export default function FindForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/find-purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p className="ok" role="status">
        If there are purchases for {email}, we have emailed the download links to that address. Check your spam
        folder if it does not arrive in a few minutes.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="buy">
      <label className="field">
        <span>Email you used at checkout</span>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@store.com" />
      </label>
      <button className="btn" disabled={busy}>{busy ? "Sending…" : "Email me my downloads"}</button>
      {error && <p className="error" role="alert">{error}</p>}
    </form>
  );
}
