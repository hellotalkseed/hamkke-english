import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import PrintContractButton from "@/components/admin/PrintContractButton";

import {
  isValidLocale,
  type Locale,
} from "@/lib/i18n";

interface ContractPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

interface Student {
  id: string;
  full_name: string;
  preferred_name: string | null;
  email: string | null;
  contact_method: string | null;
  country: string | null;
  preferred_language: string | null;
  timezone: string | null;
}

interface Enrollment {
  id: string;
  student_id: string;
  package_name: string | null;
  number_of_lessons: number | null;
  lesson_duration: number | null;
  lessons_per_week: number | null;
  tuition_amount: number | null;
  currency: string | null;
  start_date: string | null;
  schedule_days: string[] | null;
  schedule_time: string | null;
  status: string | null;
  created_at: string;
}

export default async function ContractPage({
  params,
}: ContractPageProps) {
  const { locale, id } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const currentLocale = locale as Locale;

  const supabase = await createClient();

  /*
   * --------------------------------------------------------------------------
   * STUDENT
   * --------------------------------------------------------------------------
   */

  const {
    data: student,
    error: studentError,
  } = await supabase
    .from("students")
    .select(`
      id,
      full_name,
      preferred_name,
      email,
      contact_method,
      country,
      preferred_language,
      timezone
    `)
    .eq("id", id)
    .single();

  if (studentError || !student) {
    notFound();
  }

  /*
   * --------------------------------------------------------------------------
   * LATEST ENROLLMENT
   * --------------------------------------------------------------------------
   */

  const {
    data: enrollment,
    error: enrollmentError,
  } = await supabase
    .from("enrollments")
    .select(`
      id,
      student_id,
      package_name,
      number_of_lessons,
      lesson_duration,
      lessons_per_week,
      tuition_amount,
      currency,
      start_date,
      schedule_days,
      schedule_time,
      status,
      created_at
    `)
    .eq("student_id", id)
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (enrollmentError) {
    console.error(
      "CONTRACT ENROLLMENT ERROR:",
      enrollmentError
    );
  }

  /*
   * --------------------------------------------------------------------------
   * NO ENROLLMENT
   * --------------------------------------------------------------------------
   */

  if (!enrollment) {
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
        <div className="mx-auto max-w-4xl">
          <Link
            href={`/${currentLocale}/admin/students/${student.id}`}
            className="
              font-sans
              text-[13px]
              font-medium
              text-[#6F8F72]
              transition
              hover:opacity-70
            "
          >
            ← Student
          </Link>

          <div
            className="
              mt-10
              rounded-3xl
              border
              border-[#E7DDD1]
              bg-white
              px-7
              py-12
              text-center

              sm:px-12
              sm:py-16
            "
          >
            <p
              className="
                font-sans
                text-[11px]
                font-medium
                uppercase
                tracking-[0.16em]
                text-[#6F8F72]
              "
            >
              Contract
            </p>

            <h1
              className="
                mt-4
                font-serif
                text-[32px]
                font-normal
                text-[#444]
              "
            >
              No enrollment found
            </h1>

            <p
              className="
                mx-auto
                mt-4
                max-w-md
                font-sans
                text-[14px]
                leading-7
                text-[#777]
              "
            >
              A contract can only be generated after
              an enrollment has been created for this
              student.
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * --------------------------------------------------------------------------
   * CONTRACT DATA
   * --------------------------------------------------------------------------
   */

  const packageName =
    enrollment.package_name || "English Lesson Package";

  const numberOfLessons =
    enrollment.number_of_lessons ?? 0;

  const lessonDuration =
    enrollment.lesson_duration ?? 0;

  const lessonsPerWeek =
    enrollment.lessons_per_week ?? 0;

  const tuitionAmount =
    Number(enrollment.tuition_amount ?? 0);

  const currency =
    enrollment.currency || "KRW";

  const scheduleDays =
    formatScheduleDays(
      enrollment.schedule_days
    );

  const scheduleTime =
    formatTime(enrollment.schedule_time);

  const contractDate =
    formatDate(
      enrollment.created_at
    );

  const startDate =
    formatDate(
      enrollment.start_date
    );

  const studentDisplayName =
    student.preferred_name
      ? `${student.full_name} (${student.preferred_name})`
      : student.full_name;

  return (
    <>
      <main
        className="
          min-h-screen
          bg-[#FAF8F5]
          px-5
          py-10
          text-[#292929]

          sm:px-8
          sm:py-14

          lg:px-10
          lg:py-16
        "
      >
        <div className="mx-auto max-w-5xl">

          {/* ---------------------------------------------------------------- */}
          {/* ADMIN CONTROLS                                                   */}
          {/* ---------------------------------------------------------------- */}

          <div
            className="
              mb-8
              flex
              flex-col
              gap-4

              sm:flex-row
              sm:items-center
              sm:justify-between

              print:hidden
            "
          >
            <Link
              href={`/${currentLocale}/admin/students/${student.id}`}
              className="
                font-sans
                text-[13px]
                font-medium
                text-[#6F8F72]
                transition
                hover:opacity-70
              "
            >
              ← Student
            </Link>

            <PrintContractButton />
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* CONTRACT DOCUMENT                                                */}
          {/* ---------------------------------------------------------------- */}

          <article
            className="
              overflow-hidden
              border
              border-[#DDD3C7]
              bg-white
              shadow-[0_8px_35px_rgba(50,40,30,0.06)]

              print:border-0
              print:shadow-none
            "
          >

            {/* ================================================================ */}
            {/* DOCUMENT HEADER                                                  */}
            {/* ================================================================ */}

            <header
              className="
                border-b
                border-[#D8CCBE]
                px-7
                py-9

                sm:px-12
                sm:py-12
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-8

                  sm:flex-row
                  sm:items-start
                  sm:justify-between
                "
              >
                <div>
                  <p
                    className="
                      font-serif
                      text-[20px]
                      tracking-[-0.02em]
                      text-[#4D5F50]
                    "
                  >
                    Hamkke │ 함께
                  </p>

                  <p
                    className="
                      mt-2
                      font-sans
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.2em]
                      text-[#999]
                    "
                  >
                    From Small Talks to Big Ideas
                  </p>
                </div>

                <div
                  className="
                    sm:text-right
                  "
                >
                  <p
                    className="
                      font-sans
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.18em]
                      text-[#999]
                    "
                  >
                    Private English Lessons
                  </p>

                  <p
                    className="
                      mt-2
                      font-serif
                      text-[28px]
                      font-normal
                      text-[#333]
                    "
                  >
                    Lesson Agreement
                  </p>
                </div>
              </div>

              <div
                className="
                  mt-9
                  grid
                  border-t
                  border-[#EEE7DF]
                  pt-6

                  sm:grid-cols-3
                "
              >
                <DocumentMeta
                  label="Student"
                  value={studentDisplayName}
                />

                <DocumentMeta
                  label="Agreement Date"
                  value={contractDate}
                />

                <DocumentMeta
                  label="Status"
                  value={
                    enrollment.status === "active"
                      ? "Active"
                      : "Pending Payment"
                  }
                />
              </div>
            </header>

            {/* ================================================================ */}
            {/* INTRODUCTION                                                      */}
            {/* ================================================================ */}

            <div
              className="
                px-7
                py-9

                sm:px-12
                sm:py-12
              "
            >
              <section>
                <SectionNumber number="01" />

                <h2 className="contract-heading">
                  Agreement Overview
                </h2>

                <div className="contract-copy">
                  <p>
                    This Lesson Agreement sets out the
                    terms and policies applicable to the
                    private English lessons arranged
                    between Hamkke and the student named
                    above.
                  </p>

                  <p>
                    The lesson package, schedule, tuition,
                    and policies described in this
                    agreement apply to the enrollment
                    identified below.
                  </p>

                  <p>
                    This agreement is provided digitally
                    before payment. By proceeding with
                    payment for the lesson package, the
                    student confirms that they have had
                    the opportunity to review this
                    agreement and agree to the terms and
                    lesson policies contained herein.
                  </p>
                </div>
              </section>

              {/* ============================================================ */}
              {/* ENROLLMENT DETAILS                                             */}
              {/* ============================================================ */}

              <section className="contract-section">
                <SectionNumber number="02" />

                <h2 className="contract-heading">
                  Enrollment Details
                </h2>

                <div
                  className="
                    mt-6
                    border
                    border-[#D8CCBE]
                  "
                >
                  <ContractRow
                    label="Package"
                    value={packageName}
                  />

                  <ContractRow
                    label="Number of Lessons"
                    value={`${numberOfLessons} lessons`}
                  />

                  <ContractRow
                    label="Lesson Duration"
                    value={`${lessonDuration} minutes`}
                  />

                  <ContractRow
                    label="Lessons Per Week"
                    value={`${lessonsPerWeek}`}
                  />

                  <ContractRow
                    label="Start Date"
                    value={startDate}
                  />

                  <ContractRow
                    label="Lesson Days"
                    value={scheduleDays}
                  />

                  <ContractRow
                    label="Lesson Time"
                    value={scheduleTime}
                  />

                  <ContractRow
                    label="Student Timezone"
                    value={
                      student.timezone || "Not specified"
                    }
                  />

                  <ContractRow
                    label="Tuition"
                    value={`${currency} ${tuitionAmount.toLocaleString()}`}
                    last
                  />
                </div>
              </section>

              {/* ============================================================ */}
              {/* PAYMENT                                                        */}
              {/* ============================================================ */}

              <section className="contract-section">
                <SectionNumber number="03" />

                <h2 className="contract-heading">
                  Tuition & Payment
                </h2>

                <div className="contract-copy">
                  <p>
                    The tuition for the enrollment is{" "}
                    <strong>
                      {currency}{" "}
                      {tuitionAmount.toLocaleString()}
                    </strong>{" "}
                    for the lesson package described
                    above.
                  </p>

                  <p>
                    The lesson package is reserved for
                    the student upon payment. Payment
                    confirms the student's acceptance of
                    this agreement and the lesson policies
                    set out below.
                  </p>

                  <p>
                    Because lessons are purchased as a
                    package, refunds are generally not
                    available once the package has been
                    paid for, subject to the exceptions
                    described in the Refunds & Transfers
                    section of this agreement.
                  </p>
                </div>
              </section>

              {/* ============================================================ */}
              {/* CANCELLATION                                                   */}
              {/* ============================================================ */}

              <section className="contract-section">
                <SectionNumber number="04" />

                <h2 className="contract-heading">
                  Cancellation & Rescheduling
                </h2>

                <div className="contract-copy">
                  <p>
                    Each lesson is reserved specifically
                    for the student. If the student needs
                    to cancel or reschedule a lesson,
                    notice should be provided at least
                    <strong> 2 hours before</strong> the
                    scheduled lesson.
                  </p>

                  <PolicyRow
                    title="With 2+ hours' notice"
                    text="The student may reschedule the lesson or receive credit for a future session."
                  />

                  <PolicyRow
                    title="With less than 2 hours' notice"
                    text="The lesson will be counted as completed."
                  />

                  <PolicyRow
                    title="No-show without notice"
                    text="The lesson will be counted as completed."
                  />

                  <p>
                    If something unexpected comes up,
                    the student is encouraged to
                    communicate as soon as possible.
                    Hamkke will do its best to accommodate
                    reasonable circumstances when possible.
                  </p>
                </div>
              </section>

              {/* ============================================================ */}
              {/* UNEXPECTED                                                     */}
              {/* ============================================================ */}

              <section className="contract-section">
                <SectionNumber number="05" />

                <h2 className="contract-heading">
                  Unexpected Circumstances
                </h2>

                <div className="contract-copy">
                  <p>
                    Not everything is within either
                    party's control. Power outages,
                    internet or connection problems,
                    emergencies, and other unexpected
                    circumstances may occasionally make
                    it difficult to attend a lesson.
                  </p>

                  <p>
                    If an unexpected circumstance occurs,
                    the affected party should communicate
                    as soon as reasonably possible.
                  </p>

                  <p>
                    Depending on the circumstances,
                    Hamkke may provide a reasonable
                    solution such as rescheduling the
                    lesson or providing lesson credit.
                  </p>

                  <p>
                    This also applies when an unexpected
                    issue on Hamkke's side prevents a
                    lesson from taking place as planned.
                  </p>
                </div>
              </section>

              {/* ============================================================ */}
              {/* LATE ARRIVAL                                                   */}
              {/* ============================================================ */}

              <section className="contract-section">
                <SectionNumber number="06" />

                <h2 className="contract-heading">
                  Late Arrivals
                </h2>

                <div className="contract-copy">
                  <p>
                    If the student is running late, they
                    should let Hamkke know when they can.
                  </p>

                  <p>
                    A late arrival does not extend the
                    scheduled lesson. The lesson will
                    still end at its originally scheduled
                    time.
                  </p>

                  <div
                    className="
                      my-6
                      border-l-2
                      border-[#A8B9A9]
                      bg-[#F7F8F5]
                      px-5
                      py-4
                    "
                  >
                    <p
                      className="
                        font-sans
                        text-[13px]
                        leading-6
                        text-[#555]
                      "
                    >
                      Example: If a lesson is scheduled
                      from 8:00–8:25 PM and the student
                      joins at 8:10 PM, the lesson will
                      run from 8:10–8:25 PM.
                    </p>
                  </div>

                  <p>
                    If the student does not join within
                    10 minutes and has not contacted
                    Hamkke, the lesson will be considered
                    a no-show and counted as completed.
                  </p>
                </div>
              </section>

              {/* ============================================================ */}
              {/* TEACHER CANCELLATION                                           */}
              {/* ============================================================ */}

              <section className="contract-section">
                <SectionNumber number="07" />

                <h2 className="contract-heading">
                  Teacher Cancellations
                </h2>

                <div className="contract-copy">
                  <p>
                    Sometimes Hamkke may need to cancel a
                    lesson.
                  </p>

                  <p>
                    If this happens, Hamkke will
                    communicate the cancellation as soon
                    as possible.
                  </p>

                  <p>
                    The student will receive either a
                    replacement lesson or full credit for
                    the missed session.
                  </p>
                </div>
              </section>

              {/* ============================================================ */}
              {/* REPEATED CANCELLATIONS                                         */}
              {/* ============================================================ */}

              <section className="contract-section">
                <SectionNumber number="08" />

                <h2 className="contract-heading">
                  Repeated Cancellations
                </h2>

                <div className="contract-copy">
                  <p>
                    There is no fixed limit on
                    cancellations. Hamkke understands that
                    unexpected situations can happen.
                  </p>

                  <p>
                    However, if frequent cancellations or
                    rescheduling begin to affect lesson
                    availability, Hamkke may contact the
                    student to discuss the regular
                    schedule and find an arrangement that
                    works better for both parties.
                  </p>

                  <p>
                    The purpose of this provision is to
                    keep reserved lesson times useful and
                    fair for everyone.
                  </p>
                </div>
              </section>

              {/* ============================================================ */}
              {/* REFUNDS & TRANSFERS                                             */}
              {/* ============================================================ */}

              <section className="contract-section">
                <SectionNumber number="09" />

                <h2 className="contract-heading">
                  Refunds & Transfers
                </h2>

                <div className="contract-copy">
                  <p>
                    Because lessons are purchased as a
                    package, refunds are generally not
                    available once a package has been
                    paid for.
                  </p>

                  <p>
                    If the student is unable to continue
                    their lessons, they may request to
                    transfer their remaining unused
                    lessons instead of receiving a refund.
                  </p>

                  <p>
                    Lesson transfers apply only to unused
                    lessons and should be discussed before
                    the package ends. Any new arrangement
                    will depend on the circumstances and
                    availability.
                  </p>

                  <p>
                    In exceptional circumstances, a refund
                    may be considered at Hamkke's
                    discretion.
                  </p>

                  <p>
                    If an unexpected situation arises, the
                    student is encouraged to communicate
                    with Hamkke first so that a fair and
                    reasonable solution can be considered.
                  </p>
                </div>
              </section>

              {/* ============================================================ */}
              {/* COMMUNICATION                                                  */}
              {/* ============================================================ */}

              <section className="contract-section">
                <SectionNumber number="10" />

                <h2 className="contract-heading">
                  Communication
                </h2>

                <div className="contract-copy">
                  <p>
                    Students are encouraged to communicate
                    scheduling changes, technical issues,
                    emergencies, and other circumstances
                    as soon as possible.
                  </p>

                  <p>
                    Clear and timely communication helps
                    both parties manage reserved lesson
                    times fairly and avoid unnecessary
                    misunderstandings.
                  </p>
                </div>
              </section>

              {/* ============================================================ */}
              {/* ACCEPTANCE                                                     */}
              {/* ============================================================ */}

              <section className="contract-section">
                <SectionNumber number="11" />

                <h2 className="contract-heading">
                  Agreement & Acceptance
                </h2>

                <div className="contract-copy">
                  <p>
                    This agreement is provided to the
                    student before payment so that the
                    student may review the lesson package
                    and applicable policies in advance.
                  </p>

                  <p>
                    By proceeding with payment for this
                    enrollment, the student confirms that
                    they have read and understood the
                    agreement and agree to the lesson
                    package details and policies described
                    herein.
                  </p>

                  <p>
                    No handwritten signature is required
                    for this digital agreement. The payment
                    associated with this enrollment serves
                    as confirmation of acceptance of these
                    terms.
                  </p>
                </div>

                {/* ACCEPTANCE BOX */}

                <div
                  className="
                    mt-8
                    border
                    border-[#CFC3B5]
                    bg-[#FAF8F5]
                    px-6
                    py-6

                    sm:px-7
                    sm:py-7
                  "
                >
                  <p
                    className="
                      font-sans
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.16em]
                      text-[#777]
                    "
                  >
                    Digital Agreement
                  </p>

                  <p
                    className="
                      mt-3
                      font-serif
                      text-[21px]
                      leading-8
                      text-[#444]
                    "
                  >
                    Payment constitutes acceptance of
                    this Lesson Agreement.
                  </p>

                  <div
                    className="
                      mt-6
                      grid
                      gap-5

                      sm:grid-cols-2
                    "
                  >
                    <SignatureField
                      label="Student"
                      value={student.full_name}
                    />

                    <SignatureField
                      label="Agreement Date"
                      value={contractDate}
                    />
                  </div>
                </div>
              </section>

              {/* ============================================================ */}
              {/* FINAL NOTE                                                     */}
              {/* ============================================================ */}

              <section
                className="
                  mt-12
                  border-t
                  border-[#D8CCBE]
                  pt-8
                "
              >
                <p
                  className="
                    font-sans
                    text-[10px]
                    font-medium
                    uppercase
                    tracking-[0.16em]
                    text-[#999]
                  "
                >
                  Hamkke │ 함께
                </p>

                <p
                  className="
                    mt-3
                    max-w-2xl
                    font-serif
                    text-[19px]
                    leading-8
                    text-[#555]
                  "
                >
                  These guidelines are here to help keep
                  lessons predictable, respectful, and
                  comfortable for both sides.
                </p>

                <p
                  className="
                    mt-3
                    max-w-2xl
                    font-sans
                    text-[13px]
                    leading-6
                    text-[#777]
                  "
                >
                  Thank you for respecting the time we've
                  set aside for each conversation.
                </p>
              </section>
            </div>

            {/* ================================================================ */}
            {/* DOCUMENT FOOTER                                                  */}
            {/* ================================================================ */}

            <footer
              className="
                border-t
                border-[#D8CCBE]
                bg-[#FAF8F5]
                px-7
                py-6

                sm:px-12
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
                <p
                  className="
                    font-sans
                    text-[10px]
                    text-[#999]
                  "
                >
                  Hamkke │ 함께 · Private English Lessons
                </p>

                <p
                  className="
                    font-sans
                    text-[10px]
                    text-[#999]
                  "
                >
                  Digital Lesson Agreement
                </p>
              </div>
            </footer>
          </article>
        </div>
      </main>

      {/* -------------------------------------------------------------------- */}
      {/* PRINT STYLES                                                         */}
      {/* -------------------------------------------------------------------- */}

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: A4;
                margin: 18mm 16mm;
              }

              html,
              body {
                background: white !important;
              }

              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }

              article {
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                border: 0 !important;
                box-shadow: none !important;
              }

              .contract-section {
                break-inside: avoid;
              }

              .contract-heading {
                break-after: avoid;
              }
            }
          `,
        }}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* DOCUMENT META                                                              */
/* -------------------------------------------------------------------------- */

function DocumentMeta({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-[#EEE7DF] pb-4 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0">
      <p
        className="
          font-sans
          text-[9px]
          font-medium
          uppercase
          tracking-[0.16em]
          text-[#999]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-2
          font-sans
          text-[13px]
          leading-5
          text-[#444]
        "
      >
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SECTION NUMBER                                                             */
/* -------------------------------------------------------------------------- */

function SectionNumber({
  number,
}: {
  number: string;
}) {
  return (
    <p
      className="
        font-sans
        text-[10px]
        font-medium
        tracking-[0.18em]
        text-[#6F8F72]
      "
    >
      {number}
    </p>
  );
}

/* -------------------------------------------------------------------------- */
/* CONTRACT ROW                                                               */
/* -------------------------------------------------------------------------- */

function ContractRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`
        grid
        gap-2
        px-5
        py-4

        sm:grid-cols-[190px_1fr]
        sm:gap-6

        ${
          last
            ? ""
            : "border-b border-[#EEE7DF]"
        }
      `}
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
        {label}
      </p>

      <p
        className="
          font-sans
          text-[13px]
          leading-5
          text-[#444]
        "
      >
        {value || "—"}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* POLICY ROW                                                                 */
/* -------------------------------------------------------------------------- */

function PolicyRow({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div
      className="
        my-5
        border-l-2
        border-[#A8B9A9]
        pl-5
      "
    >
      <p
        className="
          font-sans
          text-[12px]
          font-semibold
          text-[#444]
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1
          font-sans
          text-[13px]
          leading-6
          text-[#666]
        "
      >
        {text}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SIGNATURE FIELD                                                            */
/* -------------------------------------------------------------------------- */

function SignatureField({
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
          text-[9px]
          font-medium
          uppercase
          tracking-[0.14em]
          text-[#999]
        "
      >
        {label}
      </p>

      <div
        className="
          mt-7
          border-b
          border-[#AAA096]
          pb-2
        "
      >
        <p
          className="
            font-sans
            text-[13px]
            text-[#444]
          "
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* CONTRACT HEADING                                                           */
/* -------------------------------------------------------------------------- */

function ContractHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h2
      className="
        mt-2
        font-serif
        text-[27px]
        font-normal
        leading-tight
        tracking-[-0.02em]
        text-[#383838]

        sm:text-[30px]
      "
    >
      {children}
    </h2>
  );
}

/* -------------------------------------------------------------------------- */
/* DATE                                                                       */
/* -------------------------------------------------------------------------- */

function formatDate(
  value:
    | string
    | null
    | undefined
) {
  if (!value) {
    return "—";
  }

  const date =
    value.includes("T")
      ? new Date(value)
      : new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
}

/* -------------------------------------------------------------------------- */
/* SCHEDULE DAYS                                                              */
/* -------------------------------------------------------------------------- */

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
        normalized.charAt(0).toUpperCase() +
        normalized.slice(1)
      );
    })
    .join(" & ");
}

/* -------------------------------------------------------------------------- */
/* TIME                                                                       */
/* -------------------------------------------------------------------------- */

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

  if (Number.isNaN(hour)) {
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