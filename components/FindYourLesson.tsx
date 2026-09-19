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

import {
  allowsTenLessonTerm,
  formatLessonTuition,
  getLessonTuition,
  lessonDurationOptions,
  lessonPricing,
  type LessonCount,
  type LessonDuration,
} from "../lib/lessonConfig";

interface FindYourLessonProps {
  locale: Locale;
}

/* =====================================================
   PLATFORMS
   ===================================================== */

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

/* =====================================================
   SELECTIVE TEXT EMPHASIS
   ===================================================== */

const descriptionHighlights: Record<
  Locale,
  string
> = {
  en: "lesson format, term, and tuition",
  ko: "수업 방식, 수강 단위, 수업료",
  zh: "课程形式、课时数量和课程费用",
  ja: "レッスン形式、受講回数、料金",
};

function highlightPhrase(
  text: string,
  phrase: string
) {
  const index = text.indexOf(phrase);

  if (index === -1) {
    return text;
  }

  const before = text.slice(0, index);
  const after = text.slice(
    index + phrase.length
  );

  return (
    <>
      {before}

      <strong className="font-semibold text-[#304A39]">
        {phrase}
      </strong>

      {after}
    </>
  );
}

/* =====================================================
   MESSAGE INTERPOLATION
   ===================================================== */

function interpolateCount(
  template: string,
  count: LessonCount
) {
  return template.replace(
    "{count}",
    String(count)
  );
}

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
  ] = useState<LessonCount>(20);

  const messages = getMessages(locale);
  const content = messages.findYourLesson;

  const currentPricing =
    lessonPricing[locale];

  /* =====================================================
     SELECTED DURATION
     ===================================================== */

  const selectedIndex =
    lessonDurationOptions.findIndex(
      (option) =>
        option.minutes ===
        selectedDuration
    );

  const selectedOption =
    lessonDurationOptions[selectedIndex] ??
    lessonDurationOptions[0];

  const canDecreaseDuration =
    selectedIndex > 0;

  const canIncreaseDuration =
    selectedIndex <
    lessonDurationOptions.length - 1;

  const canUseTenLessonTerm =
    allowsTenLessonTerm(
      selectedOption.minutes
    );

  /* =====================================================
     DURATION CONTROLS
     ===================================================== */

  const decreaseDuration = () => {
    if (!canDecreaseDuration) {
      return;
    }

    const nextDuration =
      lessonDurationOptions[
        selectedIndex - 1
      ].minutes;

    setSelectedDuration(nextDuration);

    if (
      !allowsTenLessonTerm(
        nextDuration
      )
    ) {
      setSelectedLessons(20);
    }
  };

  const increaseDuration = () => {
    if (!canIncreaseDuration) {
      return;
    }

    setSelectedDuration(
      lessonDurationOptions[
        selectedIndex + 1
      ].minutes
    );
  };

  /* =====================================================
     TERM CONTROLS
     ===================================================== */

  const decreaseLessons = () => {
    if (!canUseTenLessonTerm) {
      return;
    }

    if (selectedLessons !== 20) {
      return;
    }

    setSelectedLessons(10);
  };

  const increaseLessons = () => {
    if (!canUseTenLessonTerm) {
      return;
    }

    if (selectedLessons !== 10) {
      return;
    }

    setSelectedLessons(20);
  };

  /* =====================================================
     TUITION
     ===================================================== */

  const tuition =
    getLessonTuition(
      locale,
      selectedOption.minutes,
      selectedLessons
    );

  const formattedTuition =
    formatLessonTuition(
      locale,
      tuition
    );

  /* =====================================================
     LOCALIZED TERM COPY
     ===================================================== */

  const lessonCountLabel =
    interpolateCount(
      content.term.lessons,
      selectedLessons
    );

  const termSummary =
    canUseTenLessonTerm
      ? content.term.flexible
      : content.term.standard;

  const tuitionTermLabel =
    interpolateCount(
      content.term.perTerm,
      selectedLessons
    );

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
        {/* =====================================================
            INTRO
            ===================================================== */}

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
            {highlightPhrase(
              content.description,
              descriptionHighlights[locale]
            )}
          </p>
        </div>

        {/* =====================================================
            LESSON DISPLAY
            ===================================================== */}

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
          {/* =====================================================
              MASCOT
              ===================================================== */}

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
              className="
                h-auto
                w-full
                object-contain
              "
            />
          </div>

          {/* =====================================================
              LESSON CARD
              ===================================================== */}

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
              {/* =====================================================
                  LEFT SIDE
                  ===================================================== */}

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

                {/* =====================================================
                    PLATFORMS
                    ===================================================== */}

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
                          key={
                            platform.name
                          }
                          className="
                            flex
                            min-w-0
                            items-center
                            gap-2
                          "
                        >
                          <Image
                            src={
                              platform.icon
                            }
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

                {/* =====================================================
                    LESSON FORMAT
                    ===================================================== */}

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
                    {/* AUDIO */}

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

                    {/* VIDEO */}

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

              {/* =====================================================
                  RIGHT SIDE
                  ===================================================== */}

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
                {/* =====================================================
                    DURATION
                    ===================================================== */}

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

                {/* =====================================================
                    TERM
                    ===================================================== */}

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
                      {content.term.label}
                    </p>

                    <div
                      className="
                        flex
                        min-h-[44px]
                        items-center
                        gap-3
                      "
                    >
                      {canUseTenLessonTerm &&
                        selectedLessons ===
                          20 && (
                          <button
                            type="button"
                            onClick={
                              decreaseLessons
                            }
                            aria-label={
                              content.term.choose10
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
                          {lessonCountLabel}
                        </p>

                        <p
                          className="
                            mt-1

                            text-[12px]
                            text-[#758477]
                          "
                        >
                          {termSummary}
                        </p>
                      </div>

                      {canUseTenLessonTerm &&
                        selectedLessons ===
                          10 && (
                          <button
                            type="button"
                            onClick={
                              increaseLessons
                            }
                            aria-label={
                              content.term.choose20
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

                {/* =====================================================
                    TUITION
                    ===================================================== */}

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
                        {
                          currentPricing.currency
                        }
                      </span>
                    </div>

                    <p
                      className="
                        mt-1

                        text-[12px]
                        text-[#758477]
                      "
                    >
                      {tuitionTermLabel}
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
                      {content.tuitionReview}
                    </p>
                  </div>
                </div>

                {/* =====================================================
                    CTA
                    ===================================================== */}

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