import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import {
  isValidLocale,
  type Locale,
} from "@/lib/i18n";

interface StudentPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

type LessonStatus =
  | "scheduled"
  | "completed"
  | "rescheduled"
  | "unexpected"
  | "teacher_cancelled";

interface LessonRecord {
  id: string;
  enrollment_id: string;
  lesson_number: number;
  lesson_date: string | null;
  duration: number | null;
  attendance_status: LessonStatus;
  notes: string | null;
  created_at: string;
}

interface PaymentRecord {
  id: string;
  enrollment_id: string;
  amount: number;
  currency: string;
  payment_date: string | null;
  payment_method: string | null;
  status: string;
  reference: string | null;
  notes: string | null;
  created_at: string;
}

export default async function StudentPage({
  params,
}: StudentPageProps) {
  const { locale, id } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const currentLocale = locale as Locale;

  const supabase = await createClient();

  /* ------------------------------------------------------------------------ */
  /* STUDENT                                                                  */
  /* ------------------------------------------------------------------------ */

  const {
    data: student,
    error: studentError,
  } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .single();

  if (studentError || !student) {
    notFound();
  }

  /* ------------------------------------------------------------------------ */
  /* ENROLLMENTS                                                               */
  /* ------------------------------------------------------------------------ */

  const {
    data: enrollments,
    error: enrollmentError,
  } = await supabase
    .from("enrollments")
    .select("*")
    .eq("student_id", id)
    .order("created_at", {
      ascending: false,
    });

  if (enrollmentError) {
    console.error(
      "ENROLLMENT ERROR:",
      enrollmentError
    );
  }

  /*
   * For now, the student's most recent enrollment
   * is the active enrollment displayed on this page.
   */
  const enrollment =
    enrollments?.[0] ?? null;

  /* ------------------------------------------------------------------------ */
  /* LESSON RECORDS                                                            */
  /* ------------------------------------------------------------------------ */

  let lessonRecords: LessonRecord[] = [];

  if (enrollment) {
    const {
      data: lessons,
      error: lessonsError,
    } = await supabase
      .from("lessons")
      .select(`
        id,
        enrollment_id,
        lesson_number,
        lesson_date,
        duration,
        attendance_status,
        notes,
        created_at
      `)
      .eq("enrollment_id", enrollment.id)
      .order("lesson_number", {
        ascending: true,
      });

    if (lessonsError) {
      console.error(
        "LESSONS ERROR:",
        lessonsError
      );
    }

    lessonRecords =
      (lessons ?? []) as LessonRecord[];
  }

  /* ------------------------------------------------------------------------ */
  /* PAYMENTS                                                                  */
  /* ------------------------------------------------------------------------ */

  let paymentRecords: PaymentRecord[] = [];

  if (enrollment) {
    const {
      data: payments,
      error: paymentsError,
    } = await supabase
      .from("payments")
      .select(`
        id,
        enrollment_id,
        amount,
        currency,
        payment_date,
        payment_method,
        status,
        reference,
        notes,
        created_at
      `)
      .eq("enrollment_id", enrollment.id)
      .order("payment_date", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      });

    if (paymentsError) {
      console.error(
        "PAYMENTS ERROR:",
        paymentsError
      );
    }

    paymentRecords =
      (payments ?? []) as PaymentRecord[];
  }

  /* ------------------------------------------------------------------------ */
  /* PAYMENT CALCULATIONS                                                      */
  /* ------------------------------------------------------------------------ */

  const totalTuition = enrollment
    ? Number(
        enrollment.tuition_amount ?? 0
      )
    : 0;

  const totalPaid = paymentRecords
    .filter(
      (payment) =>
        payment.status.toLowerCase() === "paid"
    )
    .reduce(
      (total, payment) =>
        total + Number(payment.amount ?? 0),
      0
    );

  const balanceRemaining = Math.max(
    totalTuition - totalPaid,
    0
  );

  /* ------------------------------------------------------------------------ */
  /* LESSON CALCULATIONS                                                       */
  /* ------------------------------------------------------------------------ */

  const totalLessons =
    Number(
      enrollment?.number_of_lessons ?? 0
    );

  const completedLessons =
    lessonRecords.filter(
      (lesson) =>
        lesson.attendance_status ===
        "completed"
    ).length;

  const scheduledLessons =
    lessonRecords.filter(
      (lesson) =>
        lesson.attendance_status ===
        "scheduled"
    ).length;

  const rescheduledLessons =
    lessonRecords.filter(
      (lesson) =>
        lesson.attendance_status ===
        "rescheduled"
    ).length;

  const unexpectedLessons =
    lessonRecords.filter(
      (lesson) =>
        lesson.attendance_status ===
        "unexpected"
    ).length;

  const teacherCancelledLessons =
    lessonRecords.filter(
      (lesson) =>
        lesson.attendance_status ===
        "teacher_cancelled"
    ).length;

  /*
   * Only completed lessons consume the package.
   *
   * Rescheduled, unexpected, and teacher-cancelled
   * lessons remain part of the student's lesson
   * entitlement and therefore remain available
   * as lesson credit.
   */
  const remainingLessons = Math.max(
    totalLessons - completedLessons,
    0
  );

  /*
   * Total lessons that currently represent
   * unused credit.
   */
  const lessonCredits =
    rescheduledLessons +
    unexpectedLessons +
    teacherCancelledLessons;

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <main
      className="
        min-h-screen
        bg-[#FAF8F5]
        px-6
        py-12
        text-[#292929]

        sm:px-8
        sm:py-16

        lg:px-10
        lg:py-20
      "
    >
      <div className="mx-auto max-w-5xl">

        {/* ------------------------------------------------------------------ */}
        {/* BACK                                                               */}
        {/* ------------------------------------------------------------------ */}

        <Link
          href={`/${currentLocale}/admin/students`}
          className="
            font-sans
            text-[13px]
            font-medium
            text-[#6F8F72]
            transition
            hover:opacity-70
          "
        >
          ← Students
        </Link>

        {/* ------------------------------------------------------------------ */}
        {/* HEADER                                                             */}
        {/* ------------------------------------------------------------------ */}

        <div className="mt-10">
          <p
            className="
              font-sans
              text-[12px]
              font-medium
              uppercase
              tracking-[0.16em]
              text-[#6F8F72]
            "
          >
            Student
          </p>

          <div
            className="
              mt-4
              flex
              flex-col
              gap-6

              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >
            <div>
              <h1
                className="
                  font-serif
                  text-[46px]
                  font-normal
                  leading-tight
                  tracking-[-0.03em]

                  sm:text-[54px]
                "
              >
                {student.full_name}
              </h1>

              {student.preferred_name && (
                <p
                  className="
                    mt-2
                    font-sans
                    text-[15px]
                    text-[#777]
                  "
                >
                  “{student.preferred_name}”
                </p>
              )}
            </div>

            <div
              className="
                flex
                flex-col
                gap-3

                sm:items-end
              "
            >
              {enrollment && (
                <span
                  className="
                    inline-flex
                    w-fit
                    rounded-full
                    bg-[#E2EBDD]
                    px-4
                    py-2
                    font-sans
                    text-[12px]
                    font-medium
                    capitalize
                    text-[#5F7F63]
                  "
                >
                  {enrollment.status}
                </span>
              )}

              {enrollment && (
                <Link
                  href={`/${currentLocale}/admin/students/${student.id}/contract`}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-[#6F8F72]
                    px-5
                    py-3
                    font-sans
                    text-[13px]
                    font-medium
                    text-white
                    transition
                    hover:bg-[#5F7F63]
                  "
                >
                  <FileText
                    size={15}
                    strokeWidth={1.8}
                  />

                  Generate Contract
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* STUDENT INFORMATION                                                */}
        {/* ------------------------------------------------------------------ */}

        <section
          className="
            mt-6
            rounded-3xl
            border
            border-[#E7DDD1]
            bg-white
            p-7

            sm:p-9
          "
        >
          <SectionLabel>
            Student Information
          </SectionLabel>

          <div
            className="
              mt-7
              grid
              gap-x-8
              gap-y-7

              sm:grid-cols-2
            "
          >
            <InfoItem
              label="Email"
              value={student.email}
            />

            <InfoItem
              label="Contact Method"
              value={student.contact_method}
            />

            <InfoItem
              label="Country"
              value={student.country}
            />

            <InfoItem
              label="Preferred Language"
              value={
                student.preferred_language
              }
            />

            <InfoItem
              label="Timezone"
              value={student.timezone}
            />
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* ENROLLMENT                                                          */}
        {/* ------------------------------------------------------------------ */}

        <section
          className="
            mt-6
            rounded-3xl
            border
            border-[#E7DDD1]
            bg-white
            p-7

            sm:p-9
          "
        >
          <div
            className="
              flex
              flex-col
              gap-2

              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >
            <div>
              <SectionLabel>
                Enrollment
              </SectionLabel>

              <h2
                className="
                  mt-3
                  font-serif
                  text-[30px]
                  font-normal
                "
              >
                {enrollment?.package_name ??
                  "No enrollment"}
              </h2>
            </div>
          </div>

          {!enrollment && (
            <div
              className="
                mt-6
                rounded-2xl
                border
                border-dashed
                border-[#D8CCBE]
                bg-[#FAF8F5]
                px-6
                py-8
              "
            >
              <p
                className="
                  font-serif
                  text-[22px]
                  text-[#555]
                "
              >
                No enrollment yet
              </p>

              <p
                className="
                  mt-2
                  font-sans
                  text-[13px]
                  leading-6
                  text-[#777]
                "
              >
                Create an enrollment to assign a
                lesson package and automatically
                create its lesson schedule.
              </p>
            </div>
          )}

          {enrollment && (
            <>
              <div
                className="
                  mt-8
                  grid
                  gap-x-8
                  gap-y-7

                  sm:grid-cols-2
                  lg:grid-cols-3
                "
              >
                <InfoItem
                  label="Lessons"
                  value={String(
                    enrollment.number_of_lessons
                  )}
                />

                <InfoItem
                  label="Lesson Duration"
                  value={
                    enrollment.lesson_duration
                      ? `${enrollment.lesson_duration} minutes`
                      : null
                  }
                />

                <InfoItem
                  label="Lessons Per Week"
                  value={String(
                    enrollment.lessons_per_week
                  )}
                />

                <InfoItem
                  label="Tuition"
                  value={`${enrollment.currency} ${Number(
                    enrollment.tuition_amount ?? 0
                  ).toLocaleString()}`}
                />

                <InfoItem
                  label="Start Date"
                  value={formatDate(
                    enrollment.start_date
                  )}
                />

                <InfoItem
                  label="Enrollment Status"
                  value={enrollment.status}
                />

                <InfoItem
                  label="Lesson Days"
                  value={formatScheduleDays(
                    enrollment.schedule_days
                  )}
                />

                <InfoItem
                  label="Lesson Time"
                  value={formatTime(
                    enrollment.schedule_time
                  )}
                />

                <InfoItem
                  label="Timezone"
                  value={student.timezone}
                />
              </div>

              <div
                className="
                  mt-8
                  rounded-2xl
                  border
                  border-[#E7DDD1]
                  bg-[#FAF8F5]
                  px-5
                  py-5
                "
              >
                <p
                  className="
                    font-sans
                    text-[10px]
                    font-medium
                    uppercase
                    tracking-[0.12em]
                    text-[#999]
                  "
                >
                  Package Status
                </p>

                <p
                  className="
                    mt-2
                    font-serif
                    text-[21px]
                    text-[#444]
                  "
                >
                  {enrollment.status}
                </p>

                <p
                  className="
                    mt-1
                    font-sans
                    text-[12px]
                    leading-5
                    text-[#777]
                  "
                >
                  Enrollment status tracks the
                  student's package or enrollment
                  state. Individual lesson outcomes
                  are recorded separately below.
                </p>
              </div>
            </>
          )}
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* LESSONS & ATTENDANCE                                                */}
        {/* ------------------------------------------------------------------ */}

        {enrollment && (
          <section
            className="
              mt-6
              rounded-3xl
              border
              border-[#E7DDD1]
              bg-white
              p-7

              sm:p-9
            "
          >
            <div
              className="
                flex
                flex-col
                gap-5

                sm:flex-row
                sm:items-end
                sm:justify-between
              "
            >
              <div>
                <SectionLabel>
                  Progress
                </SectionLabel>

                <h2
                  className="
                    mt-3
                    font-serif
                    text-[30px]
                    font-normal
                  "
                >
                  Lessons & Attendance
                </h2>

                <p
                  className="
                    mt-2
                    max-w-2xl
                    font-sans
                    text-[14px]
                    leading-6
                    text-[#666]
                  "
                >
                  Lessons are created automatically
                  when the enrollment is created.
                  Update each lesson after it takes
                  place. Rescheduled and cancelled
                  lessons remain available as package
                  credit.
                </p>
              </div>
            </div>

            {/* PROGRESS */}

            <div
              className="
                mt-8
                grid
                gap-3

                sm:grid-cols-2
                lg:grid-cols-4
              "
            >
              <ProgressCard
                label="Package"
                value={String(totalLessons)}
              />

              <ProgressCard
                label="Completed"
                value={String(
                  completedLessons
                )}
              />

              <ProgressCard
                label="Remaining"
                value={String(
                  remainingLessons
                )}
              />

              <ProgressCard
                label="Credits"
                value={String(
                  lessonCredits
                )}
              />
            </div>

            {/* STATUS BREAKDOWN */}

            <div
              className="
                mt-3
                grid
                gap-3

                sm:grid-cols-2
                lg:grid-cols-4
              "
            >
              <MiniProgressCard
                label="Scheduled"
                value={scheduledLessons}
              />

              <MiniProgressCard
                label="Rescheduled / Credit"
                value={rescheduledLessons}
              />

              <MiniProgressCard
                label="Unexpected / Credit"
                value={unexpectedLessons}
              />

              <MiniProgressCard
                label="Teacher Cancelled / Credit"
                value={
                  teacherCancelledLessons
                }
              />
            </div>

            {/* RECURRING SCHEDULE */}

            <div
              className="
                mt-8
                rounded-2xl
                border
                border-[#E7DDD1]
                bg-[#FAF8F5]
                px-5
                py-5
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-2

                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <div>
                  <p
                    className="
                      font-sans
                      text-[11px]
                      font-medium
                      uppercase
                      tracking-[0.12em]
                      text-[#999]
                    "
                  >
                    Recurring Schedule
                  </p>

                  <p
                    className="
                      mt-2
                      font-serif
                      text-[21px]
                      text-[#444]
                    "
                  >
                    {formatScheduleDays(
                      enrollment.schedule_days
                    )}
                  </p>
                </div>

                <div
                  className="
                    font-sans
                    text-[13px]
                    text-[#666]
                  "
                >
                  {formatTime(
                    enrollment.schedule_time
                  )}{" "}
                  ·{" "}
                  {enrollment.lesson_duration}{" "}
                  min
                </div>
              </div>
            </div>

            {/* LESSON LIST */}

            <div className="mt-8">
              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >
                <h3
                  className="
                    font-serif
                    text-[24px]
                    font-normal
                  "
                >
                  Lesson Schedule
                </h3>

                <span
                  className="
                    font-sans
                    text-[12px]
                    text-[#888]
                  "
                >
                  {lessonRecords.length}{" "}
                  recorded
                </span>
              </div>

              {lessonRecords.length === 0 && (
                <div
                  className="
                    mt-5
                    rounded-2xl
                    border
                    border-dashed
                    border-[#D8CCBE]
                    bg-[#FAF8F5]
                    px-6
                    py-8
                    text-center
                  "
                >
                  <p
                    className="
                      font-serif
                      text-[22px]
                      text-[#555]
                    "
                  >
                    No lesson records found
                  </p>

                  <p
                    className="
                      mx-auto
                      mt-2
                      max-w-lg
                      font-sans
                      text-[13px]
                      leading-6
                      text-[#777]
                    "
                  >
                    This enrollment has no lesson
                    records. Lesson records are
                    normally generated automatically
                    when the enrollment is created.
                    If they are missing, check the
                    enrollment creation process.
                  </p>
                </div>
              )}

              {lessonRecords.length > 0 && (
                <div className="mt-5 space-y-3">
                  {lessonRecords.map(
                    (lesson) => {
                      const status =
                        lesson.attendance_status ??
                        "scheduled";

                      return (
                        <div
                          key={lesson.id}
                          className="
                            rounded-2xl
                            border
                            border-[#E7DDD1]
                            bg-white
                            px-5
                            py-5

                            sm:px-6
                          "
                        >
                          <div
                            className="
                              flex
                              flex-col
                              gap-4

                              lg:flex-row
                              lg:items-center
                              lg:justify-between
                            "
                          >
                            {/* LESSON INFO */}

                            <div
                              className="
                                flex
                                items-center
                                gap-4
                              "
                            >
                              <div
                                className={`
                                  flex
                                  h-10
                                  w-10
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-full
                                  font-sans
                                  text-[12px]
                                  font-medium
                                  ${
                                    status ===
                                    "completed"
                                      ? "bg-[#E2EBDD] text-[#5F7F63]"
                                      : "bg-[#F1EEE8] text-[#777]"
                                  }
                                `}
                              >
                                {
                                  lesson.lesson_number
                                }
                              </div>

                              <div>
                                <p
                                  className="
                                    font-serif
                                    text-[19px]
                                    text-[#444]
                                  "
                                >
                                  Lesson{" "}
                                  {
                                    lesson.lesson_number
                                  }
                                </p>

                                <p
                                  className="
                                    mt-1
                                    font-sans
                                    text-[12px]
                                    text-[#888]
                                  "
                                >
                                  {formatDate(
                                    lesson.lesson_date
                                  )}
                                  {" · "}
                                  {formatLessonDay(
                                    lesson.lesson_date
                                  )}
                                  {" · "}
                                  {formatTime(
                                    enrollment.schedule_time
                                  )}
                                  {" · "}
                                  {
                                    lesson.duration ??
                                    enrollment.lesson_duration
                                  }{" "}
                                  minutes
                                </p>
                              </div>
                            </div>

                            {/* ACTIONS */}

                            <div
                              className="
                                flex
                                flex-wrap
                                items-center
                                gap-3
                              "
                            >
                              <StatusBadge
                                status={status}
                              />

                              <Link
                                href={`/${currentLocale}/admin/students/${student.id}/lessons/${lesson.lesson_number}`}
                                className="
                                  inline-flex
                                  items-center
                                  justify-center
                                  rounded-full
                                  border
                                  border-[#D8CCBE]
                                  px-4
                                  py-2
                                  font-sans
                                  text-[12px]
                                  font-medium
                                  text-[#5F7F63]
                                  transition
                                  hover:border-[#6F8F72]
                                  hover:bg-[#F4F7F2]
                                "
                              >
                                {status ===
                                "scheduled"
                                  ? "Record Lesson"
                                  : "Edit Lesson"}
                              </Link>
                            </div>
                          </div>

                          {/* NOTES */}

                          {lesson.notes && (
                            <div
                              className="
                                mt-5
                                border-t
                                border-[#EEE7DF]
                                pt-4
                              "
                            >
                              <p
                                className="
                                  font-sans
                                  text-[10px]
                                  font-medium
                                  uppercase
                                  tracking-[0.12em]
                                  text-[#999]
                                "
                              >
                                Notes
                              </p>

                              <p
                                className="
                                  mt-2
                                  font-sans
                                  text-[13px]
                                  leading-6
                                  text-[#666]
                                "
                              >
                                {lesson.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* PAYMENTS                                                            */}
        {/* ------------------------------------------------------------------ */}

        {enrollment && (
          <section
            className="
              mt-6
              rounded-3xl
              border
              border-[#E7DDD1]
              bg-white
              p-7

              sm:p-9
            "
          >
            <div
              className="
                flex
                flex-col
                gap-3

                sm:flex-row
                sm:items-end
                sm:justify-between
              "
            >
              <div>
                <SectionLabel>
                  Payments
                </SectionLabel>

                <h2
                  className="
                    mt-3
                    font-serif
                    text-[30px]
                    font-normal
                  "
                >
                  Payment History
                </h2>

                <p
                  className="
                    mt-2
                    font-sans
                    text-[13px]
                    leading-6
                    text-[#777]
                  "
                >
                  Payment status is tracked
                  separately from lesson attendance.
                </p>
              </div>

              <Link
                href={`/${currentLocale}/admin/payments/new?enrollment_id=${enrollment.id}`}
                className="
                  inline-flex
                  w-fit
                  rounded-full
                  bg-[#6F8F72]
                  px-5
                  py-3
                  font-sans
                  text-[12px]
                  font-medium
                  text-white
                  transition
                  hover:bg-[#5F7F63]
                "
              >
                + Record Payment
              </Link>
            </div>

            {/* PAYMENT SUMMARY */}

            <div
              className="
                mt-8
                grid
                gap-3

                sm:grid-cols-3
              "
            >
              <PaymentSummaryCard
                label="Tuition"
                value={formatCurrency(
                  totalTuition,
                  enrollment.currency
                )}
              />

              <PaymentSummaryCard
                label="Total Paid"
                value={formatCurrency(
                  totalPaid,
                  enrollment.currency
                )}
              />

              <PaymentSummaryCard
                label="Balance Remaining"
                value={formatCurrency(
                  balanceRemaining,
                  enrollment.currency
                )}
                highlight={
                  balanceRemaining === 0
                }
              />
            </div>

            {/* NO PAYMENTS */}

            {paymentRecords.length === 0 && (
              <div
                className="
                  mt-8
                  rounded-2xl
                  border
                  border-dashed
                  border-[#D8CCBE]
                  bg-[#FAF8F5]
                  px-6
                  py-10
                  text-center
                "
              >
                <p
                  className="
                    font-serif
                    text-[24px]
                    text-[#555]
                  "
                >
                  No payment records yet
                </p>

                <p
                  className="
                    mx-auto
                    mt-2
                    max-w-lg
                    font-sans
                    text-[13px]
                    leading-6
                    text-[#777]
                  "
                >
                  Payments recorded for this
                  enrollment will appear here.
                </p>

                <Link
                  href={`/${currentLocale}/admin/payments/new?enrollment_id=${enrollment.id}`}
                  className="
                    mt-5
                    inline-flex
                    rounded-full
                    border
                    border-[#D8CCBE]
                    px-5
                    py-2.5
                    font-sans
                    text-[12px]
                    font-medium
                    text-[#5F7F63]
                    transition
                    hover:border-[#6F8F72]
                    hover:bg-[#F4F7F2]
                  "
                >
                  Record First Payment →
                </Link>
              </div>
            )}

            {/* PAYMENT RECORDS */}

            {paymentRecords.length > 0 && (
              <div className="mt-8 space-y-3">
                {paymentRecords.map(
                  (payment) => (
                    <div
                      key={payment.id}
                      className="
                        rounded-2xl
                        border
                        border-[#E7DDD1]
                        bg-white
                        px-5
                        py-5

                        sm:px-6
                      "
                    >
                      <div
                        className="
                          flex
                          flex-col
                          gap-5

                          lg:flex-row
                          lg:items-start
                          lg:justify-between
                        "
                      >
                        {/* PAYMENT MAIN INFO */}

                        <div>
                          <div
                            className="
                              flex
                              flex-wrap
                              items-center
                              gap-3
                            "
                          >
                            <p
                              className="
                                font-serif
                                text-[21px]
                                text-[#444]
                              "
                            >
                              {formatCurrency(
                                Number(
                                  payment.amount
                                ),
                                payment.currency
                              )}
                            </p>

                            <PaymentStatusBadge
                              status={
                                payment.status
                              }
                            />
                          </div>

                          <p
                            className="
                              mt-2
                              font-sans
                              text-[13px]
                              text-[#777]
                            "
                          >
                            {formatDate(
                              payment.payment_date
                            )}
                          </p>
                        </div>

                        {/* PAYMENT DETAILS */}

                        <div
                          className="
                            grid
                            gap-4

                            sm:grid-cols-2
                            lg:min-w-[320px]
                          "
                        >
                          <PaymentDetail
                            label="Method"
                            value={
                              payment.payment_method
                            }
                          />

                          <PaymentDetail
                            label="Reference"
                            value={
                              payment.reference
                            }
                          />
                        </div>
                      </div>

                      {/* PAYMENT NOTES */}

                      {payment.notes && (
                        <div
                          className="
                            mt-5
                            border-t
                            border-[#EEE7DF]
                            pt-4
                          "
                        >
                          <p
                            className="
                              font-sans
                              text-[10px]
                              font-medium
                              uppercase
                              tracking-[0.12em]
                              text-[#999]
                            "
                          >
                            Notes
                          </p>

                          <p
                            className="
                              mt-2
                              font-sans
                              text-[13px]
                              leading-6
                              text-[#666]
                            "
                          >
                            {payment.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

            {/* ALL PAYMENTS */}

            {paymentRecords.length > 0 && (
              <div className="mt-6">
                <Link
                  href={`/${currentLocale}/admin/payments`}
                  className="
                    font-sans
                    text-[13px]
                    font-medium
                    text-[#6F8F72]
                    transition
                    hover:opacity-70
                  "
                >
                  View All Payments →
                </Link>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

/* ========================================================================= */
/* SECTION LABEL                                                             */
/* ========================================================================= */

function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p
      className="
        font-sans
        text-[11px]
        font-medium
        uppercase
        tracking-[0.14em]
        text-[#6F8F72]
      "
    >
      {children}
    </p>
  );
}

/* ========================================================================= */
/* INFO ITEM                                                                 */
/* ========================================================================= */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p
        className="
          font-sans
          text-[11px]
          font-medium
          uppercase
          tracking-[0.12em]
          text-[#999]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-2
          font-sans
          text-[15px]
          leading-6
          text-[#444]
        "
      >
        {value || "—"}
      </p>
    </div>
  );
}

/* ========================================================================= */
/* PROGRESS CARD                                                             */
/* ========================================================================= */

function ProgressCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-[#E7DDD1]
        bg-[#FAF8F5]
        px-5
        py-5
      "
    >
      <p
        className="
          font-sans
          text-[11px]
          font-medium
          uppercase
          tracking-[0.12em]
          text-[#999]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-2
          font-serif
          text-[30px]
          font-normal
          text-[#444]
        "
      >
        {value}
      </p>
    </div>
  );
}

/* ========================================================================= */
/* MINI PROGRESS CARD                                                        */
/* ========================================================================= */

function MiniProgressCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-[#EEE7DF]
        bg-white
        px-4
        py-4
      "
    >
      <p
        className="
          font-sans
          text-[10px]
          font-medium
          uppercase
          tracking-[0.11em]
          text-[#999]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          font-serif
          text-[22px]
          text-[#555]
        "
      >
        {value}
      </p>
    </div>
  );
}

/* ========================================================================= */
/* PAYMENT SUMMARY CARD                                                      */
/* ========================================================================= */

function PaymentSummaryCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-[#E7DDD1]
        bg-[#FAF8F5]
        px-5
        py-5
      "
    >
      <p
        className="
          font-sans
          text-[11px]
          font-medium
          uppercase
          tracking-[0.12em]
          text-[#999]
        "
      >
        {label}
      </p>

      <p
        className={`
          mt-2
          font-serif
          text-[24px]
          font-normal
          ${
            highlight
              ? "text-[#5F7F63]"
              : "text-[#444]"
          }
        `}
      >
        {value}
      </p>
    </div>
  );
}

/* ========================================================================= */
/* PAYMENT DETAIL                                                            */
/* ========================================================================= */

function PaymentDetail({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p
        className="
          font-sans
          text-[10px]
          font-medium
          uppercase
          tracking-[0.12em]
          text-[#999]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          font-sans
          text-[13px]
          text-[#555]
        "
      >
        {value || "—"}
      </p>
    </div>
  );
}

/* ========================================================================= */
/* PAYMENT STATUS BADGE                                                      */
/* ========================================================================= */

function PaymentStatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    status.toLowerCase();

  let label = status;
  let className =
    "bg-[#F1EEE8] text-[#777]";

  if (normalized === "paid") {
    label = "Paid";

    className =
      "bg-[#E2EBDD] text-[#5F7F63]";
  }

  if (
    normalized === "pending" ||
    normalized === "unpaid"
  ) {
    label =
      normalized === "unpaid"
        ? "Unpaid"
        : "Pending";

    className =
      "bg-[#F4EBD8] text-[#8A7044]";
  }

  if (
    normalized === "failed" ||
    normalized === "cancelled" ||
    normalized === "canceled"
  ) {
    label =
      normalized === "failed"
        ? "Failed"
        : "Cancelled";

    className =
      "bg-[#F8ECE8] text-[#8A5148]";
  }

  return (
    <span
      className={`
        inline-flex
        w-fit
        rounded-full
        px-3
        py-1.5
        font-sans
        text-[11px]
        font-medium
        capitalize
        ${className}
      `}
    >
      {label}
    </span>
  );
}

/* ========================================================================= */
/* LESSON STATUS BADGE                                                       */
/* ========================================================================= */

function StatusBadge({
  status,
}: {
  status: LessonStatus;
}) {
  const config: Record<
    LessonStatus,
    {
      label: string;
      className: string;
    }
  > = {
    scheduled: {
      label: "Scheduled",
      className:
        "bg-[#F1EEE8] text-[#777]",
    },

    completed: {
      label: "Completed",
      className:
        "bg-[#E2EBDD] text-[#5F7F63]",
    },

    rescheduled: {
      label: "Rescheduled / Credit",
      className:
        "bg-[#F4EBD8] text-[#8A7044]",
    },

    unexpected: {
      label: "Unexpected / Credit",
      className:
        "bg-[#F8ECE8] text-[#8A5148]",
    },

    teacher_cancelled: {
      label: "Teacher Cancelled / Credit",
      className:
        "bg-[#E9E7F2] text-[#666080]",
    },
  };

  const current =
    config[status] ??
    config.scheduled;

  return (
    <span
      className={`
        inline-flex
        w-fit
        rounded-full
        px-4
        py-2
        font-sans
        text-[12px]
        font-medium
        ${current.className}
      `}
    >
      {current.label}
    </span>
  );
}

/* ========================================================================= */
/* DATE HELPERS                                                              */
/* ========================================================================= */

function formatDate(
  value:
    | string
    | null
    | undefined
) {
  if (!value) {
    return "—";
  }

  return new Date(
    `${value}T00:00:00`
  ).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
}

function formatLessonDay(
  value:
    | string
    | null
    | undefined
) {
  if (!value) {
    return "—";
  }

  return new Date(
    `${value}T00:00:00`
  ).toLocaleDateString(
    "en-US",
    {
      weekday: "long",
    }
  );
}

/* ========================================================================= */
/* CURRENCY HELPERS                                                          */
/* ========================================================================= */

function formatCurrency(
  amount: number,
  currency: string
) {
  return `${currency} ${amount.toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  )}`;
}

/* ========================================================================= */
/* SCHEDULE FORMATTERS                                                       */
/* ========================================================================= */

function formatScheduleDays(
  value:
    | string[]
    | null
    | undefined
) {
  if (
    !value ||
    value.length === 0
  ) {
    return "—";
  }

  return value
    .map((day) => {
      const normalized =
        String(day).toLowerCase();

      return (
        normalized
          .charAt(0)
          .toUpperCase() +
        normalized.slice(1)
      );
    })
    .join(" & ");
}

function formatTime(
  value:
    | string
    | null
    | undefined
) {
  if (!value) {
    return "—";
  }

  const parts =
    value.split(":");

  if (parts.length < 2) {
    return value;
  }

  const hour =
    Number(parts[0]);

  const minute =
    parts[1];

  if (
    Number.isNaN(hour)
  ) {
    return value;
  }

  const suffix =
    hour >= 12
      ? "PM"
      : "AM";

  const displayHour =
    hour % 12 || 12;

  return `${displayHour}:${minute} ${suffix}`;
}