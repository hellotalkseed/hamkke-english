import HeroContent from "./HeroContent";
import HeroImage from "./HeroImage";
import Navbar from "./Navbar";

import type { Locale } from "../lib/i18n";

interface HeroProps {
  locale: Locale;
}

export default function Hero({
  locale,
}: HeroProps) {
  return (
    <>
      <Navbar />

      <main
        className="
          relative
          overflow-hidden
          bg-[#F3EDDD]
        "
      >
        <section
          className="
            relative
            isolate

            mx-auto
            grid
            w-full
            max-w-[1600px]

            gap-0

            px-6
            pb-16
            pt-9

            sm:px-8
            sm:pb-20
            sm:pt-11

            md:pb-24

            lg:min-h-[calc(100vh-72px)]
            lg:grid-cols-[1.12fr_0.88fr]
            lg:items-center
            lg:gap-0
            lg:px-10
            lg:pb-24
            lg:pt-10

            xl:px-12
          "
        >
          {/* =====================================================
              HERO CONTENT
              ===================================================== */}

          <div
            className="
              relative
              z-20

              lg:-mr-10
            "
          >
            <HeroContent locale={locale} />
          </div>

          {/* =====================================================
              HAMKKE MASCOT
              ===================================================== */}

          <div
            className="
              relative
              z-10

              mt-0

              lg:-ml-16
              lg:mt-0

              xl:-ml-20
            "
          >
            <HeroImage />
          </div>
        </section>

        {/* =====================================================
            SUBTLE BACKGROUND SHAPE
            ===================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            -right-[150px]
            top-[14%]
            z-0

            h-[520px]
            w-[520px]

            rounded-full

            bg-[#DCE4D7]/30

            blur-3xl
          "
          aria-hidden="true"
        />

        {/* =====================================================
            ASYMMETRIC SECTION TRANSITION
            ===================================================== */}

        <div
  className="
    pointer-events-none
    absolute
    -bottom-[2px]
    left-0
    z-30
    h-[92px]
    w-full
    sm:h-[112px]
    lg:h-[127px]
  "
  aria-hidden="true"
>
          <svg
            viewBox="0 0 1440 130"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <path
              d="
                M0 50
                C170 58, 240 115, 430 104
                C610 94, 690 42, 870 48
                C1040 54, 1130 100, 1275 92
                C1350 88, 1400 72, 1440 64
                L1440 130
                L0 130
                Z
              "
              fill="#FFFDF8"
            />
          </svg>
        </div>
      </main>
    </>
  );
}