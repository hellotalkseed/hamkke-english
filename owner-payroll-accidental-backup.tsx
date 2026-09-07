"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

/* ========================================================================= */
/* TYPES                                                                     */
/* ========================================================================= */

type Teacher = {
  id: string;
  full_name: string | null;
  role: string;
  status: string;
  teacher_number?: string | null;
};

type PayrollStatus = "pending" | "approved" | "paid";

type PayrollRecord = {
  id: string;
  period_start: string;
  period_end: string;

  completed_25_count: number;
  completed_50_count: number;

  no_show_25_count: number;
  no_show_50_count: number;

  late_cancellation_25_count: number;
  late_cancellation_50_count: number;

  rate_25: number;
  rate_50: number;

  gross_pay: number;

  payment_method: string | null;
  payment_reference: string | null;
  payment_date: string | null;

  status: PayrollStatus;
};

type CurrentPayroll = {
  period_start: string;
  period_end: string;

  teaching_minutes_before: number;

  compensation_rate: {
    id: string;
    level: number;
    min_teaching_minutes: number;
    rate_25: number;
    rate_50: number;
  };

  completed_25_count: number;
  completed_50_count: number;

  no_show_25_count: number;
  no_show_50_count: number;

  late_cancellation_25_count: number;
  late_cancellation_50_count: number;

  payable_25_count: number;
  payable_50_count: number;

  gross_pay: number;

  status: PayrollStatus;

  payroll_record: PayrollRecord | null;
};

type PayrollApiResponse = {
  teacher: Teacher;

  period: {
    start: string;
    end: string;
  };

  current: CurrentPayroll;

  history: PayrollRecord[];
};

/* ========================================================================= */
/* ICONS                                                                     */
/* ========================================================================= */

function ArrowLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[15px] w-[15px]"
      aria-hidden="true"
    >
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v10a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V6" />
      <path d="M16 14h.01" />
    </svg>
  );
}

function PrinterIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[16px] w-[16px]"
      aria-hidden="true"
    >
      <path d="M6 9V3h12v6" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 14h12v7H6z" />
      <path d="M18 12h.01" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[15px] w-[15px]"
      aria-hidden="true"
    >
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[16px] w-[16px]"
      aria-hidden="true"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

/* ========================================================================= */
/* HELPERS                                                                   */
/* ========================================================================= */

function formatShortDate(value: string) {
  if (!value) {
    return "—";
  }

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  const date = match
    ? new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3])
      )
    : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-PH",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
}

function formatMonthYear(
  date: Date
) {
  return new Intl.DateTimeFormat(
    "en-PH",
    {
      month: "long",
      year: "numeric",
    }
  ).format(date);
}

function formatCurrency(
  amount: number
) {
  return `₱${Number(
    amount || 0
  ).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getStatusClasses(
  status: PayrollStatus
) {
  if (status === "paid") {
    return "bg-[#E5EBDD] text-[#607963]";
  }

  if (status === "approved") {
    return "bg-[#E8EFE5] text-[#6F8F72]";
  }

  return "bg-[#EEECE7] text-[#817D75]";
}

function formatStatus(
  status: PayrollStatus
) {
  return (
    status.charAt(0).toUpperCase() +
    status.slice(1)
  );
}

function escapeHtml(
  value: string
) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getTotalLessonCount(
  record: PayrollRecord
) {
  return (
    record.completed_25_count +
    record.completed_50_count +
    record.no_show_25_count +
    record.no_show_50_count +
    record.late_cancellation_25_count +
    record.late_cancellation_50_count
  );
}

function getPayable25Count(
  record: PayrollRecord
) {
  return (
    record.completed_25_count +
    record.no_show_25_count +
    record.late_cancellation_25_count
  );
}

function getPayable50Count(
  record: PayrollRecord
) {
  return (
    record.completed_50_count +
    record.no_show_50_count +
    record.late_cancellation_50_count
  );
}

function getAmount(
  count: number,
  rate: number
) {
  return count * rate;
}

/* ========================================================================= */
/* PAGE                                                                      */
/* ========================================================================= */

export default function TeacherPayrollPage() {
  const params = useParams();

  const locale = String(
    params.locale
  );

  const [
    teacher,
    setTeacher,
  ] =
    useState<Teacher | null>(
      null
    );

  const [
    currentPayroll,
    setCurrentPayroll,
  ] =
    useState<CurrentPayroll | null>(
      null
    );

  const [
    payrollHistory,
    setPayrollHistory,
  ] =
    useState<PayrollRecord[]>(
      []
    );

  const [
    selectedPayroll,
    setSelectedPayroll,
  ] =
    useState<PayrollRecord | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  /* ----------------------------------------------------------------------- */
  /* LOAD OWN PAYROLL                                                        */
  /* ----------------------------------------------------------------------- */

  useEffect(() => {
    async function loadPayroll() {
      try {
        setLoading(true);
        setError("");

        /*
         * IMPORTANT:
         *
         * There is intentionally no teacher ID
         * in this request.
         *
         * The API determines the teacher from
         * the authenticated Supabase user.
         */
        const response =
          await fetch(
            "/api/admin/teachers/payroll",
            {
              method: "GET",
              cache: "no-store",
            }
          );

        const data:
          | PayrollApiResponse
          | {
              error?: string;
            } =
          await response.json();

        if (!response.ok) {
          throw new Error(
            "error" in data &&
              data.error
              ? data.error
              : "Unable to load your payroll."
          );
        }

        const payrollData =
          data as PayrollApiResponse;

        setTeacher(
          payrollData.teacher
        );

        setCurrentPayroll(
          payrollData.current
        );

        setPayrollHistory(
          payrollData.history ||
            []
        );
      } catch (err) {
        console.error(
          "Error loading payroll:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "We couldn't load your payroll right now."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPayroll();
  }, []);

  /* ----------------------------------------------------------------------- */
  /* CURRENT PERIOD DISPLAY                                                  */
  /* ----------------------------------------------------------------------- */

  const payrollPeriod =
    useMemo(() => {
      if (!currentPayroll) {
        return {
          label: "—",
          start: "",
          end: "",
        };
      }

      const startDate =
        new Date(
          `${currentPayroll.period_start}T00:00:00`
        );

      const startDay =
        Number(
          currentPayroll.period_start.slice(
            -2
          )
        );

      const endDay =
        Number(
          currentPayroll.period_end.slice(
            -2
          )
        );

      return {
        label:
          `${formatMonthYear(
            startDate
          )} · ${startDay}–${endDay}`,

        start:
          currentPayroll.period_start,

        end:
          currentPayroll.period_end,
      };
    }, [currentPayroll]);

  /* ----------------------------------------------------------------------- */
  /* CURRENT RECORD                                                          */
  /* ----------------------------------------------------------------------- */

  function makeCurrentRecord(): PayrollRecord | null {
    if (!currentPayroll) {
      return null;
    }

    return {
      id:
        currentPayroll
          .payroll_record?.id ||
        "current-period",

      period_start:
        currentPayroll.period_start,

      period_end:
        currentPayroll.period_end,

      completed_25_count:
        currentPayroll.completed_25_count,

      completed_50_count:
        currentPayroll.completed_50_count,

      no_show_25_count:
        currentPayroll.no_show_25_count,

      no_show_50_count:
        currentPayroll.no_show_50_count,

      late_cancellation_25_count:
        currentPayroll
          .late_cancellation_25_count,

      late_cancellation_50_count:
        currentPayroll
          .late_cancellation_50_count,

      rate_25:
        currentPayroll
          .compensation_rate
          .rate_25,

      rate_50:
        currentPayroll
          .compensation_rate
          .rate_50,

      gross_pay:
        currentPayroll.gross_pay,

      payment_method:
        currentPayroll
          .payroll_record
          ?.payment_method ||
        null,

      payment_reference:
        currentPayroll
          .payroll_record
          ?.payment_reference ||
        null,

      payment_date:
        currentPayroll
          .payroll_record
          ?.payment_date ||
        null,

      status:
        currentPayroll.status,
    };
  }

  /* ----------------------------------------------------------------------- */
  /* PRINT RECEIPT                                                           */
  /* ----------------------------------------------------------------------- */

  function printPayroll(
    record: PayrollRecord
  ) {
    if (!teacher) {
      return;
    }

    const teacherName =
      escapeHtml(
        teacher.full_name ||
          "Unnamed teacher"
      );

    const teacherNumber =
      escapeHtml(
        teacher.teacher_number ||
          "—"
      );

    const periodStart =
      formatShortDate(
        record.period_start
      );

    const periodEnd =
      formatShortDate(
        record.period_end
      );

    const paymentDate =
      record.payment_date
        ? formatShortDate(
            record.payment_date
          )
        : "—";

    const paymentMethod =
      escapeHtml(
        record.payment_method ||
          "—"
      );

    const referenceNumber =
      escapeHtml(
        record.payment_reference ||
          "—"
      );

    const total25 =
      getPayable25Count(
        record
      );

    const total50 =
      getPayable50Count(
        record
      );

    const completedAmount =
      getAmount(
        record.completed_25_count,
        record.rate_25
      ) +
      getAmount(
        record.completed_50_count,
        record.rate_50
      );

    const noShowAmount =
      getAmount(
        record.no_show_25_count,
        record.rate_25
      ) +
      getAmount(
        record.no_show_50_count,
        record.rate_50
      );

    const lateAmount =
      getAmount(
        record
          .late_cancellation_25_count,
        record.rate_25
      ) +
      getAmount(
        record
          .late_cancellation_50_count,
        record.rate_50
      );

    const printWindow =
      window.open(
        "",
        "_blank",
        "width=900,height=1000"
      );

    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />

          <title>
            Hamkke Payment Receipt - ${teacherName}
          </title>

          <style>
            @page {
              size: A4;
              margin: 18mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              color: #292929;
              background: #ffffff;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 11px;
            }

            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              padding-bottom: 20px;
              border-bottom: 1px solid #dcd8d2;
            }

            .eyebrow,
            .label {
              color: #8a8a84;
              font-size: 8px;
              font-weight: 600;
              letter-spacing: 0.13em;
              text-transform: uppercase;
            }

            h1 {
              margin: 7px 0 0;
              font-family: Georgia, "Times New Roman", serif;
              font-size: 27px;
              font-weight: 400;
            }

            .brand {
              text-align: right;
            }

            .brand-name {
              color: #6f8f72;
              font-size: 14px;
              font-weight: 700;
              letter-spacing: 0.14em;
            }

            .brand-tagline {
              margin-top: 6px;
              color: #6f8f72;
              font-family: Georgia, "Times New Roman", serif;
              font-size: 10px;
            }

            .teacher {
              margin-top: 22px;
            }

            .teacher-name {
              font-family: Georgia, "Times New Roman", serif;
              font-size: 17px;
            }

            .teacher-number {
              margin-top: 4px;
              color: #8a8780;
              font-size: 9px;
            }

            .details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              margin-top: 22px;
              border-top: 1px solid #dcd8d2;
              border-bottom: 1px solid #dcd8d2;
            }

            .detail {
              padding: 12px 0;
            }

            .detail:nth-child(odd) {
              padding-right: 20px;
              border-right: 1px solid #e7e3dd;
            }

            .detail:nth-child(even) {
              padding-left: 20px;
            }

            .detail:nth-child(n + 3) {
              border-top: 1px solid #e7e3dd;
            }

            .value {
              margin-top: 5px;
              font-family: Georgia, "Times New Roman", serif;
              font-size: 13px;
            }

            .section {
              margin-top: 27px;
            }

            .section-title {
              margin-bottom: 10px;
              font-family: Georgia, "Times New Roman", serif;
              font-size: 17px;
              font-weight: 400;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th {
              padding: 8px 7px;
              border-top: 1px solid #dcd8d2;
              border-bottom: 1px solid #dcd8d2;
              color: #8a8a84;
              font-size: 8px;
              font-weight: 600;
              letter-spacing: 0.08em;
              text-align: left;
              text-transform: uppercase;
            }

            td {
              padding: 9px 7px;
              border-bottom: 1px solid #e7e3dd;
              font-size: 10px;
            }

            .center {
              text-align: center;
            }

            .right {
              text-align: right;
            }

            .total-row td {
              padding-top: 13px;
              border-top: 1px solid #292929;
              border-bottom: none;
              font-family: Georgia, "Times New Roman", serif;
              font-size: 15px;
            }

            .payment-box {
              margin-top: 25px;
              padding: 14px 16px;
              border: 1px solid #dcd8d2;
            }

            .payment-grid {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 15px;
            }

            .status {
              display: inline-block;
              margin-top: 5px;
              padding: 5px 9px;
              background: #e5ebdd;
              color: #607963;
              font-size: 8px;
              font-weight: 600;
              letter-spacing: 0.1em;
              text-transform: uppercase;
            }

            .footer {
              margin-top: 55px;
              padding-top: 12px;
              border-top: 1px solid #dcd8d2;
              color: #8a8780;
              font-size: 8.5px;
              line-height: 1.6;
            }
          </style>
        </head>

        <body>
          <div class="header">
            <div>
              <div class="eyebrow">
                Teacher payment
              </div>

              <h1>
                Payment Receipt
              </h1>
            </div>

            <div class="brand">
              <div class="brand-name">
                HAMKKE │ 함께
              </div>

              <div class="brand-tagline">
                From Small Talk to Big Ideas
              </div>
            </div>
          </div>

          <div class="teacher">
            <div class="teacher-name">
              ${teacherName}
            </div>

            <div class="teacher-number">
              ${teacherNumber}
            </div>
          </div>

          <div class="details">
            <div class="detail">
              <div class="label">
                Payroll period
              </div>

              <div class="value">
                ${periodStart} – ${periodEnd}
              </div>
            </div>

            <div class="detail">
              <div class="label">
                Payment date
              </div>

              <div class="value">
                ${paymentDate}
              </div>
            </div>

            <div class="detail">
              <div class="label">
                25-minute rate
              </div>

              <div class="value">
                ${formatCurrency(
                  record.rate_25
                )}
              </div>
            </div>

            <div class="detail">
              <div class="label">
                50-minute rate
              </div>

              <div class="value">
                ${formatCurrency(
                  record.rate_50
                )}
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">
              Lesson Payments
            </div>

            <table>
              <thead>
                <tr>
                  <th>Lesson Type</th>
                  <th class="center">25 min</th>
                  <th class="center">50 min</th>
                  <th class="right">Amount</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Completed</td>
                  <td class="center">
                    ${record.completed_25_count}
                  </td>
                  <td class="center">
                    ${record.completed_50_count}
                  </td>
                  <td class="right">
                    ${formatCurrency(
                      completedAmount
                    )}
                  </td>
                </tr>

                <tr>
                  <td>No-Show</td>
                  <td class="center">
                    ${record.no_show_25_count}
                  </td>
                  <td class="center">
                    ${record.no_show_50_count}
                  </td>
                  <td class="right">
                    ${formatCurrency(
                      noShowAmount
                    )}
                  </td>
                </tr>

                <tr>
                  <td>
                    Student Late Cancellation — Paid
                  </td>
                  <td class="center">
                    ${record.late_cancellation_25_count}
                  </td>
                  <td class="center">
                    ${record.late_cancellation_50_count}
                  </td>
                  <td class="right">
                    ${formatCurrency(
                      lateAmount
                    )}
                  </td>
                </tr>

                <tr class="total-row">
                  <td>
                    <strong>Total Payment</strong>
                  </td>

                  <td class="center">
                    <strong>${total25}</strong>
                  </td>

                  <td class="center">
                    <strong>${total50}</strong>
                  </td>

                  <td class="right">
                    <strong>
                      ${formatCurrency(
                        record.gross_pay
                      )}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="payment-box">
            <div class="payment-grid">
              <div>
                <div class="label">
                  Payment Method
                </div>

                <div class="value">
                  ${paymentMethod}
                </div>
              </div>

              <div>
                <div class="label">
                  Reference No.
                </div>

                <div class="value">
                  ${referenceNumber}
                </div>
              </div>

              <div>
                <div class="label">
                  Payment Status
                </div>

                <span class="status">
                  ${escapeHtml(
                    formatStatus(
                      record.status
                    )
                  )}
                </span>
              </div>
            </div>
          </div>

          <div class="footer">
            <strong>Hamkke English</strong><br />
            This receipt reflects the teaching services
            covered by the payroll period shown above.
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 250);
  }

  function printCurrentPayroll() {
    const record =
      makeCurrentRecord();

    if (record) {
      printPayroll(record);
    }
  }

  /* ========================================================================= */
  /* LOADING                                                                  */
  /* ========================================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
        <PageHeader
          locale={locale}
        />

        <section className="mx-auto max-w-[1200px] px-6 pb-24 pt-20 sm:px-8 lg:px-10">
          <div className="border-y border-[#DCD8D2] py-20 text-center">
            <p className="font-serif text-[17px] text-[#74716B]">
              Loading payroll...
            </p>
          </div>
        </section>
      </main>
    );
  }

  /* ========================================================================= */
  /* ERROR                                                                    */
  /* ========================================================================= */

  if (
    error ||
    !teacher ||
    !currentPayroll
  ) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
        <PageHeader
          locale={locale}
        />

        <section className="mx-auto max-w-[1200px] px-6 pb-24 pt-20 sm:px-8 lg:px-10">
          <div className="border-y border-[#DCD8D2] py-20 text-center">
            <h1 className="font-serif text-[30px] font-normal">
              Unable to load payroll
            </h1>

            <p className="mx-auto mt-3 max-w-[520px] font-serif text-[16px] leading-7 text-[#74716B]">
              {error ||
                "Your payroll information could not be loaded."}
            </p>

            <Link
              href={`/${locale}/admin/teachers`}
              className="mt-6 inline-block font-sans text-[13px] text-[#6F8F72] underline underline-offset-4"
            >
              Back to Teacher Dashboard
            </Link>
          </div>
        </section>
      </main>
    );
  }

  /* ========================================================================= */
  /* DISPLAY                                                                  */
  /* ========================================================================= */

  const statusLabel =
    teacher.status === "active"
      ? "Active"
      : teacher.status
        ? teacher.status
            .charAt(0)
            .toUpperCase() +
          teacher.status.slice(1)
        : "Unknown";

  const paymentDateText =
    currentPayroll
      .payroll_record
      ?.payment_date
      ? formatShortDate(
          currentPayroll
            .payroll_record
            .payment_date
        )
      : currentPayroll
            .payroll_record
        ? currentPayroll.status ===
          "paid"
          ? "Payment recorded"
          : "Payment date will be recorded when paid"
        : "Live estimate · finalizes after the period ends";

  /* ========================================================================= */
  /* MAIN                                                                     */
  /* ========================================================================= */

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
      <PageHeader
        locale={locale}
      />

      {/* =================================================================== */}
      {/* INTRO                                                               */}
      {/* =================================================================== */}

      <section className="mx-auto max-w-[1200px] px-6 pb-10 pt-12 sm:px-8 sm:pb-12 sm:pt-16 lg:px-10 lg:pt-20">
        <div className="max-w-[760px]">
          <p className="mb-4 font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-[#8A8A84]">
            Teacher
          </p>

          <h1 className="font-serif text-[45px] font-normal leading-[1] tracking-[-0.035em] sm:text-[56px] lg:text-[64px]">
            Payroll
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
            <p className="font-serif text-[17px] text-[#55544F]">
              {teacher.full_name ||
                "Unnamed teacher"}
            </p>

            <span className="h-[3px] w-[3px] rounded-full bg-[#B6B2AA]" />

            <p className="font-sans text-[12px] uppercase tracking-[0.12em] text-[#8A8A84]">
              {teacher.teacher_number ||
                "—"}
            </p>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E5EBDD] px-2.5 py-1.5 font-sans text-[8px] font-medium uppercase tracking-[0.1em] text-[#607963]">
              <span className="h-[5px] w-[5px] rounded-full bg-[#6F8F72]" />
              {statusLabel}
            </span>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* CURRENT PAYROLL                                                     */}
      {/* =================================================================== */}

      <section className="mx-auto max-w-[1200px] px-6 pb-16 sm:px-8 lg:px-10">
        <div className="border-y border-[#DCD8D2] bg-[#FCFBF8]">
          {/* RECEIPT HEADER */}

          <div className="flex flex-col gap-6 border-b border-[#DCD8D2] px-6 py-7 sm:flex-row sm:items-start sm:justify-between sm:px-8">
            <div>
              <p className="font-sans text-[9px] font-medium uppercase tracking-[0.16em] text-[#8A8A84]">
                Teacher payment
              </p>

              <h2 className="mt-2 font-serif text-[29px] font-normal tracking-[-0.025em]">
                Payment receipt
              </h2>

              <p className="mt-2 font-serif text-[14px] leading-6 text-[#74716B]">
                {payrollPeriod.label}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-[#8A8A84]">
                Payment status
              </p>

              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1.5 font-sans text-[8px] font-medium uppercase tracking-[0.1em] ${getStatusClasses(
                  currentPayroll.status
                )}`}
              >
                {formatStatus(
                  currentPayroll.status
                )}
              </span>
            </div>
          </div>

          {/* TEACHER + PERIOD */}

          <div className="grid border-b border-[#DCD8D2] sm:grid-cols-2">
            <div className="border-b border-[#E7E3DD] px-6 py-6 sm:border-b-0 sm:border-r sm:px-8">
              <p className="font-sans text-[9px] font-medium uppercase tracking-[0.13em] text-[#8A8A84]">
                Teacher
              </p>

              <p className="mt-2 font-serif text-[18px]">
                {teacher.full_name ||
                  "Unnamed teacher"}
              </p>

              <p className="mt-1 font-sans text-[10px] text-[#8A8780]">
                {teacher.teacher_number ||
                  "—"}
              </p>
            </div>

            <div className="px-6 py-6 sm:px-8">
              <p className="font-sans text-[9px] font-medium uppercase tracking-[0.13em] text-[#8A8A84]">
                Payroll period
              </p>

              <p className="mt-2 font-serif text-[18px]">
                {payrollPeriod.label}
              </p>

              <p className="mt-1 font-sans text-[10px] text-[#8A8780]">
                {paymentDateText}
              </p>
            </div>
          </div>

          {/* LESSON PAYMENTS */}

          <div className="px-6 py-7 sm:px-8 sm:py-8">
            <p className="mb-4 font-sans text-[9px] font-medium uppercase tracking-[0.15em] text-[#8A8A84]">
              Lesson payments
            </p>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse">
                <thead>
                  <tr className="border-y border-[#DCD8D2]">
                    <th className="px-3 py-3 text-left font-sans text-[8px] font-medium uppercase tracking-[0.12em] text-[#8A8A84]">
                      Lesson type
                    </th>

                    <th className="px-3 py-3 text-right font-sans text-[8px] font-medium uppercase tracking-[0.12em] text-[#8A8A84]">
                      25 min
                    </th>

                    <th className="px-3 py-3 text-right font-sans text-[8px] font-medium uppercase tracking-[0.12em] text-[#8A8A84]">
                      Rate
                    </th>

                    <th className="px-3 py-3 text-right font-sans text-[8px] font-medium uppercase tracking-[0.12em] text-[#8A8A84]">
                      50 min
                    </th>

                    <th className="px-3 py-3 text-right font-sans text-[8px] font-medium uppercase tracking-[0.12em] text-[#8A8A84]">
                      Rate
                    </th>

                    <th className="px-3 py-3 text-right font-sans text-[8px] font-medium uppercase tracking-[0.12em] text-[#8A8A84]">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <PayrollRow
                    label="Completed"
                    count25={
                      currentPayroll.completed_25_count
                    }
                    count50={
                      currentPayroll.completed_50_count
                    }
                    rate25={
                      currentPayroll
                        .compensation_rate
                        .rate_25
                    }
                    rate50={
                      currentPayroll
                        .compensation_rate
                        .rate_50
                    }
                  />

                  <PayrollRow
                    label="No-Show"
                    count25={
                      currentPayroll.no_show_25_count
                    }
                    count50={
                      currentPayroll.no_show_50_count
                    }
                    rate25={
                      currentPayroll
                        .compensation_rate
                        .rate_25
                    }
                    rate50={
                      currentPayroll
                        .compensation_rate
                        .rate_50
                    }
                  />

                  <PayrollRow
                    label="Student Late Cancellation — Paid"
                    count25={
                      currentPayroll
                        .late_cancellation_25_count
                    }
                    count50={
                      currentPayroll
                        .late_cancellation_50_count
                    }
                    rate25={
                      currentPayroll
                        .compensation_rate
                        .rate_25
                    }
                    rate50={
                      currentPayroll
                        .compensation_rate
                        .rate_50
                    }
                  />

                  <tr>
                    <td className="px-3 pt-5 font-serif text-[16px]">
                      <strong>
                        Total Payment
                      </strong>
                    </td>

                    <td
                      colSpan={4}
                      className="px-3 pt-5 text-right font-sans text-[9px] uppercase tracking-[0.1em] text-[#8A8A84]"
                    >
                      {
                        currentPayroll.payable_25_count
                      }{" "}
                      × 25 min ·{" "}
                      {
                        currentPayroll.payable_50_count
                      }{" "}
                      × 50 min
                    </td>

                    <td className="px-3 pt-5 text-right font-serif text-[19px]">
                      {formatCurrency(
                        currentPayroll.gross_pay
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* PAYMENT DETAILS */}

          <div className="border-t border-[#DCD8D2] px-6 py-7 sm:px-8">
            <div className="grid sm:grid-cols-3 sm:divide-x sm:divide-[#E7E3DD]">
              <div className="pb-5 sm:pb-0 sm:pr-6">
                <p className="font-sans text-[9px] font-medium uppercase tracking-[0.13em] text-[#8A8A84]">
                  Payment method
                </p>

                <p className="mt-2 font-serif text-[15px]">
                  {currentPayroll
                    .payroll_record
                    ?.payment_method ||
                    "—"}
                </p>
              </div>

              <div className="border-t border-[#E7E3DD] py-5 sm:border-t-0 sm:px-6 sm:py-0">
                <p className="font-sans text-[9px] font-medium uppercase tracking-[0.13em] text-[#8A8A84]">
                  Reference no.
                </p>

                <p className="mt-2 break-all font-serif text-[15px]">
                  {currentPayroll
                    .payroll_record
                    ?.payment_reference ||
                    "—"}
                </p>
              </div>

              <div className="border-t border-[#E7E3DD] pt-5 sm:border-t-0 sm:pl-6 sm:pt-0">
                <p className="font-sans text-[9px] font-medium uppercase tracking-[0.13em] text-[#8A8A84]">
                  Status
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-2.5 py-1.5 font-sans text-[8px] font-medium uppercase tracking-[0.1em] ${getStatusClasses(
                    currentPayroll.status
                  )}`}
                >
                  {formatStatus(
                    currentPayroll.status
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* FOOTER */}

          <div className="flex flex-col gap-5 border-t border-[#E7E3DD] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="max-w-[680px] font-serif text-[12px] leading-5 text-[#8A8780]">
              {currentPayroll
                .payroll_record
                ? "This payroll period has been finalized. Its saved lesson breakdown and rates will remain unchanged."
                : "This is a live estimate for the current payroll period. It will be finalized after the period ends."}
            </p>

            <button
              type="button"
              onClick={
                printCurrentPayroll
              }
              className="inline-flex shrink-0 items-center justify-center gap-2 border border-[#6F8F72] px-4 py-2.5 font-sans text-[11px] text-[#6F8F72] transition-colors hover:bg-[#E8EFE5]"
            >
              <PrinterIcon />
              Print Current Period
            </button>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* PAYROLL HISTORY                                                     */}
      {/* =================================================================== */}

      <section className="mx-auto max-w-[1200px] px-6 pb-20 sm:px-8 sm:pb-24 lg:px-10">
        <div className="border-y border-[#DCD8D2]">
          <div className="flex flex-col gap-5 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8EFE5] text-[#6F8F72]">
                  <WalletIcon />
                </span>

                <h3 className="font-serif text-[24px] font-normal tracking-[-0.02em]">
                  Payroll history
                </h3>
              </div>

              <p className="mt-4 max-w-[680px] font-serif text-[14px] leading-6 text-[#74716B]">
                Your finalized payroll
                periods are kept here with
                their lesson breakdown,
                applicable rates, payment
                status, and receipt details.
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full bg-[#EEECE7] px-3 py-1.5 font-sans text-[8px] font-medium uppercase tracking-[0.12em] text-[#817D75]">
              {payrollHistory.length}{" "}
              {payrollHistory.length ===
              1
                ? "record"
                : "records"}
            </span>
          </div>

          <div className="border-t border-[#E7E3DD]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] table-fixed border-collapse">
                <colgroup>
                  <col className="w-[31%]" />
                  <col className="w-[13%]" />
                  <col className="w-[16%]" />
                  <col className="w-[22%]" />
                  <col className="w-[18%]" />
                </colgroup>

                <thead>
                  <tr className="border-b border-[#DCD8D2]">
                    <th className="px-5 py-4 text-left font-sans text-[9px] font-medium uppercase tracking-[0.13em] text-[#8A8A84] sm:px-7">
                      Payroll period
                    </th>

                    <th className="px-5 py-4 text-right font-sans text-[9px] font-medium uppercase tracking-[0.13em] text-[#8A8A84]">
                      Lessons
                    </th>

                    <th className="px-5 py-4 text-right font-sans text-[9px] font-medium uppercase tracking-[0.13em] text-[#8A8A84]">
                      Gross pay
                    </th>

                    <th className="px-8 py-4 text-center font-sans text-[9px] font-medium uppercase tracking-[0.13em] text-[#8A8A84]">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right font-sans text-[9px] font-medium uppercase tracking-[0.13em] text-[#8A8A84] sm:px-7">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {payrollHistory.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-6 text-center font-serif text-[14px] text-[#8A8780] sm:px-7"
                      >
                        No payroll records
                        yet.
                      </td>
                    </tr>
                  ) : (
                    payrollHistory.map(
                      (record) => (
                        <tr
                          key={
                            record.id
                          }
                          className="border-b border-[#E7E3DD] transition-colors duration-150 hover:bg-[#F2F5F0]"
                        >
                          <td className="px-5 py-4 sm:px-7">
                            <p className="font-serif text-[15px]">
                              {formatShortDate(
                                record.period_start
                              )}
                              {" – "}
                              {formatShortDate(
                                record.period_end
                              )}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-right font-serif text-[15px]">
                            {getTotalLessonCount(
                              record
                            )}
                          </td>

                          <td className="px-5 py-4 text-right font-serif text-[15px]">
                            {formatCurrency(
                              record.gross_pay
                            )}
                          </td>

                          <td className="px-8 py-4 text-center">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1.5 font-sans text-[8px] font-medium uppercase tracking-[0.1em] ${getStatusClasses(
                                record.status
                              )}`}
                            >
                              {formatStatus(
                                record.status
                              )}
                            </span>
                          </td>

                          <td className="px-5 py-4 sm:px-7">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedPayroll(
                                    record
                                  )
                                }
                                className="inline-flex items-center gap-1.5 whitespace-nowrap border border-[#DCD8D2] px-3 py-2 font-sans text-[10px] text-[#5F655F] transition-colors hover:border-[#6F8F72] hover:text-[#6F8F72]"
                              >
                                <EyeIcon />
                                View
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  printPayroll(
                                    record
                                  )
                                }
                                className="inline-flex items-center gap-1.5 whitespace-nowrap border border-[#6F8F72] px-3 py-2 font-sans text-[10px] text-[#6F8F72] transition-colors hover:bg-[#E8EFE5]"
                              >
                                <PrinterIcon />
                                Print
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* PAYROLL DETAILS MODAL                                               */}
      {/* =================================================================== */}

      {selectedPayroll && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-8"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedPayroll(
                null
              );
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-[760px] overflow-y-auto bg-[#FAF8F5] shadow-[0_24px_70px_rgba(41,41,41,0.18)]">
            <div className="flex items-start justify-between border-b border-[#DCD8D2] px-6 py-6 sm:px-8">
              <div>
                <p className="font-sans text-[9px] font-medium uppercase tracking-[0.15em] text-[#8A8A84]">
                  Payroll record
                </p>

                <h2 className="mt-2 font-serif text-[27px] font-normal tracking-[-0.025em]">
                  Payment receipt
                </h2>

                <p className="mt-2 font-serif text-[13px] text-[#74716B]">
                  {formatShortDate(
                    selectedPayroll.period_start
                  )}
                  {" – "}
                  {formatShortDate(
                    selectedPayroll.period_end
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedPayroll(
                    null
                  )
                }
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#777771] transition-colors hover:bg-[#EEECE7] hover:text-[#292929]"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="px-6 py-7 sm:px-8">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse">
                  <thead>
                    <tr className="border-y border-[#DCD8D2]">
                      <th className="px-3 py-3 text-left font-sans text-[8px] font-medium uppercase tracking-[0.1em] text-[#8A8A84]">
                        Lesson type
                      </th>

                      <th className="px-3 py-3 text-right font-sans text-[8px] font-medium uppercase tracking-[0.1em] text-[#8A8A84]">
                        25 min
                      </th>

                      <th className="px-3 py-3 text-right font-sans text-[8px] font-medium uppercase tracking-[0.1em] text-[#8A8A84]">
                        50 min
                      </th>

                      <th className="px-3 py-3 text-right font-sans text-[8px] font-medium uppercase tracking-[0.1em] text-[#8A8A84]">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <ModalPayrollRow
                      label="Completed"
                      count25={
                        selectedPayroll.completed_25_count
                      }
                      count50={
                        selectedPayroll.completed_50_count
                      }
                      rate25={
                        selectedPayroll.rate_25
                      }
                      rate50={
                        selectedPayroll.rate_50
                      }
                    />

                    <ModalPayrollRow
                      label="No-Show"
                      count25={
                        selectedPayroll.no_show_25_count
                      }
                      count50={
                        selectedPayroll.no_show_50_count
                      }
                      rate25={
                        selectedPayroll.rate_25
                      }
                      rate50={
                        selectedPayroll.rate_50
                      }
                    />

                    <ModalPayrollRow
                      label="Late Cancellation"
                      count25={
                        selectedPayroll
                          .late_cancellation_25_count
                      }
                      count50={
                        selectedPayroll
                          .late_cancellation_50_count
                      }
                      rate25={
                        selectedPayroll.rate_25
                      }
                      rate50={
                        selectedPayroll.rate_50
                      }
                    />

                    <tr>
                      <td className="px-3 pt-5 font-serif text-[15px]">
                        <strong>
                          Total Payment
                        </strong>
                      </td>

                      <td className="px-3 pt-5 text-right font-serif text-[14px]">
                        <strong>
                          {getPayable25Count(
                            selectedPayroll
                          )}
                        </strong>
                      </td>

                      <td className="px-3 pt-5 text-right font-serif text-[14px]">
                        <strong>
                          {getPayable50Count(
                            selectedPayroll
                          )}
                        </strong>
                      </td>

                      <td className="px-3 pt-5 text-right font-serif text-[17px]">
                        <strong>
                          {formatCurrency(
                            selectedPayroll.gross_pay
                          )}
                        </strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-7 grid border-y border-[#DCD8D2] sm:grid-cols-3">
                <div className="border-b border-[#E7E3DD] px-4 py-5 sm:border-b-0 sm:border-r">
                  <p className="font-sans text-[8px] uppercase tracking-[0.1em] text-[#8A8A84]">
                    25-minute rate
                  </p>

                  <p className="mt-2 font-serif text-[16px]">
                    {formatCurrency(
                      selectedPayroll.rate_25
                    )}
                  </p>
                </div>

                <div className="border-b border-[#E7E3DD] px-4 py-5 sm:border-b-0 sm:border-r">
                  <p className="font-sans text-[8px] uppercase tracking-[0.1em] text-[#8A8A84]">
                    50-minute rate
                  </p>

                  <p className="mt-2 font-serif text-[16px]">
                    {formatCurrency(
                      selectedPayroll.rate_50
                    )}
                  </p>
                </div>

                <div className="px-4 py-5">
                  <p className="font-sans text-[8px] uppercase tracking-[0.1em] text-[#8A8A84]">
                    Status
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-1.5 font-sans text-[8px] font-medium uppercase tracking-[0.1em] ${getStatusClasses(
                      selectedPayroll.status
                    )}`}
                  >
                    {formatStatus(
                      selectedPayroll.status
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-7 grid sm:grid-cols-3 sm:divide-x sm:divide-[#E7E3DD]">
                <div className="pb-5 sm:pb-0 sm:pr-6">
                  <p className="font-sans text-[8px] uppercase tracking-[0.1em] text-[#8A8A84]">
                    Payment date
                  </p>

                  <p className="mt-2 font-serif text-[14px]">
                    {selectedPayroll
                      .payment_date
                      ? formatShortDate(
                          selectedPayroll
                            .payment_date
                        )
                      : "—"}
                  </p>
                </div>

                <div className="border-t border-[#E7E3DD] py-5 sm:border-t-0 sm:px-6 sm:py-0">
                  <p className="font-sans text-[8px] uppercase tracking-[0.1em] text-[#8A8A84]">
                    Payment method
                  </p>

                  <p className="mt-2 font-serif text-[14px]">
                    {selectedPayroll
                      .payment_method ||
                      "—"}
                  </p>
                </div>

                <div className="border-t border-[#E7E3DD] pt-5 sm:border-t-0 sm:pl-6 sm:pt-0">
                  <p className="font-sans text-[8px] uppercase tracking-[0.1em] text-[#8A8A84]">
                    Reference no.
                  </p>

                  <p className="mt-2 break-all font-serif text-[14px]">
                    {selectedPayroll
                      .payment_reference ||
                      "—"}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    printPayroll(
                      selectedPayroll
                    )
                  }
                  className="inline-flex items-center gap-2 border border-[#6F8F72] px-4 py-2.5 font-sans text-[11px] text-[#6F8F72] transition-colors hover:bg-[#E8EFE5]"
                >
                  <PrinterIcon />
                  Print Receipt
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedPayroll(
                      null
                    )
                  }
                  className="border border-[#DCD8D2] px-4 py-2.5 font-sans text-[11px] text-[#5F655F] transition-colors hover:border-[#6F8F72] hover:text-[#6F8F72]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ========================================================================= */
/* PAGE HEADER                                                               */
/* ========================================================================= */

function PageHeader({
  locale,
}: {
  locale: string;
}) {
  return (
    <header className="w-full px-6 pt-7 sm:px-8 sm:pt-8 lg:px-10 xl:px-12">
      <div className="flex w-full items-start justify-between gap-8">
        <Link
          href={`/${locale}/admin/teachers`}
          className="inline-flex shrink-0 items-center gap-2 font-sans text-[15px] text-[#5F655F] transition-colors duration-200 hover:text-[#6F8F72] sm:text-[16px]"
        >
          <ArrowLeftIcon />
          Teacher Dashboard
        </Link>

        <Link
          href={`/${locale}`}
          className="shrink-0 text-right transition-opacity duration-200 hover:opacity-70"
        >
          <p className="font-sans text-[16px] font-semibold leading-none tracking-[0.18em] text-[#6F8F72]">
            HAMKKE │ 함께
          </p>

          <p className="mt-2 font-serif text-[13px] font-normal leading-none tracking-[0.02em] text-[#6F8F72]">
            From Small Talk to Big Ideas
          </p>
        </Link>
      </div>
    </header>
  );
}

/* ========================================================================= */
/* CURRENT PAYROLL ROW                                                       */
/* ========================================================================= */

function PayrollRow({
  label,
  count25,
  count50,
  rate25,
  rate50,
}: {
  label: string;
  count25: number;
  count50: number;
  rate25: number;
  rate50: number;
}) {
  const amount =
    getAmount(
      count25,
      rate25
    ) +
    getAmount(
      count50,
      rate50
    );

  return (
    <tr className="border-b border-[#E7E3DD]">
      <td className="px-3 py-4 font-serif text-[14px]">
        {label}
      </td>

      <td className="px-3 py-4 text-right font-serif text-[14px]">
        {count25}
      </td>

      <td className="px-3 py-4 text-right font-serif text-[13px] text-[#8A8780]">
        {formatCurrency(
          rate25
        )}
      </td>

      <td className="px-3 py-4 text-right font-serif text-[14px]">
        {count50}
      </td>

      <td className="px-3 py-4 text-right font-serif text-[13px] text-[#8A8780]">
        {formatCurrency(
          rate50
        )}
      </td>

      <td className="px-3 py-4 text-right font-serif text-[14px]">
        {formatCurrency(
          amount
        )}
      </td>
    </tr>
  );
}

/* ========================================================================= */
/* MODAL PAYROLL ROW                                                         */
/* ========================================================================= */

function ModalPayrollRow({
  label,
  count25,
  count50,
  rate25,
  rate50,
}: {
  label: string;
  count25: number;
  count50: number;
  rate25: number;
  rate50: number;
}) {
  return (
    <tr className="border-b border-[#E7E3DD]">
      <td className="px-3 py-4 font-serif text-[13px]">
        {label}
      </td>

      <td className="px-3 py-4 text-right font-serif text-[13px]">
        {count25}
      </td>

      <td className="px-3 py-4 text-right font-serif text-[13px]">
        {count50}
      </td>

      <td className="px-3 py-4 text-right font-serif text-[13px]">
        {formatCurrency(
          getAmount(
            count25,
            rate25
          ) +
            getAmount(
              count50,
              rate50
            )
        )}
      </td>
    </tr>
  );
}