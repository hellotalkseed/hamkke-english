"use client";

import { useCallback, useEffect, useState } from "react";

type Details = { link: string; instructions: string; revision: string; sentRevision: string | null; sentAt: string | null; email: string; platform: string; editable: boolean; message?: string };
export default function AssessmentMeetingDetails({ assessmentId, status }: { assessmentId: string; status: string }) {
  const [details, setDetails] = useState<Details | null>(null);
  const [link, setLink] = useState("");
  const [instructions, setInstructions] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const endpoint = `/api/admin/teachers/assessments/${assessmentId}/meeting`;
  const apply = (data: Details) => { setDetails(data); setLink(data.link); setInstructions(data.instructions); };
  const reload = useCallback(async () => {
    setBusy(true); setError("");
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data) throw new Error(data?.error || "Unable to load meeting details.");
      apply(data);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load meeting details."); }
    finally { setBusy(false); }
  }, [endpoint]);
  useEffect(() => { void reload(); }, [reload, status]);
  const dirty = Boolean(details && (link.trim() !== details.link || instructions.trim() !== details.instructions));
  const alreadySent = Boolean(details && details.revision === details.sentRevision);
  async function submit(send: boolean) {
    if (!details || busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(endpoint, { method: send ? "POST" : "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revision: details.revision, link, instructions }) });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data) throw new Error(data?.error || "Unable to update meeting details.");
      apply(data); setMessage(data.message || "Details saved. You can now email them to the learner.");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to update meeting details."); }
    finally { setBusy(false); }
  }
  return <section className="mt-6 rounded-[26px] border border-[#e7e1da] bg-white p-6 sm:p-7">
    <h2 className="font-medium text-[#304638]">Meeting details</h2>
    <p className="mt-2 text-sm leading-6 text-[#718276]">Save the meeting link or connection instructions, then email them to the booking contact.</p>
    {details && <>
      <div className="my-5 rounded-xl bg-[#EEF2EA] p-4 text-sm leading-6 text-[#46564B]">
        <p>Platform: <span className="font-medium">{details.platform.replaceAll("_", " ")}</span></p>
        <p className="break-all">Email to: {details.email}</p>
        <p className="mt-2 text-xs">{details.sentAt ? `Last emailed: ${new Date(details.sentAt).toLocaleString()}` : "Not emailed yet"}</p>
        {details.sentAt && !alreadySent && <p className="mt-1 text-xs font-medium">Updated details have not been emailed yet.</p>}
      </div>
      <label className="block text-sm">Meeting link (optional)
        <input type="url" maxLength={2048} value={link} onChange={e => { setLink(e.target.value); setMessage(""); }} disabled={busy || !details.editable}
          placeholder="https://…" className="mt-2 block w-full rounded-xl border border-[#e7e1da] bg-[#fbfaf8] p-3 disabled:opacity-60" />
      </label>
      <label className="mt-4 block text-sm">Connection instructions
        <textarea value={instructions} maxLength={3000} rows={4} onChange={e => { setInstructions(e.target.value); setMessage(""); }} disabled={busy || !details.editable}
          placeholder="Meeting ID, passcode, or how to connect through KakaoTalk. Do not include account passwords."
          className="mt-2 block w-full rounded-xl border border-[#e7e1da] bg-[#fbfaf8] p-3 disabled:opacity-60" />
      </label>
      {details.editable ? <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" disabled={busy || !dirty || (!link.trim() && !instructions.trim())} onClick={() => void submit(false)} className="rounded-full border border-[#6F8F72] px-5 py-3 text-sm text-[#46564B] disabled:opacity-40">Save details</button>
        <button type="button" disabled={busy || dirty || alreadySent || (!details.link && !details.instructions)} onClick={() => void submit(true)} className="rounded-full bg-[#6F8F72] px-5 py-3 text-sm text-white disabled:opacity-40">{busy ? "Please wait…" : alreadySent && !dirty ? "Details emailed" : "Send to learner"}</button>
      </div> : <p className="mt-4 text-sm text-[#718276]">Meeting details are read-only for this assessment.</p>}
      {dirty && <p className="mt-3 text-xs text-[#718276]">Save your changes before sending.</p>}
      <p className="mt-3 text-xs text-[#718276]">Send to learner sends an email. For KakaoTalk or other messaging apps, share the saved details there manually.</p>
    </>}
    {!details && !error && <p className="mt-4 text-sm">Loading meeting details…</p>}
    {message && <p role="status" className="mt-4 text-sm text-[#526F56]">{message}</p>}
    {error && <div role="alert" className="mt-4 text-sm text-[#96594E]">{error} <button type="button" disabled={busy} onClick={() => void reload()} className="ml-2 underline">Reload details</button></div>}
  </section>;
}
