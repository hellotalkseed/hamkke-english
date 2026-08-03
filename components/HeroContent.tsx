interface HeroContentProps {
  onStartConversation: () => void;
}

export default function HeroContent({
  onStartConversation,
}: HeroContentProps) {
  return (
    <div>

      <p
        className="
          mb-5
          text-[11px]
          font-medium
          uppercase
          tracking-[0.35em]
          text-[#6F8F72]
          sm:text-xs
        "
      >
        English Coaching
      </p>

      <h1
        className="
          max-w-[620px]
          text-[36px]
          leading-[1]
          text-[#2B2B2B]
          [font-family:var(--font-cormorant)]
          sm:text-[52px]
          lg:text-[76px]
        "
      >
        Every meaningful conversation starts somewhere.
      </h1>

      <p
        className="
          mt-6
          max-w-[480px]
          text-base
          leading-8
          text-[#5B5B5B]
          sm:text-lg
          md:text-[20px]
          md:leading-9
        "
      >
        Build the confidence to express your ideas, share your thoughts, and
        connect naturally through meaningful English conversations.
      </p>

      <div
        className="
          mt-8
          flex
          flex-col
          gap-3
          sm:mt-10
          sm:flex-row
          sm:gap-4
        "
      >
        <button
          onClick={onStartConversation}
          className="
            rounded-full
            bg-[#6F8F72]
            px-8
            py-4
            text-base
            font-medium
            text-white
            shadow-lg
            shadow-[#6F8F72]/20
            transition-all
            duration-300
            hover:-translate-y-1
            hover:bg-[#5B7960]
            hover:shadow-xl
            sm:px-10
            sm:py-5
            sm:text-lg
          "
        >
          Start a Conversation
        </button>

        <a
          href="#lessons"
          className="
            rounded-full
            border
            border-[#6F8F72]
            px-8
            py-4
            text-center
            text-base
            font-medium
            text-[#6F8F72]
            transition-all
            duration-300
            hover:-translate-y-1
            hover:bg-[#EEF5EE]
            sm:px-10
            sm:py-5
            sm:text-lg
          "
        >
          Explore Lessons
        </a>
      </div>

    </div>
  );
}