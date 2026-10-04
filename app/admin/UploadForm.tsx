"use client";

import { useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createSection } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return <button className="btn" disabled={pending}>{pending ? "Uploading…" : "Upload section"}</button>;
}

export default function UploadForm({ defaultCurrency }: { defaultCurrency: string }) {
  const ref = useRef<HTMLFormElement>(null);
  const [msg, action] = useFormState(async (prev: string | null, fd: FormData) => {
    const r = await createSection(prev, fd);
    if (r === "Uploaded.") ref.current?.reset();
    return r;
  }, null);

  return (
    <form ref={ref} action={action} className="upload">
      <label className="field span2"><span>Title</span><input name="title" required placeholder="Before / after image slider" /></label>
      <label className="field span2"><span>One-line summary</span><input name="summary" placeholder="Drag handle, mobile swipe, 3 layouts" /></label>
      <label className="field span2"><span>Description and install notes</span><textarea name="description" rows={5} placeholder={"Settings included…\nWorks with Dawn, Sense, Craft…"} /></label>
      <label className="field"><span>Category</span><input name="category" placeholder="Product page" /></label>
      <label className="field"><span>Live demo URL (optional)</span><input name="demo" type="url" placeholder="https://" /></label>
      <label className="field"><span>Price</span><input name="price" type="number" step="0.01" min="0.5" defaultValue="2" /></label>
      <label className="field"><span>Currency</span>
        <select name="currency" defaultValue={defaultCurrency}><option>USD</option><option>INR</option><option>EUR</option></select>
      </label>
      <label className="field"><span>Section file (.zip or .liquid, max 4 MB)</span><input name="file" type="file" required accept=".zip,.liquid,.json,.txt" /></label>
      <label className="field"><span>Preview image (optional)</span><input name="preview" type="file" accept="image/*" /></label>
      <label className="check span2"><input type="checkbox" name="published" defaultChecked /> Publish right away</label>
      <div className="span2 row"><Submit />{msg && <span className={msg === "Uploaded." ? "ok" : "error"} role="status">{msg}</span>}</div>
    </form>
  );
}
