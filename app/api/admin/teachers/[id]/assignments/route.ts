import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ScheduleRow = {
  enrollment_id: string;
  student_id: string;
  day_of_week: number;
  schedule_time: string;
};

type ScheduleItem = {
  day_of_week: number;
  schedule_time: string;
};

type AvailabilityBlock = {
  day_of_week: number;
  start_time: string;
  end_time: string;
};

/* ========================================================================= */
/* AUTHENTICATION                                                            */
/* ========================================================================= */

async function getActiveOwner() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      error: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .single();

  if (
    profileError ||
    !profile ||
    profile.role !== "owner" ||
    profile.status !== "active"
  ) {
    return {
      supabase,
      error: NextResponse.json(
        {
          error:
            "Only active owners can manage teacher assignments.",
        },
        { status: 403 }
      ),
    };
  }

  return {
    supabase,
    error: null,
  };
}

/* ========================================================================= */
/* TIME HELPERS                                                              */
/* ========================================================================= */

function normalizeTime(
  time: string | null | undefined
) {
  if (!time) return "";

  return time.slice(0, 5);
}

function timeToMinutes(time: string) {
  const [hours, minutes] =
    normalizeTime(time)
      .split(":")
      .map(Number);

  return hours * 60 + minutes;
}

/*
 * Returns true when a lesson from startTime through the complete
 * duration fits inside at least one teacher availability block.
 */
function lessonFitsAvailability(
  dayOfWeek: number,
  startTime: string,
  durationMinutes: number,
  availability: AvailabilityBlock[]
) {
  const start = timeToMinutes(startTime);
  const end = start + durationMinutes;

  return availability.some((block) => {
    if (block.day_of_week !== dayOfWeek) {
      return false;
    }

    const blockStart =
      timeToMinutes(block.start_time);

    const blockEnd =
      timeToMinutes(block.end_time);

    return (
      start >= blockStart &&
      end <= blockEnd
    );
  });
}

/*
 * Convert a student's local recurring weekday/time into PHT.
 *
 * The student's stored schedule remains unchanged.
 * This function creates a PHT representation only for:
 *
 * - teacher assignment validation
 * - teacher calendar display
 *
 * PHT = Asia/Manila
 */
function convertScheduleToPHT(
  dayOfWeek: number,
  scheduleTime: string,
  studentTimezone: string
) {
  const now = new Date();

  const weekdayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const targetWeekday =
    weekdayNames[dayOfWeek];

  let candidate = new Date(now);

  /*
   * Find an upcoming date that is the requested weekday
   * in the student's timezone.
   */
  for (let i = 0; i < 7; i++) {
    const weekday = new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone: studentTimezone,
        weekday: "long",
      }
    ).format(candidate);

    if (weekday === targetWeekday) {
      break;
    }

    candidate = new Date(
      candidate.getTime() +
        24 * 60 * 60 * 1000
    );
  }

  const [hour, minute] =
    normalizeTime(scheduleTime)
      .split(":")
      .map(Number);

  /*
   * Get the calendar date of the selected weekday
   * in the student's timezone.
   */
  const localParts = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: studentTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).formatToParts(candidate);

  const year = Number(
    localParts.find(
      (part) => part.type === "year"
    )?.value
  );

  const month = Number(
    localParts.find(
      (part) => part.type === "month"
    )?.value
  );

  const day = Number(
    localParts.find(
      (part) => part.type === "day"
    )?.value
  );

  /*
   * Start with the student's local date/time as if it were UTC.
   * We then determine the actual timezone offset and correct it.
   */
  let utcMillis = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute
  );

  for (let i = 0; i < 2; i++) {
    const parts =
      new Intl.DateTimeFormat(
        "en-US",
        {
          timeZone: studentTimezone,
          timeZoneName: "longOffset",
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        }
      ).formatToParts(
        new Date(utcMillis)
      );

    const offset =
      parts.find(
        (part) =>
          part.type ===
          "timeZoneName"
      )?.value || "GMT";

    const match =
      offset.match(
        /GMT([+-])(\d{2}):?(\d{2})?/
      );

    if (!match) {
      break;
    }

    const sign =
      match[1] === "+" ? 1 : -1;

    const offsetHours =
      Number(match[2]);

    const offsetMinutes =
      Number(match[3] || 0);

    const totalOffset =
      sign *
      (offsetHours * 60 +
        offsetMinutes);

    utcMillis =
      Date.UTC(
        year,
        month - 1,
        day,
        hour,
        minute
      ) -
      totalOffset * 60 * 1000;
  }

  /*
   * Convert the actual moment into PHT.
   */
  const phtDate =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone: "Asia/Manila",
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }
    ).formatToParts(
      new Date(utcMillis)
    );

  const phtWeekday =
    phtDate.find(
      (part) =>
        part.type === "weekday"
    )?.value;

  const phtHour =
    Number(
      phtDate.find(
        (part) =>
          part.type === "hour"
      )?.value
    );

  const phtMinute =
    Number(
      phtDate.find(
        (part) =>
          part.type === "minute"
      )?.value
    );

  const phtDay =
    weekdayNames.findIndex(
      (day) => day === phtWeekday
    );

  return {
    dayOfWeek: phtDay,
    time: `${String(
      phtHour
    ).padStart(2, "0")}:${String(
      phtMinute
    ).padStart(2, "0")}`,
  };
}

/* ========================================================================= */
/* GET                                                                       */
/* Load active assignments with both actual student schedules and PHT       */
/* converted schedules.                                                      */
/* ========================================================================= */

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const ownerResult =
      await getActiveOwner();

    if (ownerResult.error) {
      return ownerResult.error;
    }

    const { supabase } =
      ownerResult;

    const { id: teacherId } =
      await context.params;

    if (!teacherId) {
      return NextResponse.json(
        {
          error:
            "Teacher ID is required.",
        },
        { status: 400 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* VERIFY TEACHER                                                        */
    /* --------------------------------------------------------------------- */

    const {
      data: teacher,
      error: teacherError,
    } = await supabase
      .from("profiles")
      .select(
        "id, full_name, role, status, teacher_number, created_at"
      )
      .eq("id", teacherId)
      .eq("role", "teacher")
      .single();

    if (teacherError || !teacher) {
      return NextResponse.json(
        {
          error:
            "Teacher could not be found.",
        },
        { status: 404 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* ACTIVE ASSIGNMENTS                                                    */
    /* --------------------------------------------------------------------- */

    const {
      data: assignments,
      error: assignmentsError,
    } = await supabase
      .from("teacher_assignments")
      .select(
        `
          id,
          enrollment_student_id,
          teacher_id,
          start_date,
          end_date,
          status,
          created_at
        `
      )
      .eq("teacher_id", teacherId)
      .eq("status", "active")
      .order("created_at", {
        ascending: true,
      });

    if (assignmentsError) {
      return NextResponse.json(
        {
          error:
            assignmentsError.message,
        },
        { status: 500 }
      );
    }

    const enrollmentStudentIds =
      (assignments || []).map(
        (assignment) =>
          assignment.enrollment_student_id
      );

    if (
      enrollmentStudentIds.length === 0
    ) {
      return NextResponse.json({
        teacher: {
          id: teacher.id,
          full_name: teacher.full_name,
          role: teacher.role,
          status: teacher.status,
          teacher_number:
            teacher.teacher_number,
          created_at:
            teacher.created_at,
        },
        assignments: [],
      });
    }

    /* --------------------------------------------------------------------- */
    /* ENROLLMENT STUDENTS                                                   */
    /* --------------------------------------------------------------------- */

    const {
      data: enrollmentStudents,
      error: enrollmentStudentsError,
    } = await supabase
      .from("enrollment_students")
      .select(
        `
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
            status,
            lesson_duration
          )
        `
      )
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

    /* --------------------------------------------------------------------- */
    /* EXACT RECURRING SCHEDULES                                             */
    /* --------------------------------------------------------------------- */

    const enrollmentIds = [
      ...new Set(
        (enrollmentStudents || []).map(
          (item) => item.enrollment_id
        )
      ),
    ];

    const studentIds = [
      ...new Set(
        (enrollmentStudents || []).map(
          (item) => item.student_id
        )
      ),
    ];

    let schedules:
      ScheduleRow[] = [];

    if (
      enrollmentIds.length > 0 &&
      studentIds.length > 0
    ) {
      const {
        data: scheduleRows,
        error: schedulesError,
      } = await supabase
        .from("enrollment_schedules")
        .select(
          `
            enrollment_id,
            student_id,
            day_of_week,
            schedule_time
          `
        )
        .in(
          "enrollment_id",
          enrollmentIds
        )
        .in(
          "student_id",
          studentIds
        )
        .order("day_of_week", {
          ascending: true,
        })
        .order("schedule_time", {
          ascending: true,
        });

      if (schedulesError) {
        return NextResponse.json(
          {
            error:
              schedulesError.message,
          },
          { status: 500 }
        );
      }

      schedules =
        scheduleRows || [];
    }

    /* --------------------------------------------------------------------- */
    /* FORMAT ASSIGNMENTS                                                    */
    /* --------------------------------------------------------------------- */

    const formattedAssignments =
      (assignments || []).map(
        (assignment) => {
          const enrollmentStudent =
            enrollmentStudents?.find(
              (item) =>
                item.id ===
                assignment.enrollment_student_id
            );

          const student =
            Array.isArray(
              enrollmentStudent?.students
            )
              ? enrollmentStudent.students[0]
              : enrollmentStudent?.students;

          const enrollment =
            Array.isArray(
              enrollmentStudent?.enrollments
            )
              ? enrollmentStudent.enrollments[0]
              : enrollmentStudent?.enrollments;

          /*
           * The student's original recurring schedule.
           * This remains in the student's own timezone.
           */
          const studentSchedules =
            schedules
              .filter(
                (schedule) =>
                  schedule.enrollment_id ===
                    enrollmentStudent?.enrollment_id &&
                  schedule.student_id ===
                    enrollmentStudent?.student_id
              )
              .map(
                (schedule): ScheduleItem => ({
                  day_of_week:
                    schedule.day_of_week,
                  schedule_time:
                    schedule.schedule_time,
                })
              );

          /*
           * Convert each student's recurring schedule
           * into Philippine Time for the teacher calendar.
           */
          const phtSchedules =
            studentSchedules.map(
              (schedule): ScheduleItem => {
                if (!student?.timezone) {
                  return {
                    day_of_week:
                      schedule.day_of_week,
                    schedule_time:
                      schedule.schedule_time,
                  };
                }

                const converted =
                  convertScheduleToPHT(
                    schedule.day_of_week,
                    schedule.schedule_time,
                    student.timezone
                  );

                return {
                  day_of_week:
                    converted.dayOfWeek,
                  schedule_time:
                    converted.time,
                };
              }
            );

          return {
            id: assignment.id,

            enrollment_student_id:
              assignment.enrollment_student_id,

            teacher_id:
              assignment.teacher_id,

            start_date:
              assignment.start_date,

            end_date:
              assignment.end_date,

            status:
              assignment.status,

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
                  lesson_duration:
                    enrollment.lesson_duration,
                }
              : null,

            /*
             * Actual schedule in the student's timezone.
             */
            schedules:
              studentSchedules,

            /*
             * Converted schedule in Philippine Time.
             * Used by the teacher assignment calendar.
             */
            pht_schedules:
              phtSchedules,
          };
        }
      );

    return NextResponse.json({
      teacher: {
        id: teacher.id,
        full_name: teacher.full_name,
        role: teacher.role,
        status: teacher.status,
        teacher_number:
          teacher.teacher_number,
        created_at:
          teacher.created_at,
      },

      assignments:
        formattedAssignments,
    });
  } catch (error) {
    console.error(
      "Teacher assignments GET error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while loading teacher assignments.",
      },
      { status: 500 }
    );
  }
}

/* ========================================================================= */
/* POST                                                                      */
/* Assign an enrollment/student to this teacher.                            */
/* ========================================================================= */

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const ownerResult =
      await getActiveOwner();

    if (ownerResult.error) {
      return ownerResult.error;
    }

    const { supabase } =
      ownerResult;

    const { id: teacherId } =
      await context.params;

    if (!teacherId) {
      return NextResponse.json(
        {
          error:
            "Teacher ID is required.",
        },
        { status: 400 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* VERIFY TEACHER                                                        */
    /* --------------------------------------------------------------------- */

    const {
      data: teacher,
      error: teacherError,
    } = await supabase
      .from("profiles")
      .select(
        "id, role, status"
      )
      .eq("id", teacherId)
      .single();

    if (
      teacherError ||
      !teacher ||
      teacher.role !== "teacher"
    ) {
      return NextResponse.json(
        {
          error:
            "Teacher could not be found.",
        },
        { status: 404 }
      );
    }

    if (
      teacher.status !== "active"
    ) {
      return NextResponse.json(
        {
          error:
            "This teacher is inactive.",
        },
        { status: 400 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* READ SELECTED ENROLLMENT/STUDENT                                      */
    /* --------------------------------------------------------------------- */

    const body =
      await request.json();

    const enrollmentStudentId =
      String(
        body.enrollmentStudentId ||
          ""
      ).trim();

    if (!enrollmentStudentId) {
      return NextResponse.json(
        {
          error:
            "Enrollment student ID is required.",
        },
        { status: 400 }
      );
    }

    const {
      data: enrollmentStudent,
      error:
        enrollmentStudentError,
    } = await supabase
      .from("enrollment_students")
      .select(
        `
          id,
          enrollment_id,
          student_id,
          enrollments (
            id,
            package_name,
            status,
            lesson_duration
          ),
          students (
            id,
            student_number,
            full_name,
            preferred_name,
            timezone
          )
        `
      )
      .eq(
        "id",
        enrollmentStudentId
      )
      .single();

    if (
      enrollmentStudentError ||
      !enrollmentStudent
    ) {
      return NextResponse.json(
        {
          error:
            "The selected student enrollment could not be found.",
        },
        { status: 404 }
      );
    }

    const enrollment =
      Array.isArray(
        enrollmentStudent.enrollments
      )
        ? enrollmentStudent.enrollments[0]
        : enrollmentStudent.enrollments;

    const student =
      Array.isArray(
        enrollmentStudent.students
      )
        ? enrollmentStudent.students[0]
        : enrollmentStudent.students;

    if (!enrollment) {
      return NextResponse.json(
        {
          error:
            "The selected enrollment could not be found.",
        },
        { status: 404 }
      );
    }

    if (
      enrollment.status !==
      "active"
    ) {
      return NextResponse.json(
        {
          error:
            "Only active enrollments can be assigned to a teacher.",
        },
        { status: 400 }
      );
    }

    if (!student) {
      return NextResponse.json(
        {
          error:
            "The selected student could not be found.",
        },
        { status: 404 }
      );
    }

    if (!student.timezone) {
      return NextResponse.json(
        {
          error:
            "This student does not have a timezone set. Please update the student's timezone before assigning them to a teacher.",
        },
        { status: 400 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* CHECK EXISTING ACTIVE ASSIGNMENT                                      */
    /* --------------------------------------------------------------------- */

    const {
      data: existingAssignment,
      error:
        existingAssignmentError,
    } = await supabase
      .from("teacher_assignments")
      .select(
        `
          id,
          teacher_id
        `
      )
      .eq(
        "enrollment_student_id",
        enrollmentStudentId
      )
      .eq("status", "active")
      .maybeSingle();

    if (
      existingAssignmentError
    ) {
      return NextResponse.json(
        {
          error:
            existingAssignmentError.message,
        },
        { status: 500 }
      );
    }

    if (existingAssignment) {
      if (
        existingAssignment.teacher_id ===
        teacherId
      ) {
        return NextResponse.json(
          {
            error:
              "This student is already assigned to this teacher.",
          },
          { status: 409 }
        );
      }

      const {
        data: existingTeacher,
      } = await supabase
        .from("profiles")
        .select(
          "full_name"
        )
        .eq(
          "id",
          existingAssignment.teacher_id
        )
        .maybeSingle();

      return NextResponse.json(
        {
          error: `This student is already assigned to ${
            existingTeacher?.full_name ||
            "another teacher"
          }.`,
        },
        { status: 409 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* LOAD STUDENT'S EXACT RECURRING SCHEDULE                               */
    /* --------------------------------------------------------------------- */

    const {
      data: schedules,
      error: schedulesError,
    } = await supabase
      .from("enrollment_schedules")
      .select(
        `
          enrollment_id,
          student_id,
          day_of_week,
          schedule_time
        `
      )
      .eq(
        "enrollment_id",
        enrollmentStudent.enrollment_id
      )
      .eq(
        "student_id",
        enrollmentStudent.student_id
      )
      .order("day_of_week", {
        ascending: true,
      })
      .order("schedule_time", {
        ascending: true,
      });

    if (schedulesError) {
      return NextResponse.json(
        {
          error:
            schedulesError.message,
        },
        { status: 500 }
      );
    }

    if (
      !schedules ||
      schedules.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "This student does not have a recurring lesson schedule.",
        },
        { status: 400 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* LOAD TEACHER AVAILABILITY                                             */
    /* --------------------------------------------------------------------- */

    const {
      data: availability,
      error:
        availabilityError,
    } = await supabase
      .from("teacher_availability")
      .select(
        `
          day_of_week,
          start_time,
          end_time
        `
      )
      .eq(
        "teacher_id",
        teacherId
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

    if (
      !availability ||
      availability.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "This teacher has not set any regular availability yet.",
        },
        { status: 400 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* CONVERT AND VALIDATE EVERY STUDENT SCHEDULE                           */
    /* --------------------------------------------------------------------- */

    const lessonDuration =
      Number(
        enrollment.lesson_duration ||
          30
      );

    const convertedSchedules =
      schedules.map(
        (schedule) => {
          const converted =
            convertScheduleToPHT(
              schedule.day_of_week,
              schedule.schedule_time,
              student.timezone
            );

          return {
            originalDay:
              schedule.day_of_week,

            originalTime:
              schedule.schedule_time,

            phtDay:
              converted.dayOfWeek,

            phtTime:
              converted.time,
          };
        }
      );

    const incompatibleSchedule =
      convertedSchedules.find(
        (schedule) =>
          !lessonFitsAvailability(
            schedule.phtDay,
            schedule.phtTime,
            lessonDuration,
            availability
          )
      );

    if (incompatibleSchedule) {
      const weekdayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      const dayName =
        weekdayNames[
          incompatibleSchedule.phtDay
        ];

      return NextResponse.json(
        {
          error: `This student's recurring schedule does not fit the teacher's availability in Philippine Time. ${dayName} at ${normalizeTime(
            incompatibleSchedule.phtTime
          )} PHT is outside the teacher's available hours.`,
        },
        { status: 409 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* CREATE ASSIGNMENT                                                     */
    /* --------------------------------------------------------------------- */

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    const {
      data: assignment,
      error: assignmentError,
    } = await supabase
      .from("teacher_assignments")
      .insert({
        enrollment_student_id:
          enrollmentStudentId,

        teacher_id:
          teacherId,

        start_date:
          today,

        status:
          "active",
      })
      .select(
        `
          id,
          enrollment_student_id,
          teacher_id,
          start_date,
          end_date,
          status
        `
      )
      .single();

    if (assignmentError) {
      console.error(
        "Teacher assignment insert error:",
        assignmentError
      );

      return NextResponse.json(
        {
          error:
            assignmentError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      assignment,
    });
  } catch (error) {
    console.error(
      "Teacher assignment POST error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while assigning the student.",
      },
      { status: 500 }
    );
  }
}

/* ========================================================================= */
/* DELETE                                                                    */
/* End an assignment without deleting its history.                          */
/* ========================================================================= */

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const ownerResult =
      await getActiveOwner();

    if (ownerResult.error) {
      return ownerResult.error;
    }

    const { supabase } =
      ownerResult;

    const { id: teacherId } =
      await context.params;

    if (!teacherId) {
      return NextResponse.json(
        {
          error:
            "Teacher ID is required.",
        },
        { status: 400 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* READ ASSIGNMENT ID                                                    */
    /* --------------------------------------------------------------------- */

    const url =
      new URL(_request.url);

    const assignmentId =
      url.searchParams.get(
        "assignmentId"
      );

    if (!assignmentId) {
      return NextResponse.json(
        {
          error:
            "Assignment ID is required.",
        },
        { status: 400 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* VERIFY ASSIGNMENT                                                     */
    /* --------------------------------------------------------------------- */

    const {
      data: assignment,
      error: assignmentLookupError,
    } = await supabase
      .from("teacher_assignments")
      .select(
        `
          id,
          teacher_id,
          enrollment_student_id,
          status
        `
      )
      .eq("id", assignmentId)
      .eq("teacher_id", teacherId)
      .maybeSingle();

    if (assignmentLookupError) {
      return NextResponse.json(
        {
          error:
            assignmentLookupError.message,
        },
        { status: 500 }
      );
    }

    if (!assignment) {
      return NextResponse.json(
        {
          error:
            "This teacher assignment could not be found.",
        },
        { status: 404 }
      );
    }

    if (
      assignment.status !==
      "active"
    ) {
      return NextResponse.json(
        {
          error:
            "This assignment is no longer active.",
        },
        { status: 400 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* END ASSIGNMENT                                                        */
    /* --------------------------------------------------------------------- */

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    const {
      data: updatedAssignment,
      error: updateError,
    } = await supabase
      .from("teacher_assignments")
      .update({
        /*
         * The database CHECK constraint allows:
         * active / inactive
         */
        status: "inactive",
        end_date: today,
      })
      .eq("id", assignment.id)
      .eq("teacher_id", teacherId)
      .eq("status", "active")
      .select(
        `
          id,
          enrollment_student_id,
          teacher_id,
          start_date,
          end_date,
          status
        `
      )
      .single();

    if (updateError) {
      console.error(
        "Teacher assignment removal error:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            updateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      assignment:
        updatedAssignment,
    });
  } catch (error) {
    console.error(
      "Teacher assignment DELETE error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while removing this student.",
      },
      { status: 500 }
    );
  }
}