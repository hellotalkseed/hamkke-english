"use client";

import {
  X,
  GraduationCap,
  BriefcaseBusiness,
  BadgeCheck,
} from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoModal({
  isOpen,
  onClose,
}: VideoModalProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/70
        p-4
        backdrop-blur-md
      "
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          relative
          max-h-[90vh]
          w-full
          max-w-6xl
          overflow-y-auto
          rounded-[2rem]
          bg-[#FAF8F5]
          p-6
          shadow-2xl
          md:p-10
        "
      >
        {/* Close Button */}

        <button
          onClick={onClose}
          className="
            absolute
            right-5
            top-5
            z-20
            rounded-full
            bg-white
            p-2
            text-[#555]
            shadow-md
            transition
            hover:bg-gray-100
          "
        >
          <X size={22} />
        </button>

        <div
          className="
            grid
            gap-8
            lg:grid-cols-2
            lg:items-start
            lg:gap-10
          "
        >
          {/* LEFT */}

          <div>

            <p
              className="
                text-xs
                uppercase
                tracking-[0.35em]
                text-[#6F8F72]
              "
            >
              Meet Your Coach
            </p>

            <h2
              className="
                mt-5
                text-4xl
                leading-tight
                text-[#2B2B2B]
                [font-family:var(--font-cormorant)]
                md:text-5xl
              "
            >
              Every meaningful conversation starts somewhere.
            </h2>

            <p
              className="
                mt-5
                text-xl
                italic
                text-[#6F8F72]
                [font-family:var(--font-cormorant)]
              "
            >
              Here's a little about my journey.
            </p>

            <p
              className="
                mt-8
                text-base
                leading-8
                text-[#5B5B5B]
                md:text-lg
              "
            >
              Teaching English has shown me that confidence grows
              through meaningful conversations. My goal is to create
              a space where you can speak naturally, embrace mistakes,
              and enjoy the process of learning.
            </p>

          </div>

          {/* RIGHT */}

          <div>

            {/* VIDEO */}

            <div
              className="
                overflow-hidden
                rounded-[2rem]
                bg-black
                shadow-xl
              "
            >
              <video
                controls
                autoPlay
                playsInline
                className="
                  aspect-video
                  w-full
                  object-cover
                "
              >
                <source
                  src="/videos/hamkke-introduction.mp4"
                  type="video/mp4"
                />

                Your browser does not support the video tag.
              </video>
            </div>

            {/* QUALIFICATIONS */}

            <div
              className="
                mt-5
                grid
                gap-3
                lg:mt-6
                lg:grid-cols-3
                lg:gap-5
              "
            >

              {/* Education */}

              <div
                className="
                  rounded-2xl
                  border
                  border-[#E9E4DD]
                  bg-white
                  p-4
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-md
                  lg:p-5
                "
              >

                <div className="flex items-center gap-2.5">

  <GraduationCap
    size={17}
    className="text-[#6F8F72] shrink-0"
  />

  <p
    className="
      text-[10px]
      font-medium
      uppercase
      tracking-[0.25em]
      text-[#8A8A8A]
    "
  >
    Education
  </p>

</div>

                <p
                  className="
                    mt-4
                    text-[15px]
                    leading-6
                    text-[#444]
                  "
                >
                  Bachelor's Degree in Business Administration
                </p>

              </div>

              {/* Experience */}

              <div
                className="
                  rounded-2xl
                  border
                  border-[#E9E4DD]
                  bg-white
                  p-4
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-md
                  lg:p-5
                "
              >

                <div className="flex items-center gap-2.5">

  <BriefcaseBusiness
    size={17}
    className="text-[#6F8F72] shrink-0"
  />

  <p
    className="
      text-[10px]
      font-medium
      uppercase
      tracking-[0.25em]
      text-[#8A8A8A]
    "
  >
    Experience
  </p>

</div>

                <p
                  className="
                    mt-4
                    text-[15px]
                    leading-6
                    text-[#444]
                  "
                >
                  5+ Years of Online English Coaching
                </p>

              </div>

              {/* Certifications */}

              <div
                className="
                  rounded-2xl
                  border
                  border-[#E9E4DD]
                  bg-white
                  p-4
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-md
                  lg:p-5
                "
              >

                <div className="flex items-center gap-2.5">

  <BadgeCheck
    size={17}
    className="text-[#6F8F72] shrink-0"
  />

  <p
    className="
      text-[10px]
      font-medium
      uppercase
      tracking-[0.25em]
      text-[#8A8A8A]
    "
  >
    Certifications
  </p>

</div>

                <p
                  className="
                    mt-4
                    text-[15px]
                    leading-6
                    text-[#444]
                  "
                >
                  Advanced TESOL, TEFL, and Teaching English to Young Learners
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}