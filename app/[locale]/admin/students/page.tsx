import Link from "next/link";
import { Users, GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

interface StudentsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function StudentsPage({
  params,
}: StudentsPageProps) {
  const { locale } = await params;

  const supabase = await createClient();

  const { data: students, error } = await supabase
    .from("students")
    .select(`
      id,
      full_name,
      preferred_name,
      country,
      timezone,
      enrollments (
        id,
        package_name,
        number_of_lessons,
        status,
        lessons (
          id,
          attendance_status,
          consumes_lesson
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw new Error("Unable to load students.");
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
      {/* HEADER */}
      <header
        className="
          w-full
          px-6
          pt-7

          sm:px-8
          sm:pt-8

          lg:px-10

          xl:px-12
        "
      >
        <div className="relative flex w-full items-center justify-between">
          <Link
            href={`/${locale}/admin`}
            className="
              shrink-0
              font-sans
              text-[15px]
              text-[#5F655F]
              transition-colors
              duration-200
              hover:text-[#6F8F72]
            "
          >
            ← Admin
          </Link>

          <div
            className="
              absolute
              left-1/2
              hidden
              -translate-x-1/2
              whitespace-nowrap
              font-sans
              text-[15px]
              font-medium
              text-[#6F8F72]

              sm:block
              sm:text-[16px]
            "
          >
            Hamkke │ 함께
          </div>

          <div
            className="
              flex
              items-center
              gap-3
              font-sans
              text-[14px]
              text-[#5F655F]

              sm:gap-4
              sm:text-[15px]
            "
          >
            <span className="font-medium text-[#6F8F72]">
              EN
            </span>

            <span>한국어</span>
            <span>中文</span>
          </div>
        </div>
      </header>

      {/* INTRO */}
      <section
        className="
          mx-auto
          w-full
          max-w-[1040px]
          px-6
          pb-12
          pt-10

          sm:px-8
          sm:pb-14
          sm:pt-20

          lg:px-10
          lg:pb-16
          lg:pt-24
        "
      >
        <div
          className="
            mb-0
            text-center
            font-sans
            text-[14px]
            font-medium
            tracking-[0.02em]
            text-[#6F8F72]

            sm:hidden
          "
        >
          Hamkke │ 함께
        </div>

        <h1
          className="
            text-center
            font-serif
            text-[52px]
            font-normal
            leading-[1.05]
            tracking-[-0.035em]
            text-[#292929]

            sm:text-[62px]

            lg:text-[70px]
          "
        >
          Students
        </h1>

        <p
          className="
            mx-auto
            mt-8
            max-w-[850px]
            text-center
            font-serif
            text-[21px]
            font-normal
            leading-8
            text-[#4A4A4A]

            sm:text-[23px]
            sm:leading-9

            lg:text-[25px]
            lg:leading-10
          "
        >
          Manage your students, enrollments, lessons,
          contracts, and payments in one place.
        </p>
      </section>

      {/* STUDENT LIST */}
      <section
        className="
          mx-auto
          w-full
          max-w-[1040px]
          px-6
          pb-20

          sm:px-8

          lg:px-10
          lg:pb-24
        "
      >
        {/* ACTION ROW */}
        <div
          className="
            mb-2
            flex
            items-center
            justify-between
            border-b
            border-[#DCD8D2]
            pb-5
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-[#E2EBDD]
                text-[#6F8F72]
              "
            >
              <Users size={17} strokeWidth={1.5} />
            </div>

            <span
              className="
                font-sans
                text-[11px]
                font-medium
                uppercase
                tracking-[0.14em]
                text-[#6F8F72]
              "
            >
              {students?.length ?? 0}{" "}
              {students?.length === 1 ? "Student" : "Students"}
            </span>
          </div>

          <Link
            href={`/${locale}/admin/students/new`}
            className="
              font-sans
              text-sm
              text-[#5F655F]
              transition-colors
              hover:text-[#6F8F72]
            "
          >
            + Add Student
          </Link>
        </div>

        {students && students.length > 0 ? (
          <div>
            {students.map((student, index) => {
              const enrollments = student.enrollments ?? [];

              const activeEnrollment = enrollments.find(
                (enrollment) =>
                  enrollment.status === "active"
              );

              const lessons =
                activeEnrollment?.lessons ?? [];

              const consumedLessons = lessons.filter(
                (lesson) => lesson.consumes_lesson
              ).length;

              const totalLessons =
                activeEnrollment?.number_of_lessons ?? 0;

              const remainingLessons =
                totalLessons - consumedLessons;

              return (
                <Link
                  key={student.id}
                  href={`/${locale}/admin/students/${student.id}`}
                  className="
                    group
                    block
                    border-b
                    border-[#DCD8D2]
                    py-10
                    transition-colors
                    hover:bg-[#F0F4ED]
                  "
                >
                  <div className="flex gap-6">
                    <div
                      className="
                        shrink-0
                        pt-1
                        font-sans
                        text-[11px]
                        font-medium
                        tracking-[0.14em]
                        text-[#8A8A84]
                      "
                    >
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-6">
                        <div>
                          <h2
                            className="
                              font-serif
                              text-[30px]
                              font-normal
                              leading-tight
                              tracking-[-0.02em]
                              text-[#292929]

                              sm:text-[34px]
                            "
                          >
                            {student.preferred_name ||
                              student.full_name}
                          </h2>

                          {student.preferred_name &&
                            student.preferred_name !==
                              student.full_name && (
                              <p
                                className="
                                  mt-2
                                  font-sans
                                  text-sm
                                  text-[#777771]
                                "
                              >
                                {student.full_name}
                              </p>
                            )}
                        </div>

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
                            text-[#6F8F72]
                            transition-transform
                            group-hover:translate-x-1
                          "
                        >
                          <GraduationCap
                            size={18}
                            strokeWidth={1.5}
                          />
                        </div>
                      </div>

                      <div
                        className="
                          mt-6
                          flex
                          flex-wrap
                          gap-x-5
                          gap-y-2
                          font-sans
                          text-[13px]
                          text-[#6B6B66]
                        "
                      >
                        {student.country && (
                          <span>
                            {student.country}
                          </span>
                        )}

                        {student.timezone && (
                          <span>
                            {student.timezone}
                          </span>
                        )}
                      </div>

                      {activeEnrollment ? (
                        <div
                          className="
                            mt-6
                            inline-flex
                            flex-wrap
                            items-center
                            gap-x-4
                            gap-y-2
                            rounded-2xl
                            bg-[#F0F4ED]
                            px-5
                            py-4
                          "
                        >
                          <span
                            className="
                              font-sans
                              text-[11px]
                              font-medium
                              uppercase
                              tracking-[0.14em]
                              text-[#6F8F72]
                            "
                          >
                            Active
                          </span>

                          <span className="font-serif text-[16px]">
                            {activeEnrollment.package_name}
                          </span>

                          <span
                            className="
                              font-sans
                              text-[13px]
                              text-[#6B6B66]
                            "
                          >
                            {totalLessons} lessons ·{" "}
                            {remainingLessons} remaining
                          </span>
                        </div>
                      ) : (
                        <p
                          className="
                            mt-6
                            font-sans
                            text-[13px]
                            italic
                            text-[#8A8A84]
                          "
                        >
                          No active enrollment
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center">
            <div
              className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-[#E2EBDD]
                text-[#6F8F72]
              "
            >
              <Users size={22} strokeWidth={1.5} />
            </div>

            <h2
              className="
                mt-7
                font-serif
                text-[30px]
                font-normal
              "
            >
              No students yet
            </h2>

            <p
              className="
                mx-auto
                mt-3
                max-w-md
                font-serif
                text-[17px]
                leading-7
                text-[#6B6B66]
              "
            >
              Add your first student to begin
              managing their lessons and enrollment.
            </p>

            <Link
              href={`/${locale}/admin/students/new`}
              className="
                mt-8
                inline-block
                font-sans
                text-sm
                text-[#6F8F72]
                underline
                underline-offset-4
              "
            >
              + Add Student
            </Link>
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-20">
          <p
            className="
              text-center
              font-sans
              text-[12px]
              text-[#8A8A84]
            "
          >
            Hamkke │ 함께 · Private English Lessons
          </p>
        </div>
      </section>
    </main>
  );
}