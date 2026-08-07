"use client";

import { useRef, useState } from "react";
import ReflectionCard from "./ReflectionCard";

type Reflection = {
  id: string;
  rating: number;
  name: string;
  role: string;
  country: string | null;
  reflection: string;
  photo_url: string | null;
};

export default function ReflectionCarousel({
  reflections,
}: {
  reflections: Reflection[];
}) {
  const [paused, setPaused] = useState(false);

  const mobileRef = useRef<HTMLDivElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Desktop infinite loop
  const desktopItems = [...reflections, ...reflections];

  const handleScroll = () => {
    if (!mobileRef.current) return;

    const container = mobileRef.current;

    const firstCard =
      container.querySelector<HTMLElement>("[data-card]");

    if (!firstCard) return;

    const gap = 20; // gap-5 = 20px

    const cardWidth =
      firstCard.offsetWidth + gap;

    const index = Math.round(
      container.scrollLeft / cardWidth
    );

    setCurrentIndex(
      Math.max(
        0,
        Math.min(index, reflections.length - 1)
      )
    );
  };

  return (
    <>
      {/* ================= MOBILE ================= */}

      <div
        ref={mobileRef}
        onScroll={handleScroll}
        className="
          lg:hidden

          overflow-x-auto

          snap-x
          snap-mandatory

          scroll-smooth

          px-4

          [-ms-overflow-style:none]
          [scrollbar-width:none]

          [&::-webkit-scrollbar]:hidden
        "
      >
        <div
          className="
            flex
            gap-5

            pr-[18vw]
          "
        >
          {reflections.map((item) => (
            <div
              key={item.id}
              data-card
              className="
                snap-center
                flex-shrink-0
              "
            >
              <ReflectionCard
                reflection={item}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Indicators */}

      <div
        className="
          mt-6
          flex
          justify-center
          gap-2

          lg:hidden
        "
      >
        {reflections.map((_, index) => (
          <div
            key={index}
            className={`
              h-2
              rounded-full
              transition-all
              duration-300

              ${
                currentIndex === index
                  ? "w-8 bg-[#6F8F72]"
                  : "w-2 bg-[#D6E4D5]"
              }
            `}
          />
        ))}
      </div>

      {/* ================= DESKTOP ================= */}

      <div
        className="
          relative
          hidden
          overflow-hidden

          lg:block
        "
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Left Fade */}

        <div
          className="
            pointer-events-none
            absolute
            inset-y-0
            left-0
            z-10

            w-6
            sm:w-10
            lg:w-20

            bg-gradient-to-r
            from-white
            to-transparent
          "
        />

        {/* Right Fade */}

        <div
          className="
            pointer-events-none
            absolute
            inset-y-0
            right-0
            z-10

            w-6
            sm:w-10
            lg:w-20

            bg-gradient-to-l
            from-white
            to-transparent
          "
        />

        {/* Marquee */}

        <div
          className="
            flex
            w-max

            gap-5
            lg:gap-8

            animate-marquee
          "
          style={{
            animationPlayState: paused
              ? "paused"
              : "running",
          }}
        >
          {desktopItems.map((item, index) => (
            <ReflectionCard
              key={`${item.id}-${index}`}
              reflection={item}
            />
          ))}
        </div>
      </div>
    </>
  );
}