"use client";

import { useState } from "react";

export default function CustomizeForm({ slug }: { slug?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setState("sending");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/customize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...Object.fromEntries(fd), slug }),
    });
    if (res.ok) setState("sent");
    else { setError((await res.json()).error || "Could not send. Try again."); setState("idle"); }
  }

  if (state === "sent") {
    return <p className="sent" role="status">Request sent. You&rsquo;ll get a quote by email, usually within a day.</p>;
  }

  return (
    <form onSubmit={submit} className="cform">
      <label className="field"><span>Your name</span><input name="name" required /></label>
      <label className="field"><span>Email</span><input name="email" type="email" required /></label>
      <label className="field span2"><span>Store URL</span><input name="storeUrl" required placeholder="yourstore.com" /></label>
      <label className="field span2"><span>What should change?</span><textarea name="details" rows={4} required placeholder="Match my brand colours, add a second button, show it only on mobile…" /></label>
      <label className="field span2"><span>Budget (optional)</span>
        <select name="budget" defaultValue="">
          <option value="">Not sure yet</option><option>Under $20</option><option>$20 to $50</option><option>$50 to $150</option><option>$150+</option>
        </select>
      </label>
      <div className="span2 row">
        <button className="btn" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send request"}</button>
        {error && <span className="error" role="alert">{error}</span>}
      </div>
    </form>
  );
}
