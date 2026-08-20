"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQClientProps {
  locale: string;
  faq: {
    title: string;
    intro: string;
    questions: FAQItem[];
  };
}

export default function FAQClient({
  locale,
  faq,
}: FAQClientProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(
    null
  );

  const toggleQuestion = (index: number) => {
    setOpenIndex(
      openIndex === index ? null : index
    );
  };

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
              href="/en/faq"
              className={
                locale === "en"
                  ? "font-medium text-[#6F8F72]"
                  : "transition-colors hover:text-[#6F8F72]"
              }
            >
              EN
            </Link>

            <Link
              href="/ko/faq"
              className={
                locale === "ko"
                  ? "font-medium text-[#6F8F72]"
                  : "transition-colors hover:text-[#6F8F72]"
              }
            >
              한국어
            </Link>

            <Link
              href="/zh/faq"
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
          {faq.title}
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
          {faq.intro}
        </p>
      </section>

      {/* =====================================================
          FAQ
          ===================================================== */}

      <section
        className="
          mx-auto
          w-full
          max-w-[900px]
          px-6
          pb-20

          sm:px-8

          lg:pb-24
        "
      >
        <div
          className="
            divide-y
            divide-[#E7DDD1]
            border-y
            border-[#E7DDD1]
          "
        >
          {faq.questions.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={item.question}>
                <button
                  type="button"
                  onClick={() => toggleQuestion(index)}
                  aria-expanded={isOpen}
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-6
                    py-6
                    text-left

                    sm:py-7
                  "
                >
                  <span
                    className="
                      font-serif
                      text-[21px]
                      font-normal
                      leading-8
                      text-[#292929]

                      sm:text-[23px]
                    "
                  >
                    {item.question}
                  </span>

                  <span
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-[#D8CCBE]
                      text-[#6F8F72]
                    "
                  >
                    <Plus
                      size={17}
                      strokeWidth={1.5}
                      className={`
                        transition-transform
                        duration-300
                        ${isOpen ? "rotate-45" : ""}
                      `}
                    />
                  </span>
                </button>

                <div
                  className={`
                    grid
                    transition-all
                    duration-300
                    ease-in-out
                    ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }
                  `}
                >
                  <div className="overflow-hidden">
                    <p
                      className="
                        max-w-[760px]
                        pb-7
                        pr-12

                        font-sans
                        text-[15px]
                        leading-7
                        text-[#666]

                        sm:text-[16px]
                        sm:leading-8
                      "
                    >
                      {item.answer}
                    </p>
                  </div>
                </div>
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
          "
        >
          <p
            className="
              font-serif
              text-[21px]
              leading-8
              text-[#4A4A4A]

              sm:text-[24px]
              sm:leading-9
            "
          >
            If you still have a question, feel free to reach out.
          </p>
        </div>
      </section>
    </main>
  );
}