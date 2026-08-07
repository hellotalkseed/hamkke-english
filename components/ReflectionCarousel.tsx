"use client";

import { useState } from "react";
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

  // Duplicate cards ONLY for desktop infinite loop
  const desktopItems = [...reflections, ...reflections];

  return (
    <>
      {/* ================= MOBILE ================= */}

      <div
        className="
          lg:hidden

          overflow-x-auto
          snap-x
          snap-mandatory

          scrollbar-hide
        "
      >
        <div
          className="
            flex
            gap-5
            px-6
          "
        >
          {reflections.map((item) => (
            <div
              key={item.id}
              className="snap-center flex-shrink-0"
            >
              <ReflectionCard reflection={item} />
            </div>
          ))}
        </div>
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
            left-0
            top-0
            z-10
            h-full

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
            right-0
            top-0
            z-10
            h-full

            w-6
            sm:w-10
            lg:w-20

            bg-gradient-to-l
            from-white
            to-transparent
          "
        />

        <div
          className="
            flex
            w-max

            gap-5
            lg:gap-8

            animate-marquee
          "
          style={{
            animationPlayState: paused ? "paused" : "running",
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