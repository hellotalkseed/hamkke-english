"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  CalendarDays,
  Clock3,
  UserRound,
  BookOpen,
  ClipboardCheck,
  FileText,
  MessageSquareText,
  Sparkles,
} from "lucide-react";

const ATTENDANCE_OPTIONS = [
  {
    value: "scheduled",
    label: "Scheduled",
    description: "This lesson has not happened yet.",
    icon: CalendarDays,
  },
  {
    value: "completed",
    label: "Completed",
    description:
      "The student attended and the lesson was taught.",
    icon: Check,
  },
  {
    value: "student_cancelled_credit",
    label: "Student Cancelled",
    description:
      "The student cancelled and the lesson is credited.",
    icon: UserRound,
  },
  {
    value: "teacher_cancelled",
    label: "Teacher Cancelled",
    description:
      "The teacher cancelled the lesson.",
    icon: BookOpen,
  },
  {
    value: "unexpected_circumstance",
    label: "Unexpected Circumstance",
    description:
      "The lesson was affected by an unexpected situation.",
    icon: ClipboardCheck,
  },
] as const;

interface LessonDetail {
  id: string;
  enrollment_id: string;
  enrollment_student_id: string;
  lesson_number: number;
  lesson_date: string;
  duration: number;
  attendance_status: string;
  notes: string | null;
  teacher_observation: string | null;
  consumes_lesson: boolean;
  actual_teacher_id: string | null;
  student: {
    id: string;
    student_number: string | null;
    full_name: string | null;
    preferred_name: string | null;
  } | null;
  enrollment: {
    id: string;
    package_name: string | null;
    status: string;
  } | null;
}

interface LessonResponse {
  teacher: {
    id: string;
    full_name: string | null;
  };
  lesson: LessonDetail;
}

interface LessonDetailsPageProps {
  params: Promise<{
    locale: string;
    lessonId: string;
  }>;
}

export default function LessonDetailsPage({
  params,
}: LessonDetailsPageProps) {
  const { locale, lessonId } = use(params);

  const [data, setData] =
    useState<LessonResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [selectedAttendance, setSelectedAttendance] =
    useState("");

  const [savingAttendance, setSavingAttendance] =
    useState(false);

  const [saveMessage, setSaveMessage] =
    useState<string | null>(null);

  const [notes, setNotes] =
    useState("");

  const [savingNotes, setSavingNotes] =
    useState(false);

  const [notesMessage, setNotesMessage] =
    useState<string | null>(null);

  const [polishingNotes, setPolishingNotes] =
    useState(false);

  const [polishedNotes, setPolishedNotes] =
    useState<string | null>(null);

  const [notesPolishError, setNotesPolishError] =
    useState<string | null>(null);

  const [
    teacherObservation,
    setTeacherObservation,
  ] = useState("");

  const [savingObservation, setSavingObservation] =
    useState(false);

  const [observationMessage, setObservationMessage] =
    useState<string | null>(null);

  const [
    polishingObservation,
    setPolishingObservation,
  ] = useState(false);

  const [
    polishedObservation,
    setPolishedObservation,
  ] = useState<string | null>(null);

  const [
    observationPolishError,
    setObservationPolishError,
  ] = useState<string | null>(null);

  useEffect(() => {
    async function loadLesson() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/admin/teachers/lessons/${lessonId}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Failed to load lesson."
          );
        }

        setData(result);

        setSelectedAttendance(
          result.lesson.attendance_status
        );

        setNotes(
          result.lesson.notes || ""
        );

        setTeacherObservation(
          result.lesson.teacher_observation || ""
        );

        setPolishedNotes(null);
        setPolishedObservation(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading the lesson."
        );
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [lessonId]);

  async function saveAttendance() {
    if (!selectedAttendance) {
      return;
    }

    try {
      setSavingAttendance(true);
      setSaveMessage(null);
      setError(null);

      const response = await fetch(
        `/api/admin/teachers/lessons/${lessonId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attendance_status:
              selectedAttendance,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to save attendance."
        );
      }

      setData((current) =>
        current
          ? {
              ...current,
              lesson: {
                ...current.lesson,
                attendance_status:
                  result.lesson
                    .attendance_status,
                actual_teacher_id:
                  result.lesson
                    .actual_teacher_id,
              },
            }
          : current
      );

      setSelectedAttendance(
        result.lesson.attendance_status
      );

      setSaveMessage(
        "Attendance saved successfully."
      );

      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving attendance."
      );
    } finally {
      setSavingAttendance(false);
    }
  }

  async function saveNotes() {
    try {
      setSavingNotes(true);
      setNotesMessage(null);
      setError(null);

      const response = await fetch(
        `/api/admin/teachers/lessons/${lessonId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notes,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to save lesson notes."
        );
      }

      setData((current) =>
        current
          ? {
              ...current,
              lesson: {
                ...current.lesson,
                notes:
                  result.lesson.notes,
              },
            }
          : current
      );

      setNotes(
        result.lesson.notes || ""
      );

      setPolishedNotes(null);

      setNotesMessage(
        "Lesson notes saved successfully."
      );

      setTimeout(() => {
        setNotesMessage(null);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving lesson notes."
      );
    } finally {
      setSavingNotes(false);
    }
  }

  async function polishNotes() {
    const text = notes.trim();

    if (!text) {
      setNotesPolishError(
        "Please write some lesson notes before using AI polishing."
      );
      return;
    }

    try {
      setPolishingNotes(true);
      setNotesPolishError(null);
      setPolishedNotes(null);
      setNotesMessage(null);

      const response = await fetch(
        `/api/admin/teachers/lessons/${lessonId}/polish`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "notes",
            text,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to polish lesson notes."
        );
      }

      setPolishedNotes(
        result.polishedText || ""
      );
    } catch (err) {
      setNotesPolishError(
        err instanceof Error
          ? err.message
          : "Something went wrong while polishing the notes."
      );
    } finally {
      setPolishingNotes(false);
    }
  }

  function usePolishedNotes() {
    if (!polishedNotes) {
      return;
    }

    setNotes(polishedNotes);
    setPolishedNotes(null);
    setNotesMessage(null);
    setNotesPolishError(null);
  }

  async function saveTeacherObservation() {
    try {
      setSavingObservation(true);
      setObservationMessage(null);
      setError(null);

      const response = await fetch(
        `/api/admin/teachers/lessons/${lessonId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teacher_observation:
              teacherObservation,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to save teacher observation."
        );
      }

      setData((current) =>
        current
          ? {
              ...current,
              lesson: {
                ...current.lesson,
                teacher_observation:
                  result.lesson
                    .teacher_observation,
              },
            }
          : current
      );

      setTeacherObservation(
        result.lesson.teacher_observation || ""
      );

      setPolishedObservation(null);

      setObservationMessage(
        "Teacher observation saved successfully."
      );

      setTimeout(() => {
        setObservationMessage(null);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving teacher observation."
      );
    } finally {
      setSavingObservation(false);
    }
  }

  async function polishTeacherObservation() {
    const text = teacherObservation.trim();

    if (!text) {
      setObservationPolishError(
        "Please write a teacher observation before using AI polishing."
      );
      return;
    }

    try {
      setPolishingObservation(true);
      setObservationPolishError(null);
      setPolishedObservation(null);
      setObservationMessage(null);

      const response = await fetch(
        `/api/admin/teachers/lessons/${lessonId}/polish`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "teacher_observation",
            text,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to polish teacher observation."
        );
      }

      setPolishedObservation(
        result.polishedText || ""
      );
    } catch (err) {
      setObservationPolishError(
        err instanceof Error
          ? err.message
          : "Something went wrong while polishing the observation."
      );
    } finally {
      setPolishingObservation(false);
    }
  }

  function usePolishedObservation() {
    if (!polishedObservation) {
      return;
    }

    setTeacherObservation(
      polishedObservation
    );

    setPolishedObservation(null);
    setObservationMessage(null);
    setObservationPolishError(null);
  }

  function formatDate(dateString: string) {
    const date = new Date(
      `${dateString}T00:00:00`
    );

    return date.toLocaleDateString(
      undefined,
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  }

  function formatStatus(status: string) {
    return status
      .replaceAll("_", " ")
      .replace(
        /\b\w/g,
        (letter) => letter.toUpperCase()
      );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf8f5]">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-32 rounded bg-[#e7e1da]" />
            <div className="h-9 w-64 rounded bg-[#e7e1da]" />
            <div className="h-40 rounded-3xl bg-[#e7e1da]" />
          </div>
        </div>
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="min-h-screen bg-[#faf8f5]">
        <div className="mx-auto max-w-5xl px-6 py-12">

          {/* Top Navigation */}
          <div className="flex items-start justify-between gap-6">
            <Link
              href={`/${locale}/admin/teachers/lessons`}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#65756b] transition hover:text-[#6f8f72]"
            >
              <ArrowLeft size={16} />
              Back to My Lessons
            </Link>

            {/* Brand */}
            <div className="shrink-0 text-right leading-none">
              <p className="text-xs font-medium tracking-[0.22em] text-[#6f8f72]">
                HAMKKE │ 함께
              </p>

              <p className="mt-1.5 text-[10px] tracking-[0.08em] text-[#6f8f72]/80">
                From Small Talk to Big Ideas
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-[#eadbd5] bg-white p-6">
            <p className="text-sm text-[#9a5f56]">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  const lesson = data.lesson;

  const studentName =
    lesson.student?.preferred_name ||
    lesson.student?.full_name ||
    "Student";

  const currentStatus =
    ATTENDANCE_OPTIONS.find(
      (option) =>
        option.value === selectedAttendance
    );

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:py-12">

        {/* Top Navigation */}
        <div className="flex items-start justify-between gap-6">
          {/* Back */}
          <Link
            href={`/${locale}/admin/teachers/lessons`}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#65756b] transition hover:text-[#6f8f72]"
          >
            <ArrowLeft size={16} />
            Back to My Lessons
          </Link>

          {/* Brand */}
          <div className="shrink-0 text-right leading-none">
            <p className="text-xs font-medium tracking-[0.22em] text-[#6f8f72]">
              HAMKKE │ 함께
            </p>

            <p className="mt-1.5 text-[10px] tracking-[0.08em] text-[#6f8f72]/80">
              From Small Talk to Big Ideas
            </p>
          </div>
        </div>

        {/* Header */}
        <div className="mt-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="font-serif text-4xl leading-tight tracking-tight text-[#2d2d2d] sm:text-5xl">
                Lesson {lesson.lesson_number}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-[#52636a]">
                <span className="font-medium text-[#3c484b]">
                  {studentName}
                </span>

                {lesson.student?.student_number && (
                  <>
                    <span className="text-[#a8aaa5]">
                      ·
                    </span>

                    <span>
                      {lesson.student.student_number}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Current status */}
            <div className="hidden rounded-full border border-[#dce4dc] bg-[#eef3ee] px-4 py-2 text-sm font-medium text-[#5f7f64] sm:block">
              {formatStatus(
                lesson.attendance_status
              )}
            </div>
          </div>
        </div>

        {/* Lesson Overview */}
        <section className="mt-9 overflow-hidden rounded-[26px] border border-[#e7e1da] bg-white shadow-[0_8px_30px_rgba(70,65,58,0.04)]">
          <div className="border-b border-[#eee9e3] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef3ee] text-[#6f8f72]">
                <BookOpen size={18} />
              </div>

              <div>
                <h2 className="font-medium text-[#2d2d2d]">
                  Lesson Overview
                </h2>

                <p className="mt-0.5 text-sm text-[#7b8587]">
                  The details for this lesson.
                </p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-3">

            {/* Student */}
            <div className="border-b border-[#eee9e3] px-6 py-5 sm:border-b-0 sm:border-r">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#8b918d]">
                <UserRound size={14} />
                Student
              </div>

              <p className="mt-2 font-medium text-[#2d2d2d]">
                {studentName}
              </p>

              {lesson.student?.student_number && (
                <p className="mt-0.5 text-xs text-[#7b8587]">
                  {lesson.student.student_number}
                </p>
              )}
            </div>

            {/* Date */}
            <div className="border-b border-[#eee9e3] px-6 py-5 sm:border-b-0 sm:border-r">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#8b918d]">
                <CalendarDays size={14} />
                Date
              </div>

              <p className="mt-2 font-medium text-[#2d2d2d]">
                {formatDate(
                  lesson.lesson_date
                )}
              </p>
            </div>

            {/* Duration */}
            <div className="px-6 py-5">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#8b918d]">
                <Clock3 size={14} />
                Duration
              </div>

              <p className="mt-2 font-medium text-[#2d2d2d]">
                {lesson.duration} minutes
              </p>
            </div>
          </div>
        </section>

        {/* Attendance */}
        <section className="mt-6 rounded-[26px] border border-[#e7e1da] bg-white p-6 shadow-[0_8px_30px_rgba(70,65,58,0.04)] sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef3ee] text-[#6f8f72]">
                  <ClipboardCheck size={18} />
                </div>

                <h2 className="font-medium text-[#2d2d2d]">
                  Attendance
                </h2>
              </div>

              <p className="mt-3 text-sm text-[#7b8587]">
                What happened in this lesson?
              </p>
            </div>

            {currentStatus && (
              <p className="text-sm text-[#8b918d]">
                Current:{" "}
                <span className="font-medium text-[#5f7064]">
                  {currentStatus.label}
                </span>
              </p>
            )}
          </div>

          {/* Attendance Options */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {ATTENDANCE_OPTIONS.map(
              (option) => {
                const Icon = option.icon;

                const isSelected =
                  selectedAttendance ===
                  option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSelectedAttendance(
                        option.value
                      );
                      setSaveMessage(null);
                    }}
                    className={`group relative flex items-start gap-4 rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-[#6f8f72] bg-[#eef3ee] shadow-[0_4px_18px_rgba(111,143,114,0.10)]"
                        : "border-[#e7e1da] bg-white hover:border-[#b8c8ba] hover:bg-[#fbfaf8]"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isSelected
                          ? "bg-[#6f8f72] text-white"
                          : "bg-[#f3f0ec] text-[#7b8587] group-hover:bg-[#eef3ee] group-hover:text-[#6f8f72]"
                      }`}
                    >
                      <Icon size={18} />
                    </div>

                    <div className="min-w-0 flex-1 pr-5">
                      <p
                        className={`font-medium ${
                          isSelected
                            ? "text-[#4f6f55]"
                            : "text-[#2d2d2d]"
                        }`}
                      >
                        {option.label}
                      </p>

                      <p
                        className={`mt-1 text-xs leading-5 ${
                          isSelected
                            ? "text-[#687b6c]"
                            : "text-[#7b8587]"
                        }`}
                      >
                        {option.description}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-[#6f8f72] text-white">
                        <Check size={13} />
                      </div>
                    )}
                  </button>
                );
              }
            )}
          </div>

          {/* Save */}
          <div className="mt-6 flex flex-col gap-3 border-t border-[#eee9e3] pt-5 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={saveAttendance}
              disabled={savingAttendance}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6f8f72] px-6 py-3 text-sm font-medium text-white shadow-[0_5px_14px_rgba(111,143,114,0.20)] transition hover:bg-[#628267] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingAttendance ? (
                "Saving..."
              ) : (
                <>
                  <Check size={16} />
                  Save Attendance
                </>
              )}
            </button>

            {saveMessage && (
              <div className="flex items-center gap-2 text-sm font-medium text-[#5f7f64]">
                <Check size={15} />
                {saveMessage}
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-[#eadbd5] bg-[#fcf6f4] px-4 py-3">
              <p className="text-sm text-[#9a5f56]">
                {error}
              </p>
            </div>
          )}
        </section>

        {/* Lesson Notes */}
        <section className="mt-6 rounded-[26px] border border-[#e7e1da] bg-white p-6 shadow-[0_8px_30px_rgba(70,65,58,0.04)] sm:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3f0ec] text-[#6f8f72]">
              <FileText size={18} />
            </div>

            <div>
              <h2 className="font-medium text-[#2d2d2d]">
                Lesson Notes
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#7b8587]">
                Record what you covered, practiced, or
                discussed during the lesson.
              </p>
            </div>
          </div>

          {/* Notes Input */}
          <div className="mt-5">
            <textarea
              value={notes}
              onChange={(event) => {
                setNotes(event.target.value);
                setNotesMessage(null);
                setPolishedNotes(null);
                setNotesPolishError(null);
              }}
              placeholder="Topics, activities, vocabulary, practice, and what happened during the lesson."
              rows={6}
              className="w-full resize-y rounded-2xl border border-[#e7e1da] bg-[#fbfaf8] px-5 py-4 text-sm leading-6 text-[#3c484b] outline-none transition placeholder:text-[#aaa9a5] focus:border-[#9eb19f] focus:bg-white focus:ring-2 focus:ring-[#eef3ee]"
            />
          </div>

          {/* AI Polish + Save */}
          <div className="mt-4 flex flex-col gap-3 border-t border-[#eee9e3] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={polishNotes}
              disabled={
                polishingNotes ||
                savingNotes ||
                !notes.trim()
              }
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#cfdccf] bg-[#f5f8f4] px-5 py-3 text-sm font-medium text-[#5f7f64] transition hover:border-[#aebfac] hover:bg-[#eef3ee] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles size={16} />

              {polishingNotes
                ? "Polishing..."
                : "Polish with AI"}
            </button>

            <button
              type="button"
              onClick={saveNotes}
              disabled={savingNotes}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6f8f72] px-6 py-3 text-sm font-medium text-white shadow-[0_5px_14px_rgba(111,143,114,0.20)] transition hover:bg-[#628267] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingNotes ? (
                "Saving..."
              ) : (
                <>
                  <Check size={16} />
                  Save Notes
                </>
              )}
            </button>
          </div>

          {notesMessage && (
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#5f7f64]">
              <Check size={15} />
              {notesMessage}
            </div>
          )}

          {/* AI Error */}
          {notesPolishError && (
            <div className="mt-4 rounded-xl border border-[#eadbd5] bg-[#fcf6f4] px-4 py-3">
              <p className="text-sm text-[#9a5f56]">
                {notesPolishError}
              </p>
            </div>
          )}

          {/* Polished Preview */}
          {polishedNotes && (
            <div className="mt-5 rounded-2xl border border-[#dce6dc] bg-[#f6f8f5] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles
                      size={15}
                      className="text-[#6f8f72]"
                    />

                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f8f72]">
                      Polished Version
                    </p>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-[#7b8587]">
                    Review this version before using it.
                    Your original notes have not been changed.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[#e1e7e1] bg-white px-5 py-4">
                <p className="whitespace-pre-wrap text-sm leading-6 text-[#3c484b]">
                  {polishedNotes}
                </p>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={usePolishedNotes}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6f8f72] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#628267]"
                >
                  <Check size={15} />
                  Use Polished Version
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-[#eadbd5] bg-[#fcf6f4] px-4 py-3">
              <p className="text-sm text-[#9a5f56]">
                {error}
              </p>
            </div>
          )}
        </section>

        {/* Teacher Observation */}
        <section className="mt-6 rounded-[26px] border border-[#e7e1da] bg-white p-6 shadow-[0_8px_30px_rgba(70,65,58,0.04)] sm:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3f0ec] text-[#6f8f72]">
              <MessageSquareText size={18} />
            </div>

            <div>
              <h2 className="font-medium text-[#2d2d2d]">
                Teacher Observation
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#7b8587]">
                Keep a brief record of the student's
                performance, strengths, or areas to work on.
              </p>
            </div>
          </div>

          {/* Teacher Observation Input */}
          <div className="mt-5">
            <textarea
              value={teacherObservation}
              onChange={(event) => {
                setTeacherObservation(
                  event.target.value
                );
                setObservationMessage(null);
                setPolishedObservation(null);
                setObservationPolishError(null);
              }}
              placeholder="Strengths, difficulties, participation, communication, and areas to work on."
              rows={6}
              className="w-full resize-y rounded-2xl border border-[#e7e1da] bg-[#fbfaf8] px-5 py-4 text-sm leading-6 text-[#3c484b] outline-none transition placeholder:text-[#aaa9a5] focus:border-[#9eb19f] focus:bg-white focus:ring-2 focus:ring-[#eef3ee]"
            />
          </div>

          {/* AI Polish + Save */}
          <div className="mt-4 flex flex-col gap-3 border-t border-[#eee9e3] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={polishTeacherObservation}
              disabled={
                polishingObservation ||
                savingObservation ||
                !teacherObservation.trim()
              }
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#cfdccf] bg-[#f5f8f4] px-5 py-3 text-sm font-medium text-[#5f7f64] transition hover:border-[#aebfac] hover:bg-[#eef3ee] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles size={16} />

              {polishingObservation
                ? "Polishing..."
                : "Polish with AI"}
            </button>

            <button
              type="button"
              onClick={saveTeacherObservation}
              disabled={savingObservation}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6f8f72] px-6 py-3 text-sm font-medium text-white shadow-[0_5px_14px_rgba(111,143,114,0.20)] transition hover:bg-[#628267] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingObservation ? (
                "Saving..."
              ) : (
                <>
                  <Check size={16} />
                  Save Observation
                </>
              )}
            </button>
          </div>

          {observationMessage && (
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#5f7f64]">
              <Check size={15} />
              {observationMessage}
            </div>
          )}

          {/* AI Error */}
          {observationPolishError && (
            <div className="mt-4 rounded-xl border border-[#eadbd5] bg-[#fcf6f4] px-4 py-3">
              <p className="text-sm text-[#9a5f56]">
                {observationPolishError}
              </p>
            </div>
          )}

          {/* Polished Preview */}
          {polishedObservation && (
            <div className="mt-5 rounded-2xl border border-[#dce6dc] bg-[#f6f8f5] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles
                      size={15}
                      className="text-[#6f8f72]"
                    />

                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f8f72]">
                      Polished Version
                    </p>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-[#7b8587]">
                    Review this version before using it.
                    Your original observation has not been changed.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[#e1e7e1] bg-white px-5 py-4">
                <p className="whitespace-pre-wrap text-sm leading-6 text-[#3c484b]">
                  {polishedObservation}
                </p>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={usePolishedObservation}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6f8f72] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#628267]"
                >
                  <Check size={15} />
                  Use Polished Version
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-[#eadbd5] bg-[#fcf6f4] px-4 py-3">
              <p className="text-sm text-[#9a5f56]">
                {error}
              </p>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}