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
  }>;
}

export default async function LessonsPage({
  params,
}: LessonsPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const currentLocale = locale as Locale;

  const supabase = await createClient();

  const {
    data: lessons,
    error,
  } = await supabase
    .from("lessons")
    .select(`
      id,
      lesson_number,
      lesson_date,
      duration,
      attendance_status,
      notes,
      enrollment_id,
      enrollments (
        id,
        package_name,
        students (
          id,
          full_name,
          preferred_name
        )
      )
    `)
    .order("lesson_date", {
      ascending: true,
      nullsFirst: false,
    })
    .order("lesson_number", {
      ascending: true,
    });

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
      <div className="mx-auto max-w-6xl">

        {/* BACK */}

        <Link
          href={`/${currentLocale}/admin`}
          className="
            font-sans
            text-[13px]
            font-medium
            text-[#6F8F72]
            transition
            hover:opacity-70
          "
        >
          ← Admin
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
            Lessons
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
            Track lessons, dates, attendance, and notes
            for each student.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div
            className="
              mt-10
              rounded-2xl
              border
              border-[#E7CFC8]
              bg-[#F8ECE8]
              px-5
              py-4
              font-sans
              text-[14px]
              leading-6
              text-[#8A5148]
            "
          >
            Could not load lessons:{" "}
            {error.message}
          </div>
        )}

        {/* EMPTY STATE */}

        {!error && lessons?.length === 0 && (
          <div
            className="
              mt-12
              rounded-3xl
              border
              border-[#E7DDD1]
              bg-white
              px-7
              py-14
              text-center
            "
          >
            <h2
              className="
                font-serif
                text-[30px]
                font-normal
              "
            >
              No lessons yet
            </h2>

            <p
              className="
                mx-auto
                mt-3
                max-w-md
                font-sans
                text-[14px]
                leading-6
                text-[#666]
              "
            >
              Lessons will appear here once they are
              created for an enrollment.
            </p>
          </div>
        )}

        {/* LESSONS */}

        {lessons && lessons.length > 0 && (
          <div className="mt-12 space-y-4">

            {lessons.map((lesson) => {
              const enrollment =
                Array.isArray(lesson.enrollments)
                  ? lesson.enrollments[0]
                  : lesson.enrollments;

              const student =
                enrollment &&
                (Array.isArray(enrollment.students)
                  ? enrollment.students[0]
                  : enrollment.students);

              return (
                <div
                  key={lesson.id}
                  className="
                    rounded-3xl
                    border
                    border-[#E7DDD1]
                    bg-white
                    p-6

                    sm:p-7
                  "
                >
                  <div
                    className="
                      flex
                      flex-col
                      gap-6

                      lg:flex-row
                      lg:items-center
                      lg:justify-between
                    "
                  >

                    {/* STUDENT */}

                    <div>
                      <div
                        className="
                          flex
                          flex-wrap
                          items-center
                          gap-x-3
                          gap-y-2
                        "
                      >
                        <h2
                          className="
                            font-serif
                            text-[27px]
                            font-normal
                          "
                        >
                          {student?.full_name ??
                            "Unknown Student"}
                        </h2>

                        <span
                          className="
                            rounded-full
                            bg-[#E2EBDD]
                            px-3
                            py-1
                            font-sans
                            text-[11px]
                            font-medium
                            capitalize
                            text-[#5F7F63]
                          "
                        >
                          {lesson.attendance_status}
                        </span>
                      </div>

                      {student?.preferred_name && (
                        <p
                          className="
                            mt-1
                            font-sans
                            text-[13px]
                            text-[#777]
                          "
                        >
                          “{student.preferred_name}”
                        </p>
                      )}

                      <p
                        className="
                          mt-3
                          font-sans
                          text-[13px]
                          text-[#666]
                        "
                      >
                        {enrollment?.package_name ??
                          "Unknown Enrollment"}
                      </p>
                    </div>

                    {/* LESSON DETAILS */}

                    <div
                      className="
                        grid
                        grid-cols-2
                        gap-x-8
                        gap-y-5

                        sm:grid-cols-4
                      "
                    >
                      <LessonInfo
                        label="Lesson"
                        value={`#${lesson.lesson_number}`}
                      />

                      <LessonInfo
                        label="Date"
                        value={formatDate(
                          lesson.lesson_date
                        )}
                      />

                      <LessonInfo
                        label="Duration"
                        value={
                          lesson.duration
                            ? `${lesson.duration} minutes`
                            : null
                        }
                      />

                      <LessonInfo
                        label="Status"
                        value={
                          lesson.attendance_status
                        }
                      />
                    </div>
                  </div>

                  {/* NOTES */}

                  {lesson.notes && (
                    <div
                      className="
                        mt-6
                        border-t
                        border-[#EEE7DF]
                        pt-5
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

                  {/* VIEW STUDENT */}

                  {student?.id && (
                    <div className="mt-6">
                      <Link
                        href={`/${currentLocale}/admin/students/${student.id}`}
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
                        View Student →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function LessonInfo({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
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
          text-[13px]
          text-[#444]
        "
      >
        {value || "—"}
      </p>
    </div>
  );
}

function formatDate(
  value: string | null | undefined
) {
  if (!value) {
    return "Not scheduled";
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
}