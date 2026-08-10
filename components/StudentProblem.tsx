"use client";

import FadeUp from "./animations/FadeUp";
import { getMessages } from "../lib/getMessages";
import type { Locale } from "../lib/i18n";

interface StudentProblemProps {
  locale: Locale;
}

export default function StudentProblem({
  locale,
}: StudentProblemProps) {
  const t = getMessages(locale);

  return (
    <section
      className="
        bg-white
        px-6
        py-20

        md:px-8
        md:py-24

        lg:px-10
        lg:py-28
      "
    >
      <div
        className="
          mx-auto
          max-w-[1200px]
        "
      >
        {/* =====================================================
            SECTION BRAND
            ===================================================== */}

        <FadeUp>
          <p
            className="
              text-[12px]
              font-medium
              uppercase
              tracking-[0.35em]
              text-[#6F8F72]
            "
          >
            {t.studentProblem.brand}
          </p>
        </FadeUp>

        {/* =====================================================
            INTRO
            ===================================================== */}

        <div
          className="
            mt-5
            max-w-[760px]

            md:mt-6
          "
        >
          <FadeUp delay={0.08}>
            <h2
              className="
                text-[40px]
                leading-[0.98]
                text-[#2B2B2B]

                [font-family:var(--font-cormorant)]

                sm:text-[52px]
                md:text-[60px]
                lg:text-[68px]
              "
            >
              {t.studentProblem.title}
            </h2>
          </FadeUp>

          <FadeUp delay={0.16}>
            <p
              className="
                mt-5
                max-w-[620px]

                text-[17px]
                leading-8
                text-[#5B5B5B]

                sm:mt-6
                sm:text-lg
                sm:leading-9
              "
            >
              {t.studentProblem.intro}
            </p>
          </FadeUp>
        </div>

        {/* =====================================================
            EXPERIENCES
            ===================================================== */}

        <div
          className="
            mt-14
            grid
            gap-10

            md:mt-16
            md:grid-cols-3
            md:gap-10

            lg:mt-20
            lg:gap-16
          "
        >
          {/* 01 */}

          <FadeUp delay={0.22}>
            <div
              className="
                border-t
                border-[#DDE4DA]
                pt-5

                md:pt-6
              "
            >
              <span
                className="
                  text-[12px]
                  font-medium
                  tracking-[0.25em]
                  text-[#6F8F72]
                "
              >
                01
              </span>

              <h3
                className="
                  mt-4
                  text-[28px]
                  leading-tight
                  text-[#2B2B2B]

                  [font-family:var(--font-cormorant)]

                  sm:text-[32px]
                "
              >
                {t.studentProblem.experiences.understand.title}
              </h3>

              <p
                className="
                  mt-3
                  text-[16px]
                  leading-7
                  text-[#666666]

                  sm:text-[17px]
                  sm:leading-8
                "
              >
                {t.studentProblem.experiences.understand.description}
              </p>
            </div>
          </FadeUp>

          {/* 02 */}

          <FadeUp delay={0.30}>
            <div
              className="
                border-t
                border-[#DDE4DA]
                pt-5

                md:pt-6
              "
            >
              <span
                className="
                  text-[12px]
                  font-medium
                  tracking-[0.25em]
                  text-[#6F8F72]
                "
              >
                02
              </span>

              <h3
                className="
                  mt-4
                  text-[28px]
                  leading-tight
                  text-[#2B2B2B]

                  [font-family:var(--font-cormorant)]

                  sm:text-[32px]
                "
              >
                {t.studentProblem.experiences.know.title}
              </h3>

              <p
                className="
                  mt-3
                  text-[16px]
                  leading-7
                  text-[#666666]

                  sm:text-[17px]
                  sm:leading-8
                "
              >
                {t.studentProblem.experiences.know.description}
              </p>
            </div>
          </FadeUp>

          {/* 03 */}

          <FadeUp delay={0.38}>
            <div
              className="
                border-t
                border-[#DDE4DA]
                pt-5

                md:pt-6
              "
            >
              <span
                className="
                  text-[12px]
                  font-medium
                  tracking-[0.25em]
                  text-[#6F8F72]
                "
              >
                03
              </span>

              <h3
                className="
                  mt-4
                  text-[28px]
                  leading-tight
                  text-[#2B2B2B]

                  [font-family:var(--font-cormorant)]

                  sm:text-[32px]
                "
              >
                {t.studentProblem.experiences.somethingToSay.title}
              </h3>

              <p
                className="
                  mt-3
                  text-[16px]
                  leading-7
                  text-[#666666]

                  sm:text-[17px]
                  sm:leading-8
                "
              >
                {
                  t.studentProblem.experiences.somethingToSay
                    .description
                }
              </p>
            </div>
          </FadeUp>
        </div>

        {/* =====================================================
            CLOSING
            ===================================================== */}

        <FadeUp delay={0.46}>
          <p
            className="
              mt-14

              text-[24px]
              italic
              leading-tight
              text-[#6F8F72]

              [font-family:var(--font-cormorant)]

              sm:mt-16
              sm:text-[28px]
            "
          >
            {t.studentProblem.closing}
          </p>
        </FadeUp>
      </div>
    </section>
  );
}