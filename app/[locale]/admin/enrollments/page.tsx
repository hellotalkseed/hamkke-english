import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import {
  isValidLocale,
  type Locale,
} from "@/lib/i18n";

interface EnrollmentsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function EnrollmentsPage({
  params,
}: EnrollmentsPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const currentLocale = locale as Locale;

  const supabase = await createClient();

  /*
   * Get enrollments with their student information
   */

  const {
    data: enrollments,
    error,
  } = await supabase
    .from("enrollments")
    .select(`
      *,
      students (
        id,
        full_name,
        preferred_name,
        country
      )
    `)
    .order("created_at", {
      ascending: false,
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
            Enrollment Management
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
            Enrollments
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
            View and manage your students' current
            and upcoming enrollments.
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
            Could not load enrollments:{" "}
            {error.message}
          </div>
        )}

        {/* EMPTY STATE */}

        {!error && enrollments?.length === 0 && (
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
              No enrollments yet
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
              Create an enrollment from the student
              management page to see it here.
            </p>

            <Link
              href={`/${currentLocale}/admin/students/new`}
              className="
                mt-6
                inline-flex
                rounded-full
                bg-[#6F8F72]
                px-6
                py-3
                font-sans
                text-[14px]
                font-medium
                text-white
                transition
                hover:bg-[#5F7F63]
              "
            >
              New Enrollment
            </Link>
          </div>
        )}

        {/* ENROLLMENTS */}

        {enrollments && enrollments.length > 0 && (
          <div className="mt-12 space-y-4">

            {enrollments.map((enrollment) => {
              const student = enrollment.students;

              return (
                <div
                  key={enrollment.id}
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
                            text-[28px]
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
                          {enrollment.status}
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

                      <div
                        className="
                          mt-4
                          flex
                          flex-wrap
                          gap-x-5
                          gap-y-2
                          font-sans
                          text-[13px]
                          text-[#666]
                        "
                      >
                        {student?.country && (
                          <span>
                            {student.country}
                          </span>
                        )}

                        <span>
                          {enrollment.package_name}
                        </span>

                        <span>
                          {enrollment.number_of_lessons} lessons
                        </span>

                        <span>
                          {enrollment.lesson_duration} min
                        </span>
                      </div>
                    </div>

                    {/* ENROLLMENT DETAILS */}

                    <div
                      className="
                        grid
                        grid-cols-2
                        gap-x-8
                        gap-y-4

                        sm:grid-cols-3

                        lg:min-w-[390px]
                      "
                    >
                      <EnrollmentInfo
                        label="Start Date"
                        value={formatDate(
                          enrollment.start_date
                        )}
                      />

                      <EnrollmentInfo
                        label="Per Week"
                        value={`${enrollment.lessons_per_week}`}
                      />

                      <EnrollmentInfo
                        label="Tuition"
                        value={`${enrollment.currency} ${Number(
                          enrollment.tuition_amount
                        ).toLocaleString()}`}
                      />
                    </div>

                  </div>

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

function EnrollmentInfo({
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
          text-[13px]
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

  return new Date(`${value}T00:00:00`).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
}