"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Menu, X } from "lucide-react";

import AssessmentModal from "./InquiryModal";
import en from "../messages/en";

type InquirySource =
  | "get-in-touch"
  | "start-learning";

export default function Navbar() {
  const params = useParams();

  const locale =
    typeof params.locale === "string"
      ? params.locale
      : "en";

  /*
   * Korean and Chinese translations will be connected
   * once those message files are completed.
   *
   * For now, they safely fall back to English.
   */
  const t = en;

  const [isAssessmentOpen, setIsAssessmentOpen] =
    useState(false);

  const [inquirySource, setInquirySource] =
    useState<InquirySource>("start-learning");

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const navLinks = [
    {
      href: `/${locale}#about`,
      label: t.nav.about,
    },
    {
      href: `/${locale}#lessons`,
      label: t.nav.lessons,
    },
    {
      href: `/${locale}#student-stories`,
      label: t.nav.stories,
    },
  ];

  const openInquiry = (source: InquirySource) => {
    setInquirySource(source);
    setIsAssessmentOpen(true);
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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">

          {/* ================= LOGO ================= */}

          <Link
            href={`/${locale}`}
            className="group flex items-center gap-0"
          >
            <Image
              src="/logo/hamkke-icon.svg"
              alt="Hamkke logo"
              width={100}
              height={100}
              priority
              className="h-[60px] w-[60px]"
            />

            <div className="flex flex-col justify-center leading-none">
              <h1
                className="
                  flex
                  items-baseline
                  text-[1.75rem]
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
                {t.footer.tagline}
              </p>
            </div>
          </Link>

          {/* ================= DESKTOP NAVIGATION ================= */}

          <nav className="hidden items-center gap-8 md:flex">

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

            {/* Get in Touch */}

            <button
              type="button"
              onClick={() =>
                openInquiry("get-in-touch")
              }
              className="
                relative
                text-[15px]
                font-medium
                text-[#555]
                transition-colors
                duration-300
                hover:text-[#6F8F72]

                after:absolute
                after:left-0
                after:-bottom-1
                after:h-[1.5px]
                after:w-0
                after:bg-[#6F8F72]
                after:transition-all
                after:duration-300

                hover:after:w-full
              "
            >
              {t.nav.getInTouch}
            </button>

            {/* Start Learning */}

            <button
              type="button"
              onClick={() =>
                openInquiry("start-learning")
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
              {t.nav.startLearning}
            </button>

          </nav>

          {/* ================= MOBILE MENU BUTTON ================= */}

          <button
            type="button"
            onClick={() =>
              setIsMobileMenuOpen(!isMobileMenuOpen)
            }
            aria-label="Toggle navigation"
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
                ? "max-h-[600px] border-t border-[#E7DDD1]"
                : "max-h-0"
            }
          `}
        >
          <nav className="bg-[#FAF8F5] px-6 py-6">

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

              {/* Get in Touch */}

              <button
                type="button"
                onClick={() =>
                  openInquiry("get-in-touch")
                }
                className="
                  text-left
                  text-lg
                  font-medium
                  text-[#555]
                  transition-colors
                  duration-300
                  hover:text-[#6F8F72]
                "
              >
                {t.nav.getInTouch}
              </button>

              {/* Start Learning */}

              <button
                type="button"
                onClick={() =>
                  openInquiry("start-learning")
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
                {t.nav.startLearning}
              </button>

            </div>
          </nav>
        </div>
      </header>

      {/* ================= INQUIRY MODAL ================= */}

      <AssessmentModal
        isOpen={isAssessmentOpen}
        onClose={() =>
          setIsAssessmentOpen(false)
        }
        source={inquirySource}
      />
    </>
  );
}