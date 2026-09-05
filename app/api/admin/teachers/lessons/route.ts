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
  enrollments:
    | EnrollmentRecord
    | EnrollmentRecord[]
    | null;
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

  const timezone =
    studentTimezone || "Asia/Manila";

  try {
    /*
     * ---------------------------------------------------------
     * Create the student's local date/time.
     *
     * lesson_date and schedule_time represent the student's
     * own scheduled local time.
     * ---------------------------------------------------------
     */

    const [year, month, day] =
      lessonDate.split("-").map(Number);

    const [hours, minutes, seconds = 0] =
      scheduleTime.split(":").map(Number);

    /*
     * ---------------------------------------------------------
     * Determine the timezone offset for the student's timezone.
     *
     * This handles timezones with DST, such as Korea-free
     * fixed-offset zones and other locations appropriately.
     * ---------------------------------------------------------
     */

    const formatter = new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      }
    );

    /*
     * Treat the requested student-local date/time as a
     * UTC-like timestamp first, then determine what that
     * timestamp represents in the student's timezone.
     */

    let utcTimestamp = Date.UTC(
      year,
      month - 1,
      day,
      hours,
      minutes,
      seconds
    );

    const parts = formatter.formatToParts(
      new Date(utcTimestamp)
    );

    const getPart = (type: string) =>
      Number(
        parts.find(
          (part) => part.type === type
        )?.value || 0
      );

    const timezoneYear = getPart("year");
    const timezoneMonth = getPart("month");
    const timezoneDay = getPart("day");
    const timezoneHour = getPart("hour");
    const timezoneMinute =
      getPart("minute");
    const timezoneSecond =
      getPart("second");

    const timezoneAsUtc = Date.UTC(
      timezoneYear,
      timezoneMonth - 1,
      timezoneDay,
      timezoneHour,
      timezoneMinute,
      timezoneSecond
    );

    const offset =
      timezoneAsUtc - utcTimestamp;

    const actualUtcTimestamp =
      utcTimestamp - offset;

    /*
     * ---------------------------------------------------------
     * Convert the resulting instant to Philippine Time.
     * ---------------------------------------------------------
     */

    const philippineFormatter =
      new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone: "Asia/Manila",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        }
      );

    const philippineParts =
      philippineFormatter.formatToParts(
        new Date(actualUtcTimestamp)
      );

    const getPhilippinePart = (
      type: string
    ) =>
      philippineParts.find(
        (part) => part.type === type
      )?.value || "";

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
    console.error(
      "Timezone conversion error:",
      {
        lessonDate,
        scheduleTime,
        studentTimezone,
        error,
      }
    );

    return {
      philippineDate: lessonDate,
      philippineTime:
        scheduleTime.slice(0, 5),
      scheduledAtPhilippine: null,
    };
  }
}

export async function GET() {
  try {
    /*
     * ---------------------------------------------------------
     * GET CURRENT USER
     * ---------------------------------------------------------
     */

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

    /*
     * ---------------------------------------------------------
     * VERIFY ACTIVE TEACHER
     * ---------------------------------------------------------
     */

    const {
      data: profile,
      error: profileError,
    } = await admin
      .from("profiles")
      .select(
        "id, full_name, role, status"
      )
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

    /*
     * ---------------------------------------------------------
     * LOAD THIS TEACHER'S ACTIVE ASSIGNMENTS
     * ---------------------------------------------------------
     */

    const {
      data: assignments,
      error: assignmentsError,
    } = await admin
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
        {
          error:
            assignmentsError.message,
        },
        { status: 500 }
      );
    }

    if (
      !assignments ||
      assignments.length === 0
    ) {
      return NextResponse.json({
        teacher: {
          id: profile.id,
          full_name: profile.full_name,
        },
        lessons: [],
      });
    }

    /*
     * ---------------------------------------------------------
     * GET ENROLLMENT/STUDENT IDs
     * ---------------------------------------------------------
     */

    const enrollmentStudentIds =
      assignments.map(
        (assignment) =>
          assignment.enrollment_student_id
      );

    /*
     * ---------------------------------------------------------
     * LOAD ENROLLMENT/STUDENT INFORMATION
     * ---------------------------------------------------------
     */

    const {
      data: enrollmentStudents,
      error: enrollmentStudentsError,
    } = await admin
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

    if (enrollmentStudentsError) {
      return NextResponse.json(
        {
          error:
            enrollmentStudentsError.message,
        },
        { status: 500 }
      );
    }

    /*
     * ---------------------------------------------------------
     * GET ENROLLMENT IDs
     * ---------------------------------------------------------
     */

    const enrollmentIds =
      Array.from(
        new Set(
          (enrollmentStudents || []).map(
            (item) =>
              item.enrollment_id
          )
        )
      );

    if (enrollmentIds.length === 0) {
      return NextResponse.json({
        teacher: {
          id: profile.id,
          full_name: profile.full_name,
        },
        lessons: [],
      });
    }

    /*
     * ---------------------------------------------------------
     * LOAD LESSONS
     *
     * IMPORTANT:
     *
     * student_id is included here because a shared enrollment
     * can contain multiple students.
     *
     * Each lesson belongs to ONE student through lessons.student_id.
     * ---------------------------------------------------------
     */

    const {
      data: lessons,
      error: lessonsError,
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
        actual_teacher_id
      `)
      .in(
        "enrollment_id",
        enrollmentIds
      )
      .order("lesson_date", {
        ascending: true,
      })
      .order("schedule_time", {
        ascending: true,
      })
      .order("lesson_number", {
        ascending: true,
      });

    if (lessonsError) {
      return NextResponse.json(
        {
          error:
            lessonsError.message,
        },
        { status: 500 }
      );
    }

    /*
     * ---------------------------------------------------------
     * FORMAT LESSONS
     * ---------------------------------------------------------
     */

    const formattedLessons: Array<{
      id: string;
      enrollment_id: string;
      enrollment_student_id: string;
      lesson_number: number;
      lesson_date: string;
      schedule_time: string | null;
      philippine_date: string;
      philippine_time: string | null;
      scheduled_at_philippine: string | null;
      student_timezone: string | null;
      duration: number;
      attendance_status: string;
      consumes_lesson: boolean;
      actual_teacher_id: string | null;
      student: {
        id: string;
        student_number: string | null;
        full_name: string | null;
        preferred_name: string | null;
        timezone: string | null;
      } | null;
      enrollment: {
        id: string;
        package_name: string | null;
        status: string;
      } | null;
    }> = [];

    for (const lesson of (lessons ||
      []) as LessonRecord[]) {

      /*
       * -------------------------------------------------------
       * IMPORTANT SHARED-ENROLLMENT LOGIC
       *
       * Previously, every lesson in a shared enrollment was
       * matched to every student in that enrollment.
       *
       * That is incorrect.
       *
       * A lesson has its own student_id, so it must only be
       * matched to the enrollment_student belonging to that
       * same student.
       * -------------------------------------------------------
       */

      const matchingEnrollmentStudents =
        (
          enrollmentStudents || []
        ).filter(
          (item) =>
            item.enrollment_id ===
              lesson.enrollment_id &&
            item.student_id ===
              lesson.student_id
        ) as EnrollmentStudentRecord[];

      /*
       * -------------------------------------------------------
       * If a lesson has no student_id match, don't manufacture
       * a student association.
       *
       * This protects shared enrollments from showing the
       * lesson under the wrong student.
       * -------------------------------------------------------
       */

      for (const enrollmentStudent of matchingEnrollmentStudents) {

        const student = Array.isArray(
          enrollmentStudent.students
        )
          ? enrollmentStudent.students[0]
          : enrollmentStudent.students;

        const enrollment = Array.isArray(
          enrollmentStudent.enrollments
        )
          ? enrollmentStudent.enrollments[0]
          : enrollmentStudent.enrollments;

        const timezone =
          student?.timezone || null;

        /*
         * -----------------------------------------------------
         * Convert THIS student's scheduled local time to PHT.
         *
         * Bin's lessons use Bin's timezone.
         * Ms. Dasom's lessons use Dasom's timezone.
         * -----------------------------------------------------
         */

        const converted =
          convertStudentTimeToPhilippineTime(
            lesson.lesson_date,
            lesson.schedule_time,
            timezone
          );

        formattedLessons.push({
          id: lesson.id,

          enrollment_id:
            lesson.enrollment_id,

          enrollment_student_id:
            enrollmentStudent.id,

          lesson_number:
            lesson.lesson_number,

          lesson_date:
            lesson.lesson_date,

          schedule_time:
            lesson.schedule_time,

          philippine_date:
            converted.philippineDate,

          philippine_time:
            converted.philippineTime,

          scheduled_at_philippine:
            converted.scheduledAtPhilippine,

          student_timezone:
            timezone,

          duration:
            lesson.duration,

          attendance_status:
            lesson.attendance_status,

          consumes_lesson:
            lesson.consumes_lesson,

          actual_teacher_id:
            lesson.actual_teacher_id,

          student: student
            ? {
                id: student.id,
                student_number:
                  student.student_number,
                full_name:
                  student.full_name,
                preferred_name:
                  student.preferred_name,
                timezone:
                  student.timezone,
              }
            : null,

          enrollment: enrollment
            ? {
                id: enrollment.id,
                package_name:
                  enrollment.package_name,
                status:
                  enrollment.status,
              }
            : null,
        });
      }
    }

    return NextResponse.json({
      teacher: {
        id: profile.id,
        full_name: profile.full_name,
      },
      lessons: formattedLessons,
    });
  } catch (error) {
    console.error(
      "Teacher lessons error:",
      error
    );

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