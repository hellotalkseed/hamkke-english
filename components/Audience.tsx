"use client";

import Image from "next/image";

import {
  MessageCircle,
  Briefcase,
  Mic,
  Plane,
  Users,
} from "lucide-react";

import StaggerContainer from "./animations/StaggerContainer";
import StaggerItem from "./animations/StaggerItem";

import { getMessages } from "../lib/getMessages";
import type { Locale } from "../lib/i18n";

interface AudienceProps {
  locale: Locale;
}

export default function Audience({
  locale,
}: AudienceProps) {
  const t = getMessages(locale);

  const goals = [
    {
      title: t.audience.goals.everyday.title,
      icon: MessageCircle,
      text: t.audience.goals.everyday.text,
    },
    {
      title: t.audience.goals.work.title,
      icon: Briefcase,
      text: t.audience.goals.work.text,
    },
    {
      title: t.audience.goals.interview.title,
      icon: Mic,
      text: t.audience.goals.interview.text,
    },
    {
      title: t.audience.goals.travel.title,
      icon: Plane,
      text: t.audience.goals.travel.text,
    },
    {
      title: t.audience.goals.conversation.title,
      icon: Users,
      text: t.audience.goals.conversation.text,
    },
  ];

  return (
    <section
      id="goals"
      className="
        relative
        overflow-hidden
        bg-[#FAF8F5]

        py-20
        sm:py-24
        lg:py-32
      "
    >
      {/* =====================================================
          GOALS BACKGROUND

          The section is taller than the source artwork.

          Two coordinated image layers preserve both:
          - upper-left / upper-right details
          - lower-left / lower-right details

          The middle card area is softened so the cards remain
          the main visual focus.
          ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-0
          overflow-hidden
        "
        aria-hidden="true"
      >
        {/* =====================================================
            TOP IMAGE ZONE

            Preserves the map, travel imagery, books, foliage,
            and other details from the top of the source image.
            ===================================================== */}

        <div
          className="
            absolute
            inset-x-0
            top-0

            h-[58%]

            overflow-hidden
          "
        >
          <Image
            src="/hamkke-goals-background.png"
            alt=""
            fill
            priority={false}
            sizes="100vw"
            className="
              object-cover
              object-top

              opacity-[0.86]

              sm:opacity-[0.89]
              lg:opacity-[0.92]
            "
          />

          {/* Blend top artwork gently into the card area */}

          <div
            className="
              absolute
              inset-x-0
              bottom-0

              h-[42%]

              bg-gradient-to-b
              from-transparent
              via-[#FAF8F5]/46
              to-[#FAF8F5]
            "
          />
        </div>

        {/* =====================================================
            BOTTOM IMAGE ZONE

            Preserves the notebook, passport, pen, travel card,
            and lower decorative details.
            ===================================================== */}

        <div
          className="
            absolute
            inset-x-0
            bottom-0

            h-[58%]

            overflow-hidden
          "
        >
          <Image
            src="/hamkke-goals-background.png"
            alt=""
            fill
            priority={false}
            sizes="100vw"
            className="
              object-cover
              object-bottom

              opacity-[0.86]

              sm:opacity-[0.89]
              lg:opacity-[0.92]
            "
          />

          {/* Blend lower artwork upward into the card area */}

          <div
            className="
              absolute
              inset-x-0
              top-0

              h-[42%]

              bg-gradient-to-t
              from-transparent
              via-[#FAF8F5]/46
              to-[#FAF8F5]
            "
          />
        </div>

        {/* =====================================================
            CARD AREA WASH

            Strongest specifically through the middle of the
            section where the five cards appear.
            ===================================================== */}

        <div
          className="
            absolute
            inset-x-0

            top-[27%]
            bottom-[26%]

            bg-[linear-gradient(to_bottom,rgba(250,248,245,0)_0%,rgba(250,248,245,0.42)_10%,rgba(250,248,245,0.76)_28%,rgba(250,248,245,0.84)_48%,rgba(250,248,245,0.84)_60%,rgba(250,248,245,0.74)_76%,rgba(250,248,245,0.38)_90%,rgba(250,248,245,0)_100%)]
          "
        />

        {/* =====================================================
            CENTER FOCUS WASH

            Adds extra quiet directly behind the cards without
            bleaching the outer artwork.
            ===================================================== */}

        <div
          className="
            absolute

            left-[5%]
            right-[5%]

            top-[31%]
            bottom-[30%]

            bg-[radial-gradient(ellipse_at_center,rgba(250,248,245,0.72)_0%,rgba(250,248,245,0.56)_46%,rgba(250,248,245,0.20)_72%,rgba(250,248,245,0)_100%)]
          "
        />

        {/* =====================================================
            MOBILE SOFTENING
            ===================================================== */}

        <div
          className="
            absolute
            inset-0

            bg-[#FAF8F5]/08

            md:hidden
          "
        />
      </div>

      {/* =====================================================
          CONTENT
          ===================================================== */}

      <div
        className="
          relative
          z-10

          mx-auto
          max-w-7xl
          px-6

          md:px-8
          lg:px-10
        "
      >
        {/* =====================================================
            HEADING
            ===================================================== */}

        <p
          className="
            text-xs
            uppercase
            tracking-[0.35em]
            text-[#6F8F72]
          "
        >
          {t.audience.brand}
        </p>

        <h2
          className="
            mt-5
            max-w-[760px]

            text-[42px]
            leading-[0.98]
            text-[#2B2B2B]

            [font-family:var(--font-cormorant)]

            sm:text-[52px]
            md:text-[60px]
            lg:text-[68px]
          "
        >
          {t.audience.title}
        </h2>

        {/* =====================================================
            DESCRIPTION
            ===================================================== */}

        <p
          className="
            mt-6
            max-w-[680px]

            text-[17px]
            leading-8
            text-[#5B5B5B]

            sm:mt-7
            sm:text-lg
            sm:leading-9
          "
        >
          {t.audience.description}
        </p>

        {/* =====================================================
            GOAL CARDS
            ===================================================== */}

        <StaggerContainer
          className="
            mt-12
            grid
            gap-5

            sm:gap-6

            md:grid-cols-2

            lg:mt-16
            lg:grid-cols-6
            lg:gap-7
          "
        >
          {goals.map((item, index) => {
            const Icon = item.icon;

            return (
              <StaggerItem
                key={item.title}
                className={`
                  lg:col-span-2

                  ${
                    index === 3
                      ? "lg:col-start-2"
                      : ""
                  }

                  ${
                    index === 4
                      ? "lg:col-start-4"
                      : ""
                  }
                `}
              >
                <div
                  className="
                    group
                    h-full

                    rounded-[2rem]

                    border
                    border-[#E8E8E4]

                    bg-[#FCFBF9]/94

                    p-7

                    shadow-[0_10px_30px_rgba(0,0,0,0.035)]

                    backdrop-blur-[2px]

                    transition-all
                    duration-500

                    hover:-translate-y-1
                    hover:border-[#DCE7DC]
                    hover:bg-[#FCFBF9]/97
                    hover:shadow-[0_18px_45px_rgba(0,0,0,0.07)]

                    sm:p-8
                    lg:p-9
                  "
                >
                  {/* =================================================
                      ICON + TITLE
                      ================================================= */}

                  <div
                    className="
                      flex
                      items-start
                      gap-4
                    "
                  >
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center

                        rounded-full

                        bg-[#EEF5EE]

                        transition-transform
                        duration-500

                        group-hover:scale-105
                      "
                    >
                      <Icon
                        className="
                          h-5
                          w-5
                          text-[#6F8F72]
                        "
                        strokeWidth={1.7}
                      />
                    </div>

                    <h3
                      className="
                        max-w-[340px]
                        pt-1

                        text-[23px]
                        leading-[1.08]
                        text-[#2B2B2B]

                        [font-family:var(--font-cormorant)]

                        sm:text-[26px]
                      "
                    >
                      {item.title}
                    </h3>
                  </div>

                  {/* =================================================
                      DESCRIPTION
                      ================================================= */}

                  <p
                    className="
                      mt-6

                      text-[15px]
                      leading-7
                      text-[#5B5B5B]

                      sm:text-[16px]
                      sm:leading-8
                    "
                  >
                    {item.text}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* =====================================================
            CLOSING STATEMENT
            ===================================================== */}

        <div
          className="
            mt-20
            max-w-[760px]

            sm:mt-24
            lg:mt-28
          "
        >
          <p
            className="
              text-[29px]
              leading-[1.12]
              text-[#2B2B2B]

              [font-family:var(--font-cormorant)]

              sm:text-[34px]
              lg:text-[40px]
            "
          >
            {t.audience.closing.lineOne}
          </p>

          <p
            className="
              mt-2

              text-[29px]
              leading-[1.12]
              italic
              text-[#6F8F72]

              [font-family:var(--font-cormorant)]

              sm:text-[34px]
              lg:text-[40px]
            "
          >
            {t.audience.closing.lineTwo}
          </p>
        </div>
      </div>
    </section>
  );
}