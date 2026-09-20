"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Mail,
  Monitor,
  UserRound,
} from "lucide-react";

type AssessmentStatus = "confirmed" | "completed" | "cancelled" | "no_show";
type FollowUpStatus =
  | "awaiting_follow_up"
  | "contacted"
  | "interested"
  | "not_proceeding"
  | "converted";

export interface AssessmentTableRow {
  id: string;
  teacher_id: string;
  teacher_name: string;
  learner_type: "self" | "child";
  learner_name: string;
  preferred_name: string | null;
  learner_age: number | null;
  contact_name: string;
  email: string;
  english_level: string;
  learning_goal: string;
  notes: string | null;
  teacher_observation: string | null;
  assessment_format: "audio" | "video";
  preferred_platform: string;
  timezone: string;
  assessment_date: string;
  assessment_time: string;
  status: AssessmentStatus;
  follow_up_status: FollowUpStatus | null;
  converted_student_id: string | null;
  converted_at: string | null;
  created_at: string;
}

interface AssessmentsTableProps {
  locale: string;
  assessments: AssessmentTableRow[];
}

const SOURCE_TIMEZONE = "Asia/Manila";

const FOLLOW_UP_OPTIONS: Array<{
  value: Exclude<FollowUpStatus, "converted">;
  label: string;
}> = [
  { value: "awaiting_follow_up", label: "Awaiting follow-up" },
  { value: "contacted", label: "Contacted" },
  { value: "interested", label: "Interested" },
  { value: "not_proceeding", label: "Not proceeding" },
];

function normalizeTime(value: string) {
  return value.slice(0, 5);
}

function getTimeZoneParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function zonedDateTimeToUtc(date: string, time: string, timeZone: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = normalizeTime(time).split(":").map(Number);

  let guess = Date.UTC(year, month - 1, day, hour, minute, 0);

  for (let index = 0; index < 3; index += 1) {
    const actual = getTimeZoneParts(new Date(guess), timeZone);
    const actualAsUtc = Date.UTC(
      actual.year,
      actual.month - 1,
      actual.day,
      actual.hour,
      actual.minute,
      actual.second
    );
    const desiredAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
    guess += desiredAsUtc - actualAsUtc;
  }

  return new Date(guess);
}

function formatSourceDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatTime(time: string) {
  const [hourString, minute] = normalizeTime(time).split(":");
  const hour = Number(hourString);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute} ${suffix}`;
}

function formatVisitorSchedule(date: string, time: string, timezone: string) {
  try {
    const instant = zonedDateTimeToUtc(date, time, SOURCE_TIMEZONE);

    const dateLabel = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(instant);

    const timeLabel = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
    }).format(instant);

    return `${dateLabel} · ${timeLabel}`;
  } catch {
    return `${date} · ${normalizeTime(time)}`;
  }
}

function formatTimezone(timezone: string) {
  const labels: Record<string, string> = {
    "Asia/Manila": "Philippines · Manila",
    "Asia/Seoul": "South Korea · Seoul",
    "Asia/Tokyo": "Japan · Tokyo",
    "Asia/Shanghai": "China · Beijing",
    "Asia/Ho_Chi_Minh": "Vietnam · Ho Chi Minh City",
    "Asia/Kuala_Lumpur": "Malaysia · Kuala Lumpur",
    "Asia/Jakarta": "Indonesia · Jakarta",
    "Asia/Makassar": "Indonesia · Makassar / Bali",
    "Asia/Jayapura": "Indonesia · Jayapura",
  };

  return labels[timezone] ?? timezone;
}

function formatPlatform(platform: string) {
  const labels: Record<string, string> = {
    microsoft_teams: "Microsoft Teams",
    zoom: "Zoom",
    google_meet: "Google Meet",
    voov: "VooV Meeting",
    kakaotalk: "KakaoTalk",
  };

  return labels[platform] ?? platform;
}

function formatFormat(format: string) {
  return format === "audio" ? "Audio · Camera off" : "Video · Camera optional";
}

function formatValue(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getStatusStyle(status: AssessmentStatus) {
  switch (status) {
    case "confirmed":
      return {
        label: "Confirmed",
        className: "bg-[#DDEAF2] text-[#466B80]",
        dotClassName: "bg-[#6E9BB5]",
      };
    case "completed":
      return {
        label: "Completed",
        className: "bg-[#F3E8B8] text-[#786A36]",
        dotClassName: "bg-[#B59A45]",
      };
    case "no_show":
      return {
        label: "No-show",
        className: "bg-[#F3D9D5] text-[#8A5C56]",
        dotClassName: "bg-[#B97870]",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        className: "bg-[#ECEEEA] text-[#6F746D]",
        dotClassName: "bg-[#8A8F87]",
      };
  }
}

function getFollowUpLabel(
  status: FollowUpStatus | null,
  assessmentStatus: AssessmentStatus
) {
  if (status === "converted") return "Converted";
  if (status === "contacted") return "Contacted";
  if (status === "interested") return "Interested";
  if (status === "not_proceeding") return "Not proceeding";
  if (status === "awaiting_follow_up") return "Awaiting follow-up";
  if (assessmentStatus === "completed") return "Awaiting follow-up";
  return "—";
}

function getFollowUpClass(status: FollowUpStatus | null) {
  switch (status) {
    case "converted":
      return "text-[#607963]";
    case "interested":
      return "text-[#607963]";
    case "not_proceeding":
      return "text-[#8A5C56]";
    case "contacted":
      return "text-[#466B80]";
    case "awaiting_follow_up":
      return "text-[#786A36]";
    default:
      return "text-[#99958E]";
  }
}

export default function AssessmentsTable({
  locale,
  assessments,
}: AssessmentsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rows, setRows] = useState(assessments);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<Record<string, string>>({});

  function toggleAssessment(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  async function updateFollowUp(
    assessmentId: string,
    followUpStatus: Exclude<FollowUpStatus, "converted">
  ) {
    const previousRows = rows;

    setRows((current) =>
      current.map((row) =>
        row.id === assessmentId
          ? { ...row, follow_up_status: followUpStatus }
          : row
      )
    );
    setSavingId(assessmentId);
    setSaveError((current) => ({ ...current, [assessmentId]: "" }));

    try {
      const response = await fetch(
  `/api/assessments/${assessmentId}/follow-up`,
  {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ followUpStatus }),
  }
);

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Unable to update follow-up status.");
      }

      setRows((current) =>
        current.map((row) =>
          row.id === assessmentId
            ? {
                ...row,
                follow_up_status: data.followUpStatus ?? followUpStatus,
              }
            : row
        )
      );
    } catch (error) {
      setRows(previousRows);
      setSaveError((current) => ({
        ...current,
        [assessmentId]:
          error instanceof Error
            ? error.message
            : "Unable to update follow-up status.",
      }));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="w-full">
      <div className="hidden border-b border-[#DCD8D2] bg-[#F3F0EA] px-5 py-3 md:grid md:grid-cols-[1.25fr_1.35fr_1fr_0.85fr_1.15fr_28px] md:items-center md:gap-4">
        <p className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-[#8A8A84]">Learner</p>
        <p className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-[#8A8A84]">Assessment</p>
        <p className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-[#8A8A84]">Teacher</p>
        <p className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-[#8A8A84]">Status</p>
        <p className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-[#8A8A84]">Follow-up</p>
        <span aria-hidden="true" />
      </div>

      {rows.map((assessment) => {
        const isExpanded = expandedId === assessment.id;
        const status = getStatusStyle(assessment.status);
        const learnerDisplayName =
          assessment.preferred_name || assessment.learner_name;
        const effectiveFollowUp: FollowUpStatus | null =
          assessment.converted_student_id
            ? "converted"
            : assessment.follow_up_status;
        const canManageFollowUp =
          assessment.status === "completed" &&
          !assessment.converted_student_id;

        return (
          <div key={assessment.id} className="border-b border-[#DCD8D2]">
            <button
              type="button"
              onClick={() => toggleAssessment(assessment.id)}
              aria-expanded={isExpanded}
              className="grid w-full gap-3 px-4 py-5 text-left transition-colors hover:bg-[#F4F1EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8EAA91] md:grid-cols-[1.25fr_1.35fr_1fr_0.85fr_1.15fr_28px] md:items-center md:gap-4 md:px-5 md:py-4"
            >
              <div className="min-w-0">
                <p className="font-serif text-[18px] leading-6 text-[#343632]">
                  {learnerDisplayName}
                </p>
                {assessment.preferred_name && (
                  <p className="mt-0.5 truncate font-sans text-[10px] text-[#96928B]">
                    {assessment.learner_name}
                  </p>
                )}
              </div>

              <div>
                <p className="font-sans text-[12px] font-medium text-[#4F514D]">
                  {formatSourceDate(assessment.assessment_date)}
                </p>
                <p className="mt-0.5 font-sans text-[10px] text-[#8A8780]">
                  {formatTime(assessment.assessment_time)} · Philippines
                </p>
              </div>

              <p className="truncate font-sans text-[12px] text-[#5E605C]">
                {assessment.teacher_name}
              </p>

              <div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 font-sans text-[8px] font-medium uppercase tracking-[0.1em] ${status.className}`}>
                  <span className={`h-[5px] w-[5px] rounded-full ${status.dotClassName}`} />
                  {status.label}
                </span>
              </div>

              <p className={`font-sans text-[11px] font-medium ${getFollowUpClass(effectiveFollowUp)}`}>
                {getFollowUpLabel(effectiveFollowUp, assessment.status)}
              </p>

              <div className="flex justify-end text-[#777A74]">
                {isExpanded ? (
                  <ChevronUp size={17} strokeWidth={1.6} />
                ) : (
                  <ChevronDown size={17} strokeWidth={1.6} />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="bg-[#F7F4EF] px-5 pb-7 pt-2 sm:px-6 md:px-7">
                <div className="grid gap-8 border-t border-[#E2DED7] pt-7 md:grid-cols-3">
                  <section>
                    <p className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-[#8A8A84]">Learner</p>
                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="font-serif text-[18px] leading-6 text-[#3E403C]">
                          {assessment.learner_name}
                        </p>
                        {assessment.preferred_name && (
                          <p className="mt-1 font-sans text-[11px] text-[#85827C]">
                            Preferred name · {assessment.preferred_name}
                          </p>
                        )}
                      </div>
                      <p className="flex items-start gap-2 font-sans text-[11px] leading-5 text-[#666862]">
                        <Mail size={13} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[#6F8F72]" />
                        {assessment.email}
                      </p>
                      <p className="flex items-start gap-2 font-sans text-[11px] leading-5 text-[#666862]">
                        <UserRound size={13} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[#6F8F72]" />
                        {assessment.learner_type === "child"
                          ? `Child${assessment.learner_age ? ` · Age ${assessment.learner_age}` : ""} · Parent / guardian: ${assessment.contact_name}`
                          : "Self"}
                      </p>
                    </div>
                  </section>

                  <section>
                    <p className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-[#8A8A84]">Assessment</p>
                    <div className="mt-4 space-y-3 font-sans text-[11px] leading-5 text-[#666862]">
                      <div>
                        <p className="font-medium text-[#444640]">
                          {formatSourceDate(assessment.assessment_date)} · {formatTime(assessment.assessment_time)}
                        </p>
                        <p className="text-[#929089]">Teacher time · Philippines</p>
                      </div>
                      <div>
                        <p>{formatVisitorSchedule(assessment.assessment_date, assessment.assessment_time, assessment.timezone)}</p>
                        <p className="text-[#929089]">
                          Learner time · {formatTimezone(assessment.timezone)}
                        </p>
                      </div>
                      <p className="flex items-start gap-2">
                        <Monitor size={13} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[#6F8F72]" />
                        <span>
                          {formatFormat(assessment.assessment_format)}
                          <br />
                          {formatPlatform(assessment.preferred_platform)}
                        </span>
                      </p>
                    </div>
                  </section>

                  <section>
                    <p className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-[#8A8A84]">Learning</p>
                    <div className="mt-4 space-y-4">
                      <div>
                        <p className="font-sans text-[9px] uppercase tracking-[0.1em] text-[#99958E]">English comfort</p>
                        <p className="mt-1 font-serif text-[14px] leading-6 text-[#555751]">
                          {formatValue(assessment.english_level)}
                        </p>
                      </div>
                      <div>
                        <p className="font-sans text-[9px] uppercase tracking-[0.1em] text-[#99958E]">Learning goal</p>
                        <p className="mt-1 font-serif text-[14px] leading-6 text-[#555751]">
                          {formatValue(assessment.learning_goal)}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="mt-7 grid gap-6 border-t border-[#E2DED7] pt-7 md:grid-cols-2">
                  <section>
                    <p className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-[#8A8A84]">Booking note</p>
                    <p className="mt-2 whitespace-pre-wrap font-serif text-[14px] leading-6 text-[#666862]">
                      {assessment.notes || "No additional note was provided."}
                    </p>
                  </section>
                  <section>
                    <p className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-[#8A8A84]">Teacher observation</p>
                    <p className="mt-2 whitespace-pre-wrap font-serif text-[14px] leading-6 text-[#666862]">
                      {assessment.teacher_observation || "No teacher observation yet."}
                    </p>
                  </section>
                </div>

                <div className="mt-7 grid gap-6 border-t border-[#E2DED7] pt-6 md:grid-cols-[1fr_auto] md:items-end">
                  <section>
                    <p className="font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-[#8A8A84]">
                      Follow-up
                    </p>

                    {assessment.converted_student_id ? (
                      <p className="mt-3 font-sans text-[12px] font-medium text-[#607963]">
                        Converted
                      </p>
                    ) : canManageFollowUp ? (
                      <div className="mt-3">
                        <select
                          value={effectiveFollowUp || "awaiting_follow_up"}
                          disabled={savingId === assessment.id}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) =>
                            updateFollowUp(
                              assessment.id,
                              event.target.value as Exclude<FollowUpStatus, "converted">
                            )
                          }
                          className="min-w-[220px] rounded-lg border border-[#D8D4CD] bg-[#FAF8F5] px-3 py-2.5 font-sans text-[12px] text-[#4F514D] outline-none transition-colors focus:border-[#8EAA91] disabled:cursor-wait disabled:opacity-60"
                        >
                          {FOLLOW_UP_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>

                        {savingId === assessment.id && (
                          <p className="mt-2 font-sans text-[10px] text-[#8A8780]">
                            Saving…
                          </p>
                        )}

                        {saveError[assessment.id] && (
                          <p className="mt-2 font-sans text-[10px] text-[#9A5F58]">
                            {saveError[assessment.id]}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-3 font-sans text-[12px] text-[#99958E]">
                        Follow-up begins after the assessment is completed.
                      </p>
                    )}
                  </section>

                  <div className="flex flex-wrap items-center justify-end gap-3">
                    <p className="font-sans text-[10px] text-[#97938C]">
                      Assigned teacher · {assessment.teacher_name}
                    </p>

                    {assessment.converted_student_id ? (
                      <Link
                        href={`/${locale}/admin/students/${assessment.converted_student_id}`}
                        className="inline-flex rounded-full bg-[#E5EBDD] px-4 py-2 font-sans text-[10px] font-medium text-[#607963] transition-colors hover:bg-[#DCE6D7]"
                      >
                        View Student →
                      </Link>
                    ) : assessment.status === "completed" &&
                      effectiveFollowUp === "interested" ? (
                      <Link
                        href={`/${locale}/admin/students/new?assessment=${assessment.id}`}
                        className="inline-flex rounded-full bg-[#6F8F72] px-4 py-2 font-sans text-[10px] font-medium text-white transition-colors hover:bg-[#5F7F63]"
                      >
                        Convert to Student →
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
