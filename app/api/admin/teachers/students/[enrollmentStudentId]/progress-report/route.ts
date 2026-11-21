import { access } from "@/lib/reports/teacherAccess";
import { englishFields, hasTranslation,readTerm } from "@/lib/reports/termAssessment";
import { NextResponse } from "next/server";



type Params={params:Promise<{enrollmentStudentId:string}>};
const fields=["communication_expression","speaking_interaction","vocabulary_expression_range","grammar_sentence_building","pronunciation_clarity","confidence_participation","overall_progress","next_focus","teacher_note"] as const;
export async function GET(_r:Request,{params}:Params) {
  const {enrollmentStudentId}=await params;
  const auth=await access(enrollmentStudentId);
  if(auth.error) return auth.error;
  const db=auth.admin;
  const [record,participant]=await Promise.all([
    db.from("progress_reports").select("*").eq("enrollment_student_id",enrollmentStudentId).maybeSingle(),
    db.from("enrollment_students").select("student_id,enrollment_id,students(preferred_name,full_name),enrollments(package_name,enrollment_number)").eq("id",enrollmentStudentId).single()
  ]);
  if(record.error||participant.error) return NextResponse.json({error:"Unable to load enrollment details."},{status:500});
  const person=participant.data;
  const student=Array.isArray(person.students)?person.students[0]:person.students;
  const pkg=Array.isArray(person.enrollments)?person.enrollments[0]:person.enrollments;
  const lessons=await db.from("lessons").select("material").eq("student_id",person.student_id).eq("enrollment_id",person.enrollment_id).eq("attendance_status","completed").order("lesson_date");
  if(lessons.error) return NextResponse.json({error:"Unable to load package materials."},{status:500});
  const materials=[...new Set(lessons.data.map(lesson=>lesson.material?.trim()).filter(Boolean))];
  const defaults={format:"conversation-v1",studentName:student?.preferred_name||student?.full_name||"",packageName:pkg?.package_name||pkg?.enrollment_number||"",book:materials.join(", ")};
  const saved=record.data;
  // Reuse the teacher's exact wording when an older narrative draft is reopened.
  const legacyDraft = saved?.status==="draft" && !saved.term_assessment;
  const paragraphs = (...values: unknown[]) => values.filter(v=>typeof v==="string" && v.trim()).join("\n\n");
  const report=legacyDraft ? {...saved,term_assessment:{...defaults,
    expression:saved.communication_expression,interaction:saved.speaking_interaction,
    language:paragraphs(saved.vocabulary_expression_range,saved.grammar_sentence_building),
    clarity:saved.pronunciation_clarity,strengths:paragraphs(saved.overall_progress,saved.confidence_participation),
    goals:saved.next_focus,comment:saved.teacher_note
  }} : !saved ? {status:"draft",term_assessment:defaults}
    : saved.status==="draft" && saved.term_assessment?.format==="conversation-v1" ? {...saved,term_assessment:{...defaults,...saved.term_assessment}} : saved;
  return NextResponse.json({report,defaults});
}
export async function PUT(request:Request,{params}:Params){const {enrollmentStudentId}=await params;const a=await access(enrollmentStudentId);if(a.error)return a.error;const body=await request.json();const status=body?.status==="completed"?"completed":"draft";const payload:any={enrollment_student_id:enrollmentStudentId,teacher_id:a.user!.id,status,updated_at:new Date().toISOString(),completed_at:status==="completed"?new Date().toISOString():null};if (!body.term_assessment) return NextResponse.json({error:"Reopen this draft in the end-of-term report editor."},{status:400});
{
  const term = readTerm(body.term_assessment);
  if (body.term_assessment !== null && (!term || (status === "completed" && !Object.keys(englishFields(term)).length))) {
    return NextResponse.json({error:"Add an observation before completing the assessment."},{status:400});
  }
  if (status === "completed" && term?.familyLanguage && !hasTranslation(term))
    return NextResponse.json({error:"Refresh the family translation or select English only before submitting."},{status:400});
  payload.term_assessment = term;
}
for(const f of fields)payload[f]=typeof body?.[f]==="string"?body[f].trim():"";if (status === "completed") {
  const {data:participant,error:lookupError}=await a.admin!.from("enrollment_students").select("enrollments!inner(status)").eq("id",enrollmentStudentId).single();
  if(lookupError) return NextResponse.json({error:"Unable to verify the package."},{status:500});
  const joined=participant.enrollments;
  if((Array.isArray(joined)?joined[0]:joined)?.status!=="completed") return NextResponse.json({error:"Complete the package before submitting its report."},{status:409});
}
const table = a.admin!.from("progress_reports");
const operation = body.id ? table.update(payload).eq("id",body.id).eq("enrollment_student_id",enrollmentStudentId).eq("status","draft").eq("updated_at",body.updated_at) : table.insert(payload);
const {data,error}=await operation.select("*").maybeSingle();
if(error?.code==="23505" || (!error && !data)) return NextResponse.json({error:"This report has changed. Reopen it before saving."},{status:409});
if(error)return NextResponse.json({error:"Unable to save the report."},{status:500});
return NextResponse.json({report:data});}
