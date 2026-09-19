import Link from "next/link";

import type { Locale } from "../lib/i18n";
import { getMessages } from "../lib/getMessages";
import { getPublicTeachers } from "../lib/getPublicTeachers";

import TeachersCarousel from "./TeachersCarousel";

type TeachersProps = {
  locale: Locale;
};

export default async function Teachers({
  locale,
}: TeachersProps) {
  const teachers =
    await getPublicTeachers();

  const messages = getMessages(locale);
  const content =
    messages.teachers.section;

  return (
    <section
      id="teachers"
      className="
        relative
        overflow-hidden
        bg-[#EEF2EA]

        py-10
        sm:py-12
        lg:py-14
      "
    >
      {/* =====================================================
          HEADING

          Mobile settings remain separate from desktop.
          ===================================================== */}

      <div
        className="
          mx-auto
          max-w-[1440px]

          px-5
          sm:px-10
          lg:px-16
        "
      >
        <div className="mx-auto max-w-[900px] text-center">
          <p
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.26em]
              text-[#718A73]

              sm:text-xs
              sm:tracking-[0.28em]
            "
          >
            {content.eyebrow}
          </p>

          <div
            className="
              mx-auto
              mt-3

              h-px
              w-10

              bg-[#718A73]/50

              sm:w-12
            "
          />

          <h2
            className="
              mx-auto
              mt-4
              max-w-[340px]

              font-serif
              text-[34px]
              leading-[1.02]
              tracking-[-0.035em]
              text-[#304A39]

              sm:max-w-none
              sm:text-5xl
              sm:leading-[0.98]

              lg:text-[50px]
            "
          >
            {content.title}
          </h2>
        </div>
      </div>

      {/* =====================================================
          CAROUSEL

          Teacher data remains sourced from the database.
          Teacher presentation/localization is handled
          separately inside TeachersCarousel.
          ===================================================== */}

      <div
        className="
          relative
          mx-auto
          mt-7

          w-full
          max-w-[1740px]

          px-5

          sm:mt-8
          sm:px-[76px]

          lg:px-[112px]

          xl:px-[128px]
        "
      >
        <TeachersCarousel
          locale={locale}
          teachers={teachers}
          teacherSlots={3}
        />
      </div>

      {/* =====================================================
          VIEW ALL TEACHERS
          ===================================================== */}

      <div
        className="
          mt-6
          flex
          justify-center
          pb-[5px]

          sm:mt-7
        "
      >
        <div className="relative">
          {/* OFFSET BOTTOM LAYER */}

          <div
            className="
              absolute
              inset-x-0
              top-[5px]

              h-full

              rounded-[10px]
              bg-[#718A73]
            "
            aria-hidden="true"
          />

          {/* BUTTON FACE */}

          <Link
            href={`/${locale}/teachers`}
            className="
              relative

              inline-flex
              min-h-[44px]
              items-center
              justify-center

              rounded-[10px]
              bg-[#DCE4D7]

              px-6

              text-[13px]
              font-semibold
              text-[#304A39]

              transition
              duration-200

              hover:-translate-y-[1px]
              hover:bg-[#D5DFD1]

              sm:min-h-[46px]
              sm:px-7
              sm:text-[14px]
            "
          >
            {content.viewAll}

            <span
              className="ml-1"
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}