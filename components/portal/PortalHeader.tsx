import Image from "next/image";
import Link from "next/link";
import { ChevronDown, LogOut } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { portalLanguages, portalMessages } from "@/lib/portal/messages";

type PortalHeaderProps = {
  locale: Locale;
  login?: boolean;
  signOutAction?: () => Promise<void>;
  studentId?: string;
  view?: string;
  routeOverride?: string;
};

export default function PortalHeader({ locale, login = false, signOutAction, studentId, view, routeOverride }: PortalHeaderProps) {
  const t = portalMessages[locale];
  const route = routeOverride ?? (login ? "/portal/login" : "/portal");
  const current = portalLanguages.find((item) => item.locale === locale)!;
  const params = new URLSearchParams();
  if (!login && studentId) params.set("student", studentId);
  if (!login && view && view !== "home") params.set("view", view);
  const query = params.size ? `?${params.toString()}` : "";
  const focus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#718A73]";

  return (
    <header className="flex w-full items-center justify-between gap-2 border-b border-[#718A73]/20 px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
      <Link href={`/${locale}`} aria-label={`Hamkke · ${t.home}`} className={`flex shrink-0 items-center gap-0.5 rounded-sm text-[#293A30] ${focus}`}>
        <Image src="/logo/hamkke-icon.svg" alt="" width={36} height={36} priority className="h-[30px] w-[30px] sm:h-9 sm:w-9" />
        <span className="text-[21px] font-semibold leading-none [font-family:var(--font-cormorant)] sm:text-[25px]">Hamkke</span>
        <span aria-hidden="true" className="mx-2 h-4 w-px bg-[#A8BCA5]" />
        <span className="text-[13px] font-medium text-[#718A73] sm:text-base">함께</span>
      </Link>

      <div className="flex shrink-0 items-center gap-1 sm:gap-4">
        <details className="group/language relative">
          <summary aria-label={`${t.language}: ${current.label}`}
            className={`flex min-h-11 cursor-pointer list-none items-center gap-1 rounded-lg px-2 py-2 text-[13px] text-[#46564B] hover:bg-[#EEF2EA] sm:gap-1.5 sm:text-[15px] ${focus} [&::-webkit-details-marker]:hidden`}>
            <span>{current.label}</span>
            <ChevronDown size={14} strokeWidth={1.8} aria-hidden="true" className="shrink-0 transition-transform group-open/language:rotate-180 motion-reduce:transition-none" />
          </summary>
          <nav aria-label={t.language} className="absolute right-0 z-50 mt-2 flex min-w-[145px] flex-col overflow-hidden rounded-xl border border-[#E7DDD1] bg-[#FFFDF8] py-2 shadow-[0_14px_40px_rgba(41,58,48,0.10)]">
            {portalLanguages.map((item) => (
              <Link key={item.locale} href={`/${item.locale}${route}${query}`} hrefLang={item.locale}
                aria-current={item.locale === locale ? "page" : undefined}
                className={`min-h-11 px-5 py-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#718A73] ${item.locale === locale ? "bg-[#EEF2EA] font-medium text-[#46564B]" : "text-[#46564B] hover:bg-[#F4F0E7]"}`}>
                {item.label}
              </Link>
            ))}
          </nav>
        </details>

        {!login && signOutAction && <form action={signOutAction}>
          <button type="submit" aria-label={t.signOut} title={t.signOut}
            className={`flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-2 py-2 text-[15px] text-[#46564B] hover:bg-[#EEF2EA] ${focus}`}>
            <LogOut size={18} strokeWidth={1.6} aria-hidden="true" />
            <span className="hidden sm:inline">{t.signOut}</span>
          </button>
        </form>}
      </div>
    </header>
  );
}
