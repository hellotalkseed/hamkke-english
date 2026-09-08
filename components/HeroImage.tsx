import Image from "next/image";
import FadeRight from "./animations/FadeRight";

export default function HeroImage() {
  return (
    <>
      {/* =====================================================
          MOBILE HERO BACKGROUND
          Separate mobile-only treatment.

          This image sits behind the hero content instead of
          occupying its own vertical space.

          Desktop is completely unaffected.
          ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-0
          overflow-hidden

          lg:hidden
        "
        aria-hidden="true"
      >
        <Image
          src="/hamkke-students-hero-v2.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="
            object-cover
            object-[center_70%]
            opacity-[0.32]
          "
        />

        {/* =====================================================
            MOBILE READABILITY OVERLAY

            Keeps the students visible while protecting
            headline/body readability.
            ===================================================== */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-[#FAF8F5]/75
            via-[#FAF8F5]/82
            to-[#FAF8F5]/95
          "
        />

        {/* =====================================================
            MOBILE TOP SOFTENING
            ===================================================== */}

        <div
          className="
            absolute
            inset-x-0
            top-0
            h-[120px]

            bg-gradient-to-b
            from-[#FAF8F5]
            via-[#FAF8F5]/60
            to-transparent
          "
        />

        {/* =====================================================
            MOBILE BOTTOM SOFTENING
            ===================================================== */}

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-[160px]

            bg-gradient-to-t
            from-[#FAF8F5]
            via-[#FAF8F5]/65
            to-transparent
          "
        />
      </div>

      {/* =====================================================
          DESKTOP HERO IMAGE
          Existing desktop layout intentionally preserved.
          ===================================================== */}

      <div className="hidden lg:block">
        <FadeRight delay={0.2}>
          <div
            className="
              relative
              z-0
              flex
              w-full
              items-center
              justify-end

              lg:h-[610px]
              lg:overflow-visible

              xl:h-[640px]
            "
          >
            {/* =====================================================
                STUDENT COLLAGE
                Desktop position intentionally preserved.
                ===================================================== */}

            <Image
              src="/hamkke-students-hero-v2.png"
              alt="Students enjoying English conversations with Hamkke"
              width={1536}
              height={1024}
              priority
              sizes="
                (max-width: 1024px) 100vw,
                950px
              "
              className="
                block
                h-auto
                w-full
                max-w-none

                lg:absolute
                lg:right-[calc(-40px-max(0px,(100vw-1400px)/2))]
                lg:top-1/2
                lg:h-[610px]
                lg:w-auto
                lg:-translate-y-1/2

                xl:h-[640px]
              "
            />

            {/* =====================================================
                TOP FADE
                Desktop position intentionally preserved.
                ===================================================== */}

            <div
              className="
                pointer-events-none
                absolute
                z-10
                left-0
                right-[calc(-40px-max(0px,(100vw-1400px)/2))]
                top-0
                h-[90px]

                bg-gradient-to-b
                from-[#FAF8F5]
                via-[#FAF8F5]/65
                to-transparent
              "
            />

            {/* =====================================================
                BOTTOM FADE
                Desktop position intentionally preserved.
                ===================================================== */}

            <div
              className="
                pointer-events-none
                absolute
                z-10
                bottom-0
                left-0
                right-[calc(-40px-max(0px,(100vw-1400px)/2))]
                h-[110px]

                bg-gradient-to-t
                from-[#FAF8F5]
                via-[#FAF8F5]/65
                to-transparent
              "
            />
          </div>
        </FadeRight>
      </div>
    </>
  );
}