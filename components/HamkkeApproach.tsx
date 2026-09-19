import Image from "next/image";
import Link from "next/link";

import type { Locale } from "../lib/i18n";
import { getMessages } from "../lib/getMessages";

type HamkkeApproachProps = {
  locale: Locale;
};

/* =====================================================
   SELECTIVE EMPHASIS
   ===================================================== */

function renderHighlightedDescription(
  text: string,
  highlights: readonly string[]
) {
  const validHighlights =
    highlights
      .filter(
        (highlight) =>
          highlight &&
          text.includes(highlight)
      )
      .sort(
        (a, b) =>
          text.indexOf(a) -
          text.indexOf(b)
      );

  if (validHighlights.length === 0) {
    return text;
  }

  const parts: React.ReactNode[] = [];

  let currentIndex = 0;

  validHighlights.forEach(
    (highlight, index) => {
      const highlightIndex =
        text.indexOf(
          highlight,
          currentIndex
        );

      if (highlightIndex === -1) {
        return;
      }

      if (
        highlightIndex >
        currentIndex
      ) {
        parts.push(
          text.slice(
            currentIndex,
            highlightIndex
          )
        );
      }

      parts.push(
        <strong
          key={`${highlight}-${index}`}
          className="font-semibold text-[#304A39]"
        >
          {highlight}
        </strong>
      );

      currentIndex =
        highlightIndex +
        highlight.length;
    }
  );

  if (currentIndex < text.length) {
    parts.push(
      text.slice(currentIndex)
    );
  }

  return parts;
}

export default function HamkkeApproach({
  locale,
}: HamkkeApproachProps) {
  const messages = getMessages(locale);
  const content =
    messages.hamkkeApproach;

  const steps = [
    {
      ...content.steps.talk,
      numberColor: "#718A73",
    },
    {
      ...content.steps.goDeeper,
      numberColor: "#B99368",
    },
    {
      ...content.steps.refine,
      numberColor: "#B79A4B",
    },
    {
      ...content.steps.tryAgain,
      numberColor: "#718A73",
    },
  ];

  return (
    <section
      id="approach"
      className="
        relative
        overflow-hidden
        bg-[#F3EDDD]

        py-10
        sm:py-12
        lg:py-14
      "
    >
      <div
        className="
          mx-auto
          max-w-[1440px]

          px-6
          sm:px-10
          lg:px-16
        "
      >
        {/* =====================================================
            HEADING
            ===================================================== */}

        <div className="mx-auto max-w-[1180px] text-center">
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
            {content.eyebrow}
          </p>

          <div className="mx-auto mt-3 h-px w-12 bg-[#718A73]/60" />

          <h2
            className="
              mt-4

              font-serif
              text-[40px]
              leading-[1]
              tracking-[-0.035em]
              text-[#304A39]

              sm:text-5xl
              lg:text-[56px]
            "
          >
            {content.title.lineOne}

            <br className="hidden sm:block" />

            {content.title.lineTwo}
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-[680px]

              text-[15px]
              leading-7
              text-[#758477]

              sm:text-base
            "
          >
            {renderHighlightedDescription(
              content.description.text,
              content.description.highlights
            )}
          </p>
        </div>

        {/* =====================================================
            DESKTOP APPROACH
            ===================================================== */}

        <div className="relative mt-8 hidden lg:block">
          {/* STEP HEADINGS */}

          <div className="grid grid-cols-4 gap-10 pr-[120px]">
            {steps.map((step) => (
              <div key={step.number}>
                <p
                  className="
                    font-serif
                    text-[32px]
                    leading-none
                  "
                  style={{
                    color:
                      step.numberColor,
                  }}
                >
                  {step.number}
                </p>

                <h3
                  className="
                    mt-2

                    font-serif
                    text-[28px]
                    leading-none
                    text-[#304A39]
                  "
                >
                  {step.title}
                </h3>
              </div>
            ))}
          </div>

          {/* =====================================================
              CONVERSATION THREAD
              ===================================================== */}

          <div className="relative mt-4 h-[78px]">
            <svg
              viewBox="0 0 1312 78"
              preserveAspectRatio="none"
              className="
                absolute
                left-0
                top-0

                h-full
                w-[91%]

                overflow-visible
              "
              aria-hidden="true"
            >
              <path
                d="
                  M 8 34
                  C 100 8, 180 58, 275 34
                  S 455 10, 545 34
                  S 720 58, 815 34
                  S 990 10, 1080 34
                  S 1185 50, 1255 35
                "
                fill="none"
                stroke="#718A73"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.82"
                vectorEffect="non-scaling-stroke"
              />

              <circle
                cx="8"
                cy="34"
                r="5.5"
                fill="#718A73"
              />

              <circle
                cx="330"
                cy="23"
                r="5.5"
                fill="#B99368"
              />

              <circle
                cx="660"
                cy="52"
                r="5.5"
                fill="#B79A4B"
              />

              <circle
                cx="990"
                cy="18"
                r="5.5"
                fill="#718A73"
              />
            </svg>

            {/* CONTINUATION */}

            <p
              className="
                absolute
                right-[92px]
                top-[-36px]

                max-w-[145px]

                -rotate-2

                text-right
                font-serif
                text-[16px]
                italic
                leading-[1.15]
                text-[#718A73]
              "
            >
              {content.continuation.lineOne}

              <br />

              {content.continuation.lineTwo}
            </p>

            {/* MASCOT PULLING THREAD */}

            <div
              className="
                pointer-events-none
                absolute

                right-[15px]
                top-[-41px]

                h-[120px]
                w-[155px]
              "
              aria-hidden="true"
            >
              <Image
                src="/mascot/hamkkeapproach-pull.png"
                alt=""
                fill
                sizes="155px"
                className="
                  object-contain
                  object-right
                "
              />
            </div>
          </div>

          {/* =====================================================
              STEP DESCRIPTIONS
              ===================================================== */}

          <div className="grid grid-cols-4 gap-10 pr-[120px]">
            {steps.map((step) => (
              <p
                key={`${step.number}-description`}
                className="
                  max-w-[230px]

                  text-sm
                  leading-6
                  text-[#758477]
                "
              >
                {step.description}
              </p>
            ))}
          </div>
        </div>

        {/* =====================================================
            MOBILE / TABLET
            ===================================================== */}

        <div className="mt-8 lg:hidden">
          <div className="grid gap-7 sm:grid-cols-2">
            {steps.map((step) => (
              <div key={step.number}>
                <p
                  className="
                    font-serif
                    text-3xl
                  "
                  style={{
                    color:
                      step.numberColor,
                  }}
                >
                  {step.number}
                </p>

                <h3
                  className="
                    mt-1

                    font-serif
                    text-2xl
                    text-[#304A39]
                  "
                >
                  {step.title}
                </h3>

                <p
                  className="
                    mt-2
                    max-w-[260px]

                    text-sm
                    leading-6
                    text-[#758477]
                  "
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* =====================================================
              MOBILE ENDING
              ===================================================== */}

          <div
            className="
              mt-5

              flex
              items-center
              justify-end
              gap-3
            "
          >
            <p
              className="
                -rotate-2

                text-right
                font-serif
                text-base
                italic
                leading-5
                text-[#718A73]
              "
            >
              {content.continuation.lineOne}

              <br />

              {content.continuation.lineTwo}
            </p>

            <div
              className="
                relative
                h-[82px]
                w-[105px]
              "
              aria-hidden="true"
            >
              <Image
                src="/mascot/hamkkeapproach-pull.png"
                alt=""
                fill
                sizes="105px"
                className="
                  object-contain
                  object-right
                "
              />
            </div>
          </div>
        </div>

        {/* =====================================================
            APPROACH LINK
            ===================================================== */}

        <div className="mt-7 flex justify-center">
          <div className="relative">
            {/* WARM OAT BOTTOM LAYER */}

            <div
              className="
                absolute
                inset-0

                translate-y-[8px]

                rounded-[22px]
                bg-[#D8C9AA]
              "
              aria-hidden="true"
            />

            {/* MAIN BUTTON */}

            <Link
              href={`/${locale}/how-it-works`}
              className="
                group
                relative
                z-10

                flex
                min-h-[56px]
                min-w-[310px]
                items-center
                justify-between
                gap-8

                rounded-[22px]
                bg-[#E9DFC9]

                px-7

                text-[14px]
                font-semibold
                text-[#304A39]

                transition-transform
                duration-200

                hover:-translate-y-[2px]

                active:translate-y-[4px]

                sm:min-w-[340px]
              "
            >
              <span>
                {content.explore}
              </span>

              <span
                className="
                  text-[21px]
                  font-normal
                  leading-none

                  transition-transform
                  duration-200

                  group-hover:translate-x-1
                "
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}