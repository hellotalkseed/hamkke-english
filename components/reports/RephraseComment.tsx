"use client";

import { useState } from "react";

export default function RephraseComment({ participant, field="teacher_note", value, onApply }: {
  participant: string; field?: string; value: string; onApply: (text: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [suggestion, setSuggestion] = useState<{ original: string; text: string } | null>(null);
  const visible = suggestion?.original === value ? suggestion : null;

  async function rephrase() {
    const original = value;
    setBusy(true);
    setError("");
    setSuggestion(null);
    try {
      const res = await fetch(`/api/admin/teachers/students/${participant}/progress-report/polish`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, text: original }),
      });
      const result = await res.json();
      if (!res.ok || !result.polishedText?.trim()) throw Error();
      setSuggestion({ original, text: result.polishedText.trim() });
    } catch {
      setError("Unable to rephrase right now. Your original wording is still in the editor.");
    } finally { setBusy(false); }
  }

  return <div className="my-2 text-sm">
    <button type="button" disabled={busy || !value.trim()} onClick={rephrase}
      className="rounded-lg border border-[#BAC9BC] px-3 py-1.5 text-[#405C48] disabled:opacity-50">
      {busy ? "Rephrasing…" : field==="teacher_note" || field==="comment" ? "Rephrase comment" : "Rephrase"}
    </button>
    {error && <p role="status">{error}</p>}
    {visible && <section aria-label="Suggested wording" className="mt-2 rounded-lg bg-[#F1F5EF] p-3">
      <strong>Suggested wording</strong><p className="my-2 whitespace-pre-wrap">{visible.text}</p>
      <div className="flex gap-4">
        <button type="button" className="underline" onClick={() => { onApply(visible.text); setSuggestion(null); }}>Use suggestion</button>
        <button type="button" className="underline" onClick={() => setSuggestion(null)}>Keep original</button>
      </div>
    </section>}
  </div>;
}
