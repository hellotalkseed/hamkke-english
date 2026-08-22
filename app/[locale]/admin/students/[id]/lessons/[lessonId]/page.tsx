import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import {
  isValidLocale,
  type Locale,
} from "@/lib/i18n";

interface LessonPageProps {
  params: Promise<{
    locale: string;
    id: string;
    lessonId: string;
  }>;
}

type LessonStatus =
  | "scheduled"
  | "completed"
  | "rescheduled"
  | "unexpected"
  | "teacher_cancelled";

const STATUS_OPTIONS: {
  value: LessonStatus;
  label: string;
}[] = [
  {
    value: "scheduled",
    label: "Scheduled",
  },
  {
    value: "completed",
    label: "Completed",
  },
  {
    value: "rescheduled",
    label: "Rescheduled / Credit",
  },
  {
    value: "unexpected",
    label: "Unexpected Circumstance",
  },
  {
    value: "teacher_cancelled",
    label: "Teacher Cancellation",
  },
];

function formatDate(date: string | null) {
  if (!date) return "Not recorded";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function LessonPage({
  params,
}: LessonPageProps) {
  const {
    locale,
    id,
    lessonId,
  } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const currentLocale = locale as Locale;

  const supabase = await createClient();

  /*
   * GET STUDENT
   */

  const {
    data: student,
    error: studentError,
  } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .single();

  if (studentError || !student) {
    console.error(
      "FAILED AT STUDENT LOOKUP:",
      {
        id,
        studentError,
      }
    );

    notFound();
  }

  /*
   * GET LESSON
   *
   * lessonId is the actual UUID from the
   * lessons table.
   */

  const {
    data: lesson,
    error: lessonError,
  } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();

  if (lessonError || !lesson) {
    console.error(
      "FAILED AT LESSON LOOKUP:",
      {
        lessonId,
        lessonError,
      }
    );

    notFound();
  }

  /*
   * SECURITY CHECK
   *
   * Make sure this lesson belongs to the
   * student we're viewing.
   */

  const {
    data: enrollment,
    error: enrollmentError,
  } = await supabase
    .from("enrollments")
    .select("*")
    .eq("id", lesson.enrollment_id)
    .eq("student_id", id)
    .single();

  if (enrollmentError || !enrollment) {
    console.error(
      "FAILED AT ENROLLMENT SECURITY CHECK:",
      {
        lessonId,
        studentId: id,
        enrollmentError,
      }
    );

    notFound();
  }

  /*
   * UPDATE LESSON
   */

  async function updateLesson(
    formData: FormData
  ) {
    "use server";

    const updateClient = await createClient();

    const lessonDate =
      String(
        formData.get("lesson_date") ?? ""
      ).trim();

    const durationValue =
      String(
        formData.get("duration") ?? ""
      ).trim();

    const attendanceStatus =
      String(
        formData.get(
          "attendance_status"
        ) ?? "scheduled"
      ) as LessonStatus;

    const notesValue =
      String(
        formData.get("notes") ?? ""
      ).trim();

    const allowedStatuses: LessonStatus[] = [
      "scheduled",
      "completed",
      "rescheduled",
      "unexpected",
      "teacher_cancelled",
    ];

    if (
      !allowedStatuses.includes(
        attendanceStatus
      )
    ) {
      throw new Error(
        "Invalid lesson status."
      );
    }

    const duration =
      durationValue === ""
        ? null
        : Number(durationValue);

    if (
      duration !== null &&
      (!Number.isFinite(duration) ||
        duration <= 0)
    ) {
      throw new Error(
        "Invalid lesson duration."
      );
    }

    /*
     * Re-check that the lesson still belongs
     * to this student's enrollment.
     */

    const {
      data: verifiedLesson,
      error: verifiedLessonError,
    } = await updateClient
      .from("lessons")
      .select(`
        id,
        enrollment_id,
        lesson_date,
        original_lesson_date,
        attendance_status
      `)
      .eq("id", lessonId)
      .eq(
        "enrollment_id",
        enrollment.id
      )
      .single();

    if (
      verifiedLessonError ||
      !verifiedLesson
    ) {
      throw new Error(
        "Lesson verification failed."
      );
    }

    /*
     * RESCHEDULING LOGIC
     *
     * The first date is preserved as the
     * original scheduled date.
     */

    let originalLessonDate =
      verifiedLesson.original_lesson_date ??
      null;

    let rescheduledAt =
      null as string | null;

    /*
     * If this lesson is being marked as
     * rescheduled for the first time, preserve
     * the current lesson date.
     */

    if (
      attendanceStatus === "rescheduled" &&
      !originalLessonDate
    ) {
      originalLessonDate =
        verifiedLesson.lesson_date ??
        null;

      rescheduledAt =
        new Date().toISOString();
    }

    /*
     * If it was already rescheduled and is
     * being rescheduled again, keep the
     * original date and update the timestamp.
     */

    if (
      attendanceStatus === "rescheduled" &&
      originalLessonDate
    ) {
      rescheduledAt =
        new Date().toISOString();
    }

    /*
     * If a rescheduled lesson is now completed,
     * keep the original date and treat the new
     * lesson_date as the actual class date.
     */

    if (
      attendanceStatus === "completed" &&
      verifiedLesson.original_lesson_date
    ) {
      originalLessonDate =
        verifiedLesson.original_lesson_date;
    }

    /*
     * If the lesson is simply scheduled and
     * there is no previous rescheduling history,
     * there is no need for an original date.
     */

    if (
      attendanceStatus === "scheduled" &&
      !verifiedLesson.original_lesson_date
    ) {
      originalLessonDate = null;
      rescheduledAt = null;
    }

    /*
     * Update by the actual lesson UUID.
     */

    const {
      error: updateError,
    } = await updateClient
      .from("lessons")
      .update({
        lesson_date:
          lessonDate || null,

        duration,

        attendance_status:
          attendanceStatus,

        notes:
          notesValue || null,

        original_lesson_date:
          originalLessonDate,

        rescheduled_at:
          rescheduledAt ??
          lesson.rescheduled_at ??
          null,
      })
      .eq("id", lessonId)
      .eq(
        "enrollment_id",
        enrollment.id
      );

    if (updateError) {
      console.error(
        "LESSON UPDATE ERROR:",
        updateError
      );

      throw new Error(
        updateError.message
      );
    }

    redirect(
      `/${currentLocale}/admin/students/${id}/lessons`
    );
  }

  const originalLessonDate =
    lesson.original_lesson_date ?? null;

  const isRescheduled =
    lesson.attendance_status ===
    "rescheduled";

  const wasRescheduled =
    Boolean(originalLessonDate);

  return (
    <main
      className="
        min-h-screen
        bg-[#FAF8F5]
        px-6
        py-12
        text-[#292929]

        sm:px-8
        sm:py-16

        lg:px-10
        lg:py-20
      "
    >
      <div className="mx-auto max-w-3xl">

        {/* BACK */}

        <Link
          href={`/${currentLocale}/admin/students/${id}/lessons`}
          className="
            font-sans
            text-[13px]
            font-medium
            text-[#6F8F72]
            transition
            hover:opacity-70
          "
        >
          ← Back to Lessons
        </Link>

        {/* HEADER */}

        <div className="mt-10">

          <p
            className="
              font-sans
              text-[11px]
              font-medium
              uppercase
              tracking-[0.14em]
              text-[#6F8F72]
            "
          >
            Update Lesson
          </p>

          <h1
            className="
              mt-3
              font-serif
              text-[42px]
              font-normal
              tracking-[-0.03em]
              text-[#292929]
            "
          >
            Lesson #{lesson.lesson_number}
          </h1>

          <p
            className="
              mt-2
              font-sans
              text-[14px]
              text-[#777]
            "
          >
            {student.full_name}
          </p>

        </div>

        {/* RESCHEDULE INFORMATION */}

        {wasRescheduled && (
          <div
            className="
              mt-7
              rounded-2xl
              border
              border-[#D8CCBE]
              bg-[#F4F7F2]
              px-5
              py-4
            "
          >
            <p
              className="
                font-sans
                text-[10px]
                font-medium
                uppercase
                tracking-[0.12em]
                text-[#6F8F72]
              "
            >
              Rescheduling History
            </p>

            <p
              className="
                mt-2
                font-sans
                text-[13px]
                leading-6
                text-[#555]
              "
            >
              Originally scheduled for{" "}
              <span className="font-medium">
                {formatDate(
                  originalLessonDate
                )}
              </span>
              .
            </p>

            {isRescheduled && (
              <p
                className="
                  mt-1
                  font-sans
                  text-[12px]
                  text-[#777]
                "
              >
                This lesson remains a credit and
                has not been counted as completed.
              </p>
            )}

            {!isRescheduled &&
              lesson.attendance_status ===
                "completed" && (
                <p
                  className="
                    mt-1
                    font-sans
                    text-[12px]
                    text-[#777]
                  "
                >
                  This lesson was completed on the
                  rescheduled date shown below.
                </p>
              )}
          </div>
        )}

        {/* FORM */}

        <form
          action={updateLesson}
          className="
            mt-8
            rounded-3xl
            border
            border-[#E7DDD1]
            bg-white
            p-7

            sm:p-9
          "
        >

          {/* DATE */}

          <div>

            <label
              htmlFor="lesson_date"
              className="
                font-sans
                text-[11px]
                font-medium
                uppercase
                tracking-[0.12em]
                text-[#999]
              "
            >
              Lesson Date
            </label>

            <input
              id="lesson_date"
              name="lesson_date"
              type="date"
              defaultValue={
                lesson.lesson_date ?? ""
              }
              className="
                mt-3
                block
                w-full
                rounded-xl
                border
                border-[#D8CCBE]
                bg-[#FAF8F5]
                px-4
                py-3
                font-sans
                text-[14px]
                text-[#444]
                outline-none
                transition
                focus:border-[#6F8F72]
              "
            />

            {wasRescheduled && (
              <p
                className="
                  mt-2
                  font-sans
                  text-[11px]
                  leading-5
                  text-[#888]
                "
              >
                This is the current lesson date.
                The original scheduled date is
                preserved in the lesson history.
              </p>
            )}

          </div>

          {/* DURATION */}

          <div className="mt-7">

            <label
              htmlFor="duration"
              className="
                font-sans
                text-[11px]
                font-medium
                uppercase
                tracking-[0.12em]
                text-[#999]
              "
            >
              Duration
            </label>

            <div
              className="
                mt-3
                flex
                items-center
                gap-3
              "
            >

              <input
                id="duration"
                name="duration"
                type="number"
                min="1"
                defaultValue={
                  lesson.duration ??
                  enrollment.lesson_duration ??
                  ""
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-[#D8CCBE]
                  bg-[#FAF8F5]
                  px-4
                  py-3
                  font-sans
                  text-[14px]
                  text-[#444]
                  outline-none
                  transition
                  focus:border-[#6F8F72]
                "
              />

              <span
                className="
                  shrink-0
                  font-sans
                  text-[13px]
                  text-[#888]
                "
              >
                minutes
              </span>

            </div>
          </div>

          {/* STATUS */}

          <div className="mt-7">

            <label
              htmlFor="attendance_status"
              className="
                font-sans
                text-[11px]
                font-medium
                uppercase
                tracking-[0.12em]
                text-[#999]
              "
            >
              Attendance Status
            </label>

            <select
              id="attendance_status"
              name="attendance_status"
              defaultValue={
                lesson.attendance_status ??
                "scheduled"
              }
              className="
                mt-3
                block
                w-full
                rounded-xl
                border
                border-[#D8CCBE]
                bg-[#FAF8F5]
                px-4
                py-3
                font-sans
                text-[14px]
                text-[#444]
                outline-none
                transition
                focus:border-[#6F8F72]
              "
            >
              {STATUS_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>

            <p
              className="
                mt-2
                font-sans
                text-[11px]
                leading-5
                text-[#888]
              "
            >
              Choosing “Rescheduled / Credit”
              keeps this lesson available without
              reducing the student's remaining
              lesson credit.
            </p>

          </div>

          {/* NOTES */}

          <div className="mt-7">

            <label
              htmlFor="notes"
              className="
                font-sans
                text-[11px]
                font-medium
                uppercase
                tracking-[0.12em]
                text-[#999]
              "
            >
              Notes
            </label>

            <textarea
              id="notes"
              name="notes"
              rows={6}
              defaultValue={
                lesson.notes ?? ""
              }
              placeholder="Add notes about this lesson..."
              className="
                mt-3
                block
                w-full
                resize-y
                rounded-xl
                border
                border-[#D8CCBE]
                bg-[#FAF8F5]
                px-4
                py-3
                font-sans
                text-[14px]
                leading-6
                text-[#444]
                outline-none
                transition
                placeholder:text-[#AAA]
                focus:border-[#6F8F72]
              "
            />

          </div>

          {/* ACTIONS */}

          <div
            className="
              mt-9
              flex
              flex-col
              gap-3

              sm:flex-row
              sm:justify-end
            "
          >

            <Link
              href={`/${currentLocale}/admin/students/${id}/lessons`}
              className="
                inline-flex
                items-center
                justify-center
                rounded-full
                border
                border-[#D8CCBE]
                px-6
                py-3
                font-sans
                text-[13px]
                font-medium
                text-[#666]
                transition
                hover:bg-[#FAF8F5]
              "
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="
                inline-flex
                items-center
                justify-center
                rounded-full
                bg-[#6F8F72]
                px-7
                py-3
                font-sans
                text-[13px]
                font-medium
                text-white
                transition
                hover:bg-[#5F7F63]
              "
            >
              Save Lesson
            </button>

          </div>

        </form>

      </div>
    </main>
  );
}