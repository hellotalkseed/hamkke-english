import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Teacher = {
  id: string;
  full_name: string | null;
  teacher_number: string | null;
};

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

type Availability = {
  teacher_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

type AdditionalAvailability = {
  teacher_id: string;
  availability_date: string;
  start_time: string;
  end_time: string;
};

type EnrollmentSchedule = {
  enrollment_id: string;
  student_id: string;
  day_of_week: number;
  schedule_time: string;
};

function normalizeTime(value: string | null | undefined) {
  const match = String(value || "").match(/^(\d{1,2}):(\d{2})/);
  return match ? `${match[1].padStart(2, "0")}:${match[2]}` : "";
}

function timeToMinutes(value: string) {
  const [hour, minute] = normalizeTime(value).split(":").map(Number);
  return hour * 60 + minute;
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
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });

    const parts = formatter.formatToParts(new Date(probe));
    const part = (type: string) =>
      Number(parts.find((item) => item.type === type)?.value || 0);

    const asUtc = Date.UTC(
      part("year"),
      part("month") - 1,
      part("day"),
      part("hour"),
      part("minute"),
      part("second")
    );

    const actualUtc = probe - (asUtc - probe);

    const pht = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(actualUtc));

    const p = (type: string) =>
      pht.find((item) => item.type === type)?.value || "";

    return {
      date: `${p("year")}-${p("month")}-${p("day")}`,
      time: `${p("hour")}:${p("minute")}`,
    };
  } catch {
    return {
      date: lessonDate,
      time: normalizeTime(scheduleTime) || null,
    };
  }
}

function fitsBlock(
  startTime: string,
  duration: number,
  block: { start_time: string; end_time: string }
) {
  const start = timeToMinutes(startTime);
  const end = start + duration;
  return (
    start >= timeToMinutes(block.start_time) &&
    end <= timeToMinutes(block.end_time)
  );
}

async function authorizeOwner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, role, status")
    .eq("id", user.id)
    .maybeSingle();

  if (
    !profile ||
    profile.status !== "active" ||
    !["owner", "admin"].includes(profile.role)
  ) {
    return {
      error: NextResponse.json(
        { error: "Only an active Owner or Admin can view the daily schedule." },
        { status: 403 }
      ),
    };
  }

  return { admin, error: null };
}

export async function GET(request: Request) {
  try {
    const auth = await authorizeOwner();
    if (auth.error || !auth.admin) return auth.error!;

    const date = new URL(request.url).searchParams.get("date");

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "A valid date is required." },
        { status: 400 }
      );
    }

    const admin = auth.admin;

    const [
      lessonsResult,
      teachersResult,
      regularAvailabilityResult,
      additionalAvailabilityResult,
      activeAssignmentsResult,
    ] = await Promise.all([
      admin
        .from("lessons")
        .select(
          "id, enrollment_id, student_id, lesson_number, lesson_date, schedule_time, duration, attendance_status, substitute_teacher_id"
        )
        .gte("lesson_date", addDays(date, -1))
        .lte("lesson_date", addDays(date, 1)),
      admin
        .from("profiles")
        .select("id, full_name, teacher_number")
        .eq("role", "teacher")
        .eq("status", "active")
        .order("full_name"),
      admin
        .from("teacher_availability")
        .select("teacher_id, day_of_week, start_time, end_time"),
      admin
        .from("teacher_sub_availability")
        .select("teacher_id, availability_date, start_time, end_time")
        .eq("availability_date", date),
      admin
        .from("teacher_assignments")
        .select("id, enrollment_student_id, teacher_id, start_date, end_date, status")
        .eq("status", "active"),
    ]);

    for (const result of [
      lessonsResult,
      teachersResult,
      regularAvailabilityResult,
      additionalAvailabilityResult,
      activeAssignmentsResult,
    ]) {
      if (result.error) throw new Error(result.error.message);
    }

    const lessonRows = (lessonsResult.data || []) as LessonRow[];
    const teachers = (teachersResult.data || []) as Teacher[];
    const regularAvailability =
      (regularAvailabilityResult.data || []) as Availability[];
    const additionalAvailability =
      (additionalAvailabilityResult.data || []) as AdditionalAvailability[];
    const activeAssignments = activeAssignmentsResult.data || [];

    const studentIds = [
      ...new Set(lessonRows.map((lesson) => lesson.student_id).filter(Boolean)),
    ] as string[];

    const { data: students, error: studentsError } = studentIds.length
      ? await admin
          .from("students")
          .select("id, student_number, full_name, preferred_name, timezone")
          .in("id", studentIds)
      : { data: [], error: null };

    if (studentsError) throw new Error(studentsError.message);

    const studentMap = new Map(
      (students || []).map((student) => [student.id, student])
    );

    const dailyLessons = lessonRows.flatMap((lesson) => {
      if (!lesson.student_id) return [];
      const student = studentMap.get(lesson.student_id);
      if (!student) return [];

      const converted = convertStudentTimeToPht(
        lesson.lesson_date,
        lesson.schedule_time,
        student.timezone
      );

      if (converted.date !== date || !converted.time) return [];

      return [
        {
          lesson,
          student,
          pht_date: converted.date,
          pht_time: normalizeTime(converted.time),
        },
      ];
    });

    const enrollmentIds = [
      ...new Set(dailyLessons.map(({ lesson }) => lesson.enrollment_id)),
    ];

    const [
      enrollmentStudentsResult,
      schedulesResult,
    ] = await Promise.all([
      enrollmentIds.length && studentIds.length
        ? admin
            .from("enrollment_students")
            .select("id, enrollment_id, student_id")
            .in("enrollment_id", enrollmentIds)
            .in("student_id", studentIds)
        : Promise.resolve({ data: [], error: null }),
      enrollmentIds.length && studentIds.length
        ? admin
            .from("enrollment_schedules")
            .select("enrollment_id, student_id, day_of_week, schedule_time")
            .in("enrollment_id", enrollmentIds)
            .in("student_id", studentIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (enrollmentStudentsResult.error) {
      throw new Error(enrollmentStudentsResult.error.message);
    }
    if (schedulesResult.error) {
      throw new Error(schedulesResult.error.message);
    }

    const enrollmentStudents = enrollmentStudentsResult.data || [];
    const schedules = (schedulesResult.data || []) as EnrollmentSchedule[];

    const enrollmentStudentMap = new Map(
      enrollmentStudents.map((row) => [
        `${row.enrollment_id}:${row.student_id}`,
        row.id,
      ])
    );

    const teacherMap = new Map(teachers.map((teacher) => [teacher.id, teacher]));

    const assignedEnrollmentStudentIds = new Set(
      activeAssignments.map((assignment) => assignment.enrollment_student_id)
    );

    const activeAssignmentByEnrollmentStudent = new Map(
      activeAssignments.map((assignment) => [
        assignment.enrollment_student_id,
        assignment,
      ])
    );

    // Build each teacher's recurring occupied PHT slots so Daily Schedule
    // does not recommend a teacher who is already teaching another student.
    const assignedEsIds = [
      ...new Set(
        activeAssignments.map((assignment) => assignment.enrollment_student_id)
      ),
    ];

    const { data: assignedEnrollmentStudents, error: assignedEsError } =
      assignedEsIds.length
        ? await admin
            .from("enrollment_students")
            .select("id, enrollment_id, student_id")
            .in("id", assignedEsIds)
        : { data: [], error: null };

    if (assignedEsError) throw new Error(assignedEsError.message);

    const assignedStudentIds = [
      ...new Set(
        (assignedEnrollmentStudents || []).map((row) => row.student_id)
      ),
    ];

    const assignedEnrollmentIds = [
      ...new Set(
        (assignedEnrollmentStudents || []).map((row) => row.enrollment_id)
      ),
    ];

    const [
      assignedSchedulesResult,
      assignedStudentsResult,
    ] = await Promise.all([
      assignedEnrollmentIds.length && assignedStudentIds.length
        ? admin
            .from("enrollment_schedules")
            .select("enrollment_id, student_id, day_of_week, schedule_time")
            .in("enrollment_id", assignedEnrollmentIds)
            .in("student_id", assignedStudentIds)
        : Promise.resolve({ data: [], error: null }),
      assignedStudentIds.length
        ? admin
            .from("students")
            .select("id, timezone")
            .in("id", assignedStudentIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (assignedSchedulesResult.error) {
      throw new Error(assignedSchedulesResult.error.message);
    }
    if (assignedStudentsResult.error) {
      throw new Error(assignedStudentsResult.error.message);
    }

    const assignedTimezoneMap = new Map(
      (assignedStudentsResult.data || []).map((student) => [
        student.id,
        student.timezone,
      ])
    );

    const assignedEsMap = new Map(
      (assignedEnrollmentStudents || []).map((row) => [row.id, row])
    );

    const teacherOccupiedRecurring = new Map<string, Set<string>>();

    for (const assignment of activeAssignments) {
      const es = assignedEsMap.get(assignment.enrollment_student_id);
      if (!es) continue;

      const studentTimezone = assignedTimezoneMap.get(es.student_id);
      const studentSchedules = (assignedSchedulesResult.data || []).filter(
        (schedule) =>
          schedule.enrollment_id === es.enrollment_id &&
          schedule.student_id === es.student_id
      );

      for (const schedule of studentSchedules) {
        // Use a representative date with the stored weekday. The existing
        // assignment system uses the same recurring timezone conversion model.
        const converted = (() => {
          const weekday = Number(schedule.day_of_week);
          const base = new Date(`${date}T12:00:00Z`);
          const delta = (weekday - base.getUTCDay() + 7) % 7;
          const studentDate = addDays(date, delta);
          return convertStudentTimeToPht(
            studentDate,
            schedule.schedule_time,
            studentTimezone
          );
        })();

        const key = `${getDayOfWeek(converted.date)}:${normalizeTime(
          converted.time
        )}`;

        if (!teacherOccupiedRecurring.has(assignment.teacher_id)) {
          teacherOccupiedRecurring.set(assignment.teacher_id, new Set());
        }
        teacherOccupiedRecurring.get(assignment.teacher_id)!.add(key);
      }
    }

    // Exact-date substitute occupancy.
    const substituteTeacherIds = [
      ...new Set(
        dailyLessons
          .map(({ lesson }) => lesson.substitute_teacher_id)
          .filter(Boolean)
      ),
    ] as string[];

    const exactSubOccupied = new Set(
      dailyLessons
        .filter(({ lesson }) => lesson.substitute_teacher_id)
        .map(
          ({ lesson, pht_time }) =>
            `${lesson.substitute_teacher_id}:${pht_time}`
        )
    );

    const items = dailyLessons
      .map(({ lesson, student, pht_date, pht_time }) => {
        const esId = enrollmentStudentMap.get(
          `${lesson.enrollment_id}:${lesson.student_id}`
        );

        const regularAssignment = esId
          ? activeAssignmentByEnrollmentStudent.get(esId)
          : null;

        const regularTeacher = regularAssignment
          ? teacherMap.get(regularAssignment.teacher_id) || null
          : null;

        const substituteTeacher = lesson.substitute_teacher_id
          ? teacherMap.get(lesson.substitute_teacher_id) || null
          : null;

        const recurringSchedules = schedules.filter(
          (schedule) =>
            schedule.enrollment_id === lesson.enrollment_id &&
            schedule.student_id === lesson.student_id
        );

        const regularCandidates = !regularTeacher && esId
          ? teachers.filter((teacher) => {
              const teacherBlocks = regularAvailability.filter(
                (block) => block.teacher_id === teacher.id
              );

              if (!teacherBlocks.length) return false;

              return recurringSchedules.every((schedule) => {
                const converted = (() => {
                  const weekday = Number(schedule.day_of_week);
                  const base = new Date(`${date}T12:00:00Z`);
                  const delta = (weekday - base.getUTCDay() + 7) % 7;
                  const studentDate = addDays(date, delta);
                  return convertStudentTimeToPht(
                    studentDate,
                    schedule.schedule_time,
                    student.timezone
                  );
                })();

                if (!converted.time) return false;

                const phtDay = getDayOfWeek(converted.date);
                const phtTime = normalizeTime(converted.time);

                const fitsAvailability = teacherBlocks.some(
                  (block) =>
                    block.day_of_week === phtDay &&
                    fitsBlock(phtTime, lesson.duration, block)
                );

                const occupied =
                  teacherOccupiedRecurring
                    .get(teacher.id)
                    ?.has(`${phtDay}:${phtTime}`) || false;

                return fitsAvailability && !occupied;
              });
            })
          : [];

        const substituteCandidates = regularTeacher
          ? teachers.filter((teacher) => {
              if (teacher.id === regularTeacher.id) return false;

              const day = getDayOfWeek(pht_date);

              const fitsRegular = regularAvailability.some(
                (block) =>
                  block.teacher_id === teacher.id &&
                  block.day_of_week === day &&
                  fitsBlock(pht_time, lesson.duration, block)
              );

              const fitsAdditional = additionalAvailability.some(
                (block) =>
                  block.teacher_id === teacher.id &&
                  block.availability_date === pht_date &&
                  fitsBlock(pht_time, lesson.duration, block)
              );

              if (!fitsRegular && !fitsAdditional) return false;

              const recurringOccupied =
                teacherOccupiedRecurring
                  .get(teacher.id)
                  ?.has(`${day}:${pht_time}`) || false;

              // Additional Availability explicitly re-opens an otherwise
              // recurring occupied slot for date-specific substitute work.
              if (recurringOccupied && !fitsAdditional) return false;

              if (exactSubOccupied.has(`${teacher.id}:${pht_time}`)) {
                return lesson.substitute_teacher_id === teacher.id;
              }

              return true;
            })
          : [];

        return {
          lesson_id: lesson.id,
          enrollment_id: lesson.enrollment_id,
          enrollment_student_id: esId || null,
          lesson_number: lesson.lesson_number,
          duration: lesson.duration,
          attendance_status: lesson.attendance_status,
          pht_date,
          pht_time,
          student: {
            id: student.id,
            student_number: student.student_number,
            full_name: student.full_name,
            preferred_name: student.preferred_name,
          },
          regular_teacher: regularTeacher,
          substitute_teacher: substituteTeacher,
          regular_candidates: regularCandidates,
          substitute_candidates: substituteCandidates,
        };
      })
      .sort((a, b) => a.pht_time.localeCompare(b.pht_time));

    return NextResponse.json({
      date,
      classes: items,
      counts: {
        all: items.length,
        needs_regular: items.filter((item) => !item.regular_teacher).length,
        substituted: items.filter((item) => item.substitute_teacher).length,
        scheduled: items.filter(
          (item) => item.regular_teacher && !item.substitute_teacher
        ).length,
      },
    });
  } catch (error) {
    console.error("Daily schedule GET error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load the daily schedule.",
      },
      { status: 500 }
    );
  }
}
