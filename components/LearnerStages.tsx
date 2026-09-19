import Image from "next/image";

import type { Locale } from "../lib/i18n";
import { getMessages } from "../lib/getMessages";

type LearnerStagesProps = {
  locale: Locale;
};

/* =====================================================
   SELECTIVE EMPHASIS
   ===================================================== */

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

export default function LearnerStages({
  locale,
}: LearnerStagesProps) {
  const messages = getMessages(locale);
  const content =
    messages.learnerStages;

  const stages = [
    {
      ...content.stages.kids,
      background: "#DCE4D7",
      accent: "#304A39",
      marker: "#718A73",
    },
    {
      ...content.stages.teens,
      background: "#EDE3D2",
      accent: "#B17F5D",
      marker: "#B17F5D",
    },
    {
      ...content.stages.adults,
      background: "#F3E5BE",
      accent: "#B7903D",
      marker: "#B7903D",
    },
  ];

  return (
    <section
      id="learner-stages"
      className="
        relative
        overflow-hidden
        bg-[#FFFDF8]

        py-10
        sm:py-11
        lg:py-10
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
        {/* =====================================================
            HEADING
            ===================================================== */}

        <div>
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

              font-serif
              text-[36px]
              leading-[1]
              tracking-[-0.035em]
              text-[#304A39]

              sm:text-5xl

              lg:whitespace-nowrap
              lg:text-[52px]
            "
          >
            {content.title}
          </h2>

          <p
            className="
              mt-4
              max-w-[900px]

              text-[14px]
              leading-[1.65]
              text-[#758477]

              sm:text-base
            "
          >
            {renderHighlightedText(
              content.description.text,
              content.description.highlights
            )}
          </p>
        </div>

        {/* =====================================================
            DESKTOP STAIRCASE
            ===================================================== */}

        <div className="relative mt-7 hidden lg:block">
          <div className="relative flex min-h-[350px] items-end">
            {/* CLIMBING MASCOT */}

            <div
              className="
                absolute
                bottom-[37px]
                left-[9%]
                z-20

                h-[235px]
                w-[230px]

                xl:h-[255px]
                xl:w-[250px]
              "
              aria-hidden="true"
            >
              <Image
                src="/mascot/hamkke-learner-stages-climbing.png"
                alt=""
                fill
                sizes="250px"
                className="
                  object-contain
                  object-bottom
                "
              />
            </div>

            {/* =====================================================
                STAIRS
                ===================================================== */}

            <div className="relative ml-[7%] flex items-end">
              {/* GROWTH ARROW */}

              <div
                className="
                  pointer-events-none
                  absolute

                  bottom-[160px]
                  left-[-50px]
                  z-30

                  h-[275px]
                  w-[calc(100%-30px)]
                "
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 1200 275"
                  preserveAspectRatio="none"
                  className="
                    h-full
                    w-full
                    overflow-visible
                  "
                >
                  <defs>
                    <marker
                      id="learner-growth-arrow"
                      markerWidth="8"
                      markerHeight="8"
                      refX="7"
                      refY="4"
                      orient="auto"
                      markerUnits="strokeWidth"
                    >
                      <path
                        d="M0,0 L8,4 L0,8 Z"
                        fill="#718A73"
                      />
                    </marker>
                  </defs>

                  <path
                    d="
                      M 105 265
                      L 135 265

                      C 150 265, 160 260, 170 250
                      L 205 215
                      C 215 205, 225 200, 240 200

                      L 430 200

                      C 445 200, 455 195, 465 185
                      L 495 155
                      C 505 145, 515 140, 530 140

                      L 720 140

                      C 735 140, 745 135, 755 125
                      L 785 95
                      C 795 85, 805 80, 820 80

                      L 1010 80

                      C 1025 80, 1035 75, 1045 65
                      L 1075 35
                      C 1085 25, 1095 20, 1110 20

                      L 1210 20

                      C 1222 20, 1232 17, 1242 10
                      L 1300 -35
                    "
                    fill="none"
                    stroke="#718A73"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    markerEnd="url(#learner-growth-arrow)"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>

              {/* =====================================================
                  START
                  ===================================================== */}

              <div
                className="
                  flex
                  h-[70px]
                  w-[170px]
                  shrink-0
                  items-start

                  rounded-tl-[20px]
                  bg-[#E5EBDD]

                  px-5
                  pt-6
                "
              >
                <p
                  className="
                    whitespace-nowrap

                    font-serif
                    text-[16px]
                    italic
                    leading-[1.2]
                    text-[#718A73]
                  "
                >
                  {content.start.text}
                </p>
              </div>

              {/* =====================================================
                  KIDS
                  ===================================================== */}

              <div
                className="
                  flex
                  h-[165px]
                  w-[300px]
                  shrink-0
                  flex-col
                  items-start

                  rounded-tl-[20px]
                  bg-[#DCE4D7]

                  px-6
                  pt-6
                "
              >
                <h3
                  className="
                    font-serif
                    text-[30px]
                    leading-none
                    text-[#304A39]
                  "
                >
                  {content.stages.kids.title}
                </h3>

                <p
                  className="
                    mt-2
                    whitespace-nowrap

                    font-serif
                    text-[17px]
                    leading-[1.15]
                    text-[#304A39]
                  "
                >
                  {content.stages.kids.tagline}
                </p>

                <p
                  className="
                    mt-5

                    text-[12.5px]
                    leading-[1.45]
                    text-[#52685A]
                  "
                >
                  {content.stages.kids.description}
                </p>
              </div>

              {/* =====================================================
                  TEENS
                  ===================================================== */}

              <div
                className="
                  flex
                  h-[210px]
                  w-[300px]
                  shrink-0
                  flex-col
                  items-start

                  rounded-tl-[20px]
                  bg-[#EDE3D2]

                  px-6
                  pt-6
                "
              >
                <h3
                  className="
                    font-serif
                    text-[30px]
                    leading-none
                    text-[#B17F5D]
                  "
                >
                  {content.stages.teens.title}
                </h3>

                <p
                  className="
                    mt-2

                    font-serif
                    text-[17px]
                    leading-[1.15]
                    text-[#304A39]
                  "
                >
                  {content.stages.teens.tagline}
                </p>

                <p
                  className="
                    mt-5

                    text-[12.5px]
                    leading-[1.45]
                    text-[#52685A]
                  "
                >
                  {content.stages.teens.description}
                </p>
              </div>

              {/* =====================================================
                  ADULTS
                  ===================================================== */}

              <div
                className="
                  flex
                  h-[260px]
                  w-[300px]
                  shrink-0
                  flex-col
                  items-start

                  rounded-tl-[20px]
                  bg-[#F3E5BE]

                  px-6
                  pt-6
                "
              >
                <h3
                  className="
                    font-serif
                    text-[30px]
                    leading-none
                    text-[#B7903D]
                  "
                >
                  {content.stages.adults.title}
                </h3>

                <p
                  className="
                    mt-2

                    font-serif
                    text-[17px]
                    leading-[1.15]
                    text-[#304A39]
                  "
                >
                  {content.stages.adults.tagline}
                </p>

                <p
                  className="
                    mt-5

                    text-[12.5px]
                    leading-[1.45]
                    text-[#52685A]
                  "
                >
                  {content.stages.adults.description}
                </p>
              </div>

              {/* =====================================================
                  FURTHER
                  ===================================================== */}

              <div
                className="
                  flex
                  h-[325px]
                  w-[155px]
                  shrink-0
                  items-start

                  rounded-t-[20px]
                  bg-[#F1EADF]

                  px-5
                  pt-7
                "
              >
                <p
                  className="
                    font-serif
                    text-[16px]
                    italic
                    leading-[1.2]
                    text-[#718A73]
                  "
                >
                  {content.further}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            MOBILE / TABLET JOURNEY
            ===================================================== */}

        <div className="mt-7 lg:hidden">
          {/* =====================================================
              STARTING POINT
              ===================================================== */}

          <div
            className="
              rounded-[18px]
              bg-[#E5EBDD]

              px-5
              py-4

              sm:px-6
              sm:py-5
            "
          >
            <div className="flex items-center gap-3">
              <span
                className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center

                  rounded-full
                  bg-[#FFFDF8]

                  text-[11px]
                  font-semibold
                  text-[#718A73]
                "
              >
                {content.start.number}
              </span>

              <p
                className="
                  font-serif
                  text-[17px]
                  italic
                  leading-none
                  text-[#718A73]
                "
              >
                {content.start.text}
              </p>
            </div>
          </div>

          {/* =====================================================
              PROGRESS LINE + STAGES
              ===================================================== */}

          <div className="relative mt-3 pl-5 sm:pl-7">
            {/* VERTICAL GROWTH LINE */}

            <div
              className="
                absolute

                bottom-6
                left-[13px]
                top-0

                w-px
                bg-[#A8BCA5]

                sm:left-[17px]
              "
              aria-hidden="true"
            />

            {/* =====================================================
                STAGE CARDS
                ===================================================== */}

            {stages.map((stage) => (
              <div
                key={stage.number}
                className="
                  relative
                  pb-3
                  pl-5

                  sm:pl-7
                "
              >
                <span
                  className="
                    absolute

                    -left-[12px]
                    top-7
                    z-10

                    h-[9px]
                    w-[9px]

                    rounded-full
                    border-2
                    bg-[#FFFDF8]

                    sm:-left-[14px]
                  "
                  style={{
                    borderColor: stage.marker,
                  }}
                  aria-hidden="true"
                />

                <div
                  className="
                    rounded-[20px]

                    px-5
                    py-6

                    sm:px-7
                    sm:py-7
                  "
                  style={{
                    backgroundColor:
                      stage.background,
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3
                      className="
                        font-serif
                        text-[30px]
                        leading-none
                      "
                      style={{
                        color: stage.accent,
                      }}
                    >
                      {stage.title}
                    </h3>

                    <span
                      className="
                        pt-1

                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.2em]
                      "
                      style={{
                        color: stage.marker,
                      }}
                    >
                      {stage.number}
                    </span>
                  </div>

                  <p
                    className="
                      mt-3

                      font-serif
                      text-[20px]
                      font-normal
                      leading-[1.15]
                      text-[#304A39]
                    "
                  >
                    {stage.tagline}
                  </p>

                  <p
                    className="
                      mt-4

                      text-[13.5px]
                      leading-[1.65]
                      text-[#52685A]

                      sm:text-sm
                    "
                  >
                    {stage.description}
                  </p>
                </div>
              </div>
            ))}

            {/* =====================================================
                FURTHER
                ===================================================== */}

            <div className="relative pl-5 sm:pl-7">
              <span
                className="
                  absolute

                  -left-[14px]
                  top-5
                  z-10

                  flex
                  h-[13px]
                  w-[13px]
                  items-center
                  justify-center

                  rounded-full
                  bg-[#718A73]

                  sm:-left-[16px]
                "
                aria-hidden="true"
              >
                <span
                  className="
                    h-[5px]
                    w-[5px]
                    rounded-full
                    bg-[#FFFDF8]
                  "
                />
              </span>

              <div
                className="
                  rounded-[18px]
                  bg-[#F1EADF]

                  px-5
                  py-4

                  sm:px-6
                  sm:py-5
                "
              >
                <div className="flex items-center justify-between gap-4">
                  <p
                    className="
                      font-serif
                      text-[17px]
                      italic
                      leading-none
                      text-[#718A73]
                    "
                  >
                    {content.further}
                  </p>

                  <span
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.2em]
                      text-[#8A998C]
                    "
                  >
                    {content.keepGrowing}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}