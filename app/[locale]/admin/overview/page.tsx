import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface OverviewPageProps {
  params: Promise<{
    locale: string;
  }>;
}

interface StudentRow {
  id: string;
  student_number: string | number | null;
  full_name: string;
  preferred_name: string | null;
  enrollments:
    | {
        id: string;
        package_name: string | null;
        number_of_lessons: number | null;
        status: string | null;
        start_date: string | null;
        schedule_days: string[] | null;
        schedule_time: string | null;
        lessons:
          | {
              id: string;
              consumes_lesson: boolean | null;
              attendance_status: string | null;
            }[]
          | null;
      }[]
    | null;
}

interface PaymentRow {
  amount: number | null;
  currency: string | null;
  payment_date: string | null;
  status: string | null;
}

function formatMoney(
  amount: number,
  currency: string
) {
  if (currency === "KRW") {
    return `₩${amount.toLocaleString("en-US")}`;
  }

  return `${currency} ${amount.toLocaleString(
    "en-US"
  )}`;
}

function formatSchedule(
  days: string[] | null,
  time: string | null
) {
  if (!days || days.length === 0) {
    return time ? time : "No schedule";
  }

  const formattedDays = days
    .map((day) => {
      const normalized = day.toLowerCase();

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

      return labels[normalized] ?? day;
    })
    .join(" / ");

  if (!time) {
    return formattedDays;
  }

  return `${formattedDays} · ${formatTime(time)}`;
}

function formatTime(time: string) {
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
  const displayHour =
    hour % 12 === 0 ? 12 : hour % 12;

  return `${displayHour}:${minute} ${suffix}`;
}

function getStatusStyles(status: string | null) {
  switch (status) {
    case "active":
      return {
        label: "Active",
        className:
          "bg-[#E2EBDD] text-[#5F7D63]",
      };

    case "pending":
      return {
        label: "Pending",
        className:
          "bg-[#F5EEDB] text-[#92783F]",
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
          "bg-[#F2E3E0] text-[#95645C]",
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

export default async function OverviewPage({
  params,
}: OverviewPageProps) {
  const { locale } = await params;

  const supabase = await createClient();

  /*
   * --------------------------------------------------------------------------
   * STUDENTS
   * --------------------------------------------------------------------------
   */

  const {
    data: students,
    error: studentsError,
  } = await supabase
    .from("students")
    .select(`
      id,
      student_number,
      full_name,
      preferred_name,
      enrollments (
        id,
        package_name,
        number_of_lessons,
        status,
        start_date,
        schedule_days,
        schedule_time,
        lessons (
          id,
          consumes_lesson,
          attendance_status
        )
      )
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

  /*
   * --------------------------------------------------------------------------
   * PAYMENTS
   * --------------------------------------------------------------------------
   *
   * Only PAID payments are counted as income.
   */

  const {
    data: payments,
    error: paymentsError,
  } = await supabase
    .from("payments")
    .select(`
      amount,
      currency,
      payment_date,
      status
    `)
    .eq("status", "paid")
    .order("payment_date", {
      ascending: false,
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

  /*
   * --------------------------------------------------------------------------
   * COUNTS
   * --------------------------------------------------------------------------
   */

  const totalStudents =
    studentRows.length;

  const activeStudents =
    studentRows.filter((student) =>
      (student.enrollments ?? []).some(
        (enrollment) =>
          enrollment.status === "active"
      )
    ).length;

  /*
   * --------------------------------------------------------------------------
   * INCOME
   * --------------------------------------------------------------------------
   *
   * Keep currencies separate.
   *
   * At the moment, KRW is the primary currency.
   */

  const krwPayments =
    paymentRows.filter(
      (payment) =>
        (payment.currency ?? "KRW").toUpperCase() ===
        "KRW"
    );

  const accumulatedKrw =
    krwPayments.reduce(
      (total, payment) =>
        total + Number(payment.amount ?? 0),
      0
    );

  const now = new Date();

  const currentYear =
    now.getFullYear();

  const currentMonth =
    now.getMonth();

  const monthlyKrw =
    krwPayments
      .filter((payment) => {
        if (!payment.payment_date) {
          return false;
        }

        const date = new Date(
          `${payment.payment_date}T00:00:00`
        );

        return (
          date.getFullYear() === currentYear &&
          date.getMonth() === currentMonth
        );
      })
      .reduce(
        (total, payment) =>
          total + Number(payment.amount ?? 0),
        0
      );

  /*
   * --------------------------------------------------------------------------
   * ACTIVE STUDENTS FOR TABLE
   * --------------------------------------------------------------------------
   */

  const activeStudentRows =
    studentRows.filter((student) =>
      (student.enrollments ?? []).some(
        (enrollment) =>
          enrollment.status === "active"
      )
    );

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
      {/* HEADER */}
      <header
        className="
          w-full
          px-6
          pt-7
          sm:px-8
          sm:pt-8
          lg:px-10
          xl:px-12
        "
      >
        <div className="relative flex w-full items-center justify-between">
          <Link
            href={`/${locale}/admin`}
            className="
              shrink-0
              font-sans
              text-[15px]
              text-[#5F655F]
              transition-colors
              duration-200
              hover:text-[#6F8F72]
              sm:text-[16px]
            "
          >
            &larr; Administration
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
              sm:text-[16px]
            "
          >
            Hamkke │ 함께
          </div>
        </div>
      </header>

      {/* INTRO */}
      <section
        className="
          mx-auto
          w-full
          max-w-[1200px]
          px-6
          pb-10
          pt-10
          sm:px-8
          sm:pb-12
          sm:pt-16
          lg:px-10
          lg:pb-14
          lg:pt-20
        "
      >
        <h1
          className="
            font-serif
            text-[52px]
            font-normal
            leading-[1.05]
            tracking-[-0.035em]
            text-[#292929]
            sm:text-[62px]
            lg:text-[70px]
          "
        >
          Overview
        </h1>

        <p
          className="
            mt-5
            max-w-[700px]
            font-serif
            text-[19px]
            leading-8
            text-[#6B6B66]
            sm:text-[21px]
            sm:leading-9
          "
        >
          A quick look at your students and
          income.
        </p>
      </section>

      {/* SUMMARY */}
      <section
        className="
          mx-auto
          grid
          w-full
          max-w-[1200px]
          grid-cols-1
          gap-4
          px-6
          pb-12
          sm:grid-cols-2
          lg:grid-cols-4
          sm:px-8
          lg:px-10
        "
      >
        {/* TOTAL STUDENTS */}
        <div
          className="
            border
            border-[#DCD8D2]
            bg-white/40
            p-7
            sm:p-8
          "
        >
          <p
            className="
              font-sans
              text-[11px]
              font-medium
              uppercase
              tracking-[0.14em]
              text-[#8A8A84]
            "
          >
            Total Students
          </p>

          <p
            className="
              mt-4
              font-serif
              text-[36px]
              font-normal
              tracking-[-0.02em]
              text-[#292929]
              sm:text-[42px]
            "
          >
            {totalStudents}
          </p>

          <p
            className="
              mt-2
              font-serif
              text-[15px]
              text-[#8A8A84]
            "
          >
            All students
          </p>
        </div>

        {/* ACTIVE STUDENTS */}
        <div
          className="
            border
            border-[#DCD8D2]
            bg-white/40
            p-7
            sm:p-8
          "
        >
          <p
            className="
              font-sans
              text-[11px]
              font-medium
              uppercase
              tracking-[0.14em]
              text-[#8A8A84]
            "
          >
            Active Students
          </p>

          <p
            className="
              mt-4
              font-serif
              text-[36px]
              font-normal
              tracking-[-0.02em]
              text-[#292929]
              sm:text-[42px]
            "
          >
            {activeStudents}
          </p>

          <p
            className="
              mt-2
              font-serif
              text-[15px]
              text-[#8A8A84]
            "
          >
            Currently enrolled
          </p>
        </div>

        {/* ACCUMULATED INCOME */}
        <div
          className="
            border
            border-[#DCD8D2]
            bg-white/40
            p-7
            sm:p-8
          "
        >
          <p
            className="
              font-sans
              text-[11px]
              font-medium
              uppercase
              tracking-[0.14em]
              text-[#8A8A84]
            "
          >
            Accumulated Income
          </p>

          <p
            className="
              mt-4
              font-serif
              text-[36px]
              font-normal
              tracking-[-0.02em]
              text-[#292929]
              sm:text-[42px]
            "
          >
            {formatMoney(
              accumulatedKrw,
              "KRW"
            )}
          </p>

          <p
            className="
              mt-2
              font-serif
              text-[15px]
              text-[#8A8A84]
            "
          >
            Paid payments · KRW
          </p>
        </div>

        {/* MONTHLY INCOME */}
        <div
          className="
            border
            border-[#DCD8D2]
            bg-white/40
            p-7
            sm:p-8
          "
        >
          <p
            className="
              font-sans
              text-[11px]
              font-medium
              uppercase
              tracking-[0.14em]
              text-[#8A8A84]
            "
          >
            Monthly Income
          </p>

          <p
            className="
              mt-4
              font-serif
              text-[36px]
              font-normal
              tracking-[-0.02em]
              text-[#292929]
              sm:text-[42px]
            "
          >
            {formatMoney(
              monthlyKrw,
              "KRW"
            )}
          </p>

          <p
            className="
              mt-2
              font-serif
              text-[15px]
              text-[#8A8A84]
            "
          >
            Current month · KRW
          </p>
        </div>
      </section>

      {/* STUDENTS */}
      <section
        className="
          mx-auto
          w-full
          max-w-[1200px]
          px-6
          pb-20
          sm:px-8
          lg:px-10
          lg:pb-24
        "
      >
        {/* SECTION HEADER */}
        <div
          className="
            mb-6
            flex
            items-end
            justify-between
            gap-4
          "
        >
          <div>
            <p
              className="
                font-sans
                text-[11px]
                font-medium
                uppercase
                tracking-[0.14em]
                text-[#8A8A84]
              "
            >
              Students
            </p>

            <h2
              className="
                mt-2
                font-serif
                text-[32px]
                font-normal
                tracking-[-0.02em]
              "
            >
              Active Students
            </h2>

            <p
              className="
                mt-2
                font-sans
                text-[13px]
                text-[#8A8A84]
              "
            >
              {activeStudents}{" "}
              {activeStudents === 1
                ? "student"
                : "students"}{" "}
              currently active
            </p>
          </div>

          <Link
            href={`/${locale}/admin/students`}
            className="
              font-sans
              text-[14px]
              text-[#6F8F72]
              transition-colors
              hover:text-[#526B55]
            "
          >
            View all students →
          </Link>
        </div>

        {/* TABLE */}
        {activeStudentRows.length > 0 ? (
          <div className="overflow-x-auto border-y border-[#DCD8D2]">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="border-b border-[#DCD8D2]">
                  <th className="px-4 py-4 text-left font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-[#8A8A84]">
                    Student No.
                  </th>

                  <th className="px-4 py-4 text-left font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-[#8A8A84]">
                    Student
                  </th>

                  <th className="px-4 py-4 text-left font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-[#8A8A84]">
                    Current Enrollment
                  </th>

                  <th className="px-4 py-4 text-left font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-[#8A8A84]">
                    Schedule & Time
                  </th>

                  <th className="px-4 py-4 text-left font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-[#8A8A84]">
                    Classes Left
                  </th>

                  <th className="px-4 py-4 text-left font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-[#8A8A84]">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {activeStudentRows.map(
                  (student) => {
                    const activeEnrollment =
                      (
                        student.enrollments ??
                        []
                      ).find(
                        (enrollment) =>
                          enrollment.status ===
                          "active"
                      );

                    if (!activeEnrollment) {
                      return null;
                    }

                    const lessons =
                      activeEnrollment.lessons ??
                      [];

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

                    const status =
                      getStatusStyles(
                        activeEnrollment.status
                      );

                    return (
                      <tr
                        key={student.id}
                        className="
                          border-b
                          border-[#E7E3DD]
                          transition-colors
                          hover:bg-[#F0F4ED]
                        "
                      >
                        <td className="px-4 py-5 font-sans text-[14px] text-[#6B6B66]">
                          {student.student_number ??
                            "—"}
                        </td>

                        <td className="px-4 py-5">
                          <Link
                            href={`/${locale}/admin/students/${student.id}`}
                            className="
                              font-serif
                              text-[17px]
                              transition-colors
                              hover:text-[#6F8F72]
                            "
                          >
                            {student.preferred_name ||
                              student.full_name}
                          </Link>

                          {student.preferred_name &&
                            student.preferred_name !==
                              student.full_name && (
                              <p
                                className="
                                  mt-1
                                  font-sans
                                  text-[12px]
                                  text-[#8A8A84]
                                "
                              >
                                {student.full_name}
                              </p>
                            )}
                        </td>

                        <td className="px-4 py-5 font-serif text-[16px]">
                          {activeEnrollment.package_name ||
                            "Enrollment"}
                        </td>

                        <td className="px-4 py-5 font-serif text-[15px]">
                          {formatSchedule(
                            activeEnrollment.schedule_days,
                            activeEnrollment.schedule_time
                          )}
                        </td>

                        <td className="px-4 py-5 font-serif text-[17px] font-medium">
                          {remainingLessons}
                        </td>

                        <td className="px-4 py-5">
                          <span
                            className={`
                              inline-flex
                              items-center
                              rounded-full
                              px-3
                              py-1.5
                              font-sans
                              text-[11px]
                              font-medium
                              uppercase
                              tracking-[0.08em]
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
                text-[28px]
                font-normal
              "
            >
              No active students
            </h3>

            <p
              className="
                mx-auto
                mt-3
                max-w-md
                font-serif
                text-[17px]
                leading-7
                text-[#6B6B66]
              "
            >
              Once a student has an active
              enrollment, they will appear here.
            </p>

            {totalStudents > 0 && (
              <Link
                href={`/${locale}/admin/students`}
                className="
                  mt-7
                  inline-block
                  font-sans
                  text-sm
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