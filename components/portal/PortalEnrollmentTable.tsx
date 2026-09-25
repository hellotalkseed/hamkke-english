"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";

export type EnrollmentDetail = {
  enrollmentId: string;
  enrollmentNumber: string;
  packageName: string;
  enrollmentStatus: string;
  startDate: string;
  lessonDuration: string;
  totalLessons: number | null;
  usedLessons: number;
  remainingLessons: number;
  isShared: boolean;
  payment: { amount: string; status: string; date: string; method: string } | null;
  agreement: { number: string; status: string; date: string; acceptedBy: string; relationship: string; href: string } | null;
  attendance: { lesson: string; date: string; time: string; timezone: string; status: string }[];
};

type Copy = {
  enrollment: string; package: string; status: string; lessons: string; details: string; viewDetails: string;
  startDate: string; duration: string; lessonBalance: string; payment: string; amount: string; paymentDate: string;
  paymentMethod: string; agreement: string; agreementNumber: string; agreementDate: string; acceptedBy: string;
  attendance: string; lesson: string; date: string; time: string; close: string; noAttendance: string;
  viewAgreement: string; viewAgreementHelp: string; contractLabel: string; contractAction: string;
};

export default function PortalEnrollmentTable({ rows, copy }: { rows: EnrollmentDetail[]; copy: Copy }) {
  const [selected, setSelected] = useState<EnrollmentDetail | null>(null);
  const [contract, setContract] = useState<EnrollmentDetail | null>(null);
  useEffect(() => {
    if (!selected && !contract) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setSelected(null); setContract(null); } };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = previous; };
  }, [selected, contract]);

  return <>
    <div className="overflow-hidden rounded-2xl border border-[#718A73]/20 bg-[#FFFDF8]">
      <div className="hidden grid-cols-[1fr_1.35fr_.65fr_.7fr_.8fr_.65fr] gap-4 bg-[#EEF2EA]/60 px-5 py-4 text-xs font-medium text-[#607568] md:grid">
        <span>{copy.enrollment}</span><span>{copy.package}</span><span>{copy.status}</span><span>{copy.lessons}</span><span className="text-right">{copy.details}</span><span className="text-right">{copy.contractLabel}</span>
      </div>
      <div className="divide-y divide-[#718A73]/15">
        {rows.map((row) => <div key={row.enrollmentId} className="grid gap-3 px-5 py-5 md:grid-cols-[1fr_1.35fr_.65fr_.7fr_.8fr_.65fr] md:items-center md:gap-4">
          <div><span className="text-xs text-[#607568] md:hidden">{copy.enrollment}</span><p className="mt-1 break-words text-sm font-medium md:mt-0">{row.enrollmentNumber}</p></div>
          <div><span className="text-xs text-[#607568] md:hidden">{copy.package}</span><p className="mt-1 break-words text-sm md:mt-0">{row.packageName}</p></div>
          <div><span className="text-xs text-[#607568] md:hidden">{copy.status}</span><p className="mt-1 text-sm capitalize md:mt-0">{row.enrollmentStatus}</p></div>
          <div><span className="text-xs text-[#607568] md:hidden">{copy.lessons}</span><p className="mt-1 text-sm tabular-nums md:mt-0">{row.usedLessons} / {row.totalLessons ?? "-"}</p></div>
          <div className="md:text-right"><button type="button" onClick={() => setSelected(row)} className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[#718A73]/35 px-4 py-2 text-sm font-medium text-[#31463A] transition hover:bg-[#EEF2EA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#607568]">{copy.viewDetails}<ArrowUpRight size={15} /></button></div>
          <div className="md:text-right"><span className="mr-3 text-xs text-[#607568] md:hidden">{copy.contractLabel}</span>{row.agreement ? <button type="button" onClick={() => setContract(row)} className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[#718A73]/35 px-4 py-2 text-sm font-medium text-[#31463A] transition hover:bg-[#EEF2EA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#607568]">{copy.contractAction}<ArrowUpRight size={15} /></button> : <span className="inline-block px-4 text-sm text-[#8A918B]">-</span>}</div>
        </div>)}
      </div>
    </div>



    {contract?.agreement && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#293A30]/35 p-3 backdrop-blur-[2px] sm:p-5" onMouseDown={(e) => { if (e.target === e.currentTarget) setContract(null); }}>
      <section role="dialog" aria-modal="true" aria-label={`${contract.enrollmentNumber} ${copy.agreement}`} className="flex h-[94dvh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-[#DCD8D2] bg-[#FFFDF8] shadow-2xl">
        <div className="flex shrink-0 items-center justify-between gap-5 border-b border-[#718A73]/20 bg-[#FFFDF8] px-5 py-4 sm:px-7">
          <div className="min-w-0"><p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#607568]">{contract.enrollmentNumber}</p><h2 className="mt-1 truncate font-serif text-2xl text-[#293A30] sm:text-3xl">{copy.agreement}</h2></div>
          <button type="button" onClick={() => setContract(null)} aria-label={copy.close} className="shrink-0 rounded-full p-2 text-[#607568] transition hover:bg-[#EEF2EA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#607568]"><X size={20}/></button>
        </div>
        <iframe src={contract.agreement.href} title={`${contract.enrollmentNumber} ${copy.agreement}`} className="min-h-0 flex-1 w-full border-0 bg-white" />
      </section>
    </div>}

    {selected && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#293A30]/35 p-4 backdrop-blur-[2px]" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
      <section role="dialog" aria-modal="true" aria-label={`${selected.enrollmentNumber} ${copy.details}`} className="max-h-[90dvh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-[#DCD8D2] bg-[#FFFDF8] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-5 border-b border-[#718A73]/20 bg-[#FFFDF8]/95 px-6 py-5 backdrop-blur sm:px-8">
          <div><p className="text-xs font-medium uppercase tracking-[0.16em] text-[#607568]">{selected.enrollmentNumber}</p><h2 className="mt-2 font-serif text-3xl">{selected.packageName}</h2></div>
          <button type="button" onClick={() => setSelected(null)} aria-label={copy.close} className="rounded-full p-2 text-[#607568] hover:bg-[#EEF2EA]"><X size={20}/></button>
        </div>
        <div className="space-y-8 px-6 py-6 sm:px-8 sm:py-8">
          <section><h3 className="font-serif text-2xl">{copy.details}</h3><dl className="mt-4 grid gap-x-8 gap-y-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {[[copy.status, selected.enrollmentStatus], [copy.startDate, selected.startDate], [copy.duration, selected.lessonDuration], [copy.lessonBalance, `${selected.usedLessons} / ${selected.totalLessons ?? "-"} (${selected.remainingLessons} remaining)`]].map(([k,v]) => <div key={k}><dt className="text-xs text-[#607568]">{k}</dt><dd className="mt-1.5 break-words capitalize">{v}</dd></div>)}
          </dl></section>
          <section className="border-t border-[#718A73]/20 pt-7"><h3 className="font-serif text-2xl">{copy.payment}</h3>{selected.payment ? <dl className="mt-4 grid gap-x-8 gap-y-5 text-sm sm:grid-cols-2 lg:grid-cols-4">{[[copy.amount,selected.payment.amount],[copy.status,selected.payment.status],[copy.paymentDate,selected.payment.date],[copy.paymentMethod,selected.payment.method]].map(([k,v])=><div key={k}><dt className="text-xs text-[#607568]">{k}</dt><dd className="mt-1.5 break-words capitalize">{v}</dd></div>)}</dl> : <p className="mt-3 text-sm text-[#607568]">-</p>}</section>
          <section className="border-t border-[#718A73]/20 pt-7"><h3 className="font-serif text-2xl">{copy.agreement}</h3>{selected.agreement ? <dl className="mt-4 grid gap-x-8 gap-y-5 text-sm sm:grid-cols-2 lg:grid-cols-3">{[[copy.agreementNumber,selected.agreement.number],[copy.status,selected.agreement.status],[copy.agreementDate,selected.agreement.date],[copy.acceptedBy,selected.agreement.acceptedBy],["Relationship",selected.agreement.relationship]].map(([k,v])=><div key={k}><dt className="text-xs text-[#607568]">{k}</dt><dd className="mt-1.5 break-words capitalize">{v}</dd></div>)}</dl> : <p className="mt-3 text-sm text-[#607568]">-</p>}</section>
          <section className="border-t border-[#718A73]/20 pt-7"><h3 className="font-serif text-2xl">{copy.attendance}</h3>{selected.attendance.length ? <div className="mt-4 overflow-hidden rounded-2xl border border-[#718A73]/20"><div className="hidden grid-cols-[.7fr_1fr_1fr_1.3fr] bg-[#EEF2EA]/60 px-4 py-3 text-xs text-[#607568] sm:grid"><span>{copy.lesson}</span><span>{copy.date}</span><span>{copy.time}</span><span>{copy.status}</span></div><div className="divide-y divide-[#718A73]/15">{selected.attendance.map((a,i)=><div key={`${a.lesson}-${a.date}-${i}`} className="grid gap-2 px-4 py-4 text-sm sm:grid-cols-[.7fr_1fr_1fr_1.3fr]"><span>{a.lesson}</span><span>{a.date}</span><span>{a.time}<small className="block text-[#607568]">{a.timezone}</small></span><span>{a.status}</span></div>)}</div></div> : <p className="mt-3 text-sm text-[#607568]">{copy.noAttendance}</p>}</section>
        </div>
      </section>
    </div>}
  </>;
}
