import Image from "next/image";
import FadeRight from "./animations/FadeRight";

export default function HeroImage() {
  return (
    <FadeRight delay={0.2}>
      <div
        className="
          relative
          mx-auto
          flex
          h-[390px]
          w-full
          max-w-[680px]
          items-end
          justify-center

          sm:h-[450px]

          lg:h-[590px]
          lg:max-w-[760px]
          lg:justify-end
        "
      >
        <Image
          src="/hamkke-teacher-mascot-transparent.png"
          alt="Hamkke mascot teaching an online English lesson"
          width={1536}
          height={1024}
          priority
          sizes="
            (max-width: 640px) 92vw,
            (max-width: 1024px) 70vw,
            720px
          "
          className="
            h-auto
            w-[108%]
            max-w-none
            object-contain

            sm:w-[100%]

            lg:w-[122%]
lg:translate-x-[1%]
lg:-translate-y-[3%]

xl:w-[126%]
xl:translate-x-[3%]
xl:-translate-y-[4%]
          "
        />
      </div>
    </FadeRight>
  );
}