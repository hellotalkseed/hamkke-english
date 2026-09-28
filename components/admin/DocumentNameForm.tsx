"use client";

import { useState, useTransition } from "react";

export default function DocumentNameForm({ initialName, saveAction }: {
  initialName: string;
  saveAction: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState(initialName);
  const [savedName, setSavedName] = useState(initialName);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  return (
    <section>
      <form onSubmit={(event) => {
        event.preventDefault();
        const value = name.trim();
        setMessage(""); setError("");
        if (!value || value.length > 200 || /[\x00-\x1f\x7f]/.test(value)) {
          setError("Enter your full name, up to 200 characters, on one line."); return;
        }
        startTransition(async () => {
          try { await saveAction(value); setName(value); setSavedName(value); setMessage("Full name saved for new agreements."); }
          catch (caught) { setError(caught instanceof Error ? caught.message : "Could not save your full name."); }
        });
      }}>
        <label htmlFor="document-full-name" className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#85847F]">Full name</label>
        <p id="document-name-help" className="mt-1.5 text-xs leading-5 text-[#8A8780]">Used on official documents. Not shown on your public profile.</p>
        <div className="mt-3 flex max-w-2xl flex-col gap-3 sm:flex-row">
          <input id="document-full-name" name="document_full_name" autoComplete="name" required maxLength={200}
            value={name} disabled={pending} onChange={(event) => setName(event.target.value)} aria-describedby="document-name-help"
            className="min-w-0 flex-1 rounded-xl border border-[#D8DED3] bg-[#FFFDF8] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#A8BCA5]" />
          <button type="submit" disabled={pending || !name.trim() || name.trim() === savedName}
            className="rounded-full bg-[#6F8F72] px-5 py-3 text-sm font-medium text-white disabled:opacity-50">{pending ? "Saving..." : "Save"}</button>
        </div>
        {message && <p role="status" className="mt-3 text-sm text-[#49614D]">{message}</p>}
        {error && <p role="alert" className="mt-3 text-sm text-[#994B43]">{error}</p>}
      </form>
    </section>
  );
}
