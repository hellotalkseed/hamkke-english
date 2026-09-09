import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteContext {
  params: Promise<{ id: string }>;
}

type LessonRow = {
  id: string;
  enrollment_id: string;
  student_id: string | null;
  lesson_number: number;
  lesson_date: string;
  schedule_time: string | null;
  duration: number;
  attendance_status: string;
  substitute_teacher_id: string | null;
};

function normalizeTime(value: string | null | undefined) {
  const match = String(value || "").match(/^(\d{1,2}):(\d{2})/);
  return match ? `${match[1].padStart(2, "0")}:${match[2]}` : "";
}

function addDays(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function getDayOfWeek(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function timeToMinutes(value: string) {
  const [hour, minute] = normalizeTime(value).split(":").map(Number);
  return hour * 60 + minute;
}

function convertStudentTimeToPht(
  lessonDate: string,
  scheduleTime: string | null,
  studentTimezone: string | null
) {
  if (!scheduleTime) return { date: lessonDate, time: null as string | null };
  const timezone = studentTimezone || "Asia/Manila";

  try {
    const [year, month, day] = lessonDate.split("-").map(Number);
    const [hours, minutes, seconds = 0] = scheduleTime.split(":").map(Number);
    const probe = Date.UTC(year, month - 1, day, hours, minutes, seconds);
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
    });
    const parts = formatter.formatToParts(new Date(probe));
    const part = (type: string) => Number(parts.find((item) => item.type === type)?.value || 0);
    const asUtc = Date.UTC(part("year"), part("month") - 1, part("day"), part("hour"), part("minute"), part("second"));
    const actualUtc = probe - (asUtc - probe);
    const pht = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Manila",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date(actualUtc));
    const p = (type: string) => pht.find((item) => item.type === type)?.value || "";
    return { date: `${p("year")}-${p("month")}-${p("day")}`, time: `${p("hour")}:${p("minute")}` };
  } catch {
    return { date: lessonDate, time: normalizeTime(scheduleTime) || null };
  }
}

async function authorizeOwner() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("id, role, status").eq("id", user.id).maybeSingle();
  if (!profile || profile.status !== "active" || !["owner", "admin"].includes(profile.role)) {
    return { error: NextResponse.json({ error: "Only the Owner or Admin can manage substitute assignments." }, { status: 403 }) };
  }
  return { admin, error: null };
}

async function loadMatchingLessons(admin: ReturnType<typeof createAdminClient>, date: string, time: string) {
  const { data: lessons, error } = await admin
    .from("lessons")
    .select("id, enrollment_id, student_id, lesson_number, lesson_date, schedule_time, duration, attendance_status, substitute_teacher_id")
    .gte("lesson_date", addDays(date, -1))
    .lte("lesson_date", addDays(date, 1))
    .eq("attendance_status", "scheduled");
  if (error) throw new Error(error.message);

  const rows = (lessons || []) as LessonRow[];
  const studentIds = [...new Set(rows.map((lesson) => lesson.student_id).filter(Boolean))] as string[];
  const { data: students, error: studentsError } = studentIds.length
    ? await admin.from("students").select("id, student_number, full_name, preferred_name, timezone").in("id", studentIds)
    : { data: [], error: null };
  if (studentsError) throw new Error(studentsError.message);
  const studentMap = new Map((students || []).map((student) => [student.id, student]));

  return rows.flatMap((lesson) => {
    if (!lesson.student_id) return [];
    const student = studentMap.get(lesson.student_id);
    if (!student) return [];
    const converted = convertStudentTimeToPht(lesson.lesson_date, lesson.schedule_time, student.timezone);
    return converted.date === date && normalizeTime(converted.time) === normalizeTime(time)
      ? [{ lesson, student, phtDate: converted.date, phtTime: normalizeTime(converted.time) }]
      : [];
  });
}

async function teacherCanTakeSlot(
  admin: ReturnType<typeof createAdminClient>,
  teacherId: string,
  date: string,
  time: string,
  duration: number
) {
  const day = getDayOfWeek(date);
  const start = timeToMinutes(time);
  const end = start + duration;

  const [{ data: regular, error: regularError }, { data: additional, error: additionalError }] = await Promise.all([
    admin.from("teacher_availability").select("day_of_week, start_time, end_time").eq("teacher_id", teacherId).eq("day_of_week", day),
    admin.from("teacher_sub_availability").select("availability_date, start_time, end_time").eq("teacher_id", teacherId).eq("availability_date", date),
  ]);
  if (regularError) throw new Error(regularError.message);
  if (additionalError) throw new Error(additionalError.message);

  const fits = (block: { start_time: string; end_time: string }) =>
    start >= timeToMinutes(block.start_time) && end <= timeToMinutes(block.end_time);

  return (additional || []).some(fits) || (regular || []).some(fits);
}

async function enrichCandidates(admin: ReturnType<typeof createAdminClient>, matches: Awaited<ReturnType<typeof loadMatchingLessons>>) {
  const enrollmentIds = [...new Set(matches.map(({ lesson }) => lesson.enrollment_id))];
  const studentIds = [...new Set(matches.map(({ lesson }) => lesson.student_id).filter(Boolean))] as string[];

  const { data: enrollmentStudents } = enrollmentIds.length && studentIds.length
    ? await admin.from("enrollment_students").select("id, enrollment_id, student_id").in("enrollment_id", enrollmentIds).in("student_id", studentIds)
    : { data: [] };

  const esMap = new Map((enrollmentStudents || []).map((row) => [`${row.enrollment_id}:${row.student_id}`, row.id]));
  const esIds = [...new Set((enrollmentStudents || []).map((row) => row.id))];
  const { data: assignments } = esIds.length
    ? await admin.from("teacher_assignments").select("enrollment_student_id, teacher_id, status, start_date, end_date").in("enrollment_student_id", esIds).eq("status", "active")
    : { data: [] };
  const teacherIds = [...new Set((assignments || []).map((row) => row.teacher_id))];
  const { data: teachers } = teacherIds.length
    ? await admin.from("profiles").select("id, full_name, teacher_number").in("id", teacherIds)
    : { data: [] };
  const teacherMap = new Map((teachers || []).map((teacher) => [teacher.id, teacher]));

  return matches.map(({ lesson, student, phtDate, phtTime }) => {
    const esId = esMap.get(`${lesson.enrollment_id}:${lesson.student_id}`);
    const assignment = (assignments || []).find((row) =>
      row.enrollment_student_id === esId && row.start_date <= lesson.lesson_date && (!row.end_date || row.end_date >= lesson.lesson_date)
    );
    const regularTeacher = assignment ? teacherMap.get(assignment.teacher_id) : null;
    return {
      lesson_id: lesson.id,
      lesson_number: lesson.lesson_number,
      duration: lesson.duration,
      pht_date: phtDate,
      pht_time: phtTime,
      substitute_teacher_id: lesson.substitute_teacher_id,
      student: {
        id: student.id,
        student_number: student.student_number,
        full_name: student.full_name,
        preferred_name: student.preferred_name,
      },
      regular_teacher: regularTeacher || null,
    };
  });
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const auth = await authorizeOwner();
    if (auth.error || !auth.admin) return auth.error!;
    const { id: teacherId } = await context.params;
    const url = new URL(request.url);
    const date = url.searchParams.get("date");
    const time = normalizeTime(url.searchParams.get("time"));
    const startDate = url.searchParams.get("start_date");
    const endDate = url.searchParams.get("end_date");

    const { data: teacher } = await auth.admin.from("profiles").select("id, role, status").eq("id", teacherId).maybeSingle();
    if (!teacher || teacher.role !== "teacher" || teacher.status !== "active") {
      return NextResponse.json({ error: "Active teacher not found." }, { status: 404 });
    }

    if (date && time) {
      const matches = await loadMatchingLessons(auth.admin, date, time);
      const candidates = await enrichCandidates(auth.admin, matches);
      return NextResponse.json({ candidates });
    }

    if (startDate && endDate) {
      const { data: lessons, error } = await auth.admin
        .from("lessons")
        .select("id, enrollment_id, student_id, lesson_number, lesson_date, schedule_time, duration, attendance_status, substitute_teacher_id")
        .eq("substitute_teacher_id", teacherId)
        .gte("lesson_date", addDays(startDate, -1))
        .lte("lesson_date", addDays(endDate, 1));
      if (error) throw new Error(error.message);
      const rows = (lessons || []) as LessonRow[];
      const studentIds = [...new Set(rows.map((row) => row.student_id).filter(Boolean))] as string[];
      const { data: students } = studentIds.length
        ? await auth.admin.from("students").select("id, student_number, full_name, preferred_name, timezone").in("id", studentIds)
        : { data: [] };
      const studentMap = new Map((students || []).map((student) => [student.id, student]));
      const assignments = rows.flatMap((lesson) => {
        if (!lesson.student_id) return [];
        const student = studentMap.get(lesson.student_id);
        if (!student) return [];
        const converted = convertStudentTimeToPht(lesson.lesson_date, lesson.schedule_time, student.timezone);
        if (!converted.time || converted.date < startDate || converted.date > endDate) return [];
        return [{
          lesson_id: lesson.id,
          lesson_number: lesson.lesson_number,
          duration: lesson.duration,
          pht_date: converted.date,
          pht_time: normalizeTime(converted.time),
          attendance_status: lesson.attendance_status,
          student: {
            id: student.id,
            student_number: student.student_number,
            full_name: student.full_name,
            preferred_name: student.preferred_name,
          },
        }];
      });
      return NextResponse.json({ assignments });
    }

    return NextResponse.json({ error: "Provide date + time, or start_date + end_date." }, { status: 400 });
  } catch (error) {
    console.error("Substitute assignment GET error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load substitute assignments." }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const auth = await authorizeOwner();
    if (auth.error || !auth.admin) return auth.error!;
    const { id: teacherId } = await context.params;
    const body = await request.json();
    const lessonId = typeof body.lesson_id === "string" ? body.lesson_id : "";
    const date = typeof body.date === "string" ? body.date : "";
    const time = normalizeTime(body.time);
    if (!lessonId || !date || !time) return NextResponse.json({ error: "Lesson, date, and time are required." }, { status: 400 });

    const matches = await loadMatchingLessons(auth.admin, date, time);
    const selected = matches.find(({ lesson }) => lesson.id === lessonId);
    if (!selected) return NextResponse.json({ error: "That lesson is not scheduled at the selected date and time." }, { status: 400 });
    if (selected.lesson.substitute_teacher_id && selected.lesson.substitute_teacher_id !== teacherId) {
      return NextResponse.json({ error: "This lesson already has another substitute teacher." }, { status: 409 });
    }

    const canTake = await teacherCanTakeSlot(auth.admin, teacherId, date, time, selected.lesson.duration);
    if (!canTake) return NextResponse.json({ error: "This teacher is not available for the complete lesson at the selected date and time." }, { status: 400 });

    const { data: existing, error: existingError } = await auth.admin
      .from("lessons")
      .select("id, lesson_date, schedule_time, student_id")
      .eq("substitute_teacher_id", teacherId)
      .neq("id", lessonId)
      .gte("lesson_date", addDays(date, -1))
      .lte("lesson_date", addDays(date, 1));
    if (existingError) throw new Error(existingError.message);

    const existingStudentIds = [...new Set((existing || []).map((row) => row.student_id).filter(Boolean))] as string[];
    const { data: existingStudents } = existingStudentIds.length
      ? await auth.admin.from("students").select("id, timezone").in("id", existingStudentIds)
      : { data: [] };
    const tzMap = new Map((existingStudents || []).map((student) => [student.id, student.timezone]));
    const doubleBooked = (existing || []).some((row) => {
      const converted = convertStudentTimeToPht(row.lesson_date, row.schedule_time, row.student_id ? tzMap.get(row.student_id) || null : null);
      return converted.date === date && normalizeTime(converted.time) === time;
    });
    if (doubleBooked) return NextResponse.json({ error: "This teacher already has another substitute class at this date and time." }, { status: 409 });

    const { data: updatedLesson, error: updateError } = await auth.admin
      .from("lessons")
      .update({ substitute_teacher_id: teacherId })
      .eq("id", lessonId)
      .select("id, substitute_teacher_id")
      .single();
    if (updateError) throw new Error(updateError.message);

    return NextResponse.json({ message: "Substitute class assigned successfully.", lesson: updatedLesson });
  } catch (error) {
    console.error("Substitute assignment POST error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to assign substitute class." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const auth = await authorizeOwner();
    if (auth.error || !auth.admin) return auth.error!;
    const { id: teacherId } = await context.params;
    const lessonId = new URL(request.url).searchParams.get("lesson_id");
    if (!lessonId) return NextResponse.json({ error: "Lesson ID is required." }, { status: 400 });

    const { data: lesson } = await auth.admin.from("lessons").select("id, substitute_teacher_id").eq("id", lessonId).maybeSingle();
    if (!lesson || lesson.substitute_teacher_id !== teacherId) return NextResponse.json({ error: "Substitute assignment not found for this teacher." }, { status: 404 });

    const { error } = await auth.admin.from("lessons").update({ substitute_teacher_id: null }).eq("id", lessonId);
    if (error) throw new Error(error.message);
    return NextResponse.json({ message: "Substitute assignment removed successfully." });
  } catch (error) {
    console.error("Substitute assignment DELETE error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to remove substitute assignment." }, { status: 500 });
  }
}
