"use client";

import { Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";

import InquiryForm, {
  InquirySource,
} from "@/components/InquiryForm";

import type { Locale } from "@/lib/i18n";

const validSources: InquirySource[] = [
  "experience",
  "goals",
  "stories",
  "start-a-conversation",
];

function InquiryPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const locale: Locale =
    params.locale === "ko" || params.locale === "zh"
      ? params.locale
      : "en";

  const sourceParam = searchParams.get("source");

  const source = validSources.includes(
    sourceParam as InquirySource
  )
    ? (sourceParam as InquirySource)
    : "start-a-conversation";

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(`/${locale}`);
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

        {/* ===================================================
            BRAND
            =================================================== */}

        <div
          className="
            absolute
            left-1/2
            -translate-x-1/2
            whitespace-nowrap
          "
        >
          <p
            className="
              text-[11px]
              font-medium
              uppercase
              tracking-[0.28em]
              text-[#6F8F72]
            "
          >
            Hamkke │ 함께
          </p>
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
        <InquiryForm
          source={source}
          locale={locale}
        />
      </div>
    </main>
  );
}

export default function InquiryPage() {
  return (
    <Suspense
      fallback={
        <main
          className="
            min-h-screen
            bg-[#FAF9F6]
          "
        />
      }
    >
      <InquiryPageContent />
    </Suspense>
  );
}