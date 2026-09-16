import FadeRight from "./animations/FadeRight";

export default function HeroImage() {
  return (
    <FadeRight delay={0.2}>
      <div
        className="
          relative
          mx-auto
          flex
          h-[270px]
          w-full
          max-w-[680px]
          items-end
          justify-center

          sm:h-[340px]

          lg:h-[590px]
          lg:max-w-[760px]
          lg:justify-end
        "
      >
        {/* Soft background glow */}
        <div
          className="
            pointer-events-none
            absolute
            bottom-[10%]
            right-[8%]

            h-[58%]
            w-[58%]

            rounded-full
            bg-[#DCE4D7]/25
            blur-3xl

            animate-[hamkkeGlow_7s_ease-in-out_infinite]

            motion-reduce:animate-none
          "
          aria-hidden="true"
        />

        {/* Animated Hamkke mascot */}
        <div
          className="
            relative
            w-[108%]
            max-w-none

            sm:w-[100%]

            lg:w-[122%]
            lg:-translate-x-[2%]
            lg:-translate-y-[4%]

            xl:w-[126%]
            xl:-translate-x-[1%]
            xl:-translate-y-[5%]
          "
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/hamkke-teacher-mascot-transparent.png"
            aria-label="Hamkke mascot teaching an online English lesson"
            className="
              block
              h-auto
              w-full
              object-contain
            "
          >
            <source
              src="/mascot/hamkke-mascot-hero.mp4"
              type="video/mp4"
            />
          </video>
        </div>
      </div>
    </FadeRight>
  );
}