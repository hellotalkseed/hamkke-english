"use client";

import Image from "next/image";
import { useEffect } from "react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";

import type { PublicReflection } from "../lib/getPublicReflections";

interface ReflectionModalProps {
  reflection: PublicReflection | null;
  open: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  showNavigation?: boolean;
}

export default function ReflectionModal({
  reflection,
  open,
  onClose,
  onPrevious,
  onNext,
  showNavigation = true,
}: ReflectionModalProps) {
  /*
   * =====================================================
   * LOCK BACKGROUND SCROLL
   * =====================================================
   */

  useEffect(() => {
    if (!open) {
      return;
    }

    const scrollY = window.scrollY;

    const originalBodyOverflow =
      document.body.style.overflow;

    const originalBodyPosition =
      document.body.style.position;

    const originalBodyTop =
      document.body.style.top;

    const originalBodyWidth =
      document.body.style.width;

    const originalHtmlOverflow =
      document.documentElement.style.overflow;

    document.documentElement.style.overflow =
      "hidden";

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
            z-[100]
            flex
            items-center
            justify-center
            bg-[#293A30]/45
            px-4
            py-6
            backdrop-blur-[2px]
            sm:px-6
            sm:py-8
          "
          onClick={onClose}
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: 0.2,
          }}
          style={{
            overscrollBehavior: "contain",
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Learner story from ${reflection.name}`}
            className="
              relative
              max-h-[86vh]
              w-full
              max-w-[680px]
              overflow-y-auto
              overscroll-contain
              rounded-[28px]
              bg-[#FFFDF8]
              px-6
              pb-6
              pt-7
              shadow-[0_24px_80px_rgba(48,74,57,0.22)]
              sm:px-8
              sm:pb-8
              sm:pt-8
              lg:max-w-[760px]
              lg:px-10
              lg:pb-9
              lg:pt-10
              [scrollbar-width:thin]
            "
            onClick={(event) =>
              event.stopPropagation()
            }
            onWheel={(event) =>
              event.stopPropagation()
            }
            initial={{
              opacity: 0,
              scale: 0.98,
              y: 10,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.98,
              y: 10,
            }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}
            style={{
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-y",
            }}
          >
            {/* CLOSE */}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close learner story"
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
                border
                border-[#718A73]/20
                text-[#718A73]
                transition-colors
                hover:bg-[#DCE4D7]
                hover:text-[#304A39]
              "
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-[14px] w-[14px]"
                aria-hidden="true"
              >
                <path
                  d="M3 3L13 13M13 3L3 13"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* TOP */}

            <div className="pr-12">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#718A73]">
                Learner story
              </p>

              {reflection.rating > 0 && (
                <div
                  className="mt-3 flex gap-[3px] text-[12px] text-[#B99454]"
                  aria-label={`${reflection.rating} out of 5 stars`}
                >
                  {Array.from({
                    length: Math.min(
                      reflection.rating,
                      5
                    ),
                  }).map((_, index) => (
                    <span key={index}>★</span>
                  ))}
                </div>
              )}
            </div>

            {/* QUOTE */}

            <div
              className="mt-7 font-serif text-[52px] leading-[0.65] text-[#718A73]"
              aria-hidden="true"
            >
              “
            </div>

            {/* FULL REFLECTION */}

            <blockquote className="mt-5 whitespace-pre-line font-serif text-[20px] leading-[1.55] tracking-[-0.015em] text-[#304A39] sm:text-[22px] sm:leading-[1.6]">
              {reflection.reflection}
            </blockquote>

            {/* ATTRIBUTION */}

            <div className="mt-8 border-t border-[#718A73]/15 pt-5">
              <div className="flex items-end justify-between gap-5">
                <div className="min-w-0">
                  <p className="text-[12px] leading-[1.5] text-[#52685A]">
                    <span className="font-semibold">
                      {reflection.name}
                    </span>

                    <span className="text-[#758477]">
                      {" "}
                      · with{" "}
                    </span>

                    <span className="font-bold text-[#718A73]">
                      {reflection.teacher_name}
                    </span>
                  </p>

                  {[reflection.role, reflection.country]
                    .filter(Boolean)
                    .length > 0 && (
                    <p className="mt-1 text-[11px] leading-5 text-[#758477]">
                      {[
                        reflection.role,
                        reflection.country,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>

                {reflection.photo_url && (
                  <div className="relative h-[58px] w-[58px] shrink-0 overflow-hidden rounded-full border border-[#718A73]/20 bg-[#F3EDDD]">
                    <Image
                      src={reflection.photo_url}
                      alt=""
                      fill
                      sizes="58px"
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* NAVIGATION */}

            {showNavigation && (
              <div className="mt-7 flex items-center justify-between border-t border-[#718A73]/15 pt-5">
                <button
                  type="button"
                  onClick={onPrevious}
                  className="
                    group
                    inline-flex
                    items-center
                    gap-2
                    text-[11px]
                    font-semibold
                    text-[#718A73]
                    transition-colors
                    hover:text-[#304A39]
                  "
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-[14px] w-[14px] transition-transform group-hover:-translate-x-1"
                    aria-hidden="true"
                  >
                    <path
                      d="M13 8H3M7 4L3 8L7 12"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  Previous
                </button>

                <button
                  type="button"
                  onClick={onNext}
                  className="
                    group
                    inline-flex
                    items-center
                    gap-2
                    text-[11px]
                    font-semibold
                    text-[#718A73]
                    transition-colors
                    hover:text-[#304A39]
                  "
                >
                  Next

                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-[14px] w-[14px] transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 8H13M9 4L13 8L9 12"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}