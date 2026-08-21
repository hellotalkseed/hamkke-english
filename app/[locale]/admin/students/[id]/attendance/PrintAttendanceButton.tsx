"use client";

import { Printer } from "lucide-react";

export default function PrintAttendanceButton() {
  function handlePrint() {
    window.print();
  }

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
        bg-[#6F8F72]
        px-5
        py-3
        font-sans
        text-[13px]
        font-medium
        text-white
        transition
        hover:bg-[#5F7F63]
      "
    >
      <Printer
        size={15}
        strokeWidth={1.8}
      />

      Print / Save as PDF
    </button>
  );
}