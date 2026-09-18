"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import ReflectionCard from "./ReflectionCard";
import ReflectionModal from "./ReflectionModal";

import type { PublicReflection } from "../lib/getPublicReflections";
import type { Locale } from "../lib/i18n";

interface ReflectionsGalleryProps {
  reflections: PublicReflection[];
  locale: Locale;
}

export default function ReflectionsGallery({
  reflections,
}: ReflectionsGalleryProps) {
  const [
    selectedReflection,
    setSelectedReflection,
  ] = useState<PublicReflection | null>(null);

  const currentIndex = reflections.findIndex(
    (item) =>
      item.id === selectedReflection?.id
  );

  const showPrevious = useCallback(() => {
    if (
      currentIndex === -1 ||
      reflections.length === 0
    ) {
      return;
    }

    const previousIndex =
      currentIndex === 0
        ? reflections.length - 1
        : currentIndex - 1;

    setSelectedReflection(
      reflections[previousIndex]
    );
  }, [currentIndex, reflections]);

  const showNext = useCallback(() => {
    if (
      currentIndex === -1 ||
      reflections.length === 0
    ) {
      return;
    }

    const nextIndex =
      currentIndex ===
      reflections.length - 1
        ? 0
        : currentIndex + 1;

    setSelectedReflection(
      reflections[nextIndex]
    );
  }, [currentIndex, reflections]);

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (!selectedReflection) {
        return;
      }

      if (event.key === "Escape") {
        setSelectedReflection(null);
      }

      if (event.key === "ArrowLeft") {
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    selectedReflection,
    showPrevious,
    showNext,
  ]);

  return (
    <>
      <div
        className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
          lg:gap-5
        "
      >
        {reflections.map((reflection, index) => (
          <ReflectionCard
            key={reflection.id}
            reflection={reflection}
            index={index}
            onClick={() =>
              setSelectedReflection(reflection)
            }
          />
        ))}
      </div>

      <ReflectionModal
        reflection={selectedReflection}
        open={!!selectedReflection}
        onClose={() =>
          setSelectedReflection(null)
        }
        onPrevious={showPrevious}
        onNext={showNext}
        showNavigation={reflections.length > 1}
      />
    </>
  );
}