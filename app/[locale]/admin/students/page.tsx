import { notFound } from "next/navigation";
import { UserPlus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import {
  isValidLocale,
  type Locale,
} from "@/lib/i18n";

interface StudentsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function StudentsPage({
  params,
}: StudentsPageProps) {
  console.log("STUDENTS PAGE LOADED");

  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const currentLocale = locale as Locale;
  
  const supabase = await createClient();

  // Check the authenticated Supabase user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("ADMIN USER:", user);
  console.log(
    "ADMIN USER EMAIL:",
    user?.email ?? "NO USER"
  );

  // Load students
  const {
    data: students,
    error,
  } = await supabase
    .from("students")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  console.log("STUDENTS:", students);
  console.log("STUDENTS ERROR:", error);

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

        {/* HEADER */}

        <div
          className="
            flex
            flex-col
            gap-8

            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <a
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
            </a>

            <p
              className="
                mt-8
                font-sans
                text-[14px]
                font-medium
                tracking-[0.02em]
                text-[#6F8F72]
              "
            >
              Hamkke │ 함께
            </p>

            <h1
              className="
                mt-5
                font-serif
                text-[48px]
                font-normal
                leading-tight
                tracking-[-0.03em]

                sm:text-[56px]
              "
            >
              Students
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
              Your student records in one place.
            </p>
          </div>

          <a
            href={`/${currentLocale}/admin/students/new`}
            className="
              inline-flex
              shrink-0
              items-center
              justify-center
              gap-2
              rounded-full
              bg-[#6F8F72]
              px-7
              py-3.5
              font-sans
              text-[14px]
              font-medium
              text-white
              transition
              hover:bg-[#5F7F63]
            "
          >
            <UserPlus size={16} strokeWidth={1.7} />
            New Enrollment
          </a>
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
            Could not load students: {error.message}
          </div>
        )}

        {/* STUDENTS */}

        <div className="mt-12 space-y-4">

          {students?.length === 0 && (
            <div
              className="
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
                No students yet
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
                Once you create your first enrollment,
                the student will appear here.
              </p>

              <a
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
                "
              >
                Create First Enrollment
              </a>
            </div>
          )}

          {students?.map((student) => (
            <div
              key={student.id}
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

                <div className="min-w-0">

                  <div
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-x-3
                      gap-y-1
                    "
                  >
                    <h2
                      className="
                        font-serif
                        text-[27px]
                        font-normal
                      "
                    >
                      {student.full_name}
                    </h2>

                    {student.preferred_name && (
                      <span
                        className="
                          font-sans
                          text-[13px]
                          text-[#777]
                        "
                      >
                        “{student.preferred_name}”
                      </span>
                    )}
                  </div>

                  <div
                    className="
                      mt-3
                      flex
                      flex-wrap
                      gap-x-5
                      gap-y-2
                      font-sans
                      text-[13px]
                      text-[#666]
                    "
                  >
                    {student.country && (
                      <span>
                        {student.country}
                      </span>
                    )}

                    {student.preferred_language && (
                      <span>
                        {student.preferred_language}
                      </span>
                    )}

                    {student.contact_method && (
                      <span>
                        {student.contact_method}
                      </span>
                    )}
                  </div>

                  {student.email && (
                    <p
                      className="
                        mt-2
                        font-sans
                        text-[13px]
                        text-[#888]
                      "
                    >
                      {student.email}
                    </p>
                  )}
                </div>

                {/* ACTION */}

                <a
                  href={`/${currentLocale}/admin/students/${student.id}`}
                  className="
                    inline-flex
                    shrink-0
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
                    text-[#5F7F63]
                    transition
                    hover:border-[#6F8F72]
                    hover:bg-[#F4F7F2]
                  "
                >
                  View Student
                </a>
              </div>
            </div>
          ))}

        </div>
      </div>
    </main>
  );
}