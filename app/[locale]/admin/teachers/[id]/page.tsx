"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type Teacher = {
  id: string;
  full_name: string | null;
  role: string;
  status: string;
  created_at: string;
  email: string | null;
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
  } | null;
};

type AvailabilityBlock = {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

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

function createTimeSlots() {
  const slots: string[] = [];

  for (
    let hour = START_HOUR;
    hour < END_HOUR;
    hour++
  ) {
    slots.push(
      `${String(hour).padStart(2, "0")}:00`
    );
    slots.push(
      `${String(hour).padStart(2, "0")}:30`
    );
  }

  return slots;
}

const TIME_SLOTS = createTimeSlots();

function formatTime(time: string) {
  const [hourString, minuteString] =
    time.split(":");

  const hour = Number(hourString);
  const minute = Number(minuteString);

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour =
    hour % 12 === 0 ? 12 : hour % 12;

  return `${displayHour}:${String(minute).padStart(
    2,
    "0"
  )} ${suffix}`;
}

function timeToMinutes(time: string) {
  const [hour, minute] = time
    .split(":")
    .map(Number);

  return hour * 60 + minute;
}

function minutesToTime(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  return `${String(hour).padStart(2, "0")}:${String(
    minute
  ).padStart(2, "0")}`;
}

function isTimeWithinBlock(
  time: string,
  block: AvailabilityBlock
) {
  const current = timeToMinutes(time);
  const start = timeToMinutes(
    block.start_time
  );
  const end = timeToMinutes(block.end_time);

  return current >= start && current < end;
}

export default function TeacherManagePage() {
  const params = useParams();

  const teacherId =
    typeof params.id === "string"
      ? params.id
      : "";

  const locale =
    typeof params.locale === "string"
      ? params.locale
      : "en";

  const [teacher, setTeacher] =
    useState<Teacher | null>(null);

  const [assignments, setAssignments] =
    useState<Assignment[]>([]);

  const [availableEnrollments, setAvailableEnrollments] =
    useState<AvailableEnrollment[]>([]);

  const [availability, setAvailability] =
    useState<AvailabilityBlock[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingAvailability, setLoadingAvailability] =
    useState(false);

  const [savingAvailability, setSavingAvailability] =
    useState(false);

  const [availabilityMessage, setAvailabilityMessage] =
    useState("");

  const [availabilityError, setAvailabilityError] =
    useState("");

  const [loadingEnrollments, setLoadingEnrollments] =
    useState(false);

  const [showAssignPanel, setShowAssignPanel] =
    useState(false);

  const [selectedEnrollmentStudentId, setSelectedEnrollmentStudentId] =
    useState("");

  const [assigning, setAssigning] =
    useState(false);

  const [error, setError] =
    useState("");

  const [assignmentError, setAssignmentError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /*
   * -------------------------------------------------------------------------
   * LOAD TEACHER + ASSIGNMENTS + AVAILABILITY
   * -------------------------------------------------------------------------
   */

  useEffect(() => {
    async function loadTeacher() {
      if (!teacherId) {
        setError("Teacher could not be found.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "/api/admin/teachers"
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.error ||
              "We couldn't load this teacher right now."
          );
          return;
        }

        const foundTeacher = (
          data.teachers || []
        ).find(
          (item: Teacher) =>
            item.id === teacherId
        );

        if (!foundTeacher) {
          setError("Teacher could not be found.");
          return;
        }

        setTeacher(foundTeacher);

        await Promise.all([
          loadAssignments(),
          loadAvailability(),
        ]);
      } catch (error) {
        console.error(
          "Teacher manage error:",
          error
        );

        setError(
          "We couldn't load this teacher right now."
        );
      } finally {
        setLoading(false);
      }
    }

    async function loadAssignments() {
      const response = await fetch(
        `/api/admin/teachers/${teacherId}/assignments`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "We couldn't load the teacher's assignments."
        );
      }

      setAssignments(
        data.assignments || []
      );
    }

    async function loadAvailability() {
      setLoadingAvailability(true);

      try {
        const response = await fetch(
          `/api/admin/teachers/${teacherId}/availability`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "We couldn't load the teacher's availability."
          );
        }

        setAvailability(
          data.availability || []
        );
      } finally {
        setLoadingAvailability(false);
      }
    }

    loadTeacher();
  }, [teacherId]);

  /*
   * -------------------------------------------------------------------------
   * AVAILABILITY HELPERS
   * -------------------------------------------------------------------------
   */

  const availabilityByDay = useMemo(() => {
    const result: Record<
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

    availability.forEach((block) => {
      if (!result[block.day_of_week]) {
        result[block.day_of_week] = [];
      }

      result[block.day_of_week].push(block);
    });

    return result;
  }, [availability]);

  function addAvailabilityBlock(
    dayOfWeek: number,
    startTime: string
  ) {
    const startMinutes =
      timeToMinutes(startTime);

    const endMinutes =
      startMinutes + INTERVAL_MINUTES;

    if (endMinutes > END_HOUR * 60) {
      return;
    }

    const newBlock: AvailabilityBlock = {
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: minutesToTime(
        endMinutes
      ),
    };

    setAvailability((current) => [
      ...current,
      newBlock,
    ]);

    setAvailabilityMessage("");
    setAvailabilityError("");
  }

  function removeAvailabilityBlock(
    dayOfWeek: number,
    startTime: string
  ) {
    setAvailability((current) =>
      current.filter(
        (block) =>
          !(
            block.day_of_week === dayOfWeek &&
            block.start_time === startTime
          )
      )
    );

    setAvailabilityMessage("");
    setAvailabilityError("");
  }

  function toggleAvailabilitySlot(
    dayOfWeek: number,
    time: string
  ) {
    const existingBlock =
      availabilityByDay[dayOfWeek]?.find(
        (block) =>
          isTimeWithinBlock(time, block)
      );

    if (existingBlock) {
      removeAvailabilityBlock(
        dayOfWeek,
        existingBlock.start_time
      );
      return;
    }

    addAvailabilityBlock(
      dayOfWeek,
      time
    );
  }

  function mergeAvailabilityBlocks(
    blocks: AvailabilityBlock[]
  ) {
    const sorted = [...blocks].sort(
      (a, b) => {
        if (
          a.day_of_week !==
          b.day_of_week
        ) {
          return (
            a.day_of_week -
            b.day_of_week
          );
        }

        return (
          timeToMinutes(a.start_time) -
          timeToMinutes(b.start_time)
        );
      }
    );

    const merged: AvailabilityBlock[] = [];

    for (const block of sorted) {
      const previous =
        merged[merged.length - 1];

      if (
        previous &&
        previous.day_of_week ===
          block.day_of_week &&
        timeToMinutes(
          previous.end_time
        ) >=
          timeToMinutes(
            block.start_time
          )
      ) {
        if (
          timeToMinutes(
            block.end_time
          ) >
          timeToMinutes(
            previous.end_time
          )
        ) {
          previous.end_time =
            block.end_time;
        }
      } else {
        merged.push({
          day_of_week:
            block.day_of_week,
          start_time:
            block.start_time,
          end_time:
            block.end_time,
        });
      }
    }

    return merged;
  }

  async function saveAvailability() {
    setAvailabilityError("");
    setAvailabilityMessage("");
    setSavingAvailability(true);

    try {
      const cleanedAvailability =
        mergeAvailabilityBlocks(
          availability
        );

      const response = await fetch(
        `/api/admin/teachers/${teacherId}/availability`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            availability:
              cleanedAvailability,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setAvailabilityError(
          data.error ||
            "We couldn't save the teacher's availability."
        );
        return;
      }

      setAvailability(
        data.availability ||
          cleanedAvailability
      );

      setAvailabilityMessage(
        "Weekly availability saved."
      );
    } catch (error) {
      console.error(
        "Save availability error:",
        error
      );

      setAvailabilityError(
        "Something went wrong while saving availability."
      );
    } finally {
      setSavingAvailability(false);
    }
  }

  /*
   * -------------------------------------------------------------------------
   * ASSIGN STUDENT
   * -------------------------------------------------------------------------
   */

  async function openAssignPanel() {
    setShowAssignPanel(true);
    setAssignmentError("");
    setSuccess("");
    setSelectedEnrollmentStudentId("");

    if (availableEnrollments.length > 0) {
      return;
    }

    setLoadingEnrollments(true);

    try {
      const response = await fetch(
        "/api/admin/teachers/available-enrollments"
      );

      const data = await response.json();

      if (!response.ok) {
        setAssignmentError(
          data.error ||
            "We couldn't load the available enrollments."
        );
        return;
      }

      setAvailableEnrollments(
        data.enrollments || []
      );
    } catch (error) {
      console.error(
        "Available enrollments error:",
        error
      );

      setAssignmentError(
        "We couldn't load the available enrollments."
      );
    } finally {
      setLoadingEnrollments(false);
    }
  }

  async function handleAssign() {
    if (!selectedEnrollmentStudentId) {
      setAssignmentError(
        "Please select a student first."
      );
      return;
    }

    setAssignmentError("");
    setSuccess("");
    setAssigning(true);

    try {
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

      const data =
        await response.json();

      if (!response.ok) {
        setAssignmentError(
          data.error ||
            "We couldn't assign this student."
        );
        return;
      }

      const assignmentsResponse =
        await fetch(
          `/api/admin/teachers/${teacherId}/assignments`
        );

      const assignmentsData =
        await assignmentsResponse.json();

      if (assignmentsResponse.ok) {
        setAssignments(
          assignmentsData.assignments ||
            []
        );
      }

      setSuccess(
        "Student assigned successfully."
      );

      setSelectedEnrollmentStudentId("");

      setAvailableEnrollments(
        (current) =>
          current.filter(
            (enrollment) =>
              enrollment.enrollment_student_id !==
              selectedEnrollmentStudentId
          )
      );
    } catch (error) {
      console.error(
        "Teacher assignment error:",
        error
      );

      setAssignmentError(
        "Something went wrong while assigning the student."
      );
    } finally {
      setAssigning(false);
    }
  }

  /*
   * -------------------------------------------------------------------------
   * RENDER
   * -------------------------------------------------------------------------
   */

  return (
    <main
      className="
        min-h-screen
        bg-[#FAF8F5]
        text-[#292929]
      "
    >
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
            href={`/${locale}/admin/teachers`}
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
            &larr; Teachers
          </Link>

          <Link
            href={`/${locale}`}
            className="
              shrink-0
              text-right
              transition-opacity
              duration-200
              hover:opacity-70
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
          </Link>
        </div>
      </header>

      {/* =================================================================== */}
      {/* CONTENT                                                             */}
      {/* =================================================================== */}

      <div
        className="
          mx-auto
          max-w-5xl
          px-6
          pb-20
          pt-12
          sm:px-8
          sm:pb-24
          sm:pt-16
          lg:px-10
        "
      >
        {/* ----------------------------------------------------------------- */}
        {/* PAGE HEADER                                                       */}
        {/* ----------------------------------------------------------------- */}

        {loading ? (
          <div className="pt-8">
            <p
              className="
                font-sans
                text-[14px]
                text-[#777]
              "
            >
              Loading teacher...
            </p>
          </div>
        ) : error ? (
          <div
            className="
              mt-8
              rounded-3xl
              border
              border-[#E7DDD1]
              bg-white
              p-8
              shadow-[0_5px_24px_rgba(70,60,45,0.035)]
            "
          >
            <p
              className="
                font-sans
                text-[14px]
                leading-6
                text-[#8A5148]
              "
            >
              {error}
            </p>
          </div>
        ) : teacher ? (
          <div className="pt-8">
            {/* Teacher Information */}

            <div>
              <h1
                className="
                  font-serif
                  text-[42px]
                  font-normal
                  leading-tight
                  tracking-[-0.03em]
                  text-[#292929]
                  sm:text-[48px]
                "
              >
                {teacher.full_name ||
                  "Unnamed Teacher"}
              </h1>

              <p
                className="
                  mt-3
                  font-sans
                  text-[15px]
                  text-[#777]
                "
              >
                {teacher.email ||
                  "No email available"}
              </p>

              <span
                className={`
                  mt-4
                  inline-flex
                  rounded-full
                  px-3
                  py-1.5
                  font-sans
                  text-[12px]
                  font-medium
                  ${
                    teacher.status ===
                    "active"
                      ? "bg-[#EAF1E7] text-[#55705A]"
                      : "bg-[#F1ECE7] text-[#777]"
                  }
                `}
              >
                {teacher.status ===
                "active"
                  ? "Active"
                  : "Inactive"}
              </span>
            </div>
          </div>
        ) : null}

        {/* ================================================================= */}
        {/* TEACHER CONTENT                                                   */}
        {/* ================================================================= */}

        {!loading &&
          !error &&
          teacher && (
            <section className="mt-14">
              {/* =========================================================== */}
              {/* WEEKLY AVAILABILITY                                         */}
              {/* =========================================================== */}

              <div>
                <div
                  className="
                    flex
                    flex-col
                    gap-4
                    sm:flex-row
                    sm:items-end
                    sm:justify-between
                  "
                >
                  <div>
                    <h2
                      className="
                        font-serif
                        text-[28px]
                        font-normal
                        tracking-[-0.02em]
                        text-[#292929]
                      "
                    >
                      Weekly Availability
                    </h2>

                    <p
                      className="
                        mt-2
                        max-w-2xl
                        font-serif
                        text-[17px]
                        leading-7
                        text-[#666]
                      "
                    >
                      Set the teacher&apos;s
                      regular weekly teaching
                      hours. This schedule repeats
                      each week.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={saveAvailability}
                    disabled={
                      savingAvailability
                    }
                    className="
                      w-fit
                      shrink-0
                      rounded-full
                      bg-[#6F8F72]
                      px-5
                      py-3
                      font-sans
                      text-[14px]
                      font-medium
                      text-white
                      shadow-[0_3px_10px_rgba(111,143,114,0.12)]
                      transition
                      hover:bg-[#5F7F63]
                      hover:shadow-[0_5px_14px_rgba(111,143,114,0.16)]
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {savingAvailability
                      ? "Saving..."
                      : "Save Availability"}
                  </button>
                </div>

                {/* Availability messages */}

                {availabilityError && (
                  <p
                    className="
                      mt-5
                      rounded-xl
                      bg-[#F8ECE8]
                      px-4
                      py-3
                      font-sans
                      text-[14px]
                      leading-6
                      text-[#8A5148]
                    "
                  >
                    {availabilityError}
                  </p>
                )}

                {availabilityMessage && (
                  <p
                    className="
                      mt-5
                      rounded-xl
                      bg-[#EAF1E7]
                      px-4
                      py-3
                      font-sans
                      text-[14px]
                      leading-6
                      text-[#55705A]
                    "
                  >
                    {availabilityMessage}
                  </p>
                )}

                {/* Calendar */}

                <div
                  className="
                    mt-6
                    overflow-hidden
                    rounded-3xl
                    border
                    border-[#DCD8D2]
                    bg-white
                    shadow-[0_5px_24px_rgba(70,60,45,0.035)]
                  "
                >
                  {loadingAvailability ? (
                    <div className="p-8">
                      <p
                        className="
                          font-sans
                          text-[14px]
                          text-[#777]
                        "
                      >
                        Loading availability...
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <div
                        className="
                          min-w-[760px]
                        "
                      >
                        {/* Calendar header */}

                        <div
                          className="
                            grid
                            grid-cols-[76px_repeat(7,minmax(94px,1fr))]
                            border-b
                            border-[#DCD8D2]
                            bg-[#FAF8F5]
                          "
                        >
                          <div
                            className="
                              border-r
                              border-[#DCD8D2]
                              px-3
                              py-4
                            "
                          />

                          {DAYS.map((day) => (
                            <div
                              key={day.value}
                              className="
                                border-r
                                border-[#DCD8D2]
                                px-2
                                py-4
                                text-center
                                last:border-r-0
                              "
                            >
                              <p
                                className="
                                  font-sans
                                  text-[12px]
                                  font-medium
                                  uppercase
                                  tracking-[0.08em]
                                  text-[#777]
                                "
                              >
                                {day.label}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Calendar body */}

                        <div>
                          {TIME_SLOTS.map(
                            (time) => (
                              <div
                                key={time}
                                className="
                                  grid
                                  grid-cols-[76px_repeat(7,minmax(94px,1fr))]
                                "
                              >
                                {/* Time */}

                                <div
                                  className="
                                    relative
                                    border-r
                                    border-b
                                    border-[#E7E4DE]
                                    bg-[#FCFBF8]
                                    px-3
                                    py-2
                                  "
                                >
                                  <span
                                    className="
                                      absolute
                                      -top-[8px]
                                      left-3
                                      whitespace-nowrap
                                      font-sans
                                      text-[10px]
                                      text-[#999]
                                    "
                                  >
                                    {formatTime(
                                      time
                                    )}
                                  </span>
                                </div>

                                {/* Days */}

                                {DAYS.map(
                                  (day) => {
                                    const blocks =
                                      availabilityByDay[
                                        day.value
                                      ] || [];

                                    const active =
                                      blocks.some(
                                        (
                                          block
                                        ) =>
                                          isTimeWithinBlock(
                                            time,
                                            block
                                          )
                                      );

                                    const blockStartingHere =
                                      blocks.find(
                                        (
                                          block
                                        ) =>
                                          block.start_time ===
                                          time
                                      );

                                    return (
                                      <button
                                        key={`${day.value}-${time}`}
                                        type="button"
                                        onClick={() =>
                                          toggleAvailabilitySlot(
                                            day.value,
                                            time
                                          )
                                        }
                                        aria-label={`${day.label} ${formatTime(
                                          time
                                        )}`}
                                        className={`
                                          relative
                                          h-[42px]
                                          border-r
                                          border-b
                                          border-[#E7E4DE]
                                          transition-colors
                                          last:border-r-0
                                          ${
                                            active
                                              ? "bg-[#E8EFE5] hover:bg-[#DDE8DA]"
                                              : "bg-white hover:bg-[#F8F7F3]"
                                          }
                                        `}
                                      >
                                        {blockStartingHere && (
                                          <span
                                            className="
                                              absolute
                                              left-2
                                              right-2
                                              top-1/2
                                              h-[3px]
                                              -translate-y-1/2
                                              rounded-full
                                              bg-[#6F8F72]
                                              opacity-60
                                            "
                                          />
                                        )}
                                      </button>
                                    );
                                  }
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Legend */}

                <div
                  className="
                    mt-4
                    flex
                    flex-wrap
                    items-center
                    gap-x-6
                    gap-y-3
                    font-sans
                    text-[12px]
                    text-[#777]
                  "
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="
                        h-3
                        w-3
                        rounded-[3px]
                        border
                        border-[#D2DDD0]
                        bg-[#E8EFE5]
                      "
                    />
                    <span>
                      Available
                    </span>
                  </div>

                  <p>
                    Click or tap a time slot to
                    mark it available.
                  </p>
                </div>
              </div>

              {/* =========================================================== */}
              {/* ASSIGNED STUDENTS HEADER                                    */}
              {/* =========================================================== */}

              <div className="mt-16">
                <div
                  className="
                    flex
                    flex-col
                    gap-4
                    sm:flex-row
                    sm:items-end
                    sm:justify-between
                  "
                >
                  <div>
                    <h2
                      className="
                        font-serif
                        text-[28px]
                        font-normal
                        tracking-[-0.02em]
                        text-[#292929]
                      "
                    >
                      Assigned Students
                    </h2>

                    <p
                      className="
                        mt-2
                        font-serif
                        text-[17px]
                        leading-7
                        text-[#666]
                      "
                    >
                      Students currently assigned
                      to this teacher.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={openAssignPanel}
                    className="
                      w-fit
                      rounded-full
                      bg-[#6F8F72]
                      px-5
                      py-3
                      font-sans
                      text-[14px]
                      font-medium
                      text-white
                      shadow-[0_3px_10px_rgba(111,143,114,0.12)]
                      transition
                      hover:bg-[#5F7F63]
                      hover:shadow-[0_5px_14px_rgba(111,143,114,0.16)]
                    "
                  >
                    + Assign Student
                  </button>
                </div>

                {/* --------------------------------------------------------- */}
                {/* ASSIGN STUDENT PANEL                                      */}
                {/* --------------------------------------------------------- */}

                {showAssignPanel && (
                  <div
                    className="
                      mt-6
                      rounded-3xl
                      border
                      border-[#E7DDD1]
                      bg-white
                      p-7
                      shadow-[0_5px_24px_rgba(70,60,45,0.035)]
                      sm:p-8
                    "
                  >
                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-6
                      "
                    >
                      <div>
                        <h3
                          className="
                            font-serif
                            text-[24px]
                            font-normal
                            text-[#292929]
                          "
                        >
                          Assign Student
                        </h3>

                        <p
                          className="
                            mt-2
                            font-serif
                            text-[16px]
                            leading-6
                            text-[#666]
                          "
                        >
                          Choose an active enrollment
                          to assign to this teacher.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setShowAssignPanel(
                            false
                          )
                        }
                        className="
                          font-sans
                          text-[14px]
                          text-[#777]
                          transition-colors
                          hover:text-[#6F8F72]
                        "
                      >
                        Cancel
                      </button>
                    </div>

                    {loadingEnrollments ? (
                      <p
                        className="
                          mt-7
                          font-sans
                          text-[14px]
                          text-[#777]
                        "
                      >
                        Loading students...
                      </p>
                    ) : availableEnrollments.length ===
                      0 ? (
                      <p
                        className="
                          mt-7
                          rounded-xl
                          bg-[#FAF8F5]
                          px-4
                          py-4
                          font-sans
                          text-[14px]
                          leading-6
                          text-[#777]
                        "
                      >
                        There are no active
                        enrollments available to
                        assign.
                      </p>
                    ) : (
                      <div className="mt-7 space-y-3">
                        {availableEnrollments.map(
                          (enrollment) => {
                            const student =
                              enrollment.student;

                            const isSelected =
                              selectedEnrollmentStudentId ===
                              enrollment.enrollment_student_id;

                            return (
                              <button
                                key={
                                  enrollment.enrollment_student_id
                                }
                                type="button"
                                onClick={() =>
                                  setSelectedEnrollmentStudentId(
                                    enrollment.enrollment_student_id
                                  )
                                }
                                className={`
                                  w-full
                                  rounded-2xl
                                  border
                                  p-5
                                  text-left
                                  transition
                                  ${
                                    isSelected
                                      ? "border-[#6F8F72] bg-[#F3F7F1]"
                                      : "border-[#E7DDD1] bg-white hover:border-[#BFCDBF]"
                                  }
                                `}
                              >
                                <div
                                  className="
                                    flex
                                    flex-col
                                    gap-3
                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
                                  "
                                >
                                  <div>
                                    <p
                                      className="
                                        font-serif
                                        text-[19px]
                                        text-[#292929]
                                      "
                                    >
                                      {student?.preferred_name ||
                                        student?.full_name ||
                                        "Unnamed Student"}
                                    </p>

                                    <p
                                      className="
                                        mt-1
                                        font-sans
                                        text-[13px]
                                        text-[#777]
                                      "
                                    >
                                      {student?.student_number
                                        ? `Student #${student.student_number}`
                                        : "No student number"}
                                    </p>
                                  </div>

                                  <p
                                    className="
                                      font-sans
                                      text-[13px]
                                      text-[#666]
                                    "
                                  >
                                    {enrollment
                                      .enrollment
                                      ?.package_name ||
                                      "Enrollment"}
                                  </p>
                                </div>
                              </button>
                            );
                          }
                        )}
                      </div>
                    )}

                    {assignmentError && (
                      <p
                        className="
                          mt-5
                          rounded-xl
                          bg-[#F8ECE8]
                          px-4
                          py-3
                          font-sans
                          text-[14px]
                          leading-6
                          text-[#8A5148]
                        "
                      >
                        {assignmentError}
                      </p>
                    )}

                    {success && (
                      <p
                        className="
                          mt-5
                          rounded-xl
                          bg-[#EAF1E7]
                          px-4
                          py-3
                          font-sans
                          text-[14px]
                          leading-6
                          text-[#55705A]
                        "
                      >
                        {success}
                      </p>
                    )}

                    {availableEnrollments.length >
                      0 && (
                      <button
                        type="button"
                        onClick={handleAssign}
                        disabled={
                          !selectedEnrollmentStudentId ||
                          assigning
                        }
                        className="
                          mt-6
                          w-full
                          rounded-full
                          bg-[#6F8F72]
                          px-6
                          py-3.5
                          font-sans
                          text-[15px]
                          font-medium
                          text-white
                          transition
                          hover:bg-[#5F7F63]
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        {assigning
                          ? "Assigning..."
                          : "Assign Student"}
                      </button>
                    )}
                  </div>
                )}

                {/* --------------------------------------------------------- */}
                {/* ASSIGNED STUDENTS LIST                                    */}
                {/* --------------------------------------------------------- */}

                <div
                  className="
                    mt-6
                    overflow-hidden
                    rounded-3xl
                    border
                    border-[#E7DDD1]
                    bg-white
                    shadow-[0_5px_24px_rgba(70,60,45,0.035)]
                  "
                >
                  {assignments.length ===
                  0 ? (
                    <div className="p-8">
                      <p
                        className="
                          font-sans
                          text-[14px]
                          leading-6
                          text-[#777]
                        "
                      >
                        No students have been
                        assigned to this teacher yet.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E7DDD1]">
                      {assignments.map(
                        (assignment) => (
                          <div
                            key={assignment.id}
                            className="
                              flex
                              flex-col
                              gap-4
                              px-8
                              py-6
                              transition-colors
                              hover:bg-[#FCFBF8]
                              sm:flex-row
                              sm:items-center
                              sm:justify-between
                            "
                          >
                            <div>
                              <p
                                className="
                                  font-serif
                                  text-[20px]
                                  text-[#292929]
                                "
                              >
                                {assignment
                                  .student
                                  ?.preferred_name ||
                                  assignment
                                    .student
                                    ?.full_name ||
                                  "Unnamed Student"}
                              </p>

                              <p
                                className="
                                  mt-1
                                  font-sans
                                  text-[13px]
                                  text-[#777]
                                "
                              >
                                {assignment
                                  .student
                                  ?.student_number
                                  ? `Student #${assignment.student.student_number}`
                                  : "No student number"}
                              </p>

                              <p
                                className="
                                  mt-2
                                  font-sans
                                  text-[14px]
                                  text-[#666]
                                "
                              >
                                {assignment
                                  .enrollment
                                  ?.package_name ||
                                  "Enrollment"}
                              </p>
                            </div>

                            <span
                              className="
                                w-fit
                                rounded-full
                                bg-[#EAF1E7]
                                px-3
                                py-1.5
                                font-sans
                                text-[12px]
                                font-medium
                                text-[#55705A]
                              "
                            >
                              Active
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
      </div>
    </main>
  );
}