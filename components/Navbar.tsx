"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Menu, X } from "lucide-react";

import InquiryModal from "./InquiryModal";
import type { InquirySource } from "./InquiryForm";
import type { Locale } from "../lib/i18n";

import en from "@/messages/en";
import ko from "@/messages/ko";
import zh from "@/messages/zh";

const translations = {
  en,
  ko,
  zh,
};

export default function Navbar() {
  const params = useParams();

  const locale: Locale =
    params.locale === "ko" || params.locale === "zh"
      ? params.locale
      : "en";

  const t = translations[locale];

  const [isInquiryOpen, setIsInquiryOpen] =
    useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const [inquirySource, setInquirySource] =
    useState<InquirySource>("start-a-conversation");

  const navLinks = [
    {
      href: `/${locale}#experience`,
      label: t.nav.experience,
    },
    {
      href: `/${locale}#goals`,
      label: t.nav.goals,
    },
    {
      href: `/${locale}#student-stories`,
      label: t.nav.stories,
    },
  ];

  const openInquiry = (
    source: InquirySource = "start-a-conversation"
  ) => {
    setInquirySource(source);
    setIsInquiryOpen(true);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className="
          fade-up
          sticky
          top-0
          z-50
          border-b
          border-[#E7DDD1]
          bg-[#FAF8F5]/90
          backdrop-blur-md
        "
      >
        <div
          className="
            flex
            w-full
            items-center
            justify-between
            px-6
            py-3
            sm:px-8
            sm:py-4
            lg:px-10
            xl:px-12
          "
        >
          {/* ================= LOGO ================= */}

          <Link
            href={`/${locale}`}
            className="
              flex
              shrink-0
              items-center
              gap-0
            "
          >
            <Image
              src="/logo/hamkke-icon.svg"
              alt="Hamkke logo"
              width={100}
              height={100}
              priority
              className="
                h-[52px]
                w-[52px]
                sm:h-[56px]
                sm:w-[56px]
              "
            />

            <div
              className="
                flex
                flex-col
                justify-center
                leading-none
              "
            >
              <h1
                className="
                  flex
                  items-baseline
                  text-[1.7rem]
                  font-semibold
                  text-[#2B2B2B]
                  [font-family:var(--font-cormorant)]
                  sm:text-[1.9rem]
                  md:text-[2rem]
                "
              >
                <span>Hamkke</span>

                <span
                  className="
                    mx-2
                    h-[0.8em]
                    w-px
                    self-center
                    bg-[#A8BCA5]
                    opacity-50
                  "
                />

                <span
                  className="
                    translate-y-[1px]
                    text-[0.62em]
                    font-medium
                    leading-none
                    text-[#6F8F72]
                  "
                >
                  함께
                </span>
              </h1>

              <p
                className="
                  mt-1
                  text-[8px]
                  uppercase
                  tracking-[0.22em]
                  text-[#6F8F72]
                  sm:text-[9px]
                  sm:tracking-[0.25em]
                  md:text-[10px]
                  md:tracking-[0.34em]
                "
              >
                From Small Talk to Big Ideas
              </p>
            </div>
          </Link>

          {/* ================= DESKTOP NAVIGATION ================= */}

          <nav
            className="
              hidden
              items-center
              gap-8
              md:flex
            "
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="
                  relative
                  text-[15px]
                  font-medium
                  text-[#555]
                  transition-colors
                  duration-300
                  hover:text-[#6F8F72]

                  after:absolute
                  after:-bottom-1
                  after:left-0
                  after:h-[1.5px]
                  after:w-0
                  after:bg-[#6F8F72]
                  after:transition-all
                  after:duration-300

                  hover:after:w-full
                "
              >
                {link.label}
              </Link>
            ))}

            <button
              type="button"
              onClick={() =>
                openInquiry("start-a-conversation")
              }
              className="
                ml-2
                rounded-full
                bg-[#6F8F72]
                px-7
                py-3
                text-[15px]
                font-medium
                text-white
                transition-all
                duration-300

                hover:-translate-y-0.5
                hover:bg-[#5B7960]
                hover:shadow-lg
              "
            >
              {t.nav.startConversation}
            </button>
          </nav>

          {/* ================= MOBILE MENU BUTTON ================= */}

          <button
            type="button"
            onClick={() =>
              setIsMobileMenuOpen(
                (previous) => !previous
              )
            }
            aria-label="Toggle navigation"
            aria-expanded={isMobileMenuOpen}
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              text-[#2B2B2B]
              transition-colors
              duration-300
              hover:bg-[#EFE8DE]
              md:hidden
            "
          >
            {isMobileMenuOpen ? (
              <X size={26} />
            ) : (
              <Menu size={26} />
            )}
          </button>
        </div>

        {/* ================= MOBILE MENU ================= */}

        <div
          className={`
            overflow-hidden
            transition-all
            duration-300
            ease-in-out
            md:hidden

            ${
              isMobileMenuOpen
                ? "max-h-[500px] border-t border-[#E7DDD1]"
                : "max-h-0"
            }
          `}
        >
          <nav
            className="
              bg-[#FAF8F5]
              px-6
              py-6
            "
          >
            <div className="flex flex-col gap-5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() =>
                    setIsMobileMenuOpen(false)
                  }
                  className="
                    text-lg
                    font-medium
                    text-[#555]
                    transition-colors
                    duration-300
                    hover:text-[#6F8F72]
                  "
                >
                  {link.label}
                </Link>
              ))}

              <button
                type="button"
                onClick={() =>
                  openInquiry("start-a-conversation")
                }
                className="
                  mt-3
                  rounded-full
                  bg-[#6F8F72]
                  py-3.5
                  font-medium
                  text-white
                  transition-all
                  duration-300
                  hover:bg-[#5B7960]
                "
              >
                {t.nav.startConversation}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* ================= INQUIRY MODAL ================= */}

      <InquiryModal
        isOpen={isInquiryOpen}
        onClose={() =>
          setIsInquiryOpen(false)
        }
        source={inquirySource}
        locale={locale}
      />
    </>
  );
}