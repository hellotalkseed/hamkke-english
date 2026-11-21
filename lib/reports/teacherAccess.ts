import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function access(participantId:string) {
  const session=await createClient();
  const {data:{user}}=await session.auth.getUser();
  const deny=(status:number,message:string)=>({error:NextResponse.json({error:message},{status})});
  if(!user) return deny(401,"Please sign in.");
  const admin=createAdminClient();
  const {data:profile}=await admin.from("profiles").select("role,status").eq("id",user.id).maybeSingle();
  if(profile?.role!=="teacher"||profile.status!=="active") return deny(403,"Teacher access required.");
  const {data:assignments,error}=await admin.from("teacher_assignments").select("status")
    .eq("teacher_id",user.id).eq("enrollment_student_id",participantId);
  if(error) return deny(500,"Unable to check the teaching assignment.");
  if(!assignments?.length) return deny(403,"This package is not assigned to you.");
  if(!assignments.some(row=>row.status==="active")) {
    const {data}=await admin.from("enrollment_students").select("enrollments!inner(status)").eq("id",participantId).maybeSingle();
    const joined=data?.enrollments;
    if((Array.isArray(joined)?joined[0]:joined)?.status!=="completed") return deny(403,"This teaching assignment has ended.");
  }
  return {admin,user,error:null};
}
