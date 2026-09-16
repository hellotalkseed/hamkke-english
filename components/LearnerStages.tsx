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
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16">
        {/* Heading */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#718A73] sm:text-xs">
            For Every Stage
          </p>

          <h2 className="mt-3 font-serif text-[40px] leading-[0.98] tracking-[-0.035em] text-[#304A39] sm:text-5xl lg:whitespace-nowrap lg:text-[52px]">
            The conversation changes as you grow.
          </h2>

          <p className="mt-4 max-w-[900px] text-[15px] leading-6 text-[#758477] sm:text-base">
            A child finding the words for a story, a teenager learning to
            explain an opinion, and an adult trying to say exactly what they
            mean. The goal may change, but we meet every learner where the
            conversation begins.
          </p>
        </div>

        {/* Desktop staircase */}
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

        {/* Mobile / tablet */}
        <div className="mt-8 lg:hidden">
          {/* Climbing mascot */}
          <div className="mb-[-8px] ml-2">
            <div
              className="
                relative
                h-[170px]
                w-[165px]
                sm:h-[200px]
                sm:w-[195px]
              "
              aria-hidden="true"
            >
              <Image
                src="/mascot/hamkke-learner-stages-climbing.png"
                alt=""
                fill
                sizes="195px"
                className="object-contain object-bottom"
              />
            </div>
          </div>

          {/* Start */}
          <div className="rounded-tl-[20px] bg-[#E5EBDD] px-6 py-5">
            <p className="font-serif text-[17px] italic leading-[1.15] text-[#718A73]">
              Start where you are.
            </p>
          </div>

          {/* Kids */}
          <div className="ml-[4%] bg-[#DCE4D7] p-6 sm:ml-[6%] sm:p-8">
            <h3 className="font-serif text-3xl text-[#304A39]">
              Kids
            </h3>

            <p className="mt-2 font-serif text-xl leading-tight text-[#304A39] sm:whitespace-nowrap">
              Turn answers into conversations.
            </p>

            <p className="mt-5 max-w-[520px] text-sm leading-6 text-[#52685A]">
              Build confidence speaking through stories, questions, everyday
              topics, and plenty of chances to express their own ideas.
            </p>
          </div>

          {/* Teens */}
          <div className="ml-[8%] bg-[#EDE3D2] p-6 sm:ml-[12%] sm:p-8">
            <h3 className="font-serif text-3xl text-[#B17F5D]">
              Teens
            </h3>

            <p className="mt-2 max-w-[520px] font-serif text-xl leading-tight text-[#304A39]">
              Have more to say, and learn how to say it.
            </p>

            <p className="mt-5 max-w-[520px] text-sm leading-6 text-[#52685A]">
              Move beyond short answers by developing opinions, explaining
              reasons, asking questions, and expressing increasingly complex
              ideas in English.
            </p>
          </div>

          {/* Adults */}
          <div className="ml-[12%] bg-[#F3E5BE] p-6 sm:ml-[18%] sm:p-8">
            <h3 className="font-serif text-3xl text-[#B7903D]">
              Adults
            </h3>

            <p className="mt-2 max-w-[520px] font-serif text-xl leading-tight text-[#304A39]">
              Make English sound more like you.
            </p>

            <p className="mt-5 max-w-[520px] text-sm leading-6 text-[#52685A]">
              Use English for the conversations that matter to you, while
              refining the vocabulary, structure, and expression you need along
              the way.
            </p>
          </div>

          {/* Further */}
          <div className="ml-[16%] rounded-br-[20px] bg-[#F1EADF] px-6 py-5 sm:ml-[24%]">
            <p className="font-serif text-[17px] italic leading-[1.15] text-[#718A73]">
              Further together.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}