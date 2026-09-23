import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const VALID_ATTENDANCE_STATUSES = [
  "scheduled",
  "completed",
  "no_show",
  "late_cancellation",
  "student_cancelled_rescheduled",
  "student_cancelled_credit",
  "unexpected_circumstance",
  "teacher_cancelled",
] as const;

const VALID_RESOLUTIONS = [
  "rescheduled",
  "lesson_credit",
  "counted_as_completed",
] as const;

type AttendanceStatus =
  (typeof VALID_ATTENDANCE_STATUSES)[number];

type Resolution =
  (typeof VALID_RESOLUTIONS)[number];

interface RouteContext {
  params: Promise<{
    lessonId: string;
  }>;
}

interface LessonRecord {
  id: string;
  enrollment_id: string;
  student_id: string | null;
  lesson_number: number;
  lesson_date: string;
  original_lesson_date: string | null;
  rescheduled_at: string | null;
  schedule_time: string | null;
  duration: number;
  attendance_status: string;
  resolution: string | null;
  notes: string | null;
  teacher_observation: string | null;
  consumes_lesson: boolean;
  actual_teacher_id: string | null;
  substitute_teacher_id: string | null;
  platform: string | null;
  class_link: string | null;
  material: string | null;
  lesson_page: string | null;
  class_instructions: string | null;
  class_info_updated_at: string | null;
}

interface EnrollmentStudentRecord {
  id: string;
  enrollment_id: string;
  student_id: string;
}

interface TeacherProfile {
  id: string;
  full_name: string | null;
  teacher_number: string | null;
  status: string;
}

interface AvailabilityBlock {
  teacher_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface PreviousClassInfoRecord {
  lesson_number: number;
  platform: string | null;
  class_link: string | null;
  material: string | null;
  lesson_page: string | null;
  class_instructions: string | null;
  class_info_updated_at: string | null;
}


interface RolloverSourceLesson {
  id: string;
  enrollment_id: string;
  student_id: string | null;
  lesson_date: string;
  schedule_time: string | null;
  duration: number;
}

interface RolloverScheduleRow {
  student_id: string | null;
  day_of_week: number;
  schedule_time: string;
}

function addUtcDays(
  dateKey: string,
  days: number
) {
  const [year, month, day] =
    dateKey.split("-").map(Number);

  const date = new Date(
    Date.UTC(
      year,
      month - 1,
      day
    )
  );

  date.setUTCDate(
    date.getUTCDate() + days
  );

  return [
    date.getUTCFullYear(),
    String(
      date.getUTCMonth() + 1
    ).padStart(2, "0"),
    String(
      date.getUTCDate()
    ).padStart(2, "0"),
  ].join("-");
}

function getUtcDayOfWeek(
  dateKey: string
) {
  const [year, month, day] =
    dateKey.split("-").map(Number);

  return new Date(
    Date.UTC(
      year,
      month - 1,
      day
    )
  ).getUTCDay();
}

async function createAutomaticRolloverLesson(
  supabase: Awaited<
    ReturnType<typeof createClient>
  >,
  sourceLesson: RolloverSourceLesson
) {
  /*
   * One credited lesson may create only one rollover lesson.
   * The unique database index on rollover_source_lesson_id
   * protects this even if the request is retried.
   */
  const {
    data: existingRollover,
    error: existingRolloverError,
  } = await supabase
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
      rollover_source_lesson_id
    `)
    .eq(
      "rollover_source_lesson_id",
      sourceLesson.id
    )
    .maybeSingle();

  if (existingRolloverError) {
    throw new Error(
      `Unable to check for an existing rollover lesson: ${existingRolloverError.message}`
    );
  }

  if (existingRollover) {
    return existingRollover;
  }

  /*
   * IMPORTANT SHARED-ENROLLMENT RULE
   *
   * A credit adds ONE lesson back to the package as a whole.
   * It does not necessarily add a lesson for the student who
   * received the original credit.
   *
   * We therefore continue the enrollment's complete recurring
   * schedule in chronological order and assign the new lesson to
   * whichever participant owns that next recurring slot.
   */
  const {
    data: enrollmentLessons,
    error: enrollmentLessonsError,
  } = await supabase
    .from("lessons")
    .select(`
      lesson_number,
      lesson_date,
      schedule_time
    `)
    .eq(
      "enrollment_id",
      sourceLesson.enrollment_id
    );

  if (enrollmentLessonsError) {
    throw new Error(
      `Unable to load the enrollment lessons: ${enrollmentLessonsError.message}`
    );
  }

  const highestLessonNumber =
    (enrollmentLessons ?? [])
      .reduce(
        (highest, lesson) =>
          Math.max(
            highest,
            Number(
              lesson.lesson_number ?? 0
            )
          ),
        0
      );

  const lessonPoints =
    (enrollmentLessons ?? [])
      .filter(
        (lesson) =>
          Boolean(lesson.lesson_date)
      )
      .map((lesson) => ({
        date: String(lesson.lesson_date),
        time:
          lesson.schedule_time
            ? String(lesson.schedule_time)
            : "00:00:00",
      }))
      .sort((a, b) => {
        const dateCompare =
          a.date.localeCompare(b.date);

        if (dateCompare !== 0) {
          return dateCompare;
        }

        return a.time.localeCompare(b.time);
      });

  const lastExistingPoint =
    lessonPoints[
      lessonPoints.length - 1
    ] ?? {
      date: sourceLesson.lesson_date,
      time:
        sourceLesson.schedule_time ??
        "00:00:00",
    };

  const {
    data: scheduleRows,
    error: scheduleRowsError,
  } = await supabase
    .from("enrollment_schedules")
    .select(`
      student_id,
      day_of_week,
      schedule_time
    `)
    .eq(
      "enrollment_id",
      sourceLesson.enrollment_id
    );

  if (scheduleRowsError) {
    throw new Error(
      `Unable to load the recurring schedule: ${scheduleRowsError.message}`
    );
  }

  const allScheduleRows =
    ((scheduleRows ?? []) as RolloverScheduleRow[])
      .filter(
        (row) =>
          row.schedule_time !== null &&
          row.schedule_time !== undefined
      )
      .sort((a, b) => {
        const dayDifference =
          Number(a.day_of_week) -
          Number(b.day_of_week);

        if (dayDifference !== 0) {
          return dayDifference;
        }

        return String(
          a.schedule_time
        ).localeCompare(
          String(b.schedule_time)
        );
      });

  if (allScheduleRows.length === 0) {
    throw new Error(
      "No recurring enrollment schedule was found for this enrollment."
    );
  }

  let rolloverDate: string | null =
    null;
  let rolloverTime: string | null =
    null;
  let rolloverStudentId:
    | string
    | null = null;

  /*
   * Search from the current final lesson forward.
   * Offset 0 is intentional: when a shared enrollment has two
   * students on the same day, a later slot that same day must be
   * eligible to become the next package lesson.
   */
  for (
    let offset = 0;
    offset <= 366;
    offset += 1
  ) {
    const candidateDate =
      addUtcDays(
        lastExistingPoint.date,
        offset
      );

    const candidateDay =
      getUtcDayOfWeek(
        candidateDate
      );

    const matchingRows =
      allScheduleRows
        .filter(
          (row) =>
            Number(
              row.day_of_week
            ) === candidateDay
        )
        .sort((a, b) =>
          String(
            a.schedule_time
          ).localeCompare(
            String(
              b.schedule_time
            )
          )
        );

    for (const row of matchingRows) {
      const candidateTime =
        String(row.schedule_time);

      const isAfterCurrentEnd =
        candidateDate >
          lastExistingPoint.date ||
        (
          candidateDate ===
            lastExistingPoint.date &&
          candidateTime >
            lastExistingPoint.time
        );

      if (!isAfterCurrentEnd) {
        continue;
      }

      rolloverDate = candidateDate;
      rolloverTime = candidateTime;
      rolloverStudentId =
        row.student_id ??
        sourceLesson.student_id;

      break;
    }

    if (
      rolloverDate &&
      rolloverTime
    ) {
      break;
    }
  }

  if (
    !rolloverDate ||
    !rolloverTime ||
    !rolloverStudentId
  ) {
    throw new Error(
      "Unable to find the next recurring enrollment slot for the rollover lesson."
    );
  }

  const {
    data: rolloverLesson,
    error: rolloverInsertError,
  } = await supabase
    .from("lessons")
    .insert({
      enrollment_id:
        sourceLesson.enrollment_id,

      student_id:
        rolloverStudentId,

      lesson_number:
        highestLessonNumber + 1,

      lesson_date:
        rolloverDate,

      duration:
        sourceLesson.duration,

      schedule_time:
        rolloverTime,

      attendance_status:
        "scheduled",

      consumes_lesson:
        false,

      resolution:
        null,

      notes:
        null,

      original_lesson_date:
        sourceLesson.lesson_date,

      rescheduled_at:
        null,

      actual_teacher_id:
        null,

      substitute_teacher_id:
        null,

      rollover_source_lesson_id:
        sourceLesson.id,
    })
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
      rollover_source_lesson_id
    `)
    .single();

  if (rolloverInsertError) {
    if (
      rolloverInsertError.code ===
      "23505"
    ) {
      const {
        data: retryRollover,
        error: retryLookupError,
      } = await supabase
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
          rollover_source_lesson_id
        `)
        .eq(
          "rollover_source_lesson_id",
          sourceLesson.id
        )
        .maybeSingle();

      if (
        !retryLookupError &&
        retryRollover
      ) {
        return retryRollover;
      }
    }

    throw new Error(
      `Unable to create the rollover lesson: ${rolloverInsertError.message}`
    );
  }

  return rolloverLesson;
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
    const [year, month, day] =
      lessonDate.split("-").map(Number);

    const [hours, minutes, seconds = 0] =
      scheduleTime.split(":").map(Number);

    const formatter =
      new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      });

    const utcTimestamp = Date.UTC(
      year,
      month - 1,
      day,
      hours,
      minutes,
      seconds
    );

    const parts =
      formatter.formatToParts(
        new Date(utcTimestamp)
      );

    const getPart = (type: string) =>
      Number(
        parts.find(
          (part) => part.type === type
        )?.value || 0
      );

    const timezoneYear =
      getPart("year");

    const timezoneMonth =
      getPart("month");

    const timezoneDay =
      getPart("day");

    const timezoneHour =
      getPart("hour");

    const timezoneMinute =
      getPart("minute");

    const timezoneSecond =
      getPart("second");

    const timezoneAsUtc =
      Date.UTC(
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

    const philippineFormatter =
      new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone: "Asia/Manila",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "numeric",
          minute: "2-digit",
          hourCycle: "h23",
        }
      );

    const philippineParts =
      philippineFormatter.formatToParts(
        new Date(
          actualUtcTimestamp
        )
      );

    const getPhilippinePart = (
      type: string
    ) =>
      philippineParts.find(
        (part) =>
          part.type === type
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
      philippineDate:
        lessonDate,
      philippineTime:
        scheduleTime.slice(0, 5),
      scheduledAtPhilippine:
        null,
    };
  }
}

function timeToMinutes(
  time: string
) {
  const [hours, minutes] =
    time
      .slice(0, 5)
      .split(":")
      .map(Number);

  return (
    hours * 60 +
    minutes
  );
}

function getDayOfWeek(
  dateString: string
) {
  const [year, month, day] =
    dateString
      .split("-")
      .map(Number);

  return new Date(
    year,
    month - 1,
    day
  ).getDay();
}

function lessonFitsAvailability(
  lessonDate: string,
  lessonTime: string | null,
  duration: number,
  availability: AvailabilityBlock
) {
  if (!lessonTime) {
    return false;
  }

  const lessonDay =
    getDayOfWeek(
      lessonDate
    );

  if (
    availability.day_of_week !==
    lessonDay
  ) {
    return false;
  }

  const lessonStart =
    timeToMinutes(
      lessonTime
    );

  const lessonEnd =
    lessonStart +
    duration;

  const availabilityStart =
    timeToMinutes(
      availability.start_time
    );

  const availabilityEnd =
    timeToMinutes(
      availability.end_time
    );

  return (
    lessonStart >=
      availabilityStart &&
    lessonEnd <=
      availabilityEnd
  );
}

async function getCurrentUser() {
  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null,
      admin: null,
      error:
        NextResponse.json(
          {
            error:
              "Unauthorized.",
          },
          {
            status: 401,
          }
        ),
    };
  }

  const admin =
    createAdminClient();

  const {
    data: profile,
    error: profileError,
  } = await admin
    .from("profiles")
    .select(
      "id, full_name, role, status"
    )
    .eq(
      "id",
      user.id
    )
    .single();

  if (
    profileError ||
    !profile
  ) {
    return {
      user,
      profile: null,
      admin,
      error:
        NextResponse.json(
          {
            error:
              "Profile not found.",
          },
          {
            status: 403,
          }
        ),
    };
  }

  if (
    profile.status &&
    profile.status !==
      "active"
  ) {
    return {
      user,
      profile,
      admin,
      error:
        NextResponse.json(
          {
            error:
              "Your account is not active.",
          },
          {
            status: 403,
          }
        ),
    };
  }

  return {
    user,
    profile,
    admin,
    error: null,
  };
}

async function getLesson(
  admin: ReturnType<
    typeof createAdminClient
  >,
  lessonId: string
) {
  /*
   * ---------------------------------------------------------
   * LOAD EXACT LESSON
   * ---------------------------------------------------------
   *
   * IMPORTANT:
   *
   * Shared enrollments such as Bin + Dasom use the same
   * enrollment_id, but each lesson also stores student_id.
   *
   * We therefore resolve the enrollment participant using:
   *
   *   enrollment_id + student_id
   *
   * and never simply select the first enrollment student.
   * ---------------------------------------------------------
   */

  const {
    data: lesson,
    error: lessonError,
  } = await admin
    .from("lessons")
    .select(`
      id,
      enrollment_id,
      student_id,
      lesson_number,
      lesson_date,
      original_lesson_date,
      rescheduled_at,
      schedule_time,
      duration,
      attendance_status,
      resolution,
      notes,
      teacher_observation,
      consumes_lesson,
      actual_teacher_id,
      substitute_teacher_id,
      platform,
      class_link,
      material,
      lesson_page,
      class_instructions,
      class_info_updated_at
    `)
    .eq(
      "id",
      lessonId
    )
    .single();

  if (
    lessonError ||
    !lesson
  ) {
    return {
      lesson: null,
      enrollmentStudent:
        null,
      error:
        NextResponse.json(
          {
            error:
              "Lesson not found.",
          },
          {
            status: 404,
          }
        ),
    };
  }

  if (
    !lesson.student_id
  ) {
    return {
      lesson: null,
      enrollmentStudent:
        null,
      error:
        NextResponse.json(
          {
            error:
              "This lesson is not connected to a student.",
          },
          {
            status: 500,
          }
        ),
    };
  }

  const {
    data: enrollmentStudent,
    error:
      enrollmentStudentError,
  } = await admin
    .from(
      "enrollment_students"
    )
    .select(`
      id,
      enrollment_id,
      student_id
    `)
    .eq(
      "enrollment_id",
      lesson.enrollment_id
    )
    .eq(
      "student_id",
      lesson.student_id
    )
    .maybeSingle();

  if (
    enrollmentStudentError
  ) {
    return {
      lesson: null,
      enrollmentStudent:
        null,
      error:
        NextResponse.json(
          {
            error:
              enrollmentStudentError.message,
          },
          {
            status: 500,
          }
        ),
    };
  }

  if (
    !enrollmentStudent
  ) {
    return {
      lesson: null,
      enrollmentStudent:
        null,
      error:
        NextResponse.json(
          {
            error:
              "The student connected to this lesson could not be found in this enrollment.",
          },
          {
            status: 403,
          }
        ),
    };
  }

  return {
    lesson:
      lesson as LessonRecord,

    enrollmentStudent:
      enrollmentStudent as EnrollmentStudentRecord,

    error: null,
  };
}

async function teacherCanAccessLesson(
  admin: ReturnType<
    typeof createAdminClient
  >,
  teacherId: string,
  lesson: LessonRecord,
  enrollmentStudent:
    EnrollmentStudentRecord
) {
  if (
    lesson
      .substitute_teacher_id ===
    teacherId
  ) {
    return true;
  }

  const {
    data: assignment,
    error,
  } = await admin
    .from(
      "teacher_assignments"
    )
    .select(`
      id,
      enrollment_student_id,
      start_date,
      end_date,
      status
    `)
    .eq(
      "teacher_id",
      teacherId
    )
    .eq(
      "enrollment_student_id",
      enrollmentStudent.id
    )
    .eq(
      "status",
      "active"
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      error.message
    );
  }

  return Boolean(
    assignment
  );
}

async function getSubstituteTeachers(
  admin: ReturnType<
    typeof createAdminClient
  >,
  lesson: LessonRecord,
  studentTimezone:
    string | null
) {
  const {
    data: teachers,
    error: teachersError,
  } = await admin
    .from("profiles")
    .select(`
      id,
      full_name,
      teacher_number,
      status
    `)
    .eq(
      "role",
      "teacher"
    )
    .eq(
      "status",
      "active"
    )
    .order(
      "full_name",
      {
        ascending: true,
      }
    );

  if (
    teachersError
  ) {
    throw new Error(
      teachersError.message
    );
  }

  if (
    !teachers ||
    teachers.length === 0
  ) {
    return [];
  }

  const teacherIds =
    teachers.map(
      (teacher) =>
        teacher.id
    );

  const {
    data: availability,
    error:
      availabilityError,
  } = await admin
    .from(
      "teacher_availability"
    )
    .select(`
      teacher_id,
      day_of_week,
      start_time,
      end_time
    `)
    .in(
      "teacher_id",
      teacherIds
    );

  if (
    availabilityError
  ) {
    throw new Error(
      availabilityError.message
    );
  }

  const converted =
    convertStudentTimeToPhilippineTime(
      lesson.lesson_date,
      lesson.schedule_time,
      studentTimezone
    );

  const phtDate =
    converted.philippineDate;

  const phtTime =
    converted.philippineTime;

  const phtDay =
    getDayOfWeek(
      phtDate
    );

  return (
    teachers as TeacherProfile[]
  ).map(
    (teacher) => {
      const teacherBlocks =
        (
          (availability ||
            []) as AvailabilityBlock[]
        ).filter(
          (block) =>
            block.teacher_id ===
            teacher.id
        );

      const available =
        Boolean(
          phtTime &&
            teacherBlocks.some(
              (block) =>
                block.day_of_week ===
                  phtDay &&
                lessonFitsAvailability(
                  phtDate,
                  phtTime,
                  lesson.duration,
                  block
                )
            )
        );

      return {
        id:
          teacher.id,
        full_name:
          teacher.full_name,
        teacher_number:
          teacher.teacher_number,
        available,
      };
    }
  );
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const auth =
      await getCurrentUser();

    if (
      auth.error
    ) {
      return auth.error;
    }

    const {
      user,
      profile,
      admin,
    } = auth;

    if (
      !user ||
      !profile ||
      !admin
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const {
      lessonId,
    } =
      await context.params;

    const {
      lesson,
      enrollmentStudent,
      error,
    } =
      await getLesson(
        admin,
        lessonId
      );

    if (error) {
      return error;
    }

    if (
      !lesson ||
      !enrollmentStudent
    ) {
      return NextResponse.json(
        {
          error:
            "Lesson not found.",
        },
        {
          status: 404,
        }
      );
    }

    const isOwnerOrAdmin =
      profile.role ===
        "owner" ||
      profile.role ===
        "admin";

    if (
      !isOwnerOrAdmin
    ) {
      if (
        profile.role !==
        "teacher"
      ) {
        return NextResponse.json(
          {
            error:
              "You are not authorized to access this lesson.",
          },
          {
            status: 403,
          }
        );
      }

      const allowed =
        await teacherCanAccessLesson(
          admin,
          user.id,
          lesson,
          enrollmentStudent
        );

      if (
        !allowed
      ) {
        return NextResponse.json(
          {
            error:
              "You are not assigned to this lesson.",
          },
          {
            status: 403,
          }
        );
      }
    }

    /*
     * ---------------------------------------------------------
     * LOAD EXACT STUDENT
     * ---------------------------------------------------------
     */

    const {
      data: student,
      error:
        studentError,
    } = await admin
      .from("students")
      .select(`
        id,
        student_number,
        full_name,
        preferred_name,
        email,
        timezone
      `)
      .eq(
        "id",
        enrollmentStudent.student_id
      )
      .single();

    if (
      studentError ||
      !student
    ) {
      return NextResponse.json(
        {
          error:
            "Student information could not be loaded.",
        },
        {
          status: 500,
        }
      );
    }

    const {
      data: enrollment,
      error:
        enrollmentError,
    } = await admin
      .from("enrollments")
      .select(`
        id,
        package_name,
        status
      `)
      .eq(
        "id",
        lesson.enrollment_id
      )
      .single();

    if (
      enrollmentError ||
      !enrollment
    ) {
      return NextResponse.json(
        {
          error:
            "Enrollment information could not be loaded.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * CARRY FORWARD CLASS INFO
     * ---------------------------------------------------------
     *
     * Class Info is carried forward only from an earlier lesson
     * belonging to the SAME:
     *
     *   enrollment_id
     *   +
     *   student_id
     *
     * This keeps shared-enrollment students independent.
     *
     * Example:
     *
     * Bin   -> Bin   -> Bin
     * Dasom -> Dasom -> Dasom
     *
     * Bin can never inherit Dasom's Class Info, and Dasom can
     * never inherit Bin's Class Info.
     *
     * The inherited fields are:
     * - Platform
     * - Material
     * - Lesson / Page
     * - Class Instructions
     *
     * Notes and Teacher Observation remain lesson-specific.
     * ---------------------------------------------------------
     */

    const hasOwnClassInfo =
      Boolean(
        lesson.class_info_updated_at ||
          lesson.platform ||
          lesson.class_link ||
          lesson.material ||
          lesson.lesson_page ||
          lesson.class_instructions
      );

    let previousClassInfo:
      PreviousClassInfoRecord | null =
        null;

    if (
      !hasOwnClassInfo
    ) {
      const {
        data:
          previousLesson,
        error:
          previousLessonError,
      } = await admin
        .from("lessons")
        .select(`
          lesson_number,
          platform,
          class_link,
          material,
          lesson_page,
          class_instructions,
          class_info_updated_at
        `)
        .eq(
          "enrollment_id",
          lesson.enrollment_id
        )
        .eq(
          "student_id",
          enrollmentStudent.student_id
        )
        .lt(
          "lesson_number",
          lesson.lesson_number
        )
        .not(
          "class_info_updated_at",
          "is",
          null
        )
        .order(
          "lesson_number",
          {
            ascending:
              false,
          }
        )
        .limit(1)
        .maybeSingle();

      if (
        previousLessonError
      ) {
        return NextResponse.json(
          {
            error:
              previousLessonError.message,
          },
          {
            status: 500,
          }
        );
      }

      previousClassInfo =
        previousLesson as
          | PreviousClassInfoRecord
          | null;
    }

    const classInfoInherited =
      !hasOwnClassInfo &&
      Boolean(
        previousClassInfo
      );

    const effectivePlatform =
      hasOwnClassInfo
        ? lesson.platform
        : previousClassInfo
            ?.platform ??
          null;

    const effectiveClassLink =
      hasOwnClassInfo
        ? lesson.class_link
        : previousClassInfo
            ?.class_link ??
          null;

    const effectiveMaterial =
      hasOwnClassInfo
        ? lesson.material
        : previousClassInfo
            ?.material ??
          null;

    const effectiveLessonPage =
      hasOwnClassInfo
        ? lesson.lesson_page
        : previousClassInfo
            ?.lesson_page ??
          null;

    const effectiveClassInstructions =
      hasOwnClassInfo
        ? lesson.class_instructions
        : previousClassInfo
            ?.class_instructions ??
          null;

    const effectiveClassInfoUpdatedAt =
      hasOwnClassInfo
        ? lesson.class_info_updated_at
        : previousClassInfo
            ?.class_info_updated_at ??
          null;

    /*
     * ---------------------------------------------------------
     * SUBSTITUTE TEACHER
     * ---------------------------------------------------------
     */

    const substituteTeacher =
      lesson
        .substitute_teacher_id
        ? (
            (
              await admin
                .from(
                  "profiles"
                )
                .select(
                  "id, full_name, teacher_number"
                )
                .eq(
                  "id",
                  lesson.substitute_teacher_id
                )
                .maybeSingle()
            ).data
          )
        : null;

    let substituteTeachers: Array<{
      id: string;
      full_name:
        string | null;
      teacher_number:
        string | null;
      available:
        boolean;
    }> = [];

    if (
      isOwnerOrAdmin
    ) {
      substituteTeachers =
        await getSubstituteTeachers(
          admin,
          lesson,
          student.timezone
        );
    }

    return NextResponse.json({
      viewer: {
        id:
          profile.id,
        full_name:
          profile.full_name,
        role:
          profile.role,
      },

      teacher: {
        id:
          profile.id,
        full_name:
          profile.full_name,
      },

      lesson: {
        id:
          lesson.id,

        enrollment_id:
          lesson.enrollment_id,

        enrollment_student_id:
          enrollmentStudent.id,

        student_id:
          lesson.student_id,

        lesson_number:
          lesson.lesson_number,

        lesson_date:
          lesson.lesson_date,

        original_lesson_date:
          lesson.original_lesson_date,

        rescheduled_at:
          lesson.rescheduled_at,

        schedule_time:
          lesson.schedule_time,

        duration:
          lesson.duration,

        attendance_status:
          lesson.attendance_status,

        resolution:
          lesson.resolution,

        notes:
          lesson.notes,

        teacher_observation:
          lesson.teacher_observation,

        consumes_lesson:
          lesson.consumes_lesson,

        actual_teacher_id:
          lesson.actual_teacher_id,

        substitute_teacher_id:
          lesson.substitute_teacher_id,

        platform:
          effectivePlatform,

        class_link:
          effectiveClassLink,

        material:
          effectiveMaterial,

        lesson_page:
          effectiveLessonPage,

        class_instructions:
          effectiveClassInstructions,

        class_info_updated_at:
          effectiveClassInfoUpdatedAt,

        class_info_inherited:
          classInfoInherited,

        class_info_inherited_from_lesson_number:
          classInfoInherited
            ? previousClassInfo
                ?.lesson_number ??
              null
            : null,

        student,

        enrollment,

        substitute_teacher:
          substituteTeacher,
      },

      substitute_teachers:
        substituteTeachers,
    });
  } catch (error) {
    console.error(
      "Teacher lesson detail error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while loading the lesson.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const auth =
      await getCurrentUser();

    if (
      auth.error
    ) {
      return auth.error;
    }

    const {
      user,
      profile,
      admin,
    } = auth;

    if (
      !user ||
      !profile ||
      !admin
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const {
      lessonId,
    } =
      await context.params;

    const {
      lesson,
      enrollmentStudent,
      error,
    } =
      await getLesson(
        admin,
        lessonId
      );

    if (error) {
      return error;
    }

    if (
      !lesson ||
      !enrollmentStudent
    ) {
      return NextResponse.json(
        {
          error:
            "Lesson not found.",
        },
        {
          status: 404,
        }
      );
    }

    const isOwnerOrAdmin =
      profile.role ===
        "owner" ||
      profile.role ===
        "admin";

    let body: {
      attendance_status?:
        string;
      status?:
        string;
      resolution?:
        string | null;
      lesson_date?:
        string | null;
      attendance_notes?:
        string | null;
      notes?:
        string | null;
      teacher_observation?:
        string | null;
      platform?:
        string | null;
      class_link?:
        string | null;
      material?:
        string | null;
      lesson_page?:
        string | null;
      class_instructions?:
        string | null;
      substitute_teacher_id?:
        string | null;
    };

    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * SUBSTITUTE TEACHER UPDATE
     * ---------------------------------------------------------
     */

    const hasSubstituteTeacher =
      Object.prototype.hasOwnProperty.call(
        body,
        "substitute_teacher_id"
      );

    if (
      hasSubstituteTeacher
    ) {
      if (
        !isOwnerOrAdmin
      ) {
        return NextResponse.json(
          {
            error:
              "Only the Owner or Admin can assign a substitute teacher.",
          },
          {
            status: 403,
          }
        );
      }

      const substituteTeacherId =
        body.substitute_teacher_id;

      if (
        substituteTeacherId ===
          null ||
        substituteTeacherId ===
          ""
      ) {
        const {
          data:
            updatedLesson,
          error:
            updateError,
        } = await admin
          .from("lessons")
          .update({
            substitute_teacher_id:
              null,
          })
          .eq(
            "id",
            lessonId
          )
          .select(`
            id,
            enrollment_id,
            student_id,
            lesson_number,
            lesson_date,
            original_lesson_date,
            rescheduled_at,
            schedule_time,
            duration,
            attendance_status,
            resolution,
            notes,
            teacher_observation,
            consumes_lesson,
            actual_teacher_id,
            substitute_teacher_id,
            platform,
            material,
            lesson_page,
            class_instructions,
            class_info_updated_at
          `)
          .single();

        if (
          updateError
        ) {
          return NextResponse.json(
            {
              error:
                updateError.message,
            },
            {
              status: 500,
            }
          );
        }

        return NextResponse.json({
          message:
            "Substitute teacher removed successfully.",
          lesson:
            updatedLesson,
        });
      }

      if (
        typeof substituteTeacherId !==
        "string"
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid substitute teacher.",
          },
          {
            status: 400,
          }
        );
      }

      const {
        data:
          substituteTeacher,
        error:
          substituteTeacherError,
      } = await admin
        .from("profiles")
        .select(`
          id,
          full_name,
          teacher_number,
          status
        `)
        .eq(
          "id",
          substituteTeacherId
        )
        .eq(
          "role",
          "teacher"
        )
        .eq(
          "status",
          "active"
        )
        .maybeSingle();

      if (
        substituteTeacherError
      ) {
        return NextResponse.json(
          {
            error:
              substituteTeacherError.message,
          },
          {
            status: 500,
          }
        );
      }

      if (
        !substituteTeacher
      ) {
        return NextResponse.json(
          {
            error:
              "The selected substitute teacher is not active.",
          },
          {
            status: 400,
          }
        );
      }

      const {
        data: student,
        error:
          studentError,
      } = await admin
        .from("students")
        .select(
          "timezone"
        )
        .eq(
          "id",
          enrollmentStudent.student_id
        )
        .single();

      if (
        studentError ||
        !student
      ) {
        return NextResponse.json(
          {
            error:
              "Student timezone could not be loaded.",
          },
          {
            status: 500,
          }
        );
      }

      const converted =
        convertStudentTimeToPhilippineTime(
          lesson.lesson_date,
          lesson.schedule_time,
          student.timezone
        );

      if (
        !converted.philippineTime
      ) {
        return NextResponse.json(
          {
            error:
              "This lesson does not have a valid scheduled time.",
          },
          {
            status: 400,
          }
        );
      }

      const {
        data:
          availability,
        error:
          availabilityError,
      } = await admin
        .from(
          "teacher_availability"
        )
        .select(`
          teacher_id,
          day_of_week,
          start_time,
          end_time
        `)
        .eq(
          "teacher_id",
          substituteTeacherId
        );

      if (
        availabilityError
      ) {
        return NextResponse.json(
          {
            error:
              availabilityError.message,
          },
          {
            status: 500,
          }
        );
      }

      const phtDay =
        getDayOfWeek(
          converted.philippineDate
        );

      const fits =
        (
          (availability ||
            []) as AvailabilityBlock[]
        ).some(
          (block) =>
            block.day_of_week ===
              phtDay &&
            lessonFitsAvailability(
              converted.philippineDate,
              converted.philippineTime,
              lesson.duration,
              block
            )
        );

      if (
        !fits
      ) {
        return NextResponse.json(
          {
            error:
              "The selected teacher is not available for this lesson in Philippine Time.",
          },
          {
            status: 400,
          }
        );
      }

      const {
        data:
          updatedLesson,
        error:
          updateError,
      } = await admin
        .from("lessons")
        .update({
          substitute_teacher_id:
            substituteTeacherId,
        })
        .eq(
          "id",
          lessonId
        )
        .select(`
          id,
          enrollment_id,
          student_id,
          lesson_number,
          lesson_date,
          original_lesson_date,
          rescheduled_at,
          schedule_time,
          duration,
          attendance_status,
          resolution,
          notes,
          teacher_observation,
          consumes_lesson,
          actual_teacher_id,
          substitute_teacher_id,
          platform,
          class_link,
          material,
          lesson_page,
          class_instructions,
          class_info_updated_at
        `)
        .single();

      if (
        updateError
      ) {
        return NextResponse.json(
          {
            error:
              updateError.message,
          },
          {
            status: 500,
          }
        );
      }

      return NextResponse.json({
        message:
          "Substitute teacher assigned successfully.",

        lesson:
          updatedLesson,

        substitute_teacher:
          substituteTeacher,
      });
    }

    /*
     * ---------------------------------------------------------
     * AUTHORIZATION
     * ---------------------------------------------------------
     */

    if (
      !isOwnerOrAdmin
    ) {
      if (
        profile.role !==
        "teacher"
      ) {
        return NextResponse.json(
          {
            error:
              "You are not authorized to update this lesson.",
          },
          {
            status: 403,
          }
        );
      }

      const allowed =
        await teacherCanAccessLesson(
          admin,
          user.id,
          lesson,
          enrollmentStudent
        );

      if (
        !allowed
      ) {
        return NextResponse.json(
          {
            error:
              "You are not assigned to this lesson.",
          },
          {
            status: 403,
          }
        );
      }
    }

    const hasAttendanceUpdate =
      Object.prototype.hasOwnProperty.call(
        body,
        "status"
      ) ||
      Object.prototype.hasOwnProperty.call(
        body,
        "attendance_status"
      );

    const hasNotes =
      Object.prototype.hasOwnProperty.call(
        body,
        "notes"
      );

    const hasTeacherObservation =
      Object.prototype.hasOwnProperty.call(
        body,
        "teacher_observation"
      );

    const hasClassInfo =
      Object.prototype.hasOwnProperty.call(
        body,
        "platform"
      ) ||
      Object.prototype.hasOwnProperty.call(
        body,
        "class_link"
      ) ||
      Object.prototype.hasOwnProperty.call(
        body,
        "material"
      ) ||
      Object.prototype.hasOwnProperty.call(
        body,
        "lesson_page"
      ) ||
      Object.prototype.hasOwnProperty.call(
        body,
        "class_instructions"
      );

    if (
      !hasAttendanceUpdate &&
      !hasNotes &&
      !hasTeacherObservation &&
      !hasClassInfo
    ) {
      return NextResponse.json(
        {
          error:
            "No lesson information was provided.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * ATTENDANCE UPDATE
     * ---------------------------------------------------------
     */

    if (
      hasAttendanceUpdate
    ) {
      const rawStatus =
        body.status ??
        body.attendance_status;

      if (
        typeof rawStatus !==
          "string" ||
        !VALID_ATTENDANCE_STATUSES.includes(
          rawStatus as AttendanceStatus
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid attendance status.",

            allowed_statuses:
              VALID_ATTENDANCE_STATUSES,
          },
          {
            status: 400,
          }
        );
      }

      const attendanceStatus =
        rawStatus as AttendanceStatus;

      const resolution =
        body.resolution ===
          null ||
        body.resolution ===
          undefined ||
        body.resolution ===
          ""
          ? null
          : (body.resolution as Resolution);

      if (
        resolution !== null &&
        !VALID_RESOLUTIONS.includes(
          resolution
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid lesson resolution.",
          },
          {
            status: 400,
          }
        );
      }

      const lessonDate =
        body.lesson_date ===
          null ||
        body.lesson_date ===
          undefined ||
        body.lesson_date ===
          ""
          ? null
          : String(
              body.lesson_date
            );

      const attendanceNotes =
        body.attendance_notes ===
          null ||
        body.attendance_notes ===
          undefined ||
        body.attendance_notes ===
          ""
          ? null
          : String(
              body.attendance_notes
            ).trim() ||
            null;

      let consumesLesson =
        false;

      if (
        attendanceStatus ===
          "completed" ||
        attendanceStatus ===
          "no_show" ||
        attendanceStatus ===
          "late_cancellation"
      ) {
        consumesLesson =
          true;
      }

      if (
        attendanceStatus ===
        "scheduled"
      ) {
        if (
          resolution !==
          null
        ) {
          return NextResponse.json(
            {
              error:
                "A scheduled lesson cannot have a resolution.",
            },
            {
              status: 400,
            }
          );
        }

        consumesLesson =
          false;
      }

      if (
        attendanceStatus ===
          "completed" &&
        resolution !== null
      ) {
        return NextResponse.json(
          {
            error:
              "A completed lesson cannot have a resolution.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        attendanceStatus ===
          "no_show" &&
        resolution !== null
      ) {
        return NextResponse.json(
          {
            error:
              "A no-show cannot have a resolution.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        attendanceStatus ===
          "late_cancellation" &&
        resolution !== null
      ) {
        return NextResponse.json(
          {
            error:
              "A late cancellation cannot have a resolution.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        attendanceStatus ===
        "student_cancelled_rescheduled"
      ) {
        if (
          resolution !==
          "rescheduled"
        ) {
          return NextResponse.json(
            {
              error:
                "Student cancellation with rescheduling requires the rescheduled resolution.",
            },
            {
              status: 400,
            }
          );
        }

        if (
          !lessonDate
        ) {
          return NextResponse.json(
            {
              error:
                "A new lesson date is required when rescheduling.",
            },
            {
              status: 400,
            }
          );
        }

        consumesLesson =
          false;
      }

      if (
        attendanceStatus ===
        "student_cancelled_credit"
      ) {
        if (
          resolution !==
          "lesson_credit"
        ) {
          return NextResponse.json(
            {
              error:
                "Student cancellation with credit requires the lesson credit resolution.",
            },
            {
              status: 400,
            }
          );
        }

        consumesLesson =
          false;
      }

      if (
        attendanceStatus ===
        "unexpected_circumstance"
      ) {
        if (
          resolution !==
            "rescheduled" &&
          resolution !==
            "lesson_credit" &&
          resolution !==
            "counted_as_completed"
        ) {
          return NextResponse.json(
            {
              error:
                "Unexpected circumstance requires a resolution.",
            },
            {
              status: 400,
            }
          );
        }

        if (
          resolution ===
            "rescheduled" &&
          !lessonDate
        ) {
          return NextResponse.json(
            {
              error:
                "A new lesson date is required when rescheduling.",
            },
            {
              status: 400,
            }
          );
        }

        consumesLesson =
          resolution ===
          "counted_as_completed";
      }

      if (
        attendanceStatus ===
        "teacher_cancelled"
      ) {
        if (
          resolution !==
            "rescheduled" &&
          resolution !==
            "lesson_credit"
        ) {
          return NextResponse.json(
            {
              error:
                "Teacher cancellation requires either rescheduling or lesson credit.",
            },
            {
              status: 400,
            }
          );
        }

        if (
          resolution ===
            "rescheduled" &&
          !lessonDate
        ) {
          return NextResponse.json(
            {
              error:
                "A new lesson date is required when rescheduling.",
            },
            {
              status: 400,
            }
          );
        }

        consumesLesson =
          false;
      }

      const originalLessonDate =
        lesson
          .original_lesson_date ??
        lesson.lesson_date;

      const isPayableOutcome =
        attendanceStatus ===
          "completed" ||
        attendanceStatus ===
          "no_show" ||
        attendanceStatus ===
          "late_cancellation";

      const updateData: {
        attendance_status:
          AttendanceStatus;

        consumes_lesson:
          boolean;

        resolution:
          Resolution | null;

        actual_teacher_id:
          string | null;

        notes?:
          string | null;

        original_lesson_date:
          string | null;

        lesson_date:
          string;

        rescheduled_at:
          string | null;
      } = {
        attendance_status:
          attendanceStatus,

        consumes_lesson:
          consumesLesson,

        resolution,

        actual_teacher_id:
          isPayableOutcome
            ? user.id
            : null,

        original_lesson_date:
          originalLessonDate,

        lesson_date:
          lesson.lesson_date,

        rescheduled_at:
          lesson.rescheduled_at,
      };

      /*
       * Attendance notes are written to the existing lesson
       * notes column only when attendance notes were actually
       * provided.
       *
       * Leaving the attendance notes field empty will therefore
       * not accidentally erase existing Lesson Notes.
       */

      if (
        attendanceNotes !==
        null
      ) {
        updateData.notes =
          attendanceNotes;
      }

      if (
        resolution ===
        "rescheduled"
      ) {
        updateData.lesson_date =
          lessonDate!;

        updateData.rescheduled_at =
          new Date().toISOString();
      }

      const {
        data:
          updatedLesson,
        error:
          updateError,
      } = await admin
        .from("lessons")
        .update(
          updateData
        )
        .eq(
          "id",
          lessonId
        )
        .select(`
          id,
          enrollment_id,
          student_id,
          lesson_number,
          lesson_date,
          original_lesson_date,
          rescheduled_at,
          schedule_time,
          duration,
          attendance_status,
          resolution,
          notes,
          teacher_observation,
          consumes_lesson,
          actual_teacher_id,
          substitute_teacher_id,
          platform,
          class_link,
          material,
          lesson_page,
          class_instructions,
          class_info_updated_at
        `)
        .single();

      if (
        updateError
      ) {
        return NextResponse.json(
          {
            error:
              updateError.message,
          },
          {
            status: 500,
          }
        );
      }

      /*
       * -------------------------------------------------------
       * AUTOMATIC LESSON-CREDIT ROLLOVER
       * -------------------------------------------------------
       *
       * Keep the credited lesson as history and append one new
       * scheduled lesson after the package's current last date.
       * Explicit rescheduling keeps its existing behavior.
       */
      let rolloverLesson = null;

      if (
        resolution ===
          "lesson_credit" &&
        consumesLesson ===
          false
      ) {
        try {
          rolloverLesson =
            await createAutomaticRolloverLesson(
              admin,
              {
                id:
                  lesson.id,

                enrollment_id:
                  lesson.enrollment_id,

                student_id:
                  lesson.student_id,

                lesson_date:
                  lesson.lesson_date,

                schedule_time:
                  lesson.schedule_time,

                duration:
                  Number(
                    lesson.duration
                  ),
              }
            );
        } catch (
          rolloverError
        ) {
          console.error(
            "AUTOMATIC ROLLOVER ERROR:",
            rolloverError
          );

          return NextResponse.json(
            {
              error:
                "The lesson credit was saved, but the automatic rollover lesson could not be created.",

              credit_saved:
                true,

              details:
                rolloverError instanceof Error
                  ? rolloverError.message
                  : "Unknown rollover error.",
            },
            {
              status: 500,
            }
          );
        }
      }

      return NextResponse.json({
        message:
          rolloverLesson
            ? "Lesson attendance updated and the lesson credit was rolled forward automatically."
            : "Lesson attendance updated successfully.",

        lesson:
          updatedLesson,

        rollover_lesson:
          rolloverLesson,
      });
    }

    /*
     * ---------------------------------------------------------
     * LESSON NOTES UPDATE
     * ---------------------------------------------------------
     */

    if (
      hasNotes
    ) {
      if (
        body.notes !==
          null &&
        typeof body.notes !==
          "string"
      ) {
        return NextResponse.json(
          {
            error:
              "Lesson notes must be text or null.",
          },
          {
            status: 400,
          }
        );
      }

      const cleanedNotes =
        body.notes?.trim() ||
        null;

      const {
        data:
          updatedLesson,
        error:
          updateError,
      } = await admin
        .from("lessons")
        .update({
          notes:
            cleanedNotes,
        })
        .eq(
          "id",
          lessonId
        )
        .select(`
          id,
          enrollment_id,
          student_id,
          lesson_number,
          lesson_date,
          original_lesson_date,
          rescheduled_at,
          schedule_time,
          duration,
          attendance_status,
          resolution,
          notes,
          teacher_observation,
          consumes_lesson,
          actual_teacher_id,
          substitute_teacher_id,
          platform,
          class_link,
          material,
          lesson_page,
          class_instructions,
          class_info_updated_at
        `)
        .single();

      if (
        updateError
      ) {
        return NextResponse.json(
          {
            error:
              updateError.message,
          },
          {
            status: 500,
          }
        );
      }

      return NextResponse.json({
        message:
          "Lesson notes saved successfully.",

        lesson:
          updatedLesson,
      });
    }

    /*
     * ---------------------------------------------------------
     * TEACHER OBSERVATION UPDATE
     * ---------------------------------------------------------
     */

    if (
      hasTeacherObservation
    ) {
      if (
        body.teacher_observation !==
          null &&
        typeof body.teacher_observation !==
          "string"
      ) {
        return NextResponse.json(
          {
            error:
              "Teacher observation must be text or null.",
          },
          {
            status: 400,
          }
        );
      }

      const cleanedObservation =
        body.teacher_observation
          ?.trim() ||
        null;

      const {
        data:
          updatedLesson,
        error:
          updateError,
      } = await admin
        .from("lessons")
        .update({
          teacher_observation:
            cleanedObservation,
        })
        .eq(
          "id",
          lessonId
        )
        .select(`
          id,
          enrollment_id,
          student_id,
          lesson_number,
          lesson_date,
          original_lesson_date,
          rescheduled_at,
          schedule_time,
          duration,
          attendance_status,
          resolution,
          notes,
          teacher_observation,
          consumes_lesson,
          actual_teacher_id,
          substitute_teacher_id,
          platform,
          class_link,
          material,
          lesson_page,
          class_instructions,
          class_info_updated_at
        `)
        .single();

      if (
        updateError
      ) {
        return NextResponse.json(
          {
            error:
              updateError.message,
          },
          {
            status: 500,
          }
        );
      }

      return NextResponse.json({
        message:
          "Teacher observation saved successfully.",

        lesson:
          updatedLesson,
      });
    }

    /*
     * ---------------------------------------------------------
     * CLASS INFO UPDATE
     * ---------------------------------------------------------
     */

    if (
      hasClassInfo
    ) {
      if (
        (
          body.platform !==
            undefined &&
          body.platform !==
            null &&
          typeof body.platform !==
            "string"
        ) ||
        (
          body.class_link !==
            undefined &&
          body.class_link !==
            null &&
          typeof body.class_link !==
            "string"
        ) ||
        (
          body.material !==
            undefined &&
          body.material !==
            null &&
          typeof body.material !==
            "string"
        ) ||
        (
          body.lesson_page !==
            undefined &&
          body.lesson_page !==
            null &&
          typeof body.lesson_page !==
            "string"
        ) ||
        (
          body.class_instructions !==
            undefined &&
          body.class_instructions !==
            null &&
          typeof body.class_instructions !==
            "string"
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Class information must be text or null.",
          },
          {
            status: 400,
          }
        );
      }

      const cleanedPlatform =
        body.platform?.trim() ||
        null;

      const cleanedClassLink =
        body.class_link?.trim() ||
        null;

      const cleanedMaterial =
        body.material?.trim() ||
        null;

      const cleanedLessonPage =
        body.lesson_page?.trim() ||
        null;

      const cleanedClassInstructions =
        body.class_instructions
          ?.trim() ||
        null;

      const {
        data:
          updatedLesson,
        error:
          updateError,
      } = await admin
        .from("lessons")
        .update({
          platform:
            cleanedPlatform,

          class_link:
            cleanedClassLink,

          material:
            cleanedMaterial,

          lesson_page:
            cleanedLessonPage,

          class_instructions:
            cleanedClassInstructions,

          class_info_updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          lessonId
        )
        .select(`
          id,
          enrollment_id,
          student_id,
          lesson_number,
          lesson_date,
          original_lesson_date,
          rescheduled_at,
          schedule_time,
          duration,
          attendance_status,
          resolution,
          notes,
          teacher_observation,
          consumes_lesson,
          actual_teacher_id,
          substitute_teacher_id,
          platform,
          class_link,
          material,
          lesson_page,
          class_instructions,
          class_info_updated_at
        `)
        .single();

      if (
        updateError
      ) {
        return NextResponse.json(
          {
            error:
              updateError.message,
          },
          {
            status: 500,
          }
        );
      }

      return NextResponse.json({
        message:
          "Class information saved successfully.",

        lesson:
          updatedLesson,
      });
    }

    return NextResponse.json(
      {
        error:
          "Nothing was updated.",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "Teacher lesson update error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while updating the lesson.",
      },
      {
        status: 500,
      }
    );
  }
}