"use client";

import { useParams } from "next/navigation";

import type { Locale } from "../lib/i18n";

import en from "../messages/en";
import ko from "../messages/ko";
import zh from "../messages/zh";

const messages = {
  en,
  ko,
  zh,
};

export default function MeetYourCoach() {
  const params = useParams();

  const locale: Locale =
    params.locale === "ko" || params.locale === "zh"
      ? params.locale
      : "en";

  const t = messages[locale].meetYourCoach;

  return (
    <section
      id="coach"
      className="
        relative
        overflow-hidden
        bg-[#F8F8F5]
        py-20

        sm:py-24
        lg:py-32
      "
    >
      {/* Background Glow */}

      <div
        className="
          pointer-events-none
          absolute
          right-[-180px]
          top-20
          h-[320px]
          w-[320px]
          rounded-full
          bg-[#DCE9D8]
          opacity-40
          blur-3xl

          sm:h-[380px]
          sm:w-[380px]
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

        <div className="max-w-[820px]">
          <p
            className="
              text-[11px]
              font-medium
              uppercase
              tracking-[0.35em]
              text-[#6F8F72]

              sm:text-xs
            "
          >
            {t.brand}
          </p>

          <h2
            className="
              mt-5
              text-[44px]
              leading-[0.98]
              text-[#2B2B2B]
              [font-family:var(--font-cormorant)]

              sm:text-[54px]
              md:text-[64px]
              lg:text-[72px]
            "
          >
            {t.title}
          </h2>

          <p
            className="
              mt-5
              text-[28px]
              leading-tight
              text-[#6F8F72]
              [font-family:var(--font-cormorant)]

              sm:text-[34px]
              lg:text-[40px]
            "
          >
            {t.greeting}
          </p>
        </div>

        {/* =====================================================
            MAIN CONTENT
            ===================================================== */}

        <div
          className="
            mt-10
            grid
            gap-10

            sm:mt-12

            lg:mt-14
            lg:grid-cols-[0.72fr_1.28fr]
            lg:items-start
            lg:gap-20
          "
        >
          {/* ===================================================
              LEFT COLUMN
              VIDEO + QUALIFICATIONS
              =================================================== */}

          <div
            className="
              lg:sticky
              lg:top-28
            "
          >
            {/* Video */}

            <div
              className="
                relative
                mx-auto
                aspect-[4/5]
                w-full
                max-w-[420px]
                overflow-hidden
                rounded-[2.5rem]
                bg-[#EDEFE9]

                lg:mx-0
              "
            >
              <video
                className="
                  absolute
                  inset-0
                  h-full
                  w-full
                  object-cover
                "
                src="/videos/hamkke-introduction.mp4"
                controls
                playsInline
                preload="metadata"
              />
            </div>

            {/* Video Caption */}

            <div
              className="
                mt-5
                text-[10px]
                font-medium
                uppercase
                tracking-[0.25em]
                text-[#8A8A82]
              "
            >
              {t.brand}
            </div>

            {/* =================================================
                QUALIFICATIONS
                ================================================= */}

            <div
              className="
                mt-7
                border-t
                border-[#DDE3DA]
                pt-6
              "
            >
              <p
                className="
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.28em]
                  text-[#8A8A82]
                "
              >
                {t.qualifications}
              </p>

              <p
                className="
                  mt-3
                  text-[14px]
                  font-medium
                  text-[#2B2B2B]
                "
              >
                {t.teachingSince}
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <p
                    className="
                      text-[14px]
                      font-medium
                      leading-6
                      text-[#2B2B2B]
                    "
                  >
                    {t.certifications.advancedTesol.title}
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[12px]
                      leading-5
                      text-[#8A8A82]
                    "
                  >
                    {t.certifications.advancedTesol.organization}
                  </p>
                </div>

                <div>
                  <p
                    className="
                      text-[14px]
                      font-medium
                      leading-6
                      text-[#2B2B2B]
                    "
                  >
                    {t.certifications.youngLearners.title}
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[12px]
                      leading-5
                      text-[#8A8A82]
                    "
                  >
                    {t.certifications.youngLearners.organization}
                  </p>
                </div>

                <div>
                  <p
                    className="
                      text-[14px]
                      font-medium
                      leading-6
                      text-[#2B2B2B]
                    "
                  >
                    {t.certifications.tefl.title}
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[12px]
                      leading-5
                      text-[#8A8A82]
                    "
                  >
                    {t.certifications.tefl.organization}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================
              RIGHT COLUMN
              STORY
              =================================================== */}

          <div
            className="
              max-w-[720px]
              [font-family:var(--font-lora)]
            "
          >
            {/* Paragraph One */}

            <p
              className="
                text-[16px]
                leading-7
                text-[#4F4F4F]

                sm:text-[17px]
                sm:leading-8
              "
            >
              {t.story.paragraphOne}
            </p>

            {/* Paragraph Two */}

            <p
              className="
                mt-5
                text-[16px]
                leading-7
                text-[#4F4F4F]

                sm:mt-6
                sm:text-[17px]
                sm:leading-8
              "
            >
              {t.story.paragraphTwo}
            </p>

            {/* =================================================
                REALIZATION
                ================================================= */}

            <div
              className="
                my-7
                max-w-[650px]

                sm:my-8
              "
            >
              <p
                className="
                  text-[16px]
                  leading-7
                  text-[#4F4F4F]

                  sm:text-[17px]
                  sm:leading-8
                "
              >
                {t.story.realization}
              </p>

              <p
                className="
                  mt-3
                  text-[20px]
                  leading-[1.3]
                  text-[#6F8F72]
                  [font-family:var(--font-cormorant)]

                  sm:text-[22px]
                "
              >
                {t.story.realizationHighlight}
              </p>
            </div>

            {/* Paragraph Four */}

            <p
              className="
                text-[16px]
                leading-7
                text-[#4F4F4F]

                sm:text-[17px]
                sm:leading-8
              "
            >
              {t.story.paragraphFour}
            </p>

            {/* Paragraph Five */}

            <p
              className="
                mt-5
                text-[16px]
                leading-7
                text-[#4F4F4F]

                sm:mt-6
                sm:text-[17px]
                sm:leading-8
              "
            >
              {t.story.paragraphFive}
            </p>

            {/* Paragraph Six */}

            <p
              className="
                mt-7
                text-[16px]
                font-medium
                leading-7
                text-[#2B2B2B]

                sm:mt-8
                sm:text-[17px]
                sm:leading-8
              "
            >
              {t.story.paragraphSix}
            </p>

            {/* Paragraph Seven */}

            <p
              className="
                mt-4
                text-[16px]
                leading-7
                text-[#4F4F4F]

                sm:text-[17px]
                sm:leading-8
              "
            >
              {t.story.paragraphSeven}
            </p>

            {/* Paragraph Eight */}

            <p
              className="
                mt-5
                max-w-[680px]
                text-[16px]
                leading-7
                text-[#4F4F4F]

                sm:mt-6
                sm:text-[17px]
                sm:leading-8
              "
            >
              {t.story.paragraphEight}
            </p>

            {/* =================================================
                CLOSING
                ================================================= */}

            <div className="mt-7 sm:mt-9">
              <p
                className="
                  max-w-[620px]
                  text-[23px]
                  leading-[1.3]
                  italic
                  text-[#6F8F72]
                  [font-family:var(--font-cormorant)]

                  sm:text-[27px]
                  sm:leading-[1.35]
                "
              >
                {t.story.closing}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}