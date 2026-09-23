import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n";
import RecoveryForm from "@/components/portal/RecoveryForm";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function Page({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const invalid = (await searchParams).error === "invalid";

  return <main className="min-h-screen bg-[#FFFDF8] px-5 py-6 text-[#293A30] sm:px-8">
    <Link href={`/${locale}`} className="font-serif text-2xl text-[#31463A]">Hamkke │ 함께</Link>
    <section className="mx-auto max-w-md pb-12 pt-14 sm:pt-20">
      <RecoveryForm locale={locale} mode="request" invalid={invalid} />
    </section>
  </main>;
}
