"use client";

import { useEffect, useState } from "react";
import { Printer, X } from "lucide-react";

export type PortalProgressReport = {
  id: string;
  enrollment_number: string;
  enrollment_status: string;
  teacher_name: string;
  communication_expression: string;
  speaking_interaction: string;
  vocabulary_expression_range: string;
  grammar_sentence_building: string;
  pronunciation_clarity: string;
  confidence_participation: string;
  overall_progress: string;
  next_focus: string;
  teacher_note: string;
};

type Props = { studentName: string; reports: PortalProgressReport[]; emptyText: string };
const areas = [
  ["communication_expression", "Communication & Expression"],
  ["speaking_interaction", "Speaking & Interaction"],
  ["vocabulary_expression_range", "Vocabulary & Expression Range"],
  ["grammar_sentence_building", "Grammar & Sentence Building"],
  ["pronunciation_clarity", "Pronunciation & Clarity"],
  ["confidence_participation", "Confidence & Participation"],
] as const;

export default function PortalProgressReports({ studentName, reports, emptyText }: Props) {
  const [selected, setSelected] = useState<PortalProgressReport | null>(null);
  useEffect(() => {
    if (!selected) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const esc = (event: KeyboardEvent) => event.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", esc);
    return () => { document.body.style.overflow = old; window.removeEventListener("keydown", esc); };
  }, [selected]);

  if (!reports.length) return <section className="rounded-2xl bg-[#EEF2EA] p-6 sm:p-8"><p className="leading-7 text-[#607568]">{emptyText}</p></section>;

  return <>
    <section className="overflow-hidden rounded-2xl border border-[#718A73]/20 bg-[#FAF8F5]">
      <div className="overflow-x-auto"><table className="w-full border-collapse text-left text-sm">
        <thead className="bg-[#EEF2EA]/60 text-xs text-[#607568]"><tr><th className="px-5 py-4 font-medium">Enrollment</th><th className="px-5 py-4 font-medium">Status</th><th className="px-5 py-4 text-right font-medium">Report</th></tr></thead>
        <tbody className="divide-y divide-[#718A73]/15">{reports.map(report => <tr key={report.id}><td className="px-5 py-4 font-medium">{report.enrollment_number}</td><td className="px-5 py-4 text-[#607568]">Completed</td><td className="px-5 py-4 text-right"><button onClick={() => setSelected(report)} className="font-medium text-[#5F7F63] underline-offset-4 hover:underline">View Report →</button></td></tr>)}</tbody>
      </table></div>
    </section>
    {selected && <div className="fixed inset-0 z-50 print:inset-0 print:z-[9999]">
      <button aria-label="Close report" onClick={() => setSelected(null)} className="absolute inset-0 bg-[#2F342F]/20 backdrop-blur-[5px] print:hidden" />
      <div className="absolute inset-3 overflow-hidden rounded-[24px] border border-[#DED6CD] bg-[#FAF8F5] shadow-2xl sm:inset-5 lg:inset-7 print:inset-0 print:overflow-visible print:rounded-none print:border-0 print:bg-white print:shadow-none">
        <div className="flex h-full flex-col print:block"><div className="flex items-center justify-between border-b border-[#E6DED5] bg-white px-5 py-4 sm:px-7 print:hidden"><div><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6F8F72]">Hamkke Progress Report</p><p className="mt-1 text-[12px] text-[#77716A]">Completed report</p></div><div className="flex items-center gap-2"><button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-[#CFC6BC] bg-white px-3.5 py-2 text-[11px] font-medium"><Printer size={14}/>Print Report</button><button onClick={() => setSelected(null)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#F2EEE9]"><X size={18}/></button></div></div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 print:overflow-visible print:p-0"><OfficialReport studentName={studentName} report={selected}/></div>
        </div>
      </div>
    </div>}
    <style jsx global>{`@media print { @page { size:A4; margin:14mm 16mm; } body { background:white !important; } body > * { visibility:hidden !important; } .hamkke-progress-print, .hamkke-progress-print * { visibility:visible !important; } .hamkke-progress-print { position:absolute !important; left:0; top:0; width:100%; color:#222 !important; background:white !important; } .report-section { break-inside:avoid; page-break-inside:avoid; } }`}</style>
  </>;
}

function OfficialReport({ studentName, report }: { studentName: string; report: PortalProgressReport }) {
  return <article className="hamkke-progress-print mx-auto max-w-[820px] bg-[#FFFDF9] px-8 py-10 text-[#302F2C] sm:px-12 sm:py-12 print:max-w-none print:bg-white print:p-0">
    <header className="border-b border-[#D8D2C9] pb-7"><div className="flex items-start justify-between gap-6"><div><p className="text-[13px] font-semibold tracking-[0.14em] text-[#71806E]">HAMKKE │ 함께</p><h1 className="mt-3 font-serif text-[30px] leading-none">Progress Report</h1><p className="mt-3 font-serif text-[12px] italic text-[#77736C]">From Small Talk to Big Ideas.</p></div><span className="rounded-full border border-[#CBD3C8] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#657361]">Completed</span></div></header>
    <section className="grid grid-cols-1 gap-x-8 gap-y-5 border-b border-[#E2DDD5] py-7 sm:grid-cols-2"><Meta label="Student" value={studentName}/><Meta label="Enrollment No." value={report.enrollment_number}/><Meta label="Teacher" value={report.teacher_name}/><Meta label="Enrollment Status" value="Completed"/></section>
    <div>{areas.map(([key,title], index) => report[key]?.trim() ? <section key={key} className="report-section border-b border-[#EBE6DF] py-6"><h2 className="font-serif text-[17px] text-[#536451]"><span className="mr-3 font-sans text-[11px] tracking-[0.08em] text-[#899486]">{String(index+1).padStart(2,"0")}</span>{title}</h2><p className="mt-3 whitespace-pre-wrap text-[13px] leading-6 text-[#55514B]">{report[key]}</p></section> : null)}</div>
    {report.overall_progress?.trim() && <section className="report-section mt-7 border-l-2 border-[#91A18D] bg-[#F6F4EF] px-5 py-5"><h2 className="font-serif text-[18px] text-[#3F4B3D]">Overall Progress</h2><p className="mt-3 whitespace-pre-wrap text-[13px] leading-6 text-[#55514B]">{report.overall_progress}</p></section>}
    {report.next_focus?.trim() && <section className="report-section mt-6"><h2 className="font-serif text-[18px] text-[#3F4B3D]">Next Focus</h2><p className="mt-3 whitespace-pre-wrap text-[13px] leading-6 text-[#55514B]">{report.next_focus}</p></section>}
    {report.teacher_note?.trim() && <section className="report-section mt-6"><h2 className="font-serif text-[18px] text-[#3F4B3D]">A Note from Your Teacher</h2><p className="mt-3 whitespace-pre-wrap text-[13px] italic leading-6 text-[#625E57]">{report.teacher_note}</p></section>}
    <footer className="mt-10 flex flex-wrap items-end justify-between gap-4 border-t border-[#D8D2C9] pt-5"><div><p className="text-[10px] font-semibold tracking-[0.12em] text-[#71806E]">HAMKKE │ 함께</p><p className="mt-1 text-[10px] text-[#918C84]">From Small Talk to Big Ideas.</p></div><div className="text-right text-[9px] leading-4 text-[#9A958D]">Private English Lessons<br/>Progress Report</div></footer>
  </article>;
}
function Meta({label,value}:{label:string;value:string}) { return <div><p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#918C84]">{label}</p><p className="mt-1 text-[14px] font-medium text-[#353431]">{value}</p></div>; }
