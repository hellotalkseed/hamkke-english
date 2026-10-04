"use client";
import { useEffect, useRef, useState } from "react";
import FeedbackForm from "./FeedbackForm";
import { feedbackMessages } from "@/lib/feedback/messages";
import type { Locale } from "@/lib/i18n";
type Teacher = { id: string; name: string };
export default function PortalFeedback({ locale, studentId }: { locale: Locale; studentId: string }) {
  const t = feedbackMessages[locale]; const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false); const [teachers, setTeachers] = useState<Teacher[] | null>(null);
  const [error, setError] = useState(false); const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController(); setError(false); setTeachers(null);
    fetch(`/api/portal/feedback-teachers?studentId=${encodeURIComponent(studentId)}`, { cache: "no-store", signal: controller.signal })
      .then(async r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(v => setTeachers(v.teachers)).catch(e => { if (e.name !== "AbortError") setError(true); });
    return () => controller.abort();
  }, [open, studentId, retry]);
  return <section className="mt-8 rounded-2xl border border-[#DCE4D7] bg-[#F3F4EB] p-5 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-serif text-2xl">{t.title}</h2><p className="mt-2 text-sm text-[#607568]">{t.intro}</p></div><button onClick={() => { setOpen(true); dialog.current?.showModal(); }} className="rounded-full border border-[#718A73] px-5 py-3 text-sm">{t.open}</button></div>
    <dialog ref={dialog} onClose={() => setOpen(false)} className="fixed inset-0 m-auto max-h-[90dvh] w-[min(94vw,720px)] overflow-y-auto rounded-2xl bg-[#FFFDF8] p-5 text-[#304A39] shadow-xl backdrop:bg-black/30 sm:p-8" aria-labelledby="feedback-title">
      <div className="mb-6 flex items-start justify-between gap-4"><h2 id="feedback-title" className="font-serif text-3xl">{t.title}</h2><button autoFocus onClick={() => dialog.current?.close()} className="rounded-full border px-4 py-2 text-sm">{t.close}</button></div>
      {open && (error ? <div role="alert"><p>{t.error}</p><button onClick={() => setRetry(v => v + 1)} className="mt-4 underline">{t.retry}</button></div> : teachers ? <FeedbackForm key={studentId} locale={locale} studentId={studentId} teachers={teachers} /> : <p role="status">{t.loading}</p>)}
    </dialog>
  </section>;
}
