interface HeroContentProps {
  onStartConversation: () => void;
}

export default function HeroContent({
  onStartConversation,
}: HeroContentProps) {
  return (
    <div className="order-2 lg:order-1">

      <p
        className="
          mb-6
          text-xs
          font-medium
          uppercase
          tracking-[0.35em]
          text-[#6F8F72]
        "
      >
        English Coaching
      </p>

      <h1
        className="
          max-w-[620px]
          text-[44px]
          leading-[0.97]
          text-[#2B2B2B]
          [font-family:var(--font-cormorant)]
          sm:text-[58px]
          lg:text-[76px]
        "
      >
        Every meaningful conversation starts somewhere.
      </h1>

      <p
        className="
          mt-8
          max-w-[480px]
          text-lg
          leading-9
          text-[#5B5B5B]
          md:text-[20px]
        "
      >
        Build the confidence to express your ideas, share your thoughts, and connect naturally through meaningful English conversations.
      </p>

      <div
        className="
          mt-10
          flex
          flex-col
          gap-4
          sm:flex-row
        "
      >
        <button
          onClick={onStartConversation}
          className="
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
          "
        >
          Explore Lessons
        </a>
      </div>

    </div>
  );
}