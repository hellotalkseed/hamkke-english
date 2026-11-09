"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Participant = { id: string; name: string; timezone: string | null };
type Pause = { id: string; student_id: string | null; name: string; starts_on: string; lessons: number };
type State = { status: string; participants: Participant[]; pauses: Pause[]; schedules: { student_id: string; day: number; time: string }[] };
type Preview = { hash: string; count: number; remaining: number; plan: { id: string; name: string; number: number; old_date: string; date: string; time: string }[] };
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const button = "rounded-lg border border-[#C9D3C8] px-4 py-2 text-sm disabled:opacity-50";

export default function EnrollmentFreezeControls({ studentId, enrollmentId }: { studentId: string; enrollmentId: string }) {
  const router = useRouter();
  const endpoint = `/api/admin/students/${studentId}/enrollments/${enrollmentId}/freeze`;
  const [state, setState] = useState<State | null>(null);
  const [mode, setMode] = useState<"freeze" | "resume" | null>(null);
  const [participant, setParticipant] = useState("");
  const [pauseId, setPauseId] = useState("");
  const [date, setDate] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setState(null); setMode(null); setPreview(null); setError("");
    fetch(endpoint, { cache: "no-store", signal: controller.signal }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load class holds.");
      setState(data);
    }).catch(err => { if (err.name !== "AbortError") setError(err.message); });
    return () => controller.abort();
  }, [endpoint]);
  function open(next: "freeze" | "resume", pause?: Pause) {
    setMode(next); setPauseId(pause?.id || ""); setParticipant(pause?.student_id || "");
    setDate(""); setPreview(null); setError(""); setNotice("");
  }
  async function submit(confirm: boolean) {
    if (busy || !mode || !date) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: confirm ? mode : `${mode}_preview`, date, studentId: participant || null, pauseId: pauseId || null, hash: confirm ? preview?.hash : null }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update classes.");
      if (!confirm) { setPreview(data); return; }
      setMode(null); setPreview(null);
      setNotice(mode === "freeze" ? "Classes placed on hold. Resume them here when the learner is ready." : "Classes resumed with the confirmed schedule.");
      const stateResponse = await fetch(endpoint, { cache: "no-store" });
      const fresh = await stateResponse.json();
      if (!stateResponse.ok) throw new Error(fresh.error || "Saved. Refresh to see the updated hold status.");
      setState(fresh); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not update classes."); setPreview(null); }
    finally { setBusy(false); }
  }
  const affected = state?.participants.filter(p => !participant || p.id === participant) ?? [];
  return <section className="my-5 rounded-xl border border-[#DCD8D2] bg-[#F6F7F3] p-5 font-sans text-sm text-[#314237]">
    <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-medium">Class hold</h3>
      {state?.status === "active" && !mode && <button type="button" className={button} onClick={() => open("freeze")}>Freeze classes</button>}
    </div>
    {!state && !error && <p className="mt-2">Loading…</p>}
    {state && !state.pauses.length && !mode && <p className="mt-2 text-[#6C746E]">No classes on hold.</p>}
    {state?.pauses.map(p => <div key={p.id} className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#DCD8D2] pt-3">
      <div><p className="font-medium">{p.name} · On hold from {p.starts_on}</p><p className="mt-1 text-[#6C746E]">{p.lessons} lessons held · Return date not set</p></div>
      {!mode && <button type="button" className={button} onClick={() => open("resume", p)}>Resume classes</button>}
    </div>)}
    {notice && <p role="status" className="mt-3">{notice}</p>}
    {mode && <div className="mt-4 space-y-4 border-t border-[#DCD8D2] pt-4">
      <p>{mode === "freeze" ? "Hold upcoming lessons until you choose to resume. Completed attendance and the lesson balance stay unchanged." : "Choose a return date. Held lessons will move to the next available dates in the weekly schedule below."}</p>
      <div className="flex flex-wrap gap-4">
        {mode === "freeze" && <label className="grid gap-2">Participant<select disabled={busy} value={participant} onChange={e => { setParticipant(e.target.value); setPreview(null); }} className="rounded-lg border border-[#DCD8D2] bg-white p-2"><option value="">Everyone in this enrollment</option>{state?.participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>}
        <label className="grid gap-2">{mode === "freeze" ? "Freeze from" : "Return date"}<input disabled={busy} type="date" value={date} onChange={e => { setDate(e.target.value); setPreview(null); }} className="rounded-lg border border-[#DCD8D2] bg-white p-2" /></label>
      </div>
      {mode === "resume" && <div className="space-y-2">{affected.map(p => <p key={p.id}><span className="font-medium">{p.name}</span> · {p.timezone || "Asia/Manila"}<br />{state?.schedules.filter(s => s.student_id === p.id).map(s => `${days[s.day]} ${s.time.slice(0, 5)}`).join(" · ") || "No weekly schedule set"}</p>)}<p className="text-[#6C746E]">Check the teacher’s availability before confirming. The preview keeps each participant’s held lessons and skips their existing booked times.</p></div>}
      {preview && <div><p className="mb-2 font-medium">{preview.count} lessons to {mode === "freeze" ? "hold" : "resume"} · {preview.remaining} lessons remaining in the enrollment</p><div className="max-h-64 overflow-auto rounded-lg border border-[#DCD8D2] bg-white"><table className="w-full text-left text-sm"><thead className="sticky top-0 bg-[#EAF0E8]"><tr><th className="p-3">Learner</th><th className="p-3">Date</th><th className="p-3">Time</th></tr></thead><tbody>{preview.plan.map(l => <tr key={l.id} className="border-t border-[#E8E6E0]"><td className="p-3">{l.name}</td><td className="p-3">{l.date}</td><td className="p-3">{l.time?.slice(0, 5) || "Not set"}</td></tr>)}</tbody></table></div></div>}
      <div className="flex flex-wrap gap-2"><button type="button" disabled={busy || !date} onClick={() => submit(!!preview)} className={`${button} bg-[#58745D] text-white`}>{busy ? "Please wait…" : preview ? mode === "freeze" ? "Confirm freeze" : "Confirm resume" : "Preview lessons"}</button><button type="button" disabled={busy} className={button} onClick={() => { setMode(null); setPreview(null); setError(""); }}>Cancel</button></div>
    </div>}
    {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
  </section>;
}
