"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import InquiryModal from "./InquiryModal";
import type { Locale } from "../lib/i18n";

export default function CTA() {
  const params = useParams();

  const locale: Locale =
    params.locale === "ko" || params.locale === "zh"
      ? params.locale
      : "en";

  const [isInquiryOpen, setIsInquiryOpen] =
    useState(false);

  const translations = {
    en: {
      title: "Start with a conversation.",
      description:
        "Tell me a little about where you are with English and what you'd like to be able to do. We'll take it from there.",
      button: "Start a Conversation",
    },

    ko: {
      title: "대화부터 시작해 보세요.",
      description:
        "현재 영어를 어떻게 사용하고 있는지, 그리고 영어로 무엇을 할 수 있기를 원하는지 간단하게 알려주세요. 그다음 이야기를 함께 시작해 보겠습니다.",
      button: "대화 시작하기",
    },

    zh: {
      title: "从一次交流开始。",
      description:
        "告诉我一些你目前的英语情况，以及你希望能够做到什么。接下来，我们就从这里开始。",
      button: "开始交流",
    },
  };

  const t = translations[locale];

  return (
    <>
      <section
        id="contact"
        className="
          bg-[#6F8F72]
          py-20
          sm:py-24
          lg:py-32
        "
      >
        <div
          className="
            mx-auto
            max-w-5xl
            px-6
            text-center
            md:px-8
          "
        >
          {/* Heading */}

          <h2
            className="
              text-[40px]
              leading-[1.05]
              text-white
              [font-family:var(--font-cormorant)]

              sm:text-[52px]
              lg:text-[64px]
            "
          >
            {t.title}
          </h2>

          {/* Description */}

          <p
            className="
              mx-auto
              mt-8
              max-w-2xl
              text-[17px]
              leading-8
              text-[#F5F5F0]

              sm:text-lg
              sm:leading-9
            "
          >
            {t.description}
          </p>

          {/* Button */}

          <div className="mt-10">
            <button
              type="button"
              onClick={() => setIsInquiryOpen(true)}
              className="
                rounded-full
                bg-white
                px-10
                py-4
                text-base
                font-medium
                text-[#6F8F72]
                shadow-lg
                transition-all
                duration-300

                hover:-translate-y-1
                hover:bg-[#F5F5F0]
                hover:shadow-xl

                sm:px-12
                sm:py-5
                sm:text-lg
              "
            >
              {t.button}
            </button>
          </div>
        </div>
      </section>

      {/* Inquiry Modal */}

      <InquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        source="start-a-conversation"
        locale={locale}
      />
    </>
  );
}