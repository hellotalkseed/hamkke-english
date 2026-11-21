"use client";
import ReportPreview from "@/components/reports/ReportPreview";
import { ReportBrand, TermDocument, TermEditor } from "@/components/reports/TermAssessment";
import { newConversationTerm, type TermAssessment } from "@/lib/reports/termAssessment";


import { useEffect, useState } from "react";
import { CheckCircle2, Printer, X } from "lucide-react";

type FieldKey = "communication_expression" | "speaking_interaction" | "vocabulary_expression_range" | "grammar_sentence_building" | "pronunciation_clarity" | "confidence_participation" | "overall_progress" | "next_focus" | "teacher_note";
type Report = Record<FieldKey, string> & { term_assessment?: TermAssessment | null; id?: string; status: "draft" | "completed"; updated_at?: string | null; completed_at?: string | null };
type HistoryItem = { enrollment_student_id:string; enrollment_number:string; enrollment_status:string; is_current:boolean; report:Report|null };
type TeacherObservation = { lesson_id:string; lesson_number:number|null; lesson_date:string; observation:string };
const empty: Report = { communication_expression:"", speaking_interaction:"", vocabulary_expression_range:"", grammar_sentence_building:"", pronunciation_clarity:"", confidence_participation:"", overall_progress:"", next_focus:"", teacher_note:"", status:"draft", term_assessment:newConversationTerm };
const areas: {key:FieldKey; title:string; help:string}[] = [
  {key:"communication_expression",title:"Communication & Expression",help:"How the student expresses ideas, experiences, opinions, needs, and responses in English."},
  {key:"speaking_interaction",title:"Speaking & Interaction",help:"How the student responds, continues conversations, and asks or answers questions naturally."},
  {key:"vocabulary_expression_range",title:"Vocabulary & Expression Range",help:"Useful words, phrases, and expressions the student understands and uses in context."},
  {key:"grammar_sentence_building",title:"Grammar & Sentence Building",help:"How clearly the student builds sentences and uses grammar to communicate meaning."},
  {key:"pronunciation_clarity",title:"Pronunciation & Clarity",help:"How understandable and comfortable the student's speech is. Focus on clarity, not accent conformity."},
  {key:"confidence_participation",title:"Confidence & Participation",help:"Willingness to speak, try longer answers, take conversational risks, and recover from mistakes."},
];
function statusText(value:string){return value.replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase())}

export default function ProgressReportPanel({enrollmentStudentId,studentName,enrollmentNumber,enrollmentStatus,teacherName}:{enrollmentStudentId:string;studentName:string;packageName?:string;enrollmentNumber:string;enrollmentStatus:string;usedLessons?:number;totalLessons?:number;teacherName?:string}) {
  const [report,setReport]=useState<Report>(empty); const [history,setHistory]=useState<HistoryItem[]>([]); const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false); const [message,setMessage]=useState("");
  const [modal,setModal]=useState<"edit"|"view"|null>(null); const [viewItem,setViewItem]=useState<HistoryItem|null>(null);
  const [editItem,setEditItem]=useState<HistoryItem|null>(null);
  const [defaults,setDefaults]=useState<TermAssessment>(newConversationTerm);
 const [attendance,setAttendance]=useState("");
 const [observations,setObservations]=useState<TeacherObservation[]>([]); const [observationsLoading,setObservationsLoading]=useState(false); const [observationsError,setObservationsError]=useState("");
  const current=history.find(item=>item.is_current)?.report ?? empty;
  const locked=current.status==="completed";
  async function load(){setLoading(true);setMessage("");try{const [rr,hr]=await Promise.all([fetch(`/api/admin/teachers/students/${enrollmentStudentId}/progress-report`,{cache:"no-store"}),fetch(`/api/admin/teachers/students/${enrollmentStudentId}/progress-report/history`,{cache:"no-store"})]);const rv=await rr.json();const hv=await hr.json();if(!rr.ok)throw new Error(rv.error||"Unable to load progress report.");if(!hr.ok)throw new Error(hv.error||"Unable to load report history.");setReport(rv.report?{...empty,...rv.report}:empty);setHistory(Array.isArray(hv.items)?hv.items:[])}catch(e){setMessage(e instanceof Error?e.message:"Unable to load progress reports.")}finally{setLoading(false)}}
  useEffect(()=>{void load()},[enrollmentStudentId]);
  useEffect(()=>{if(!modal)return;const old=document.body.style.overflow;document.body.style.overflow="hidden";const esc=(e:KeyboardEvent)=>{if(e.key==="Escape"){setModal(null);setEditItem(null)}};window.addEventListener("keydown",esc);return()=>{document.body.style.overflow=old;window.removeEventListener("keydown",esc)}},[modal]);
  async function save(status:"draft"|"completed") { const targetId=editItem?.enrollment_student_id||enrollmentStudentId; setSaving(true);setMessage(""); try { const r=await fetch(`/api/admin/teachers/students/${targetId}/progress-report`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...report,status})}); const v=await r.json(); if(!r.ok)throw new Error(v.error||"Unable to save report."); setReport({...empty,...v.report}); setMessage(status==="completed"?"Progress report completed.":"Draft saved."); await load(); if(status==="draft"){setReport({...empty,...v.report});setMessage("Draft saved.")} if(status==="completed"){setViewItem({enrollment_student_id:targetId,enrollment_number:editItem?.enrollment_number||enrollmentNumber,enrollment_status:editItem?.enrollment_status||enrollmentStatus,is_current:editItem?.is_current??true,report:{...empty,...v.report}});setEditItem(null);setModal("view")} } catch(e){setMessage(e instanceof Error?e.message:"Unable to save report.")} finally{setSaving(false)} }
  async function loadObservations(targetId:string){setAttendance("");setObservationsLoading(true);setObservationsError("");setObservations([]);try{const r=await fetch(`/api/admin/teachers/students/${targetId}/progress-report/observations`,{cache:"no-store"});const v=await r.json();if(!r.ok)throw new Error(v.error||"Unable to load teacher observations.");setAttendance(v.attendance || "");setObservations(Array.isArray(v.observations)?v.observations:[])}catch(e){setObservationsError(e instanceof Error?e.message:"Unable to load teacher observations.")}finally{setObservationsLoading(false)}}
  async function openPackage(item:HistoryItem) {
    if(item.report?.status==="completed"){setViewItem(item);setModal("view");return;}
    setLoading(true);setMessage("");
    try {
      const response=await fetch(`/api/admin/teachers/students/${item.enrollment_student_id}/progress-report`,{cache:"no-store"});
      const value=await response.json();
      if(!response.ok) throw Error(value.error||"Unable to load package details.");
      setDefaults(value.defaults || newConversationTerm);setReport({...empty,...value.report});setEditItem(item);
      if(value.report.status==="completed"){setViewItem({...item,report:value.report});setModal("view");}
      else {void loadObservations(item.enrollment_student_id);setModal("edit");}
    } catch(error){setMessage(error instanceof Error?error.message:"Unable to open report.");}
    finally{setLoading(false);}
  }
  function openCurrent(){void openPackage({enrollment_student_id:enrollmentStudentId,enrollment_number:enrollmentNumber,enrollment_status:enrollmentStatus,is_current:true,report:current});}
  function openHistory(item:HistoryItem){if(item.enrollment_status==="completed")void openPackage(item);}
  if(loading)return <section className="mt-6 rounded-[20px] border border-[#E7DDD1] bg-white p-8 text-[13px] text-[#8B857E]">Loading progress reports...</section>;
  const previous=history.filter(h=>!h.is_current);
  return <>
    <section className="mt-6 overflow-hidden rounded-[18px] border border-[#E7DDD1] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#F8F6F2]">
            <tr className="border-b border-[#E7DDD1]">
              <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8E8881]">Enrollment</th>
              <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8E8881]">Status</th>
              <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8E8881]">Report</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEE9E3]">
            <tr className="transition hover:bg-[#FCFBF9]">
              <td className="whitespace-nowrap px-5 py-4 text-[13px] font-medium text-[#393733]">{enrollmentNumber}</td>
              <td className="whitespace-nowrap px-5 py-4 text-[12px] text-[#77716A]">{statusText(enrollmentStatus)}</td>
              <td className="whitespace-nowrap px-5 py-4 text-right">{(enrollmentStatus==="active"||enrollmentStatus==="completed")?<button onClick={openCurrent} className="text-[12px] font-semibold text-[#5F7F63] hover:text-[#466149]">{locked?"View Report →":enrollmentStatus==="active"?(current.id?"Continue Draft →":"Write Draft →"):(current.id?"Continue Report →":"Write Report →")}</button>:<span className="text-[12px] text-[#A19B94]">-</span>}</td>
            </tr>
            {previous.map(item=><tr key={item.enrollment_student_id} className="transition hover:bg-[#FCFBF9]">
              <td className="whitespace-nowrap px-5 py-4 text-[13px] font-medium text-[#393733]">{item.enrollment_number}</td>
              <td className="whitespace-nowrap px-5 py-4 text-[12px] text-[#77716A]">{statusText(item.enrollment_status)}</td>
              <td className="whitespace-nowrap px-5 py-4 text-right">{item.enrollment_status==="completed"?<button onClick={()=>openHistory(item)} className="text-[12px] font-semibold text-[#5F7F63] hover:text-[#466149]">{item.report?.status==="completed"?"View Report →":item.report?.id?"Continue Report →":"Write Report →"}</button>:<span className="text-[12px] text-[#A19B94]">-</span>}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
      {message&&<div className="border-t border-[#EEE9E3] px-5 py-3"><p className="text-[11px] font-medium text-[#8A5C56]">{message}</p></div>}
    </section>

    {modal&&<div className="fixed inset-y-0 left-0 z-50 lg:left-[250px] right-0 print:inset-0 print:z-[9999]">
      <button aria-label="Close progress report" onClick={()=>{setModal(null);setEditItem(null)}} className="absolute inset-0 bg-[#2F342F]/20 backdrop-blur-[5px] print:hidden"/>
      <div className="absolute inset-3 sm:inset-5 lg:inset-7 overflow-hidden rounded-[24px] border border-[#DED6CD] bg-[#FAF8F5] shadow-2xl print:inset-0 print:overflow-visible print:rounded-none print:border-0 print:bg-white print:shadow-none">
        <div className="flex h-full flex-col print:block">
          <div className="flex items-center justify-between border-b border-[#E6DED5] bg-white px-5 py-4 sm:px-7 print:hidden"><div><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6F8F72]">Hamkke Progress Report</p><p className="mt-1 text-[12px] text-[#77716A]">{modal==="edit"?"Write and save the report for this enrollment.":"Completed report"}</p></div><div className="flex items-center gap-2">{modal==="view"&&<button onClick={()=>window.print()} className="inline-flex items-center gap-2 rounded-xl border border-[#CFC6BC] bg-white px-3.5 py-2 text-[11px] font-medium"><Printer size={14}/>Print Report</button>}<button onClick={()=>{setModal(null);setEditItem(null)}} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#F2EEE9]"><X size={18}/></button></div></div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 print:overflow-visible print:p-0">{modal==="edit"?<Editor preview={<ReportPreview studentName={studentName} report={{...report,id:report.id||"",teacher_name:teacherName||"Teacher",enrollment_number:editItem?.enrollment_number||enrollmentNumber,enrollment_status:editItem?.enrollment_status||enrollmentStatus}}/>} defaults={defaults} participant={editItem?.enrollment_student_id||enrollmentStudentId} attendance={attendance} setTerm={data=>setReport(r=>({...r,term_assessment:data}))} report={report} locked={false} canComplete={(editItem?.enrollment_status||enrollmentStatus)==="completed"} saving={saving} message={message} observations={observations} observationsLoading={observationsLoading} observationsError={observationsError} save={save}/>:viewItem?.report&&<PrintableReport studentName={studentName} teacherName={teacherName||"Teacher"} item={viewItem}/>}</div>
        </div>
      </div>
    </div>}
    <style jsx global>{`@media print { @page { size: A4; margin: 14mm 16mm; } body { background:white !important; } body > * { visibility:hidden !important; } .hamkke-progress-print, .hamkke-progress-print * { visibility:visible !important; } .hamkke-progress-print { position:absolute !important; left:0; top:0; width:100%; color:#222 !important; background:white !important; } .report-section { break-inside:avoid; page-break-inside:avoid; } }`}</style>
  </>;
}

function Editor({preview,defaults,participant,setTerm,attendance,report,canComplete,saving,message,observations,observationsLoading,observationsError,save}:{preview:React.ReactNode;defaults:TermAssessment;participant:string;attendance:string;setTerm:(data:TermAssessment|null)=>void;report:Report;locked:boolean;canComplete:boolean;saving:boolean;message:string;observations:TeacherObservation[];observationsLoading:boolean;observationsError:string;save:(s:"draft"|"completed")=>void}){


 return <div className="mx-auto max-w-6xl space-y-4"><div className="rounded-[18px] border border-[#E7DDD1] bg-white px-5 py-4"><p className="text-[12px] leading-5 text-[#6F6962]"><span className="font-semibold text-[#55705A]">Teacher guidance:</span> Base the report only on what you have personally observed during lessons. An area may be left blank when there has not been enough opportunity to assess it.</p></div><details className="rounded-[18px] border border-[#DDE6DB] bg-[#F7FAF5] px-5 py-4" open><summary className="cursor-pointer text-[12px] font-semibold text-[#55705A]">Teacher Observations from this enrollment</summary><p className="mt-2 text-[11px] leading-5 text-[#7B817A]">Use these Class Record observations as reference while writing. They are not copied into the report automatically.</p>{observationsLoading?<p className="mt-4 text-[12px] text-[#8B857E]">Loading observations...</p>:observationsError?<p className="mt-4 text-[12px] text-[#8A5C56]">{observationsError}</p>:observations.length?<div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">{observations.map(o=><article key={o.lesson_id} className="rounded-xl border border-[#E2E8DF] bg-white px-4 py-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-[11px] font-semibold text-[#5F7F63]">{o.lesson_number==null?"Lesson":`Lesson ${o.lesson_number}`}</p><p className="text-[10px] text-[#99938C]">{o.lesson_date}</p></div><p className="mt-2 whitespace-pre-wrap text-[12px] leading-5 text-[#5D5953]">{o.observation}</p></article>)}</div>:<p className="mt-4 text-[12px] text-[#8B857E]">No Teacher Observations were recorded for this enrollment.</p>}</details>
 <TermEditor participant={participant} observations={observations} data={report.term_assessment || defaults} attendance={attendance} onChange={setTerm}/>
 <div className="sticky bottom-0 flex flex-col gap-3 rounded-[18px] border border-[#DDD5CC] bg-[#F4F1EC]/95 p-4 shadow-[0_-8px_25px_rgba(60,50,40,.06)] backdrop-blur sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[11px] text-[#77716A]">End-of-term assessment</p>{message&&<p className="mt-1 text-[11px] font-medium text-[#5F7F63]">{message}</p>}</div><div className="flex flex-wrap gap-2">{preview}<button disabled={saving} onClick={()=>save("draft")} className="rounded-xl border border-[#CFC6BC] bg-white px-4 py-2.5 text-[12px] font-medium disabled:opacity-50">Save Draft</button><button disabled={saving||!canComplete} onClick={()=>save("completed")} title={!canComplete?"Complete the enrollment before completing the report.":undefined} className="rounded-xl bg-[#6F8F72] px-4 py-2.5 text-[12px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50">Submit report</button></div></div></div>
}

function PrintableReport({studentName,teacherName,item}:{studentName:string;teacherName:string;item:HistoryItem}){
  const r=item.report!;
  if(r.term_assessment) return <TermDocument data={r.term_assessment} student={studentName} enrollment={item.enrollment_number} teacher={teacherName}/>;
  const numberedAreas=areas.map((area,index)=>({...area,number:String(index+1).padStart(2,"0")}));
  return <article className="hamkke-progress-print mx-auto max-w-[820px] bg-[#FFFDF9] px-8 py-10 text-[#302F2C] sm:px-12 sm:py-12 print:max-w-none print:bg-white print:p-0">
    <header className="border-b border-[#D8D2C9] pb-7">
      <div className="flex items-start justify-between gap-6">
        <div>
          <ReportBrand/>
          <h1 className="mt-3 font-serif text-[30px] leading-none text-[#302F2C]">Progress Report</h1>
          
        </div>
        <span className="rounded-full border border-[#CBD3C8] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#657361]">Completed</span>
      </div>
    </header>

    <section className="grid grid-cols-1 gap-x-8 gap-y-5 border-b border-[#E2DDD5] py-7 sm:grid-cols-2">
      <ReportMeta label="Student" value={studentName}/>
      <ReportMeta label="Enrollment No." value={item.enrollment_number}/>
      <ReportMeta label="Teacher" value={teacherName}/>
      <ReportMeta label="Enrollment Status" value={statusText(item.enrollment_status)}/>
    </section>

    <div>
      {numberedAreas.map(a=>r[a.key].trim()?<NumberedReportSection key={a.key} number={a.number} title={a.title} text={r[a.key]}/>:null)}
    </div>

    {r.overall_progress.trim()&&<section className="report-section mt-7 border-l-2 border-[#91A18D] bg-[#F6F4EF] px-5 py-5 print:bg-[#F6F4EF]"><h2 className="font-serif text-[18px] text-[#3F4B3D]">Overall Progress</h2><p className="mt-3 whitespace-pre-wrap text-[13px] leading-6 text-[#55514B]">{r.overall_progress}</p></section>}
    {r.next_focus.trim()&&<section className="report-section mt-6"><h2 className="font-serif text-[18px] text-[#3F4B3D]">Next Focus</h2><p className="mt-3 whitespace-pre-wrap text-[13px] leading-6 text-[#55514B]">{r.next_focus}</p></section>}
    {r.teacher_note.trim()&&<section className="report-section mt-6"><h2 className="font-serif text-[18px] text-[#3F4B3D]">A Note from Your Teacher</h2><p className="mt-3 whitespace-pre-wrap text-[13px] italic leading-6 text-[#625E57]">{r.teacher_note}</p></section>}

    <footer className="mt-10 flex flex-wrap items-end justify-between gap-4 border-t border-[#D8D2C9] pt-5">
      <div><p className="text-[10px] font-semibold tracking-[0.12em] text-[#71806E]">HAMKKE │ 함께</p><p className="mt-1 text-[10px] text-[#918C84]">From Small Talk to Big Ideas.</p></div>
      <div className="text-right text-[9px] leading-4 text-[#9A958D]">Private English Lessons<br/>Progress Report</div>
    </footer>
  </article>
}
function ReportMeta({label,value}:{label:string;value:string}){return <div><p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#918C84]">{label}</p><p className="mt-1 text-[14px] font-medium text-[#353431]">{value}</p></div>}
function NumberedReportSection({number,title,text}:{number:string;title:string;text:string}){return <section className="report-section border-b border-[#EBE6DF] py-6"><h2 className="font-serif text-[17px] text-[#536451]"><span className="mr-3 font-sans text-[11px] tracking-[0.08em] text-[#899486]">{number}</span>{title}</h2><p className="mt-3 whitespace-pre-wrap text-[13px] leading-6 text-[#55514B]">{text}</p></section>}

