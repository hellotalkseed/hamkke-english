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
      className="relative overflow-hidden bg-[#FFFDF8] py-10 sm:py-14 lg:py-12"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-16">
        {/* =====================================================
            OPENING
            ===================================================== */}

        <div className="max-w-[1280px]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#718A73] sm:text-xs sm:tracking-[0.28em]">
            Ready When You Are
          </p>

          <h2 className="mt-3 font-serif text-[35px] leading-[1.02] tracking-[-0.035em] text-[#304A39] sm:text-5xl sm:leading-[0.98] lg:whitespace-nowrap lg:text-[46px] xl:text-[50px]">
            Every meaningful conversation starts somewhere.
          </h2>

          <p className="mt-2 font-serif text-[24px] italic leading-tight text-[#718A73] sm:text-[31px] lg:text-[32px]">
            Perhaps yours starts here.
          </p>
        </div>

        {/* =====================================================
            JOURNEY
            ===================================================== */}

        <div className="relative mt-8 sm:mt-10 lg:mt-12">
          {/* ===================================================
              DESKTOP
              =================================================== */}

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

          {/* ===================================================
              MOBILE / TABLET
              =================================================== */}

          <div className="space-y-6 sm:space-y-7 lg:hidden">
            {/* Step 01 */}

            <div className="relative border-l border-[#DCE4D7] pl-6">
              <span className="absolute -left-[17px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#E5EBDD] font-serif text-[14px] italic text-[#718A73]">
                01
              </span>

              <div className="pl-3">
                <h3 className="font-serif text-[21px] leading-tight text-[#304A39] sm:text-[22px]">
                  Tell us about yourself.
                </h3>

                <p className="mt-1.5 text-[13px] leading-5 text-[#758477] sm:mt-2">
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
                <h3 className="font-serif text-[21px] leading-tight text-[#304A39] sm:text-[22px]">
                  Have a conversation.
                </h3>

                <p className="mt-1.5 text-[13px] leading-5 text-[#758477] sm:mt-2">
                  Meet your teacher and talk naturally.
                </p>
              </div>
            </div>

            {/* Step 03 */}

            <div className="relative pl-6">
              <span className="absolute -left-[16px] top-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#E5EBDD] font-serif text-[14px] italic text-[#718A73]">
                03
              </span>

              <div className="pl-3">
                <h3 className="font-serif text-[21px] leading-tight text-[#304A39] sm:text-[22px]">
                  Start your lessons.
                </h3>

                <p className="mt-1.5 text-[13px] leading-5 text-[#758477] sm:mt-2">
                  Choose your schedule and begin.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            FINAL INVITATION
            ===================================================== */}

        <div className="relative mt-9 border-t border-[#DCE4D7] pt-5 sm:mt-10 lg:mt-11 lg:min-h-[175px]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-serif text-[21px] italic leading-tight text-[#718A73] sm:text-[23px]">
                Let&apos;s take the first step together.
              </p>
            </div>

            {/* =================================================
                DESKTOP MASCOT + CTA
                UNCHANGED
                ================================================= */}

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

            {/* =================================================
                MOBILE / TABLET MASCOT + CTA
                Mascot moved upward ~30%
                ================================================= */}

            <div
              className="
                relative
                mt-4
                h-[245px]
                w-full

                sm:mt-5
                sm:h-[285px]

                lg:hidden
              "
            >
              {/* Mascot */}

              <div
                className="
                  pointer-events-none
                  absolute
                  bottom-[37px]
                  left-[-46px]
                  z-20
                  h-[285px]
                  w-[290px]

                  sm:bottom-[38px]
                  sm:left-[-24px]
                  sm:h-[330px]
                  sm:w-[340px]
                "
                aria-hidden="true"
              >
                <Image
                  src="/mascot/hamkke-get-started2.png"
                  alt=""
                  fill
                  sizes="(min-width: 640px) 340px, 290px"
                  className="object-contain object-bottom"
                />
              </div>

              {/* Layered CTA */}

              <div
                className="
                  absolute
                  bottom-[24px]
                  right-0
                  z-10
                  w-[70%]

                  sm:bottom-[30px]
                  sm:w-[66%]
                "
              >
                {/* Sage bottom layer */}

                <div
                  className="
                    absolute
                    inset-0
                    translate-y-[9px]
                    rounded-[21px]
                    bg-[#718A73]

                    sm:translate-y-[10px]
                    sm:rounded-[22px]
                  "
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
                    min-h-[62px]
                    w-full
                    items-center
                    justify-between
                    gap-3
                    rounded-[21px]
                    bg-[#304A39]
                    pl-[54px]
                    pr-5
                    text-[12px]
                    font-semibold
                    leading-[1.2]
                    text-[#FFFDF8]
                    transition-transform
                    duration-200
                    active:translate-y-[4px]

                    sm:min-h-[64px]
                    sm:rounded-[22px]
                    sm:pl-[72px]
                    sm:pr-7
                    sm:text-[14px]
                  "
                >
                  <span>Book a Free Assessment</span>

                  <span
                    className="
                      shrink-0
                      text-[20px]
                      font-normal
                      leading-none

                      sm:text-[22px]
                    "
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