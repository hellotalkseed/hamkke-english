"use client";

import Link from "next/link";
import ProgressReportDirectModal from "@/components/admin/teacher-portal/ProgressReportDirectModal";
import { use, useEffect, useMemo, useState } from "react";
import { BookOpen, CalendarDays, FileText, Home, UserRound, Users, Wallet } from "lucide-react";

type Item = {
  enrollment_student_id: string;
  student_number: string | null;
  student_name: string;
  enrollment_number: string;
  package_name: string;
  enrollment_status: string;
  report_status: "draft" | "completed" | null;
  updated_at: string | null;
  completed_at: string | null;
};
type Response = { teacher?: { full_name?: string | null }; items?: Item[]; error?: string };
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

function title(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()); }
function formatDate(value: string | null) { if (!value) return "-"; return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
function action(item: Item) {
  if (item.report_status === "completed") return "View Report →";
  if (item.enrollment_status === "active") return item.report_status === "draft" ? "Continue Draft →" : "Write Draft →";
  if (item.enrollment_status === "completed") return item.report_status === "draft" ? "Continue Report →" : "Write Report →";
  return "View Teaching Record →";
}
function reportLabel(item: Item) {
  if (item.report_status === "completed") return "Completed";
  if (item.report_status === "draft") return "Draft";
  return "Not started";
}
function reportPill(item: Item) {
  if (item.report_status === "completed") return "border-[#C9D8C8] bg-[#EEF4EB] text-[#55705A]";
  if (item.report_status === "draft") return "border-[#D8C89B] bg-[#F7F0D8] text-[#756536]";
  return "border-[#DDD7D0] bg-[#F7F5F2] text-[#858079]";
}

export default function ProgressReportsPage({ params }: Props) {
  const { locale } = use(params);
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "draft" | "ready" | "completed">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Item | null>(null);

  async function refresh() {
    try {
      const r = await fetch("/api/admin/teachers/progress-reports", { cache: "no-store" });
      const v = await r.json();
      if (!r.ok) throw new Error(v.error || "Unable to load progress reports.");
      setData(v);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load progress reports.");
    }
  }

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/teachers/progress-reports", { cache: "no-store" })
      .then(async (r) => { const v = await r.json(); if (!r.ok) throw new Error(v.error || "Unable to load progress reports."); return v; })
      .then((v) => { if (alive) setData(v); })
      .catch((e) => { if (alive) setError(e instanceof Error ? e.message : "Unable to load progress reports."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const items = data?.items ?? [];
  const counts = useMemo(() => ({
    drafts: items.filter((i) => i.report_status === "draft").length,
    ready: items.filter((i) => i.enrollment_status === "completed" && i.report_status !== "completed").length,
    completed: items.filter((i) => i.report_status === "completed").length,
  }), [items]);
  const shown = useMemo(() => items.filter((i) => {
    const q = query.trim().toLowerCase();
    if (q && !`${i.student_name} ${i.student_number ?? ""} ${i.enrollment_number}`.toLowerCase().includes(q)) return false;
    if (filter === "draft") return i.report_status === "draft";
    if (filter === "ready") return i.enrollment_status === "completed" && i.report_status !== "completed";
    if (filter === "completed") return i.report_status === "completed";
    return true;
  }), [items, filter, query]);

  const teacherName = data?.teacher?.full_name || "Teacher";
  const firstName = teacherName.trim().split(/\s+/)[0] || "T";

  return <main className="min-h-screen bg-[#FAF8F5] text-[#292929]"><div className="mx-auto flex min-h-screen max-w-[1500px]">
    <aside className="hidden w-[250px] shrink-0 border-r border-[#E4DDD4] bg-[#F4F1EC] px-5 py-7 lg:sticky lg:top-0 lg:flex lg:h-screen lg:self-start lg:flex-col lg:overflow-y-auto">
      <Link href={`/${locale}`}><p className="font-sans text-[14px] font-semibold tracking-[0.16em] text-[#5F7F63]">HAMKKE │ 함께</p><p className="mt-1 font-serif text-[13px] text-[#6F8F72]">Teacher Portal</p></Link>
      <nav className="mt-9 space-y-1.5">{nav(locale).map(({ label, href, icon: Icon }) => <Link key={label} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition ${label === "Progress Reports" ? "bg-[#E2EBDD] font-medium text-[#49614D]" : "text-[#5F5C57] hover:bg-[#ECE8E2]"}`}><Icon size={16} strokeWidth={1.6}/>{label}</Link>)}</nav>
      <div className="mt-auto border-t border-[#DED7CF] pt-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E2EBDD] font-serif text-[#55705A]">{firstName.charAt(0).toUpperCase()}</div><div><p className="text-[13px] font-medium">{teacherName}</p><p className="text-[11px] text-[#8A857E]">Teacher</p></div></div></div>
    </aside>

    <section className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10 lg:py-9"><div className="mx-auto max-w-7xl">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6F8F72]">Teacher Portal</p>
      <h1 className="mt-2 font-serif text-[38px] tracking-[-0.03em] sm:text-[46px]">Progress Reports</h1>
      <p className="mt-2 text-[13px] text-[#817B74]">Write, complete, and review your students' progress reports.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <button onClick={() => setFilter(filter === "draft" ? "all" : "draft")} className={`rounded-[18px] border p-5 text-left transition ${filter === "draft" ? "border-[#AFC3AF] bg-[#F2F6EF]" : "border-[#E7DDD1] bg-white hover:border-[#D4CBBF]"}`}><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#918B84]">Drafts</p><p className="mt-2 font-serif text-[30px] text-[#3F4D40]">{counts.drafts}</p><p className="mt-1 text-[11px] text-[#8B857E]">Saved and still editable</p></button>
        <button onClick={() => setFilter(filter === "ready" ? "all" : "ready")} className={`rounded-[18px] border p-5 text-left transition ${filter === "ready" ? "border-[#AFC3AF] bg-[#F2F6EF]" : "border-[#E7DDD1] bg-white hover:border-[#D4CBBF]"}`}><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#918B84]">Ready to Complete</p><p className="mt-2 font-serif text-[30px] text-[#3F4D40]">{counts.ready}</p><p className="mt-1 text-[11px] text-[#8B857E]">Completed enrollments awaiting a report</p></button>
        <button onClick={() => setFilter(filter === "completed" ? "all" : "completed")} className={`rounded-[18px] border p-5 text-left transition ${filter === "completed" ? "border-[#AFC3AF] bg-[#F2F6EF]" : "border-[#E7DDD1] bg-white hover:border-[#D4CBBF]"}`}><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#918B84]">Completed</p><p className="mt-2 font-serif text-[30px] text-[#3F4D40]">{counts.completed}</p><p className="mt-1 text-[11px] text-[#8B857E]">Visible in the Student Portal</p></button>
      </div>

      <section className="mt-6 overflow-hidden rounded-[20px] border border-[#E7DDD1] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#E7DDD1] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-serif text-[21px]">All reports</h2><p className="mt-1 text-[11px] text-[#8B857E]">One report per student, per enrollment.</p></div><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search student or enrollment" className="w-full rounded-xl border border-[#DDD6CE] bg-[#FCFBF9] px-3.5 py-2.5 text-[12px] outline-none focus:border-[#AFC3AF] sm:w-[260px]"/></div>
        {loading ? <div className="p-10 text-center text-[13px] text-[#8B857E]">Loading progress reports...</div> : error ? <div className="p-6 text-[13px] text-[#A45F58]">{error}</div> : shown.length === 0 ? <div className="p-10 text-center"><p className="font-serif text-[20px] text-[#5C5852]">No reports found</p><p className="mt-2 text-[12px] text-[#918B84]">Reports will appear here for students assigned to you.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead className="bg-[#F8F6F2]"><tr className="border-b border-[#E7DDD1]">{["Student", "Enrollment", "Enrollment Status", "Report Status", "Last Updated", "Action"].map((h) => <th key={h} className={`px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8E8881] ${h === "Action" ? "text-right" : ""}`}>{h}</th>)}</tr></thead><tbody className="divide-y divide-[#EEE9E3]">{shown.map((item) => <tr key={item.enrollment_student_id} className="transition hover:bg-[#FCFBF9]"><td className="px-5 py-4"><p className="text-[13px] font-medium text-[#393733]">{item.student_name}</p><p className="mt-1 text-[10px] text-[#9A948C]">{item.student_number || "Student"}</p></td><td className="px-5 py-4"><p className="text-[12px] font-medium text-[#5A5650]">{item.enrollment_number}</p><p className="mt-1 max-w-[210px] truncate text-[10px] text-[#9A948C]">{item.package_name}</p></td><td className="whitespace-nowrap px-5 py-4 text-[12px] text-[#77716A]">{title(item.enrollment_status)}</td><td className="whitespace-nowrap px-5 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium ${reportPill(item)}`}>{reportLabel(item)}</span></td><td className="whitespace-nowrap px-5 py-4 text-[11px] text-[#8B857E]">{formatDate(item.completed_at || item.updated_at)}</td><td className="whitespace-nowrap px-5 py-4 text-right"><button type="button" onClick={() => setSelected(item)} className="text-[12px] font-semibold text-[#5F7F63] hover:text-[#466149]">{action(item)}</button></td></tr>)}</tbody></table></div>}
      </section>
      <p className="mt-4 text-[11px] leading-5 text-[#918B84]">Draft reports remain private. Only completed reports are visible to students.</p>
    </div></section>
    {selected && <ProgressReportDirectModal item={selected} teacherName={teacherName} onClose={() => setSelected(null)} onChanged={refresh} />}
  </div></main>;
}
