"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Reflection = {
  id: string;
  rating: number;
  name: string;
  role: string;
  country: string | null;
  reflection: string;
  photo_url: string | null;
};

export default function ReflectionModal({
  reflection,
  open,
  onClose,
  onPrevious,
  onNext,
}: {
  reflection: Reflection | null;
  open: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  /*
   * =====================================================
   * LOCK BACKGROUND SCROLL
   * =====================================================
   *
   * This prevents the page behind the modal from scrolling,
   * especially on mobile / iOS.
   */

  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;

    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyTop = document.body.style.top;
    const originalBodyWidth = document.body.style.width;

    const originalHtmlOverflow =
      document.documentElement.style.overflow;

    document.documentElement.style.overflow = "hidden";

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.documentElement.style.overflow =
        originalHtmlOverflow;

      document.body.style.overflow =
        originalBodyOverflow;

      document.body.style.position =
        originalBodyPosition;

      document.body.style.top =
        originalBodyTop;

      document.body.style.width =
        originalBodyWidth;

      window.scrollTo(0, scrollY);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && reflection && (
        <motion.div
          className="
            fixed
            inset-0
            z-50

            flex
            items-center
            justify-center

            bg-black/30

            px-4
            py-6

            sm:px-6
            sm:py-8

            lg:px-8
          "
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            overscrollBehavior: "contain",
            touchAction: "none",
          }}
        >
          {/* =================================================
              MODAL CARD
              ================================================= */}

          <motion.div
            className="
              relative

              w-full

              max-w-[92vw]
              sm:max-w-2xl
              lg:max-w-5xl
              xl:max-w-6xl

              max-h-[84vh]
              sm:max-h-[86vh]
              lg:max-h-[88vh]

              overflow-y-auto
              overscroll-contain

              rounded-[2rem]
              sm:rounded-[2.25rem]
              lg:rounded-[2.5rem]

              bg-[#E6F0E2]

              px-6
              py-7

              sm:px-8
              sm:py-9

              lg:px-10
              lg:py-10

              shadow-2xl

              [scrollbar-width:thin]
            "
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            initial={{
              opacity: 0,
              scale: 0.97,
              y: 12,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.97,
              y: 12,
            }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
            style={{
              overscrollBehavior: "contain",
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-y",
            }}
          >
            {/* =================================================
                CLOSE BUTTON
                ================================================= */}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close reflection"
              className="
                absolute
                right-4
                top-4

                flex
                h-10
                w-10
                items-center
                justify-center

                rounded-full

                bg-[#F5F8F3]

                text-[22px]
                font-light
                leading-none

                text-[#6F8F72]

                transition
                duration-200

                hover:bg-white
                hover:scale-105

                sm:right-5
                sm:top-5

                lg:right-7
                lg:top-7
              "
            >
              ×
            </button>

            {/* =================================================
                RATING
                ================================================= */}

            <div
              className="
                flex
                gap-1

                text-[17px]
                text-[#D9A441]

                sm:text-[18px]
              "
            >
              {Array.from({
                length: reflection.rating,
              }).map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>

            {/* =================================================
                PROFILE
                ================================================= */}

            <div
              className="
                mt-6

                flex
                items-center
                gap-4

                sm:mt-7
                sm:gap-5

                lg:mt-6
              "
            >
              {reflection.photo_url ? (
                <img
                  src={reflection.photo_url}
                  alt={reflection.name}
                  className="
                    h-14
                    w-14
                    shrink-0

                    rounded-full

                    object-cover

                    sm:h-16
                    sm:w-16

                    lg:h-[68px]
                    lg:w-[68px]
                  "
                />
              ) : (
                <div
                  className="
                    flex
                    h-14
                    w-14
                    shrink-0

                    items-center
                    justify-center

                    rounded-full

                    bg-[#F5F8F3]

                    text-xl
                    font-medium

                    text-[#6F8F72]

                    sm:h-16
                    sm:w-16
                    sm:text-2xl

                    lg:h-[68px]
                    lg:w-[68px]
                  "
                >
                  {reflection.name.charAt(0)}
                </div>
              )}

              <div>
                <h2
                  className="
                    text-[25px]
                    font-medium
                    leading-tight

                    tracking-[-0.02em]

                    text-[#2B2B2B]

                    sm:text-[28px]

                    lg:text-[30px]
                  "
                >
                  {reflection.name}
                </h2>

                <p
                  className="
                    mt-1

                    text-[13px]
                    leading-5

                    text-[#6F8F72]

                    sm:text-sm
                  "
                >
                  {reflection.role}
                  {reflection.country &&
                    ` • ${reflection.country}`}
                </p>
              </div>
            </div>

            {/* =================================================
                DIVIDER
                ================================================= */}

            <div
              className="
                mt-6
                h-px
                bg-[#CBD9C7]

                sm:mt-7

                lg:mt-8
              "
            />

            {/* =================================================
                QUOTE MARK
                ================================================= */}

            <div
              className="
                mt-5

                text-[48px]
                font-serif
                leading-none

                text-[#BFD2BA]

                sm:mt-6
                sm:text-[54px]
              "
            >
              "
            </div>

            {/* =================================================
                REFLECTION
                ================================================= */}

            <blockquote
              className="
                -mt-2

                whitespace-pre-line

                text-[17px]
                font-normal
                leading-[1.75]

                tracking-[-0.005em]

                text-[#3F4540]

                sm:-mt-3
                sm:text-[18px]
                sm:leading-[1.8]

                lg:text-[19px]
                lg:leading-[1.8]

                xl:text-[20px]
                xl:leading-[1.8]
              "
            >
              “{reflection.reflection}”
            </blockquote>

            {/* =================================================
                NAVIGATION
                ================================================= */}

            <div
              className="
                mt-8

                flex
                items-center
                justify-between

                border-t
                border-[#CBD9C7]

                pt-5

                sm:mt-9
                sm:pt-6

                lg:mt-10
                lg:pt-7
              "
            >
              <button
                type="button"
                onClick={onPrevious}
                className="
                  text-[14px]
                  font-medium

                  text-[#6F8F72]

                  transition
                  duration-200

                  hover:underline

                  sm:text-[15px]

                  lg:text-base
                "
              >
                ← Previous
              </button>

              <button
                type="button"
                onClick={onNext}
                className="
                  text-[14px]
                  font-medium

                  text-[#6F8F72]

                  transition
                  duration-200

                  hover:underline

                  sm:text-[15px]

                  lg:text-base
                "
              >
                Next →
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}