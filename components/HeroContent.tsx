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
          min-w-0
          w-full
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
              text-[11px]
              font-medium
              uppercase
              tracking-[0.3em]
              text-[#6F8F72]

              sm:mb-4
              sm:text-[12px]
              sm:tracking-[0.35em]
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
              min-w-0
              w-full
              max-w-[620px]

              text-[44px]
              leading-[0.95]
              break-words

              text-[#2B2B2B]

              [font-family:var(--font-cormorant)]

              sm:text-[52px]
              sm:leading-[0.92]

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

        <div
          className="
            mt-3
            min-w-0
            w-full

            sm:mt-2
          "
        >
          {/* Signature */}

          <FadeUp delay={0.32}>
            <p
              className="
                max-w-full
                break-words

                text-[17px]
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
                min-w-0
                w-full
                max-w-[620px]

                text-[16px]
                leading-7
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
              w-full
              flex-col
              gap-4

              sm:mt-9
              sm:flex-row
              sm:gap-5

              lg:mt-10
            "
          >
            {/* Start a Conversation */}

            <button
              type="button"
              onClick={onStartConversation}
              className="
                w-full
                min-w-0
                rounded-full

                bg-[#6F8F72]

                px-6
                py-4

                text-base
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
                sm:px-8
                sm:py-5
                sm:text-lg

                lg:px-10
              "
            >
              {t.hero.startConversation}
            </button>
          </div>
        </FadeUp>
      </div>
    </FadeUp>
  );
}