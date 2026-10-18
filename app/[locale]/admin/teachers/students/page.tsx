"use client";

import PortalSignOut from "@/components/admin/PortalSignOut";

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
  { label: "Learner Stories", href: `/${locale}/admin/teachers/stories`, icon: FileText },
  { label: "Availability", href: `/${locale}/admin/teachers/availability`, icon: CalendarDays },
  { label: "My Profile", href: `/${locale}/admin/teachers/profile`, icon: UserRound },
  { label: "Teacher Agreement", href: `/${locale}/admin/teachers/agreement`, icon: FileText },
  { label: "Payroll", href: `/${locale}/admin/teachers/payroll`, icon: Wallet },
];

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
        <aside className="lg:sticky lg:top-0 lg:h-screen lg:self-start lg:overflow-y-auto hidden w-[250px] shrink-0 border-r border-[#E4DDD4] bg-[#F4F1EC] px-5 py-7 lg:flex lg:flex-col">
          <div className="block"><p className="font-sans text-[14px] font-semibold tracking-[0.16em] text-[#5F7F63]">HAMKKE │ 함께</p><p className="mt-1 font-serif text-[13px] text-[#6F8F72]">Teacher Portal</p></div>
          <nav className="mt-9 space-y-1.5">{nav(locale).map(({ label, href, icon: Icon }) => <Link key={label} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-sans text-[14px] transition ${label === "My Students" ? "bg-[#E2EBDD] font-medium text-[#49614D]" : "text-[#5F5C57] hover:bg-[#ECE8E2]"}`}><Icon size={16} strokeWidth={1.6} />{label}</Link>)}</nav>
          <div className="mt-auto border-t border-[#DED7CF] pt-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E2EBDD] font-serif text-[#55705A]">{firstName.charAt(0)}</div><div className="min-w-0"><p className="truncate font-sans text-[13px] font-medium">{teacherName}</p><p className="text-[11px] text-[#8A857E]">Teacher</p></div></div></div>
        <PortalSignOut locale={locale} /></aside>

        <section className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          <div className="mx-auto max-w-7xl">
            <p className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-[#6F8F72]">Teacher Portal</p>
            <h1 className="mt-3 font-serif text-[38px] font-normal tracking-[-0.03em] sm:text-[46px]">My Students</h1>
            <p className="mt-2 font-serif text-[17px] text-[#74716B]">Students currently assigned to you for regular classes.</p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A857E]">Assigned students</p><p className="mt-1 font-serif text-[22px]">{loading ? "Loading..." : `${students.length} ${students.length === 1 ? "student" : "students"}`}</p></div>
              <label className="flex w-full items-center gap-2 rounded-xl border border-[#DDD6CE] bg-white px-3.5 py-2.5 sm:w-[300px]"><Search size={16} className="text-[#8B857E]" /><input aria-label="Search students" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search students" className="w-full bg-transparent font-sans text-[13px] outline-none placeholder:text-[#AAA49C]" /></label>
            </div>

            {loading ? <div className="mt-6 rounded-[20px] border border-[#E7DDD1] bg-white p-10 text-center text-[13px] text-[#8B857E]">Loading your students...</div> : error ? <div className="mt-6 rounded-[20px] border border-[#E6D6D1] bg-[#FFFAF8] p-5 text-[13px] text-[#A45F58]">{error}</div> : filtered.length === 0 ? <div className="mt-6 rounded-[20px] border border-[#E7DDD1] bg-white p-10 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E2EBDD] text-[#55705A]"><Users size={20} /></div><h2 className="mt-4 font-serif text-[20px]">{query ? "No matching students" : "No assigned students yet"}</h2><p className="mt-1 text-[13px] text-[#8B857E]">{query ? "Try another name or student number." : "Students assigned to your regular teaching schedule will appear here."}</p></div> : (
              <div className="mt-6 border-y border-[#DCD8D2]">
                <div role="region" aria-label="Assigned students" tabIndex={0} className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-[#6F8F72]">
                  <table className="w-full min-w-[720px] border-collapse text-left font-sans text-[13px] font-normal leading-5">
                    <caption className="sr-only">Assigned students and lesson progress</caption>
                    <thead className="border-b border-[#DCD8D2] text-[11px] uppercase tracking-[0.1em] text-[#85877F]">
                      <tr>{["Student", "Student number", "Progress", "Status", "View teaching record"].map((heading) => <th key={heading} scope="col" className="px-5 py-4 font-normal">{heading}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E1DA]">
                      {filtered.map((item) => {
                        const total = item.progress.total || 0;
                        const used = Math.min(item.progress.used, total || item.progress.used);
                        const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
                        const remaining = Math.max(0, total - used);
                        const href = `/${locale}/admin/teachers/students/${item.enrollment_student_id}`;
                        const status = item.enrollment?.status || "";
                        return <tr key={item.enrollment_student_id} className="transition-colors hover:bg-[#F1F3EC] focus-within:bg-[#F1F3EC]">
                          <td className="px-5 py-5">
                            <Link href={href} className="rounded-sm font-normal text-[#354D3B] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6F8F72]">{displayName(item)}</Link>
                          </td>
                          <td className="whitespace-nowrap px-5 py-5 tabular-nums text-[#797D74]">{item.student?.student_number || "—"}</td>
                          <td className="w-[28%] min-w-[210px] px-5 py-5">
                            <div className="max-w-[240px]">
                              <div className="flex items-center justify-between gap-5"><span className="tabular-nums text-[#354D3B]">{used} / {total || "—"}</span><span className="text-[10px] tabular-nums text-[#85877F]">{total > 0 ? `${pct}%` : "—"}</span></div>
                              <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-[#E2E0D9]" role="progressbar" aria-label={`${displayName(item)} lesson progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-valuetext={`${used} of ${total || "unknown"} lessons used`}><div className="h-full rounded-full bg-[#81967E]" style={{ width: `${pct}%` }} /></div>
                              <p className="mt-2 text-[10px] text-[#85877F]">{total > 0 ? `${remaining} ${remaining === 1 ? "lesson" : "lessons"} remaining` : "Lesson total not set"}</p>
                            </div>
                          </td>
                          <td className="px-5 py-5">
                            <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.06em] ${status === "active" ? "bg-[#E2EBDD] text-[#607D60]" : "bg-[#ECE9E2] text-[#7A776D]"}`}><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />{status.replaceAll("_", " ") || "Not set"}</span>
                          </td>
                          <td className="px-5 py-5">
                            <Link href={href} aria-label={`View teaching record for ${displayName(item)}`} className="inline-flex min-h-10 items-center rounded-sm text-[12px] font-normal text-[#5F7F63] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6F8F72]">View teaching record →</Link>
                          </td>
                        </tr>;
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
