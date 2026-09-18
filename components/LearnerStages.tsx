import Image from "next/image";
import type { Locale } from "../lib/i18n";

type LearnerStagesProps = {
  locale: Locale;
};

export default function LearnerStages({
  locale,
}: LearnerStagesProps) {
  return (
    <section
      id="learner-stages"
      className="relative overflow-hidden bg-[#FFFDF8] py-10 sm:py-11 lg:py-10"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16">
        {/* =====================================================
            HEADING
            ===================================================== */}

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#718A73] sm:text-xs">
            For Every Stage
          </p>

          <h2 className="mt-3 font-serif text-[36px] leading-[1] tracking-[-0.035em] text-[#304A39] sm:text-5xl lg:whitespace-nowrap lg:text-[52px]">
            The conversation changes as you grow.
          </h2>

          <p className="mt-4 max-w-[900px] text-[14px] leading-[1.65] text-[#758477] sm:text-base">
            A child finding the words for a story, a teenager learning to
            explain an opinion, and an adult trying to say exactly what they
            mean. The goal may change, but we meet every learner where the
            conversation begins.
          </p>
        </div>

        {/* =====================================================
            DESKTOP STAIRCASE
            UNCHANGED
            ===================================================== */}

        <div className="relative mt-7 hidden lg:block">
          <div className="relative flex min-h-[350px] items-end">
            {/* Climbing mascot */}

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
                className="object-contain object-bottom"
              />
            </div>

            {/* Stairs */}

            <div className="relative ml-[7%] flex items-end">
              {/* Growth arrow */}

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
                  className="h-full w-full overflow-visible"
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

              {/* Start */}

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
                <p className="whitespace-nowrap font-serif text-[16px] italic leading-[1.2] text-[#718A73]">
                  Start where you are.
                </p>
              </div>

              {/* Kids */}

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
                <h3 className="font-serif text-[30px] leading-none text-[#304A39]">
                  Kids
                </h3>

                <p className="mt-2 whitespace-nowrap font-serif text-[17px] leading-[1.15] text-[#304A39]">
                  Turn answers into conversations.
                </p>

                <p className="mt-5 text-[12.5px] leading-[1.45] text-[#52685A]">
                  Build confidence speaking through stories, questions,
                  everyday topics, and plenty of chances to express their own
                  ideas.
                </p>
              </div>

              {/* Teens */}

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
                <h3 className="font-serif text-[30px] leading-none text-[#B17F5D]">
                  Teens
                </h3>

                <p className="mt-2 font-serif text-[17px] leading-[1.15] text-[#304A39]">
                  Have more to say, and learn how to say it.
                </p>

                <p className="mt-5 text-[12.5px] leading-[1.45] text-[#52685A]">
                  Move beyond short answers by developing opinions, explaining
                  reasons, asking questions, and expressing increasingly
                  complex ideas in English.
                </p>
              </div>

              {/* Adults */}

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
                <h3 className="font-serif text-[30px] leading-none text-[#B7903D]">
                  Adults
                </h3>

                <p className="mt-2 font-serif text-[17px] leading-[1.15] text-[#304A39]">
                  Make English sound more like you.
                </p>

                <p className="mt-5 text-[12.5px] leading-[1.45] text-[#52685A]">
                  Use English for the conversations that matter to you, while
                  refining the vocabulary, structure, and expression you need
                  along the way.
                </p>
              </div>

              {/* Further */}

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
                <p className="font-serif text-[16px] italic leading-[1.2] text-[#718A73]">
                  Further
                  <br />
                  together.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            MOBILE / TABLET JOURNEY
            Separate layout — no mascot
            ===================================================== */}

        <div className="mt-7 lg:hidden">
          {/* Starting point */}

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
                01
              </span>

              <p className="font-serif text-[17px] italic leading-none text-[#718A73]">
                Start where you are.
              </p>
            </div>
          </div>

          {/* Progress line + stages */}

          <div className="relative mt-3 pl-5 sm:pl-7">
            {/* Vertical growth line */}

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

            {/* Kids */}

            <div className="relative pb-3 pl-5 sm:pl-7">
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
                  border-[#718A73]
                  bg-[#FFFDF8]
                  sm:-left-[14px]
                "
                aria-hidden="true"
              />

              <div
                className="
                  rounded-[20px]
                  bg-[#DCE4D7]
                  px-5
                  py-6
                  sm:px-7
                  sm:py-7
                "
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-serif text-[30px] leading-none text-[#304A39]">
                    Kids
                  </h3>

                  <span className="pt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#718A73]">
                    02
                  </span>
                </div>

                <p className="mt-3 font-serif text-[20px] leading-[1.15] text-[#304A39]">
                  Turn answers into conversations.
                </p>

                <p className="mt-4 text-[13.5px] leading-[1.65] text-[#52685A] sm:text-sm">
                  Build confidence speaking through stories, questions,
                  everyday topics, and plenty of chances to express their own
                  ideas.
                </p>
              </div>
            </div>

            {/* Teens */}

            <div className="relative pb-3 pl-5 sm:pl-7">
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
                  border-[#B17F5D]
                  bg-[#FFFDF8]
                  sm:-left-[14px]
                "
                aria-hidden="true"
              />

              <div
                className="
                  rounded-[20px]
                  bg-[#EDE3D2]
                  px-5
                  py-6
                  sm:px-7
                  sm:py-7
                "
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-serif text-[30px] leading-none text-[#B17F5D]">
                    Teens
                  </h3>

                  <span className="pt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A77A5C]">
                    03
                  </span>
                </div>

                <p className="mt-3 font-serif text-[20px] leading-[1.15] text-[#304A39]">
                  Have more to say, and learn how to say it.
                </p>

                <p className="mt-4 text-[13.5px] leading-[1.65] text-[#52685A] sm:text-sm">
                  Move beyond short answers by developing opinions, explaining
                  reasons, asking questions, and expressing increasingly
                  complex ideas in English.
                </p>
              </div>
            </div>

            {/* Adults */}

            <div className="relative pb-3 pl-5 sm:pl-7">
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
                  border-[#B7903D]
                  bg-[#FFFDF8]
                  sm:-left-[14px]
                "
                aria-hidden="true"
              />

              <div
                className="
                  rounded-[20px]
                  bg-[#F3E5BE]
                  px-5
                  py-6
                  sm:px-7
                  sm:py-7
                "
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-serif text-[30px] leading-none text-[#B7903D]">
                    Adults
                  </h3>

                  <span className="pt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A7863C]">
                    04
                  </span>
                </div>

                <p className="mt-3 font-serif text-[20px] leading-[1.15] text-[#304A39]">
                  Make English sound more like you.
                </p>

                <p className="mt-4 text-[13.5px] leading-[1.65] text-[#52685A] sm:text-sm">
                  Use English for the conversations that matter to you, while
                  refining the vocabulary, structure, and expression you need
                  along the way.
                </p>
              </div>
            </div>

            {/* Further */}

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
                <span className="h-[5px] w-[5px] rounded-full bg-[#FFFDF8]" />
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
                  <p className="font-serif text-[17px] italic leading-none text-[#718A73]">
                    Further together.
                  </p>

                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8A998C]">
                    Keep growing
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