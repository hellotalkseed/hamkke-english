import { createAdminClient } from "@/lib/supabase/admin";

type LessonRecord = {
  id: string;
  enrollment_id: string;
  lesson_number: number;
  lesson_date: string;
  duration: number;
  attendance_status: string;
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

type PayrollCounts = {
  completed_25_count: number;
  completed_50_count: number;
  no_show_25_count: number;
  no_show_50_count: number;
  late_cancellation_25_count: number;
  late_cancellation_50_count: number;
};

export type PayrollPeriod = {
  periodStart: string;
  periodEnd: string;
};

export type FinalizeTeacherPayrollResult = {
  success: boolean;
  already_finalized: boolean;
  teacher_id: string;
  payroll_id: string | null;
  period_start: string;
  period_end: string;
  lesson_count: number;
  gross_pay: number;
  error?: string;
};

function getCompensationRate(
  rates: CompensationRate[],
  teachingMinutesBefore: number
) {
  return (
    rates
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
      )[0] || null
  );
}

function isPayableLesson(lesson: LessonRecord) {
  return (
    lesson.attendance_status === "completed" ||
    lesson.attendance_status === "no_show" ||
    lesson.attendance_status === "late_cancellation"
  );
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
    const duration = Number(lesson.duration);

    if (duration !== 25 && duration !== 50) {
      continue;
    }

    if (lesson.attendance_status === "completed") {
      if (duration === 25) {
        counts.completed_25_count += 1;
      } else {
        counts.completed_50_count += 1;
      }
      continue;
    }

    if (lesson.attendance_status === "no_show") {
      if (duration === 25) {
        counts.no_show_25_count += 1;
      } else {
        counts.no_show_50_count += 1;
      }
      continue;
    }

    if (
      lesson.attendance_status ===
      "late_cancellation"
    ) {
      if (duration === 25) {
        counts.late_cancellation_25_count += 1;
      } else {
        counts.late_cancellation_50_count += 1;
      }
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

async function loadRates(
  admin: ReturnType<typeof createAdminClient>
) {
  const { data, error } = await admin
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

  if (error) {
    throw new Error(
      `Failed to load compensation rates: ${error.message}`
    );
  }

  return (data || []).map(
    (rate): CompensationRate => ({
      id: String(rate.id),
      level: Number(rate.level),
      min_teaching_minutes: Number(
        rate.min_teaching_minutes
      ),
      rate_25: Number(rate.rate_25),
      rate_50: Number(rate.rate_50),
      is_active: Boolean(rate.is_active),
    })
  );
}

async function loadTeacherLessons(
  admin: ReturnType<typeof createAdminClient>,
  teacherId: string
) {
  const { data, error } = await admin
    .from("lessons")
    .select(
      `
        id,
        enrollment_id,
        lesson_number,
        lesson_date,
        duration,
        attendance_status,
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

  if (error) {
    throw new Error(
      `Failed to load teacher lessons: ${error.message}`
    );
  }

  return (data || []).map(
    (lesson): LessonRecord => ({
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
      duration: Number(
        lesson.duration
      ),
      attendance_status: String(
        lesson.attendance_status || ""
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
    })
  );
}

function getTeachingMinutesBefore(
  lessons: LessonRecord[],
  periodStart: string
) {
  return lessons
    .filter(
      (lesson) =>
        lesson.lesson_date < periodStart &&
        lesson.attendance_status ===
          "completed"
    )
    .reduce((total, lesson) => {
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
    }, 0);
}

export async function finalizeTeacherPayroll(
  teacherId: string,
  period: PayrollPeriod
): Promise<FinalizeTeacherPayrollResult> {
  const admin = createAdminClient();

  const { periodStart, periodEnd } =
    period;

  const {
    data: existingPayroll,
    error: existingPayrollError,
  } = await admin
    .from("teacher_payroll")
    .select(
      `
        id,
        gross_pay
      `
    )
    .eq("teacher_id", teacherId)
    .eq("period_start", periodStart)
    .eq("period_end", periodEnd)
    .maybeSingle();

  if (existingPayrollError) {
    throw new Error(
      existingPayrollError.message
    );
  }

  if (existingPayroll) {
    return {
      success: true,
      already_finalized: true,
      teacher_id: teacherId,
      payroll_id: String(
        existingPayroll.id
      ),
      period_start: periodStart,
      period_end: periodEnd,
      lesson_count: 0,
      gross_pay: Number(
        existingPayroll.gross_pay
      ),
    };
  }

  const [rates, lessons] =
    await Promise.all([
      loadRates(admin),
      loadTeacherLessons(
        admin,
        teacherId
      ),
    ]);

  if (rates.length === 0) {
    throw new Error(
      "No active teacher compensation rates are configured."
    );
  }

  const teachingMinutesBefore =
    getTeachingMinutesBefore(
      lessons,
      periodStart
    );

  const compensationRate =
    getCompensationRate(
      rates,
      teachingMinutesBefore
    );

  if (!compensationRate) {
    throw new Error(
      "Unable to determine the teacher's compensation rate."
    );
  }

  const payableLessons =
    lessons
      .filter(
        (lesson) =>
          lesson.lesson_date >=
            periodStart &&
          lesson.lesson_date <=
            periodEnd
      )
      .filter(isPayableLesson)
      .filter((lesson) => {
        const duration = Number(
          lesson.duration
        );

        return (
          duration === 25 ||
          duration === 50
        );
      });

  const counts =
    calculateCounts(
      payableLessons
    );

  const rate25 = Number(
    compensationRate.rate_25
  );

  const rate50 = Number(
    compensationRate.rate_50
  );

  const grossPay =
    calculateGrossPay(
      counts,
      rate25,
      rate50
    );

  const lessonIds =
    payableLessons.map(
      (lesson) => lesson.id
    );

  if (lessonIds.length > 0) {
    const {
      data: conflicts,
      error: conflictsError,
    } = await admin
      .from(
        "teacher_payroll_lessons"
      )
      .select(
        "lesson_id, payroll_id"
      )
      .in(
        "lesson_id",
        lessonIds
      );

    if (conflictsError) {
      throw new Error(
        conflictsError.message
      );
    }

    if (
      conflicts &&
      conflicts.length > 0
    ) {
      throw new Error(
        "One or more lessons in this payroll period have already been included in another payroll."
      );
    }
  }

  const {
    data: payroll,
    error: payrollError,
  } = await admin
    .from("teacher_payroll")
    .insert({
      teacher_id:
        teacherId,
      period_start:
        periodStart,
      period_end:
        periodEnd,
      teaching_minutes_before:
        teachingMinutesBefore,
      compensation_rate_id:
        compensationRate.id,
      rate_25:
        rate25,
      rate_50:
        rate50,
      completed_25_count:
        counts.completed_25_count,
      completed_50_count:
        counts.completed_50_count,
      no_show_25_count:
        counts.no_show_25_count,
      no_show_50_count:
        counts.no_show_50_count,
      late_cancellation_25_count:
        counts.late_cancellation_25_count,
      late_cancellation_50_count:
        counts.late_cancellation_50_count,
      gross_pay:
        grossPay,
      status:
        "pending",
    })
    .select(
      "id, gross_pay"
    )
    .single();

  if (payrollError) {
    if (
      payrollError.code ===
      "23505"
    ) {
      const {
        data: duplicatePayroll,
      } = await admin
        .from(
          "teacher_payroll"
        )
        .select(
          "id, gross_pay"
        )
        .eq(
          "teacher_id",
          teacherId
        )
        .eq(
          "period_start",
          periodStart
        )
        .eq(
          "period_end",
          periodEnd
        )
        .maybeSingle();

      if (duplicatePayroll) {
        return {
          success: true,
          already_finalized: true,
          teacher_id:
            teacherId,
          payroll_id:
            String(
              duplicatePayroll.id
            ),
          period_start:
            periodStart,
          period_end:
            periodEnd,
          lesson_count: 0,
          gross_pay:
            Number(
              duplicatePayroll.gross_pay
            ),
        };
      }
    }

    throw new Error(
      payrollError.message
    );
  }

  if (payableLessons.length > 0) {
    const rows =
      payableLessons.map(
        (lesson) => {
          const duration =
            Number(
              lesson.duration
            );

          const rate =
            duration === 25
              ? rate25
              : rate50;

          return {
            payroll_id:
              payroll.id,
            lesson_id:
              lesson.id,
            teacher_id:
              teacherId,
            duration,
            attendance_status:
              lesson.attendance_status,
            resolution:
              lesson.resolution,
            rate,
            amount:
              rate,
          };
        }
      );

    const { error: lessonsError } =
      await admin
        .from(
          "teacher_payroll_lessons"
        )
        .insert(rows);

    if (lessonsError) {
      await admin
        .from(
          "teacher_payroll"
        )
        .delete()
        .eq(
          "id",
          payroll.id
        );

      throw new Error(
        `Payroll lesson snapshot failed: ${lessonsError.message}`
      );
    }
  }

  return {
    success: true,
    already_finalized: false,
    teacher_id: teacherId,
    payroll_id: String(
      payroll.id
    ),
    period_start: periodStart,
    period_end: periodEnd,
    lesson_count:
      payableLessons.length,
    gross_pay:
      grossPay,
  };
}
