import Image from "next/image";
import { Play } from "lucide-react";

interface HeroImageProps {
  onOpenVideo: () => void;
}

export default function HeroImage({
  onOpenVideo,
}: HeroImageProps) {
  return (
    <div className="order-1 flex justify-center lg:order-2 lg:justify-end">

      <div
        className="
          relative
          h-[410px]
          w-full
          max-w-[320px]
          overflow-hidden
          rounded-[2.5rem]
          border-8
          border-white
          bg-white
          shadow-[0_35px_80px_rgba(0,0,0,0.12)]
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
            (max-width:768px) 320px,
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
            bottom-6
            left-1/2
            flex
            -translate-x-1/2
            items-center
            gap-4
            whitespace-nowrap
            rounded-full
            bg-white
            px-6
            py-4
            shadow-xl
            transition-all
            duration-300
            hover:-translate-y-1
            hover:-translate-x-1/2
            hover:shadow-2xl
          "
        >

          <span
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-[#6F8F72]
              text-white
            "
          >
            <Play
              size={20}
              fill="currentColor"
            />
          </span>

          <div className="text-left">

            <p
              className="
                text-[11px]
                uppercase
                tracking-[0.25em]
                text-[#6F8F72]
              "
            >
              Watch
            </p>

            <p
              className="
                text-lg
                font-medium
                text-[#2B2B2B]
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