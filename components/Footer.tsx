"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import InquiryModal from "./InquiryModal";
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
          px-6
          pb-7
          pt-14

          sm:px-8
          sm:pb-8
          sm:pt-16

          lg:px-10
          lg:pb-9
          lg:pt-18
        "
      >
        <div className="mx-auto max-w-[1200px]">
          {/* =====================================================
              MAIN FOOTER
              ===================================================== */}

          <div
            className="
              grid
              gap-12

              md:grid-cols-[1.4fr_0.8fr_0.8fr_0.9fr]
              md:gap-8

              lg:gap-12
            "
          >
            {/* ===================================================
                BRAND
                =================================================== */}

            <div className="max-w-[360px]">
              <h3
                className="
                  text-[30px]
                  leading-none
                  text-white
                  [font-family:var(--font-cormorant)]

                  sm:text-[34px]
                "
              >
                {t.footer.brand}
              </h3>

              <p
                className="
                  mt-3
                  text-[11px]
                  uppercase
                  tracking-[0.18em]
                  text-white/45
                "
              >
                {t.footer.tagline}
              </p>

              <div
                className="
                  mt-7
                  h-px
                  w-10
                  bg-[#6F8F72]
                "
              />

              <p
                className="
                  mt-5
                  text-[13px]
                  leading-6
                  text-white/45
                "
              >
                {locale === "ko" ? (
                  <>
                    <span className="block">
                      모든 의미 있는 대화에는 시작이 있습니다.
                    </span>

                    <span className="block">
                      어쩌면 당신의 대화가 여기서 시작될지도 몰라요.
                    </span>
                  </>
                ) : locale === "zh" ? (
                  <>
                    <span className="block">
                      每一段有意义的对话，都有一个开始。
                    </span>

                    <span className="block">
                      也许，你的故事就从这里开始。
                    </span>
                  </>
                ) : (
                  <>
                    <span className="block whitespace-nowrap">
                      Every meaningful conversation starts somewhere.
                    </span>

                    <span className="block whitespace-nowrap">
                      Perhaps yours starts here.
                    </span>
                  </>
                )}
              </p>
            </div>

            {/* ===================================================
                LESSONS
                =================================================== */}

            <div>
              <p
                className="
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.24em]
                  text-[#9DB49A]
                "
              >
                {t.footer.lessonsGroup}
              </p>

              <nav
                className="
                  mt-5
                  flex
                  flex-col
                  items-start
                  gap-3.5
                "
              >
                <Link
                  href={`/${locale}#lesson-details`}
                  className="
                    text-[13px]
                    text-white/65
                    transition-colors
                    duration-200
                    hover:text-white
                  "
                >
                  {t.footer.lessons}
                </Link>

                <Link
                  href={`/${locale}/how-it-works`}
                  className="
                    text-[13px]
                    text-white/65
                    transition-colors
                    duration-200
                    hover:text-white
                  "
                >
                  {t.footer.howItWorks}
                </Link>

                <Link
                  href={`/${locale}/pricing`}
                  className="
                    text-[13px]
                    text-white/65
                    transition-colors
                    duration-200
                    hover:text-white
                  "
                >
                  {t.footer.pricing}
                </Link>

                <Link
                  href={`/${locale}/platform`}
                  className="
                    text-[13px]
                    text-white/65
                    transition-colors
                    duration-200
                    hover:text-white
                  "
                >
                  {t.footer.platform}
                </Link>
              </nav>
            </div>

            {/* ===================================================
                HAMKKE
                =================================================== */}

            <div>
              <p
                className="
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.24em]
                  text-[#9DB49A]
                "
              >
                {t.footer.hamkkeGroup}
              </p>

              <nav
                className="
                  mt-5
                  flex
                  flex-col
                  items-start
                  gap-3.5
                "
              >
                <Link
                  href={`/${locale}#coach`}
                  className="
                    text-[13px]
                    text-white/65
                    transition-colors
                    duration-200
                    hover:text-white
                  "
                >
                  {t.footer.about}
                </Link>

                <Link
                  href={`/${locale}/faq`}
                  className="
                    text-[13px]
                    text-white/65
                    transition-colors
                    duration-200
                    hover:text-white
                  "
                >
                  {t.footer.faq}
                </Link>

                <Link
                  href={`/${locale}/policy`}
                  className="
                    text-[13px]
                    text-white/65
                    transition-colors
                    duration-200
                    hover:text-white
                  "
                >
                  {t.footer.policy}
                </Link>
              </nav>
            </div>

            {/* ===================================================
                CONNECT
                =================================================== */}

            <div>
              <p
                className="
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.24em]
                  text-[#9DB49A]
                "
              >
                {t.footer.connectGroup}
              </p>

              <button
                type="button"
                onClick={() =>
                  setIsInquiryOpen(true)
                }
                className="
                  group
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  text-left
                  text-[13px]
                  text-white/65
                  transition-colors
                  duration-200
                  hover:text-white
                "
              >
                <span>
                  {t.footer.startConversation}
                </span>

                <span
                  className="
                    transition-transform
                    duration-200
                    group-hover:translate-x-1
                  "
                  aria-hidden="true"
                >
                  →
                </span>
              </button>
            </div>
          </div>

          {/* =====================================================
              BOTTOM
              ===================================================== */}

          <div
            className="
              mt-14
              border-t
              border-white/10
              pt-6

              sm:mt-16
            "
          >
            <p
              className="
                text-[10px]
                text-white/30
              "
            >
              {t.footer.copyright}
            </p>
          </div>
        </div>
      </footer>

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