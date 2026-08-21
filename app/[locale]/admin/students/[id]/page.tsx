import Link from "next/link";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import {
  isValidLocale,
  type Locale,
} from "@/lib/i18n";

interface StudentPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function StudentPage({
  params,
}: StudentPageProps) {
  const { locale, id } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const currentLocale = locale as Locale;

  const supabase = await createClient();

  /*
   * Get the student
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
    notFound();
  }

  /*
   * Get the student's enrollments
   */

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
          href={`/${currentLocale}/admin/students`}
          className="
            font-sans
            text-[13px]
            font-medium
            text-[#6F8F72]
            transition
            hover:opacity-70
          "
        >
          ← Students
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
            Student
          </p>

          <div
            className="
              mt-4
              flex
              flex-col
              gap-6

              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >
            <div>
              <h1
                className="
                  font-serif
                  text-[46px]
                  font-normal
                  leading-tight
                  tracking-[-0.03em]

                  sm:text-[54px]
                "
              >
                {student.full_name}
              </h1>

              {student.preferred_name && (
                <p
                  className="
                    mt-2
                    font-sans
                    text-[15px]
                    text-[#777]
                  "
                >
                  “{student.preferred_name}”
                </p>
              )}
            </div>

            <div
              className="
                flex
                flex-col
                gap-3

                sm:items-end
              "
            >
              {enrollment && (
                <span
                  className="
                    inline-flex
                    w-fit
                    rounded-full
                    bg-[#E2EBDD]
                    px-4
                    py-2
                    font-sans
                    text-[12px]
                    font-medium
                    capitalize
                    text-[#5F7F63]
                  "
                >
                  {enrollment.status}
                </span>
              )}

              {/* DOWNLOAD RECORD */}

              {enrollment && (
                <Link
                  href={`/${currentLocale}/admin/students/${student.id}/record`}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-[#6F8F72]
                    px-5
                    py-3
                    font-sans
                    text-[13px]
                    font-medium
                    text-white
                    transition
                    hover:bg-[#5F7F63]
                  "
                >
                  <Download
                    size={15}
                    strokeWidth={1.8}
                  />
                  Download Student Record
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* STUDENT INFORMATION */}

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
            Student Information
          </p>

          <div
            className="
              mt-7
              grid
              gap-x-8
              gap-y-7

              sm:grid-cols-2
            "
          >
            <InfoItem
              label="Email"
              value={student.email}
            />

            <InfoItem
              label="Contact Method"
              value={student.contact_method}
            />

            <InfoItem
              label="Country"
              value={student.country}
            />

            <InfoItem
              label="Preferred Language"
              value={student.preferred_language}
            />

            <InfoItem
              label="Timezone"
              value={student.timezone}
            />
          </div>
        </section>

        {/* ENROLLMENT */}

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
                  tracking-[0.14em]
                  text-[#6F8F72]
                "
              >
                Enrollment
              </p>

              <h2
                className="
                  mt-3
                  font-serif
                  text-[30px]
                  font-normal
                "
              >
                {enrollment?.package_name ??
                  "No enrollment"}
              </h2>
            </div>
          </div>

          {!enrollment && (
            <p
              className="
                mt-5
                font-sans
                text-[14px]
                leading-6
                text-[#666]
              "
            >
              This student does not have an enrollment
              yet.
            </p>
          )}

          {enrollment && (
            <div
              className="
                mt-8
                grid
                gap-x-8
                gap-y-7

                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              <InfoItem
                label="Lessons"
                value={String(
                  enrollment.number_of_lessons
                )}
              />

              <InfoItem
                label="Lesson Duration"
                value={`${enrollment.lesson_duration} minutes`}
              />

              <InfoItem
                label="Lessons Per Week"
                value={String(
                  enrollment.lessons_per_week
                )}
              />

              <InfoItem
                label="Tuition"
                value={`${enrollment.currency} ${Number(
                  enrollment.tuition_amount
                ).toLocaleString()}`}
              />

              <InfoItem
                label="Start Date"
                value={formatDate(
                  enrollment.start_date
                )}
              />

              <InfoItem
                label="Status"
                value={enrollment.status}
              />
            </div>
          )}
        </section>

        {/* LESSONS & ATTENDANCE */}

        {enrollment && (
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
                gap-3

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
                    tracking-[0.14em]
                    text-[#6F8F72]
                  "
                >
                  Progress
                </p>

                <h2
                  className="
                    mt-3
                    font-serif
                    text-[30px]
                    font-normal
                  "
                >
                  Lessons & Attendance
                </h2>
              </div>

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
                View All Lessons →
              </Link>
            </div>

            <div
              className="
                mt-8
                rounded-2xl
                border
                border-dashed
                border-[#D8CCBE]
                bg-[#FAF8F5]
                px-6
                py-8
                text-center
              "
            >
              <p
                className="
                  font-serif
                  text-[24px]
                  text-[#555]
                "
              >
                Lesson records will appear here
              </p>

              <p
                className="
                  mx-auto
                  mt-2
                  max-w-lg
                  font-sans
                  text-[13px]
                  leading-6
                  text-[#777]
                "
              >
                Once lessons are recorded for this
                enrollment, you will be able to see
                lesson progress, attendance, dates,
                and notes here.
              </p>
            </div>
          </section>
        )}

        {/* PAYMENTS */}

        {enrollment && (
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
                gap-3

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
                    tracking-[0.14em]
                    text-[#6F8F72]
                  "
                >
                  Payments
                </p>

                <h2
                  className="
                    mt-3
                    font-serif
                    text-[30px]
                    font-normal
                  "
                >
                  Payment History
                </h2>
              </div>

              <Link
                href={`/${currentLocale}/admin/payments`}
                className="
                  font-sans
                  text-[13px]
                  font-medium
                  text-[#6F8F72]
                  transition
                  hover:opacity-70
                "
              >
                View All Payments →
              </Link>
            </div>

            <div
              className="
                mt-8
                rounded-2xl
                border
                border-dashed
                border-[#D8CCBE]
                bg-[#FAF8F5]
                px-6
                py-8
                text-center
              "
            >
              <p
                className="
                  font-serif
                  text-[24px]
                  text-[#555]
                "
              >
                Payment records are available
              </p>

              <p
                className="
                  mx-auto
                  mt-2
                  max-w-lg
                  font-sans
                  text-[13px]
                  leading-6
                  text-[#777]
                "
              >
                View the full payment history from
                Payment Management.
              </p>

              <Link
                href={`/${currentLocale}/admin/payments`}
                className="
                  mt-5
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
                Go to Payments →
              </Link>
            </div>
          </section>
        )}

      </div>
    </main>
  );
}

function InfoItem({
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
          font-sans
          text-[15px]
          leading-6
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
    return "—";
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