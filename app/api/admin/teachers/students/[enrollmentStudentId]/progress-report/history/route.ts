import { NextResponse } from "next/server";
import { access } from "@/lib/reports/teacherAccess";


type Params={params:Promise<{enrollmentStudentId:string}>};
function one<T>(value:T|T[]|null):T|null{return Array.isArray(value)?value[0]??null:value}
export async function GET(_request:Request,{params}:Params){
  try{
    const {enrollmentStudentId}=await params;
    const auth=await access(enrollmentStudentId);
    if(auth.error) return auth.error;
    const {admin}=auth;
    const {data:current,error:currentError}=await admin.from("enrollment_students").select("id,student_id,enrollment_id").eq("id",enrollmentStudentId).single();
    if(currentError||!current)return NextResponse.json({error:currentError?.message||"Student enrollment not found."},{status:404});
    const {data:participants,error:pError}=await admin.from("enrollment_students").select(`id,enrollment_id,enrollments(id,enrollment_number,status)`).eq("student_id",current.student_id);
    if(pError)return NextResponse.json({error:pError.message},{status:500});
    const ids=(participants||[]).map((p:any)=>p.id); let reports:any[]=[];
    if(ids.length){const {data,error}=await admin.from("progress_reports").select("*").in("enrollment_student_id",ids);if(error)return NextResponse.json({error:error.message},{status:500});reports=data||[]}
    const reportMap=new Map(reports.map((r:any)=>[r.enrollment_student_id,r]));
    const items=(participants||[]).map((p:any)=>{const e=one(p.enrollments as any) as any;return {enrollment_student_id:p.id,enrollment_number:e?.enrollment_number||"-",enrollment_status:e?.status||"unknown",is_current:p.id===enrollmentStudentId,report:reportMap.get(p.id)||null}}).sort((a:any,b:any)=>{if(a.is_current)return -1;if(b.is_current)return 1;return String(b.enrollment_number).localeCompare(String(a.enrollment_number))});
    return NextResponse.json({items});
  }catch(error){console.error("Progress report history error:",error);return NextResponse.json({error:error instanceof Error?error.message:"Unable to load report history."},{status:500})}
}
