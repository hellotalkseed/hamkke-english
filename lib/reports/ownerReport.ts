import { requireOwnerDataClient } from "@/lib/supabase/owner-data";

export async function submittedReport(locale:string,studentId:string,enrollmentId:string) {
  const db=await requireOwnerDataClient(locale);
  const {data:participant,error}=await db.from("enrollment_students").select("id").eq("student_id",studentId).eq("enrollment_id",enrollmentId).maybeSingle();
  if(error) throw error;
  if(!participant) return null;
  const result=await db.from("progress_reports").select("*").eq("enrollment_student_id",participant.id).eq("status","completed").maybeSingle();
  if(result.error) throw result.error;
  return result.data;
}
