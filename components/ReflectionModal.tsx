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
   * When the modal is open, prevent the page behind it
   * from scrolling.
   */

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction =
      document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
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

            p-0

            sm:p-6
          "
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* =================================================
              MODAL CARD
              ================================================= */}

          <motion.div
            className="
              relative

              h-full
              w-full

              overflow-y-auto
              overscroll-contain

              bg-[#E6F0E2]

              p-6

              shadow-2xl

              sm:h-auto
              sm:max-h-[85vh]
              sm:max-w-xl
              sm:rounded-[2.25rem]
              sm:p-8
            "
            onClick={(e) => e.stopPropagation()}
            initial={{
              opacity: 0,
              scale: 0.97,
              y: 15,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.97,
              y: 15,
            }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
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
                right-5
                top-5

                z-10

                flex
                h-9
                w-9
                items-center
                justify-center

                rounded-full

                bg-[#F5F8F3]

                text-xl
                leading-none
                text-[#6F8F72]

                transition

                hover:bg-white

                sm:right-6
                sm:top-6
              "
            >
              ×
            </button>

            {/* =================================================
                CONTENT
                ================================================= */}

            <div
              className="
                mx-auto
                w-full
                max-w-2xl
              "
            >
              {/* =================================================
                  RATING
                  ================================================= */}

              <div
                className="
                  flex
                  gap-1

                  text-base
                  text-[#D9A441]

                  sm:gap-1.5
                  sm:text-lg
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
                "
              >
                {reflection.photo_url ? (
                  <img
                    src={reflection.photo_url}
                    alt={reflection.name}
                    className="
                      h-14
                      w-14
                      flex-shrink-0

                      rounded-full

                      object-cover

                      sm:h-16
                      sm:w-16
                    "
                  />
                ) : (
                  <div
                    className="
                      flex
                      h-14
                      w-14
                      flex-shrink-0

                      items-center
                      justify-center

                      rounded-full

                      bg-[#F5F8F3]

                      text-xl
                      text-[#6F8F72]

                      sm:h-16
                      sm:w-16
                      sm:text-2xl
                    "
                  >
                    {reflection.name.charAt(0)}
                  </div>
                )}

                <div className="min-w-0">
                  <h2
                    className="
                      text-[24px]
                      leading-tight

                      text-[#2B2B2B]

                      [font-family:var(--font-cormorant)]

                      sm:text-[27px]
                    "
                  >
                    {reflection.name}
                  </h2>

                  <p
                    className="
                      mt-1

                      text-xs
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
                "
              />

              {/* =================================================
                  QUOTE MARK
                  ================================================= */}

              <div
                className="
                  mt-5

                  text-5xl
                  leading-none

                  text-[#BFD2BA]

                  [font-family:var(--font-cormorant)]

                  sm:mt-6
                  sm:text-6xl
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

                  text-[19px]
                  leading-[1.65]

                  italic

                  text-[#4A4A4A]

                  [font-family:var(--font-cormorant)]

                  sm:-mt-3
                  sm:text-[22px]
                  sm:leading-[1.7]
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

                  sm:mt-10
                  sm:pt-6
                "
              >
                <button
                  type="button"
                  onClick={onPrevious}
                  className="
                    text-sm
                    text-[#6F8F72]

                    transition

                    hover:underline

                    sm:text-base
                  "
                >
                  ← Previous
                </button>

                <button
                  type="button"
                  onClick={onNext}
                  className="
                    text-sm
                    text-[#6F8F72]

                    transition

                    hover:underline

                    sm:text-base
                  "
                >
                  Next →
                </button>
              </div>

              {/* =================================================
                  MOBILE BOTTOM SPACE
                  ================================================= */}

              <div className="h-6 sm:hidden" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}