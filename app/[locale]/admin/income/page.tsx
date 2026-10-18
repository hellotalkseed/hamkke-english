import { requireOwnerDataClient } from "@/lib/supabase/owner-data";
import IncomeBrowser from "./IncomeBrowser";
import { summarizeIncome } from "./income-summary";

type Payment = {id:string;enrollment_id:string;payment_date:string|null;payment_method:string|null;reference:string|null;amount_php:number|null};
type Enrollment = {id:string;student_id:string|null;package_name:string|null;enrollment_number:string|null};
type Participant = {enrollment_id:string;student_id:string};
type Student = {id:string;full_name:string;preferred_name:string|null};
export default async function IncomePage({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<{year?:string;month?:string;report?:string}>}) {
 const {locale}=await params;const query=await searchParams;const db=await requireOwnerDataClient(locale);
 const payments:Payment[]=[];
 for(let offset=0;;offset+=500){const r=await db.from("payments").select("id, enrollment_id, payment_date, payment_method, reference, amount_php").eq("status","paid").order("payment_date").order("id").range(offset,offset+499);if(r.error)throw new Error("Unable to load income records.");payments.push(...(r.data??[]) as Payment[]);if((r.data??[]).length<500)break;}
 const enrollmentIds=[...new Set(payments.map(p=>p.enrollment_id).filter(Boolean))];const enrollments:Enrollment[]=[];const participants:Participant[]=[];
 for(let i=0;i<enrollmentIds.length;i+=200){const ids=enrollmentIds.slice(i,i+200);const e=await db.from("enrollments").select("id, student_id, package_name, enrollment_number").in("id",ids);if(e.error)throw new Error("Unable to load income enrollment details.");enrollments.push(...(e.data??[]) as Enrollment[]);
  for(let offset=0;;offset+=500){const p=await db.from("enrollment_students").select("enrollment_id, student_id").in("enrollment_id",ids).order("id").range(offset,offset+499);if(p.error)throw new Error("Unable to load income participants.");participants.push(...(p.data??[]) as Participant[]);if((p.data??[]).length<500)break;}
 }
 const studentIds=[...new Set([...enrollments.map(e=>e.student_id),...participants.map(p=>p.student_id)].filter((id):id is string=>!!id))];const students:Student[]=[];
 for(let i=0;i<studentIds.length;i+=200){const r=await db.from("students").select("id, full_name, preferred_name").in("id",studentIds.slice(i,i+200));if(r.error)throw new Error("Unable to load income student names.");students.push(...(r.data??[]) as Student[]);}
 const enrollmentMap=new Map(enrollments.map(e=>[e.id,e]));const studentMap=new Map(students.map(s=>[s.id,s]));const memberMap=new Map<string,string[]>();for(const p of participants)memberMap.set(p.enrollment_id,[...(memberMap.get(p.enrollment_id)??[]),p.student_id]);
 const entries=payments.map(p=>{const e=enrollmentMap.get(p.enrollment_id);const ids=memberMap.get(p.enrollment_id)??(e?.student_id?[e.student_id]:[]);const names=[...new Set(ids)].map(id=>studentMap.get(id)?.full_name).filter(Boolean);return {id:p.id,date:p.payment_date,learner:names.join(" · ")||"Not recorded",enrollment:e?.enrollment_number||"Not recorded",description:e?.package_name||"English lessons",method:p.payment_method,reference:p.reference,php:p.amount_php===null||!Number.isFinite(Number(p.amount_php))?null:Number(p.amount_php)};});
 const now=new Date();const parts=new Intl.DateTimeFormat("en-US",{year:"numeric",month:"numeric",timeZone:"Asia/Manila"}).formatToParts(now);const currentYear=Number(parts.find(p=>p.type==='year')!.value);const annual=summarizeIncome(payments,currentYear);
 const year=Number(query.year),month=Number(query.month);const validYear=Number.isInteger(year)&&year>=2000&&year<=2100;
 const initial=validYear&&query.report==='annual'?{year,month:null}:validYear&&Number.isInteger(month)&&month>=1&&month<=12?{year,month}:null;
 return <main className="income-page min-h-screen bg-[#FAF8F5] text-[#292929]"><section className="mx-auto max-w-[1200px] px-6 pb-20 pt-12 sm:px-8 lg:px-10"><p className="mb-3 font-sans text-[10px] uppercase tracking-[0.16em] text-[#8A8A84]">Income records</p><h1 className="font-sans text-3xl font-medium">Income</h1><p className="mb-8 mt-3 font-sans text-sm text-[#74716B]">View monthly and annual income statements.</p><IncomeBrowser years={annual.years} entries={entries} currentYear={currentYear} initial={initial} generatedAt={now.toISOString()} />{annual.undated>0&&<p className="mt-5 font-sans text-xs text-[#885B42]">{annual.undated} paid records have no valid payment date and are excluded from the statements.</p>}</section></main>;
}
