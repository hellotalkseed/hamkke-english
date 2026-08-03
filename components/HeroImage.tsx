import Image from "next/image";
import { Play } from "lucide-react";

interface HeroImageProps {
  onOpenVideo: () => void;
}

export default function HeroImage({
  onOpenVideo,
}: HeroImageProps) {
  return (
    <div
      className="
        flex
        justify-center
        lg:justify-end
      "
    >
      <div
        className="
          relative
          w-full
          h-[370px]
          max-w-[300px]
          overflow-hidden
          rounded-[2.5rem]
          border-8
          border-white
          bg-white
          shadow-[0_35px_80px_rgba(0,0,0,0.12)]

          sm:h-[430px]
          sm:max-w-[330px]

          md:h-[500px]
          md:max-w-[360px]

          lg:h-[540px]
          lg:max-w-[390px]
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
            390px
          "
          className="
            object-cover
            object-top
          "
        />

        <button
          onClick={onOpenVideo}
          className="
            absolute
            bottom-5
            left-1/2
            flex
            -translate-x-1/2
            items-center
            gap-3
            whitespace-nowrap
            rounded-full
            bg-white
            px-5
            py-3
            shadow-xl
            transition-all
            duration-300
            hover:-translate-y-1
            hover:-translate-x-1/2
            hover:shadow-2xl

            sm:bottom-6
            sm:gap-4
            sm:px-6
            sm:py-4
          "
        >
          <span
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-[#6F8F72]
              text-white

              sm:h-12
              sm:w-12
            "
          >
            <Play
              size={18}
              fill="currentColor"
              className="sm:h-5 sm:w-5"
            />
          </span>

          <div className="text-left">
            <p
              className="
                text-[10px]
                uppercase
                tracking-[0.22em]
                text-[#6F8F72]

                sm:text-[11px]
              "
            >
              Watch
            </p>

            <p
              className="
                text-base
                font-medium
                text-[#2B2B2B]

                sm:text-lg
              "
            >
              Meet Your Coach
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}