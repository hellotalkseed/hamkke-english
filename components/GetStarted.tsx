import Image from "next/image";
import Link from "next/link";
import type { Locale } from "../lib/i18n";

type GetStartedProps = {
  locale: Locale;
};

export default function GetStarted({ locale }: GetStartedProps) {
  return (
    <section
      id="get-started"
      className="relative overflow-hidden bg-[#FFFDF8] py-12 sm:py-14 lg:py-12"
    >
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16">
        {/* Opening */}
        <div className="max-w-[1280px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#718A73] sm:text-xs">
            Ready When You Are
          </p>

          <h2 className="mt-3 font-serif text-[40px] leading-[0.98] tracking-[-0.035em] text-[#304A39] sm:text-5xl lg:whitespace-nowrap lg:text-[46px] xl:text-[50px]">
            Every meaningful conversation starts somewhere.
          </h2>

          <p className="mt-2 font-serif text-[27px] italic leading-tight text-[#718A73] sm:text-[31px] lg:text-[32px]">
            Perhaps yours starts here.
          </p>
        </div>

        {/* Journey */}
        <div className="relative mt-10 lg:mt-12">
          {/* Desktop */}
          <div className="relative hidden lg:grid lg:grid-cols-3 lg:gap-16">
            {/* Step 01 */}
            <div>
              <div className="flex items-center gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5EBDD] font-serif text-[14px] italic text-[#718A73]">
                  01
                </span>

                <span className="h-px flex-1 bg-[#DCE4D7]" />
              </div>

              <div className="mt-4">
                <h3 className="font-serif text-[23px] leading-tight text-[#304A39]">
                  Tell us about yourself.
                </h3>

                <p className="mt-2 text-[13px] leading-5 text-[#758477]">
                  Your goals, your English, your needs.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div>
              <div className="flex items-center gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5EBDD] font-serif text-[14px] italic text-[#718A73]">
                  02
                </span>

                <span className="h-px flex-1 bg-[#DCE4D7]" />
              </div>

              <div className="mt-4">
                <h3 className="font-serif text-[23px] leading-tight text-[#304A39]">
                  Have a conversation.
                </h3>

                <p className="mt-2 text-[13px] leading-5 text-[#758477]">
                  Meet your teacher and talk naturally.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div>
              <div className="flex items-center gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5EBDD] font-serif text-[14px] italic text-[#718A73]">
                  03
                </span>

                <span className="h-px flex-1 bg-[#DCE4D7]" />
              </div>

              <div className="mt-4">
                <h3 className="font-serif text-[23px] leading-tight text-[#304A39]">
                  Start your lessons.
                </h3>

                <p className="mt-2 text-[13px] leading-5 text-[#758477]">
                  Choose your schedule and begin.
                </p>
              </div>
            </div>
          </div>

          {/* Mobile / tablet */}
          <div className="space-y-7 lg:hidden">
            {/* Step 01 */}
            <div className="relative border-l border-[#DCE4D7] pl-6">
              <span className="absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#E5EBDD] font-serif text-[14px] italic text-[#718A73]">
                01
              </span>

              <div className="pl-3">
                <h3 className="font-serif text-[22px] leading-tight text-[#304A39]">
                  Tell us about yourself.
                </h3>

                <p className="mt-2 text-[13px] leading-5 text-[#758477]">
                  Your goals, your English, your needs.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="relative border-l border-[#DCE4D7] pl-6">
              <span className="absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#E5EBDD] font-serif text-[14px] italic text-[#718A73]">
                02
              </span>

              <div className="pl-3">
                <h3 className="font-serif text-[22px] leading-tight text-[#304A39]">
                  Have a conversation.
                </h3>

                <p className="mt-2 text-[13px] leading-5 text-[#758477]">
                  Meet your teacher and talk naturally.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="relative border-l border-[#DCE4D7] pl-6">
              <span className="absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#E5EBDD] font-serif text-[14px] italic text-[#718A73]">
                03
              </span>

              <div className="pl-3">
                <h3 className="font-serif text-[22px] leading-tight text-[#304A39]">
                  Start your lessons.
                </h3>

                <p className="mt-2 text-[13px] leading-5 text-[#758477]">
                  Choose your schedule and begin.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Final invitation */}
        <div className="relative mt-10 border-t border-[#DCE4D7] pt-5 lg:mt-11 lg:min-h-[175px]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-serif text-[23px] italic text-[#718A73]">
                Let&apos;s take the first step together.
              </p>
            </div>

            {/* Desktop mascot + CTA */}
            <div className="hidden h-[155px] items-end lg:flex">
              {/* Mascot */}
              <div
                className="relative z-20 -mr-[42px] h-[380px] w-[390px] shrink-0 translate-x-[110px] -translate-y-[20px]"
                aria-hidden="true"
              >
                <Image
                  src="/mascot/hamkke-get-started2.png"
                  alt=""
                  fill
                  sizes="220px"
                  className="object-contain object-bottom"
                />
              </div>

              {/* Layered CTA */}
              <div className="relative z-10 mb-[24px]">
                {/* Sage bottom layer */}
                <div
                  className="absolute inset-0 translate-y-[11px] rounded-[24px] bg-[#718A73]"
                  aria-hidden="true"
                />

                {/* Main button */}
                <Link
                  href={`/${locale}/inquiry`}
                  className="
                    group
                    relative
                    z-10
                    flex
                    min-h-[64px]
                    min-w-[320px]
                    items-center
                    justify-between
                    gap-8
                    rounded-[24px]
                    bg-[#304A39]
                    px-9
                    text-[15px]
                    font-semibold
                    text-[#FFFDF8]
                    transition-transform
                    duration-200
                    hover:-translate-y-[2px]
                    active:translate-y-[5px]
                  "
                >
                  <span>Book a Free Assessment</span>

                  <span
                    className="text-[22px] font-normal leading-none transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </Link>
              </div>
            </div>

            {/* Mobile / tablet */}
            <div className="flex w-full items-end sm:w-fit lg:hidden">
              {/* Mascot */}
              <div
                className="relative z-20 -mr-[26px] h-[145px] w-[150px] shrink-0 sm:h-[175px] sm:w-[180px]"
                aria-hidden="true"
              >
                <Image
                  src="/mascot/hamkke-get-started2.png"
                  alt=""
                  fill
                  sizes="(min-width: 640px) 180px, 150px"
                  className="object-contain object-bottom"
                />
              </div>

              {/* Layered CTA */}
              <div className="relative z-10 mb-[18px]">
                {/* Sage bottom layer */}
                <div
                  className="absolute inset-0 translate-y-[8px] rounded-[20px] bg-[#718A73]"
                  aria-hidden="true"
                />

                {/* Main button */}
                <Link
                  href={`/${locale}/inquiry`}
                  className="
                    group
                    relative
                    z-10
                    flex
                    min-h-[54px]
                    items-center
                    justify-between
                    gap-5
                    rounded-[20px]
                    bg-[#304A39]
                    px-6
                    text-[13px]
                    font-semibold
                    text-[#FFFDF8]
                    transition-transform
                    duration-200
                    active:translate-y-[4px]
                  "
                >
                  <span>Book a Free Assessment</span>

                  <span
                    className="text-[18px] font-normal leading-none"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}