"use client";

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

            bg-[#FAF8F5]/90
            backdrop-blur-sm

            px-4
            py-6

            sm:px-6
            sm:py-8
          "
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* =====================================================
              MODAL
              ===================================================== */}

          <motion.div
            className="
              relative

              max-h-[90vh]
              w-full
              max-w-2xl

              overflow-y-auto

              rounded-[2rem]

              bg-[#E4EDDF]

              p-6

              shadow-2xl

              sm:rounded-[2.5rem]
              sm:p-8

              lg:p-10
            "
            onClick={(e) => e.stopPropagation()}
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
              y: 20,
            }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
          >
            {/* =====================================================
                CLOSE BUTTON
                ===================================================== */}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close story"
              className="
                absolute
                right-5
                top-5

                flex
                h-10
                w-10
                items-center
                justify-center

                rounded-full

                bg-white/70

                text-2xl
                leading-none
                text-[#6F8F72]

                transition-all
                duration-300

                hover:bg-white
                hover:scale-105

                sm:right-7
                sm:top-7
              "
            >
              ×
            </button>

            {/* =====================================================
                RATING
                ===================================================== */}

            <div
              className="
                flex
                gap-1

                text-lg
                text-[#D8A437]

                sm:gap-2
                sm:text-xl
              "
            >
              {Array.from({
                length: reflection.rating,
              }).map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>

            {/* =====================================================
                PROFILE
                ===================================================== */}

            <div
              className="
                mt-7
                flex
                items-center
                gap-4

                sm:mt-8
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

                    sm:h-20
                    sm:w-20
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

                    bg-white/70

                    text-xl
                    text-[#6F8F72]

                    sm:h-20
                    sm:w-20
                    sm:text-3xl
                  "
                >
                  {reflection.name.charAt(0)}
                </div>
              )}

              <div className="min-w-0">
                <h2
                  className="
                    text-[25px]
                    leading-tight
                    text-[#2B2B2B]

                    [font-family:var(--font-cormorant)]

                    sm:text-[30px]
                    lg:text-[32px]
                  "
                >
                  {reflection.name}
                </h2>

                <p
                  className="
                    mt-1

                    text-sm
                    leading-5
                    text-[#6F8F72]

                    sm:text-[15px]
                  "
                >
                  {reflection.role}
                  {reflection.country &&
                    ` • ${reflection.country}`}
                </p>
              </div>
            </div>

            {/* =====================================================
                DIVIDER
                ===================================================== */}

            <div
              className="
                mt-7
                h-px
                bg-[#C8D7C3]

                sm:mt-8
              "
            />

            {/* =====================================================
                QUOTE DECORATION
                ===================================================== */}

            <div
              className="
                mt-6

                text-6xl
                leading-none
                text-[#B8CBB3]

                [font-family:var(--font-cormorant)]

                sm:mt-8
                sm:text-7xl
              "
            >
              "
            </div>

            {/* =====================================================
                REFLECTION
                ===================================================== */}

            <blockquote
              className="
                -mt-3

                whitespace-pre-line

                text-[21px]
                leading-[1.7]

                italic
                text-[#3F443F]

                [font-family:var(--font-cormorant)]

                sm:text-[25px]
                sm:leading-[1.8]
              "
            >
              “{reflection.reflection}”
            </blockquote>

            {/* =====================================================
                NAVIGATION
                ===================================================== */}

            <div
              className="
                mt-10

                flex
                items-center
                justify-between

                border-t
                border-[#C8D7C3]

                pt-6

                sm:mt-14
                sm:pt-8
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
                ← Previous Story
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
                Next Story →
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}