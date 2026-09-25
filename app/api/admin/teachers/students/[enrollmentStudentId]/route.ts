import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ enrollmentStudentId: string }> };

function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function convertStudentTimeToPht(date: string, time: string | null, timezone: string | null) {
  if (!time) return { date, time: null as string | null };
  const zone = timezone || "Asia/Manila";
  try {
    const [y, mo, d] = date.split("-").map(Number);
    const [h, mi, s = 0] = time.split(":").map(Number);
    const guess = Date.UTC(y, mo - 1, d, h, mi, s);
    const source = new Intl.DateTimeFormat("en-US", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
    const parts = source.formatToParts(new Date(guess));
    const part = (type: string) => Number(parts.find((p) => p.type === type)?.value || 0);
    const represented = Date.UTC(part("year"), part("month") - 1, part("day"), part("hour"), part("minute"), part("second"));
    const actual = guess - (represented - guess);
    const pht = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(actual));
    const p = (type: string) => pht.find((x) => x.type === type)?.value || "";
    return { date: `${p("year")}-${p("month")}-${p("day")}`, time: `${p("hour")}:${p("minute")}` };
  } catch {
    return { date, time: time.slice(0, 5) };
  }
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { enrollmentStudentId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    const { data: profile } = await admin.from("profiles").select("id, full_name, role, status").eq("id", user.id).maybeSingle();
    if (!profile || profile.role !== "teacher" || profile.status !== "active") return NextResponse.json({ error: "Only active teachers can access Teaching Records." }, { status: 403 });

    const { data: assignment, error: assignmentError } = await admin.from("teacher_assignments").select("id, enrollment_student_id, status").eq("teacher_id", user.id).eq("enrollment_student_id", enrollmentStudentId).eq("status", "active").maybeSingle();
    if (assignmentError) return NextResponse.json({ error: assignmentError.message }, { status: 500 });
    if (!assignment) return NextResponse.json({ error: "Teaching Record not found or not assigned to you." }, { status: 404 });

    const { data: participant, error: participantError } = await admin.from("enrollment_students").select(`
      id, enrollment_id, student_id,
      students ( id, student_number, full_name, preferred_name, timezone ),
      enrollments ( id, enrollment_number, package_name, status, number_of_lessons, lesson_duration )
    `).eq("id", enrollmentStudentId).single();
    if (participantError || !participant) return NextResponse.json({ error: participantError?.message || "Student record not found." }, { status: 404 });

    const student = one(participant.students as any) as any;
    const enrollment = one(participant.enrollments as any) as any;
    if (!student || !enrollment) return NextResponse.json({ error: "Student or enrollment record is unavailable." }, { status: 404 });

    const [
      { data: enrollmentLessons, error: lessonsError },
      { data: schedules, error: schedulesError },
      { data: enrollmentParticipants, error: participantsError },
    ] = await Promise.all([
      // Load the complete enrollment lesson track. This matters for shared
      // packages: Bin and Dasom consume the same 20-lesson package even though
      // each lesson still belongs to one participant through student_id.
      admin.from("lessons").select("id, student_id, lesson_number, lesson_date, schedule_time, duration, attendance_status, consumes_lesson, resolution, material, lesson_page").eq("enrollment_id", participant.enrollment_id).order("lesson_date", { ascending: false }).order("schedule_time", { ascending: false }),
      // The recurring schedule remains participant-specific.
      admin.from("enrollment_schedules").select("id, day_of_week, schedule_time").eq("enrollment_id", participant.enrollment_id).eq("student_id", participant.student_id).order("day_of_week", { ascending: true }).order("schedule_time", { ascending: true }),
      admin.from("enrollment_students").select("id, student_id").eq("enrollment_id", participant.enrollment_id),
    ]);
    if (lessonsError) return NextResponse.json({ error: lessonsError.message }, { status: 500 });
    if (schedulesError) return NextResponse.json({ error: schedulesError.message }, { status: 500 });
    if (participantsError) return NextResponse.json({ error: participantsError.message }, { status: 500 });

    const isSharedEnrollment = (enrollmentParticipants || []).length > 1;

    // A shared enrollment has ONE package balance. Therefore package position
    // and consumption are calculated from the complete enrollment lesson track.
    // Individual enrollments naturally produce the same result because they
    // contain only one participant.
    const chronologicalEnrollmentLessons = [...(enrollmentLessons || [])].sort((a: any, b: any) =>
      a.lesson_date.localeCompare(b.lesson_date) ||
      (a.schedule_time || "").localeCompare(b.schedule_time || "")
    );
    const termPositionById = new Map(
      chronologicalEnrollmentLessons.map((lesson: any, index: number) => [lesson.id, index + 1])
    );

    // Teaching details such as next lesson, recent classes, and current material
    // remain specific to the student whose Teaching Record is open.
    const studentLessons = (enrollmentLessons || []).filter(
      (lesson: any) => lesson.student_id === participant.student_id
    );

    const mappedLessons = studentLessons.map((lesson: any) => {
      const pht = convertStudentTimeToPht(lesson.lesson_date, lesson.schedule_time, student.timezone);
      return {
        ...lesson,
        philippine_date: pht.date,
        philippine_time: pht.time,
        term_lesson_number: termPositionById.get(lesson.id) || null,
      };
    });

    // consumes_lesson is authoritative. For shared enrollments the balance is
    // intentionally enrollment-level (Bin + Dasom together), matching the
    // shared package model used by the owner/student records.
    const used = (enrollmentLessons || []).filter((lesson: any) => {
      // Keep this identical to Owner Admin -> Student Record -> Attendance & Lessons.
      if (lesson.consumes_lesson === true) return true;
      if (
        lesson.attendance_status === "completed" ||
        lesson.attendance_status === "no_show" ||
        lesson.attendance_status === "late_cancellation"
      ) return true;
      if (
        lesson.attendance_status === "unexpected_circumstance" &&
        lesson.resolution === "counted_as_completed"
      ) return true;
      return false;
    }).length;
    const total = enrollment.number_of_lessons || chronologicalEnrollmentLessons.length || 0;

    const nowParts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
    const np = (type: string) => nowParts.find((x) => x.type === type)?.value || "";
    const today = `${np("year")}-${np("month")}-${np("day")}`;
    const nowMinutes = Number(np("hour")) * 60 + Number(np("minute"));
    const upcoming = mappedLessons.filter((lesson: any) => {
      if (lesson.attendance_status !== "scheduled") return false;
      if (lesson.philippine_date > today) return true;
      if (lesson.philippine_date < today || !lesson.philippine_time) return false;
      const [h, m] = lesson.philippine_time.split(":").map(Number);
      return h * 60 + m + (lesson.duration || 0) > nowMinutes;
    }).sort((a: any, b: any) => a.philippine_date.localeCompare(b.philippine_date) || (a.philippine_time || "").localeCompare(b.philippine_time || ""));

    // Material/progress must come from an already-held class in this current
    // enrollment. Do not let future generated lessons or previous terms leak in.
    const latestWithMaterial = mappedLessons.find(
      (lesson: any) =>
        lesson.attendance_status !== "scheduled" &&
        (lesson.material || lesson.lesson_page)
    ) || null;
    const recent = mappedLessons.filter((lesson: any) => lesson.attendance_status !== "scheduled").slice(0, 8);

    return NextResponse.json({
      teacher: { id: profile.id, full_name: profile.full_name },
      enrollment_student_id: participant.id,
      student: { id: student.id, student_number: student.student_number, full_name: student.full_name, preferred_name: student.preferred_name, timezone: student.timezone },
      enrollment: { id: enrollment.id, enrollment_number: enrollment.enrollment_number, package_name: enrollment.package_name, status: enrollment.status, number_of_lessons: enrollment.number_of_lessons, lesson_duration: enrollment.lesson_duration },
      progress: { used, total, remaining: Math.max(0, total - used), shared: isSharedEnrollment },
      regular_schedule: schedules || [],
      next_lesson: upcoming[0] || null,
      current_material: latestWithMaterial ? {
        material: latestWithMaterial.material,
        lesson_page: latestWithMaterial.lesson_page,
        lesson_number: latestWithMaterial.term_lesson_number,
        record_lesson_number: latestWithMaterial.lesson_number,
      } : null,
      recent_lessons: recent,
      lessons: mappedLessons,
    });
  } catch (error) {
    console.error("Teacher teaching record error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load Teaching Record." }, { status: 500 });
  }
}
