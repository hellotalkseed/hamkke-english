"use client";

export default function PrintButton({ label = "Print Contract" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full border border-[#CFCFCB] bg-white px-4 py-2 font-sans text-[12px] text-[#333] transition hover:bg-[#F7F7F4]"
    >
      {label}
    </button>
  );
}
