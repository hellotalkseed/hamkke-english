"use client";

import Link from "next/link";
import { recoveryMessages } from "@/lib/portal/recovery-messages";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Locale } from "@/lib/i18n";
import { portalMessages } from "@/lib/portal/messages";

export default function PortalLoginForm({ locale, denied }: { locale: Locale; denied: boolean }) {
  const router = useRouter();
  const t = portalMessages[locale];
  const [error, setError] = useState(denied ? t.unavailable : "");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError("");
    const supabase = createClient();

    try {
      const result = await supabase.auth.signInWithPassword({
        email: String(form.get("email") ?? "").trim(),
        password: String(form.get("password") ?? ""),
      });

      if (result.error || !result.data.user) {
        setError(t.credentials);
        return;
      }

      // First check Hamkke staff roles. Protected destination pages still perform
      // their own server-side authorization; this only chooses the right portal.
      const profile = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", result.data.user.id)
        .maybeSingle();

      if (!profile.error && profile.data) {
        const role = profile.data.role;
        const status = profile.data.status;

        if (["owner", "admin"].includes(role) && status === "active") {
          router.replace(`/${locale}/admin`);
          router.refresh();
          return;
        }

        if (role === "teacher" && ["active", "pending"].includes(status)) {
          // /admin already owns teacher routing, including pending agreements.
          router.replace(`/${locale}/admin`);
          router.refresh();
          return;
        }
      }

      // Student accounts continue to use the existing portal-account gate.
      const account = await supabase
        .from("portal_accounts")
        .select("status")
        .eq("user_id", result.data.user.id)
        .maybeSingle();

      if (!account.error && account.data?.status === "active") {
        router.replace(`/${locale}/portal`);
        router.refresh();
        return;
      }

      await supabase.auth.signOut({ scope: "local" });
      setError(profile.error && account.error ? t.connection : t.unavailable);
    } catch {
      setError(t.connection);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#DCD8D2] bg-[#FFFDF8] px-4 py-3 outline-none focus:border-[#718A73] focus:ring-2 focus:ring-[#718A73]/20";

  return (
    <form onSubmit={submit} className="mt-7 space-y-4">
      <div>
        <label htmlFor="portal-email" className="text-sm font-medium">{t.email}</label>
        <input id="portal-email" name="email" type="email" autoComplete="username" required maxLength={254} className={inputClass} />
      </div>

      <div>
        <label htmlFor="portal-password" className="text-sm font-medium">{t.password}</label>
        <input id="portal-password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </div>

      <div className="-mt-1 text-right">
        <Link href={`/${locale}/forgot-password`} className="inline-block py-1 text-sm text-[#607568] underline">
          {recoveryMessages[locale].forgot}
        </Link>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-[#F6EAE4] p-4 text-sm leading-6 text-[#874C3D]">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="w-full rounded-full bg-[#31463A] px-6 py-3.5 font-semibold text-white hover:bg-[#465D4D] disabled:cursor-wait disabled:opacity-60">
        {loading ? t.signingIn : t.signIn}
      </button>

      <div className="flex items-center gap-4 py-0.5" aria-hidden="true">
        <div className="h-px flex-1 bg-[#E7DDD1]" />
        <span className="text-xs text-[#8A938C]">{t.or}</span>
        <div className="h-px flex-1 bg-[#E7DDD1]" />
      </div>

      <div className="text-center">
        <p className="font-serif text-xl text-[#31463A]">{t.newToHamkke}</p>
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-[#607568]">{t.enrollmentAccount}</p>
        <Link href={`/${locale}/assessment`} className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full border border-[#718A73] px-5 py-2.5 text-sm font-semibold text-[#31463A] transition-colors hover:bg-[#EEF2EA]">
          {t.bookAssessment} →
        </Link>
      </div>
    </form>
  );
}
