"use client";

import Link from "next/link";

import FadeUp from "./animations/FadeUp";
import { getMessages } from "../lib/getMessages";
import type { Locale } from "../lib/i18n";

interface LessonDetailsProps {
  locale: Locale;
}

export default function LessonDetails({
  locale,
}: LessonDetailsProps) {
  const t = getMessages(locale);

  const isEnglish = locale === "en";

  const details = [
    {
      number: "01",
      title: t.lessonDetails.details.private.title,
      text: t.lessonDetails.details.private.text,
    },
    {
      number: "02",
      title: t.lessonDetails.details.duration.title,
      text: t.lessonDetails.details.duration.text,
    },
    {
      number: "03",
      title: t.lessonDetails.details.personalized.title,
      text: t.lessonDetails.details.personalized.text,
    },
    {
      number: "04",
      title: t.lessonDetails.details.feedback.title,
      text: t.lessonDetails.details.feedback.text,
    },
    {
      number: "05",
      title: t.lessonDetails.details.teacher.title,
      text: t.lessonDetails.details.teacher.text,
    },
  ];

  return (
    <section
      id="lesson-details"
      className="
        relative
        overflow-hidden
        bg-[#F4F1EA]

        px-6
        py-20

        md:px-8
        md:py-24

        lg:px-10
        lg:py-28
      "
    >
      {/* =====================================================
          DECORATIVE BACKGROUND
          ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -right-24
          -top-24

          h-[360px]
          w-[360px]

          rounded-full
          border
          border-[#6F8F72]/10

          md:-right-16
          md:h-[480px]
          md:w-[480px]
        "
        aria-hidden="true"
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-32
          -left-32

          h-[320px]
          w-[320px]

          rounded-full
          border
          border-[#6F8F72]/10

          md:h-[420px]
          md:w-[420px]
        "
        aria-hidden="true"
      />

      {/* =====================================================
          CONTENT
          ===================================================== */}

      <div
        className="
          relative
          z-10

          mx-auto
          max-w-[1200px]
        "
      >
        {/* =====================================================
            INTRO
            ===================================================== */}

        <div
          className="
            grid
            gap-10

            lg:grid-cols-[1.15fr_0.85fr]
            lg:items-end
            lg:gap-16
          "
        >
          {/* LEFT */}

          <div>
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
                {t.lessonDetails.brand}
              </p>
            </FadeUp>

            <FadeUp delay={0.08}>
              <h2
                className={`
                  mt-5
                  text-[#2B2B2B]

                  ${
                    isEnglish
                      ? `
                        max-w-[760px]

                        text-[40px]
                        leading-[0.98]

                        [font-family:var(--font-cormorant)]

                        sm:text-[52px]
                        md:text-[60px]
                        lg:text-[64px]
                      `
                      : `
                        max-w-[650px]

                        text-[32px]
                        font-medium
                        leading-[1.28]

                        sm:text-[36px]
                        md:text-[42px]
                        lg:text-[46px]
                      `
                  }
                `}
              >
                {isEnglish ? (
                  <>
                    <span className="lg:whitespace-nowrap">
                      Private English lessons,
                    </span>
                    <br className="hidden lg:block" />
                    <span className="lg:whitespace-nowrap">
                      built around real conversation.
                    </span>
                  </>
                ) : (
                  t.lessonDetails.title
                )}
              </h2>
            </FadeUp>
          </div>

          {/* RIGHT */}

          <FadeUp delay={0.16}>
            <p
              className="
                max-w-[560px]

                text-[16px]
                leading-7
                text-[#666666]

                sm:text-[17px]
                sm:leading-8

                lg:pb-1
              "
            >
              {t.lessonDetails.description}
            </p>
          </FadeUp>
        </div>

        {/* =====================================================
            PRACTICAL DETAILS
            ===================================================== */}

        <div
          className="
            mt-16
            border-t
            border-[#D8D8CF]

            md:mt-20
          "
        >
          {details.map((detail, index) => (
            <FadeUp
              key={detail.number}
              delay={0.12 + index * 0.06}
            >
              <div
                className="
                  grid
                  gap-4

                  border-b
                  border-[#D8D8CF]

                  py-7

                  md:grid-cols-[70px_280px_1fr]
                  md:items-start
                  md:gap-8
                  md:py-8

                  lg:grid-cols-[80px_330px_1fr]
                "
              >
                {/* NUMBER */}

                <span
                  className="
                    text-[11px]
                    font-medium
                    tracking-[0.25em]
                    text-[#6F8F72]
                  "
                >
                  {detail.number}
                </span>

                {/* TITLE */}

                <h3
                  className={
                    isEnglish
                      ? `
                        text-[26px]
                        leading-tight
                        text-[#2B2B2B]

                        [font-family:var(--font-cormorant)]

                        sm:text-[30px]
                      `
                      : `
                        text-[20px]
                        font-medium
                        leading-[1.45]
                        text-[#2B2B2B]

                        sm:text-[22px]
                      `
                  }
                >
                  {detail.title}
                </h3>

                {/* DESCRIPTION */}

                <p
                  className="
                    max-w-[540px]

                    text-[15px]
                    leading-7
                    text-[#666666]

                    sm:text-[16px]
                  "
                >
                  {detail.text}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>

        {/* =====================================================
            HOW IT WORKS LINK
            ===================================================== */}

        <FadeUp delay={0.48}>
          <div className="mt-10">
            <Link
              href={`/${locale}/how-it-works`}
              className="
                group
                inline-flex
                items-center
                gap-3

                text-[13px]
                font-medium
                uppercase
                tracking-[0.18em]
                text-[#55745A]

                transition-colors
                duration-300

                hover:text-[#3F5F45]
              "
            >
              {t.lessonDetails.link}

              <span
                className="
                  transition-transform
                  duration-300

                  group-hover:translate-x-1
                "
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}