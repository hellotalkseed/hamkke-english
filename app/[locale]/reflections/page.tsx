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
          BACK BUTTON
          ===================================================== */}

      <div className="mx-auto max-w-7xl px-6 pt-8 lg:px-10">
        <a
          href={`/${locale}`}
          className="
            inline-flex
            items-center
            text-sm
            text-[#6F8F72]
            transition-colors
            duration-300
            hover:text-[#5B7960]
          "
        >
          ← Back to Hamkke
        </a>
      </div>

      {/* =====================================================
          PAGE INTRODUCTION
          ===================================================== */}

      <section
        className="
          mx-auto
          max-w-4xl
          px-6
          pt-16
          pb-16
          text-center

          sm:pt-18

          lg:pt-20
          lg:pb-20
        "
      >

        {/* Brand */}

        <p
          className="
            text-[12px]
            font-medium
            uppercase
            tracking-[0.35em]
            text-[#6F8F72]
          "
        >
          {t.reflections.brand}
        </p>

        {/* Title */}

        <h1
          className="
            mt-0
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

        {/* Description */}

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

        {/* Story Count */}

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