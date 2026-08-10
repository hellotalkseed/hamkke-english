"use client";

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
            mx-auto
            grid
            max-w-[1400px]

            gap-10

            px-6
            pt-8
            pb-8

            md:px-8
            md:pt-14
            md:pb-20

            lg:min-h-[calc(100vh-88px)]
            lg:grid-cols-[1.12fr_0.88fr]
            lg:items-center
            lg:gap-6
            lg:px-10
          "
        >
          {/* =====================================================
              HERO CONTENT
              ===================================================== */}

          <HeroContent
            locale={locale}
            onStartConversation={() =>
              setIsInquiryOpen(true)
            }
          />

          {/* =====================================================
              HERO PORTRAIT
              ===================================================== */}

          <HeroImage />
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