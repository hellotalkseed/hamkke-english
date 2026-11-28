"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BellRing, CalendarClock, ChevronUp, ClipboardList, Clock3, MessageCircle, Minus, UserPlus, Volume2, VolumeX } from "lucide-react";

type Kind = "assignment" | "reminder" | "starting" | "schedule" | "report";
type Payload = {
  lesson_id?: string; student_id?: string; enrollment_id?: string; enrollment_student_id?: string;
  starts_at?: string; teacher_name?: string; effective_on?: string; timezone?: string;
  slots_pht?: string[]; first_start?: string;
  changes?: { old_date: string; old_time: string; date: string; time: string; old_starts_at?: string; starts_at?: string }[];
};
type Item = { id: string; kind: Kind; title: string; message: string; payload: Payload; created_at: string; read_at: string | null };
type Feed = { items: Item[]; unread: number; checked_at: string };
const appearance = {
  assignment: { icon: UserPlus, style: "border-l-[#6F9DC5] bg-[#F0F6FC] text-[#35658E]" },
  reminder: { icon: Clock3, style: "border-l-[#D3B660] bg-[#FFF9E8] text-[#826318]" },
  starting: { icon: BellRing, style: "border-l-[#C77970] bg-[#FFF1EF] text-[#9C4941]" },
  schedule: { icon: CalendarClock, style: "border-l-[#A28BBE] bg-[#F6F1FB] text-[#765491]" },
  report: { icon: ClipboardList, style: "border-l-[#88A985] bg-[#F0F6EC] text-[#4F744A]" },
};
function storageGet(key: string) { try { return localStorage.getItem(key); } catch { return null; } }
function storageSet(key: string, value: string) { try { localStorage.setItem(key, value); } catch { /* Private browsing may block persistence. */ } }
function timeLabel(value: string) {
  return new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}
function linkFor(item: Item, locale: string, role: "owner" | "teacher") {
  const p = item.payload;
  if (role === "teacher") {
    if (item.kind === "report") return p.enrollment_student_id ? `/${locale}/admin/teachers/students/${p.enrollment_student_id}?tab=reports` : `/${locale}/admin/teachers/progress-reports`;
    if (p.lesson_id) return `/${locale}/admin/teachers/lessons/${p.lesson_id}`;
    return p.enrollment_student_id ? `/${locale}/admin/teachers/students/${p.enrollment_student_id}` : `/${locale}/admin/teachers/students`;
  }
  if (item.kind === "report" && p.student_id && p.enrollment_id) return `/${locale}/admin/students/${p.student_id}?enrollmentId=${p.enrollment_id}`;
  if ((item.kind === "schedule" || p.lesson_id) && p.student_id && p.enrollment_id) return `/${locale}/admin/students/${p.student_id}/enrollments/${p.enrollment_id}/lessons`;
  return p.student_id ? `/${locale}/admin/students/${p.student_id}` : `/${locale}/admin/daily-schedule`;
}

export default function UpdatesDock({ userId, role, locale }: { userId: string; role: "owner" | "teacher"; locale: string }) {
  const key = `hamkke-updates:${userId}`;
  const [expanded, setExpanded] = useState(false);
  const [sound, setSound] = useState(false);
  const [feed, setFeed] = useState<Feed>({ items: [], unread: 0, checked_at: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [marking, setMarking] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const soundRef = useRef(false);
  const seen = useRef(new Set<string>());
  const refresh = useRef<() => void>(() => {});
  const started = useRef(0);

  async function play() {
    if (!soundRef.current) return;
    try {
      const ctx = audio.current ?? new AudioContext(); audio.current = ctx;
      if (ctx.state === "suspended") await ctx.resume();
      if (ctx.state !== "running") return;
      const oscillator = ctx.createOscillator(), gain = ctx.createGain(), now = ctx.currentTime;
      oscillator.type = "sine"; oscillator.frequency.setValueAtTime(740, now);
      gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.035, now + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      oscillator.connect(gain); gain.connect(ctx.destination); oscillator.start(now); oscillator.stop(now + 0.46);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    } catch { setError("Sound could not start. Turn sound off and on to retry."); }
  }

  useEffect(() => {
    started.current = Date.now();
    setExpanded(storageGet(`${key}:expanded`) === "yes");
    // Explicitly enable audio once each visit to respect browser autoplay controls.
    setReady(true);
    let stopped = false, busy = false, forbidden = false;
    const controller = new AbortController();
    async function poll() {
      if (stopped || busy || forbidden) return;
      busy = true;
      try {
        const response = await fetch("/api/admin/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "feed" }), cache: "no-store", signal: controller.signal });
        if (!response.ok) { forbidden = response.status === 401 || response.status === 403; throw new Error(forbidden ? "Sign in again to receive updates." : "Updates unavailable. Retrying shortly."); }
        const next = await response.json() as Feed;
        if (stopped) return;
        setFeed(next); setError("");
        const fresh = next.items.filter(item => !item.read_at && !seen.current.has(item.id) && Date.parse(item.created_at) >= started.current &&
          (!item.payload.starts_at || Date.parse(next.checked_at) - Date.parse(item.payload.starts_at) < 120000));
        next.items.forEach(item => seen.current.add(item.id));
        if (fresh.length) {
          setAnnouncement(`${fresh.length} new update${fresh.length === 1 ? "" : "s"}. ${fresh[0].title}`);
          const ring = async () => {
            if (stopped || !soundRef.current) return;
            const latest = storageGet(`${key}:chime`);
            if (latest === fresh[0].id) return;
            storageSet(`${key}:chime`, fresh[0].id);
            await play();
          };
          // Web Locks plus shared storage prevent multiple open tabs chiming together.
          if (navigator.locks) void navigator.locks.request(`${key}:sound`, ring);
          else if (document.visibilityState === "visible") void ring();
        }
      } catch (e) { if (!stopped) setError(e instanceof Error ? e.message : "Unable to load updates."); }
      finally { busy = false; if (!stopped) setLoading(false); }
    }
    refresh.current = () => { void poll(); };
    void poll();
    const interval = window.setInterval(() => { void poll(); }, 15000);
    const wake = () => { if (document.visibilityState === "visible") void poll(); };
    document.addEventListener("visibilitychange", wake); window.addEventListener("online", wake);
    return () => { stopped = true; controller.abort(); clearInterval(interval); document.removeEventListener("visibilitychange", wake); window.removeEventListener("online", wake); refresh.current = () => {}; void audio.current?.close(); audio.current = null; };
    // The polling lifetime is tied to this authenticated account, not UI state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  async function mark(ids?: string[]) {
    setMarking(true);
    try {
      const response = await fetch("/api/admin/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "read", ...(ids ? { ids } : { before: feed.checked_at }) }) });
      if (!response.ok) throw new Error("Could not mark updates as read. Please retry.");
      refresh.current();
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save read status."); }
    finally { setMarking(false); }
  }
  if (!ready) return null;
  return <section
    aria-label="Staff updates"
    className={`fixed right-4 z-[60] text-[#34483A] sm:right-5 print:hidden ${
      expanded
        ? "w-[min(350px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#6F8F72] bg-[#FFFEFA] shadow-lg"
        : "w-14"
    }`}
    style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
  >
    <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
    <button
      type="button"
      onClick={() => {
        const value = !expanded;
        setExpanded(value);
        storageSet(`${key}:expanded`, value ? "yes" : "no");
      }}
      aria-expanded={expanded}
      aria-controls="hamkke-updates-body"
      aria-label={`${expanded ? "Minimize" : "Open"} notifications, ${feed.unread} unread${error ? ", offline" : ""}`}
      title={expanded ? "Minimize notifications" : "Open notifications"}
      className={`relative flex items-center bg-[#567660] text-[#FFFEFA] transition-colors hover:bg-[#496853] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#365844] ${
        expanded
          ? "w-full gap-2 px-4 py-3 text-left text-sm"
          : "h-14 w-14 justify-center rounded-full shadow-lg"
      }`}
    >
      <BellRing size={expanded ? 18 : 24} aria-hidden="true"/>
      {expanded && <span className="font-medium">Notifications</span>}
      {feed.unread > 0 && (
        <span
          aria-hidden="true"
          className={`flex h-6 min-w-6 items-center justify-center rounded-full bg-[#C43D3D] px-1.5 text-xs font-bold leading-none text-white ${
            expanded ? "" : "absolute -right-1 -top-1 ring-2 ring-[#FFFEFA]"
          }`}
        >
          {feed.unread > 99 ? "99+" : feed.unread}
        </span>
      )}
      {expanded && error && <span className="text-xs">Offline</span>}
      {expanded && <Minus size={18} className="ml-auto" aria-hidden="true"/>}
    </button>
    {expanded && <div id="hamkke-updates-body">
      {error && <div role="status" className="px-4 py-2 text-xs text-[#9C4941]">{error} <button type="button" className="underline" onClick={() => refresh.current()}>Retry</button></div>}
      <div className="max-h-[min(440px,55dvh)] space-y-2.5 overflow-y-auto p-3">
        {loading && <p className="p-2 text-xs text-[#73806E]">Loading updates…</p>}
        {!loading && !feed.items.length && !error && <p className="p-2 text-xs text-[#73806E]">You’re all caught up. New updates will appear here.</p>}
        {feed.items.map(item => {
          const design = appearance[item.kind], Icon = design.icon, p = item.payload;
          const past = p.starts_at && Date.parse(p.starts_at) < Date.parse(feed.checked_at) - 120000;
          return <article key={item.id} className={`rounded-xl border-l-[3px] p-3 ${design.style}`}>
            <div className="flex items-center gap-1.5 text-xs font-medium"><Icon size={14} aria-hidden="true"/>{item.title}<span className="ml-auto text-[10px]">{item.read_at ? "Read" : "New"}</span></div>
            <p className="mt-1.5 text-[13px] leading-5 text-[#354539]">{item.message}</p>
            {p.starts_at && <p className="mt-1 text-[11px] text-[#667466]">{timeLabel(p.starts_at)} PHT{p.teacher_name ? ` · ${p.teacher_name}` : ""}{past ? " · Earlier class" : ""}</p>}
            {p.slots_pht && <p className="mt-1 text-xs text-[#667466]">{p.slots_pht.join(" · ")} PHT{p.first_start && <><br/>First class: {timeLabel(p.first_start)} PHT</>}</p>}
            {!!p.changes?.length && <details className="mt-1 text-xs text-[#667466]"><summary className="cursor-pointer">{p.changes.length} lesson change{p.changes.length === 1 ? "" : "s"}</summary>{p.changes.map((change, i) => <p className="mt-1" key={i}>{change.old_starts_at ? timeLabel(change.old_starts_at) : "Previously unscheduled"} → {change.starts_at ? timeLabel(change.starts_at) : "Time to be confirmed"} PHT</p>)}</details>}
            <div className="mt-2 text-[10px] text-[#73806E]">{timeLabel(item.created_at)} PHT</div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
              <Link href={linkFor(item, locale, role)} onClick={() => { void mark([item.id]); }}>{item.kind === "report" ? (role === "owner" ? "View enrollment" : "Open report") : item.kind === "assignment" ? "View student" : "View schedule"} →</Link>
              {!item.read_at && <button type="button" disabled={marking} onClick={() => { void mark([item.id]); }} className="text-[#667466] underline disabled:opacity-50">Mark read</button>}
            </div>
          </article>;
        })}
      </div>
      <footer className="flex items-center justify-between gap-2 border-t border-[#E2E5DB] px-3 py-2 text-xs">
        <button type="button" aria-pressed={sound} onClick={() => { const enabled = !sound; soundRef.current = enabled; setSound(enabled); if (enabled) void play(); }} className="flex items-center gap-1.5 rounded-lg p-2 hover:bg-[#EFF3EA]">{sound ? <Volume2 size={14}/> : <VolumeX size={14}/>}Sound {sound ? "on" : "off"}</button>
        <button type="button" disabled={marking || !feed.unread || !feed.checked_at} onClick={() => { void mark(); }} className="rounded-lg p-2 hover:bg-[#EFF3EA] disabled:opacity-50">Mark all read</button>
      </footer>
    </div>}
  </section>;
}
