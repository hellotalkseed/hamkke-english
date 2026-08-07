"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
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

  const [sliderIndex, setSliderIndex] = useState(1);

const touchStartX = useRef(0);
const touchEndX = useRef(0);

useEffect(() => {
  if (sliderIndex === 0) {
    setTimeout(() => {
      setSliderIndex(reflections.length);
    }, 300);
  }

  if (sliderIndex === reflections.length + 1) {
    setTimeout(() => {
      setSliderIndex(1);
    }, 300);
  }

  setCurrentIndex(
    ((sliderIndex - 1 + reflections.length) % reflections.length)
  );
}, [sliderIndex, reflections.length]);

  useEffect(() => {
  if (!mobileRef.current || reflections.length === 0) return;

  const container = mobileRef.current;

  const firstCard =
    container.querySelector<HTMLElement>("[data-card]");

  if (!firstCard) return;

  const gap = 20;

  const cardWidth = firstCard.offsetWidth + gap;

  // Jump to the first REAL reflection (skip the cloned last card)
  container.scrollLeft = cardWidth;

  setCurrentIndex(0);
}, [reflections]);

  // Desktop infinite loop
  const desktopItems = [...reflections, ...reflections];

  // Mobile infinite loop
const mobileItems = [
  reflections[reflections.length - 1],
  ...reflections,
  reflections[0],
];

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

<div className="lg:hidden overflow-hidden px-4">

  <div
    className={`
  flex
  ease-out
  ${
    sliderIndex === 0 ||
    sliderIndex === reflections.length + 1
      ? "duration-0"
      : "duration-300"
  }
  transition-transform
`}
    style={{
      transform: `translateX(calc(-${sliderIndex * 100}% - ${sliderIndex * 20}px))`,
      gap: "20px",
    }}
    onTouchStart={(e) => {
      touchStartX.current = e.touches[0].clientX;
    }}
    onTouchMove={(e) => {
      touchEndX.current = e.touches[0].clientX;
    }}
    onTouchEnd={() => {
      const distance =
        touchStartX.current - touchEndX.current;

      if (distance > 50 && sliderIndex < reflections.length + 1) {
  setSliderIndex((prev) => prev + 1);
}

if (distance < -50 && sliderIndex > 0) {
  setSliderIndex((prev) => prev - 1);
}

      touchStartX.current = 0;
      touchEndX.current = 0;
    }}
  >
    {mobileItems.map((item, index) => (
      <div
        key={`${item.id}-${index}`}
        className="w-full flex-shrink-0"
      >
        <ReflectionCard reflection={item} />
      </div>
    ))}
  </div>

  {/* Dots */}

  <div className="mt-8 flex justify-center gap-3">
    {reflections.map((_, index) => (
      <button
        key={index}
        onClick={() => setSliderIndex(index + 1)}
        className={`
          rounded-full
          transition-all
          duration-300

          ${
            sliderIndex === index + 1
              ? "h-2 w-6 bg-[#6F8F72]"
              : "h-2 w-2 bg-[#E7EEE5]"
          }
        `}
      />
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