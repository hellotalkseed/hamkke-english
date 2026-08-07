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

  const items = [...reflections, ...reflections];
  console.log("Carousel items:", items.length);

  return (
    <div
      className="relative overflow-hidden"
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
          w-20
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
          w-20
          bg-gradient-to-l
          from-white
          to-transparent
        "
      />

      <div
        className="
          flex
          w-max
          gap-8
          animate-marquee
        "
        style={{
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {items.map((item, index) => (
          <ReflectionCard
            key={`${item.id}-${index}`}
            reflection={item}
          />
        ))}
      </div>
    </div>
  );
}