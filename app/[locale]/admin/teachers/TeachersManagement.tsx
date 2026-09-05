"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Teacher {
  id: string;
  full_name: string | null;
  role: string;
  status: string;
  created_at: string;
  teacher_number: string | null;
  student_count: number;
  total_lessons: number;
  payable: number;
}

interface TeachersResponse {
  teachers?: Teacher[];
  error?: string;
}

/* ========================================================================= */
/* ICONS                                                                     */
/* ========================================================================= */

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[17px] w-[17px]"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function UserCheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[17px] w-[17px]"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  );
}

function GraduationCapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[17px] w-[17px]"
      aria-hidden="true"
    >
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c3 2 9 2 12 0v-5" />
      <path d="M22 10v6" />
    </svg>
  );
}

function BookOpenIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[17px] w-[17px]"
      aria-hidden="true"
    >
      <path d="M2 4.5A2.5 2.5 0 0 1 4.5 2H12v18H4.5A2.5 2.5 0 0 0 2 22V4.5Z" />
      <path d="M22 4.5A2.5 2.5 0 0 0 19.5 2H12v18h7.5A2.5 2.5 0 0 1 22 22V4.5Z" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[17px] w-[17px]"
      aria-hidden="true"
    >
      <path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v10a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V6" />
      <path d="M16 14h.01" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[16px] w-[16px]"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[15px] w-[15px]"
      aria-hidden="true"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

/* ========================================================================= */
/* HELPERS                                                                   */
/* ========================================================================= */

function formatMoney(amount: number) {
  return `₱${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function getStatusStyles(status: string) {
  switch (status) {
    case "active":
      return {
        label: "Active",
        className: "bg-[#E5EBDD] text-[#607963]",
        ballClassName: "bg-[#6F8F72]",
      };

    case "inactive":
      return {
        label: "Inactive",
        className: "bg-[#EAE8E3] text-[#77736B]",
        ballClassName: "bg-[#8A8780]",
      };

    case "pending":
      return {
        label: "Pending",
        className: "bg-[#F3EEDC] text-[#927B45]",
        ballClassName: "bg-[#A58A4E]",
      };

    default:
      return {
        label:
          status.charAt(0).toUpperCase() +
          status.slice(1),
        className: "bg-[#ECEAE6] text-[#77736B]",
        ballClassName: "bg-[#8A8780]",
      };
  }
}

/* ========================================================================= */
/* PAGE                                                                      */
/* ========================================================================= */

export default function TeachersManagement({
  locale,
}: {
  locale: string;
}) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  /* ----------------------------------------------------------------------- */
  /* LOAD TEACHERS                                                           */
  /* ----------------------------------------------------------------------- */

  useEffect(() => {
    async function loadTeachers() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/admin/teachers",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data =
          (await response.json()) as TeachersResponse;

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load teachers."
          );
        }

        setTeachers(data.teachers || []);
      } catch (err) {
        console.error(
          "Error loading teachers:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load teachers."
        );
      } finally {
        setLoading(false);
      }
    }

    loadTeachers();
  }, []);

  /* ----------------------------------------------------------------------- */
  /* SEARCH                                                                  */
  /* ----------------------------------------------------------------------- */

  const normalizedSearch =
    searchQuery.trim().toLowerCase();

  const filteredTeachers =
    normalizedSearch === ""
      ? teachers
      : teachers.filter((teacher) => {
          const name =
            teacher.full_name?.toLowerCase() || "";

          const teacherNumber =
            teacher.teacher_number?.toLowerCase() || "";

          return (
            name.includes(normalizedSearch) ||
            teacherNumber.includes(normalizedSearch)
          );
        });

  /* ----------------------------------------------------------------------- */
  /* SUMMARY                                                                 */
  /* ----------------------------------------------------------------------- */

  const totalTeachers = teachers.length;

  const activeTeachers = teachers.filter(
    (teacher) =>
      teacher.status === "active"
  ).length;

  const totalStudents = teachers.reduce(
    (total, teacher) =>
      total + teacher.student_count,
    0
  );

  const totalLessons = teachers.reduce(
    (total, teacher) =>
      total + teacher.total_lessons,
    0
  );

  const totalPayable = teachers.reduce(
    (total, teacher) =>
      total + teacher.payable,
    0
  );

  /* ========================================================================= */
  /* RENDER                                                                    */
  /* ========================================================================= */

  return (
    <main
      className="
        min-h-screen
        bg-[#FAF8F5]
        text-[#292929]
      "
    >
      {/* =================================================================== */}
      {/* HEADER                                                              */}
      {/* =================================================================== */}

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
        <div
          className="
            flex
            w-full
            items-start
            justify-between
            gap-8
          "
        >
          {/* Back to Administration */}

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
              sm:text-[16px]
            "
          >
            &larr; Administration
          </Link>

          {/* Hamkke Brand */}

          <Link
            href={`/${locale}`}
            className="
              shrink-0
              text-right
              transition-opacity
              duration-200
              hover:opacity-70
            "
          >
            <p
              className="
                font-sans
                text-[16px]
                font-semibold
                leading-none
                tracking-[0.18em]
                text-[#6F8F72]
              "
            >
              HAMKKE │ 함께
            </p>

            <p
              className="
                mt-2
                font-serif
                text-[13px]
                font-normal
                leading-none
                tracking-[0.02em]
                text-[#6F8F72]
              "
            >
              From Small Talk to Big Ideas
            </p>
          </Link>
        </div>
      </header>

      {/* =================================================================== */}
      {/* INTRO                                                               */}
      {/* =================================================================== */}

      <section
        className="
          mx-auto
          max-w-[1200px]
          px-6
          pb-12
          pt-12
          sm:px-8
          sm:pb-14
          sm:pt-16
          lg:px-10
          lg:pb-16
          lg:pt-20
        "
      >
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
          <div className="max-w-[760px]">
            <p
              className="
                mb-4
                font-sans
                text-[10px]
                font-medium
                uppercase
                tracking-[0.18em]
                text-[#8A8A84]
              "
            >
              Administration
            </p>

            <h1
              className="
                font-serif
                text-[48px]
                font-normal
                leading-[1]
                tracking-[-0.035em]
                sm:text-[58px]
                lg:text-[66px]
              "
            >
              Teachers
            </h1>

            <p
              className="
                mt-5
                max-w-[620px]
                font-serif
                text-[18px]
                leading-8
                text-[#74716B]
                sm:text-[20px]
                sm:leading-9
              "
            >
              Manage the teachers who teach
              your Hamkke students.
            </p>
          </div>

          <Link
            href={`/${locale}/admin/teachers/invite`}
            className="
              inline-flex
              w-fit
              items-center
              border-b
              border-[#6F8F72]
              pb-1
              font-sans
              text-[13px]
              text-[#6F8F72]
              transition-colors
              hover:border-[#526B55]
              hover:text-[#526B55]
            "
          >
            + Add Teacher
          </Link>
        </div>
      </section>

      {/* =================================================================== */}
      {/* SUMMARY                                                             */}
      {/* =================================================================== */}

      <section
        className="
          mx-auto
          max-w-[1200px]
          px-6
          sm:px-8
          lg:px-10
        "
      >
        <div
          className="
            border-y
            border-[#DCD8D2]
            py-8
            sm:py-10
          "
        >
          <div
            className="
              grid
              grid-cols-2
              gap-x-8
              gap-y-8
              sm:grid-cols-3
              lg:grid-cols-5
              lg:gap-x-10
              lg:gap-y-0
            "
          >
            {/* TEACHERS */}

            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-[#7B927C]">
                <UsersIcon />
              </div>

              <div>
                <p className="font-sans text-[10px] font-medium uppercase tracking-[0.12em] text-[#8A8A84]">
                  Teachers
                </p>

                <p className="mt-1 font-serif text-[27px] leading-none tracking-[-0.02em]">
                  {totalTeachers}
                </p>
              </div>
            </div>

            {/* ACTIVE */}

            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-[#7B927C]">
                <UserCheckIcon />
              </div>

              <div>
                <p className="font-sans text-[10px] font-medium uppercase tracking-[0.12em] text-[#8A8A84]">
                  Active
                </p>

                <p className="mt-1 font-serif text-[27px] leading-none tracking-[-0.02em]">
                  {activeTeachers}
                </p>
              </div>
            </div>

            {/* STUDENTS */}

            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-[#7B927C]">
                <GraduationCapIcon />
              </div>

              <div>
                <p className="font-sans text-[10px] font-medium uppercase tracking-[0.12em] text-[#8A8A84]">
                  Students
                </p>

                <p className="mt-1 font-serif text-[27px] leading-none tracking-[-0.02em]">
                  {totalStudents}
                </p>
              </div>
            </div>

            {/* LESSONS */}

            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-[#7B927C]">
                <BookOpenIcon />
              </div>

              <div>
                <p className="font-sans text-[10px] font-medium uppercase tracking-[0.12em] text-[#8A8A84]">
                  Total lessons
                </p>

                <p className="mt-1 font-serif text-[27px] leading-none tracking-[-0.02em]">
                  {totalLessons.toLocaleString(
                    "en-US"
                  )}
                </p>
              </div>
            </div>

            {/* PAYABLE */}

            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-[#7B927C]">
                <WalletIcon />
              </div>

              <div>
                <p className="font-sans text-[10px] font-medium uppercase tracking-[0.12em] text-[#8A8A84]">
                  Payable
                </p>

                <p className="mt-1 font-serif text-[27px] leading-none tracking-[-0.02em]">
                  {formatMoney(totalPayable)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* TEACHER LIST                                                        */}
      {/* =================================================================== */}

      <section
        className="
          mx-auto
          max-w-[1200px]
          px-6
          pb-20
          pt-14
          sm:px-8
          sm:pb-24
          sm:pt-16
          lg:px-10
        "
      >
        <div
          className="
            mb-7
            flex
            flex-col
            gap-5
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <p
              className="
                font-sans
                text-[10px]
                font-medium
                uppercase
                tracking-[0.18em]
                text-[#8A8A84]
              "
            >
              Teaching team
            </p>

            <h2
              className="
                mt-2
                font-serif
                text-[29px]
                font-normal
                tracking-[-0.025em]
              "
            >
              All Teachers
            </h2>
          </div>

          {/* SEARCH */}

          <div className="relative w-full sm:w-[280px]">
            <label
              htmlFor="teacher-search"
              className="sr-only"
            >
              Search teachers
            </label>

            <div
              className="
                flex
                items-center
                border-b
                border-[#CFCBC5]
                transition-colors
                focus-within:border-[#6F8F72]
              "
            >
              <div
                className="
                  shrink-0
                  pb-2.5
                  text-[#8A8A84]
                "
              >
                <SearchIcon />
              </div>

              <input
                id="teacher-search"
                type="text"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="Search teachers..."
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  px-2.5
                  pb-2.5
                  font-sans
                  text-[13px]
                  text-[#292929]
                  outline-none
                  placeholder:text-[#A29F98]
                "
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchQuery("")
                  }
                  className="
                    shrink-0
                    pb-2.5
                    text-[#8A8A84]
                    transition-colors
                    hover:text-[#6F8F72]
                  "
                  aria-label="Clear search"
                >
                  <ClearIcon />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* LOADING                                                           */}
        {/* ================================================================= */}

        {loading ? (
          <div
            className="
              border-y
              border-[#DCD8D2]
              py-20
              text-center
            "
          >
            <p
              className="
                font-serif
                text-[17px]
                text-[#74716B]
              "
            >
              Loading teachers...
            </p>
          </div>
        ) : error ? (
          /* =============================================================== */
          /* ERROR                                                            */
          /* =============================================================== */

          <div
            className="
              border-y
              border-[#DCD8D2]
              py-20
              text-center
            "
          >
            <h3
              className="
                font-serif
                text-[27px]
                font-normal
              "
            >
              Unable to load teachers
            </h3>

            <p
              className="
                mx-auto
                mt-3
                max-w-[520px]
                font-serif
                text-[16px]
                leading-7
                text-[#74716B]
              "
            >
              {error}
            </p>
          </div>
        ) : filteredTeachers.length > 0 ? (
          /* =============================================================== */
          /* TABLE                                                            */
          /* =============================================================== */

          <div
            className="
              overflow-x-auto
              border-y
              border-[#DCD8D2]
            "
          >
            <table
              className="
                w-full
                min-w-[900px]
                table-fixed
                border-collapse
              "
            >
              <colgroup>
                <col className="w-[29%]" />
                <col className="w-[14%]" />
                <col className="w-[15%]" />
                <col className="w-[17%]" />
                <col className="w-[15%]" />
                <col className="w-[10%]" />
              </colgroup>

              <thead>
                <tr
                  className="
                    border-b
                    border-[#DCD8D2]
                  "
                >
                  {/* TEACHER */}

                  <th
                    className="
                      py-4
                      pl-3
                      pr-2
                      text-left
                      font-sans
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.14em]
                      text-[#8A8A84]
                      sm:pl-4
                    "
                  >
                    Teacher
                  </th>

                  {/* STATUS */}

                  <th
                    className="
                      px-2
                      py-4
                      text-left
                      font-sans
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.14em]
                      text-[#8A8A84]
                    "
                  >
                    Status
                  </th>

                  {/* STUDENTS */}

                  <th
                    className="
                      px-2
                      py-4
                      text-center
                      font-sans
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.14em]
                      text-[#8A8A84]
                    "
                  >
                    Students
                  </th>

                  {/* LESSONS */}

                  <th
                    className="
                      px-2
                      py-4
                      text-center
                      font-sans
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.14em]
                      text-[#8A8A84]
                    "
                  >
                    Total Lessons
                  </th>

                  {/* PAYABLE */}

                  <th
                    className="
                      px-2
                      py-4
                      text-center
                      font-sans
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.14em]
                      text-[#8A8A84]
                    "
                  >
                    Payable
                  </th>

                  {/* ACTION */}

                  <th
                    className="
                      px-3
                      py-4
                      text-right
                      font-sans
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.14em]
                      text-[#8A8A84]
                      sm:px-4
                    "
                  >
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTeachers.map((teacher) => {
                  const status =
                    getStatusStyles(
                      teacher.status
                    );

                  const teacherName =
                    teacher.full_name ||
                    "Unnamed teacher";

                  return (
                    <tr
                      key={teacher.id}
                      className="
                        border-b
                        border-[#E7E3DD]
                        transition-colors
                        last:border-b-0
                        hover:bg-[#F2F5F0]
                      "
                    >
                      {/* ================================================= */}
                      {/* TEACHER                                           */}
                      {/* ================================================= */}

                      <td
                        className="
                          py-4
                          pl-3
                          pr-2
                          text-left
                          sm:py-[18px]
                          sm:pl-4
                        "
                      >
                        <Link
                          href={`/${locale}/admin/teachers/${teacher.id}`}
                          className="
                            font-serif
                            text-[17px]
                            leading-6
                            tracking-[-0.01em]
                            transition-colors
                            hover:text-[#6F8F72]
                          "
                        >
                          {teacherName}
                        </Link>

                        <p
                          className="
                            mt-1
                            font-sans
                            text-[10px]
                            uppercase
                            tracking-[0.12em]
                            text-[#9A9790]
                          "
                        >
                          Teacher #
                          {teacher.teacher_number ||
                            "—"}
                        </p>
                      </td>

                      {/* ================================================= */}
                      {/* STATUS                                             */}
                      {/* ================================================= */}

                      <td
                        className="
                          px-2
                          py-4
                          text-left
                          sm:py-[18px]
                        "
                      >
                        <span
                          className={`
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            px-2.5
                            py-1.5
                            font-sans
                            text-[8px]
                            font-medium
                            uppercase
                            tracking-[0.1em]
                            ${status.className}
                          `}
                        >
                          <span
                            className={`
                              h-[5px]
                              w-[5px]
                              shrink-0
                              rounded-full
                              ${status.ballClassName}
                            `}
                          />

                          {status.label}
                        </span>
                      </td>

                      {/* ================================================= */}
                      {/* STUDENTS                                           */}
                      {/* ================================================= */}

                      <td
                        className="
                          px-2
                          py-4
                          text-center
                          font-serif
                          text-[16px]
                          text-[#55544F]
                          sm:py-[18px]
                        "
                      >
                        {teacher.student_count}
                      </td>

                      {/* ================================================= */}
                      {/* TOTAL LESSONS                                      */}
                      {/* ================================================= */}

                      <td
                        className="
                          px-2
                          py-4
                          text-center
                          font-serif
                          text-[16px]
                          text-[#55544F]
                          sm:py-[18px]
                        "
                      >
                        {teacher.total_lessons.toLocaleString(
                          "en-US"
                        )}
                      </td>

                      {/* ================================================= */}
                      {/* PAYABLE                                            */}
                      {/* ================================================= */}

                      <td
                        className="
                          px-2
                          py-4
                          text-center
                          font-serif
                          text-[15px]
                          text-[#55544F]
                          sm:py-[18px]
                        "
                      >
                        {formatMoney(
                          teacher.payable
                        )}
                      </td>

                      {/* ================================================= */}
                      {/* ACTION                                             */}
                      {/* ================================================= */}

                      <td
                        className="
                          px-3
                          py-4
                          text-right
                          sm:px-4
                          sm:py-[18px]
                        "
                      >
                        <Link
                          href={`/${locale}/admin/teachers/${teacher.id}`}
                          className="
                            font-sans
                            text-[12px]
                            text-[#6F8F72]
                            transition-colors
                            hover:text-[#526B55]
                          "
                        >
                          Manage →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : searchQuery.trim() ? (
          /* =============================================================== */
          /* NO SEARCH RESULTS                                               */
          /* =============================================================== */

          <div
            className="
              border-y
              border-[#DCD8D2]
              py-20
              text-center
            "
          >
            <h3
              className="
                font-serif
                text-[27px]
                font-normal
              "
            >
              No teachers found
            </h3>

            <p
              className="
                mx-auto
                mt-3
                max-w-[420px]
                font-serif
                text-[16px]
                leading-7
                text-[#74716B]
              "
            >
              No teachers match “{searchQuery}”.
            </p>

            <button
              type="button"
              onClick={() =>
                setSearchQuery("")
              }
              className="
                mt-6
                font-sans
                text-[13px]
                text-[#6F8F72]
                underline
                underline-offset-4
                transition-colors
                hover:text-[#526B55]
              "
            >
              Clear search
            </button>
          </div>
        ) : (
          /* =============================================================== */
          /* EMPTY                                                            */
          /* =============================================================== */

          <div
            className="
              border-y
              border-[#DCD8D2]
              py-20
              text-center
            "
          >
            <h3
              className="
                font-serif
                text-[27px]
                font-normal
              "
            >
              No teachers
            </h3>

            <p
              className="
                mx-auto
                mt-3
                max-w-[420px]
                font-serif
                text-[16px]
                leading-7
                text-[#74716B]
              "
            >
              Teachers will appear here once
              they have been added to Hamkke.
            </p>

            <Link
              href={`/${locale}/admin/teachers/invite`}
              className="
                mt-6
                inline-block
                font-sans
                text-[13px]
                text-[#6F8F72]
                underline
                underline-offset-4
              "
            >
              Add your first teacher
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}