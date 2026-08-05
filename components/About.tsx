import {
  MessageCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const values = [
  {
    icon: MessageCircle,
    title: "Real Conversations",
    text: "Practice English through authentic conversations that help you communicate naturally in everyday situations.",
  },
  {
    icon: Sparkles,
    title: "Personalized Coaching",
    text: "Every lesson is tailored to your goals, interests, learning style, and pace so your progress feels personal.",
  },
  {
    icon: TrendingUp,
    title: "Confidence Through Practice",
    text: "Confidence grows through meaningful practice. Each conversation helps you become more comfortable expressing yourself naturally.",
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="
        relative
        overflow-hidden
        bg-gradient-to-b
        from-[#FAF8F5]
        via-[#F8F8F5]
        to-[#EEF5EE]
        pt-24
        pb-32
      "
    >
      {/* Background Glow */}

      <div
        className="
          pointer-events-none
          absolute
          right-[-220px]
          top-16
          h-[380px]
          w-[380px]
          rounded-full
          bg-[#DCE9D8]
          opacity-40
          blur-3xl
        "
      />

      <div
        className="
          relative
          mx-auto
          max-w-7xl
          px-6
          lg:px-10
        "
      >
        {/* Heading */}

        <div className="mb-24 max-w-2xl">

          <p
            className="
              mb-6
              text-sm
              font-medium
              uppercase
              tracking-[0.32em]
              text-[#6F8F72]
            "
          >
            About TalkSeed
          </p>

          <h2
            className="
              text-[42px]
              leading-[1.08]
              tracking-[-0.02em]
              text-[#2B2B2B]
              [font-family:var(--font-cormorant)]
              sm:text-[52px]
              lg:text-[60px]
            "
          >
            English is more than speaking.
            <br />
            It's about expressing who you are.
          </h2>

          <p
            className="
              mt-10
              text-lg
              leading-9
              text-[#5B5B5B]
            "
          >
            At TalkSeed, learning begins with genuine conversation.
            Instead of memorizing scripts or focusing only on grammar,
            you'll practice expressing your ideas, sharing your
            experiences, and building confidence through meaningful
            discussions that feel natural, engaging, and enjoyable.
          </p>

        </div>

        {/* Values */}

        <div
          className="
            grid
            gap-10
            md:grid-cols-3
          "
        >
          {values.map((value, index) => {

            const Icon = value.icon;

            return (

              <div
                key={index}
                className="
                  rounded-[2rem]
                  border
                  border-white/70
                  bg-[#FCFBF9]/90
                  p-10
                  shadow-[0_12px_35px_rgba(0,0,0,0.05)]
                  backdrop-blur-sm
                  transition-all
                  duration-500
                  hover:-translate-y-1
                  hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)]
                "
              >

                <div
                  className="
                    mb-6
                    flex
                    items-center
                    gap-3
                  "
                >

                  <Icon
                    className="
                      h-6
                      w-6
                      shrink-0
                      text-[#6F8F72]
                    "
                  />

                  <h3
                    className="
                      text-[30px]
                      leading-none
                      text-[#2B2B2B]
                      [font-family:var(--font-cormorant)]
                    "
                  >
                    {value.title}
                  </h3>

                </div>

                <p
                  className="
                    text-[16px]
                    leading-8
                    text-[#5B5B5B]
                  "
                >
                  {value.text}
                </p>

              </div>

            );

          })}
        </div>

      </div>

    </section>
  );
}