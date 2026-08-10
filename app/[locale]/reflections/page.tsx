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

  if (!isValidLocale(locale)) {
    notFound();
  }

  const t = getMessages(locale);

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
    <main className="bg-[#FAF8F5] py-24">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mx-auto max-w-3xl text-center">

          <p
            className="
              mb-5
              text-[12px]
              font-medium
              uppercase
              tracking-[0.35em]
              text-[#6F8F72]
            "
          >
            {t.reflections.brand}
          </p>

          <h1
            className="
              text-[54px]
              leading-none
              text-[#2B2B2B]
              [font-family:var(--font-cormorant)]
            "
          >
            {t.reflections.galleryTitleLineOne}
            <br />
            {t.reflections.galleryTitleLineTwo}
          </h1>

          <p
            className="
              mx-auto
              mt-8
              max-w-2xl
              text-lg
              leading-8
              text-[#5B5B5B]
            "
          >
            {t.reflections.galleryDescription}
          </p>

          <p
            className="
              mt-5
              text-sm
              uppercase
              tracking-[0.25em]
              text-[#8B8B8B]
            "
          >
            {reflections?.length ?? 0}{" "}
            {t.reflections.storiesShared}
          </p>

        </div>

        <div className="mt-20">
          <ReflectionsGallery
            reflections={reflections ?? []}
            locale={locale}
          />
        </div>

      </div>
    </main>
  );
}