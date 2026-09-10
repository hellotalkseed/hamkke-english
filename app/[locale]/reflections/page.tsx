import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase";
import ReflectionsGallery from "@/components/ReflectionsGallery";

import { getMessages } from "../../../lib/getMessages";
import { isValidLocale } from "../../../lib/i18n";

interface ReflectionsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function ReflectionsPage({
  params,
}: ReflectionsPageProps) {
  const { locale } = await params;

  // Make sure the locale is valid
  if (!isValidLocale(locale)) {
    notFound();
  }

  const t = getMessages(locale);

  // Get approved student reflections
  const { data: reflections, error } = await supabase
    .from("reflections")
    .select("*")
    .eq("approved", true)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Error fetching reflections:", error);
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5]">
      {/* =====================================================
          HAMKKE HEADER
          ===================================================== */}

      <header
        className="
          w-full
          px-6
          pt-7
          sm:px-8
          sm:pt-8
          lg:px-10
          xl:px-12
        "
      >
        <div
          className="
            flex
            w-full
            items-start
            justify-between
            gap-8
          "
        >
          {/* BRAND + TAGLINE */}

          <a
  href={`/${locale}#student-stories`}
            className="
              shrink-0
              text-left
              transition-opacity
              duration-200
              hover:opacity-75
            "
          >
            <p
              className="
                font-sans
                text-[16px]
                font-semibold
                leading-none
                tracking-[0.18em]
                text-[#6F8F72]
              "
            >
              HAMKKE │ 함께
            </p>

            <p
              className="
                mt-2
                font-serif
                text-[13px]
                font-normal
                leading-none
                tracking-[0.02em]
                text-[#6F8F72]
              "
            >
              From Small Talk to Big Ideas
            </p>
          </a>
        </div>
      </header>

      {/* =====================================================
          PAGE INTRODUCTION
          ===================================================== */}

      <section
        className="
          mx-auto
          max-w-4xl
          px-6
          pb-16
          pt-16
          text-center
          sm:pt-18
          lg:pb-20
          lg:pt-20
        "
      >
        {/* TITLE */}

        <h1
          className="
            text-[48px]
            leading-[0.95]
            text-[#2B2B2B]
            [font-family:var(--font-cormorant)]
            sm:text-[58px]
            lg:text-[64px]
          "
        >
          {t.reflections.galleryTitleLineOne}
          <br />
          {t.reflections.galleryTitleLineTwo}
        </h1>

        {/* DESCRIPTION */}

        <p
          className="
            mx-auto
            mt-7
            max-w-2xl
            text-base
            leading-7
            text-[#5B5B5B]
            sm:text-lg
            sm:leading-8
          "
        >
          {t.reflections.galleryDescription}
        </p>

        {/* STORY COUNT */}

        <p
          className="
            mt-5
            text-[11px]
            uppercase
            tracking-[0.25em]
            text-[#8B8B8B]
            sm:text-xs
          "
        >
          {reflections?.length ?? 0}{" "}
          {t.reflections.storiesShared}
        </p>
      </section>

      {/* =====================================================
          REFLECTION GALLERY
          ===================================================== */}

      <section
        className="
          mx-auto
          max-w-7xl
          px-6
          pb-24
          lg:px-10
        "
      >
        <ReflectionsGallery
          reflections={reflections ?? []}
          locale={locale}
        />
      </section>
    </main>
  );
}