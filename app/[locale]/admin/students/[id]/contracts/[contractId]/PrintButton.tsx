"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-full
        border
        border-[#DCD8D2]
        bg-white
        px-4
        py-2
        font-sans
        text-sm
        font-medium
        text-[#5F655F]
        transition-colors
        hover:border-[#6F8F72]
        hover:text-[#6F8F72]
        focus:outline-none
        focus:ring-2
        focus:ring-[#A8B9A9]
        focus:ring-offset-2
        print:hidden
      "
    >
      <Printer
        size={15}
        strokeWidth={1.5}
        aria-hidden="true"
      />

      <span>Print Contract</span>
    </button>
  );
}