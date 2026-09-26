import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n";
import { portalMessages } from "@/lib/portal/messages";
import PortalHeader from "@/components/portal/PortalHeader";
import PortalLoginForm from "@/components/portal/PortalLoginForm";

export default async function PortalLoginPage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const { error } = await searchParams;
  const t = portalMessages[locale];
  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#293A30]">
      <PortalHeader locale={locale} login />
      <main className="mx-auto w-full max-w-lg px-6 py-12 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#718A73]">{t.loginBrand}</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">{t.loginTitle}</h1>
        <p className="mt-3 leading-7 text-[#607568]">{t.loginIntro}</p>
        <PortalLoginForm locale={locale} denied={error === "access"} />
      </main>
    </div>
  );
}
