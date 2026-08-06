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
      aria-expanded={open}
      className="
        group
        w-full
        rounded-[2rem]
        border
        border-white/80
        bg-white
        p-7
        text-left
        shadow-[0_12px_35px_rgba(0,0,0,0.05)]
        transition-all
        duration-500

        hover:-translate-y-1
        hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)]

        sm:p-10
      "
    >

      {/* Header */}

      <div
        className="
          flex
          items-start
          gap-5
        "
      >

        {/* Icon */}

        <div
          className="
            flex
            h-14
            w-14
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-[#F6FBF6]
            transition-transform
            duration-300

            group-hover:scale-105

            sm:h-16
            sm:w-16
          "
        >

          <Icon
            className="
              h-7
              w-7
              text-[#6F8F72]

              sm:h-8
              sm:w-8
            "
          />

        </div>



        {/* Title */}

        <div
          className="
            flex-1
          "
        >

          <h3
            className="
              text-[26px]
              leading-tight
              text-[#2B2B2B]
              transition-colors
              duration-300
              group-hover:text-[#6F8F72]
              [font-family:var(--font-cormorant)]

              sm:text-3xl
            "
          >
            {title}
          </h3>



          {!open && (

            <>

              <p
                className="
                  mt-2
                  text-lg
                  italic
                  text-[#6F8F72]
                  [font-family:var(--font-cormorant)]

                  sm:text-xl
                "
              >
                {tagline}
              </p>


              <p
                className="
                  mt-6
                  text-[11px]
                  font-medium
                  uppercase
                  tracking-[0.25em]
                  text-[#6F8F72]
                "
              >
                Learn more →
              </p>

            </>

          )}

        </div>


      </div>





      {/* Expandable Content */}

      <div
        className={`
          grid
          overflow-hidden
          transition-all
          duration-500
          ease-in-out

          ${
            open
              ? "mt-8 grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }
        `}
      >

        <div
          className="
            overflow-hidden
          "
        >

          <div
            className="
              mb-8
              h-px
              bg-[#E7ECE7]
            "
          />


          <p
            className="
              text-[15px]
              leading-8
              text-[#5B5B5B]

              sm:text-base
            "
          >
            {description}
          </p>



          <div
            className="
              my-8
              h-px
              bg-[#E7ECE7]
            "
          />



          <p
            className="
              text-center
              text-lg
              italic
              text-[#6F8F72]
              [font-family:var(--font-cormorant)]

              sm:text-xl
            "
          >
            {tagline}
          </p>



          <p
            className="
              mt-8
              text-center
              text-[11px]
              font-medium
              uppercase
              tracking-[0.25em]
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