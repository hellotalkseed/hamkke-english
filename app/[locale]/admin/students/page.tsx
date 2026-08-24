import Link from "next/link";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();

  const { data: students, error } = await supabase
    .from("students")
    .select(`
      id,
      student_number,
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
    console.error("Error loading students:", error);
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
              {students?.length ?? 0}{" "}
              {students?.length === 1
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
          students={students ?? []}
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