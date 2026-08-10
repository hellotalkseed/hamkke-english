"use client";

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
        bg-white
        py-20
        sm:py-24
        lg:py-32
      "
    >
      {/* =====================================================
          DECORATIVE BACKGROUND
          ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-[-180px]
          top-24
          h-[320px]
          w-[320px]
          rounded-full
          bg-[#EEF5EE]
          opacity-50
          blur-3xl

          sm:h-[380px]
          sm:w-[380px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          right-[-180px]
          bottom-20
          h-[300px]
          w-[300px]
          rounded-full
          bg-[#F8EDE5]
          opacity-30
          blur-3xl
        "
      />

      <div
        className="
          relative
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

        {/* Brand */}

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

        {/* Title */}

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
                    bg-[#FCFBF9]
                    p-7
                    shadow-[0_10px_30px_rgba(0,0,0,0.035)]
                    transition-all
                    duration-500

                    hover:-translate-y-1
                    hover:border-[#DCE7DC]
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
                    {/* Icon */}

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

                    {/* Title */}

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