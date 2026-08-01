"use client";

import {
  Sprout,
  MessageCircleMore,
  Globe2,
  HeartHandshake,
} from "lucide-react";

import FeatureCard from "./FeatureCard";

const features = [
  {
    icon: Sprout,
    title: "Personalized Learning",
    description:
      "Every learner has different goals, strengths, and challenges. Lessons are thoughtfully designed around your pace, interests, and learning style so you can make steady, meaningful progress.",
    tagline: "Growing at your own pace.",
  },

  {
    icon: MessageCircleMore,
    title: "Meaningful Conversations",
    description:
      "Instead of memorizing grammar rules, you'll build confidence through real conversations, practical speaking exercises, and supportive feedback you can use in everyday situations.",
    tagline: "Confidence begins with speaking.",
  },

  {
    icon: Globe2,
    title: "Practical Communication",
    description:
      "Whether you're preparing for travel, work, interviews, or daily life, lessons focus on helping you communicate naturally in situations that matter to you.",
    tagline: "English for real life.",
  },

  {
    icon: HeartHandshake,
    title: "Supportive Coaching",
    description:
      "Learning is easier when you feel comfortable speaking. Every lesson provides a welcoming environment where mistakes become opportunities to grow with confidence.",
    tagline: "Every mistake is progress.",
  },
];

export default function WhyTalkSeed() {
  return (
    <section className="bg-[#EEF5EE] py-28">

      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">

          <p className="text-sm uppercase tracking-[0.35em] text-[#6F8F72]">
            Why TalkSeed
          </p>

          <h2 className="mt-6 text-5xl leading-tight text-[#2B2B2B] [font-family:var(--font-cormorant)]">
            A different way to learn English.
          </h2>

          <p className="mt-8 text-lg leading-8 text-[#5B5B5B]">
            TalkSeed is built around meaningful conversations,
            personalized guidance, and steady growth. Every lesson
            is designed to help you communicate with confidence,
            not simply memorize grammar rules.
          </p>

        </div>

        {/* Cards */}

        <div className="mt-20 grid gap-8 md:grid-cols-2">

          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              {...feature}
            />
          ))}

        </div>

        {/* Closing Statement */}

        <div className="mt-24 text-center">

          <p className="text-4xl leading-tight text-[#6F8F72] [font-family:var(--font-cormorant)] md:text-5xl">
            Growing confidence,
            <br />
            one conversation at a time.
          </p>

        </div>

      </div>

    </section>
  );
}