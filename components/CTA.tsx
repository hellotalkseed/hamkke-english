"use client";

import { useState } from "react";
import AssessmentModal from "./AssessmentModal";

export default function CTA() {
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);

  return (
    <>
      <section
        id="contact"
        className="
          bg-[#6F8F72]
          py-20

          sm:py-24
          lg:py-32
        "
      >

        <div
          className="
            mx-auto
            max-w-5xl
            px-6
            text-center

            md:px-8
          "
        >

          {/* Label */}

          <p
            className="
              mb-5
              text-[12px]
              font-medium
              uppercase
              tracking-[0.35em]
              text-[#EEF5EE]

              sm:mb-6
            "
          >
            Begin Yours Here
          </p>



          {/* Heading */}

          <h2
            className="
              text-[40px]
              leading-[1.05]
              text-white
              [font-family:var(--font-cormorant)]

              sm:text-[52px]
              lg:text-[64px]
            "
          >
            Ready to grow your confidence
            <br className="hidden sm:block" />
            in English?
          </h2>



          {/* Description */}

          <p
            className="
              mx-auto
              mt-8
              max-w-2xl
              text-[17px]
              leading-8
              text-[#F5F5F0]

              sm:text-lg
              sm:leading-9
            "
          >
            Start with a personalized assessment and discover
            a learning approach designed around your goals,
            interests, and pace.
          </p>



          {/* Button */}

          <div className="mt-10">

            <button
              onClick={() => setIsAssessmentOpen(true)}
              className="
                rounded-full
                bg-white
                px-10
                py-4
                text-base
                font-medium
                text-[#6F8F72]
                shadow-lg
                transition-all
                duration-300

                hover:-translate-y-1
                hover:bg-[#F5F5F0]
                hover:shadow-xl

                sm:px-12
                sm:py-5
                sm:text-lg
              "
            >
              Book Your First Lesson
            </button>

          </div>


        </div>

      </section>



      <AssessmentModal
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
      />

    </>
  );
}