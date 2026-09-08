import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/* TYPES */

type LessonRecord = {
  id: string;
  enrollment_id: string;
  student_id: string | null;
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

type PayrollPeriod = {
  periodStart: string;
  periodEnd: string;
};

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

function getPhilippineDateString(date = new Date()) {
  const { year, month, day } = getPhilippineDateParts(date);

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
}

function getLastDayOfMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function getPayrollPeriod(date = new Date()): PayrollPeriod {
  const { year, month, day } = getPhilippineDateParts(date);

  const lastDay = getLastDayOfMonth(year, month);
  const monthString = String(month).padStart(2, "0");

  if (day <= 15) {
    return {
      periodStart: `${year}-${monthString}-01`,
      periodEnd: `${year}-${monthString}-15`,
    };
  }

  return {
    periodStart: `${year}-${monthString}-16`,
    periodEnd: `${year}-${monthString}-${String(lastDay).padStart(2, "0")}`,
  };
}

function getPreviousPayrollPeriod(date = new Date()): PayrollPeriod {
  const { year, month, day } = getPhilippineDateParts(date);

  if (day >= 16) {
    return {
      periodStart: `${year}-${String(month).padStart(2, "0")}-01`,
      periodEnd: `${year}-${String(month).padStart(2, "0")}-15`,
    };
  }

  const previousMonthDate = new Date(Date.UTC(year, month - 2, 15));
  const previousYear = previousMonthDate.getUTCFullYear();
  const previousMonth = previousMonthDate.getUTCMonth() + 1;
  const previousLastDay = getLastDayOfMonth(
    previousYear,
    previousMonth
  );

  return {
    periodStart: `${previousYear}-${String(previousMonth).padStart(
      2,
      "0"
    )}-16`,
    periodEnd: `${previousYear}-${String(previousMonth).padStart(
      2,
      "0"
    )}-${String(previousLastDay).padStart(2, "0")}`,
  };
}

function isValidDateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidPayrollPeriod(
  periodStart: string,
  periodEnd: string
) {
  if (
    !isValidDateString(periodStart) ||
    !isValidDateString(periodEnd) ||
    periodEnd < periodStart
  ) {
    return false;
  }

  const [startYear, startMonth, startDay] =
    periodStart.split("-").map(Number);

  const [endYear, endMonth, endDay] =
    periodEnd.split("-").map(Number);

  if (
    startYear !== endYear ||
    startMonth !== endMonth
  ) {
    return false;
  }

  const lastDay = getLastDayOfMonth(startYear, startMonth);

  const isFirstHalf =
    startDay === 1 &&
    endDay === 15;

  const isSecondHalf =
    startDay === 16 &&
    endDay === lastDay;

  return isFirstHalf || isSecondHalf;
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

function mapLessons(rawLessons: unknown[]) {
  return (rawLessons || [])
    .filter((lesson: any) =>
      lesson &&
      typeof lesson.id === "string" &&
      typeof lesson.enrollment_id === "string" &&
      typeof lesson.lesson_date === "string"
    )
    .map(
      (lesson: any): LessonRecord => ({
        id: String(lesson.id),
        enrollment_id: String(
          lesson.enrollment_id
        ),
        student_id:
          lesson.student_id
            ? String(lesson.student_id)
            : null,
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
      })
    );
}

async function getActiveOwner() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error(
      "Payroll user lookup error:",
      userError
    );

    return {
      supabase,
      error: NextResponse.json(
        {
          error: "Failed to authenticate user.",
        },
        {
          status: 500,
        }
      ),
    };
  }

  if (!user) {
    return {
      supabase,
      error: NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      ),
    };
  }

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

    return {
      supabase,
      error: NextResponse.json(
        {
          error:
            "Failed to verify owner access.",
        },
        {
          status: 500,
        }
      ),
    };
  }

  const ownerRole = String(
    profile?.role || ""
  ).toLowerCase();

  const ownerStatus = String(
    profile?.status || ""
  ).toLowerCase();

  if (
    !profile ||
    ownerRole !== "owner" ||
    ownerStatus !== "active"
  ) {
    return {
      supabase,
      error: NextResponse.json(
        {
          error:
            "Only active owners can manage teacher payroll.",
        },
        {
          status: 403,
        }
      ),
    };
  }

  return {
    supabase,
    error: null,
  };
}

async function loadTeacher(
  admin: ReturnType<typeof createAdminClient>,
  teacherId: string
) {
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
    throw new Error(
      `Failed to load teacher: ${teacherError.message}`
    );
  }

  return teacher;
}

async function loadCompensationRates(
  admin: ReturnType<typeof createAdminClient>
) {
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
    throw new Error(
      `Failed to load compensation rates: ${ratesError.message}`
    );
  }

  return (rawRates || []).map(
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
  const {
    data: rawLessons,
    error: lessonsError,
  } = await admin
    .from("lessons")
    .select(
      `
        id,
        enrollment_id,
        student_id,
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
    throw new Error(
      `Failed to load teacher lessons: ${lessonsError.message}`
    );
  }

  return mapLessons(rawLessons || []);
}

async function loadStudentNames(
  admin: ReturnType<typeof createAdminClient>,
  lessons: LessonRecord[]
) {
  const studentIds = [
    ...new Set(
      lessons
        .map((lesson) => lesson.student_id)
        .filter(Boolean)
        .map(String)
    ),
  ];

  if (studentIds.length === 0) {
    return new Map<
      string,
      {
        full_name: string | null;
        preferred_name: string | null;
      }
    >();
  }

  const {
    data: students,
    error: studentsError,
  } = await admin
    .from("students")
    .select(
      `
        id,
        full_name,
        preferred_name
      `
    )
    .in("id", studentIds);

  if (studentsError) {
    throw new Error(
      `Failed to load student names: ${studentsError.message}`
    );
  }

  return new Map(
    (students || []).map((student) => [
      String(student.id),
      {
        full_name: student.full_name
          ? String(student.full_name)
          : null,
        preferred_name: student.preferred_name
          ? String(student.preferred_name)
          : null,
      },
    ])
  );
}

async function loadFrozenPayrollLessonBreakdown(
  admin: ReturnType<typeof createAdminClient>,
  payrollId: string
) {
  const {
    data: snapshotRows,
    error: snapshotError,
  } = await admin
    .from("teacher_payroll_lessons")
    .select(
      `
        lesson_id,
        duration,
        attendance_status,
        resolution,
        rate,
        amount
      `
    )
    .eq("payroll_id", payrollId);

  if (snapshotError) {
    throw new Error(
      `Failed to load finalized payroll lesson breakdown: ${snapshotError.message}`
    );
  }

  if (!snapshotRows || snapshotRows.length === 0) {
    return [];
  }

  const lessonIds = snapshotRows
    .map((row) => row.lesson_id)
    .filter(Boolean)
    .map(String);

  const {
    data: lessonRows,
    error: lessonRowsError,
  } = await admin
    .from("lessons")
    .select(
      `
        id,
        enrollment_id,
        student_id,
        lesson_number,
        lesson_date
      `
    )
    .in("id", lessonIds);

  if (lessonRowsError) {
    throw new Error(
      `Failed to load finalized payroll lesson details: ${lessonRowsError.message}`
    );
  }

  const lessonById = new Map(
    (lessonRows || []).map((lesson) => [
      String(lesson.id),
      lesson,
    ])
  );

  const studentIds = [
    ...new Set(
      (lessonRows || [])
        .map((lesson) => lesson.student_id)
        .filter(Boolean)
        .map(String)
    ),
  ];

  let studentById = new Map<
    string,
    {
      full_name: string | null;
      preferred_name: string | null;
    }
  >();

  if (studentIds.length > 0) {
    const {
      data: students,
      error: studentsError,
    } = await admin
      .from("students")
      .select(
        `
          id,
          full_name,
          preferred_name
        `
      )
      .in("id", studentIds);

    if (studentsError) {
      throw new Error(
        `Failed to load finalized payroll student names: ${studentsError.message}`
      );
    }

    studentById = new Map(
      (students || []).map((student) => [
        String(student.id),
        {
          full_name: student.full_name
            ? String(student.full_name)
            : null,
          preferred_name: student.preferred_name
            ? String(student.preferred_name)
            : null,
        },
      ])
    );
  }

  return snapshotRows
    .map((snapshot) => {
      const lesson =
        lessonById.get(
          String(snapshot.lesson_id)
        ) || null;

      const studentId =
        lesson?.student_id
          ? String(lesson.student_id)
          : null;

      const student =
        studentId
          ? studentById.get(studentId)
          : null;

      return {
        id: String(snapshot.lesson_id),
        enrollment_id:
          lesson?.enrollment_id
            ? String(lesson.enrollment_id)
            : "",
        student_id: studentId,
        student_name:
          student?.preferred_name ||
          student?.full_name ||
          "Student",
        lesson_number:
          lesson?.lesson_number
            ? Number(lesson.lesson_number)
            : 0,
        lesson_date:
          lesson?.lesson_date
            ? String(lesson.lesson_date)
            : "",
        duration: Number(snapshot.duration),
        attendance_status: String(
          snapshot.attendance_status || ""
        ),
        rate: Number(snapshot.rate),
        amount: Number(snapshot.amount),
      };
    })
    .sort((a, b) => {
      const dateCompare =
        a.lesson_date.localeCompare(
          b.lesson_date
        );

      if (dateCompare !== 0) {
        return dateCompare;
      }

      return (
        a.lesson_number -
        b.lesson_number
      );
    });
}


async function loadFrozenPayrollHistoryBreakdowns(
  admin: ReturnType<typeof createAdminClient>,
  payrollIds: string[]
) {
  if (payrollIds.length === 0) {
    return {};
  }

  const {
    data: snapshotRows,
    error: snapshotError,
  } = await admin
    .from("teacher_payroll_lessons")
    .select(
      `
        payroll_id,
        lesson_id,
        duration,
        attendance_status,
        resolution,
        rate,
        amount
      `
    )
    .in("payroll_id", payrollIds);

  if (snapshotError) {
    throw new Error(
      `Failed to load payroll history lesson snapshots: ${snapshotError.message}`
    );
  }

  const grouped: Record<string, any[]> =
    Object.fromEntries(
      payrollIds.map((payrollId) => [
        payrollId,
        [],
      ])
    );

  if (!snapshotRows || snapshotRows.length === 0) {
    return grouped;
  }

  const lessonIds = [
    ...new Set(
      snapshotRows
        .map((row) => row.lesson_id)
        .filter(Boolean)
        .map(String)
    ),
  ];

  const {
    data: lessonRows,
    error: lessonRowsError,
  } = await admin
    .from("lessons")
    .select(
      `
        id,
        enrollment_id,
        student_id,
        lesson_number,
        lesson_date
      `
    )
    .in("id", lessonIds);

  if (lessonRowsError) {
    throw new Error(
      `Failed to load payroll history lesson details: ${lessonRowsError.message}`
    );
  }

  const lessonById = new Map(
    (lessonRows || []).map((lesson) => [
      String(lesson.id),
      lesson,
    ])
  );

  const studentIds = [
    ...new Set(
      (lessonRows || [])
        .map((lesson) => lesson.student_id)
        .filter(Boolean)
        .map(String)
    ),
  ];

  let studentById = new Map<
    string,
    {
      full_name: string | null;
      preferred_name: string | null;
    }
  >();

  if (studentIds.length > 0) {
    const {
      data: students,
      error: studentsError,
    } = await admin
      .from("students")
      .select(
        `
          id,
          full_name,
          preferred_name
        `
      )
      .in("id", studentIds);

    if (studentsError) {
      throw new Error(
        `Failed to load payroll history student names: ${studentsError.message}`
      );
    }

    studentById = new Map(
      (students || []).map((student) => [
        String(student.id),
        {
          full_name: student.full_name
            ? String(student.full_name)
            : null,
          preferred_name: student.preferred_name
            ? String(student.preferred_name)
            : null,
        },
      ])
    );
  }

  for (const snapshot of snapshotRows) {
    const payrollId = String(snapshot.payroll_id);
    const lesson =
      lessonById.get(String(snapshot.lesson_id)) || null;

    const studentId =
      lesson?.student_id
        ? String(lesson.student_id)
        : null;

    const student =
      studentId
        ? studentById.get(studentId)
        : null;

    grouped[payrollId] ??= [];

    grouped[payrollId].push({
      id: String(snapshot.lesson_id),
      enrollment_id:
        lesson?.enrollment_id
          ? String(lesson.enrollment_id)
          : "",
      student_id: studentId,
      student_name:
        student?.preferred_name ||
        student?.full_name ||
        "Student",
      lesson_number:
        lesson?.lesson_number
          ? Number(lesson.lesson_number)
          : 0,
      lesson_date:
        lesson?.lesson_date
          ? String(lesson.lesson_date)
          : "",
      duration: Number(snapshot.duration),
      attendance_status: String(
        snapshot.attendance_status || ""
      ),
      rate: Number(snapshot.rate),
      amount: Number(snapshot.amount),
    });
  }

  for (const payrollId of Object.keys(grouped)) {
    grouped[payrollId].sort((a, b) => {
      const dateCompare =
        a.lesson_date.localeCompare(b.lesson_date);

      if (dateCompare !== 0) {
        return dateCompare;
      }

      return a.lesson_number - b.lesson_number;
    });
  }

  return grouped;
}

function getTeachingMinutesBefore(
  lessons: LessonRecord[],
  periodStart: string
) {
  return lessons
    .filter(
      (lesson) =>
        lesson.lesson_date < periodStart &&
        isQualifyingTeachingLesson(
          lesson
        )
    )
    .reduce(
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
}

/* GET */

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
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

    const ownerResult =
      await getActiveOwner();

    if (ownerResult.error) {
      return ownerResult.error;
    }

    const admin = createAdminClient();

    const teacher =
      await loadTeacher(
        admin,
        teacherId
      );

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

    const {
      periodStart,
      periodEnd,
    } = getPayrollPeriod();

    const rates =
      await loadCompensationRates(
        admin
      );

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

    const lessons =
      await loadTeacherLessons(
        admin,
        teacherId
      );

    const teachingMinutesBefore =
      getTeachingMinutesBefore(
        lessons,
        periodStart
      );

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

    const historyBreakdowns =
      await loadFrozenPayrollHistoryBreakdowns(
        admin,
        payrollHistory.map(
          (record) => record.id
        )
      );

    const studentNames =
      await loadStudentNames(
        admin,
        payableCurrentLessons
      );

    const liveLessonBreakdown =
      payableCurrentLessons
        .filter((lesson) => {
          const duration =
            Number(lesson.duration);

          return (
            duration === 25 ||
            duration === 50
          );
        })
        .map((lesson) => {
          const student =
            lesson.student_id
              ? studentNames.get(
                  lesson.student_id
                )
              : null;

          const rate =
            Number(lesson.duration) === 50
              ? rate50
              : rate25;

          return {
            id: lesson.id,
            enrollment_id:
              lesson.enrollment_id,
            student_id:
              lesson.student_id,
            student_name:
              student?.preferred_name ||
              student?.full_name ||
              "Student",
            lesson_number:
              lesson.lesson_number,
            lesson_date:
              lesson.lesson_date,
            duration:
              lesson.duration,
            attendance_status:
              lesson.attendance_status,
            rate,
            amount: rate,
          };
        });

    const frozenLessonBreakdown =
      currentPayrollRecord
        ? await loadFrozenPayrollLessonBreakdown(
            admin,
            currentPayrollRecord.id
          )
        : null;

    const isFinalized =
      Boolean(currentPayrollRecord);

    const displayCounts =
      currentPayrollRecord
        ? {
            completed_25_count:
              currentPayrollRecord.completed_25_count,
            completed_50_count:
              currentPayrollRecord.completed_50_count,
            no_show_25_count:
              currentPayrollRecord.no_show_25_count,
            no_show_50_count:
              currentPayrollRecord.no_show_50_count,
            late_cancellation_25_count:
              currentPayrollRecord.late_cancellation_25_count,
            late_cancellation_50_count:
              currentPayrollRecord.late_cancellation_50_count,
          }
        : currentCounts;

    const displayRate25 =
      currentPayrollRecord
        ? Number(currentPayrollRecord.rate_25)
        : rate25;

    const displayRate50 =
      currentPayrollRecord
        ? Number(currentPayrollRecord.rate_50)
        : rate50;

    const displayGrossPay =
      currentPayrollRecord
        ? Number(currentPayrollRecord.gross_pay)
        : grossPay;

    const lessonBreakdown =
      frozenLessonBreakdown ??
      liveLessonBreakdown;

    const payable25Count =
      displayCounts.completed_25_count +
      displayCounts.no_show_25_count +
      displayCounts.late_cancellation_25_count;

    const payable50Count =
      displayCounts.completed_50_count +
      displayCounts.no_show_50_count +
      displayCounts.late_cancellation_50_count;

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
          rate_25: displayRate25,
          rate_50: displayRate50,
        },

        completed_25_count:
          displayCounts.completed_25_count,

        completed_50_count:
          displayCounts.completed_50_count,

        no_show_25_count:
          displayCounts.no_show_25_count,

        no_show_50_count:
          displayCounts.no_show_50_count,

        late_cancellation_25_count:
          displayCounts.late_cancellation_25_count,

        late_cancellation_50_count:
          displayCounts.late_cancellation_50_count,

        payable_25_count:
          payable25Count,

        payable_50_count:
          payable50Count,

        gross_pay: displayGrossPay,

        status: currentPayrollRecord
          ? currentPayrollRecord.status
          : "pending",

        payroll_record:
          currentPayrollRecord,

        is_finalized:
          isFinalized,

        breakdown_source:
          isFinalized
            ? "frozen"
            : "live",
      },

      history: payrollHistory,

      history_breakdowns:
        historyBreakdowns,

      lessons: currentPeriodLessons,

      lesson_breakdown:
        lessonBreakdown,
    });
  } catch (error) {
    console.error(
      "Unexpected teacher payroll GET error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
}

/* POST
 *
 * Finalize one completed payroll period.
 *
 * If periodStart / periodEnd are omitted, the immediately
 * previous payroll period is finalized.
 *
 * The endpoint is idempotent:
 * - existing teacher/period payroll is returned instead of duplicated
 * - lesson IDs are protected by teacher_payroll_lessons.lesson_id UNIQUE
 *
 * Only a period that has already ended in Philippine Time can be finalized.
 */

export async function POST(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  let createdPayrollId: string | null =
    null;

  try {
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

    const ownerResult =
      await getActiveOwner();

    if (ownerResult.error) {
      return ownerResult.error;
    }

    const admin = createAdminClient();

    const teacher =
      await loadTeacher(
        admin,
        teacherId
      );

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

    let body: {
      periodStart?: string;
      periodEnd?: string;
      preview?: boolean;
    } = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const fallbackPeriod =
      getPreviousPayrollPeriod();

    const periodStart =
      body.periodStart?.trim() ||
      fallbackPeriod.periodStart;

    const periodEnd =
      body.periodEnd?.trim() ||
      fallbackPeriod.periodEnd;

    const preview =
      body.preview === true;

    if (
      !isValidPayrollPeriod(
        periodStart,
        periodEnd
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid payroll period. A payroll period must be either the 1st–15th or the 16th–end of a single month.",
        },
        {
          status: 400,
        }
      );
    }

    const todayPht =
      getPhilippineDateString();

    /*
     * A period can only be finalized after it has ended.
     *
     * Example:
     * periodEnd = 2026-09-15
     * first valid finalization date = 2026-09-16 PHT
     */
    if (
      !preview &&
      periodEnd >= todayPht
    ) {
      return NextResponse.json(
        {
          error:
            "This payroll period has not ended yet in Philippine Time.",
        },
        {
          status: 409,
        }
      );
    }

    /* RETURN EXISTING SNAPSHOT IF ALREADY FINALIZED */

    const {
      data: existingPayroll,
      error: existingPayrollError,
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
      .eq("period_start", periodStart)
      .eq("period_end", periodEnd)
      .maybeSingle();

    if (existingPayrollError) {
      return NextResponse.json(
        {
          error:
            existingPayrollError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (
      existingPayroll &&
      !preview
    ) {
      return NextResponse.json({
        success: true,
        already_finalized: true,
        payroll: existingPayroll,
      });
    }

    const rates =
      await loadCompensationRates(
        admin
      );

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

    const lessons =
      await loadTeacherLessons(
        admin,
        teacherId
      );

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

    const periodLessons =
      lessons.filter(
        (lesson) =>
          lesson.lesson_date >=
            periodStart &&
          lesson.lesson_date <= periodEnd
      );

    const payableLessons =
      periodLessons
        .filter(
          isPayableLesson
        )
        .filter((lesson) => {
          const duration =
            Number(
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

    const rate25 =
      Number(
        compensationRate.rate_25
      );

    const rate50 =
      Number(
        compensationRate.rate_50
      );

    const grossPay =
      calculateGrossPay(
        counts,
        rate25,
        rate50
      );

    /*
     * Guard against any lesson already belonging to another
     * finalized payroll.
     */
    const payableLessonIds =
      payableLessons.map(
        (lesson) => lesson.id
      );

    if (
      payableLessonIds.length > 0
    ) {
      const {
        data: existingPayrollLessons,
        error:
          existingPayrollLessonsError,
      } = await admin
        .from(
          "teacher_payroll_lessons"
        )
        .select(
          "lesson_id, payroll_id"
        )
        .in(
          "lesson_id",
          payableLessonIds
        );

      if (
        existingPayrollLessonsError
      ) {
        return NextResponse.json(
          {
            error:
              existingPayrollLessonsError.message,
          },
          {
            status: 500,
          }
        );
      }

      if (
        existingPayrollLessons &&
        existingPayrollLessons.length > 0 &&
        !preview
      ) {
        return NextResponse.json(
          {
            error:
              "One or more lessons in this payroll period have already been included in another payroll.",
            conflicting_lessons:
              existingPayrollLessons,
          },
          {
            status: 409,
          }
        );
      }

      if (preview) {
        const conflictingLessonIds =
          new Set(
            (existingPayrollLessons || []).map(
              (item) =>
                String(item.lesson_id)
            )
          );

        const previewLessons =
          payableLessons.map(
            (lesson) => ({
              id: lesson.id,
              enrollment_id:
                lesson.enrollment_id,
              lesson_number:
                lesson.lesson_number,
              lesson_date:
                lesson.lesson_date,
              duration:
                lesson.duration,
              attendance_status:
                lesson.attendance_status,
              resolution:
                lesson.resolution,
              rate:
                Number(
                  lesson.duration
                ) === 25
                  ? rate25
                  : rate50,
              amount:
                Number(
                  lesson.duration
                ) === 25
                  ? rate25
                  : rate50,
              already_in_payroll:
                conflictingLessonIds.has(
                  lesson.id
                ),
            })
          );

        return NextResponse.json({
          success: true,
          preview: true,
          would_finalize: {
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
            compensation_level:
              compensationRate.level,
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
            payable_25_count:
              counts.completed_25_count +
              counts.no_show_25_count +
              counts.late_cancellation_25_count,
            payable_50_count:
              counts.completed_50_count +
              counts.no_show_50_count +
              counts.late_cancellation_50_count,
            gross_pay:
              grossPay,
            status:
              "pending",
          },
          existing_payroll:
            existingPayroll || null,
          has_conflicts:
            previewLessons.some(
              (lesson) =>
                lesson.already_in_payroll
            ),
          lesson_count:
            previewLessons.length,
          lessons:
            previewLessons,
        });
      }
    }

    if (preview) {
      return NextResponse.json({
        success: true,
        preview: true,
        would_finalize: {
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
          compensation_level:
            compensationRate.level,
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
          payable_25_count:
            counts.completed_25_count +
            counts.no_show_25_count +
            counts.late_cancellation_25_count,
          payable_50_count:
            counts.completed_50_count +
            counts.no_show_50_count +
            counts.late_cancellation_50_count,
          gross_pay:
            grossPay,
          status:
            "pending",
        },
        existing_payroll:
          existingPayroll || null,
        has_conflicts: false,
        lesson_count: 0,
        lessons: [],
      });
    }

    /* CREATE FROZEN PAYROLL SNAPSHOT */

    const {
      data: payroll,
      error: payrollInsertError,
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
      .single();

    if (payrollInsertError) {
      /*
       * The database unique constraint also protects the same
       * teacher/period from duplicate generation.
       */
      if (
        payrollInsertError.code ===
        "23505"
      ) {
        const {
          data:
            duplicatePayroll,
        } = await admin
          .from(
            "teacher_payroll"
          )
          .select("*")
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
          return NextResponse.json({
            success: true,
            already_finalized:
              true,
            payroll:
              duplicatePayroll,
          });
        }
      }

      return NextResponse.json(
        {
          error:
            payrollInsertError.message,
        },
        {
          status: 500,
        }
      );
    }

    createdPayrollId =
      String(payroll.id);

    /* SAVE EXACT PAYABLE LESSON SNAPSHOT */

    if (
      payableLessons.length > 0
    ) {
      const payrollLessonRows =
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

      const {
        error:
          payrollLessonsInsertError,
      } = await admin
        .from(
          "teacher_payroll_lessons"
        )
        .insert(
          payrollLessonRows
        );

      if (
        payrollLessonsInsertError
      ) {
        /*
         * We cannot perform a multi-table transaction directly through
         * the standard Supabase query builder here, so clean up the
         * newly-created payroll record if its lesson snapshot fails.
         *
         * teacher_payroll_lessons has ON DELETE CASCADE on payroll_id.
         */
        await admin
          .from(
            "teacher_payroll"
          )
          .delete()
          .eq(
            "id",
            payroll.id
          );

        createdPayrollId =
          null;

        return NextResponse.json(
          {
            error:
              "Payroll could not be finalized because its lesson snapshot could not be saved.",
            details:
              payrollLessonsInsertError.message,
          },
          {
            status:
              payrollLessonsInsertError.code ===
              "23505"
                ? 409
                : 500,
          }
        );
      }
    }

    createdPayrollId =
      null;

    return NextResponse.json({
      success: true,
      already_finalized: false,

      payroll,

      lesson_count:
        payableLessons.length,

      lessons:
        payableLessons.map(
          (lesson) => ({
            id: lesson.id,
            lesson_number:
              lesson.lesson_number,
            lesson_date:
              lesson.lesson_date,
            duration:
              lesson.duration,
            attendance_status:
              lesson.attendance_status,
            rate:
              Number(
                lesson.duration
              ) === 25
                ? rate25
                : rate50,
          })
        ),
    });
  } catch (error) {
    console.error(
      "Unexpected teacher payroll POST error:",
      error
    );

    /*
     * Best-effort cleanup in the unlikely event a failure happens
     * after payroll creation but before normal completion.
     */
    if (createdPayrollId) {
      try {
        const admin =
          createAdminClient();

        await admin
          .from(
            "teacher_payroll"
          )
          .delete()
          .eq(
            "id",
            createdPayrollId
          );
      } catch (
        cleanupError
      ) {
        console.error(
          "Payroll cleanup error:",
          cleanupError
        );
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
}
