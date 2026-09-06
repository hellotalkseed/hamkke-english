"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

/* ========================================================================= */
/* TYPES                                                                     */
/* ========================================================================= */

type Teacher = {
  id: string;
  full_name: string | null;
  role: string;
  status: string;
  created_at: string;
  email: string | null;
  teacher_number?: string | null;
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
  } | null;
  enrollment: {
    id: string;
    package_name: string | null;
    status: string;
    schedule_days?: number[] | null;
    schedule_time?: string | null;
    lesson_duration?: number | null;
  } | null;
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
  } | null;

  enrollment: {
    id: string;
    package_name: string | null;
    status: string;
    schedule_days?: number[] | null;
    schedule_time?: string | null;
    lesson_duration?: number | null;
  } | null;
};

type AvailabilityBlock = {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
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

function ArrowLeftIcon() {
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
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}

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
      `${String(hour).padStart(2, "0")}:${String(minute).padStart(
        2,
        "0"
      )}`
    );
  }

  return slots;
}

function formatTime(time: string | null | undefined) {
  if (!time) return "—";

  const [hourString, minuteString] = time.split(":");
  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return time;
  }

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`;
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

function isTimeWithinBlock(
  time: string,
  block: AvailabilityBlock
) {
  const current = timeToMinutes(time);
  const start = timeToMinutes(block.start_time);
  const end = timeToMinutes(block.end_time);

  return current >= start && current < end;
}

function normalizeTime(time: string | null | undefined) {
  if (!time) return "";

  return time.slice(0, 5);
}

function getStudentName(
  student: AvailableEnrollment["student"] | Assignment["student"]
) {
  return (
    student?.preferred_name ||
    student?.full_name ||
    "Unnamed student"
  );
}

function getAssignmentForSlot(
  assignments: Assignment[],
  day: number,
  time: string
) {
  return assignments.find((assignment) => {
    if (assignment.status !== "active") {
      return false;
    }

    const days =
      assignment.enrollment?.schedule_days || [];

    const scheduleTime = normalizeTime(
      assignment.enrollment?.schedule_time
    );

    return (
      days.includes(day) &&
      scheduleTime === normalizeTime(time)
    );
  });
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

  const [availableEnrollments, setAvailableEnrollments] =
    useState<AvailableEnrollment[]>([]);

  const [availability, setAvailability] =
    useState<AvailabilityBlock[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingAvailability, setLoadingAvailability] =
    useState(false);

  const [loadingEnrollments, setLoadingEnrollments] =
    useState(false);

  const [showAssignPanel, setShowAssignPanel] =
    useState(false);

  const [selectedEnrollmentStudentId, setSelectedEnrollmentStudentId] =
    useState("");

  const [selectedSlot, setSelectedSlot] = useState<{
    day: number;
    time: string;
  } | null>(null);

  const [assigning, setAssigning] = useState(false);

  const [error, setError] = useState("");
  const [assignmentError, setAssignmentError] =
    useState("");

  const [success, setSuccess] = useState("");

  /* ----------------------------------------------------------------------- */
  /* TIME SLOTS                                                              */
  /* ----------------------------------------------------------------------- */

  const timeSlots = useMemo(
    () => createTimeSlots(),
    []
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

        const foundTeacher =
          (data.teachers || []).find(
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

    setAssignments(data.assignments || []);
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

      setAvailability(
        data.availability || []
      );
    } finally {
      setLoadingAvailability(false);
    }
  }

  /* ----------------------------------------------------------------------- */
  /* AVAILABILITY BY DAY                                                     */
  /* ----------------------------------------------------------------------- */

  const availabilityByDay = useMemo(() => {
    const grouped: Record<
      number,
      AvailabilityBlock[]
    > = {};

    DAYS.forEach((day) => {
      grouped[day.value] = [];
    });

    availability.forEach((block) => {
      if (!grouped[block.day_of_week]) {
        grouped[block.day_of_week] = [];
      }

      grouped[block.day_of_week].push(block);
    });

    return grouped;
  }, [availability]);

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

    if (
      availableEnrollments.length > 0
    ) {
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
        data.enrollments ||
          data.availableEnrollments ||
          []
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
  /* FILTER STUDENTS FOR SELECTED SLOT                                      */
  /* ----------------------------------------------------------------------- */

  const slotEnrollments = useMemo(() => {
    if (!selectedSlot) {
      return availableEnrollments;
    }

    return availableEnrollments.filter(
      (item) => {
        const days =
          item.enrollment?.schedule_days ||
          [];

        const scheduleTime =
          normalizeTime(
            item.enrollment?.schedule_time
          );

        return (
          days.includes(selectedSlot.day) &&
          scheduleTime ===
            normalizeTime(selectedSlot.time)
        );
      }
    );
  }, [
    availableEnrollments,
    selectedSlot,
  ]);

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
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            enrollmentStudentId:
              selectedEnrollmentStudentId,
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

      setAvailableEnrollments((current) =>
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
    day: number,
    time: string
  ) {
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

    const isAvailable = blocks.some(
      (block) =>
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
        <header className="w-full px-6 pt-7 sm:px-8 sm:pt-8 lg:px-10 xl:px-12">
          <div className="flex w-full items-start justify-between gap-8">
            <Link
              href={`/${locale}/admin/teachers`}
              className="shrink-0 font-sans text-[15px] text-[#5F655F] transition-colors duration-200 hover:text-[#6F8F72] sm:text-[16px]"
            >
              ← Teachers
            </Link>

            <Link
              href={`/${locale}`}
              className="shrink-0 text-right transition-opacity duration-200 hover:opacity-70"
            >
              <p className="font-sans text-[16px] font-semibold leading-none tracking-[0.18em] text-[#6F8F72]">
                HAMKKE │ 함께
              </p>

              <p className="mt-2 font-serif text-[13px] font-normal leading-none tracking-[0.02em] text-[#6F8F72]">
                From Small Talk to Big Ideas
              </p>
            </Link>
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
        <header className="w-full px-6 pt-7 sm:px-8 sm:pt-8 lg:px-10 xl:px-12">
          <div className="flex w-full items-start justify-between gap-8">
            <Link
              href={`/${locale}/admin/teachers`}
              className="shrink-0 font-sans text-[15px] text-[#5F655F] transition-colors duration-200 hover:text-[#6F8F72] sm:text-[16px]"
            >
              ← Teachers
            </Link>

            <Link
              href={`/${locale}`}
              className="shrink-0 text-right transition-opacity duration-200 hover:opacity-70"
            >
              <p className="font-sans text-[16px] font-semibold leading-none tracking-[0.18em] text-[#6F8F72]">
                HAMKKE │ 함께
              </p>

              <p className="mt-2 font-serif text-[13px] font-normal leading-none tracking-[0.02em] text-[#6F8F72]">
                From Small Talk to Big Ideas
              </p>
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-[1200px] px-6 pb-24 pt-20 sm:px-8 lg:px-10">
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

      <header className="w-full px-6 pt-7 sm:px-8 sm:pt-8 lg:px-10 xl:px-12">
        <div className="flex w-full items-start justify-between gap-8">
          {/* Back to Teachers */}

          <Link
            href={`/${locale}/admin/teachers`}
            className="shrink-0 font-sans text-[15px] text-[#5F655F] transition-colors duration-200 hover:text-[#6F8F72] sm:text-[16px]"
          >
            ← Teachers
          </Link>

          {/* Hamkke Brand */}

          <Link
            href={`/${locale}`}
            className="shrink-0 text-right transition-opacity duration-200 hover:opacity-70"
          >
            <p className="font-sans text-[16px] font-semibold leading-none tracking-[0.18em] text-[#6F8F72]">
              HAMKKE │ 함께
            </p>

            <p className="mt-2 font-serif text-[13px] font-normal leading-none tracking-[0.02em] text-[#6F8F72]">
              From Small Talk to Big Ideas
            </p>
          </Link>
        </div>
      </header>

      {/* =================================================================== */}
      {/* INTRO                                                               */}
      {/* =================================================================== */}

      <section className="mx-auto max-w-[1200px] px-6 pb-10 pt-12 sm:px-8 sm:pb-12 sm:pt-16 lg:px-10 lg:pt-20">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-[760px]">
            <p className="mb-4 font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-[#8A8A84]">
              Teaching team
            </p>

            <h1 className="font-serif text-[45px] font-normal leading-[1] tracking-[-0.035em] sm:text-[56px] lg:text-[64px]">
              {teacher.full_name ||
                "Unnamed teacher"}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
              <p className="font-sans text-[12px] uppercase tracking-[0.12em] text-[#8A8A84]">
                Teacher #
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

          <Link
            href={`/${locale}/admin/teachers/${teacher.id}/payroll`}
            className="inline-flex w-fit items-center gap-2 border-b border-[#6F8F72] pb-1 font-sans text-[13px] text-[#6F8F72] transition-colors hover:border-[#526B55] hover:text-[#526B55]"
          >
            Payroll →
          </Link>
        </div>
      </section>

      {/* =================================================================== */}
      {/* CALENDAR                                                             */}
      {/* =================================================================== */}

      <section className="mx-auto max-w-[1200px] px-6 pb-16 sm:px-8 lg:px-10">
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-[#8A8A84]">
              Teaching schedule
            </p>

            <h2 className="mt-2 font-serif text-[29px] font-normal tracking-[-0.025em]">
              Weekly Calendar
            </h2>

            <p className="mt-2 max-w-[600px] font-serif text-[15px] leading-7 text-[#74716B]">
              Philippine Time. This calendar reflects the
              availability set by the teacher and the
              students currently assigned to them.
            </p>
          </div>

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
              <span className="h-3 w-3 rounded-[2px] border border-[#D9B6B1] bg-[#F1DEDB]" />
              Unavailable
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border-y border-[#DCD8D2]">
          <div className="min-w-[980px]">
            {/* DAY HEADER */}

            <div className="grid grid-cols-[78px_repeat(7,minmax(120px,1fr))] border-b border-[#DCD8D2]">
              <div className="border-r border-[#E7E3DD] p-3" />

              {DAYS.map((day) => (
                <div
                  key={day.value}
                  className="border-r border-[#E7E3DD] px-3 py-4 text-center last:border-r-0"
                >
                  <p className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-[#8A8A84]">
                    {day.label}
                  </p>
                </div>
              ))}
            </div>

            {/* CALENDAR BODY */}

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
                    {/* TIME */}

                    <div className="border-r border-b border-[#E7E3DD] px-2 py-2 text-right">
                      <span className="font-sans text-[9px] text-[#99958D]">
                        {formatTime(time)}
                      </span>
                    </div>

                    {/* DAYS */}

                    {DAYS.map((day) => {
                      const slot =
                        getSlotState(
                          day.value,
                          time
                        );

                      const isScheduled =
                        slot.type ===
                        "scheduled";

                      const isAvailable =
                        slot.type ===
                        "available";

                      const isUnavailable =
                        slot.type ===
                        "unavailable";

                      return (
                        <div
                          key={`${day.value}-${time}`}
                          className="border-r border-b border-[#E7E3DD] p-[3px] last:border-r-0"
                        >
                          {isScheduled ? (
                            <div className="flex min-h-[39px] flex-col justify-center rounded-[3px] border border-[#D9BE6A] bg-[#F3E8B8] px-2 py-1.5">
                              <p className="truncate font-sans text-[10px] font-medium text-[#6F6440]">
                                {getStudentName(
                                  slot.assignment
                                    .student
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
                                  day.value,
                                  time
                                )
                              }
                              className="group flex min-h-[39px] w-full items-center justify-center rounded-[3px] border border-[#B9CBB5] bg-[#E8EFE5] px-2 transition-colors hover:border-[#6F8F72] hover:bg-[#DDE9D9]"
                              aria-label={`Assign student on ${day.label} at ${formatTime(
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
                              aria-label={`Unavailable on ${day.label} at ${formatTime(
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
          Click an available green slot to assign a
          student whose existing lesson schedule matches
          that time.
        </p>
      </section>

      {/* =================================================================== */}
      {/* ASSIGNMENT PANEL                                                    */}
      {/* =================================================================== */}

      {showAssignPanel && (
        <section className="mx-auto max-w-[1200px] px-6 pb-16 sm:px-8 lg:px-10">
          <div className="border-y border-[#DCD8D2] bg-[#F7F5F1] px-6 py-7 sm:px-8 sm:py-8">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-[#8A8A84]">
                  Assign from calendar
                </p>

                <h3 className="mt-2 font-serif text-[27px] font-normal tracking-[-0.02em]">
                  {selectedSlot
                    ? `${DAYS[selectedSlot.day].label}, ${formatTime(
                        selectedSlot.time
                      )}`
                    : "Select a student"}
                </h3>

                <p className="mt-2 max-w-[600px] font-serif text-[14px] leading-6 text-[#74716B]">
                  Only active enrollments scheduled for
                  this day and time are shown.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAssignPanel(false);
                  setAssignmentError("");
                  setSuccess("");
                }}
                className="shrink-0 text-[#8A8780] transition-colors hover:text-[#6F8F72]"
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
                {slotEnrollments.map(
                  (item) => {
                    const studentName =
                      getStudentName(
                        item.student
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
                              Student #
                              {item.student
                                ?.student_number ||
                                "—"}
                            </span>

                            <span className="font-sans text-[9px] uppercase tracking-[0.1em] text-[#8A8A84]">
                              {item.enrollment
                                ?.package_name ||
                                "Private English Lessons"}
                            </span>
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
                  }
                )}
              </div>
            ) : (
              <div className="mt-7 border-y border-[#DCD8D2] py-12 text-center">
                <h4 className="font-serif text-[22px] font-normal">
                  No matching students
                </h4>

                <p className="mx-auto mt-3 max-w-[480px] font-serif text-[14px] leading-6 text-[#74716B]">
                  There are no unassigned active
                  enrollments currently scheduled for
                  this day and time.
                </p>
              </div>
            )}

            {slotEnrollments.length > 0 && (
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignPanel(false);
                    setSelectedEnrollmentStudentId("");
                    setAssignmentError("");
                    setSuccess("");
                  }}
                  className="font-sans text-[12px] text-[#77736B] transition-colors hover:text-[#6F8F72]"
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
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr className="border-b border-[#DCD8D2]">
                  <th className="px-3 py-4 text-left font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-[#8A8A84] sm:px-4">
                    Student
                  </th>

                  <th className="px-3 py-4 text-left font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-[#8A8A84]">
                    Schedule
                  </th>

                  <th className="px-3 py-4 text-left font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-[#8A8A84]">
                    Package
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

                    const scheduleDays =
                      assignment.enrollment
                        ?.schedule_days || [];

                    const schedule =
                      scheduleDays.length > 0
                        ? scheduleDays
                            .sort(
                              (a, b) =>
                                a - b
                            )
                            .map(
                              (day) =>
                                DAYS.find(
                                  (item) =>
                                    item.value ===
                                    day
                                )?.label
                            )
                            .filter(Boolean)
                            .join(" / ")
                        : "No schedule";

                    return (
                      <tr
                        key={assignment.id}
                        className="border-b border-[#E7E3DD] last:border-b-0 hover:bg-[#F2F5F0]"
                      >
                        <td className="px-3 py-4 sm:px-4 sm:py-[18px]">
                          <p className="font-serif text-[17px] leading-6 tracking-[-0.01em]">
                            {studentName}
                          </p>

                          <p className="mt-1 font-sans text-[10px] uppercase tracking-[0.12em] text-[#9A9790]">
                            Student #
                            {assignment.student
                              ?.student_number ||
                              "—"}
                          </p>
                        </td>

                        <td className="px-3 py-4 font-serif text-[14px] text-[#55544F] sm:py-[18px]">
                          {schedule}

                          <span className="ml-2 font-sans text-[11px] text-[#8A8780]">
                            {formatTime(
                              assignment
                                .enrollment
                                ?.schedule_time
                            )}
                          </span>
                        </td>

                        <td className="px-3 py-4 font-serif text-[14px] text-[#55544F] sm:py-[18px]">
                          {assignment.enrollment
                            ?.package_name ||
                            "Private English Lessons"}
                        </td>

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