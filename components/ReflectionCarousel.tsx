"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

import ReflectionCard from "./ReflectionCard";
import ReflectionModal from "./ReflectionModal";

import { getMessages } from "../lib/getMessages";
import type { Locale } from "../lib/i18n";

type Reflection = {
  id: string;
  rating: number;
  name: string;
  role: string;
  country: string | null;
  reflection: string;
  photo_url: string | null;
};

interface ReflectionCarouselProps {
  reflections: Reflection[];
  locale: Locale;
}

export default function ReflectionCarousel({
  reflections,
  locale,
}: ReflectionCarouselProps) {
  const [paused, setPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  /* =====================================================
     MODAL STATE
     ===================================================== */

  const [selectedReflection, setSelectedReflection] =
    useState<Reflection | null>(null);

  const [modalOpen, setModalOpen] = useState(false);

  const t = getMessages(locale);

  /* =====================================================
     EMBLA
     ===================================================== */

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    containScroll: false,
  });

  /* =====================================================
     TRACK CURRENT SLIDE
     ===================================================== */

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCurrentIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);

    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  /* =====================================================
     OPEN MODAL
     ===================================================== */

  const openReflection = (reflection: Reflection) => {
    setSelectedReflection(reflection);
    setModalOpen(true);
  };

  /* =====================================================
     CLOSE MODAL
     ===================================================== */

  const closeReflection = () => {
    setModalOpen(false);
  };

  /* =====================================================
     PREVIOUS REFLECTION
     ===================================================== */

  const handlePrevious = () => {
    if (!selectedReflection || reflections.length === 0) {
      return;
    }

    const currentReflectionIndex = reflections.findIndex(
      (item) => item.id === selectedReflection.id
    );

    if (currentReflectionIndex === -1) {
      return;
    }

    const previousIndex =
      currentReflectionIndex === 0
        ? reflections.length - 1
        : currentReflectionIndex - 1;

    setSelectedReflection(reflections[previousIndex]);
  };

  /* =====================================================
     NEXT REFLECTION
     ===================================================== */

  const handleNext = () => {
    if (!selectedReflection || reflections.length === 0) {
      return;
    }

    const currentReflectionIndex = reflections.findIndex(
      (item) => item.id === selectedReflection.id
    );

    if (currentReflectionIndex === -1) {
      return;
    }

    const nextIndex =
      currentReflectionIndex === reflections.length - 1
        ? 0
        : currentReflectionIndex + 1;

    setSelectedReflection(reflections[nextIndex]);
  };

  /* =====================================================
     DESKTOP ITEMS
     ===================================================== */

  const desktopItems = [
    ...reflections,
    ...reflections,
  ];

  return (
    <>
      {/* =================================================
          MOBILE
          ================================================= */}

      <div
        className="
          overflow-hidden
          px-2
          lg:hidden
        "
      >
        <div ref={emblaRef}>
          <div
            className="
              flex
              gap-5
            "
          >
            {reflections.map((item) => (
              <div
                key={item.id}
                className="
                  flex
                  flex-[0_0_100%]
                  justify-center
                "
              >
                <ReflectionCard
                  reflection={item}
                  readMoreLabel={
                    t.reflections.readMoreCard
                  }
                  onClick={() =>
                    openReflection(item)
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* =================================================
            DOTS
            ================================================= */}

        <div
          className="
            mt-8
            flex
            justify-center
            gap-3
          "
        >
          {reflections.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() =>
                emblaApi?.scrollTo(index)
              }
              aria-label={`Go to reflection ${
                index + 1
              }`}
              className={`
                rounded-full
                transition-all
                duration-300

                ${
                  currentIndex === index
                    ? "h-2 w-6 bg-[#6F8F72]"
                    : "h-2 w-2 bg-[#E7EEE5]"
                }
              `}
            />
          ))}
        </div>
      </div>

      {/* =================================================
          DESKTOP
          ================================================= */}

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
        {/* =================================================
            LEFT FADE
            ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            inset-y-0
            left-0
            z-10
            w-6
            bg-gradient-to-r
            from-[#FAF8F5]
            to-transparent

            sm:w-10
            lg:w-20
          "
        />

        {/* =================================================
            RIGHT FADE
            ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            inset-y-0
            right-0
            z-10
            w-6
            bg-gradient-to-l
            from-white
            to-transparent

            sm:w-10
            lg:w-20
          "
        />

        {/* =================================================
            MARQUEE
            ================================================= */}

        <div
          className="
            flex
            w-max
            gap-5
            animate-marquee
            lg:gap-8
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
              readMoreLabel={
                t.reflections.readMoreCard
              }
              onClick={() =>
                openReflection(item)
              }
            />
          ))}
        </div>
      </div>

      {/* =================================================
          REFLECTION MODAL
          ================================================= */}

      <ReflectionModal
        reflection={selectedReflection}
        open={modalOpen}
        onClose={closeReflection}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </>
  );
}