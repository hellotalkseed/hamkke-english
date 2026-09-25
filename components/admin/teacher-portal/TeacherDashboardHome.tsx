"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, CalendarDays, FileText, Home, LogOut, UserRound, Users, Wallet } from "lucide-react";
import TeacherLessonModal from "@/components/admin/teacher-portal/TeacherLessonModal";

type Lesson = {
  id: string;
  lesson_number: number;
  philippine_date: string;
  philippine_time: string | null;
  duration: number;
  attendance_status: string;
  student: { id: string; full_name: string | null; preferred_name: string | null } | null;
  enrollment: { package_name: string | null } | null;
  class_link?: string | null;
};

type Response = { teacher?: { full_name?: string | null }; lessons?: Lesson[] };

type Props = {
  locale: string;
  fullName: string | null;
  avatarUrl: string | null;
  signOutAction: () => Promise<void>;
};

function phtNow() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

function minutes(time: string | null) {
  if (!time) return Number.MAX_SAFE_INTEGER;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(time: string | null) {
  if (!time) return "Time to be confirmed";
  const [h, m] = time.split(":").map(Number);
  const d = new Date(2000, 0, 1, h, m);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function displayName(lesson: Lesson) {
  return lesson.student?.preferred_name || lesson.student?.full_name || "Student";
}

function statusClass(status: string) {
  switch (status) {
    case "completed": return "border-[#B7B7E2] bg-[#ECEBFA] text-[#5F5F8F]";
    case "no_show": return "border-[#D6AAA4] bg-[#F3D9D5] text-[#8A5C56]";
    case "late_cancellation": return "border-[#D7B78C] bg-[#F4E3CF] text-[#80664A]";
    case "student_cancelled_rescheduled":
    case "student_cancelled_credit":
    case "unexpected_circumstance":
    case "teacher_cancelled":
      return "border-[#CFD2CC] bg-[#ECEEEA] text-[#6F736C]";
    default: return "border-[#D9BE6A] bg-[#F3E8B8] text-[#665A31]";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "completed": return "Completed";
    case "scheduled": return "Upcoming";
    case "no_show": return "No-show";
    case "late_cancellation": return "Late cancellation";
    case "student_cancelled_rescheduled": return "Rescheduled";
    case "student_cancelled_credit": return "Credit";
    case "unexpected_circumstance": return "Unexpected circumstance";
    case "teacher_cancelled": return "Teacher cancelled";
    default: return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}

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

export default function TeacherDashboardHome({ locale, fullName, avatarUrl, signOutAction }: Props) {
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextClassLink, setNextClassLink] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    let requestInFlight = false;

    async function refreshLessons(initial = false) {
      if (requestInFlight) return;
      requestInFlight = true;

      try {
        const response = await fetch("/api/admin/teachers/lessons", { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load lessons");
        const value = await response.json();
        if (!alive) return;
        setData(value);
        setRefreshTick((value) => value + 1);
      } catch {
        if (alive && initial) setData({ lessons: [] });
      } finally {
        requestInFlight = false;
        if (alive && initial) setLoading(false);
      }
    }

    void refreshLessons(true);

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") void refreshLessons();
    }, 60_000);

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void refreshLessons();
    };

    const refreshOnFocus = () => {
      void refreshLessons();
    };

    document.addEventListener("visibilitychange", refreshWhenVisible);
    window.addEventListener("focus", refreshOnFocus);

    return () => {
      alive = false;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, []);

  const lessons = data?.lessons ?? [];
  const now = phtNow();
  const today = now.date;
  const todayLessons = useMemo(() => lessons.filter((l) => l.philippine_date === today).sort((a, b) => minutes(a.philippine_time) - minutes(b.philippine_time)), [lessons, today]);
  const next = lessons
    .filter((lesson) => {
      if (lesson.attendance_status !== "scheduled") return false;
      if (lesson.philippine_date > today) return true;
      if (lesson.philippine_date < today) return false;
      const start = minutes(lesson.philippine_time);
      return start + lesson.duration > now.minutes;
    })
    .sort((a, b) => a.philippine_date.localeCompare(b.philippine_date) || minutes(a.philippine_time) - minutes(b.philippine_time))[0];
  useEffect(() => {
    let alive = true;
    setNextClassLink(null);
    if (!next?.id) return () => { alive = false; };
    fetch(`/api/admin/teachers/lessons/${next.id}`, { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() : null)
      .then((result) => {
        if (!alive || !result) return;
        const link = result?.lesson?.class_link ?? result?.class_link ?? null;
        setNextClassLink(typeof link === "string" && link.trim() ? link.trim() : null);
      })
      .catch(() => { if (alive) setNextClassLink(null); });
    return () => { alive = false; };
  }, [next?.id, refreshTick]);

  const firstName = (fullName || data?.teacher?.full_name || "Teacher").trim().split(/\s+/)[0];

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <aside className="hidden w-[250px] shrink-0 border-r border-[#E4DDD4] bg-[#F4F1EC] px-5 py-7 lg:flex lg:flex-col">
          <Link href={`/${locale}`} className="block">
            <p className="font-sans text-[14px] font-semibold tracking-[0.16em] text-[#5F7F63]">HAMKKE │ 함께</p>
            <p className="mt-1 font-serif text-[13px] text-[#6F8F72]">Teacher Portal</p>
          </Link>
          <nav className="mt-9 space-y-1.5">
            {nav(locale).map(({ label, href, icon: Icon }) => (
              <Link key={label} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-sans text-[14px] transition ${label === "Home" ? "bg-[#E2EBDD] font-medium text-[#49614D]" : "text-[#5F5C57] hover:bg-[#ECE8E2]"}`}>
                <Icon size={16} strokeWidth={1.6} />{label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto border-t border-[#DED7CF] pt-5">
            <div className="flex items-center gap-3">
              {avatarUrl ? <img src={avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" /> : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E2EBDD] font-serif text-[#55705A]">{firstName.charAt(0)}</div>}
              <div className="min-w-0"><p className="truncate font-sans text-[13px] font-medium">{fullName || "Teacher"}</p><p className="text-[11px] text-[#8A857E]">Teacher</p></div>
            </div>
            <form action={signOutAction} className="mt-4"><button className="flex items-center gap-2 font-sans text-[13px] text-[#69655F] hover:text-[#55705A]"><LogOut size={15} />Log out</button></form>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          <div className="mb-7 flex items-center justify-between lg:hidden"><Link href={`/${locale}`} className="font-sans text-[13px] font-semibold tracking-[0.14em] text-[#5F7F63]">HAMKKE │ 함께</Link><form action={signOutAction}><button className="text-[13px] text-[#666]">Log out</button></form></div>
          <p className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-[#6F8F72]">Teacher Portal</p>
          <h1 className="mt-3 font-serif text-[38px] font-normal tracking-[-0.03em] sm:text-[46px]">{`Greetings, Teacher ${firstName}.`}</h1>
          <p className="mt-2 font-serif text-[17px] text-[#74716B]">Here&apos;s what&apos;s happening with your classes today.</p>

          <section className="mt-8 rounded-[20px] border border-[#E8D99B] bg-[#FFF4C7] p-5 sm:p-6">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8D7B42]">Your next class</p>
            {loading ? <p className="mt-4 text-[#777]">Loading your schedule...</p> : next ? <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="font-serif text-[30px]">{displayName(next)}</h2><p className="mt-1 font-sans text-[14px] text-[#5F5A51]">{next.philippine_date === today ? "Today" : next.philippine_date} · {formatTime(next.philippine_time)} · {next.duration} minutes</p><p className="mt-2 font-sans text-[12px] text-[#817765]">{next.enrollment?.package_name || `Lesson ${next.lesson_number}`}</p></div><div className="flex flex-wrap gap-2.5"><button type="button" onClick={() => setSelectedLessonId(next.id)} className="inline-flex w-fit rounded-full border border-[#CBBE83] bg-white/70 px-5 py-3 font-sans text-[13px] font-medium text-[#5F6F5D] hover:bg-white">View class →</button>{nextClassLink ? <a href={nextClassLink} target="_blank" rel="noreferrer" className="inline-flex w-fit rounded-full bg-[#6F8F72] px-5 py-3 font-sans text-[13px] font-medium text-white hover:bg-[#5F7F63]">Join Class →</a> : null}</div></div> : <p className="mt-4 font-serif text-[18px] text-[#716A5E]">No upcoming class is scheduled.</p>}
          </section>

          <div className="mt-5">
            <section className="rounded-[20px] border border-[#E7DDD1] bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><h2 className="font-serif text-[21px]">Today&apos;s Lessons</h2><Link href={`/${locale}/admin/teachers/lessons`} className="text-[12px] text-[#5F7F63]">View all →</Link></div><div className="mt-4 divide-y divide-[#EEE9E3]">{todayLessons.length ? todayLessons.slice(0, 6).map((lesson) => <button type="button" onClick={() => setSelectedLessonId(lesson.id)} key={lesson.id} className="grid w-full grid-cols-[72px_1fr_auto] items-center gap-3 py-2.5 text-left transition hover:bg-[#FBFAF8]"><span className="text-[12px] font-medium text-[#55705A]">{formatTime(lesson.philippine_time)}</span><span><strong className="block text-[13px] font-medium">{displayName(lesson)}</strong><span className="text-[11px] text-[#8B857E]">Lesson {lesson.lesson_number} · {lesson.duration} min</span></span><span className={`rounded-full border px-2.5 py-1 text-[10px] ${statusClass(lesson.attendance_status)}`}>{statusLabel(lesson.attendance_status)}</span></button>) : <p className="py-6 text-[13px] text-[#8B857E]">No lessons scheduled today.</p>}</div></section>
          </div>

        </section>
      </div>
      <TeacherLessonModal locale={locale} lessonId={selectedLessonId} onClose={() => setSelectedLessonId(null)} />
    </main>
  );
}
