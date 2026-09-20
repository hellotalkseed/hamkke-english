import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface StudentRecord {
  id: string;
  student_number: string | null;
  full_name: string | null;
  preferred_name: string | null;
  timezone: string | null;
}

interface EnrollmentRecord {
  id: string;
  package_name: string | null;
  status: string;
}

interface EnrollmentStudentRecord {
  id: string;
  enrollment_id: string;
  student_id: string;
  students: StudentRecord | StudentRecord[] | null;
  enrollments: EnrollmentRecord | EnrollmentRecord[] | null;
}

interface LessonRecord {
  id: string;
  enrollment_id: string;
  student_id: string | null;
  lesson_number: number;
  lesson_date: string;
  schedule_time: string | null;
  duration: number;
  attendance_status: string;
  consumes_lesson: boolean;
  actual_teacher_id: string | null;
  substitute_teacher_id: string | null;
}

function convertStudentTimeToPhilippineTime(
  lessonDate: string,
  scheduleTime: string | null,
  studentTimezone: string | null
) {
  if (!scheduleTime) {
    return {
      philippineDate: lessonDate,
      philippineTime: null,
      scheduledAtPhilippine: null,
    };
  }

  const timezone = studentTimezone || "Asia/Manila";

  try {
    const [year, month, day] = lessonDate.split("-").map(Number);
    const [hours, minutes, seconds = 0] =
      scheduleTime.split(":").map(Number);

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

    let utcTimestamp = Date.UTC(
      year,
      month - 1,
      day,
      hours,
      minutes,
      seconds
    );

    const parts = formatter.formatToParts(new Date(utcTimestamp));
    const getPart = (type: string) =>
      Number(parts.find((part) => part.type === type)?.value || 0);

    const timezoneAsUtc = Date.UTC(
      getPart("year"),
      getPart("month") - 1,
      getPart("day"),
      getPart("hour"),
      getPart("minute"),
      getPart("second")
    );

    const actualUtcTimestamp =
      utcTimestamp - (timezoneAsUtc - utcTimestamp);

    const philippineFormatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });

    const philippineParts =
      philippineFormatter.formatToParts(new Date(actualUtcTimestamp));

    const getPhilippinePart = (type: string) =>
      philippineParts.find((part) => part.type === type)?.value || "";

    const philippineDate = [
      getPhilippinePart("year"),
      getPhilippinePart("month"),
      getPhilippinePart("day"),
    ].join("-");

    const philippineTime = [
      getPhilippinePart("hour"),
      getPhilippinePart("minute"),
    ].join(":");

    return {
      philippineDate,
      philippineTime,
      scheduledAtPhilippine:
        `${philippineDate}T${philippineTime}:00`,
    };
  } catch (error) {
    console.error("Timezone conversion error:", {
      lessonDate,
      scheduleTime,
      studentTimezone,
      error,
    });

    return {
      philippineDate: lessonDate,
      philippineTime: scheduleTime.slice(0, 5),
      scheduledAtPhilippine: null,
    };
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id, full_name, role, status")
      .eq("id", user.id)
      .single();

    if (
      profileError ||
      !profile ||
      profile.role !== "teacher" ||
      profile.status !== "active"
    ) {
      return NextResponse.json(
        {
          error:
            "Only active teachers can access teacher lessons.",
        },
        { status: 403 }
      );
    }

    const { data: assignments, error: assignmentsError } =
      await admin
        .from("teacher_assignments")
        .select(`
          id,
          enrollment_student_id,
          start_date,
          end_date,
          status
        `)
        .eq("teacher_id", user.id)
        .eq("status", "active");

    if (assignmentsError) {
      return NextResponse.json(
        { error: assignmentsError.message },
        { status: 500 }
      );
    }

    const enrollmentStudentIds = (assignments || []).map(
      (assignment) => assignment.enrollment_student_id
    );

    const {
      data: substituteLessons,
      error: substituteLessonsError,
    } = await admin
      .from("lessons")
      .select(`
        id,
        enrollment_id,
        student_id,
        lesson_number,
        lesson_date,
        schedule_time,
        duration,
        attendance_status,
        consumes_lesson,
        actual_teacher_id,
        substitute_teacher_id
      `)
      .eq("substitute_teacher_id", user.id);

    if (substituteLessonsError) {
      return NextResponse.json(
        { error: substituteLessonsError.message },
        { status: 500 }
      );
    }

    let enrollmentStudents: EnrollmentStudentRecord[] = [];

    if (enrollmentStudentIds.length > 0) {
      const { data, error } = await admin
        .from("enrollment_students")
        .select(`
          id,
          enrollment_id,
          student_id,
          students (
            id,
            student_number,
            full_name,
            preferred_name,
            timezone
          ),
          enrollments (
            id,
            package_name,
            status
          )
        `)
        .in("id", enrollmentStudentIds);

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      enrollmentStudents =
        (data || []) as EnrollmentStudentRecord[];
    }

    const substituteKeys = Array.from(
      new Set(
        (substituteLessons || [])
          .map((lesson) =>
            lesson.enrollment_id && lesson.student_id
              ? `${lesson.enrollment_id}:${lesson.student_id}`
              : null
          )
          .filter((value): value is string => Boolean(value))
      )
    );

    if (substituteKeys.length > 0) {
      const substituteEnrollmentIds = Array.from(
        new Set(substituteKeys.map((key) => key.split(":")[0]))
      );
      const substituteStudentIds = Array.from(
        new Set(substituteKeys.map((key) => key.split(":")[1]))
      );

      const { data, error } = await admin
        .from("enrollment_students")
        .select(`
          id,
          enrollment_id,
          student_id,
          students (
            id,
            student_number,
            full_name,
            preferred_name,
            timezone
          ),
          enrollments (
            id,
            package_name,
            status
          )
        `)
        .in("enrollment_id", substituteEnrollmentIds)
        .in("student_id", substituteStudentIds);

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      const existingKeys = new Set(
        enrollmentStudents.map(
          (item) => `${item.enrollment_id}:${item.student_id}`
        )
      );

      for (const item of (data || []) as EnrollmentStudentRecord[]) {
        const key = `${item.enrollment_id}:${item.student_id}`;
        if (!existingKeys.has(key)) {
          enrollmentStudents.push(item);
        }
      }
    }

    const regularEnrollmentStudentIdSet =
      new Set(enrollmentStudentIds);

    const regularEnrollmentIds = Array.from(
      new Set(
        enrollmentStudents
          .filter((item) =>
            regularEnrollmentStudentIdSet.has(item.id)
          )
          .map((item) => item.enrollment_id)
      )
    );

    let regularLessons: LessonRecord[] = [];

    if (regularEnrollmentIds.length > 0) {
      const { data, error } = await admin
        .from("lessons")
        .select(`
          id,
          enrollment_id,
          student_id,
          lesson_number,
          lesson_date,
          schedule_time,
          duration,
          attendance_status,
          consumes_lesson,
          actual_teacher_id,
          substitute_teacher_id
        `)
        .in("enrollment_id", regularEnrollmentIds)
        .order("lesson_date", { ascending: true })
        .order("schedule_time", { ascending: true })
        .order("lesson_number", { ascending: true });

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      regularLessons = (data || []) as LessonRecord[];
    }

    const lessonMap = new Map<string, LessonRecord>();

    for (const lesson of regularLessons) {
      lessonMap.set(lesson.id, lesson);
    }

    for (const lesson of (substituteLessons || []) as LessonRecord[]) {
      lessonMap.set(lesson.id, lesson);
    }

    const allLessons = Array.from(lessonMap.values()).sort((a, b) => {
      const dateComparison =
        a.lesson_date.localeCompare(b.lesson_date);

      if (dateComparison !== 0) return dateComparison;

      const timeComparison =
        (a.schedule_time || "").localeCompare(b.schedule_time || "");

      if (timeComparison !== 0) return timeComparison;

      return a.lesson_number - b.lesson_number;
    });

    const formattedLessons = [];

    for (const lesson of allLessons) {
      const matchingEnrollmentStudents = enrollmentStudents.filter(
        (item) =>
          item.enrollment_id === lesson.enrollment_id &&
          item.student_id === lesson.student_id
      );

      for (const enrollmentStudent of matchingEnrollmentStudents) {
        const student = Array.isArray(enrollmentStudent.students)
          ? enrollmentStudent.students[0]
          : enrollmentStudent.students;

        const enrollment = Array.isArray(
          enrollmentStudent.enrollments
        )
          ? enrollmentStudent.enrollments[0]
          : enrollmentStudent.enrollments;

        const timezone = student?.timezone || null;

        const converted = convertStudentTimeToPhilippineTime(
          lesson.lesson_date,
          lesson.schedule_time,
          timezone
        );

        formattedLessons.push({
          id: lesson.id,
          enrollment_id: lesson.enrollment_id,
          enrollment_student_id: enrollmentStudent.id,
          lesson_number: lesson.lesson_number,
          lesson_date: lesson.lesson_date,
          schedule_time: lesson.schedule_time,
          philippine_date: converted.philippineDate,
          philippine_time: converted.philippineTime,
          scheduled_at_philippine:
            converted.scheduledAtPhilippine,
          student_timezone: timezone,
          duration: lesson.duration,
          attendance_status: lesson.attendance_status,
          consumes_lesson: lesson.consumes_lesson,
          actual_teacher_id: lesson.actual_teacher_id,
          substitute_teacher_id: lesson.substitute_teacher_id,
          is_substitute:
            lesson.substitute_teacher_id === user.id,
          student: student
            ? {
                id: student.id,
                student_number: student.student_number,
                full_name: student.full_name,
                preferred_name: student.preferred_name,
                timezone: student.timezone,
              }
            : null,
          enrollment: enrollment
            ? {
                id: enrollment.id,
                package_name: enrollment.package_name,
                status: enrollment.status,
              }
            : null,
        });
      }
    }

    /*
     * Assessment bookings are not enrollment lessons.
     * They remain a separate collection and are merged only
     * by the calendar UI.
     *
     * assessment_date / assessment_time are already stored
     * in Asia/Manila, so no timezone conversion is applied.
     */
    const {
      data: assessmentRows,
      error: assessmentError,
    } = await admin
      .from("assessment_bookings")
      .select(`
        id,
        learner_type,
        learner_name,
        preferred_name,
        learner_age,
        contact_name,
        email,
        english_level,
        learning_goal,
        notes,
        assessment_format,
        preferred_platform,
        timezone,
        assessment_date,
        assessment_time,
        status,
        teacher_observation
      `)
      .eq("teacher_id", user.id)
      .in("status", [
        "confirmed",
        "completed",
        "no_show",
      ])
      .order("assessment_date", { ascending: true })
      .order("assessment_time", { ascending: true });

    if (assessmentError) {
      return NextResponse.json(
        { error: assessmentError.message },
        { status: 500 }
      );
    }

    const assessments = (assessmentRows || []).map((assessment) => ({
      ...assessment,
      philippine_date: assessment.assessment_date,
      philippine_time: assessment.assessment_time.slice(0, 5),
      scheduled_at_philippine:
        `${assessment.assessment_date}T${assessment.assessment_time.slice(0, 5)}:00`,
      duration: 30,
    }));

    return NextResponse.json({
      teacher: {
        id: profile.id,
        full_name: profile.full_name,
      },
      lessons: formattedLessons,
      assessments,
    });
  } catch (error) {
    console.error("Teacher lessons error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while loading teacher lessons.",
      },
      { status: 500 }
    );
  }
}
