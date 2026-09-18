"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import InquiryModal from "./InquiryModal";
import { getMessages } from "../lib/getMessages";
import type { Locale } from "../lib/i18n";

export default function Footer() {
  const params = useParams();

  const locale: Locale =
    params.locale === "ko" ||
    params.locale === "zh" ||
    params.locale === "ja"
      ? params.locale
      : "en";

  const t = getMessages(locale);

  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  const footerCopy = {
    en: {
      description:
        "Conversation-centered English lessons for kids, teens, and adults.",
      learnGroup: "Learn",
      lessons: "Lessons",
      approach: "Approach",
      hamkkeGroup: "Hamkke",
      teachers: "Teachers",
      about: "About",
      policy: "Policy",
      connectGroup: "Connect",
      startConversation: "Start a Conversation",
      instagram: "Instagram",
    },

    ko: {
      description:
        "어린이, 청소년, 성인을 위한 대화 중심 영어 수업.",
      learnGroup: "배우기",
      lessons: "수업",
      approach: "Hamkke 방식",
      hamkkeGroup: "Hamkke",
      teachers: "선생님",
      about: "소개",
      policy: "정책",
      connectGroup: "연결",
      startConversation: "대화 시작하기",
      instagram: "Instagram",
    },

    zh: {
      description:
        "为儿童、青少年和成人提供以对话为中心的英语课程。",
      learnGroup: "学习",
      lessons: "课程",
      approach: "Hamkke 教学方式",
      hamkkeGroup: "Hamkke",
      teachers: "老师",
      about: "关于我们",
      policy: "政策",
      connectGroup: "联系",
      startConversation: "开始交流",
      instagram: "Instagram",
    },

    ja: {
      description:
        "子ども・中高生・大人のための、会話を中心とした英語レッスン。",
      learnGroup: "学ぶ",
      lessons: "レッスン",
      approach: "Hamkkeのアプローチ",
      hamkkeGroup: "Hamkke",
      teachers: "講師",
      about: "Hamkkeについて",
      policy: "ポリシー",
      connectGroup: "つながる",
      startConversation: "相談してみる",
      instagram: "Instagram",
    },
  } satisfies Record<
    Locale,
    {
      description: string;
      learnGroup: string;
      lessons: string;
      approach: string;
      hamkkeGroup: string;
      teachers: string;
      about: string;
      policy: string;
      connectGroup: string;
      startConversation: string;
      instagram: string;
    }
  >;

  const copy = footerCopy[locale];

  return (
    <>
      <footer
        className="
          bg-[#2B2B2B]
          px-6
          py-9

          sm:px-8
          sm:py-10

          lg:px-10
          lg:py-11
        "
      >
        <div className="mx-auto max-w-[1200px]">
          {/* =====================================================
              MAIN FOOTER
              ===================================================== */}

          <div
            className="
              grid
              gap-8

              md:grid-cols-[1.6fr_0.65fr_0.65fr_0.8fr]
              md:gap-7

              lg:gap-10
            "
          >
            {/* ===================================================
                BRAND
                =================================================== */}

            <div>
              <h3
                className="
                  text-[28px]
                  leading-none
                  text-white
                  [font-family:var(--font-cormorant)]

                  sm:text-[30px]
                "
              >
                {t.footer.brand}
              </h3>

              <p
                className="
                  mt-2
                  text-[10px]
                  uppercase
                  tracking-[0.17em]
                  text-white/45
                "
              >
                {t.footer.tagline}
              </p>

              <div
                className="
                  mt-4
                  h-px
                  w-8
                  bg-[#6F8F72]
                "
              />

              <p
                className="
                  mt-3
                  text-[12px]
                  leading-5
                  text-white/45

                  lg:whitespace-nowrap
                "
              >
                {copy.description}
              </p>
            </div>

            {/* ===================================================
                LEARN
                =================================================== */}

            <div>
              <p
                className="
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.22em]
                  text-[#9DB49A]
                "
              >
                {copy.learnGroup}
              </p>

              <nav
                className="
                  mt-3
                  flex
                  flex-col
                  items-start
                  gap-2.5
                "
              >
                <Link
                  href={`/${locale}/lessons`}
                  className="
                    text-[12px]
                    text-white/65
                    transition-colors
                    duration-200
                    hover:text-white
                  "
                >
                  {copy.lessons}
                </Link>

                <Link
                  href={`/${locale}/how-it-works`}
                  className="
                    text-[12px]
                    text-white/65
                    transition-colors
                    duration-200
                    hover:text-white
                  "
                >
                  {copy.approach}
                </Link>
              </nav>
            </div>

            {/* ===================================================
                HAMKKE
                =================================================== */}

            <div>
              <p
                className="
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.22em]
                  text-[#9DB49A]
                "
              >
                {copy.hamkkeGroup}
              </p>

              <nav
                className="
                  mt-3
                  flex
                  flex-col
                  items-start
                  gap-2.5
                "
              >
                <Link
                  href={`/${locale}/teachers`}
                  className="
                    text-[12px]
                    text-white/65
                    transition-colors
                    duration-200
                    hover:text-white
                  "
                >
                  {copy.teachers}
                </Link>

                <Link
                  href={`/${locale}#about`}
                  className="
                    text-[12px]
                    text-white/65
                    transition-colors
                    duration-200
                    hover:text-white
                  "
                >
                  {copy.about}
                </Link>

                <Link
                  href={`/${locale}/policy`}
                  className="
                    text-[12px]
                    text-white/65
                    transition-colors
                    duration-200
                    hover:text-white
                  "
                >
                  {copy.policy}
                </Link>
              </nav>
            </div>

            {/* ===================================================
                CONNECT
                =================================================== */}

            <div>
              <p
                className="
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.22em]
                  text-[#9DB49A]
                "
              >
                {copy.connectGroup}
              </p>

              <div
                className="
                  mt-3
                  flex
                  flex-col
                  items-start
                  gap-2.5
                "
              >
                {/* Start a Conversation — unchanged */}

                <button
                  type="button"
                  onClick={() => setIsInquiryOpen(true)}
                  className="
                    group
                    inline-flex
                    items-center
                    gap-2
                    text-left
                    text-[12px]
                    text-white/65
                    transition-colors
                    duration-200
                    hover:text-white
                  "
                >
                  <span>{copy.startConversation}</span>

                  <span
                    className="
                      transition-transform
                      duration-200
                      group-hover:translate-x-1
                    "
                    aria-hidden="true"
                  >
                    →
                  </span>
                </button>

                {/* Instagram */}

                <a
                  href="https://www.instagram.com/hamkke.english/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    group
                    inline-flex
                    items-center
                    gap-2
                    text-[12px]
                    text-white/65
                    transition-colors
                    duration-200
                    hover:text-white
                  "
                >
                  <span>{copy.instagram}</span>

                  <span
                    className="
                      inline
                      border-0
                      bg-transparent
                      p-0
                      text-[10px]
                      font-normal
                      leading-none
                      shadow-none
                      outline-none
                      transition-transform
                      duration-200
                      group-hover:translate-x-[2px]
                      group-hover:-translate-y-[2px]
                    "
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* =====================================================
              BOTTOM
              ===================================================== */}

          <div
            className="
              mt-8
              border-t
              border-white/10
              pt-4
            "
          >
            <p
              className="
                text-[9px]
                text-white/30
              "
            >
              {t.footer.copyright}
            </p>
          </div>
        </div>
      </footer>

      {/* =====================================================
          INQUIRY MODAL
          ===================================================== */}

      <InquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        source="start-a-conversation"
        locale={locale}
      />
    </>
  );
}