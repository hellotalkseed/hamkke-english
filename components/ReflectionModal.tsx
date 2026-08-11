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
   * Lock the background page while the modal is open.
   * The modal remains scrollable on smaller screens when
   * a reflection is longer than the available height.
   */
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
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

            p-4
            sm:p-6
            lg:p-8
          "
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* ================= MODAL CARD ================= */}

          <motion.div
            className="
              relative

              w-full

              /*
               * MOBILE
               */
              max-h-[85vh]
              max-w-xl

              overflow-y-auto
              overscroll-contain

              rounded-[2rem]

              bg-[#E6F0E2]

              p-6

              shadow-2xl

              /*
               * TABLET
               */
              sm:max-h-[88vh]
              sm:rounded-[2.25rem]
              sm:p-8

              /*
               * DESKTOP
               *
               * Much wider so longer reflections
               * don't become unnecessarily tall.
               */
              lg:max-h-[90vh]
              lg:max-w-[900px]
              lg:overflow-y-visible
              lg:rounded-[2.5rem]
              lg:px-10
              lg:py-9

              /*
               * LARGE DESKTOP
               */
              xl:max-w-[960px]
              xl:px-12
              xl:py-10
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
            {/* ================= CLOSE BUTTON ================= */}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close reflection"
              className="
                absolute

                right-5
                top-5

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

                lg:right-8
                lg:top-7
              "
            >
              ×
            </button>

            {/* ================= RATING ================= */}

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

            {/* ================= PROFILE ================= */}

            <div
              className="
                mt-6

                flex
                items-center
                gap-4

                sm:mt-7
                sm:gap-5

                lg:mt-5
                lg:gap-5
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

              <div>
                <h2
                  className="
                    text-[24px]
                    leading-tight

                    text-[#2B2B2B]

                    [font-family:var(--font-cormorant)]

                    sm:text-[27px]

                    lg:text-[28px]
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

            {/* ================= DIVIDER ================= */}

            <div
              className="
                mt-6
                h-px
                bg-[#CBD9C7]

                sm:mt-7

                lg:mt-6
              "
            />

            {/* ================= QUOTE MARK ================= */}

            <div
              className="
                mt-5

                text-5xl
                leading-none

                text-[#BFD2BA]

                sm:mt-6
                sm:text-6xl

                lg:mt-5
                lg:text-5xl
              "
            >
              "
            </div>

            {/* ================= REFLECTION ================= */}

            <blockquote
              className="
                -mt-2

                whitespace-pre-line

                text-[17px]
                leading-[1.8]

                font-normal
                tracking-[0.01em]

                text-[#3F443F]

                sm:-mt-3
                sm:text-[18px]
                sm:leading-[1.85]

                lg:-mt-2
                lg:text-[17px]
                lg:leading-[1.75]

                xl:text-[18px]
                xl:leading-[1.8]
              "
            >
              “{reflection.reflection}”
            </blockquote>

            {/* ================= NAVIGATION ================= */}

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

                lg:mt-7
                lg:pt-5
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}