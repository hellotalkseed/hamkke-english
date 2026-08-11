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
   *
   * Both the html element and body are locked because
   * mobile browsers can otherwise continue scrolling
   * the page behind a fixed modal.
   */
  useEffect(() => {
    if (!open) return;

    const html = document.documentElement;
    const body = document.body;

    const originalHtmlOverflow = html.style.overflow;
    const originalBodyOverflow = body.style.overflow;
    const originalBodyOverscrollBehavior =
      body.style.overscrollBehavior;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";

    return () => {
      html.style.overflow = originalHtmlOverflow;
      body.style.overflow = originalBodyOverflow;
      body.style.overscrollBehavior =
        originalBodyOverscrollBehavior;
    };
  }, [open]);

  /*
   * Close the modal with the Escape key.
   */
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

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

            overflow-hidden

            bg-black/30

            px-4
            py-6

            sm:px-6
            sm:py-8

            md:px-8
            md:py-10
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

              w-[92vw]
              max-w-5xl

              max-h-[82dvh]

              overflow-y-auto
              overscroll-contain

              rounded-[2rem]

              bg-[#E6F0E2]

              p-6

              shadow-2xl

              sm:max-h-[84dvh]
              sm:rounded-[2.25rem]
              sm:p-8

              md:max-h-[86dvh]
              md:p-10

              lg:p-10
            "
            onClick={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
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
                right-4
                top-4
                z-10

                flex
                h-10
                w-10
                items-center
                justify-center

                rounded-full

                bg-[#F5F8F3]

                text-2xl
                leading-none
                text-[#6F8F72]

                transition

                hover:bg-white

                sm:right-6
                sm:top-6

                sm:h-11
                sm:w-11
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
                mt-5

                flex
                items-center
                gap-4

                pr-12

                sm:mt-6
                sm:gap-5

                md:mt-7
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

                    md:h-[72px]
                    md:w-[72px]
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

                    md:h-[72px]
                    md:w-[72px]
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

                    md:text-[30px]
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

                    md:text-[15px]
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

                md:mt-8
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

                md:mt-7
                md:text-6xl
              "
            >
              "
            </div>

            {/* =================================================
                REFLECTION

                Same Cormorant font on mobile and desktop.
                Only the size/line-height adjusts slightly
                for readability.
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

                md:text-[22px]
                md:leading-[1.7]

                lg:text-[23px]
                lg:leading-[1.7]
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

                md:mt-10
                md:pt-6
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