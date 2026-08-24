"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { GraduationCap, Search } from "lucide-react";

interface Student {
  id: string;
  full_name: string;
  preferred_name: string | null;
  student_number: string | null;
  country: string | null;
  timezone: string | null;
  enrollments: {
    id: string;
    package_name: string;
    number_of_lessons: number;
    status: string;
    lessons: {
      id: string;
      attendance_status: string;
      consumes_lesson: boolean;
    }[];
  }[];
}

interface StudentSearchProps {
  students: Student[];
  locale: string;
}

export default function StudentSearch({
  students,
  locale,
}: StudentSearchProps) {
  const [query, setQuery] = useState("");

  const filteredStudents = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return students;
    }

    return students.filter((student) => {
      const fullName = student.full_name?.toLowerCase() ?? "";
      const preferredName =
        student.preferred_name?.toLowerCase() ?? "";
      const studentNumber =
        student.student_number?.toLowerCase() ?? "";

      return (
        fullName.includes(search) ||
        preferredName.includes(search) ||
        studentNumber.includes(search)
      );
    });
  }, [query, students]);

  return (
    <>
      {/* SEARCH */}
      <div className="mb-8">
        <div
          className="
            relative
            flex
            items-center
          "
        >
          <Search
            size={18}
            strokeWidth={1.5}
            className="
              pointer-events-none
              absolute
              left-5
              text-[#8A8A84]
            "
          />

          <input
            type="text"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search by name or student number"
            className="
              w-full
              rounded-2xl
              border
              border-[#DCD8D2]
              bg-white/50
              py-4
              pl-13
              pr-5
              font-sans
              text-[14px]
              text-[#292929]
              outline-none
              transition-colors
              placeholder:text-[#9A9A94]
              focus:border-[#AEBEAA]
              focus:bg-white
            "
          />
        </div>

        {query.trim() && (
          <p
            className="
              mt-3
              font-sans
              text-[12px]
              text-[#8A8A84]
            "
          >
            {filteredStudents.length}{" "}
            {filteredStudents.length === 1
              ? "student"
              : "students"}{" "}
            found
          </p>
        )}
      </div>

      {/* STUDENT LIST */}
      {filteredStudents.length > 0 ? (
        <div>
          {filteredStudents.map((student, index) => {
            const enrollments =
              student.enrollments ?? [];

            const activeEnrollment =
              enrollments.find(
                (enrollment) =>
                  enrollment.status === "active"
              );

            const lessons =
              activeEnrollment?.lessons ?? [];

            const consumedLessons =
              lessons.filter(
                (lesson) =>
                  lesson.consumes_lesson
              ).length;

            const totalLessons =
              activeEnrollment?.number_of_lessons ??
              0;

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
                  {/* NUMBER */}
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
                        <div className="flex flex-wrap items-center gap-3">
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

                          {/* STUDENT NUMBER */}
                          {student.student_number && (
                            <span
                              className="
                                rounded-full
                                bg-[#E2EBDD]
                                px-3
                                py-1
                                font-sans
                                text-[10px]
                                font-medium
                                tracking-[0.08em]
                                text-[#6F8F72]
                              "
                            >
                              {student.student_number}
                            </span>
                          )}
                        </div>

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
        <div className="py-20 text-center">
          <p className="font-serif text-[24px]">
            No students found
          </p>

          <p
            className="
              mt-3
              font-sans
              text-[13px]
              text-[#8A8A84]
            "
          >
            Try searching by another name or student
            number.
          </p>
        </div>
      )}
    </>
  );
}