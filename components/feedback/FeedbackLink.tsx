"use client";
import { useState } from "react";
import { feedbackMessages } from "@/lib/feedback/messages";
import type { Locale } from "@/lib/i18n";
export default function FeedbackLink({ locale, slug }: { locale: Locale; slug: string }) {
  const [copied, setCopied] = useState(false); const t = feedbackMessages[locale];
  const link = `https://hamkkeenglish.com/${locale}/share?teacher=${encodeURIComponent(slug)}`;
  return <section className="mt-7 rounded-2xl border border-[#DCE4D7] bg-[#EEF2EA] p-5"><p className="text-sm leading-6">{t.shareLink}</p><div className="mt-3 flex flex-wrap gap-3"><input aria-label={t.copyLink} readOnly value={link} onFocus={e => e.target.select()} className="min-w-0 flex-1 rounded-lg border border-[#DCE4D7] bg-white px-3 py-2 text-sm" /><button className="rounded-full border border-[#718A73] px-4 py-2 text-sm" onClick={async () => { try { await navigator.clipboard.writeText(link); setCopied(true); } catch { setCopied(false); } }}>{copied ? t.copied : t.copyLink}</button></div></section>;
}
