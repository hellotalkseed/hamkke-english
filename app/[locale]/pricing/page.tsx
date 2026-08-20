import { notFound } from "next/navigation";
import {
  ArrowRight,
  Check,
  MessageCircle,
  Target,
} from "lucide-react";

import { getMessages } from "../../../lib/getMessages";
import { isValidLocale } from "../../../lib/i18n";

interface PricingPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function PricingPage({
  params,
}: PricingPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const t = getMessages(locale);
  const pricing = t.pricing;

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

          <a
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
          </a>

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
            <a
              href="/en/pricing"
              className={
                locale === "en"
                  ? "font-medium text-[#6F8F72]"
                  : "transition-colors hover:text-[#6F8F72]"
              }
            >
              EN
            </a>

            <a
              href="/ko/pricing"
              className={
                locale === "ko"
                  ? "font-medium text-[#6F8F72]"
                  : "transition-colors hover:text-[#6F8F72]"
              }
            >
              한국어
            </a>

            <a
              href="/zh/pricing"
              className={
                locale === "zh"
                  ? "font-medium text-[#6F8F72]"
                  : "transition-colors hover:text-[#6F8F72]"
              }
            >
              中文
            </a>
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
          {pricing.title}
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
          {pricing.intro}
        </p>
      </section>

      {/* =====================================================
          MAIN CONTENT
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
        {/* ===================================================
            MAIN PRICE CARD
            =================================================== */}

        <div
          className="
            overflow-hidden
            rounded-[28px]
            border
            border-[#E7DDD1]
            bg-[#F0F4ED]
          "
        >
          <div
            className="
              px-7
              py-9

              sm:px-10
              sm:py-11

              lg:px-12
              lg:py-12
            "
          >
            <div
              className="
                flex
                flex-col
                gap-8

                md:flex-row
                md:items-end
                md:justify-between
              "
            >
              {/* PRICE */}

              <div>
                <p
                  className="
                    font-sans
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.18em]
                    text-[#6F8F72]
                  "
                >
                  {pricing.privateLessons.title}
                </p>

                <div
                  className="
                    mt-4
                    flex
                    items-baseline
                    gap-3
                  "
                >
                  <span
                    className="
                      font-serif
                      text-[58px]
                      font-normal
                      leading-none
                      tracking-[-0.035em]
                      text-[#292929]

                      sm:text-[68px]

                      lg:text-[76px]
                    "
                  >
                    {pricing.privateLessons.price}
                  </span>
                </div>

                <p
                  className="
                    mt-4
                    font-sans
                    text-[15px]
                    text-[#666]
                  "
                >
                  {pricing.privateLessons.package}
                </p>
              </div>

              {/* DESCRIPTION */}

              <div
                className="
                  max-w-[390px]
                  border-l
                  border-[#D6DED2]
                  pl-5

                  sm:pl-6
                "
              >
                <p
                  className="
                    font-serif
                    text-[18px]
                    leading-7
                    text-[#4A4A4A]

                    sm:text-[19px]
                    sm:leading-8
                  "
                >
                  {pricing.privateLessons.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            GENERAL / SPECIALIZED
            =================================================== */}

        <div
          className="
            mt-16

            sm:mt-20

            lg:mt-24
          "
        >
          {/* SECTION INTRO */}

          <div className="max-w-[720px]">
            <p
              className="
                font-sans
                text-[11px]
                font-medium
                uppercase
                tracking-[0.2em]
                text-[#6F8F72]
              "
            >
              {pricing.waysToLearn.title}
            </p>

            <h2
              className="
                mt-4
                font-serif
                text-[42px]
                font-normal
                leading-tight
                tracking-[-0.025em]

                sm:text-[50px]

                lg:text-[56px]
              "
            >
              {pricing.waysToLearn.subtitle}
            </h2>

            <p
              className="
                mt-5
                max-w-[680px]
                font-serif
                text-[19px]
                leading-8
                text-[#4A4A4A]

                sm:text-[21px]
                sm:leading-9
              "
            >
              {pricing.waysToLearn.description}
            </p>
          </div>

          {/* CARDS */}

          <div
            className="
              mt-12
              grid
              gap-6

              md:grid-cols-2
            "
          >
            {/* =================================================
                GENERAL ENGLISH
                ================================================= */}

            <div
              className="
                rounded-[24px]
                border
                border-[#E7DDD1]
                bg-white/40
                p-7

                sm:p-9
              "
            >
              {/* ICON + LABEL */}

              <div
                className="
                  flex
                  items-center
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
                    bg-[#E2EBDD]
                    text-[#6F8F72]
                  "
                >
                  <MessageCircle
                    size={21}
                    strokeWidth={1.5}
                  />
                </div>

                <p
                  className="
                    font-sans
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.18em]
                    text-[#6F8F72]
                  "
                >
                  {pricing.waysToLearn.general.title}
                </p>
              </div>

              {/* TITLE */}

              <h3
                className="
                  mt-7
                  font-serif
                  text-[34px]
                  font-normal
                  leading-tight
                  tracking-[-0.02em]
                "
              >
                {pricing.waysToLearn.general.subtitle}
              </h3>

              {/* DESCRIPTION */}

              <p
                className="
                  mt-4
                  font-serif
                  text-[17px]
                  leading-7
                  text-[#666]
                "
              >
                {pricing.waysToLearn.general.description}
              </p>

              {/* FEATURES */}

              <ul className="mt-7 space-y-3.5">
                {pricing.waysToLearn.general.points.map(
                  (item: string) => (
                    <li
                      key={item}
                      className="
                        flex
                        items-start
                        gap-3

                        font-sans
                        text-[14px]
                        leading-6
                        text-[#555]
                      "
                    >
                      <Check
                        size={16}
                        strokeWidth={1.7}
                        className="
                          mt-1
                          shrink-0
                          text-[#6F8F72]
                        "
                      />

                      <span>{item}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* =================================================
                SPECIALIZED ENGLISH
                ================================================= */}

            <div
              className="
                rounded-[24px]
                border
                border-[#E7DDD1]
                bg-[#F0F4ED]
                p-7

                sm:p-9
              "
            >
              {/* ICON + LABEL */}

              <div
                className="
                  flex
                  items-center
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
                    bg-[#E2EBDD]
                    text-[#6F8F72]
                  "
                >
                  <Target
                    size={21}
                    strokeWidth={1.5}
                  />
                </div>

                <p
                  className="
                    font-sans
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.18em]
                    text-[#6F8F72]
                  "
                >
                  {pricing.waysToLearn.specialized.title}
                </p>
              </div>

              {/* TITLE */}

              <h3
                className="
                  mt-7
                  font-serif
                  text-[34px]
                  font-normal
                  leading-tight
                  tracking-[-0.02em]
                "
              >
                {pricing.waysToLearn.specialized.subtitle}
              </h3>

              {/* DESCRIPTION */}

              <p
                className="
                  mt-4
                  font-serif
                  text-[17px]
                  leading-7
                  text-[#666]
                "
              >
                {pricing.waysToLearn.specialized.description}
              </p>

              {/* FEATURES */}

              <ul className="mt-7 space-y-3.5">
                {pricing.waysToLearn.specialized.points.map(
                  (item: string) => (
                    <li
                      key={item}
                      className="
                        flex
                        items-start
                        gap-3

                        font-sans
                        text-[14px]
                        leading-6
                        text-[#555]
                      "
                    >
                      <Check
                        size={16}
                        strokeWidth={1.7}
                        className="
                          mt-1
                          shrink-0
                          text-[#6F8F72]
                        "
                      />

                      <span>{item}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* ===================================================
            LESSON EXPERIENCE
            =================================================== */}

        <div
          className="
            mt-20
            border-t
            border-[#E7DDD1]
            pt-16

            sm:mt-24
            sm:pt-20

            lg:mt-28
          "
        >
          <div className="max-w-[720px]">
            <p
              className="
                font-sans
                text-[11px]
                font-medium
                uppercase
                tracking-[0.2em]
                text-[#6F8F72]
              "
            >
              {pricing.lessonFlow.title}
            </p>

            <h2
              className="
                mt-4
                font-serif
                text-[42px]
                font-normal
                leading-tight
                tracking-[-0.025em]

                sm:text-[50px]

                lg:text-[56px]
              "
            >
              {pricing.lessonFlow.intro}
            </h2>

            <p
              className="
                mt-5
                font-serif
                text-[19px]
                leading-8
                text-[#4A4A4A]

                sm:text-[21px]
                sm:leading-9
              "
            >
              {pricing.lessonFlow.introHighlight}
            </p>
          </div>

          {/* LESSON PROCESS */}

          <div
            className="
              mt-12
              grid
              gap-x-10
              gap-y-12

              sm:grid-cols-2

              lg:grid-cols-4
            "
          >
            {Object.values(
              pricing.lessonFlow.steps
            ).map((item) => (
              <div key={item.number}>
                <span
                  className="
                    font-sans
                    text-[13px]
                    font-medium
                    tracking-[0.15em]
                    text-[#6F8F72]
                  "
                >
                  {item.number}
                </span>

                <h3
                  className="
                    mt-3
                    font-serif
                    text-[28px]
                    font-normal
                  "
                >
                  {item.title}
                </h3>

                <p
                  className="
                    mt-3
                    font-sans
                    text-[14px]
                    leading-7
                    text-[#666]
                  "
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ===================================================
            PRACTICAL DETAILS
            =================================================== */}

        <div
          className="
            mt-20
            border-t
            border-[#E7DDD1]
            pt-16

            sm:mt-24
            sm:pt-20
          "
        >
          <div className="max-w-[720px]">
            <p
              className="
                font-sans
                text-[11px]
                font-medium
                uppercase
                tracking-[0.2em]
                text-[#6F8F72]
              "
            >
              {pricing.practical.title}
            </p>

            <h2
              className="
                mt-4
                font-serif
                text-[42px]
                font-normal
                leading-tight
                tracking-[-0.025em]

                sm:text-[50px]
              "
            >
              {pricing.practical.intro}
            </h2>
          </div>

          {/* DETAILS */}

          <div
            className="
              mt-10
              divide-y
              divide-[#E7DDD1]
              border-y
              border-[#E7DDD1]
            "
          >
            {[
              pricing.practical.details.lessonLength,
              pricing.practical.details.package,
              pricing.practical.details.format,
              pricing.practical.details.tuition,
            ].map((item) => (
              <div
                key={item.label}
                className="
                  flex
                  flex-col
                  gap-2
                  py-5

                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <span
                  className="
                    font-sans
                    text-[14px]
                    font-medium
                    text-[#555]
                  "
                >
                  {item.label}
                </span>

                <span
                  className="
                    font-sans
                    text-[14px]
                    text-[#777]

                    sm:text-right
                  "
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* POLICY */}

          <div className="mt-7">
            <a
              href={`/${locale}/policy`}
              className="
                group
                inline-flex
                items-center
                gap-2

                font-sans
                text-[14px]
                font-medium
                text-[#6F8F72]

                transition-colors
                duration-200

                hover:text-[#5B7960]
              "
            >
              {pricing.practical.policy}

              <ArrowRight
                size={16}
                className="
                  transition-transform
                  duration-200
                  group-hover:translate-x-1
                "
              />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}