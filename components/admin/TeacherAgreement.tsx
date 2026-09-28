"use client";

import { useEffect, useState, useId, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

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
  agreement_content: string | null;
  agreement_content_hash: string | null;
  framework_version: string | null;
  policy_version: string | null;
  teacher_full_name: string | null;
  teacher_number_snapshot: string | null;
  snapshot_valid?: boolean;
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

// Parse only for presentation. The database snapshot and hash are never rewritten.
type SnapshotSection = { number: string; title: string; lines: string[] };
function splitAgreementSections(content: string) {
  const introduction: string[] = [];
  const sections: SnapshotSection[] = [];
  let current: SnapshotSection | null = null;
  let fenced = false;
  for (const line of content.replace(/\r\n/g, "\n").split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    const heading = !fenced ? line.match(/^(?:#{1,2}\s+)?(?:\*\*)?(\d+)\.\s+([A-Z][^\n]+?)(?:\*\*)?\s*$/) : null;
    // Sequential section numbers avoid confusing rates, subclauses and other lists with headings.
    if (heading && Number(heading[1]) === sections.length + 1 && heading[2].length < 160) {
      current = { number: heading[1].padStart(2, "0"), title: heading[2], lines: [] };
      sections.push(current);
    } else if (current) current.lines.push(line);
    else introduction.push(line);
  }
  return { introduction: introduction.join("\n"), sections };
}

function SnapshotMarkdown({ content }: { content: string }) {
  return (
                          <ReactMarkdown
                            components={{
                              h1: ({ children }) => (
                                <h1 className="mb-3 mt-0 font-serif text-[22px] font-medium leading-tight text-[#182018]">
                                  {children}
                                </h1>
                              ),

                              h2: ({ children }) => (
                                <h2 className="mb-3 mt-8 border-b border-[#d8d6cf] pb-2 font-serif text-[18px] font-medium leading-tight text-[#182018] first:mt-0">
                                  {children}
                                </h2>
                              ),

                              h3: ({ children }) => (
                                <h3 className="mb-2 mt-6 font-serif text-[15px] font-semibold leading-6 text-[#182018]">
                                  {children}
                                </h3>
                              ),

                              p: ({ children }) => (
                                <p className="mb-4 leading-7">
                                  {children}
                                </p>
                              ),

                              ul: ({ children }) => (
                                <ul className="mb-5 ml-6 list-disc space-y-1.5">
                                  {children}
                                </ul>
                              ),

                              ol: ({ children }) => (
                                <ol className="mb-5 ml-6 list-decimal space-y-1.5">
                                  {children}
                                </ol>
                              ),

                              li: ({ children }) => (
                                <li className="pl-1 leading-7">
                                  {children}
                                </li>
                              ),

                              strong: ({ children }) => (
                                <strong className="font-semibold text-[#182018]">
                                  {children}
                                </strong>
                              ),

                              em: ({ children }) => (
                                <em>{children}</em>
                              ),

                              hr: () => (
                                <hr className="my-7 border-0 border-t border-[#d8d6cf]" />
                              ),

                              blockquote: ({ children }) => (
                                <blockquote className="my-5 border-l-2 border-[#7d9075] pl-4 text-[#50584e]">
                                  {children}
                                </blockquote>
                              ),
                            }}
                          >
                            {content}
                          </ReactMarkdown>
  );
}

// These blocks change presentation only. All supplied sentences remain visible.
function AgreementBody({ content }: { content: string }) {
  if (/^\s*(?:#{1,6}\s|[-*+]\s|```|~~~|\|)/m.test(content)) return <SnapshotMarkdown content={content} />;
  const blocks = content.split(/\n[ \t]*\n+/);
  const rateHeader = "Qualifying Teaching Hours 25-Minute Lesson 50-Minute Lesson";
  return <div className="space-y-4">{blocks.map((block, index) => {
    if (block.trim() === rateHeader) {
      const rows = (blocks[index + 1] ?? "").trim().split("\n").map(line => line.match(/^(.+?hours)\s+(₱[\d,.]+)\s+(₱[\d,.]+)$/));
      if (rows.length && rows.every(Boolean)) return (
        <div key={index} className="my-6 overflow-x-auto border-y border-[#CFCFCB]">
          <table className="w-full min-w-[380px] border-collapse text-left text-[13px]">
            <thead className="bg-[#F5F6F2] text-[#3E5745]"><tr>
              {["Qualifying Teaching Hours", "25-Minute Lesson", "50-Minute Lesson"].map(title => <th key={title} scope="col" className="px-4 py-3 font-semibold">{title}</th>)}
            </tr></thead>
            <tbody>{rows.map((row, i) => <tr key={i} className="border-t border-[#E1E5DE] even:bg-[#FAFBF8]">
              {row!.slice(1).map((cell, j) => <td key={j} className="px-4 py-3 tabular-nums">{cell}</td>)}
            </tr>)}</tbody>
          </table>
        </div>
      );
    }
    if (index > 0 && blocks[index - 1].trim() === rateHeader && block.trim().split("\n").every(line => /^(.+?hours)\s+(₱[\d,.]+)\s+(₱[\d,.]+)$/.test(line))) return null;
    // Plain-text semicolon lists in the released snapshot have no Markdown bullets.
    if (index > 0 && blocks[index - 1].trim().endsWith(":") && (block.match(/;\n/g)?.length ?? 0) >= 3) {
      const parts = block.split(/(?<=;)\n/);
      return <ul key={index} className="list-disc space-y-2 pl-5 marker:text-[#7A947A]">{parts.map((part, i) => <li key={i}><SnapshotMarkdown content={part} /></li>)}</ul>;
    }
    const normalized = block.replace(/\s+/g, " ").trim();
    const important = normalized.startsWith("A lesson being payable does not necessarily") || normalized.startsWith("For purposes of rate progression,") || normalized.startsWith("When the Teacher reaches a qualifying teaching-hour threshold,");
    return <div key={index} className={important ? "border-l-2 border-[#9BAF98] bg-[#FAFBF8] px-4 py-3" : undefined}><SnapshotMarkdown content={block} /></div>;
  })}</div>;
}

function AgreementSnapshot({ content }: { content: string }) {
  const { introduction, sections } = splitAgreementSections(content);
  const prefix = useId().replace(/:/g, "");
  return <div className="agreement-snapshot-body break-words font-sans text-[12.5px] leading-[1.65] text-[#444]">
    {introduction.trim() && <div className="py-4"><SnapshotMarkdown content={introduction} /></div>}
    {sections.map((section) => (
      <section id={`${prefix}-section-${section.number}`} key={section.number} className="teacher-contract-section scroll-mt-24 border-b border-[#CFCFCB] py-6">
        <div className="grid grid-cols-[24px_minmax(0,1fr)] gap-3 sm:grid-cols-[32px_minmax(0,1fr)] sm:gap-4">
          <div className="pt-[3px] font-sans text-[10px] font-medium tracking-[0.08em] text-[#6F8F72]">{section.number}</div>
          <div className="min-w-0">
            <h4 className="font-serif text-[23px] font-normal leading-[1.25] tracking-[-0.015em] text-[#222] [break-after:avoid]">{section.title}</h4>
            <div className="mt-5"><AgreementBody content={section.lines.join("\n")} /></div>
          </div>
        </div>
      </section>
    ))}
  </div>;
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return "Unavailable";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";
  return date.toLocaleString("en-US", {
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
  const [contracts, setContracts] = useState<TeacherContract[]>([]);
  const [currentVersion, setCurrentVersion] = useState("");
  const [currentAcceptedId, setCurrentAcceptedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const agreementDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = agreementDialog.current;
    if (!showAgreement || loading || !dialog) return;
    const previousOverflow = document.body.style.overflow;
    if (!dialog.open) dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, [showAgreement, loading, contract?.id]);
  const [acceptConfirmed, setAcceptConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isTeacherViewer = viewer === "teacher";
  const isOwnerViewer = viewer === "owner";

  /* ----------------------------------------------------------------------- */
  /* LOAD CONTRACT                                                           */
  /* ----------------------------------------------------------------------- */

  async function loadContract(preferredId?: string) {
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

      const history: TeacherContract[] = data.contracts ?? (data.contract ? [data.contract] : []);
      const loadedContract = history.find((item) => item.id === preferredId) ?? history[0] ?? null;
      setContracts(history);
      setCurrentVersion(data.currentVersion ?? "");
      setCurrentAcceptedId(data.currentAcceptedId ?? null);
      setContract(loadedContract);
      setAcceptConfirmed(false);

      /*
       * Teachers should immediately see an agreement that has been
       * sent to them. Owners retain the existing collapsed behavior.
       */

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
    action: "create" | "send" | "accept" | "save_name"
  ) {
    if (action === "accept" && (!acceptConfirmed || !canAccept)) return;
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
            revision: contract?.updated_at,
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
        await loadContract(updatedContract.id);
      }

      if (action === "save_name") setSuccess("Profile full name copied to this draft. Review it before sending.");
      if (action === "create") {
        setSuccess(data.alreadyExists ? "This version already exists." : "Teacher Agreement created as a draft.");
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

  const savedName = contract?.teacher_full_name?.trim();
  const agreementName = savedName || null;
  const savedTeacherNumber = contract?.teacher_number_snapshot;
  const legacyTemplate = contract?.version === "1.0" && !contract.agreement_content;
  const canAccept = Boolean(contract?.snapshot_valid && savedName && contract?.sent_at);
  const canCreate = Boolean(currentVersion && !contracts.some((item) => item.version === currentVersion));

  /* ----------------------------------------------------------------------- */
  /* PRINT                                                                   */
  /* ----------------------------------------------------------------------- */

  function handlePrintContract() {
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
                ? "View your current agreement and previous versions."
                : "The agreement covering this teacher’s teaching responsibilities, compensation, lesson policies, and professional expectations with Hamkke."}
            </p>
          </div>


        </div>

        <div className="no-print mt-6 space-y-4">
          {isOwnerViewer && contract?.status === "draft" && !contract.sent_at && (
            <div className="rounded-2xl border border-[#D8DFD4] bg-[#F2F5EE] p-5">
              <p className="text-sm font-semibold">Full name on this draft</p>
              <p className="mt-2 font-serif text-xl">{contract.teacher_full_name || "Not set"}</p>
              <p className="mt-2 text-sm leading-6 text-[#607568]">The teacher manages their full name in My Profile. Copy that name here to refresh this unsent draft. Sent and accepted agreements stay unchanged.</p>
              <button type="button" disabled={actionLoading} onClick={() => handleContractAction("save_name")}
                className="mt-4 rounded-full bg-[#6F8F72] px-5 py-2 text-sm text-white disabled:opacity-40">Use profile full name</button>
            </div>
          )}
          {isOwnerViewer && canCreate && (
            <button type="button" disabled={actionLoading} onClick={() => handleContractAction("create")}
              className="rounded-full bg-[#6F8F72] px-5 py-2.5 text-sm text-white disabled:opacity-40">
              {actionLoading ? "Creating..." : `Create Agreement v${currentVersion}`}
            </button>
          )}
          {contracts.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-[#DCD8D2]">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Teacher agreement versions</caption>
                <thead className="bg-[#EEF2EA]"><tr><th className="p-3">Version</th><th className="p-3">Status</th><th className="p-3">Date</th><th className="p-3">Agreement</th></tr></thead>
                <tbody>{contracts.map((item) => (
                  <tr key={item.id} className={item.id === contract?.id ? "border-t border-[#DCD8D2] bg-[#F1F6F1]" : "border-t border-[#DCD8D2]"}>
                    <td className="p-3">v{item.version}</td>
                    <td className="p-3">{item.id === currentAcceptedId ? "Current accepted" : item.status === "accepted" ? "Accepted · History" : getStatusLabel(item.status)}</td>
                    <td className="p-3">{item.accepted_at ? `Accepted ${formatDateTime(item.accepted_at)}` : item.sent_at ? `Sent ${formatDateTime(item.sent_at)}` : `Created ${formatDateTime(item.created_at)}`}</td>
                    <td className="p-3"><button type="button" disabled={actionLoading} aria-pressed={item.id === contract?.id}
                      onClick={() => { setContract(item); setShowAgreement(true); setAcceptConfirmed(false); setError(""); setSuccess(""); }}
                      className="rounded-full border border-[#CBD6C8] bg-[#F3F6EF] px-5 py-2 font-medium text-[#36513D] hover:bg-[#E7EDDF] disabled:opacity-40">View</button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          {currentAcceptedId && contracts.some((item) => item.status === "pending_acceptance") && (
            <p className="text-sm text-[#666]">A proposed agreement does not replace your current accepted agreement until you accept it.</p>
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


          </div>
        )}

        {/* ================================================================= */}
        {/* CONTRACT                                                         */}
        {/* ================================================================= */}

        {contract && (
          <dialog ref={agreementDialog} aria-label={`Teacher Agreement v${contract.version}`}
            onCancel={() => setShowAgreement(false)}
            onClick={(event) => { if (event.target === event.currentTarget) { const r = event.currentTarget.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) setShowAgreement(false); } }}
            className="teacher-agreement-dialog">
            <div className="no-print sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[#DFE3DA] bg-[#FFFDF8] px-5 py-4">
              <div><h3 className="font-serif text-xl text-[#293A30]">Teacher Agreement</h3>
                <p className="mt-1 text-xs text-[#607568]">{contract.contract_number} · v{contract.version} · {getStatusLabel(contract.status)}</p></div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={handlePrintContract} className="rounded-full border border-[#CBD6C8] px-4 py-2 text-sm text-[#36513D]">Print</button>
                {isOwnerViewer && contract.status === "draft" && <button type="button" disabled={actionLoading || !contract.snapshot_valid} onClick={() => handleContractAction("send")} className="rounded-full bg-[#6F8F72] px-4 py-2 text-sm text-white disabled:opacity-40">{actionLoading ? "Sending..." : "Send to Teacher"}</button>}
                <button type="button" autoFocus onClick={() => setShowAgreement(false)} className="rounded-full border border-[#CBD6C8] px-4 py-2 text-sm text-[#36513D]">Close</button>
              </div>
            </div>
            {error && <p role="alert" className="no-print bg-[#FAF0EE] px-5 py-3 text-sm text-[#8A5149]">{error}</p>}
            {success && <p role="status" className="no-print bg-[#F1F6F1] px-5 py-3 text-sm text-[#55745A]">{success}</p>}
            {/* Printable Contract */}
            <div
              id="teacher-contract-print"
              className="teacher-contract-print-area bg-white"
            >
              {/* Agreement Review */}
              <div>
                <div className="teacher-contract-document mx-auto max-w-[1000px] px-5 py-8 sm:px-12 sm:py-12 lg:px-16 lg:py-14">
                  {/* Header */}
                  <header className="contract-header border-b border-[#CFCFCB] pb-6">
                    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
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
                          Hamkke Teaching Services
                        </p>

                        <p className="mt-1 font-serif text-[21px] leading-tight text-[#222]">
                          Teacher Agreement
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
                          Teacher{savedTeacherNumber?.trim() ? ` ${savedTeacherNumber.trim().replace(/^T-/i, "")}` : ""}
                        </p>

                        <p className="mt-1.5 font-serif text-[16px] leading-[1.3] text-[#222]">
                          {agreementName || "Full name was not saved with this historical agreement"}
                        </p>
                      </div>

                      <div className="border-b border-[#D5D5D1] py-4 sm:border-b-0 sm:border-r sm:px-6 sm:py-0">
                        <p className="font-sans text-[8.5px] font-medium uppercase tracking-[0.12em] text-[#666]">
                          Contract Number
                        </p>

                        <p className="mt-1.5 font-serif text-[16px] leading-[1.3] text-[#222]">
                          {contract.contract_number}
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

                  {!savedName && contract.status !== "draft" && (
                    <p className="my-4 border-l-2 border-[#A8BCA5] pl-4 text-sm text-[#666]">
                      This historical agreement has no saved full-name snapshot. The current display name is not used as a substitute for a saved document name.
                      The current profile name is not evidence of the name recorded at acceptance.
                    </p>
                  )}
                  {contract.agreement_content ? (
                    <section className="py-6">
                      <p className="mb-4 text-xs text-[#666]">Framework {contract.framework_version || "—"} · Policy {contract.policy_version || "—"}</p>
                      {!contract.snapshot_valid && <p className="mb-4 text-sm text-[#8A5149]">This record is not ready for sending or acceptance. Contact Hamkke to review its saved snapshot.</p>}
                      <AgreementSnapshot content={contract.agreement_content} />
                    </section>
                  ) : legacyTemplate ? (
                    <section>
                      <p className="my-4 border-l-2 border-[#A8BCA5] pl-4 text-sm text-[#666]">Legacy v1.0 template reference. This record has no stored agreement text; the template below is not a verified snapshot of what was accepted.</p>
                      <div>
                    {TEACHER_AGREEMENT_SECTIONS.map((section) => (
                      <section
                        key={section.number}
                        className="teacher-contract-section border-b border-[#CFCFCB] py-6"
                      >
                        <div className="grid grid-cols-[24px_minmax(0,1fr)] gap-3 sm:grid-cols-[32px_minmax(0,1fr)] sm:gap-4">
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
                    </section>
                  ) : (
                    <p className="py-6 text-sm text-[#8A5149]">The saved agreement text is unavailable. This version cannot be accepted.</p>
                  )}

                  {/* Acceptance */}
                  <section className="teacher-contract-acceptance py-7">
                    <div className="border-b border-[#CFCFCB] border-t border-[#CFCFCB] py-7">
                      <div className="grid grid-cols-[24px_minmax(0,1fr)] gap-3 sm:grid-cols-[32px_minmax(0,1fr)] sm:gap-4">
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
                                {agreementName || "Not recorded at issuance"}
                              </div>
                            </div>

                            <div>
                              <p className="font-sans text-[8.5px] font-medium uppercase tracking-[0.12em] text-[#666]">
                                Teacher No.
                              </p>

                              <div className="mt-5 border-b border-[#BDBAB4] pb-2 font-sans text-[12.5px] text-[#444743]">
                                {savedTeacherNumber
                                  ? `T-${savedTeacherNumber.replace(
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
                                    disabled={actionLoading || !canAccept}
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
                                      !acceptConfirmed || actionLoading || !canAccept
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
          </dialog>
        )}
      </section>

      {/* =================================================================== */}
      {/* PRINT STYLES                                                        */}
      {/* =================================================================== */}

      <style jsx global>{`
        .teacher-agreement-dialog {
          width: min(1000px, calc(100vw - 32px)); max-width: none;
          max-height: calc(100dvh - 40px); margin: auto; padding: 0;
          border: 1px solid #D8DFD4; border-radius: 16px;
          background: white; color: #293A30; overflow-y: auto;
          box-shadow: 0 24px 90px rgba(30,45,35,.2);
        }
        .teacher-agreement-dialog::backdrop { background: rgba(35,49,40,.48); }
        @media print {
          .teacher-agreement-dialog[open] {
            position: absolute !important; inset: 0 auto auto 0 !important;
            width: 100% !important; max-height: none !important; height: auto !important;
            overflow: visible !important; margin: 0 !important; padding: 0 !important;
            border: 0 !important; border-radius: 0 !important; box-shadow: none !important;
          }
          .teacher-agreement-dialog::backdrop { background: transparent; }
          body:has(.teacher-agreement-dialog[open]) { overflow: visible !important; }
          .teacher-agreement-dialog > .no-print { display: none !important; }
          .teacher-agreement-dialog .teacher-contract-print-area { position: static !important; }
        }

        .teacher-contract-document { background: #fff; color: #333; }
        .teacher-contract-document .contract-header { padding-bottom: 28px; }
        .teacher-contract-document .contract-summary { padding-top: 22px; padding-bottom: 22px; }
        .teacher-contract-document .teacher-contract-section { padding-top: 28px; padding-bottom: 28px; }
        .teacher-contract-document .agreement-snapshot-body p,
        .teacher-contract-document .agreement-snapshot-body li {
          font-size: 13px; line-height: 1.8;
        }
        .teacher-contract-document .agreement-snapshot-body p { margin: 0 0 14px; }
        .teacher-contract-document .agreement-snapshot-body p:last-child { margin-bottom: 0; }
        .teacher-contract-document .agreement-snapshot-body h1 {
          font-size: 24px; font-weight: 400; line-height: 1.3; margin-bottom: 16px;
        }
        .teacher-contract-document .agreement-snapshot-body h2 {
          font-size: 20px; font-weight: 400; line-height: 1.4;
        }
        .teacher-contract-document .agreement-snapshot-body h3 {
          font-size: 16px; line-height: 1.5; margin-top: 22px; margin-bottom: 10px;
        }
        .teacher-contract-document .agreement-snapshot-body ul,
        .teacher-contract-document .agreement-snapshot-body ol { margin-top: 12px; margin-bottom: 18px; }
        .teacher-contract-document .agreement-snapshot-body blockquote {
          background: #f5f7f2; border-color: #9bae98; padding: 12px 16px;
        }
        @media (max-width: 480px) {
          .teacher-contract-document .teacher-contract-section { padding-top: 22px; padding-bottom: 22px; }
          .teacher-contract-document .teacher-contract-section h4 { font-size: 20px; line-height: 1.35; }
        }
        @media print {
          .teacher-contract-document .contract-summary > div { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .teacher-contract-document .contract-summary > div > div { padding: 0 14px; border-bottom: 0; border-right: 1px solid #d5d5d1; }
          .teacher-contract-document .contract-summary > div > div:first-child { padding-left: 0; }
          .teacher-contract-document .contract-summary > div > div:last-child { border-right: 0; padding-right: 0; }
          .teacher-contract-document .agreement-snapshot-body p,
          .teacher-contract-document .agreement-snapshot-body li { font-size: 10pt; line-height: 1.6; }
          .teacher-contract-document .teacher-contract-section { padding-top: 18px; padding-bottom: 18px; }
          .teacher-contract-document .agreement-snapshot-body p { break-inside: auto; }
        }

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