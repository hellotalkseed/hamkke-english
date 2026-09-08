"use client";

import Image from "next/image";
import { useState } from "react";

import HeroContent from "./HeroContent";
import HeroImage from "./HeroImage";
import InquiryModal from "./InquiryModal";
import Navbar from "./Navbar";

import type { Locale } from "../lib/i18n";

interface HeroProps {
  locale: Locale;
}

export default function Hero({
  locale,
}: HeroProps) {
  const [isInquiryOpen, setIsInquiryOpen] =
    useState(false);

  return (
    <>
      <Navbar />

      <main className="relative overflow-hidden bg-[#FAF8F5]">
        <section
          className="
            relative
            isolate

            mx-auto
            grid
            max-w-[1400px]

            gap-10

            px-6
            pt-4
            pb-8

            md:px-8
            md:pt-6
            md:pb-14

            lg:min-h-[calc(100vh-88px)]
            lg:grid-cols-[1.12fr_0.88fr]
            lg:items-start
            lg:gap-6
            lg:px-10
            lg:pt-10
          "
        >
          {/* =====================================================
              MOBILE BACKGROUND COLLAGE

              Mobile only.

              Keeps the full collage proportions and anchors
              the image toward the right so the students remain
              visible behind the content.

              Desktop is not affected.
              ===================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-0
              overflow-hidden

              lg:hidden
            "
            aria-hidden="true"
          >
            <Image
              src="/hamkke-students-hero-v2.png"
              alt=""
              width={1536}
              height={1024}
              priority
              sizes="150vw"
              className="
                absolute

                right-[-2%]
                bottom-[-2%]

                h-auto
                w-[150%]
                max-w-none

                opacity-[0.50]
              "
            />

            {/* =====================================================
                MOBILE LEFT READABILITY FADE

                Protects the text area while allowing more of the
                people on the right to remain visible.
                ===================================================== */}

            <div
              className="
                absolute
                inset-0

                bg-gradient-to-r
                from-[#FAF8F5]/92
                via-[#FAF8F5]/68
                to-[#FAF8F5]/15
              "
            />

            {/* =====================================================
                MOBILE IMAGE TOP BLEND

                Gradually reveals the collage so the photo does
                not appear as a rectangular block behind the text.
                ===================================================== */}

            <div
              className="
                absolute
                inset-x-0
                top-0
                h-[58%]

                bg-gradient-to-b
                from-[#FAF8F5]
                via-[#FAF8F5]/80
                to-transparent
              "
            />

            {/* =====================================================
                MOBILE TOP SOFTENING
                ===================================================== */}

            <div
              className="
                absolute
                inset-x-0
                top-0
                h-[130px]

                bg-gradient-to-b
                from-[#FAF8F5]
                via-[#FAF8F5]/55
                to-transparent
              "
            />

            {/* =====================================================
                MOBILE BOTTOM FADE
                ===================================================== */}

            <div
              className="
                absolute
                inset-x-0
                bottom-0
                h-[110px]

                bg-gradient-to-t
                from-[#FAF8F5]
                via-[#FAF8F5]/45
                to-transparent
              "
            />
          </div>

          {/* =====================================================
              HERO CONTENT

              Content stays above the mobile background image.

              Desktop behavior remains unchanged.
              ===================================================== */}

          <div className="relative z-30">
            <HeroContent
              locale={locale}
              onStartConversation={() =>
                setIsInquiryOpen(true)
              }
            />
          </div>

          {/* =====================================================
              DESKTOP HERO IMAGE

              Hidden on mobile.

              From lg upward, the existing HeroImage component
              behaves exactly as before.
              ===================================================== */}

          <div
            className="
              relative
              z-0

              hidden
              lg:block
            "
          >
            <HeroImage />
          </div>
        </section>

        {/* =====================================================
            SOFT BACKGROUND DECORATION
            ===================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            right-[-120px]
            top-28
            z-0

            h-[420px]
            w-[420px]

            rounded-full

            bg-[#E8F0E5]

            opacity-40

            blur-3xl
          "
        />
      </main>

      {/* =====================================================
          INQUIRY MODAL
          ===================================================== */}

      <InquiryModal
        isOpen={isInquiryOpen}
        onClose={() =>
          setIsInquiryOpen(false)
        }
        source="start-a-conversation"
        locale={locale}
      />
    </>
  );
}