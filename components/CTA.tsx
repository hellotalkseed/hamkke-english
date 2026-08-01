"use client";

import { useState } from "react";
import AssessmentModal from "./AssessmentModal";

export default function CTA() {

  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);


  return (
    <>

      <section
        id="contact"
        className="bg-[#6F8F72] py-28"
      >

        <div className="mx-auto max-w-5xl px-6 text-center">


          {/* Label */}

          <p
            className="
              mb-6
              text-sm
              uppercase
              tracking-[0.3em]
              text-[#EEF5EE]
            "
          >
            Start Your Journey
          </p>




          {/* Heading */}

          <h2
            className="
              text-5xl
              leading-tight
              text-white
              lg:text-6xl
              [font-family:var(--font-cormorant)]
            "
          >
            Your English journey begins with a conversation.
          </h2>




          {/* Description */}

          <p
            className="
              mx-auto
              mt-8
              max-w-3xl
              text-lg
              leading-8
              text-[#F5F5F0]
            "
          >
            Every learner has unique goals, experiences, and challenges.
            Begin with a personalized conversation to understand your
            current level and create a learning path designed around
            your growth.
          </p>




          {/* Button */}

          <div className="mt-10">

            <button
              onClick={() => setIsAssessmentOpen(true)}
              className="
                inline-block
                rounded-full
                bg-white
                px-10
                py-4
                font-medium
                text-[#6F8F72]
                transition
                hover:bg-[#F5F5F0]
                hover:-translate-y-1
              "
            >
              Book Your First Lesson
            </button>

          </div>



        </div>


      </section>




      {/* Assessment Modal */}

      <AssessmentModal
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
      />


    </>
  );
}