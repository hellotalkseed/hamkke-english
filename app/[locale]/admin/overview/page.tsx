import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface OverviewPageProps {
  params: Promise<{
    locale: string;
  }>;
}

interface LessonRow {
  id: string;
  enrollment_id: string;
  student_id: string | null;
  consumes_lesson: boolean | null;
  attendance_status: string | null;
}

interface EnrollmentRow {
  id: string;
  package_name: string | null;
  number_of_lessons: number | null;
  status: string | null;
  start_date: string | null;
  schedule_days: string[] | null;
  schedule_time: string | null;
}

interface EnrollmentStudentRow {
  enrollment_id: string;
  student_id: string;
}

interface EnrollmentScheduleRow {
  id: string;
  enrollment_id: string;
  student_id: string | null;
  day_of_week: number;
  schedule_time: string;
}

interface StudentRow {
  id: string;
  student_number: string | number | null;
  full_name: string;
  preferred_name: string | null;
}

interface PaymentRow {
  id: string;
  amount: number | null;
  currency: string | null;
  amount_krw: number | null;
  amount_php: number | null;
  payment_date: string | null;
  status: string | null;
}

/* ========================================================================= */
/* HELPERS                                                                   */
/* ========================================================================= */

function formatMoney(amount: number) {
  return `₱${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function formatTime(time: string | null) {
  if (!time) return null;

  const parts = time.split(":");

  if (parts.length < 2) {
    return time;
  }

  const hour = Number(parts[0]);
  const minute = parts[1];

  if (!Number.isFinite(hour)) {
    return time;
  }

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${displayHour}:${minute} ${suffix}`;
}

function formatSchedule(
  days: string[] | null,
  time: string | null
) {
  const labels: Record<string, string> = {
    mon: "Mon",
    monday: "Mon",
    tue: "Tue",
    tuesday: "Tue",
    wed: "Wed",
    wednesday: "Wed",
    thu: "Thu",
    thursday: "Thu",
    fri: "Fri",
    friday: "Fri",
    sat: "Sat",
    saturday: "Sat",
    sun: "Sun",
    sunday: "Sun",
  };

  const formattedDays = days?.length
    ? days
        .map(
          (day) =>
            labels[day.toLowerCase()] ?? day
        )
        .join(" · ")
    : "";

  const formattedTime = formatTime(time);

  if (formattedDays && formattedTime) {
    return `${formattedDays} · ${formattedTime}`;
  }

  return formattedDays || formattedTime || "No schedule";
}

function formatScheduleRows(
  schedules: EnrollmentScheduleRow[],
  enrollmentId: string,
  studentId: string
) {
  const dayLabels: Record<number, string> = {
    0: "Sun",
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
  };

  const studentSchedules = schedules
    .filter(
      (schedule) =>
        schedule.enrollment_id === enrollmentId &&
        schedule.student_id === studentId
    )
    .sort(
      (a, b) =>
        a.day_of_week - b.day_of_week ||
        a.schedule_time.localeCompare(
          b.schedule_time
        )
    );

  if (!studentSchedules.length) {
    return "No schedule";
  }

  return studentSchedules
    .map((schedule) => {
      const day =
        dayLabels[schedule.day_of_week] ??
        String(schedule.day_of_week);

      const time = formatTime(
        schedule.schedule_time
      );

      return time ? `${day} · ${time}` : day;
    })
    .join("  /  ");
}

function getStatusStyles(
  status: string | null
) {
  switch (status) {
    case "active":
      return {
        label: "Active",
        className:
          "bg-[#E5EBDD] text-[#607963]",
      };

    case "pending":
      return {
        label: "Pending",
        className:
          "bg-[#F3EEDC] text-[#927B45]",
      };

    case "completed":
      return {
        label: "Completed",
        className:
          "bg-[#EAE8E3] text-[#77736B]",
      };

    case "cancelled":
    case "canceled":
      return {
        label: "Cancelled",
        className:
          "bg-[#F1E3E0] text-[#95645C]",
      };

    default:
      return {
        label: status
          ? status.charAt(0).toUpperCase() +
            status.slice(1)
          : "Unknown",
        className:
          "bg-[#ECEAE6] text-[#77736B]",
      };
  }
}

function getMonthLabel(monthIndex: number) {
  return new Date(
    2000,
    monthIndex,
    1
  ).toLocaleString("en-US", {
    month: "short",
  });
}

function getMonthFullLabel(monthIndex: number) {
  return new Date(
    2000,
    monthIndex,
    1
  ).toLocaleString("en-US", {
    month: "long",
  });
}

/* ========================================================================= */
/* PAGE                                                                      */
/* ========================================================================= */

export default async function OverviewPage({
  params,
}: OverviewPageProps) {
  const { locale } = await params;

  const supabase = await createClient();

  /* ----------------------------------------------------------------------- */
  /* STUDENTS                                                                */
  /* ----------------------------------------------------------------------- */

  const {
    data: students,
    error: studentsError,
  } = await supabase
    .from("students")
    .select(`
      id,
      student_number,
      full_name,
      preferred_name
    `)
    .order("created_at", {
      ascending: false,
    });

  if (studentsError) {
    console.error(
      "Error loading overview students:",
      studentsError
    );

    throw new Error(
      "Unable to load overview students."
    );
  }

  const studentRows =
    (students ?? []) as StudentRow[];

  /* ----------------------------------------------------------------------- */
  /* ENROLLMENTS                                                             */
  /* ----------------------------------------------------------------------- */

  const {
    data: enrollments,
    error: enrollmentsError,
  } = await supabase
    .from("enrollments")
    .select(`
      id,
      student_id,
      package_name,
      number_of_lessons,
      status,
      start_date,
      schedule_days,
      schedule_time
    `);

  if (enrollmentsError) {
    console.error(
      "Error loading overview enrollments:",
      enrollmentsError
    );

    throw new Error(
      "Unable to load overview enrollments."
    );
  }

  const enrollmentRows =
    (enrollments ?? []) as (
      EnrollmentRow & {
        student_id: string | null;
      }
    )[];

  /* ----------------------------------------------------------------------- */
  /* ENROLLMENT PARTICIPANTS                                                 */
  /* ----------------------------------------------------------------------- */

  const {
    data: enrollmentStudents,
    error:
      enrollmentStudentsError,
  } = await supabase
    .from("enrollment_students")
    .select(`
      enrollment_id,
      student_id
    `);

  if (enrollmentStudentsError) {
    console.error(
      "Error loading overview enrollment participants:",
      enrollmentStudentsError
    );

    throw new Error(
      "Unable to load overview enrollment participants."
    );
  }

  const enrollmentStudentRows =
    (enrollmentStudents ??
      []) as EnrollmentStudentRow[];

  /* ----------------------------------------------------------------------- */
  /* LESSONS                                                                 */
  /* ----------------------------------------------------------------------- */

  const {
    data: lessons,
    error: lessonsError,
  } = await supabase
    .from("lessons")
    .select(`
      id,
      enrollment_id,
      student_id,
      consumes_lesson,
      attendance_status
    `);

  if (lessonsError) {
    console.error(
      "Error loading overview lessons:",
      lessonsError
    );

    throw new Error(
      "Unable to load overview lessons."
    );
  }

  const lessonRows =
    (lessons ?? []) as LessonRow[];

  /* ----------------------------------------------------------------------- */
  /* ENROLLMENT SCHEDULES                                                    */
  /* ----------------------------------------------------------------------- */

  const {
    data: enrollmentSchedules,
    error:
      enrollmentSchedulesError,
  } = await supabase
    .from("enrollment_schedules")
    .select(`
      id,
      enrollment_id,
      student_id,
      day_of_week,
      schedule_time
    `);

  if (enrollmentSchedulesError) {
    console.error(
      "Error loading overview schedules:",
      enrollmentSchedulesError
    );

    throw new Error(
      "Unable to load overview schedules."
    );
  }

  const scheduleRows =
    (enrollmentSchedules ??
      []) as EnrollmentScheduleRow[];

  /* ----------------------------------------------------------------------- */
  /* PAYMENTS                                                                */
  /* ----------------------------------------------------------------------- */

  const {
    data: payments,
    error: paymentsError,
  } = await supabase
    .from("payments")
    .select(`
      id,
      amount,
      currency,
      amount_krw,
      amount_php,
      payment_date,
      status
    `)
    .eq("status", "paid")
    .order("payment_date", {
      ascending: true,
    });

  if (paymentsError) {
    console.error(
      "Error loading overview payments:",
      paymentsError
    );

    throw new Error(
      "Unable to load overview payments."
    );
  }

  const paymentRows =
    (payments ?? []) as PaymentRow[];

  /* ----------------------------------------------------------------------- */
  /* STUDENT / ENROLLMENT HELPERS                                            */
  /* ----------------------------------------------------------------------- */

  function getEnrollmentsForStudent(
    studentId: string
  ) {
    const directEnrollments =
      enrollmentRows.filter(
        (enrollment) =>
          enrollment.student_id ===
          studentId
      );

    const sharedEnrollmentIds =
      enrollmentStudentRows
        .filter(
          (row) =>
            row.student_id === studentId
        )
        .map(
          (row) =>
            row.enrollment_id
        );

    const sharedEnrollments =
      enrollmentRows.filter(
        (enrollment) =>
          sharedEnrollmentIds.includes(
            enrollment.id
          )
      );

    const all = [
      ...directEnrollments,
      ...sharedEnrollments,
    ];

    return Array.from(
      new Map(
        all.map((enrollment) => [
          enrollment.id,
          enrollment,
        ])
      ).values()
    );
  }

  function isSharedEnrollment(
    enrollmentId: string
  ) {
    return (
      enrollmentStudentRows.filter(
        (row) =>
          row.enrollment_id ===
          enrollmentId
      ).length > 1
    );
  }

  function getEnrollmentLessons(
    enrollmentId: string
  ) {
    return lessonRows.filter(
      (lesson) =>
        lesson.enrollment_id ===
        enrollmentId
    );
  }

  /* ----------------------------------------------------------------------- */
  /* ACTIVE ENROLLMENT SCHEDULE                                              */
  /* ----------------------------------------------------------------------- */

  function getStudentSchedule(
    enrollment: EnrollmentRow & {
      student_id: string | null;
    },
    studentId: string
  ) {
    /*
     * Schedule is only valid for the student's
     * current/active enrollment.
     *
     * This guard prevents pending, completed,
     * or cancelled enrollment schedules from
     * appearing in the overview.
     */
    if (enrollment.status !== "active") {
      return "No schedule";
    }

    const schedules =
      scheduleRows.filter(
        (schedule) =>
          schedule.enrollment_id ===
            enrollment.id &&
          schedule.student_id ===
            studentId
      );

    if (schedules.length > 0) {
      /*
       * IMPORTANT:
       * Pass both enrollment ID and student ID
       * so schedules from an older enrollment
       * cannot leak into the current schedule.
       */
      return formatScheduleRows(
        scheduleRows,
        enrollment.id,
        studentId
      );
    }

    /*
     * Legacy individual enrollment schedule.
     * This is only used for an active individual
     * enrollment that does not yet have rows in
     * enrollment_schedules.
     */
    if (
      enrollment.student_id ===
        studentId &&
      !isSharedEnrollment(
        enrollment.id
      )
    ) {
      return formatSchedule(
        enrollment.schedule_days,
        enrollment.schedule_time
      );
    }

    return "No schedule";
  }

  /* ----------------------------------------------------------------------- */
  /* STUDENT COUNTS                                                          */
  /* ----------------------------------------------------------------------- */

  const totalStudents =
    studentRows.length;

  const activeStudentRows =
    studentRows.filter((student) =>
      getEnrollmentsForStudent(
        student.id
      ).some(
        (enrollment) =>
          enrollment.status ===
          "active"
      )
    );

  const activeStudents =
    activeStudentRows.length;

  /* ----------------------------------------------------------------------- */
  /* CURRENT DATE                                                            */
  /* ----------------------------------------------------------------------- */

  const now = new Date();

  const currentYear =
    now.getFullYear();

  const currentMonth =
    now.getMonth();

  /* ----------------------------------------------------------------------- */
  /* PHP AMOUNT                                                              */
  /* ----------------------------------------------------------------------- */

  function getPhpAmount(
    payment: PaymentRow
  ) {
    const value = Number(
      payment.amount_php ?? 0
    );

    return Number.isFinite(value)
      ? value
      : 0;
  }

  /* ----------------------------------------------------------------------- */
  /* ACCUMULATED INCOME                                                      */
  /* ----------------------------------------------------------------------- */

  const accumulatedPhp =
    paymentRows.reduce(
      (total, payment) =>
        total + getPhpAmount(payment),
      0
    );

  /* ----------------------------------------------------------------------- */
  /* CURRENT MONTH INCOME                                                    */
  /* ----------------------------------------------------------------------- */

  const monthlyPhp =
    paymentRows
      .filter((payment) => {
        if (!payment.payment_date) {
          return false;
        }

        const date = new Date(
          `${payment.payment_date}T00:00:00`
        );

        return (
          date.getFullYear() ===
            currentYear &&
          date.getMonth() ===
            currentMonth
        );
      })
      .reduce(
        (total, payment) =>
          total + getPhpAmount(payment),
        0
      );

  /* ----------------------------------------------------------------------- */
  /* YEARLY GRAPH DATA                                                       */
  /* ----------------------------------------------------------------------- */

  const monthlyIncome =
    Array.from(
      { length: 12 },
      (_, month) => {
        return paymentRows
          .filter((payment) => {
            if (!payment.payment_date) {
              return false;
            }

            const date = new Date(
              `${payment.payment_date}T00:00:00`
            );

            return (
              date.getFullYear() ===
                currentYear &&
              date.getMonth() ===
                month
            );
          })
          .reduce(
            (total, payment) =>
              total +
              getPhpAmount(payment),
            0
          );
      }
    );

  const graphMax = Math.max(
    ...monthlyIncome,
    1
  );

  const currentMonthLabel =
    getMonthFullLabel(
      currentMonth
    );

  /* ========================================================================= */
  /* RENDER                                                                    */
  /* ========================================================================= */

  return (
    <main
      className="
        min-h-screen
        bg-[#FAF8F5]
        text-[#292929]
      "
    >
      {/* =================================================================== */}
      {/* HEADER                                                              */}
      {/* =================================================================== */}

      <header
        className="
          px-6
          pt-7
          sm:px-8
          sm:pt-8
          lg:px-12
          xl:px-16
        "
      >
        <div
          className="
            relative
            flex
            items-center
            justify-between
          "
        >
          <Link
            href={`/${locale}/admin`}
            className="
              font-sans
              text-[14px]
              text-[#77736B]
              transition-colors
              hover:text-[#6F8F72]
              sm:text-[15px]
            "
          >
            ← Administration
          </Link>

          <div
            className="
              absolute
              left-1/2
              hidden
              -translate-x-1/2
              whitespace-nowrap
              font-sans
              text-[15px]
              font-medium
              text-[#6F8F72]
              sm:block
            "
          >
            Hamkke │ 함께
          </div>
        </div>
      </header>

      {/* =================================================================== */}
      {/* INTRO                                                               */}
      {/* =================================================================== */}

      <section
        className="
          mx-auto
          max-w-[1200px]
          px-6
          pb-12
          pt-12
          sm:px-8
          sm:pb-14
          sm:pt-16
          lg:px-10
          lg:pb-16
          lg:pt-20
        "
      >
        <div className="max-w-[760px]">
          <p
            className="
              mb-4
              font-sans
              text-[10px]
              font-medium
              uppercase
              tracking-[0.18em]
              text-[#8A8A84]
            "
          >
            Administration
          </p>

          <h1
            className="
              font-serif
              text-[48px]
              font-normal
              leading-[1]
              tracking-[-0.035em]
              sm:text-[58px]
              lg:text-[66px]
            "
          >
            Overview
          </h1>

          <p
            className="
              mt-5
              max-w-[620px]
              font-serif
              text-[18px]
              leading-8
              text-[#74716B]
              sm:text-[20px]
              sm:leading-9
            "
          >
            A simple view of your students,
            lessons, and income.
          </p>
        </div>
      </section>

      {/* =================================================================== */}
      {/* SUMMARY                                                             */}
      {/* =================================================================== */}

      <section
        className="
          mx-auto
          max-w-[1200px]
          px-6
          sm:px-8
          lg:px-10
        "
      >
        <div
          className="
            grid
            grid-cols-1
            gap-12
            border-y
            border-[#DCD8D2]
            py-10
            lg:grid-cols-[0.72fr_1.28fr]
            lg:gap-16
            lg:py-12
          "
        >
          <div
            className="
              flex
              flex-col
              justify-center
              lg:border-r
              lg:border-[#E1DDD7]
              lg:pr-16
            "
          >
            <p
              className="
                mb-6
                font-sans
                text-[10px]
                font-medium
                uppercase
                tracking-[0.18em]
                text-[#8A8A84]
              "
            >
              Students
            </p>

            <div
              className="
                flex
                flex-wrap
                items-baseline
                gap-x-8
                gap-y-3
              "
            >
              <div className="flex items-baseline gap-2.5">
                <span
                  className="
                    font-sans
                    text-[12px]
                    uppercase
                    tracking-[0.1em]
                    text-[#8A8A84]
                  "
                >
                  Active
                </span>

                <span
                  className="
                    font-serif
                    text-[31px]
                    leading-none
                    tracking-[-0.02em]
                  "
                >
                  {activeStudents}
                </span>
              </div>

              <div className="flex items-baseline gap-2.5">
                <span
                  className="
                    font-sans
                    text-[12px]
                    uppercase
                    tracking-[0.1em]
                    text-[#8A8A84]
                  "
                >
                  Total
                </span>

                <span
                  className="
                    font-serif
                    text-[31px]
                    leading-none
                    tracking-[-0.02em]
                  "
                >
                  {totalStudents}
                </span>
              </div>
            </div>

            <p
              className="
                mt-3
                font-serif
                text-[14px]
                text-[#918E87]
              "
            >
              {activeStudents}{" "}
              {activeStudents === 1
                ? "student"
                : "students"}{" "}
              currently enrolled
            </p>
          </div>

          <div>
            <div
              className="
                flex
                items-start
                justify-between
              "
            >
              <p
                className="
                  font-sans
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.18em]
                  text-[#8A8A84]
                "
              >
                Income
              </p>

              <span
                className="
                  font-sans
                  text-[11px]
                  text-[#9A9790]
                "
              >
                {currentYear}
              </span>
            </div>

            <div
              className="
                mt-6
                grid
                grid-cols-2
                gap-10
              "
            >
              <div>
                <p
                  className="
                    font-sans
                    text-[10px]
                    uppercase
                    tracking-[0.12em]
                    text-[#8A8A84]
                  "
                >
                  Monthly income
                </p>

                <p
                  className="
                    mt-2
                    font-serif
                    text-[30px]
                    leading-none
                    tracking-[-0.025em]
                    sm:text-[34px]
                  "
                >
                  {formatMoney(
                    monthlyPhp
                  )}
                </p>

                <p
                  className="
                    mt-2
                    font-serif
                    text-[13px]
                    text-[#918E87]
                  "
                >
                  {currentMonthLabel}{" "}
                  {currentYear}
                </p>
              </div>

              <div>
                <p
                  className="
                    font-sans
                    text-[10px]
                    uppercase
                    tracking-[0.12em]
                    text-[#8A8A84]
                  "
                >
                  Accumulated income
                </p>

                <p
                  className="
                    mt-2
                    font-serif
                    text-[30px]
                    leading-none
                    tracking-[-0.025em]
                    sm:text-[34px]
                  "
                >
                  {formatMoney(
                    accumulatedPhp
                  )}
                </p>

                <p
                  className="
                    mt-2
                    font-serif
                    text-[13px]
                    text-[#918E87]
                  "
                >
                  PHP received
                </p>
              </div>
            </div>

            <div className="mt-9">
              <div
                className="
                  flex
                  h-[145px]
                  items-end
                  gap-2
                  border-b
                  border-[#DCD8D2]
                  sm:gap-3
                "
              >
                {monthlyIncome.map(
                  (amount, index) => {
                    const height =
                      amount > 0
                        ? Math.max(
                            5,
                            (amount /
                              graphMax) *
                              100
                          )
                        : 2;

                    const isCurrentMonth =
                      index ===
                      currentMonth;

                    return (
                      <div
                        key={index}
                        className="
                          group
                          relative
                          flex
                          h-full
                          flex-1
                          items-end
                        "
                      >
                        {amount > 0 && (
                          <div
                            className="
                              pointer-events-none
                              absolute
                              bottom-full
                              left-1/2
                              z-10
                              mb-2
                              -translate-x-1/2
                              whitespace-nowrap
                              rounded
                              bg-[#292929]
                              px-2.5
                              py-1.5
                              font-sans
                              text-[10px]
                              text-white
                              opacity-0
                              transition-opacity
                              group-hover:opacity-100
                            "
                          >
                            {formatMoney(
                              amount
                            )}
                          </div>
                        )}

                        <div
                          className={`
                            w-full
                            rounded-t-[2px]
                            transition-all
                            duration-200
                            ${
                              isCurrentMonth
                                ? "bg-[#6F8F72]"
                                : "bg-[#C8CEC5]"
                            }
                            ${
                              amount === 0
                                ? "opacity-30"
                                : "opacity-100"
                            }
                          `}
                          style={{
                            height: `${height}%`,
                          }}
                        />
                      </div>
                    );
                  }
                )}
              </div>

              <div
                className="
                  mt-2
                  grid
                  grid-cols-12
                  gap-2
                  sm:gap-3
                "
              >
                {monthlyIncome.map(
                  (_, index) => (
                    <span
                      key={index}
                      className={`
                        text-center
                        font-sans
                        text-[9px]
                        ${
                          index ===
                          currentMonth
                            ? "font-medium text-[#6F8F72]"
                            : "text-[#99958E]"
                        }
                      `}
                    >
                      {getMonthLabel(
                        index
                      )}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* CURRENT STUDENTS                                                    */}
      {/* =================================================================== */}

      <section
        className="
          mx-auto
          max-w-[1200px]
          px-6
          pb-20
          pt-14
          sm:px-8
          sm:pb-24
          sm:pt-16
          lg:px-10
        "
      >
        <div
          className="
            mb-7
            flex
            items-end
            justify-between
            gap-6
          "
        >
          <div>
            <p
              className="
                font-sans
                text-[10px]
                font-medium
                uppercase
                tracking-[0.18em]
                text-[#8A8A84]
              "
            >
              Current students
            </p>

            <h2
              className="
                mt-2
                font-serif
                text-[29px]
                font-normal
                tracking-[-0.025em]
              "
            >
              Active Students
            </h2>
          </div>

          <Link
            href={`/${locale}/admin/students`}
            className="
              hidden
              font-sans
              text-[13px]
              text-[#6F8F72]
              transition-colors
              hover:text-[#526B55]
              sm:block
            "
          >
            View all students →
          </Link>
        </div>

        {activeStudentRows.length > 0 ? (
          <div
            className="
              overflow-x-auto
              border-y
              border-[#DCD8D2]
            "
          >
            <table
              className="
                w-full
                min-w-[850px]
                table-fixed
                border-collapse
              "
            >
              <colgroup>
                {/* Student is narrower so Schedule starts closer */}
                <col className="w-[22%]" />

                {/* Schedule gets the largest share of space */}
                <col className="w-[43%]" />

                {/* Progress remains compact and is pushed right */}
                <col className="w-[21%]" />

                {/* Status remains compact */}
                <col className="w-[14%]" />
              </colgroup>

              <thead>
                <tr
                  className="
                    border-b
                    border-[#DCD8D2]
                  "
                >
                  {/* STUDENT */}

                  <th
                    className="
                      py-4
                      pl-3
                      pr-2
                      text-left
                      font-sans
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.14em]
                      text-[#8A8A84]
                      sm:pl-4
                      sm:pr-2
                    "
                  >
                    Student
                  </th>

                  {/* SCHEDULE */}

                  <th
                    className="
                      py-4
                      pl-0
                      pr-2
                      text-center
                      font-sans
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.14em]
                      text-[#8A8A84]
                      sm:pl-0
                      sm:pr-3
                    "
                  >
                    Schedule
                  </th>

                  {/* PROGRESS */}

                  <th
                    className="
                      py-4
                      pl-10
                      pr-2
                      text-center
                      font-sans
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.14em]
                      text-[#8A8A84]
                      sm:pl-12
                      sm:pr-3
                    "
                  >
                    Progress
                  </th>

                  {/* STATUS */}

                  <th
                    className="
                      px-3
                      py-4
                      text-right
                      font-sans
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.14em]
                      text-[#8A8A84]
                      sm:px-4
                    "
                  >
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {activeStudentRows.map(
                  (student) => {
                    /*
                     * Only an ACTIVE enrollment is
                     * considered for this table.
                     *
                     * This guarantees that the schedule,
                     * progress, and status all belong to
                     * the same current enrollment.
                     */
                    const activeEnrollment =
                      getEnrollmentsForStudent(
                        student.id
                      ).find(
                        (enrollment) =>
                          enrollment.status ===
                          "active"
                      );

                    if (
                      !activeEnrollment
                    ) {
                      return null;
                    }

                    const shared =
                      isSharedEnrollment(
                        activeEnrollment.id
                      );

                    /*
                     * Lessons are also taken from the
                     * active enrollment only.
                     *
                     * For shared enrollments, this is
                     * intentionally the entire shared
                     * lesson pool rather than lessons
                     * belonging only to this student.
                     */
                    const lessons =
                      getEnrollmentLessons(
                        activeEnrollment.id
                      );

                    const consumedLessons =
                      lessons.filter(
                        (lesson) =>
                          lesson.consumes_lesson
                      ).length;

                    const totalLessons =
                      activeEnrollment.number_of_lessons ??
                      0;

                    const remainingLessons =
                      Math.max(
                        0,
                        totalLessons -
                          consumedLessons
                      );

                    const progress =
                      totalLessons > 0
                        ? Math.min(
                            100,
                            Math.round(
                              (consumedLessons /
                                totalLessons) *
                                100
                            )
                          )
                        : 0;

                    const status =
                      getStatusStyles(
                        activeEnrollment.status
                      );

                    const studentName =
                      student.preferred_name ||
                      student.full_name;

                    /*
                     * Schedule is explicitly retrieved
                     * from this student's active enrollment.
                     *
                     * This prevents schedules from previous
                     * enrollments from appearing here.
                     */
                    const schedule =
                      getStudentSchedule(
                        activeEnrollment,
                        student.id
                      );

                    return (
                      <tr
                        key={student.id}
                        className="
                          border-b
                          border-[#E7E3DD]
                          transition-colors
                          last:border-b-0
                          hover:bg-[#F2F5F0]
                        "
                      >
                        {/* ================================================= */}
                        {/* STUDENT                                            */}
                        {/* ================================================= */}

                        <td
                          className="
                            py-4
                            pl-3
                            pr-2
                            text-left
                            sm:py-[18px]
                            sm:pl-4
                            sm:pr-2
                          "
                        >
                          <Link
                            href={`/${locale}/admin/students/${student.id}`}
                            className="
                              font-serif
                              text-[17px]
                              leading-6
                              tracking-[-0.01em]
                              transition-colors
                              hover:text-[#6F8F72]
                            "
                          >
                            {studentName}
                          </Link>

                          <p
                            className="
                              mt-1
                              font-sans
                              text-[10px]
                              uppercase
                              tracking-[0.12em]
                              text-[#9A9790]
                            "
                          >
                            {student.student_number ??
                              "—"}
                          </p>

                          {shared && (
                            <span
                              className="
                                mt-2
                                inline-flex
                                items-center
                                rounded-full
                                bg-[#EEF1EB]
                                px-2
                                py-1
                                font-sans
                                text-[8px]
                                font-medium
                                uppercase
                                tracking-[0.1em]
                                text-[#6F856F]
                              "
                            >
                              Shared enrollment
                            </span>
                          )}
                        </td>

                        {/* ================================================= */}
                        {/* SCHEDULE                                           */}
                        {/* ================================================= */}

                        <td
                          className="
                            py-4
                            pl-0
                            pr-2
                            text-left
                            font-serif
                            text-[14px]
                            leading-6
                            tracking-[-0.005em]
                            text-[#55544F]
                            sm:py-[18px]
                            sm:pl-0
                            sm:pr-3
                          "
                        >
                          {schedule}
                        </td>

                        {/* ================================================= */}
                        {/* PROGRESS                                           */}
                        {/* ================================================= */}

                        <td
                          className="
                            py-4
                            pl-10
                            pr-2
                            text-left
                            sm:py-[18px]
                            sm:pl-12
                            sm:pr-3
                          "
                        >
                          <div
                            className="
                              w-full
                              max-w-[180px]
                            "
                          >
                            <div
                              className="
                                mb-1.5
                                flex
                                items-center
                                justify-between
                                gap-2
                              "
                            >
                              <span
                                className="
                                  font-serif
                                  text-[14px]
                                  leading-5
                                  text-[#4E4D48]
                                "
                              >
                                {consumedLessons}{" "}
                                /{" "}
                                {totalLessons}
                              </span>

                              <span
                                className="
                                  shrink-0
                                  font-sans
                                  text-[9px]
                                  text-[#99958E]
                                "
                              >
                                {progress}%
                              </span>
                            </div>

                            <div
                              className="
                                h-[3px]
                                w-full
                                overflow-hidden
                                rounded-full
                                bg-[#E4E1DB]
                              "
                            >
                              <div
                                className="
                                  h-full
                                  rounded-full
                                  bg-[#7B927C]
                                  transition-all
                                "
                                style={{
                                  width: `${progress}%`,
                                }}
                              />
                            </div>

                            <p
                              className="
                                mt-1.5
                                font-sans
                                text-[9px]
                                leading-4
                                text-[#99958E]
                              "
                            >
                              {remainingLessons}{" "}
                              {remainingLessons ===
                              1
                                ? "lesson"
                                : "lessons"}{" "}
                              remaining
                            </p>
                          </div>
                        </td>

                        {/* ================================================= */}
                        {/* STATUS                                             */}
                        {/* ================================================= */}

                        <td
                          className="
                            px-3
                            py-4
                            text-right
                            sm:px-4
                            sm:py-[18px]
                          "
                        >
                          <span
                            className={`
                              inline-flex
                              items-center
                              rounded-full
                              px-2.5
                              py-1.5
                              font-sans
                              text-[8px]
                              font-medium
                              uppercase
                              tracking-[0.1em]
                              ${status.className}
                            `}
                          >
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            className="
              border-y
              border-[#DCD8D2]
              py-20
              text-center
            "
          >
            <h3
              className="
                font-serif
                text-[27px]
                font-normal
              "
            >
              No active students
            </h3>

            <p
              className="
                mx-auto
                mt-3
                max-w-[420px]
                font-serif
                text-[16px]
                leading-7
                text-[#74716B]
              "
            >
              Students will appear here once
              they have an active enrollment.
            </p>

            {totalStudents > 0 && (
              <Link
                href={`/${locale}/admin/students`}
                className="
                  mt-6
                  inline-block
                  font-sans
                  text-[13px]
                  text-[#6F8F72]
                  underline
                  underline-offset-4
                "
              >
                View all students
              </Link>
            )}
          </div>
        )}
      </section>
    </main>
  );
}