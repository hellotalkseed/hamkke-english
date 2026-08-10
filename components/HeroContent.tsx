"use client";

import FadeUp from "./animations/FadeUp";
import { getMessages } from "../lib/getMessages";
import type { Locale } from "../lib/i18n";

interface HeroContentProps {
  locale: Locale;
  onStartConversation: () => void;
}

export default function HeroContent({
  locale,
  onStartConversation,
}: HeroContentProps) {
  const t = getMessages(locale);

  return (
    <FadeUp>
      <div
        className="
          flex
          flex-col
          justify-center
        "
      >
        {/* =====================================================
            BRAND
            ===================================================== */}

        <FadeUp delay={0.1}>
          <p
            className="
              mb-3

              text-[12px]
              font-medium
              uppercase
              tracking-[0.35em]
              text-[#6F8F72]

              sm:mb-4
            "
          >
            {t.hero.brand}
          </p>
        </FadeUp>

        {/* =====================================================
            MAIN HEADING
            ===================================================== */}

        <FadeUp delay={0.25}>
          <h1
            className="
              max-w-[620px]

              text-[42px]
              leading-[0.92]

              text-[#2B2B2B]

              [font-family:var(--font-cormorant)]

              sm:text-[52px]
              md:text-[60px]
              lg:text-[76px]
            "
          >
            {t.hero.title}
          </h1>
        </FadeUp>

        {/* =====================================================
    SIGNATURE + DESCRIPTION
    ===================================================== */}

<div className="mt-1 w-full">
  {/* Signature */}

  <FadeUp delay={0.32}>
    <p
      className="
        whitespace-nowrap
        text-[16px]
        leading-7
        italic
        text-[#6F8F72]
        [font-family:var(--font-cormorant)]

        sm:text-[18px]
        sm:leading-8
      "
    >
      {t.hero.signature}
    </p>
  </FadeUp>

  {/* Description */}

  <FadeUp delay={0.39}>
    <p
      className="
        mt-5
        w-full
        text-[17px]
        leading-8
        text-[#5B5B5B]

        sm:mt-6
        sm:text-lg
        sm:leading-9
      "
    >
      {t.hero.description}
    </p>
  </FadeUp>
</div>

        {/* =====================================================
            BUTTONS
            ===================================================== */}

        <FadeUp delay={0.48}>
          <div
            className="
              mt-8
              flex
              flex-col
              gap-5

              sm:mt-9
              sm:flex-row

              lg:mt-10
            "
          >
            <button
              type="button"
              onClick={onStartConversation}
              className="
                w-full
                rounded-full

                bg-[#6F8F72]

                px-10
                py-5

                text-lg
                font-medium
                text-white

                shadow-lg
                shadow-[#6F8F72]/20

                transition-all
                duration-300

                hover:-translate-y-1
                hover:bg-[#5B7960]
                hover:shadow-xl

                sm:w-auto
              "
            >
              {t.hero.startConversation}
            </button>

            <a
              href={`/${locale}#lessons`}
              className="
                w-full
                rounded-full

                border
                border-[#6F8F72]

                px-10
                py-5

                text-center
                text-lg
                font-medium
                text-[#6F8F72]

                transition-all
                duration-300

                hover:-translate-y-1
                hover:bg-[#EEF5EE]

                sm:w-auto
              "
            >
              {t.hero.exploreLessons}
            </a>
          </div>
        </FadeUp>
      </div>
    </FadeUp>
  );
}