"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import type { Locale } from "../lib/i18n";
import type { PublicReflection } from "../lib/getPublicReflections";
import { getMessages } from "../lib/getMessages";

type LearnerStoriesProps = {
  locale: Locale;
  reflections: PublicReflection[];
  total: number;
};

const cardBackgrounds = [
  "bg-[#FFFDF8]",
  "bg-[#DCE4D7]",
  "bg-[#FFFDF8]",
  "bg-[#EDE3D2]",
  "bg-[#FFFDF8]",
];

/* ====================================================================== */
/* SELECTIVE EMPHASIS                                                     */
/* ====================================================================== */

function renderHighlightedText(
  text: string,
  highlights: readonly string[]
) {
  const validHighlights = highlights
    .filter(
      (highlight) =>
        highlight &&
        text.includes(highlight)
    )
    .sort(
      (a, b) =>
        text.indexOf(a) -
        text.indexOf(b)
    );

  if (validHighlights.length === 0) {
    return text;
  }

  const parts: React.ReactNode[] = [];
  let currentIndex = 0;

  validHighlights.forEach(
    (highlight, index) => {
      const highlightIndex =
        text.indexOf(
          highlight,
          currentIndex
        );

      if (highlightIndex === -1) {
        return;
      }

      if (
        highlightIndex >
        currentIndex
      ) {
        parts.push(
          text.slice(
            currentIndex,
            highlightIndex
          )
        );
      }

      parts.push(
        <strong
          key={`${highlight}-${index}`}
          className="font-semibold text-[#304A39]"
        >
          {highlight}
        </strong>
      );

      currentIndex =
        highlightIndex +
        highlight.length;
    }
  );

  if (currentIndex < text.length) {
    parts.push(
      text.slice(currentIndex)
    );
  }

  return parts;
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

export default function LearnerStories({
  locale,
  reflections,
  total,
}: LearnerStoriesProps) {
  const [selectedStory, setSelectedStory] =
    useState<PublicReflection | null>(
      null
    );

  const messages = getMessages(locale);
  const content =
    messages.learnerStories;

  const visibleStories =
    reflections.slice(0, 20);

  const hasMoreStories =
    total > 20;

  const displayedCount =
    total > 20
      ? "20+"
      : String(total);

  /* ==================================================================== */
  /* MODAL SCROLL LOCK                                                    */
  /* ==================================================================== */

  useEffect(() => {
    if (!selectedStory) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [selectedStory]);

  /* ==================================================================== */
  /* ESCAPE TO CLOSE                                                      */
  /* ==================================================================== */

  useEffect(() => {
    if (!selectedStory) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setSelectedStory(null);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [selectedStory]);

  if (
    visibleStories.length === 0
  ) {
    return null;
  }

  return (
    <>
      <section
        id="learner-stories"
        className="
          relative
          overflow-hidden
          bg-[#F3EDDD]

          py-11
          sm:py-12
          lg:py-14
        "
      >
        <div
          className="
            mx-auto
            max-w-[1440px]

            px-5
            sm:px-10
            lg:px-16
          "
        >
          {/* =================================================
              HEADER
              ================================================= */}

          <div
            className="
              flex
              flex-col
              gap-6

              border-b
              border-[#718A73]/20

              pb-7

              sm:flex-row
              sm:items-end
              sm:justify-between

              lg:pb-8
            "
          >
            <div className="max-w-[760px]">
              <p
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.28em]
                  text-[#718A73]

                  sm:text-xs
                "
              >
                {content.eyebrow}
              </p>

              <h2
                className="
                  mt-3
                  max-w-[700px]

                  font-serif
                  text-[38px]
                  leading-[0.98]
                  tracking-[-0.035em]
                  text-[#304A39]

                  sm:text-[46px]
                  lg:text-[48px]
                "
              >
                {content.title}
              </h2>

              <p
                className="
                  mt-3
                  max-w-[690px]

                  text-[14px]
                  leading-6
                  text-[#758477]

                  sm:text-[15px]
                "
              >
                {renderHighlightedText(
                  content.description.text,
                  content.description.highlights
                )}
              </p>
            </div>

            {/* STORY COUNT */}

            <div className="shrink-0 sm:text-right">
              <p
                className="
                  font-serif
                  text-[58px]
                  leading-[0.8]
                  tracking-[-0.055em]
                  text-[#304A39]

                  sm:text-[68px]
                "
              >
                {displayedCount}
              </p>

              <p
                className="
                  mt-3

                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-[#718A73]
                "
              >
                {content.countLabel}
              </p>
            </div>
          </div>

          {/* =================================================
              STORIES GRID

              Mobile: 1 column
              Tablet: 2 columns
              Desktop: 4 columns × maximum 5 rows
              ================================================= */}

          <div
            className="
              mt-7

              grid
              grid-cols-1
              gap-3

              sm:grid-cols-2
              sm:gap-4

              lg:grid-cols-4
            "
          >
            {visibleStories.map(
              (story, index) => {
                const background =
                  cardBackgrounds[
                    index %
                      cardBackgrounds.length
                  ];

                const learnerDetails = [
                  story.role,
                  story.country,
                ]
                  .filter(Boolean)
                  .join(" · ");

                const withTeacher =
                  interpolate(
                    content.withTeacher,
                    {
                      name:
                        story.teacher_name,
                    }
                  );

                return (
                  <article
                    key={story.id}
                    className={`
                      flex
                      h-[225px]
                      flex-col

                      overflow-hidden

                      rounded-[22px]

                      ${background}

                      p-5

                      sm:h-[230px]

                      lg:h-[235px]
                    `}
                  >
                    {/* QUOTE */}

                    <div
                      className="
                        font-serif
                        text-[31px]
                        leading-[0.65]
                        text-[#718A73]
                      "
                      aria-hidden="true"
                    >
                      “
                    </div>

                    {/* REFLECTION PREVIEW */}

                    <blockquote
                      className="
                        mt-3
                        line-clamp-5

                        font-serif
                        text-[15px]
                        leading-[1.35]
                        tracking-[-0.012em]
                        text-[#304A39]
                      "
                    >
                      {
                        story.reflection
                      }
                    </blockquote>

                    {/* READ MORE */}

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedStory(
                          story
                        )
                      }
                      className="
                        mt-2
                        w-fit
                        shrink-0

                        text-[10px]
                        font-semibold
                        text-[#718A73]

                        underline
                        decoration-[#718A73]/30
                        underline-offset-[3px]

                        transition-colors

                        hover:text-[#304A39]
                      "
                    >
                      {content.readMore}
                    </button>

                    {/* =========================================
                        ATTRIBUTION
                        ========================================= */}

                    <div className="mt-auto pt-3">
                      <div
                        className="
                          h-px
                          w-7
                          bg-[#718A73]/25
                        "
                        aria-hidden="true"
                      />

                      <div className="mt-2.5 flex items-end justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          {/* STUDENT + TEACHER */}

                          <p
                            className="
                              truncate

                              text-[10.5px]
                              leading-[1.35]
                              text-[#52685A]
                            "
                          >
                            <span className="font-semibold">
                              {story.name}
                            </span>

                            <span className="text-[#758477]">
                              {" · "}
                            </span>

                            <span className="font-bold text-[#718A73]">
                              {
                                withTeacher
                              }
                            </span>
                          </p>

                          {/* ROLE + COUNTRY */}

                          {learnerDetails && (
                            <p
                              className="
                                mt-1
                                truncate

                                text-[9.5px]
                                leading-[1.35]
                                text-[#758477]
                              "
                            >
                              {
                                learnerDetails
                              }
                            </p>
                          )}
                        </div>

                        {/* OPTIONAL LEARNER PHOTO */}

                        {story.photo_url && (
                          <div
                            className="
                              relative

                              h-[42px]
                              w-[42px]
                              shrink-0

                              overflow-hidden
                              rounded-full
                              border
                              border-[#718A73]/20
                              bg-[#FFFDF8]
                            "
                          >
                            <Image
                              src={
                                story.photo_url
                              }
                              alt=""
                              fill
                              sizes="42px"
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>

          {/* =================================================
              CLOSING
              ================================================= */}

          <div
            className="
              mt-7

              flex
              flex-col
              gap-5

              border-t
              border-[#718A73]/20

              pt-5

              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <p
              className="
                max-w-[650px]

                text-[12px]
                leading-5
                text-[#758477]
              "
            >
              {renderHighlightedText(
                content.closing.text,
                content.closing.highlights
              )}
            </p>

            {hasMoreStories && (
              <div
                className="
                  relative

                  w-full
                  shrink-0

                  sm:w-fit
                "
              >
                <div
                  className="
                    absolute
                    inset-0

                    translate-y-[7px]

                    rounded-[20px]
                    bg-[#D8C9AA]
                  "
                  aria-hidden="true"
                />

                <Link
                  href={`/${locale}/reflections`}
                  className="
                    group
                    relative
                    z-10

                    flex
                    min-h-[54px]
                    w-full
                    items-center
                    justify-between
                    gap-8

                    rounded-[20px]
                    bg-[#E9DFC9]

                    px-6

                    text-[13px]
                    font-semibold
                    text-[#304A39]

                    transition-transform
                    duration-200

                    hover:-translate-y-[2px]

                    active:translate-y-[3px]

                    sm:min-w-[270px]
                  "
                >
                  <span>
                    {content.explore}
                  </span>

                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="
                      h-[15px]
                      w-[15px]
                      shrink-0

                      transition-transform
                      duration-200

                      group-hover:translate-x-1
                    "
                    aria-hidden="true"
                  >
                    <path
                      d="M3 8H13M9 4L13 8L9 12"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          FULL REFLECTION MODAL
          ===================================================== */}

      {selectedStory && (
        <div
          className="
            fixed
            inset-0
            z-[100]

            flex
            items-center
            justify-center

            bg-[#293A30]/45

            p-4

            backdrop-blur-[2px]

            sm:p-6
          "
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedStory(
                null
              );
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={interpolate(
              content.modal.ariaLabel,
              {
                name:
                  selectedStory.name,
              }
            )}
            className="
              relative

              max-h-[85vh]
              w-full
              max-w-[620px]

              overflow-y-auto

              rounded-[26px]
              bg-[#FFFDF8]

              px-6
              pb-7
              pt-6

              shadow-[0_24px_80px_rgba(48,74,57,0.20)]

              sm:px-8
              sm:pb-8
              sm:pt-8
            "
          >
            {/* CLOSE */}

            <button
              type="button"
              onClick={() =>
                setSelectedStory(null)
              }
              aria-label={
                content.modal.close
              }
              className="
                absolute
                right-5
                top-5

                flex
                h-8
                w-8
                items-center
                justify-center

                rounded-full
                border
                border-[#718A73]/20

                text-[#718A73]

                transition-colors

                hover:bg-[#DCE4D7]
                hover:text-[#304A39]
              "
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="
                  h-[14px]
                  w-[14px]
                "
                aria-hidden="true"
              >
                <path
                  d="M3 3L13 13M13 3L3 13"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* QUOTE */}

            <div
              className="
                font-serif
                text-[52px]
                leading-[0.7]
                text-[#718A73]
              "
              aria-hidden="true"
            >
              “
            </div>

            {/* FULL REFLECTION */}

            <blockquote
              className="
                mt-5
                whitespace-pre-line
                pr-6

                font-serif
                text-[20px]
                leading-[1.55]
                tracking-[-0.015em]
                text-[#304A39]

                sm:text-[22px]
              "
            >
              {
                selectedStory.reflection
              }
            </blockquote>

            {/* MODAL ATTRIBUTION */}

            <div
              className="
                mt-8

                border-t
                border-[#718A73]/15

                pt-5
              "
            >
              <div className="flex items-end justify-between gap-5">
                <div className="min-w-0">
                  <p
                    className="
                      text-[12px]
                      leading-[1.5]
                      text-[#52685A]
                    "
                  >
                    <span className="font-semibold">
                      {
                        selectedStory.name
                      }
                    </span>

                    <span className="text-[#758477]">
                      {" · "}
                    </span>

                    <span className="font-bold text-[#718A73]">
                      {interpolate(
                        content.withTeacher,
                        {
                          name:
                            selectedStory.teacher_name,
                        }
                      )}
                    </span>
                  </p>

                  {[
                    selectedStory.role,
                    selectedStory.country,
                  ].filter(Boolean)
                    .length > 0 && (
                    <p
                      className="
                        mt-1

                        text-[11px]
                        text-[#758477]
                      "
                    >
                      {[
                        selectedStory.role,
                        selectedStory.country,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>

                {selectedStory.photo_url && (
                  <div
                    className="
                      relative

                      h-[56px]
                      w-[56px]
                      shrink-0

                      overflow-hidden
                      rounded-full
                      border
                      border-[#718A73]/20
                      bg-[#F3EDDD]
                    "
                  >
                    <Image
                      src={
                        selectedStory.photo_url
                      }
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}