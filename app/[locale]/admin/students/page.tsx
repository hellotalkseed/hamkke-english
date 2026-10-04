import Link from "next/link";
import { Users } from "lucide-react";
import { requireOwnerDataClient } from "@/lib/supabase/owner-data";
import StudentsList from "@/components/admin/StudentsList";

interface StudentsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function StudentsPage({
  params,
}: StudentsPageProps) {
  const { locale } = await params;

  const supabase = await requireOwnerDataClient(locale);

  /*
   * ---------------------------------------------------------
   * LOAD STUDENTS
   * ---------------------------------------------------------
   *
   * Students are loaded separately from enrollments because
   * an enrollment can now belong to:
   *
   * 1. One student directly through enrollments.student_id
   * 2. Multiple students through enrollment_students
   *
   * Keeping these queries separate lets us support both
   * individual and shared enrollments reliably.
   */

  const { data: students, error: studentsError } =
    await supabase
      .from("students")
      .select(`
        id,
        student_number,
        full_name,
        preferred_name,
        country,
        timezone
      `)
      .order("created_at", { ascending: false });

  if (studentsError) {
    console.error(
      "Error loading students:",
      studentsError
    );

    throw new Error(
      "Unable to load students."
    );
  }

  /*
   * ---------------------------------------------------------
   * LOAD ENROLLMENTS
   * ---------------------------------------------------------
   *
   * This includes:
   *
   * - Direct student relationship
   * - Shared enrollment participants
   * - Lessons belonging to the enrollment
   *
   * The enrollment itself remains ONE record.
   */

  const { data: enrollments, error: enrollmentsError } =
    await supabase
      .from("enrollments")
      .select(`
        id,
        student_id,
        package_name,
        number_of_lessons,
        status,
        lessons (
          id,
          attendance_status,
          consumes_lesson
        ),
        enrollment_students (
          student_id
        )
      `);

  if (enrollmentsError) {
    console.error(
      "Error loading enrollments:",
      enrollmentsError
    );

    throw new Error(
      "Unable to load enrollments."
    );
  }

  /*
   * ---------------------------------------------------------
   * BUILD STUDENT → ENROLLMENT RELATIONSHIP
   * ---------------------------------------------------------
   *
   * We create the same data shape that StudentsList already
   * expects.
   *
   * Individual enrollment:
   *
   * enrollment.student_id
   *
   * Shared enrollment:
   *
   * enrollment.enrollment_students[].student_id
   *
   * A shared enrollment is attached to every participant,
   * but remains a single enrollment record in the database.
   */

  const studentsWithEnrollments = (
    students ?? []
  ).map((student) => {
    const studentEnrollments = (
      enrollments ?? []
    ).filter((enrollment) => {
      /*
       * Direct / individual enrollment
       */
      if (
        enrollment.student_id ===
        student.id
      ) {
        return true;
      }

      /*
       * Shared enrollment
       */
      const isSharedParticipant =
        enrollment.enrollment_students?.some(
          (participant) =>
            participant.student_id ===
            student.id
        );

      return Boolean(isSharedParticipant);
    });

    return {
      ...student,
      enrollments: studentEnrollments.map(
        (enrollment) => ({
          id: enrollment.id,
          package_name:
            enrollment.package_name,
          number_of_lessons:
            enrollment.number_of_lessons,
          status: enrollment.status,
          lessons:
            enrollment.lessons ?? [],
        })
      ),
    };
  });

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
      {/* INTRO */}
      <section className="mx-auto w-full max-w-[1320px] px-8 pb-7 pt-[92px] sm:px-10 lg:px-14 xl:px-16">
        <div className="max-w-[820px]">
          <div className="mb-5 flex items-center gap-4">
            <span className="h-px w-12 bg-[#6F8F72]" />
            <span className="font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-[#6F8F72]">
              Administration
            </span>
          </div>
          <h1 className="font-serif text-[46px] font-normal leading-[1] tracking-[-0.035em] sm:text-[54px] lg:text-[60px]">
            Students
          </h1>
          <p className="mt-4 max-w-[720px] font-serif text-[17px] leading-8 text-[#74716B] sm:text-[18px]">
            Manage students, enrollments, lessons, contracts, and payments in one place.
          </p>
        </div>
      </section>

      {/* STUDENT LIST */}
      <section
        className="
          mx-auto
          w-full
          max-w-[1320px]
          px-8
          pb-20
          sm:px-10
          lg:px-14
          xl:px-16
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
              <Users
                size={17}
                strokeWidth={1.5}
              />
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
              {studentsWithEnrollments.length}{" "}
              {studentsWithEnrollments.length === 1
                ? "Student"
                : "Students"}
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

        <StudentsList
          students={studentsWithEnrollments}
          locale={locale}
        />

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
