import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwnerDataClient } from "@/lib/supabase/owner-data";
import { submittedReport } from "@/lib/reports/ownerReport";
import { readTerm } from "@/lib/reports/termAssessment";
import { OfficialReport } from "@/components/portal/PortalProgressReports";
import PrintButton from "../contract/PrintButton";

export default async function EnrollmentReport({params}:{params:Promise<{locale:string;id:string;enrollmentId:string}>}) {
  const {locale,id,enrollmentId}=await params;
  const report=await submittedReport(locale,id,enrollmentId);
  if(!report) notFound();
  const db=await requireOwnerDataClient(locale);
  const [student,enrollment,teacher]=await Promise.all([
    db.from("students").select("preferred_name, full_name").eq("id",id).single(),
    db.from("enrollments").select("enrollment_number,status").eq("id",enrollmentId).single(),
    db.from("profiles").select("full_name").eq("id",report.teacher_id).maybeSingle(),
  ]);
  if(student.error||enrollment.error||teacher.error) throw Error("Unable to load report details.");
  const full={...report,term_assessment:readTerm(report.term_assessment),teacher_name:teacher.data?.full_name||"Hamkke Teacher",enrollment_number:enrollment.data.enrollment_number,enrollment_status:enrollment.data.status};
  return <main className="mx-auto max-w-4xl p-5 print:p-0"><nav className="mb-4 flex items-center justify-between print:hidden"><Link href={`/${locale}/admin/students/${id}?enrollmentId=${enrollmentId}`}>Back to enrollment</Link><PrintButton label="Print report"/></nav><OfficialReport studentName={student.data.preferred_name||student.data.full_name} report={full}/></main>;
}
