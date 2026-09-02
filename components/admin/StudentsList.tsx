"use client";

import Link from "next/link";
import {
  GraduationCap,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

interface Lesson {
  id: string;
  attendance_status: string | null;
  consumes_lesson: boolean | null;
}

interface Enrollment {
  id: string;
  package_name: string | null;
  number_of_lessons: number | null;
  status: string | null;
  lessons: Lesson[] | null;
}

interface Student {
  id: string;
  student_number: string | number | null;
  full_name: string;
  preferred_name: string | null;
  country: string | null;
  timezone: string | null;
  enrollments: Enrollment[] | null;
}

interface StudentsListProps {
  students: Student[];
  locale: string;
}

export default function StudentsList({
  students,
  locale,
}: StudentsListProps) {
  const [nameSearch, setNameSearch] = useState("");
  const [studentNumberSearch, setStudentNumberSearch] =
    useState("");

  /*
   * SEARCH FILTERING
   *
   * Name and student number searches are independent.
   *
   * Name only:
   * → searches by name
   *
   * Student number only:
   * → searches by student number
   *
   * Both:
   * → both conditions must match
   */
  const filteredStudents = useMemo(() => {
    const nameQuery = nameSearch
      .trim()
      .toLowerCase();

    const numberQuery = studentNumberSearch
      .trim()
      .toLowerCase();

    return students.filter((student) => {
      /*
       * NAME SEARCH
       *
       * Searches:
       * - full name
       * - preferred name
       */
      const matchesName =
        !nameQuery ||
        student.full_name
          .toLowerCase()
          .includes(nameQuery) ||
        (student.preferred_name ?? "")
          .toLowerCase()
          .includes(nameQuery);

      /*
       * STUDENT NUMBER SEARCH
       *
       * Stored format:
       *
       * HK-2026-0014
       *
       * The search field only accepts:
       *
       * 0014
       */
      const storedStudentNumber = String(
        student.student_number ?? ""
      ).trim();

      const numberMatch =
        storedStudentNumber.match(
          /-(\d+)$/
        );

      const storedNumber =
        numberMatch?.[1] ?? "";

      const matchesStudentNumber =
        !numberQuery ||
        storedNumber.includes(numberQuery);

      return (
        matchesName &&
        matchesStudentNumber
      );
    });
  }, [
    students,
    nameSearch,
    studentNumberSearch,
  ]);

  const hasSearch =
    nameSearch.trim() !== "" ||
    studentNumberSearch.trim() !== "";

  const clearSearch = () => {
    setNameSearch("");
    setStudentNumberSearch("");
  };

  return (
    <>
      {/* SEARCH */}
      <div
        className="
          mb-8
          grid
          gap-4
          md:grid-cols-2
        "
      >
        {/* NAME SEARCH */}
        <div>
          <label
            htmlFor="student-name-search"
            className="
              mb-2
              block
              font-sans
              text-[11px]
              font-medium
              uppercase
              tracking-[0.14em]
              text-[#6F8F72]
            "
          >
            Search by name
          </label>

          <div className="relative">
            <Search
              size={17}
              strokeWidth={1.5}
              className="
                pointer-events-none
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-[#8A8A84]
              "
            />

            <input
              id="student-name-search"
              type="text"
              value={nameSearch}
              onChange={(event) =>
                setNameSearch(
                  event.target.value
                )
              }
              placeholder="Student name"
              autoComplete="off"
              className="
                h-12
                w-full
                rounded-xl
                border
                border-[#DCD8D2]
                bg-[#FFFEFC]
                pl-11
                pr-4
                font-sans
                text-[14px]
                text-[#292929]
                outline-none
                transition-colors
                placeholder:text-[#A19F98]
                focus:border-[#6F8F72]
                focus:ring-1
                focus:ring-[#6F8F72]
              "
            />
          </div>
        </div>

        {/* STUDENT NUMBER SEARCH */}
        <div>
          <label
            htmlFor="student-number-search"
            className="
              mb-2
              block
              font-sans
              text-[11px]
              font-medium
              uppercase
              tracking-[0.14em]
              text-[#6F8F72]
            "
          >
            Search by student number
          </label>

          <div className="relative flex">
            {/* FIXED HK PREFIX */}
            <div
              className="
                flex
                h-12
                shrink-0
                items-center
                rounded-l-xl
                border
                border-r-0
                border-[#DCD8D2]
                bg-[#F0F4ED]
                px-4
                font-sans
                text-[14px]
                font-medium
                text-[#6F8F72]
              "
            >
              HK-
            </div>

            {/* NUMBER ONLY */}
            <input
              id="student-number-search"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={studentNumberSearch}
              onChange={(event) => {
                const value =
                  event.target.value.replace(
                    /\D/g,
                    ""
                  );

                setStudentNumberSearch(
                  value
                );
              }}
              placeholder="0014"
              autoComplete="off"
              className="
                h-12
                min-w-0
                flex-1
                rounded-r-xl
                border
                border-[#DCD8D2]
                bg-[#FFFEFC]
                px-4
                font-sans
                text-[14px]
                text-[#292929]
                outline-none
                transition-colors
                placeholder:text-[#A19F98]
                focus:border-[#6F8F72]
                focus:ring-1
                focus:ring-[#6F8F72]
              "
            />
          </div>

          <p
            className="
              mt-2
              font-sans
              text-[11px]
              text-[#8A8A84]
            "
          >
            Enter the number only, for example 0014.
          </p>
        </div>
      </div>

      {/* SEARCH STATUS */}
      {hasSearch && (
        <div
          className="
            mb-6
            flex
            items-center
            justify-between
            gap-4
            border-b
            border-[#DCD8D2]
            pb-4
          "
        >
          <p
            className="
              font-sans
              text-[13px]
              text-[#6B6B66]
            "
          >
            {filteredStudents.length}{" "}
            {filteredStudents.length === 1
              ? "student"
              : "students"}{" "}
            found
          </p>

          <button
            type="button"
            onClick={clearSearch}
            className="
              inline-flex
              items-center
              gap-1.5
              font-sans
              text-[13px]
              text-[#6F8F72]
              transition-colors
              hover:text-[#4F7054]
            "
          >
            <X
              size={15}
              strokeWidth={1.5}
            />
            Clear
          </button>
        </div>
      )}

      {/* STUDENT LIST */}
      {filteredStudents.length > 0 ? (
        <div>
          {filteredStudents.map(
            (student, index) => {
              const enrollments =
                student.enrollments ?? [];

              /*
               * -------------------------------------------------
               * ACTIVE ENROLLMENT
               * -------------------------------------------------
               *
               * This now works for BOTH:
               *
               * Individual enrollment
               * → attached directly to the student
               *
               * Shared enrollment
               * → attached to the student through
               *   enrollment_students
               *
               * The enrollment is still represented only once.
               */
              const activeEnrollment =
                enrollments.find(
                  (enrollment) =>
                    enrollment.status ===
                    "active"
                );

              /*
               * -------------------------------------------------
               * SHARED / ENROLLMENT-LEVEL LESSON COUNT
               * -------------------------------------------------
               *
               * The lesson pool belongs to the enrollment,
               * not to the participant.
               *
               * Therefore we count consumed lessons from
               * the enrollment's complete lesson track.
               *
               * Example:
               *
               * 20 total
               * 1 consumed
               * 19 remaining
               *
               * Both Dasom and Bin will show the same count.
               */
              const lessons =
                activeEnrollment?.lessons ?? [];

              const consumedLessons =
                lessons.filter(
                  (lesson) =>
                    lesson.consumes_lesson ===
                    true
                ).length;

              const totalLessons =
                activeEnrollment?.number_of_lessons ??
                0;

              const remainingLessons =
                Math.max(
                  0,
                  totalLessons -
                    consumedLessons
                );

              const studentNumber =
                student.student_number
                  ? String(
                      student.student_number
                    )
                  : null;

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
                    {/* LIST NUMBER */}
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
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* NAME + ICON */}
                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-6
                        "
                      >
                        <div>
                          {/* STUDENT NUMBER */}
                          {studentNumber && (
                            <div
                              className="
                                mb-2
                                font-sans
                                text-[11px]
                                font-medium
                                tracking-[0.12em]
                                text-[#6F8F72]
                              "
                            >
                              {studentNumber}
                            </div>
                          )}

                          {/* STUDENT NAME */}
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

                          {/* FULL NAME */}
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

                        {/* ICON */}
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

                      {/* STUDENT INFORMATION */}
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

                      {/* ACTIVE ENROLLMENT */}
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

                          <span
                            className="
                              font-serif
                              text-[16px]
                            "
                          >
                            {
                              activeEnrollment.package_name
                            }
                          </span>

                          <span
                            className="
                              font-sans
                              text-[13px]
                              text-[#6B6B66]
                            "
                          >
                            {totalLessons} lessons ·{" "}
                            {remainingLessons}{" "}
                            remaining
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
            }
          )}
        </div>
      ) : (
        /* NO RESULTS */
        <div
          className="
            border-b
            border-[#DCD8D2]
            py-24
            text-center
          "
        >
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
            <Search
              size={22}
              strokeWidth={1.5}
            />
          </div>

          <h2
            className="
              mt-7
              font-serif
              text-[30px]
              font-normal
            "
          >
            {hasSearch
              ? "No students found"
              : "No students yet"}
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
            {hasSearch
              ? "Try a different name or student number."
              : "Add your first student to begin managing their lessons and enrollment."}
          </p>

          {hasSearch ? (
            <button
              type="button"
              onClick={clearSearch}
              className="
                mt-8
                font-sans
                text-sm
                text-[#6F8F72]
                underline
                underline-offset-4
              "
            >
              Clear search
            </button>
          ) : (
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
          )}
        </div>
      )}
    </>
  );
}