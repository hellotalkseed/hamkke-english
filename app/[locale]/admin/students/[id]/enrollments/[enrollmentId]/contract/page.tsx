import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PrintButton from "./PrintButton";

interface ContractPageProps {
  params: Promise<{
    locale: string;
    id: string;
    enrollmentId: string;
  }>;
}

export default async function ContractPage({
  params,
}: ContractPageProps) {
  const { locale, id, enrollmentId } = await params;

  const supabase = await createClient();

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id, full_name, timezone")
    .eq("id", id)
    .single();

  if (studentError || !student) {
    notFound();
  }

  const { data: enrollment, error: enrollmentError } =
    await supabase
      .from("enrollments")
      .select(`
        id,
        package_name,
        number_of_lessons,
        lesson_duration,
        lessons_per_week,
        start_date,
        tuition_amount,
        currency,
        schedule_days,
        schedule_time
      `)
      .eq("id", enrollmentId)
      .eq("student_id", id)
      .single();

  if (enrollmentError || !enrollment) {
    notFound();
  }

  // Always use the student's full legal/account name.
  const studentName = student.full_name;

  const { data: contract, error: contractError } =
    await supabase
      .from("contracts")
      .select(`
        id,
        contract_number,
        agreement_date
      `)
      .eq("enrollment_id", enrollmentId)
      .single();

  if (contractError || !contract) {
    notFound();
  }

  const agreementDate = new Date(
    `${contract.agreement_date}T00:00:00`
  ).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const startDate = enrollment.start_date
    ? new Date(
        `${enrollment.start_date}T00:00:00`
      ).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "To be confirmed";

  /*
   * Normalize lesson days.
   *
   * Handles:
   * ["mon", "wed", "fri"]
   * ["Monday", "Wednesday", "Friday"]
   * ["Monday · Wednesday · Friday"]
   * accidental "Â·" encoding
   * duplicate days
   */
  const dayNames: Record<string, string> = {
    mon: "Monday",
    monday: "Monday",

    tue: "Tuesday",
    tues: "Tuesday",
    tuesday: "Tuesday",

    wed: "Wednesday",
    wednesday: "Wednesday",

    thu: "Thursday",
    thurs: "Thursday",
    thursday: "Thursday",

    fri: "Friday",
    friday: "Friday",

    sat: "Saturday",
    saturday: "Saturday",

    sun: "Sunday",
    sunday: "Sunday",
  };

  const rawScheduleDays = Array.isArray(enrollment.schedule_days)
    ? enrollment.schedule_days
    : [];

  const normalizedScheduleDays = rawScheduleDays
    .flatMap((day: string) =>
      String(day)
        .replace(/Â·/g, "·")
        .split("·")
        .map((part) => part.trim())
        .filter(Boolean)
    )
    .map((day) => {
      const normalized = day.toLowerCase().trim();

      return dayNames[normalized] || day;
    })
    .filter(
      (day, index, array) =>
        array.indexOf(day) === index
    );

  const scheduleDays =
    normalizedScheduleDays.length > 0
      ? normalizedScheduleDays.join(" · ")
      : "To be confirmed";

  const scheduleTime = enrollment.schedule_time
    ? formatTime(enrollment.schedule_time)
    : "To be confirmed";

  const currency = enrollment.currency || "KRW";

  const tuition = new Intl.NumberFormat("en-US").format(
    Number(enrollment.tuition_amount || 0)
  );

  return (
    <main className="min-h-screen bg-[#F3F3F1] text-[#222] print:min-h-0 print:bg-white">
      {/* ADMIN NAVIGATION */}
      <div className="mx-auto w-full max-w-[794px] px-5 py-5 print:hidden">
        <div className="flex items-center justify-between">
          <Link
            href={`/${locale}/admin/students/${student.id}`}
            className="
              inline-flex
              items-center
              gap-2
              font-sans
              text-[13px]
              text-[#555]
              hover:text-[#222]
            "
          >
            <ArrowLeft
              size={15}
              strokeWidth={1.5}
            />
            Back to Student
          </Link>

          <PrintButton />
        </div>
      </div>

      {/* A4 DOCUMENT */}
      <div
        className="
          mx-auto
          w-full
          max-w-[794px]
          px-0
          pb-12
          print:max-w-none
          print:p-0
        "
      >
        <article
          className="
            bg-white
            px-[52px]
            py-[48px]
            shadow-[0_2px_12px_rgba(0,0,0,0.06)]
            print:shadow-none
            print:px-0
            print:py-0
          "
        >
          {/* ============================================================ */}
          {/* HEADER                                                       */}
          {/* ============================================================ */}

          <header className="contract-header border-b border-[#CFCFCB] pb-6">
            <div className="flex items-start justify-between gap-8">
              <div>
                <div
                  className="
                    font-serif
                    text-[25px]
                    leading-none
                    tracking-[-0.02em]
                    text-[#222]
                  "
                >
                  Hamkke │ 함께
                </div>

                <p
                  className="
                    mt-2
                    font-sans
                    text-[9px]
                    uppercase
                    tracking-[0.16em]
                    text-[#777]
                  "
                >
                  From Small Talk to Big Ideas
                </p>
              </div>

              <div className="text-right">
                <p
                  className="
                    font-sans
                    text-[9px]
                    font-medium
                    uppercase
                    tracking-[0.14em]
                    text-[#666]
                  "
                >
                  Private English Lessons
                </p>

                <p
                  className="
                    mt-1
                    font-serif
                    text-[17px]
                    leading-tight
                    text-[#222]
                  "
                >
                  Lesson Agreement
                </p>
              </div>
            </div>
          </header>

          {/* ============================================================ */}
          {/* AGREEMENT INFORMATION                                        */}
          {/* ============================================================ */}

          <section className="contract-summary border-b border-[#CFCFCB] py-5">
            <div className="grid grid-cols-2">
              <SummaryItem
                label="Student"
                value={studentName}
                className="border-r border-[#D5D5D1] pr-8"
              />

              <SummaryItem
                label="Agreement Date"
                value={agreementDate}
                className="pl-8"
              />
            </div>
          </section>

          {/* ============================================================ */}
          {/* 01                                                            */}
          {/* ============================================================ */}

          <Section
            number="01"
            title="Agreement Overview"
          >
            <p>
              This Lesson Agreement sets out the terms and
              policies applicable to the private English
              lessons arranged between Hamkke and the
              student named above.
            </p>

            <p>
              The lesson package, schedule, tuition, and
              policies described in this agreement apply to
              the enrollment identified below.
            </p>

            <p>
              This agreement is provided digitally before
              payment. By proceeding with payment for the
              lesson package, the student confirms that they
              have had the opportunity to review this
              agreement and agree to the terms and lesson
              policies contained herein.
            </p>
          </Section>

          {/* ============================================================ */}
          {/* 02                                                            */}
          {/* ============================================================ */}

          <Section
            number="02"
            title="Enrollment Details"
          >
            <div className="detail-table">
              <DetailRow
                label="Package"
                value={enrollment.package_name}
                strong
              />

              <DetailRow
                label="Number of Lessons"
                value={`${enrollment.number_of_lessons} lessons`}
              />

              <DetailRow
                label="Lesson Duration"
                value={`${enrollment.lesson_duration} minutes`}
              />

              <DetailRow
                label="Lessons Per Week"
                value={`${enrollment.lessons_per_week}`}
              />

              <DetailRow
                label="Start Date"
                value={startDate}
              />

              <DetailRow
                label="Lesson Days"
                value={scheduleDays}
              />

              <DetailRow
                label="Lesson Time"
                value={scheduleTime}
              />

              <DetailRow
                label="Student Timezone"
                value={student.timezone || "To be confirmed"}
              />

              <DetailRow
                label="Tuition"
                value={`${currency} ${tuition}`}
                strong
                last
              />
            </div>
          </Section>

          {/* ============================================================ */}
          {/* 03                                                            */}
          {/* ============================================================ */}

          <Section
            number="03"
            title="Tuition & Payment"
          >
            <p>
              The tuition for the enrollment is{" "}
              {currency} {tuition} for the lesson package
              described above.
            </p>

            <p>
              The lesson package is reserved for the
              student upon payment. Payment confirms the
              student's acceptance of this agreement and
              the lesson policies set out below.
            </p>

            <p>
              Because lessons are purchased as a package,
              refunds are generally not available once a
              package has been paid for, subject to the
              exceptions described in the Refunds & Transfers
              section of this agreement.
            </p>
          </Section>

          {/* ============================================================ */}
          {/* 04                                                            */}
          {/* ============================================================ */}

          <Section
            number="04"
            title="Cancellation & Rescheduling"
          >
            <p>
              Each lesson is reserved specifically for the
              student. If the student needs to cancel or
              reschedule a lesson, notice should be provided
              at least 2 hours before the scheduled lesson.
            </p>

            <div className="policy-table">
              <Policy
                title="With 2+ hours' notice"
                text="The student may reschedule the lesson or receive credit for a future session."
              />

              <Policy
                title="With less than 2 hours' notice"
                text="The lesson will be counted as completed."
              />

              <Policy
                title="No-show without notice"
                text="The lesson will be counted as completed."
                last
              />
            </div>

            <p>
              If something unexpected comes up, the student
              is encouraged to communicate as soon as
              reasonably possible. Hamkke will do its best
              to accommodate reasonable circumstances when
              possible.
            </p>
          </Section>

          {/* ============================================================ */}
          {/* 05                                                            */}
          {/* ============================================================ */}

          <Section
            number="05"
            title="Unexpected Circumstances"
          >
            <p>
              Not everything is within either party's
              control. Power outages, internet or connection
              problems, emergencies, and other unexpected
              circumstances may occasionally make it
              difficult to attend a lesson.
            </p>

            <p>
              If an unexpected circumstance occurs, the
              affected party should communicate as soon as
              reasonably possible.
            </p>

            <p>
              Depending on the circumstances, Hamkke may
              provide a reasonable solution such as
              rescheduling the lesson or providing lesson
              credit.
            </p>

            <p>
              This also applies when an unexpected issue on
              Hamkke's side prevents a lesson from taking
              place as planned.
            </p>
          </Section>

          {/* ============================================================ */}
          {/* 06                                                            */}
          {/* ============================================================ */}

          <Section
            number="06"
            title="Late Arrivals"
          >
            <p>
              If the student is running late, they should
              let Hamkke know when they can.
            </p>

            <p>
              A late arrival does not extend the scheduled
              lesson. The lesson will still end at its
              originally scheduled time.
            </p>

            <p>
              Example: If a lesson is scheduled from
              8:00–8:25 PM and the student joins at
              8:10 PM, the lesson will run from 8:10–8:25
              PM.
            </p>

            <p>
              If the student does not join within 10 minutes
              and has not contacted Hamkke, the lesson will
              be considered a no-show and counted as
              completed.
            </p>
          </Section>

          {/* ============================================================ */}
          {/* 07                                                            */}
          {/* ============================================================ */}

          <Section
            number="07"
            title="Teacher Cancellations"
          >
            <p>
              Sometimes Hamkke may need to cancel a lesson.
            </p>

            <p>
              If this happens, Hamkke will communicate the
              cancellation as soon as possible.
            </p>

            <p>
              The student will receive either a replacement
              lesson or full credit for the missed session.
            </p>
          </Section>

          {/* ============================================================ */}
          {/* 08                                                            */}
          {/* ============================================================ */}

          <Section
            number="08"
            title="Repeated Cancellations"
          >
            <p>
              There is no fixed limit on cancellations.
              Hamkke understands that unexpected situations
              can happen.
            </p>

            <p>
              However, if frequent cancellations or
              rescheduling begin to affect lesson
              availability, Hamkke may contact the student
              to discuss the regular schedule and find an
              arrangement that works better for both parties.
            </p>

            <p>
              The purpose of this provision is to keep
              reserved lesson times useful and fair for
              everyone.
            </p>
          </Section>

          {/* ============================================================ */}
          {/* 09                                                            */}
          {/* ============================================================ */}

          <Section
            number="09"
            title="Refunds & Transfers"
          >
            <p>
              Because lessons are purchased as a package,
              refunds are generally not available once a
              package has been paid for.
            </p>

            <p>
              If the student is unable to continue their
              lessons, they may request to transfer their
              remaining unused lessons instead of receiving
              a refund.
            </p>

            <p>
              Lesson transfers apply only to unused lessons
              and should be discussed before the package
              ends. Any new arrangement will depend on the
              circumstances and availability.
            </p>

            <p>
              In exceptional circumstances, a refund may be
              considered at Hamkke's discretion.
            </p>

            <p>
              If an unexpected situation arises, the student
              is encouraged to communicate with Hamkke first
              so that a fair and reasonable solution can be
              considered.
            </p>
          </Section>

          {/* ============================================================ */}
          {/* 10                                                            */}
          {/* ============================================================ */}

          <Section
            number="10"
            title="Communication"
          >
            <p>
              Students are encouraged to communicate
              scheduling changes, technical issues,
              emergencies, and other circumstances as soon
              as possible.
            </p>

            <p>
              Clear and timely communication helps both
              parties manage reserved lesson times fairly
              and avoid unnecessary misunderstandings.
            </p>
          </Section>

          {/* ============================================================ */}
          {/* 11                                                            */}
          {/* ============================================================ */}

          <Section
            number="11"
            title="Agreement & Acceptance"
          >
            <p>
              This agreement is provided to the student
              before payment so that the student may review
              the lesson package and applicable policies in
              advance.
            </p>

            <p>
              By proceeding with payment for this enrollment,
              the student confirms that they have read and
              understood the agreement and agree to the
              lesson package details and policies described
              herein.
            </p>

            <p>
              No handwritten signature is required for this
              digital agreement. The payment associated with
              this enrollment serves as confirmation of
              acceptance of these terms.
            </p>
          </Section>

          {/* ============================================================ */}
          {/* AGREEMENT RECORD                                              */}
          {/* ============================================================ */}

          <section className="agreement-record border-b border-[#CFCFCB] py-7">
            <div className="border border-[#C8C8C4]">
              <div className="border-b border-[#C8C8C4] px-5 py-4">
                <p
                  className="
                    font-sans
                    text-[9px]
                    font-medium
                    uppercase
                    tracking-[0.14em]
                    text-[#555]
                  "
                >
                  Digital Agreement
                </p>

                <h2
                  className="
                    mt-1.5
                    font-serif
                    text-[21px]
                    font-normal
                    text-[#222]
                  "
                >
                  Payment constitutes acceptance
                </h2>

                <p
                  className="
                    mt-1
                    font-sans
                    text-[11px]
                    text-[#666]
                  "
                >
                  of this Lesson Agreement.
                </p>
              </div>

              <div className="grid grid-cols-2">
                <div className="border-r border-[#C8C8C4] px-5 py-4">
                  <Info
                    label="Student"
                    value={studentName}
                  />
                </div>

                <div className="px-5 py-4">
                  <Info
                    label="Agreement Date"
                    value={agreementDate}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* FOOTER                                                        */}
          {/* ============================================================ */}

          <footer className="pt-6 text-center">
            <div
              className="
                font-serif
                text-[18px]
                text-[#222]
              "
            >
              Hamkke │ 함께
            </div>

            <p
              className="
                mx-auto
                mt-3
                max-w-[570px]
                font-sans
                text-[9.5px]
                leading-[1.6]
                text-[#777]
              "
            >
              These guidelines are here to help keep lessons
              predictable, respectful, and comfortable for both sides.
            </p>

            <p
              className="
                mt-1
                font-sans
                text-[9.5px]
                leading-[1.6]
                text-[#777]
              "
            >
              Thank you for respecting the time we've set aside for each conversation.
            </p>
          </footer>
        </article>
      </div>

      {/* ================================================================ */}
      {/* PRINT STYLES                                                     */}
      {/* ================================================================ */}

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm 17mm 16mm;
          }

          html,
          body {
            width: 100%;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          main {
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          article {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            box-shadow: none !important;
          }

          /*
           * Keep the document header and summary together.
           */
          .contract-header {
            break-after: avoid;
            page-break-after: avoid;
          }

          .contract-summary {
            break-after: avoid;
            page-break-after: avoid;
          }

          /*
           * Keep each numbered contract section together.
           *
           * This prevents sections such as:
           * 03 Tuition & Payment
           * 07 Teacher Cancellations
           *
           * from having their heading/paragraphs split
           * across two printed pages.
           */
          .contract-section {
            break-inside: avoid-page !important;
            page-break-inside: avoid !important;
          }

          .contract-section > div:first-child {
            break-inside: avoid-page !important;
            page-break-inside: avoid !important;
          }

          /*
           * Keep tables and individual rows together.
           */
          .detail-table {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .detail-row {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .policy-table {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .policy-row {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          /*
           * Keep the digital agreement record together.
           */
          .agreement-record {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          /*
           * Keep the footer together.
           */
          footer {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          /*
           * Keep headings with the content immediately following them.
           */
          h1,
          h2,
          h3 {
            break-after: avoid;
            page-break-after: avoid;
          }

          /*
           * Prevent awkward single lines at the top or bottom
           * of printed pages.
           */
          p {
            orphans: 3;
            widows: 3;
          }

          /*
           * Remove link styling in the printed agreement.
           */
          a {
            color: inherit !important;
            text-decoration: none !important;
          }
        }
      `}</style>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* SECTION                                                                    */
/* -------------------------------------------------------------------------- */

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="
        contract-section
        border-b
        border-[#CFCFCB]
        py-6
      "
    >
      <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-3">
        <div
          className="
            pt-[3px]
            font-sans
            text-[9px]
            font-medium
            tracking-[0.08em]
            text-[#555]
          "
        >
          {number}
        </div>

        <div>
          <h2
            className="
              font-serif
              text-[21px]
              font-normal
              leading-[1.2]
              tracking-[-0.015em]
              text-[#222]
            "
          >
            {title}
          </h2>

          <div
            className="
              mt-3.5
              space-y-3
              font-sans
              text-[12.5px]
              leading-[1.65]
              text-[#444]
            "
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* SUMMARY                                                                    */
/* -------------------------------------------------------------------------- */

function SummaryItem({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p
        className="
          font-sans
          text-[8.5px]
          font-medium
          uppercase
          tracking-[0.12em]
          text-[#666]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1.5
          font-serif
          text-[16px]
          leading-[1.3]
          text-[#222]
        "
      >
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DETAIL ROW                                                                 */
/* -------------------------------------------------------------------------- */

function DetailRow({
  label,
  value,
  strong = false,
  last = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`
        detail-row
        grid
        grid-cols-[155px_minmax(0,1fr)]
        items-baseline
        gap-6
        py-2.5
        ${!last ? "border-b border-[#E1E0DC]" : ""}
      `}
    >
      <p
        className="
          font-sans
          text-[8.5px]
          font-medium
          uppercase
          tracking-[0.11em]
          text-[#666]
        "
      >
        {label}
      </p>

      <p
        className={`
          font-serif
          leading-[1.3]
          text-[#222]
          ${strong ? "text-[15px]" : "text-[13.5px]"}
        `}
      >
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* INFO                                                                       */
/* -------------------------------------------------------------------------- */

function Info({
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
          text-[8.5px]
          font-medium
          uppercase
          tracking-[0.12em]
          text-[#666]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1.5
          font-serif
          text-[15px]
          leading-[1.3]
          text-[#222]
        "
      >
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* POLICY                                                                     */
/* -------------------------------------------------------------------------- */

function Policy({
  title,
  text,
  last = false,
}: {
  title: string;
  text: string;
  last?: boolean;
}) {
  return (
    <div
      className={`
        policy-row
        py-3
        ${!last ? "border-b border-[#E1E0DC]" : ""}
      `}
    >
      <div className="grid grid-cols-[155px_minmax(0,1fr)] gap-6">
        <p
          className="
            font-sans
            text-[9px]
            font-medium
            uppercase
            tracking-[0.09em]
            text-[#444]
          "
        >
          {title}
        </p>

        <p
          className="
            font-sans
            text-[12px]
            leading-[1.6]
            text-[#555]
          "
        >
          {text}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* TIME FORMAT                                                                */
/* -------------------------------------------------------------------------- */

function formatTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return value;
  }

  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}