import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    const { data: profile } = await admin.from("profiles").select("id, full_name, role, status").eq("id", user.id).single();
    if (!profile || profile.role !== "teacher" || profile.status !== "active") {
      return NextResponse.json({ error: "Only active teachers can access progress reports." }, { status: 403 });
    }

    const { data: assignments, error: assignmentError } = await admin
      .from("teacher_assignments")
      .select("enrollment_student_id")
      .eq("teacher_id", user.id);
    if (assignmentError) throw assignmentError;

    const participantIds = [...new Set((assignments ?? []).map((a) => a.enrollment_student_id).filter(Boolean))];
    if (!participantIds.length) return NextResponse.json({ teacher: { full_name: profile.full_name }, items: [] });

    const { data: participants, error: participantError } = await admin
      .from("enrollment_students")
      .select("id, enrollment_id, student_id")
      .in("id", participantIds);
    if (participantError) throw participantError;

    const enrollmentIds = [...new Set((participants ?? []).map((p) => p.enrollment_id).filter(Boolean))];
    const studentIds = [...new Set((participants ?? []).map((p) => p.student_id).filter(Boolean))];

    const [{ data: enrollments, error: enrollmentError }, { data: students, error: studentError }, { data: reports, error: reportError }] = await Promise.all([
      enrollmentIds.length ? admin.from("enrollments").select("id, enrollment_number, package_name, status").in("id", enrollmentIds) : Promise.resolve({ data: [], error: null }),
      studentIds.length ? admin.from("students").select("id, student_number, full_name, preferred_name").in("id", studentIds) : Promise.resolve({ data: [], error: null }),
      admin.from("progress_reports").select("id, enrollment_student_id, status, updated_at, completed_at").in("enrollment_student_id", participantIds),
    ]);
    if (enrollmentError) throw enrollmentError;
    if (studentError) throw studentError;
    if (reportError) throw reportError;

    const enrollmentById = new Map((enrollments ?? []).map((e) => [e.id, e]));
    const studentById = new Map((students ?? []).map((s) => [s.id, s]));
    const reportByParticipant = new Map((reports ?? []).map((r) => [r.enrollment_student_id, r]));

    const items = (participants ?? []).map((participant) => {
      const enrollment = enrollmentById.get(participant.enrollment_id);
      const student = studentById.get(participant.student_id);
      const report = reportByParticipant.get(participant.id);
      return {
        enrollment_student_id: participant.id,
        student_number: student?.student_number ?? null,
        student_name: student?.preferred_name || student?.full_name || "Student",
        enrollment_number: enrollment?.enrollment_number ?? "-",
        package_name: enrollment?.package_name ?? "Private English Lessons",
        enrollment_status: enrollment?.status ?? "pending",
        report_status: report?.status ?? null,
        updated_at: report?.updated_at ?? null,
        completed_at: report?.completed_at ?? null,
      };
    }).sort((a, b) => a.student_name.localeCompare(b.student_name) || b.enrollment_number.localeCompare(a.enrollment_number));

    return NextResponse.json({ teacher: { full_name: profile.full_name }, items });
  } catch (error) {
    console.error("Teacher progress reports list error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load progress reports." }, { status: 500 });
  }
}
