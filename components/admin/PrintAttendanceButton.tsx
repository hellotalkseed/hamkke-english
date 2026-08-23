"use client";

import { Printer } from "lucide-react";

export default function PrintAttendanceButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="
        hidden
        items-center
        gap-2
        font-sans
        text-[12px]
        text-[#777771]
        transition-colors
        hover:text-[#6F8F72]
        sm:flex
      "
    >
      <Printer size={14} strokeWidth={1.5} />
      Print attendance
    </button>
  );
}