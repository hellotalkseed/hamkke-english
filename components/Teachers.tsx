import Link from "next/link";

import type { Locale } from "../lib/i18n";
import { getPublicTeachers } from "../lib/getPublicTeachers";

import TeachersCarousel from "./TeachersCarousel";

type TeachersProps = {
  locale: Locale;
};

export default async function Teachers({
  locale,
}: TeachersProps) {
  const teachers = await getPublicTeachers();

  return (
    <section
      id="teachers"
      className="
        relative
        overflow-hidden
        bg-[#EEF2EA]
        py-11
        sm:py-12
        lg:py-14
      "
    >
      {/* Heading */}
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[900px] text-center">
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
            Meet Our Teachers
          </p>

          <div className="mx-auto mt-3 h-px w-12 bg-[#718A73]/50" />

          <h2
            className="
              mt-4
              font-serif
              text-[40px]
              leading-[0.98]
              tracking-[-0.035em]
              text-[#304A39]
              sm:text-5xl
              lg:text-[50px]
            "
          >
            The people behind the conversations.
          </h2>
        </div>
      </div>

      {/* Carousel */}
      <div
        className="
          relative
          mx-auto
          mt-8
          w-full
          max-w-[1740px]
          px-[58px]
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

      {/* View all teachers */}
      <div className="mt-7 flex justify-center pb-[5px]">
        <div className="relative">
          {/* Offset bottom layer */}
          <div
            className="
              absolute
              inset-x-0
              top-[5px]
              h-full
              rounded-[10px]
              bg-[#718A73]
            "
          />

          {/* Button face */}
          <Link
            href={`/${locale}/teachers`}
            className="
              relative
              inline-flex
              min-h-[46px]
              items-center
              justify-center
              rounded-[10px]
              bg-[#DCE4D7]
              px-7
              text-[14px]
              font-semibold
              text-[#304A39]
              transition
              duration-200
              hover:-translate-y-[1px]
              hover:bg-[#D5DFD1]
            "
          >
            View All Teachers →
          </Link>
        </div>
      </div>
    </section>
  );
}