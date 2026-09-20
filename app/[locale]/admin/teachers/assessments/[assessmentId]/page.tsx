"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import {
  CalendarDays,
  Check,
  ClipboardCheck,
  Clock3,
  Mail,
  MessageSquareText,
  MonitorPlay,
  UserRound,
  X,
} from "lucide-react";

interface AssessmentDetail {
  id: string;
  teacher_id: string;
  learner_type: "self" | "child";
  learner_name: string;
  preferred_name: string | null;
  learner_age: number | null;
  contact_name: string;
  email: string;
  english_level: string;
  learning_goal: string;
  notes: string | null;
  assessment_format: "audio" | "video";
  preferred_platform: string;
  timezone: string;
  assessment_date: string;
  assessment_time: string;
  status:
    | "confirmed"
    | "completed"
    | "no_show"
    | "cancelled";
  teacher_observation: string | null;
  converted_student_id: string | null;
  converted_at: string | null;
  duration: number;
  philippine_date: string;
  philippine_time: string;
}

interface AssessmentResponse {
  viewer: {
    id: string;
    full_name: string | null;
    role: string;
  };
  teacher: {
    id: string;
    full_name: string | null;
  } | null;
  assessment: AssessmentDetail;
}

interface PageProps {
  params: Promise<{
    locale: string;
    assessmentId: string;
  }>;
}

function formatDate(dateString: string) {
  return new Date(
    `${dateString}T00:00:00`
  ).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(time: string) {
  const [hourString, minute] =
    time.slice(0, 5).split(":");
  const hour = Number(hourString);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour =
    hour % 12 === 0 ? 12 : hour % 12;

  return `${displayHour}:${minute} ${period}`;
}

function formatValue(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatPlatform(value: string) {
  const labels: Record<string, string> = {
    microsoft_teams: "Microsoft Teams",
    zoom: "Zoom",
    google_meet: "Google Meet",
    voov: "VooV Meeting",
    kakaotalk: "KakaoTalk",
  };

  return labels[value] ?? formatValue(value);
}

function formatStatus(value: string) {
  if (value === "no_show") {
    return "No-show";
  }

  return formatValue(value);
}

function formatFormat(value: string) {
  return value === "audio"
    ? "Audio · Camera off"
    : "Video · Camera optional";
}

function formatTimezone(value: string) {
  const labels: Record<string, string> = {
    "Asia/Manila": "Philippines · Manila",
    "Asia/Seoul": "South Korea · Seoul",
    "Asia/Tokyo": "Japan · Tokyo",
    "Asia/Shanghai": "China · Beijing",
    "Asia/Ho_Chi_Minh":
      "Vietnam · Ho Chi Minh City",
    "Asia/Kuala_Lumpur":
      "Malaysia · Kuala Lumpur",
    "Asia/Jakarta": "Indonesia · Jakarta",
    "Asia/Makassar":
      "Indonesia · Makassar / Bali",
    "Asia/Jayapura":
      "Indonesia · Jayapura",
  };

  return labels[value] ?? value;
}

function getTimeZoneParts(
  date: Date,
  timeZone: string
) {
  const parts = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }
  ).formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [
      part.type,
      part.value,
    ])
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function sourceDateTimeToUtc(
  date: string,
  time: string
) {
  const [year, month, day] =
    date.split("-").map(Number);
  const [hour, minute] =
    time.slice(0, 5).split(":").map(Number);

  let guess = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute
  );

  for (let index = 0; index < 3; index += 1) {
    const actual = getTimeZoneParts(
      new Date(guess),
      "Asia/Manila"
    );

    const actualAsUtc = Date.UTC(
      actual.year,
      actual.month - 1,
      actual.day,
      actual.hour,
      actual.minute,
      actual.second
    );

    const desiredAsUtc = Date.UTC(
      year,
      month - 1,
      day,
      hour,
      minute
    );

    guess += desiredAsUtc - actualAsUtc;
  }

  return new Date(guess);
}

function formatLearnerTime(
  date: string,
  time: string,
  timezone: string
) {
  try {
    const instant =
      sourceDateTimeToUtc(date, time);

    return new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone: timezone,
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    ).format(instant);
  } catch {
    return "—";
  }
}

export default function TeacherAssessmentPage({
  params,
}: PageProps) {
  const { locale, assessmentId } =
    use(params);

  const [data, setData] =
    useState<AssessmentResponse | null>(
      null
    );
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState<string | null>(null);
  const [
    teacherObservation,
    setTeacherObservation,
  ] = useState("");
  const [
    savingObservation,
    setSavingObservation,
  ] = useState(false);
  const [
    observationMessage,
    setObservationMessage,
  ] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  useEffect(() => {
    async function loadAssessment() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/admin/teachers/assessments/${assessmentId}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Failed to load assessment."
          );
        }

        setData(result);
        setTeacherObservation(
          result.assessment
            .teacher_observation || ""
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load assessment."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAssessment();
  }, [assessmentId]);

  async function patchAssessment(
    body: Record<string, unknown>
  ) {
    const response = await fetch(
      `/api/admin/teachers/assessments/${assessmentId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ||
          "Failed to update assessment."
      );
    }

    setData((current) =>
      current
        ? {
            ...current,
            assessment:
              result.assessment,
          }
        : current
    );

    return result.assessment as AssessmentDetail;
  }

  async function saveObservation() {
    try {
      setSavingObservation(true);
      setObservationMessage(null);
      setError(null);

      const assessment =
        await patchAssessment({
          teacher_observation:
            teacherObservation,
        });

      setTeacherObservation(
        assessment.teacher_observation || ""
      );
      setObservationMessage(
        "Teacher observation saved."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save observation."
      );
    } finally {
      setSavingObservation(false);
    }
  }

  async function updateStatus(
    status: "completed" | "no_show"
  ) {
    try {
      setUpdatingStatus(true);
      setError(null);

      await patchAssessment({
        status,
        teacher_observation:
          teacherObservation,
      });

      setObservationMessage(
        status === "completed"
          ? "Assessment marked as completed."
          : "Assessment marked as no-show."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update assessment status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  const PageHeader = () => (
    <header className="w-full px-6 pt-7 sm:px-8 sm:pt-8 lg:px-10 xl:px-12">
      <div className="flex w-full items-start justify-between gap-8">
        <Link
          href={`/${locale}/admin/teachers/lessons`}
          className="shrink-0 font-sans text-[15px] text-[#5F655F] transition-colors duration-200 hover:text-[#6F8F72] sm:text-[16px]"
        >
          &larr; My Lessons
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
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf8f5]">
        <PageHeader />
        <div className="mx-auto max-w-5xl px-6 py-16 text-sm text-[#777a74]">
          Loading assessment...
        </div>
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="min-h-screen bg-[#faf8f5]">
        <PageHeader />
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="border border-[#eadbd5] bg-[#fffaf8] px-5 py-4 text-sm text-[#a45f58]">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  const assessment = data.assessment;
  const learnerName =
    assessment.preferred_name ||
    assessment.learner_name;

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#2d2d2d]">
      <PageHeader />

      <div className="mx-auto max-w-5xl px-6 py-10 sm:py-12">
        <div className="mt-8 flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6f8f72]">
              Free Assessment
            </p>
            <h1 className="mt-2 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
              {learnerName}
            </h1>

            {assessment.preferred_name && (
              <p className="mt-3 text-sm text-[#7b8587]">
                {assessment.learner_name}
              </p>
            )}
          </div>

          <span className="rounded-full border border-[#dce4dc] bg-[#eef3ee] px-4 py-2 text-sm font-medium text-[#5f7f64]">
            {formatStatus(
              assessment.status
            )}
          </span>
        </div>

        <div className="mt-9 grid gap-6 lg:grid-cols-2">
          <section className="overflow-hidden rounded-[26px] border border-[#e7e1da] bg-white shadow-[0_8px_30px_rgba(70,65,58,0.04)]">
            <div className="border-b border-[#eee9e3] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef3ee] text-[#6f8f72]">
                  <CalendarDays size={18} />
                </div>
                <div>
                  <h2 className="font-medium">
                    Assessment Overview
                  </h2>
                  <p className="mt-0.5 text-sm text-[#7b8587]">
                    Schedule shown in Philippine Time.
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-[#eee9e3]">
              <div className="px-6 py-5">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#8b918d]">
                  <CalendarDays size={14} />
                  Date
                </div>
                <p className="mt-2 font-medium">
                  {formatDate(
                    assessment.assessment_date
                  )}
                </p>
              </div>

              <div className="px-6 py-5">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#8b918d]">
                  <Clock3 size={14} />
                  Time
                </div>
                <p className="mt-2 font-medium">
                  {formatTime(
                    assessment.assessment_time
                  )}{" "}
                  · 30 minutes
                </p>
                <p className="mt-1 text-xs text-[#7b8587]">
                  Philippines · Manila
                </p>
              </div>

              <div className="px-6 py-5">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8b918d]">
                  Learner local time
                </p>
                <p className="mt-2 font-medium">
                  {formatLearnerTime(
                    assessment.assessment_date,
                    assessment.assessment_time,
                    assessment.timezone
                  )}
                </p>
                <p className="mt-1 text-xs text-[#7b8587]">
                  {formatTimezone(
                    assessment.timezone
                  )}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[26px] border border-[#e7e1da] bg-white p-6 shadow-[0_8px_30px_rgba(70,65,58,0.04)] sm:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef3ee] text-[#6f8f72]">
                <MonitorPlay size={18} />
              </div>
              <div>
                <h2 className="font-medium">
                  Conversation Setup
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#7b8587]">
                  Details needed for the assessment conversation.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8b918d]">
                  Format
                </p>
                <p className="mt-2 text-sm">
                  {formatFormat(
                    assessment.assessment_format
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8b918d]">
                  Platform
                </p>
                <p className="mt-2 text-sm">
                  {formatPlatform(
                    assessment.preferred_platform
                  )}
                </p>
              </div>

              <div>
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#8b918d]">
                  <Mail size={13} />
                  Email
                </p>
                <p className="mt-2 break-all text-sm">
                  {assessment.email}
                </p>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-[26px] border border-[#e7e1da] bg-white p-6 shadow-[0_8px_30px_rgba(70,65,58,0.04)] sm:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef3ee] text-[#6f8f72]">
              <UserRound size={18} />
            </div>
            <div>
              <h2 className="font-medium">
                Learner Background
              </h2>
              <p className="mt-1 text-sm leading-6 text-[#7b8587]">
                Information shared when the assessment was booked.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8b918d]">
                Learner
              </p>
              <p className="mt-2 text-sm">
                {assessment.learner_type ===
                "child"
                  ? `Child${
                      assessment.learner_age
                        ? ` · Age ${assessment.learner_age}`
                        : ""
                    }`
                  : "Self"}
              </p>
            </div>

            {assessment.learner_type ===
              "child" && (
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8b918d]">
                  Parent / Guardian
                </p>
                <p className="mt-2 text-sm">
                  {assessment.contact_name}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8b918d]">
                English comfort
              </p>
              <p className="mt-2 text-sm">
                {formatValue(
                  assessment.english_level
                )}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8b918d]">
                Learning goal
              </p>
              <p className="mt-2 text-sm">
                {formatValue(
                  assessment.learning_goal
                )}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-[#eee9e3] pt-5">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#8b918d]">
              Booking note
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#52636a]">
              {assessment.notes ||
                "No additional note was provided."}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-[26px] border border-[#e7e1da] bg-white p-6 shadow-[0_8px_30px_rgba(70,65,58,0.04)] sm:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3f0ec] text-[#6f8f72]">
              <MessageSquareText
                size={18}
              />
            </div>
            <div>
              <h2 className="font-medium">
                Teacher Observation
              </h2>
              <p className="mt-1 text-sm leading-6 text-[#7b8587]">
                Record the learner&apos;s communication, strengths, difficulties, and recommended starting point.
              </p>
            </div>
          </div>

          <textarea
            value={teacherObservation}
            onChange={(event) => {
              setTeacherObservation(
                event.target.value
              );
              setObservationMessage(null);
            }}
            placeholder="Communication, strengths, difficulties, confidence, vocabulary, grammar, pronunciation, and recommended focus."
            rows={7}
            maxLength={5000}
            className="mt-5 w-full resize-y rounded-2xl border border-[#e7e1da] bg-[#fbfaf8] px-5 py-4 text-sm leading-6 text-[#3c484b] outline-none transition placeholder:text-[#aaa9a5] focus:border-[#9eb19f] focus:bg-white focus:ring-2 focus:ring-[#eef3ee]"
          />

          <div className="mt-4 flex flex-col gap-3 border-t border-[#eee9e3] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[#9a9790]">
              {teacherObservation.length}/5000
            </p>

            <button
              type="button"
              onClick={saveObservation}
              disabled={savingObservation}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6f8f72] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#628267] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={16} />
              {savingObservation
                ? "Saving..."
                : "Save Observation"}
            </button>
          </div>

          {observationMessage && (
            <p className="mt-4 text-sm font-medium text-[#5f7f64]">
              {observationMessage}
            </p>
          )}
        </section>

        <section className="mt-6 rounded-[26px] border border-[#e7e1da] bg-white p-6 shadow-[0_8px_30px_rgba(70,65,58,0.04)] sm:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef3ee] text-[#6f8f72]">
              <ClipboardCheck size={18} />
            </div>
            <div>
              <h2 className="font-medium">
                Assessment Status
              </h2>
              <p className="mt-1 text-sm text-[#7b8587]">
                Record what happened during this Free Assessment.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#8b918d]">
              Current status
            </span>
            <span className="rounded-full border border-[#dce4dc] bg-[#eef3ee] px-3 py-1 text-xs font-medium text-[#5f7f64]">
              {formatStatus(
                assessment.status
              )}
            </span>
          </div>

          {assessment.status !==
            "cancelled" && (
            <div className="mt-6 flex flex-col gap-3 border-t border-[#eee9e3] pt-5 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  updateStatus("completed")
                }
                disabled={updatingStatus}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6f8f72] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#628267] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check size={16} />
                Mark Completed
              </button>

              <button
                type="button"
                onClick={() =>
                  updateStatus("no_show")
                }
                disabled={updatingStatus}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d8b8b2] bg-[#fffaf8] px-6 py-3 text-sm font-medium text-[#8a5c56] transition hover:bg-[#f8eeeb] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={16} />
                Mark No-show
              </button>
            </div>
          )}

          <p className="mt-5 text-xs leading-5 text-[#8b918d]">
            Saving a status also saves the current Teacher Observation.
          </p>
        </section>

        {error && (
          <div className="mt-6 border border-[#eadbd5] bg-[#fffaf8] px-5 py-4 text-sm text-[#a45f58]">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
