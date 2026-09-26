import ContactForm from "@/components/ContactForm";
import type { Locale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };
export default async function ContactPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale: Locale = raw === "ko" || raw === "zh" || raw === "ja" ? raw : "en";
  return <main className="min-h-screen bg-[#FAF9F6] px-5 py-24 text-[#2B2B2B]"><div className="mx-auto max-w-[600px] rounded-[28px] border border-[#E3E7DF] bg-[#FAF9F6] shadow-[0_18px_60px_rgba(40,55,42,0.08)]"><ContactForm locale={locale}/></div></main>;
}
