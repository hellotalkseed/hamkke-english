import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import {
  isValidLocale,
  type Locale,
} from "@/lib/i18n";

interface LessonPageProps {
  params: Promise<{
    locale: string;
    lessonId: string;
  }>;
}

interface Student {
  id: string;
  full_name: string;
  preferred_name: string | null;
}

interface Enrollment {
  id: string;
  package_name: string;
  number_of_lessons: number;
  lesson_duration: number;
  students: Student | Student[] | null;
}

interface Lesson {
  id: string;
  enrollment_id: string;
  lesson_number: number;
  lesson_date: string;
  duration: number;
  attendance_status: string;
  notes: string | null;
  created_at: string;
  enrollment: Enrollment | Enrollment[] | null;
}

export default async function LessonPage({
  params,
}: LessonPageProps) {
  const { locale, lessonId } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const currentLocale = locale as Locale;

  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("lessons")
    .select(`
      id,
      enrollment_id,
      lesson_number,
      lesson_date,
      duration,
      attendance_status,
      notes,
      created_at,
      enrollments (
        id,
        package_name,
        number_of_lessons,
        lesson_duration,
        students (
          id,
          full_name,
          preferred_name
        )
      )
    `)
    .eq("id", lessonId)
    .single();

  if (error || !data) {
    notFound();
  }

  const enrollmentData = Array.isArray(
    data.enrollments
  )
    ? data.enrollments[0] ?? null
    : data.enrollments ?? null;

  const studentData = enrollmentData
    ? Array.isArray(enrollmentData.students)
      ? enrollmentData.students[0] ?? null
      : enrollmentData.students ?? null
    : null;

  const lesson: Lesson = {
    id: data.id,
    enrollment_id: data.enrollment_id,
    lesson_number: Number(data.lesson_number),
    lesson_date: data.lesson_date,
    duration: Number(data.duration),
    attendance_status: data.attendance_status,
    notes: data.notes,
    created_at: data.created_at,

    enrollment: enrollmentData
      ? {
          id: enrollmentData.id,
          package_name:
            enrollmentData.package_name,
          number_of_lessons: Number(
            enrollmentData.number_of_lessons
          ),
          lesson_duration: Number(
            enrollmentData.lesson_duration
          ),
          students: studentData,
        }
      : null,
  };

  const enrollment = lesson.enrollment;

  const student =
    enrollment && !Array.isArray(enrollment)
      ? enrollment.students &&
        !Array.isArray(enrollment.students)
        ? enrollment.students
        : null
      : null;

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
      <div className="mx-auto max-w-4xl">

        {/* BACK */}

        <Link
          href={`/${currentLocale}/admin/lessons`}
          className="
            font-sans
            text-[13px]
            font-medium
            text-[#6F8F72]
            transition
            hover:opacity-70
          "
        >
          ← Lessons
        </Link>

        {/* HEADER */}

        <div className="mt-10">
          <p
            className="
              font-sans
              text-[12px]
              font-medium
              uppercase
              tracking-[0.16em]
              text-[#6F8F72]
            "
          >
            Lesson Management
          </p>

          <h1
            className="
              mt-4
              font-serif
              text-[48px]
              font-normal
              leading-tight
              tracking-[-0.03em]

              sm:text-[56px]
            "
          >
            Lesson #{lesson.lesson_number}
          </h1>

          <p
            className="
              mt-4
              max-w-2xl
              font-serif
              text-[20px]
              leading-8
              text-[#666]

              sm:text-[22px]
            "
          >
            Record what happened during this lesson.
          </p>
        </div>

        {/* LESSON INFORMATION */}

        <section
          className="
            mt-12
            rounded-3xl
            border
            border-[#E7DDD1]
            bg-white
            p-7

            sm:p-9
          "
        >
          <div
            className="
              grid
              gap-7

              sm:grid-cols-2
            "
          >
            <Info
              label="Student"
              value={
                student?.full_name ??
                "Unknown Student"
              }
            />

            {student?.preferred_name && (
              <Info
                label="Preferred name"
                value={`“${student.preferred_name}”`}
              />
            )}

            <Info
              label="Date"
              value={formatDate(
                lesson.lesson_date
              )}
            />

            <Info
              label="Duration"
              value={`${lesson.duration} minutes`}
            />

            <Info
              label="Package"
              value={
                enrollment &&
                !Array.isArray(enrollment)
                  ? enrollment.package_name
                  : "—"
              }
            />

            <Info
              label="Package progress"
              value={
                enrollment &&
                !Array.isArray(enrollment)
                  ? `${lesson.lesson_number} / ${enrollment.number_of_lessons}`
                  : "—"
              }
            />
          </div>
        </section>

        {/* UPDATE FORM */}

        <form
          action={`/api/admin/lessons/${lesson.id}`}
          method="POST"
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
          <div>
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
              Lesson Outcome
            </p>

            <h2
              className="
                mt-3
                font-serif
                text-[32px]
                font-normal
              "
            >
              What happened?
            </h2>
          </div>

          {/* STATUS */}

          <div className="mt-8">
            <label
              htmlFor="attendance_status"
              className="
                font-sans
                text-[12px]
                font-medium
                uppercase
                tracking-[0.12em]
                text-[#6F8F72]
              "
            >
              Status
            </label>

            <select
              id="attendance_status"
              name="attendance_status"
              defaultValue={
                lesson.attendance_status
              }
              className={inputClass}
            >
              <option value="scheduled">
                Scheduled
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="rescheduled">
                Rescheduled
              </option>

              <option value="teacher_cancelled">
                Teacher Cancelled
              </option>

              <option value="unexpected_circumstance">
                Unexpected Circumstance
              </option>
            </select>
          </div>

          {/* NOTES */}

          <div className="mt-7">
            <label
              htmlFor="notes"
              className="
                font-sans
                text-[12px]
                font-medium
                uppercase
                tracking-[0.12em]
                text-[#6F8F72]
              "
            >
              Notes
            </label>

            <textarea
              id="notes"
              name="notes"
              defaultValue={lesson.notes ?? ""}
              rows={7}
              placeholder="What did you cover? How did the student do? Anything to remember for the next lesson?"
              className="
                mt-2
                w-full
                resize-y
                rounded-xl
                border
                border-[#D8CCBE]
                bg-[#FAF8F5]
                px-4
                py-3
                font-sans
                text-[15px]
                leading-6
                text-[#292929]
                outline-none
                transition
                placeholder:text-[#999]
                focus:border-[#6F8F72]
                focus:ring-2
                focus:ring-[#E2EBDD]
              "
            />
          </div>

          {/* POLICY NOTE */}

          <div
            className="
              mt-7
              rounded-2xl
              border
              border-[#D8E2D4]
              bg-[#F4F7F2]
              px-5
              py-4
            "
          >
            <p
              className="
                font-sans
                text-[13px]
                font-medium
                text-[#5F7F63]
              "
            >
              Lesson recording
            </p>

            <p
              className="
                mt-1
                font-sans
                text-[12px]
                leading-5
                text-[#777]
              "
            >
              Record the actual outcome of the lesson.
              Notes are optional, but useful for
              remembering what to work on next time.
            </p>
          </div>

          {/* ACTIONS */}

          <div
            className="
              mt-8
              flex
              flex-col
              gap-3

              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <Link
              href={`/${currentLocale}/admin/lessons`}
              className="
                inline-flex
                justify-center
                rounded-full
                border
                border-[#D8CCBE]
                px-6
                py-3
                font-sans
                text-[13px]
                font-medium
                text-[#5F7F63]
                transition
                hover:border-[#6F8F72]
                hover:bg-[#F4F7F2]
              "
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="
                inline-flex
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

function Info({
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
          text-[10px]
          font-medium
          uppercase
          tracking-[0.12em]
          text-[#999]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1.5
          font-sans
          text-[14px]
          text-[#444]
        "
      >
        {value}
      </p>
    </div>
  );
}

function formatDate(
  value: string | null | undefined
) {
  if (!value) {
    return "—";
  }

  return new Date(
    `${value}T00:00:00`
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const inputClass = `
  mt-2
  w-full
  rounded-xl
  border
  border-[#D8CCBE]
  bg-[#FAF8F5]
  px-4
  py-3
  font-sans
  text-[15px]
  text-[#292929]
  outline-none
  transition
  focus:border-[#6F8F72]
  focus:ring-2
  focus:ring-[#E2EBDD]
`;