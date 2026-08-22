import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import {
  isValidLocale,
  type Locale,
} from "@/lib/i18n";

interface LessonsPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

type LessonStatus =
  | "scheduled"
  | "completed"
  | "rescheduled"
  | "unexpected"
  | "teacher_cancelled";

interface LessonRecord {
  id: string;
  lesson_number: number;
  lesson_date: string | null;
  duration: number | null;
  attendance_status: LessonStatus;
  notes: string | null;
}

export default async function LessonsPage({
  params,
}: LessonsPageProps) {
  const { locale, id } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const currentLocale = locale as Locale;

  const supabase = await createClient();

  const {
    data: student,
    error: studentError,
  } = await supabase
    .from("students")
    .select("id, full_name")
    .eq("id", id)
    .single();

  if (studentError || !student) {
    notFound();
  }

  const {
    data: enrollments,
    error: enrollmentError,
  } = await supabase
    .from("enrollments")
    .select("*")
    .eq("student_id", id)
    .order("created_at", {
      ascending: false,
    });

  if (enrollmentError) {
    console.error(
      "ENROLLMENT ERROR:",
      enrollmentError
    );
  }

  const enrollment = enrollments?.[0] ?? null;

  if (!enrollment) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] px-6 py-12 text-[#292929]">
        <div className="mx-auto max-w-5xl">
          <Link
            href={`/${currentLocale}/admin/students/${id}`}
            className="font-sans text-[13px] font-medium text-[#6F8F72]"
          >
            ← Student
          </Link>

          <div className="mt-10 rounded-3xl border border-[#E7DDD1] bg-white p-9">
            <h1 className="font-serif text-[40px] font-normal">
              No enrollment
            </h1>

            <p className="mt-3 font-sans text-[14px] text-[#666]">
              This student does not have an enrollment yet.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const {
    data: lessons,
    error: lessonsError,
  } = await supabase
    .from("lessons")
    .select(`
      id,
      lesson_number,
      lesson_date,
      duration,
      attendance_status,
      notes
    `)
    .eq("enrollment_id", enrollment.id)
    .order("lesson_number", {
      ascending: true,
    });

  if (lessonsError) {
    console.error(
      "LESSONS ERROR:",
      lessonsError
    );
  }

  const lessonRecords =
    (lessons ?? []) as LessonRecord[];

  const completedLessons =
    lessonRecords.filter(
      (lesson) =>
        lesson.attendance_status ===
        "completed"
    ).length;

  const totalLessons =
    enrollment.number_of_lessons ?? 0;

  const remainingLessons = Math.max(
    totalLessons - completedLessons,
    0
  );

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
      <div className="mx-auto max-w-5xl">

        {/* BACK */}

        <Link
          href={`/${currentLocale}/admin/students/${id}`}
          className="
            font-sans
            text-[13px]
            font-medium
            text-[#6F8F72]
            transition
            hover:opacity-70
          "
        >
          ← {student.full_name}
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
            Lesson Management
          </p>

          <h1
            className="
              mt-4
              font-serif
              text-[46px]
              font-normal
              leading-tight
              tracking-[-0.03em]

              sm:text-[54px]
            "
          >
            Lessons
          </h1>

          <p
            className="
              mt-3
              max-w-2xl
              font-serif
              text-[20px]
              leading-8
              text-[#666]
            "
          >
            Track lessons, dates, attendance,
            and notes for {student.full_name}.
          </p>

        </div>

        {/* SUMMARY */}

        <div
          className="
            mt-10
            grid
            gap-3

            sm:grid-cols-3
          "
        >
          <SummaryCard
            label="Total Lessons"
            value={String(totalLessons)}
          />

          <SummaryCard
            label="Completed"
            value={String(completedLessons)}
          />

          <SummaryCard
            label="Remaining"
            value={String(remainingLessons)}
          />
        </div>

        {/* LESSONS */}

        <section
          className="
            mt-6
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
              flex
              flex-col
              gap-2

              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >

            <div>

              <p
                className="
                  font-sans
                  text-[11px]
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-[#999]
                "
              >
                Enrollment
              </p>

              <h2
                className="
                  mt-2
                  font-serif
                  text-[28px]
                  font-normal
                "
              >
                {enrollment.package_name}
              </h2>

            </div>

            <span
              className="
                font-sans
                text-[12px]
                text-[#888]
              "
            >
              {lessonRecords.length} recorded
            </span>

          </div>

          {lessonRecords.length === 0 && (
            <div
              className="
                mt-8
                rounded-2xl
                border
                border-dashed
                border-[#D8CCBE]
                bg-[#FAF8F5]
                px-6
                py-10
                text-center
              "
            >

              <h3
                className="
                  font-serif
                  text-[24px]
                  font-normal
                  text-[#555]
                "
              >
                No lessons recorded
              </h3>

              <p
                className="
                  mx-auto
                  mt-2
                  max-w-md
                  font-sans
                  text-[13px]
                  leading-6
                  text-[#777]
                "
              >
                Create a lesson record after each
                class to track attendance and notes.
              </p>

              <Link
                href={`/${currentLocale}/admin/students/${id}/lessons/new`}
                className="
                  mt-6
                  inline-flex
                  rounded-full
                  bg-[#6F8F72]
                  px-6
                  py-3
                  font-sans
                  text-[13px]
                  font-medium
                  text-white
                  transition
                  hover:bg-[#5F7F63]
                "
              >
                + Record First Lesson
              </Link>

            </div>
          )}

          {lessonRecords.length > 0 && (
            <div className="mt-8 space-y-3">

              {lessonRecords.map((lesson) => (
                <div
                  key={lesson.id}
                  className="
                    rounded-2xl
                    border
                    border-[#E7DDD1]
                    bg-white
                    px-5
                    py-5

                    sm:px-6
                  "
                >

                  <div
                    className="
                      flex
                      flex-col
                      gap-5

                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-4
                      "
                    >

                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-[#E2EBDD]
                          font-sans
                          text-[12px]
                          font-medium
                          text-[#5F7F63]
                        "
                      >
                        {lesson.lesson_number}
                      </div>

                      <div>

                        <p
                          className="
                            font-serif
                            text-[19px]
                            text-[#444]
                          "
                        >
                          {formatDate(
                            lesson.lesson_date
                          )}
                        </p>

                        <p
                          className="
                            mt-1
                            font-sans
                            text-[12px]
                            text-[#888]
                          "
                        >
                          {lesson.duration ??
                            enrollment.lesson_duration}{" "}
                          minutes
                        </p>

                      </div>

                    </div>

                    <div
                      className="
                        flex
                        flex-wrap
                        items-center
                        gap-3
                      "
                    >

                      <StatusBadge
                        status={
                          lesson.attendance_status
                        }
                      />

                      <Link
                        href={`/${currentLocale}/admin/students/${id}/lessons/${lesson.id}`}
                        className="
                          inline-flex
                          rounded-full
                          border
                          border-[#D8CCBE]
                          px-5
                          py-2.5
                          font-sans
                          text-[12px]
                          font-medium
                          text-[#5F7F63]
                          transition
                          hover:border-[#6F8F72]
                          hover:bg-[#F4F7F2]
                        "
                      >
                        Update
                      </Link>

                    </div>

                  </div>

                  {lesson.notes && (
                    <div
                      className="
                        mt-5
                        border-t
                        border-[#EEE7DF]
                        pt-4
                      "
                    >

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
                        Notes
                      </p>

                      <p
                        className="
                          mt-2
                          font-sans
                          text-[13px]
                          leading-6
                          text-[#666]
                        "
                      >
                        {lesson.notes}
                      </p>

                    </div>
                  )}

                </div>
              ))}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* SUMMARY CARD                                                               */
/* -------------------------------------------------------------------------- */

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-[#E7DDD1]
        bg-white
        px-5
        py-5
      "
    >

      <p
        className="
          font-sans
          text-[11px]
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
          mt-2
          font-serif
          text-[30px]
          font-normal
          text-[#444]
        "
      >
        {value}
      </p>

    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* STATUS BADGE                                                               */
/* -------------------------------------------------------------------------- */

function StatusBadge({
  status,
}: {
  status: LessonStatus;
}) {
  const config: Record<
    LessonStatus,
    {
      label: string;
      className: string;
    }
  > = {
    scheduled: {
      label: "Scheduled",
      className:
        "bg-[#F1EEE8] text-[#777]",
    },

    completed: {
      label: "Completed",
      className:
        "bg-[#E2EBDD] text-[#5F7F63]",
    },

    rescheduled: {
      label: "Rescheduled / Credit",
      className:
        "bg-[#F4EBD8] text-[#8A7044]",
    },

    unexpected: {
      label: "Unexpected Circumstance",
      className:
        "bg-[#F8ECE8] text-[#8A5148]",
    },

    teacher_cancelled: {
      label: "Teacher Cancellation",
      className:
        "bg-[#E9E7F2] text-[#666080]",
    },
  };

  const current =
    config[status] ?? config.scheduled;

  return (
    <span
      className={`
        inline-flex
        w-fit
        rounded-full
        px-4
        py-2
        font-sans
        text-[12px]
        font-medium
        ${current.className}
      `}
    >
      {current.label}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* DATE                                                                        */
/* -------------------------------------------------------------------------- */

function formatDate(
  value: string | null
) {
  if (!value) {
    return "No date";
  }

  return new Date(
    `${value}T00:00:00`
  ).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
}