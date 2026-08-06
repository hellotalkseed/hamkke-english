import Image from "next/image";
import { Play } from "lucide-react";

import FadeRight from "./animations/FadeRight";

interface HeroImageProps {
  onOpenVideo: () => void;
}

export default function HeroImage({
  onOpenVideo,
}: HeroImageProps) {
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
            alt="Jesica Abejaron"
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


          {/* Video Button */}

          <button
            onClick={onOpenVideo}
            className="
              group
              absolute
              bottom-8
              left-1/2
              flex
              -translate-x-1/2
              items-center
              gap-3
              whitespace-nowrap
              rounded-full
              border
              border-white/70
              bg-white/95
              px-5
              py-3.5
              backdrop-blur-md
              shadow-xl
              transition-all
              duration-300
              hover:-translate-x-1/2
              hover:-translate-y-1
              hover:bg-white
              hover:shadow-2xl
            "
          >

            <span
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                bg-[#6F8F72]
                text-white
                transition-transform
                duration-300
                group-hover:scale-110
              "
            >
              <Play
                size={18}
                fill="currentColor"
              />
            </span>


            <div className="text-left">

              <p
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.22em]
                  text-[#6F8F72]
                "
              >
                Watch Introduction
              </p>


              <p
                className="
                  mt-1
                  text-[18px]
                  font-semibold
                  text-[#2B2B2B]
                  transition-colors
                  duration-300
                  group-hover:text-[#6F8F72]
                "
              >
                Meet Your Coach
              </p>

            </div>

          </button>

        </div>
      </div>
    </FadeRight>
  );
}