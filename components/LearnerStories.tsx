"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "../lib/i18n";

type LearnerStoriesProps = {
  locale: Locale;
};

const referralMessages = [
  "I recommended her to take your class.",
  "Can I introduce my friend who wants to study English?",
  "My colleague asked me to introduce you.",
  "My Japanese friend wants to take classes with an English teacher online. Can I recommend you?",
  "One Russian mom is asking me about English class for her son. Can I give her your Kakao ID?",
  "My colleagues who are planning to apply for Korean Air want to take your class.",
  "A lot of Koreans were interested in joining the class, so I recommended your website.",
];

const bubbleStyles = [
  "bg-[#F3EDDD]",
  "bg-[#E5EBDD]",
  "bg-[#EDE3D2]",
];

export default function LearnerStories({
  locale,
}: LearnerStoriesProps) {
  const [visibleIndexes, setVisibleIndexes] = useState([0, 1, 2]);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) return;

    const interval = window.setInterval(() => {
      setVisibleIndexes((current) => {
        const next =
          (current[current.length - 1] + 1) % referralMessages.length;

        return [...current.slice(1), next];
      });
    }, 3800);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section
      id="learner-stories"
      className="relative overflow-hidden bg-[#F3EDDD] py-11 sm:py-12 lg:py-14"
    >
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16">
        {/* Heading */}
        <div className="max-w-[900px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#718A73] sm:text-xs">
            Learner Stories
          </p>

          <h2 className="mt-3 font-serif text-[40px] leading-[0.98] tracking-[-0.035em] text-[#304A39] sm:text-5xl lg:text-[48px]">
            Conversations that stayed with them.
          </h2>

          <p className="mt-3 max-w-[820px] text-[14px] leading-6 text-[#758477] sm:text-[15px]">
            Some learners stayed for years. Some came back. Some introduced
            friends, colleagues, and family. Here are a few of the stories
            they&apos;ve shared along the way.
          </p>
        </div>

        {/* Desktop */}
        <div className="mt-8 hidden grid-cols-[1.05fr_0.8fr_1.15fr] gap-4 lg:grid">
          {/* Parent reflection */}
          <article className="flex min-h-[315px] flex-col rounded-[26px] bg-[#DCE4D7] p-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#718A73]">
              A Parent&apos;s Reflection
            </p>

            <blockquote className="mt-5 font-serif text-[25px] leading-[1.18] tracking-[-0.025em] text-[#304A39]">
              “I believe Flora and Emily&apos;s English skills have improved
              significantly thanks to you.”
            </blockquote>

            <p className="mt-4 text-[12.5px] leading-[1.5] text-[#52685A]">
              Their parent also shared that their progress was being noticed
              beyond their lessons, including at their academy and in school
              assessments.
            </p>

            <p className="mt-auto pt-5 text-[11.5px] font-medium text-[#718A73]">
              Parent of young learners · Korea
            </p>
          </article>

          {/* Milestone */}
          <article className="flex min-h-[315px] flex-col rounded-[26px] bg-[#F3E5BE] p-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9A793A]">
              A Milestone Reached
            </p>

            <blockquote className="mt-5 font-serif text-[24px] leading-[1.2] tracking-[-0.025em] text-[#304A39]">
              “Thanks to your help, I finally passed and joined company.”
            </blockquote>

            <div className="mt-5 h-px w-10 bg-[#B7903D]/40" />

            <p className="mt-4 text-[12.5px] leading-[1.5] text-[#6E6248]">
              Shared after preparing for a Korean Air English interview.
            </p>

            <p className="mt-auto pt-5 text-[11.5px] font-medium text-[#9A793A]">
              Adult learner · Korea
            </p>
          </article>

          {/* Passed along */}
          <article className="flex min-h-[315px] flex-col overflow-hidden rounded-[26px] bg-[#FFFDF8] p-7">
            <div className="shrink-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#718A73]">
                Passed Along
              </p>

              <h3 className="mt-3 font-serif text-[25px] leading-[1.05] tracking-[-0.025em] text-[#304A39]">
                One conversation often leads to another.
              </h3>
            </div>

            {/* Moving recommendations */}
            <div
              className="relative mt-5 h-[170px] overflow-hidden"
              aria-live="off"
            >
              <div className="flex flex-col gap-2">
                {visibleIndexes.map((messageIndex, position) => (
                  <div
                    key={`${messageIndex}-${position}`}
                    className={`
                      rounded-[15px]
                      px-4
                      py-2.5
                      transition-all
                      duration-700
                      ease-out
                      ${bubbleStyles[position]}
                      ${
                        position === 0
                          ? "mr-[14%] opacity-60"
                          : position === 1
                            ? "ml-[8%] mr-[4%] opacity-80"
                            : "mr-[8%] opacity-100"
                      }
                    `}
                  >
                    <p className="font-serif text-[14px] leading-[1.25] text-[#304A39]">
                      “{referralMessages[messageIndex]}”
                    </p>
                  </div>
                ))}
              </div>

              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-[#FFFDF8] to-transparent"
                aria-hidden="true"
              />
            </div>
          </article>
        </div>

        {/* Mobile / tablet */}
        <div className="mt-8 space-y-4 lg:hidden">
          {/* Parent reflection */}
          <article className="rounded-[24px] bg-[#DCE4D7] p-6 sm:p-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#718A73]">
              A Parent&apos;s Reflection
            </p>

            <blockquote className="mt-5 font-serif text-[25px] leading-[1.2] tracking-[-0.025em] text-[#304A39]">
              “I believe Flora and Emily&apos;s English skills have improved
              significantly thanks to you.”
            </blockquote>

            <p className="mt-5 text-[13px] leading-5 text-[#52685A]">
              Their parent also shared that their progress was being noticed
              beyond their lessons, including at their academy and in school
              assessments.
            </p>

            <p className="mt-6 text-[12px] font-medium text-[#718A73]">
              Parent of young learners · Korea
            </p>
          </article>

          {/* Milestone */}
          <article className="rounded-[24px] bg-[#F3E5BE] p-6 sm:p-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9A793A]">
              A Milestone Reached
            </p>

            <blockquote className="mt-5 font-serif text-[25px] leading-[1.2] tracking-[-0.025em] text-[#304A39]">
              “Thanks to your help, I finally passed and joined company.”
            </blockquote>

            <p className="mt-5 text-[13px] leading-5 text-[#6E6248]">
              Shared after preparing for a Korean Air English interview.
            </p>

            <p className="mt-6 text-[12px] font-medium text-[#9A793A]">
              Adult learner · Korea
            </p>
          </article>

          {/* Passed along */}
          <article className="overflow-hidden rounded-[24px] bg-[#FFFDF8] p-6 sm:p-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#718A73]">
              Passed Along
            </p>

            <h3 className="mt-3 font-serif text-[27px] leading-[1.05] tracking-[-0.025em] text-[#304A39]">
              One conversation often leads to another.
            </h3>

            <p className="mt-4 text-[13px] leading-5 text-[#758477]">
              Learners have introduced friends, colleagues, parents, and other
              people in their lives to the classes they experienced
              themselves.
            </p>

            <div className="relative mt-5 h-[190px] overflow-hidden">
              <div className="flex flex-col gap-2.5">
                {visibleIndexes.map((messageIndex, position) => (
                  <div
                    key={`mobile-${messageIndex}-${position}`}
                    className={`
                      rounded-[16px]
                      px-4
                      py-3
                      transition-all
                      duration-700
                      ease-out
                      ${bubbleStyles[position]}
                      ${
                        position === 0
                          ? "mr-[8%] opacity-60"
                          : position === 1
                            ? "ml-[7%] opacity-80"
                            : "mr-[4%] opacity-100"
                      }
                    `}
                  >
                    <p className="font-serif text-[16px] leading-[1.3] text-[#304A39]">
                      “{referralMessages[messageIndex]}”
                    </p>
                  </div>
                ))}
              </div>

              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-[#FFFDF8] to-transparent"
                aria-hidden="true"
              />
            </div>
          </article>
        </div>

        {/* Closing */}
        <div className="mt-7 flex flex-col gap-5 border-t border-[#718A73]/20 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[670px] text-[12px] leading-5 text-[#758477]">
            Hamkke grew from conversations like these, and from the learners
            who kept coming back, growing, and bringing others along.
          </p>

          {/* Learner stories button */}
          <div className="relative w-fit shrink-0">
            {/* Bottom layer */}
            <div
              className="
                absolute
                inset-0
                translate-y-[8px]
                rounded-[22px]
                bg-[#D8C9AA]
              "
              aria-hidden="true"
            />

            {/* Main button */}
            <Link
              href={`/${locale}/reflections`}
              className="
                group
                relative
                z-10
                flex
                min-h-[56px]
                min-w-[290px]
                items-center
                justify-between
                gap-8
                rounded-[22px]
                bg-[#E9DFC9]
                px-7
                text-[14px]
                font-semibold
                text-[#304A39]
                transition-transform
                duration-200
                hover:-translate-y-[2px]
                active:translate-y-[4px]
                sm:min-w-[310px]
              "
            >
              <span>Read more learner stories</span>

              <span
                className="
                  text-[21px]
                  font-normal
                  leading-none
                  transition-transform
                  duration-200
                  group-hover:translate-x-1
                "
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}