import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ enrollmentStudentId: string }> }) {
  try {
    const { enrollmentStudentId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    const { data: profile } = await admin.from("profiles").select("id, role, status").eq("id", user.id).maybeSingle();
    if (!profile || profile.role !== "teacher" || profile.status !== "active") {
      return NextResponse.json({ error: "Only active teachers can access teacher observations." }, { status: 403 });
    }

    // A teacher may only read observations for a student participation assigned to them.
    // Do not restrict to active assignment status because reports are written after an enrollment is completed.
    const { data: assignment, error: assignmentError } = await admin
      .from("teacher_assignments")
      .select("id")
      .eq("teacher_id", user.id)
      .eq("enrollment_student_id", enrollmentStudentId)
      .limit(1)
      .maybeSingle();
    if (assignmentError) return NextResponse.json({ error: assignmentError.message }, { status: 500 });
    if (!assignment) return NextResponse.json({ error: "You do not have access to this student's report observations." }, { status: 403 });

    const { data: participant, error: participantError } = await admin
      .from("enrollment_students")
      .select("id, enrollment_id, student_id")
      .eq("id", enrollmentStudentId)
      .maybeSingle();
    if (participantError) return NextResponse.json({ error: participantError.message }, { status: 500 });
    if (!participant) return NextResponse.json({ error: "Enrollment participant not found." }, { status: 404 });

    const { data: lessons, error: lessonsError } = await admin
      .from("lessons")
      .select("id, lesson_number, lesson_date, teacher_observation")
      .eq("enrollment_id", participant.enrollment_id)
      .eq("student_id", participant.student_id)
      .not("teacher_observation", "is", null)
      .order("lesson_date", { ascending: false })
      .order("lesson_number", { ascending: false });
    if (lessonsError) return NextResponse.json({ error: lessonsError.message }, { status: 500 });

    const observations = (lessons ?? [])
      .filter((lesson) => typeof lesson.teacher_observation === "string" && lesson.teacher_observation.trim())
      .map((lesson) => ({
        lesson_id: lesson.id,
        lesson_number: lesson.lesson_number,
        lesson_date: lesson.lesson_date,
        observation: lesson.teacher_observation.trim(),
      }));

    return NextResponse.json({ observations });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load teacher observations." }, { status: 500 });
  }
}
