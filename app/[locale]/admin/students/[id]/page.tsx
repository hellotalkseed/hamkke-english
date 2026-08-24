import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  FileText,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import LessonActions from "@/components/admin/LessonActions";
import PrintAttendanceButton from "@/components/admin/PrintAttendanceButton";
import PrintableAttendance from "@/components/admin/PrintableAttendance";
import RenewEnrollmentButton from "@/components/admin/RenewEnrollmentButton";

interface StudentPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
  searchParams: Promise<{
    enrollmentId?: string;
  }>;
}

interface Lesson {
  id: string;
  lesson_number: number;
  lesson_date: string | null;
  duration: number | null;
  attendance_status: string;
  notes: string | null;
  original_lesson_date: string | null;
  rescheduled_at: string | null;
  consumes_lesson: boolean;
  resolution: string | null;
}

interface Payment {
  id: string;
  enrollment_id: string;
  amount: number | null;
  currency: string | null;
  payment_date: string | null;
  payment_method: string | null;
  reference: string | null;
  notes: string | null;
  status: string;
  created_at?: string | null;
}

interface Enrollment {
  id: string;
  package_name: string;
  number_of_lessons: number;
  lesson_duration: number | null;
  lessons_per_week: number | null;
  start_date: string | null;
  status: string;
  schedule_days: string[] | null;
  schedule_time: string | null;
  renewal_of: string | null;
  lessons: Lesson[];
  payments: Payment[];
}

export default async function StudentPage({
  params,
  searchParams,
}: StudentPageProps) {
  const { locale, id } = await params;
  const { enrollmentId } = await searchParams;

  const supabase = await createClient();

  const { data: student, error } = await supabase
    .from("students")
    .select(`
      id,
      full_name,
      preferred_name,
      email,
      country,
      timezone,
      contact_method,
      preferred_language,
      created_at,
      enrollments (
        id,
        package_name,
        number_of_lessons,
        lesson_duration,
        lessons_per_week,
        start_date,
        status,
        schedule_days,
        schedule_time,
        renewal_of,
        lessons (
          id,
          lesson_number,
          lesson_date,
          duration,
          attendance_status,
          notes,
          original_lesson_date,
          rescheduled_at,
          consumes_lesson,
          resolution
        ),
        payments (
          id,
          enrollment_id,
          amount,
          currency,
          payment_date,
          payment_method,
          reference,
          notes,
          status,
          created_at
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error || !student) {
    notFound();
  }

  const enrollments =
    (student.enrollments ?? []) as unknown as Enrollment[];

  /*
   * ------------------------------------------------------------------------
   * SORT ENROLLMENTS
   * ------------------------------------------------------------------------
   */

  const sortedEnrollments = [...enrollments].sort((a, b) => {
    const dateA = a.start_date
      ? new Date(a.start_date).getTime()
      : 0;

    const dateB = b.start_date
      ? new Date(b.start_date).getTime()
      : 0;

    return dateB - dateA;
  });

  /*
   * ------------------------------------------------------------------------
   * SELECT ENROLLMENT
   * ------------------------------------------------------------------------
   */

  const selectedEnrollment = enrollmentId
    ? sortedEnrollments.find(
        (enrollment) => enrollment.id === enrollmentId
      )
    : sortedEnrollments.find(
        (enrollment) => enrollment.status === "active"
      ) ??
      sortedEnrollments[0] ??
      null;

  if (enrollmentId && !selectedEnrollment) {
    notFound();
  }

  const currentEnrollment = selectedEnrollment;

  const enrollmentHistory = sortedEnrollments.filter(
    (enrollment) =>
      enrollment.id !== currentEnrollment?.id
  );

  /*
   * ------------------------------------------------------------------------
   * CURRENT ENROLLMENT LESSONS
   * ------------------------------------------------------------------------
   */

  const lessons = [
    ...(currentEnrollment?.lessons ?? []),
  ].sort(
    (a, b) => a.lesson_number - b.lesson_number
  );

  /*
   * ------------------------------------------------------------------------
   * CURRENT ENROLLMENT PAYMENT
   * ------------------------------------------------------------------------
   *
   * Every enrollment has its own payment record.
   *
   * If there are multiple payment records for an enrollment,
   * use the newest one for the current enrollment display.
   */

  const currentEnrollmentPayments = [
    ...(currentEnrollment?.payments ?? []),
  ].sort(comparePayments);

  const currentPayment =
    currentEnrollmentPayments[0] ?? null;

  /*
   * ------------------------------------------------------------------------
   * PAYMENT HISTORY
   * ------------------------------------------------------------------------
   *
   * Flatten every payment from every enrollment.
   *
   * This keeps payment history independent from enrollment history.
   *
   * Example:
   *
   * Enrollment 1
   *   └── Payment 1
   *
   * Enrollment 2 / Renewal
   *   └── Payment 2
   *
   * Enrollment 3 / Renewal
   *   └── Payment 3
   *
   * All three remain visible here.
   */

  const paymentHistory = enrollments
    .flatMap((enrollment) =>
      (enrollment.payments ?? []).map(
        (payment) => ({
          ...payment,
          enrollment,
        })
      )
    )
    .sort(comparePaymentHistory);

  /*
   * ------------------------------------------------------------------------
   * ATTENDANCE
   * ------------------------------------------------------------------------
   */

  const completedLessons = lessons.filter(
    (lesson) =>
      lesson.attendance_status === "completed"
  ).length;

  const scheduledLessons = lessons.filter(
    (lesson) =>
      lesson.attendance_status === "scheduled"
  ).length;

  const noShowLessons = lessons.filter(
    (lesson) =>
      lesson.attendance_status === "no_show"
  ).length;

  const lateCancellationLessons = lessons.filter(
    (lesson) =>
      lesson.attendance_status ===
      "late_cancellation"
  ).length;

  const consumedLessons = lessons.filter(
    (lesson) => lesson.consumes_lesson
  ).length;

  const totalLessons =
    currentEnrollment?.number_of_lessons ?? 0;

  const remainingLessons = Math.max(
    totalLessons - consumedLessons,
    0
  );

  /*
   * ------------------------------------------------------------------------
   * ENROLLMENT LIFECYCLE
   * ------------------------------------------------------------------------
   */

  const enrollmentIsActive =
    !!currentEnrollment &&
    currentEnrollment.status === "active";

  const enrollmentIsCompleted =
    !!currentEnrollment &&
    currentEnrollment.status === "completed";

  const enrollmentIsConfirmed =
    enrollmentIsActive ||
    enrollmentIsCompleted;

  const paymentIsPending =
    !!currentPayment &&
    currentPayment.status === "pending";

  const paymentIsPaid =
    !!currentPayment &&
    currentPayment.status === "paid";

  /*
   * ------------------------------------------------------------------------
   * CURRENT TUITION
   * ------------------------------------------------------------------------
   *
   * Passed into RenewEnrollmentButton so the renewal form
   * can pre-fill the previous payment amount and currency.
   */

  const currentTuitionAmount =
    currentPayment?.amount ?? 0;

  const currentCurrency =
    currentPayment?.currency ?? "KRW";

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
          print:hidden
        "
      >
        <div className="relative mx-auto flex w-full max-w-[1040px] items-center">
          <Link
            href={`/${locale}/admin/students`}
            className="
              flex
              shrink-0
              items-center
              gap-2
              font-sans
              text-[15px]
              text-[#5F655F]
              transition-colors
              hover:text-[#6F8F72]
            "
          >
            <ArrowLeft
              size={16}
              strokeWidth={1.5}
            />
            Students
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
          max-w-[1040px]
          px-6
          pb-12
          pt-10
          sm:px-8
          sm:pb-14
          sm:pt-20
          lg:px-10
          lg:pb-16
          lg:pt-24
          print:hidden
        "
      >
        <div
          className="
            mb-5
            text-center
            font-sans
            text-[11px]
            font-medium
            uppercase
            tracking-[0.14em]
            text-[#6F8F72]
          "
        >
          Student Record
        </div>

        <h1
          className="
            text-center
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
          {student.preferred_name ||
            student.full_name}
        </h1>

        {student.preferred_name &&
          student.preferred_name !==
            student.full_name && (
            <p
              className="
                mt-4
                text-center
                font-sans
                text-[14px]
                text-[#777771]
              "
            >
              {student.full_name}
            </p>
          )}
      </section>

      {/* PRINTABLE ATTENDANCE */}
      {currentEnrollment && (
        <div className="hidden print:block">
          <PrintableAttendance
            studentName={
              student.preferred_name ||
              student.full_name
            }
            enrollment={currentEnrollment}
            lessons={lessons}
          />
        </div>
      )}

      {/* SCREEN CONTENT */}
      <section
        className="
          mx-auto
          w-full
          max-w-[1040px]
          px-6
          pb-24
          sm:px-8
          lg:px-10
          print:hidden
        "
      >
        {/* STUDENT INFORMATION */}
        <section className="border-t border-[#DCD8D2] py-10">
          <SectionHeading
            icon={
              <User
                size={17}
                strokeWidth={1.5}
              />
            }
            title="Student Information"
          />

          <div
            className="
              mt-8
              grid
              gap-x-12
              gap-y-8
              sm:grid-cols-2
            "
          >
            <InfoItem
              label="Full Name"
              value={student.full_name}
            />

            <InfoItem
              label="Email"
              value={student.email}
            />

            <InfoItem
              label="Country"
              value={student.country}
            />

            <InfoItem
              label="Timezone"
              value={student.timezone}
            />

            <InfoItem
              label="Preferred Language"
              value={
                student.preferred_language
              }
            />

            <InfoItem
              label="Contact Method"
              value={student.contact_method}
            />
          </div>
        </section>

        {/* ENROLLMENT */}
        <section className="border-t border-[#DCD8D2] py-10">
          <div className="flex items-center justify-between gap-6">
            <SectionHeading
              icon={
                <BookOpen
                  size={17}
                  strokeWidth={1.5}
                />
              }
              title="Enrollment"
            />

            {currentEnrollment ? (
              <RenewEnrollmentButton
                studentId={student.id}
                enrollmentId={
                  currentEnrollment.id
                }
                locale={locale}
                packageName={
                  currentEnrollment.package_name
                }
                numberOfLessons={
                  currentEnrollment.number_of_lessons
                }
                lessonDuration={
                  currentEnrollment.lesson_duration
                }
                lessonsPerWeek={
                  currentEnrollment.lessons_per_week
                }
                scheduleDays={
                  currentEnrollment.schedule_days
                }
                scheduleTime={
                  currentEnrollment.schedule_time
                }
                tuitionAmount={
                  currentTuitionAmount
                }
                currency={currentCurrency}
              />
            ) : (
              <Link
                href={`/${locale}/admin/students/${student.id}/enrollments/new`}
                className="
                  font-sans
                  text-sm
                  text-[#6F8F72]
                  transition-colors
                  hover:text-[#5F655F]
                "
              >
                + New Enrollment
              </Link>
            )}
          </div>

          {currentEnrollment ? (
            <div
              className="
                mt-8
                rounded-2xl
                bg-[#F0F4ED]
                p-6
                sm:p-8
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-6
                  sm:flex-row
                  sm:items-start
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
                      tracking-[0.14em]
                      text-[#6F8F72]
                    "
                  >
                    {currentEnrollment.renewal_of
                      ? "Renewal"
                      : "Package"}
                  </p>

                  <h3
                    className="
                      mt-2
                      font-serif
                      text-[28px]
                      font-normal
                    "
                  >
                    {currentEnrollment.package_name}
                  </h3>

                  {currentEnrollment.renewal_of && (
                    <p
                      className="
                        mt-2
                        font-sans
                        text-[12px]
                        text-[#777771]
                      "
                    >
                      Renewal of a previous enrollment
                    </p>
                  )}
                </div>

                <span
                  className="
                    inline-flex
                    w-fit
                    rounded-full
                    bg-white
                    px-4
                    py-2
                    font-sans
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.12em]
                    text-[#6F8F72]
                  "
                >
                  {formatEnrollmentStatus(
                    currentEnrollment.status
                  )}
                </span>
              </div>

              {/* ENROLLMENT DETAILS */}
              <div
                className="
                  mt-8
                  grid
                  gap-x-8
                  gap-y-7
                  border-t
                  border-[#D8E1D3]
                  pt-7
                  sm:grid-cols-2
                  lg:grid-cols-3
                "
              >
                <DetailItem
                  icon={
                    <CalendarDays
                      size={15}
                      strokeWidth={1.5}
                    />
                  }
                  label="Start Date"
                  value={formatDate(
                    currentEnrollment.start_date
                  )}
                />

                <DetailItem
                  icon={
                    <Clock3
                      size={15}
                      strokeWidth={1.5}
                    />
                  }
                  label="Lesson Duration"
                  value={
                    currentEnrollment.lesson_duration
                      ? `${currentEnrollment.lesson_duration} minutes`
                      : "Not set"
                  }
                />

                <DetailItem
                  icon={
                    <BookOpen
                      size={15}
                      strokeWidth={1.5}
                    />
                  }
                  label="Lessons Per Week"
                  value={
                    currentEnrollment.lessons_per_week
                      ? `${currentEnrollment.lessons_per_week}`
                      : "Not set"
                  }
                />

                <DetailItem
                  icon={
                    <CalendarDays
                      size={15}
                      strokeWidth={1.5}
                    />
                  }
                  label="Days"
                  value={formatScheduleDays(
                    currentEnrollment.schedule_days
                  )}
                />

                <DetailItem
                  icon={
                    <Clock3
                      size={15}
                      strokeWidth={1.5}
                    />
                  }
                  label="Time"
                  value={
                    currentEnrollment.schedule_time
                      ? formatTime(
                          currentEnrollment.schedule_time
                        )
                      : "To be confirmed"
                  }
                />
              </div>

              {/* STATS */}
              <div
                className="
                  mt-8
                  grid
                  gap-6
                  border-t
                  border-[#D8E1D3]
                  pt-7
                  sm:grid-cols-3
                "
              >
                <Stat
                  label="Total"
                  value={totalLessons}
                  suffix="lessons"
                />

                <Stat
                  label="Completed"
                  value={completedLessons}
                  suffix="lessons"
                />

                <Stat
                  label="Remaining"
                  value={remainingLessons}
                  suffix="lessons"
                />
              </div>
            </div>
          ) : (
            <div
              className="
                mt-8
                border
                border-dashed
                border-[#CFCBC4]
                px-6
                py-12
                text-center
              "
            >
              <p
                className="
                  font-serif
                  text-[21px]
                  text-[#4A4A4A]
                "
              >
                No enrollment yet
              </p>

              <p
                className="
                  mt-2
                  font-sans
                  text-sm
                  text-[#8A8A84]
                "
              >
                This student can be enrolled once
                their record is ready.
              </p>
            </div>
          )}

          {/* OTHER ENROLLMENTS */}
          {enrollmentHistory.length > 0 && (
            <div className="mt-12 border-t border-[#DCD8D2] pt-10">
              <div className="flex items-center justify-between">
                <div>
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
                    History
                  </p>

                  <h3
                    className="
                      mt-2
                      font-serif
                      text-[25px]
                      font-normal
                    "
                  >
                    Other Enrollments
                  </h3>
                </div>

                <span
                  className="
                    font-sans
                    text-[12px]
                    text-[#8A8A84]
                  "
                >
                  {enrollmentHistory.length}{" "}
                  {enrollmentHistory.length === 1
                    ? "record"
                    : "records"}
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {enrollmentHistory.map(
                  (enrollment) => (
                    <EnrollmentHistoryRow
                      key={enrollment.id}
                      enrollment={enrollment}
                      locale={locale}
                      studentId={student.id}
                    />
                  )
                )}
              </div>
            </div>
          )}
        </section>

        {/* CONTRACT */}
        <section className="border-t border-[#DCD8D2] py-10">
          <div className="flex items-center justify-between gap-6">
            <SectionHeading
              icon={
                <FileText
                  size={17}
                  strokeWidth={1.5}
                />
              }
              title="Contract"
            />

            {currentEnrollment && (
              <Link
                href={`/${locale}/admin/students/${student.id}/enrollments/${currentEnrollment.id}/contract`}
                className="
                  inline-flex
                  items-center
                  rounded-full
                  bg-[#6F8F72]
                  px-5
                  py-2.5
                  font-sans
                  text-sm
                  font-medium
                  text-white
                  transition-opacity
                  hover:opacity-85
                "
              >
                {enrollmentIsConfirmed
                  ? "View Contract"
                  : "Prepare Contract"}
              </Link>
            )}
          </div>

          <div
            className="
              mt-8
              rounded-2xl
              border
              border-[#DCD8D2]
              bg-white/40
              p-6
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
                text-[#6F8F72]
              "
            >
              Status
            </p>

            <p className="mt-2 font-serif text-[21px]">
              {!currentEnrollment
                ? "Not created"
                : enrollmentIsCompleted
                  ? "Completed"
                  : enrollmentIsActive
                    ? "Active"
                    : "Contract for Review"}
            </p>

            {!currentEnrollment && (
              <p
                className="
                  mt-3
                  max-w-[500px]
                  font-sans
                  text-[12px]
                  leading-[1.6]
                  text-[#8A8A84]
                "
              >
                A contract will become available once
                an enrollment has been created.
              </p>
            )}
          </div>
        </section>

        {/* CURRENT PAYMENT */}
        <section className="border-t border-[#DCD8D2] py-10">
          <div className="flex items-center justify-between gap-6">
            <SectionHeading
              icon={
                <CreditCard
                  size={17}
                  strokeWidth={1.5}
                />
              }
              title="Payment"
            />

            {currentPayment &&
              paymentIsPending &&
              currentEnrollment && (
                <form
                  method="POST"
                  action={`/api/admin/students/${student.id}/enrollments/${currentEnrollment.id}/payment`}
                >
                  <input
                    type="hidden"
                    name="locale"
                    value={locale}
                  />

                  <button
                    type="submit"
                    className="
                      inline-flex
                      items-center
                      rounded-full
                      bg-[#6F8F72]
                      px-5
                      py-2.5
                      font-sans
                      text-sm
                      font-medium
                      text-white
                      transition-opacity
                      hover:opacity-85
                    "
                  >
                    Confirm Payment
                  </button>
                </form>
              )}
          </div>

          {!currentEnrollment ? (
            <EmptyPaymentState
              title="No payment yet"
              description="Payment details will appear once an enrollment has been created."
            />
          ) : !currentPayment ? (
            <EmptyPaymentState
              title="No payment record"
              description="This enrollment does not have a payment record yet."
            />
          ) : (
            <div
              className="
                mt-8
                rounded-2xl
                border
                border-[#DCD8D2]
                bg-white/40
                p-6
                sm:p-8
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-6
                  sm:flex-row
                  sm:items-start
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
                      tracking-[0.14em]
                      text-[#6F8F72]
                    "
                  >
                    Payment Details
                  </p>

                  <p className="mt-2 font-serif text-[28px]">
                    {formatCurrency(
                      currentPayment.amount,
                      currentPayment.currency
                    )}
                  </p>
                </div>

                <PaymentStatusBadge
                  status={currentPayment.status}
                />
              </div>

              <div
                className="
                  mt-8
                  grid
                  gap-x-8
                  gap-y-7
                  border-t
                  border-[#E2DED7]
                  pt-7
                  sm:grid-cols-2
                  lg:grid-cols-3
                "
              >
                <PaymentDetail
                  label="Amount"
                  value={formatCurrency(
                    currentPayment.amount,
                    currentPayment.currency
                  )}
                />

                <PaymentDetail
                  label="Payment Date"
                  value={formatDate(
                    currentPayment.payment_date
                  )}
                />

                <PaymentDetail
                  label="Payment Method"
                  value={formatPaymentMethod(
                    currentPayment.payment_method
                  )}
                />

                <PaymentDetail
                  label="Reference"
                  value={
                    currentPayment.reference ||
                    "Not provided"
                  }
                />

                <PaymentDetail
                  label="Status"
                  value={
                    paymentIsPaid
                      ? "Paid"
                      : "Pending confirmation"
                  }
                />
              </div>

              {currentPayment.notes && (
                <div
                  className="
                    mt-7
                    border-t
                    border-[#E2DED7]
                    pt-6
                  "
                >
                  <p
                    className="
                      font-sans
                      text-[11px]
                      font-medium
                      uppercase
                      tracking-[0.12em]
                      text-[#6F8F72]
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
                      text-[#777771]
                    "
                  >
                    {currentPayment.notes}
                  </p>
                </div>
              )}

              {paymentIsPending && (
                <div
                  className="
                    mt-7
                    border-t
                    border-[#E2DED7]
                    pt-6
                  "
                >
                  <p
                    className="
                      max-w-[560px]
                      font-sans
                      text-[12px]
                      leading-[1.7]
                      text-[#8A8A84]
                    "
                  >
                    The payment details were submitted
                    with this enrollment. Confirm the
                    payment once the student&apos;s payment
                    has been received. Confirmation will
                    activate this enrollment.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* PAYMENT HISTORY */}
        {paymentHistory.length > 0 && (
          <section className="border-t border-[#DCD8D2] py-10">
            <div className="flex items-center justify-between gap-6">
              <SectionHeading
                icon={
                  <CreditCard
                    size={17}
                    strokeWidth={1.5}
                  />
                }
                title="Payment History"
              />

              <span
                className="
                  font-sans
                  text-[12px]
                  text-[#8A8A84]
                "
              >
                {paymentHistory.length}{" "}
                {paymentHistory.length === 1
                  ? "payment"
                  : "payments"}
              </span>
            </div>

            <div className="mt-8 space-y-3">
              {paymentHistory.map(
                ({
                  id: paymentId,
                  enrollment,
                  ...payment
                }) => (
                  <PaymentHistoryRow
                    key={paymentId}
                    payment={{
                      id: paymentId,
                      ...payment,
                    }}
                    enrollment={enrollment}
                    locale={locale}
                    studentId={student.id}
                    isCurrent={
                      enrollment.id ===
                      currentEnrollment?.id
                    }
                  />
                )
              )}
            </div>
          </section>
        )}

        {/* ATTENDANCE & LESSONS */}
        <section
          className="
            border-t
            border-[#DCD8D2]
            py-10
          "
        >
          <div className="flex items-center justify-between gap-6">
            <SectionHeading
              icon={
                <Check
                  size={17}
                  strokeWidth={1.5}
                />
              }
              title="Attendance & Lessons"
            />

            {currentEnrollment && (
              <PrintAttendanceButton />
            )}
          </div>

          {currentEnrollment ? (
            <>
              <div
                className="
                  mt-8
                  grid
                  gap-6
                  sm:grid-cols-3
                  lg:grid-cols-5
                "
              >
                <Stat
                  label="Scheduled"
                  value={scheduledLessons}
                  suffix="lessons"
                />

                <Stat
                  label="Completed"
                  value={completedLessons}
                  suffix="lessons"
                />

                <Stat
                  label="No-show"
                  value={noShowLessons}
                  suffix="lessons"
                />

                <Stat
                  label="Late Cancellation"
                  value={lateCancellationLessons}
                  suffix="lessons"
                />

                <Stat
                  label="Remaining"
                  value={remainingLessons}
                  suffix="lessons"
                />
              </div>

              <div className="mt-8 space-y-3">
                {lessons.length > 0 ? (
                  lessons.map((lesson) => (
                    <LessonRow
                      key={lesson.id}
                      lesson={lesson}
                      locale={locale}
                      studentId={student.id}
                      enrollmentId={
                        currentEnrollment.id
                      }
                    />
                  ))
                ) : (
                  <div
                    className="
                      rounded-2xl
                      border
                      border-dashed
                      border-[#CFCBC4]
                      px-6
                      py-10
                      text-center
                    "
                  >
                    <p className="font-serif text-[20px]">
                      No lessons recorded yet
                    </p>

                    <p
                      className="
                        mt-2
                        font-sans
                        text-[13px]
                        text-[#8A8A84]
                      "
                    >
                      Lessons will appear here once
                      they are created for this enrollment.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div
              className="
                mt-8
                rounded-2xl
                border
                border-dashed
                border-[#CFCBC4]
                px-6
                py-10
                text-center
              "
            >
              <p className="font-serif text-[20px]">
                No enrollment yet
              </p>

              <p
                className="
                  mt-2
                  font-sans
                  text-[13px]
                  text-[#8A8A84]
                "
              >
                Attendance will appear here after the
                student is enrolled.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* PAYMENT HISTORY ROW                                                        */
/* -------------------------------------------------------------------------- */

function PaymentHistoryRow({
  payment,
  enrollment,
  locale,
  studentId,
  isCurrent,
}: {
  payment: Payment;
  enrollment: Enrollment;
  locale: string;
  studentId: string;
  isCurrent: boolean;
}) {
  return (
    <Link
      href={`/${locale}/admin/students/${studentId}?enrollmentId=${enrollment.id}`}
      className="
        block
        rounded-2xl
        border
        border-[#DCD8D2]
        bg-white/40
        p-5
        transition-colors
        hover:border-[#BFCDBA]
        hover:bg-[#F5F7F3]
        sm:p-6
      "
    >
      <div
        className="
          flex
          flex-col
          gap-5
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h4
              className="
                font-serif
                text-[20px]
                font-normal
              "
            >
              {formatCurrency(
                payment.amount,
                payment.currency
              )}
            </h4>

            <PaymentStatusBadge
              status={payment.status}
            />

            {isCurrent && (
              <span
                className="
                  rounded-full
                  bg-[#E2EBDD]
                  px-3
                  py-1
                  font-sans
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.08em]
                  text-[#6F8F72]
                "
              >
                Current
              </span>
            )}
          </div>

          <p
            className="
              mt-2
              font-sans
              text-[12px]
              text-[#777771]
            "
          >
            {enrollment.package_name}
            {enrollment.renewal_of
              ? " · Renewal"
              : ""}
          </p>

          <div
            className="
              mt-3
              flex
              flex-wrap
              gap-x-5
              gap-y-2
              font-sans
              text-[12px]
              text-[#8A8A84]
            "
          >
            <span>
              {formatDate(payment.payment_date)}
            </span>

            <span>
              {formatPaymentMethod(
                payment.payment_method
              )}
            </span>

            {payment.reference && (
              <span>
                Ref. {payment.reference}
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0">
          <span
            className="
              font-sans
              text-[12px]
              text-[#8A8A84]
            "
          >
            View enrollment →
          </span>
        </div>
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* ENROLLMENT HISTORY ROW                                                     */
/* -------------------------------------------------------------------------- */

function EnrollmentHistoryRow({
  enrollment,
  locale,
  studentId,
}: {
  enrollment: Enrollment;
  locale: string;
  studentId: string;
}) {
  return (
    <Link
      href={`/${locale}/admin/students/${studentId}?enrollmentId=${enrollment.id}`}
      className="
        block
        rounded-2xl
        border
        border-[#DCD8D2]
        bg-white/40
        p-5
        transition-colors
        hover:border-[#BFCDBA]
        hover:bg-[#F5F7F3]
        sm:p-6
      "
    >
      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h4
              className="
                font-serif
                text-[20px]
                font-normal
              "
            >
              {enrollment.package_name}
            </h4>

            {enrollment.renewal_of && (
              <span
                className="
                  rounded-full
                  bg-[#E2EBDD]
                  px-3
                  py-1
                  font-sans
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.08em]
                  text-[#6F8F72]
                "
              >
                Renewal
              </span>
            )}

            <span
              className="
                rounded-full
                bg-[#F0F4ED]
                px-3
                py-1
                font-sans
                text-[10px]
                font-medium
                uppercase
                tracking-[0.08em]
                text-[#6F8F72]
              "
            >
              {formatEnrollmentStatus(
                enrollment.status
              )}
            </span>
          </div>

          <div
            className="
              mt-3
              flex
              flex-wrap
              gap-x-5
              gap-y-2
              font-sans
              text-[12px]
              text-[#777771]
            "
          >
            <span>
              {formatDate(enrollment.start_date)}
            </span>

            <span>
              {enrollment.number_of_lessons} lessons
            </span>

            {enrollment.lesson_duration && (
              <span>
                {enrollment.lesson_duration} minutes
              </span>
            )}

            {enrollment.lessons_per_week && (
              <span>
                {enrollment.lessons_per_week}× per week
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0">
          <span
            className="
              font-sans
              text-[12px]
              text-[#8A8A84]
            "
          >
            {enrollment.lessons?.length ?? 0} lessons
            recorded
          </span>
        </div>
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* LESSON ROW                                                                 */
/* -------------------------------------------------------------------------- */

function LessonRow({
  lesson,
  locale,
  studentId,
  enrollmentId,
}: {
  lesson: Lesson;
  locale: string;
  studentId: string;
  enrollmentId: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-[#DCD8D2]
        bg-white/40
        p-5
        sm:p-6
      "
    >
      <div
        className="
          flex
          flex-col
          gap-5
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div className="flex items-center gap-5">
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#F0F4ED]
              font-serif
              text-[17px]
              text-[#6F8F72]
            "
          >
            {lesson.lesson_number}
          </div>

          <div>
            <p className="font-serif text-[20px]">
              {formatDate(lesson.lesson_date)}
            </p>

            <div
              className="
                mt-1
                flex
                flex-wrap
                items-center
                gap-x-3
                gap-y-1
                font-sans
                text-[12px]
                text-[#777771]
              "
            >
              <span>
                {lesson.duration ?? "—"} minutes
              </span>

              {lesson.original_lesson_date &&
                lesson.original_lesson_date !==
                  lesson.lesson_date && (
                  <span>
                    Originally{" "}
                    {formatDate(
                      lesson.original_lesson_date
                    )}
                  </span>
                )}
            </div>
          </div>
        </div>

        <div
          className="
            flex
            items-center
            justify-between
            gap-4
            sm:justify-end
          "
        >
          <div className="flex items-center gap-3">
            <StatusBadge
              status={lesson.attendance_status}
            />

            {lesson.consumes_lesson && (
              <span
                className="
                  font-sans
                  text-[11px]
                  text-[#777771]
                "
              >
                Consumed
              </span>
            )}
          </div>

          <LessonActions
            locale={locale}
            studentId={studentId}
            enrollmentId={enrollmentId}
            lessonId={lesson.id}
            currentStatus={
              lesson.attendance_status
            }
            currentResolution={lesson.resolution}
            currentLessonDate={
              lesson.lesson_date
            }
          />
        </div>
      </div>

      {lesson.resolution && (
        <div
          className="
            mt-5
            border-t
            border-[#E2DED7]
            pt-4
            font-sans
            text-[12px]
            text-[#777771]
          "
        >
          Resolution:{" "}
          <span className="font-medium text-[#5F655F]">
            {formatResolution(
              lesson.resolution
            )}
          </span>
        </div>
      )}

      {lesson.notes && (
        <div
          className="
            mt-3
            font-sans
            text-[12px]
            leading-5
            text-[#777771]
          "
        >
          {lesson.notes}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SECTION HEADING                                                            */
/* -------------------------------------------------------------------------- */

function SectionHeading({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          bg-[#E2EBDD]
          text-[#6F8F72]
        "
      >
        {icon}
      </div>

      <h2
        className="
          font-serif
          text-[30px]
          font-normal
          tracking-[-0.02em]
        "
      >
        {title}
      </h2>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* EMPTY PAYMENT STATE                                                        */
/* -------------------------------------------------------------------------- */

function EmptyPaymentState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        mt-8
        rounded-2xl
        border
        border-dashed
        border-[#CFCBC4]
        px-6
        py-10
        text-center
      "
    >
      <p className="font-serif text-[20px]">
        {title}
      </p>

      <p
        className="
          mt-2
          font-sans
          text-[13px]
          text-[#8A8A84]
        "
      >
        {description}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* INFO                                                                       */
/* -------------------------------------------------------------------------- */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
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
        {label}
      </p>

      <p
        className="
          mt-2
          font-serif
          text-[18px]
          text-[#292929]
        "
      >
        {value || "Not provided"}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DETAIL                                                                     */
/* -------------------------------------------------------------------------- */

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div
        className="
          flex
          items-center
          gap-2
          font-sans
          text-[11px]
          font-medium
          uppercase
          tracking-[0.12em]
          text-[#6F8F72]
        "
      >
        {icon}
        {label}
      </div>

      <p
        className="
          mt-2
          font-serif
          text-[17px]
          text-[#292929]
        "
      >
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PAYMENT DETAIL                                                             */
/* -------------------------------------------------------------------------- */

function PaymentDetail({
  label,
  value,
}: {
  label: string;
  value: string;
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
          text-[#6F8F72]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-2
          font-serif
          text-[17px]
          text-[#292929]
        "
      >
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* STAT                                                                       */
/* -------------------------------------------------------------------------- */

function Stat({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix: string;
}) {
  return (
    <div>
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
        {label}
      </p>

      <p className="mt-2 font-serif text-[28px]">
        {value}
      </p>

      <p
        className="
          mt-1
          font-sans
          text-[13px]
          text-[#777771]
        "
      >
        {suffix}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PAYMENT STATUS                                                             */
/* -------------------------------------------------------------------------- */

function PaymentStatusBadge({
  status,
}: {
  status: string;
}) {
  const isPaid = status === "paid";

  return (
    <span
      className={`
        inline-flex
        w-fit
        rounded-full
        px-4
        py-2
        font-sans
        text-[11px]
        font-medium
        uppercase
        tracking-[0.12em]
        ${
          isPaid
            ? "bg-[#E2EBDD] text-[#6F8F72]"
            : "bg-[#F4EBDD] text-[#9A7650]"
        }
      `}
    >
      {isPaid ? "Paid" : "Payment Pending"}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* STATUS                                                                     */
/* -------------------------------------------------------------------------- */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const labels: Record<string, string> = {
    scheduled: "Scheduled",
    completed: "Completed",
    no_show: "No-show",
    late_cancellation: "Late cancellation",
    student_cancelled_rescheduled:
      "Student cancelled · Rescheduled",
    student_cancelled_credit:
      "Student cancelled · Credit",
    unexpected_circumstance:
      "Unexpected circumstance",
    teacher_cancelled:
      "Teacher cancelled",
  };

  return (
    <span
      className="
        inline-flex
        rounded-full
        bg-[#F0F4ED]
        px-3
        py-1.5
        font-sans
        text-[10px]
        font-medium
        uppercase
        tracking-[0.07em]
        text-[#6F8F72]
      "
    >
      {labels[status] ?? status}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* ENROLLMENT STATUS                                                          */
/* -------------------------------------------------------------------------- */

function formatEnrollmentStatus(
  status: string
) {
  const labels: Record<string, string> = {
    pending: "Pending",
    contract_review: "Contract Review",
    payment_pending: "Payment Pending",
    active: "Active",
    completed: "Completed",
  };

  return labels[status] ?? status;
}

/* -------------------------------------------------------------------------- */
/* PAYMENT METHOD                                                             */
/* -------------------------------------------------------------------------- */

function formatPaymentMethod(
  paymentMethod: string | null
) {
  if (!paymentMethod) {
    return "Not provided";
  }

  const normalized =
    paymentMethod.trim().toLowerCase();

  /*
   * "pending" is a payment STATUS, not a payment method.
   *
   * Do not show it as a method even if an older record
   * accidentally contains it.
   */

  if (normalized === "pending") {
    return "Not provided";
  }

  const labels: Record<string, string> = {
    bank_transfer: "Bank transfer",
    paypal: "PayPal",
    gcash: "GCash",
    cash: "Cash",
    card: "Card",
  };

  return (
    labels[normalized] ??
    paymentMethod
  );
}

/* -------------------------------------------------------------------------- */
/* PAYMENT FORMAT                                                             */
/* -------------------------------------------------------------------------- */

function formatCurrency(
  amount: number | null,
  currency: string | null
) {
  if (amount === null || amount === undefined) {
    return "Not provided";
  }

  const currencyCode =
    currency || "KRW";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits:
        currencyCode === "KRW" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toLocaleString()}`;
  }
}

/* -------------------------------------------------------------------------- */
/* PAYMENT SORTING                                                            */
/* -------------------------------------------------------------------------- */

function comparePayments(
  a: Payment,
  b: Payment
) {
  const dateA = getPaymentTimestamp(a);
  const dateB = getPaymentTimestamp(b);

  return dateB - dateA;
}

function comparePaymentHistory(
  a: Payment & { enrollment: Enrollment },
  b: Payment & { enrollment: Enrollment }
) {
  const dateA = getPaymentTimestamp(a);
  const dateB = getPaymentTimestamp(b);

  return dateB - dateA;
}

function getPaymentTimestamp(
  payment: Payment
) {
  if (payment.payment_date) {
    const timestamp = new Date(
      `${payment.payment_date}T00:00:00`
    ).getTime();

    if (Number.isFinite(timestamp)) {
      return timestamp;
    }
  }

  if (payment.created_at) {
    const timestamp = new Date(
      payment.created_at
    ).getTime();

    if (Number.isFinite(timestamp)) {
      return timestamp;
    }
  }

  return 0;
}

/* -------------------------------------------------------------------------- */
/* FORMATTERS                                                                 */
/* -------------------------------------------------------------------------- */

function formatDate(date: string | null) {
  if (!date) return "Not set";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(
    new Date(`${date}T00:00:00`)
  );
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":");

  const date = new Date();

  date.setHours(
    Number(hours),
    Number(minutes),
    0,
    0
  );

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatScheduleDays(
  days: string[] | null
) {
  if (!days || days.length === 0) {
    return "Not set";
  }

  const labels: Record<string, string> = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  return days
    .map(
      (day) =>
        labels[day.toLowerCase()] ?? day
    )
    .join(", ");
}

function formatResolution(
  resolution: string
) {
  const labels: Record<string, string> = {
    rescheduled: "Rescheduled",
    lesson_credit: "Lesson credit",
    counted_as_completed:
      "Counted as completed",
  };

  return labels[resolution] ?? resolution;
}