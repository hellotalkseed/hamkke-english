"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  X,
} from "lucide-react";
import InquiryForm, {
  InquirySource,
} from "@/components/InquiryForm";

const validSources: InquirySource[] = [
  "get-in-touch",
  "start-learning",
  "book-a-lesson",
  "start-a-conversation",
];

export default function InquiryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sourceParam = searchParams.get("source");

  const source = validSources.includes(
    sourceParam as InquirySource
  )
    ? (sourceParam as InquirySource)
    : "get-in-touch";

  const handleBack = () => {
    /*
     * Go back to the page the student came from.
     *
     * This is better than hard-coding "/" because the student
     * may have opened the inquiry form from another page.
     */
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <main
      className="
        min-h-screen
        bg-[#FAF9F6]
        text-[#2B2B2B]
      "
    >
      {/* =====================================================
          MOBILE TOP BAR
          ===================================================== */}

      <div
        className="
          sticky
          top-0
          z-50

          flex
          h-[64px]
          items-center
          justify-between

          border-b
          border-[#E5E9E2]

          bg-[#FAF9F6]/95

          px-5

          backdrop-blur-sm
        "
      >
        {/* Back */}

        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          className="
            flex
            h-10
            items-center
            gap-2

            rounded-full

            px-2

            text-[#6F8F72]

            transition-colors
            duration-200

            hover:bg-[#EEF3EB]
            hover:text-[#4F6653]

            active:scale-95
          "
        >
          <ArrowLeft
            size={20}
            strokeWidth={1.7}
          />

          <span
            className="
              text-[13px]
              font-medium
            "
          >
            Back
          </span>
        </button>

        {/* Small logo / brand */}

        <div
          className="
            absolute
            left-1/2
            -translate-x-1/2
          "
        >
          <img
            src="/logo/hamkke-icon.svg"
            alt="Hamkke"
            className="
              h-8
              w-8
            "
          />
        </div>

        {/* Close */}

        <button
          type="button"
          onClick={handleBack}
          aria-label="Close inquiry form"
          className="
            flex
            h-10
            w-10
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
          "
        >
          <X
            size={19}
            strokeWidth={1.8}
          />
        </button>
      </div>

      {/* =====================================================
          FORM
          ===================================================== */}

      <div
        className="
          mx-auto
          w-full
          max-w-[680px]

          px-5
          pb-12
          pt-2
        "
      >
        <InquiryForm source={source} />
      </div>
    </main>
  );
}