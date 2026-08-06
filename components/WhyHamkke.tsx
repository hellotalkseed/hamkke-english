"use client";

import {
  MessageCircleMore,
  UserRoundCheck,
  MessageSquareText,
  Globe2,
} from "lucide-react";

import FeatureCard from "./FeatureCard";
import FadeUp from "./animations/FadeUp";
import StaggerContainer from "./animations/StaggerContainer";
import StaggerItem from "./animations/StaggerItem";


const features = [
  {
    icon: MessageCircleMore,
    title: "Conversation-First Learning",
    description:
      "Instead of spending most of your time memorizing grammar rules, you learn by expressing your thoughts, responding naturally, and building confidence through real conversations.",
    tagline:
      "Speak first. Improve naturally.",
  },

  {
    icon: UserRoundCheck,
    title: "Lessons Built Around You",
    description:
      "Every learner has different goals, interests, and challenges. Lessons are designed around your level, learning style, and the situations where you want to use English.",
    tagline:
      "Your goals shape your lessons.",
  },

  {
    icon: MessageSquareText,
    title: "Real Feedback, Real Progress",
    description:
      "Through personalized feedback, you'll discover more natural ways to express yourself, improve your communication skills, and continue making steady progress.",
    tagline:
      "Every conversation helps you grow.",
  },

  {
    icon: Globe2,
    title: "Confidence Beyond the Lesson",
    description:
      "The goal is not just to speak during class. It's to help you communicate confidently in interviews, workplaces, travel, and everyday situations.",
    tagline:
      "English you can carry with you.",
  },
];


export default function WhyHamkke() {
  return (
    <section
      className="
        bg-[#EEF5EE]
        py-20

        sm:py-24
        lg:py-32
      "
    >

      <div
        className="
          mx-auto
          max-w-7xl
          px-6

          md:px-8
          lg:px-10
        "
      >


        {/* Heading */}

        <FadeUp>

          <div
            className="
              mx-auto
              max-w-3xl
              text-center
            "
          >

            <p
              className="
                text-[12px]
                font-medium
                uppercase
                tracking-[0.35em]
                text-[#6F8F72]
              "
            >
              Hamkke │ 함께
            </p>


            <h2
              className="
                mt-6
                text-[40px]
                leading-[1.05]
                tracking-[-0.02em]
                text-[#2B2B2B]
                [font-family:var(--font-cormorant)]

                sm:text-[52px]
                lg:text-[60px]
              "
            >
              A different way to learn English.
            </h2>


            <p
              className="
                mt-8
                text-[17px]
                leading-8
                text-[#5B5B5B]

                sm:text-lg
                sm:leading-9
              "
            >
              English improvement doesn't happen through
              memorization alone. At Hamkke │ 함께, lessons are
              built around real conversations, personalized guidance,
              and practical communication that helps you use English
              with confidence beyond the classroom.
            </p>

          </div>

        </FadeUp>





        {/* Cards */}

        <StaggerContainer
          className="
            mt-16
            grid
            gap-6

            md:grid-cols-2
            md:gap-8

            lg:mt-20
          "
        >

          {features.map((feature) => (

            <StaggerItem
              key={feature.title}
            >

              <FeatureCard
                {...feature}
              />

            </StaggerItem>

          ))}


        </StaggerContainer>





        {/* Closing Statement */}

        <FadeUp>

          <div
            className="
              mt-20
              text-center

              lg:mt-24
            "
          >

            <p
  className="
    text-[34px]
    leading-tight
    text-[#6F8F72]
    [font-family:var(--font-cormorant)]

    sm:text-5xl
  "
>
  Because every learner
  <br />
  has a story worth sharing.
</p>

          </div>

        </FadeUp>


      </div>

    </section>
  );
}