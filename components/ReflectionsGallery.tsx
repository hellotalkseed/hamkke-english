"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

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

interface ReflectionsGalleryProps {
  reflections: Reflection[];
  locale: Locale;
}

export default function ReflectionsGallery({
  reflections,
  locale,
}: ReflectionsGalleryProps) {
  const [selectedReflection, setSelectedReflection] =
    useState<Reflection | null>(null);

  const t = getMessages(locale);

  const currentIndex = reflections.findIndex(
    (item) => item.id === selectedReflection?.id
  );

  const showPrevious = useCallback(() => {
    if (currentIndex === -1) return;

    const previousIndex =
      currentIndex === 0
        ? reflections.length - 1
        : currentIndex - 1;

    setSelectedReflection(
      reflections[previousIndex]
    );
  }, [currentIndex, reflections]);

  const showNext = useCallback(() => {
    if (currentIndex === -1) return;

    const nextIndex =
      currentIndex === reflections.length - 1
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
      if (!selectedReflection) return;

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
          gap-8
          md:grid-cols-2
          xl:grid-cols-3
        "
      >
        {reflections.map((item) => (
          <ReflectionCard
            key={item.id}
            reflection={item}
            readMoreLabel={t.reflections.readMoreCard}
            onClick={() =>
              setSelectedReflection(item)
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
      />
    </>
  );
}