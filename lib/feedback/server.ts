import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type FeedbackTeacher = { id: string; name: string; slug?: string };
export class FeedbackError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export async function staffIdentity(role: "owner" | "teacher") {
  const client = await createClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) throw new FeedbackError("Please sign in.", 401);
  const admin = createAdminClient();
  const result = await admin.from("profiles").select("id, role, status, full_name").eq("id", user.id).maybeSingle();
  if (result.error) throw new Error("Unable to check staff access.");
  if (result.data?.role !== role || result.data?.status !== "active") throw new FeedbackError("Access denied.", 403);
  return { admin, user, profile: result.data };
}
export async function portalIdentity(studentId: string) {
  const client = await createClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) throw new FeedbackError("Please sign in.", 401);
  const admin = createAdminClient();
  const account = await admin.from("portal_accounts").select("status").eq("user_id", user.id).maybeSingle();
  if (account.error) throw new Error("Unable to check portal access.");
  if (account.data?.status !== "active") throw new FeedbackError("Portal access is unavailable.", 403);
  const link = await admin.from("portal_account_students").select("student_id").eq("account_user_id", user.id).eq("student_id", studentId).maybeSingle();
  if (link.error) throw new Error("Unable to check learner access.");
  if (!link.data) throw new FeedbackError("Learner access denied.", 403);
  return { admin, user };
}

// A completed lesson establishes eligibility. Assignment dates resolve the
// regular teacher only when no actual/substitute teacher is recorded.
export async function eligibleTeachers(studentId: string): Promise<FeedbackTeacher[]> {
  const { admin } = await portalIdentity(studentId);
  const participants = await admin.from("enrollment_students").select("id, enrollment_id").eq("student_id", studentId);
  const direct = await admin.from("enrollments").select("id").eq("student_id", studentId);
  if (participants.error || direct.error) throw new Error("Unable to load enrollments.");
  const enrollmentIds = [...new Set([...(participants.data ?? []).map(r => r.enrollment_id as string), ...(direct.data ?? []).map(r => r.id as string)])];
  if (!enrollmentIds.length) return [];
  const allParticipants = await admin.from("enrollment_students").select("enrollment_id, student_id").in("enrollment_id", enrollmentIds);
  if (allParticipants.error) throw new Error("Unable to verify lesson participants.");
  const unambiguous = new Set(enrollmentIds.filter(id => {
    const members = (allParticipants.data ?? []).filter(p => p.enrollment_id === id);
    return members.length ? members.every(p => p.student_id === studentId) : (direct.data ?? []).some(e => e.id === id);
  }));
  const lessons = await admin.from("lessons").select("enrollment_id, student_id, lesson_date, actual_teacher_id, substitute_teacher_id")
    .in("enrollment_id", enrollmentIds).eq("attendance_status", "completed")
    .or(`student_id.eq.${studentId},student_id.is.null`);
  const participantIds = (participants.data ?? []).map(r => r.id as string);
  const assignments = participantIds.length ? await admin.from("teacher_assignments").select("enrollment_student_id, teacher_id, start_date, end_date").in("enrollment_student_id", participantIds) : { data: [], error: null };
  if (lessons.error || assignments.error) throw new Error("Unable to load completed lesson teachers.");
  const enrollmentByParticipant = new Map((participants.data ?? []).map(r => [r.id, r.enrollment_id]));
  const ids = new Set<string>();
  for (const lesson of lessons.data ?? []) {
    if (!lesson.student_id && !unambiguous.has(lesson.enrollment_id)) continue;
    const actual = lesson.actual_teacher_id || lesson.substitute_teacher_id;
    if (actual) { ids.add(String(actual)); continue; }
    for (const assignment of assignments.data ?? []) {
      if (enrollmentByParticipant.get(assignment.enrollment_student_id) === lesson.enrollment_id && lesson.lesson_date && assignment.start_date <= lesson.lesson_date && (!assignment.end_date || assignment.end_date >= lesson.lesson_date)) ids.add(String(assignment.teacher_id));
    }
  }
  if (!ids.size) return [];
  const teachers = await admin.from("profiles").select("id, full_name").in("id", [...ids]).eq("role", "teacher").eq("status", "active");
  if (teachers.error) throw new Error("Unable to load teachers.");
  return (teachers.data ?? []).map(t => ({ id: String(t.id), name: t.full_name || "Teacher" }));
}

export async function publishedTeacher(slug: string): Promise<FeedbackTeacher | null> {
  const admin = createAdminClient();
  const result = await admin.from("teacher_public_profiles").select("teacher_id, slug, profiles!teacher_public_profiles_teacher_id_fkey!inner(id, full_name, role, status)")
    .eq("slug", slug).eq("is_published", true).eq("profiles.role", "teacher").eq("profiles.status", "active").maybeSingle();
  if (result.error) throw new Error("Unable to load teacher.");
  if (!result.data) return null;
  const p = Array.isArray(result.data.profiles) ? result.data.profiles[0] : result.data.profiles;
  return { id: result.data.teacher_id, name: p?.full_name || "Teacher", slug: result.data.slug };
}
