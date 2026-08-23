"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        border-[#DCD8D2]
        bg-white
        px-4
        py-2
        font-sans
        text-sm
        text-[#5F655F]
        transition-colors
        hover:border-[#6F8F72]
        hover:text-[#6F8F72]
      "
    >
      <Printer size={15} strokeWidth={1.5} />
      Print Contract
    </button>
  );
}
