"use client";

import { X } from "lucide-react";

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
            gap-10
            lg:grid-cols-2
            lg:items-start
          "
        >

          {/* LEFT SIDE */}

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
  Here's a little about mine.
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
  Teaching English has shown me that confidence grows through
  meaningful conversations. My goal is to create a space where
  you can speak naturally, embrace mistakes, and enjoy the
  process of learning.
</p>

          </div>



          {/* RIGHT SIDE */}

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
                  max-h-[500px]
                  w-full
                  object-cover
                "
              >

                <source
                  src="/videos/talkseed-introduction.mp4"
                  type="video/mp4"
                />

                Your browser does not support the video tag.

              </video>

            </div>



            {/* QUALIFICATIONS */}

            <div
              className="
                mt-6
                grid
                gap-4
                sm:grid-cols-3
              "
            >

              <div
                className="
                  rounded-2xl
                  bg-white
                  p-5
                  shadow-sm
                "
              >
                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.25em]
                    text-[#8A8A8A]
                  "
                >
                  Education
                </p>

                <p
  className="
    mt-3
    text-sm
    leading-6
    text-[#444]
  "
>
  Bachelor's Degree
  <br />
  in Business Administration
</p>
              </div>



              <div
                className="
                  rounded-2xl
                  bg-white
                  p-5
                  shadow-sm
                "
              >
                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.25em]
                    text-[#8A8A8A]
                  "
                >
                  Experience
                </p>

                <p
  className="
    mt-3
    text-sm
    leading-6
    text-[#444]
  "
>
  4+ years of
  <br />
  online English
  <br />
  coaching
</p>
              </div>



              <div
                className="
                  rounded-2xl
                  bg-white
                  p-5
                  shadow-sm
                "
              >
                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.25em]
                    text-[#8A8A8A]
                  "
                >
                  Certifications
                </p>

                <p
  className="
    mt-3
    text-sm
    leading-6
    text-[#444]
  "
>
  Advanced TESOL
  <br />
  TEFL
  <br />
  Teaching English to Young Learners
</p>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}