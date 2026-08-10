"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import AssessmentModal from "./InquiryModal";
import { getMessages } from "../lib/getMessages";
import type { Locale } from "../lib/i18n";

export default function Footer() {
  const params = useParams();

  const locale: Locale =
    params.locale === "ko" || params.locale === "zh"
      ? params.locale
      : "en";

  const t = getMessages(locale);

  const [isInquiryOpen, setIsInquiryOpen] =
    useState(false);

  return (
    <>
      <footer
        className="
          bg-[#2B2B2B]
          py-4

          sm:py-5
        "
      >
        <div
          className="
            mx-auto
            max-w-7xl
            px-6

            md:px-8
            lg:px-10
          "
        >
          <div
            className="
              flex
              flex-col
              items-center
              justify-between
              gap-3

              md:flex-row
              md:items-center
            "
          >
            {/* =====================================================
                BRAND
                ===================================================== */}

            <div
              className="
                text-center

                md:text-left
              "
            >
              <h3
                className="
                  text-[21px]
                  leading-none
                  text-white
                  [font-family:var(--font-cormorant)]
                "
              >
                {t.footer.brand}
              </h3>

              <p
                className="
                  mt-1
                  text-[10px]
                  tracking-wide
                  text-white/50
                "
              >
                {t.footer.tagline}
              </p>
            </div>

            {/* =====================================================
                COPYRIGHT
                ===================================================== */}

            <p
              className="
                text-center
                text-[10px]
                text-white/30

                md:flex-1
              "
            >
              {t.footer.copyright}
            </p>

            {/* =====================================================
                NAVIGATION
                ===================================================== */}

            <nav
              className="
                flex
                flex-wrap
                justify-center
                gap-x-4
                text-[11px]
                text-white/60

                md:justify-end
              "
            >
              <a
                href={`/${locale}#experience`}
                className="transition hover:text-white"
              >
                {t.footer.experience}
              </a>

              <a
                href={`/${locale}#goals`}
                className="transition hover:text-white"
              >
                {t.footer.goals}
              </a>

              <a
                href={`/${locale}#student-stories`}
                className="transition hover:text-white"
              >
                {t.footer.stories}
              </a>

              <button
                type="button"
                onClick={() => setIsInquiryOpen(true)}
                className="transition hover:text-white"
              >
                {t.footer.contact}
              </button>
            </nav>
          </div>
        </div>
      </footer>

      {/* =====================================================
          INQUIRY MODAL
          ===================================================== */}

      <AssessmentModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        source="start-a-conversation"
        locale={locale}
      />
    </>
  );
}