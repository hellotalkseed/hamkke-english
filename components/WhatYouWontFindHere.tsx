"use client";

import StaggerContainer from "./animations/StaggerContainer";
import StaggerItem from "./animations/StaggerItem";

import { getMessages } from "../lib/getMessages";
import type { Locale } from "../lib/i18n";

interface WhatYouWontFindHereProps {
  locale: Locale;
}

export default function WhatYouWontFindHere({
  locale,
}: WhatYouWontFindHereProps) {
  const t = getMessages(locale);

  const points = [
    {
      title: t.whatYouWontFindHere.points.memorizedScripts.title,
      text: t.whatYouWontFindHere.points.memorizedScripts.text,
    },
    {
      title: t.whatYouWontFindHere.points.pressure.title,
      text: t.whatYouWontFindHere.points.pressure.text,
    },
    {
      title: t.whatYouWontFindHere.points.oneSizeFitsAll.title,
      text: t.whatYouWontFindHere.points.oneSizeFitsAll.text,
    },
    {
      title: t.whatYouWontFindHere.points.constantCorrection.title,
      text: t.whatYouWontFindHere.points.constantCorrection.text,
    },
  ];

  return (
    <section
      id="what-you-wont-find"
      className="
        relative
        overflow-hidden
        bg-white
        py-20
        sm:py-24
        lg:py-32
      "
    >
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
        {/* Heading */}

        <div className="max-w-3xl">
          <p
            className="
              mb-3
              text-[12px]
              font-medium
              uppercase
              tracking-[0.35em]
              text-[#6F8F72]
            "
          >
            {t.whatYouWontFindHere.brand}
          </p>

          <h2
            className="
              text-[42px]
              leading-[0.98]
              text-[#2B2B2B]
              [font-family:var(--font-cormorant)]

              sm:text-[52px]
              md:text-[60px]
              lg:text-[78px]
            "
          >
            {t.whatYouWontFindHere.title}
          </h2>
        </div>

        {/* Points */}

        <StaggerContainer
          className="
            mt-10
            grid
            gap-x-12
            gap-y-12

            sm:mt-12
            sm:gap-y-14

            lg:mt-14
            lg:grid-cols-2
            lg:gap-x-20
            lg:gap-y-16
          "
        >
          {points.map((point) => (
            <StaggerItem key={point.title}>
              <div
                className="
                  border-t
                  border-[#DDE4DA]
                  pt-6

                  sm:pt-7
                "
              >
                <h3
                  className="
                    text-[27px]
                    leading-[1.08]
                    text-[#2B2B2B]
                    [font-family:var(--font-cormorant)]

                    sm:text-[32px]
                    lg:text-[38px]
                  "
                >
                  {point.title}
                </h3>

                <p
                  className="
                    mt-4
                    max-w-[480px]
                    text-[15px]
                    leading-7
                    text-[#5B5B5B]

                    sm:text-[16px]
                    sm:leading-8
                  "
                >
                  {point.text}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}