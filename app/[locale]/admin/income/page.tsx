import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PrintMonthlyIncomeButton from "./PrintMonthlyIncomeButton";

interface IncomePageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
}

interface PaymentRow {
  id: string;
  enrollment_id: string;
  amount: number | null;
  currency: string | null;
  payment_date: string | null;
  payment_method: string | null;
  status: string | null;
  reference: string | null;
  notes: string | null;
  amount_received_php: number | null;
  amount_krw: number | null;
  amount_php: number | null;
}

interface EnrollmentRow {
  id: string;
  student_id: string | null;
  package_name: string | null;
}

interface EnrollmentStudentRow {
  enrollment_id: string;
  student_id: string;
}

interface StudentRow {
  id: string;
  full_name: string;
  preferred_name: string | null;
}

function formatMoney(amount: number) {
  return `₱${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function getPhpAmount(payment: PaymentRow) {
  const value = Number(payment.amount_php ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function formatDate(date: string | null) {
  if (!date) return "—";

  return String(
    new Date(`${date}T00:00:00`).getDate()
  );
}

function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

function monthHref(
  locale: string,
  year: number,
  month: number,
  offset: number
) {
  const date = new Date(year, month - 1 + offset, 1);
  return `/${locale}/admin/income?year=${date.getFullYear()}&month=${
    date.getMonth() + 1
  }`;
}

function normalizeMonth(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 12
    ? parsed
    : fallback;
}

function normalizeYear(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 2000 && parsed <= 2100
    ? parsed
    : fallback;
}

export default async function IncomePage({
  params,
  searchParams,
}: IncomePageProps) {
  const { locale } = await params;
  const query = await searchParams;

  const now = new Date();
  const selectedYear = normalizeYear(query.year, now.getFullYear());
  const selectedMonth = normalizeMonth(query.month, now.getMonth() + 1);

  const startDate = `${selectedYear}-${String(selectedMonth).padStart(
    2,
    "0"
  )}-01`;

  const nextMonthDate = new Date(selectedYear, selectedMonth, 1);
  const endDate = `${nextMonthDate.getFullYear()}-${String(
    nextMonthDate.getMonth() + 1
  ).padStart(2, "0")}-01`;

  const supabase = await createClient();

  const { data: payments, error: paymentsError } = await supabase
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
      amount_received_php,
      amount_krw,
      amount_php
    `)
    .eq("status", "paid")
    .gte("payment_date", startDate)
    .lt("payment_date", endDate)
    .order("payment_date", { ascending: true });

  if (paymentsError) {
    console.error("Error loading monthly income payments:", paymentsError);
    throw new Error("Unable to load monthly income records.");
  }

  const paymentRows = (payments ?? []) as PaymentRow[];
  const enrollmentIds = Array.from(
    new Set(paymentRows.map((payment) => payment.enrollment_id).filter(Boolean))
  );

  let enrollmentRows: EnrollmentRow[] = [];
  let participantRows: EnrollmentStudentRow[] = [];

  if (enrollmentIds.length > 0) {
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select(`
        id,
        student_id,
        package_name
      `)
      .in("id", enrollmentIds);

    if (enrollmentsError) {
      console.error("Error loading income enrollments:", enrollmentsError);
      throw new Error("Unable to load income enrollment details.");
    }

    enrollmentRows = (enrollments ?? []) as EnrollmentRow[];

    const { data: participants, error: participantsError } = await supabase
      .from("enrollment_students")
      .select(`
        enrollment_id,
        student_id
      `)
      .in("enrollment_id", enrollmentIds);

    if (participantsError) {
      console.error("Error loading income participants:", participantsError);
      throw new Error("Unable to load income participant details.");
    }

    participantRows = (participants ?? []) as EnrollmentStudentRow[];
  }

  const studentIds = Array.from(
    new Set([
      ...enrollmentRows
        .map((enrollment) => enrollment.student_id)
        .filter((value): value is string => Boolean(value)),
      ...participantRows.map((participant) => participant.student_id),
    ])
  );

  let studentRows: StudentRow[] = [];

  if (studentIds.length > 0) {
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select(`
        id,
        full_name,
        preferred_name
      `)
      .in("id", studentIds);

    if (studentsError) {
      console.error("Error loading income students:", studentsError);
      throw new Error("Unable to load income student details.");
    }

    studentRows = (students ?? []) as StudentRow[];
  }

  const enrollmentById = new Map(
    enrollmentRows.map((enrollment) => [enrollment.id, enrollment])
  );

  const studentById = new Map(
    studentRows.map((student) => [student.id, student])
  );

  function getStudentNames(enrollmentId: string) {
    const enrollment = enrollmentById.get(enrollmentId);

    const participantIds = participantRows
      .filter((participant) => participant.enrollment_id === enrollmentId)
      .map((participant) => participant.student_id);

    const ids =
      participantIds.length > 0
        ? participantIds
        : enrollment?.student_id
          ? [enrollment.student_id]
          : [];

    const names = Array.from(new Set(ids))
      .map((studentId) => studentById.get(studentId))
      .filter((student): student is StudentRow => Boolean(student))
      .map((student) => student.preferred_name || student.full_name);

    return names.length > 0 ? names.join(" · ") : "—";
  }

  const monthlyTotal = paymentRows.reduce(
    (total, payment) => total + getPhpAmount(payment),
    0
  );

  const selectedLabel = monthLabel(selectedYear, selectedMonth);
  const currentMonthHref = `/${locale}/admin/income?year=${now.getFullYear()}&month=${
    now.getMonth() + 1
  }`;

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
      <header
        className="
          print:hidden
          w-full
          px-6
          pt-7
          sm:px-8
          sm:pt-8
          lg:px-10
          xl:px-12
        "
      >
        <div className="flex w-full items-start justify-between gap-8">
          <Link
            href={`/${locale}/admin/overview`}
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
            &larr; Overview
          </Link>

          <div className="shrink-0 text-right">
            <p className="font-sans text-[16px] font-semibold leading-none tracking-[0.18em] text-[#6F8F72]">
              HAMKKE │ 함께
            </p>
            <p className="mt-2 font-serif text-[13px] font-normal leading-none tracking-[0.02em] text-[#6F8F72]">
              From Small Talk to Big Ideas
            </p>
          </div>
        </div>
      </header>

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
          print:max-w-none
          print:px-0
          print:pb-8
          print:pt-0
        "
      >
        <div className="print:hidden">
          <p className="mb-4 font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-[#8A8A84]">
            Income Records
          </p>

          <h1 className="font-serif text-[48px] font-normal leading-[1] tracking-[-0.035em] sm:text-[58px] lg:text-[66px]">
            Monthly Income
          </h1>

          <p className="mt-5 max-w-[620px] font-serif text-[18px] leading-8 text-[#74716B] sm:text-[20px] sm:leading-9">
            Review and print payments received for any month.
          </p>
        </div>

        <div className="hidden print:block">
          <div className="flex items-start justify-between gap-8 border-b border-[#DCD8D2] pb-8">
            <div>
              <p className="font-sans text-[13px] font-semibold leading-none tracking-[0.18em] text-[#6F8F72]">
                HAMKKE │ 함께
              </p>
              <p className="mt-2 font-serif text-[11px] leading-none tracking-[0.02em] text-[#6F8F72]">
                From Small Talk to Big Ideas
              </p>
            </div>

            <div className="text-right">
              <p className="font-sans text-[9px] font-medium uppercase tracking-[0.16em] text-[#8A8A84]">
                Income Statement
              </p>
              <p className="mt-2 font-serif text-[17px] text-[#55544F]">
                {selectedLabel}
              </p>
            </div>
          </div>

          <div className="pt-9">
            <h1 className="font-serif text-[34px] font-normal tracking-[-0.025em]">
              Monthly Income
            </h1>
            <p className="mt-2 font-serif text-[14px] text-[#74716B]">
              Payments received during {selectedLabel}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 pb-24 sm:px-8 lg:px-10 print:max-w-none print:px-0 print:pb-0">
        <div className="print:hidden mb-8">
          <div className="grid grid-cols-2 items-end gap-6 pb-1">
            <Link
              href={monthHref(locale, selectedYear, selectedMonth, -1)}
              className="justify-self-start font-sans text-[13px] text-[#6F8F72] transition-colors hover:text-[#526B55]"
            >
              ← Previous
            </Link>

            <Link
              href={monthHref(locale, selectedYear, selectedMonth, 1)}
              className="justify-self-end font-sans text-[13px] text-[#6F8F72] transition-colors hover:text-[#526B55]"
            >
              Next →
            </Link>
          </div>

          <div className="border-y border-[#DCD8D2] py-5">
            <div className="flex items-center justify-between gap-6">
              <div className="text-left">
                <p className="font-serif text-[24px] tracking-[-0.02em]">
                  {selectedLabel}
                </p>
                <p className="mt-1 font-sans text-[10px] uppercase tracking-[0.12em] text-[#99958E]">
                  {paymentRows.length}{" "}
                  {paymentRows.length === 1 ? "payment" : "payments"}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-5">
                <Link
                  href={currentMonthHref}
                  className="font-sans text-[12px] text-[#777771] transition-colors hover:text-[#6F8F72]"
                >
                  Current month
                </Link>

                <PrintMonthlyIncomeButton />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-7 flex items-end justify-between gap-6 print:hidden">
          <div>
            <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-[#8A8A84]">
              {selectedLabel}
            </p>
            <h2 className="mt-2 font-serif text-[29px] font-normal tracking-[-0.025em]">
              Income Records
            </h2>
          </div>

          <div className="text-right">
            <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#8A8A84]">
              Monthly total
            </p>
            <p className="mt-2 font-serif text-[30px] leading-none tracking-[-0.025em]">
              {formatMoney(monthlyTotal)}
            </p>
          </div>
        </div>

        {paymentRows.length > 0 ? (
          <div className="overflow-x-auto border-y border-[#DCD8D2]">
            <table className="w-full min-w-[850px] table-fixed border-collapse print:min-w-0">
              <colgroup>
                <col className="w-[10%]" />
                <col className="w-[22%]" />
                <col className="w-[34%]" />
                <col className="w-[19%]" />
                <col className="w-[15%]" />
              </colgroup>

              <thead>
                <tr className="border-b border-[#DCD8D2]">
                  {["Date", "Student", "Package", "Method", "Amount"].map(
                    (heading, index) => (
                      <th
                        key={heading}
                        className={`
                          px-4
                          py-4
                          font-sans
                          text-[10px]
                          font-medium
                          uppercase
                          tracking-[0.14em]
                          text-[#8A8A84]
                          ${index === 4 ? "text-right" : "text-left"}
                        `}
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {paymentRows.map((payment) => {
                  const enrollment = enrollmentById.get(payment.enrollment_id);

                  return (
                    <tr
                      key={payment.id}
                      className="border-b border-[#E7E3DD] last:border-b-0"
                    >
                      <td className="px-4 py-[18px] font-serif text-[14px] text-[#55544F]">
                        {formatDate(payment.payment_date)}
                      </td>

                      <td className="px-4 py-[18px]">
                        <p className="font-serif text-[16px] leading-6">
                          {getStudentNames(payment.enrollment_id)}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-[18px] font-serif text-[14px] leading-6 text-[#55544F]">
                        {enrollment?.package_name ?? "—"}
                      </td>

                      <td className="px-4 py-[18px]">
                        <p className="font-serif text-[14px] text-[#55544F]">
                          {payment.payment_method || "—"}
                        </p>

                        {payment.reference && (
                          <p className="mt-1 font-sans text-[9px] uppercase tracking-[0.08em] text-[#99958E]">
                            {payment.reference}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-[18px] text-right font-serif text-[16px]">
                        {formatMoney(getPhpAmount(payment))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border-y border-[#DCD8D2] py-20 text-center">
            <h3 className="font-serif text-[27px] font-normal">
              No income records
            </h3>
            <p className="mx-auto mt-3 max-w-[420px] font-serif text-[16px] leading-7 text-[#74716B]">
              No paid payments were recorded for {selectedLabel}.
            </p>
          </div>
        )}

        {paymentRows.length > 0 && (
          <div className="mt-7 flex justify-end border-t border-[#DCD8D2] pt-6 print:mt-8 print:pt-7">
            <div className="min-w-[240px] text-right">
              <p className="font-sans text-[10px] uppercase tracking-[0.14em] text-[#8A8A84]">
                Total received
              </p>
              <p className="mt-2 font-serif text-[32px] leading-none tracking-[-0.025em]">
                {formatMoney(monthlyTotal)}
              </p>
              <p className="mt-2 hidden font-serif text-[11px] text-[#8A8A84] print:block">
                {selectedLabel}
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
