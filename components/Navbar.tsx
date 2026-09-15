"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  useParams,
  usePathname,
  useRouter,
} from "next/navigation";
import {
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

import type { Locale } from "../lib/i18n";

import en from "@/messages/en";
import ko from "@/messages/ko";
import zh from "@/messages/zh";

const translations = {
  en,
  ko,
  zh,
};

const languages = [
  {
    locale: "en" as Locale,
    label: "EN",
  },
  {
    locale: "ko" as Locale,
    label: "한국어",
  },
  {
    locale: "zh" as Locale,
    label: "中文",
  },
];

export default function Navbar() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();

  /* =====================================================
     CURRENT LOCALE
     ===================================================== */

  const locale: Locale =
    params.locale === "ko" ||
    params.locale === "zh"
      ? params.locale
      : "en";

  const t = translations[locale];

  /* =====================================================
     STATE
     ===================================================== */

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const [isLanguageOpen, setIsLanguageOpen] =
    useState(false);

  const [
    isMobileLanguageOpen,
    setIsMobileLanguageOpen,
  ] = useState(false);

  /* =====================================================
     NAVIGATION
     ===================================================== */

  const navLinks = [
    {
      href: `/${locale}#lessons`,
      label: t.nav.lessons,
    },
    {
      href: `/${locale}#teachers`,
      label: t.nav.teachers,
    },
    {
      href: `/${locale}/how-it-works`,
      label: t.nav.approach,
    },
    {
      href: `/${locale}/policy`,
      label: t.nav.policy,
    },
  ];

  /* =====================================================
     LANGUAGE SWITCHING
     ===================================================== */

  const changeLanguage = (
    newLocale: Locale
  ) => {
    const pathWithoutLocale =
      pathname.replace(
        /^\/(en|ko|zh)(?=\/|$)/,
        ""
      );

    const newPath =
      pathWithoutLocale === ""
        ? `/${newLocale}`
        : `/${newLocale}${pathWithoutLocale}`;

    setIsLanguageOpen(false);
    setIsMobileLanguageOpen(false);
    setIsMobileMenuOpen(false);

    router.push(newPath);
  };

  /* =====================================================
     CURRENT LANGUAGE
     ===================================================== */

  const currentLanguage =
    languages.find(
      (language) =>
        language.locale === locale
    ) ?? languages[0];

  return (
    <header
      className="
        relative
        z-50
        bg-[#F8F4EB]
      "
    >
      <div
        className="
          mx-auto
          flex
          w-full
          max-w-[1600px]
          items-center
          px-6
          py-4
          sm:px-8
          lg:px-10
          xl:px-12
        "
      >
        {/* =====================================================
            LEFT GROUP
            BRAND + PRIMARY NAVIGATION
            ===================================================== */}

        <div
          className="
            flex
            min-w-0
            items-center
          "
        >
          {/* ===================================================
              BRAND
              =================================================== */}

          <Link
  href={`/${locale}`}
  className="
    -ml-3
    flex
    shrink-0
    items-center
    gap-0
    sm:-ml-4
    lg:-ml-6
    xl:-ml-8
  "
>
            <Image
              src="/logo/hamkke-icon.svg"
              alt="Hamkke logo"
              width={72}
              height={72}
              priority
              className="
                h-[36px]
                w-[36px]
                shrink-0
                object-contain
              "
            />

            <div
              className="
                flex
                items-center
                leading-none
                text-[#293A30]
              "
            >
              <span
                className="
                  text-[25px]
                  font-semibold
                  leading-none
                  [font-family:var(--font-cormorant)]
                "
              >
                Hamkke
              </span>

              <span
                className="
                  mx-2.5
                  h-[18px]
                  w-px
                  shrink-0
                  bg-[#A8BCA5]
                  opacity-60
                "
              />

              <span
                className="
                  text-[16px]
                  font-medium
                  leading-none
                  text-[#718A73]
                "
              >
                함께
              </span>
            </div>
          </Link>

          {/* ===================================================
              DESKTOP PRIMARY NAVIGATION
              =================================================== */}

          <nav
            className="
              ml-16
              hidden
              items-center
              gap-6
              md:flex
              lg:ml-20
              lg:gap-7
              xl:ml-24
              xl:gap-8
            "
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="
                  relative
                  whitespace-nowrap
                  text-[15px]
                  font-medium
                  text-[#46564B]
                  transition-colors
                  duration-300
                  hover:text-[#718A73]

                  after:absolute
                  after:-bottom-1.5
                  after:left-0
                  after:h-px
                  after:w-0
                  after:bg-[#718A73]
                  after:transition-all
                  after:duration-300

                  hover:after:w-full
                "
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* =====================================================
            DESKTOP UTILITIES
            LANGUAGE + LOGIN
            ===================================================== */}

        <div
          className="
            ml-auto
            hidden
            items-center
            gap-7
            md:flex
          "
        >
          {/* ===================================================
              LANGUAGE
              =================================================== */}

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setIsLanguageOpen(
                  (previous) => !previous
                )
              }
              aria-haspopup="true"
              aria-expanded={isLanguageOpen}
              className="
                flex
                items-center
                gap-1.5
                whitespace-nowrap
                text-[15px]
                font-medium
                text-[#46564B]
                transition-colors
                duration-300
                hover:text-[#718A73]
              "
            >
              <span>
                {currentLanguage.label}
              </span>

              <ChevronDown
                size={14}
                strokeWidth={1.8}
                className={`
                  transition-transform
                  duration-200
                  ${
                    isLanguageOpen
                      ? "rotate-180"
                      : ""
                  }
                `}
              />
            </button>

            {isLanguageOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-full
                  mt-4
                  min-w-[145px]
                  overflow-hidden
                  rounded-xl
                  border
                  border-[#E7DDD1]
                  bg-[#FFFDF8]
                  py-2
                  shadow-[0_14px_40px_rgba(41,58,48,0.10)]
                "
              >
                {languages.map(
                  (language) => (
                    <button
                      key={language.locale}
                      type="button"
                      onClick={() =>
                        changeLanguage(
                          language.locale
                        )
                      }
                      className={`
                        flex
                        w-full
                        items-center
                        px-5
                        py-2.5
                        text-left
                        text-sm
                        transition-colors
                        duration-200
                        ${
                          language.locale ===
                          locale
                            ? "bg-[#EEF2EA] font-medium text-[#718A73]"
                            : "text-[#46564B] hover:bg-[#F4F0E7] hover:text-[#718A73]"
                        }
                      `}
                    >
                      {language.label}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* ===================================================
              LOGIN
              =================================================== */}

          <Link
            href={`/${locale}#login`}
            className="
              relative
              whitespace-nowrap
              text-[15px]
              font-medium
              text-[#293A30]
              transition-colors
              duration-300
              hover:text-[#718A73]

              after:absolute
              after:-bottom-1.5
              after:left-0
              after:h-px
              after:w-0
              after:bg-[#718A73]
              after:transition-all
              after:duration-300

              hover:after:w-full
            "
          >
            {t.nav.login}
          </Link>
        </div>

        {/* =====================================================
            MOBILE MENU BUTTON
            ===================================================== */}

        <button
          type="button"
          onClick={() => {
            setIsMobileMenuOpen(
              (previous) => !previous
            );
            setIsMobileLanguageOpen(false);
          }}
          aria-label="Toggle navigation"
          aria-expanded={isMobileMenuOpen}
          className="
            ml-auto
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            text-[#293A30]
            transition-colors
            duration-300
            hover:bg-[#EDE7DB]
            md:hidden
          "
        >
          {isMobileMenuOpen ? (
            <X
              size={23}
              strokeWidth={1.8}
            />
          ) : (
            <Menu
              size={23}
              strokeWidth={1.8}
            />
          )}
        </button>
      </div>

      {/* =====================================================
          MOBILE MENU
          ===================================================== */}

      <div
        className={`
          overflow-hidden
          transition-all
          duration-300
          ease-in-out
          md:hidden
          ${
            isMobileMenuOpen
              ? "max-h-[620px]"
              : "max-h-0"
          }
        `}
      >
        <nav
          className="
            bg-[#F8F4EB]
            px-6
            pb-6
            pt-2
          "
        >
          <div className="flex flex-col">
            {/* =================================================
                MOBILE NAVIGATION LINKS
                ================================================= */}

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsMobileLanguageOpen(
                    false
                  );
                }}
                className="
                  border-b
                  border-[#E7DDD1]
                  py-4
                  text-lg
                  font-medium
                  text-[#46564B]
                  transition-colors
                  duration-300
                  hover:text-[#718A73]
                "
              >
                {link.label}
              </Link>
            ))}

            {/* =================================================
                MOBILE LANGUAGE
                ================================================= */}

            <div
              className="
                border-b
                border-[#E7DDD1]
              "
            >
              <button
                type="button"
                onClick={() =>
                  setIsMobileLanguageOpen(
                    (previous) =>
                      !previous
                  )
                }
                aria-haspopup="true"
                aria-expanded={
                  isMobileLanguageOpen
                }
                className="
                  flex
                  w-full
                  items-center
                  justify-between
                  py-4
                  text-lg
                  font-medium
                  text-[#46564B]
                  transition-colors
                  duration-300
                  hover:text-[#718A73]
                "
              >
                <span>
                  {currentLanguage.label}
                </span>

                <ChevronDown
                  size={18}
                  strokeWidth={1.8}
                  className={`
                    transition-transform
                    duration-200
                    ${
                      isMobileLanguageOpen
                        ? "rotate-180"
                        : ""
                    }
                  `}
                />
              </button>

              <div
                className={`
                  overflow-hidden
                  transition-all
                  duration-300
                  ${
                    isMobileLanguageOpen
                      ? "max-h-44 pb-3"
                      : "max-h-0"
                  }
                `}
              >
                <div
                  className="
                    flex
                    flex-col
                    gap-1
                  "
                >
                  {languages.map(
                    (language) => (
                      <button
                        key={
                          language.locale
                        }
                        type="button"
                        onClick={() =>
                          changeLanguage(
                            language.locale
                          )
                        }
                        className={`
                          rounded-xl
                          px-4
                          py-2.5
                          text-left
                          text-base
                          transition-colors
                          duration-200
                          ${
                            language.locale ===
                            locale
                              ? "bg-[#EEF2EA] font-medium text-[#718A73]"
                              : "text-[#5E6A61] hover:bg-[#F0EBE1] hover:text-[#718A73]"
                          }
                        `}
                      >
                        {language.label}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                MOBILE LOGIN
                ================================================= */}

            <Link
              href={`/${locale}#login`}
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsMobileLanguageOpen(
                  false
                );
              }}
              className="
                py-4
                text-lg
                font-medium
                text-[#293A30]
                transition-colors
                duration-300
                hover:text-[#718A73]
              "
            >
              {t.nav.login}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}