import Image from "next/image";
import type { Locale } from "../lib/i18n";

type HamkkeApproachProps = {
  locale: Locale;
};

export default function HamkkeApproach({
  locale,
}: HamkkeApproachProps) {
  return (
    <section
      id="approach"
      className="relative overflow-hidden bg-[#F3EDDD] py-10 sm:py-12 lg:py-14"
    >
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16">
        {/* Heading */}
        <div className="mx-auto max-w-[1180px] text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#718A73] sm:text-xs">
            The Hamkke Approach
          </p>

          <div className="mx-auto mt-3 h-px w-12 bg-[#718A73]/60" />

          <h2 className="mt-4 font-serif text-[40px] leading-[1] tracking-[-0.035em] text-[#304A39] sm:text-5xl lg:text-[56px]">
            We don&apos;t prepare you for the conversation.
            <br className="hidden sm:block" />
            The conversation is the lesson.
          </h2>

          <p className="mx-auto mt-4 max-w-[680px] text-[15px] leading-7 text-[#758477] sm:text-base">
            One thought leads to a question. A question leads to a better way
            to say it. And each time you try again, your English grows with the
            conversation.
          </p>
        </div>

        {/* Desktop approach */}
        <div className="relative mt-8 hidden lg:block">
          {/* Step headings */}
          <div className="grid grid-cols-4 gap-10 pr-[120px]">
            {/* 01 */}
            <div>
              <p className="font-serif text-[32px] leading-none text-[#718A73]">
                01
              </p>

              <h3 className="mt-2 font-serif text-[28px] leading-none text-[#304A39]">
                We Talk
              </h3>
            </div>

            {/* 02 */}
            <div>
              <p className="font-serif text-[32px] leading-none text-[#B99368]">
                02
              </p>

              <h3 className="mt-2 font-serif text-[28px] leading-none text-[#304A39]">
                We Go Deeper
              </h3>
            </div>

            {/* 03 */}
            <div>
              <p className="font-serif text-[32px] leading-none text-[#B79A4B]">
                03
              </p>

              <h3 className="mt-2 font-serif text-[28px] leading-none text-[#304A39]">
                We Refine
              </h3>
            </div>

            {/* 04 */}
            <div>
              <p className="font-serif text-[32px] leading-none text-[#718A73]">
                04
              </p>

              <h3 className="mt-2 font-serif text-[28px] leading-none text-[#304A39]">
                You Try Again
              </h3>
            </div>
          </div>

          {/* Conversation thread */}
          <div className="relative mt-4 h-[78px]">
            {/* Main thread */}
            <svg
              viewBox="0 0 1312 78"
              preserveAspectRatio="none"
              className="absolute left-0 top-0 h-full w-[91%] overflow-visible"
              aria-hidden="true"
            >
              <path
                d="
                  M 8 34
                  C 100 8, 180 58, 275 34
                  S 455 10, 545 34
                  S 720 58, 815 34
                  S 990 10, 1080 34
                  S 1185 50, 1255 35
                "
                fill="none"
                stroke="#718A73"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.82"
                vectorEffect="non-scaling-stroke"
              />

              {/* Step markers */}
<circle cx="8" cy="34" r="5.5" fill="#718A73" />
<circle cx="330" cy="23" r="5.5" fill="#B99368" />
<circle cx="660" cy="52" r="5.5" fill="#B79A4B" />
<circle cx="990" cy="18" r="5.5" fill="#718A73" />
            </svg>

            {/* Continuation text */}
            <p
              className="
                absolute
                right-[92px]
                top-[-36px]
                max-w-[145px]
                -rotate-2
                text-right
                font-serif
                text-[16px]
                italic
                leading-[1.15]
                text-[#718A73]
              "
            >
              And the conversation
              <br />
              continues.
            </p>

            {/* H pulling the thread */}
            <div
              className="
                pointer-events-none
                absolute
                right-[15px]
                top-[-41px]
                h-[120px]
                w-[155px]
              "
              aria-hidden="true"
            >
              <Image
                src="/mascot/hamkkeapproach-pull.png"
                alt=""
                fill
                sizes="155px"
                className="object-contain object-right"
              />
            </div>
          </div>

          {/* Step descriptions */}
          <div className="grid grid-cols-4 gap-10 pr-[120px]">
            <p className="max-w-[230px] text-sm leading-6 text-[#758477]">
              Start with something you want to say.
            </p>

            <p className="max-w-[230px] text-sm leading-6 text-[#758477]">
              Follow-up questions help you develop the idea.
            </p>

            <p className="max-w-[230px] text-sm leading-6 text-[#758477]">
              Your teacher helps improve the English that naturally comes up in
              the conversation.
            </p>

            <p className="max-w-[230px] text-sm leading-6 text-[#758477]">
              Use the English again to express yourself more clearly and with
              confidence.
            </p>
          </div>
        </div>

        {/* Mobile / tablet */}
        <div className="mt-8 lg:hidden">
          <div className="grid gap-7 sm:grid-cols-2">
            {/* 01 */}
            <div>
              <p className="font-serif text-3xl text-[#718A73]">01</p>

              <h3 className="mt-1 font-serif text-2xl text-[#304A39]">
                We Talk
              </h3>

              <p className="mt-2 max-w-[260px] text-sm leading-6 text-[#758477]">
                Start with something you want to say.
              </p>
            </div>

            {/* 02 */}
            <div>
              <p className="font-serif text-3xl text-[#B99368]">02</p>

              <h3 className="mt-1 font-serif text-2xl text-[#304A39]">
                We Go Deeper
              </h3>

              <p className="mt-2 max-w-[260px] text-sm leading-6 text-[#758477]">
                Follow-up questions help you develop the idea.
              </p>
            </div>

            {/* 03 */}
            <div>
              <p className="font-serif text-3xl text-[#B79A4B]">03</p>

              <h3 className="mt-1 font-serif text-2xl text-[#304A39]">
                We Refine
              </h3>

              <p className="mt-2 max-w-[260px] text-sm leading-6 text-[#758477]">
                Your teacher helps improve the English that naturally comes up
                in the conversation.
              </p>
            </div>

            {/* 04 */}
            <div>
              <p className="font-serif text-3xl text-[#718A73]">04</p>

              <h3 className="mt-1 font-serif text-2xl text-[#304A39]">
                You Try Again
              </h3>

              <p className="mt-2 max-w-[260px] text-sm leading-6 text-[#758477]">
                Use the English again to express yourself more clearly and with
                confidence.
              </p>
            </div>
          </div>

          {/* Mobile ending */}
          <div className="mt-5 flex items-center justify-end gap-3">
            <p className="-rotate-2 text-right font-serif text-base italic leading-5 text-[#718A73]">
              And the conversation
              <br />
              continues.
            </p>

            <div
              className="relative h-[82px] w-[105px]"
              aria-hidden="true"
            >
              <Image
                src="/mascot/hamkkeapproach-pull.png"
                alt=""
                fill
                sizes="105px"
                className="object-contain object-right"
              />
            </div>
          </div>
        </div>

        {/* Approach link */}
<div className="mt-7 flex justify-center">
  <a
    href={`/${locale}/how-it-works`}
    className="
      group
      inline-flex
      items-center
      gap-4
      rounded-full
      bg-[#718A73]
      py-2
      pl-6
      pr-2
      text-sm
      font-medium
      text-white
      shadow-[0_8px_24px_rgba(48,74,57,0.10)]
      transition-all
      duration-300
      hover:-translate-y-0.5
      hover:bg-[#304A39]
      hover:shadow-[0_12px_30px_rgba(48,74,57,0.16)]
    "
  >
    <span>Explore the Hamkke Approach</span>

    <span
      aria-hidden="true"
      className="
        flex
        h-9
        w-9
        items-center
        justify-center
        rounded-full
        bg-white/15
        text-base
        transition-all
        duration-300
        group-hover:translate-x-0.5
        group-hover:bg-white/20
      "
    >
      →
    </span>
  </a>
</div>
      </div>
    </section>
  );
}