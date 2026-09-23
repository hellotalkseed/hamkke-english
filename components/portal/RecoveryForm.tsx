"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Locale } from "@/lib/i18n";
import { recoveryMessages } from "@/lib/portal/recovery-messages";

export default function RecoveryForm({ locale, mode, invalid }: { locale: Locale; mode: "request" | "reset"; invalid: boolean }) {
  const t = recoveryMessages[locale];
  const busy = useRef(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [expired, setExpired] = useState(invalid && mode === "reset");
  const input = "mt-2 w-full rounded-xl border border-[#DCD8D2] bg-[#FFFDF8] px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#718A73]";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || done || expired) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const password = String(values.get("password") ?? "");
    setError("");
    if (mode === "reset") {
      if (password.length < 8) { setError(t.short); return; }
      if (password !== String(values.get("confirm") ?? "")) { setError(t.mismatch); return; }
    }
    busy.current = true;
    setLoading(true);
    try {
      const supabase = createClient();
      if (mode === "request") {
        const { error: sendError } = await supabase.auth.resetPasswordForEmail(String(values.get("email") ?? "").trim(), {
          redirectTo: `${window.location.origin}/auth/recovery/${locale}`,
        });
        if (sendError) { setError(t.error); return; }
      } else {
        const { data: { user }, error: sessionError } = await supabase.auth.getUser();
        if (sessionError || !user) { setExpired(true); return; }
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) { setError(updateError.message); return; }
      }
      form.reset();
      setDone(true);
    } catch { setError(t.error); }
    finally { busy.current = false; setLoading(false); }
  }

  return <>
    <h1 className="font-serif text-4xl leading-tight">{mode === "request" ? t.requestTitle : t.resetTitle}</h1>
    <p className="mt-4 text-sm leading-7 text-[#607568]">{mode === "request" ? t.requestIntro : t.resetIntro}</p>
    {invalid && mode === "request" && !done && <p role="alert" className="mt-5 rounded-xl bg-[#F6EAE4] p-4 text-sm leading-6">{t.invalid}</p>}
    {expired ? <div role="alert" className="mt-6"><p className="leading-7">{t.invalid}</p><Link href={`/${locale}/forgot-password`} className="mt-4 inline-block underline">{t.requestAgain}</Link></div>
      : done ? <div role="status" className="mt-7 rounded-xl bg-[#EEF2EA] p-5 text-sm leading-7"><p>{mode === "request" ? t.sent : t.done}</p>{mode === "request" && <p className="mt-3">{t.sameBrowser}</p>}</div>
      : <form onSubmit={submit} className="mt-8 space-y-5">
        {mode === "request" ? <div><label htmlFor="recovery-email" className="text-sm">{t.email}</label><input id="recovery-email" name="email" type="email" autoComplete="email" required maxLength={254} className={input} /></div>
          : <>{[["password", t.password], ["confirm", t.confirm]].map(([name, label]) => <div key={name}><label htmlFor={`recovery-${name}`} className="text-sm">{label}</label><input id={`recovery-${name}`} name={name} type="password" autoComplete="new-password" minLength={8} required className={input} /></div>)}</>}
        {error && <p role="alert" className="rounded-xl bg-[#F6EAE4] p-4 text-sm leading-6 text-[#874C3D]">{error}</p>}
        <button type="submit" disabled={loading} className="min-h-12 w-full rounded-full bg-[#31463A] px-6 py-3 font-semibold text-white disabled:opacity-60">{loading ? (mode === "request" ? t.sending : t.saving) : (mode === "request" ? t.send : t.save)}</button>
        {mode === "request" && <p className="text-sm leading-6 text-[#607568]">{t.sameBrowser}</p>}
      </form>}
    <Link href={`/${locale}/portal/login`} className="mt-7 inline-block py-2 text-sm text-[#607568] underline">{t.login}</Link>
  </>;
}
