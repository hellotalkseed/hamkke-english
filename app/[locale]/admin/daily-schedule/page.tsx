"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Search,
  UserRoundCheck,
  UserRoundPlus,
  X,
} from "lucide-react";

type Teacher = {
  id: string;
  full_name: string | null;
  teacher_number: string | null;
};

type DailyClass = {
  lesson_id: string;
  enrollment_id: string;
  enrollment_student_id: string | null;
  lesson_number: number;
  duration: number;
  attendance_status: string;
  pht_date: string;
  pht_time: string;
  student: {
    id: string;
    student_number: string | null;
    full_name: string | null;
    preferred_name: string | null;
  };
  regular_teacher: Teacher | null;
  substitute_teacher: Teacher | null;
  regular_candidates: Teacher[];
  substitute_candidates: Teacher[];
};

type Filter = "all" | "needs_regular" | "regular" | "substituted";

function getPhtToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value || "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}

function addDays(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function formatDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function formatTime(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function studentName(item: DailyClass) {
  return (
    item.student.preferred_name ||
    item.student.full_name ||
    item.student.student_number ||
    "Student"
  );
}


function formatStudentNumber(value: string | null) {
  if (!value) return "No student number";

  const match = value.match(/^HK-\d{4}-(\d+)$/i);

  if (match) {
    return `HK-${match[1].padStart(4, "0")}`;
  }

  return value;
}

function getAttendanceStatusLabel(status: string | null | undefined) {
  switch (status) {
    case "completed":
      return "Completed";
    case "no_show":
      return "No-show";
    case "late_cancellation":
      return "Late cancellation";
    case "student_cancelled_rescheduled":
      return "Rescheduled";
    case "student_cancelled_credit":
      return "Credit";
    case "unexpected_circumstance":
      return "Unexpected circumstance";
    case "teacher_cancelled":
      return "Teacher cancelled";
    case "scheduled":
    default:
      return status
        ? status
            .replaceAll("_", " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase())
        : "Scheduled";
  }
}

function getAttendanceStatusStyles(status: string | null | undefined) {
  switch (status) {
    case "completed":
      return "bg-[#ECEBFA] text-[#5F5F8F]";
    case "no_show":
      return "bg-[#F3E8E4] text-[#8B6258]";
    case "late_cancellation":
      return "bg-[#F5EDE1] text-[#8B6E43]";
    case "student_cancelled_rescheduled":
      return "bg-[#E7EEF3] text-[#5E7180]";
    case "student_cancelled_credit":
      return "bg-[#EEF1E7] text-[#687554]";
    case "unexpected_circumstance":
      return "bg-[#F1ECE6] text-[#766B60]";
    case "teacher_cancelled":
      return "bg-[#F3E6E6] text-[#8A5A5A]";
    case "scheduled":
    default:
      return "bg-[#E8EFE4] text-[#5F7D62]";
  }
}

function isLessonResolved(status: string | null | undefined) {
  return status !== "scheduled";
}

export default function DailySchedulePage() {
  const params = useParams<{ locale?: string }>();
  const locale = typeof params?.locale === "string" ? params.locale : "en";

  const [date, setDate] = useState(getPhtToday);
  const [classes, setClasses] = useState<DailyClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [nameSearch, setNameSearch] = useState("");
  const [numberSearch, setNumberSearch] = useState("");

  const [selectedClass, setSelectedClass] = useState<DailyClass | null>(null);
  const [mode, setMode] = useState<"regular" | "substitute" | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadSchedule(targetDate = date) {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/daily-schedule?date=${encodeURIComponent(targetDate)}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load daily schedule.");
      }

      setClasses(Array.isArray(data.classes) ? data.classes : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load daily schedule."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSchedule(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const filteredClasses = useMemo(() => {
    const normalizedNameSearch = nameSearch.trim().toLowerCase();
    const normalizedNumberSearch = numberSearch.replace(/\D/g, "").slice(0, 4);

    return classes.filter((item) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "needs_regular" && !item.regular_teacher) ||
        (filter === "regular" &&
          !!item.regular_teacher &&
          !item.substitute_teacher) ||
        (filter === "substituted" && !!item.substitute_teacher);

      if (!matchesFilter) return false;

      if (normalizedNameSearch) {
        const preferredName = (item.student.preferred_name ?? "").toLowerCase();
        const fullName = (item.student.full_name ?? "").toLowerCase();

        if (
          !preferredName.includes(normalizedNameSearch) &&
          !fullName.includes(normalizedNameSearch)
        ) {
          return false;
        }
      }

      if (normalizedNumberSearch) {
        const studentNumberDigits = String(
          item.student.student_number ?? ""
        ).replace(/\D/g, "");

        if (!studentNumberDigits.endsWith(normalizedNumberSearch)) {
          return false;
        }
      }

      return true;
    });
  }, [classes, filter, nameSearch, numberSearch]);

  const counts = useMemo(
    () => ({
      all: classes.length,
      needs_regular: classes.filter((item) => !item.regular_teacher).length,
      regular: classes.filter(
        (item) => item.regular_teacher && !item.substitute_teacher
      ).length,
      substituted: classes.filter((item) => item.substitute_teacher).length,
    }),
    [classes]
  );

  function openFinder(item: DailyClass, nextMode: "regular" | "substitute") {
    setSelectedClass(item);
    setMode(nextMode);
    setSelectedTeacherId("");
    setActionError("");
    setSuccess("");
  }

  function closeFinder() {
    setSelectedClass(null);
    setMode(null);
    setSelectedTeacherId("");
    setActionError("");
  }

  async function assignTeacher() {
    if (!selectedClass || !mode || !selectedTeacherId) {
      setActionError("Please select a teacher.");
      return;
    }

    try {
      setSaving(true);
      setActionError("");
      setSuccess("");

      const response =
        mode === "regular"
          ? await fetch(
              `/api/admin/teachers/${selectedTeacherId}/assignments`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  enrollmentStudentId:
                    selectedClass.enrollment_student_id,
                  selectedSlot: {
                    date: selectedClass.pht_date,
                    time: selectedClass.pht_time,
                  },
                }),
              }
            )
          : await fetch(
              `/api/admin/teachers/${selectedTeacherId}/substitutes`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  lesson_id: selectedClass.lesson_id,
                  date: selectedClass.pht_date,
                  time: selectedClass.pht_time,
                }),
              }
            );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            (mode === "regular"
              ? "Unable to assign regular teacher."
              : "Unable to assign substitute teacher.")
        );
      }

      setSuccess(
        mode === "regular"
          ? "Regular teacher assigned successfully."
          : "Substitute teacher assigned successfully."
      );

      closeFinder();
      await loadSchedule(date);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to assign teacher."
      );
    } finally {
      setSaving(false);
    }
  }

  const candidates =
    mode === "regular"
      ? selectedClass?.regular_candidates || []
      : selectedClass?.substitute_candidates || [];

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
      <header className="w-full px-6 pt-7 sm:px-8 sm:pt-8 lg:px-10 xl:px-12">
        <div className="flex w-full items-start justify-between gap-8">
          <Link
            href={`/${locale}/admin`}
            className="shrink-0 font-sans text-[15px] text-[#5F655F] transition-colors duration-200 hover:text-[#6F8F72] sm:text-[16px]"
          >
            &larr; Administration
          </Link>

          <div className="shrink-0 text-right">
            <p className="font-sans text-[16px] font-semibold leading-none tracking-[0.18em] text-[#6F8F72]">
              HAMKKE │ 함께
            </p>
            <p className="mt-2 font-serif text-[13px] font-normal leading-none tracking-[0.02em] text-[#6F8F72]">
              From Small Talk to Big Ideas
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1180px] px-6 pb-20 pt-12 sm:px-8 sm:pt-16 lg:px-10">
        <div className="flex flex-col gap-7 border-b border-[#DCD8D2] pb-9 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-[#6F8F72]">
              <CalendarDays size={15} strokeWidth={1.6} />
              Daily operations
            </div>

            <h1 className="mt-4 font-serif text-[46px] font-normal leading-none tracking-[-0.035em] sm:text-[56px]">
              Daily Schedule
            </h1>

            <p className="mt-5 max-w-2xl font-serif text-[18px] leading-8 text-[#66645F]">
              See every class for the day and assign regular or substitute
              teachers without checking each teacher calendar.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setDate(getPhtToday())}
            className="self-start rounded-full border border-[#C9C5BE] px-5 py-2.5 font-sans text-[13px] font-medium text-[#5F655F] transition hover:border-[#6F8F72] hover:text-[#6F8F72] lg:self-auto"
          >
            Today
          </button>
        </div>

        <div className="mt-8 flex flex-col gap-5">
          <div
            className="
              relative
              left-1/2
              flex
              w-full
              -translate-x-1/2
              items-center
              justify-between
              border-y
              border-[#DCD8D2]
              bg-[#F6E7A8]
              px-4
              py-4
              sm:px-5
              lg:w-[calc(100%+8rem)]
              xl:w-[calc(100%+10rem)]
              2xl:w-[calc(100%+12rem)]
            "
          >
            <button
              type="button"
              onClick={() => setDate((current) => addDays(current, -1))}
              className="flex h-9 w-9 items-center justify-center text-[#77746E] transition hover:text-[#6F8F72]"
              aria-label="Previous day"
            >
              <ChevronLeft size={18} strokeWidth={1.5} />
            </button>

            <div className="text-center">
              <p className="font-serif text-[20px] font-normal leading-7 tracking-[-0.01em] text-[#292929]">
                {formatDate(date)}
              </p>
              <p className="mt-1 font-sans text-[9px] font-medium uppercase tracking-[0.16em] text-[#8A8A84]">
                Philippine Time
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDate((current) => addDays(current, 1))}
              className="flex h-9 w-9 items-center justify-center text-[#77746E] transition hover:text-[#6F8F72]"
              aria-label="Next day"
            >
              <ChevronRight size={18} strokeWidth={1.5} />
            </button>
          </div>

          <div
            className="
              relative
              left-1/2
              flex
              w-full
              -translate-x-1/2
              flex-col
              gap-4
              lg:w-[calc(100%+8rem)]
              lg:flex-row
              lg:items-end
              lg:justify-between
              xl:w-[calc(100%+10rem)]
              2xl:w-[calc(100%+12rem)]
            "
          >
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["all", "All Classes", counts.all],
                  ["needs_regular", "Needs Regular", counts.needs_regular],
                  ["regular", "Regular", counts.regular],
                  ["substituted", "Substituted", counts.substituted],
                ] as const
              ).map(([value, label, count]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded-full border px-4 py-2 font-sans text-[12px] font-medium transition ${
                    filter === value
                      ? "border-[#6F8F72] bg-[#E2EBDD] text-[#557259]"
                      : "border-[#D8D4CD] bg-white text-[#6B6B66] hover:border-[#A9BBAA]"
                  }`}
                >
                  {label} · {count}
                </button>
              ))}
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <label className="flex min-w-0 items-center gap-2 border-b border-[#D8D4CD] px-1 py-2 sm:w-[210px]">
                <Search size={16} className="shrink-0 text-[#8A8A84]" />
                <input
                  value={nameSearch}
                  onChange={(event) => setNameSearch(event.target.value)}
                  placeholder="Student name"
                  className="min-w-0 flex-1 bg-transparent font-sans text-[11px] tracking-[0.01em] text-[#55544F] outline-none placeholder:text-[#A09D97]"
                />
              </label>

              <label className="flex min-w-0 items-center border-b border-[#D8D4CD] px-1 py-2 sm:w-[145px]">
                <span className="shrink-0 font-sans text-[11px] font-medium tracking-[0.04em] text-[#6F8F72]">
                  HK-
                </span>
                <input
                  value={numberSearch}
                  onChange={(event) =>
                    setNumberSearch(
                      event.target.value.replace(/\D/g, "").slice(0, 4)
                    )
                  }
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="0001"
                  aria-label="Search by last four digits of student number"
                  className="min-w-0 flex-1 bg-transparent font-sans text-[11px] tracking-[0.04em] text-[#55544F] outline-none placeholder:text-[#A09D97]"
                />
              </label>
            </div>
          </div>
        </div>

        {success && (
          <div className="mt-6 rounded-xl border border-[#B8CDB8] bg-[#EDF4EA] px-4 py-3 font-sans text-[13px] text-[#557259]">
            {success}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-[#D8B8B8] bg-[#F8ECEC] px-4 py-3 font-sans text-[13px] text-[#8A5555]">
            {error}
          </div>
        )}

        <div className="mt-4">
          {loading ? (
            <div className="border-y border-[#DCD8D2] px-5 py-16 text-center font-serif text-[17px] text-[#77736D]">
              Loading the day&apos;s classes...
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="border-y border-[#DCD8D2] px-6 py-16 text-center">
              <CalendarDays
                size={27}
                strokeWidth={1.4}
                className="mx-auto text-[#9AA79A]"
              />
              <p className="mt-4 font-serif text-[20px] text-[#4E4D49]">
                No classes to show.
              </p>
              <p className="mt-2 font-sans text-[13px] text-[#8A8781]">
                Try another date or filter.
              </p>
            </div>
          ) : (
            <>
              <div
                className="
                  relative
                  left-1/2
                  hidden
                  w-full
                  -translate-x-1/2
                  border-y
                  border-[#DCD8D2]
                  lg:block
                  lg:w-[calc(100%+8rem)]
                  xl:w-[calc(100%+10rem)]
                  2xl:w-[calc(100%+12rem)]
                "
              >
                <table className="w-full table-fixed border-collapse">
                  <colgroup>
                    <col className="w-[12%]" />
                    <col className="w-[16%]" />
                    <col className="w-[13%]" />
                    <col className="w-[18%]" />
                    <col className="w-[17%]" />
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                  </colgroup>

                  <thead>
                    <tr className="border-b border-[#DCD8D2]">
                      {[
                        ["Time", "text-left"],
                        ["Student", "text-left"],
                        ["Lesson", "text-left"],
                        ["Regular Teacher", "text-left"],
                        ["Coverage", "text-left"],
                        ["Status", "text-left"],
                        ["Action", "text-right"],
                      ].map(([label, align]) => (
                        <th
                          key={label}
                          className={`px-3 py-4 font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-[#8A8A84] sm:px-4 ${align}`}
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredClasses.map((item) => {
                      const hasRegular = !!item.regular_teacher;
                      const hasSub = !!item.substitute_teacher;

                      return (
                        <tr
                          key={item.lesson_id}
                          className="border-b border-[#E7E3DD] transition-colors last:border-b-0 hover:bg-[#F2F5F0]"
                        >
                          <td className="px-3 py-4 text-left sm:px-4 sm:py-[18px]">
                            <p className="font-serif text-[17px] leading-6 tracking-[-0.01em] text-[#292929]">
                              {formatTime(item.pht_time)}
                            </p>
                            <p className="mt-1 font-sans text-[10px] uppercase tracking-[0.12em] text-[#9A9790]">
                              PHT
                            </p>
                          </td>

                          <td className="px-3 py-4 text-left sm:px-4 sm:py-[18px]">
                            <p className="font-serif text-[17px] leading-6 tracking-[-0.01em] text-[#292929]">
                              {studentName(item)}
                            </p>
                            <p className="mt-1 font-sans text-[10px] uppercase tracking-[0.12em] text-[#9A9790]">
                              {formatStudentNumber(item.student.student_number)}
                            </p>
                          </td>

                          <td className="px-3 py-4 text-left sm:px-4 sm:py-[18px]">
                            <p className="font-serif text-[14px] leading-6 text-[#55544F]">
                              Lesson {item.lesson_number}
                            </p>
                            <p className="mt-1 font-sans text-[9px] uppercase tracking-[0.1em] text-[#99958E]">
                              {item.duration} min
                            </p>
                          </td>

                          <td className="px-3 py-4 text-left sm:px-4 sm:py-[18px]">
                            <p
                              className={`font-serif text-[14px] leading-6 ${
                                hasRegular ? "text-[#55544F]" : "text-[#95645C]"
                              }`}
                            >
                              {item.regular_teacher?.full_name || "Not assigned"}
                            </p>
                            {item.regular_teacher?.teacher_number && (
                              <p className="mt-1 font-sans text-[9px] uppercase tracking-[0.1em] text-[#99958E]">
                                {item.regular_teacher.teacher_number}
                              </p>
                            )}
                          </td>

                          <td className="px-3 py-4 text-left sm:px-4 sm:py-[18px]">
                            {hasSub ? (
                              <div>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECEBFA] px-2.5 py-1.5 font-sans text-[8px] font-medium uppercase tracking-[0.1em] text-[#5F5F8F]">
                                  <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[#7777B3]" />
                                  Substitute
                                </span>
                                <p className="mt-1.5 font-serif text-[13px] leading-5 text-[#575276]">
                                  {item.substitute_teacher?.full_name}
                                </p>
                              </div>
                            ) : hasRegular ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E5EBDD] px-2.5 py-1.5 font-sans text-[8px] font-medium uppercase tracking-[0.1em] text-[#607963]">
                                <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[#6F8F72]" />
                                Regular
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1E3E0] px-2.5 py-1.5 font-sans text-[8px] font-medium uppercase tracking-[0.1em] text-[#95645C]">
                                <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[#A66A61]" />
                                Needs Teacher
                              </span>
                            )}
                          </td>

                          <td className="px-3 py-4 text-left sm:px-4 sm:py-[18px]">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 font-sans text-[8px] font-medium uppercase tracking-[0.1em] ${getAttendanceStatusStyles(
                                item.attendance_status
                              )}`}
                            >
                              <span
                                className={`h-[5px] w-[5px] shrink-0 rounded-full ${
                                  item.attendance_status === "completed"
                                    ? "bg-[#7777B3]"
                                    : item.attendance_status === "scheduled"
                                      ? "bg-[#6F8F72]"
                                      : "bg-current opacity-70"
                                }`}
                              />
                              {getAttendanceStatusLabel(item.attendance_status)}
                            </span>
                          </td>

                          <td className="px-3 py-4 text-right sm:px-4 sm:py-[18px]">
                            {isLessonResolved(item.attendance_status) ? (
                              <span className="font-serif text-[13px] text-[#99958E]">
                                —
                              </span>
                            ) : !hasRegular ? (
                              <button
                                type="button"
                                disabled={!item.enrollment_student_id}
                                onClick={() => openFinder(item, "regular")}
                                className="inline-flex items-center gap-1.5 rounded-full bg-[#6F8F72] px-3 py-2 font-sans text-[10px] font-medium text-white transition hover:bg-[#5F7F63] disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <UserRoundPlus size={13} />
                                Find Regular
                              </button>
                            ) : !hasSub ? (
                              <button
                                type="button"
                                onClick={() => openFinder(item, "substitute")}
                                className="inline-flex items-center gap-1.5 rounded-full border border-[#B9B3D5] bg-[#F0EEFA] px-3 py-2 font-sans text-[10px] font-medium text-[#66618A] transition hover:bg-[#E7E4F6]"
                              >
                                <UserRoundCheck size={13} />
                                Find Substitute
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECEBFA] px-2.5 py-1.5 font-sans text-[8px] font-medium uppercase tracking-[0.1em] text-[#5F5F8F]">
                                <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-[#7777B3]" />
                                Covered
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="border-y border-[#DCD8D2] lg:hidden">
                {filteredClasses.map((item, index) => {
                  const hasRegular = !!item.regular_teacher;
                  const hasSub = !!item.substitute_teacher;

                  return (
                    <article
                      key={item.lesson_id}
                      className={`${index > 0 ? "border-t border-[#E4E0DA]" : ""} px-1 py-6`}
                    >
                      <div className="flex items-start justify-between gap-5">
                        <div>
                          <p className="font-serif text-[22px] text-[#292929]">
                            {formatTime(item.pht_time)}
                          </p>
                          <p className="mt-1 font-sans text-[11px] uppercase tracking-[0.1em] text-[#9A9690]">
                            {item.duration} min · Lesson {item.lesson_number}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2 text-right">
                          {hasSub ? (
                            <span className="inline-flex rounded-full bg-[#ECEBFA] px-3 py-1.5 font-sans text-[10px] font-medium uppercase tracking-[0.1em] text-[#67628E]">
                              Substitute
                            </span>
                          ) : hasRegular ? (
                            <span className="inline-flex rounded-full bg-[#E8EFE4] px-3 py-1.5 font-sans text-[10px] font-medium uppercase tracking-[0.1em] text-[#5F7D62]">
                              Regular
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-[#F6E9E6] px-3 py-1.5 font-sans text-[10px] font-medium uppercase tracking-[0.1em] text-[#9A665C]">
                              Needs Teacher
                            </span>
                          )}

                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 font-sans text-[10px] font-medium uppercase tracking-[0.1em] ${getAttendanceStatusStyles(
                              item.attendance_status
                            )}`}
                          >
                            {getAttendanceStatusLabel(item.attendance_status)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5">
                        <p className="font-serif text-[20px] text-[#292929]">
                          {studentName(item)}
                        </p>
                        <p className="mt-1 font-sans text-[12px] text-[#9A9690]">
                          {formatStudentNumber(item.student.student_number)}
                        </p>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-5 border-t border-[#EEEAE4] pt-4">
                        <div>
                          <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#9A9690]">
                            Regular Teacher
                          </p>
                          <p className="mt-1 font-serif text-[15px] text-[#4E4D49]">
                            {item.regular_teacher?.full_name || "Not assigned"}
                          </p>
                        </div>

                        {hasSub && (
                          <div>
                            <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#9A9690]">
                              Substitute
                            </p>
                            <p className="mt-1 font-serif text-[15px] text-[#575276]">
                              {item.substitute_teacher?.full_name}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-5">
                        {isLessonResolved(item.attendance_status) ? (
                          <span className="font-serif text-[16px] text-[#AAA69F]">
                            —
                          </span>
                        ) : !hasRegular ? (
                          <button
                            type="button"
                            disabled={!item.enrollment_student_id}
                            onClick={() => openFinder(item, "regular")}
                            className="inline-flex items-center gap-2 rounded-full bg-[#6F8F72] px-4 py-2.5 font-sans text-[12px] font-medium text-white transition hover:bg-[#5F7F63] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <UserRoundPlus size={15} />
                            Find Regular Teacher
                          </button>
                        ) : !hasSub ? (
                          <button
                            type="button"
                            onClick={() => openFinder(item, "substitute")}
                            className="inline-flex items-center gap-2 rounded-full border border-[#B9B3D5] bg-[#F0EEFA] px-4 py-2.5 font-sans text-[12px] font-medium text-[#66618A] transition hover:bg-[#E7E4F6]"
                          >
                            <UserRoundCheck size={15} />
                            Find Substitute
                          </button>
                        ) : (
                          <span className="rounded-full border border-[#B9B3D5] bg-[#F0EEFA] px-4 py-2.5 font-sans text-[12px] font-medium text-[#66618A]">
                            Covered
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {selectedClass && mode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4 py-8">
          <div className="max-h-[86vh] w-full max-w-[620px] overflow-y-auto rounded-3xl bg-[#FAF8F5] p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-[#6F8F72]">
                  {mode === "regular"
                    ? "Regular assignment"
                    : "Substitute coverage"}
                </p>
                <h2 className="mt-3 font-serif text-[32px] leading-tight">
                  {studentName(selectedClass)}
                </h2>
                <p className="mt-2 font-sans text-[13px] text-[#77736D]">
                  {formatDate(selectedClass.pht_date)} ·{" "}
                  {formatTime(selectedClass.pht_time)} PHT · Lesson{" "}
                  {selectedClass.lesson_number}
                </p>
              </div>

              <button
                type="button"
                onClick={closeFinder}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#77736D] transition hover:bg-[#EEEAE4]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-7 border-t border-[#DDD9D2] pt-6">
              <p className="font-serif text-[17px] text-[#4E4D49]">
                {mode === "regular"
                  ? "Teachers available for the student's full recurring schedule"
                  : "Teachers available for this exact date and time"}
              </p>

              <div className="mt-4 space-y-2">
                {candidates.length === 0 ? (
                  <div className="rounded-2xl border border-[#DDD9D2] bg-white px-5 py-8 text-center">
                    <p className="font-serif text-[17px] text-[#66645F]">
                      No eligible teachers found.
                    </p>
                    <p className="mt-2 font-sans text-[12px] leading-5 text-[#96928C]">
                      {mode === "regular"
                        ? "No active teacher currently fits the complete recurring schedule without a conflict."
                        : "No active teacher is currently available for this exact class time."}
                    </p>
                  </div>
                ) : (
                  candidates.map((teacher) => (
                    <label
                      key={teacher.id}
                      className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 transition ${
                        selectedTeacherId === teacher.id
                          ? "border-[#6F8F72] bg-[#EDF4EA]"
                          : "border-[#DDD9D2] bg-white hover:border-[#B9C8B9]"
                      }`}
                    >
                      <div>
                        <p className="font-serif text-[17px] text-[#363532]">
                          {teacher.full_name || "Teacher"}
                        </p>
                        <p className="mt-1 font-sans text-[11px] text-[#96928C]">
                          {teacher.teacher_number || "Teacher"}
                        </p>
                      </div>

                      <input
                        type="radio"
                        name="teacher"
                        value={teacher.id}
                        checked={selectedTeacherId === teacher.id}
                        onChange={() => setSelectedTeacherId(teacher.id)}
                        className="h-4 w-4 accent-[#6F8F72]"
                      />
                    </label>
                  ))
                )}
              </div>
            </div>

            {actionError && (
              <div className="mt-5 rounded-xl border border-[#D8B8B8] bg-[#F8ECEC] px-4 py-3 font-sans text-[12px] text-[#8A5555]">
                {actionError}
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeFinder}
                className="rounded-full border border-[#CFCAC2] px-5 py-2.5 font-sans text-[13px] font-medium text-[#66645F]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={assignTeacher}
                disabled={!selectedTeacherId || saving}
                className="rounded-full bg-[#6F8F72] px-6 py-2.5 font-sans text-[13px] font-medium text-white transition hover:bg-[#5F7F63] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving
                  ? "Assigning..."
                  : mode === "regular"
                    ? "Assign Regular Teacher"
                    : "Assign Substitute"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
