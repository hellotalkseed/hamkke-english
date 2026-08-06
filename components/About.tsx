import {
  MessageCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import SectionHeader from "./SectionHeader";
import StaggerContainer from "./animations/StaggerContainer";
import StaggerItem from "./animations/StaggerItem";

const values = [
  {
    icon: MessageCircle,
    title: "Real Conversations",
    text: "Practice English through authentic conversations that help you communicate naturally in everyday situations.",
  },
  {
    icon: Sparkles,
    title: "Personalized Coaching",
    text: "Every lesson is designed around your goals, interests, learning style, and pace so your progress feels personal.",
  },
  {
    icon: TrendingUp,
    title: "Confidence Through Practice",
    text: "Confidence grows through meaningful practice. Each conversation helps you express yourself more comfortably and naturally.",
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="
        relative
        overflow-hidden
        bg-[#F8F8F5]
        py-20

        sm:py-24
        lg:py-32
      "
    >

      {/* Background Glow */}

      <div
        className="
          pointer-events-none
          absolute
          right-[-180px]
          top-20
          h-[320px]
          w-[320px]
          rounded-full
          bg-[#DCE9D8]
          opacity-40
          blur-3xl

          sm:h-[380px]
          sm:w-[380px]
        "
      />


      <div
        className="
          relative
          mx-auto
          max-w-7xl
          px-6

          md:px-8
          lg:px-10
        "
      >

        {/* Section Header */}

        <SectionHeader
          title={
            <>
              English grows through conversation.
              <br />
              Confidence grows with every exchange.
            </>
          }
          description="
            At Hamkke │ 함께, I believe English learning should feel
            natural, meaningful, and connected. Every conversation is
            an opportunity to express your thoughts, discover new
            perspectives, and grow more confident using English in
            real situations.
          "
        />


        {/* Values */}

        <StaggerContainer
          className="
            grid
            gap-6

            md:grid-cols-3
            md:gap-8
          "
        >

          {values.map((value) => {

            const Icon = value.icon;

            return (
              <StaggerItem
                key={value.title}
              >

                <div
                  className="
                    h-full
                    rounded-[2rem]
                    border
                    border-white/70
                    bg-[#FCFBF9]
                    p-8
                    shadow-[0_12px_35px_rgba(0,0,0,0.05)]
                    transition-all
                    duration-500

                    hover:-translate-y-1
                    hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)]

                    sm:p-10
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
                        text-[24px]
                        leading-tight
                        text-[#2B2B2B]
                        [font-family:var(--font-cormorant)]

                        sm:text-[26px]
                      "
                    >
                      {value.title}
                    </h3>

                  </div>


                  <p
                    className="
                      text-[15px]
                      leading-7
                      text-[#5B5B5B]

                      sm:text-[16px]
                      sm:leading-8
                    "
                  >
                    {value.text}
                  </p>


                </div>

              </StaggerItem>
            );

          })}

        </StaggerContainer>


      </div>


    </section>
  );
}