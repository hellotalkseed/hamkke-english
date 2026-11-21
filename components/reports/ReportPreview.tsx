"use client";

import { useId, useRef, useState } from "react";
import { OfficialReport, type PortalProgressReport } from "@/components/portal/PortalProgressReports";

export default function ReportPreview({ studentName, report }: {
  studentName: string;
  report: PortalProgressReport;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const title = useId();

  return <>
    <button type="button" aria-haspopup="dialog"
      className="rounded-xl border border-[#A6B6A5] bg-white px-4 py-2.5 text-xs font-medium text-[#47604B]"
      onClick={() => { dialog.current?.showModal(); setOpen(true); }}>
      Preview report
    </button>
    <dialog ref={dialog} aria-labelledby={title}
      className="fixed inset-0 m-auto max-h-[92dvh] w-[min(92vw,860px)] max-w-none overflow-y-auto rounded-2xl bg-white p-0 shadow-xl backdrop:bg-black/35"
      onKeyDown={event => { if (event.key === "Escape") event.stopPropagation(); }}
      onCancel={event => { event.preventDefault(); dialog.current?.close(); }}
      onClose={() => setOpen(false)}>
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-white px-5 py-3">
        <h2 id={title} className="text-sm font-semibold">Draft preview</h2>
        <button type="button" autoFocus className="rounded-lg border px-3 py-2 text-sm" onClick={() => dialog.current?.close()}>Back to editing</button>
      </header>
      {open && <OfficialReport studentName={studentName} report={report} preview/>}
    </dialog>
  </>;
}
