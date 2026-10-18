"use client";

import Link from "next/link";
import {
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
  is_shared?: boolean;
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
        <div className="overflow-hidden rounded-xl border border-[#DCD8D2] bg-[#FFFEFC]">
          <div className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-[#6F8F72]" role="region" aria-label="Students table" tabIndex={0}>
            <table className="w-full min-w-[760px] border-collapse text-left font-sans text-[14px] leading-6">
              <caption className="sr-only">Students and their active enrollment type</caption>
              <thead className="bg-[#EAF0E5] text-[12px] font-medium text-[#526650]">
                <tr>
                  {['English name', 'Korean name', 'Student number', 'Timezone', 'Enrollment'].map((heading) => (
                    <th key={heading} scope="col" className="px-5 py-3.5 font-medium">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E3DC]">
                {filteredStudents.map((student) => {
                  const active = (student.enrollments ?? []).filter((enrollment) => enrollment.status === "active");
                  const shared = active.some((enrollment) => enrollment.is_shared === true);
                  const individual = active.some((enrollment) => enrollment.is_shared === false);
                  const enrollmentLabel = !active.length ? "No active enrollment" : shared && individual ? "Individual / Shared" : shared ? "Shared" : individual ? "Individual" : "Not recorded";
                  const href = `/${locale}/admin/students/${student.id}`;
                  return (
                    <tr key={student.id} className="transition-colors hover:bg-[#F3F5EE] focus-within:bg-[#F3F5EE]">
                      <td className="px-5 py-4 font-medium text-[#354D3B]">
                        <Link href={href} className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6F8F72]">
                          {student.preferred_name?.trim() || student.full_name}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-[#555A53]">
                        <Link href={href} className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6F8F72]">{student.full_name || "—"}</Link>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 tabular-nums text-[#666B63]">{student.student_number ?? "—"}</td>
                      <td className="px-5 py-4 text-[#666B63]">{student.timezone || "Not set"}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-md px-2.5 py-1 text-[12px] leading-5 ${shared ? "bg-[#E7EBDD] text-[#526344]" : active.length ? "bg-[#F0EEE8] text-[#6C6558]" : "text-[#88877F]"}`}>
                          {enrollmentLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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