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

interface AvailabilityBlock {
  id: string;
  teacher_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at?: string;
  updated_at?: string;
}

interface AvailabilityResponse {
  teacher: {
    id: string;
    full_name: string | null;
  };
  availability: AvailabilityBlock[];
}

interface TeacherLessonsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

const DAYS = [
  { key: "sun", label: "Sun", dayOfWeek: 0 },
  { key: "mon", label: "Mon", dayOfWeek: 1 },
  { key: "tue", label: "Tue", dayOfWeek: 2 },
  { key: "wed", label: "Wed", dayOfWeek: 3 },
  { key: "thu", label: "Thu", dayOfWeek: 4 },
  { key: "fri", label: "Fri", dayOfWeek: 5 },
  { key: "sat", label: "Sat", dayOfWeek: 6 },
];

const START_HOUR = 5;
const END_HOUR = 24;

const INTERVAL_MINUTES = 30;
const INTERVAL_HEIGHT = 42;

const START_MINUTES = START_HOUR * 60;
const END_MINUTES = END_HOUR * 60;

const INTERVALS = Array.from(
  {
    length:
      (END_MINUTES - START_MINUTES) /
      INTERVAL_MINUTES,
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

function formatTime(
  time: string
) {
  const [hourString, minuteString] =
    time.split(":");

  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return time;
  }

  const period =
    hour >= 12 ? "PM" : "AM";

  const displayHour =
    hour % 12 || 12;

  return `${displayHour}:${String(
    minute
  ).padStart(2, "0")} ${period}`;
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

  return formatTime(
    `${String(hour).padStart(
      2,
      "0"
    )}:${String(minute).padStart(
      2,
      "0"
    )}`
  );
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

function timeToMinutes(
  value: string
) {
  const [hourString, minuteString] =
    value.split(":");

  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return null;
  }

  return (
    hour * 60 +
    minute
  );
}

function getLessonStartMinutes(
  lesson: TeacherLesson
) {
  if (!lesson.philippine_time) {
    return null;
  }

  return timeToMinutes(
    lesson.philippine_time
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

  const [availability, setAvailability] =
    useState<AvailabilityBlock[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [currentWeek, setCurrentWeek] =
    useState(() =>
      getStartOfWeek(new Date())
    );

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [
          lessonsResponse,
          availabilityResponse,
        ] = await Promise.all([
          fetch(
            "/api/admin/teachers/lessons",
            {
              method: "GET",
              cache: "no-store",
            }
          ),
          fetch(
            "/api/admin/teachers/availability",
            {
              method: "GET",
              cache: "no-store",
            }
          ),
        ]);

        const lessonsResult =
          await lessonsResponse.json();

        const availabilityResult =
          await availabilityResponse.json();

        if (!lessonsResponse.ok) {
          throw new Error(
            lessonsResult.error ||
              "Failed to load lessons."
          );
        }

        if (!availabilityResponse.ok) {
          throw new Error(
            availabilityResult.error ||
              "Failed to load teacher availability."
          );
        }

        setData(
          lessonsResult
        );

        setAvailability(
          availabilityResult.availability ??
            []
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading the teacher calendar."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const lessons =
    data?.lessons ?? [];

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

  function isSlotAvailable(
    dayOfWeek: number,
    slotStartMinutes: number
  ) {
    const slotEndMinutes =
      slotStartMinutes +
      INTERVAL_MINUTES;

    const blocks =
      availability.filter(
        (block) =>
          block.day_of_week ===
          dayOfWeek
      );

    if (blocks.length === 0) {
      return false;
    }

    return blocks.some(
      (block) => {
        const start =
          timeToMinutes(
            block.start_time
          );

        const end =
          timeToMinutes(
            block.end_time
          );

        if (
          start === null ||
          end === null
        ) {
          return false;
        }

        return (
          slotStartMinutes >=
            start &&
          slotEndMinutes <= end
        );
      }
    );
  }

  function getDayAvailabilityClass(
    dayOfWeek: number,
    interval: number
  ) {
    const slotStartMinutes =
      START_MINUTES +
      interval * INTERVAL_MINUTES;

    const available =
      isSlotAvailable(
        dayOfWeek,
        slotStartMinutes
      );

    return available
      ? "bg-[#E4F0E3]"
      : "bg-[#F3D9D5]";
  }

  function getLessonPosition(
    lesson: TeacherLesson
  ) {
    const startMinutes =
      getLessonStartMinutes(
        lesson
      );

    if (startMinutes === null) {
      return null;
    }

    const top =
      ((startMinutes -
        START_MINUTES) /
        INTERVAL_MINUTES) *
      INTERVAL_HEIGHT;

    const height = Math.max(
      38,
      (lesson.duration /
        INTERVAL_MINUTES) *
        INTERVAL_HEIGHT
    );

    if (
      startMinutes <
        START_MINUTES ||
      startMinutes >=
        END_MINUTES
    ) {
      return null;
    }

    return {
      top,
      height,
    };
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
                href={`/${locale}/admin/teachers`}
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

            <div className="shrink-0 pt-[52px]">
              <Brand />
            </div>

          </div>

          <div className="mt-10 border-y border-[#dcd8d2] bg-[#fffefa] p-12 text-center">

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
                href={`/${locale}/admin/teachers`}
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

            <div className="shrink-0 pt-[52px]">
              <Brand />
            </div>

          </div>

          <div className="mt-10 border border-[#e6d6d1] bg-[#fffaf8] px-5 py-4">

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
              href={`/${locale}/admin/teachers`}
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
              className="border border-[#d9ddd5] bg-[#fffefa] px-4 py-2 text-sm font-medium text-[#596057] transition-colors hover:bg-[#eef2ed] hover:text-[#6f8f72]"
            >
              Today
            </button>

            <div className="flex overflow-hidden border border-[#d9ddd5] bg-[#fffefa]">

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
            No Lessons / Calendar
        -------------------------------- */}

        {lessons.length === 0 &&
        availability.length === 0 ? (

          <div className="border-y border-[#dcd8d2] bg-[#fffefa] p-12 text-center">

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
             Owner-Style Weekly Calendar
          -------------------------------- */

          <div className="overflow-x-auto border-y border-[#dcd8d2] bg-[#fffefa]">

            <div className="min-w-[980px]">

              {/* Day Header */}

              <div className="grid grid-cols-[78px_repeat(7,minmax(0,1fr))] border-b border-[#dcd8d2] bg-[#faf8f5]">

                <div className="border-r border-[#e4e1dc]" />

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
                        className={`border-r border-[#e4e1dc] px-2 py-3 text-center last:border-r-0 ${
                          isToday
                            ? "bg-[#f1f4ee]"
                            : ""
                        }`}
                      >

                        <p
                          className={`text-[10px] font-medium uppercase tracking-[0.16em] ${
                            isToday
                              ? "text-[#6f8f72]"
                              : "text-[#8b8d87]"
                          }`}
                        >
                          {day.label}
                        </p>

                        <p
                          className={`mt-1 text-xs font-medium ${
                            isToday
                              ? "text-[#55725a]"
                              : "text-[#666a63]"
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

              <div className="grid grid-cols-[78px_repeat(7,minmax(0,1fr))]">

                {/* Time Column */}

                <div className="border-r border-[#e4e1dc] bg-[#faf8f5]">

                  {INTERVALS.map(
                    (interval) => (

                      <div
                        key={interval}
                        className="flex h-[42px] items-center justify-end border-b border-[#e9e6e1] pr-2"
                      >

                        <span className="text-[10px] font-medium tabular-nums text-[#999b95]">
                          {formatInterval(
                            interval
                          )}
                        </span>

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
                        className={`relative border-r border-[#e4e1dc] last:border-r-0 ${
                          isToday
                            ? "bg-[#fcfdf9]"
                            : ""
                        }`}
                      >

                        {/* Availability Grid */}

                        {INTERVALS.map(
                          (interval) => {

                            const availabilityClass =
                              getDayAvailabilityClass(
                                day.dayOfWeek,
                                interval
                              );

                            return (
                              <div
                                key={interval}
                                className={`relative h-[42px] border-b border-[#e9e6e1] p-[3px] ${availabilityClass}`}
                              />
                            );
                          }
                        )}

                        {/* Scheduled Lessons */}

                        {dayLessons.map(
                          (lesson) => {

                            const position =
                              getLessonPosition(
                                lesson
                              );

                            if (
                              !position
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
                                key={lesson.id}
                                href={`/${locale}/admin/teachers/lessons/${lesson.id}`}
                                aria-label={`Open lesson ${lesson.lesson_number} for ${studentName}`}
                                className="group absolute left-1 right-1 z-20 overflow-hidden border border-[#d9be6a] bg-[#f3e8b8] px-2 py-1.5 transition-colors hover:border-[#c9aa4d] hover:bg-[#eddfa7]"
                                style={{
                                  top: position.top + 3,
                                  height:
                                    position.height - 6,
                                }}
                              >

                                <p className="truncate text-[11px] leading-tight text-[#665a31]">
                                  <span className="font-bold">
                                    {studentName}
                                  </span>{" "}
                                  - Lesson{" "}
                                  {
                                    lesson.lesson_number
                                  }{" "}
                                  {
                                    lesson.duration
                                  }{" "}
                                  min.
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
            Legend / Footer
        -------------------------------- */}

        {(lessons.length > 0 ||
          availability.length > 0) && (
          <div className="mt-4 flex flex-col gap-3 text-[11px] tracking-wide text-[#969891] lg:flex-row lg:items-center lg:justify-between">

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">

              <div className="flex items-center gap-2">

                <span className="h-3 w-3 border border-[#b7cdb5] bg-[#e4f0e3]" />

                <span>
                  Available
                </span>

              </div>

              <div className="flex items-center gap-2">

                <span className="h-3 w-3 border border-[#d9be6a] bg-[#f3e8b8]" />

                <span>
                  Scheduled
                </span>

              </div>

              <div className="flex items-center gap-2">

                <span className="h-3 w-3 border border-[#d2aaa4] bg-[#f3d9d5]" />

                <span>
                  Unavailable
                </span>

              </div>

            </div>

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