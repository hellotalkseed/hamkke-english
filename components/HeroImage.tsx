import Image from "next/image";
import FadeRight from "./animations/FadeRight";

export default function HeroImage() {
  return (
    <FadeRight delay={0.2}>
      <div
        className="
          flex
          justify-center
          pt-2
          lg:justify-end
          lg:pt-0
        "
      >
        <div
          className="
            relative
            h-[390px]
            w-full
            max-w-[300px]

            overflow-hidden
            rounded-[32px]
            border-[6px]
            border-white
            bg-white

            shadow-[0_30px_80px_rgba(0,0,0,0.10)]

            transition-all
            duration-500

            hover:-translate-y-1
            hover:shadow-[0_40px_100px_rgba(0,0,0,0.14)]

            sm:h-[450px]
            sm:max-w-[330px]

            md:h-[510px]
            md:max-w-[360px]

            lg:h-[610px]
            lg:max-w-[405px]
          "
        >
          <Image
            src="/jesica.jpg"
            alt="Jesica, English coach at Hamkke"
            fill
            priority
            sizes="
              (max-width:640px) 300px,
              (max-width:768px) 330px,
              (max-width:1024px) 360px,
              405px
            "
            className="
              object-cover
              object-top
              transition-transform
              duration-700
              hover:scale-[1.03]
            "
          />

          {/* Soft Gradient */}

          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              bottom-0
              h-44

              bg-gradient-to-t
              from-black/15
              via-transparent
              to-transparent
            "
          />
        </div>
      </div>
    </FadeRight>
  );
}