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
          bg-[#F8F4EB]
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

            gap-4

            px-6
            pb-10
            pt-8

            sm:px-8
            sm:pt-10

            md:pb-12

            lg:min-h-[calc(100vh-72px)]
            lg:grid-cols-[1.12fr_0.88fr]
            lg:items-center
            lg:gap-0
            lg:px-10
            lg:pb-10
            lg:pt-4

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

              Pulled toward the center so the illustration and
              headline feel like one composition rather than
              two isolated columns.
              ===================================================== */}

          <div
            className="
              relative
              z-10

              mt-2

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
      </main>
    </>
  );
}