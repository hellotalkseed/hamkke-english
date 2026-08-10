"use client";

import FadeUp from "./animations/FadeUp";
import { getMessages } from "../lib/getMessages";
import type { Locale } from "../lib/i18n";

interface LessonExperienceProps {
  locale: Locale;
}

export default function LessonExperience({
  locale,
}: LessonExperienceProps) {
  const t = getMessages(locale);

  return (
    <section
      id="experience"
       className="
        bg-[#FAF9F6]
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
            {t.lessonExperience.brand}
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
              {t.lessonExperience.title}
            </h2>
          </FadeUp>
        </div>

        {/* =====================================================
            LESSON FLOW
            ===================================================== */}

        <div
          className="
            relative
            mt-14

            md:mt-16

            lg:mt-20
          "
        >
          {/* Connecting line */}

          <div
            className="
              pointer-events-none
              absolute
              left-[6px]
              top-3
              bottom-3
              hidden
              w-px
              bg-[#DDE4DA]

              md:block
            "
          />

          <div
            className="
              flex
              flex-col
              gap-10

              md:gap-12
            "
          >
            {/* =================================================
                01
                ================================================= */}

            <FadeUp delay={0.16}>
              <div
                className="
                  relative
                  grid
                  gap-4

                  md:grid-cols-[48px_220px_1fr]
                  md:items-start
                  md:gap-6
                "
              >
                <div
                  className="
                    relative
                    z-10
                    flex
                    h-3
                    w-3
                    items-center
                    justify-center
                    rounded-full
                    bg-[#6F8F72]

                    md:mt-2
                  "
                />

                <div>
                  <span
                    className="
                      text-[11px]
                      font-medium
                      tracking-[0.25em]
                      text-[#6F8F72]
                    "
                  >
                    01
                  </span>

                  <h3
                    className="
                      mt-2
                      text-[28px]
                      leading-tight
                      text-[#2B2B2B]

                      [font-family:var(--font-cormorant)]

                      sm:text-[32px]
                    "
                  >
                    {t.lessonExperience.steps.talk.title}
                  </h3>
                </div>

                <p
                  className="
                    max-w-[560px]
                    text-[16px]
                    leading-7
                    text-[#666666]

                    sm:text-[17px]
                    sm:leading-8
                  "
                >
                  {t.lessonExperience.steps.talk.description}
                </p>
              </div>
            </FadeUp>

            {/* =================================================
                02
                ================================================= */}

            <FadeUp delay={0.24}>
              <div
                className="
                  relative
                  grid
                  gap-4

                  md:grid-cols-[48px_220px_1fr]
                  md:items-start
                  md:gap-6
                "
              >
                <div
                  className="
                    relative
                    z-10
                    flex
                    h-3
                    w-3
                    items-center
                    justify-center
                    rounded-full
                    bg-[#6F8F72]

                    md:mt-2
                  "
                />

                <div>
                  <span
                    className="
                      text-[11px]
                      font-medium
                      tracking-[0.25em]
                      text-[#6F8F72]
                    "
                  >
                    02
                  </span>

                  <h3
                    className="
                      mt-2
                      text-[28px]
                      leading-tight
                      text-[#2B2B2B]

                      [font-family:var(--font-cormorant)]

                      sm:text-[32px]
                    "
                  >
                    {t.lessonExperience.steps.goDeeper.title}
                  </h3>
                </div>

                <p
                  className="
                    max-w-[560px]
                    text-[16px]
                    leading-7
                    text-[#666666]

                    sm:text-[17px]
                    sm:leading-8
                  "
                >
                  {t.lessonExperience.steps.goDeeper.description}
                </p>
              </div>
            </FadeUp>

            {/* =================================================
                03
                ================================================= */}

            <FadeUp delay={0.32}>
              <div
                className="
                  relative
                  grid
                  gap-4

                  md:grid-cols-[48px_220px_1fr]
                  md:items-start
                  md:gap-6
                "
              >
                <div
                  className="
                    relative
                    z-10
                    flex
                    h-3
                    w-3
                    items-center
                    justify-center
                    rounded-full
                    bg-[#6F8F72]

                    md:mt-2
                  "
                />

                <div>
                  <span
                    className="
                      text-[11px]
                      font-medium
                      tracking-[0.25em]
                      text-[#6F8F72]
                    "
                  >
                    03
                  </span>

                  <h3
                    className="
                      mt-2
                      text-[28px]
                      leading-tight
                      text-[#2B2B2B]

                      [font-family:var(--font-cormorant)]

                      sm:text-[32px]
                    "
                  >
                    {t.lessonExperience.steps.refine.title}
                  </h3>
                </div>

                <p
                  className="
                    max-w-[560px]
                    text-[16px]
                    leading-7
                    text-[#666666]

                    sm:text-[17px]
                    sm:leading-8
                  "
                >
                  {t.lessonExperience.steps.refine.description}
                </p>
              </div>
            </FadeUp>

            {/* =================================================
                04
                ================================================= */}

            <FadeUp delay={0.40}>
              <div
                className="
                  relative
                  grid
                  gap-4

                  md:grid-cols-[48px_220px_1fr]
                  md:items-start
                  md:gap-6
                "
              >
                <div
                  className="
                    relative
                    z-10
                    flex
                    h-3
                    w-3
                    items-center
                    justify-center
                    rounded-full
                    bg-[#6F8F72]

                    md:mt-2
                  "
                />

                <div>
                  <span
                    className="
                      text-[11px]
                      font-medium
                      tracking-[0.25em]
                      text-[#6F8F72]
                    "
                  >
                    04
                  </span>

                  <h3
                    className="
                      mt-2
                      text-[28px]
                      leading-tight
                      text-[#2B2B2B]

                      [font-family:var(--font-cormorant)]

                      sm:text-[32px]
                    "
                  >
                    {t.lessonExperience.steps.tryAgain.title}
                  </h3>
                </div>

                <p
                  className="
                    max-w-[560px]
                    text-[16px]
                    leading-7
                    text-[#666666]

                    sm:text-[17px]
                    sm:leading-8
                  "
                >
                  {t.lessonExperience.steps.tryAgain.description}
                </p>
              </div>
            </FadeUp>
          </div>
        </div>

        {/* =====================================================
            CLOSING
            ===================================================== */}

        <FadeUp delay={0.48}>
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
            {t.lessonExperience.closing}
          </p>
        </FadeUp>
      </div>
    </section>
  );
}