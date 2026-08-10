import { notFound } from "next/navigation";

import Hero from "../../components/Hero";
import StudentProblem from "../../components/StudentProblem";
import LessonExperience from "../../components/LessonExperience";
import Audience from "../../components/Audience";
import Reflections from "../../components/Reflections";
import WhatYouWontFindHere from "../../components/WhatYouWontFindHere";
import MeetYourCoach from "@/components/MeetYourCoach";
import CTA from "../../components/CTA";
import Footer from "../../components/Footer";

import { isValidLocale } from "../../lib/i18n";

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

  return (
    <>
      <Hero locale={locale} />

      <StudentProblem locale={locale} />

      <LessonExperience locale={locale} />

      <Audience locale={locale} />

      <Reflections locale={locale} />

<WhatYouWontFindHere locale={locale} />

<MeetYourCoach />

      <CTA />

      <Footer />
    </>
  );
}