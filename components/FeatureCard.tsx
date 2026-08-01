"use client";

import { useState } from "react";
import { LucideIcon } from "lucide-react";

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  tagline: string;
};

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  tagline,
}: FeatureCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <button
      onClick={() => setOpen(!open)}
      className="
        group
        w-full
        rounded-3xl
        bg-white
        p-8
        text-left
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      "
    >
      {/* Header */}

      <div className="flex items-start gap-5">

        {/* Icon */}

        <div
          className="
            flex
            h-16
            w-16
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-[#F6FBF6]
            transition-all
            duration-300
            group-hover:scale-105
          "
        >
          <Icon className="h-8 w-8 text-[#6F8F72]" />
        </div>

        {/* Content */}

        <div className="flex-1">

          <h3
            className="
              text-3xl
              text-[#2B2B2B]
              transition-colors
              duration-300
              group-hover:text-[#6F8F72]
              [font-family:var(--font-cormorant)]
            "
          >
            {title}
          </h3>

          {!open && (
            <>
              <p
                className="
                  mt-2
                  text-xl
                  italic
                  text-[#6F8F72]
                  [font-family:var(--font-cormorant)]
                "
              >
                {tagline}
              </p>

              <p
                className="
                  mt-6
                  text-sm
                  font-medium
                  uppercase
                  tracking-[0.2em]
                  text-[#6F8F72]
                "
              >
                Learn more →
              </p>
            </>
          )}

        </div>

      </div>

      {/* Expandable */}

      <div
        className={`
          grid
          overflow-hidden
          transition-all
          duration-300
          ease-in-out
          ${
            open
              ? "mt-8 grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }
        `}
      >
        <div className="overflow-hidden">

          <div className="mb-8 h-px bg-[#E7ECE7]" />

          <p className="leading-8 text-[#5B5B5B]">
            {description}
          </p>

          <div className="my-8 h-px bg-[#E7ECE7]" />

          <p
            className="
              text-center
              text-xl
              italic
              text-[#6F8F72]
              [font-family:var(--font-cormorant)]
            "
          >
            {tagline}
          </p>

          <p
            className="
              mt-8
              text-center
              text-sm
              font-medium
              uppercase
              tracking-[0.2em]
              text-[#6F8F72]
            "
          >
            Show less
          </p>

        </div>

      </div>

    </button>
  );
}