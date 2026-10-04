"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Locale } from "@/lib/i18n";
import { feedbackMessages } from "@/lib/feedback/messages";

type Teacher = { id: string; name: string; slug?: string };
type Turnstile = {
  render: (element: HTMLElement, options: { sitekey: string; theme: string; callback: (token: string) => void; "expired-callback": () => void; "error-callback": () => void }) => string;
  remove: (id: string) => void; reset: (id: string) => void;
};
const api = () => (window as unknown as { turnstile?: Turnstile }).turnstile;
const field = "mt-2 block w-full rounded-xl border border-[#D8D4CC] bg-[#FFFDF8] px-4 py-3 text-base outline-none focus:border-[#718A73] focus:ring-2 focus:ring-[#718A73]/20";
export default function FeedbackForm({ locale, teachers, studentId }: { locale: Locale; teachers: Teacher[]; studentId?: string }) {
  const t = feedbackMessages[locale]; const external = !studentId;
  const [teacherId, setTeacherId] = useState(teachers.length === 1 ? teachers[0].id : "");
  const [share, setShare] = useState(true); const [publish, setPublish] = useState(false);
  const [busy, setBusy] = useState(false); const [done, setDone] = useState(false); const [error, setError] = useState("");
  const [token, setToken] = useState(""); const container = useRef<HTMLDivElement>(null); const widget = useRef<string | null>(null);
  const inFlight = useRef(false); const requestId = useRef<string | null>(null);
  useEffect(() => {
    if (!external) return;
    let cancelled = false;
    const render = () => {
      const turnstile = api(); const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
      if (cancelled || !turnstile || !container.current || widget.current || !sitekey) return;
      widget.current = turnstile.render(container.current, { sitekey, theme: "light", callback: setToken, "expired-callback": () => setToken(""), "error-callback": () => setToken("") });
    };
    const src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    let script = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (!script) { script = document.createElement("script"); script.src = src; script.async = true; document.head.appendChild(script); }
    script.addEventListener("load", render); render();
    return () => { cancelled = true; script?.removeEventListener("load", render); if (widget.current) api()?.remove(widget.current); widget.current = null; };
  }, [external]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (inFlight.current) return;
    setError(""); if (external && !token) { setError(t.error); return; }
    const form = new FormData(event.currentTarget); const teacher = teachers.find(v => v.id === teacherId);
    if (!teacher) { setError(t.choose); return; }
    inFlight.current = true; setBusy(true); requestId.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        requestId: requestId.current, locale, source: external ? "public_link" : "portal", studentId,
        teacherId, teacherSlug: teacher.slug, learningContext: external ? form.get("context") : "hamkke",
        name: form.get("name"), role: form.get("role"), country: form.get("country"),
        rating: Number(form.get("rating")), reflection: form.get("reflection"), shareWithTeacher: share, publishConsent: publish,
        turnstileToken: token,
      }) });
      if (!response.ok) { if (response.status === 409) requestId.current = null; throw new Error("Submission failed"); }
      setDone(true);
    } catch { setError(t.error); if (external && widget.current) { api()?.reset(widget.current); setToken(""); } }
    finally { inFlight.current = false; setBusy(false); }
  }
  if (done) return <section role="status" className="rounded-2xl bg-[#EEF2EA] p-8"><h2 className="font-serif text-3xl">{t.success}</h2><p className="mt-3 leading-7">{t.successHelp}</p></section>;
  if (!teachers.length) return <p className="rounded-xl bg-[#EEF2EA] p-5">{t.noTeachers}</p>;
  return <form onSubmit={submit} onChange={() => { if (!inFlight.current) requestId.current = null; }} className="space-y-6 text-[#304A39]">
    <fieldset disabled={busy} className="space-y-6 disabled:opacity-70">
      <legend className="sr-only">{t.title}</legend>
      <label className="block text-sm font-medium">{t.teacher}<select required className={field} value={teacherId} onChange={e => setTeacherId(e.target.value)}><option value="">{t.choose}</option>{teachers.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></label>
      {external && <label className="block text-sm font-medium">{t.context}<select name="context" required defaultValue="" className={field}><option value="" disabled>—</option><option value="hamkke">{t.hamkke}</option><option value="elsewhere">{t.elsewhere}</option></select></label>}
      <div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-medium">{t.name}<input required name="name" maxLength={100} autoComplete="nickname" className={field} /><span className="mt-2 block text-xs font-normal leading-5 text-[#607568]">{t.nameHelp}</span></label><label className="block text-sm font-medium">{t.role}<select name="role" required defaultValue="" className={field}><option value="" disabled>—</option><option value="Student">{t.student}</option><option value="Parent / Guardian">{t.parent}</option></select></label></div>
      <div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-medium">{t.country}<input name="country" maxLength={100} className={field} /></label><label className="block text-sm font-medium">{t.rating}<select name="rating" required defaultValue="" className={field}><option value="" disabled>—</option>{[1,2,3,4,5].map(v => <option key={v} value={v}>{v} / 5</option>)}</select></label></div>
      <label className="block text-sm font-medium">{t.story}<textarea name="reflection" required maxLength={5000} rows={6} placeholder={t.prompt} className={`${field} leading-7`} /></label>
      <fieldset className="rounded-2xl bg-[#EEF2EA] p-5"><legend className="px-2 text-sm font-medium">{t.audience}</legend><label className="flex items-start gap-3 py-2"><input type="radio" name="audience" checked={share} onChange={() => setShare(true)} className="mt-1 accent-[#607D68]" />{t.teacherOwner}</label><label className="flex items-start gap-3 py-2"><input type="radio" name="audience" checked={!share} onChange={() => { setShare(false); setPublish(false); }} className="mt-1 accent-[#607D68]" />{t.ownerOnly}</label><p className="mt-2 text-xs leading-6 text-[#607568]">{t.ownerHelp}</p></fieldset>
      {share && <label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" checked={publish} onChange={e => setPublish(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#607D68]" />{t.publish}</label>}
      <p className="text-xs leading-6 text-[#607568]">{t.consentNote}</p>
    </fieldset>
    {external && <div ref={container} className="min-h-[65px] overflow-hidden" />}
    {error && <p role="alert" className="text-sm text-[#943F35]">{error}</p>}
    <button disabled={busy || (external && !token)} className="rounded-full bg-[#304A39] px-7 py-3 text-white disabled:opacity-50">{busy ? t.sending : t.submit}</button>
  </form>;
}
