"use client";

interface Lesson {
  id: string;
  lesson_number: number;
  lesson_date: string | null;
  duration: number | null;
  attendance_status: string;
  notes: string | null;
  original_lesson_date: string | null;
  rescheduled_at: string | null;
  consumes_lesson: boolean;
  resolution: string | null;
  student_id?: string | null;
}

interface Enrollment {
  id: string;
  package_name: string;
  number_of_lessons: number;
  lesson_duration: number | null;
  lessons_per_week: number | null;
  start_date: string | null;
  status: string;
  schedule_days: string[] | null;
  schedule_time: string | null;
  lessons: Lesson[];
  is_shared?: boolean;
}

interface ParticipantSchedule {
  student_id: string;
  student_name: string;
  day_of_week: number;
  schedule_time: string;
}

interface PrintableAttendanceProps {
  studentName: string;
  enrollment: Enrollment;
  lessons: Lesson[];

  /**
   * Maps each participant's student ID to their full name.
   *
   * Example:
   *
   * {
   *   "6193cf16-0f93-4ab6-b43b-b5b028c18c19": "Dasom Kim",
   *   "9e687ce9-c583-47c9-bb49-bf5138fa3cb8": "Bin Lee"
   * }
   */
  participantNameById?: Record<string, string>;

  /**
   * Full names of all participants in the shared enrollment.
   */
  participantNames?: string[];

  /**
   * Participant-specific schedules from public.enrollment_schedules.
   *
   * Each schedule belongs to one participant and one enrollment.
   */
  participantSchedules?: ParticipantSchedule[];
}

export default function PrintableAttendance({
  studentName,
  enrollment,
  lessons,
  participantNameById,
  participantNames,
  participantSchedules,
}: PrintableAttendanceProps) {
  /*
   * ------------------------------------------------------------------------
   * SHARED ENROLLMENT
   * ------------------------------------------------------------------------
   *
   * A shared enrollment has one lesson pool shared by all participants.
   *
   * Example:
   *
   *   Dasom + Bin
   *   20 total lessons
   *
   * If Dasom consumes 1 lesson and Bin consumes 1 lesson:
   *
   *   2 / 20 consumed
   *   18 / 20 remaining
   *
   * The lesson count is NOT calculated separately for each student.
   */

  const isSharedEnrollment =
    enrollment.is_shared === true ||
    enrollment.package_name
      .toLowerCase()
      .includes("shared");

  /*
   * ------------------------------------------------------------------------
   * PARTICIPANT NAME LOOKUP
   * ------------------------------------------------------------------------
   */

  const cleanParticipantNameById =
    Object.fromEntries(
      Object.entries(
        participantNameById ?? {}
      ).filter(
        ([, name]) =>
          typeof name === "string" &&
          name.trim().length > 0
      )
    );

  /*
   * ------------------------------------------------------------------------
   * PARTICIPANT NAMES
   * ------------------------------------------------------------------------
   */

  const namesFromParticipantNames =
    (participantNames ?? [])
      .filter(
        (name) =>
          typeof name === "string" &&
          name.trim().length > 0
      )
      .map((name) => name.trim());

  const namesFromLookup =
    Object.values(
      cleanParticipantNameById
    ).filter(
      (name) =>
        typeof name === "string" &&
        name.trim().length > 0
    );

  /*
   * Also derive participant names from the schedule data.
   *
   * This provides another fallback when the caller has schedule rows
   * containing participant names.
   */
  const namesFromSchedules =
    (participantSchedules ?? [])
      .map(
        (schedule) =>
          schedule.student_name?.trim()
      )
      .filter(
        (
          name
        ): name is string =>
          Boolean(name)
      );

  /*
   * Remove duplicate names while preserving order.
   */
  const derivedParticipantNames =
    Array.from(
      new Set([
        ...namesFromParticipantNames,
        ...namesFromLookup,
        ...namesFromSchedules,
      ])
    );

  /*
   * If this is a shared enrollment but participant data was not passed,
   * still display the current student's name rather than leaving the
   * Participants section blank.
   */
  const displayedParticipantNames =
    isSharedEnrollment
      ? derivedParticipantNames.length > 0
        ? derivedParticipantNames
        : studentName.trim()
          ? [studentName.trim()]
          : []
      : [];

  /*
   * ------------------------------------------------------------------------
   * PARTICIPANT SCHEDULES
   * ------------------------------------------------------------------------
   *
   * Shared schedules come from enrollment_schedules.
   *
   * We group them by participant so the printed record can show:
   *
   * Dasom
   * Mon 6:00 PM · Tue 11:30 AM · ...
   *
   * Bin
   * Mon 10:30 PM · Wed 10:30 PM · ...
   *
   * For an individual enrollment, we continue using the enrollment's
   * legacy schedule fields as a fallback.
   */

  const sortedParticipantSchedules =
    [...(participantSchedules ?? [])].sort(
      (a, b) => {
        if (
          a.student_id !==
          b.student_id
        ) {
          return a.student_name.localeCompare(
            b.student_name
          );
        }

        if (
          a.day_of_week !==
          b.day_of_week
        ) {
          return (
            a.day_of_week -
            b.day_of_week
          );
        }

        return a.schedule_time.localeCompare(
          b.schedule_time
        );
      }
    );

  const participantScheduleGroups =
    Array.from(
      sortedParticipantSchedules.reduce(
        (
          groups,
          schedule
        ) => {
          const existing =
            groups.get(
              schedule.student_id
            ) ?? {
              student_id:
                schedule.student_id,
              student_name:
                schedule.student_name,
              schedules: [],
            };

          existing.schedules.push(
            schedule
          );

          groups.set(
            schedule.student_id,
            existing
          );

          return groups;
        },
        new Map<
          string,
          {
            student_id: string;
            student_name: string;
            schedules: ParticipantSchedule[];
          }
        >()
      ).values()
    );

  const hasParticipantSchedules =
    participantScheduleGroups.length >
    0;

  /*
   * ------------------------------------------------------------------------
   * LESSONS PER WEEK
   * ------------------------------------------------------------------------
   *
   * For shared enrollments, the legacy enrollment.lessons_per_week field
   * may only represent one participant's schedule.
   *
   * Therefore:
   *
   *   Dasom = 5 schedules/week
   *   Bin   = 3 schedules/week
   *   -------------------------
   *   Total = 8 scheduled classes/week
   *
   * This is a schedule frequency, NOT the size of the shared lesson pool.
   *
   * For individual enrollments, continue using the enrollment-level
   * lessons_per_week value.
   */

  const sharedLessonsPerWeek =
    isSharedEnrollment &&
    participantSchedules &&
    participantSchedules.length > 0
      ? participantSchedules.length
      : null;

  const displayedLessonsPerWeek =
    isSharedEnrollment
      ? sharedLessonsPerWeek ??
        enrollment.lessons_per_week
      : enrollment.lessons_per_week;

  /*
   * ------------------------------------------------------------------------
   * ATTENDANCE COUNTS
   * ------------------------------------------------------------------------
   *
   * All counts are based on the COMPLETE lesson track.
   *
   * This is especially important for shared enrollments because the
   * lesson pool belongs to the enrollment, not to each individual.
   */

  const completedLessons = lessons.filter(
    (lesson) =>
      lesson.attendance_status ===
        "completed" &&
      lesson.consumes_lesson
  ).length;

  const noShowLessons = lessons.filter(
    (lesson) =>
      lesson.attendance_status ===
      "no_show"
  ).length;

  const lateCancellationLessons =
    lessons.filter(
      (lesson) =>
        lesson.attendance_status ===
        "late_cancellation"
    ).length;

  /*
   * Every lesson with consumes_lesson = true deducts exactly one
   * lesson from the enrollment's lesson pool.
   */
  const consumedLessons = lessons.filter(
    (lesson) =>
      lesson.consumes_lesson === true
  ).length;

  const remainingLessons = Math.max(
    enrollment.number_of_lessons -
      consumedLessons,
    0
  );

  /*
   * ------------------------------------------------------------------------
   * PARTICIPANT COLUMN
   * ------------------------------------------------------------------------
   *
   * For shared enrollments, ALWAYS show "Consumed By".
   */

  const showParticipantColumn =
    isSharedEnrollment;

  return (
    <div
      id="printable-attendance"
      className="
        hidden
        print:block
        min-h-screen
        bg-white
        px-10
        py-8
        text-[#292929]
      "
    >
      {/* ------------------------------------------------------------------ */}
      {/* HEADER                                                             */}
      {/* ------------------------------------------------------------------ */}

      <header className="border-b border-[#DCD8D2] pb-5">
        <div>
          {/* BRAND */}
          <p
            className="
              font-sans
              text-[9px]
              font-medium
              uppercase
              tracking-[0.18em]
              text-[#6F8F72]
            "
          >
            Hamkke │ 함께
          </p>

          {/* TAGLINE */}
          <p className="mt-1 font-serif text-[9px] italic text-[#777771]">
            From Small Talk to Big Ideas
          </p>

          {/* DOCUMENT TITLE */}
          <h1 className="mt-4 font-serif text-[28px] font-normal leading-tight">
            Attendance Record
          </h1>

          {/* STUDENT / PARTICIPANTS */}
          {isSharedEnrollment ? (
            <div className="mt-2">
              <p className="font-sans text-[8px] font-medium uppercase tracking-[0.12em] text-[#6F8F72]">
                Participants
              </p>

              {displayedParticipantNames.length >
              0 ? (
                <div className="mt-1 space-y-0.5">
                  {displayedParticipantNames.map(
                    (name) => (
                      <p
                        key={name}
                        className="font-serif text-[15px] leading-5"
                      >
                        {name}
                      </p>
                    )
                  )}
                </div>
              ) : (
                <p className="mt-1 font-serif text-[15px]">
                  Participant names not recorded
                </p>
              )}

              <p
                className="
                  mt-2
                  font-sans
                  text-[8px]
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-[#777771]
                "
              >
                Shared Enrollment · Shared Lesson Pool
              </p>
            </div>
          ) : (
            <p className="mt-1 font-serif text-[17px]">
              {studentName}
            </p>
          )}
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* ENROLLMENT DETAILS                                                 */}
      {/* ------------------------------------------------------------------ */}

      <section className="mt-5">
        <div className="grid grid-cols-3 gap-x-8 gap-y-4">
          <PrintDetail
            label="Package"
            value={enrollment.package_name}
          />

          <PrintDetail
            label="Status"
            value={capitalize(
              enrollment.status
            )}
          />

          <PrintDetail
            label="Start Date"
            value={formatDate(
              enrollment.start_date
            )}
          />

          <PrintDetail
            label="Lesson Duration"
            value={
              enrollment.lesson_duration
                ? `${enrollment.lesson_duration} minutes`
                : "Not set"
            }
          />

          <PrintDetail
            label="Lessons Per Week"
            value={
              displayedLessonsPerWeek
                ? `${displayedLessonsPerWeek}`
                : "Not set"
            }
          />

          {/* -------------------------------------------------------------- */}
          {/* SCHEDULE                                                        */}
          {/* -------------------------------------------------------------- */}

          <div>
            <p
              className="
                font-sans
                text-[8px]
                font-medium
                uppercase
                tracking-[0.12em]
                text-[#6F8F72]
              "
            >
              Schedule
            </p>

            {isSharedEnrollment ? (
              hasParticipantSchedules ? (
                <div className="mt-1 space-y-1.5">
                  {participantScheduleGroups.map(
                    (group) => (
                      <div
                        key={
                          group.student_id
                        }
                      >
                        <p className="font-serif text-[11px] font-medium leading-4">
                          {group.student_name}
                        </p>

                        <p className="font-sans text-[9px] leading-4 text-[#55544F]">
                          {group.schedules
                            .map(
                              (
                                schedule
                              ) =>
                                `${formatDayOfWeek(
                                  schedule.day_of_week
                                )} ${formatTime(
                                  schedule.schedule_time
                                )}`
                            )
                            .join(
                              " · "
                            )}
                        </p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="mt-0.5 font-serif text-[12px] leading-4">
                  Not set
                </p>
              )
            ) : (
              <p className="mt-0.5 font-serif text-[12px] leading-4">
                {formatSchedule(
                  enrollment.schedule_days,
                  enrollment.schedule_time
                )}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* SUMMARY                                                            */}
      {/* ------------------------------------------------------------------ */}

      <section className="mt-6 border-y border-[#DCD8D2] py-4">
        <div className="grid grid-cols-5 gap-5">
          <PrintStat
            label="Total"
            value={
              enrollment.number_of_lessons
            }
          />

          <PrintStat
            label="Completed"
            value={completedLessons}
          />

          <PrintStat
            label="No-show"
            value={noShowLessons}
          />

          <PrintStat
            label="Late cancellation"
            value={
              lateCancellationLessons
            }
          />

          <PrintStat
            label="Remaining"
            value={remainingLessons}
          />
        </div>

        {isSharedEnrollment && (
          <p className="mt-3 font-sans text-[8px] leading-4 text-[#777771]">
            The total, consumed, and remaining
            counts apply to the shared enrollment
            as a whole, not separately to each
            participant.
          </p>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* LESSON ATTENDANCE                                                  */}
      {/* ------------------------------------------------------------------ */}

      <section className="mt-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-sans text-[8px] font-medium uppercase tracking-[0.15em] text-[#6F8F72]">
              Lesson History
            </p>

            <h2 className="mt-1 font-serif text-[20px] font-normal">
              Lesson Attendance
            </h2>
          </div>

          <p className="font-sans text-[9px] text-[#777771]">
            {lessons.length} lesson
            {lessons.length !== 1
              ? "s"
              : ""}
          </p>
        </div>

        <table className="mt-3 w-full border-collapse">
          <thead>
            <tr className="border-b border-[#292929]">
              {/* LESSON NUMBER */}
              <th className="w-[6%] py-2 text-left font-sans text-[8px] font-medium uppercase tracking-[0.1em]">
                #
              </th>

              {/* DATE */}
              <th
                className={`${
                  showParticipantColumn
                    ? "w-[18%]"
                    : "w-[20%]"
                } py-2 text-left font-sans text-[8px] font-medium uppercase tracking-[0.1em]`}
              >
                Date
              </th>

              {/* PARTICIPANT */}
              {showParticipantColumn && (
                <th className="w-[20%] py-2 text-left font-sans text-[8px] font-medium uppercase tracking-[0.1em]">
                  Consumed By
                </th>
              )}

              {/* DURATION */}
              <th className="w-[11%] py-2 text-left font-sans text-[8px] font-medium uppercase tracking-[0.1em]">
                Duration
              </th>

              {/* STATUS */}
              <th
                className={`${
                  showParticipantColumn
                    ? "w-[19%]"
                    : "w-[25%]"
                } py-2 text-left font-sans text-[8px] font-medium uppercase tracking-[0.1em]`}
              >
                Status
              </th>

              {/* RESOLUTION */}
              <th
                className={`${
                  showParticipantColumn
                    ? "w-[16%]"
                    : "w-[20%]"
                } py-2 text-left font-sans text-[8px] font-medium uppercase tracking-[0.1em]`}
              >
                Resolution
              </th>

              {/* USED */}
              <th className="w-[10%] py-2 text-right font-sans text-[8px] font-medium uppercase tracking-[0.1em]">
                Used
              </th>
            </tr>
          </thead>

          <tbody>
            {lessons.map((lesson) => {
              const participantName =
                getParticipantName(
                  lesson.student_id,
                  cleanParticipantNameById
                );

              return (
                <tr
                  key={lesson.id}
                  className="border-b border-[#E5E1DB]"
                >
                  {/* LESSON NUMBER */}
                  <td className="py-[7px] font-serif text-[12px]">
                    {lesson.lesson_number}
                  </td>

                  {/* DATE */}
                  <td className="py-[7px] font-sans text-[9px]">
                    {formatDate(
                      lesson.lesson_date
                    )}

                    {lesson.original_lesson_date &&
                      lesson.original_lesson_date !==
                        lesson.lesson_date && (
                        <span className="block text-[7px] text-[#777771]">
                          Originally{" "}
                          {formatDate(
                            lesson.original_lesson_date
                          )}
                        </span>
                      )}
                  </td>

                  {/* CONSUMED BY */}
                  {showParticipantColumn && (
                    <td className="py-[7px] font-sans text-[9px] font-medium">
                      {lesson.consumes_lesson ? (
                        <span>
                          {participantName}
                        </span>
                      ) : (
                        <span className="font-normal text-[#777771]">
                          Not consumed
                        </span>
                      )}
                    </td>
                  )}

                  {/* DURATION */}
                  <td className="py-[7px] font-sans text-[9px]">
                    {lesson.duration ??
                      "—"}{" "}
                    min
                  </td>

                  {/* STATUS */}
                  <td className="py-[7px] font-sans text-[9px]">
                    {formatStatus(
                      lesson.attendance_status
                    )}
                  </td>

                  {/* RESOLUTION */}
                  <td className="py-[7px] font-sans text-[9px]">
                    {lesson.resolution
                      ? formatResolution(
                          lesson.resolution
                        )
                      : "—"}
                  </td>

                  {/* CONSUMED */}
                  <td className="py-[7px] text-right font-sans text-[9px]">
                    {lesson.consumes_lesson
                      ? "Yes"
                      : "No"}
                  </td>
                </tr>
              );
            })}

            {lessons.length === 0 && (
              <tr>
                <td
                  colSpan={
                    showParticipantColumn
                      ? 7
                      : 6
                  }
                  className="py-6 text-center font-sans text-[9px] text-[#777771]"
                >
                  No lessons recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* SHARED RECORD EXPLANATION */}
        {isSharedEnrollment && (
          <div className="mt-3 border-l-2 border-[#DCD8D2] pl-3">
            <p className="font-sans text-[8px] leading-4 text-[#777771]">
              For this shared enrollment,
              “Consumed By” identifies the
              participant whose lesson consumed
              one lesson from the shared lesson
              pool.
            </p>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* NOTES                                                              */}
      {/* ------------------------------------------------------------------ */}

      {lessons.some(
        (lesson) =>
          lesson.notes &&
          lesson.notes.trim().length > 0
      ) && (
        <section className="mt-6">
          <div className="border-t border-[#DCD8D2] pt-4">
            <p className="font-sans text-[8px] font-medium uppercase tracking-[0.15em] text-[#6F8F72]">
              Teacher Notes
            </p>

            <h2 className="mt-1 font-serif text-[18px] font-normal">
              Notes
            </h2>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-3">
            {lessons
              .filter(
                (lesson) =>
                  lesson.notes &&
                  lesson.notes.trim()
                    .length > 0
              )
              .map((lesson) => {
                const participantName =
                  getParticipantName(
                    lesson.student_id,
                    cleanParticipantNameById
                  );

                return (
                  <div
                    key={lesson.id}
                    className="border-l-2 border-[#DCD8D2] pl-3"
                  >
                    <p className="font-sans text-[7px] uppercase tracking-[0.08em] text-[#777771]">
                      Lesson{" "}
                      {
                        lesson.lesson_number
                      }

                      {isSharedEnrollment &&
                      lesson.student_id
                        ? ` · ${participantName}`
                        : ""}
                    </p>

                    <p className="mt-1 font-sans text-[9px] leading-4">
                      {lesson.notes}
                    </p>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* FOOTER                                                             */}
      {/* ------------------------------------------------------------------ */}

      <footer className="mt-6 border-t border-[#DCD8D2] pt-3">
        <div className="flex items-end justify-between">
          <p className="font-sans text-[7px] text-[#777771]">
            Printed from Hamkke student
            records.
          </p>

          <p className="font-sans text-[7px] text-[#777771]">
            Printed on{" "}
            {new Intl.DateTimeFormat(
              "en-US",
              {
                month: "long",
                day: "numeric",
                year: "numeric",
              }
            ).format(new Date())}
          </p>
        </div>
      </footer>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PRINT DETAIL                                                               */
/* -------------------------------------------------------------------------- */

function PrintDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p
        className="
          font-sans
          text-[8px]
          font-medium
          uppercase
          tracking-[0.12em]
          text-[#6F8F72]
        "
      >
        {label}
      </p>

      <p className="mt-0.5 font-serif text-[12px] leading-4">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PRINT STAT                                                                 */
/* -------------------------------------------------------------------------- */

function PrintStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <p
        className="
          font-sans
          text-[8px]
          font-medium
          uppercase
          tracking-[0.12em]
          text-[#6F8F72]
        "
      >
        {label}
      </p>

      <p className="mt-0.5 font-serif text-[21px] leading-6">
        {value}
      </p>

      <p className="font-sans text-[8px] text-[#777771]">
        lessons
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PARTICIPANT FORMATTER                                                      */
/* -------------------------------------------------------------------------- */

function getParticipantName(
  studentId: string | null | undefined,
  participantNameById:
    | Record<string, string>
    | undefined
) {
  if (!studentId) {
    return "Participant not recorded";
  }

  if (!participantNameById) {
    return "Participant not recorded";
  }

  const name =
    participantNameById[studentId];

  if (!name || !name.trim()) {
    return "Participant not recorded";
  }

  return name;
}

/* -------------------------------------------------------------------------- */
/* DATE FORMATTER                                                             */
/* -------------------------------------------------------------------------- */

function formatDate(date: string | null) {
  if (!date) return "Not set";

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(
    new Date(`${date}T00:00:00`)
  );
}

/* -------------------------------------------------------------------------- */
/* SCHEDULE FORMATTERS                                                        */
/* -------------------------------------------------------------------------- */

function formatSchedule(
  days: string[] | null,
  time: string | null
) {
  const formattedDays =
    formatScheduleDays(days);

  if (!time) {
    return formattedDays;
  }

  return `${formattedDays} · ${formatTime(
    time
  )}`;
}

function formatScheduleDays(
  days: string[] | null
) {
  if (!days || days.length === 0) {
    return "Not set";
  }

  const labels: Record<
    string,
    string
  > = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  return days
    .map(
      (day) =>
        labels[day.toLowerCase()] ??
        day
    )
    .join(", ");
}

/* -------------------------------------------------------------------------- */
/* DAY OF WEEK FORMATTER                                                      */
/* -------------------------------------------------------------------------- */

/**
 * enrollment_schedules.day_of_week:
 *
 * 0 = Sunday
 * 1 = Monday
 * 2 = Tuesday
 * 3 = Wednesday
 * 4 = Thursday
 * 5 = Friday
 * 6 = Saturday
 */
function formatDayOfWeek(
  dayOfWeek: number
) {
  const labels: Record<
    number,
    string
  > = {
    0: "Sun",
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
  };

  return (
    labels[dayOfWeek] ??
    `Day ${dayOfWeek}`
  );
}

/* -------------------------------------------------------------------------- */
/* TIME FORMATTER                                                             */
/* -------------------------------------------------------------------------- */

function formatTime(time: string) {
  const [hours, minutes] =
    time.split(":");

  const date = new Date();

  date.setHours(
    Number(hours),
    Number(minutes),
    0,
    0
  );

  return new Intl.DateTimeFormat(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date);
}

/* -------------------------------------------------------------------------- */
/* STATUS FORMATTER                                                           */
/* -------------------------------------------------------------------------- */

function formatStatus(status: string) {
  const labels: Record<
    string,
    string
  > = {
    scheduled: "Scheduled",
    completed: "Completed",
    no_show: "No-show",
    late_cancellation:
      "Late cancellation",
    student_cancelled_rescheduled:
      "Student cancelled · Rescheduled",
    student_cancelled_credit:
      "Student cancelled · Credit",
    unexpected_circumstance:
      "Unexpected circumstance",
    teacher_cancelled:
      "Teacher cancelled",
  };

  return labels[status] ?? status;
}

/* -------------------------------------------------------------------------- */
/* RESOLUTION FORMATTER                                                       */
/* -------------------------------------------------------------------------- */

function formatResolution(
  resolution: string
) {
  const labels: Record<
    string,
    string
  > = {
    rescheduled: "Rescheduled",
    lesson_credit: "Lesson credit",
    counted_as_completed:
      "Counted as completed",
  };

  return (
    labels[resolution] ??
    resolution
  );
}

/* -------------------------------------------------------------------------- */
/* CAPITALIZE                                                                 */
/* -------------------------------------------------------------------------- */

function capitalize(value: string) {
  if (!value) return value;

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}