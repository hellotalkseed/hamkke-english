"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export type PortalAttendanceHistoryRow = {
  id: string;
  date: string;
  time: string;
  timezone: string;
  status: string;
  statusTone: string;
  lesson: string;
  notes: string | null;
};

type Copy = {
  history: string;
  date: string;
  time: string;
  status: string;
  lesson: string;
  lessonNotes: string;
  view: string;
  close: string;
  noAttendance: string;
};

export default function PortalAttendanceHistory({ rows, copy }: { rows: PortalAttendanceHistoryRow[]; copy: Copy }) {
  const [selected, setSelected] = useState<PortalAttendanceHistoryRow | null>(null);

  useEffect(() => {
    if (!selected) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = old; window.removeEventListener("keydown", onKey); };
  }, [selected]);

  if (!rows.length) return <p className="mt-4 text-sm leading-6 text-[#607568]">{copy.noAttendance}</p>;

  return <>
    <div className="mt-4 hidden overflow-hidden rounded-2xl border border-[#718A73]/20 md:block">
      <table className="w-full table-fixed text-left text-sm">
        <caption className="sr-only">{copy.history}</caption>
        <thead className="bg-[#EEF2EA]/60 text-xs text-[#607568]"><tr>
          {[copy.date, copy.time, copy.status, copy.lesson, copy.lessonNotes].map((label) => <th key={label} scope="col" className="px-5 py-4 font-medium">{label}</th>)}
        </tr></thead>
        <tbody className="divide-y divide-[#718A73]/15">
          {rows.map((record) => <tr key={record.id}>
            <td className="px-5 py-4 align-middle">{record.date}</td>
            <td className="px-5 py-4 align-middle">{record.time}<span className="mt-1 block text-xs text-[#607568]">{record.timezone}</span></td>
            <td className="px-5 py-4 align-middle"><span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${record.statusTone}`}>{record.status}</span></td>
            <td className="px-5 py-4 align-middle">{record.lesson}</td>
            <td className="px-5 py-4 align-middle">{record.notes ? <button type="button" onClick={() => setSelected(record)} className="font-medium text-[#5F7F63] underline-offset-4 hover:underline">{copy.view} →</button> : <span className="text-[#8B918B]">-</span>}</td>
          </tr>)}
        </tbody>
      </table>
    </div>

    <ul className="mt-4 divide-y divide-[#718A73]/15 rounded-2xl border border-[#718A73]/20 px-5 md:hidden">
      {rows.map((record) => <li key={record.id} className="py-4">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-sm font-medium">{record.date}</p><p className="mt-1 text-xs text-[#607568]">{record.time} · {record.timezone}</p></div>
          <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${record.statusTone}`}>{record.status}</span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-4 text-xs text-[#607568]">
          <span>{record.lesson}</span>
          {record.notes ? <button type="button" onClick={() => setSelected(record)} className="font-medium text-[#5F7F63] underline-offset-4 hover:underline">{copy.lessonNotes}: {copy.view} →</button> : <span>{copy.lessonNotes}: -</span>}
        </div>
      </li>)}
    </ul>

    {selected && <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
      <button type="button" aria-label={copy.close} onClick={() => setSelected(null)} className="absolute inset-0 bg-[#2F342F]/20 backdrop-blur-[4px]" />
      <section role="dialog" aria-modal="true" aria-labelledby="lesson-notes-title" className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[24px] border border-[#DED6CD] bg-[#FFFDF9] shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-[#E6DED5] bg-white px-6 py-5">
          <div><h2 id="lesson-notes-title" className="font-serif text-2xl text-[#293A30]">{copy.lessonNotes}</h2><p className="mt-1 text-xs text-[#607568]">{selected.lesson} · {selected.date}</p></div>
          <button type="button" aria-label={copy.close} onClick={() => setSelected(null)} className="flex h-9 w-9 items-center justify-center rounded-full text-[#607568] hover:bg-[#F2EEE9]"><X size={18} /></button>
        </header>
        <div className="max-h-[65vh] overflow-y-auto px-6 py-6 sm:px-8"><p className="whitespace-pre-wrap text-sm leading-7 text-[#414A43]">{selected.notes}</p></div>
      </section>
    </div>}
  </>;
}
