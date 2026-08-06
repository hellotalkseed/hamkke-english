import FadeUp from "./animations/FadeUp";

interface HeroContentProps {
  onStartConversation: () => void;
}

export default function HeroContent({
  onStartConversation,
}: HeroContentProps) {
  return (
    <FadeUp>
      <div
        className="
          flex
          flex-col
          justify-center
        "
      >

        {/* Section Label */}

        <FadeUp delay={0.1}>
          <p
            className="
              mb-5
              text-[12px]
              font-medium
              uppercase
              tracking-[0.35em]
              text-[#6F8F72]

              sm:mb-6
            "
          >
            Hamkke │ 함께
          </p>
        </FadeUp>


        {/* Subtitle */}

        <FadeUp delay={0.15}>
          <p
            className="
              mb-5
              text-[13px]
              font-medium
              uppercase
              tracking-[0.28em]
              text-[#6F8F72]

              sm:text-sm
            "
          >
            English Conversations That Matter
          </p>
        </FadeUp>


        {/* Heading */}

        <FadeUp delay={0.25}>
          <h1
            className="
              max-w-[620px]
              text-[42px]
              leading-[0.98]
              text-[#2B2B2B]
              [font-family:var(--font-cormorant)]

              sm:text-[52px]
              md:text-[60px]
              lg:text-[76px]
            "
          >
            Every meaningful conversation starts somewhere.
          </h1>
        </FadeUp>


        {/* Description */}

        <FadeUp delay={0.35}>
          <p
            className="
              mt-6
              max-w-[560px]
              text-[17px]
              leading-8
              text-[#5B5B5B]

              sm:mt-7
              sm:text-lg
              sm:leading-9
            "
          >
            Improve your English naturally through conversations
            that grow from everyday topics into meaningful
            discussions.
          </p>
        </FadeUp>


        {/* Buttons */}

        <FadeUp delay={0.45}>
          <div
            className="
              mt-8
              flex
              flex-col
              gap-5

              sm:mt-9
              sm:flex-row

              lg:mt-10
            "
          >

            <button
              onClick={onStartConversation}
              className="
                w-full
                rounded-full
                bg-[#6F8F72]
                px-10
                py-5
                text-lg
                font-medium
                text-white
                shadow-lg
                shadow-[#6F8F72]/20
                transition-all
                duration-300
                hover:-translate-y-1
                hover:bg-[#5B7960]
                hover:shadow-xl

                sm:w-auto
              "
            >
              Start a Conversation
            </button>


            <a
              href="#lessons"
              className="
                w-full
                rounded-full
                border
                border-[#6F8F72]
                px-10
                py-5
                text-center
                text-lg
                font-medium
                text-[#6F8F72]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:bg-[#EEF5EE]

                sm:w-auto
              "
            >
              Explore Lessons
            </a>

          </div>
        </FadeUp>


      </div>
    </FadeUp>
  );
}