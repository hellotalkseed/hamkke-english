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
            <dd className="mt-1 font-serif text-2xl">{value === null ? "—" : number.format(Number(value))}</dd>
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
          <div className="mx-auto max-w-[1120px]">
            {learners.length > 1 && !failed && <nav aria-label={t.learners} className="mb-6 flex flex-wrap gap-2">
              {learners.map(([id, name]) => <Link key={id} href={href(view, id)} aria-current={id === selectedId ? "true" : undefined}
                className={`min-h-11 max-w-full break-words rounded-full px-5 py-3 text-sm ${focus} ${id === selectedId ? "bg-[#31463A] text-[#FFFDF8]" : "bg-[#EEF2EA] text-[#46564B]"}`}>{name}</Link>)}
            </nav>}

            {view === "home" ? <section className="mx-auto grid max-w-[1000px] items-center gap-3 py-2 sm:gap-6 sm:py-8 lg:min-h-[65dvh] lg:py-12 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] xl:gap-4">
  <div className="relative z-10 min-w-0">
    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#607568]">{t.portal}</p>
    <h1 className="mt-5 break-words font-serif text-[46px] leading-[1.1] sm:text-[60px] xl:text-[72px]">{selectedName && !failed ? d.greeting.replace("{name}", selectedName) : t.loginTitle}</h1>
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
              {view === "lessons" && <p className="mt-3 text-sm leading-6 text-[#607568]">{d.termsIntro}</p>}
            </header>}

            {(view === "home" || view === "enrollment" || view === "lessons") && failed && <section role="alert" className="rounded-xl border border-[#DCD8D2] p-6">
              <p>{t.loadError}</p><Link href={href(view)} className={`mt-4 inline-block underline ${focus}`}>{t.retry}</Link>
            </section>}
            {(view === "enrollment" || view === "lessons") && !failed && (
              learners.length === 0 ? <section className="rounded-2xl bg-[#EEF2EA] p-6"><h2 className="font-serif text-2xl">{t.noLearners}</h2><p className="mt-3 leading-7 text-[#607568]">{t.noLearnersHelp}</p></section>
              : packages.length === 0 ? <section className="rounded-2xl bg-[#EEF2EA] p-6"><h2 className="font-serif text-2xl">{t.noPackages}</h2><p className="mt-3 text-[#607568]">{t.noPackagesHelp}</p></section>
              : <div className="space-y-8">
            {view === "lessons" && <p className="text-sm leading-6 text-[#607568]">{d.scheduleSoon}</p>}
            {view === "enrollment" ? <section>{activeTerms.map(compactTerm)}{activeTerms.length === 0 && <p className="text-[#607568]">{d.noActive}</p>}</section> : activeTerms.length > 0 ? <section aria-label={d.current} className="space-y-5">
              {activeTerms.map((item) => {
                const usage = item.total_lessons === null
                  ? `${t.used}: ${number.format(item.used_lessons)}`
                  : d.usage.replace("{used}", number.format(item.used_lessons)).replace("{total}", number.format(item.total_lessons));
                const percent = item.total_lessons && item.total_lessons > 0 ? Math.min(100, item.used_lessons / item.total_lessons * 100) : 0;
                return <article key={item.enrollment_id} className="overflow-hidden rounded-[24px] border border-[#718A73]/25">
                  <div className="grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                    <div className="min-w-0 bg-[#EEF2EA] p-6 sm:p-8">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#46564B]">{d.current}</h2>
                        <span className="rounded-full border border-[#718A73]/30 px-3 py-1 text-xs text-[#46564B]">{status(item)}</span>
                      </div>
                      <p className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="font-serif text-[68px] leading-none tracking-[-0.04em] sm:text-[76px]">{number.format(item.remaining_lessons)}</span>
                        <span className="text-sm text-[#46564B]">{d.remaining}</span>
                      </p>
                      <p className="mt-5 text-sm text-[#46564B]">{usage}</p>
                      {item.total_lessons !== null && item.total_lessons > 0 && <div
                        role="progressbar" aria-label={t.used} aria-valuemin={0} aria-valuemax={item.total_lessons}
                        aria-valuenow={Math.min(item.used_lessons, item.total_lessons)} aria-valuetext={usage}
                        className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#D6DFD1]">
                        <div className="h-full rounded-full bg-[#607D64]" style={{ width: `${percent}%` }} />
                      </div>}
                      {item.is_shared && <p className="mt-4 max-w-md text-xs leading-5 text-[#46564B]">{t.sharedNote}</p>}
                    </div>
                    <div className="flex min-w-0 flex-col justify-center p-6 sm:p-8">
                      <p className="text-xs text-[#607568]">{item.is_shared ? d.shared : d.individual}</p>
                      <h3 className="mt-2 break-words font-serif text-[27px] leading-tight sm:text-[32px]">{item.package_name ?? t.packages}</h3>
                      <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-[#718A73]/20 pt-5 text-sm">
                        <div><dt className="text-xs text-[#607568]">{t.duration}</dt><dd className="mt-2">{item.lesson_duration === null ? t.notSet : t.minutes.replace("{count}", number.format(item.lesson_duration))}</dd></div>
                        <div><dt className="text-xs text-[#607568]">{t.starts}</dt><dd className="mt-2">{date(item.start_date)}</dd></div>
                      </dl>
                    </div>
                  </div>
                  <details className="group/details border-t border-[#718A73]/20">
                    <summary className={`flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 text-sm sm:px-8 ${focus} [&::-webkit-details-marker]:hidden`}>
                      <span>{d.details}</span><ChevronDown size={16} aria-hidden="true" className="shrink-0 transition-transform group-open/details:rotate-180 motion-reduce:transition-none" />
                    </summary>
                    <div className="px-6 pb-6 pt-1 sm:px-8">{termDetails(item)}</div>
                  </details>
                </article>;
              })}
            </section> : <section className="rounded-2xl bg-[#EEF2EA] p-6 sm:p-8">
              <h2 className="font-serif text-2xl">{d.noActive}</h2>

            </section>}

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
