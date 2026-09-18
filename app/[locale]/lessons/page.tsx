"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  FileText,
  Mic,
  Minus,
  Plus,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";

import Navbar from "../../../components/Navbar";
import type { Locale } from "../../../lib/i18n";
import { isValidLocale } from "../../../lib/i18n";

const durationOptions = [
  { minutes: 25, tuitionPer20: 120000 },
  { minutes: 30, tuitionPer20: 144000 },
  { minutes: 35, tuitionPer20: 168000 },
  { minutes: 40, tuitionPer20: 192000 },
  { minutes: 45, tuitionPer20: 216000 },
  { minutes: 50, tuitionPer20: 240000 },
];

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

const audiences = [
  {
    label: "Kids",
    title: "More chances to use the English they are learning.",
    description:
      "For children who are learning English but need more opportunities to answer, explain, and express themselves in conversation.",
    goals: [
      "Speaking practice",
      "Vocabulary in conversation",
      "Longer answers",
      "Speaking confidence",
    ],
  },
  {
    label: "Teens",
    title: "Move beyond short answers.",
    description:
      "For teens who want to express opinions, explain their ideas, and become more comfortable having longer conversations in English.",
    goals: [
      "Conversation",
      "Opinions & ideas",
      "School English",
      "Speaking confidence",
    ],
  },
  {
    label: "Adults",
    title: "Use English for the situations that matter to you.",
    description:
      "For adults who want to communicate more comfortably in everyday life, at work, while traveling, or in conversations that are personally important.",
    goals: [
      "Everyday English",
      "Work",
      "Interviews",
      "Travel",
      "Free conversation",
    ],
  },
];

export default function LessonsPage() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale;

  const [selectedDuration, setSelectedDuration] =
    useState(25);

  const [selectedLessons, setSelectedLessons] =
    useState<10 | 20>(20);

  const selectedIndex = durationOptions.findIndex(
    (option) =>
      option.minutes === selectedDuration
  );

  const selectedOption =
    durationOptions[selectedIndex] ??
    durationOptions[0];

  const canDecreaseDuration = selectedIndex > 0;

  const canIncreaseDuration =
    selectedIndex < durationOptions.length - 1;

  const allowsTenLessonTerm =
    selectedOption.minutes >= 40;

  useEffect(() => {
    if (!allowsTenLessonTerm && selectedLessons === 10) {
      setSelectedLessons(20);
    }
  }, [allowsTenLessonTerm, selectedLessons]);

  if (!isValidLocale(locale)) {
    return null;
  }

  const typedLocale: Locale = locale;

  const decreaseDuration = () => {
    if (!canDecreaseDuration) return;

    const nextDuration =
      durationOptions[selectedIndex - 1].minutes;

    setSelectedDuration(nextDuration);

    if (nextDuration < 40) {
      setSelectedLessons(20);
    }
  };

  const increaseDuration = () => {
    if (!canIncreaseDuration) return;

    setSelectedDuration(
      durationOptions[selectedIndex + 1].minutes
    );
  };

  const decreaseLessons = () => {
    if (!allowsTenLessonTerm) return;

    if (selectedLessons === 20) {
      setSelectedLessons(10);
    }
  };

  const increaseLessons = () => {
    if (!allowsTenLessonTerm) return;

    if (selectedLessons === 10) {
      setSelectedLessons(20);
    }
  };

  const tuition =
    selectedLessons === 10
      ? selectedOption.tuitionPer20 / 2
      : selectedOption.tuitionPer20;

  const formattedTuition =
    `₩${tuition.toLocaleString("en-US")}`;

  return (
    <>
      <Navbar />

      <main
        className="
          min-h-screen
          bg-[#FFFDF8]
          text-[#293A30]
        "
      >
        {/* =====================================================
            HERO
            ===================================================== */}

        <section
          className="
            bg-[#FFFDF8]
            px-6
            pb-12
            pt-12

            sm:px-10
            sm:pb-14
            sm:pt-14

            lg:px-16
            lg:pb-16
            lg:pt-16
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[1180px]
            "
          >
            <p
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-[#718A73]

                sm:text-[12px]
              "
            >
              Lessons
            </p>

            <h1
              className="
                mt-3
                max-w-[760px]
                font-serif
                text-[44px]
                font-normal
                leading-[1.03]
                tracking-[-0.03em]
                text-[#293A30]

                sm:text-[52px]

                lg:text-[58px]
              "
            >
              English lessons for different learners,
              goals, and stages.
            </h1>

            <p
              className="
                mt-5
                max-w-[650px]
                text-[16px]
                leading-7
                text-[#607066]

                sm:text-[17px]
                sm:leading-8
              "
            >
              One-on-one online lessons shaped around
              who you are, what you want to express,
              and where you want to use your English.
            </p>
          </div>
        </section>

        {/* =====================================================
            AUDIENCE
            ===================================================== */}

        <section
          className="
            bg-[#EEF2EA]
            px-6
            py-14

            sm:px-10
            sm:py-16

            lg:px-16
            lg:py-20
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[1180px]
            "
          >
            <div
              className="
                grid
                gap-6

                lg:grid-cols-[280px_minmax(0,1fr)]
                lg:gap-16
              "
            >
              <div>
                <p
                  className="
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-[#718A73]

                    sm:text-[12px]
                  "
                >
                  Who lessons are for
                </p>

                <h2
                  className="
                    mt-3
                    font-serif
                    text-[34px]
                    font-normal
                    leading-[1.08]
                    tracking-[-0.025em]
                    text-[#293A30]

                    sm:text-[40px]
                  "
                >
                  Find where you fit.
                </h2>
              </div>

              <p
                className="
                  max-w-[650px]
                  text-[15px]
                  leading-7
                  text-[#607066]

                  sm:text-[16px]
                "
              >
                The same conversation-centered approach
                adapts to different ages and goals.
                What we talk about and how your teacher
                supports you changes with the learner.
              </p>
            </div>

            <div
              className="
                mt-10
                border-t
                border-[#C7D2C4]
              "
            >
              {audiences.map((audience) => (
                <div
                  key={audience.label}
                  className="
                    grid
                    gap-5
                    border-b
                    border-[#C7D2C4]
                    py-8

                    sm:py-9

                    lg:grid-cols-[160px_minmax(0,1fr)_310px]
                    lg:items-start
                    lg:gap-10
                  "
                >
                  <div>
                    <p
                      className="
                        font-serif
                        text-[30px]
                        font-medium
                        leading-none
                        text-[#304A39]

                        sm:text-[34px]
                      "
                    >
                      {audience.label}
                    </p>
                  </div>

                  <div>
                    <h3
                      className="
                        max-w-[470px]
                        text-[18px]
                        font-semibold
                        leading-7
                        text-[#293A30]

                        sm:text-[19px]
                      "
                    >
                      {audience.title}
                    </h3>

                    <p
                      className="
                        mt-2
                        max-w-[540px]
                        text-[14px]
                        leading-7
                        text-[#607066]

                        sm:text-[15px]
                      "
                    >
                      {audience.description}
                    </p>
                  </div>

                  <div
                    className="
                      flex
                      flex-wrap
                      gap-2
                    "
                  >
                    {audience.goals.map((goal) => (
                      <span
                        key={goal}
                        className="
                          rounded-full
                          border
                          border-[#C7D2C4]
                          bg-[#FFFDF8]
                          px-3.5
                          py-2
                          text-[12px]
                          font-medium
                          text-[#526459]

                          sm:text-[13px]
                        "
                      >
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            LESSON DETAILS
            ===================================================== */}

        <section
          className="
            bg-[#FFFDF8]
            px-6
            py-14

            sm:px-10
            sm:py-16

            lg:px-16
            lg:py-20
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[1180px]
            "
          >
            <div
              className="
                mb-7
                max-w-[650px]
              "
            >
              <p
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-[#718A73]

                  sm:text-[12px]
                "
              >
                Lesson details
              </p>

              <h2
                className="
                  mt-3
                  font-serif
                  text-[34px]
                  font-normal
                  leading-[1.08]
                  tracking-[-0.025em]
                  text-[#293A30]

                  sm:text-[40px]
                "
              >
                Choose your lesson time.
              </h2>

              <p
                className="
                  mt-3
                  text-[15px]
                  leading-7
                  text-[#607066]
                "
              >
                Choose the lesson duration and term
                length that work best for you.
              </p>
            </div>

            {/* LESSON CARD */}

            <div
              className="
                rounded-[26px]
                border
                border-[#304A39]/10
                bg-[#FAF8F2]
                px-6
                py-7
                shadow-[0_20px_55px_rgba(48,74,57,0.06)]

                sm:px-8
                sm:py-8

                lg:px-10
              "
            >
              <div
                className="
                  grid
                  gap-8

                  lg:grid-cols-[1fr_0.9fr]
                  lg:gap-10
                "
              >
                {/* LEFT */}

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
                    />

                    1:1 Online
                  </div>

                  <h3
                    className="
                      mt-4
                      font-serif
                      text-[36px]
                      font-medium
                      leading-none
                      tracking-[-0.025em]
                      text-[#293A30]

                      sm:text-[42px]
                    "
                  >
                    Conversation Lesson
                  </h3>

                  <p
                    className="
                      mt-2
                      text-[15px]
                      text-[#68736B]
                    "
                  >
                    Kids · Teens · Adults
                  </p>

                  {/* PLATFORMS */}

                  <div
                    className="
                      mt-6
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
                        tracking-[0.2em]
                        text-[#718A73]
                      "
                    >
                      Platforms
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
                      {platforms.map((platform) => (
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
                      ))}
                    </div>
                  </div>

                  {/* FORMAT */}

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
                        tracking-[0.2em]
                        text-[#718A73]
                      "
                    >
                      Lesson format
                    </p>

                    <div
                      className="
                        mt-3
                        grid
                        gap-3

                        sm:grid-cols-2
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-3
                          rounded-[15px]
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
                            Audio
                          </p>

                          <p
                            className="
                              mt-0.5
                              text-[11px]
                              text-[#758477]
                            "
                          >
                            Camera off
                          </p>
                        </div>
                      </div>

                      <div
                        className="
                          flex
                          items-center
                          gap-3
                          rounded-[15px]
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
                            Video
                          </p>

                          <p
                            className="
                              mt-0.5
                              text-[11px]
                              text-[#758477]
                            "
                          >
                            Camera optional
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT */}

                <div
                  className="
                    border-t
                    border-[#304A39]/10
                    pt-7

                    lg:border-l
                    lg:border-t-0
                    lg:pl-10
                    lg:pt-0
                  "
                >
                  {/* DURATION */}

                  <div
                    className="
                      border-b
                      border-[#304A39]/10
                      pb-5
                    "
                  >
                    <p
                      className="
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.22em]
                        text-[#718A73]

                        sm:text-[11px]
                      "
                    >
                      Duration
                    </p>

                    <div
                      className="
                        mt-3
                        flex
                        min-h-[48px]
                        items-center
                        gap-3
                      "
                    >
                      {canDecreaseDuration && (
                        <button
                          type="button"
                          onClick={decreaseDuration}
                          aria-label="Decrease lesson duration"
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
                            transition-colors

                            hover:bg-[#F2EEE5]
                          "
                        >
                          <Minus
                            size={18}
                            strokeWidth={1.8}
                          />
                        </button>
                      )}

                      <div
                        className="
                          min-w-[96px]
                          text-center
                        "
                      >
                        <p
                          className="
                            font-serif
                            text-[36px]
                            font-medium
                            leading-none
                            text-[#293A30]

                            sm:text-[40px]
                          "
                        >
                          {selectedOption.minutes} min
                        </p>

                        <p
                          className="
                            mt-1
                            text-[12px]
                            text-[#758477]
                          "
                        >
                          per lesson
                        </p>
                      </div>

                      {canIncreaseDuration && (
                        <button
                          type="button"
                          onClick={increaseDuration}
                          aria-label="Increase lesson duration"
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
                            transition-colors

                            hover:bg-[#F2EEE5]
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
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-[#F2EEE5]
                        text-[#607568]
                      "
                    >
                      <FileText
                        size={20}
                        strokeWidth={1.6}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className="
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-[0.22em]
                          text-[#718A73]

                          sm:text-[11px]
                        "
                      >
                        Term
                      </p>

                      <div
                        className="
                          mt-2
                          flex
                          min-h-[40px]
                          items-center
                          gap-3
                        "
                      >
                        {allowsTenLessonTerm &&
                          selectedLessons === 20 && (
                            <button
                              type="button"
                              onClick={decreaseLessons}
                              aria-label="Choose 10 lessons"
                              className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                border
                                border-[#304A39]/15
                                bg-[#FFFDF8]
                                text-[#304A39]
                                transition-colors

                                hover:bg-[#F2EEE5]
                              "
                            >
                              <Minus
                                size={17}
                                strokeWidth={1.8}
                              />
                            </button>
                          )}

                        <p
                          className="
                            min-w-[112px]
                            font-serif
                            text-[30px]
                            font-medium
                            leading-none
                            text-[#293A30]
                          "
                        >
                          {selectedLessons} lessons
                        </p>

                        {allowsTenLessonTerm &&
                          selectedLessons === 10 && (
                            <button
                              type="button"
                              onClick={increaseLessons}
                              aria-label="Choose 20 lessons"
                              className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                border
                                border-[#304A39]/15
                                bg-[#FFFDF8]
                                text-[#304A39]
                                transition-colors

                                hover:bg-[#F2EEE5]
                              "
                            >
                              <Plus
                                size={17}
                                strokeWidth={1.8}
                              />
                            </button>
                          )}
                      </div>

                      {!allowsTenLessonTerm && (
                        <p
                          className="
                            mt-1
                            text-[11px]
                            leading-5
                            text-[#758477]
                          "
                        >
                          20-lesson term for 25–35 minute
                          lessons
                        </p>
                      )}

                      {allowsTenLessonTerm && (
                        <p
                          className="
                            mt-1
                            text-[11px]
                            leading-5
                            text-[#758477]
                          "
                        >
                          10 or 20 lessons per term
                        </p>
                      )}
                    </div>
                  </div>

                  {/* TUITION */}

                  <div
                    className="
                      flex
                      items-center
                      gap-4
                      py-5
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
                        bg-[#F2EEE5]
                        font-serif
                        text-[23px]
                        font-medium
                        text-[#607568]
                      "
                    >
                      ₩
                    </div>

                    <div>
                      <p
                        className="
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-[0.22em]
                          text-[#718A73]

                          sm:text-[11px]
                        "
                      >
                        Tuition
                      </p>

                      <p
                        className="
                          mt-1
                          font-serif
                          text-[38px]
                          font-medium
                          leading-none
                          tracking-[-0.025em]
                          text-[#293A30]

                          sm:text-[42px]
                        "
                      >
                        {formattedTuition}
                      </p>

                      <p
                        className="
                          mt-1
                          text-[12px]
                          text-[#758477]
                        "
                      >
                        per {selectedLessons}-lesson term
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
                      rounded-[16px]
                      bg-[#365844]
                      px-5
                      py-4
                      text-[14px]
                      font-semibold
                      text-[#FFFDF8]
                      shadow-[0_6px_0_#718A73]
                      transition-all
                      duration-200

                      hover:-translate-y-[2px]

                      active:translate-y-[3px]
                      active:shadow-[0_3px_0_#718A73]

                      sm:px-6
                    "
                  >
                    <span>Choose This Lesson</span>

                    <ArrowRight
                      size={20}
                      strokeWidth={1.7}
                      className="
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
        </section>

        {/* =====================================================
            NEXT STEP
            ===================================================== */}

        <section
          className="
            bg-[#F3EDDD]
            px-6
            py-12

            sm:px-10
            sm:py-14

            lg:px-16
            lg:py-16
          "
        >
          <div
            className="
              mx-auto
              flex
              w-full
              max-w-[1180px]
              flex-col
              gap-7

              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div>
              <p
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-[#718A73]

                  sm:text-[12px]
                "
              >
                Teachers
              </p>

              <h2
                className="
                  mt-3
                  max-w-[600px]
                  font-serif
                  text-[34px]
                  font-normal
                  leading-[1.08]
                  tracking-[-0.025em]
                  text-[#293A30]

                  sm:text-[40px]
                "
              >
                Find someone you&apos;d feel comfortable
                talking with.
              </h2>
            </div>

            <div
              className="
                relative
                w-fit
                shrink-0
                pb-[6px]
              "
            >
              <div
                className="
                  absolute
                  inset-x-0
                  bottom-0
                  h-[calc(100%-6px)]
                  rounded-[10px]
                  bg-[#718A73]
                "
                aria-hidden="true"
              />

              <Link
                href={`/${typedLocale}/teachers`}
                className="
                  group
                  relative
                  flex
                  min-h-[46px]
                  items-center
                  gap-3
                  rounded-[10px]
                  bg-[#DCE4D7]
                  px-6
                  py-3
                  text-[14px]
                  font-semibold
                  text-[#304A39]
                  transition-transform
                  duration-200

                  hover:-translate-y-[2px]

                  active:translate-y-[4px]
                "
              >
                <span>Meet Our Teachers</span>

                <ArrowRight
                  size={18}
                  strokeWidth={1.7}
                  className="
                    transition-transform
                    duration-200
                    group-hover:translate-x-1
                  "
                />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}