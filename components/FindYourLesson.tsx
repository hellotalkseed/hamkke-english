"use client";

import Image from "next/image";
import {
  ArrowRight,
  Clock3,
  FileText,
  Mic,
  Minus,
  Plus,
  Video,
} from "lucide-react";
import { useState } from "react";

import type { Locale } from "../lib/i18n";
import { getMessages } from "../lib/getMessages";

interface FindYourLessonProps {
  locale: Locale;
}

type LessonDuration =
  | 25
  | 30
  | 35
  | 40
  | 45
  | 50;

const platforms = [
  {
    name: "Zoom",
    icon: "/platforms/zoom.svg",
  },
  {
    name: "Google Meet",
    icon: "/platforms/google-meet.svg",
  },
  {
    name: "Microsoft Teams",
    icon: "/platforms/microsoft-teams.svg",
  },
  {
    name: "VooV",
    icon: "/platforms/voov.svg",
  },
  {
    name: "KakaoTalk",
    icon: "/platforms/kakaotalk.svg",
  },
];

const durationOptions: {
  minutes: LessonDuration;
}[] = [
  { minutes: 25 },
  { minutes: 30 },
  { minutes: 35 },
  { minutes: 40 },
  { minutes: 45 },
  { minutes: 50 },
];

const pricing = {
  en: {
    currency: "USD",
    symbol: "$",
    locale: "en-US",
    tuitionPer20: {
      25: 88,
      30: 105,
      35: 123,
      40: 140,
      45: 158,
      50: 176,
    },
  },

  ko: {
    currency: "KRW",
    symbol: "₩",
    locale: "ko-KR",
    tuitionPer20: {
      25: 120000,
      30: 144000,
      35: 168000,
      40: 192000,
      45: 216000,
      50: 240000,
    },
  },

  zh: {
    currency: "CNY",
    symbol: "¥",
    locale: "zh-CN",
    tuitionPer20: {
      25: 580,
      30: 696,
      35: 812,
      40: 928,
      45: 1044,
      50: 1160,
    },
  },

  ja: {
    currency: "JPY",
    symbol: "¥",
    locale: "ja-JP",
    tuitionPer20: {
      25: 13500,
      30: 16200,
      35: 18900,
      40: 21600,
      45: 24300,
      50: 27000,
    },
  },
} satisfies Record<
  Locale,
  {
    currency: string;
    symbol: string;
    locale: string;
    tuitionPer20: Record<
      LessonDuration,
      number
    >;
  }
>;

const tuitionReviewNotes: Record<
  Locale,
  string
> = {
  en: "Tuition is reviewed annually and may be adjusted based on inflation and operating costs.",

  ko: "수업료는 매년 검토되며 물가 상승 및 운영 비용에 따라 조정될 수 있습니다.",

  zh: "学费每年进行审核，并可能根据通货膨胀和运营成本进行调整。",

  ja: "授業料は毎年見直され、物価上昇や運営費の変動に応じて調整される場合があります。",
};

const termLabels: Record<
  Locale,
  {
    term: string;
    lessons: (count: number) => string;
    flexibleTerm: string;
    standardTerm: string;
    perTerm: (count: number) => string;
    choose10: string;
    choose20: string;
  }
> = {
  en: {
    term: "Term",
    lessons: (count) =>
      `${count} lessons`,
    flexibleTerm: "10 or 20 lessons",
    standardTerm: "20-lesson term",
    perTerm: (count) =>
      `per ${count}-lesson term`,
    choose10: "Choose 10 lessons",
    choose20: "Choose 20 lessons",
  },

  ko: {
    term: "수강 단위",
    lessons: (count) =>
      `${count}회 수업`,
    flexibleTerm: "10회 또는 20회",
    standardTerm: "20회 수업",
    perTerm: (count) =>
      `${count}회 수업 기준`,
    choose10: "10회 수업 선택",
    choose20: "20회 수업 선택",
  },

  zh: {
    term: "课程周期",
    lessons: (count) =>
      `${count}节课`,
    flexibleTerm: "10节或20节课",
    standardTerm: "20节课",
    perTerm: (count) =>
      `每${count}节课`,
    choose10: "选择10节课",
    choose20: "选择20节课",
  },

  ja: {
    term: "受講回数",
    lessons: (count) =>
      `${count}レッスン`,
    flexibleTerm:
      "10または20レッスン",
    standardTerm: "20レッスン",
    perTerm: (count) =>
      `${count}レッスンあたり`,
    choose10: "10レッスンを選択",
    choose20: "20レッスンを選択",
  },
};

export default function FindYourLesson({
  locale,
}: FindYourLessonProps) {
  const [
    selectedDuration,
    setSelectedDuration,
  ] = useState<LessonDuration>(25);

  const [
    selectedLessons,
    setSelectedLessons,
  ] = useState<10 | 20>(20);

  const messages = getMessages(locale);
  const content = messages.findYourLesson;

  const currentPricing = pricing[locale];
  const currentTermLabels =
    termLabels[locale];

  const selectedIndex =
    durationOptions.findIndex(
      (option) =>
        option.minutes ===
        selectedDuration
    );

  const selectedOption =
    durationOptions[selectedIndex] ??
    durationOptions[0];

  const canDecreaseDuration =
    selectedIndex > 0;

  const canIncreaseDuration =
    selectedIndex <
    durationOptions.length - 1;

  const allowsTenLessonTerm =
    selectedOption.minutes >= 40;

  const decreaseDuration = () => {
    if (!canDecreaseDuration) return;

    const nextDuration =
      durationOptions[selectedIndex - 1]
        .minutes;

    setSelectedDuration(nextDuration);

    if (nextDuration < 40) {
      setSelectedLessons(20);
    }
  };

  const increaseDuration = () => {
    if (!canIncreaseDuration) return;

    setSelectedDuration(
      durationOptions[selectedIndex + 1]
        .minutes
    );
  };

  const decreaseLessons = () => {
    if (!allowsTenLessonTerm) return;
    if (selectedLessons !== 20) return;

    setSelectedLessons(10);
  };

  const increaseLessons = () => {
    if (!allowsTenLessonTerm) return;
    if (selectedLessons !== 10) return;

    setSelectedLessons(20);
  };

  const tuitionPer20 =
    currentPricing.tuitionPer20[
      selectedOption.minutes
    ];

  const tuition =
    selectedLessons === 10
      ? tuitionPer20 / 2
      : tuitionPer20;

  const formattedAmount =
    tuition.toLocaleString(
      currentPricing.locale,
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    );

  const formattedTuition =
    `${currentPricing.symbol}${formattedAmount}`;

  return (
    <section
      id="lessons"
      className="
        relative
        -mt-px
        overflow-hidden
        bg-[#FFFDF8]

        px-6
        pb-14
        pt-12

        sm:px-8
        sm:pb-16
        sm:pt-14

        lg:px-10
        lg:pb-16
        lg:pt-12

        xl:px-12
      "
    >
      <div className="mx-auto w-full max-w-[1500px]">
        {/* INTRO */}

        <div className="max-w-[900px] lg:ml-[2%]">
          <p
            className="
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.32em]
              text-[#718A73]

              sm:text-[12px]
            "
          >
            {content.eyebrow}
          </p>

          <h2
            className="
              mt-2
              max-w-[900px]
              text-[42px]
              font-medium
              leading-[0.95]
              tracking-[-0.035em]
              text-[#293A30]
              [font-family:var(--font-cormorant)]

              sm:text-[54px]
              lg:text-[62px]
            "
          >
            {content.title}
          </h2>

          <p
            className="
              mt-2
              max-w-[620px]
              text-[15px]
              leading-[1.55]
              text-[#68736B]

              sm:text-[16px]
            "
          >
            {content.description}
          </p>
        </div>

        {/* LESSON DISPLAY */}

        <div
          className="
            mt-6
            grid
            items-end
            gap-6

            lg:grid-cols-[0.28fr_1fr]
            lg:gap-0

            xl:grid-cols-[0.27fr_1fr]
          "
        >
          {/* MASCOT */}

          <div
            className="
              relative
              z-10
              hidden
              w-[135%]
              max-w-[470px]

              lg:block
              lg:translate-x-[-4%]
              lg:-translate-y-[6%]

              xl:w-[140%]
              xl:translate-x-[-2%]
              xl:-translate-y-[7%]
            "
          >
            <Image
              src="/mascot/hamkke-find-lesson.png"
              alt=""
              width={700}
              height={700}
              className="h-auto w-full object-contain"
            />
          </div>

          {/* LESSON CARD */}

          <div
            className="
              relative
              rounded-[30px]
              border
              border-[#304A39]/10
              bg-[#FAF8F2]
              px-6
              py-7
              shadow-[0_24px_70px_rgba(48,74,57,0.07)]

              sm:px-9
              sm:py-8

              lg:px-11
              lg:py-8
            "
          >
            <div
              className="
                grid
                gap-8

                lg:grid-cols-[1.05fr_0.95fr]
                lg:gap-11
              "
            >
              {/* LEFT SIDE */}

              <div>
                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    bg-[#E9EEE5]
                    px-4
                    py-2
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-[#607568]
                  "
                >
                  <span
                    className="
                      h-2
                      w-2
                      rounded-full
                      bg-[#718A73]
                    "
                    aria-hidden="true"
                  />

                  {content.online}
                </div>

                <h3
                  className="
                    mt-4
                    text-[38px]
                    font-medium
                    leading-[0.95]
                    tracking-[-0.025em]
                    text-[#293A30]
                    [font-family:var(--font-cormorant)]

                    sm:text-[44px]
                    lg:text-[48px]
                  "
                >
                  {content.lesson}
                </h3>

                <p
                  className="
                    mt-2
                    text-[16px]
                    text-[#68736B]

                    sm:text-[17px]
                  "
                >
                  {content.learners}
                </p>

                {/* PLATFORMS */}

                <div
                  className="
                    mt-5
                    border-t
                    border-[#304A39]/10
                    pt-5
                  "
                >
                  <p
                    className="
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-[0.24em]
                      text-[#718A73]
                    "
                  >
                    {content.platforms}
                  </p>

                  <div
                    className="
                      mt-3
                      grid
                      grid-cols-2
                      gap-x-5
                      gap-y-3

                      sm:grid-cols-3
                    "
                  >
                    {platforms.map(
                      (platform) => (
                        <div
                          key={platform.name}
                          className="
                            flex
                            min-w-0
                            items-center
                            gap-2
                          "
                        >
                          <Image
                            src={platform.icon}
                            alt=""
                            width={25}
                            height={25}
                            className="
                              h-[25px]
                              w-[25px]
                              shrink-0
                              object-contain
                            "
                          />

                          <span
                            className="
                              whitespace-nowrap
                              text-[12px]
                              font-medium
                              text-[#4D5E53]

                              sm:text-[13px]
                            "
                          >
                            {platform.name}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* LESSON FORMAT */}

                <div
                  className="
                    mt-5
                    border-t
                    border-[#304A39]/10
                    pt-5
                  "
                >
                  <p
                    className="
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-[0.24em]
                      text-[#718A73]
                    "
                  >
                    {content.format}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-[16px]
                        bg-[#F2EEE5]
                        px-4
                        py-3
                      "
                    >
                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-[#FFFDF8]
                          text-[#607568]
                        "
                      >
                        <Mic
                          size={19}
                          strokeWidth={1.7}
                        />
                      </div>

                      <div>
                        <p
                          className="
                            text-[14px]
                            font-semibold
                            text-[#304A39]
                          "
                        >
                          {content.voice}
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-[11px]
                            text-[#758477]
                          "
                        >
                          {content.voiceDetail}
                        </p>
                      </div>
                    </div>

                    <div
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-[16px]
                        bg-[#F2EEE5]
                        px-4
                        py-3
                      "
                    >
                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-[#FFFDF8]
                          text-[#607568]
                        "
                      >
                        <Video
                          size={19}
                          strokeWidth={1.7}
                        />
                      </div>

                      <div>
                        <p
                          className="
                            text-[14px]
                            font-semibold
                            text-[#304A39]
                          "
                        >
                          {content.video}
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-[11px]
                            text-[#758477]
                          "
                        >
                          {content.videoDetail}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE */}

              <div
                className="
                  border-t
                  border-[#304A39]/10
                  pt-7

                  lg:border-l
                  lg:border-t-0
                  lg:pl-11
                  lg:pt-0
                "
              >
                {/* DURATION */}

                <div
                  className="
                    flex
                    items-center
                    gap-4
                    border-b
                    border-[#304A39]/10
                    pb-5
                  "
                >
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#F2EEE5]
                      text-[#607568]
                    "
                  >
                    <Clock3
                      size={23}
                      strokeWidth={1.6}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className="
                        mb-2
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.22em]
                        text-[#718A73]

                        sm:text-[11px]
                      "
                    >
                      {content.durationLabel}
                    </p>

                    <div
                      className="
                        flex
                        min-h-[48px]
                        items-center
                        gap-3
                      "
                    >
                      {canDecreaseDuration && (
                        <button
                          type="button"
                          onClick={
                            decreaseDuration
                          }
                          aria-label={
                            content.decreaseDuration
                          }
                          className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-[#304A39]/15
                            bg-[#FFFDF8]
                            text-[#304A39]
                            shadow-[0_3px_8px_rgba(48,74,57,0.06)]
                            transition-all
                            duration-200

                            hover:border-[#718A73]/40
                            hover:bg-[#F2EEE5]

                            active:scale-95
                          "
                        >
                          <Minus
                            size={18}
                            strokeWidth={1.8}
                          />
                        </button>
                      )}

                      <div className="min-w-[92px] text-center">
                        <p
                          className="
                            text-[34px]
                            font-medium
                            leading-none
                            text-[#293A30]
                            [font-family:var(--font-cormorant)]

                            sm:text-[40px]
                          "
                        >
                          {
                            selectedOption.minutes
                          }{" "}
                          min
                        </p>

                        <p
                          className="
                            mt-1
                            text-[12px]
                            text-[#758477]
                          "
                        >
                          {content.perLesson}
                        </p>
                      </div>

                      {canIncreaseDuration && (
                        <button
                          type="button"
                          onClick={
                            increaseDuration
                          }
                          aria-label={
                            content.increaseDuration
                          }
                          className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-[#304A39]/15
                            bg-[#FFFDF8]
                            text-[#304A39]
                            shadow-[0_3px_8px_rgba(48,74,57,0.06)]
                            transition-all
                            duration-200

                            hover:border-[#718A73]/40
                            hover:bg-[#F2EEE5]

                            active:scale-95
                          "
                        >
                          <Plus
                            size={18}
                            strokeWidth={1.8}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* TERM */}

                <div
                  className="
                    flex
                    items-center
                    gap-4
                    border-b
                    border-[#304A39]/10
                    py-5
                  "
                >
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#F2EEE5]
                      text-[#607568]
                    "
                  >
                    <FileText
                      size={22}
                      strokeWidth={1.6}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className="
                        mb-2
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.22em]
                        text-[#718A73]

                        sm:text-[11px]
                      "
                    >
                      {currentTermLabels.term}
                    </p>

                    <div
                      className="
                        flex
                        min-h-[44px]
                        items-center
                        gap-3
                      "
                    >
                      {allowsTenLessonTerm &&
                        selectedLessons ===
                          20 && (
                          <button
                            type="button"
                            onClick={
                              decreaseLessons
                            }
                            aria-label={
                              currentTermLabels.choose10
                            }
                            className="
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              border
                              border-[#304A39]/15
                              bg-[#FFFDF8]
                              text-[#304A39]
                              shadow-[0_3px_8px_rgba(48,74,57,0.06)]
                              transition-all
                              duration-200

                              hover:border-[#718A73]/40
                              hover:bg-[#F2EEE5]

                              active:scale-95
                            "
                          >
                            <Minus
                              size={18}
                              strokeWidth={1.8}
                            />
                          </button>
                        )}

                      <div className="min-w-[120px] text-center">
                        <p
                          className="
                            text-[29px]
                            font-medium
                            leading-none
                            text-[#293A30]
                            [font-family:var(--font-cormorant)]

                            sm:text-[34px]
                          "
                        >
                          {currentTermLabels.lessons(
                            selectedLessons
                          )}
                        </p>

                        <p
                          className="
                            mt-1
                            text-[12px]
                            text-[#758477]
                          "
                        >
                          {allowsTenLessonTerm
                            ? currentTermLabels.flexibleTerm
                            : currentTermLabels.standardTerm}
                        </p>
                      </div>

                      {allowsTenLessonTerm &&
                        selectedLessons ===
                          10 && (
                          <button
                            type="button"
                            onClick={
                              increaseLessons
                            }
                            aria-label={
                              currentTermLabels.choose20
                            }
                            className="
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              border
                              border-[#304A39]/15
                              bg-[#FFFDF8]
                              text-[#304A39]
                              shadow-[0_3px_8px_rgba(48,74,57,0.06)]
                              transition-all
                              duration-200

                              hover:border-[#718A73]/40
                              hover:bg-[#F2EEE5]

                              active:scale-95
                            "
                          >
                            <Plus
                              size={18}
                              strokeWidth={1.8}
                            />
                          </button>
                        )}
                    </div>
                  </div>
                </div>

                {/* TUITION */}

                <div
                  className="
                    flex
                    items-start
                    gap-4
                    py-5
                  "
                >
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#F2EEE5]
                      text-[24px]
                      font-medium
                      text-[#607568]
                      [font-family:var(--font-cormorant)]
                    "
                  >
                    {currentPricing.symbol}
                  </div>

                  <div className="min-w-0">
                    <p
                      className="
                        mb-2
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.22em]
                        text-[#718A73]

                        sm:text-[11px]
                      "
                    >
                      {content.tuitionLabel}
                    </p>

                    <div
                      className="
                        flex
                        flex-wrap
                        items-end
                        gap-x-2
                        gap-y-1
                      "
                    >
                      <p
                        className="
                          text-[38px]
                          font-medium
                          leading-none
                          tracking-[-0.025em]
                          text-[#293A30]
                          [font-family:var(--font-cormorant)]

                          sm:text-[44px]
                        "
                      >
                        {formattedTuition}
                      </p>

                      <span
                        className="
                          pb-1
                          text-[11px]
                          font-semibold
                          uppercase
                          tracking-[0.12em]
                          text-[#718A73]
                        "
                      >
                        {currentPricing.currency}
                      </span>
                    </div>

                    <p
                      className="
                        mt-1
                        text-[12px]
                        text-[#758477]
                      "
                    >
                      {currentTermLabels.perTerm(
                        selectedLessons
                      )}
                    </p>

                    <p
                      className="
                        mt-3
                        max-w-[390px]
                        text-[11px]
                        leading-[1.5]
                        text-[#8A948C]
                      "
                    >
                      {
                        tuitionReviewNotes[
                          locale
                        ]
                      }
                    </p>
                  </div>
                </div>

                {/* CTA */}

                <button
                  type="button"
                  className="
                    group
                    mt-1
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-[18px]
                    bg-[#365844]
                    px-5
                    py-4
                    text-left
                    text-[14px]
                    font-semibold
                    text-[#FFFDF8]
                    shadow-[0_7px_0_#718A73]
                    transition-all
                    duration-200

                    hover:-translate-y-[2px]

                    active:translate-y-[4px]
                    active:shadow-[0_3px_0_#718A73]

                    sm:px-6
                    sm:text-[15px]
                  "
                >
                  <span>
                    {content.chooseLesson}
                  </span>

                  <ArrowRight
                    size={21}
                    strokeWidth={1.7}
                    className="
                      shrink-0
                      transition-transform
                      duration-200

                      group-hover:translate-x-1
                    "
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}