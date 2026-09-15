"use client";

import FadeUp from "./animations/FadeUp";
import type { Locale } from "../lib/i18n";

interface HeroContentProps {
  locale: Locale;
}

export default function HeroContent({
  locale,
}: HeroContentProps) {
  const content = {
    en: {
      eyebrow: "1:1 ONLINE ENGLISH",
      titleFirst: "From Small Talk",
      titleSecond: "to",
      titleAccent: "Big Ideas.",
      description:
        "Use the English you already know to say more of what you mean.",
      assessment: "Book a Free Assessment",
      features: {
        conversation: "Conversation-focused",
        learners: "Kids to Adults",
        online: "100% Online",
        personalized: "Personalized Lessons",
      },
    },

    ko: {
      eyebrow: "1:1 ONLINE ENGLISH",
      titleFirst: "From Small Talk",
      titleSecond: "to",
      titleAccent: "Big Ideas.",
      description:
        "이미 알고 있는 영어로, 하고 싶은 말을 더 자연스럽게 표현해 보세요.",
      assessment: "무료 레벨 상담 예약하기",
      features: {
        conversation: "대화 중심",
        learners: "어린이부터 성인까지",
        online: "100% 온라인",
        personalized: "맞춤형 수업",
      },
    },

    zh: {
      eyebrow: "1:1 ONLINE ENGLISH",
      titleFirst: "From Small Talk",
      titleSecond: "to",
      titleAccent: "Big Ideas.",
      description:
        "用你已经掌握的英语，更自然地表达真正想说的话。",
      assessment: "预约免费评估",
      features: {
        conversation: "以对话为中心",
        learners: "儿童到成人",
        online: "100% 在线",
        personalized: "个性化课程",
      },
    },
  }[locale];

  const featureLabelClass = `
    text-[12px]
    font-medium
    leading-[1.3]
    text-[#536057]

    lg:text-[13px]
  `;

  const iconClass = "h-7 w-7 text-[#536F61]";

  return (
    <FadeUp>
      <div
        className="
          flex
          w-full
          min-w-0
          flex-col
          justify-center

          px-2
          sm:px-4
          md:px-6

          lg:min-h-[540px]
          lg:px-0
          lg:pl-8
          lg:pr-4

          xl:pl-12
        "
      >
        {/* =====================================================
            SERVICE EYEBROW
            ===================================================== */}

        <FadeUp delay={0.1}>
          <p
            className="
              mb-2

              text-[11px]
              font-medium
              uppercase
              tracking-[0.34em]
              text-[#536F61]

              sm:text-[12px]
              sm:tracking-[0.38em]
            "
          >
            {content.eyebrow}
          </p>
        </FadeUp>

        {/* =====================================================
            MAIN HEADING
            ===================================================== */}

        <FadeUp delay={0.2}>
          <h1
            className="
              w-full
              max-w-[840px]

              text-[54px]
              font-medium
              leading-[0.84]
              tracking-[-0.04em]
              text-[#293A30]

              [font-family:var(--font-cormorant)]

              sm:text-[68px]
              md:text-[80px]
              lg:text-[92px]
              xl:text-[104px]
            "
          >
            {/* FIRST LINE */}

            <span className="block">
              {content.titleFirst}
            </span>

            {/* SECOND LINE */}

            <span
              className="
                mt-2
                block
                whitespace-nowrap

                sm:mt-1
                lg:mt-0
              "
            >
              <span
                className="
                  relative
                  -left-1
                  inline-block

                  lg:-left-3
                "
              >
                {content.titleSecond}
              </span>

              <span
                className="
  relative
  ml-3
  inline-block

  translate-y-[5px]
  -rotate-[1.5deg]

  text-[0.96em]
  font-normal
  not-italic
  leading-[0.82]
  tracking-[-0.035em]
  text-[#607D68]

  [font-family:var(--font-jua)]

  sm:ml-4
  sm:text-[1em]

  md:ml-5
  md:text-[1.04em]

  lg:ml-7
  lg:translate-y-[10px]
  lg:text-[1.08em]

  xl:ml-9
  xl:translate-y-[12px]
  xl:text-[1.12em]
"
              >
                {content.titleAccent}

                {/* Hand-drawn underline */}

                <svg
                  viewBox="0 0 340 24"
                  preserveAspectRatio="none"
                  className="
                    absolute
                    -bottom-3
                    -left-[5%]

                    h-[10px]
                    w-[110%]

                    overflow-visible

                    sm:-bottom-4

                    lg:-bottom-5
                    lg:h-[13px]
                  "
                  aria-hidden="true"
                >
                  <path
                    d="M5 15 C82 5, 218 8, 335 12"
                    fill="none"
                    stroke="#B8C9B5"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </span>
          </h1>
        </FadeUp>

        {/* =====================================================
            VALUE STATEMENT
            ===================================================== */}

        <FadeUp delay={0.3}>
          <p
            className="
              mt-10
              max-w-[600px]

              text-[20px]
              leading-[1.45]
              text-[#56645B]

              [font-family:var(--font-cormorant)]

              sm:text-[23px]

              lg:mt-12
              lg:text-[25px]
            "
          >
            {locale === "en" ? (
              <>
                Use the English you already know
                <br />
                to say more of what you mean.
              </>
            ) : (
              content.description
            )}
          </p>
        </FadeUp>

        {/* =====================================================
            PRIMARY CTA
            ===================================================== */}

        <FadeUp delay={0.4}>
          <div className="mt-7 lg:mt-8">
            <button
              type="button"
              className="
                group
                inline-flex
                items-center
                justify-center
                gap-4

                rounded-full
                bg-[#304A39]

                px-7
                py-4

                text-[15px]
                font-medium
                text-[#FFFDF8]

                transition-all
                duration-300

                hover:-translate-y-0.5
                hover:bg-[#293F31]

                sm:px-8
                sm:py-[18px]
                sm:text-[16px]
              "
            >
              <span>{content.assessment}</span>

              <span
                className="
                  text-[19px]
                  leading-none

                  transition-transform
                  duration-300

                  group-hover:translate-x-1
                "
                aria-hidden="true"
              >
                →
              </span>
            </button>
          </div>
        </FadeUp>

        {/* =====================================================
            QUICK LESSON DETAILS
            ===================================================== */}

        <FadeUp delay={0.5}>
          <div
            className="
              mt-9
              grid
              max-w-[650px]
              grid-cols-2

              border-t
              border-[#304A39]/15

              pt-5

              sm:grid-cols-4
              sm:pt-6
            "
          >
            {/* Conversation */}

            <div
              className="
                flex
                min-h-[78px]
                flex-col
                items-center
                justify-start
                gap-2.5

                border-r
                border-[#304A39]/15

                px-3
                text-center
              "
            >
              <svg
                viewBox="0 0 32 32"
                className={iconClass}
                aria-hidden="true"
              >
                <path
                  d="M7 7.5h18a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4H15l-6 4v-4H7a4 4 0 0 1-4-4v-7a4 4 0 0 1 4-4Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <circle
                  cx="11"
                  cy="15"
                  r="1"
                  fill="currentColor"
                />

                <circle
                  cx="16"
                  cy="15"
                  r="1"
                  fill="currentColor"
                />

                <circle
                  cx="21"
                  cy="15"
                  r="1"
                  fill="currentColor"
                />
              </svg>

              <span className={featureLabelClass}>
                {content.features.conversation}
              </span>
            </div>

            {/* Learners */}

            <div
              className="
                flex
                min-h-[78px]
                flex-col
                items-center
                justify-start
                gap-2.5

                px-3
                text-center

                sm:border-r
                sm:border-[#304A39]/15
              "
            >
              <svg
                viewBox="0 0 32 32"
                className={iconClass}
                aria-hidden="true"
              >
                <circle
                  cx="16"
                  cy="9"
                  r="4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />

                <circle
                  cx="7"
                  cy="14"
                  r="3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />

                <circle
                  cx="25"
                  cy="14"
                  r="3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />

                <path
                  d="M10 27c.5-5 2.5-8 6-8s5.5 3 6 8M2 27c.4-4 2-6 5-6 1.4 0 2.5.4 3.4 1.2M30 27c-.4-4-2-6-5-6-1.4 0-2.5.4-3.4 1.2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>

              <span className={featureLabelClass}>
                {content.features.learners}
              </span>
            </div>

            {/* Online */}

            <div
              className="
                flex
                min-h-[78px]
                flex-col
                items-center
                justify-start
                gap-2.5

                border-r
                border-t
                border-[#304A39]/15

                px-3
                pt-4
                text-center

                sm:border-t-0
                sm:pt-0
              "
            >
              <svg
                viewBox="0 0 32 32"
                className={iconClass}
                aria-hidden="true"
              >
                <rect
                  x="5"
                  y="6"
                  width="22"
                  height="15"
                  rx="1.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />

                <path
                  d="M2.5 25h27M12 25l1-4h6l1 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>

              <span className={featureLabelClass}>
                {content.features.online}
              </span>
            </div>

            {/* Personalized */}

            <div
              className="
                flex
                min-h-[78px]
                flex-col
                items-center
                justify-start
                gap-2.5

                border-t
                border-[#304A39]/15

                px-3
                pt-4
                text-center

                sm:border-t-0
                sm:pt-0
              "
            >
              <svg
                viewBox="0 0 32 32"
                className={iconClass}
                aria-hidden="true"
              >
                {/* Learner */}

                <circle
                  cx="9.5"
                  cy="9"
                  r="3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />

                <path
                  d="M4.5 25c.4-5.2 2.2-8.2 5-8.2s4.6 3 5 8.2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />

                {/* Personalization controls */}

                <path
                  d="M19 8h9M19 16h9M19 24h9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />

                <circle
                  cx="22.5"
                  cy="8"
                  r="1.8"
                  fill="#F8F4EB"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />

                <circle
                  cx="25.5"
                  cy="16"
                  r="1.8"
                  fill="#F8F4EB"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />

                <circle
                  cx="21.5"
                  cy="24"
                  r="1.8"
                  fill="#F8F4EB"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>

              <span className={featureLabelClass}>
                {content.features.personalized}
              </span>
            </div>
          </div>
        </FadeUp>
      </div>
    </FadeUp>
  );
}