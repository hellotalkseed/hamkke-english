import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n";
import RecoveryForm from "@/components/portal/RecoveryForm";
import PortalHeader from "@/components/portal/PortalHeader";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function Page({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const invalid = (await searchParams).error === "invalid";

  return <main className="min-h-screen bg-[#FFFDF8] text-[#293A30]">
    <PortalHeader locale={locale} login routeOverride="/forgot-password" />
    <section className="mx-auto max-w-md px-5 pb-12 pt-14 sm:px-0 sm:pt-20">
      <RecoveryForm locale={locale} mode="request" invalid={invalid} />
    </section>
  </main>;
}
