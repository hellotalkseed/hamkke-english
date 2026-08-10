"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import InquiryForm, {
  InquirySource,
} from "./InquiryForm";

import type { Locale } from "../lib/i18n";

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: InquirySource;
  locale: Locale;
}

export default function InquiryModal({
  isOpen,
  onClose,
  source,
  locale,
}: InquiryModalProps) {
  const router = useRouter();

  /*
   * =========================================================
   * MOBILE REDIRECT
   * =========================================================
   */

  useEffect(() => {
    if (!isOpen) return;

    const mediaQuery = window.matchMedia(
      "(max-width: 767px)"
    );

    if (!mediaQuery.matches) return;

    const params = new URLSearchParams({
      source,
    });

    router.push(
      `/${locale}/inquiry?${params.toString()}`
    );
  }, [isOpen, source, locale, router]);

  /*
   * =========================================================
   * DON'T RENDER WHILE CLOSED
   * =========================================================
   */

  if (!isOpen) {
    return null;
  }

  /*
   * =========================================================
   * DON'T RENDER DESKTOP MODAL ON MOBILE
   * =========================================================
   */

  if (
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 767px)").matches
  ) {
    return null;
  }

  /*
   * =========================================================
   * DESKTOP MODAL
   * =========================================================
   */

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]

        flex
        items-center
        justify-center

        bg-[#253026]/45
        backdrop-blur-[4px]

        p-4

        sm:p-6
      "
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-modal-title"
        className="
          relative

          flex
          max-h-[92vh]
          w-full
          max-w-[680px]
          flex-col

          overflow-hidden

          rounded-[30px]

          bg-[#FAF9F6]

          shadow-[0_24px_80px_rgba(40,55,42,0.22)]
        "
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {/* CLOSE BUTTON */}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close inquiry form"
          className="
            absolute
            right-5
            top-5
            z-50

            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center

            rounded-full

            bg-[#EEF3EB]

            text-[#6F8F72]

            transition-all
            duration-200

            hover:bg-[#E2EBDF]
            hover:text-[#4F6653]

            active:scale-95

            sm:right-7
            sm:top-7
          "
        >
          <X
            size={19}
            strokeWidth={1.8}
          />
        </button>

        {/* FORM SCROLL AREA */}

        <div
          className="
            min-h-0
            flex-1

            overflow-y-auto
            overflow-x-hidden

            overscroll-contain

            [-webkit-overflow-scrolling:touch]

            [scrollbar-color:#DDE9D8_transparent]
            [scrollbar-width:thin]
          "
        >
          <div
            className="
              px-5
              pb-8

              sm:px-10
              sm:pb-10
            "
          >
            <InquiryForm
              source={source}
              locale={locale}
              onSubmitted={() => {
                // Keep modal open so the success state is visible.
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}