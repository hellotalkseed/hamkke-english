"use client";

import Image from "next/image";

import StaggerContainer from "./animations/StaggerContainer";
import StaggerItem from "./animations/StaggerItem";

import { getMessages } from "../lib/getMessages";
import type { Locale } from "../lib/i18n";

interface WhatYouWontFindHereProps {
  locale: Locale;
}

export default function WhatYouWontFindHere({
  locale,
}: WhatYouWontFindHereProps) {
  const t = getMessages(locale);

  const points = [
    {
      title: t.whatYouWontFindHere.points.memorizedScripts.title,
      text: t.whatYouWontFindHere.points.memorizedScripts.text,
    },
    {
      title: t.whatYouWontFindHere.points.pressure.title,
      text: t.whatYouWontFindHere.points.pressure.text,
    },
    {
      title: t.whatYouWontFindHere.points.oneSizeFitsAll.title,
      text: t.whatYouWontFindHere.points.oneSizeFitsAll.text,
    },
    {
      title: t.whatYouWontFindHere.points.constantCorrection.title,
      text: t.whatYouWontFindHere.points.constantCorrection.text,
    },
  ];

  return (
    <section
      id="what-you-wont-find"
      className="
        relative
        overflow-hidden
        bg-[#FAF8F5]

        py-20
        sm:py-24
        lg:py-32
      "
    >
      {/* =====================================================
          BACKGROUND IMAGE

          This section has its own identity:
          - crossed-out textbook notes
          - progress over perfection
          - conversational handwritten details

          Still stays within the Hamkke visual language through
          the cream background, sage accents, soft light, and
          editorial negative space.
          ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-0
          overflow-hidden
        "
        aria-hidden="true"
      >
        <Image
          src="/hamkke-wont-find-background.png"
          alt=""
          fill
          priority={false}
          sizes="100vw"
          className="
            object-cover
            object-center

            opacity-[0.72]

            sm:opacity-[0.76]
            lg:opacity-[0.80]
          "
        />

        {/* =====================================================
            CENTER CONTENT WASH

            Keeps the main heading and four principles clear while
            preserving the decorative handwritten details around
            the outer edges.
            ===================================================== */}

        <div
          className="
            absolute

            left-[7%]
            right-[7%]

            top-[15%]
            bottom-[14%]

            bg-[radial-gradient(ellipse_at_center,rgba(250,248,245,0.78)_0%,rgba(250,248,245,0.66)_48%,rgba(250,248,245,0.24)_74%,rgba(250,248,245,0)_100%)]
          "
        />

        {/* =====================================================
            POINTS AREA FADE

            Slightly stronger through the middle/lower section so
            the four text blocks remain visually dominant.
            ===================================================== */}

        <div
          className="
            absolute
            inset-x-0

            top-[36%]
            bottom-[8%]

            bg-[linear-gradient(to_bottom,rgba(250,248,245,0)_0%,rgba(250,248,245,0.28)_10%,rgba(250,248,245,0.64)_28%,rgba(250,248,245,0.74)_56%,rgba(250,248,245,0.58)_82%,rgba(250,248,245,0)_100%)]
          "
        />

        {/* =====================================================
            TOP BLEND
            ===================================================== */}

        <div
          className="
            absolute
            inset-x-0
            top-0
            h-[90px]

            bg-gradient-to-b
            from-[#FAF8F5]/58
            via-[#FAF8F5]/18
            to-transparent
          "
        />

        {/* =====================================================
            BOTTOM BLEND
            ===================================================== */}

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-[100px]

            bg-gradient-to-t
            from-[#FAF8F5]/58
            via-[#FAF8F5]/18
            to-transparent
          "
        />

        {/* =====================================================
            MOBILE SOFTENING
            ===================================================== */}

        <div
          className="
            absolute
            inset-0

            bg-[#FAF8F5]/10

            md:hidden
          "
        />
      </div>

      {/* =====================================================
          CONTENT
          ===================================================== */}

      <div
        className="
          relative
          z-10

          mx-auto
          max-w-7xl
          px-6

          md:px-8
          lg:px-10
        "
      >
        {/* =====================================================
            HEADING
            ===================================================== */}

        <div className="max-w-3xl">
          <p
            className="
              mb-3

              text-[12px]
              font-medium
              uppercase
              tracking-[0.35em]
              text-[#6F8F72]
            "
          >
            {t.whatYouWontFindHere.brand}
          </p>

          <h2
            className="
              text-[42px]
              leading-[0.98]
              text-[#2B2B2B]

              [font-family:var(--font-cormorant)]

              sm:text-[52px]
              md:text-[60px]
              lg:text-[78px]
            "
          >
            {t.whatYouWontFindHere.title}
          </h2>
        </div>

        {/* =====================================================
            POINTS
            ===================================================== */}

        <StaggerContainer
          className="
            mt-10
            grid
            gap-x-12
            gap-y-12

            sm:mt-12
            sm:gap-y-14

            lg:mt-14
            lg:grid-cols-2
            lg:gap-x-20
            lg:gap-y-16
          "
        >
          {points.map((point) => (
            <StaggerItem key={point.title}>
              <div
                className="
                  border-t
                  border-[#DDE4DA]
                  pt-6

                  sm:pt-7
                "
              >
                <h3
                  className="
                    text-[27px]
                    leading-[1.08]
                    text-[#2B2B2B]

                    [font-family:var(--font-cormorant)]

                    sm:text-[32px]
                    lg:text-[38px]
                  "
                >
                  {point.title}
                </h3>

                <p
                  className="
                    mt-4
                    max-w-[480px]

                    text-[15px]
                    leading-7
                    text-[#5B5B5B]

                    sm:text-[16px]
                    sm:leading-8
                  "
                >
                  {point.text}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}