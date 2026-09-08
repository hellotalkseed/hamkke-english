"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import TeacherAgreement from "@/components/admin/TeacherAgreement";

/* ========================================================================= */
/* TYPES                                                                     */
/* ========================================================================= */

type ScheduleItem = {
  day_of_week: number;
  schedule_time: string;
};

type Teacher = {
  id: string;
  full_name: string | null;
  role: string;
  status: string;
  created_at: string;
  email: string | null;
  teacher_number?: string | null;
  avatar_path?: string | null;
  avatar_url?: string | null;
};

type Assignment = {
  id: string;
  enrollment_student_id: string;
  teacher_id: string;
  start_date: string;
  end_date: string | null;
  status: string;

  student: {
    id: string;
    student_number: string | null;
    full_name: string | null;
    preferred_name: string | null;
    timezone?: string | null;
  } | null;

  enrollment: {
    id: string;
    package_name: string | null;
    status: string;
    lesson_duration?: number | null;
  } | null;

  /*
   * Actual recurring schedule in the student's timezone.
   */
  schedule?: ScheduleItem[];
  schedules?: ScheduleItem[];

  /*
   * Converted recurring schedule in Philippine Time.
   *
   * This is ONLY used by the teacher calendar.
   */
  pht_schedules?: ScheduleItem[];

  timezone?: string | null;
};

type AvailableEnrollment = {
  enrollment_student_id: string;
  enrollment_id: string;
  student_id: string;

  student: {
    id: string;
    student_number: string | null;
    full_name: string | null;
    preferred_name: string | null;
    timezone?: string | null;
  } | null;

  enrollment: {
    id: string;
    package_name: string | null;
    status: string;
    lesson_duration?: number | null;
  } | null;

  schedules?: ScheduleItem[];
  schedule?: ScheduleItem[];

  timezone?: string | null;
};

type AvailabilityBlock = {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

type SubAvailabilityBlock = {
  id?: string;
  availability_date: string;
  start_time: string;
  end_time: string;
};

type CalendarDay = {
  day_of_week: number;
  label: string;
  date: string;
  displayDate: string;
};

type TeacherLessonProgress = {
  enrollment_id: string;
  lesson_number: number;
  consumes_lesson: boolean;
};

/* ========================================================================= */
/* CONSTANTS                                                                 */
/* ========================================================================= */

const DAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

const START_HOUR = 5;
const END_HOUR = 24;
const INTERVAL_MINUTES = 30;

/* ========================================================================= */
/* ICONS                                                                     */
/* ========================================================================= */


function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[17px] w-[17px]"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[17px] w-[17px]"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
      className="h-[17px] w-[17px]"
      aria-hidden="true"
    >
      <path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v10a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V6" />
      <path d="M16 14h.01" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[14px] w-[14px]"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function PlusIcon() {
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
      <path d="M12 5v14" />
      <path d="M5 12h14" />
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

function createTimeSlots() {
  const slots: string[] = [];

  for (
    let minutes = START_HOUR * 60;
    minutes < END_HOUR * 60;
    minutes += INTERVAL_MINUTES
  ) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    slots.push(
      `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
    );
  }

  return slots;
}

function normalizeTime(time: string | null | undefined) {
  if (!time) {
    return "";
  }

  const value = String(time).trim();

  const match = value.match(/^(\d{1,2}):(\d{2})/);

  if (!match) {
    return value.slice(0, 5);
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 24 ||
    minute < 0 ||
    minute > 59
  ) {
    return "";
  }

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(
    2,
    "0"
  )}`;
}

function formatTime(time: string | null | undefined) {
  if (!time) {
    return "—";
  }

  const normalized = normalizeTime(time);

  if (!normalized) {
    return time;
  }

  const [hourString, minuteString] = normalized.split(":");

  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return time;
  }

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`;
}

function timeToMinutes(time: string | null | undefined) {
  if (!time) {
    return NaN;
  }

  const normalized = normalizeTime(time);

  if (!normalized) {
    return NaN;
  }

  const [hours, minutes] = normalized.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return NaN;
  }

  return hours * 60 + minutes;
}

function getPhilippineToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDateKey(date: Date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function addDays(dateKey: string, days: number) {
  const date = parseDateKey(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDateKey(date);
}

function getWeekStart(dateKey: string) {
  const date = parseDateKey(dateKey);
  const day = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() - day);
  return formatDateKey(date);
}

function formatCalendarDate(dateKey: string) {
  const date = parseDateKey(dateKey);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatWeekRange(weekStart: string) {
  const start = parseDateKey(weekStart);
  const end = parseDateKey(addDays(weekStart, 6));
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const sameMonth = sameYear && start.getUTCMonth() === end.getUTCMonth();

  if (sameMonth) {
    return `${new Intl.DateTimeFormat("en-US", {
      month: "short",
      timeZone: "UTC",
    }).format(start)} ${start.getUTCDate()}–${end.getUTCDate()}, ${start.getUTCFullYear()}`;
  }

  const format = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  if (sameYear) {
    return `${format.format(start)} – ${format.format(end)}, ${end.getUTCFullYear()}`;
  }

  return `${format.format(start)}, ${start.getUTCFullYear()} – ${format.format(end)}, ${end.getUTCFullYear()}`;
}

function normalizeSubAvailability(
  availability: unknown
): SubAvailabilityBlock[] {
  if (!Array.isArray(availability)) {
    return [];
  }

  const normalized: SubAvailabilityBlock[] = [];

  for (const rawBlock of availability) {
    if (!rawBlock || typeof rawBlock !== "object") {
      continue;
    }

    const block = rawBlock as Record<string, unknown>;
    const availabilityDate =
      typeof block.availability_date === "string"
        ? block.availability_date
        : "";
    const startTime = normalizeTime(
      typeof block.start_time === "string" ? block.start_time : null
    );
    const endTime = normalizeTime(
      typeof block.end_time === "string" ? block.end_time : null
    );

    if (!/^\d{4}-\d{2}-\d{2}$/.test(availabilityDate)) {
      continue;
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (
      !startTime ||
      !endTime ||
      Number.isNaN(startMinutes) ||
      Number.isNaN(endMinutes) ||
      endMinutes <= startMinutes
    ) {
      continue;
    }

    normalized.push({
      ...(typeof block.id === "string" ? { id: block.id } : {}),
      availability_date: availabilityDate,
      start_time: startTime,
      end_time: endTime,
    });
  }

  return normalized;
}

function isTimeWithinSubBlock(
  time: string,
  block: SubAvailabilityBlock
) {
  const current = timeToMinutes(time);
  const start = timeToMinutes(block.start_time);
  const end = timeToMinutes(block.end_time);

  if (
    Number.isNaN(current) ||
    Number.isNaN(start) ||
    Number.isNaN(end)
  ) {
    return false;
  }

  const slotEnd = current + INTERVAL_MINUTES;
  return current >= start && slotEnd <= end;
}

/* ========================================================================= */
/* STUDENT NUMBER DISPLAY                                                    */
/* ========================================================================= */

function formatStudentNumber(
  studentNumber: string | null | undefined
) {
  if (!studentNumber) {
    return "—";
  }

  /*
   * Stored values currently look like:
   *
   * HK-2026-0003
   *
   * We only shorten the display to:
   *
   * HK-0003
   *
   * The database value itself is never changed.
   */
  return studentNumber.replace(/^HK-\d{4}-/, "HK-");
}

/* ========================================================================= */
/* DAY NORMALIZATION                                                         */
/* ========================================================================= */

function normalizeDayOfWeek(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    if (Number.isInteger(value) && value >= 0 && value <= 6) {
      return value;
    }

    return null;
  }

  const raw = String(value).trim().toLowerCase();

  if (/^\d+$/.test(raw)) {
    const numeric = Number(raw);

    return Number.isInteger(numeric) &&
      numeric >= 0 &&
      numeric <= 6
      ? numeric
      : null;
  }

  const dayMap: Record<string, number> = {
    sunday: 0,
    sun: 0,

    monday: 1,
    mon: 1,

    tuesday: 2,
    tue: 2,
    tues: 2,

    wednesday: 3,
    wed: 3,

    thursday: 4,
    thu: 4,
    thurs: 4,

    friday: 5,
    fri: 5,

    saturday: 6,
    sat: 6,
  };

  return dayMap[raw] ?? null;
}

/* ========================================================================= */
/* AVAILABILITY NORMALIZATION                                                */
/* ========================================================================= */

function normalizeAvailability(
  availability: unknown
): AvailabilityBlock[] {
  if (!Array.isArray(availability)) {
    return [];
  }

  const normalized: AvailabilityBlock[] = [];

  for (const rawBlock of availability) {
    if (!rawBlock || typeof rawBlock !== "object") {
      continue;
    }

    const block = rawBlock as Record<string, unknown>;

    const day = normalizeDayOfWeek(block.day_of_week);

    const startTime = normalizeTime(
      typeof block.start_time === "string"
        ? block.start_time
        : null
    );

    const endTime = normalizeTime(
      typeof block.end_time === "string"
        ? block.end_time
        : null
    );

    if (day === null || !startTime || !endTime) {
      continue;
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (
      Number.isNaN(startMinutes) ||
      Number.isNaN(endMinutes) ||
      endMinutes <= startMinutes
    ) {
      continue;
    }

    const normalizedBlock: AvailabilityBlock = {
      day_of_week: day,
      start_time: startTime,
      end_time: endTime,
    };

    if (typeof block.id === "string") {
      normalizedBlock.id = block.id;
    }

    normalized.push(normalizedBlock);
  }

  return normalized;
}

/* ========================================================================= */
/* AVAILABILITY SLOT CHECK                                                   */
/* ========================================================================= */

function isTimeWithinBlock(
  time: string,
  block: AvailabilityBlock
) {
  const current = timeToMinutes(time);
  const start = timeToMinutes(block.start_time);
  const end = timeToMinutes(block.end_time);

  if (
    Number.isNaN(current) ||
    Number.isNaN(start) ||
    Number.isNaN(end)
  ) {
    return false;
  }

  const slotEnd = current + INTERVAL_MINUTES;

  return current >= start && slotEnd <= end;
}

/* ========================================================================= */
/* STUDENT HELPERS                                                           */
/* ========================================================================= */

function getStudentName(
  student:
    | AvailableEnrollment["student"]
    | Assignment["student"]
) {
  return (
    student?.preferred_name ||
    student?.full_name ||
    "Unnamed student"
  );
}

function getTimezoneLabel(
  timezone: string | null | undefined
) {
  if (!timezone) {
    return "Timezone unknown";
  }

  if (timezone === "Asia/Seoul") {
    return "KST";
  }

  if (timezone === "Asia/Manila") {
    return "PHT";
  }

  return timezone;
}

/* ========================================================================= */
/* SCHEDULE HELPERS                                                          */
/* ========================================================================= */

function normalizeSchedule(
  schedule: ScheduleItem[] | null | undefined
): ScheduleItem[] {
  if (!Array.isArray(schedule)) {
    return [];
  }

  const normalized: ScheduleItem[] = [];

  for (const rawItem of schedule) {
    if (!rawItem || typeof rawItem !== "object") {
      continue;
    }

    const day = normalizeDayOfWeek(rawItem.day_of_week);
    const scheduleTime = normalizeTime(rawItem.schedule_time);

    if (day === null || !scheduleTime) {
      continue;
    }

    normalized.push({
      day_of_week: day,
      schedule_time: scheduleTime,
    });
  }

  return normalized.sort((a, b) => {
    if (a.day_of_week !== b.day_of_week) {
      return a.day_of_week - b.day_of_week;
    }

    return (
      timeToMinutes(a.schedule_time) -
      timeToMinutes(b.schedule_time)
    );
  });
}

function formatSchedule(
  schedule: ScheduleItem[] | null | undefined
) {
  const normalized = normalizeSchedule(schedule);

  if (normalized.length === 0) {
    return "No schedule";
  }

  return normalized
    .map((item) => {
      const day =
        DAYS.find(
          (dayItem) =>
            dayItem.value === item.day_of_week
        )?.label || "—";

      return `${day} ${formatTime(item.schedule_time)}`;
    })
    .join(" / ");
}

function getAvailableEnrollmentSchedule(
  item: AvailableEnrollment
) {
  if (Array.isArray(item.schedules)) {
    return item.schedules;
  }

  if (Array.isArray(item.schedule)) {
    return item.schedule;
  }

  return [];
}

/*
 * IMPORTANT:
 *
 * This is the student's authoritative schedule.
 *
 * It is used by the Assigned Students table.
 */
function getAssignmentStudentSchedule(
  assignment: Assignment
) {
  if (Array.isArray(assignment.schedules)) {
    return assignment.schedules;
  }

  if (Array.isArray(assignment.schedule)) {
    return assignment.schedule;
  }

  return [];
}

/*
 * IMPORTANT:
 *
 * This is the converted Philippine Time schedule.
 *
 * It is used ONLY by the teacher calendar.
 */
function getAssignmentCalendarSchedule(
  assignment: Assignment
) {
  if (Array.isArray(assignment.pht_schedules)) {
    return assignment.pht_schedules;
  }

  return [];
}

/* ========================================================================= */
/* ASSIGNMENT HELPERS                                                        */
/* ========================================================================= */

function getAssignmentForSlot(
  assignments: Assignment[],
  day: number,
  time: string
) {
  const normalizedTime = normalizeTime(time);

  return assignments.find((assignment) => {
    if (assignment.status !== "active") {
      return false;
    }

    /*
     * The teacher calendar is in PHT.
     *
     * Therefore we MUST use pht_schedules here,
     * not the student's original schedule.
     */
    const schedule = normalizeSchedule(
      getAssignmentCalendarSchedule(assignment)
    );

    return schedule.some(
      (item) =>
        item.day_of_week === day &&
        normalizeTime(item.schedule_time) ===
          normalizedTime
    );
  });
}

/* ========================================================================= */
/* PROGRESS HELPERS                                                          */
/* ========================================================================= */

function getLessonProgress(
  lessons: TeacherLessonProgress[],
  enrollmentId: string | null | undefined
) {
  if (!enrollmentId) {
    return {
      consumed: 0,
      total: 0,
    };
  }

  const enrollmentLessons = lessons.filter(
    (lesson) =>
      lesson.enrollment_id === enrollmentId
  );

  /*
   * A lesson counts toward progress only when
   * consumes_lesson is true.
   */
  const consumed = enrollmentLessons.filter(
    (lesson) =>
      lesson.consumes_lesson === true
  ).length;

  /*
   * The highest lesson_number represents the actual
   * number of lessons generated for this enrollment.
   *
   * This means progress comes from the lesson records
   * themselves, rather than assignment date or
   * teacher assignment date.
   */
  const total = enrollmentLessons.reduce(
    (highestLessonNumber, lesson) => {
      const lessonNumber = Number(
        lesson.lesson_number
      );

      if (Number.isNaN(lessonNumber)) {
        return highestLessonNumber;
      }

      return Math.max(
        highestLessonNumber,
        lessonNumber
      );
    },
    0
  );

  return {
    consumed,
    total,
  };
}

/* ========================================================================= */
/* PAGE                                                                      */
/* ========================================================================= */

export default function ManageTeacherPage() {
  const params = useParams();

  const locale = String(params.locale);
  const teacherId = String(params.id);

  const [teacher, setTeacher] =
    useState<Teacher | null>(null);

  const [assignments, setAssignments] =
    useState<Assignment[]>([]);

  const [
    availableEnrollments,
    setAvailableEnrollments,
  ] = useState<AvailableEnrollment[]>([]);

  const [availability, setAvailability] =
    useState<AvailabilityBlock[]>([]);

  const [subAvailability, setSubAvailability] =
    useState<SubAvailabilityBlock[]>([]);

  const [weekStart, setWeekStart] = useState(() =>
    getWeekStart(getPhilippineToday())
  );

  const [
    teacherLessons,
    setTeacherLessons,
  ] = useState<TeacherLessonProgress[]>([]);

  const [loading, setLoading] = useState(true);

  const [
    loadingAvailability,
    setLoadingAvailability,
  ] = useState(false);

  const [
    loadingEnrollments,
    setLoadingEnrollments,
  ] = useState(false);

  const [
    showAssignPanel,
    setShowAssignPanel,
  ] = useState(false);

  const [
    selectedEnrollmentStudentId,
    setSelectedEnrollmentStudentId,
  ] = useState("");

  const [selectedSlot, setSelectedSlot] =
    useState<{
      day: number;
      time: string;
    } | null>(null);

  const [assigning, setAssigning] =
    useState(false);

  const [error, setError] = useState("");

  const [
    assignmentError,
    setAssignmentError,
  ] = useState("");

  const [success, setSuccess] = useState("");

  /* ----------------------------------------------------------------------- */
  /* TIME SLOTS                                                              */
  /* ----------------------------------------------------------------------- */

  const timeSlots = useMemo(
    () => createTimeSlots(),
    []
  );

  const calendarDays = useMemo<CalendarDay[]>(() => {
    return DAYS.map((day, index) => {
      const date = addDays(weekStart, index);

      return {
        day_of_week: day.value,
        label: day.label,
        date,
        displayDate: formatCalendarDate(date),
      };
    });
  }, [weekStart]);

  const weekRangeLabel = useMemo(
    () => formatWeekRange(weekStart),
    [weekStart]
  );

  /* ----------------------------------------------------------------------- */
  /* LOAD TEACHER                                                            */
  /* ----------------------------------------------------------------------- */

  useEffect(() => {
    async function loadTeacher() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/admin/teachers",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load teachers."
          );
        }

        const foundTeacher = (
          data.teachers || []
        ).find(
          (item: Teacher) =>
            item.id === teacherId
        );

        if (!foundTeacher) {
          throw new Error(
            "This teacher could not be found."
          );
        }

        setTeacher(foundTeacher);

        await Promise.all([
          loadAssignments(),
          loadAvailability(),
          loadTeacherLessons(),
        ]);
      } catch (err) {
        console.error(
          "Error loading teacher:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "We couldn't load this teacher right now."
        );
      } finally {
        setLoading(false);
      }
    }

    loadTeacher();
  }, [teacherId]);

  /* ----------------------------------------------------------------------- */
  /* LOAD ASSIGNMENTS                                                        */
  /* ----------------------------------------------------------------------- */

  async function loadAssignments() {
    const response = await fetch(
      `/api/admin/teachers/${teacherId}/assignments`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
          "Unable to load teacher assignments."
      );
    }

    setAssignments(
      Array.isArray(data.assignments)
        ? data.assignments
        : []
    );
  }

  /* ----------------------------------------------------------------------- */
  /* LOAD TEACHER LESSON PROGRESS                                            */
  /* ----------------------------------------------------------------------- */

  async function loadTeacherLessons() {
    try {
      /*
       * IMPORTANT:
       *
       * Do NOT use:
       *
       * /api/admin/teachers/lessons
       *
       * That route is scoped to the logged-in teacher.
       *
       * This page is the Owner/Admin teacher-management
       * page, so progress is loaded through the
       * teacher-specific Owner/Admin endpoint.
       */
      const response = await fetch(
        `/api/admin/teachers/${teacherId}/progress`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load teacher lesson progress."
        );
      }

      const lessons = Array.isArray(
        data.lessons
      )
        ? data.lessons
        : [];

      const progressLessons: TeacherLessonProgress[] =
        lessons
          .filter(
            (lesson: unknown) =>
              lesson &&
              typeof lesson === "object"
          )
          .map(
            (
              lesson: Record<string, unknown>
            ) => ({
              enrollment_id:
                String(
                  lesson.enrollment_id || ""
                ),

              lesson_number: Number(
                lesson.lesson_number || 0
              ),

              consumes_lesson:
                lesson.consumes_lesson === true,
            })
          )
          .filter(
            (
              lesson: TeacherLessonProgress
            ) =>
              lesson.enrollment_id &&
              lesson.lesson_number > 0
          );

      setTeacherLessons(
        progressLessons
      );
    } catch (err) {
      console.error(
        "Error loading teacher lesson progress:",
        err
      );

      /*
       * Progress is supplementary information.
       *
       * We do not prevent the teacher management
       * page from loading if lesson progress fails.
       */
      setTeacherLessons([]);
    }
  }

  /* ----------------------------------------------------------------------- */
  /* LOAD AVAILABILITY                                                       */
  /* ----------------------------------------------------------------------- */

  async function loadAvailability() {
    try {
      setLoadingAvailability(true);

      const response = await fetch(
        `/api/admin/teachers/${teacherId}/availability`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load teacher availability."
        );
      }

      const rawAvailability =
        Array.isArray(data.availability)
          ? data.availability
          : Array.isArray(data.blocks)
            ? data.blocks
            : Array.isArray(data.data)
              ? data.data
              : [];

      const normalized =
        normalizeAvailability(
          rawAvailability
        );

      const rawSubAvailability =
        Array.isArray(data.sub_availability)
          ? data.sub_availability
          : [];

      const normalizedSubAvailability =
        normalizeSubAvailability(
          rawSubAvailability
        );

      setAvailability(normalized);
      setSubAvailability(
        normalizedSubAvailability
      );
    } catch (err) {
      console.error(
        "Error loading teacher availability:",
        err
      );

      setAssignmentError(
        err instanceof Error
          ? err.message
          : "Unable to load teacher availability."
      );
    } finally {
      setLoadingAvailability(false);
    }
  }

  /* ----------------------------------------------------------------------- */
  /* AVAILABILITY BY DAY                                                     */
  /* ----------------------------------------------------------------------- */

  const availabilityByDay =
    useMemo(() => {
      const grouped: Record<
        number,
        AvailabilityBlock[]
      > = {
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
      };

      const normalized =
        normalizeAvailability(
          availability
        );

      normalized.forEach((block) => {
        const day =
          normalizeDayOfWeek(
            block.day_of_week
          );

        if (day === null) {
          return;
        }

        grouped[day].push({
          ...block,
          day_of_week: day,
          start_time:
            normalizeTime(
              block.start_time
            ),
          end_time:
            normalizeTime(
              block.end_time
            ),
        });
      });

      DAYS.forEach((day) => {
        grouped[day.value].sort(
          (a, b) =>
            timeToMinutes(
              a.start_time
            ) -
            timeToMinutes(
              b.start_time
            )
        );
      });

      return grouped;
    }, [availability]);

  const additionalAvailabilityByDate =
    useMemo(() => {
      const grouped: Record<
        string,
        SubAvailabilityBlock[]
      > = {};

      normalizeSubAvailability(
        subAvailability
      ).forEach((block) => {
        if (!grouped[block.availability_date]) {
          grouped[block.availability_date] = [];
        }

        grouped[block.availability_date].push(
          block
        );
      });

      Object.values(grouped).forEach((blocks) => {
        blocks.sort(
          (a, b) =>
            timeToMinutes(a.start_time) -
            timeToMinutes(b.start_time)
        );
      });

      return grouped;
    }, [subAvailability]);

  /* ----------------------------------------------------------------------- */
  /* OPEN ASSIGNMENT PANEL                                                   */
  /* ----------------------------------------------------------------------- */

  async function openAssignPanel(
    day: number,
    time: string
  ) {
    setSelectedSlot({
      day,
      time,
    });

    setSelectedEnrollmentStudentId("");

    setAssignmentError("");
    setSuccess("");
    setShowAssignPanel(true);

    /*
     * The clicked calendar slot is only a reference.
     *
     * It does NOT modify the student's schedule.
     */

    if (availableEnrollments.length > 0) {
      return;
    }

    try {
      setLoadingEnrollments(true);

      const response = await fetch(
        "/api/admin/teachers/available-enrollments",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load available students."
        );
      }

      setAvailableEnrollments(
        Array.isArray(data.enrollments)
          ? data.enrollments
          : Array.isArray(
                data.availableEnrollments
              )
            ? data.availableEnrollments
            : []
      );
    } catch (err) {
      console.error(
        "Error loading available enrollments:",
        err
      );

      setAssignmentError(
        err instanceof Error
          ? err.message
          : "Unable to load available students."
      );
    } finally {
      setLoadingEnrollments(false);
    }
  }

  /* ----------------------------------------------------------------------- */
  /* AVAILABLE STUDENTS                                                      */
  /* ----------------------------------------------------------------------- */

  const slotEnrollments =
    availableEnrollments;

  /* ----------------------------------------------------------------------- */
  /* ASSIGN STUDENT                                                          */
  /* ----------------------------------------------------------------------- */

  async function handleAssign() {
    if (!selectedEnrollmentStudentId) {
      setAssignmentError(
        "Please select a student."
      );

      return;
    }

    try {
      setAssigning(true);
      setAssignmentError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/teachers/${teacherId}/assignments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            enrollmentStudentId:
              selectedEnrollmentStudentId,

            /*
             * Context only.
             *
             * The server does NOT use this to modify
             * the student's recurring schedule.
             */
            selectedSlot,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to assign this student."
        );
      }

      await loadAssignments();

      setAvailableEnrollments(
        (current) =>
          current.filter(
            (item) =>
              item.enrollment_student_id !==
              selectedEnrollmentStudentId
          )
      );

      setSelectedEnrollmentStudentId("");

      setSuccess(
        "Student assigned successfully."
      );
    } catch (err) {
      console.error(
        "Error assigning student:",
        err
      );

      setAssignmentError(
        err instanceof Error
          ? err.message
          : "Unable to assign this student."
      );
    } finally {
      setAssigning(false);
    }
  }

  /* ----------------------------------------------------------------------- */
  /* CLOSE ASSIGNMENT PANEL                                                  */
  /* ----------------------------------------------------------------------- */

  function closeAssignPanel() {
    if (assigning) {
      return;
    }

    setShowAssignPanel(false);
    setSelectedEnrollmentStudentId("");
    setAssignmentError("");
    setSuccess("");
  }

  /* ----------------------------------------------------------------------- */
  /* ASSIGNED STUDENTS                                                       */
  /* ----------------------------------------------------------------------- */

  const activeAssignments =
    assignments.filter(
      (assignment) =>
        assignment.status === "active"
    );

  /* ----------------------------------------------------------------------- */
  /* CALENDAR SLOT STATE                                                     */
  /* ----------------------------------------------------------------------- */

  function getSlotState(
    date: string,
    day: number,
    time: string
  ) {
    const additionalBlocks =
      additionalAvailabilityByDate[date] || [];

    const isAdditionalAvailable =
      additionalBlocks.some((block) =>
        isTimeWithinSubBlock(
          time,
          block
        )
      );

    /*
     * Date-specific availability takes visual priority
     * for this exact date only.
     *
     * The recurring student assignment underneath is
     * not changed or deleted.
     */
    if (isAdditionalAvailable) {
      return {
        type: "additional_available" as const,
      };
    }

    const assignment =
      getAssignmentForSlot(
        assignments,
        day,
        time
      );

    if (assignment) {
      return {
        type: "scheduled" as const,
        assignment,
      };
    }

    const blocks =
      availabilityByDay[day] || [];

    const isAvailable =
      blocks.some((block) =>
        isTimeWithinBlock(
          time,
          block
        )
      );

    if (isAvailable) {
      return {
        type: "available" as const,
      };
    }

    return {
      type: "unavailable" as const,
    };
  }

  /* ----------------------------------------------------------------------- */
  /* STATUS                                                                  */
  /* ----------------------------------------------------------------------- */

  const statusLabel =
    teacher?.status === "active"
      ? "Active"
      : teacher?.status
        ? teacher.status
            .charAt(0)
            .toUpperCase() +
          teacher.status.slice(1)
        : "Unknown";

  /* ========================================================================= */
  /* RENDER                                                                    */
  /* ========================================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
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
              href={`/${locale}/admin`}
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
              &larr; Administration
            </Link>

            <div className="shrink-0 text-right">
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

        <section className="mx-auto max-w-[1200px] px-6 pb-24 pt-20 sm:px-8 lg:px-10">
          <div className="border-y border-[#DCD8D2] py-20 text-center">
            <p className="font-serif text-[17px] text-[#74716B]">
              Loading teacher...
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (error || !teacher) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
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
              href={`/${locale}/admin`}
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
              &larr; Administration
            </Link>

            <div className="shrink-0 text-right">
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

        <section className="mx-auto max-w-[1200px] px-6 pb-24 pt-20 sm:px-8 sm:pt-16 lg:px-10">
          <div className="border-y border-[#DCD8D2] py-20 text-center">
            <h1 className="font-serif text-[30px] font-normal">
              Unable to load teacher
            </h1>

            <p className="mx-auto mt-3 max-w-[520px] font-serif text-[16px] leading-7 text-[#74716B]">
              {error ||
                "This teacher could not be found."}
            </p>

            <Link
              href={`/${locale}/admin/teachers`}
              className="mt-6 inline-block font-sans text-[13px] text-[#6F8F72] underline underline-offset-4"
            >
              Back to Teachers
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
      {/* =================================================================== */}
      {/* HEADER                                                              */}
      {/* =================================================================== */}

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
              href={`/${locale}/admin`}
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
              &larr; Administration
            </Link>

            <div className="shrink-0 text-right">
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

      {/* =================================================================== */}
      {/* INTRO                                                               */}
      {/* =================================================================== */}

      <section className="mx-auto max-w-[1200px] px-6 pb-10 pt-12 sm:px-8 sm:pb-12 sm:pt-16 lg:px-10 lg:pt-20">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
            {teacher.avatar_url ? (
              <img
                src={teacher.avatar_url}
                alt={`${teacher.full_name || "Teacher"} profile`}
                className="h-28 w-28 shrink-0 rounded-full object-cover ring-1 ring-[#DCD8D2] sm:h-32 sm:w-32 lg:h-36 lg:w-36"
              />
            ) : (
              <div
                className="
                  flex
                  h-28
                  w-28
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#DCD8D2]
                  bg-[#E8EDE5]
                  font-serif
                  text-[30px]
                  font-normal
                  text-[#6F8F72]
                  sm:h-32
                  sm:w-32
                  sm:text-[34px]
                  lg:h-36
                  lg:w-36
                  lg:text-[38px]
                "
                aria-label="Teacher initials"
              >
                {(teacher.full_name || "Teacher")
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part.charAt(0).toUpperCase())
                  .join("") || "T"}
              </div>
            )}

            <div className="min-w-0 max-w-[760px]">
              <p className="mb-4 font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-[#8A8A84]">
                Teaching team
              </p>

              <h1 className="font-serif text-[45px] font-normal leading-[1] tracking-[-0.035em] sm:text-[56px] lg:text-[64px]">
                {teacher.full_name ||
                  "Unnamed teacher"}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
                <p className="font-sans text-[12px] uppercase tracking-[0.12em] text-[#8A8A84]">
                  {teacher.teacher_number ||
                    "—"}
                </p>

                <span className="h-[3px] w-[3px] rounded-full bg-[#B6B2AA]" />

                <p className="font-sans text-[12px] text-[#74716B]">
                  {teacher.email ||
                    "No email available"}
                </p>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E5EBDD] px-2.5 py-1.5 font-sans text-[8px] font-medium uppercase tracking-[0.1em] text-[#607963]">
                  <span className="h-[5px] w-[5px] rounded-full bg-[#6F8F72]" />
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>

          <Link
            href={`/${locale}/admin/teachers/${teacher.id}/payroll`}
            className="inline-flex w-fit items-center justify-center rounded-full border border-[#E5B8B2] bg-[#E5B8B2] px-5 py-2.5 font-sans text-[13px] font-bold text-white transition-colors hover:border-[#748260] hover:bg-[#748260]"
          >
            Payroll →
          </Link>
        </div>
      </section>

      {/* =================================================================== */}
      {/* TEACHER AGREEMENT                                                   */}
      {/* =================================================================== */}

      <section className="mx-auto max-w-[1200px] px-6 pb-10 sm:px-8 sm:pb-12 lg:px-10">
        <TeacherAgreement teacher={teacher} />
      </section>

      {/* =================================================================== */}
      {/* CALENDAR                                                             */}
      {/* =================================================================== */}

      <section className="mx-auto max-w-[1200px] px-6 pb-16 sm:px-8 lg:px-10">
        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-[#8A8A84]">
              Teaching schedule
            </p>

            <h2 className="mt-2 font-serif text-[29px] font-normal tracking-[-0.025em]">
              Weekly Calendar
            </h2>

            <p className="mt-2 max-w-[650px] font-serif text-[15px] leading-7 text-[#74716B]">
              Philippine Time. Regular availability and recurring
              student schedules repeat weekly. Additional availability
              appears only on the exact date the teacher opened.
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:items-end">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setWeekStart((current) =>
                    addDays(current, -7)
                  )
                }
                className="rounded-full border border-[#D7D2CB] px-3.5 py-2 font-sans text-[11px] text-[#66625C] transition-colors hover:border-[#6F8F72] hover:text-[#6F8F72]"
              >
                ← Previous Week
              </button>

              <button
                type="button"
                onClick={() =>
                  setWeekStart(
                    getWeekStart(
                      getPhilippineToday()
                    )
                  )
                }
                className="rounded-full border border-[#D7D2CB] px-3.5 py-2 font-sans text-[11px] text-[#66625C] transition-colors hover:border-[#6F8F72] hover:text-[#6F8F72]"
              >
                Current Week
              </button>

              <button
                type="button"
                onClick={() =>
                  setWeekStart((current) =>
                    addDays(current, 7)
                  )
                }
                className="rounded-full border border-[#D7D2CB] px-3.5 py-2 font-sans text-[11px] text-[#66625C] transition-colors hover:border-[#6F8F72] hover:text-[#6F8F72]"
              >
                Next Week →
              </button>
            </div>

            <p className="font-serif text-[14px] text-[#55544F]">
              {weekRangeLabel}
            </p>

            <div className="flex flex-wrap items-center gap-4 font-sans text-[10px] uppercase tracking-[0.1em] text-[#77736B]">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-[2px] border border-[#B9CBB5] bg-[#E8EFE5]" />
                Available
              </div>

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-[2px] border border-[#D9BE6A] bg-[#F3E8B8]" />
                Scheduled
              </div>

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-[2px] border border-[#B8B1D8] bg-[#EAE7F5]" />
                Additional Available
              </div>

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-[2px] border border-[#D9B6B1] bg-[#F1DEDB]" />
                Unavailable
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border-y border-[#DCD8D2]">
          <div className="min-w-[980px]">
            <div className="grid grid-cols-[78px_repeat(7,minmax(120px,1fr))] border-b border-[#DCD8D2]">
              <div className="border-r border-[#E7E3DD] p-3" />

              {calendarDays.map((day) => (
                <div
                  key={day.date}
                  className="border-r border-[#E7E3DD] px-3 py-3 text-center last:border-r-0"
                >
                  <p className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-[#8A8A84]">
                    {day.label}
                  </p>

                  <p className="mt-1 font-serif text-[13px] text-[#55544F]">
                    {day.displayDate}
                  </p>
                </div>
              ))}
            </div>

            {loadingAvailability ? (
              <div className="py-20 text-center">
                <p className="font-serif text-[16px] text-[#74716B]">
                  Loading availability...
                </p>
              </div>
            ) : (
              <div>
                {timeSlots.map((time) => (
                  <div
                    key={time}
                    className="grid grid-cols-[78px_repeat(7,minmax(120px,1fr))]"
                  >
                    <div className="border-r border-b border-[#E7E3DD] px-2 py-2 text-right">
                      <span className="font-sans text-[9px] text-[#99958D]">
                        {formatTime(time)}
                      </span>
                    </div>

                    {calendarDays.map((day) => {
                      const slot = getSlotState(
                        day.date,
                        day.day_of_week,
                        time
                      );

                      const isAdditionalAvailable =
                        slot.type === "additional_available";

                      const isScheduled =
                        slot.type === "scheduled";

                      const isAvailable =
                        slot.type === "available";

                      return (
                        <div
                          key={`${day.date}-${time}`}
                          className="border-r border-b border-[#E7E3DD] p-[3px] last:border-r-0"
                        >
                          {isAdditionalAvailable ? (
                            <div
                              className="flex min-h-[39px] flex-col items-center justify-center rounded-[3px] border border-[#B8B1D8] bg-[#EAE7F5] px-2 py-1.5 text-center"
                              aria-label={`Additional availability on ${day.label}, ${day.displayDate} at ${formatTime(
                                time
                              )}`}
                            >
                              <p className="font-sans text-[8px] font-medium uppercase tracking-[0.08em] text-[#68618C]">
                                Additional Available
                              </p>
                            </div>
                          ) : isScheduled ? (
                            <div className="flex min-h-[39px] flex-col justify-center rounded-[3px] border border-[#D9BE6A] bg-[#F3E8B8] px-2 py-1.5">
                              <p className="truncate font-sans text-[10px] font-medium text-[#6F6440]">
                                {getStudentName(
                                  slot.assignment.student
                                )}
                              </p>

                              <p className="mt-0.5 truncate font-sans text-[8px] uppercase tracking-[0.08em] text-[#8C8057]">
                                Scheduled
                              </p>
                            </div>
                          ) : isAvailable ? (
                            <button
                              type="button"
                              onClick={() =>
                                openAssignPanel(
                                  day.day_of_week,
                                  time
                                )
                              }
                              className="group flex min-h-[39px] w-full items-center justify-center rounded-[3px] border border-[#B9CBB5] bg-[#E8EFE5] px-2 transition-colors hover:border-[#6F8F72] hover:bg-[#DDE9D9]"
                              aria-label={`Open assignment panel from ${day.label}, ${day.displayDate} at ${formatTime(
                                time
                              )}`}
                            >
                              <span className="hidden font-sans text-[8px] font-medium uppercase tracking-[0.08em] text-[#607963] group-hover:block">
                                + Assign
                              </span>
                            </button>
                          ) : (
                            <div
                              className="min-h-[39px] rounded-[3px] border border-[#D9B6B1] bg-[#F1DEDB]"
                              aria-label={`Unavailable on ${day.label}, ${day.displayDate} at ${formatTime(
                                time
                              )}`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="mt-4 font-serif text-[13px] italic text-[#8A8780]">
          Additional Available applies only to the displayed date. If it
          overlaps a regular student&apos;s recurring schedule, the recurring
          assignment remains unchanged and will appear as Scheduled again on
          the next matching week. Green Available slots continue to open the
          regular assignment panel.
        </p>
      </section>

      {/* =================================================================== */}
      {/* ASSIGNMENT PANEL                                                    */}
      {/* =================================================================== */}

      {showAssignPanel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#292929]/25 px-4 py-6 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="assign-panel-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAssignPanel();
            }
          }}
        >
          <section className="w-full max-w-[760px] overflow-hidden border border-[#DCD8D2] bg-[#F7F5F1] shadow-[0_20px_60px_rgba(41,41,41,0.16)]">
            <div className="max-h-[88vh] overflow-y-auto px-6 py-7 sm:px-8 sm:py-8">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-[#8A8A84]">
                    Assign from calendar
                  </p>

                  <h3
                    id="assign-panel-title"
                    className="mt-2 font-serif text-[27px] font-normal tracking-[-0.02em]"
                  >
                    {selectedSlot
                      ? `${DAYS[selectedSlot.day].label}, ${formatTime(
                          selectedSlot.time
                        )} PHT`
                      : "Select a student"}
                  </h3>

                  <p className="mt-2 max-w-[650px] font-serif text-[14px] leading-6 text-[#74716B]">
                    The selected PHT slot is only a
                    reference point. Students keep their
                    existing lesson schedules in their own
                    timezones. A student can be assigned
                    only if their complete recurring
                    schedule fits within this teacher&apos;s
                    availability.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeAssignPanel}
                  disabled={assigning}
                  className="shrink-0 text-[#8A8780] transition-colors hover:text-[#6F8F72] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Close assignment panel"
                >
                  <CloseIcon />
                </button>
              </div>

              {success && (
                <div className="mt-6 border-l-2 border-[#6F8F72] bg-[#EDF2EA] px-4 py-3">
                  <p className="font-sans text-[12px] text-[#607963]">
                    {success}
                  </p>
                </div>
              )}

              {assignmentError && (
                <div className="mt-6 border-l-2 border-[#B87368] bg-[#F4E5E2] px-4 py-3">
                  <p className="font-sans text-[12px] text-[#8B5C55]">
                    {assignmentError}
                  </p>
                </div>
              )}

              {loadingEnrollments ? (
                <div className="py-12 text-center">
                  <p className="font-serif text-[16px] text-[#74716B]">
                    Loading available students...
                  </p>
                </div>
              ) : slotEnrollments.length > 0 ? (
                <div className="mt-7 divide-y divide-[#E0DCD6] border-y border-[#DCD8D2]">
                  {slotEnrollments.map((item) => {
                    const studentName =
                      getStudentName(
                        item.student
                      );

                    const schedule =
                      getAvailableEnrollmentSchedule(
                        item
                      );

                    const timezone =
                      getTimezoneLabel(
                        item.student
                          ?.timezone ||
                          item.timezone
                      );

                    const isSelected =
                      selectedEnrollmentStudentId ===
                      item.enrollment_student_id;

                    return (
                      <button
                        key={
                          item.enrollment_student_id
                        }
                        type="button"
                        onClick={() =>
                          setSelectedEnrollmentStudentId(
                            item.enrollment_student_id
                          )
                        }
                        className={`flex w-full items-center justify-between gap-5 px-3 py-4 text-left transition-colors sm:px-4 ${
                          isSelected
                            ? "bg-[#E8EFE5]"
                            : "hover:bg-[#F2F5F0]"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="font-serif text-[17px] leading-6 tracking-[-0.01em]">
                            {studentName}
                          </p>

                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                            <span className="font-sans text-[9px] uppercase tracking-[0.1em] text-[#8A8A84]">
                              {formatStudentNumber(
                                item.student
                                  ?.student_number
                              )}
                            </span>

                            <span className="font-sans text-[9px] uppercase tracking-[0.1em] text-[#8A8A84]">
                              {item.enrollment
                                ?.package_name ||
                                "Private English Lessons"}
                            </span>

                            {item.enrollment
                              ?.lesson_duration && (
                              <span className="font-sans text-[9px] uppercase tracking-[0.1em] text-[#8A8A84]">
                                {
                                  item
                                    .enrollment
                                    .lesson_duration
                                }{" "}
                                min
                              </span>
                            )}
                          </div>

                          <div className="mt-2">
                            <p className="font-sans text-[9px] font-medium uppercase tracking-[0.1em] text-[#8A8A84]">
                              Existing schedule ·{" "}
                              {timezone}
                            </p>

                            <p className="mt-1 font-serif text-[13px] leading-5 text-[#55544F]">
                              {formatSchedule(
                                schedule
                              )}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                            isSelected
                              ? "border-[#6F8F72] bg-[#6F8F72] text-white"
                              : "border-[#CFCBC5] text-transparent"
                          }`}
                        >
                          <CheckIcon />
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-7 border-y border-[#DCD8D2] py-12 text-center">
                  <h4 className="font-serif text-[22px] font-normal">
                    No available students
                  </h4>

                  <p className="mx-auto mt-3 max-w-[520px] font-serif text-[14px] leading-6 text-[#74716B]">
                    There are no active, unassigned
                    enrollments available to assign to
                    this teacher right now. Students are
                    not filtered by the selected calendar
                    slot.
                  </p>
                </div>
              )}

              {slotEnrollments.length > 0 && (
                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={closeAssignPanel}
                    disabled={assigning}
                    className="font-sans text-[12px] text-[#77736B] transition-colors hover:text-[#6F8F72] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleAssign}
                    disabled={
                      assigning ||
                      !selectedEnrollmentStudentId
                    }
                    className="inline-flex w-fit items-center gap-2 border-b border-[#6F8F72] pb-1 font-sans text-[13px] text-[#6F8F72] transition-colors hover:border-[#526B55] hover:text-[#526B55] disabled:cursor-not-allowed disabled:border-[#CFCBC5] disabled:text-[#AAA69F]"
                  >
                    <PlusIcon />

                    {assigning
                      ? "Assigning..."
                      : "Assign Student"}
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* =================================================================== */}
      {/* ASSIGNED STUDENTS                                                   */}
      {/* =================================================================== */}

      <section className="mx-auto max-w-[1200px] px-6 pb-20 sm:px-8 sm:pb-24 lg:px-10">
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-[#8A8A84]">
              Teaching team
            </p>

            <h2 className="mt-2 font-serif text-[29px] font-normal tracking-[-0.025em]">
              Assigned Students
            </h2>

            <p className="mt-2 max-w-[650px] font-serif text-[14px] leading-6 text-[#74716B]">
              Students are shown with their assigned class
              schedule in PHT. The timezone shown under
              each student belongs to the student, while
              the weekly calendar above is always displayed
              in PHT.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              openAssignPanel(
                0,
                "05:00"
              )
            }
            className="inline-flex w-fit items-center gap-2 border-b border-[#6F8F72] pb-1 font-sans text-[13px] text-[#6F8F72] transition-colors hover:border-[#526B55] hover:text-[#526B55]"
          >
            <PlusIcon />
            Assign Student
          </button>
        </div>

        {activeAssignments.length > 0 ? (
          <div className="overflow-x-auto border-y border-[#DCD8D2]">
            <table className="w-full min-w-[860px] border-collapse">
              <thead>
                <tr className="border-b border-[#DCD8D2]">
                  <th className="px-3 py-4 text-left font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-[#8A8A84] sm:px-4">
                    Student
                  </th>

                  <th className="px-3 py-4 text-left font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-[#8A8A84]">
                    PHT Time
                  </th>

                  <th className="px-3 py-4 text-left font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-[#8A8A84]">
                    Duration
                  </th>

                  <th className="px-3 py-4 text-left font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-[#8A8A84]">
                    Progress
                  </th>

                  <th className="px-3 py-4 text-right font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-[#8A8A84] sm:px-4">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {activeAssignments.map(
                  (assignment) => {
                    const studentName =
                      getStudentName(
                        assignment.student
                      );

                    /*
                     * Converted schedule used by the
                     * teacher calendar.
                     */
                    const phtSchedule =
                      normalizeSchedule(
                        getAssignmentCalendarSchedule(
                          assignment
                        )
                      );

                    const studentTimezone =
                      getTimezoneLabel(
                        assignment.student
                          ?.timezone ||
                          assignment.timezone
                      );

                    /*
                     * Progress comes from actual lesson
                     * records associated with this enrollment.
                     */
                    const progress =
                      getLessonProgress(
                        teacherLessons,
                        assignment
                          .enrollment?.id
                      );

                    const progressPercent =
                      progress.total > 0
                        ? Math.min(
                            100,
                            Math.round(
                              (progress.consumed /
                                progress.total) *
                                100
                            )
                          )
                        : 0;

                    return (
                      <tr
                        key={
                          assignment.id
                        }
                        className="border-b border-[#E7E3DD] last:border-b-0 hover:bg-[#F2F5F0]"
                      >
                        {/* ================================================= */}
                        {/* STUDENT                                           */}
                        {/* ================================================= */}

                        <td className="px-3 py-4 sm:px-4 sm:py-[18px]">
                          <p className="font-serif text-[17px] leading-6 tracking-[-0.01em]">
                            {studentName}
                          </p>

                          <p className="mt-1 font-sans text-[10px] uppercase tracking-[0.12em] text-[#9A9790]">
                            {formatStudentNumber(
                              assignment
                                .student
                                ?.student_number
                            )}
                          </p>

                          <p className="mt-1 font-sans text-[9px] uppercase tracking-[0.1em] text-[#8A8A84]">
                            {studentTimezone}
                          </p>
                        </td>

                        {/* ================================================= */}
                        {/* PHT TIME                                          */}
                        {/* ================================================= */}

                        <td className="px-3 py-4 font-serif text-[14px] text-[#55544F] sm:py-[18px]">
                          {phtSchedule.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {phtSchedule.map(
                                (item) => {
                                  const day =
                                    DAYS.find(
                                      (
                                        dayItem
                                      ) =>
                                        dayItem.value ===
                                        item.day_of_week
                                    )?.label ||
                                    "—";

                                  return (
                                    <span
                                      key={`${item.day_of_week}-${item.schedule_time}`}
                                    >
                                      {day}{" "}
                                      {formatTime(
                                        item.schedule_time
                                      )}
                                    </span>
                                  );
                                }
                              )}
                            </div>
                          ) : (
                            "No PHT schedule"
                          )}
                        </td>

                        {/* ================================================= */}
                        {/* DURATION                                          */}
                        {/* ================================================= */}

                        <td className="px-3 py-4 font-serif text-[14px] text-[#55544F] sm:py-[18px]">
                          {assignment
                            .enrollment
                            ?.lesson_duration
                            ? `${assignment.enrollment.lesson_duration} min`
                            : "—"}
                        </td>

                        {/* ================================================= */}
                        {/* PROGRESS                                           */}
                        {/* ================================================= */}

                        <td className="px-3 py-4 sm:py-[18px]">
                          <div className="flex min-w-[145px] items-center gap-3">
                            <div
                              className="h-[5px] flex-1 overflow-hidden rounded-full bg-[#E5E1DB]"
                              aria-label={`${progress.consumed} of ${progress.total} classes completed`}
                            >
                              <div
                                className="h-full rounded-full bg-[#6F8F72] transition-[width] duration-300"
                                style={{
                                  width: `${progressPercent}%`,
                                }}
                              />
                            </div>

                            <span className="shrink-0 font-sans text-[11px] font-medium tabular-nums text-[#55544F]">
                              {progress.consumed}/
                              {progress.total}
                            </span>
                          </div>

                          {progress.total > 0 && (
                            <p className="mt-1.5 font-sans text-[8px] uppercase tracking-[0.1em] text-[#9A9790]">
                              {progressPercent}%
                            </p>
                          )}
                        </td>

                        {/* ================================================= */}
                        {/* STATUS                                            */}
                        {/* ================================================= */}

                        <td className="px-3 py-4 text-right sm:px-4 sm:py-[18px]">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E5EBDD] px-2.5 py-1.5 font-sans text-[8px] font-medium uppercase tracking-[0.1em] text-[#607963]">
                            <span className="h-[5px] w-[5px] rounded-full bg-[#6F8F72]" />
                            Active
                          </span>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border-y border-[#DCD8D2] py-16 text-center">
            <h3 className="font-serif text-[25px] font-normal">
              No assigned students
            </h3>

            <p className="mx-auto mt-3 max-w-[460px] font-serif text-[15px] leading-7 text-[#74716B]">
              Students assigned to this teacher will
              appear here.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}