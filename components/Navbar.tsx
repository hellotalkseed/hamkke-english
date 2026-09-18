"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  useParams,
  usePathname,
  useRouter,
} from "next/navigation";
import {
  ChevronDown,
  CircleUserRound,
  Menu,
  X,
} from "lucide-react";

import type { Locale } from "../lib/i18n";

import en from "@/messages/en";
import ko from "@/messages/ko";
import zh from "@/messages/zh";
import ja from "@/messages/ja";

const translations = {
  en,
  ko,
  zh,
  ja,
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
  {
    locale: "ja" as Locale,
    label: "日本語",
  },
];

/* =====================================================
   HOMEPAGE SECTION BACKGROUNDS
   ===================================================== */

const homepageSections = [
  {
    id: "lessons",
    background: "#FFFDF8",
  },
  {
    id: "approach",
    background: "#F3EDDD",
  },
  {
    id: "learner-stages",
    background: "#FFFDF8",
  },
  {
    id: "teachers",
    background: "#EEF2EA",
  },
  {
    id: "learner-stories",
    background: "#F3EDDD",
  },
  {
    id: "get-started",
    background: "#FFFDF8",
  },
];

export default function Navbar() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const headerRef =
    useRef<HTMLElement | null>(null);

  /* =====================================================
     CURRENT LOCALE
     ===================================================== */

  const locale: Locale =
    params.locale === "ko" ||
    params.locale === "zh" ||
    params.locale === "ja"
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

  const [
    homepageNavbarBackground,
    setHomepageNavbarBackground,
  ] = useState("#F3EDDD");

  const [
    pageNavbarBackground,
    setPageNavbarBackground,
  ] = useState("#FFFDF8");

  /* =====================================================
     ACTIVE PAGES
     ===================================================== */

  const isHomePage =
    pathname === `/${locale}`;

  const isLessonsPage =
    pathname === `/${locale}/lessons` ||
    pathname.startsWith(
      `/${locale}/lessons/`
    );

  const isTeachersDirectory =
    pathname === `/${locale}/teachers`;

  const isTeacherProfile =
    pathname.startsWith(
      `/${locale}/teachers/`
    );

  const isTeachersPage =
    isTeachersDirectory ||
    isTeacherProfile;

  const isApproachPage =
    pathname === `/${locale}/how-it-works` ||
    pathname.startsWith(
      `/${locale}/how-it-works/`
    );

  const isPolicyPage =
    pathname === `/${locale}/policy` ||
    pathname.startsWith(
      `/${locale}/policy/`
    );

  const usesAutomaticSectionBackground =
    isLessonsPage ||
    isApproachPage ||
    isPolicyPage;

  /* =====================================================
     HOMEPAGE BACKGROUND DETECTION
     ===================================================== */

  useEffect(() => {
    if (!isHomePage) {
      return;
    }

    let animationFrameId:
      | number
      | null = null;

    const updateBackground = () => {
      const navbarHeight =
        headerRef.current?.offsetHeight ?? 0;

      const detectionPoint =
        navbarHeight + 1;

      let nextBackground =
        "#F3EDDD";

      for (const section of homepageSections) {
        const element =
          document.getElementById(
            section.id
          );

        if (!element) {
          continue;
        }

        const rect =
          element.getBoundingClientRect();

        if (rect.top <= detectionPoint) {
          nextBackground =
            section.background;
        }
      }

      setHomepageNavbarBackground(
        (currentBackground) =>
          currentBackground ===
          nextBackground
            ? currentBackground
            : nextBackground
      );
    };

    const scheduleUpdate = () => {
      if (animationFrameId !== null) {
        return;
      }

      animationFrameId =
        window.requestAnimationFrame(
          () => {
            updateBackground();
            animationFrameId = null;
          }
        );
    };

    updateBackground();

    window.addEventListener(
      "scroll",
      scheduleUpdate,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "resize",
      scheduleUpdate
    );

    return () => {
      window.removeEventListener(
        "scroll",
        scheduleUpdate
      );

      window.removeEventListener(
        "resize",
        scheduleUpdate
      );

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(
          animationFrameId
        );
      }
    };
  }, [isHomePage]);

  /* =====================================================
     AUTOMATIC PAGE SECTION BACKGROUND DETECTION

     Used by:
     - Lessons
     - Approach
     - Policy

     Reads the actual rendered section background.
     ===================================================== */

  useEffect(() => {
    if (!usesAutomaticSectionBackground) {
      return;
    }

    let animationFrameId:
      | number
      | null = null;

    const updateBackground = () => {
      const header =
        headerRef.current;

      if (!header) {
        return;
      }

      const navbarHeight =
        header.offsetHeight;

      /*
       * Inspect the content immediately below
       * the sticky navbar.
       */
      const x =
        Math.min(
          window.innerWidth / 2,
          window.innerWidth - 1
        );

      const y =
        Math.min(
          navbarHeight + 2,
          window.innerHeight - 1
        );

      const elementUnderNavbar =
        document.elementFromPoint(x, y);

      if (!elementUnderNavbar) {
        return;
      }

      /*
       * Find the section containing that content.
       */
      const section =
        elementUnderNavbar.closest(
          "section"
        );

      if (!section) {
        return;
      }

      /*
       * Read the actual rendered background.
       */
      const computedStyle =
        window.getComputedStyle(section);

      const backgroundColor =
        computedStyle.backgroundColor;

      /*
       * Ignore transparent sections.
       */
      if (
        !backgroundColor ||
        backgroundColor ===
          "rgba(0, 0, 0, 0)" ||
        backgroundColor ===
          "transparent"
      ) {
        return;
      }

      setPageNavbarBackground(
        (currentBackground) =>
          currentBackground ===
          backgroundColor
            ? currentBackground
            : backgroundColor
      );
    };

    const scheduleUpdate = () => {
      if (animationFrameId !== null) {
        return;
      }

      animationFrameId =
        window.requestAnimationFrame(
          () => {
            updateBackground();
            animationFrameId = null;
          }
        );
    };

    /*
     * Lessons, Approach, and Policy all
     * begin with the Soft Ivory hero.
     */
    setPageNavbarBackground(
      "#FFFDF8"
    );

    updateBackground();

    window.addEventListener(
      "scroll",
      scheduleUpdate,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "resize",
      scheduleUpdate
    );

    return () => {
      window.removeEventListener(
        "scroll",
        scheduleUpdate
      );

      window.removeEventListener(
        "resize",
        scheduleUpdate
      );

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(
          animationFrameId
        );
      }
    };
  }, [
    usesAutomaticSectionBackground,
    pathname,
  ]);

  /* =====================================================
     NAVBAR BACKGROUND
     ===================================================== */

  const routeNavbarBackground =
    isTeacherProfile
      ? "#FFFDF8"
      : isTeachersDirectory
        ? "#EEF2EA"
        : "#F3EDDD";

  const navbarBackground =
    isHomePage
      ? homepageNavbarBackground
      : usesAutomaticSectionBackground
        ? pageNavbarBackground
        : routeNavbarBackground;

  /* =====================================================
     NAVIGATION
     ===================================================== */

  const navLinks = [
    {
      href: `/${locale}`,
      label: "Home",
      active: isHomePage,
    },
    {
      href: `/${locale}/how-it-works`,
      label: t.nav.approach,
      active: isApproachPage,
    },
    {
      href: `/${locale}/lessons`,
      label: t.nav.lessons,
      active: isLessonsPage,
    },
    {
      href: `/${locale}/teachers`,
      label: t.nav.teachers,
      active: isTeachersPage,
    },
    {
      href: `/${locale}/policy`,
      label: t.nav.policy,
      active: isPolicyPage,
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
        /^\/(en|ko|zh|ja)(?=\/|$)/,
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
      ref={headerRef}
      style={{
        backgroundColor:
          navbarBackground,
      }}
      className="
        sticky
        top-0
        z-50
        transition-colors
        duration-300
      "
    >
      <div
        className="
          relative
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
            BRAND
            ===================================================== */}

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

        {/* =====================================================
            DESKTOP PRIMARY NAVIGATION
            ===================================================== */}

        <nav
          className="
            absolute
            left-1/2
            hidden
            -translate-x-1/2
            items-center
            gap-6
            md:flex
            lg:gap-8
            xl:gap-9
          "
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={
                link.active
                  ? "page"
                  : undefined
              }
              className={`
                relative
                whitespace-nowrap
                text-[15px]
                font-semibold
                transition-colors
                duration-300

                after:absolute
                after:-bottom-1.5
                after:left-0
                after:h-px
                after:bg-[#718A73]
                after:transition-all
                after:duration-300

                ${
                  link.active
                    ? `
                      text-[#718A73]
                      after:w-full
                    `
                    : `
                      text-[#46564B]
                      after:w-0
                      hover:text-[#718A73]
                      hover:after:w-full
                    `
                }
              `}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* =====================================================
            DESKTOP UTILITIES
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
          {/* LANGUAGE */}

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setIsLanguageOpen(
                  (previous) =>
                    !previous
                )
              }
              aria-haspopup="true"
              aria-expanded={
                isLanguageOpen
              }
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

          {/* LOGIN */}

          <Link
            href={`/${locale}#login`}
            className="
              group
              flex
              items-center
              gap-2
              whitespace-nowrap
              text-[15px]
              font-medium
              text-[#293A30]
              transition-colors
              duration-300
              hover:text-[#718A73]
            "
          >
            <span
              className="
                relative

                after:absolute
                after:-bottom-1.5
                after:left-0
                after:h-px
                after:w-0
                after:bg-[#718A73]
                after:transition-all
                after:duration-300

                group-hover:after:w-full
              "
            >
              {t.nav.login}
            </span>

            <CircleUserRound
              size={20}
              strokeWidth={1.55}
              className="
                text-[#607568]
                transition-transform
                duration-300
                group-hover:scale-105
              "
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* =====================================================
            MOBILE MENU BUTTON
            ===================================================== */}

        <button
          type="button"
          onClick={() => {
            setIsMobileMenuOpen(
              (previous) =>
                !previous
            );

            setIsMobileLanguageOpen(
              false
            );
          }}
          aria-label="Toggle navigation"
          aria-expanded={
            isMobileMenuOpen
          }
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
          style={{
            backgroundColor:
              navbarBackground,
          }}
          className="
            px-6
            pb-6
            pt-2
            transition-colors
            duration-300
          "
        >
          <div className="flex flex-col">
            {/* NAVIGATION LINKS */}

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={
                  link.active
                    ? "page"
                    : undefined
                }
                onClick={() => {
                  setIsMobileMenuOpen(
                    false
                  );
                  setIsMobileLanguageOpen(
                    false
                  );
                }}
                className={`
                  border-b
                  border-[#E7DDD1]
                  py-4
                  text-lg
                  font-semibold
                  transition-colors
                  duration-300

                  ${
                    link.active
                      ? "text-[#718A73]"
                      : "text-[#46564B] hover:text-[#718A73]"
                  }
                `}
              >
                {link.label}
              </Link>
            ))}

            {/* MOBILE LANGUAGE */}

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
                      ? "max-h-56 pb-3"
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

            {/* MOBILE LOGIN */}

            <Link
              href={`/${locale}#login`}
              onClick={() => {
                setIsMobileMenuOpen(
                  false
                );
                setIsMobileLanguageOpen(
                  false
                );
              }}
              className="
                flex
                items-center
                gap-2.5
                py-4
                text-lg
                font-medium
                text-[#293A30]
                transition-colors
                duration-300
                hover:text-[#718A73]
              "
            >
              <CircleUserRound
                size={21}
                strokeWidth={1.6}
                aria-hidden="true"
              />

              <span>{t.nav.login}</span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}