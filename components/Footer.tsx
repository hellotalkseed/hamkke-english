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
    params.locale === "ko" ||
    params.locale === "zh" ||
    params.locale === "ja"
      ? params.locale
      : "en";

  const messages = getMessages(locale);
  const content = messages.footer;

  const [isInquiryOpen, setIsInquiryOpen] =
    useState(false);

  return (
    <>
      <footer
        className="
          bg-[#2B2B2B]

          px-6
          py-7

          sm:px-8
          sm:py-8

          lg:px-10
          lg:py-8
        "
      >
        <div className="mx-auto max-w-[1200px]">
          {/* =====================================================
              MAIN FOOTER
              ===================================================== */}

          <div
            className="
              grid
              gap-7

              md:grid-cols-[1.6fr_0.65fr_0.65fr_0.8fr]
              md:gap-6

              lg:gap-8
            "
          >
            {/* ===================================================
                BRAND
                =================================================== */}

            <div>
              <h3
                className="
                  text-[28px]
                  leading-none
                  text-white

                  [font-family:var(--font-cormorant)]

                  sm:text-[30px]
                "
              >
                {content.brand}
              </h3>

              <p
                className="
                  mt-1.5

                  text-[10px]
                  uppercase
                  tracking-[0.17em]
                  text-white/45
                "
              >
                {content.tagline}
              </p>

              <div
                className="
                  mt-3
                  h-px
                  w-8
                  bg-[#6F8F72]
                "
              />

              <p
                className="
                  mt-2.5

                  text-[12px]
                  leading-5
                  text-white/45

                  lg:whitespace-nowrap
                "
              >
                {content.description}
              </p>
            </div>

            {/* ===================================================
                LEARN
                =================================================== */}

            <div>
              <p
                className="
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.22em]
                  text-[#9DB49A]
                "
              >
                {content.groups.learn}
              </p>

              <nav
                className="
                  mt-2.5

                  flex
                  flex-col
                  items-start
                  gap-2
                "
              >
                <Link
                  href={`/${locale}/lessons`}
                  className="
                    text-[12px]
                    text-white/65

                    transition-colors
                    duration-200

                    hover:text-white
                  "
                >
                  {content.links.lessons}
                </Link>

                <Link
                  href={`/${locale}/how-it-works`}
                  className="
                    text-[12px]
                    text-white/65

                    transition-colors
                    duration-200

                    hover:text-white
                  "
                >
                  {content.links.approach}
                </Link>
              </nav>
            </div>

            {/* ===================================================
                HAMKKE
                =================================================== */}

            <div>
              <p
                className="
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.22em]
                  text-[#9DB49A]
                "
              >
                {content.groups.hamkke}
              </p>

              <nav
                className="
                  mt-2.5

                  flex
                  flex-col
                  items-start
                  gap-2
                "
              >
                <Link
                  href={`/${locale}/teachers`}
                  className="
                    text-[12px]
                    text-white/65

                    transition-colors
                    duration-200

                    hover:text-white
                  "
                >
                  {content.links.teachers}
                </Link>

                <Link
                  href={`/${locale}/about`}
                  className="
                    text-[12px]
                    text-white/65

                    transition-colors
                    duration-200

                    hover:text-white
                  "
                >
                  {content.links.about}
                </Link>

                <Link
                  href={`/${locale}/policy`}
                  className="
                    text-[12px]
                    text-white/65

                    transition-colors
                    duration-200

                    hover:text-white
                  "
                >
                  {content.links.policy}
                </Link>
              </nav>
            </div>

            {/* ===================================================
                CONNECT
                =================================================== */}

            <div>
              <p
                className="
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.22em]
                  text-[#9DB49A]
                "
              >
                {content.groups.connect}
              </p>

              <div
                className="
                  mt-2.5

                  flex
                  flex-col
                  items-start
                  gap-2
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setIsInquiryOpen(true)
                  }
                  className="
                    group

                    inline-flex
                    items-center
                    gap-2

                    text-left
                    text-[12px]
                    text-white/65

                    transition-colors
                    duration-200

                    hover:text-white
                  "
                >
                  <span>
                    {
                      content.links
                        .startConversation
                    }
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

                <a
                  href="https://www.instagram.com/hamkke.english/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    group

                    inline-flex
                    items-center
                    gap-2

                    text-[12px]
                    text-white/65

                    transition-colors
                    duration-200

                    hover:text-white
                  "
                >
                  <span>
                    {content.links.instagram}
                  </span>

                  <svg
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="
                      h-[10px]
                      w-[10px]
                      shrink-0

                      transition-transform
                      duration-200

                      group-hover:translate-x-[2px]
                      group-hover:-translate-y-[2px]
                    "
                    aria-hidden="true"
                  >
                    <path
                      d="M3 9L9 3M5 3H9V7"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* =====================================================
              BOTTOM
              ===================================================== */}

          <div
            className="
              mt-6

              border-t
              border-white/10

              pt-3.5
            "
          >
            <p
              className="
                text-[9px]
                text-white/30
              "
            >
              {content.copyright}
            </p>
          </div>
        </div>
      </footer>

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