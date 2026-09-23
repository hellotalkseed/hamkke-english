import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, Home, BookOpen, ClipboardCheck, FileText, Settings, NotebookPen } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidLocale } from "@/lib/i18n";
import { portalMessages } from "@/lib/portal/messages";
import { parseOverview, type PortalEnrollment } from "@/lib/portal/overview";
import PortalHeader from "@/components/portal/PortalHeader";


const dashboardCopy = {
  en: {
    scheduleNote: "Check upcoming lessons for rescheduled dates and times.",
    dateLabel: "Date", dayLabel: "Day", timeLabel: "Time",
    upcoming: "Upcoming lessons", noUpcoming: "No upcoming lessons are scheduled for your active term.", noMore: "No additional upcoming lessons.", noSchedule: "Your regular schedule has not been set yet.", lessonError: "Unable to load lesson details. Please try again.", timePending: "Time to be confirmed", teacher: "Teacher", platform: "Platform",
    nextLesson: "Your next lesson", regularSchedule: "Your regular schedule", scheduleUnavailable: "Schedule details are not available in the portal yet. Please confirm with Hamkke through your usual chat.", nextUnavailable: "Your next lesson details are not available here yet.", balance: "Lesson balance",
    myLessons: "My Lessons", attendance: "Attendance", reports: "Progress Reports", enrollment: "Enrollment", settings: "Settings", welcomeLine: "Let’s keep growing together,", scheduleSoon: "Lesson schedules will be available here soon. Please confirm your next lesson through your usual chat with Hamkke.", attendanceSoon: "Attendance records will be available here soon. Your current package balance is shown in My Lessons.", reportsSoon: "Progress reports will be available here once this feature is ready.", adminSoon: "Payment details and contracts will be available here soon.", learnerName: "Learner name", timezone: "Learner timezone", settingsNote: "Account details are read-only here. To update them or get password help, contact Hamkke.",
    home: "Home", terms: "My terms", policy: "Lesson policy", help: "Help", termsIntro: "Your active terms and remaining lessons.", emptyHistory: "No previous terms yet.", helpTitle: "Need a hand?", helpIntro: "For schedule changes, account access, or questions about your lessons, contact Hamkke through your usual chat or send an inquiry.", contact: "Send an inquiry", fullPolicy: "Read the full policy",
    greeting: "Hi, {name}.", intro: "One conversation at a time, we keep growing together.", current: "Your current term",
    remaining: "lessons remaining", usage: "{used} of {total} lessons used", details: "Term details",
    other: "Other terms", noActive: "You don’t have an active term right now.",
    noActiveHelp: "You can check your registered terms below.", lessons: "Explore lessons",
    total: "Lessons in this term", package: "Lesson package", reference: "Enrollment number",
    shared: "Shared term", individual: "Individual term", history: "Previous terms",
    historyHelp: "View completed and cancelled terms.", pending: "Upcoming & pending terms",
  },
  ko: {
    scheduleNote: "변경된 수업 날짜와 시간은 예정된 수업에서 확인하세요.",
    dateLabel: "날짜", dayLabel: "요일", timeLabel: "시간",
    upcoming: "예정된 수업", noUpcoming: "현재 수강 기간에 예정된 수업이 없습니다.", noMore: "추가로 예정된 수업이 없습니다.", noSchedule: "정규 수업 일정이 아직 등록되지 않았습니다.", lessonError: "수업 정보를 불러오지 못했습니다. 다시 시도해 주세요.", timePending: "시간 확인 필요", teacher: "선생님", platform: "수업 플랫폼",
    nextLesson: "다음 수업", regularSchedule: "정규 수업 일정", scheduleUnavailable: "아직 포털에서 수업 일정을 확인할 수 없습니다. 평소 사용하는 메신저로 Hamkke에 확인해 주세요.", nextUnavailable: "아직 이곳에서 다음 수업 정보를 확인할 수 없습니다.", balance: "수업 잔여 횟수",
    myLessons: "내 수업", attendance: "출석 기록", reports: "학습 보고서", enrollment: "수강 등록", settings: "설정", welcomeLine: "함께 계속 성장해 나가요,", scheduleSoon: "수업 일정은 곧 이곳에서 확인할 수 있습니다. 다음 수업은 평소 사용하는 메신저로 Hamkke에 확인해 주세요.", attendanceSoon: "출석 기록은 곧 이곳에서 확인할 수 있습니다. 남은 수업 횟수는 내 수업에서 확인하세요.", reportsSoon: "학습 보고서는 기능이 준비되면 이곳에서 확인할 수 있습니다.", adminSoon: "결제 정보와 계약서는 곧 이곳에서 확인할 수 있습니다.", learnerName: "학습자 이름", timezone: "학습자 시간대", settingsNote: "이곳에서는 계정 정보를 확인할 수 있습니다. 정보 변경이나 비밀번호 관련 도움이 필요하면 Hamkke에 문의해 주세요.",
    home: "홈", terms: "내 수강 정보", policy: "수업 규정", help: "도움말", termsIntro: "현재 수강 과정과 남은 수업을 확인하세요.", emptyHistory: "아직 지난 수강 내역이 없습니다.", helpTitle: "도움이 필요하신가요?", helpIntro: "일정 변경, 계정 이용, 수업 관련 질문은 평소 사용하는 메신저로 Hamkke에 연락하거나 문의를 보내 주세요.", contact: "문의하기", fullPolicy: "전체 규정 보기",
    greeting: "{name}님, 안녕하세요.", intro: "한 번의 대화가 쌓일 때마다, 우리는 함께 성장해요.", current: "현재 수강 중인 과정",
    remaining: "회 남았어요", usage: "전체 {total}회 중 {used}회 사용", details: "수강 상세 정보",
    other: "다른 수강 내역", noActive: "현재 수강 중인 과정이 없습니다.",
    noActiveHelp: "아래에서 등록된 수강 내역을 확인할 수 있습니다.", lessons: "수업 알아보기",
    total: "전체 수업 횟수", package: "수강 과정", reference: "수강 등록 번호",
    shared: "공유 수강권", individual: "개인 수강권", history: "지난 수강 내역",
    historyHelp: "완료되거나 취소된 수강 내역을 확인하세요.", pending: "예정 및 대기 중인 수강 내역",
  },
  zh: {
    scheduleNote: "请在即将开始的课程中查看调整后的日期和时间。",
    dateLabel: "日期", dayLabel: "星期", timeLabel: "时间",
    upcoming: "即将开始的课程", noUpcoming: "当前课包暂无已安排的课程。", noMore: "暂无其他已安排的课程。", noSchedule: "固定课表尚未设置。", lessonError: "无法加载课程信息，请重试。", timePending: "时间待确认", teacher: "老师", platform: "上课平台",
    nextLesson: "下一节课", regularSchedule: "固定上课时间", scheduleUnavailable: "学生门户暂未提供课表，请通过常用聊天工具与 Hamkke 确认。", nextUnavailable: "此处暂未提供下一节课的信息。", balance: "课时余额",
    myLessons: "我的课程", attendance: "出勤记录", reports: "学习报告", enrollment: "报名信息", settings: "设置", welcomeLine: "让我们继续一起成长，", scheduleSoon: "课程安排即将在这里开放。请通过平时使用的聊天软件向 Hamkke 确认下一节课。", attendanceSoon: "出勤记录即将在这里开放。当前套餐的剩余课时可在“我的课程”中查看。", reportsSoon: "学习报告功能准备好后，您可以在这里查看报告。", adminSoon: "付款详情和合同即将在这里开放。", learnerName: "学员姓名", timezone: "学员时区", settingsNote: "这里的账号信息仅供查看。如需修改信息或获取密码帮助，请联系 Hamkke。",
    home: "首页", terms: "我的套餐", policy: "课程规定", help: "帮助", termsIntro: "查看当前套餐和剩余课时。", emptyHistory: "暂无历史套餐。", helpTitle: "需要帮助吗？", helpIntro: "如需调整时间、获取账号帮助或咨询课程，请通过平时使用的聊天软件联系 Hamkke，或发送咨询。", contact: "发送咨询", fullPolicy: "查看完整规定",
    greeting: "{name}，你好。", intro: "在一次次对话中，我们一起成长。", current: "当前课程套餐",
    remaining: "节课剩余", usage: "共 {total} 节，已用 {used} 节", details: "套餐详情",
    other: "其他套餐", noActive: "目前没有正在使用的课程套餐。",
    noActiveHelp: "你可以在下方查看已登记的套餐。", lessons: "了解课程",
    total: "套餐总课时", package: "课程套餐", reference: "报名编号",
    shared: "共享套餐", individual: "个人套餐", history: "历史套餐",
    historyHelp: "查看已完成和已取消的套餐。", pending: "即将开始及待处理的套餐",
  },
  ja: {
    scheduleNote: "変更された日時は、今後のレッスンでご確認ください。",
    dateLabel: "日付", dayLabel: "曜日", timeLabel: "時間",
    upcoming: "今後のレッスン", noUpcoming: "現在の受講期間に予定されているレッスンはありません。", noMore: "ほかに予定されているレッスンはありません。", noSchedule: "通常のレッスンスケジュールはまだ設定されていません。", lessonError: "レッスン情報を読み込めませんでした。もう一度お試しください。", timePending: "時間は確認中です", teacher: "講師", platform: "プラットフォーム",
    nextLesson: "次のレッスン", regularSchedule: "通常のレッスンスケジュール", scheduleUnavailable: "ポータルではまだスケジュールを確認できません。いつもの連絡方法で Hamkke にご確認ください。", nextUnavailable: "次のレッスンの詳細は、まだここでは確認できません。", balance: "レッスン残数",
    myLessons: "マイレッスン", attendance: "出席記録", reports: "学習レポート", enrollment: "受講登録", settings: "設定", welcomeLine: "これからも一緒に成長していきましょう。", scheduleSoon: "レッスン日程は今後こちらで確認できるようになります。次回のレッスンは普段お使いのチャットでHamkkeにご確認ください。", attendanceSoon: "出席記録は今後こちらで確認できるようになります。残りのレッスン数はマイレッスンをご覧ください。", reportsSoon: "学習レポートは機能の準備ができ次第、こちらで確認できます。", adminSoon: "お支払いの詳細と契約書は今後こちらで確認できるようになります。", learnerName: "受講者名", timezone: "受講者のタイムゾーン", settingsNote: "こちらではアカウント情報の確認ができます。変更やパスワードについてはHamkkeにお問い合わせください。",
    home: "ホーム", terms: "受講コース", policy: "レッスン規定", help: "ヘルプ", termsIntro: "受講中のコースと残りのレッスンを確認できます。", emptyHistory: "過去のコースはまだありません。", helpTitle: "お困りですか？", helpIntro: "日程変更、アカウント、レッスンについては、普段お使いのチャットでHamkkeにご連絡いただくか、お問い合わせをお送りください。", contact: "お問い合わせ", fullPolicy: "規定の全文を見る",
    greeting: "{name}さん、こんにちは。", intro: "一つひとつの会話を重ねながら、一緒に成長していきましょう。", current: "受講中のコース",
    remaining: "レッスン残っています", usage: "全{total}回中{used}回利用済み", details: "コースの詳細",
    other: "その他のコース", noActive: "現在受講中のコースはありません。",
    noActiveHelp: "登録済みのコースは下から確認できます。", lessons: "レッスンを見る",
    total: "合計レッスン数", package: "受講コース", reference: "受講登録番号",
    shared: "共有パッケージ", individual: "個人パッケージ", history: "過去のコース",
    historyHelp: "修了・キャンセルしたコースを確認できます。", pending: "開始予定・手続き中のコース",
  },
} as const;

export const dynamic = "force-dynamic";

type PortalLesson = { student_id: string; enrollment_id: string; id: string; lesson_date: string; schedule_time: string | null; timezone: string; duration: number | null; platform: string | null; class_link: string | null; teacher_name: string | null };
type PortalSchedule = { student_id: string; enrollment_id: string; timezone: string; day: string; time: string };
function parseLessonDetails(value: unknown): { lessons: PortalLesson[]; schedules: PortalSchedule[] } {
  if (!value || typeof value !== "object") throw new Error("Invalid lesson details");
  const data = value as Record<string, unknown>;
  if (!Array.isArray(data.lessons) || !Array.isArray(data.schedules)) throw new Error("Invalid lesson lists");
  const record = (value: unknown): Record<string, unknown> => {
    if (!value || typeof value !== "object") throw new Error("Invalid lesson row");
    return value as Record<string, unknown>;
  };
  const text = (row: Record<string, unknown>, key: string): string => {
    if (typeof row[key] !== "string") throw new Error(`Invalid ${key}`);
    return row[key];
  };
  const nullable = (row: Record<string, unknown>, key: string) => row[key] === null ? null : text(row, key);
  return {
    lessons: data.lessons.map((value: unknown) => {
      const r = record(value);
      if (r.duration !== null && (typeof r.duration !== "number" || !Number.isFinite(r.duration))) throw new Error("Invalid duration");
      return { student_id: text(r, "student_id"), enrollment_id: text(r, "enrollment_id"), id: text(r, "id"), lesson_date: text(r, "lesson_date"), schedule_time: nullable(r, "schedule_time"), timezone: text(r, "timezone"), duration: r.duration as number | null, platform: nullable(r, "platform"), class_link: typeof r.class_link === "string" ? r.class_link : null, teacher_name: nullable(r, "teacher_name") };
    }),
    schedules: data.schedules.map((value: unknown) => {
      const r = record(value);
      return { student_id: text(r, "student_id"), enrollment_id: text(r, "enrollment_id"), timezone: text(r, "timezone"), day: text(r, "day"), time: text(r, "time") };
    }),
  };
}

export default async function PortalPage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ student?: string; view?: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const t = portalMessages[locale];
  const d = dashboardCopy[locale];
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect(`/${locale}/portal/login`);
  const account = await supabase.from("portal_accounts").select("status").eq("user_id", user.id).maybeSingle();
  if (account.error) throw new Error(t.connection);
  if (account.data?.status !== "active") redirect(`/${locale}/portal/login?error=access`);

  async function signOut() {
    "use server";
    const client = await createClient();
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) throw new Error(t.connection);
    redirect(`/${locale}/portal/login`);
  }

  const result = await supabase.rpc("get_portal_enrollment_overview");
  let rows: PortalEnrollment[] = [];
  let failed = Boolean(result.error);
  if (!failed) {
    try { rows = parseOverview(result.data); } catch { failed = true; }
  }
  const learners = [...new Map(rows.map((row) => [row.student_id, row.student_name])).entries()];
  const { student, view: requestedView } = await searchParams;
  const views = ["home", "lessons", "attendance", "reports", "enrollment", "settings"] as const;
  type View = typeof views[number];
  if (requestedView && !views.includes(requestedView as View)) notFound();
  const view: View = (requestedView as View | undefined) ?? "home";
  // A URL parameter selects only among learners already authorized by the RPC.
  if (!failed && student && !learners.some(([id]) => id === student)) notFound();
  const selectedId = student ?? learners[0]?.[0];
  const selectedName = learners.find(([id]) => id === selectedId)?.[1];
  const packages = rows.filter((row) => row.student_id === selectedId && row.enrollment_id !== null);
  function href(nextView: View, learnerId = selectedId) {
    const query = new URLSearchParams();
    if (nextView !== "home") query.set("view", nextView);
    if (learnerId) query.set("student", learnerId);
    return `/${locale}/portal${query.size ? `?${query.toString()}` : ""}`;
  }
  const navigation = [
    { view: "home", label: d.home, icon: Home },
    { view: "lessons", label: d.myLessons, icon: BookOpen },
    { view: "attendance", label: d.attendance, icon: ClipboardCheck },
    { view: "reports", label: d.reports, icon: NotebookPen },
    { view: "enrollment", label: d.enrollment, icon: FileText },
    { view: "settings", label: d.settings, icon: Settings },
  ] as const;
  const number = new Intl.NumberFormat(locale);
  function date(value: string | null) {
    if (!value) return t.notSet;
    const parsed = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime())) return t.notSet;
    return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(parsed);
  }
  // Keep separate terms separate, including when more than one is active.
  const activeTerms = packages.filter((item) => item.enrollment_status === "active");
  const previousTerms = packages.filter((item) => item.enrollment_status === "completed" || item.enrollment_status === "cancelled");
  const pendingTerms = packages.filter((item) => item.enrollment_status !== "active" && item.enrollment_status !== "completed" && item.enrollment_status !== "cancelled");
  let lessonDetails: ReturnType<typeof parseLessonDetails> = { lessons: [], schedules: [] };
  let lessonsFailed = false;
  if (view === "lessons" && !failed && selectedId && activeTerms.length > 0) {
    const response = await supabase.rpc("get_portal_lesson_details");
    if (response.error) lessonsFailed = true;
    else { try { lessonDetails = parseLessonDetails(response.data); } catch { lessonsFailed = true; } }
  }
  const lessonRows = lessonDetails.lessons.filter((item) => item.student_id === selectedId);
  const scheduleRows = lessonDetails.schedules.filter((item) => item.student_id === selectedId);
  // Keep different packages and timezones separate even when their clock times match.
  const scheduleCards = new Map<string, { enrollmentId: string; timezone: string; slots: Map<string, Set<string>> }>();
  function dayIndex(value: string) {
    return /^\d$/.test(value) ? Number(value) : ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].indexOf(value.toLowerCase().trim().slice(0, 3));
  }
  for (const schedule of scheduleRows) {
    const key = `${schedule.enrollment_id}|${schedule.timezone}`;
    let card = scheduleCards.get(key);
    if (!card) {
      card = { enrollmentId: schedule.enrollment_id, timezone: schedule.timezone, slots: new Map() };
      scheduleCards.set(key, card);
    }
    const clock = /^\d{2}:\d{2}$/.test(schedule.time) ? `${schedule.time}:00` : schedule.time;
    const days = card.slots.get(clock) ?? new Set<string>();
    const index = dayIndex(schedule.day);
    days.add(index >= 0 && index <= 6 ? String(index) : schedule.day);
    card.slots.set(clock, days);
  }
  const dayList = new Intl.ListFormat(locale, { style: "long", type: "conjunction" });
  const nextLesson = lessonRows[0];
  const upcomingLessons = lessonRows.slice(1, 6);
  function time(value: string | null) {
    if (!value) return d.timePending;
    const parsed = new Date(`2000-01-02T${value}Z`);
    return Number.isNaN(parsed.getTime()) ? d.timePending : new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(parsed);
  }
  function weekday(value: string) {
    const index = /^\d$/.test(value) ? Number(value) : ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].indexOf(value.toLowerCase().trim().slice(0, 3));
    return index < 0 || index > 6 ? value : new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, 7 + index)));
  }
  const focus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#607568]";

  function status(item: PortalEnrollment) {
    return item.enrollment_status && Object.prototype.hasOwnProperty.call(t.statuses, item.enrollment_status)
      ? t.statuses[item.enrollment_status as keyof typeof t.statuses] : t.unknownStatus;
  }

  function termDetails(item: PortalEnrollment) {
    const fields = [
      [d.package, item.package_name ?? t.notSet],
      [d.reference, item.enrollment_number ?? t.notSet],
      [t.starts, date(item.start_date)],
      [t.duration, item.lesson_duration === null ? t.notSet : t.minutes.replace("{count}", number.format(item.lesson_duration))],
    ];
    return <dl className="grid gap-x-8 gap-y-5 text-sm sm:grid-cols-2">
      {fields.map(([label, value]) => <div key={label} className="min-w-0">
        <dt className="text-[#607568]">{label}</dt>
        <dd className="mt-1.5 break-words leading-6">{value}</dd>
      </div>)}
    </dl>;
  }

  function compactTerm(item: PortalEnrollment) {
    return <details key={item.enrollment_id} className="group/term border-b border-[#718A73]/20 last:border-b-0">
      <summary className={`flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-5 ${focus} [&::-webkit-details-marker]:hidden`}>
        <span className="min-w-0">
          <span className="block break-words font-serif text-xl sm:text-2xl">{item.package_name ?? t.packages}</span>
          <span className="mt-1 block text-xs leading-5 text-[#607568]">{item.enrollment_number ? `${item.enrollment_number} · ` : ""}{status(item)}</span>
        </span>
        <ChevronDown size={18} aria-hidden="true" className="shrink-0 transition-transform group-open/term:rotate-180 motion-reduce:transition-none" />
      </summary>
      <div className="pb-6">
        <dl className="mb-6 grid grid-cols-3 gap-3 rounded-xl bg-[#EEF2EA]/60 p-4">
          {[[t.total, item.total_lessons], [t.used, item.used_lessons], [t.remaining, item.remaining_lessons]].map(([label, value]) => <div key={String(label)}>
            <dt className="text-xs leading-5 text-[#607568]">{label}</dt>
            <dd className="mt-1 font-serif text-2xl">{value === null ? "-" : number.format(Number(value))}</dd>
          </div>)}
        </dl>
        {termDetails(item)}
        {item.is_shared && <p className="mt-4 text-sm leading-6 text-[#607568]">{t.sharedNote}</p>}
      </div>
    </details>;
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#293A30]">
      <PortalHeader locale={locale} signOutAction={signOut} studentId={selectedId} view={view} />
      <div className="grid min-h-[calc(100dvh-77px)] lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="min-w-0 border-b border-[#718A73]/20 bg-[#FAF8F5] p-3 lg:border-b-0 lg:border-r lg:px-4 lg:py-8">
          <details key={`${view}-${selectedId}`} className="group/mobile lg:hidden">
            <summary className={`flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl bg-[#E5EBDD] px-4 py-3 text-sm font-medium text-[#31463A] ${focus} [&::-webkit-details-marker]:hidden`}>
              <span>{navigation.find((item) => item.view === view)?.label}</span>
              <ChevronDown size={18} aria-hidden="true" className="shrink-0 transition-transform group-open/mobile:rotate-180 motion-reduce:transition-none" />
            </summary>
            <nav aria-label={t.portal} className="mt-2 grid gap-1">
              {navigation.map(({ view: destination, label, icon: Icon }) => (
                <Link key={destination} href={href(destination)} aria-current={view === destination ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm ${destination === "settings" ? "mt-2 border-t border-[#718A73]/20" : ""} ${focus} ${view === destination ? "bg-[#E5EBDD] font-medium text-[#31463A]" : "text-[#607568] hover:bg-[#EEF2EA]"}`}>
                  <Icon size={19} strokeWidth={1.6} aria-hidden="true" className="shrink-0" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          </details>
          <nav aria-label={t.portal} className="hidden p-1 lg:sticky lg:top-6 lg:flex lg:min-h-[calc(100dvh-145px)] lg:flex-col lg:gap-2">
            {navigation.map(({ view: destination, label, icon: Icon }) => (
              <Link key={destination} href={href(destination)} aria-current={view === destination ? "page" : undefined}
                className={`${destination === "settings" ? "ml-3 border-l border-[#718A73]/25 lg:ml-0 lg:mt-auto lg:border-l-0 lg:border-t" : ""} flex min-h-12 shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm lg:shrink ${focus} ${view === destination ? "bg-[#E5EBDD] font-medium text-[#31463A]" : "text-[#607568] hover:bg-[#EEF2EA] hover:text-[#293A30]"}`}>
                <Icon size={19} strokeWidth={1.6} aria-hidden="true" className="shrink-0" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </aside>
        <main id="portal-content" className="min-w-0 px-5 py-7 sm:px-8 lg:px-12 lg:py-10">
          <div className={`mx-auto ${view === "lessons" ? "max-w-[1280px]" : "max-w-[1120px]"}`}>
            {learners.length > 1 && !failed && <nav aria-label={t.learners} className="mb-6 flex flex-wrap gap-2">
              {learners.map(([id, name]) => <Link key={id} href={href(view, id)} aria-current={id === selectedId ? "true" : undefined}
                className={`min-h-11 max-w-full break-words rounded-full px-5 py-3 text-sm ${focus} ${id === selectedId ? "bg-[#31463A] text-[#FFFDF8]" : "bg-[#EEF2EA] text-[#46564B]"}`}>{name}</Link>)}
            </nav>}

            {view === "home" ? <section className="mx-auto grid max-w-[1000px] items-center gap-3 py-2 sm:gap-6 sm:py-8 lg:min-h-[65dvh] lg:py-12 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] xl:gap-4">
  <div className="relative z-10 min-w-0">
    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#607568]">{t.portal}</p>
    <h1 className={`mt-5 break-words font-serif leading-[1.15] ${locale === "ko" ? "text-[30px] sm:text-[38px] xl:text-[42px]" : locale === "ja" ? "text-[27px] sm:text-[32px] xl:text-[35px]" : "text-[46px] sm:text-[60px] xl:text-[72px]"}`}>{selectedName && !failed ? d.greeting.replace("{name}", selectedName) : t.loginTitle}</h1>
    <p className="mt-4 max-w-lg text-lg sm:mt-7 leading-8 text-[#607568] sm:text-xl">{d.welcomeLine}</p>
    <p lang="en" className="mt-3 font-serif text-[34px] italic leading-[1.15] text-[#718A73] sm:text-[44px] xl:text-[48px]">
      <span className="block">From Small Talk</span>{" "}
      <span className="block">to Big Ideas.</span>
    </p>
  </div>
  <div aria-hidden="true" className="relative isolate mx-auto w-full max-w-[220px] sm:max-w-[300px] lg:max-w-[340px] xl:max-w-[460px]">
    <div className="absolute inset-x-[5%] bottom-[6%] top-[12%] -z-10 rounded-[50%] bg-[#E7EDDF]/70" />
    <Image
      src="/mascot/hamkke-portal-welcome.png"
      alt=""
      width={1254}
      height={1254}
      sizes="(min-width: 1280px) 460px, (min-width: 1024px) 340px, (min-width: 640px) 300px, 220px"
      className="h-auto w-full object-contain"
    />
  </div>
</section> : <header className="mb-7 border-b border-[#718A73]/20 pb-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#607568]">{selectedName ?? t.portal}</p>
              <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">{navigation.find((item) => item.view === view)?.label}</h1>
              {view === "enrollment" && <p className="mt-3 text-sm leading-6 text-[#607568]">{d.termsIntro}</p>}
            </header>}

            {(view === "home" || view === "enrollment" || view === "lessons") && failed && <section role="alert" className="rounded-xl border border-[#DCD8D2] p-6">
              <p>{t.loadError}</p><Link href={href(view)} className={`mt-4 inline-block underline ${focus}`}>{t.retry}</Link>
            </section>}
            {(view === "enrollment" || view === "lessons") && !failed && (
              learners.length === 0 ? <section className="rounded-2xl bg-[#EEF2EA] p-6"><h2 className="font-serif text-2xl">{t.noLearners}</h2><p className="mt-3 leading-7 text-[#607568]">{t.noLearnersHelp}</p></section>
              : packages.length === 0 ? <section className="rounded-2xl bg-[#EEF2EA] p-6"><h2 className="font-serif text-2xl">{t.noPackages}</h2><p className="mt-3 text-[#607568]">{t.noPackagesHelp}</p></section>
              : <div className="space-y-8">
            {view === "enrollment" ? <section>{activeTerms.map(compactTerm)}{activeTerms.length === 0 && <p className="text-[#607568]">{d.noActive}</p>}</section> : activeTerms.length > 0 ? <section aria-label={d.current} className="space-y-5">
              {activeTerms.map((item) => {
                const usage = item.total_lessons === null
                  ? `${t.used}: ${number.format(item.used_lessons)}`
                  : d.usage.replace("{used}", number.format(item.used_lessons)).replace("{total}", number.format(item.total_lessons));
                const percent = item.total_lessons && item.total_lessons > 0 ? Math.min(100, item.used_lessons / item.total_lessons * 100) : 0;
                const hasTotal = item.total_lessons !== null && item.total_lessons > 0;
                return <article key={item.enrollment_id} className="grid overflow-hidden rounded-2xl border border-[#718A73]/25 bg-[#FAF8F5] md:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
                  <div className="min-w-0 p-5 sm:p-7 lg:p-8">
                  <h2 className="font-serif text-2xl sm:text-3xl">{d.balance}</h2>
                  {activeTerms.length > 1 && <p className="mt-2 break-words text-sm text-[#607568]">{item.package_name ?? t.packages}{item.enrollment_number ? ` · ${item.enrollment_number}` : ""}</p>}
                  <div className="mt-5 w-full">
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="font-serif text-2xl tabular-nums">
                        {number.format(item.used_lessons)} / {item.total_lessons === null ? "-" : number.format(item.total_lessons)}
                        <span className="ml-2 font-sans text-xs text-[#607568]">{t.used}</span>
                      </p>
                      {hasTotal && <span className="text-xs tabular-nums text-[#607568]">{number.format(Math.round(percent))}%</span>}
                    </div>
                    {hasTotal && <div role="progressbar" aria-label={t.used} aria-valuemin={0} aria-valuemax={item.total_lessons ?? undefined}
                      aria-valuenow={Math.min(item.used_lessons, item.total_lessons ?? 0)} aria-valuetext={usage}
                      className="mt-2 h-1 overflow-hidden rounded-full bg-[#E6E2DC]">
                      <div className="h-full rounded-full bg-[#7E9980]" style={{ width: `${percent}%` }} />
                    </div>}
                    <p className="mt-2 text-xs leading-5 text-[#607568]">{number.format(item.remaining_lessons)} {d.remaining}</p>
                  </div>
                  {item.is_shared && <p className="mt-4 max-w-lg text-xs leading-5 text-[#607568]">{t.sharedNote}</p>}
                  </div>
                  <div className="min-w-0 border-t border-[#718A73]/20 bg-[#EEF2EA]/60 p-5 sm:p-7 md:border-l md:border-t-0 lg:p-8">
                    <p className="text-xs font-medium text-[#607568]">{d.current}</p>
                    <h3 className="mt-2 break-words font-serif text-2xl leading-tight">{item.package_name ?? t.packages}</h3>
                    <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div><dt className="text-xs text-[#607568]">{t.duration}</dt><dd className="mt-1">{item.lesson_duration === null ? t.notSet : t.minutes.replace("{count}", number.format(item.lesson_duration))}</dd></div>
                      <div><dt className="text-xs text-[#607568]">{t.starts}</dt><dd className="mt-1">{date(item.start_date)}</dd></div>
                    </dl>
                  </div>
                </article>;
              })}
            </section> : <section className="rounded-2xl bg-[#EEF2EA] p-6 sm:p-8">
              <h2 className="font-serif text-2xl">{d.noActive}</h2>

            </section>}

            {view === "lessons" && <div className="w-full space-y-8">
              {lessonsFailed ? <section role="alert" className="pb-6">
                <p className="text-sm leading-6 text-[#607568]">{d.lessonError}</p>
                <a href={href("lessons")} className={`mt-3 inline-flex min-h-11 items-center text-sm underline ${focus}`}>{t.retry}</a>
              </section> : <>
                <section>
                  <h2 className="font-serif text-2xl sm:text-3xl">{d.nextLesson}</h2>
                  {nextLesson ? <div className="mt-4 grid gap-5 rounded-2xl border border-[#E8D99B] bg-[#FFF4C7] text-[#293A30] p-5 sm:p-7 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.7fr)] md:items-center lg:p-8">
                    <div className="min-w-0">
                      <p className="font-serif text-2xl text-[#293A30] sm:text-3xl">{date(nextLesson.lesson_date)}</p>
                      <p className="mt-2 text-lg font-semibold text-[#293A30]">{time(nextLesson.schedule_time)}</p>
                      <p className="mt-1 text-xs text-[#46564B]">{nextLesson.timezone.replaceAll("_", " ")}</p>
                    </div>
                    <dl className="grid min-w-0 gap-4 border-t border-[#607568]/25 pt-5 text-sm md:border-l md:border-t-0 md:pl-6 md:pt-0">
                      <div><dt className="text-xs text-[#46564B]">{d.teacher}</dt><dd className="mt-1 break-words">{nextLesson.teacher_name ?? t.notSet}</dd></div>
                      <div><dt className="text-xs text-[#46564B]">{t.duration}</dt><dd className="mt-1">{nextLesson.duration === null ? t.notSet : t.minutes.replace("{count}", number.format(nextLesson.duration))}</dd></div>
                    </dl>
                    <dl className="min-w-0 text-sm"><dt className="text-xs text-[#46564B]">{d.platform}</dt><dd className="mt-1 break-words">{nextLesson.platform ?? t.notSet}{nextLesson.class_link ? <a href={nextLesson.class_link} target="_blank" rel="noopener noreferrer" className={`mt-4 block w-fit font-medium underline underline-offset-4 ${focus}`}>Join class -&gt;</a> : null}</dd></dl>
                  </div> : <p className="mt-3 text-sm leading-6 text-[#607568]">{d.noUpcoming}</p>}
                </section>
                <section>
                  <h2 className="font-serif text-2xl sm:text-3xl">{d.upcoming}</h2>
                  {upcomingLessons.length ? <>
                    <div className="mt-4 hidden overflow-hidden rounded-2xl border border-[#718A73]/20 md:block">
                      <table className="w-full table-fixed text-left text-sm">
                        <caption className="sr-only">{d.upcoming}</caption>
                        <thead className="bg-[#EEF2EA]/60 text-xs text-[#607568]"><tr>
                          {[d.dateLabel, d.dayLabel, d.timeLabel, d.teacher, d.platform].map((label) => <th key={label} scope="col" className="px-4 py-4 font-medium">{label}</th>)}
                        </tr></thead>
                        <tbody className="divide-y divide-[#718A73]/15">
                          {upcomingLessons.map((lesson) => <tr key={lesson.id}>
                            <td className="px-4 py-4 align-top">{date(lesson.lesson_date)}</td>
                            <td className="px-4 py-4 align-top">{weekday(String(new Date(`${lesson.lesson_date}T00:00:00Z`).getUTCDay()))}</td>
                            <td className="px-4 py-4 align-top">{time(lesson.schedule_time)}<span className="mt-1 block break-words text-xs text-[#607568]">{lesson.timezone.replaceAll("_", " ")}</span></td>
                            <td className="break-words px-4 py-4 align-top">{lesson.teacher_name ?? t.notSet}</td>
                            <td className="break-words px-4 py-4 align-top">
                              {lesson.platform ?? t.notSet}
                              {lesson.class_link ? <a href={lesson.class_link} target="_blank" rel="noopener noreferrer" className={`mt-4 block w-fit font-medium underline underline-offset-4 ${focus}`}>Join class -&gt;</a> : null}
                            </td>
                          </tr>)}
                        </tbody>
                      </table>
                    </div>
                    <ul className="mt-4 divide-y divide-[#718A73]/15 rounded-2xl border border-[#718A73]/20 px-5 md:hidden">
                    {upcomingLessons.map((lesson) => <li key={lesson.id} className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1 py-4">
                      <div>
                        <p className="text-sm font-medium">{date(lesson.lesson_date)}</p>
                        <p className="mt-1 text-xs text-[#607568]">{[lesson.teacher_name, lesson.platform].filter(Boolean).join(" · ")}</p>
                        {lesson.class_link ? <a href={lesson.class_link} target="_blank" rel="noopener noreferrer" className={`mt-4 block w-fit text-xs font-medium underline underline-offset-4 ${focus}`}>Join class -&gt;</a> : null}
                      </div>
                      <div><p className="text-sm">{time(lesson.schedule_time)}</p><p className="mt-1 text-xs text-[#607568]">{lesson.timezone.replaceAll("_", " ")}</p></div>
                    </li>)}
                  </ul></> : <p className="mt-3 text-sm text-[#607568]">{d.noMore}</p>}
                </section>
                <section>
                  <h2 className="font-serif text-2xl sm:text-3xl">{d.regularSchedule}</h2>
                  {scheduleCards.size ? <div className="mt-4 space-y-4">
                    {[...scheduleCards.entries()].map(([key, card]) => {
                      const daysOfWeek = ["1", "2", "3", "4", "5", "6", "0"];
                      const timesByDay = new Map<string, string[]>();
                      for (const [clock, days] of card.slots.entries()) {
                        for (const day of days) {
                          const normalized = String(dayIndex(day));
                          const times = timesByDay.get(normalized) ?? [];
                          times.push(clock);
                          timesByDay.set(normalized, times);
                        }
                      }
                      return <div key={key} className="overflow-hidden rounded-2xl border border-[#718A73]/20 bg-[#FAF8F5] p-5 sm:p-6">
                        <p className="text-xs text-[#607568]">{card.timezone.replaceAll("_", " ")}</p>
                        {activeTerms.length > 1 && <p className="mt-2 break-words text-sm font-medium">{activeTerms.find((term) => term.enrollment_id === card.enrollmentId)?.package_name ?? t.packages}</p>}
                        <div className="mt-4 hidden overflow-hidden rounded-xl border border-[#718A73]/15 md:grid md:grid-cols-7">
                          {daysOfWeek.map((day, index) => <div key={day} className={`${index ? "border-l border-[#718A73]/15" : ""} min-w-0 text-center`}>
                            <div className="border-b border-[#718A73]/15 bg-[#EEF2EA]/45 px-2 py-3 text-xs font-medium text-[#607568]">{weekday(day)}</div>
                            <div className="flex min-h-20 flex-col items-center justify-center gap-1.5 px-2 py-4 text-sm">
                              {(timesByDay.get(day) ?? []).sort().length
                                ? (timesByDay.get(day) ?? []).sort().map((clock) => <span key={clock} className="whitespace-nowrap font-medium">{time(clock)}</span>)
                                : <span className="text-[#607568]/55">-</span>}
                            </div>
                          </div>)}
                        </div>
                        <div className="mt-3 divide-y divide-[#718A73]/15 md:hidden">
                          {daysOfWeek.filter((day) => (timesByDay.get(day) ?? []).length > 0).map((day) => <div key={day} className="flex items-center justify-between gap-5 py-3 text-sm">
                            <span>{weekday(day)}</span>
                            <span className="text-right font-medium">{(timesByDay.get(day) ?? []).sort().map(time).join(", ")}</span>
                          </div>)}
                        </div>
                      </div>;
                    })}
                    <p className="text-xs leading-5 text-[#607568]">{d.scheduleNote}</p>
                  </div> : <p className="mt-3 text-sm leading-6 text-[#607568]">{d.noSchedule}</p>}
                </section>
              </>}
            </div>}

            {view === "enrollment" && pendingTerms.length > 0 && <section aria-label={d.pending}>
              <h2 className="mb-2 font-serif text-2xl sm:text-3xl">{d.pending}</h2>
              {pendingTerms.map(compactTerm)}
            </section>}
            {view === "enrollment" && <>
              <details className="border-y border-[#718A73]/20 py-5">
                <summary className={`cursor-pointer font-serif text-2xl ${focus}`}>{d.history}</summary>
                <div className="mt-4">{previousTerms.length ? previousTerms.map(compactTerm) : <p className="text-sm text-[#607568]">{d.emptyHistory}</p>}</div>
              </details>
              <p className="text-sm leading-6 text-[#607568]">{d.adminSoon}</p>
              <Link href={`/${locale}/policy`} className={`inline-flex min-h-11 items-center gap-2 text-sm underline ${focus}`}>{d.fullPolicy}<ArrowUpRight size={16} aria-hidden="true" /></Link>
            </>}
              </div>
            )}
            {(view === "attendance" || view === "reports") && <section className="max-w-2xl rounded-2xl bg-[#EEF2EA] p-6 sm:p-8">
              <p className="leading-7 text-[#607568]">{view === "attendance" ? d.attendanceSoon : d.reportsSoon}</p>
              {view === "attendance" && <Link href={href("lessons")} className={`mt-5 inline-flex min-h-11 items-center gap-2 text-sm underline ${focus}`}>{d.myLessons}<ArrowUpRight size={16} aria-hidden="true" /></Link>}
            </section>}
            {view === "settings" && <section className="max-w-2xl">
              <dl className="grid gap-6 rounded-2xl bg-[#EEF2EA] p-6 text-sm sm:grid-cols-2 sm:p-8">
                <div><dt className="text-[#607568]">{t.email}</dt><dd className="mt-2 break-all">{user.email ?? t.notSet}</dd></div>
                <div><dt className="text-[#607568]">{d.learnerName}</dt><dd className="mt-2 break-words">{failed ? t.connection : selectedName ?? t.notSet}</dd></div>
                <div><dt className="text-[#607568]">{d.timezone}</dt><dd className="mt-2 break-words">{failed ? t.connection : rows.find((row) => row.student_id === selectedId)?.student_timezone ?? t.notSet}</dd></div>
              </dl>
              <p className="mt-5 text-sm leading-7 text-[#607568]">{d.settingsNote}</p>
              <p className="mt-4 text-sm leading-7 text-[#607568]">{d.helpIntro}</p>
              <Link href={`/${locale}/inquiry`} className={`mt-5 inline-flex min-h-11 items-center gap-3 rounded-full bg-[#31463A] px-6 py-3 text-sm text-[#FFFDF8] ${focus}`}>{d.contact}<ArrowUpRight size={17} aria-hidden="true" /></Link>
            </section>}
          </div>
        </main>
      </div>
    </div>
  );
}

