import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AssessmentBookingForm from "@/components/AssessmentBookingForm";
import {
  isValidLocale,
  type Locale,
} from "@/lib/i18n";

type AssessmentPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function AssessmentPage({
  params,
}: AssessmentPageProps) {
  const { locale: rawLocale } = await params;

  if (!isValidLocale(rawLocale)) {
    notFound();
  }

  const locale = rawLocale as Locale;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#31463A]">
        <AssessmentBookingForm locale={locale} />
      </main>

      <Footer />
    </>
  );
}