"use client";

import Image from "next/image";

import type { PublicReflection } from "../lib/getPublicReflections";

interface ReflectionCardProps {
  reflection: PublicReflection;
  index: number;
  onClick?: () => void;
}

const cardBackgrounds = [
  "bg-[#FFFDF8]",
  "bg-[#DCE4D7]",
  "bg-[#FFFDF8]",
  "bg-[#EDE3D2]",
  "bg-[#FFFDF8]",
];

export default function ReflectionCard({
  reflection,
  index,
  onClick,
}: ReflectionCardProps) {
  const background =
    cardBackgrounds[
      index % cardBackgrounds.length
    ];

  const learnerDetails = [
    reflection.role,
    reflection.country,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      className={`
        group
        flex
        h-[270px]
        flex-col
        overflow-hidden
        rounded-[24px]
        ${background}
        p-5
        transition-transform
        duration-200
        sm:h-[280px]
        sm:p-6
        lg:h-[290px]
        hover:-translate-y-[2px]
      `}
    >
      {/* TOP */}

      <div className="flex items-start justify-between gap-4">
        <div
          className="font-serif text-[36px] leading-[0.65] text-[#718A73]"
          aria-hidden="true"
        >
          “
        </div>

        {reflection.rating > 0 && (
          <div
            className="flex shrink-0 gap-[2px] text-[10px] text-[#B99454]"
            aria-label={`${reflection.rating} out of 5 stars`}
          >
            {Array.from({
              length: Math.min(
                reflection.rating,
                5
              ),
            }).map((_, starIndex) => (
              <span key={starIndex}>★</span>
            ))}
          </div>
        )}
      </div>

      {/* REFLECTION PREVIEW */}

      <blockquote className="mt-4 line-clamp-6 font-serif text-[17px] leading-[1.4] tracking-[-0.015em] text-[#304A39]">
        {reflection.reflection}
      </blockquote>

      {/* READ FULL STORY */}

      <button
        type="button"
        onClick={onClick}
        className="
          mt-3
          w-fit
          text-[10px]
          font-semibold
          text-[#718A73]
          underline
          decoration-[#718A73]/30
          underline-offset-[3px]
          transition-colors
          hover:text-[#304A39]
        "
      >
        Read full story
      </button>

      {/* ATTRIBUTION */}

      <div className="mt-auto pt-4">
        <div
          className="h-px w-8 bg-[#718A73]/25"
          aria-hidden="true"
        />

        <div className="mt-3 flex items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] leading-[1.4] text-[#52685A]">
              <span className="font-semibold">
                {reflection.name}
              </span>

              <span className="text-[#758477]">
                {" "}
                · with{" "}
              </span>

              <span className="font-bold text-[#718A73]">
                {reflection.teacher_name}
              </span>
            </p>

            {learnerDetails && (
              <p className="mt-1 text-[10px] leading-[1.4] text-[#758477]">
                {learnerDetails}
              </p>
            )}
          </div>

          {/* PHOTO ONLY WHEN PROVIDED */}

          {reflection.photo_url && (
            <div className="relative h-[46px] w-[46px] shrink-0 overflow-hidden rounded-full border border-[#718A73]/15 bg-[#FFFDF8]">
              <Image
                src={reflection.photo_url}
                alt=""
                fill
                sizes="46px"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}