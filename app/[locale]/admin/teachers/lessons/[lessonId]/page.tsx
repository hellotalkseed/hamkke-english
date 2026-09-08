"use client";

import Link from "next/link";
import TeacherLessonActions from "@/components/admin/TeacherLessonActions";
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
  MonitorPlay,
  BookMarked,
  ListChecks,
  UserPlus,
  X,
} from "lucide-react";


interface SubstituteTeacher {
  id: string;
  full_name: string | null;
  teacher_number: string | null;
  available: boolean;
}

interface LessonDetail {
  id: string;
  enrollment_id: string;
  enrollment_student_id: string;
  lesson_number: number;
  lesson_date: string;
  schedule_time: string | null;
  duration: number;
  attendance_status: string;
  notes: string | null;
  teacher_observation: string | null;
  consumes_lesson: boolean;
  actual_teacher_id: string | null;
  substitute_teacher_id: string | null;

  platform: string | null;
  material: string | null;
  lesson_page: string | null;
  class_instructions: string | null;
  class_info_updated_at: string | null;
  class_info_inherited: boolean;
  class_info_inherited_from_lesson_number: number | null;

  substitute_teacher: {
    id: string;
    full_name: string | null;
    teacher_number: string | null;
  } | null;

  student: {
    id: string;
    student_number: string | null;
    full_name: string | null;
    preferred_name: string | null;
    email: string | null;
  } | null;

  enrollment: {
    id: string;
    package_name: string | null;
    status: string;
  } | null;
}

interface LessonResponse {
  viewer: {
    id: string;
    full_name: string | null;
    role: string;
  };

  teacher: {
    id: string;
    full_name: string | null;
  };

  lesson: LessonDetail;

  substitute_teachers: SubstituteTeacher[];
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

  /* --------------------------------
   * Class Info
   * -------------------------------- */

  const [platform, setPlatform] =
    useState("");

  const [material, setMaterial] =
    useState("");

  const [lessonPage, setLessonPage] =
    useState("");

  const [classInstructions, setClassInstructions] =
    useState("");

  const [savingClassInfo, setSavingClassInfo] =
    useState(false);

  const [classInfoMessage, setClassInfoMessage] =
    useState<string | null>(null);

  /* --------------------------------
   * Substitute Teacher
   * -------------------------------- */

  const [
    selectedSubstituteTeacher,
    setSelectedSubstituteTeacher,
  ] = useState("");

  const [
    savingSubstitute,
    setSavingSubstitute,
  ] = useState(false);

  const [
    substituteMessage,
    setSubstituteMessage,
  ] = useState<string | null>(null);

  const [
    substituteError,
    setSubstituteError,
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


        setNotes(
          result.lesson.notes || ""
        );

        setTeacherObservation(
          result.lesson.teacher_observation || ""
        );

        setPlatform(
          result.lesson.platform || ""
        );

        setMaterial(
          result.lesson.material || ""
        );

        setLessonPage(
          result.lesson.lesson_page || ""
        );

        setClassInstructions(
          result.lesson.class_instructions || ""
        );

        setSelectedSubstituteTeacher(
          result.lesson.substitute_teacher_id ||
            ""
        );

        setPolishedNotes(null);
        setPolishedObservation(null);
        setSubstituteMessage(null);
        setSubstituteError(null);
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

  async function saveClassInfo() {
    try {
      setSavingClassInfo(true);
      setClassInfoMessage(null);
      setError(null);

      const response = await fetch(
        `/api/admin/teachers/lessons/${lessonId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            platform,
            material,
            lesson_page: lessonPage,
            class_instructions:
              classInstructions,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to save class information."
        );
      }

      setData((current) =>
        current
          ? {
              ...current,
              lesson: {
                ...current.lesson,
                platform:
                  result.lesson.platform,
                material:
                  result.lesson.material,
                lesson_page:
                  result.lesson.lesson_page,
                class_instructions:
                  result.lesson
                    .class_instructions,
                class_info_updated_at:
                  result.lesson
                    .class_info_updated_at,
                class_info_inherited: false,
                class_info_inherited_from_lesson_number:
                  null,
              },
            }
          : current
      );

      setPlatform(
        result.lesson.platform || ""
      );

      setMaterial(
        result.lesson.material || ""
      );

      setLessonPage(
        result.lesson.lesson_page || ""
      );

      setClassInstructions(
        result.lesson.class_instructions || ""
      );

      setClassInfoMessage(
        "Class information saved successfully."
      );

      setTimeout(() => {
        setClassInfoMessage(null);
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving class information."
      );
    } finally {
      setSavingClassInfo(false);
    }
  }

  async function saveSubstituteTeacher() {
    if (!data) {
      return;
    }

    try {
      setSavingSubstitute(true);
      setSubstituteMessage(null);
      setSubstituteError(null);
      setError(null);

      const response = await fetch(
        `/api/admin/teachers/lessons/${lessonId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            substitute_teacher_id:
              selectedSubstituteTeacher || null,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to update substitute teacher."
        );
      }

      const selectedTeacher =
        selectedSubstituteTeacher
          ? data.substitute_teachers.find(
              (teacher) =>
                teacher.id ===
                selectedSubstituteTeacher
            )
          : null;

      setData((current) =>
        current
          ? {
              ...current,
              lesson: {
                ...current.lesson,
                substitute_teacher_id:
                  result.lesson
                    ?.substitute_teacher_id ??
                  null,
                substitute_teacher:
                  selectedTeacher
                    ? {
                        id: selectedTeacher.id,
                        full_name:
                          selectedTeacher.full_name,
                        teacher_number:
                          selectedTeacher.teacher_number,
                      }
                    : null,
              },
            }
          : current
      );

      setSubstituteMessage(
        selectedSubstituteTeacher
          ? "Substitute teacher assigned successfully."
          : "Substitute teacher removed successfully."
      );

      setTimeout(() => {
        setSubstituteMessage(null);
      }, 3000);
    } catch (err) {
      setSubstituteError(
        err instanceof Error
          ? err.message
          : "Something went wrong while updating the substitute teacher."
      );
    } finally {
      setSavingSubstitute(false);
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
    const text =
      teacherObservation.trim();

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

  function formatLastUpdated(
    dateString: string
  ) {
    const date = new Date(dateString);

    return `${date.toLocaleDateString(
      undefined,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    )} · ${date.toLocaleTimeString(
      undefined,
      {
        hour: "numeric",
        minute: "2-digit",
      }
    )}`;
  }

  function formatStatus(status: string) {
    return status
      .replaceAll("_", " ")
      .replace(
        /\b\w/g,
        (letter) => letter.toUpperCase()
      );
  }

  function formatStudentNumber(
    studentNumber: string | null
  ) {
    if (!studentNumber) {
      return "—";
    }

    return studentNumber.replace(
      /^HK-2026-/,
      "HK-"
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf8f5]">
        <header
          className="
            w-full
            px-6
            pt-7
            sm:px-8
            sm:pt-8
            lg:px-10
            xl:px-12
          "
        >
          <div
            className="
              flex
              w-full
              items-start
              justify-between
              gap-8
            "
          >
            <Link
              href={`/${locale}/admin/teachers/lessons`}
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
              &larr; My Lessons
            </Link>

            <div
              className="
                shrink-0
                text-right
              "
            >
              <p
                className="
                  font-sans
                  text-[16px]
                  font-semibold
                  leading-none
                  tracking-[0.18em]
                  text-[#6F8F72]
                "
              >
                HAMKKE │ 함께
              </p>

              <p
                className="
                  mt-2
                  font-serif
                  text-[13px]
                  font-normal
                  leading-none
                  tracking-[0.02em]
                  text-[#6F8F72]
                "
              >
                From Small Talk to Big Ideas
              </p>
            </div>
          </div>
        </header>
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
        <header
          className="
            w-full
            px-6
            pt-7
            sm:px-8
            sm:pt-8
            lg:px-10
            xl:px-12
          "
        >
          <div
            className="
              flex
              w-full
              items-start
              justify-between
              gap-8
            "
          >
            <Link
              href={`/${locale}/admin/teachers/lessons`}
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
              &larr; My Lessons
            </Link>

            <div
              className="
                shrink-0
                text-right
              "
            >
              <p
                className="
                  font-sans
                  text-[16px]
                  font-semibold
                  leading-none
                  tracking-[0.18em]
                  text-[#6F8F72]
                "
              >
                HAMKKE │ 함께
              </p>

              <p
                className="
                  mt-2
                  font-serif
                  text-[13px]
                  font-normal
                  leading-none
                  tracking-[0.02em]
                  text-[#6F8F72]
                "
              >
                From Small Talk to Big Ideas
              </p>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-5xl px-6 py-12">

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

  const isOwnerOrAdmin =
    data.viewer.role === "owner" ||
    data.viewer.role === "admin";


  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <header
          className="
            w-full
            px-6
            pt-7
            sm:px-8
            sm:pt-8
            lg:px-10
            xl:px-12
          "
        >
          <div
            className="
              flex
              w-full
              items-start
              justify-between
              gap-8
            "
          >
            <Link
              href={`/${locale}/admin/teachers/lessons`}
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
              &larr; My Lessons
            </Link>

            <div
              className="
                shrink-0
                text-right
              "
            >
              <p
                className="
                  font-sans
                  text-[16px]
                  font-semibold
                  leading-none
                  tracking-[0.18em]
                  text-[#6F8F72]
                "
              >
                HAMKKE │ 함께
              </p>

              <p
                className="
                  mt-2
                  font-serif
                  text-[13px]
                  font-normal
                  leading-none
                  tracking-[0.02em]
                  text-[#6F8F72]
                "
              >
                From Small Talk to Big Ideas
              </p>
            </div>
          </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-10 sm:py-12">

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
                      {formatStudentNumber(
                        lesson.student.student_number
                      )}
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

        {/* Top Lesson Information */}
        <div className="mt-9 grid gap-6 lg:grid-cols-2">

          {/* Lesson Overview */}
          <section className="overflow-hidden rounded-[26px] border border-[#e7e1da] bg-white shadow-[0_8px_30px_rgba(70,65,58,0.04)]">
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

            <div className="grid sm:grid-cols-3 lg:grid-cols-1">

              {/* Student */}
              <div className="border-b border-[#eee9e3] px-6 py-5 sm:border-b-0 sm:border-r lg:border-b lg:border-r-0">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#8b918d]">
                  <UserRound size={14} />
                  Student
                </div>

                <p className="mt-2 font-medium text-[#2d2d2d]">
                  {studentName}
                </p>

                {lesson.student?.student_number && (
                  <p className="mt-0.5 text-xs text-[#7b8587]">
                    {formatStudentNumber(
                      lesson.student.student_number
                    )}
                  </p>
                )}
              </div>

              {/* Date */}
              <div className="border-b border-[#eee9e3] px-6 py-5 sm:border-b-0 sm:border-r lg:border-b lg:border-r-0">
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

          {/* Class Info */}
          <section className="rounded-[26px] border border-[#e7e1da] bg-white p-6 shadow-[0_8px_30px_rgba(70,65,58,0.04)] sm:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef3ee] text-[#6f8f72]">
                <MonitorPlay size={18} />
              </div>

              <div>
                <h2 className="font-medium text-[#2d2d2d]">
                  Class Info
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#7b8587]">
                  Keep the information a teacher needs
                  to conduct this class.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">

              {/* Platform */}
              <div>
                <label
                  htmlFor="platform"
                  className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#8b918d]"
                >
                  <MonitorPlay size={13} />
                  Platform
                </label>

                <input
                  id="platform"
                  type="text"
                  value={platform}
                  onChange={(event) => {
                    setPlatform(
                      event.target.value
                    );
                    setClassInfoMessage(null);
                  }}
                  placeholder="e.g. Zoom"
                  className="w-full rounded-xl border border-[#e7e1da] bg-[#fbfaf8] px-4 py-3 text-sm text-[#3c484b] outline-none transition placeholder:text-[#aaa9a5] focus:border-[#9eb19f] focus:bg-white focus:ring-2 focus:ring-[#eef3ee]"
                />
              </div>

              {/* Student Email */}
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#8b918d]">
                  <UserRound size={13} />
                  Student Email
                </div>

                <p className="rounded-xl border border-[#e7e1da] bg-[#fbfaf8] px-4 py-3 text-sm text-[#3c484b]">
                  {lesson.student?.email ||
                    "No email available"}
                </p>
              </div>

              {/* Material */}
              <div>
                <label
                  htmlFor="material"
                  className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#8b918d]"
                >
                  <BookMarked size={13} />
                  Material
                </label>

                <input
                  id="material"
                  type="text"
                  value={material}
                  onChange={(event) => {
                    setMaterial(
                      event.target.value
                    );
                    setClassInfoMessage(null);
                  }}
                  placeholder="e.g. English Conversation Book"
                  className="w-full rounded-xl border border-[#e7e1da] bg-[#fbfaf8] px-4 py-3 text-sm text-[#3c484b] outline-none transition placeholder:text-[#aaa9a5] focus:border-[#9eb19f] focus:bg-white focus:ring-2 focus:ring-[#eef3ee]"
                />
              </div>

              {/* Lesson / Page */}
              <div>
                <label
                  htmlFor="lesson-page"
                  className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#8b918d]"
                >
                  <BookOpen size={13} />
                  Lesson / Page
                </label>

                <input
                  id="lesson-page"
                  type="text"
                  value={lessonPage}
                  onChange={(event) => {
                    setLessonPage(
                      event.target.value
                    );
                    setClassInfoMessage(null);
                  }}
                  placeholder="e.g. Unit 4, pp. 32–33"
                  className="w-full rounded-xl border border-[#e7e1da] bg-[#fbfaf8] px-4 py-3 text-sm text-[#3c484b] outline-none transition placeholder:text-[#aaa9a5] focus:border-[#9eb19f] focus:bg-white focus:ring-2 focus:ring-[#eef3ee]"
                />
              </div>

              {/* Class Instructions */}
              <div>
                <label
                  htmlFor="class-instructions"
                  className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#8b918d]"
                >
                  <ListChecks size={13} />
                  Class Instructions
                </label>

                <textarea
                  id="class-instructions"
                  value={classInstructions}
                  onChange={(event) => {
                    setClassInstructions(
                      event.target.value
                    );
                    setClassInfoMessage(null);
                  }}
                  placeholder="Any specific material or notes the teacher needs."
                  rows={3}
                  className="w-full resize-y rounded-xl border border-[#e7e1da] bg-[#fbfaf8] px-4 py-3 text-sm leading-6 text-[#3c484b] outline-none transition placeholder:text-[#aaa9a5] focus:border-[#9eb19f] focus:bg-white focus:ring-2 focus:ring-[#eef3ee]"
                />
              </div>
            </div>

            {/* Save Class Info */}
            <div className="mt-5 flex flex-col gap-3 border-t border-[#eee9e3] pt-5 sm:flex-row sm:items-center sm:justify-between">
              {lesson.class_info_inherited ? (
                <p className="text-[11px] leading-5 text-[#7f8b80]">
                  Carried over from{" "}
                  <span className="font-medium text-[#5f7f64]">
                    Lesson {lesson.class_info_inherited_from_lesson_number}
                  </span>
                  {lesson.class_info_updated_at
                    ? ` · Last saved ${formatLastUpdated(
                        lesson.class_info_updated_at
                      )}`
                    : ""}
                </p>
              ) : lesson.class_info_updated_at ? (
                <p className="text-[11px] text-[#9a9790]">
                  Last updated:{" "}
                  {formatLastUpdated(
                    lesson.class_info_updated_at
                  )}
                </p>
              ) : (
                <p className="text-[11px] text-[#9a9790]">
                  Class information has not been saved yet.
                </p>
              )}

              <button
                type="button"
                onClick={saveClassInfo}
                disabled={savingClassInfo}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6f8f72] px-5 py-2.5 text-sm font-medium text-white shadow-[0_5px_14px_rgba(111,143,114,0.20)] transition hover:bg-[#628267] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingClassInfo ? (
                  "Saving..."
                ) : (
                  <>
                    <Check size={15} />
                    Save Class Info
                  </>
                )}
              </button>
            </div>

            {classInfoMessage && (
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#5f7f64]">
                <Check size={15} />
                {classInfoMessage}
              </div>
            )}
          </section>
        </div>

        {/* Substitute Teacher */}
        <section className="mt-6 rounded-[26px] border border-[#e7e1da] bg-white p-6 shadow-[0_8px_30px_rgba(70,65,58,0.04)] sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef3ee] text-[#6f8f72]">
                <UserPlus size={18} />
              </div>

              <div>
                <h2 className="font-medium text-[#2d2d2d]">
                  Substitute Teacher
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#7b8587]">
                  Assign a teacher to cover this specific lesson.
                  The student&apos;s regular schedule and teacher assignment
                  will not be changed.
                </p>
              </div>
            </div>

            {lesson.substitute_teacher && (
              <div className="rounded-full border border-[#dce4dc] bg-[#eef3ee] px-4 py-2 text-xs font-medium text-[#5f7f64]">
                Substitute Assigned
              </div>
            )}
          </div>

          {/* Current Substitute */}
          <div className="mt-6 rounded-2xl border border-[#e7e1da] bg-[#fbfaf8] p-5">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#8b918d]">
              <UserRound size={13} />
              Current Substitute
            </div>

            {lesson.substitute_teacher ? (
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-[#2d2d2d]">
                    {lesson.substitute_teacher.full_name ||
                      "Teacher"}
                  </p>

                  {lesson.substitute_teacher.teacher_number && (
                    <p className="mt-0.5 text-xs text-[#7b8587]">
                      {lesson.substitute_teacher.teacher_number}
                    </p>
                  )}
                </div>

                {isOwnerOrAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSubstituteTeacher("");
                      setSubstituteMessage(null);
                      setSubstituteError(null);
                    }}
                    className="inline-flex w-fit items-center justify-center gap-2 rounded-full border border-[#e2d4ce] bg-white px-4 py-2 text-xs font-medium text-[#806c66] transition hover:border-[#cdbbb3] hover:bg-[#fcf8f6]"
                  >
                    <X size={14} />
                    Remove
                  </button>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-[#8b918d]">
                No substitute teacher is currently assigned.
              </p>
            )}
          </div>

          {/* Owner/Admin Assignment Controls */}
          {isOwnerOrAdmin && (
            <div className="mt-5 border-t border-[#eee9e3] pt-5">
              <div>
                <label
                  htmlFor="substitute-teacher"
                  className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-[#8b918d]"
                >
                  <UserPlus size={13} />
                  Assign Substitute
                </label>

                <select
                  id="substitute-teacher"
                  value={selectedSubstituteTeacher}
                  onChange={(event) => {
                    setSelectedSubstituteTeacher(
                      event.target.value
                    );
                    setSubstituteMessage(null);
                    setSubstituteError(null);
                  }}
                  disabled={savingSubstitute}
                  className="w-full rounded-xl border border-[#e7e1da] bg-[#fbfaf8] px-4 py-3 text-sm text-[#3c484b] outline-none transition focus:border-[#9eb19f] focus:bg-white focus:ring-2 focus:ring-[#eef3ee]"
                >
                  <option value="">
                    No substitute
                  </option>

                  {data.substitute_teachers.map(
                    (teacher) => (
                      <option
                        key={teacher.id}
                        value={teacher.id}
                        disabled={!teacher.available}
                      >
                        {teacher.full_name ||
                          "Teacher"}
                        {teacher.teacher_number
                          ? ` · ${teacher.teacher_number}`
                          : ""}
                        {teacher.available
                          ? " · Available"
                          : " · Not available"}
                      </option>
                    )
                  )}
                </select>

                <p className="mt-2 text-xs leading-5 text-[#8b918d]">
                  Availability is checked against this lesson&apos;s
                  scheduled time in Philippine Time. Teachers who are
                  unavailable for the full lesson are disabled.
                </p>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={saveSubstituteTeacher}
                  disabled={savingSubstitute}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6f8f72] px-6 py-3 text-sm font-medium text-white shadow-[0_5px_14px_rgba(111,143,114,0.20)] transition hover:bg-[#628267] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingSubstitute ? (
                    "Saving..."
                  ) : (
                    <>
                      <Check size={16} />
                      Save Substitute
                    </>
                  )}
                </button>

                {substituteMessage && (
                  <div className="flex items-center gap-2 text-sm font-medium text-[#5f7f64]">
                    <Check size={15} />
                    {substituteMessage}
                  </div>
                )}
              </div>

              {substituteError && (
                <div className="mt-4 rounded-xl border border-[#eadbd5] bg-[#fcf6f4] px-4 py-3">
                  <p className="text-sm text-[#9a5f56]">
                    {substituteError}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Teacher View */}
          {!isOwnerOrAdmin &&
            lesson.substitute_teacher && (
              <div className="mt-5 border-t border-[#eee9e3] pt-5">
                <p className="text-xs leading-5 text-[#8b918d]">
                  This lesson is currently assigned to{" "}
                  <span className="font-medium text-[#5f7064]">
                    {lesson.substitute_teacher.full_name ||
                      "a substitute teacher"}
                  </span>{" "}
                  as its substitute.
                </p>
              </div>
            )}
        </section>

        {/* Attendance */}
        <section className="mt-6 rounded-[26px] border border-[#e7e1da] bg-white p-6 shadow-[0_8px_30px_rgba(70,65,58,0.04)] sm:p-7">
          <div className="flex items-start justify-between gap-5">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef3ee] text-[#6f8f72]">
                  <ClipboardCheck size={18} />
                </div>

                <div>
                  <h2 className="font-medium text-[#2d2d2d]">
                    Attendance
                  </h2>

                  <p className="mt-1 text-sm text-[#7b8587]">
                    Record what happened in this lesson.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#8b918d]">
                  Current status
                </span>

                <span className="rounded-full border border-[#dce4dc] bg-[#eef3ee] px-3 py-1 text-xs font-medium text-[#5f7f64]">
                  {formatStatus(lesson.attendance_status)}
                </span>
              </div>
            </div>

            <TeacherLessonActions
              lessonId={lesson.id}
              currentStatus={lesson.attendance_status}
              currentLessonDate={lesson.lesson_date}
            />
          </div>

          <div className="mt-6 border-t border-[#eee9e3] pt-5">
            <p className="text-xs leading-5 text-[#8b918d]">
              Use the lesson actions menu to mark the lesson as completed,
              record a no-show or late cancellation, reschedule a student
              cancellation, return a lesson as credit, or record an unexpected
              circumstance.
            </p>
          </div>
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