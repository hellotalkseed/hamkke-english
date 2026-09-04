"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  CreditCard,
  Users,
  X,
} from "lucide-react";

interface Student {
  id: string;
  full_name: string;
  preferred_name: string | null;
}

interface ParticipantSchedule {
  studentId: string;
  scheduleDays: string[];
  scheduleTimes: Record<string, string>;
}

/*
 * Raw participant schedule shape provided by StudentPage.
 *
 * StudentPage gets these directly from enrollment_schedules,
 * where day_of_week is stored as a number and schedule_time
 * is stored as a time string.
 */
interface PrintableParticipantSchedule {
  student_id: string;
  student_name: string;
  day_of_week: number;
  schedule_time: string;
}

interface RenewEnrollmentButtonProps {
  studentId: string;
  enrollmentId: string;
  locale: string;
  packageName: string;
  numberOfLessons: number;
  lessonDuration: number | null;
  lessonsPerWeek: number | null;
  scheduleDays: string[] | null;
  scheduleTime: string | null;
  tuitionAmount: number;
  currency: string;

  /*
   * StudentPage provides the complete student list
   * so shared renewals can select existing students.
   */
  students?: Student[];

  /*
   * Existing participant IDs are kept supported for compatibility.
   */
  participantIds?: string[];

  /*
   * StudentPage provides the current enrollment's
   * participant schedules in its database shape.
   */
  participantSchedules?: PrintableParticipantSchedule[];

  enrollmentType?: "individual" | "shared";
  tuitionAmountPhp?: number | null;
  tuitionAmountKrw?: number | null;
}

const DAYS = [
  ["Monday", "mon"],
  ["Tuesday", "tue"],
  ["Wednesday", "wed"],
  ["Thursday", "thu"],
  ["Friday", "fri"],
  ["Saturday", "sat"],
  ["Sunday", "sun"],
] as const;

const EMPTY_SCHEDULE = (
  studentId: string
): ParticipantSchedule => ({
  studentId,
  scheduleDays: [],
  scheduleTimes: {},
});

function normalizeDay(day: string) {
  const value = day.toLowerCase().trim();

  const map: Record<string, string> = {
    monday: "mon",
    mon: "mon",
    tuesday: "tue",
    tue: "tue",
    wednesday: "wed",
    wed: "wed",
    thursday: "thu",
    thu: "thu",
    friday: "fri",
    fri: "fri",
    saturday: "sat",
    sat: "sat",
    sunday: "sun",
    sun: "sun",
  };

  return map[value] ?? value;
}

function normalizeScheduleDays(
  days: string[] | null | undefined
) {
  if (!days) {
    return [];
  }

  return days
    .map(normalizeDay)
    .filter((day, index, array) => {
      return (
        DAYS.some(([, value]) => value === day) &&
        array.indexOf(day) === index
      );
    });
}

function normalizeTime(time: string | null | undefined) {
  if (!time) {
    return "";
  }

  return time.slice(0, 5);
}

function formatTime(time: string) {
  if (!time) {
    return "";
  }

  const [hours, minutes] = time.split(":").map(Number);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return time;
  }

  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getDayValueFromIndex(dayOfWeek: number) {
  const values = [
    "sun",
    "mon",
    "tue",
    "wed",
    "thu",
    "fri",
    "sat",
  ];

  return values[dayOfWeek] ?? "";
}

function buildInitialSchedule(
  studentId: string,
  scheduleDays: string[] | null,
  scheduleTime: string | null
): ParticipantSchedule {
  const days = normalizeScheduleDays(scheduleDays);

  const times: Record<string, string> = {};

  for (const day of days) {
    times[day] = normalizeTime(scheduleTime);
  }

  return {
    studentId,
    scheduleDays: days,
    scheduleTimes: times,
  };
}

/*
 * Converts StudentPage's enrollment_schedules data:
 *
 * {
 *   student_id,
 *   day_of_week,
 *   schedule_time
 * }
 *
 * into the internal schedule structure used by the form:
 *
 * {
 *   studentId,
 *   scheduleDays,
 *   scheduleTimes
 * }
 */
function buildSchedulesFromStudentPage(
  schedules: PrintableParticipantSchedule[]
) {
  const map: Record<string, ParticipantSchedule> = {};

  for (const item of schedules) {
    const day = getDayValueFromIndex(
      item.day_of_week
    );

    if (!day) {
      continue;
    }

    const existing =
      map[item.student_id] ??
      EMPTY_SCHEDULE(item.student_id);

    const alreadySelected =
      existing.scheduleDays.includes(day);

    map[item.student_id] = {
      studentId: item.student_id,
      scheduleDays: alreadySelected
        ? existing.scheduleDays
        : [...existing.scheduleDays, day],
      scheduleTimes: {
        ...existing.scheduleTimes,
        [day]: normalizeTime(
          item.schedule_time
        ),
      },
    };
  }

  return map;
}

export default function RenewEnrollmentButton({
  studentId,
  enrollmentId,
  locale,
  packageName,
  numberOfLessons,
  lessonDuration,
  lessonsPerWeek,
  scheduleDays,
  scheduleTime,
  tuitionAmount,
  currency,
  students = [],
  participantIds,
  participantSchedules,
  enrollmentType: initialEnrollmentType,
  tuitionAmountPhp,
  tuitionAmountKrw,
}: RenewEnrollmentButtonProps) {
  const [open, setOpen] = useState(false);

  const initialType =
    initialEnrollmentType ??
    (participantIds && participantIds.length > 1
      ? "shared"
      : "individual");

  const initialParticipants = useMemo(() => {
    if (
      initialType === "shared" &&
      participantIds &&
      participantIds.length > 0
    ) {
      return Array.from(
        new Set([studentId, ...participantIds])
      );
    }

    /*
     * If StudentPage supplied participant schedules,
     * use those student IDs to reconstruct the
     * current shared enrollment participants.
     */
    if (
      initialType === "shared" &&
      participantSchedules &&
      participantSchedules.length > 0
    ) {
      return Array.from(
        new Set([
          studentId,
          ...participantSchedules.map(
            (item) => item.student_id
          ),
        ])
      );
    }

    return [studentId];
  }, [
    initialType,
    participantIds,
    participantSchedules,
    studentId,
  ]);

  const initialSchedules = useMemo(() => {
    const map: Record<
      string,
      ParticipantSchedule
    > = {};

    /*
     * First convert the schedules supplied by
     * StudentPage into the internal format.
     */
    if (
      participantSchedules &&
      participantSchedules.length > 0
    ) {
      const converted =
        buildSchedulesFromStudentPage(
          participantSchedules
        );

      Object.assign(map, converted);
    }

    /*
     * Always make sure the current student has
     * a schedule, even if no participant schedule
     * was supplied.
     */
    if (!map[studentId]) {
      map[studentId] =
        buildInitialSchedule(
          studentId,
          scheduleDays,
          scheduleTime
        );
    }

    return map;
  }, [
    participantSchedules,
    scheduleDays,
    scheduleTime,
    studentId,
  ]);

  const [enrollmentType, setEnrollmentType] =
    useState<"individual" | "shared">(
      initialType
    );

  const [participants, setParticipants] =
    useState<string[]>(initialParticipants);

  const [
    participantScheduleState,
    setParticipantScheduleState,
  ] = useState<
    Record<string, ParticipantSchedule>
  >(initialSchedules);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [startDate, setStartDate] =
    useState("");

  const [packageNameState, setPackageNameState] =
    useState(packageName);

  const [
    numberOfLessonsState,
    setNumberOfLessonsState,
  ] = useState(String(numberOfLessons));

  const [
    lessonDurationState,
    setLessonDurationState,
  ] = useState(
    String(lessonDuration ?? 25)
  );

  const [tuitionKrwState, setTuitionKrwState] =
    useState(
      String(
        tuitionAmountKrw ??
          (currency.toUpperCase() === "KRW"
            ? tuitionAmount
            : "")
      )
    );

  const [tuitionPhpState, setTuitionPhpState] =
    useState(
      tuitionAmountPhp !== null &&
        tuitionAmountPhp !== undefined
        ? String(tuitionAmountPhp)
        : ""
    );

  const [paymentDate, setPaymentDate] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("pending");

  const [reference, setReference] =
    useState("");

  const studentName =
    students.find(
      (item) => item.id === studentId
    )?.preferred_name ||
    students.find(
      (item) => item.id === studentId
    )?.full_name ||
    "Student";

  const availableStudents = useMemo(() => {
    const map = new Map<string, Student>();

    /*
     * Always keep the student whose admin record
     * is currently open.
     */
    const currentStudent = students.find(
      (item) => item.id === studentId
    );

    if (currentStudent) {
      map.set(
        currentStudent.id,
        currentStudent
      );
    } else {
      map.set(studentId, {
        id: studentId,
        full_name: studentName,
        preferred_name: null,
      });
    }

    for (const item of students) {
      map.set(item.id, item);
    }

    return Array.from(map.values()).sort(
      (a, b) => {
        const nameA =
          a.preferred_name || a.full_name;

        const nameB =
          b.preferred_name || b.full_name;

        return nameA.localeCompare(nameB);
      }
    );
  }, [students, studentId, studentName]);

  const participantScheduleEntries =
    useMemo(() => {
      return participants.map(
        (participantId) =>
          participantScheduleState[
            participantId
          ] ??
          EMPTY_SCHEDULE(participantId)
      );
    }, [
      participants,
      participantScheduleState,
    ]);

  const individualLessonsPerWeek =
    participantScheduleState[studentId]
      ?.scheduleDays.length ?? 0;

  function getStudent(
    studentIdValue: string
  ) {
    return (
      availableStudents.find(
        (item) =>
          item.id === studentIdValue
      ) ?? {
        id: studentIdValue,
        full_name: "Selected Student",
        preferred_name: null,
      }
    );
  }

  function getParticipantName(
    studentIdValue: string
  ) {
    const participant =
      getStudent(studentIdValue);

    return (
      participant.preferred_name ||
      participant.full_name
    );
  }

  function resetForm() {
    setEnrollmentType(initialType);
    setParticipants(initialParticipants);
    setParticipantScheduleState(
      initialSchedules
    );
    setStartDate("");
    setPackageNameState(packageName);
    setNumberOfLessonsState(
      String(numberOfLessons)
    );
    setLessonDurationState(
      String(lessonDuration ?? 25)
    );
    setTuitionKrwState(
      String(
        tuitionAmountKrw ??
          (currency.toUpperCase() === "KRW"
            ? tuitionAmount
            : "")
      )
    );
    setTuitionPhpState(
      tuitionAmountPhp !== null &&
        tuitionAmountPhp !== undefined
        ? String(tuitionAmountPhp)
        : ""
    );
    setPaymentDate("");
    setPaymentMethod("pending");
    setReference("");
    setIsSubmitting(false);
  }

  function closeForm() {
    if (isSubmitting) {
      return;
    }

    setOpen(false);
  }

  function updateParticipantTime(
    participantId: string,
    day: string,
    time: string
  ) {
    setParticipantScheduleState(
      (current) => {
        const existing =
          current[participantId] ??
          EMPTY_SCHEDULE(participantId);

        return {
          ...current,
          [participantId]: {
            ...existing,
            scheduleTimes: {
              ...existing.scheduleTimes,
              [day]: time,
            },
          },
        };
      }
    );
  }

  function toggleParticipantDay(
    participantId: string,
    day: string
  ) {
    setParticipantScheduleState(
      (current) => {
        const existing =
          current[participantId] ??
          EMPTY_SCHEDULE(participantId);

        const isSelected =
          existing.scheduleDays.includes(day);

        const nextDays = isSelected
          ? existing.scheduleDays.filter(
              (value) => value !== day
            )
          : [
              ...existing.scheduleDays,
              day,
            ];

        const nextTimes = {
          ...existing.scheduleTimes,
        };

        if (isSelected) {
          delete nextTimes[day];
        }

        return {
          ...current,
          [participantId]: {
            ...existing,
            scheduleDays: nextDays,
            scheduleTimes: nextTimes,
          },
        };
      }
    );
  }

  function toggleParticipant(
    participantId: string
  ) {
    /*
     * The student whose admin record is open
     * must always remain in the renewal.
     */
    if (participantId === studentId) {
      return;
    }

    setParticipants((current) => {
      if (current.includes(participantId)) {
        return current.filter(
          (id) => id !== participantId
        );
      }

      return [...current, participantId];
    });

    setParticipantScheduleState(
      (current) => ({
        ...current,
        [participantId]:
          current[participantId] ??
          EMPTY_SCHEDULE(participantId),
      })
    );
  }

  function handleEnrollmentTypeChange(
    type: "individual" | "shared"
  ) {
    setEnrollmentType(type);

    if (type === "individual") {
      setParticipants([studentId]);

      setParticipantScheduleState(
        (current) => ({
          ...current,
          [studentId]:
            current[studentId] ??
            buildInitialSchedule(
              studentId,
              scheduleDays,
              scheduleTime
            ),
        })
      );

      return;
    }

    setParticipants((current) =>
      current.includes(studentId)
        ? current
        : [studentId, ...current]
    );

    setParticipantScheduleState(
      (current) => ({
        ...current,
        [studentId]:
          current[studentId] ??
          buildInitialSchedule(
            studentId,
            scheduleDays,
            scheduleTime
          ),
      })
    );
  }

  function validateSchedule(
    schedule: ParticipantSchedule,
    name: string
  ) {
    if (schedule.scheduleDays.length === 0) {
      alert(
        `Please select at least one lesson day for ${name}.`
      );

      return false;
    }

    for (const day of schedule.scheduleDays) {
      if (!schedule.scheduleTimes[day]) {
        const dayName =
          DAYS.find(
            ([, value]) => value === day
          )?.[0] ?? day;

        alert(
          `Please enter a lesson time for ${name} on ${dayName}.`
        );

        return false;
      }
    }

    return true;
  }

  function validateForm() {
    const lessons = Number(
      numberOfLessonsState
    );

    if (
      !Number.isInteger(lessons) ||
      lessons < 1
    ) {
      alert(
        "Please enter a valid number of lessons."
      );

      return false;
    }

    const duration = Number(
      lessonDurationState
    );

    if (
      !Number.isInteger(duration) ||
      duration < 1
    ) {
      alert(
        "Please enter a valid lesson duration."
      );

      return false;
    }

    if (!packageNameState.trim()) {
      alert("Please enter a package name.");

      return false;
    }

    if (!startDate) {
      alert(
        "Please select a lesson start date."
      );

      return false;
    }

    if (!tuitionKrwState) {
      alert(
        "Please enter the tuition amount in KRW."
      );

      return false;
    }

    if (!tuitionPhpState) {
      alert(
        "Please enter the tuition amount in PHP."
      );

      return false;
    }

    if (enrollmentType === "individual") {
      const schedule =
        participantScheduleState[
          studentId
        ] ??
        EMPTY_SCHEDULE(studentId);

      return validateSchedule(
        schedule,
        studentName
      );
    }

    if (participants.length < 2) {
      alert(
        "A shared renewal must have at least two participating students."
      );

      return false;
    }

    for (const participant of participantScheduleEntries) {
      if (
        !validateSchedule(
          participant,
          getParticipantName(
            participant.studentId
          )
        )
      ) {
        return false;
      }
    }

    return true;
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    if (!validateForm()) {
      event.preventDefault();
      return;
    }

    setIsSubmitting(true);
  }

  function renderHiddenScheduleFields() {
    if (enrollmentType === "individual") {
      const schedule =
        participantScheduleState[
          studentId
        ] ??
        EMPTY_SCHEDULE(studentId);

      return (
        <>
          <input
            type="hidden"
            name="student_ids"
            value={studentId}
          />

          <input
            type="hidden"
            name="schedule_days"
            value={schedule.scheduleDays.join(
              ","
            )}
          />

          {schedule.scheduleDays.map((day) => (
            <input
              key={day}
              type="hidden"
              name={`schedule_time_${day}`}
              value={
                schedule.scheduleTimes[
                  day
                ] ?? ""
              }
            />
          ))}

          <input
            type="hidden"
            name="schedule_times"
            value={JSON.stringify(
              schedule.scheduleTimes
            )}
          />
        </>
      );
    }

    return (
      <>
        {participants.map((participantId) => {
          const schedule =
            participantScheduleState[
              participantId
            ] ??
            EMPTY_SCHEDULE(participantId);

          return (
            <div key={participantId}>
              <input
                type="hidden"
                name="student_ids"
                value={participantId}
              />

              <input
                type="hidden"
                name="participant_student_ids"
                value={participantId}
              />

              <input
                type="hidden"
                name={`schedule_days_${participantId}`}
                value={schedule.scheduleDays.join(
                  ","
                )}
              />

              <input
                type="hidden"
                name={`schedule_times_${participantId}`}
                value={JSON.stringify(
                  schedule.scheduleTimes
                )}
              />

              {schedule.scheduleDays.map(
                (day) => (
                  <input
                    key={day}
                    type="hidden"
                    name={`schedule_time_${participantId}_${day}`}
                    value={
                      schedule.scheduleTimes[
                        day
                      ] ?? ""
                    }
                  />
                )
              )}
            </div>
          );
        })}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          resetForm();
          setOpen(true);
        }}
        className="inline-flex items-center justify-center rounded-full bg-[#719477] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#638469]"
      >
        Renew Enrollment
      </button>

      {open && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            overflow-hidden
            bg-[#292929]/30
            p-4
            sm:p-6
          "
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !isSubmitting
            ) {
              closeForm();
            }
          }}
        >
          <div
            className="
              flex w-full max-w-[820px]
              max-h-[calc(100vh-2rem)]
              flex-col
              overflow-hidden
              rounded-3xl
              border border-[#DCD8D2]
              bg-[#FAF8F5]
              shadow-[0_24px_80px_rgba(41,41,41,0.16)]
            "
          >
            {/* ======================================================== */}
            {/* MODAL HEADER                                             */}
            {/* ======================================================== */}

            <div
              className="
                flex shrink-0 items-start justify-between
                gap-6 border-b border-[#DCD8D2]
                px-6 py-6
                sm:px-8 sm:py-7
              "
            >
              <div>
                <p
                  className="
                    font-sans text-[10px]
                    font-medium uppercase
                    tracking-[0.14em]
                    text-[#6F8F72]
                  "
                >
                  Renew Enrollment
                </p>

                <h2
                  className="
                    mt-2 font-serif text-[32px]
                    font-normal tracking-[-0.025em]
                    text-[#292929]
                  "
                >
                  {studentName}
                </h2>

                <p
                  className="
                    mt-2 max-w-[620px]
                    font-sans text-[13px]
                    leading-6 text-[#6B6B66]
                  "
                >
                  Create a new package based on this
                  enrollment. The previous enrollment
                  and its lessons will remain unchanged.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={isSubmitting}
                aria-label="Close renewal form"
                className="
                  flex h-9 w-9 shrink-0
                  items-center justify-center
                  rounded-full
                  text-[#777771]
                  transition-colors
                  hover:bg-[#F0F4ED]
                  hover:text-[#6F8F72]
                  disabled:cursor-not-allowed
                "
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* ======================================================== */}
            {/* SCROLLABLE FORM CONTENT                                 */}
            {/* ======================================================== */}

            <div className="min-h-0 flex-1 overflow-y-auto">
              <form
                action={`/api/admin/students/${studentId}/enrollments`}
                method="POST"
                onSubmit={handleSubmit}
                className="space-y-9 px-6 py-7 sm:px-8 sm:py-8"
              >
                <input
                  type="hidden"
                  name="locale"
                  value={locale}
                />

                <input
                  type="hidden"
                  name="renewal_of"
                  value={enrollmentId}
                />

                <input
                  type="hidden"
                  name="enrollment_type"
                  value={enrollmentType}
                />

                {/* ====================================================== */}
                {/* ENROLLMENT TYPE                                        */}
                {/* ====================================================== */}

                <section>
                  <SectionHeading
                    icon={
                      <Users
                        size={16}
                        strokeWidth={1.5}
                      />
                    }
                    title="Enrollment Type"
                  />

                  <div className="grid gap-3 sm:grid-cols-2">
                    <ChoiceCard
                      checked={
                        enrollmentType ===
                        "individual"
                      }
                      onChange={() =>
                        handleEnrollmentTypeChange(
                          "individual"
                        )
                      }
                      title="Individual"
                      description="One student with an individual lesson schedule."
                    />

                    <ChoiceCard
                      checked={
                        enrollmentType === "shared"
                      }
                      onChange={() =>
                        handleEnrollmentTypeChange(
                          "shared"
                        )
                      }
                      title="Shared"
                      description="One package shared by multiple students."
                    />
                  </div>
                </section>

                {/* ====================================================== */}
                {/* PARTICIPANTS                                           */}
                {/* ====================================================== */}

                <section>
                  <SectionHeading
                    icon={
                      <Users
                        size={16}
                        strokeWidth={1.5}
                      />
                    }
                    title="Participating Students"
                  />

                  <div
                    className="
                      rounded-2xl bg-[#F0F4ED]
                      p-5 sm:p-6
                    "
                  >
                    <p
                      className="
                        font-sans text-[11px]
                        font-medium uppercase
                        tracking-[0.14em]
                        text-[#6F8F72]
                      "
                    >
                      {enrollmentType === "shared"
                        ? "Shared Participants"
                        : "Student"}
                    </p>

                    <p
                      className="
                        mt-2 font-sans text-[12px]
                        leading-5 text-[#6B6B66]
                      "
                    >
                      {enrollmentType === "shared"
                        ? "The current student must remain included. Select any additional students who should continue in the shared package."
                        : "The renewal remains an individual enrollment for this student."}
                    </p>

                    <div className="mt-5 space-y-2">
                      {availableStudents.map(
                        (availableStudent) => {
                          const name =
                            availableStudent.preferred_name ||
                            availableStudent.full_name;

                          const isCurrent =
                            availableStudent.id ===
                            studentId;

                          const selected =
                            participants.includes(
                              availableStudent.id
                            );

                          return (
                            <label
                              key={
                                availableStudent.id
                              }
                              className={`
                                flex items-center gap-3
                                rounded-xl border p-3.5
                                transition-colors
                                ${
                                  selected
                                    ? "border-[#6F8F72] bg-[#FAF8F5]"
                                    : "border-[#DCD8D2] bg-[#FAF8F5]"
                                }
                                ${
                                  enrollmentType ===
                                  "shared"
                                    ? "cursor-pointer"
                                    : ""
                                }
                              `}
                            >
                              <input
                                type="checkbox"
                                checked={selected}
                                disabled={
                                  enrollmentType ===
                                    "individual" ||
                                  isCurrent
                                }
                                onChange={() =>
                                  toggleParticipant(
                                    availableStudent.id
                                  )
                                }
                                className="h-4 w-4 accent-[#6F8F72]"
                              />

                              <span
                                className="
                                  font-sans text-[13px]
                                  text-[#4A4A4A]
                                "
                              >
                                {name}
                              </span>

                              {isCurrent && (
                                <span
                                  className="
                                    ml-auto
                                    font-sans text-[10px]
                                    font-medium uppercase
                                    tracking-[0.1em]
                                    text-[#8A8A84]
                                  "
                                >
                                  Required
                                </span>
                              )}
                            </label>
                          );
                        }
                      )}
                    </div>

                    {enrollmentType === "shared" && (
                      <p
                        className="
                          mt-4 font-sans text-[11px]
                          text-[#777771]
                        "
                      >
                        Current participants:{" "}
                        <span className="font-medium text-[#4A4A4A]">
                          {participants.length}
                        </span>
                      </p>
                    )}
                  </div>
                </section>

                {/* ====================================================== */}
                {/* PACKAGE                                               */}
                {/* ====================================================== */}

                <section>
                  <SectionHeading
                    icon={
                      <BookOpen
                        size={16}
                        strokeWidth={1.5}
                      />
                    }
                    title="Lesson Package"
                  />

                  <div className="space-y-6">
                    <TextField
                      label="Package Name"
                      name="package_name"
                      value={packageNameState}
                      onChange={
                        setPackageNameState
                      }
                      placeholder="20 Private English Lessons"
                      required
                    />

                    <div className="grid gap-6 sm:grid-cols-2">
                      <TextField
                        label="Number of Lessons"
                        name="number_of_lessons"
                        type="number"
                        value={
                          numberOfLessonsState
                        }
                        onChange={
                          setNumberOfLessonsState
                        }
                        min="1"
                        required
                      />

                      <TextField
                        label="Lesson Duration"
                        name="lesson_duration"
                        type="number"
                        value={
                          lessonDurationState
                        }
                        onChange={
                          setLessonDurationState
                        }
                        min="1"
                        required
                      />
                    </div>

                    <div
                      className="
                        rounded-2xl border
                        border-[#DCD8D2]
                        bg-[#FAF8F5] p-5
                      "
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p
                            className="
                              font-sans text-[10px]
                              font-medium uppercase
                              tracking-[0.14em]
                              text-[#6F8F72]
                            "
                          >
                            Lessons Per Week
                          </p>

                          <p
                            className="
                              mt-1 font-serif text-[23px]
                            "
                          >
                            {enrollmentType ===
                            "individual"
                              ? individualLessonsPerWeek
                              : "Calculated per participant"}
                          </p>
                        </div>

                        <CalendarDays
                          size={19}
                          strokeWidth={1.5}
                          className="text-[#6F8F72]"
                        />
                      </div>

                      <p
                        className="
                          mt-2 font-sans text-[11px]
                          leading-5 text-[#777771]
                        "
                      >
                        {enrollmentType ===
                        "individual"
                          ? individualLessonsPerWeek >
                            0
                            ? `Based on ${individualLessonsPerWeek} selected lesson ${
                                individualLessonsPerWeek ===
                                1
                                  ? "day"
                                  : "days"
                              }.`
                            : "Select lesson days below."
                          : "Each participant's weekly frequency is calculated from their own selected lesson days."}
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="renewal_start_date"
                        className="
                          block font-sans text-[10px]
                          font-medium uppercase
                          tracking-[0.14em]
                          text-[#6F8F72]
                        "
                      >
                        New Lesson Start Date
                      </label>

                      <input
                        id="renewal_start_date"
                        name="start_date"
                        type="date"
                        value={startDate}
                        onChange={(event) =>
                          setStartDate(
                            event.target.value
                          )
                        }
                        required
                        className="
                          mt-2 w-full
                          border-b border-[#CFCBC4]
                          bg-transparent px-0 py-2.5
                          font-serif text-[18px]
                          text-[#292929]
                          outline-none
                          focus:border-[#6F8F72]
                        "
                      />

                      <p
                        className="
                          mt-2 font-sans text-[11px]
                          leading-5 text-[#777771]
                        "
                      >
                        Choose the starting date for
                        this new package. The previous
                        enrollment's start date is not
                        copied.
                      </p>
                    </div>

                    {/* ================================================== */}
                    {/* TUITION                                             */}
                    {/* ================================================== */}

                    <div>
                      <p
                        className="
                          font-sans text-[10px]
                          font-medium uppercase
                          tracking-[0.14em]
                          text-[#6F8F72]
                        "
                      >
                        Tuition
                      </p>

                      <div className="mt-4 grid gap-6 sm:grid-cols-2">
                        <TextField
                          label="Tuition Amount (KRW)"
                          name="tuition_amount_krw"
                          type="number"
                          value={tuitionKrwState}
                          onChange={
                            setTuitionKrwState
                          }
                          min="0"
                          step="1"
                          required
                        />

                        <TextField
                          label="Tuition Amount (PHP)"
                          name="tuition_amount_php"
                          type="number"
                          value={tuitionPhpState}
                          onChange={
                            setTuitionPhpState
                          }
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* ====================================================== */}
                {/* SCHEDULES                                             */}
                {/* ====================================================== */}

                <section>
                  <SectionHeading
                    icon={
                      <CalendarDays
                        size={16}
                        strokeWidth={1.5}
                      />
                    }
                    title={
                      enrollmentType ===
                      "individual"
                        ? "Lesson Schedule"
                        : "Participant Schedules"
                    }
                  />

                  {enrollmentType ===
                  "individual" ? (
                    <ParticipantScheduleCard
                      student={getStudent(studentId)}
                      schedule={
                        participantScheduleState[
                          studentId
                        ] ??
                        EMPTY_SCHEDULE(studentId)
                      }
                      onToggleDay={(day) =>
                        toggleParticipantDay(
                          studentId,
                          day
                        )
                      }
                      onTimeChange={(
                        day,
                        time
                      ) =>
                        updateParticipantTime(
                          studentId,
                          day,
                          time
                        )
                      }
                    />
                  ) : (
                    <div className="space-y-4">
                      {participantScheduleEntries.map(
                        (participant) => (
                          <ParticipantScheduleCard
                            key={
                              participant.studentId
                            }
                            student={getStudent(
                              participant.studentId
                            )}
                            schedule={participant}
                            onToggleDay={(day) =>
                              toggleParticipantDay(
                                participant.studentId,
                                day
                              )
                            }
                            onTimeChange={(
                              day,
                              time
                            ) =>
                              updateParticipantTime(
                                participant.studentId,
                                day,
                                time
                              )
                            }
                          />
                        )
                      )}
                    </div>
                  )}
                </section>

                {/* ====================================================== */}
                {/* PAYMENT                                               */}
                {/* ====================================================== */}

                <section>
                  <SectionHeading
                    icon={
                      <CreditCard
                        size={16}
                        strokeWidth={1.5}
                      />
                    }
                    title="Payment Details"
                  />

                  <div
                    className="
                      rounded-2xl bg-[#F0F4ED]
                      p-5 sm:p-6
                    "
                  >
                    <p
                      className="
                        font-sans text-[12px]
                        leading-5 text-[#6B6B66]
                      "
                    >
                      A new payment record will be
                      created for this renewal. It starts
                      as Pending.
                    </p>

                    <div className="mt-6 space-y-6">
                      <div>
                        <label
                          htmlFor="renewal_payment_date"
                          className="
                            block font-sans text-[10px]
                            font-medium uppercase
                            tracking-[0.14em]
                            text-[#6F8F72]
                          "
                        >
                          Payment Date
                        </label>

                        <input
                          id="renewal_payment_date"
                          name="payment_date"
                          type="date"
                          value={paymentDate}
                          onChange={(event) =>
                            setPaymentDate(
                              event.target.value
                            )
                          }
                          className="
                            mt-2 w-full
                            border-b border-[#CFCBC4]
                            bg-transparent px-0 py-2.5
                            font-serif text-[18px]
                            text-[#292929]
                            outline-none
                            focus:border-[#6F8F72]
                          "
                        />

                        <p
                          className="
                            mt-2 font-sans text-[11px]
                            leading-5 text-[#777771]
                          "
                        >
                          Leave blank if payment has
                          not been received.
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="renewal_payment_method"
                          className="
                            block font-sans text-[10px]
                            font-medium uppercase
                            tracking-[0.14em]
                            text-[#6F8F72]
                          "
                        >
                          Payment Method
                        </label>

                        <select
                          id="renewal_payment_method"
                          name="payment_method"
                          value={paymentMethod}
                          onChange={(event) =>
                            setPaymentMethod(
                              event.target.value
                            )
                          }
                          className="
                            mt-2 w-full
                            border-b border-[#CFCBC4]
                            bg-transparent px-0 py-2.5
                            font-serif text-[18px]
                            text-[#292929]
                            outline-none
                            focus:border-[#6F8F72]
                          "
                        >
                          <option value="pending">
                            Pending
                          </option>
                          <option value="Bank Transfer">
                            Bank Transfer
                          </option>
                          <option value="PayPal">
                            PayPal
                          </option>
                          <option value="GCash">
                            GCash
                          </option>
                          <option value="Cash">
                            Cash
                          </option>
                          <option value="Other">
                            Other
                          </option>
                        </select>
                      </div>

                      <TextField
                        label="Reference Number"
                        name="reference"
                        value={reference}
                        onChange={setReference}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </section>

                {/* ====================================================== */}
                {/* WORKFLOW                                               */}
                {/* ====================================================== */}

                <section
                  className="
                    rounded-2xl border
                    border-[#DCD8D2]
                    bg-[#FAF8F5] p-5 sm:p-6
                  "
                >
                  <p
                    className="
                      font-sans text-[10px]
                      font-medium uppercase
                      tracking-[0.14em]
                      text-[#6F8F72]
                    "
                  >
                    Renewal workflow
                  </p>

                  <div className="mt-4 space-y-3">
                    <WorkflowStep
                      number="01"
                      title="New enrollment created"
                      description="A separate pending enrollment is created and linked to the previous enrollment."
                    />

                    <WorkflowStep
                      number="02"
                      title="New contract created"
                      description="A new contract belongs only to this renewal."
                    />

                    <WorkflowStep
                      number="03"
                      title="New payment recorded"
                      description="A separate pending payment belongs only to this renewal."
                    />

                    <WorkflowStep
                      number="04"
                      title="Payment confirmed"
                      description="Confirming this payment activates this renewal without changing the previous enrollment."
                    />

                    <WorkflowStep
                      number="05"
                      title="Lessons generated"
                      description="Lessons are generated for the new enrollment using the new start date and schedule."
                    />
                  </div>
                </section>

                {/* ====================================================== */}
                {/* HIDDEN SCHEDULE DATA                                   */}
                {/* ====================================================== */}

                {renderHiddenScheduleFields()}

                {/* ====================================================== */}
                {/* ACTIONS                                                */}
                {/* ====================================================== */}

                <div
                  className="
                    flex flex-col-reverse gap-3
                    border-t border-[#DCD8D2]
                    pt-6
                    sm:flex-row sm:items-center
                    sm:justify-between
                  "
                >
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={isSubmitting}
                    className="
                      rounded-full
                      px-5 py-2.5
                      font-sans text-[13px]
                      text-[#5F655F]
                      transition-colors
                      hover:bg-[#F0F4ED]
                      hover:text-[#6F8F72]
                      disabled:cursor-not-allowed
                    "
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="
                      rounded-full
                      bg-[#6F8F72]
                      px-6 py-2.5
                      font-sans text-[13px]
                      font-medium text-white
                      transition-opacity
                      hover:opacity-85
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {isSubmitting
                      ? "Creating Renewal..."
                      : "Create Renewal"}
                  </button>
                </div>
              </form>
            </div>

            {/* ======================================================== */}
            {/* MODAL FOOTER                                             */}
            {/* ======================================================== */}

            <div
              className="
                shrink-0 border-t border-[#DCD8D2]
                px-6 py-4 text-center
                sm:px-8
              "
            >
              <p
                className="
                  font-sans text-[10px]
                  text-[#8A8A84]
                "
              >
                Hamkke │ 함께 ·{" "}
                {locale.toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ========================================================================== */
/* SECTION HEADING                                                            */
/* ========================================================================== */

function SectionHeading({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div
        className="
          flex h-9 w-9 shrink-0
          items-center justify-center
          rounded-full bg-[#E2EBDD]
          text-[#6F8F72]
        "
      >
        {icon}
      </div>

      <h3
        className="
          font-serif text-[24px]
          font-normal tracking-[-0.02em]
          text-[#292929]
        "
      >
        {title}
      </h3>
    </div>
  );
}

/* ========================================================================== */
/* CHOICE CARD                                                                */
/* ========================================================================== */

function ChoiceCard({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: () => void;
  title: string;
  description: string;
}) {
  return (
    <label className="cursor-pointer">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />

      <div
        className="
          rounded-2xl
          border border-[#DCD8D2]
          bg-[#FAF8F5]
          p-4
          transition-all
          peer-checked:border-[#6F8F72]
          peer-checked:bg-[#F0F4ED]
        "
      >
        <p className="font-serif text-[18px]">
          {title}
        </p>

        <p
          className="
            mt-1.5 font-sans text-[11px]
            leading-5 text-[#6B6B66]
          "
        >
          {description}
        </p>
      </div>
    </label>
  );
}

/* ========================================================================== */
/* PARTICIPANT SCHEDULE CARD                                                  */
/* ========================================================================== */

function ParticipantScheduleCard({
  student,
  schedule,
  onToggleDay,
  onTimeChange,
}: {
  student: Student;
  schedule: ParticipantSchedule;
  onToggleDay: (day: string) => void;
  onTimeChange: (
    day: string,
    time: string
  ) => void;
}) {
  const name =
    student.preferred_name ||
    student.full_name;

  const lessonsPerWeek =
    schedule.scheduleDays.length;

  return (
    <div
      className="
        rounded-2xl bg-[#F0F4ED]
        p-5 sm:p-6
      "
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p
            className="
              font-sans text-[10px]
              font-medium uppercase
              tracking-[0.14em]
              text-[#6F8F72]
            "
          >
            Participant Schedule
          </p>

          <p className="mt-1 font-serif text-[20px]">
            {name}
          </p>
        </div>

        <span
          className="
            shrink-0 font-sans text-[10px]
            font-medium uppercase
            tracking-[0.08em]
            text-[#8A8A84]
          "
        >
          {lessonsPerWeek}{" "}
          {lessonsPerWeek === 1
            ? "lesson"
            : "lessons"}{" "}
          / week
        </span>
      </div>

      <div className="mt-5 space-y-2">
        {DAYS.map(([label, value]) => {
          const selected =
            schedule.scheduleDays.includes(
              value
            );

          const time =
            schedule.scheduleTimes[value] ??
            "";

          return (
            <div
              key={value}
              className={`
                rounded-xl border p-3.5
                ${
                  selected
                    ? "border-[#6F8F72] bg-[#FAF8F5]"
                    : "border-[#DCD8D2] bg-[#FAF8F5]"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <input
                  id={`renew-day-${student.id}-${value}`}
                  type="checkbox"
                  checked={selected}
                  onChange={() =>
                    onToggleDay(value)
                  }
                  className="h-4 w-4 accent-[#6F8F72]"
                />

                <label
                  htmlFor={`renew-day-${student.id}-${value}`}
                  className="
                    cursor-pointer
                    font-sans text-[13px]
                    font-medium text-[#4A4A4A]
                  "
                >
                  {label}
                </label>

                {selected && time && (
                  <span
                    className="
                      ml-auto font-sans text-[11px]
                      text-[#777771]
                    "
                  >
                    {formatTime(time)}
                  </span>
                )}
              </div>

              {selected && (
                <div className="mt-3 pl-7">
                  <label
                    htmlFor={`renew-time-${student.id}-${value}`}
                    className="
                      block font-sans text-[9px]
                      font-medium uppercase
                      tracking-[0.12em]
                      text-[#8A8A84]
                    "
                  >
                    Time
                  </label>

                  <input
                    id={`renew-time-${student.id}-${value}`}
                    type="time"
                    value={time}
                    required
                    onChange={(event) =>
                      onTimeChange(
                        value,
                        event.target.value
                      )
                    }
                    className="
                      mt-1.5 w-full
                      border-b border-[#CFCBC4]
                      bg-transparent px-0 py-2
                      font-serif text-[17px]
                      text-[#292929]
                      outline-none
                      focus:border-[#6F8F72]
                    "
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p
        className="
          mt-4 font-sans text-[11px]
          leading-5 text-[#777771]
        "
      >
        Each selected day can have its own
        lesson time. The number of selected days
        determines this participant's weekly
        frequency.
      </p>
    </div>
  );
}

/* ========================================================================== */
/* TEXT FIELD                                                                 */
/* ========================================================================== */

function TextField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  min,
  step,
  required,
}: {
  label: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  min?: string;
  step?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        className="
          block font-sans text-[10px]
          font-medium uppercase
          tracking-[0.14em]
          text-[#6F8F72]
        "
      >
        {label}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        min={min}
        step={step}
        required={required}
        className="
          mt-2 w-full
          border-b border-[#CFCBC4]
          bg-transparent px-0 py-2.5
          font-serif text-[18px]
          text-[#292929]
          outline-none
          placeholder:text-[#A09D96]
          focus:border-[#6F8F72]
        "
      />
    </div>
  );
}

/* ========================================================================== */
/* WORKFLOW STEP                                                              */
/* ========================================================================== */

function WorkflowStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <span
        className="
          shrink-0 font-sans text-[10px]
          font-medium tracking-[0.12em]
          text-[#8A8A84]
        "
      >
        {number}
      </span>

      <div>
        <p className="font-serif text-[16px]">
          {title}
        </p>

        <p
          className="
            mt-0.5 font-sans text-[11px]
            leading-5 text-[#6B6B66]
          "
        >
          {description}
        </p>
      </div>
    </div>
  );
}