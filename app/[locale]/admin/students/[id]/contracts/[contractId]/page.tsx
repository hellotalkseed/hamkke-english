import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PrintButton from "./PrintButton";

interface ContractPageProps {
  params: Promise<{
    locale: string;
    id: string;
    contractId: string;
  }>;
}

export default async function ContractPage({
  params,
}: ContractPageProps) {
  const { locale, id, contractId } = await params;

  const supabase = await createClient();

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id, full_name, timezone")
    .eq("id", id)
    .single();

  if (studentError || !student) {
    notFound();
  }

  const { data: contract, error: contractError } = await supabase
    .from("contracts")
    .select(`
      id,
      contract_number,
      status,
      agreement_date,
      enrollment:enrollments!contracts_enrollment_id_fkey (
        id,
        student_id,
        package_name,
        number_of_lessons,
        lesson_duration,
        lessons_per_week,
        start_date,
        schedule_days,
        schedule_time,
        tuition_amount,
        currency
      )
    `)
    .eq("id", contractId)
    .single();

  if (contractError || !contract) {
    notFound();
  }

  const enrollment = Array.isArray(contract.enrollment)
    ? contract.enrollment[0]
    : contract.enrollment;

  if (!enrollment || enrollment.student_id !== id) {
    notFound();
  }

  const studentName = student.full_name;

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

  const scheduleDays =
    rawScheduleDays.length > 0
      ? rawScheduleDays
          .flatMap((day: string) =>
            String(day)
              .replace(/Â·/g, "·")
              .split("·")
              .map((part) => part.trim())
              .filter(Boolean)
          )
          .map((day) => {
            const normalized = day.toLowerCase();
            return dayNames[normalized] || day;
          })
          .filter(
            (day, index, array) =>
              array.indexOf(day) === index
          )
          .join(" · ") || "To be confirmed"
      : "To be confirmed";

  const scheduleTime = enrollment.schedule_time
    ? formatTime(enrollment.schedule_time)
    : "To be confirmed";

  const currency = enrollment.currency || "KRW";

  const tuition = new Intl.NumberFormat("en-US").format(
    Number(enrollment.tuition_amount || 0)
  );

  return (
    <main className="min-h-screen bg-[#F5F4F1] text-[#292929] print:bg-white">
      {/* ADMIN NAV */}
      <div className="mx-auto w-full max-w-[900px] px-5 py-6 sm:px-8 print:hidden">
        <div className="flex items-center justify-between">
          <Link
            href={`/${locale}/admin/students/${student.id}`}
            className="
              inline-flex
              items-center
              gap-2
              font-sans
              text-[13px]
              text-[#666A65]
              transition-colors
              hover:text-[#292929]
            "
          >
            <ArrowLeft
              size={15}
              strokeWidth={1.5}
            />
            Student
          </Link>

          <PrintButton />
        </div>
      </div>

      {/* DOCUMENT */}
      <div className="mx-auto w-full max-w-[900px] px-0 pb-12 sm:px-5 sm:pb-16 print:p-0">
        <article
          className="
            bg-white
            shadow-[0_4px_20px_rgba(41,41,41,0.04)]
            print:shadow-none
          "
        >
          <div
            className="
              px-7
              py-9
              sm:px-12
              sm:py-11
              lg:px-16
              lg:py-12
              print:px-0
              print:py-0
            "
          >
            {/* ========================================================== */}
            {/* HEADER                                                     */}
            {/* ========================================================== */}

            <header className="border-b border-[#CFCFC9] pb-6">
              <div className="flex items-start justify-between gap-8">
                <div>
                  <div
                    className="
                      font-serif
                      text-[22px]
                      tracking-[-0.02em]
                      text-[#292929]
                    "
                  >
                    Hamkke │ 함께
                  </div>

                  <p
                    className="
                      mt-1
                      font-sans
                      text-[9px]
                      uppercase
                      tracking-[0.16em]
                      text-[#777771]
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
                      text-[#555550]
                    "
                  >
                    Private English Lessons
                  </p>

                  <p
                    className="
                      mt-1
                      font-sans
                      text-[10px]
                      text-[#777771]
                    "
                  >
                    Lesson Agreement
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <h1
                  className="
                    font-serif
                    text-[32px]
                    font-normal
                    leading-[1.1]
                    tracking-[-0.025em]
                    text-[#292929]
                    sm:text-[36px]
                  "
                >
                  Lesson Agreement
                </h1>
              </div>
            </header>

            {/* ========================================================== */}
            {/* AGREEMENT INFORMATION                                      */}
            {/* ========================================================== */}

            <section className="border-b border-[#CFCFC9] py-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <Info
                  label="Student"
                  value={studentName}
                />

                <Info
                  label="Agreement Date"
                  value={agreementDate}
                />
              </div>
            </section>

            {/* ========================================================== */}
            {/* 01                                                          */}
            {/* ========================================================== */}

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

            {/* ========================================================== */}
            {/* 02                                                          */}
            {/* ========================================================== */}

            <Section
              number="02"
              title="Enrollment Details"
            >
              <DetailGrid>
                <Info
                  label="Package"
                  value={enrollment.package_name}
                />

                <Info
                  label="Number of Lessons"
                  value={`${enrollment.number_of_lessons} lessons`}
                />

                <Info
                  label="Lesson Duration"
                  value={`${enrollment.lesson_duration} minutes`}
                />

                <Info
                  label="Lessons Per Week"
                  value={`${enrollment.lessons_per_week}`}
                />

                <Info
                  label="Start Date"
                  value={startDate}
                />

                <Info
                  label="Lesson Days"
                  value={scheduleDays}
                />

                <Info
                  label="Lesson Time"
                  value={scheduleTime}
                />

                <Info
                  label="Student Timezone"
                  value={student.timezone || "To be confirmed"}
                />

                <Info
                  label="Tuition"
                  value={`${currency} ${tuition}`}
                />
              </DetailGrid>
            </Section>

            {/* ========================================================== */}
            {/* 03                                                          */}
            {/* ========================================================== */}

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
                refunds are generally not available once the
                package has been paid for, subject to the
                exceptions described in the Refunds & Transfers
                section of this agreement.
              </p>
            </Section>

            {/* ========================================================== */}
            {/* 04                                                          */}
            {/* ========================================================== */}

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

              <div className="my-5 border-y border-[#E0DDD7]">
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

            {/* ========================================================== */}
            {/* 05                                                          */}
            {/* ========================================================== */}

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

            {/* ========================================================== */}
            {/* 06                                                          */}
            {/* ========================================================== */}

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
                8:10 PM, the lesson will run from
                8:10–8:25 PM.
              </p>

              <p>
                If the student does not join within 10 minutes
                and has not contacted Hamkke, the lesson will
                be considered a no-show and counted as
                completed.
              </p>
            </Section>

            {/* ========================================================== */}
            {/* 07                                                          */}
            {/* ========================================================== */}

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

            {/* ========================================================== */}
            {/* 08                                                          */}
            {/* ========================================================== */}

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

            {/* ========================================================== */}
            {/* 09                                                          */}
            {/* ========================================================== */}

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

            {/* ========================================================== */}
            {/* 10                                                          */}
            {/* ========================================================== */}

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

            {/* ========================================================== */}
            {/* 11                                                          */}
            {/* ========================================================== */}

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

            {/* ========================================================== */}
            {/* AGREEMENT RECORD                                            */}
            {/* ========================================================== */}

            <section className="border-t border-[#CFCFC9] pt-7">
              <div className="text-center">
                <p
                  className="
                    font-sans
                    text-[9px]
                    font-medium
                    uppercase
                    tracking-[0.15em]
                    text-[#555550]
                  "
                >
                  Digital Agreement
                </p>

                <h2
                  className="
                    mt-2
                    font-serif
                    text-[24px]
                    font-normal
                    tracking-[-0.02em]
                  "
                >
                  Payment constitutes acceptance
                </h2>

                <p
                  className="
                    mt-1.5
                    font-sans
                    text-[12px]
                    text-[#777771]
                  "
                >
                  of this Lesson Agreement.
                </p>
              </div>

              <div className="mt-7 grid gap-5 border-t border-[#DCD8D2] pt-6 sm:grid-cols-2">
                <Info
                  label="Student"
                  value={studentName}
                />

                <Info
                  label="Agreement Date"
                  value={agreementDate}
                />
              </div>
            </section>

            {/* ========================================================== */}
            {/* FOOTER                                                      */}
            {/* ========================================================== */}

            <footer className="mt-8 border-t border-[#DCD8D2] pt-6 text-center">
              <div
                className="
                  font-serif
                  text-[18px]
                  tracking-[-0.02em]
                  text-[#292929]
                "
              >
                Hamkke │ 함께
              </div>

              <p
                className="
                  mx-auto
                  mt-2
                  max-w-[600px]
                  font-sans
                  text-[10px]
                  leading-[1.6]
                  text-[#777771]
                "
              >
                These guidelines are here to help keep lessons
                predictable, respectful, and comfortable for
                both sides.
              </p>

              <p
                className="
                  mt-1
                  font-sans
                  text-[10px]
                  leading-[1.6]
                  text-[#777771]
                "
              >
                Thank you for respecting the time we've set
                aside for each conversation.
              </p>

              <p
                className="
                  mt-4
                  font-sans
                  text-[9px]
                  tracking-wide
                  text-[#99968F]
                "
              >
                Hamkke │ 함께 · Private English Lessons
              </p>
            </footer>
          </div>
        </article>
      </div>

      {/* ================================================================ */}
      {/* PRINT STYLES                                                     */}
      {/* ================================================================ */}

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm 14mm 14mm;
          }

          html,
          body {
            background: white !important;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          main {
            min-height: auto !important;
            background: white !important;
          }

          article {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }

          article > div {
            padding: 0 !important;
          }

          header,
          section,
          footer {
            break-inside: auto;
          }

          h1,
          h2,
          h3 {
            break-after: avoid;
          }

          .contract-section {
            break-inside: auto;
          }

          .keep-together {
            break-inside: avoid;
          }

          .policy-row {
            break-inside: avoid;
          }

          .detail-grid {
            break-inside: avoid;
          }

          footer {
            break-inside: avoid;
          }

          p {
            orphans: 3;
            widows: 3;
          }

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
        border-[#DCD8D2]
        py-6
        sm:py-7
      "
    >
      <div className="grid grid-cols-[30px_minmax(0,1fr)] gap-3 sm:grid-cols-[34px_minmax(0,1fr)] sm:gap-4">
        <div
          className="
            pt-[3px]
            font-sans
            text-[10px]
            font-medium
            tracking-[0.08em]
            text-[#555550]
          "
        >
          {number}
        </div>

        <div>
          <h2
            className="
              font-serif
              text-[22px]
              font-normal
              leading-[1.2]
              tracking-[-0.02em]
              text-[#292929]
              sm:text-[24px]
            "
          >
            {title}
          </h2>

          <div
            className="
              mt-4
              max-w-[720px]
              space-y-3.5
              font-sans
              text-[12.5px]
              leading-[1.65]
              text-[#555550]
              sm:text-[13px]
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
    <div className="keep-together">
      <p
        className="
          font-sans
          text-[8px]
          font-medium
          uppercase
          tracking-[0.13em]
          text-[#666A65]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1.5
          font-serif
          text-[15px]
          leading-[1.35]
          text-[#292929]
        "
      >
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DETAIL GRID                                                                */
/* -------------------------------------------------------------------------- */

function DetailGrid({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        detail-grid
        mt-5
        grid
        gap-x-10
        gap-y-5
        sm:grid-cols-2
      "
    >
      {children}
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
        py-3.5
        ${!last ? "border-b border-[#E4E1DB]" : ""}
      `}
    >
      <div className="grid gap-1.5 sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-6">
        <p
          className="
            font-sans
            text-[10px]
            font-medium
            uppercase
            tracking-[0.1em]
            text-[#555550]
          "
        >
          {title}
        </p>

        <p
          className="
            font-sans
            text-[12px]
            leading-[1.6]
            text-[#777771]
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