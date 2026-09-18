"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Locale } from "../lib/i18n";

export type PublicTeacher = {
  id: string;
  slug: string;
  name: string;
  avatar_url: string | null;
  card_label: string | null;
  learner_groups: string[];
};

type TeacherSpecialty = {
  title: string;
  description: string;
};

type TeachersCarouselProps = {
  locale: Locale;
  teachers: PublicTeacher[];
  teacherSlots?: number;
};

const teacherPresentation: Record<
  string,
  {
    role: string;
    quote: string;
    specialties: TeacherSpecialty[];
  }
> = {
  jesica: {
    role: "Hamkke Teacher",
    quote:
      "Helping you say more of what you actually want to say.",
    specialties: [
      {
        title: "Conversation",
        description: "Real communication",
      },
      {
        title: "Interview Prep",
        description: "OPIC, airline, and more",
      },
      {
        title: "Patient & Supportive",
        description: "Learn at your own pace",
      },
    ],
  },
};

export default function TeachersCarousel({
  locale,
  teachers,
  teacherSlots = 3,
}: TeachersCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] =
    useState(false);

  const [canScrollRight, setCanScrollRight] =
    useState(false);

  const emptySlots = Math.max(
    teacherSlots - teachers.length,
    0
  );

  const totalSlots =
    teachers.length + emptySlots;

  /* ====================================================================== */
  /* SCROLL STATE                                                           */
  /* ====================================================================== */

  const updateScrollState = useCallback(() => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    const maxScrollLeft =
      container.scrollWidth -
      container.clientWidth;

    const tolerance = 4;

    setCanScrollLeft(
      container.scrollLeft > tolerance
    );

    setCanScrollRight(
      maxScrollLeft > tolerance &&
        container.scrollLeft <
          maxScrollLeft - tolerance
    );
  }, []);

  useEffect(() => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    const frame =
      requestAnimationFrame(() => {
        updateScrollState();
      });

    container.addEventListener(
      "scroll",
      updateScrollState,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "resize",
      updateScrollState
    );

    const resizeObserver =
      new ResizeObserver(() => {
        updateScrollState();
      });

    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(frame);

      container.removeEventListener(
        "scroll",
        updateScrollState
      );

      window.removeEventListener(
        "resize",
        updateScrollState
      );

      resizeObserver.disconnect();
    };
  }, [
    totalSlots,
    updateScrollState,
  ]);

  /* ====================================================================== */
  /* PAGE SCROLL                                                            */
  /* ====================================================================== */

  const scroll = useCallback(
    (direction: "left" | "right") => {
      const container =
        scrollRef.current;

      if (!container) {
        return;
      }

      /*
       * We scroll by one full visible viewport.
       *
       * Desktop = 3 teacher cards
       * Tablet = 2 teacher cards
       * Mobile = 1 teacher card
       *
       * Because the card widths are designed around
       * those breakpoints, clientWidth gives us the
       * cleanest page-by-page movement.
       */
      const pageWidth =
        container.clientWidth;

      const maxScrollLeft =
        container.scrollWidth -
        container.clientWidth;

      const target =
        direction === "right"
          ? Math.min(
              container.scrollLeft +
                pageWidth,
              maxScrollLeft
            )
          : Math.max(
              container.scrollLeft -
                pageWidth,
              0
            );

      container.scrollTo({
        left: target,
        behavior: "smooth",
      });
    },
    []
  );

  return (
    <div className="relative">
      {/* ================================================================ */}
      {/* LEFT NAVIGATION                                                  */}
      {/* ================================================================ */}

      {totalSlots > 1 && (
        <div
          className="
            pointer-events-none
            absolute
            left-[-34px]
            top-1/2
            z-30
            -translate-y-1/2
            sm:left-[-48px]
            lg:left-[-68px]
            xl:left-[-78px]
          "
        >
          <div className="relative">
            {/* Sage lower layer */}
            <div
              className={`
                absolute
                inset-0
                translate-y-[6px]
                rounded-full
                bg-[#718A73]
                transition-opacity
                duration-200

                ${
                  canScrollLeft
                    ? "opacity-100"
                    : "opacity-35"
                }
              `}
              aria-hidden="true"
            />

            {/* Main white button */}
            <button
              type="button"
              onClick={() =>
                scroll("left")
              }
              disabled={!canScrollLeft}
              aria-label="Previous teachers"
              className={`
                pointer-events-auto
                group
                relative
                z-10
                flex
                h-[50px]
                w-[50px]
                items-center
                justify-center
                rounded-full
                border-[2px]
                bg-white
                text-[#304A39]
                shadow-[0_5px_16px_rgba(48,74,57,0.08)]
                transition-all
                duration-200
                sm:h-[54px]
                sm:w-[54px]
                lg:h-[58px]
                lg:w-[58px]

                ${
                  canScrollLeft
                    ? `
                      cursor-pointer
                      border-[#718A73]/35
                      opacity-100
                      hover:-translate-y-[2px]
                      hover:border-[#718A73]/55
                      hover:shadow-[0_8px_20px_rgba(48,74,57,0.11)]
                      active:translate-y-[3px]
                    `
                    : `
                      cursor-default
                      border-[#718A73]/20
                      opacity-40
                    `
                }
              `}
            >
              <span
                className={`
                  block
                  -translate-y-[1px]
                  font-serif
                  text-[25px]
                  font-normal
                  leading-none
                  text-[#304A39]
                  transition-transform
                  duration-200
                  sm:text-[27px]

                  ${
                    canScrollLeft
                      ? "group-hover:-translate-x-[3px]"
                      : ""
                  }
                `}
                aria-hidden="true"
              >
                ←
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* CARDS                                                            */}
      {/* ================================================================ */}

      <div
        ref={scrollRef}
        className="
          flex
          snap-x
          snap-mandatory
          gap-4
          overflow-x-auto
          scroll-smooth
          px-1
          pb-3
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {/* ============================================================ */}
        {/* PUBLISHED TEACHERS                                           */}
        {/* ============================================================ */}

        {teachers.map((teacher) => {
          const presentation =
            teacherPresentation[
              teacher.slug
            ] || {
              role:
                teacher.card_label ||
                "Hamkke Teacher",
              quote:
                "Helping learners use English through meaningful conversation.",
              specialties: [
                {
                  title: "Conversation",
                  description:
                    "Real communication",
                },
                {
                  title: "Personalized",
                  description:
                    "Lessons that fit you",
                },
                {
                  title: "Supportive",
                  description:
                    "Learn at your own pace",
                },
              ],
            };

          const firstName =
            teacher.name
              .trim()
              .split(/\s+/)[0] ||
            teacher.name;

          return (
            <article
              key={teacher.id}
              data-teacher-card
              className="
                group
                flex
                min-h-[410px]
                min-w-[88%]
                snap-start
                flex-col
                overflow-hidden
                rounded-[26px]
                border
                border-[#304A39]/8
                bg-white
                shadow-[0_8px_30px_rgba(48,74,57,0.06)]

                sm:min-w-[72%]

                md:min-w-[calc((100%-16px)/2)]

                lg:min-w-[calc((100%-32px)/3)]
              "
            >
              {/* Main teacher content */}
              <div className="flex flex-1 flex-col p-6">
                {/* Portrait + identity */}
                <div className="flex items-start gap-5">
                  <div className="relative h-[118px] w-[118px] shrink-0">
                    <div className="relative h-full w-full overflow-hidden rounded-full bg-[#EDE3D2]">
                      {teacher.avatar_url ? (
                        <Image
                          src={
                            teacher.avatar_url
                          }
                          alt={`${teacher.name}, ${presentation.role}`}
                          fill
                          sizes="118px"
                          className="object-cover"
                        />
                      ) : (
                        <div
                          className="
                            flex
                            h-full
                            w-full
                            items-center
                            justify-center
                            text-[34px]
                            font-semibold
                            text-[#718A73]
                          "
                          aria-hidden="true"
                        >
                          {firstName
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 pt-1">
                    <span
                      className="
                        inline-flex
                        rounded-full
                        bg-[#E5EBDD]
                        px-3
                        py-1.5
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.12em]
                        text-[#52685A]
                      "
                    >
                      {presentation.role}
                    </span>

                    <h3 className="mt-3 font-serif text-[31px] leading-none text-[#304A39]">
                      {firstName}
                    </h3>

                    <p className="mt-2 font-serif text-[16px] italic leading-[1.25] text-[#718A73]">
                      “{presentation.quote}”
                    </p>
                  </div>
                </div>

                {/* Audience */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {teacher.learner_groups.map(
                    (audience) => (
                      <span
                        key={audience}
                        className="
                          rounded-full
                          bg-[#F3EDDD]
                          px-4
                          py-1.5
                          text-[11px]
                          font-medium
                          text-[#304A39]
                        "
                      >
                        {audience}
                      </span>
                    )
                  )}
                </div>

                {/* Divider */}
                <div className="my-5 h-px bg-[#DCE4D7]" />

                {/* Specialties */}
                <div className="grid grid-cols-3 gap-3">
                  {presentation.specialties.map(
                    (
                      specialty,
                      index
                    ) => (
                      <div
                        key={
                          specialty.title
                        }
                        className={
                          index !==
                          presentation
                            .specialties
                            .length -
                            1
                            ? "border-r border-[#DCE4D7] pr-3"
                            : ""
                        }
                      >
                        <div
                          className="
                            mb-2
                            flex
                            h-7
                            w-7
                            items-center
                            justify-center
                            rounded-full
                            bg-[#F3EDDD]
                            text-[13px]
                            text-[#304A39]
                          "
                          aria-hidden="true"
                        >
                          {index === 0
                            ? "○"
                            : index === 1
                              ? "◎"
                              : "◇"}
                        </div>

                        <p className="text-[11.5px] font-semibold leading-[1.2] text-[#304A39]">
                          {
                            specialty.title
                          }
                        </p>

                        <p className="mt-1 text-[9.5px] leading-[1.35] text-[#758477]">
                          {
                            specialty.description
                          }
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* ====================================================== */}
              {/* PROFILE BUTTON                                        */}
              {/* ====================================================== */}

              <div className="px-5 pb-5">
                <div className="relative">
                  <div
                    className="
                      absolute
                      inset-0
                      translate-y-[7px]
                      rounded-[19px]
                      bg-[#718A73]
                    "
                    aria-hidden="true"
                  />

                  <Link
                    href={`/${locale}/teachers/${teacher.slug}`}
                    className="
                      group/button
                      relative
                      z-10
                      flex
                      min-h-[52px]
                      w-full
                      items-center
                      justify-between
                      rounded-[19px]
                      bg-[#304A39]
                      px-6
                      text-[14px]
                      font-semibold
                      text-[#FFFDF8]
                      transition-transform
                      duration-200
                      hover:-translate-y-[2px]
                      active:translate-y-[3px]
                    "
                  >
                    <span>
                      Meet {firstName}
                    </span>

                    <span
                      className="
                        text-[20px]
                        font-normal
                        leading-none
                        transition-transform
                        duration-200
                        group-hover/button:translate-x-1
                      "
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </article>
          );
        })}

        {/* ============================================================ */}
        {/* FUTURE TEACHER SLOTS                                        */}
        {/* ============================================================ */}

        {Array.from({
          length: emptySlots,
        }).map((_, index) => (
          <article
            key={`future-teacher-${index}`}
            data-teacher-card
            className="
              flex
              min-h-[410px]
              min-w-[88%]
              snap-start
              flex-col
              rounded-[26px]
              border
              border-[#718A73]/15
              bg-[#F8F5EC]
              p-6

              sm:min-w-[72%]

              md:min-w-[calc((100%-16px)/2)]

              lg:min-w-[calc((100%-32px)/3)]
            "
            aria-hidden="true"
          >
            {/* Placeholder identity */}
            <div className="flex items-start gap-5">
              <div
                className="
                  flex
                  h-[118px]
                  w-[118px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#EDE9DF]
                "
              >
                <div className="relative h-[62px] w-[62px]">
                  <div className="absolute left-1/2 top-0 h-[25px] w-[25px] -translate-x-1/2 rounded-full bg-[#D8D6CE]" />

                  <div className="absolute bottom-0 left-1/2 h-[31px] w-[50px] -translate-x-1/2 rounded-t-full bg-[#D8D6CE]" />
                </div>
              </div>

              <div className="flex-1 pt-2">
                <div className="h-[24px] w-[105px] rounded-full bg-[#E7E3DA]" />

                <div className="mt-4 h-[26px] w-[130px] rounded-full bg-[#E1DED6]" />

                <div className="mt-3 h-[10px] w-full rounded-full bg-[#E7E3DA]" />

                <div className="mt-2 h-[10px] w-[75%] rounded-full bg-[#E7E3DA]" />
              </div>
            </div>

            {/* Placeholder tags */}
            <div className="mt-6 flex gap-2">
              <div className="h-[27px] w-[62px] rounded-full bg-[#E7E3DA]" />

              <div className="h-[27px] w-[68px] rounded-full bg-[#E7E3DA]" />

              <div className="h-[27px] w-[62px] rounded-full bg-[#E7E3DA]" />
            </div>

            <div className="my-5 h-px bg-[#E1DED6]" />

            {/* Placeholder specialties */}
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map(
                (item) => (
                  <div key={item}>
                    <div className="h-7 w-7 rounded-full bg-[#E7E3DA]" />

                    <div className="mt-3 h-[9px] w-[80%] rounded-full bg-[#E1DED6]" />

                    <div className="mt-2 h-[8px] w-[60%] rounded-full bg-[#E7E3DA]" />
                  </div>
                )
              )}
            </div>

            <div className="mt-auto">
              <div className="h-[52px] w-full rounded-[19px] bg-[#E4E0D7]" />
            </div>
          </article>
        ))}
      </div>

      {/* ================================================================ */}
      {/* RIGHT NAVIGATION                                                 */}
      {/* ================================================================ */}

      {totalSlots > 1 && (
        <div
          className="
            pointer-events-none
            absolute
            right-[-34px]
            top-1/2
            z-30
            -translate-y-1/2
            sm:right-[-48px]
            lg:right-[-68px]
            xl:right-[-78px]
          "
        >
          <div className="relative">
            {/* Sage lower layer */}
            <div
              className={`
                absolute
                inset-0
                translate-y-[6px]
                rounded-full
                bg-[#718A73]
                transition-opacity
                duration-200

                ${
                  canScrollRight
                    ? "opacity-100"
                    : "opacity-35"
                }
              `}
              aria-hidden="true"
            />

            {/* Main white button */}
            <button
              type="button"
              onClick={() =>
                scroll("right")
              }
              disabled={!canScrollRight}
              aria-label="Next teachers"
              className={`
                pointer-events-auto
                group
                relative
                z-10
                flex
                h-[50px]
                w-[50px]
                items-center
                justify-center
                rounded-full
                border-[2px]
                bg-white
                text-[#304A39]
                shadow-[0_5px_16px_rgba(48,74,57,0.08)]
                transition-all
                duration-200
                sm:h-[54px]
                sm:w-[54px]
                lg:h-[58px]
                lg:w-[58px]

                ${
                  canScrollRight
                    ? `
                      cursor-pointer
                      border-[#718A73]/35
                      opacity-100
                      hover:-translate-y-[2px]
                      hover:border-[#718A73]/55
                      hover:shadow-[0_8px_20px_rgba(48,74,57,0.11)]
                      active:translate-y-[3px]
                    `
                    : `
                      cursor-default
                      border-[#718A73]/20
                      opacity-40
                    `
                }
              `}
            >
              <span
                className={`
                  block
                  -translate-y-[1px]
                  font-serif
                  text-[25px]
                  font-normal
                  leading-none
                  text-[#304A39]
                  transition-transform
                  duration-200
                  sm:text-[27px]

                  ${
                    canScrollRight
                      ? "group-hover:translate-x-[3px]"
                      : ""
                  }
                `}
                aria-hidden="true"
              >
                →
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MOBILE SWIPE HINT                                                */}
      {/* ================================================================ */}

      {totalSlots > 1 && (
        <p className="mt-2 text-center font-serif text-[13px] italic text-[#718A73] lg:hidden">
          Swipe to meet more teachers.
        </p>
      )}
    </div>
  );
}