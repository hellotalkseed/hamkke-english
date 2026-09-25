"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

type Props = {
  locale: string;
  lessonId: string | null;
  onClose: () => void;
};

export default function TeacherLessonModal({ locale, lessonId, onClose }: Props) {
  useEffect(() => {
    if (!lessonId) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lessonId, onClose]);

  if (!lessonId) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#292722]/35 p-3 backdrop-blur-[5px] sm:p-5 lg:left-[250px] lg:p-7"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Class record"
    >
      <div className="relative flex h-[92vh] w-full max-w-[1220px] flex-col overflow-hidden rounded-[28px] border border-[#E4DDD4] bg-white shadow-[0_28px_90px_rgba(48,43,37,0.24)]">
        <div className="flex shrink-0 items-center justify-between border-b border-[#E7E1DA] bg-white px-5 py-4 sm:px-7">
          <p className="font-serif text-[22px] text-[#2D2D2D]">Class Record</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#DDD6CD] bg-white text-[#67625C] transition hover:bg-[#F2EEE8] hover:text-[#3F4F42]"
            aria-label="Close class record"
          >
            <X size={18} />
          </button>
        </div>

        <iframe
          key={lessonId}
          src={`/${locale}/admin/teachers/lessons/${lessonId}?embedded=1`}
          title="Class record"
          onLoad={(event) => {
            try {
              event.currentTarget.contentWindow?.scrollTo({ top: 0, left: 0, behavior: "instant" });
            } catch {
              // Same-origin in normal portal use; leave untouched if the browser blocks access.
            }
          }}
          className="min-h-0 w-full flex-1 border-0 bg-[#FAF8F5]"
        />
      </div>
    </div>
  );
}
