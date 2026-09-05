"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface TeacherLesson {
  id: string;
  enrollment_id: string;
  enrollment_student_id: string;
  lesson_number: number;
  lesson_date: string;
  schedule_time: string | null;
  philippine_date: string;
  philippine_time: string | null;
  scheduled_at_philippine: string | null;
  student_timezone: string | null;
  duration: number;
  attendance_status: string;
  consumes_lesson: boolean;
  actual_teacher_id: string | null;
  student: {
    id: string;
    student_number: string | null;
    full_name: string | null;
    preferred_name: string | null;
    timezone: string | null;
  } | null;
  enrollment: {
    id: string;
    package_name: string | null;
    status: string;
  } | null;
}

interface TeacherLessonsResponse {
  teacher: {
    id: string;
    full_name: string | null;
  };
  lessons: TeacherLesson[];
}

interface TeacherLessonsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

const DAYS = [
  { key: "sun", label: "Sun" },
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
];

/*
 * Calendar settings
 *
 * The visible calendar starts at 5:00 AM
 * and uses 30-minute intervals.
 *
 * 30-minute grid = 1 interval
 * 60-minute lesson = 2 intervals
 *
 * Lesson positions still use their exact start minute.
 * For example, 9:30 PM appears exactly at 21:30.
 */

const START_HOUR = 5;
const END_HOUR = 24;

const INTERVAL_MINUTES = 30;
const INTERVAL_HEIGHT = 42;

const START_MINUTES = START_HOUR * 60;
const END_MINUTES = END_HOUR * 60;

const TOTAL_MINUTES =
  END_MINUTES - START_MINUTES;

const INTERVALS = Array.from(
  {
    length: TOTAL_MINUTES / INTERVAL_MINUTES,
  },
  (_, index) => index
);

function getStartOfWeek(date: Date) {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  const day = result.getDay();

  result.setDate(
    result.getDate() - day
  );

  return result;
}

function addDays(
  date: Date,
  amount: number
) {
  const result = new Date(date);

  result.setDate(
    result.getDate() + amount
  );

  return result;
}

function dateKey(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatWeekRange(date: Date) {
  const start =
    getStartOfWeek(date);

  const end = addDays(
    start,
    6
  );

  const startText =
    start.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );

  const endText =
    end.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );

  return `${startText} – ${endText}`;
}

function formatInterval(index: number) {
  const totalMinutes =
    START_MINUTES +
    index * INTERVAL_MINUTES;

  const hour = Math.floor(
    totalMinutes / 60
  );

  const minute =
    totalMinutes % 60;

  return `${String(hour).padStart(
    2,
    "0"
  )}:${String(minute).padStart(
    2,
    "0"
  )}`;
}

function getEventHour(
  lesson: TeacherLesson
) {
  if (!lesson.philippine_time) {
    return null;
  }

  const [hour] =
    lesson.philippine_time
      .split(":")
      .map(Number);

  return Number.isFinite(hour)
    ? hour
    : null;
}

function getEventMinute(
  lesson: TeacherLesson
) {
  if (!lesson.philippine_time) {
    return 0;
  }

  const [, minute] =
    lesson.philippine_time
      .split(":")
      .map(Number);

  return Number.isFinite(minute)
    ? minute
    : 0;
}

function formatDayDate(date: Date) {
  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  );
}

export default function TeacherLessonsPage({
  params,
}: TeacherLessonsPageProps) {
  const { locale } = use(params);

  const [data, setData] =
    useState<TeacherLessonsResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [currentWeek, setCurrentWeek] =
    useState(() =>
      getStartOfWeek(new Date())
    );

  useEffect(() => {
    async function loadLessons() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "/api/admin/teachers/lessons",
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
              "Failed to load lessons."
          );
        }

        setData(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading teacher lessons."
        );
      } finally {
        setLoading(false);
      }
    }

    loadLessons();
  }, []);

  const lessons = data?.lessons ?? [];

  const weekDays = useMemo(() => {
    const start =
      getStartOfWeek(currentWeek);

    return DAYS.map(
      (day, index) => ({
        ...day,
        date: addDays(
          start,
          index
        ),
      })
    );
  }, [currentWeek]);

  const weekStart =
    getStartOfWeek(currentWeek);

  const weekEnd = addDays(
    weekStart,
    6
  );

  const visibleLessons =
    useMemo(() => {
      const startKey =
        dateKey(weekStart);

      const endKey =
        dateKey(weekEnd);

      return lessons.filter(
        (lesson) =>
          lesson.philippine_date >=
            startKey &&
          lesson.philippine_date <=
            endKey
      );
    }, [
      lessons,
      weekStart,
      weekEnd,
    ]);

  function goToPreviousWeek() {
    setCurrentWeek((current) =>
      addDays(current, -7)
    );
  }

  function goToNextWeek() {
    setCurrentWeek((current) =>
      addDays(current, 7)
    );
  }

  function goToToday() {
    setCurrentWeek(
      getStartOfWeek(new Date())
    );
  }

  function getLessonsForDay(
    dayDate: Date
  ) {
    const key = dateKey(dayDate);

    return visibleLessons.filter(
      (lesson) =>
        lesson.philippine_date ===
        key
    );
  }

  const Brand = () => (
    <Link
      href={`/${locale}/admin`}
      className="group block text-right transition-opacity hover:opacity-70"
    >
      <p className="text-sm font-medium tracking-[0.18em] text-[#6f8f72]">
        HAMKKE │ 함께
      </p>

      <p className="mt-1 text-[11px] tracking-[0.08em] text-[#6f8f72]/75">
        From Small Talk to Big Ideas
      </p>
    </Link>
  );

  /* --------------------------------
     Loading
  -------------------------------- */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f6f1]">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-10">

          <div className="flex items-start justify-between gap-8">

            <div className="min-w-0">

              <Link
                href={`/${locale}/admin`}
                className="mb-5 inline-flex items-center text-sm text-[#7b7d77] transition-colors hover:text-[#6f8f72]"
              >
                ← Back to Dashboard
              </Link>

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e5ece4] text-[#6f8f72]">
                  <BookOpen
                    size={20}
                    strokeWidth={1.8}
                  />
                </div>

                <div>

                  <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-[#8a8c86]">
                    Teacher
                  </p>

                  <h1 className="text-3xl font-semibold tracking-tight text-[#30332f]">
                    My Lessons
                  </h1>

                </div>

              </div>

            </div>

            {/* Brand aligned with Teacher */}

            <div className="shrink-0 pt-[52px]">
              <Brand />
            </div>

          </div>

          <div className="mt-10 rounded-2xl border border-[#dedfd9] bg-[#fffefa] p-12 text-center shadow-[0_4px_20px_rgba(50,55,45,0.035)]">

            <p className="text-sm text-[#777a74]">
              Loading your lessons...
            </p>

          </div>

        </div>
      </main>
    );
  }

  /* --------------------------------
     Error
  -------------------------------- */

  if (error) {
    return (
      <main className="min-h-screen bg-[#f7f6f1]">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-10">

          <div className="flex items-start justify-between gap-8">

            <div className="min-w-0">

              <Link
                href={`/${locale}/admin`}
                className="mb-5 inline-flex items-center text-sm text-[#7b7d77] transition-colors hover:text-[#6f8f72]"
              >
                ← Back to Dashboard
              </Link>

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e5ece4] text-[#6f8f72]">
                  <BookOpen
                    size={20}
                    strokeWidth={1.8}
                  />
                </div>

                <div>

                  <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-[#8a8c86]">
                    Teacher
                  </p>

                  <h1 className="text-3xl font-semibold tracking-tight text-[#30332f]">
                    My Lessons
                  </h1>

                </div>

              </div>

            </div>

            {/* Brand aligned with Teacher */}

            <div className="shrink-0 pt-[52px]">
              <Brand />
            </div>

          </div>

          <div className="mt-10 rounded-2xl border border-[#e6d6d1] bg-[#fffaf8] px-5 py-4">

            <p className="text-sm text-[#a45f58]">
              {error}
            </p>

          </div>

        </div>
      </main>
    );
  }

  /* --------------------------------
     Main
  -------------------------------- */

  return (
    <main className="min-h-screen bg-[#f7f6f1] text-[#30332f]">

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-10">

        {/* --------------------------------
            Header
        -------------------------------- */}

        <div className="mb-9 flex items-start justify-between gap-8">

          <div className="min-w-0">

            <Link
              href={`/${locale}/admin`}
              className="mb-5 inline-flex items-center text-sm text-[#7b7d77] transition-colors hover:text-[#6f8f72]"
            >
              ← Back to Dashboard
            </Link>

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e5ece4] text-[#6f8f72]">
                <BookOpen
                  size={20}
                  strokeWidth={1.8}
                />
              </div>

              <div>

                <p className="mb-1 text-xs font-medium uppercase tracking-[0.16em] text-[#8a8c86]">
                  Teacher
                </p>

                <h1 className="text-3xl font-semibold tracking-tight text-[#30332f]">
                  My Lessons
                </h1>

                {data?.teacher?.full_name && (
                  <p className="mt-2 text-sm text-[#73756f]">
                    Welcome back,{" "}
                    <span className="font-medium text-[#4d514b]">
                      {data.teacher.full_name}
                    </span>
                  </p>
                )}

              </div>

            </div>

          </div>

          {/* Brand aligned with Teacher */}

          <div className="shrink-0 pt-[52px]">
            <Brand />
          </div>

        </div>

        {/* --------------------------------
            Calendar Introduction
        -------------------------------- */}

        <div className="mb-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#8a8c86]">
              Weekly Schedule
            </p>

            <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#30332f]">
              {formatWeekRange(
                currentWeek
              )}
            </h2>

            <p className="mt-1.5 text-xs text-[#898b85]">
              Philippine Time · Asia/Manila
            </p>

          </div>

          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={goToToday}
              className="rounded-xl border border-[#d9ddd5] bg-[#fffefa] px-4 py-2 text-sm font-medium text-[#596057] shadow-[0_2px_8px_rgba(50,55,45,0.025)] transition-colors hover:border-[#cbd5ca] hover:bg-[#eef2ed] hover:text-[#6f8f72]"
            >
              Today
            </button>

            <div className="flex overflow-hidden rounded-xl border border-[#d9ddd5] bg-[#fffefa] shadow-[0_2px_8px_rgba(50,55,45,0.025)]">

              <button
                type="button"
                onClick={
                  goToPreviousWeek
                }
                aria-label="Previous week"
                className="flex h-9 w-9 items-center justify-center border-r border-[#e4e6e0] text-[#73766f] transition-colors hover:bg-[#eef2ed] hover:text-[#6f8f72]"
              >
                <ChevronLeft
                  size={18}
                  strokeWidth={1.7}
                />
              </button>

              <button
                type="button"
                onClick={
                  goToNextWeek
                }
                aria-label="Next week"
                className="flex h-9 w-9 items-center justify-center text-[#73766f] transition-colors hover:bg-[#eef2ed] hover:text-[#6f8f72]"
              >
                <ChevronRight
                  size={18}
                  strokeWidth={1.7}
                />
              </button>

            </div>

          </div>

        </div>

        {/* --------------------------------
            No Lessons
        -------------------------------- */}

        {lessons.length === 0 ? (

          <div className="rounded-2xl border border-[#dedfd9] bg-[#fffefa] p-12 text-center shadow-[0_4px_20px_rgba(50,55,45,0.035)]">

            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#e9eee8] text-[#6f8f72]">
              <BookOpen
                size={21}
                strokeWidth={1.7}
              />
            </div>

            <h2 className="text-lg font-medium text-[#30332f]">
              No lessons assigned yet
            </h2>

            <p className="mt-1.5 text-sm text-[#858780]">
              Your assigned lessons will appear here.
            </p>

          </div>

        ) : (

          /* --------------------------------
             Calendar
          -------------------------------- */

          <div className="overflow-hidden rounded-2xl border border-[#dedfd9] bg-[#fffefa] shadow-[0_5px_24px_rgba(50,55,45,0.04)]">

            {/* Day Header */}

            <div className="grid grid-cols-[68px_repeat(7,minmax(120px,1fr))] border-b border-[#dedfd9] bg-[#fafaf6]">

              <div className="border-r border-[#e9eae5]" />

              {weekDays.map(
                (day) => {

                  const isToday =
                    dateKey(
                      day.date
                    ) ===
                    dateKey(
                      new Date()
                    );

                  return (
                    <div
                      key={day.key}
                      className={`border-r border-[#e9eae5] px-3 py-3.5 text-center last:border-r-0 ${
                        isToday
                          ? "bg-[#f0f4ee]"
                          : ""
                      }`}
                    >

                      <p
                        className={`text-[10px] font-medium uppercase tracking-[0.16em] ${
                          isToday
                            ? "text-[#6f8f72]"
                            : "text-[#999b95]"
                        }`}
                      >
                        {day.label}
                      </p>

                      <p
                        className={`mt-1 text-sm font-medium ${
                          isToday
                            ? "text-[#55725a]"
                            : "text-[#555952]"
                        }`}
                      >
                        {formatDayDate(
                          day.date
                        )}
                      </p>

                    </div>
                  );
                }
              )}

            </div>

            {/* Calendar Body */}

            <div className="overflow-x-auto">

              <div
                className="grid min-w-[960px] grid-cols-[68px_repeat(7,minmax(120px,1fr))]"
                style={{
                  height:
                    INTERVALS.length *
                    INTERVAL_HEIGHT,
                }}
              >

                {/* Time Column */}

                <div className="relative border-r border-[#e7e8e3] bg-[#fafaf7]">

                  {INTERVALS.map(
                    (interval) => (

                      <div
                        key={interval}
                        className="absolute left-0 right-0 pr-3 text-right text-[10px] font-medium tabular-nums text-[#999b95]"
                        style={{
                          top:
                            interval *
                              INTERVAL_HEIGHT -
                            6,
                        }}
                      >
                        {formatInterval(
                          interval
                        )}
                      </div>

                    )
                  )}

                </div>

                {/* Day Columns */}

                {weekDays.map(
                  (day) => {

                    const dayLessons =
                      getLessonsForDay(
                        day.date
                      );

                    const isToday =
                      dateKey(
                        day.date
                      ) ===
                      dateKey(
                        new Date()
                      );

                    return (
                      <div
                        key={day.key}
                        className={`relative border-r border-[#e7e8e3] last:border-r-0 ${
                          isToday
                            ? "bg-[#fcfdf9]"
                            : "bg-[#fffefa]"
                        }`}
                      >

                        {/* 30-Minute Grid Lines */}

                        {INTERVALS.map(
                          (interval) => (

                            <div
                              key={interval}
                              className="absolute left-0 right-0 border-t border-[#eeeeea]"
                              style={{
                                top:
                                  interval *
                                  INTERVAL_HEIGHT,
                              }}
                            />

                          )
                        )}

                        {/* Lessons */}

                        {dayLessons.map(
                          (lesson) => {

                            const hour =
                              getEventHour(
                                lesson
                              );

                            if (
                              hour ===
                              null
                            ) {
                              return null;
                            }

                            const minute =
                              getEventMinute(
                                lesson
                              );

                            const startMinutes =
                              hour * 60 +
                              minute;

                            /*
                             * Translate the actual lesson
                             * time into the visible calendar
                             * starting at 5:00 AM.
                             *
                             * Example:
                             * 05:00 = 0px
                             * 05:30 = 42px
                             * 21:30 = 1386px
                             */

                            const top =
                              ((startMinutes -
                                START_MINUTES) /
                                INTERVAL_MINUTES) *
                              INTERVAL_HEIGHT;

                            const height =
                              Math.max(
                                38,
                                (lesson.duration /
                                  INTERVAL_MINUTES) *
                                  INTERVAL_HEIGHT
                              );

                            /*
                             * Don't render lessons that
                             * fall outside the visible
                             * 5:00 AM–midnight range.
                             */

                            if (
                              startMinutes <
                                START_MINUTES ||
                              startMinutes >=
                                END_MINUTES
                            ) {
                              return null;
                            }

                            const studentName =
                              lesson
                                .student
                                ?.preferred_name ||
                              lesson
                                .student
                                ?.full_name ||
                              "Student";

                            return (
                              <Link
                                key={`${lesson.id}-${lesson.enrollment_student_id}`}
                                href={`/${locale}/admin/teachers/lessons/${lesson.id}`}
                                aria-label={`Open lesson for ${studentName}`}
                                className="group absolute left-1.5 right-1.5 z-10 overflow-hidden rounded-lg border border-[#d3ded2] bg-[#edf2eb] px-3 py-2 transition-all duration-150 hover:-translate-y-px hover:border-[#b9cbb9] hover:bg-[#e5ece3] hover:shadow-[0_4px_12px_rgba(50,55,45,0.07)]"
                                style={{
                                  top,
                                  height,
                                }}
                              >

                                <p className="truncate text-sm font-medium text-[#56705a]">
                                  {studentName}
                                </p>

                              </Link>
                            );
                          }
                        )}

                      </div>
                    );
                  }
                )}

              </div>

            </div>

          </div>
        )}

        {/* --------------------------------
            Footer Note
        -------------------------------- */}

        {lessons.length > 0 && (
          <div className="mt-4 flex flex-col gap-1 text-[11px] tracking-wide text-[#969891] sm:flex-row sm:items-center sm:justify-between">

            <p>
              Schedule shown in Philippine Time.
            </p>

            <p>
              Student schedules remain stored in their own timezone.
            </p>

          </div>
        )}

      </div>
    </main>
  );
}