import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/* TYPES */

type LessonRecord = {
  id: string;
  enrollment_id: string;
  lesson_number: number;
  lesson_date: string;
  duration: number;
  attendance_status: string;
  consumes_lesson: boolean;
  resolution: string | null;
  actual_teacher_id: string | null;
};

type CompensationRate = {
  id: string;
  level: number;
  min_teaching_minutes: number;
  rate_25: number;
  rate_50: number;
  is_active: boolean;
};

type PayrollRecord = {
  id: string;
  teacher_id: string;
  period_start: string;
  period_end: string;
  teaching_minutes_before: number;
  compensation_rate_id: string | null;
  rate_25: number;
  rate_50: number;
  completed_25_count: number;
  completed_50_count: number;
  no_show_25_count: number;
  no_show_50_count: number;
  late_cancellation_25_count: number;
  late_cancellation_50_count: number;
  gross_pay: number;
  status: string;
  payment_method: string | null;
  payment_reference: string | null;
  payment_date: string | null;
  approved_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

type PayrollCounts = {
  completed_25_count: number;
  completed_50_count: number;
  no_show_25_count: number;
  no_show_50_count: number;
  late_cancellation_25_count: number;
  late_cancellation_50_count: number;
};

type LessonCategory =
  | "completed_25"
  | "completed_50"
  | "no_show_25"
  | "no_show_50"
  | "late_cancellation_25"
  | "late_cancellation_50";

/* HELPERS */

function getPhilippineDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);

  const getPart = (type: string) =>
    parts.find((part) => part.type === type)?.value || "";

  return {
    year: Number(getPart("year")),
    month: Number(getPart("month")),
    day: Number(getPart("day")),
  };
}

function getPayrollPeriod(date = new Date()) {
  const { year, month, day } = getPhilippineDateParts(date);

  const lastDay = new Date(
    Date.UTC(year, month, 0)
  ).getUTCDate();

  const monthString = String(month).padStart(2, "0");

  if (day <= 15) {
    return {
      periodStart: `${year}-${monthString}-01`,
      periodEnd: `${year}-${monthString}-15`,
    };
  }

  return {
    periodStart: `${year}-${monthString}-16`,
    periodEnd: `${year}-${monthString}-${String(lastDay).padStart(
      2,
      "0"
    )}`,
  };
}

function isPayableLesson(lesson: LessonRecord) {
  return (
    lesson.attendance_status === "completed" ||
    lesson.attendance_status === "no_show" ||
    lesson.attendance_status === "late_cancellation"
  );
}

function isQualifyingTeachingLesson(
  lesson: LessonRecord
) {
  /*
   * Only actual completed teaching contributes
   * to compensation-rate progression.
   *
   * No-shows and late cancellations are payable,
   * but they are not actual teaching time.
   *
   * Unexpected circumstances are not directly payable.
   * If the lesson is rescheduled or credited, the later
   * completed lesson is what becomes payable.
   */
  return lesson.attendance_status === "completed";
}

function getCompensationRate(
  rates: CompensationRate[],
  teachingMinutesBefore: number
) {
  const eligibleRates = rates
    .filter((rate) => rate.is_active)
    .filter(
      (rate) =>
        Number(rate.min_teaching_minutes) <=
        teachingMinutesBefore
    )
    .sort(
      (a, b) =>
        Number(b.min_teaching_minutes) -
        Number(a.min_teaching_minutes)
    );

  return eligibleRates[0] || null;
}

function getLessonCategory(
  lesson: LessonRecord
): LessonCategory | null {
  const duration = Number(lesson.duration);

  if (duration !== 25 && duration !== 50) {
    return null;
  }

  if (lesson.attendance_status === "completed") {
    return duration === 25
      ? "completed_25"
      : "completed_50";
  }

  if (lesson.attendance_status === "no_show") {
    return duration === 25
      ? "no_show_25"
      : "no_show_50";
  }

  if (
    lesson.attendance_status ===
    "late_cancellation"
  ) {
    return duration === 25
      ? "late_cancellation_25"
      : "late_cancellation_50";
  }

  return null;
}

function calculateCounts(
  lessons: LessonRecord[]
): PayrollCounts {
  const counts: PayrollCounts = {
    completed_25_count: 0,
    completed_50_count: 0,
    no_show_25_count: 0,
    no_show_50_count: 0,
    late_cancellation_25_count: 0,
    late_cancellation_50_count: 0,
  };

  for (const lesson of lessons) {
    const category = getLessonCategory(lesson);

    if (!category) {
      continue;
    }

    switch (category) {
      case "completed_25":
        counts.completed_25_count += 1;
        break;

      case "completed_50":
        counts.completed_50_count += 1;
        break;

      case "no_show_25":
        counts.no_show_25_count += 1;
        break;

      case "no_show_50":
        counts.no_show_50_count += 1;
        break;

      case "late_cancellation_25":
        counts.late_cancellation_25_count += 1;
        break;

      case "late_cancellation_50":
        counts.late_cancellation_50_count += 1;
        break;
    }
  }

  return counts;
}

function calculateGrossPay(
  counts: PayrollCounts,
  rate25: number,
  rate50: number
) {
  const payable25Count =
    counts.completed_25_count +
    counts.no_show_25_count +
    counts.late_cancellation_25_count;

  const payable50Count =
    counts.completed_50_count +
    counts.no_show_50_count +
    counts.late_cancellation_50_count;

  return (
    payable25Count * rate25 +
    payable50Count * rate50
  );
}

/* GET */

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const supabase = await createClient();

    const { id: teacherId } =
      await context.params;

    if (!teacherId) {
      return NextResponse.json(
        {
          error: "Teacher ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* AUTHENTICATION */

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(
        "Payroll user lookup error:",
        userError
      );

      return NextResponse.json(
        {
          error: "Failed to authenticate user.",
        },
        {
          status: 500,
        }
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    /* OWNER AUTHORIZATION */

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("id, role, status")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(
        "Payroll profile lookup error:",
        profileError
      );

      return NextResponse.json(
        {
          error:
            "Failed to verify owner access.",
        },
        {
          status: 500,
        }
      );
    }

    if (!profile) {
      return NextResponse.json(
        {
          error: "Forbidden.",
        },
        {
          status: 403,
        }
      );
    }

    const ownerRole = String(
      profile.role || ""
    ).toLowerCase();

    const ownerStatus = String(
      profile.status || ""
    ).toLowerCase();

    if (
      ownerRole !== "owner" ||
      ownerStatus !== "active"
    ) {
      return NextResponse.json(
        {
          error:
            "Only active owners can view teacher payroll.",
        },
        {
          status: 403,
        }
      );
    }

    /* ADMIN CLIENT */

    const admin = createAdminClient();

    /* TEACHER */

    const {
  data: teacher,
  error: teacherError,
} = await admin
  .from("profiles")
  .select(
    `
      id,
      full_name,
      role,
      status,
      teacher_number
    `
  )
  .eq("id", teacherId)
  .maybeSingle();

    if (teacherError) {
      console.error(
        "Payroll teacher lookup error:",
        teacherError
      );

      return NextResponse.json(
        {
          error: "Failed to load teacher.",
        },
        {
          status: 500,
        }
      );
    }

    if (!teacher) {
      return NextResponse.json(
        {
          error: "Teacher not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      String(
        teacher.role || ""
      ).toLowerCase() !== "teacher"
    ) {
      return NextResponse.json(
        {
          error:
            "The selected profile is not a teacher.",
        },
        {
          status: 400,
        }
      );
    }

    /* CURRENT PAYROLL PERIOD */

    const {
      periodStart,
      periodEnd,
    } = getPayrollPeriod();

    /* COMPENSATION RATES */

    const {
      data: rawRates,
      error: ratesError,
    } = await admin
      .from("teacher_compensation_rates")
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
      .eq("is_active", true)
      .order("min_teaching_minutes", {
        ascending: true,
      });

    if (ratesError) {
      console.error(
        "Payroll compensation rate lookup error:",
        ratesError
      );

      return NextResponse.json(
        {
          error:
            "Failed to load compensation rates.",
        },
        {
          status: 500,
        }
      );
    }

    const rates: CompensationRate[] = (
      rawRates || []
    ).map((rate) => ({
      id: String(rate.id),
      level: Number(rate.level),
      min_teaching_minutes: Number(
        rate.min_teaching_minutes
      ),
      rate_25: Number(rate.rate_25),
      rate_50: Number(rate.rate_50),
      is_active: Boolean(rate.is_active),
    }));

    if (rates.length === 0) {
      return NextResponse.json(
        {
          error:
            "No active teacher compensation rates are configured.",
        },
        {
          status: 500,
        }
      );
    }

    /* TEACHER LESSONS */

    const {
      data: rawLessons,
      error: lessonsError,
    } = await admin
      .from("lessons")
      .select(
        `
          id,
          enrollment_id,
          lesson_number,
          lesson_date,
          duration,
          attendance_status,
          consumes_lesson,
          resolution,
          actual_teacher_id
        `
      )
      .eq("actual_teacher_id", teacherId)
      .order("lesson_date", {
        ascending: true,
      })
      .order("lesson_number", {
        ascending: true,
      });

    if (lessonsError) {
      console.error(
        "Payroll lesson lookup error:",
        lessonsError
      );

      return NextResponse.json(
        {
          error:
            "Failed to load teacher lessons.",
        },
        {
          status: 500,
        }
      );
    }

    const lessons: LessonRecord[] = (
      rawLessons || []
    )
      .filter(
        (lesson) =>
          lesson &&
          typeof lesson.id === "string" &&
          typeof lesson.enrollment_id ===
            "string" &&
          typeof lesson.lesson_date === "string"
      )
      .map((lesson) => ({
        id: String(lesson.id),
        enrollment_id: String(
          lesson.enrollment_id
        ),
        lesson_number: Number(
          lesson.lesson_number
        ),
        lesson_date: String(
          lesson.lesson_date
        ),
        duration: Number(lesson.duration),
        attendance_status: String(
          lesson.attendance_status || ""
        ),
        consumes_lesson: Boolean(
          lesson.consumes_lesson
        ),
        resolution: lesson.resolution
          ? String(lesson.resolution)
          : null,
        actual_teacher_id:
          lesson.actual_teacher_id
            ? String(
                lesson.actual_teacher_id
              )
            : null,
      }));

    /* QUALIFYING TEACHING MINUTES BEFORE PERIOD */

    const lessonsBeforePeriod =
      lessons.filter(
        (lesson) =>
          lesson.lesson_date <
            periodStart &&
          isQualifyingTeachingLesson(
            lesson
          )
      );

    const teachingMinutesBefore =
      lessonsBeforePeriod.reduce(
        (total, lesson) => {
          const duration = Number(
            lesson.duration
          );

          if (
            duration !== 25 &&
            duration !== 50
          ) {
            return total;
          }

          return total + duration;
        },
        0
      );

    /* CURRENT PERIOD LESSONS */

    const currentPeriodLessons =
      lessons.filter(
        (lesson) =>
          lesson.lesson_date >=
            periodStart &&
          lesson.lesson_date <= periodEnd
      );

    const payableCurrentLessons =
      currentPeriodLessons.filter(
        isPayableLesson
      );

    const currentCounts =
      calculateCounts(
        payableCurrentLessons
      );

    /* CURRENT COMPENSATION RATE */

    const compensationRate =
      getCompensationRate(
        rates,
        teachingMinutesBefore
      );

    if (!compensationRate) {
      return NextResponse.json(
        {
          error:
            "Unable to determine the teacher's compensation rate.",
        },
        {
          status: 500,
        }
      );
    }

    const rate25 = Number(
      compensationRate.rate_25
    );

    const rate50 = Number(
      compensationRate.rate_50
    );

    const grossPay =
      calculateGrossPay(
        currentCounts,
        rate25,
        rate50
      );

    /* EXISTING PAYROLL HISTORY */

    const {
      data: rawPayrollHistory,
      error: payrollHistoryError,
    } = await admin
      .from("teacher_payroll")
      .select(
        `
          id,
          teacher_id,
          period_start,
          period_end,
          teaching_minutes_before,
          compensation_rate_id,
          rate_25,
          rate_50,
          completed_25_count,
          completed_50_count,
          no_show_25_count,
          no_show_50_count,
          late_cancellation_25_count,
          late_cancellation_50_count,
          gross_pay,
          status,
          payment_method,
          payment_reference,
          payment_date,
          approved_at,
          paid_at,
          created_at,
          updated_at
        `
      )
      .eq("teacher_id", teacherId)
      .order("period_start", {
        ascending: false,
      });

    if (payrollHistoryError) {
      console.error(
        "Payroll history lookup error:",
        payrollHistoryError
      );

      return NextResponse.json(
        {
          error:
            "Failed to load payroll history.",
        },
        {
          status: 500,
        }
      );
    }

    const payrollHistory: PayrollRecord[] =
      (rawPayrollHistory || []).map(
        (record) => ({
          id: String(record.id),
          teacher_id: String(
            record.teacher_id
          ),
          period_start: String(
            record.period_start
          ),
          period_end: String(
            record.period_end
          ),
          teaching_minutes_before:
            Number(
              record.teaching_minutes_before
            ),
          compensation_rate_id:
            record.compensation_rate_id
              ? String(
                  record.compensation_rate_id
                )
              : null,
          rate_25: Number(
            record.rate_25
          ),
          rate_50: Number(
            record.rate_50
          ),
          completed_25_count: Number(
            record.completed_25_count
          ),
          completed_50_count: Number(
            record.completed_50_count
          ),
          no_show_25_count: Number(
            record.no_show_25_count
          ),
          no_show_50_count: Number(
            record.no_show_50_count
          ),
          late_cancellation_25_count:
            Number(
              record.late_cancellation_25_count
            ),
          late_cancellation_50_count:
            Number(
              record.late_cancellation_50_count
            ),
          gross_pay: Number(
            record.gross_pay
          ),
          status: String(
            record.status || "pending"
          ),
          payment_method:
            record.payment_method
              ? String(
                  record.payment_method
                )
              : null,
          payment_reference:
            record.payment_reference
              ? String(
                  record.payment_reference
                )
              : null,
          payment_date:
            record.payment_date
              ? String(
                  record.payment_date
                )
              : null,
          approved_at:
            record.approved_at
              ? String(
                  record.approved_at
                )
              : null,
          paid_at: record.paid_at
            ? String(record.paid_at)
            : null,
          created_at: String(
            record.created_at
          ),
          updated_at: String(
            record.updated_at
          ),
        })
      );

    const currentPayrollRecord =
      payrollHistory.find(
        (record) =>
          record.period_start ===
            periodStart &&
          record.period_end ===
            periodEnd
      ) || null;

    /* TOTAL PAYABLE COUNTS */

    const payable25Count =
      currentCounts.completed_25_count +
      currentCounts.no_show_25_count +
      currentCounts.late_cancellation_25_count;

    const payable50Count =
      currentCounts.completed_50_count +
      currentCounts.no_show_50_count +
      currentCounts.late_cancellation_50_count;

    /* RESPONSE */

    return NextResponse.json({
      teacher,

      period: {
        start: periodStart,
        end: periodEnd,
      },

      current: {
        period_start: periodStart,
        period_end: periodEnd,

        teaching_minutes_before:
          teachingMinutesBefore,

        compensation_rate: {
          id: compensationRate.id,
          level: compensationRate.level,
          min_teaching_minutes:
            compensationRate.min_teaching_minutes,
          rate_25: rate25,
          rate_50: rate50,
        },

        completed_25_count:
          currentCounts.completed_25_count,

        completed_50_count:
          currentCounts.completed_50_count,

        no_show_25_count:
          currentCounts.no_show_25_count,

        no_show_50_count:
          currentCounts.no_show_50_count,

        late_cancellation_25_count:
          currentCounts.late_cancellation_25_count,

        late_cancellation_50_count:
          currentCounts.late_cancellation_50_count,

        payable_25_count:
          payable25Count,

        payable_50_count:
          payable50Count,

        gross_pay: grossPay,

        status: currentPayrollRecord
          ? currentPayrollRecord.status
          : "pending",

        payroll_record:
          currentPayrollRecord,
      },

      history: payrollHistory,

      lessons: currentPeriodLessons,
    });
  } catch (error) {
    console.error(
      "Unexpected teacher payroll API error:",
      error
    );

    return NextResponse.json(
      {
        error: "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
}