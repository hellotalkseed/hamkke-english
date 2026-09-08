import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type TeacherLesson = {
  id: string;
  actual_teacher_id: string | null;
  attendance_status: string | null;
  duration: number | null;
  lesson_date: string | null;
};

type CompensationRate = {
  id: string;
  level: number;
  min_teaching_minutes: number;
  rate_25: number;
  rate_50: number;
  is_active: boolean;
};

const PAYABLE_ATTENDANCE_STATUSES = [
  "completed",
  "no_show",
  "late_cancellation",
] as const;

const TEACHER_AVATAR_BUCKET =
  "teacher-avatars";

/* ========================================================================= */
/* PHILIPPINE-TIME PAYROLL PERIOD                                            */
/* ========================================================================= */

function getManilaDateParts() {
  const formatter = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  );

  const parts = formatter.formatToParts(
    new Date()
  );

  const year = Number(
    parts.find(
      (part) => part.type === "year"
    )?.value
  );

  const month = Number(
    parts.find(
      (part) => part.type === "month"
    )?.value
  );

  const day = Number(
    parts.find(
      (part) => part.type === "day"
    )?.value
  );

  return {
    year,
    month,
    day,
  };
}

function toDateString(
  year: number,
  month: number,
  day: number
) {
  return `${year}-${String(month).padStart(
    2,
    "0"
  )}-${String(day).padStart(2, "0")}`;
}

function getCurrentPayrollPeriod() {
  const {
    year,
    month,
    day,
  } = getManilaDateParts();

  if (day <= 15) {
    return {
      periodStart: toDateString(
        year,
        month,
        1
      ),
      periodEnd: toDateString(
        year,
        month,
        15
      ),
    };
  }

  const lastDayOfMonth = new Date(
    Date.UTC(year, month, 0)
  ).getUTCDate();

  return {
    periodStart: toDateString(
      year,
      month,
      16
    ),
    periodEnd: toDateString(
      year,
      month,
      lastDayOfMonth
    ),
  };
}

/* ========================================================================= */
/* GET                                                                       */
/* ========================================================================= */

export async function GET() {
  try {
    const supabase = await createClient();

    /* --------------------------------------------------------------------- */
    /* AUTHENTICATION                                                        */
    /* --------------------------------------------------------------------- */

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* OWNER CHECK                                                           */
    /* --------------------------------------------------------------------- */

    const {
      data: profile,
      error: profileError,
    } = await supabase
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
      return NextResponse.json(
        {
          error:
            "Only active owners can view teachers.",
        },
        { status: 403 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* ADMIN CLIENT                                                          */
    /* --------------------------------------------------------------------- */

    const admin = createAdminClient();

    /* --------------------------------------------------------------------- */
    /* CURRENT PAYROLL PERIOD                                                */
    /* --------------------------------------------------------------------- */

    const {
      periodStart,
      periodEnd,
    } = getCurrentPayrollPeriod();

    /* --------------------------------------------------------------------- */
    /* GET TEACHERS                                                          */
    /* --------------------------------------------------------------------- */

    const {
      data: profiles,
      error: teachersError,
    } = await admin
      .from("profiles")
      .select(
        `
          id,
          full_name,
          role,
          status,
          created_at,
          teacher_number,
          avatar_path
        `
      )
      .eq("role", "teacher")
      .order("created_at", {
        ascending: true,
      });

    if (teachersError) {
      console.error(
        "Teacher profiles fetch error:",
        teachersError
      );

      return NextResponse.json(
        {
          error: teachersError.message,
        },
        { status: 500 }
      );
    }

    const teacherIds = (
      profiles || []
    ).map(
      (teacher) => teacher.id
    );

    /* --------------------------------------------------------------------- */
    /* NO TEACHERS                                                           */
    /* --------------------------------------------------------------------- */

    if (teacherIds.length === 0) {
      return NextResponse.json({
        teachers: [],
      });
    }

    /* --------------------------------------------------------------------- */
    /* GET AUTH EMAILS                                                       */
    /* --------------------------------------------------------------------- */

    const teacherEmails = new Map<
      string,
      string | null
    >();

    for (const teacherId of teacherIds) {
      try {
        const {
          data: authUser,
          error: authUserError,
        } =
          await admin.auth.admin.getUserById(
            teacherId
          );

        if (authUserError) {
          console.error(
            `Unable to load auth email for teacher ${teacherId}:`,
            authUserError
          );

          teacherEmails.set(
            teacherId,
            null
          );

          continue;
        }

        teacherEmails.set(
          teacherId,
          authUser.user?.email || null
        );
      } catch (error) {
        console.error(
          `Unexpected error loading auth email for teacher ${teacherId}:`,
          error
        );

        teacherEmails.set(
          teacherId,
          null
        );
      }
    }

    /* --------------------------------------------------------------------- */
    /* GET ACTIVE TEACHER ASSIGNMENTS                                        */
    /* --------------------------------------------------------------------- */

    const {
      data: assignments,
      error: assignmentsError,
    } = await admin
      .from("teacher_assignments")
      .select(
        `
          teacher_id,
          enrollment_student_id
        `
      )
      .in(
        "teacher_id",
        teacherIds
      )
      .eq(
        "status",
        "active"
      );

    if (assignmentsError) {
      console.error(
        "Teacher assignments fetch error:",
        assignmentsError
      );

      return NextResponse.json(
        {
          error:
            assignmentsError.message,
        },
        { status: 500 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* GET ENROLLMENT-STUDENT RECORDS                                        */
    /* --------------------------------------------------------------------- */

    const enrollmentStudentIds = (
      assignments || []
    ).map(
      (assignment) =>
        assignment.enrollment_student_id
    );

    let enrollmentStudents: {
      id: string;
      student_id: string;
    }[] = [];

    if (
      enrollmentStudentIds.length > 0
    ) {
      const {
        data,
        error:
          enrollmentStudentsError,
      } = await admin
        .from("enrollment_students")
        .select(
          "id, student_id"
        )
        .in(
          "id",
          enrollmentStudentIds
        );

      if (
        enrollmentStudentsError
      ) {
        console.error(
          "Enrollment students fetch error:",
          enrollmentStudentsError
        );

        return NextResponse.json(
          {
            error:
              enrollmentStudentsError.message,
          },
          { status: 500 }
        );
      }

      enrollmentStudents =
        data || [];
    }

    /* --------------------------------------------------------------------- */
    /* GET TEACHER LESSONS                                                   */
    /* --------------------------------------------------------------------- */

    const {
      data: lessons,
      error: lessonsError,
    } = await admin
      .from("lessons")
      .select(
        `
          id,
          actual_teacher_id,
          attendance_status,
          duration,
          lesson_date
        `
      )
      .in(
        "actual_teacher_id",
        teacherIds
      );

    if (lessonsError) {
      console.error(
        "Teacher lessons fetch error:",
        lessonsError
      );

      return NextResponse.json(
        {
          error:
            lessonsError.message,
        },
        { status: 500 }
      );
    }

    const teacherLessons =
      (lessons ||
        []) as TeacherLesson[];

    /* --------------------------------------------------------------------- */
    /* GET COMPENSATION RATES                                                */
    /* --------------------------------------------------------------------- */

    const {
      data: compensationRates,
      error:
        compensationRatesError,
    } = await admin
      .from(
        "teacher_compensation_rates"
      )
      .select(
        `
          id,
          level,
          min_teaching_minutes,
          rate_25,
          rate_50,
          is_active
        `
      )
      .eq(
        "is_active",
        true
      )
      .order(
        "min_teaching_minutes",
        {
          ascending: true,
        }
      );

    if (
      compensationRatesError
    ) {
      console.error(
        "Teacher compensation rates fetch error:",
        compensationRatesError
      );

      return NextResponse.json(
        {
          error:
            compensationRatesError.message,
        },
        { status: 500 }
      );
    }

    const activeRates =
      (compensationRates ||
        []) as CompensationRate[];

    if (
      activeRates.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "No active teacher compensation rates were found.",
        },
        { status: 500 }
      );
    }

    /* --------------------------------------------------------------------- */
    /* BUILD TEACHER STATISTICS                                              */
    /* --------------------------------------------------------------------- */

    const teachers = (
      profiles || []
    ).map((teacher) => {
      const teacherAssignments =
        (
          assignments || []
        ).filter(
          (assignment) =>
            assignment.teacher_id ===
            teacher.id
        );

      const assignedEnrollmentStudentIds =
        teacherAssignments.map(
          (assignment) =>
            assignment.enrollment_student_id
        );

      const studentIds =
        enrollmentStudents
          .filter(
            (
              enrollmentStudent
            ) =>
              assignedEnrollmentStudentIds.includes(
                enrollmentStudent.id
              )
          )
          .map(
            (
              enrollmentStudent
            ) =>
              enrollmentStudent.student_id
          );

      const uniqueStudentIds = [
        ...new Set(
          studentIds
        ),
      ];

      /* ------------------------------------------------------------------- */
      /* AVATAR                                                              */
      /* ------------------------------------------------------------------- */

      const avatarUrl =
        teacher.avatar_path
          ? admin.storage
              .from(
                TEACHER_AVATAR_BUCKET
              )
              .getPublicUrl(
                teacher.avatar_path
              ).data.publicUrl
          : null;

      /* ------------------------------------------------------------------- */
      /* ALL LESSONS ATTRIBUTED TO THIS TEACHER                              */
      /* ------------------------------------------------------------------- */

      const allLessonsForTeacher =
        teacherLessons.filter(
          (lesson) =>
            lesson.actual_teacher_id ===
            teacher.id
        );

      /* ------------------------------------------------------------------- */
      /* CURRENT PAYROLL PERIOD LESSONS                                      */
      /* ------------------------------------------------------------------- */

      const periodLessons =
        allLessonsForTeacher.filter(
          (lesson) => {
            if (
              !lesson.lesson_date
            ) {
              return false;
            }

            return (
              lesson.lesson_date >=
                periodStart &&
              lesson.lesson_date <=
                periodEnd
            );
          }
        );

      /*
       * Total Lessons on the Teachers Management page means:
       *
       * lessons attributed to this teacher during the current
       * Philippine-time payroll period only.
       */

      const totalLessons =
        periodLessons.length;

      /* ------------------------------------------------------------------- */
      /* QUALIFYING TEACHING MINUTES BEFORE CURRENT PERIOD                   */
      /* ------------------------------------------------------------------- */

      /*
       * Compensation progression is based only on actual
       * completed teaching time.
       *
       * The applicable rate for a payroll period is determined
       * from qualifying teaching minutes accumulated BEFORE
       * the payroll period begins.
       *
       * A threshold reached during this payroll period applies
       * starting with the next payroll period.
       */

      const teachingMinutesBeforePeriod =
        allLessonsForTeacher.reduce(
          (
            total,
            lesson
          ) => {
            if (
              lesson.attendance_status !==
                "completed" ||
              !lesson.lesson_date ||
              lesson.lesson_date >=
                periodStart
            ) {
              return total;
            }

            return (
              total +
              (lesson.duration || 0)
            );
          },
          0
        );

      /* ------------------------------------------------------------------- */
      /* APPLICABLE COMPENSATION RATE                                        */
      /* ------------------------------------------------------------------- */

      const applicableRate =
        [...activeRates]
          .reverse()
          .find(
            (rate) =>
              teachingMinutesBeforePeriod >=
              rate.min_teaching_minutes
          ) ||
        activeRates[0];

      /* ------------------------------------------------------------------- */
      /* CURRENT PERIOD PAYABLE                                              */
      /* ------------------------------------------------------------------- */

      /*
       * Payable attendance statuses:
       *
       * - completed
       * - no_show
       * - late_cancellation
       *
       * Unexpected circumstances are not directly payable.
       *
       * This is a live teacher-management calculation.
       * It does NOT depend on whether the owner has generated,
       * approved, or paid a teacher_payroll record.
       */

      const payable =
        periodLessons.reduce(
          (
            total,
            lesson
          ) => {
            if (
              !lesson.attendance_status ||
              !PAYABLE_ATTENDANCE_STATUSES.includes(
                lesson.attendance_status as
                  | "completed"
                  | "no_show"
                  | "late_cancellation"
              )
            ) {
              return total;
            }

            if (
              lesson.duration === 25
            ) {
              return (
                total +
                Number(
                  applicableRate.rate_25
                )
              );
            }

            if (
              lesson.duration === 50
            ) {
              return (
                total +
                Number(
                  applicableRate.rate_50
                )
              );
            }

            return total;
          },
          0
        );

      /* ------------------------------------------------------------------- */
      /* TEACHER RESPONSE                                                    */
      /* ------------------------------------------------------------------- */

      return {
        id: teacher.id,

        full_name:
          teacher.full_name,

        role:
          teacher.role,

        status:
          teacher.status,

        created_at:
          teacher.created_at,

        email:
          teacherEmails.get(
            teacher.id
          ) || null,

        teacher_number:
          teacher.teacher_number,

        avatar_path:
          teacher.avatar_path,

        avatar_url:
          avatarUrl,

        student_count:
          uniqueStudentIds.length,

        total_lessons:
          totalLessons,

        payable,
      };
    });

    /* --------------------------------------------------------------------- */
    /* RESPONSE                                                              */
    /* --------------------------------------------------------------------- */

    return NextResponse.json({
      teachers,
    });
  } catch (error) {
    console.error(
      "Teacher list error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while loading teachers.",
      },
      { status: 500 }
    );
  }
}