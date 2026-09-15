"use client";

export default function PrintMonthlyIncomeButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="
        inline-flex
        items-center
        justify-center
        border
        border-[#DCD8D2]
        px-4
        py-2.5
        font-sans
        text-[12px]
        text-[#5F655F]
        transition-colors
        hover:border-[#6F8F72]
        hover:text-[#6F8F72]
      "
    >
      Print Monthly Income
    </button>
  );
}
