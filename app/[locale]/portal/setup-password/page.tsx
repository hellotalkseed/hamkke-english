import { notFound } from "next/navigation";
import { isValidLocale } from "@/lib/i18n";
import PortalHeader from "@/components/portal/PortalHeader";
import PortalInviteSetupForm from "@/components/portal/PortalInviteSetupForm";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function PortalSetupPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ email?: string; error?: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const query = await searchParams;
  const expectedEmail = (query.email || "").trim().toLowerCase();
  // A normal Supabase invite can establish its browser session from the URL
  // after this server render. Only hard-block links that our callback has
  // explicitly marked invalid, or links that do not identify the invitee.
  const invalid = Boolean(query.error || !expectedEmail);

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#293A30]">
      <PortalHeader locale={locale} login />
      <main className="mx-auto w-full max-w-lg px-6 py-14 sm:py-20">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#718A73]">
          HAMKKE STUDENT PORTAL
        </p>
        <PortalInviteSetupForm
          locale={locale}
          expectedEmail={expectedEmail}
          initialInvalid={invalid}
        />
      </main>
    </div>
  );
}
