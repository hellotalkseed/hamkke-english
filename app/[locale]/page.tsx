import { notFound } from "next/navigation";

import Hero from "../../components/Hero";
import About from "../../components/About";
import Audience from "../../components/Audience";
import Process from "../../components/Process";
import WhyHamkke from "../../components/WhyHamkke";
import Reflections from "../../components/Reflections";
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
      <Hero />

      <About />

      <Audience />

      <Process />

      <WhyHamkke />

      <Reflections />

      <CTA />

      <Footer />
    </>
  );
}