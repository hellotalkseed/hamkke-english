import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const VALID_ATTENDANCE_STATUSES = [
  "scheduled",
  "completed",
  "student_cancelled_credit",
  "teacher_cancelled",
  "unexpected_circumstance",
] as const;

type AttendanceStatus =
  (typeof VALID_ATTENDANCE_STATUSES)[number];

interface RouteContext {
  params: Promise<{
    lessonId: string;
  }>;
}

interface LessonRecord {
  id: string;
  enrollment_id: string;
  lesson_number: number;
  lesson_date: string;
  schedule_time: string | null;
  duration: number;
  attendance_status: string;
  notes: string | null;
  teacher_observation: string | null;
  consumes_lesson: boolean;
  actual_teacher_id: string | null;
  substitute_teacher_id: string | null;
  platform: string | null;
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

    const utcTimestamp = Date.UTC(
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

function timeToMinutes(
  time: string
) {
  const [hours, minutes] =
    time.slice(0, 5)
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
    dateString.split("-").map(Number);

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
    getDayOfWeek(lessonDate);

  if (
    availability.day_of_week !==
    lessonDay
  ) {
    return false;
  }

  const lessonStart =
    timeToMinutes(lessonTime);

  const lessonEnd =
    lessonStart + duration;

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
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null,
      admin: null,
      error: NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
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
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile
  ) {
    return {
      user,
      profile: null,
      admin,
      error: NextResponse.json(
        { error: "Profile not found." },
        { status: 403 }
      ),
    };
  }

  if (
    profile.status &&
    profile.status !== "active"
  ) {
    return {
      user,
      profile,
      admin,
      error: NextResponse.json(
        { error: "Your account is not active." },
        { status: 403 }
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
  const {
    data: lesson,
    error: lessonError,
  } = await admin
    .from("lessons")
    .select(`
      id,
      enrollment_id,
      lesson_number,
      lesson_date,
      schedule_time,
      duration,
      attendance_status,
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
    .eq("id", lessonId)
    .single();

  if (
    lessonError ||
    !lesson
  ) {
    return {
      lesson: null,
      enrollmentStudent: null,
      error: NextResponse.json(
        { error: "Lesson not found." },
        { status: 404 }
      ),
    };
  }

  const {
    data: enrollmentStudents,
    error: enrollmentStudentsError,
  } = await admin
    .from("enrollment_students")
    .select(`
      id,
      enrollment_id,
      student_id
    `)
    .eq(
      "enrollment_id",
      lesson.enrollment_id
    );

  if (enrollmentStudentsError) {
    return {
      lesson: null,
      enrollmentStudent: null,
      error: NextResponse.json(
        {
          error:
            enrollmentStudentsError.message,
        },
        { status: 500 }
      ),
    };
  }

  const enrollmentStudent =
  (enrollmentStudents || [])[0];

  if (!enrollmentStudent) {
    return {
      lesson: null,
      enrollmentStudent: null,
      error: NextResponse.json(
        {
          error:
            "The student connected to this lesson could not be found.",
        },
        { status: 403 }
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
  enrollmentStudent: EnrollmentStudentRecord
) {
  /*
   * ---------------------------------------------------------
   * SUBSTITUTE ACCESS
   * ---------------------------------------------------------
   */

  if (
    lesson.substitute_teacher_id ===
    teacherId
  ) {
    return true;
  }

  /*
   * ---------------------------------------------------------
   * REGULAR TEACHER ACCESS
   * ---------------------------------------------------------
   */

  const {
    data: assignment,
    error,
  } = await admin
    .from("teacher_assignments")
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

  return Boolean(assignment);
}

async function getSubstituteTeachers(
  admin: ReturnType<
    typeof createAdminClient
  >,
  lesson: LessonRecord,
  studentTimezone: string | null
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
      { ascending: true }
    );

  if (teachersError) {
    throw new Error(
      teachersError.message
    );
  }

  if (!teachers || teachers.length === 0) {
    return [];
  }

  const teacherIds =
    teachers.map(
      (teacher) => teacher.id
    );

  const {
    data: availability,
    error: availabilityError,
  } = await admin
    .from("teacher_availability")
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

  if (availabilityError) {
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
    getDayOfWeek(phtDate);

  return (
    teachers as TeacherProfile[]
  ).map((teacher) => {
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
      id: teacher.id,
      full_name:
        teacher.full_name,
      teacher_number:
        teacher.teacher_number,
      available,
    };
  });
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const auth =
      await getCurrentUser();

    if (auth.error) {
      return auth.error;
    }

    const {
      user,
      profile,
      admin,
    } = auth;

    if (!user || !profile || !admin) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { lessonId } =
      await context.params;

    const {
      lesson,
      enrollmentStudent,
      error,
    } = await getLesson(
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
        { error: "Lesson not found." },
        { status: 404 }
      );
    }

    const isOwnerOrAdmin =
      profile.role === "owner" ||
      profile.role === "admin";

    if (!isOwnerOrAdmin) {
      if (
        profile.role !== "teacher"
      ) {
        return NextResponse.json(
          {
            error:
              "You are not authorized to access this lesson.",
          },
          { status: 403 }
        );
      }

      const allowed =
        await teacherCanAccessLesson(
          admin,
          user.id,
          lesson,
          enrollmentStudent
        );

      if (!allowed) {
        return NextResponse.json(
          {
            error:
              "You are not assigned to this lesson.",
          },
          { status: 403 }
        );
      }
    }

    const {
      data: student,
      error: studentError,
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
        { status: 500 }
      );
    }

    const {
      data: enrollment,
      error: enrollmentError,
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
        { status: 500 }
      );
    }

    const substituteTeacher =
      lesson.substitute_teacher_id
        ? (
            (
              await admin
                .from("profiles")
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

    let substituteTeachers:
      Array<{
        id: string;
        full_name: string | null;
        teacher_number: string | null;
        available: boolean;
      }> = [];

    if (isOwnerOrAdmin) {
      substituteTeachers =
        await getSubstituteTeachers(
          admin,
          lesson,
          student.timezone
        );
    }

    return NextResponse.json({
      viewer: {
        id: profile.id,
        full_name: profile.full_name,
        role: profile.role,
      },

      teacher: {
        id: profile.id,
        full_name: profile.full_name,
      },

      lesson: {
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
        duration:
          lesson.duration,
        attendance_status:
          lesson.attendance_status,
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
          lesson.platform,
        material:
          lesson.material,
        lesson_page:
          lesson.lesson_page,
        class_instructions:
          lesson.class_instructions,
        class_info_updated_at:
          lesson.class_info_updated_at,
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
      { status: 500 }
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

    if (auth.error) {
      return auth.error;
    }

    const {
      user,
      profile,
      admin,
    } = auth;

    if (!user || !profile || !admin) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const { lessonId } =
      await context.params;

    const {
      lesson,
      enrollmentStudent,
      error,
    } = await getLesson(
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
        { error: "Lesson not found." },
        { status: 404 }
      );
    }

    const isOwnerOrAdmin =
      profile.role === "owner" ||
      profile.role === "admin";

    /*
     * ---------------------------------------------------------
     * PARSE REQUEST
     * ---------------------------------------------------------
     */

    let body: {
      attendance_status?: string;
      notes?: string | null;
      teacher_observation?: string | null;
      platform?: string | null;
      material?: string | null;
      lesson_page?: string | null;
      class_instructions?: string | null;
      substitute_teacher_id?: string | null;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const hasSubstituteTeacher =
      Object.prototype.hasOwnProperty.call(
        body,
        "substitute_teacher_id"
      );

    /*
     * ---------------------------------------------------------
     * SUBSTITUTE ASSIGNMENT
     *
     * ONLY OWNER / ADMIN
     * ---------------------------------------------------------
     */

    if (hasSubstituteTeacher) {
      if (!isOwnerOrAdmin) {
        return NextResponse.json(
          {
            error:
              "Only the Owner or Admin can assign a substitute teacher.",
          },
          { status: 403 }
        );
      }

      const substituteTeacherId =
        body.substitute_teacher_id;

      /*
       * REMOVE SUBSTITUTE
       */

      if (
        substituteTeacherId === null ||
        substituteTeacherId === ""
      ) {
        const {
          data: updatedLesson,
          error: updateError,
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
            lesson_number,
            lesson_date,
            duration,
            attendance_status,
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

        if (updateError) {
          return NextResponse.json(
            {
              error:
                updateError.message,
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          message:
            "Substitute teacher removed successfully.",
          lesson: updatedLesson,
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
          { status: 400 }
        );
      }

      /*
       * VERIFY ACTIVE TEACHER
       */

      const {
        data: substituteTeacher,
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
          { status: 500 }
        );
      }

      if (!substituteTeacher) {
        return NextResponse.json(
          {
            error:
              "The selected substitute teacher is not active.",
          },
          { status: 400 }
        );
      }

      /*
       * LOAD STUDENT TIMEZONE
       */

      const {
        data: student,
        error: studentError,
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
          { status: 500 }
        );
      }

      /*
       * CONVERT THE ORIGINAL STUDENT SCHEDULE
       * TO PHILIPPINE TIME.
       *
       * The student's schedule remains authoritative.
       */

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
          { status: 400 }
        );
      }

      const {
        data: availability,
        error:
          availabilityError,
      } = await admin
        .from("teacher_availability")
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

      if (availabilityError) {
        return NextResponse.json(
          {
            error:
              availabilityError.message,
          },
          { status: 500 }
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

      if (!fits) {
        return NextResponse.json(
          {
            error:
              "The selected teacher is not available for this lesson in Philippine Time.",
          },
          { status: 400 }
        );
      }

      /*
       * SAVE SUBSTITUTE
       */

      const {
        data: updatedLesson,
        error: updateError,
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
          lesson_number,
          lesson_date,
          duration,
          attendance_status,
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

      if (updateError) {
        return NextResponse.json(
          {
            error:
              updateError.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message:
          "Substitute teacher assigned successfully.",
        lesson: updatedLesson,
        substitute_teacher:
          substituteTeacher,
      });
    }

    /*
     * ---------------------------------------------------------
     * TEACHER LESSON ACCESS
     * ---------------------------------------------------------
     */

    if (!isOwnerOrAdmin) {
      if (
        profile.role !== "teacher"
      ) {
        return NextResponse.json(
          {
            error:
              "You are not authorized to update this lesson.",
          },
          { status: 403 }
        );
      }

      const allowed =
        await teacherCanAccessLesson(
          admin,
          user.id,
          lesson,
          enrollmentStudent
        );

      if (!allowed) {
        return NextResponse.json(
          {
            error:
              "You are not assigned to this lesson.",
          },
          { status: 403 }
        );
      }
    }

    const hasAttendanceStatus =
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
      !hasAttendanceStatus &&
      !hasNotes &&
      !hasTeacherObservation &&
      !hasClassInfo
    ) {
      return NextResponse.json(
        {
          error:
            "No lesson information was provided.",
        },
        { status: 400 }
      );
    }

    /*
     * --------------------------------
     * ATTENDANCE UPDATE
     * --------------------------------
     */

    if (hasAttendanceStatus) {
      const attendanceStatus =
        body.attendance_status;

      if (
        typeof attendanceStatus !==
          "string" ||
        !VALID_ATTENDANCE_STATUSES.includes(
          attendanceStatus as AttendanceStatus
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid attendance status.",
            allowed_statuses:
              VALID_ATTENDANCE_STATUSES,
          },
          { status: 400 }
        );
      }

      const {
        data: updatedLesson,
        error: updateError,
      } = await admin
        .from("lessons")
        .update({
          attendance_status:
            attendanceStatus,

          actual_teacher_id:
            attendanceStatus ===
            "completed"
              ? user.id
              : lesson.actual_teacher_id,
        })
        .eq(
          "id",
          lessonId
        )
        .select(`
          id,
          enrollment_id,
          lesson_number,
          lesson_date,
          duration,
          attendance_status,
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

      if (updateError) {
        return NextResponse.json(
          {
            error:
              updateError.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message:
          "Lesson attendance updated successfully.",
        lesson: updatedLesson,
      });
    }

    /*
     * --------------------------------
     * LESSON NOTES UPDATE
     * --------------------------------
     */

    if (hasNotes) {
      if (
        body.notes !== null &&
        typeof body.notes !== "string"
      ) {
        return NextResponse.json(
          {
            error:
              "Lesson notes must be text or null.",
          },
          { status: 400 }
        );
      }

      const cleanedNotes =
        body.notes?.trim() || null;

      const {
        data: updatedLesson,
        error: updateError,
      } = await admin
        .from("lessons")
        .update({
          notes: cleanedNotes,
        })
        .eq(
          "id",
          lessonId
        )
        .select(`
          id,
          enrollment_id,
          lesson_number,
          lesson_date,
          duration,
          attendance_status,
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

      if (updateError) {
        return NextResponse.json(
          {
            error:
              updateError.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message:
          "Lesson notes saved successfully.",
        lesson: updatedLesson,
      });
    }

    /*
     * --------------------------------
     * TEACHER OBSERVATION UPDATE
     * --------------------------------
     */

    if (hasTeacherObservation) {
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
          { status: 400 }
        );
      }

      const cleanedObservation =
        body.teacher_observation?.trim() ||
        null;

      const {
        data: updatedLesson,
        error: updateError,
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
          lesson_number,
          lesson_date,
          duration,
          attendance_status,
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

      if (updateError) {
        return NextResponse.json(
          {
            error:
              updateError.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message:
          "Teacher observation saved successfully.",
        lesson: updatedLesson,
      });
    }

    /*
     * --------------------------------
     * CLASS INFO UPDATE
     * --------------------------------
     */

    if (hasClassInfo) {
      if (
        (body.platform !== undefined &&
          body.platform !== null &&
          typeof body.platform !== "string") ||
        (body.material !== undefined &&
          body.material !== null &&
          typeof body.material !== "string") ||
        (body.lesson_page !== undefined &&
          body.lesson_page !== null &&
          typeof body.lesson_page !== "string") ||
        (body.class_instructions !== undefined &&
          body.class_instructions !== null &&
          typeof body.class_instructions !== "string")
      ) {
        return NextResponse.json(
          {
            error:
              "Class information must be text or null.",
          },
          { status: 400 }
        );
      }

      const cleanedPlatform =
        body.platform?.trim() || null;

      const cleanedMaterial =
        body.material?.trim() || null;

      const cleanedLessonPage =
        body.lesson_page?.trim() || null;

      const cleanedClassInstructions =
        body.class_instructions?.trim() ||
        null;

      const {
        data: updatedLesson,
        error: updateError,
      } = await admin
        .from("lessons")
        .update({
          platform:
            cleanedPlatform,
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
          lesson_number,
          lesson_date,
          duration,
          attendance_status,
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

      if (updateError) {
        return NextResponse.json(
          {
            error:
              updateError.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message:
          "Class information saved successfully.",
        lesson: updatedLesson,
      });
    }

    return NextResponse.json(
      {
        error:
          "Nothing was updated.",
      },
      { status: 400 }
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
      { status: 500 }
    );
  }
}