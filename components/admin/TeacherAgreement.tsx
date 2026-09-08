"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

/* ========================================================================= */
/* TYPES                                                                     */
/* ========================================================================= */

type Teacher = {
  id: string;
  full_name: string | null;
  email: string | null;
  teacher_number?: string | null;
};

type TeacherContract = {
  id: string;
  teacher_id: string;
  contract_number: string;
  version: string;
  status: "draft" | "pending_acceptance" | "accepted" | "terminated";
  agreement_date: string | null;
  accepted_at: string | null;
  accepted_ip?: string | null;
  accepted_user_agent?: string | null;
  terminated_at: string | null;
  termination_reason: string | null;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
  sent_by: string | null;
};

type TeacherAgreementProps = {
  teacher: Teacher;
  viewer?: "owner" | "teacher";
};

/* ========================================================================= */
/* HAMKKE OWNER                                                             */
/* ========================================================================= */

const HAMKKE_REPRESENTATIVE = "Jesica Jumao-as Abejaron";

/* ========================================================================= */
/* AGREEMENT CONTENT                                                         */
/* ========================================================================= */

const TEACHER_AGREEMENT_SECTIONS = [
  {
    number: "01",
    title: "Agreement Overview",
    paragraphs: [
      "This Teacher Agreement sets out the terms and policies applicable to the teaching relationship between Hamkke and the teacher named above.",
      "The agreement describes the teacher’s responsibilities, teaching schedule, compensation, lesson policies, and general expectations when providing private English lessons through Hamkke.",
      "By accepting this agreement, the teacher confirms that they have had the opportunity to review these terms and agree to the policies and responsibilities described herein.",
    ],
  },

  {
    number: "02",
    title: "Teaching Role & Responsibilities",
    paragraphs: [
      "The teacher is responsible for conducting assigned English lessons in a professional, prepared, and respectful manner.",
    ],
    bullets: [
      "arrive on time and be ready to teach at the scheduled lesson time;",
      "conduct lessons according to the student’s assigned schedule and lesson duration;",
      "maintain accurate lesson records and attendance information;",
      "communicate relevant scheduling or lesson-related concerns as soon as reasonably possible; and",
      "provide a supportive learning environment that allows students to participate comfortably and meaningfully.",
    ],
    ending:
      "Teachers are encouraged to adapt their teaching approach to the student’s level, needs, and learning goals while maintaining the quality and standards expected by Hamkke.",
  },

  {
    number: "03",
    title: "Teaching Schedule",
    paragraphs: [
      "Teaching schedules are based on the teacher’s availability and the lesson schedules assigned through Hamkke.",
      "Once a lesson has been assigned and confirmed, the scheduled time should be treated as reserved for that student.",
      "Teachers are expected to maintain accurate availability information and to update their availability when their regular schedule changes.",
      "A teacher should not accept or arrange another commitment that conflicts with an already assigned Hamkke lesson.",
      "If a scheduling conflict or other issue arises, the teacher should communicate with Hamkke as soon as reasonably possible.",
    ],
  },

  {
    number: "04",
    title: "Compensation & Payroll",
    paragraphs: [
      "Teachers are compensated according to the duration and payable status of eligible lessons recorded by Hamkke.",
      "The initial standard teaching rate is:",
    ],
    bullets: [
      "25-minute lesson: ₱125",
      "50-minute lesson: ₱250",
    ],
    ending:
      "Teaching rates may increase based on the teacher’s accumulated qualifying teaching hours with Hamkke. Rate progression is based on actual completed teaching time and is not determined by calendar time or length of service alone.",
    additionalParagraphs: [
      "The standard compensation progression is:",
    ],
    additionalBullets: [
      "0–999 qualifying teaching hours: ₱125 per 25-minute lesson / ₱250 per 50-minute lesson",
      "1,000–1,999 qualifying teaching hours: ₱137.50 per 25-minute lesson / ₱275 per 50-minute lesson",
      "2,000–2,999 qualifying teaching hours: ₱150 per 25-minute lesson / ₱300 per 50-minute lesson",
      "3,000–3,999 qualifying teaching hours: ₱162.50 per 25-minute lesson / ₱325 per 50-minute lesson",
      "4,000 or more qualifying teaching hours: ₱175 per 25-minute lesson / ₱350 per 50-minute lesson",
    ],
    finalParagraphs: [
      "For compensation-rate progression, qualifying teaching hours consist only of actual teaching time from lessons recorded as completed. Student no-shows and late cancellations may be payable under Hamkke’s lesson policies, but they do not count toward the teacher’s accumulated qualifying teaching hours because no teaching time was actually completed.",
      "The applicable teaching rate for each payroll period is determined by the teacher’s accumulated qualifying teaching hours at the beginning of that payroll period. If the teacher reaches a new compensation threshold during a payroll period, the new rate will apply beginning with the next payroll period.",
      "Payroll is calculated twice each month according to Philippine Time (PHT). The first payroll period covers eligible lessons from the 1st through 11:59 PM PHT on the 15th, with payment scheduled for the 16th. The second payroll period covers eligible lessons from the 16th through 11:59 PM PHT on the final calendar day of the month, with payment scheduled for the 1st day of the following month.",
      "If a scheduled payment date falls on a day when the applicable payment service or financial institution is unavailable, payment will be made on the next available processing day.",
      "Only lessons that qualify as payable under the lesson policies are included in payroll. Payroll records may include the teacher’s lesson counts, applicable rates, gross payment amount, payroll status, payment date, payment method, and payment reference number.",
    ],
  },

  {
    number: "05",
    title: "Lesson Attendance & Payable Lessons",
    paragraphs: [
      "Teachers are responsible for accurately and promptly recording the attendance status of each assigned lesson. These records are used to determine payroll and should reflect what actually occurred during the scheduled lesson.",
      "The following lesson outcomes qualify as payable:",
    ],
    bullets: [
      "completed lessons;",
      "student no-shows; and",
      "student late cancellations.",
    ],
    ending:
      "A student no-show or late cancellation may therefore be included in payroll even though no actual teaching took place. However, these outcomes do not contribute to the teacher’s qualifying teaching hours for compensation-rate progression.",
    additionalParagraphs: [
      "The following lesson outcomes are not directly payable:",
    ],
    additionalBullets: [
      "student cancellations that are rescheduled or returned as lesson credit;",
      "lessons that do not take place because of an unexpected circumstance and are rescheduled or returned as lesson credit; and",
      "teacher cancellations.",
    ],
    finalParagraphs: [
      "Unexpected circumstances may include situations such as power outages, internet or connection problems, emergencies, or other circumstances that reasonably prevent a scheduled lesson from taking place. When an affected lesson is rescheduled or returned as lesson credit, the interrupted lesson itself is not included as a payable lesson. If the replacement or credited lesson is later actually taught and recorded as completed, that completed lesson is included in payroll according to the applicable payroll period and teaching rate.",
      "Attendance records should be entered accurately and promptly so that payroll can be calculated correctly.",
      "If an attendance record appears incorrect or a lesson requires clarification, the teacher should communicate the issue before the relevant payroll period is finalized.",
    ],
  },

  {
    number: "06",
    title: "Teacher Cancellations & Absences",
    paragraphs: [
      "Teachers are expected to honor assigned lesson schedules whenever reasonably possible.",
      "If a teacher needs to cancel or cannot attend a scheduled lesson, they should notify Hamkke as early as reasonably possible.",
      "A lesson cancelled by the teacher is not payable to that teacher unless Hamkke expressly determines otherwise based on the circumstances.",
      "When appropriate, Hamkke may arrange a replacement lesson or another reasonable solution for the affected student.",
      "In emergencies or unexpected circumstances, teachers should communicate as soon as reasonably possible. Hamkke understands that situations such as illness, power outages, internet or connection problems, and other emergencies may occasionally prevent a lesson from taking place as planned.",
      "Repeated or avoidable teacher cancellations may be reviewed with the teacher to ensure that assigned lesson schedules remain reliable for students.",
    ],
  },

  {
    number: "07",
    title: "Student Communication & Professional Conduct",
    paragraphs: [
      "Teachers are expected to communicate with students respectfully and professionally.",
      "Teachers should maintain appropriate boundaries in their communication with students and should avoid conduct that could make a student feel uncomfortable, pressured, or unsafe.",
      "Personal contact information should not be exchanged or used for purposes unrelated to the student’s lessons without appropriate permission.",
    ],
    importantTitle: "Unauthorized Private Lessons & Student Solicitation",
    importantParagraphs: [
      "Teachers must not independently solicit, recruit, invite, encourage, redirect, or otherwise attempt to move any Hamkke student to private lessons outside Hamkke without prior written approval from Hamkke.",
      "This requirement applies throughout the teacher’s active teaching relationship with Hamkke. Any post-termination obligations relating to Hamkke students will be subject to the terms of this agreement and applicable law.",
      "Unauthorized solicitation or recruitment of a Hamkke student for private lessons is considered a serious breach of this agreement and may result in immediate termination of the Teacher Agreement.",
      "Any suspected breach may be reviewed by Hamkke and addressed in accordance with this agreement and applicable law. Compensation already earned for payable lessons will be handled in accordance with applicable law.",
    ],
    ending:
      "Teachers should also avoid conduct that could create a conflict of interest or undermine the trust between Hamkke, its teachers, and its students.",
    finalParagraphs: [
      "The purpose of these expectations is to protect the trust of both students and teachers and to maintain a respectful and professional learning environment.",
    ],
  },

  {
    number: "08",
    title: "Confidentiality & Student Information",
    paragraphs: [
      "Teachers may have access to personal information about students, including names, contact information, schedules, lesson records, and other information shared during lessons.",
      "This information should be treated as confidential and used only for legitimate teaching and administrative purposes.",
      "Teachers should not share, publish, or disclose student information to other individuals without appropriate permission.",
      "Student conversations and lesson-related information should also be handled with reasonable discretion and respect for the student’s privacy.",
      "These confidentiality expectations continue to apply after a teacher stops teaching through Hamkke.",
    ],
  },

  {
    number: "09",
    title: "Teaching Materials & Intellectual Property",
    paragraphs: [
      "Teachers may use teaching materials provided or approved by Hamkke as part of their lessons.",
      "Hamkke materials should be used for their intended teaching purposes and should not be redistributed, sold, or shared outside Hamkke without permission.",
      "Teachers may use their own teaching materials and resources when appropriate, provided that they have the right to use those materials and that their use is consistent with Hamkke’s teaching standards.",
      "Teachers should respect the intellectual property of Hamkke, students, and third-party content creators.",
    ],
  },

  {
    number: "10",
    title: "Ending the Agreement",
    paragraphs: [
      "Either Hamkke or the teacher may choose to end the teaching relationship.",
      "When reasonably possible, the party ending the arrangement should provide advance notice so that existing students and scheduled lessons can be handled appropriately.",
      "Before the agreement ends, the teacher is expected to complete or properly hand over any assigned lessons, attendance records, and other relevant teaching responsibilities.",
      "Hamkke may end the agreement immediately in circumstances involving serious misconduct, repeated or significant unreliability, inappropriate treatment of students, unauthorized solicitation or recruitment of Hamkke students for private lessons, serious confidentiality concerns, or other conduct that significantly affects the trust or safety of the Hamkke learning environment.",
      "Unauthorized solicitation or recruitment of Hamkke students for private lessons is considered grounds for immediate termination.",
      "Any suspected breach may be reviewed by Hamkke and addressed in accordance with this agreement and applicable law. Compensation already earned for payable lessons will be handled in accordance with applicable law.",
      "Contract termination does not erase or remove the teacher’s previous teaching records, payment records, assignments, or other administrative history maintained by Hamkke.",
    ],
  },

  {
    number: "11",
    title: "Agreement & Acceptance",
    paragraphs: [
      "This agreement is provided to the teacher before or at the beginning of the teaching relationship so that the teacher may review the responsibilities, compensation structure, payroll schedule, lesson policies, and other terms applicable to their work with Hamkke.",
      "By signing or digitally accepting this agreement, the teacher confirms that they have read and understood the terms described herein and agree to follow the policies and responsibilities applicable to their teaching relationship with Hamkke.",
      "The teacher may ask questions or request clarification regarding any part of this agreement before accepting it.",
    ],
  },
];

/* ========================================================================= */
/* HELPERS                                                                   */
/* ========================================================================= */

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusLabel(status: TeacherContract["status"]) {
  switch (status) {
    case "draft":
      return "Draft";
    case "pending_acceptance":
      return "Pending Acceptance";
    case "accepted":
      return "Accepted";
    case "terminated":
      return "Terminated";
    default:
      return status;
  }
}

/* ========================================================================= */
/* COMPONENT                                                                 */
/* ========================================================================= */

export default function TeacherAgreement({
  teacher,
  viewer = "owner",
}: TeacherAgreementProps) {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = typeof params.locale === "string" ? params.locale : "en";

  const [contract, setContract] = useState<TeacherContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [acceptConfirmed, setAcceptConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isTeacherViewer = viewer === "teacher";
  const isOwnerViewer = viewer === "owner";

  /* ----------------------------------------------------------------------- */
  /* LOAD CONTRACT                                                           */
  /* ----------------------------------------------------------------------- */

  async function loadContract() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/teachers/${teacher.id}/contract`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load the teacher agreement."
        );
      }

      const loadedContract =
        data.contract ?? data.teacherContract ?? null;

      setContract(loadedContract);

      /*
       * Teachers should immediately see an agreement that has been
       * sent to them. Owners retain the existing collapsed behavior.
       */
      if (isTeacherViewer && loadedContract) {
        setShowAgreement(true);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load the teacher agreement."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContract();
  }, [teacher.id, isTeacherViewer]);

  /* ----------------------------------------------------------------------- */
  /* CONTRACT ACTIONS                                                        */
  /* ----------------------------------------------------------------------- */

  async function handleContractAction(
    action: "create" | "send" | "accept"
  ) {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/teachers/${teacher.id}/contract`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            contractId: contract?.id ?? null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update the teacher agreement."
        );
      }

      const updatedContract =
        data.contract ?? data.teacherContract ?? null;

      if (updatedContract) {
        setContract(updatedContract);
      }

      if (action === "create") {
        setSuccess("Teacher Agreement created as a draft.");
        setShowAgreement(true);
      }

      if (action === "send") {
        setSuccess("Teacher Agreement sent to the teacher.");
      }

      if (action === "accept") {
        setSuccess(
          "Your Teacher Agreement has been accepted successfully."
        );
        setAcceptConfirmed(false);
        setShowAgreement(true);

        if (isTeacherViewer) {
          router.replace(`/${locale}/admin/teachers`);
          router.refresh();
          return;
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update the teacher agreement."
      );
    } finally {
      setActionLoading(false);
    }
  }

  /* ----------------------------------------------------------------------- */
  /* PRINT                                                                   */
  /* ----------------------------------------------------------------------- */

  function handlePrintContract() {
    /*
     * IMPORTANT:
     *
     * The contract is always mounted in the DOM, even when collapsed.
     * This means printing does NOT need to change showAgreement.
     *
     * The print stylesheet overrides the collapsed visual state and
     * prints the complete contract immediately.
     *
     * After printing, the page remains in whatever state it was in
     * before the print button was clicked.
     */
    window.print();
  }

  /* ----------------------------------------------------------------------- */
  /* LOADING                                                                 */
  /* ----------------------------------------------------------------------- */

  if (loading) {
    return (
      <section className="border-b border-[#DCD8D2] py-7 sm:py-8">
        <div>
          <h2 className="font-serif text-[27px] leading-tight text-[#292929]">
            Teacher Agreement
          </h2>

          <p className="mt-2 font-sans text-[14px] leading-6 text-[#777A75]">
            Loading agreement details...
          </p>
        </div>
      </section>
    );
  }

  /* ----------------------------------------------------------------------- */
  /* RENDER                                                                  */
  /* ----------------------------------------------------------------------- */

  return (
    <>
      <section className="teacher-agreement-container border-b border-[#DCD8D2] py-7 sm:py-8">
        {/* Main Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Left */}
          <div className="max-w-[760px]">
            <h2 className="font-serif text-[27px] leading-tight text-[#292929]">
              Teacher Agreement
            </h2>

            <p className="mt-2 font-sans text-[14px] leading-6 text-[#777A75]">
              {isTeacherViewer
                ? "Review the agreement covering your teaching responsibilities, compensation, lesson policies, and professional expectations with Hamkke."
                : "The agreement covering this teacher’s teaching responsibilities, compensation, lesson policies, and professional expectations with Hamkke."}
            </p>
          </div>

          {/* Right */}
          {contract && (
            <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
              {/* Status */}
              <span
                className={`font-sans text-[12px] font-medium ${
                  contract.status === "accepted"
                    ? "text-[#55745A]"
                    : contract.status === "terminated"
                      ? "text-[#8A5149]"
                      : contract.status === "pending_acceptance"
                        ? "text-[#8A7045]"
                        : "text-[#777A75]"
                }`}
              >
                {getStatusLabel(contract.status)}
              </span>

              {/* Accepted — Compact Print Action */}
              {contract.status === "accepted" ? (
                <button
                  type="button"
                  onClick={handlePrintContract}
                  className="no-print inline-flex w-fit items-center justify-center rounded-full border border-[#6F8F72] bg-[#6F8F72] px-5 py-2.5 font-sans text-[13px] font-medium text-white transition-colors hover:border-[#5F7E63] hover:bg-[#5F7E63]"
                >
                  Print Contract
                </button>
              ) : (
                <>
                  {/* View Contract */}
                  <button
                    type="button"
                    onClick={() =>
                      setShowAgreement((current) => !current)
                    }
                    className="no-print inline-flex w-fit items-center border-b border-[#6F8F72] pb-1 font-sans text-[13px] font-medium text-[#6F8F72] transition-colors hover:border-[#526B55] hover:text-[#526B55]"
                  >
                    {showAgreement
                      ? "Hide Contract ↑"
                      : "View Contract →"}
                  </button>

                  {/* Send — Owner Only */}
                  {isOwnerViewer &&
                    (contract.status === "draft" ||
                      contract.status === "pending_acceptance") && (
                      <button
                        type="button"
                        onClick={() => handleContractAction("send")}
                        disabled={actionLoading}
                        className="no-print font-sans text-[12px] text-[#777A75] transition-colors hover:text-[#6F8F72] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {actionLoading
                          ? "Sending..."
                          : contract.status === "draft"
                            ? "Send to Teacher →"
                            : "Send Again →"}
                      </button>
                    )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="no-print mt-5 border border-[#E2C7C3] bg-[#FAF0EE] px-4 py-3 font-sans text-[13px] leading-5 text-[#8A5149]">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="no-print mt-5 border border-[#C9D8CB] bg-[#F1F6F1] px-4 py-3 font-sans text-[13px] leading-5 text-[#55745A]">
            {success}
          </div>
        )}

        {/* No Contract */}
        {!contract && (
          <div className="mt-7 flex flex-col gap-5 border-t border-[#E5E2DD] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-serif text-[19px] text-[#292929]">
                {isTeacherViewer
                  ? "Your Teacher Agreement is not available yet"
                  : "No Teacher Agreement yet"}
              </p>

              <p className="mt-2 max-w-[700px] font-sans text-[14px] leading-6 text-[#777A75]">
                {isTeacherViewer ? (
                  "Hamkke has not sent a Teacher Agreement to your account yet. Please contact Hamkke if you believe your agreement should already be available."
                ) : (
                  <>
                    Create a Teacher Agreement for{" "}
                    <span className="font-medium text-[#4D514D]">
                      {teacher.full_name || "this teacher"}
                    </span>{" "}
                    before sending it for review and acceptance.
                  </>
                )}
              </p>
            </div>

            {/* Create — Owner Only */}
            {isOwnerViewer && (
              <button
                type="button"
                onClick={() => handleContractAction("create")}
                disabled={actionLoading}
                className="no-print inline-flex w-fit shrink-0 items-center gap-2 border border-[#6F8F72] bg-[#6F8F72] px-5 py-2.5 font-sans text-[13px] font-medium text-white transition hover:bg-[#5F7E63] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading ? "Creating..." : "+ Create Agreement"}
              </button>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* CONTRACT                                                         */}
        {/* ================================================================= */}

        {contract && (
          <div
            className={`teacher-contract-wrapper ${
              showAgreement
                ? "teacher-contract-expanded"
                : "teacher-contract-collapsed"
            }`}
          >
            {/* Printable Contract */}
            <div
              id="teacher-contract-print"
              className="teacher-contract-print-area mt-6 overflow-hidden border border-[#CFCFCB] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
            >
              {/* Contract Metadata */}
              <div className="no-print grid grid-cols-1 divide-y divide-[#E1E0DC] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
                <div className="px-5 py-4">
                  <p className="font-sans text-[8.5px] font-medium uppercase tracking-[0.12em] text-[#666]">
                    Contract Number
                  </p>

                  <p className="mt-1.5 font-serif text-[16px] leading-[1.3] text-[#222]">
                    {contract.contract_number}
                  </p>
                </div>

                <div className="px-5 py-4">
                  <p className="font-sans text-[8.5px] font-medium uppercase tracking-[0.12em] text-[#666]">
                    Version
                  </p>

                  <p className="mt-1.5 font-serif text-[16px] leading-[1.3] text-[#222]">
                    {contract.version}
                  </p>
                </div>

                <div className="px-5 py-4">
                  <p className="font-sans text-[8.5px] font-medium uppercase tracking-[0.12em] text-[#666]">
                    Agreement Date
                  </p>

                  <p className="mt-1.5 font-serif text-[16px] leading-[1.3] text-[#222]">
                    {formatDate(contract.agreement_date)}
                  </p>
                </div>

                <div className="px-5 py-4">
                  <p className="font-sans text-[8.5px] font-medium uppercase tracking-[0.12em] text-[#666]">
                    Status
                  </p>

                  <p className="mt-1.5 font-serif text-[16px] leading-[1.3] text-[#222]">
                    {getStatusLabel(contract.status)}
                  </p>
                </div>
              </div>

              {/* Status Details */}
              <div className="no-print border-t border-[#E1E0DC] px-5 py-4 sm:px-6">
                {contract.status === "draft" && (
                  <p className="font-sans text-[12px] text-[#777A75]">
                    Teacher Agreement created as a draft.
                  </p>
                )}

                {contract.status === "pending_acceptance" && (
                  <div>
                    <p className="font-sans text-[12px] text-[#55745A]">
                      {isTeacherViewer
                        ? "This agreement is ready for your review and acceptance."
                        : "Teacher Agreement sent to the teacher."}
                    </p>

                    {contract.sent_at && (
                      <p className="mt-1 font-sans text-[11px] text-[#8A8B87]">
                        {formatDateTime(contract.sent_at)}
                      </p>
                    )}
                  </div>
                )}

                {contract.status === "accepted" && (
                  <div>
                    <p className="font-sans text-[12px] font-medium text-[#55745A]">
                      Digitally Accepted
                    </p>

                    {contract.accepted_at && (
                      <p className="mt-1 font-sans text-[11px] text-[#8A8B87]">
                        {formatDateTime(contract.accepted_at)}
                      </p>
                    )}
                  </div>
                )}

                {contract.status === "terminated" && (
                  <div>
                    <p className="font-sans text-[12px] font-medium text-[#8A5149]">
                      Agreement Terminated
                    </p>

                    {contract.terminated_at && (
                      <p className="mt-1 font-sans text-[11px] text-[#8A8B87]">
                        {formatDateTime(contract.terminated_at)}
                      </p>
                    )}

                    {contract.termination_reason && (
                      <p className="mt-3 max-w-[760px] font-sans text-[12px] leading-5 text-[#777A75]">
                        <span className="font-medium text-[#555854]">
                          Reason:
                        </span>{" "}
                        {contract.termination_reason}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Agreement Review */}
              <div>
                <div className="teacher-contract-document px-[32px] py-[36px] sm:px-[44px] sm:py-[40px] lg:px-[52px] lg:py-[48px]">
                  {/* Header */}
                  <header className="contract-header border-b border-[#CFCFCB] pb-6">
                    <div className="flex items-start justify-between gap-8">
                      <div>
                        <div className="font-serif text-[25px] leading-none tracking-[-0.02em] text-[#6F8F72]">
                          Hamkke │ 함께
                        </div>

                        <p className="mt-2 font-sans text-[9px] uppercase tracking-[0.16em] text-[#6F8F72]">
                          From Small Talk to Big Ideas
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-[#666]">
                          Teacher Agreement
                        </p>

                        <p className="mt-1 font-serif text-[17px] leading-tight text-[#222]">
                          {contract.contract_number}
                        </p>

                        <p className="mt-1 font-sans text-[9px] text-[#777]">
                          Version {contract.version}
                        </p>
                      </div>
                    </div>
                  </header>

                  {/* Agreement Information */}
                  <section className="contract-summary border-b border-[#CFCFCB] py-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3">
                      <div className="border-b border-[#D5D5D1] pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-6">
                        <p className="font-sans text-[8.5px] font-medium uppercase tracking-[0.12em] text-[#666]">
                          Teacher
                        </p>

                        <p className="mt-1.5 font-serif text-[16px] leading-[1.3] text-[#222]">
                          {teacher.full_name || "—"}
                        </p>
                      </div>

                      <div className="border-b border-[#D5D5D1] py-4 sm:border-b-0 sm:border-r sm:px-6 sm:py-0">
                        <p className="font-sans text-[8.5px] font-medium uppercase tracking-[0.12em] text-[#666]">
                          Teacher No.
                        </p>

                        <p className="mt-1.5 font-serif text-[16px] leading-[1.3] text-[#222]">
                          {teacher.teacher_number
                            ? `T-${teacher.teacher_number.replace(
                                /^T-/i,
                                ""
                              )}`
                            : "—"}
                        </p>
                      </div>

                      <div className="pt-4 sm:pt-0 sm:pl-6">
                        <p className="font-sans text-[8.5px] font-medium uppercase tracking-[0.12em] text-[#666]">
                          Agreement Date
                        </p>

                        <p className="mt-1.5 font-serif text-[16px] leading-[1.3] text-[#222]">
                          {formatDate(contract.agreement_date)}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Agreement Sections */}
                  <div>
                    {TEACHER_AGREEMENT_SECTIONS.map((section) => (
                      <section
                        key={section.number}
                        className="teacher-contract-section border-b border-[#CFCFCB] py-6"
                      >
                        <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-3">
                          <div className="pt-[3px] font-sans text-[9px] font-medium tracking-[0.08em] text-[#6F8F72]">
                            {section.number}
                          </div>

                          <div className="min-w-0">
                            <h4 className="font-serif text-[21px] font-normal leading-[1.2] tracking-[-0.015em] text-[#222]">
                              {section.title}
                            </h4>

                            <div className="mt-3.5 space-y-3 font-sans text-[12.5px] leading-[1.65] text-[#444]">
                              {section.paragraphs?.map((paragraph, index) => (
                                <p key={`p-${index}`}>{paragraph}</p>
                              ))}

                              {section.bullets && (
                                <ul className="list-disc space-y-2 pl-5">
                                  {section.bullets.map((bullet, index) => (
                                    <li key={`b-${index}`}>{bullet}</li>
                                  ))}
                                </ul>
                              )}

                              {section.ending && <p>{section.ending}</p>}

                              {section.additionalParagraphs?.map(
                                (paragraph, index) => (
                                  <p key={`ap-${index}`}>{paragraph}</p>
                                )
                              )}

                              {section.additionalBullets && (
                                <ul className="list-disc space-y-2 pl-5">
                                  {section.additionalBullets.map(
                                    (bullet, index) => (
                                      <li key={`ab-${index}`}>{bullet}</li>
                                    )
                                  )}
                                </ul>
                              )}

                              {section.importantTitle && (
                                <div className="my-6 border-l-2 border-[#6F8F72] bg-[#F4F6F2] px-5 py-5">
                                  <p className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-[#6F8F72]">
                                    Important Policy
                                  </p>

                                  <p className="mt-2 font-serif text-[17px] leading-[1.3] text-[#292929]">
                                    {section.importantTitle}
                                  </p>

                                  <div className="mt-3 space-y-3 font-sans text-[12.5px] leading-[1.65] text-[#4F554F]">
                                    {section.importantParagraphs?.map(
                                      (paragraph, index) => (
                                        <p
                                          key={`ip-${index}`}
                                          className={
                                            index ===
                                            section.importantParagraphs!
                                              .length -
                                              1
                                              ? "font-medium text-[#3F4941]"
                                              : ""
                                          }
                                        >
                                          {paragraph}
                                        </p>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                              {section.finalParagraphs?.map(
                                (paragraph, index) => (
                                  <p key={`fp-${index}`}>{paragraph}</p>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </section>
                    ))}
                  </div>

                  {/* Acceptance */}
                  <section className="teacher-contract-acceptance py-7">
                    <div className="border-b border-[#CFCFCB] border-t border-[#CFCFCB] py-7">
                      <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-3">
                        <div />

                        <div>
                          <p className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-[#6F8F72]">
                            Teacher Acceptance
                          </p>

                          <p className="mt-3.5 max-w-[760px] font-sans text-[12.5px] leading-[1.65] text-[#444]">
                            By accepting this agreement, the teacher confirms
                            their understanding and acceptance of the terms and
                            policies described above.
                          </p>

                          <div className="mt-7 grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2">
                            <div>
                              <p className="font-sans text-[8.5px] font-medium uppercase tracking-[0.12em] text-[#666]">
                                Teacher
                              </p>

                              <div className="mt-5 border-b border-[#BDBAB4] pb-2 font-sans text-[12.5px] text-[#444743]">
                                {teacher.full_name || ""}
                              </div>
                            </div>

                            <div>
                              <p className="font-sans text-[8.5px] font-medium uppercase tracking-[0.12em] text-[#666]">
                                Teacher No.
                              </p>

                              <div className="mt-5 border-b border-[#BDBAB4] pb-2 font-sans text-[12.5px] text-[#444743]">
                                {teacher.teacher_number
                                  ? `T-${teacher.teacher_number.replace(
                                      /^T-/i,
                                      ""
                                    )}`
                                  : ""}
                              </div>
                            </div>

                            <div>
                              <p className="font-sans text-[8.5px] font-medium uppercase tracking-[0.12em] text-[#666]">
                                Signature / Digital Acceptance
                              </p>

                              <div className="mt-5 border-b border-[#BDBAB4] pb-2 font-sans text-[12.5px] text-[#444743]">
                                {contract.accepted_at
                                  ? "Digitally Accepted"
                                  : ""}
                              </div>
                            </div>

                            <div>
                              <p className="font-sans text-[8.5px] font-medium uppercase tracking-[0.12em] text-[#666]">
                                Date
                              </p>

                              <div className="mt-5 border-b border-[#BDBAB4] pb-2 font-sans text-[12.5px] text-[#444743]">
                                {contract.accepted_at
                                  ? formatDateTime(contract.accepted_at)
                                  : ""}
                              </div>
                            </div>

                            {/* Hamkke Representative */}
                            <div>
                              <p className="font-sans text-[8.5px] font-medium uppercase tracking-[0.12em] text-[#666]">
                                Hamkke Representative
                              </p>

                              <div className="mt-5 border-b border-[#BDBAB4] pb-2 font-sans text-[12.5px] text-[#444743]">
                                {HAMKKE_REPRESENTATIVE}
                              </div>
                            </div>

                            {/* Representative Date */}
                            <div>
                              <p className="font-sans text-[8.5px] font-medium uppercase tracking-[0.12em] text-[#666]">
                                Date
                              </p>

                              <div className="mt-5 border-b border-[#BDBAB4] pb-2 font-sans text-[12.5px] text-[#444743]">
                                {contract.accepted_at
                                  ? formatDateTime(contract.accepted_at)
                                  : ""}
                              </div>
                            </div>
                          </div>

                          {/* ------------------------------------------------- */}
                          {/* TEACHER ACCEPTANCE CONTROL                       */}
                          {/* ------------------------------------------------- */}

                          {isTeacherViewer &&
                            contract.status === "pending_acceptance" && (
                              <div className="no-print mt-8 border-t border-[#E1E0DC] pt-7">
                                <label className="flex cursor-pointer items-start gap-3">
                                  <input
                                    type="checkbox"
                                    checked={acceptConfirmed}
                                    onChange={(event) =>
                                      setAcceptConfirmed(
                                        event.target.checked
                                      )
                                    }
                                    disabled={actionLoading}
                                    className="mt-[3px] h-4 w-4 shrink-0 accent-[#6F8F72]"
                                  />

                                  <span className="font-sans text-[13px] leading-6 text-[#4D514D]">
                                    I have read and understood this Teacher
                                    Agreement and agree to the terms and
                                    policies described above.
                                  </span>
                                </label>

                                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <p className="max-w-[600px] font-sans text-[11px] leading-5 text-[#8A8B87]">
                                    Your acceptance will be recorded under your
                                    authenticated teacher account together with
                                    the date and time of acceptance.
                                  </p>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleContractAction("accept")
                                    }
                                    disabled={
                                      !acceptConfirmed || actionLoading
                                    }
                                    className="inline-flex w-fit shrink-0 items-center justify-center border border-[#6F8F72] bg-[#6F8F72] px-5 py-2.5 font-sans text-[13px] font-medium text-white transition hover:bg-[#5F7E63] disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    {actionLoading
                                      ? "Accepting..."
                                      : "Accept Agreement"}
                                  </button>
                                </div>
                              </div>
                            )}

                          {/* ------------------------------------------------- */}
                          {/* ACCEPTED NOTICE                                  */}
                          {/* ------------------------------------------------- */}

                          {isTeacherViewer &&
                            contract.status === "accepted" && (
                              <div className="no-print mt-8 border-t border-[#E1E0DC] pt-6">
                                <div className="border border-[#C9D8CB] bg-[#F1F6F1] px-5 py-4">
                                  <p className="font-sans text-[12px] font-medium text-[#55745A]">
                                    Agreement accepted
                                  </p>

                                  {contract.accepted_at && (
                                    <p className="mt-1.5 font-sans text-[11px] leading-5 text-[#777A75]">
                                      You accepted this agreement on{" "}
                                      {formatDateTime(contract.accepted_at)}.
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Footer */}
                  <footer className="pt-5 text-center">
                    <div className="font-serif text-[13px] text-[#444]">
                      Hamkke │ 함께
                    </div>

                    <p className="mt-1 font-sans text-[8px] uppercase tracking-[0.14em] text-[#444]">
                      From Small Talk to Big Ideas
                    </p>
                  </footer>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* =================================================================== */}
      {/* PRINT STYLES                                                        */}
      {/* =================================================================== */}

      <style jsx global>{`
        /* ----------------------------------------------------------------- */
        /* COLLAPSED CONTRACT                                                */
        /* ----------------------------------------------------------------- */

        .teacher-contract-collapsed {
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          pointer-events: none;
          margin: 0;
        }

        .teacher-contract-expanded {
          max-height: none;
          overflow: visible;
          opacity: 1;
        }

        /* ----------------------------------------------------------------- */
        /* PRINT                                                              */
        /* ----------------------------------------------------------------- */

        @media print {
          @page {
            size: A4;
            margin: 15mm 17mm 16mm;
          }

          html,
          body {
            width: 100%;
            min-height: 297mm;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body * {
            visibility: hidden !important;
          }

          /*
           * Make the contract visible even when the page is collapsed.
           */
          .teacher-contract-wrapper {
            max-height: none !important;
            overflow: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
          }

          .teacher-contract-print-area,
          .teacher-contract-print-area * {
            visibility: visible !important;
          }

          .teacher-contract-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            box-shadow: none !important;
            background: #ffffff !important;
            overflow: visible !important;
          }

          .teacher-contract-print-area .no-print {
            display: none !important;
          }

          .teacher-contract-document {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          .contract-header {
            break-after: avoid;
            page-break-after: avoid;
          }

          .contract-summary {
            break-after: avoid;
            page-break-after: avoid;
          }

          .teacher-contract-section {
  break-inside: auto;
  page-break-inside: auto;
}

.teacher-contract-section > div {
  break-inside: auto;
  page-break-inside: auto;
}

.teacher-contract-section h4 {
  break-after: avoid;
  page-break-after: avoid;
}

.teacher-contract-section p,
.teacher-contract-section li {
  break-inside: avoid;
  page-break-inside: avoid;
}

.teacher-contract-acceptance {
  break-inside: avoid;
  page-break-inside: avoid;
}

          .teacher-contract-print-area h2,
          .teacher-contract-print-area h3,
          .teacher-contract-print-area h4 {
            break-after: avoid;
            page-break-after: avoid;
          }

          .teacher-contract-print-area p,
          .teacher-contract-print-area li {
            orphans: 3;
            widows: 3;
          }

          .teacher-contract-print-area ul {
  break-inside: auto;
  page-break-inside: auto;
}

          .teacher-contract-print-area {
            color: #222222 !important;
          }

          .teacher-contract-print-area * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          a {
            color: inherit !important;
            text-decoration: none !important;
          }
        }
      `}</style>
    </>
  );
}