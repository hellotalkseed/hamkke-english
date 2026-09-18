import { notFound } from "next/navigation";

import Navbar from "@/components/Navbar";
import ReflectionsGallery from "@/components/ReflectionsGallery";
import { getPublicReflections } from "@/lib/getPublicReflections";

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

  const {
    reflections,
    total,
  } = await getPublicReflections({
    limit: null,
  });

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#F3EDDD]">
        {/* =====================================================
            INTRO
            ===================================================== */}

        <section
          className="
            mx-auto
            max-w-[1440px]
            px-5
            pb-9
            pt-12

            sm:px-10
            sm:pb-11
            sm:pt-16

            lg:px-16
            lg:pb-12
            lg:pt-20
          "
        >
          <div
            className="
              flex
              flex-col
              gap-7
              border-b
              border-[#718A73]/20
              pb-9

              sm:flex-row
              sm:items-end
              sm:justify-between

              lg:pb-11
            "
          >
            {/* INTRO COPY */}

            <div className="min-w-0 lg:max-w-none">
              <p
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.28em]
                  text-[#718A73]

                  sm:text-xs
                "
              >
                Passed Along
              </p>

              <h1
                className="
                  mt-3
                  font-serif
                  text-[44px]
                  leading-[0.96]
                  tracking-[-0.035em]
                  text-[#304A39]

                  sm:text-[58px]

                  lg:whitespace-nowrap
                  lg:text-[64px]

                  xl:text-[68px]
                "
              >
                Kind words, passed along.
              </h1>

              <p
                className="
                  mt-5
                  max-w-[660px]
                  text-[14px]
                  leading-6
                  text-[#758477]

                  sm:text-[15px]
                  sm:leading-7
                "
              >
                Experiences, milestones, and thoughts shared
                by learners and families along the way.
              </p>
            </div>

            {/* TOTAL */}

            <div className="shrink-0 sm:text-right">
              <p
                className="
                  font-serif
                  text-[64px]
                  leading-[0.8]
                  tracking-[-0.055em]
                  text-[#304A39]

                  sm:text-[76px]
                "
              >
                {total}
              </p>

              <p
                className="
                  mt-3
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-[#718A73]
                "
              >
                Stories shared
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            COLLECTION
            ===================================================== */}

        <section
          className="
            mx-auto
            max-w-[1440px]
            px-5
            pb-20

            sm:px-10
            sm:pb-24

            lg:px-16
            lg:pb-28
          "
        >
          {reflections.length > 0 ? (
            <ReflectionsGallery
              reflections={reflections}
              locale={locale}
            />
          ) : (
            <div
              className="
                rounded-[24px]
                bg-[#FFFDF8]
                px-6
                py-16
                text-center
              "
            >
              <p className="font-serif text-[24px] text-[#304A39]">
                No learner stories have been shared yet.
              </p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}