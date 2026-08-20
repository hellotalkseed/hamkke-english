import { notFound } from "next/navigation";
import {
  ArrowDown,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

import { getMessages } from "../../../lib/getMessages";
import { isValidLocale } from "../../../lib/i18n";

interface HowItWorksPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function HowItWorksPage({
  params,
}: HowItWorksPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const t = getMessages(locale);
  const howItWorks = t.howItWorks;

  const steps = Object.values(howItWorks.steps);

  return (
    <main
      className="
        min-h-screen
        bg-[#FAF8F5]
        text-[#292929]
      "
    >
      {/* =====================================================
          HEADER
          ===================================================== */}

      <header
        className="
          w-full
          px-6
          pt-7

          sm:px-8
          sm:pt-8

          lg:px-10

          xl:px-12
        "
      >
        <div
          className="
            relative
            flex
            w-full
            items-center
            justify-between
          "
        >
          {/* BACK TO HAMKKE */}

          <Link
            href={`/${locale}`}
            className="
              shrink-0
              font-sans
              text-[15px]
              text-[#5F655F]
              transition-colors
              duration-200
              hover:text-[#6F8F72]

              sm:text-[16px]
            "
          >
            ← Hamkke
          </Link>

          {/* DESKTOP BRAND */}

          <div
            className="
              absolute
              left-1/2
              -translate-x-1/2
              whitespace-nowrap

              hidden

              font-sans
              text-[15px]
              font-medium
              text-[#6F8F72]

              sm:block
              sm:text-[16px]
            "
          >
            Hamkke │ 함께
          </div>

          {/* LANGUAGE SELECTOR */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-3

              font-sans
              text-[14px]
              text-[#5F655F]

              sm:gap-4
              sm:text-[15px]
            "
          >
            <Link
              href="/en/how-it-works"
              className={
                locale === "en"
                  ? "font-medium text-[#6F8F72]"
                  : "transition-colors hover:text-[#6F8F72]"
              }
            >
              EN
            </Link>

            <Link
              href="/ko/how-it-works"
              className={
                locale === "ko"
                  ? "font-medium text-[#6F8F72]"
                  : "transition-colors hover:text-[#6F8F72]"
              }
            >
              한국어
            </Link>

            <Link
              href="/zh/how-it-works"
              className={
                locale === "zh"
                  ? "font-medium text-[#6F8F72]"
                  : "transition-colors hover:text-[#6F8F72]"
              }
            >
              中文
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          INTRO
          ===================================================== */}

      <section
        className="
          mx-auto
          w-full
          max-w-[1040px]
          px-6
          pb-12
          pt-10

          sm:px-8
          sm:pb-14
          sm:pt-20

          lg:px-10
          lg:pb-16
          lg:pt-24
        "
      >
        {/* MOBILE BRAND */}

        <div
          className="
            mb-0
            text-center

            font-sans
            text-[14px]
            font-medium
            tracking-[0.02em]
            text-[#6F8F72]

            sm:hidden
          "
        >
          Hamkke │ 함께
        </div>

        {/* PAGE TITLE */}

        <h1
          className="
            text-center

            font-serif
            text-[52px]
            font-normal
            leading-[1.05]
            tracking-[-0.035em]

            text-[#292929]

            sm:text-[62px]

            lg:text-[70px]
          "
        >
          {howItWorks.title}
        </h1>

        {/* INTRO */}

        <p
          className="
            mx-auto
            mt-8
            max-w-[850px]

            text-center

            font-serif
            text-[21px]
            font-normal
            leading-8

            text-[#4A4A4A]

            sm:text-[23px]
            sm:leading-9

            lg:text-[25px]
            lg:leading-10
          "
        >
          {howItWorks.intro}
        </p>
      </section>

      {/* =====================================================
          FLOW
          ===================================================== */}

      <section
        className="
          mx-auto
          w-full
          max-w-[1040px]
          px-6
          pb-20

          sm:px-8

          lg:px-10
          lg:pb-24
        "
      >
        <div
          className="
            mx-auto
            max-w-[820px]
          "
        >
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;

            return (
              <div key={step.number}>
                {/* STEP */}

                <div
                  className={`
                    relative
                    rounded-[24px]
                    border
                    border-[#E7DDD1]
                    px-7
                    py-8

                    sm:px-9
                    sm:py-9

                    ${
                      isLast
                        ? "bg-[#F0F4ED]"
                        : "bg-white/40"
                    }
                  `}
                >
                  <div
                    className="
                      flex
                      flex-col
                      gap-5

                      sm:flex-row
                      sm:gap-8
                    "
                  >
                    {/* NUMBER */}

                    <div
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-[#E2EBDD]
                        font-sans
                        text-[12px]
                        font-medium
                        tracking-[0.08em]
                        text-[#6F8F72]
                      "
                    >
                      {step.number}
                    </div>

                    {/* CONTENT */}

                    <div className="max-w-[650px]">
                      <h2
                        className="
                          font-serif
                          text-[32px]
                          font-normal
                          leading-tight
                          tracking-[-0.02em]

                          sm:text-[36px]
                        "
                      >
                        {step.title}
                      </h2>

                      <p
                        className="
                          mt-3
                          font-sans
                          text-[15px]
                          leading-7
                          text-[#666]

                          sm:text-[16px]
                          sm:leading-8
                        "
                      >
                        {step.text}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CONNECTOR */}

                {!isLast && (
                  <div
                    className="
                      flex
                      h-14
                      items-center
                      justify-center
                    "
                  >
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        bg-[#E2EBDD]
                        text-[#6F8F72]
                      "
                    >
                      <ArrowDown
                        size={17}
                        strokeWidth={1.5}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ===================================================
            CLOSING
            =================================================== */}

        <div
          className="
            mt-20
            border-t
            border-[#E7DDD1]
            pt-16
            text-center

            sm:mt-24
            sm:pt-20

            lg:mt-28
          "
        >
          <h2
            className="
              font-serif
              text-[38px]
              font-normal
              leading-tight
              tracking-[-0.025em]

              sm:text-[46px]

              lg:text-[52px]
            "
          >
            {howItWorks.closing.title}
          </h2>

          <p
            className="
              mx-auto
              mt-6
              max-w-[720px]

              font-serif
              text-[20px]
              leading-8
              text-[#4A4A4A]

              sm:text-[23px]
              sm:leading-9
            "
          >
            {howItWorks.closing.text}
          </p>
        </div>
      </section>
    </main>
  );
}