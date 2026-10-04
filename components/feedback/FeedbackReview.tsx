"use client";
import { useEffect, useRef, useState } from "react";
type Entry = { id: string; name: string; role: string; country: string | null; rating: number; reflection: string; teacher_name: string; source: string; learning_context: string; share_with_teacher: boolean; publish_consent: boolean; review_status: string; published_reflection_id: string | null; created_at: string };
export default function FeedbackReview() {
  const [rows, setRows] = useState<Entry[]>([]); const [page, setPage] = useState(0); const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(""); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [tick, setTick] = useState(0); const lock = useRef(false);
  useEffect(() => {
    const abort = new AbortController(); setLoading(true); setError("");
    fetch(`/api/admin/learner-feedback?page=${page}`, { cache: "no-store", signal: abort.signal }).then(async r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(v => { setRows(v.feedback); setTotal(v.total); }).catch(e => { if (e.name !== "AbortError") setError("Unable to load feedback. Check that the feedback SQL migration has been applied, then retry."); }).finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => abort.abort();
  }, [page, tick]);
  async function act(id: string, action: string) {
    if (lock.current) return; lock.current = true; setBusy(id); setError("");
    try { const r = await fetch(`/api/admin/learner-feedback/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      const body = await r.json(); if (!r.ok) throw new Error(body.error || "Unable to update feedback."); setTick(v => v+1);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to update feedback."); }
    finally { lock.current = false; setBusy(""); }
  }
  return <section className="mb-12 border-b border-[#DED9D2] pb-10"><h2 className="font-serif text-3xl">Learner feedback</h2><p className="mt-2 text-sm leading-6 text-[#607568]">Review teacher sharing and public publication separately. Private feedback stays private.</p>
    {error && <div role="alert" className="mt-4 rounded-xl border border-[#E4D4CF] p-4"><p>{error}</p><button onClick={() => setTick(v => v+1)} className="mt-2 underline">Retry</button></div>}
    {loading ? <p role="status" className="mt-6">Loading feedback…</p> : <div className="mt-6 space-y-5">{!rows.length && !error && <p className="text-sm text-[#777]">No feedback submitted through the new form yet.</p>}{rows.map(f => <article key={f.id} className="rounded-2xl border border-[#E7DDD1] bg-white p-6"><div className="flex flex-wrap justify-between gap-3"><h3 className="font-serif text-2xl">{f.name}</h3><span className="text-sm">{f.rating} / 5</span></div><p className="mt-1 text-sm text-[#607568]">For {f.teacher_name} · {f.role} · {new Date(f.created_at).toLocaleDateString()}</p><div className="mt-3 flex flex-wrap gap-2 text-xs">{[f.source === "portal" ? "Linked portal submission" : "Public link · identity not verified", f.learning_context === "elsewhere" ? "Lessons outside Hamkke" : "Hamkke lessons", f.share_with_teacher ? "Teacher + Hamkke" : "Hamkke only", f.publish_consent ? "Publication permitted" : "No publication permission", f.review_status, f.published_reflection_id ? "Published" : "Not published"].map(label => <span key={label} className="rounded-full bg-[#EEF2EA] px-3 py-1">{label}</span>)}</div><p className="mt-5 whitespace-pre-wrap break-words leading-8">{f.reflection}</p>
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        {f.review_status !== "reviewed" && <button disabled={!!busy} onClick={() => act(f.id,"review")} className="rounded-full border px-4 py-2 disabled:opacity-50">{f.share_with_teacher ? "Approve for teacher" : "Mark reviewed"}</button>}
        {f.publish_consent && f.share_with_teacher && f.review_status !== "archived" && !f.published_reflection_id && <button disabled={!!busy} onClick={() => act(f.id,"publish")} className="rounded-full bg-[#304A39] px-4 py-2 text-white disabled:opacity-50">Publish on website</button>}
        {f.published_reflection_id && <button disabled={!!busy} onClick={() => act(f.id,"unpublish")} className="rounded-full border px-4 py-2 disabled:opacity-50">Unpublish</button>}
        {f.review_status !== "archived" && <button disabled={!!busy} onClick={() => act(f.id,"archive")} className="rounded-full border px-4 py-2 disabled:opacity-50">Archive{f.published_reflection_id ? " and unpublish" : ""}</button>}
        {busy === f.id && <span role="status">Saving…</span>}
      </div></article>)}</div>}
    <div className="mt-5 flex items-center gap-4 text-sm"><button disabled={page === 0 || loading || !!busy} onClick={() => setPage(v => v-1)}>Previous</button><span>Page {page+1}</span><button disabled={(page+1)*30 >= total || loading || !!busy} onClick={() => setPage(v => v+1)}>Next</button></div>
  </section>;
}
