interface HeroContentProps {
  onStartConversation: () => void;
}

export default function HeroContent({
  onStartConversation,
}: HeroContentProps) {
  return (
    <div
  className="
    fade-left
    flex
    flex-col
    justify-center
  "
>
      {/* Section Label */}

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
        English Coaching
      </p>

      {/* Heading */}

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

      {/* Description */}

      <p
        className="
          mt-6
          max-w-[400px]
          text-[18px]
          leading-8
          text-[#5B5B5B]

          sm:mt-7
          sm:max-w-[430px]
          sm:text-[19px]

          md:max-w-[480px]
          md:text-[20px]
          md:leading-9
        "
      >
        Build the confidence to express your ideas, share your thoughts, and
        connect naturally through meaningful English conversations.
      </p>

      {/* Buttons */}

      <div
        className="
          mt-8
          flex
          flex-col
          gap-4

          sm:mt-9
          lg:mt-10
          sm:flex-row
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
    </div>
  );
}