"use client";

import { categoryAmount, lessonRateLabel, type PayrollLine, type PayableStatus } from "@/lib/payroll/presentation";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, CalendarDays, FileText, Home, UserRound, Users, Wallet } from "lucide-react";

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

type PayrollStatus = "pending" | "paid" | "confirmed";

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
  received_at?: string | null;
  received_by?: string | null;

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
  is_finalized: boolean;
  breakdown_source: "live" | "frozen";
};

type PayrollLessonBreakdown = {
  id: string;
  enrollment_id: string;
  student_id: string | null;
  student_name: string;
  lesson_number: number;
  lesson_date: string;
  duration: number;
  attendance_status:
    | "completed"
    | "no_show"
    | "late_cancellation";
  rate: number;
  amount: number;
};

type PayrollApiResponse = {
  teacher: Teacher;

  period: {
    start: string;
    end: string;
  };

  current: CurrentPayroll;

  history: PayrollRecord[];

  lesson_breakdown: PayrollLessonBreakdown[];

  history_breakdowns: Record<
    string,
    PayrollLessonBreakdown[]
  >;

  compensation_progression?: {
    current_level?: number;
    qualifying_minutes_before: number;
    qualifying_minutes_current_period: number;
    qualifying_minutes_total: number;
    minutes_until_next_rate: number | null;
    next_rate: {
      id: string;
      level: number;
      min_teaching_minutes: number;
      rate_25: number;
      rate_50: number;
    } | null;
  };
};

/* ========================================================================= */
/* ICONS                                                                     */
/* ========================================================================= */

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

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

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

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatLessonDate(value: string | null | undefined) {
  if (!value) return "-";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatCurrency(amount: number) {
  return `₱${Number(amount || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getStatusClasses(status: PayrollStatus) {
  if (status === "confirmed") {
    return "bg-[#E5EBDD] text-[#607963]";
  }

  if (status === "paid") {
    return "bg-[#E5EBDD] text-[#607963]";
  }

  return "bg-[#EEECE7] text-[#817D75]";
}

function formatStatus(status: PayrollStatus) {
  if (status === "paid") return "Paid";
  if (status === "confirmed") return "Confirmed";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatLessonStatus(status: string) {
  switch (status) {
    case "completed":
      return "Completed";
    case "no_show":
      return "No-show";
    case "late_cancellation":
      return "Late cancellation";
    default:
      return status;
  }
}

function getTotalLessonCount(record: PayrollRecord) {
  return (
    record.completed_25_count +
    record.completed_50_count +
    record.no_show_25_count +
    record.no_show_50_count +
    record.late_cancellation_25_count +
    record.late_cancellation_50_count
  );
}

function getPayable25Count(record: PayrollRecord) {
  return (
    record.completed_25_count +
    record.no_show_25_count +
    record.late_cancellation_25_count
  );
}

function getPayable50Count(record: PayrollRecord) {
  return (
    record.completed_50_count +
    record.no_show_50_count +
    record.late_cancellation_50_count
  );
}

function getAmount(count: number, rate: number) {
  return count * rate;
}

/* ========================================================================= */
/* PAGE                                                                      */
/* ========================================================================= */

export default function TeacherPayrollPage() {
  const params = useParams();
  const locale = String(params.locale);

  const [teacher, setTeacher] = useState<Teacher | null>(null);

  const [currentPayroll, setCurrentPayroll] =
    useState<CurrentPayroll | null>(null);

  const [payrollHistory, setPayrollHistory] = useState<PayrollRecord[]>([]);

  const [lessonBreakdown, setLessonBreakdown] =
    useState<PayrollLessonBreakdown[]>([]);

  const [historyBreakdowns, setHistoryBreakdowns] =
    useState<
      Record<
        string,
        PayrollLessonBreakdown[]
      >
    >({});

  const [compensationProgression, setCompensationProgression] =
    useState<PayrollApiResponse["compensation_progression"]>(undefined);

  const [selectedPayroll, setSelectedPayroll] =
    useState<PayrollRecord | null>(null);

  const [showCurrentBreakdown, setShowCurrentBreakdown] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [receiptActionLoading, setReceiptActionLoading] = useState(false);
  const [receiptActionError, setReceiptActionError] = useState("");

  /* ----------------------------------------------------------------------- */
  /* LOAD PAYROLL                                                            */
  /* ----------------------------------------------------------------------- */

  useEffect(() => {
    async function loadPayroll() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/admin/teachers/payroll",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load your payroll."
          );
        }

        const payrollData = data as PayrollApiResponse;

        setTeacher(payrollData.teacher);
        setCurrentPayroll(payrollData.current);
        setPayrollHistory(payrollData.history || []);
        setLessonBreakdown(payrollData.lesson_breakdown || []);
        setHistoryBreakdowns(
          payrollData.history_breakdowns || {}
        );
        setCompensationProgression(payrollData.compensation_progression);
      } catch (err) {
        console.error("Error loading payroll:", err);

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

  async function confirmPaymentReceived(record: PayrollRecord) {
    try {
      setReceiptActionLoading(true);
      setReceiptActionError("");
      const response = await fetch("/api/admin/teachers/payroll", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm_received", payrollId: record.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to confirm payment receipt.");
      window.location.reload();
    } catch (err) {
      setReceiptActionError(err instanceof Error ? err.message : "Unable to confirm payment receipt.");
    } finally {
      setReceiptActionLoading(false);
    }
  }

  /* ----------------------------------------------------------------------- */
  /* CURRENT PERIOD                                                          */
  /* ----------------------------------------------------------------------- */

  const payrollPeriod = useMemo(() => {
    if (!currentPayroll) {
      return {
        label: "—",
      };
    }

    const startDate = new Date(
      `${currentPayroll.period_start}T00:00:00`
    );

    const startDay = Number(
      currentPayroll.period_start.slice(-2)
    );

    const endDay = Number(
      currentPayroll.period_end.slice(-2)
    );

    return {
      label: `${formatMonthYear(startDate)} · ${startDay}–${endDay}`,
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
        currentPayroll.payroll_record?.id ||
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
        currentPayroll.late_cancellation_25_count,

      late_cancellation_50_count:
        currentPayroll.late_cancellation_50_count,

      rate_25:
        currentPayroll.compensation_rate.rate_25,

      rate_50:
        currentPayroll.compensation_rate.rate_50,

      gross_pay:
        currentPayroll.gross_pay,

      payment_method:
        currentPayroll.payroll_record?.payment_method || null,

      payment_reference:
        currentPayroll.payroll_record?.payment_reference || null,

      payment_date:
        currentPayroll.payroll_record?.payment_date || null,

      status:
        currentPayroll.status,
    };
  }

  /* ----------------------------------------------------------------------- */
  /* PRINT                                                                   */
  /* ----------------------------------------------------------------------- */

  function payrollLines(record: PayrollRecord) {
    return historyBreakdowns[record.id] ||
      (record.id === "current-period" || currentPayroll?.payroll_record?.id === record.id ? lessonBreakdown : []);
  }

  function printPayroll(record: PayrollRecord) {
    if (!teacher) {
      return;
    }

    const printFrame = document.createElement("iframe");
    printFrame.setAttribute("aria-hidden", "true");
    printFrame.style.position = "fixed";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);
    const printWindow = printFrame.contentWindow;
    if (!printWindow) { printFrame.remove(); return; }

    const breakdown = payrollLines(record);
    const breakdownRows = breakdown.map((lesson) => `
      <tr><td>${formatLessonDate(lesson.lesson_date)}</td><td>${lesson.student_name || "—"}</td><td class="center">${lesson.duration} min</td><td>${formatLessonStatus(lesson.attendance_status)}</td><td class="right">${formatCurrency(lesson.rate)}</td><td class="right">${formatCurrency(lesson.amount)}</td></tr>`).join("");

    const total25 = getPayable25Count(record);
    const total50 = getPayable50Count(record);

    const completedAmount =
      categoryAmount(record, payrollLines(record), "completed");

    const noShowAmount =
      categoryAmount(record, payrollLines(record), "no_show");

    const lateAmount =
      categoryAmount(record, payrollLines(record), "late_cancellation");

    printWindow.document.write(`
      <!DOCTYPE html>

      <html>
        <head>
          <meta charset="UTF-8" />

          <title>Hamkke Payment Receipt</title>

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
              font-family: Arial, Helvetica, sans-serif;
              font-size: 11px;
            }

            .header {
              display: flex;
              justify-content: space-between;
              border-bottom: 1px solid #dcd8d2;
              padding-bottom: 20px;
            }

            .eyebrow,
            .label {
              color: #8a8a84;
              font-size: 8px;
              font-weight: 600;
              letter-spacing: .13em;
              text-transform: uppercase;
            }

            h1 {
              margin: 7px 0 0;
              font-family: Georgia, serif;
              font-size: 27px;
              font-weight: 400;
            }

            .brand {
              text-align: right;
              color: #6f8f72;
            }

            .brand-name {
              font-size: 14px;
              font-weight: 700;
              letter-spacing: .14em;
            }

            .tagline {
              margin-top: 6px;
              font-family: Georgia, serif;
              font-size: 10px;
            }

            .teacher {
              margin-top: 22px;
              font-family: Georgia, serif;
              font-size: 17px;
            }

            .period {
              margin-top: 6px;
              color: #74716b;
              font-size: 10px;
            }

            table {
              width: 100%;
              margin-top: 28px;
              border-collapse: collapse;
            }

            th {
              padding: 9px 7px;
              border-top: 1px solid #dcd8d2;
              border-bottom: 1px solid #dcd8d2;
              color: #8a8a84;
              font-size: 8px;
              text-align: left;
              text-transform: uppercase;
            }

            td {
              padding: 10px 7px;
              border-bottom: 1px solid #e7e3dd;
            }

            .right {
              text-align: right;
            }

            .total td {
              padding-top: 14px;
              border-top: 1px solid #292929;
              border-bottom: none;
              font-family: Georgia, serif;
              font-size: 15px;
            }

            .payment {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin-top: 28px;
              padding: 15px;
              border: 1px solid #dcd8d2;
            }

            .value {
              margin-top: 5px;
              font-family: Georgia, serif;
              font-size: 13px;
            }

            .footer {
              margin-top: 50px;
              padding-top: 12px;
              border-top: 1px solid #dcd8d2;
              color: #8a8780;
              font-size: 8.5px;
              line-height: 1.6;
            }

            .payroll-breakdown { break-before: page; page-break-before: always; padding-top: 2mm; }
            .breakdown-table { width: 100%; border-collapse: collapse; }
            .breakdown-table th, .breakdown-table td { padding: 9px 7px; border-bottom: 1px solid #E7E3DD; vertical-align: top; }
            .breakdown-table th { font-size: 9px; text-transform: uppercase; letter-spacing: .08em; color: #8A8A84; text-align: left; }
            .breakdown-table .right { text-align: right; } .breakdown-table .center { text-align: center; }
            .breakdown-total { margin-top: 18px; text-align: right; font-family: Georgia, 'Times New Roman', serif; font-size: 16px; }
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

              <div class="tagline">
                From Small Talk to Big Ideas
              </div>
            </div>
          </div>

          <div class="teacher">
            ${teacher.full_name || "Unnamed teacher"}

            <div class="period">
              ${teacher.teacher_number || "—"} ·
              ${formatShortDate(record.period_start)}
              –
              ${formatShortDate(record.period_end)}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Lesson Type</th>
                <th class="right">25 min</th>
                <th class="right">50 min</th>
                <th class="right">Amount</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Completed</td>

                <td class="right">
                  ${record.completed_25_count}
                </td>

                <td class="right">
                  ${record.completed_50_count}
                </td>

                <td class="right">
                  ${formatCurrency(completedAmount)}
                </td>
              </tr>

              <tr>
                <td>No-Show</td>

                <td class="right">
                  ${record.no_show_25_count}
                </td>

                <td class="right">
                  ${record.no_show_50_count}
                </td>

                <td class="right">
                  ${formatCurrency(noShowAmount)}
                </td>
              </tr>

              <tr>
                <td>Late Cancellation</td>

                <td class="right">
                  ${record.late_cancellation_25_count}
                </td>

                <td class="right">
                  ${record.late_cancellation_50_count}
                </td>

                <td class="right">
                  ${formatCurrency(lateAmount)}
                </td>
              </tr>

              <tr class="total">
                <td>
                  <strong>Total Payment</strong>
                </td>

                <td class="right">
                  ${total25}
                </td>

                <td class="right">
                  ${total50}
                </td>

                <td class="right">
                  <strong>
                    ${formatCurrency(record.gross_pay)}
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="payment">
            <div>
              <div class="label">
                Payment Method
              </div>

              <div class="value">
                ${record.payment_method || "—"}
              </div>
            </div>

            <div>
              <div class="label">
                Reference No.
              </div>

              <div class="value">
                ${record.payment_reference || "—"}
              </div>
            </div>

            <div>
              <div class="label">
                Status
              </div>

              <div class="value">
                ${formatStatus(record.status)}
              </div>
            </div>
          </div>

          <section class="payroll-breakdown">
            <div class="eyebrow">Payroll Breakdown</div>
            <h1>Frozen Lesson Breakdown</h1>
            <table class="breakdown-table"><thead><tr><th>Date</th><th>Student</th><th class="center">Duration</th><th>Status</th><th class="right">Rate</th><th class="right">Amount</th></tr></thead><tbody>${breakdownRows || '<tr><td colspan="6">No frozen lesson breakdown is available for this payroll.</td></tr>'}</tbody></table>
            <div class="breakdown-total"><strong>Total: ${formatCurrency(record.gross_pay)}</strong></div>
          </section>

          <div class="footer">
            <strong>Hamkke English</strong><br />
            This receipt reflects the teaching services covered by the payroll period shown above.
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    printWindow.addEventListener("afterprint", () => window.setTimeout(() => printFrame.remove(), 250), { once: true });
    setTimeout(() => { printWindow.focus(); printWindow.print(); }, 250);
  }

  function printCurrentPayroll() {
    const record = makeCurrentRecord();

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
        <div className="mx-auto flex min-h-screen max-w-[1500px]">
          <TeacherPortalSidebar locale={locale} teacher={teacher} />
          <section className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
            <div className="mb-7 lg:hidden">
              <Link href={`/${locale}`} className="font-sans text-[14px] font-semibold tracking-[0.16em] text-[#5F7F63]">HAMKKE │ 함께</Link>
            </div>
          <div className="border-y border-[#DCD8D2] py-20 text-center">
            <p className="font-serif text-[17px] text-[#74716B]">
              Loading payroll...
            </p>
          </div>
          </section>
        </div>
      </main>
    );
  }

  /* ========================================================================= */
  /* ERROR                                                                    */
  /* ========================================================================= */

  if (error || !teacher || !currentPayroll) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
        <div className="mx-auto flex min-h-screen max-w-[1500px]">
          <TeacherPortalSidebar locale={locale} teacher={teacher} />
          <section className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
            <div className="mb-7 lg:hidden">
              <Link href={`/${locale}`} className="font-sans text-[14px] font-semibold tracking-[0.16em] text-[#5F7F63]">HAMKKE │ 함께</Link>
            </div>
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
              Back to Dashboard
            </Link>
          </div>
          </section>
        </div>
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
        ? teacher.status.charAt(0).toUpperCase() +
          teacher.status.slice(1)
        : "Unknown";

  const paymentDateText =
    currentPayroll.payroll_record?.payment_date
      ? formatShortDate(
          currentPayroll.payroll_record.payment_date
        )
      : currentPayroll.payroll_record
        ? currentPayroll.status === "paid"
          ? "Payment recorded"
          : "Payment date will be recorded when paid"
        : "Live estimate · finalizes after the period ends";

  /* ========================================================================= */
  /* MAIN                                                                     */
  /* ========================================================================= */

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <TeacherPortalSidebar locale={locale} teacher={teacher} />

        <section className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          <div className="mb-7 flex items-center justify-between lg:hidden">
            <Link href={`/${locale}`} className="font-sans text-[14px] font-semibold tracking-[0.16em] text-[#5F7F63]">HAMKKE │ 함께</Link>
            <Link href={`/${locale}/admin/teachers`} className="font-sans text-[12px] text-[#6F8F72]">Dashboard</Link>
          </div>

          <p className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-[#6F8F72]">Teacher Portal</p>
          <h1 className="mt-3 font-serif text-[38px] font-normal tracking-[-0.03em] sm:text-[46px]">Payroll</h1>
          <p className="mt-2 font-serif text-[17px] text-[#74716B]">Your earnings and payment records.</p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[20px] border border-[#E8D99B] bg-[#FFF4C7] p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-[#8A7B43]">Current earnings</p>
                  <p className="mt-3 font-serif text-[32px] tracking-[-0.03em]">{formatCurrency(currentPayroll.gross_pay)}</p>
                  <p className="mt-2 font-serif text-[13px] text-[#756E58]">{payrollPeriod.label}</p>
                </div>
                <span className={`inline-flex rounded-full px-3 py-1.5 font-sans text-[8px] font-medium uppercase tracking-[0.1em] ${getStatusClasses(currentPayroll.status)}`}>{formatStatus(currentPayroll.status)}</span>
              </div>
              <p className="mt-5 border-t border-[#E8D99B] pt-4 font-serif text-[12px] leading-5 text-[#756E58]">
                {currentPayroll.is_finalized ? "Finalized payroll · saved rates and lesson breakdown are frozen." : "Live estimate · updates as payable lessons are recorded."}
              </p>
            </div>

            <div className="rounded-[20px] border border-[#E7DDD1] bg-white p-5 sm:p-6">
              <p className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-[#8A8A84]">Current rate</p>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="font-serif text-[22px]">Level {compensationProgression?.current_level ?? currentPayroll.compensation_rate.level}</p>
                  <p className="mt-2 font-serif text-[13px] text-[#74716B]">{((compensationProgression?.qualifying_minutes_total ?? currentPayroll.teaching_minutes_before) / 60).toLocaleString("en-PH", { maximumFractionDigits: 1 })} qualifying hours</p>
                  {compensationProgression?.next_rate && (
                    <p className="mt-1 font-sans text-[10px] text-[#8A8780]">
                      {((compensationProgression.minutes_until_next_rate ?? 0) / 60).toLocaleString("en-PH", { maximumFractionDigits: 1 })} hours until Level {compensationProgression.next_rate.level}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-serif text-[16px]">{lessonRateLabel(lessonBreakdown, 25, currentPayroll.compensation_rate.rate_25)} <span className="text-[11px] text-[#8A8780]">/ 25 min</span></p>
                  <p className="mt-1 font-serif text-[16px]">{lessonRateLabel(lessonBreakdown, 50, currentPayroll.compensation_rate.rate_50)} <span className="text-[11px] text-[#8A8780]">/ 50 min</span></p>
                </div>
              </div>
            </div>
          </div>

      {/* CURRENT PAYROLL */}

          <section className="mt-5 pb-8">
            <div className="overflow-hidden rounded-[20px] border border-[#E7DDD1] bg-white">
          <div className="flex flex-col gap-6 border-b border-[#DCD8D2] px-6 py-7 sm:flex-row sm:items-start sm:justify-between sm:px-8">
            <div>
              <p className="font-sans text-[9px] font-medium uppercase tracking-[0.16em] text-[#8A8A84]">
                Teacher payment
              </p>

              <h2 className="mt-2 font-serif text-[29px] font-normal tracking-[-0.025em]">
                Current payroll
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
                {formatStatus(currentPayroll.status)}
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
                {teacher.full_name || "Unnamed teacher"}
              </p>

              <p className="mt-1 font-sans text-[10px] text-[#8A8780]">
                {teacher.teacher_number || "—"}
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
          <p className="px-6 pt-5 text-xs leading-5 text-[#74716B] sm:px-8">Each lesson uses the rate earned before it starts. A higher level applies to the next lesson after the qualifying-hours threshold is reached, including within this payroll period.</p>

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
                    count25={currentPayroll.completed_25_count}
                    count50={currentPayroll.completed_50_count}
                    rate25={currentPayroll.compensation_rate.rate_25}
                    rate50={currentPayroll.compensation_rate.rate_50}
                  lines={lessonBreakdown} status="completed" />

                  <PayrollRow
                    label="No-Show"
                    count25={currentPayroll.no_show_25_count}
                    count50={currentPayroll.no_show_50_count}
                    rate25={currentPayroll.compensation_rate.rate_25}
                    rate50={currentPayroll.compensation_rate.rate_50}
                  lines={lessonBreakdown} status="no_show" />

                  <PayrollRow
                    label="Late Cancellation"
                    count25={
                      currentPayroll.late_cancellation_25_count
                    }
                    count50={
                      currentPayroll.late_cancellation_50_count
                    }
                    rate25={currentPayroll.compensation_rate.rate_25}
                    rate50={currentPayroll.compensation_rate.rate_50}
                  lines={lessonBreakdown} status="late_cancellation" />

                  <tr>
                    <td className="px-3 pt-5 font-serif text-[16px]">
                      <strong>Total Payment</strong>
                    </td>

                    <td
                      colSpan={4}
                      className="px-3 pt-5 text-right font-sans text-[9px] uppercase tracking-[0.1em] text-[#8A8A84]"
                    >
                      {currentPayroll.payable_25_count} × 25 min ·{" "}
                      {currentPayroll.payable_50_count} × 50 min
                    </td>

                    <td className="px-3 pt-5 text-right font-serif text-[19px]">
                      {formatCurrency(currentPayroll.gross_pay)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* LESSON BREAKDOWN */}

          <div className="border-t border-[#E7DDD1] px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-sans text-[9px] font-medium uppercase tracking-[0.15em] text-[#8A8A84]">Lesson breakdown</p>
                <p className="mt-2 font-serif text-[13px] leading-5 text-[#74716B]">
                  {lessonBreakdown.length} {lessonBreakdown.length === 1 ? "payable lesson" : "payable lessons"} · {currentPayroll.breakdown_source === "frozen" ? "finalized snapshot" : "live period"}
                </p>
              </div>
              <button type="button" onClick={() => setShowCurrentBreakdown(true)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCD8D2] px-4 py-2.5 font-sans text-[11px] text-[#5F655F] transition hover:border-[#6F8F72] hover:text-[#6F8F72]">
                <EyeIcon /> View breakdown
              </button>
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
                  {currentPayroll.payroll_record?.payment_method || "—"}
                </p>
              </div>

              <div className="border-t border-[#E7E3DD] py-5 sm:border-t-0 sm:px-6 sm:py-0">
                <p className="font-sans text-[9px] font-medium uppercase tracking-[0.13em] text-[#8A8A84]">
                  Reference no.
                </p>

                <p className="mt-2 break-all font-serif text-[15px]">
                  {currentPayroll.payroll_record?.payment_reference ||
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
                  {formatStatus(currentPayroll.status)}
                </span>
              </div>
            </div>
          </div>

          {/* FOOTER */}

          <div className="flex flex-col gap-5 border-t border-[#E7E3DD] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="max-w-[680px] font-serif text-[12px] leading-5 text-[#8A8780]">
              {currentPayroll.payroll_record
                ? "This payroll period has been finalized. Its saved lesson breakdown and rates will remain unchanged."
                : "This is a live estimate for the current payroll period. It will be finalized after the period ends."}
            </p>

            <button
              type="button"
              onClick={printCurrentPayroll}
              className="inline-flex shrink-0 items-center justify-center gap-2 border border-[#6F8F72] px-4 py-2.5 font-sans text-[11px] text-[#6F8F72] transition-colors hover:bg-[#E8EFE5]"
            >
              <PrinterIcon />
              Print Current Period
            </button>
          </div>
        </div>
      </section>

      {/* PAYROLL HISTORY */}

          <section className="pb-16">
            <div className="overflow-hidden rounded-[20px] border border-[#E7DDD1] bg-white">
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
                Your finalized payroll periods are kept here with
                their lesson breakdown, applicable rates, payment
                status, and receipt details.
              </p>
            </div>

            <span className="inline-flex w-fit rounded-full bg-[#EEECE7] px-3 py-1.5 font-sans text-[8px] font-medium uppercase tracking-[0.12em] text-[#817D75]">
              {payrollHistory.length}{" "}
              {payrollHistory.length === 1 ? "record" : "records"}
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
                  {payrollHistory.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-6 text-center font-serif text-[14px] text-[#8A8780] sm:px-7"
                      >
                        No payroll records yet.
                      </td>
                    </tr>
                  ) : (
                    payrollHistory.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-[#E7E3DD] transition-colors duration-150 hover:bg-[#F2F5F0]"
                      >
                        <td className="px-5 py-4 sm:px-7">
                          <p className="font-serif text-[15px]">
                            {formatShortDate(record.period_start)}
                            {" – "}
                            {formatShortDate(record.period_end)}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-right font-serif text-[15px]">
                          {getTotalLessonCount(record)}
                        </td>

                        <td className="px-5 py-4 text-right font-serif text-[15px]">
                          {formatCurrency(record.gross_pay)}
                        </td>

                        <td className="px-8 py-4 text-center">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1.5 font-sans text-[8px] font-medium uppercase tracking-[0.1em] ${getStatusClasses(
                              record.status
                            )}`}
                          >
                            {formatStatus(record.status)}
                          </span>
                        </td>

                        <td className="px-5 py-4 sm:px-7">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedPayroll(record)}
                              className="inline-flex items-center gap-1.5 whitespace-nowrap border border-[#DCD8D2] px-3 py-2 font-sans text-[10px] text-[#5F655F] transition-colors hover:border-[#6F8F72] hover:text-[#6F8F72]"
                            >
                              <EyeIcon />
                              View
                            </button>

                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

          {/* CURRENT BREAKDOWN MODAL */}
          {showCurrentBreakdown && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-8" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCurrentBreakdown(false); }}>
              <div className="max-h-[90vh] w-full max-w-[900px] overflow-y-auto rounded-[20px] bg-[#FAF8F5] shadow-[0_24px_70px_rgba(41,41,41,0.18)]">
                <div className="flex items-start justify-between border-b border-[#DCD8D2] px-6 py-6 sm:px-8">
                  <div>
                    <p className="font-sans text-[9px] font-medium uppercase tracking-[0.15em] text-[#8A8A84]">Current payroll</p>
                    <h2 className="mt-2 font-serif text-[27px] font-normal tracking-[-0.025em]">Lesson breakdown</h2>
                    <p className="mt-2 font-serif text-[13px] text-[#74716B]">{payrollPeriod.label} · {currentPayroll.breakdown_source === "frozen" ? "Finalized snapshot" : "Live period"}</p>
                  </div>
                  <button type="button" onClick={() => setShowCurrentBreakdown(false)} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full text-[#777771] transition hover:bg-[#EEECE7] hover:text-[#292929]"><CloseIcon /></button>
                </div>
                <div className="overflow-x-auto px-6 py-6 sm:px-8">
                  <table className="w-full min-w-[760px] border-collapse">
                    <thead><tr className="border-y border-[#DCD8D2]"><th className="px-3 py-3 text-left font-sans text-[8px] uppercase tracking-[0.1em] text-[#8A8A84]">Date</th><th className="px-3 py-3 text-left font-sans text-[8px] uppercase tracking-[0.1em] text-[#8A8A84]">Student</th><th className="px-3 py-3 text-left font-sans text-[8px] uppercase tracking-[0.1em] text-[#8A8A84]">Lesson</th><th className="px-3 py-3 text-right font-sans text-[8px] uppercase tracking-[0.1em] text-[#8A8A84]">Duration</th><th className="px-3 py-3 text-left font-sans text-[8px] uppercase tracking-[0.1em] text-[#8A8A84]">Status</th><th className="px-3 py-3 text-right font-sans text-[8px] uppercase tracking-[0.1em] text-[#8A8A84]">Rate</th><th className="px-3 py-3 text-right font-sans text-[8px] uppercase tracking-[0.1em] text-[#8A8A84]">Amount</th></tr></thead>
                    <tbody>{lessonBreakdown.length === 0 ? <tr><td colSpan={7} className="px-3 py-8 text-center font-serif text-[13px] text-[#8A8780]">No payable lessons in this period yet.</td></tr> : lessonBreakdown.map((lesson) => <tr key={lesson.id} className="border-b border-[#E7E3DD]"><td className="px-3 py-4 font-serif text-[12px]">{formatShortDate(lesson.lesson_date)}</td><td className="px-3 py-4 font-serif text-[13px]">{lesson.student_name}</td><td className="px-3 py-4 font-serif text-[12px]">Lesson {lesson.lesson_number}</td><td className="px-3 py-4 text-right font-serif text-[12px]">{lesson.duration} min</td><td className="px-3 py-4 font-sans text-[10px] text-[#5F655F]">{formatLessonStatus(lesson.attendance_status)}</td><td className="px-3 py-4 text-right font-serif text-[12px] text-[#8A8780]">{formatCurrency(lesson.rate)}</td><td className="px-3 py-4 text-right font-serif text-[13px]">{formatCurrency(lesson.amount)}</td></tr>)}</tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

      {/* HISTORY MODAL */}

      {selectedPayroll && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedPayroll(null);
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
                  {formatShortDate(selectedPayroll.period_start)}
                  {" – "}
                  {formatShortDate(selectedPayroll.period_end)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPayroll(null)}
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
                      count25={selectedPayroll.completed_25_count}
                      count50={selectedPayroll.completed_50_count}
                      rate25={selectedPayroll.rate_25}
                      rate50={selectedPayroll.rate_50}
                    lines={payrollLines(selectedPayroll)} status="completed" />

                    <ModalPayrollRow
                      label="No-Show"
                      count25={selectedPayroll.no_show_25_count}
                      count50={selectedPayroll.no_show_50_count}
                      rate25={selectedPayroll.rate_25}
                      rate50={selectedPayroll.rate_50}
                    lines={payrollLines(selectedPayroll)} status="no_show" />

                    <ModalPayrollRow
                      label="Late Cancellation"
                      count25={
                        selectedPayroll.late_cancellation_25_count
                      }
                      count50={
                        selectedPayroll.late_cancellation_50_count
                      }
                      rate25={selectedPayroll.rate_25}
                      rate50={selectedPayroll.rate_50}
                    lines={payrollLines(selectedPayroll)} status="late_cancellation" />

                    <tr>
                      <td className="px-3 pt-5 font-serif text-[15px]">
                        <strong>Total Payment</strong>
                      </td>

                      <td className="px-3 pt-5 text-right font-serif text-[14px]">
                        <strong>
                          {getPayable25Count(selectedPayroll)}
                        </strong>
                      </td>

                      <td className="px-3 pt-5 text-right font-serif text-[14px]">
                        <strong>
                          {getPayable50Count(selectedPayroll)}
                        </strong>
                      </td>

                      <td className="px-3 pt-5 text-right font-serif text-[17px]">
                        <strong>
                          {formatCurrency(selectedPayroll.gross_pay)}
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
                    {lessonRateLabel(payrollLines(selectedPayroll), 25, selectedPayroll.rate_25)}
                  </p>
                </div>

                <div className="border-b border-[#E7E3DD] px-4 py-5 sm:border-b-0 sm:border-r">
                  <p className="font-sans text-[8px] uppercase tracking-[0.1em] text-[#8A8A84]">
                    50-minute rate
                  </p>

                  <p className="mt-2 font-serif text-[16px]">
                    {lessonRateLabel(payrollLines(selectedPayroll), 50, selectedPayroll.rate_50)}
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
                    {formatStatus(selectedPayroll.status)}
                  </span>
                </div>
              </div>

              <div className="mt-8 border-t border-[#DCD8D2] pt-7">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-[#8A8A84]">
                      Frozen lesson breakdown
                    </p>

                    <p className="mt-2 font-serif text-[12px] leading-5 text-[#74716B]">
                      This is the exact lesson snapshot saved for this payroll period.
                    </p>
                  </div>

                  <span className="inline-flex w-fit border border-[#DCD8D2] px-2.5 py-1 font-sans text-[8px] font-medium uppercase tracking-[0.12em] text-[#6F8F72]">
                    {(historyBreakdowns[
                      selectedPayroll.id
                    ] || []).length}{" "}
                    {(historyBreakdowns[
                      selectedPayroll.id
                    ] || []).length === 1
                      ? "lesson"
                      : "lessons"}
                  </span>
                </div>

                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[700px] border-collapse">
                    <thead>
                      <tr className="border-y border-[#DCD8D2]">
                        <th className="px-3 py-3 text-left font-sans text-[8px] font-medium uppercase tracking-[0.1em] text-[#8A8A84]">
                          Date
                        </th>
                        <th className="px-3 py-3 text-left font-sans text-[8px] font-medium uppercase tracking-[0.1em] text-[#8A8A84]">
                          Student
                        </th>
                        <th className="px-3 py-3 text-left font-sans text-[8px] font-medium uppercase tracking-[0.1em] text-[#8A8A84]">
                          Lesson
                        </th>
                        <th className="px-3 py-3 text-right font-sans text-[8px] font-medium uppercase tracking-[0.1em] text-[#8A8A84]">
                          Duration
                        </th>
                        <th className="px-3 py-3 text-left font-sans text-[8px] font-medium uppercase tracking-[0.1em] text-[#8A8A84]">
                          Status
                        </th>
                        <th className="px-3 py-3 text-right font-sans text-[8px] font-medium uppercase tracking-[0.1em] text-[#8A8A84]">
                          Rate
                        </th>
                        <th className="px-3 py-3 text-right font-sans text-[8px] font-medium uppercase tracking-[0.1em] text-[#8A8A84]">
                          Amount
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {(historyBreakdowns[
                        selectedPayroll.id
                      ] || []).length > 0 ? (
                        (
                          historyBreakdowns[
                            selectedPayroll.id
                          ] || []
                        ).map((lesson) => (
                          <tr
                            key={lesson.id}
                            className="border-b border-[#E7E3DD]"
                          >
                            <td className="px-3 py-4 font-serif text-[12px]">
                              {formatShortDate(
                                lesson.lesson_date
                              )}
                            </td>

                            <td className="px-3 py-4 font-serif text-[13px]">
                              {lesson.student_name}
                            </td>

                            <td className="px-3 py-4 font-serif text-[12px]">
                              Lesson{" "}
                              {lesson.lesson_number}
                            </td>

                            <td className="px-3 py-4 text-right font-serif text-[12px]">
                              {lesson.duration} min
                            </td>

                            <td className="px-3 py-4 font-serif text-[12px]">
                              {formatLessonStatus(
                                lesson.attendance_status
                              )}
                            </td>

                            <td className="px-3 py-4 text-right font-serif text-[12px] text-[#8A8780]">
                              {formatCurrency(
                                lesson.rate
                              )}
                            </td>

                            <td className="px-3 py-4 text-right font-serif text-[13px]">
                              {formatCurrency(
                                lesson.amount
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-3 py-7 text-center font-serif text-[12px] text-[#8A8780]"
                          >
                            No frozen lesson breakdown is available for this payroll record.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <p className="mt-4 font-serif text-[11px] leading-5 text-[#8A8780]">
                  Individual lesson rows are kept in payroll history for review, but they are not included in the printed receipt.
                </p>
              </div>

              <div className="mt-7 grid sm:grid-cols-4 sm:divide-x sm:divide-[#E7E3DD]">
                <div className="pb-5 sm:pb-0 sm:pr-6">
                  <p className="font-sans text-[8px] uppercase tracking-[0.1em] text-[#8A8A84]">Amount paid</p>
                  <p className="mt-2 font-serif text-[14px]">{formatCurrency(selectedPayroll.gross_pay)}</p>
                </div>

                <div className="border-t border-[#E7E3DD] py-5 sm:border-t-0 sm:px-6 sm:py-0">
                  <p className="font-sans text-[8px] uppercase tracking-[0.1em] text-[#8A8A84]">
                    Payment date
                  </p>

                  <p className="mt-2 font-serif text-[14px]">
                    {selectedPayroll.payment_date
                      ? formatShortDate(selectedPayroll.payment_date)
                      : "—"}
                  </p>
                </div>

                <div className="border-t border-[#E7E3DD] py-5 sm:border-t-0 sm:px-6 sm:py-0">
                  <p className="font-sans text-[8px] uppercase tracking-[0.1em] text-[#8A8A84]">
                    Payment method
                  </p>

                  <p className="mt-2 font-serif text-[14px]">
                    {selectedPayroll.payment_method || "—"}
                  </p>
                </div>

                <div className="border-t border-[#E7E3DD] pt-5 sm:border-t-0 sm:pl-6 sm:pt-0">
                  <p className="font-sans text-[8px] uppercase tracking-[0.1em] text-[#8A8A84]">
                    Reference no.
                  </p>

                  <p className="mt-2 break-all font-serif text-[14px]">
                    {selectedPayroll.payment_reference || "—"}
                  </p>
                </div>
              </div>

              {selectedPayroll.status === "paid" && (
                <div className="mt-8 border-t border-[#DCD8D2] pt-7">
                  <p className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-[#8A8A84]">Payment confirmation</p>
                  <p className="mt-2 font-serif text-[13px] leading-6 text-[#74716B]">I confirm that I received the payment shown above.</p>
                  <button type="button" disabled={receiptActionLoading} onClick={() => confirmPaymentReceived(selectedPayroll)} className="mt-4 inline-flex items-center justify-center border border-[#6F8F72] bg-[#6F8F72] px-5 py-2.5 font-sans text-[11px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                    {receiptActionLoading ? "Confirming..." : "Confirm Payment Received"}
                  </button>
                  {receiptActionError && <p className="mt-3 font-serif text-[12px] text-[#A15F5F]">{receiptActionError}</p>}
                </div>
              )}

              {selectedPayroll.status === "confirmed" && (
                <div className="mt-8 border-t border-[#DCD8D2] pt-7">
                  <p className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-[#8A8A84]">Payment confirmation</p>
                  <p className="mt-2 font-serif text-[13px] leading-6 text-[#607963]">Payment received and confirmed by you.</p>
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => printPayroll(selectedPayroll)}
                  className="inline-flex items-center gap-2 border border-[#6F8F72] px-4 py-2.5 font-sans text-[11px] text-[#6F8F72] transition-colors hover:bg-[#E8EFE5]"
                >
                  <PrinterIcon />
                  Print Receipt
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPayroll(null)}
                  className="border border-[#DCD8D2] px-4 py-2.5 font-sans text-[11px] text-[#5F655F] transition-colors hover:border-[#6F8F72] hover:text-[#6F8F72]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </section>
      </div>
    </main>
  );
}

/* ========================================================================= */
/* TEACHER PORTAL SIDEBAR                                                    */
/* ========================================================================= */

const teacherPortalNav = (locale: string) => [
  { label: "Home", href: `/${locale}/admin/teachers`, icon: Home },
  { label: "My Lessons", href: `/${locale}/admin/teachers/lessons`, icon: BookOpen },
  { label: "My Students", href: `/${locale}/admin/teachers/students`, icon: Users },
  { label: "Progress Reports", href: `/${locale}/admin/teachers/progress-reports`, icon: FileText },
  { label: "Availability", href: `/${locale}/admin/teachers/availability`, icon: CalendarDays },
  { label: "My Profile", href: `/${locale}/admin/teachers/profile`, icon: UserRound },
  { label: "Teacher Agreement", href: `/${locale}/admin/teachers/agreement`, icon: FileText },
  { label: "Payroll", href: `/${locale}/admin/teachers/payroll`, icon: Wallet },
];

function TeacherPortalSidebar({ locale, teacher }: { locale: string; teacher: Teacher | null }) {
  const name = teacher?.full_name || "Teacher";
  const initial = name.trim().charAt(0).toUpperCase() || "T";

  return (
    <aside className="hidden w-[250px] shrink-0 border-r border-[#E4DDD4] bg-[#F4F1EC] px-5 py-7 lg:flex lg:flex-col">
      <Link href={`/${locale}`} className="block">
        <p className="font-sans text-[14px] font-semibold tracking-[0.16em] text-[#5F7F63]">HAMKKE │ 함께</p>
        <p className="mt-1 font-serif text-[13px] text-[#6F8F72]">Teacher Portal</p>
      </Link>

      <nav className="mt-9 space-y-1.5">
        {teacherPortalNav(locale).map(({ label, href, icon: Icon }) => {
          const active = label === "Payroll";
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-sans text-[14px] transition ${
                active
                  ? "bg-[#E2EBDD] font-medium text-[#49614D]"
                  : "text-[#5F5C57] hover:bg-[#ECE8E2]"
              }`}
            >
              <Icon size={16} strokeWidth={1.6} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-[#DED7CF] pt-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DDE6D8] font-serif text-[14px] text-[#49614D]">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate font-sans text-[13px] font-medium text-[#393733]">{name}</p>
            <p className="mt-0.5 font-sans text-[11px] text-[#8A8780]">Teacher</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ========================================================================= */
/* PAYROLL ROW                                                               */
/* ========================================================================= */

function PayrollRow({
  label,
  count25,
  count50,
  rate25,
  rate50,
  lines,
  status,
}: {
  label: string;
  count25: number;
  count50: number;
  rate25: number;
  rate50: number;
  lines: PayrollLine[];
  status: PayableStatus;
}) {
  const amount = lines.length ? lines.filter(line => line.attendance_status === status).reduce((sum, line) => sum + Math.round(line.amount * 100), 0) / 100 : getAmount(count25, rate25) + getAmount(count50, rate50);

  return (
    <tr className="border-b border-[#E7E3DD]">
      <td className="px-3 py-4 font-serif text-[14px]">
        {label}
      </td>

      <td className="px-3 py-4 text-right font-serif text-[14px]">
        {count25}
      </td>

      <td className="px-3 py-4 text-right font-serif text-[13px] text-[#8A8780]">
        {lessonRateLabel(lines.filter(line => line.attendance_status === status), 25, rate25)}
      </td>

      <td className="px-3 py-4 text-right font-serif text-[14px]">
        {count50}
      </td>

      <td className="px-3 py-4 text-right font-serif text-[13px] text-[#8A8780]">
        {lessonRateLabel(lines.filter(line => line.attendance_status === status), 50, rate50)}
      </td>

      <td className="px-3 py-4 text-right font-serif text-[14px]">
        {formatCurrency(amount)}
      </td>
    </tr>
  );
}

/* ========================================================================= */
/* MODAL ROW                                                                 */
/* ========================================================================= */

function ModalPayrollRow({
  label,
  count25,
  count50,
  rate25,
  rate50,
  lines,
  status,
}: {
  label: string;
  count25: number;
  count50: number;
  rate25: number;
  rate50: number;
  lines: PayrollLine[];
  status: PayableStatus;
}) {
  const amount = lines.length ? lines.filter(line => line.attendance_status === status).reduce((sum, line) => sum + Math.round(line.amount * 100), 0) / 100 : getAmount(count25, rate25) + getAmount(count50, rate50);

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
        {formatCurrency(amount)}
      </td>
    </tr>
  );
}