import { notFound } from "next/navigation";

import Hero from "../../components/Hero";
import FindYourLesson from "../../components/FindYourLesson";
import HamkkeApproach from "../../components/HamkkeApproach";
import LearnerStages from "../../components/LearnerStages";
import Teachers from "../../components/Teachers";
import LearnerStories from "../../components/LearnerStories";
import GetStarted from "../../components/GetStarted";
import Footer from "../../components/Footer";
import TeacherInviteHandler from "@/components/admin/TeacherInviteHandler";

import { isValidLocale } from "../../lib/i18n";
import { getPublicReflections } from "@/lib/getPublicReflections";

interface HomePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function Home({
  params,
}: HomePageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const {
    reflections,
    total,
  } = await getPublicReflections();

  return (
    <>
      <TeacherInviteHandler locale={locale} />

      <Hero locale={locale} />

      <FindYourLesson locale={locale} />

      <HamkkeApproach locale={locale} />

      <LearnerStages locale={locale} />

      <Teachers locale={locale} />

      <LearnerStories
        locale={locale}
        reflections={reflections}
        total={total}
      />

      <GetStarted locale={locale} />

      <Footer />
    </>
  );
}