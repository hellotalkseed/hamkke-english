"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { BookOpen, CalendarDays, FileText, Home, Search, UserRound, Users, Wallet } from "lucide-react";

type StudentItem = {
  enrollment_student_id: string;
  student: { id: string; student_number: string | null; full_name: string | null; preferred_name: string | null; timezone: string | null } | null;
  enrollment: { id: string; package_name: string | null; status: string; number_of_lessons: number | null; lesson_duration: number | null } | null;
  progress: { used: number; total: number };
  next_lesson: { id: string; lesson_number: number; philippine_date: string; philippine_time: string | null; duration: number } | null;
  regular_schedule: { day_of_week: number; schedule_time: string }[];
};

type ResponseData = { teacher?: { id: string; full_name: string | null }; students?: StudentItem[]; error?: string };
type Props = { params: Promise<{ locale: string }> };

const nav = (locale: string) => [
  { label: "Home", href: `/${locale}/admin/teachers`, icon: Home },
  { label: "My Lessons", href: `/${locale}/admin/teachers/lessons`, icon: BookOpen },
  { label: "My Students", href: `/${locale}/admin/teachers/students`, icon: Users },
  { label: "Progress Reports", href: `/${locale}/admin/teachers/progress-reports`, icon: FileText },
  { label: "Availability", href: `/${locale}/admin/teachers/availability`, icon: CalendarDays },
  { label: "My Profile", href: `/${locale}/admin/teachers/profile`, icon: UserRound },
  { label: "Teacher Agreement", href: `/${locale}/admin/teachers/agreement`, icon: FileText },
  { label: "Payroll", href: `/${locale}/admin/teachers/payroll`, icon: Wallet },
];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function formatTime(value: string | null) {
  if (!value) return "Time to be confirmed";
  const [h, m] = value.split(":").map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
function formatDate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function displayName(item: StudentItem) { return item.student?.preferred_name || item.student?.full_name || "Student"; }

export default function TeacherStudentsPage({ params }: Props) {
  const { locale } = use(params);
  const [data, setData] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/teachers/students", { cache: "no-store" })
      .then(async (response) => {
        const value = await response.json();
        if (!response.ok) throw new Error(value.error || "Unable to load students.");
        return value;
      })
      .then((value) => { if (alive) setData(value); })
      .catch((err) => { if (alive) setError(err instanceof Error ? err.message : "Unable to load students."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const students = data?.students ?? [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter((item) => [item.student?.preferred_name, item.student?.full_name, item.student?.student_number, item.enrollment?.package_name].some((v) => v?.toLowerCase().includes(q)));
  }, [students, query]);

  const teacherName = data?.teacher?.full_name || "Teacher";
  const firstName = teacherName.trim().split(/\s+/)[0] || "T";

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <aside className="hidden w-[250px] shrink-0 border-r border-[#E4DDD4] bg-[#F4F1EC] px-5 py-7 lg:flex lg:flex-col">
          <Link href={`/${locale}`} className="block"><p className="font-sans text-[14px] font-semibold tracking-[0.16em] text-[#5F7F63]">HAMKKE │ 함께</p><p className="mt-1 font-serif text-[13px] text-[#6F8F72]">Teacher Portal</p></Link>
          <nav className="mt-9 space-y-1.5">{nav(locale).map(({ label, href, icon: Icon }) => <Link key={label} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-sans text-[14px] transition ${label === "My Students" ? "bg-[#E2EBDD] font-medium text-[#49614D]" : "text-[#5F5C57] hover:bg-[#ECE8E2]"}`}><Icon size={16} strokeWidth={1.6} />{label}</Link>)}</nav>
          <div className="mt-auto border-t border-[#DED7CF] pt-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E2EBDD] font-serif text-[#55705A]">{firstName.charAt(0)}</div><div className="min-w-0"><p className="truncate font-sans text-[13px] font-medium">{teacherName}</p><p className="text-[11px] text-[#8A857E]">Teacher</p></div></div></div>
        </aside>

        <section className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          <div className="mx-auto max-w-7xl">
            <p className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-[#6F8F72]">Teacher Portal</p>
            <h1 className="mt-3 font-serif text-[38px] font-normal tracking-[-0.03em] sm:text-[46px]">My Students</h1>
            <p className="mt-2 font-serif text-[17px] text-[#74716B]">Students currently assigned to you for regular classes.</p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A857E]">Assigned students</p><p className="mt-1 font-serif text-[22px]">{loading ? "Loading..." : `${students.length} ${students.length === 1 ? "student" : "students"}`}</p></div>
              <label className="flex w-full items-center gap-2 rounded-xl border border-[#DDD6CE] bg-white px-3.5 py-2.5 sm:w-[300px]"><Search size={16} className="text-[#8B857E]" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search students" className="w-full bg-transparent font-sans text-[13px] outline-none placeholder:text-[#AAA49C]" /></label>
            </div>

            {loading ? <div className="mt-6 rounded-[20px] border border-[#E7DDD1] bg-white p-10 text-center text-[13px] text-[#8B857E]">Loading your students...</div> : error ? <div className="mt-6 rounded-[20px] border border-[#E6D6D1] bg-[#FFFAF8] p-5 text-[13px] text-[#A45F58]">{error}</div> : filtered.length === 0 ? <div className="mt-6 rounded-[20px] border border-[#E7DDD1] bg-white p-10 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E2EBDD] text-[#55705A]"><Users size={20} /></div><h2 className="mt-4 font-serif text-[20px]">{query ? "No matching students" : "No assigned students yet"}</h2><p className="mt-1 text-[13px] text-[#8B857E]">{query ? "Try another name or student number." : "Students assigned to your regular teaching schedule will appear here."}</p></div> : (
              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                {filtered.map((item) => {
                  const total = item.progress.total || 0;
                  const used = Math.min(item.progress.used, total || item.progress.used);
                  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
                  return <article key={item.enrollment_student_id} className="rounded-[20px] border border-[#E7DDD1] bg-white p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E2EBDD] font-serif text-[18px] text-[#55705A]">{displayName(item).charAt(0).toUpperCase()}</div><div><h2 className="font-serif text-[24px] leading-tight">{displayName(item)}</h2><p className="mt-1 font-sans text-[11px] text-[#8B857E]">{item.student?.student_number || "Student number to be confirmed"}</p></div></div></div><span className="rounded-full border border-[#C9D8C8] bg-[#EEF4EB] px-2.5 py-1 font-sans text-[10px] font-medium text-[#55705A]">Active</span></div>
                    <div className="mt-5 grid gap-4 border-t border-[#EEE9E3] pt-5 sm:grid-cols-2">
                      <div><p className="font-sans text-[9px] font-semibold uppercase tracking-[0.14em] text-[#9A948C]">Current package</p><p className="mt-1.5 font-sans text-[13px] font-medium text-[#4E4A45]">{item.enrollment?.package_name || "Package to be confirmed"}</p><p className="mt-1 text-[11px] text-[#8B857E]">{item.enrollment?.lesson_duration ? `${item.enrollment.lesson_duration} minutes per lesson` : ""}</p></div>
                      <div><p className="font-sans text-[9px] font-semibold uppercase tracking-[0.14em] text-[#9A948C]">Next lesson</p>{item.next_lesson ? <><p className="mt-1.5 font-sans text-[13px] font-medium text-[#4E4A45]">{formatDate(item.next_lesson.philippine_date)} · {formatTime(item.next_lesson.philippine_time)}</p><p className="mt-1 text-[11px] text-[#8B857E]">Lesson {item.next_lesson.lesson_number} · Philippine Time</p></> : <p className="mt-1.5 text-[12px] text-[#8B857E]">No upcoming lesson scheduled.</p>}</div>
                    </div>
                    <div className="mt-5"><div className="flex items-center justify-between"><p className="font-sans text-[9px] font-semibold uppercase tracking-[0.14em] text-[#9A948C]">Lesson progress</p><p className="font-sans text-[11px] font-medium text-[#657064]">{used} / {total || "-"} used</p></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#EEEAE4]"><div className="h-full rounded-full bg-[#8FAA91]" style={{ width: `${pct}%` }} /></div></div>
                    {item.regular_schedule.length > 0 && <div className="mt-5 border-t border-[#EEE9E3] pt-4"><p className="font-sans text-[9px] font-semibold uppercase tracking-[0.14em] text-[#9A948C]">Regular schedule</p><div className="mt-2 flex flex-wrap gap-2">{item.regular_schedule.map((s, index) => <span key={`${s.day_of_week}-${s.schedule_time}-${index}`} className="rounded-full bg-[#F4F1EC] px-3 py-1.5 font-sans text-[11px] text-[#625E58]">{dayNames[s.day_of_week] || "Day"} · {formatTime(s.schedule_time)}</span>)}</div><p className="mt-2 text-[10px] text-[#9A948C]">Student-local recurring schedule</p></div>}
                    <div className="mt-5 flex justify-end border-t border-[#EEE9E3] pt-4">
                      <Link href={`/${locale}/admin/teachers/students/${item.enrollment_student_id}`} className="font-sans text-[12px] font-medium text-[#5F7F63] transition hover:text-[#405844]">View Teaching Record →</Link>
                    </div>
                  </article>;
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
