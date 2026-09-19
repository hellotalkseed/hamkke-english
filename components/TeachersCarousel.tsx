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
import { getMessages } from "../lib/getMessages";

export type PublicTeacher = {
  id: string;
  slug: string;
  name: string;
  avatar_url: string | null;
  card_label: string | null;
  learner_groups: string[];
};

type TeachersCarouselProps = {
  locale: Locale;
  teachers: PublicTeacher[];
  teacherSlots?: number;
};

type LearnerGroupLabels = {
  kids: string;
  teens: string;
  adults: string;
};

type SpecialtyItem = {
  title: string;
  description: string;
};

/* ====================================================================== */
/* LEARNER GROUP PRESENTATION                                             */
/* ====================================================================== */

function getLearnerGroupLabel(
  audience: string,
  labels: LearnerGroupLabels
) {
  const normalized = audience
    .trim()
    .toLowerCase();

  if (
    normalized === "kid" ||
    normalized === "kids" ||
    normalized === "child" ||
    normalized === "children"
  ) {
    return labels.kids;
  }

  if (
    normalized === "teen" ||
    normalized === "teens" ||
    normalized === "teenager" ||
    normalized === "teenagers"
  ) {
    return labels.teens;
  }

  if (
    normalized === "adult" ||
    normalized === "adults"
  ) {
    return labels.adults;
  }

  return audience;
}

/* ====================================================================== */
/* SPECIALTY PRESENTATION                                                 */
/* ====================================================================== */

function getSpecialties(
  specialties: unknown
): SpecialtyItem[] {
  if (Array.isArray(specialties)) {
    return specialties.map((specialty) => {
      const item = specialty as {
        title?: unknown;
        description?: unknown;
        detail?: unknown;
      };

      return {
        title:
          typeof item.title === "string"
            ? item.title
            : "",
        description:
          typeof item.description === "string"
            ? item.description
            : typeof item.detail === "string"
              ? item.detail
              : "",
      };
    });
  }

  if (
    specialties &&
    typeof specialties === "object"
  ) {
    return Object.values(
      specialties
    ).map((specialty) => {
      const item = specialty as {
        title?: unknown;
        description?: unknown;
        detail?: unknown;
      };

      return {
        title:
          typeof item.title === "string"
            ? item.title
            : "",
        description:
          typeof item.description === "string"
            ? item.description
            : typeof item.detail === "string"
              ? item.detail
              : "",
      };
    });
  }

  return [];
}

/* ====================================================================== */
/* TEMPLATE INTERPOLATION                                                 */
/* ====================================================================== */

function interpolate(
  template: string,
  values: Record<string, string>
) {
  return template.replace(
    /\{(\w+)\}/g,
    (match, key: string) =>
      values[key] ?? match
  );
}

export default function TeachersCarousel({
  locale,
  teachers,
  teacherSlots = 3,
}: TeachersCarouselProps) {
  const scrollRef =
    useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] =
    useState(false);

  const [canScrollRight, setCanScrollRight] =
    useState(false);

  const messages = getMessages(locale);
  const content = messages.teachers;

  const emptySlots = Math.max(
    teacherSlots - teachers.length,
    0
  );

  const totalSlots =
    teachers.length + emptySlots;

  /* ==================================================================== */
  /* SCROLL STATE                                                         */
  /* ==================================================================== */

  const updateScrollState =
    useCallback(() => {
      const container =
        scrollRef.current;

      if (!container) {
        return;
      }

      const maxScrollLeft =
        container.scrollWidth -
        container.clientWidth;

      const tolerance = 4;

      setCanScrollLeft(
        container.scrollLeft >
          tolerance
      );

      setCanScrollRight(
        maxScrollLeft > tolerance &&
          container.scrollLeft <
            maxScrollLeft -
              tolerance
      );
    }, []);

  useEffect(() => {
    const container =
      scrollRef.current;

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

    resizeObserver.observe(
      container
    );

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

  /* ==================================================================== */
  /* DESKTOP PAGE SCROLL                                                  */
  /* ==================================================================== */

  const scroll = useCallback(
    (
      direction:
        | "left"
        | "right"
    ) => {
      const container =
        scrollRef.current;

      if (!container) {
        return;
      }

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
      {/* DESKTOP LEFT NAVIGATION                                         */}
      {/* ================================================================ */}

      {totalSlots > 1 && (
        <div
          className="
            pointer-events-none
            absolute
            left-[-68px]
            top-1/2
            z-30
            hidden
            -translate-y-1/2

            lg:block

            xl:left-[-78px]
          "
        >
          <div className="relative">
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

            <button
              type="button"
              onClick={() =>
                scroll("left")
              }
              disabled={
                !canScrollLeft
              }
              aria-label={
                content.ui.previous
              }
              className={`
                pointer-events-auto
                group
                relative
                z-10
                flex
                h-[58px]
                w-[58px]
                items-center
                justify-center
                rounded-full
                border-[2px]
                bg-white
                text-[#304A39]
                shadow-[0_5px_16px_rgba(48,74,57,0.08)]
                transition-all
                duration-200

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
                  text-[27px]
                  font-normal
                  leading-none
                  text-[#304A39]
                  transition-transform
                  duration-200

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
          gap-3
          overflow-x-auto
          scroll-smooth
          overscroll-x-contain
          px-0
          pb-3
          touch-pan-x
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
          sm:gap-4
          lg:px-1
        "
      >
        {teachers.map(
          (teacher) => {
            const presentation =
              teacher.slug ===
              "jesica"
                ? content
                    .presentations
                    .jesica
                : content
                    .presentations
                    .default;

            const specialties =
              getSpecialties(
                presentation.specialties
              );

            const firstName =
              teacher.name
                .trim()
                .split(/\s+/)[0] ||
              teacher.name;

            const meetTeacherLabel =
              interpolate(
                content.ui
                  .meetTeacher,
                {
                  name: firstName,
                }
              );

            return (
              <article
                key={teacher.id}
                data-teacher-card
                className="
                  group
                  flex
                  min-h-[410px]
                  min-w-[calc(100%-12px)]
                  snap-start
                  flex-col
                  overflow-hidden
                  rounded-[24px]
                  border
                  border-[#304A39]/8
                  bg-white
                  shadow-[0_8px_30px_rgba(48,74,57,0.06)]
                  sm:min-w-[72%]
                  sm:rounded-[26px]
                  md:min-w-[calc((100%-16px)/2)]
                  lg:min-w-[calc((100%-32px)/3)]
                "
              >
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="flex items-start gap-4 sm:gap-5">
                    <div
                      className="
                        relative
                        h-[100px]
                        w-[100px]
                        shrink-0
                        sm:h-[118px]
                        sm:w-[118px]
                      "
                    >
                      <div
                        className="
                          relative
                          h-full
                          w-full
                          overflow-hidden
                          rounded-full
                          bg-[#EDE3D2]
                        "
                      >
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
                          px-2.5
                          py-1.5
                          text-[9px]
                          font-semibold
                          uppercase
                          tracking-[0.1em]
                          text-[#52685A]
                          sm:px-3
                          sm:text-[10px]
                          sm:tracking-[0.12em]
                        "
                      >
                        {
                          presentation.role
                        }
                      </span>

                      <h3
                        className="
                          mt-3
                          font-serif
                          text-[29px]
                          leading-none
                          text-[#304A39]
                          sm:text-[31px]
                        "
                      >
                        {firstName}
                      </h3>

                      <p
                        className="
                          mt-2
                          font-serif
                          text-[15px]
                          italic
                          leading-[1.25]
                          text-[#718A73]
                          sm:text-[16px]
                        "
                      >
                        “
                        {
                          presentation.quote
                        }
                        ”
                      </p>
                    </div>
                  </div>

                  {/* LEARNER GROUPS */}

                  <div className="mt-5 flex flex-wrap gap-2">
                    {teacher.learner_groups.map(
                      (
                        audience
                      ) => (
                        <span
                          key={
                            audience
                          }
                          className="
                            rounded-full
                            bg-[#F3EDDD]
                            px-3.5
                            py-1.5
                            text-[10.5px]
                            font-medium
                            text-[#304A39]
                            sm:px-4
                            sm:text-[11px]
                          "
                        >
                          {getLearnerGroupLabel(
                            audience,
                            content.learnerGroups
                          )}
                        </span>
                      )
                    )}
                  </div>

                  <div className="my-5 h-px bg-[#DCE4D7]" />

                  {/* SPECIALTIES */}

                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {specialties.map(
                      (
                        specialty,
                        index
                      ) => (
                        <div
                          key={`${specialty.title}-${index}`}
                          className={
                            index !==
                            specialties.length -
                              1
                              ? "border-r border-[#DCE4D7] pr-2 sm:pr-3"
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
                            {index ===
                            0
                              ? "○"
                              : index ===
                                  1
                                ? "◎"
                                : "◇"}
                          </div>

                          <p
                            className="
                              text-[10.5px]
                              font-semibold
                              leading-[1.2]
                              text-[#304A39]
                              sm:text-[11.5px]
                            "
                          >
                            {
                              specialty.title
                            }
                          </p>

                          <p
                            className="
                              mt-1
                              text-[9px]
                              leading-[1.35]
                              text-[#758477]
                              sm:text-[9.5px]
                            "
                          >
                            {
                              specialty.description
                            }
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* PROFILE BUTTON */}

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
                        min-h-[50px]
                        w-full
                        items-center
                        justify-between
                        rounded-[19px]
                        bg-[#304A39]
                        px-5
                        text-[13px]
                        font-semibold
                        text-[#FFFDF8]
                        transition-transform
                        duration-200
                        hover:-translate-y-[2px]
                        active:translate-y-[3px]
                        sm:min-h-[52px]
                        sm:px-6
                        sm:text-[14px]
                      "
                    >
                      <span>
                        {
                          meetTeacherLabel
                        }
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
          }
        )}

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
              min-w-[calc(100%-12px)]
              snap-start
              flex-col
              rounded-[24px]
              border
              border-[#718A73]/15
              bg-[#F8F5EC]
              p-5
              sm:min-w-[72%]
              sm:rounded-[26px]
              sm:p-6
              md:min-w-[calc((100%-16px)/2)]
              lg:min-w-[calc((100%-32px)/3)]
            "
            aria-hidden="true"
          >
            <div className="flex items-start gap-4 sm:gap-5">
              <div
                className="
                  flex
                  h-[100px]
                  w-[100px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#EDE9DF]
                  sm:h-[118px]
                  sm:w-[118px]
                "
              >
                <div className="relative h-[62px] w-[62px]">
                  <div
                    className="
                      absolute
                      left-1/2
                      top-0
                      h-[25px]
                      w-[25px]
                      -translate-x-1/2
                      rounded-full
                      bg-[#D8D6CE]
                    "
                  />

                  <div
                    className="
                      absolute
                      bottom-0
                      left-1/2
                      h-[31px]
                      w-[50px]
                      -translate-x-1/2
                      rounded-t-full
                      bg-[#D8D6CE]
                    "
                  />
                </div>
              </div>

              <div className="flex-1 pt-2">
                <div className="h-[24px] w-[105px] rounded-full bg-[#E7E3DA]" />

                <div className="mt-4 h-[26px] w-[130px] rounded-full bg-[#E1DED6]" />

                <div className="mt-3 h-[10px] w-full rounded-full bg-[#E7E3DA]" />

                <div className="mt-2 h-[10px] w-[75%] rounded-full bg-[#E7E3DA]" />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <div className="h-[27px] w-[62px] rounded-full bg-[#E7E3DA]" />

              <div className="h-[27px] w-[68px] rounded-full bg-[#E7E3DA]" />

              <div className="h-[27px] w-[62px] rounded-full bg-[#E7E3DA]" />
            </div>

            <div className="my-5 h-px bg-[#E1DED6]" />

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
      {/* DESKTOP RIGHT NAVIGATION                                        */}
      {/* ================================================================ */}

      {totalSlots > 1 && (
        <div
          className="
            pointer-events-none
            absolute
            right-[-68px]
            top-1/2
            z-30
            hidden
            -translate-y-1/2
            lg:block
            xl:right-[-78px]
          "
        >
          <div className="relative">
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

            <button
              type="button"
              onClick={() =>
                scroll("right")
              }
              disabled={
                !canScrollRight
              }
              aria-label={
                content.ui.next
              }
              className={`
                pointer-events-auto
                group
                relative
                z-10
                flex
                h-[58px]
                w-[58px]
                items-center
                justify-center
                rounded-full
                border-[2px]
                bg-white
                text-[#304A39]
                shadow-[0_5px_16px_rgba(48,74,57,0.08)]
                transition-all
                duration-200

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
                  text-[27px]
                  font-normal
                  leading-none
                  text-[#304A39]
                  transition-transform
                  duration-200

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
      {/* MOBILE / TABLET SWIPE HINT                                      */}
      {/* ================================================================ */}

      {totalSlots > 1 && (
        <p
          className="
            mt-2
            text-center
            font-serif
            text-[13px]
            italic
            text-[#718A73]
            lg:hidden
          "
        >
          {content.ui.swipeHint}
        </p>
      )}
    </div>
  );
}