import Image from "next/image";
import FadeRight from "./animations/FadeRight";

export default function HeroImage() {
  return (
    <>
      {/* =====================================================
          MOBILE HERO BACKGROUND

          Mobile uses the full collage image rather than
          object-cover so the students are not cropped away.

          The collage is anchored to the bottom-right behind
          the hero content.

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
        {/* =====================================================
            MOBILE STUDENT COLLAGE

            IMPORTANT:
            - no fill
            - no object-cover
            - natural image proportions preserved
            - right side intentionally emphasized
            ===================================================== */}

        <Image
          src="/hamkke-students-hero-v2.png"
          alt=""
          width={1536}
          height={1024}
          priority
          sizes="165vw"
          className="
            absolute
            bottom-[-10px]
            right-[-42%]

            h-auto
            w-[165%]
            max-w-none

            opacity-[0.52]
          "
        />

        {/* =====================================================
            MOBILE LEFT READABILITY FADE

            Stronger behind the text on the left.
            Much lighter toward the students on the right.
            ===================================================== */}

        <div
          className="
            absolute
            inset-0

            bg-gradient-to-r
            from-[#FAF8F5]/95
            via-[#FAF8F5]/72
            to-[#FAF8F5]/20
          "
        />

        {/* =====================================================
            MOBILE TOP FADE
            ===================================================== */}

        <div
          className="
            absolute
            inset-x-0
            top-0
            h-[170px]

            bg-gradient-to-b
            from-[#FAF8F5]
            via-[#FAF8F5]/70
            to-transparent
          "
        />

        {/* =====================================================
            MOBILE BOTTOM FADE
            ===================================================== */}

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-[120px]

            bg-gradient-to-t
            from-[#FAF8F5]
            via-[#FAF8F5]/45
            to-transparent
          "
        />
      </div>

      {/* =====================================================
          DESKTOP HERO IMAGE
          EXISTING DESKTOP LAYOUT PRESERVED.
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
                Position intentionally preserved.
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