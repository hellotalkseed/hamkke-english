"use client";

import { useState } from "react";
import AssessmentModal from "./InquiryModal";

export default function Footer() {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  return (
    <>
      <footer
        className="
          bg-[#2B2B2B]
          py-12

          sm:py-14
        "
      >
        <div
          className="
            mx-auto
            max-w-7xl
            px-6

            md:px-8
            lg:px-10
          "
        >
          <div
            className="
              flex
              flex-col
              items-center
              justify-between
              gap-8

              md:flex-row
              md:items-start
            "
          >

            {/* Brand */}

            <div
              className="
                text-center

                md:text-left
              "
            >
              <h3
                className="
                  text-[28px]
                  text-white
                  [font-family:var(--font-cormorant)]
                "
              >
                Hamkke │ 함께
              </h3>

              <p
                className="
                  mt-2
                  text-sm
                  tracking-wide
                  text-white/60
                "
              >
                From Small Talk to Big Ideas
              </p>
            </div>

            {/* Navigation */}

            <nav
              className="
                flex
                flex-wrap
                justify-center
                gap-x-6
                gap-y-3
                text-sm
                text-white/70

                md:justify-end
              "
            >
              <a
                href="#about"
                className="transition hover:text-white"
              >
                About
              </a>

              <a
                href="#lessons"
                className="transition hover:text-white"
              >
                Lessons
              </a>

              <a
                href="#student-stories"
                className="transition hover:text-white"
              >
                Stories
              </a>

              <button
                type="button"
                onClick={() => setIsInquiryOpen(true)}
                className="
                  transition
                  hover:text-white
                "
              >
                Contact
              </button>
            </nav>
          </div>

          {/* Copyright */}

          <div
            className="
              mt-10
              border-t
              border-white/10
              pt-6
              text-center
              text-xs
              text-white/40
            "
          >
            © 2026 Hamkke │ 함께. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Inquiry Modal */}

      <AssessmentModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        source="get-in-touch"
      />
    </>
  );
}