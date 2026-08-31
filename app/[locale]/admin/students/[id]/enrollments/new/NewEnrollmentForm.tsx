"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CreditCard,
  Users,
} from "lucide-react";

interface Student {
  id: string;
  full_name: string;
  preferred_name: string | null;
}

interface NewEnrollmentFormProps {
  locale: string;
  student: Student;
  students?: Student[];
}

interface ParticipantSchedule {
  studentId: string;
  scheduleDays: string[];
  scheduleTime: string;
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

export default function NewEnrollmentForm({
  locale,
  student,
  students = [],
}: NewEnrollmentFormProps) {
  const [enrollmentType, setEnrollmentType] =
    useState<"individual" | "shared">("individual");

  const [participants, setParticipants] = useState<string[]>([
    student.id,
  ]);

  const [participantSchedules, setParticipantSchedules] =
    useState<Record<string, ParticipantSchedule>>({
      [student.id]: {
        studentId: student.id,
        scheduleDays: [],
        scheduleTime: "",
      },
    });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const studentName =
    student.preferred_name || student.full_name;

  const participantCount = participants.length;

  const action = `/api/admin/students/${student.id}/enrollments`;

  /*
   * Keep the current student available even if the server
   * does not provide the complete student list.
   */
  const availableStudents = useMemo(() => {
    const map = new Map<string, Student>();

    map.set(student.id, student);

    for (const item of students) {
      map.set(item.id, item);
    }

    return Array.from(map.values()).sort((a, b) => {
      const nameA =
        a.preferred_name || a.full_name;
      const nameB =
        b.preferred_name || b.full_name;

      return nameA.localeCompare(nameB);
    });
  }, [student, students]);

  const participantScheduleEntries = useMemo(
    () =>
      participants.map(
        (studentId) =>
          participantSchedules[studentId] ?? {
            studentId,
            scheduleDays: [],
            scheduleTime: "",
          }
      ),
    [participants, participantSchedules]
  );

  function getStudent(studentId: string): Student {
    return (
      availableStudents.find(
        (item) => item.id === studentId
      ) ?? {
        id: studentId,
        full_name: "Selected Student",
        preferred_name: null,
      }
    );
  }

  function updateParticipantSchedule(
    studentId: string,
    changes: Partial<ParticipantSchedule>
  ) {
    setParticipantSchedules((current) => ({
      ...current,
      [studentId]: {
        ...(current[studentId] ?? {
          studentId,
          scheduleDays: [],
          scheduleTime: "",
        }),
        ...changes,
      },
    }));
  }

  function toggleParticipantDay(
    studentId: string,
    day: string
  ) {
    const current =
      participantSchedules[studentId]?.scheduleDays ?? [];

    const next = current.includes(day)
      ? current.filter((value) => value !== day)
      : [...current, day];

    updateParticipantSchedule(studentId, {
      scheduleDays: next,
    });
  }

  function toggleParticipant(studentId: string) {
    setParticipants((current) => {
      if (current.includes(studentId)) {
        /*
         * The student whose admin record we are currently
         * creating the enrollment from must remain part
         * of a shared enrollment.
         */
        if (studentId === student.id) {
          return current;
        }

        return current.filter(
          (id) => id !== studentId
        );
      }

      return [...current, studentId];
    });

    /*
     * Make sure a newly selected participant has a
     * schedule object ready for the schedule section.
     */
    setParticipantSchedules((current) => ({
      ...current,
      [studentId]:
        current[studentId] ?? {
          studentId,
          scheduleDays: [],
          scheduleTime: "",
        },
    }));
  }

  function handleEnrollmentTypeChange(
    type: "individual" | "shared"
  ) {
    setEnrollmentType(type);

    if (type === "individual") {
      /*
       * Individual enrollment always belongs to the
       * student whose record we are currently viewing.
       */
      setParticipants([student.id]);

      setParticipantSchedules((current) => ({
        ...current,
        [student.id]:
          current[student.id] ?? {
            studentId: student.id,
            scheduleDays: [],
            scheduleTime: "",
          },
      }));

      return;
    }

    /*
     * Shared enrollment starts with the current student.
     * Additional participants can then be selected below.
     */
    setParticipants([student.id]);
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    /*
     * Common package validation
     */
    const form = event.currentTarget;

    const numberOfLessons = Number(
      new FormData(form).get("number_of_lessons")
    );

    const lessonDuration = Number(
      new FormData(form).get("lesson_duration")
    );

    const startDate = new FormData(form).get(
      "start_date"
    );

    if (
      !Number.isInteger(numberOfLessons) ||
      numberOfLessons < 1
    ) {
      event.preventDefault();
      alert(
        "Please enter a valid number of lessons."
      );
      return;
    }

    if (
      !Number.isInteger(lessonDuration) ||
      lessonDuration < 1
    ) {
      event.preventDefault();
      alert(
        "Please enter a valid lesson duration."
      );
      return;
    }

    if (!startDate) {
      event.preventDefault();
      alert(
        "Please select a lesson start date."
      );
      return;
    }

    /*
     * Individual enrollment validation
     */
    if (enrollmentType === "individual") {
      const schedule =
        participantSchedules[student.id];

      if (!schedule?.scheduleDays.length) {
        event.preventDefault();
        alert(
          "Please select at least one lesson day."
        );
        return;
      }

      if (!schedule.scheduleTime) {
        event.preventDefault();
        alert(
          "Please select a lesson time."
        );
        return;
      }
    }

    /*
     * Shared enrollment validation
     */
    if (enrollmentType === "shared") {
      if (participants.length < 2) {
        event.preventDefault();
        alert(
          "A shared enrollment must have at least two participating students."
        );
        return;
      }

      for (const participant of participantScheduleEntries) {
        if (participant.scheduleDays.length === 0) {
          event.preventDefault();
          alert(
            `Please select at least one lesson day for ${getStudent(
              participant.studentId
            ).preferred_name ||
              getStudent(participant.studentId).full_name
            }.`
          );
          return;
        }

        if (!participant.scheduleTime) {
          event.preventDefault();
          alert(
            `Please select a lesson time for ${getStudent(
              participant.studentId
            ).preferred_name ||
              getStudent(participant.studentId).full_name
            }.`
          );
          return;
        }
      }
    }

    setIsSubmitting(true);
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
      {/* ================================================================== */}
      {/* HEADER                                                             */}
      {/* ================================================================== */}

      <header className="w-full px-6 pt-7 sm:px-8 sm:pt-8 lg:px-10 xl:px-12">
        <div className="relative flex w-full items-center justify-between">
          <Link
            href={`/${locale}/admin/students/${student.id}`}
            className="
              flex items-center gap-2
              font-sans text-[15px] text-[#5F655F]
              transition-colors hover:text-[#6F8F72]
            "
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Student
          </Link>

          <div
            className="
              absolute left-1/2 hidden -translate-x-1/2
              whitespace-nowrap font-sans text-[15px]
              font-medium text-[#6F8F72]
              sm:block sm:text-[16px]
            "
          >
            Hamkke │ 함께
          </div>

          <div className="flex items-center gap-3 font-sans text-[14px] text-[#5F655F] sm:gap-4 sm:text-[15px]">
            <span className="font-medium text-[#6F8F72]">
              EN
            </span>
          </div>
        </div>
      </header>

      {/* ================================================================== */}
      {/* INTRO                                                              */}
      {/* ================================================================== */}

      <section
        className="
          mx-auto w-full max-w-[1040px]
          px-6 pb-12 pt-10
          sm:px-8 sm:pb-14 sm:pt-20
          lg:px-10 lg:pb-16 lg:pt-24
        "
      >
        <div
          className="
            mb-5 text-center font-sans text-[11px]
            font-medium uppercase tracking-[0.14em]
            text-[#6F8F72]
          "
        >
          New Enrollment
        </div>

        <h1
          className="
            text-center font-serif text-[52px]
            font-normal leading-[1.05]
            tracking-[-0.035em] text-[#292929]
            sm:text-[62px] lg:text-[70px]
          "
        >
          {studentName}
        </h1>

        <p
          className="
            mx-auto mt-8 max-w-[760px]
            text-center font-serif text-[21px]
            leading-8 text-[#4A4A4A]
            sm:text-[23px] sm:leading-9
            lg:text-[25px] lg:leading-10
          "
        >
          Set up a new lesson package for this student.
        </p>
      </section>

      {/* ================================================================== */}
      {/* FORM                                                               */}
      {/* ================================================================== */}

      <section
        className="
          mx-auto w-full max-w-[760px]
          px-6 pb-24
          sm:px-8 lg:px-10
        "
      >
        <form
          action={action}
          method="POST"
          onSubmit={handleSubmit}
          className="space-y-12"
        >
          <input
            type="hidden"
            name="locale"
            value={locale}
          />

          <input
            type="hidden"
            name="enrollment_type"
            value={enrollmentType}
          />

          {/* ============================================================ */}
          {/* ENROLLMENT TYPE                                               */}
          {/* ============================================================ */}

          <section>
            <div className="mb-8 flex items-center gap-4">
              <div
                className="
                  flex h-10 w-10 shrink-0
                  items-center justify-center
                  rounded-full bg-[#E2EBDD]
                  text-[#6F8F72]
                "
              >
                <Users size={17} strokeWidth={1.5} />
              </div>

              <h2
                className="
                  font-serif text-[30px]
                  font-normal tracking-[-0.02em]
                "
              >
                Enrollment Type
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="enrollment_type_ui"
                  value="individual"
                  checked={
                    enrollmentType === "individual"
                  }
                  onChange={() =>
                    handleEnrollmentTypeChange(
                      "individual"
                    )
                  }
                  className="peer sr-only"
                />

                <div
                  className="
                    rounded-2xl border border-[#DCD8D2]
                    bg-[#FAF8F5] p-6
                    transition-all
                    peer-checked:border-[#6F8F72]
                    peer-checked:bg-[#F0F4ED]
                  "
                >
                  <p className="font-serif text-[20px]">
                    Individual Enrollment
                  </p>

                  <p
                    className="
                      mt-2 font-sans text-[13px]
                      leading-6 text-[#6B6B66]
                    "
                  >
                    A regular enrollment for one
                    student.
                  </p>
                </div>
              </label>

              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="enrollment_type_ui"
                  value="shared"
                  checked={
                    enrollmentType === "shared"
                  }
                  onChange={() =>
                    handleEnrollmentTypeChange(
                      "shared"
                    )
                  }
                  className="peer sr-only"
                />

                <div
                  className="
                    rounded-2xl border border-[#DCD8D2]
                    bg-[#FAF8F5] p-6
                    transition-all
                    peer-checked:border-[#6F8F72]
                    peer-checked:bg-[#F0F4ED]
                  "
                >
                  <p className="font-serif text-[20px]">
                    Shared Enrollment
                  </p>

                  <p
                    className="
                      mt-2 font-sans text-[13px]
                      leading-6 text-[#6B6B66]
                    "
                  >
                    One package, payment, and
                    contract shared by multiple
                    students.
                  </p>
                </div>
              </label>
            </div>
          </section>

          {/* ============================================================ */}
          {/* PARTICIPATING STUDENTS                                       */}
          {/* ============================================================ */}

          <section>
            <div className="mb-8 flex items-center gap-4">
              <div
                className="
                  flex h-10 w-10 shrink-0
                  items-center justify-center
                  rounded-full bg-[#E2EBDD]
                  text-[#6F8F72]
                "
              >
                <Users size={17} strokeWidth={1.5} />
              </div>

              <h2
                className="
                  font-serif text-[30px]
                  font-normal tracking-[-0.02em]
                "
              >
                Participating Students
              </h2>
            </div>

            <div
              className="
                rounded-2xl bg-[#F0F4ED]
                p-6 sm:p-8
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
                  mt-3 font-sans text-[13px]
                  leading-6 text-[#6B6B66]
                "
              >
                {enrollmentType === "shared"
                  ? "Select every student who will participate in this shared package. All participants belong to the same enrollment, payment, and contract."
                  : "This enrollment belongs to the student shown above."}
              </p>

              <div className="mt-6 space-y-3">
                {availableStudents.map(
                  (availableStudent) => {
                    const name =
                      availableStudent.preferred_name ||
                      availableStudent.full_name;

                    const isCurrentStudent =
                      availableStudent.id === student.id;

                    const isSelected =
                      participants.includes(
                        availableStudent.id
                      );

                    return (
                      <label
                        key={availableStudent.id}
                        className={`
                          flex items-center gap-3
                          rounded-xl border
                          p-4
                          transition-colors
                          ${
                            isSelected
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
                          name="student_ids"
                          value={availableStudent.id}
                          checked={isSelected}
                          disabled={
                            enrollmentType ===
                              "individual" ||
                            isCurrentStudent
                          }
                          onChange={() =>
                            toggleParticipant(
                              availableStudent.id
                            )
                          }
                          className="h-4 w-4 accent-[#6F8F72]"
                        />

                        <span className="font-sans text-[14px] text-[#4A4A4A]">
                          {name}
                        </span>

                        {isCurrentStudent && (
                          <span className="ml-auto font-sans text-[11px] uppercase tracking-[0.1em] text-[#8A8A84]">
                            {enrollmentType ===
                            "individual"
                              ? "Required"
                              : "Primary Student"}
                          </span>
                        )}
                      </label>
                    );
                  }
                )}
              </div>

              {enrollmentType === "shared" && (
                <>
                  {availableStudents.length === 1 && (
                    <div
                      className="
                        mt-5 rounded-xl
                        border border-dashed
                        border-[#CFCBC4]
                        bg-[#FAF8F5]
                        p-5
                      "
                    >
                      <p className="font-serif text-[18px]">
                        No other students available
                      </p>

                      <p
                        className="
                          mt-2 font-sans text-[13px]
                          leading-6 text-[#6B6B66]
                        "
                      >
                        The student list provided to
                        this page currently contains
                        only {studentName}.
                      </p>
                    </div>
                  )}

                  <p
                    className="
                      mt-5 font-sans text-[12px]
                      leading-5 text-[#777771]
                    "
                  >
                    Current participants:{" "}
                    <span className="font-medium text-[#4A4A4A]">
                      {participantCount}
                    </span>
                  </p>
                </>
              )}

              {enrollmentType === "individual" && (
                <input
                  type="hidden"
                  name="student_ids"
                  value={student.id}
                />
              )}
            </div>
          </section>

          {/* ============================================================ */}
          {/* LESSON PACKAGE                                               */}
          {/* ============================================================ */}

          <section>
            <div className="mb-8 flex items-center gap-4">
              <div
                className="
                  flex h-10 w-10 shrink-0
                  items-center justify-center
                  rounded-full bg-[#E2EBDD]
                  text-[#6F8F72]
                "
              >
                <BookOpen size={17} strokeWidth={1.5} />
              </div>

              <h2
                className="
                  font-serif text-[30px]
                  font-normal tracking-[-0.02em]
                "
              >
                Lesson Package
              </h2>
            </div>

            <div className="space-y-7">
              <Field
                label="Package Name"
                id="package_name"
                name="package_name"
                type="text"
                placeholder="20 Private English Lessons"
                required
              />

              <Field
                label="Number of Lessons"
                id="number_of_lessons"
                name="number_of_lessons"
                type="number"
                defaultValue="20"
                min="1"
                required
              />

              <Field
                label="Lesson Duration"
                id="lesson_duration"
                name="lesson_duration"
                type="number"
                defaultValue="25"
                min="1"
                required
              />

              <div>
                <label
                  htmlFor="start_date"
                  className="
                    block font-sans text-[11px]
                    font-medium uppercase
                    tracking-[0.14em]
                    text-[#6F8F72]
                  "
                >
                  Lesson Start Date
                </label>

                <input
                  id="start_date"
                  name="start_date"
                  type="date"
                  required
                  className="
                    mt-3 w-full
                    border-b border-[#CFCBC4]
                    bg-transparent px-0 py-3
                    font-serif text-[19px]
                    text-[#292929]
                    outline-none transition-colors
                    focus:border-[#6F8F72]
                  "
                />

                <p
                  className="
                    mt-3 font-sans text-[12px]
                    leading-5 text-[#777771]
                  "
                >
                  Lessons begin from this date when
                  payment is confirmed.
                </p>
              </div>

              {/* TUITION */}

              <div>
                <p
                  className="
                    font-sans text-[11px]
                    font-medium uppercase
                    tracking-[0.14em]
                    text-[#6F8F72]
                  "
                >
                  Tuition
                </p>

                <p
                  className="
                    mt-2 font-sans text-[12px]
                    leading-5 text-[#777771]
                  "
                >
                  Record the agreed package tuition
                  in both KRW and PHP.
                </p>

                <div className="mt-5 grid gap-6 sm:grid-cols-2">
                  <Field
                    label="Tuition Amount (KRW)"
                    id="tuition_amount_krw"
                    name="tuition_amount_krw"
                    type="number"
                    placeholder="75000"
                    min="0"
                    step="1"
                    required
                  />

                  <Field
                    label="Tuition Amount (PHP)"
                    id="tuition_amount_php"
                    name="tuition_amount_php"
                    type="number"
                    placeholder="2940"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* PAYMENT */}

              <div
                className="
                  rounded-2xl bg-[#F0F4ED]
                  p-6 sm:p-8
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex h-9 w-9 items-center
                      justify-center rounded-full
                      bg-[#E2EBDD] text-[#6F8F72]
                    "
                  >
                    <CreditCard
                      size={16}
                      strokeWidth={1.5}
                    />
                  </div>

                  <p
                    className="
                      font-sans text-[11px]
                      font-medium uppercase
                      tracking-[0.14em]
                      text-[#6F8F72]
                    "
                  >
                    Payment Details
                  </p>
                </div>

                <p
                  className="
                    mt-3 font-sans text-[13px]
                    leading-6 text-[#6B6B66]
                  "
                >
                  One payment record is created for
                  this enrollment.
                </p>

                <div className="mt-7 space-y-7">
                  <div>
                    <label
                      htmlFor="payment_date"
                      className="
                        block font-sans text-[11px]
                        font-medium uppercase
                        tracking-[0.14em]
                        text-[#6F8F72]
                      "
                    >
                      Payment Date
                    </label>

                    <input
                      id="payment_date"
                      name="payment_date"
                      type="date"
                      className="
                        mt-3 w-full
                        border-b border-[#CFCBC4]
                        bg-transparent px-0 py-3
                        font-serif text-[19px]
                        text-[#292929]
                        outline-none
                        transition-colors
                        focus:border-[#6F8F72]
                      "
                    />

                    <p
                      className="
                        mt-3 font-sans text-[12px]
                        leading-5 text-[#777771]
                      "
                    >
                      Leave blank if payment has
                      not been received yet.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="payment_method"
                      className="
                        block font-sans text-[11px]
                        font-medium uppercase
                        tracking-[0.14em]
                        text-[#6F8F72]
                      "
                    >
                      Payment Method
                    </label>

                    <select
                      id="payment_method"
                      name="payment_method"
                      defaultValue="pending"
                      className="
                        mt-3 w-full
                        border-b border-[#CFCBC4]
                        bg-transparent px-0 py-3
                        font-serif text-[19px]
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

                    <p
                      className="
                        mt-3 font-sans text-[12px]
                        leading-5 text-[#777771]
                      "
                    >
                      Leave as Pending if payment has
                      not been confirmed.
                    </p>
                  </div>

                  <Field
                    label="Reference Number"
                    id="reference"
                    name="reference"
                    type="text"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* SCHEDULE                                                     */}
          {/* ============================================================ */}

          {enrollmentType === "individual" ? (
            <IndividualSchedule
              student={student}
              schedule={
                participantSchedules[student.id] ?? {
                  studentId: student.id,
                  scheduleDays: [],
                  scheduleTime: "",
                }
              }
              onToggleDay={(day) =>
                toggleParticipantDay(
                  student.id,
                  day
                )
              }
              onTimeChange={(time) =>
                updateParticipantSchedule(
                  student.id,
                  {
                    scheduleTime: time,
                  }
                )
              }
            />
          ) : (
            <section>
              <div className="mb-8 flex items-center gap-4">
                <div
                  className="
                    flex h-10 w-10 shrink-0
                    items-center justify-center
                    rounded-full bg-[#E2EBDD]
                    text-[#6F8F72]
                  "
                >
                  <CalendarDays
                    size={17}
                    strokeWidth={1.5}
                  />
                </div>

                <h2
                  className="
                    font-serif text-[30px]
                    font-normal tracking-[-0.02em]
                  "
                >
                  Participant Schedules
                </h2>
              </div>

              <div className="space-y-6">
                {participantScheduleEntries.map(
                  (participant) => (
                    <ParticipantScheduleCard
                      key={participant.studentId}
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
                      onTimeChange={(time) =>
                        updateParticipantSchedule(
                          participant.studentId,
                          {
                            scheduleTime: time,
                          }
                        )
                      }
                    />
                  )
                )}
              </div>

              <p
                className="
                  mt-5 font-sans text-[12px]
                  leading-5 text-[#777771]
                "
              >
                Each participant has an independent
                schedule. The database uses these
                schedules when generating lessons after
                payment is confirmed.
              </p>
            </section>
          )}

          {/* ============================================================ */}
          {/* HIDDEN PARTICIPANT DATA                                     */}
          {/* ============================================================ */}

          {enrollmentType === "individual" ? (
            <>
              <input
                type="hidden"
                name="schedule_days"
                value={
                  participantSchedules[student.id]
                    ?.scheduleDays.join(",") ?? ""
                }
              />

              <input
                type="hidden"
                name="schedule_time"
                value={
                  participantSchedules[student.id]
                    ?.scheduleTime ?? ""
                }
              />
            </>
          ) : (
            participants.map((studentId) => {
              const schedule =
                participantSchedules[studentId];

              return (
                <div key={studentId}>
                  <input
                    type="hidden"
                    name="participant_student_ids"
                    value={studentId}
                  />

                  <input
                    type="hidden"
                    name={`schedule_days_${studentId}`}
                    value={
                      schedule?.scheduleDays.join(
                        ","
                      ) ?? ""
                    }
                  />

                  <input
                    type="hidden"
                    name={`schedule_time_${studentId}`}
                    value={
                      schedule?.scheduleTime ?? ""
                    }
                  />
                </div>
              );
            })
          )}

          {/* ============================================================ */}
          {/* WORKFLOW                                                     */}
          {/* ============================================================ */}

          <section className="rounded-2xl bg-[#F0F4ED] p-6 sm:p-8">
            <p
              className="
                font-sans text-[11px]
                font-medium uppercase
                tracking-[0.14em]
                text-[#6F8F72]
              "
            >
              What happens next
            </p>

            <div className="mt-5 space-y-4">
              <WorkflowStep
                number="01"
                title="Enrollment created"
                description="The package is created as pending. An individual enrollment belongs to one student. A shared enrollment connects multiple students to one enrollment."
              />

              <WorkflowStep
                number="02"
                title="Participants recorded"
                description="Shared participants are linked through enrollment_students. They remain part of the same enrollment and do not receive separate enrollments."
              />

              <WorkflowStep
                number="03"
                title="Contract created"
                description="One contract belongs to this enrollment."
              />

              <WorkflowStep
                number="04"
                title="Payment recorded"
                description="One payment record belongs to this enrollment and stores the package payment details."
              />

              <WorkflowStep
                number="05"
                title="Payment confirmed"
                description="When this enrollment's payment changes to paid, only this enrollment and its contract are activated."
              />

              <WorkflowStep
                number="06"
                title="Lessons generated"
                description="The database generates lessons for this enrollment only. Individual enrollments use the enrollment schedule. Shared enrollments use each participant's schedule."
              />
            </div>
          </section>

          {/* ============================================================ */}
          {/* ACTIONS                                                       */}
          {/* ============================================================ */}

          <div
            className="
              flex flex-col-reverse gap-4
              border-t border-[#DCD8D2]
              pt-8
              sm:flex-row sm:items-center
              sm:justify-between
            "
          >
            <Link
              href={`/${locale}/admin/students/${student.id}`}
              className="
                text-center font-sans text-sm
                text-[#5F655F]
                transition-colors
                hover:text-[#6F8F72]
                sm:text-left
              "
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="
                rounded-full bg-[#6F8F72]
                px-7 py-3 font-sans text-sm
                font-medium text-white
                transition-opacity
                hover:opacity-85
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {isSubmitting
                ? "Creating..."
                : "Create Enrollment"}
            </button>
          </div>
        </form>

        <div className="mt-20">
          <p
            className="
              text-center font-sans
              text-[12px] text-[#8A8A84]
            "
          >
            Hamkke │ 함께
          </p>
        </div>
      </section>
    </main>
  );
}

/* ========================================================================== */
/* INDIVIDUAL SCHEDULE                                                        */
/* ========================================================================== */

function IndividualSchedule({
  student,
  schedule,
  onToggleDay,
  onTimeChange,
}: {
  student: Student;
  schedule: ParticipantSchedule;
  onToggleDay: (day: string) => void;
  onTimeChange: (time: string) => void;
}) {
  return (
    <ParticipantScheduleCard
      student={student}
      schedule={schedule}
      onToggleDay={onToggleDay}
      onTimeChange={onTimeChange}
      title="Lesson Schedule"
    />
  );
}

/* ========================================================================== */
/* PARTICIPANT SCHEDULE CARD                                                   */
/* ========================================================================== */

function ParticipantScheduleCard({
  student,
  schedule,
  onToggleDay,
  onTimeChange,
  title = "Participant Schedule",
}: {
  student: Student;
  schedule: ParticipantSchedule;
  onToggleDay: (day: string) => void;
  onTimeChange: (time: string) => void;
  title?: string;
}) {
  const name =
    student.preferred_name || student.full_name;

  return (
    <section className="rounded-2xl bg-[#F0F4ED] p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <div
          className="
            flex h-9 w-9 items-center
            justify-center rounded-full
            bg-[#E2EBDD] text-[#6F8F72]
          "
        >
          <CalendarDays
            size={16}
            strokeWidth={1.5}
          />
        </div>

        <div>
          <p
            className="
              font-sans text-[11px]
              font-medium uppercase
              tracking-[0.14em]
              text-[#6F8F72]
            "
          >
            {title}
          </p>

          <p className="mt-1 font-serif text-[21px]">
            {name}
          </p>
        </div>
      </div>

      {/* DAYS */}

      <div className="mt-7">
        <p
          className="
            font-sans text-[11px]
            font-medium uppercase
            tracking-[0.12em]
            text-[#6F8F72]
          "
        >
          Lesson Days
        </p>

        <div
          className="
            mt-4 grid grid-cols-2
            gap-x-6 gap-y-4
            sm:grid-cols-4
          "
        >
          {DAYS.map(([label, value]) => (
            <label
              key={value}
              className="
                flex cursor-pointer
                items-center gap-3
                font-sans text-sm
                text-[#4A4A4A]
              "
            >
              <input
                type="checkbox"
                checked={schedule.scheduleDays.includes(
                  value
                )}
                onChange={() =>
                  onToggleDay(value)
                }
                className="h-4 w-4 accent-[#6F8F72]"
              />

              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* TIME */}

      <div className="mt-8">
        <label
          htmlFor={`schedule-time-${student.id}`}
          className="
            block font-sans text-[11px]
            font-medium uppercase
            tracking-[0.12em]
            text-[#6F8F72]
          "
        >
          Lesson Time
        </label>

        <input
          id={`schedule-time-${student.id}`}
          type="time"
          value={schedule.scheduleTime}
          onChange={(event) =>
            onTimeChange(event.target.value)
          }
          className="
            mt-3 w-full
            border-b border-[#CFCBC4]
            bg-transparent px-0 py-3
            font-serif text-[19px]
            text-[#292929]
            outline-none
            transition-colors
            focus:border-[#6F8F72]
          "
        />
      </div>
    </section>
  );
}

/* ========================================================================== */
/* FIELD                                                                      */
/* ========================================================================== */

function Field({
  label,
  id,
  name,
  type,
  placeholder,
  defaultValue,
  min,
  step,
  required,
}: {
  label: string;
  id: string;
  name: string;
  type: string;
  placeholder?: string;
  defaultValue?: string;
  min?: string;
  step?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="
          block font-sans text-[11px]
          font-medium uppercase
          tracking-[0.14em]
          text-[#6F8F72]
        "
      >
        {label}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        min={min}
        step={step}
        required={required}
        className="
          mt-3 w-full
          border-b border-[#CFCBC4]
          bg-transparent px-0 py-3
          font-serif text-[19px]
          text-[#292929]
          outline-none transition-colors
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
    <div className="flex gap-4">
      <span
        className="
          shrink-0 font-sans text-[11px]
          font-medium tracking-[0.12em]
          text-[#8A8A84]
        "
      >
        {number}
      </span>

      <div>
        <p className="font-serif text-[18px]">
          {title}
        </p>

        <p
          className="
            mt-1 font-sans text-[13px]
            leading-6 text-[#6B6B66]
          "
        >
          {description}
        </p>
      </div>
    </div>
  );
}