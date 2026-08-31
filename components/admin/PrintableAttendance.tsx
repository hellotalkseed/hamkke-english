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
}

interface PrintableAttendanceProps {
  studentName: string;
  enrollment: Enrollment;
  lessons: Lesson[];
}

export default function PrintableAttendance({
  studentName,
  enrollment,
  lessons,
}: PrintableAttendanceProps) {
  /*
   * ------------------------------------------------------------------------
   * ATTENDANCE COUNTS
   * ------------------------------------------------------------------------
   */

  const completedLessons = lessons.filter(
    (lesson) =>
      lesson.attendance_status === "completed" &&
      lesson.consumes_lesson
  ).length;

  const noShowLessons = lessons.filter(
    (lesson) => lesson.attendance_status === "no_show"
  ).length;

  const lateCancellationLessons = lessons.filter(
    (lesson) =>
      lesson.attendance_status === "late_cancellation"
  ).length;

  const consumedLessons = lessons.filter(
    (lesson) => lesson.consumes_lesson
  ).length;

  const remainingLessons = Math.max(
    enrollment.number_of_lessons - consumedLessons,
    0
  );

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

          {/* STUDENT */}
          <p className="mt-1 font-serif text-[17px]">
            {studentName}
          </p>
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
            value={capitalize(enrollment.status)}
          />

          <PrintDetail
            label="Start Date"
            value={formatDate(enrollment.start_date)}
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
              enrollment.lessons_per_week
                ? `${enrollment.lessons_per_week}`
                : "Not set"
            }
          />

          <PrintDetail
            label="Schedule"
            value={formatSchedule(
              enrollment.schedule_days,
              enrollment.schedule_time
            )}
          />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* SUMMARY                                                            */}
      {/* ------------------------------------------------------------------ */}

      <section className="mt-6 border-y border-[#DCD8D2] py-4">
        <div className="grid grid-cols-5 gap-5">
          <PrintStat
            label="Total"
            value={enrollment.number_of_lessons}
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
            value={lateCancellationLessons}
          />

          <PrintStat
            label="Remaining"
            value={remainingLessons}
          />
        </div>
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
            {lessons.length !== 1 ? "s" : ""}
          </p>
        </div>

        <table className="mt-3 w-full border-collapse">
          <thead>
            <tr className="border-b border-[#292929]">
              <th className="w-[7%] py-2 text-left font-sans text-[8px] font-medium uppercase tracking-[0.1em]">
                #
              </th>

              <th className="w-[22%] py-2 text-left font-sans text-[8px] font-medium uppercase tracking-[0.1em]">
                Date
              </th>

              <th className="w-[12%] py-2 text-left font-sans text-[8px] font-medium uppercase tracking-[0.1em]">
                Duration
              </th>

              <th className="w-[25%] py-2 text-left font-sans text-[8px] font-medium uppercase tracking-[0.1em]">
                Status
              </th>

              <th className="w-[23%] py-2 text-left font-sans text-[8px] font-medium uppercase tracking-[0.1em]">
                Resolution
              </th>

              <th className="w-[11%] py-2 text-right font-sans text-[8px] font-medium uppercase tracking-[0.1em]">
                Used
              </th>
            </tr>
          </thead>

          <tbody>
            {lessons.map((lesson) => (
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
                  {formatDate(lesson.lesson_date)}

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

                {/* DURATION */}
                <td className="py-[7px] font-sans text-[9px]">
                  {lesson.duration ?? "—"} min
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
            ))}
          </tbody>
        </table>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* NOTES                                                              */}
      {/* ------------------------------------------------------------------ */}

      {lessons.some((lesson) => lesson.notes) && (
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
              .filter((lesson) => lesson.notes)
              .map((lesson) => (
                <div
                  key={lesson.id}
                  className="border-l-2 border-[#DCD8D2] pl-3"
                >
                  <p className="font-sans text-[7px] uppercase tracking-[0.08em] text-[#777771]">
                    Lesson {lesson.lesson_number}
                  </p>

                  <p className="mt-1 font-sans text-[9px] leading-4">
                    {lesson.notes}
                  </p>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* FOOTER                                                             */}
      {/* ------------------------------------------------------------------ */}

      <footer className="mt-6 border-t border-[#DCD8D2] pt-3">
        <div className="flex items-end justify-between">
          <p className="font-sans text-[7px] text-[#777771]">
            Printed from Hamkke student records.
          </p>

          <p className="font-sans text-[7px] text-[#777771]">
            Printed on{" "}
            {new Intl.DateTimeFormat("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }).format(new Date())}
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
/* FORMATTERS                                                                 */
/* -------------------------------------------------------------------------- */

function formatDate(date: string | null) {
  if (!date) return "Not set";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatSchedule(
  days: string[] | null,
  time: string | null
) {
  const formattedDays = formatScheduleDays(days);

  if (!time) {
    return formattedDays;
  }

  return `${formattedDays} · ${formatTime(time)}`;
}

function formatScheduleDays(days: string[] | null) {
  if (!days || days.length === 0) {
    return "Not set";
  }

  const labels: Record<string, string> = {
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
        labels[day.toLowerCase()] ?? day
    )
    .join(", ");
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":");

  const date = new Date();

  date.setHours(
    Number(hours),
    Number(minutes),
    0,
    0
  );

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    scheduled: "Scheduled",
    completed: "Completed",
    no_show: "No-show",
    late_cancellation: "Late cancellation",
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

function formatResolution(resolution: string) {
  const labels: Record<string, string> = {
    rescheduled: "Rescheduled",
    lesson_credit: "Lesson credit",
    counted_as_completed:
      "Counted as completed",
  };

  return labels[resolution] ?? resolution;
}

function capitalize(value: string) {
  if (!value) return value;

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}