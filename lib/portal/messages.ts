import type { Locale } from "@/lib/i18n";

const en = {
  portal: "Student Portal", title: "Your learning, together.",
  introduction: "Your learners, lesson packages, and remaining lessons in one place.",
  loginTitle: "Welcome back.", loginIntro: "Sign in to view your lessons and learning records.",
  email: "Email address", password: "Password", signIn: "Sign in", signingIn: "Signing in…",
  signOut: "Sign out", home: "Home", language: "Language", learners: "Your learners",
  credentials: "We couldn't sign you in. Check your email and password, then try again.",
  unavailable: "Portal access isn't available for this account. Please contact Hamkke.",
  connection: "We couldn't load your account. Please try again.",
  help: "Need an account or help with your password? Please contact Hamkke.",
  noLearners: "Your learner records are being connected.",
  noLearnersHelp: "Please contact Hamkke if you expected to see your lessons here.",
  noPackages: "No lesson packages yet.", noPackagesHelp: "Your enrollment will appear here once it has been added.",
  packages: "Lesson packages", shared: "Shared package", individual: "Individual package",
  total: "Total lessons", used: "Used", remaining: "Remaining", starts: "Start date",
  duration: "Lesson duration", minutes: "{count} minutes", sharedNote: "This balance is shared across everyone in this package.",
  unknownStatus: "Status unavailable", notSet: "To be confirmed", retry: "Try again",
  loadError: "We couldn't load your lesson packages. Please try again.",
  statuses: { pending: "Pending", contract_review: "Contract review", payment_pending: "Payment pending", active: "Active", completed: "Completed", cancelled: "Cancelled" },
};
type Copy = { [K in keyof typeof en]: K extends "statuses" ? Record<keyof typeof en.statuses, string> : string };
export const portalMessages: Record<Locale, Copy> = {
  en,
  ko: {
    portal: "학생 포털", title: "함께 이어가는 영어 여정", introduction: "학습자별 수강 정보와 남은 수업을 한곳에서 확인하세요.",
    loginTitle: "다시 만나 반가워요.", loginIntro: "로그인하고 수업과 학습 기록을 확인하세요.",
    email: "이메일 주소", password: "비밀번호", signIn: "로그인", signingIn: "로그인 중…", signOut: "로그아웃", home: "홈", language: "언어", learners: "학습자",
    credentials: "로그인할 수 없습니다. 이메일과 비밀번호를 확인하고 다시 시도해 주세요.",
    unavailable: "이 계정으로는 학생 포털을 이용할 수 없습니다. Hamkke에 문의해 주세요.",
    connection: "계정 정보를 불러오지 못했습니다. 다시 시도해 주세요.", help: "계정이 필요하거나 비밀번호 관련 도움이 필요하신가요? Hamkke에 문의해 주세요.",
    noLearners: "학습자 정보를 연결하고 있습니다.", noLearnersHelp: "수업 정보가 표시되지 않는다면 Hamkke에 문의해 주세요.",
    noPackages: "아직 등록된 수강 내역이 없습니다.", noPackagesHelp: "수강 등록이 완료되면 이곳에서 확인할 수 있습니다.",
    packages: "수강 내역", shared: "공유 수강권", individual: "개인 수강권", total: "전체 수업", used: "사용한 수업", remaining: "남은 수업", starts: "시작일", duration: "수업 시간", minutes: "{count}분",
    sharedNote: "이 수강권에 등록된 모든 학습자가 남은 수업 횟수를 함께 사용합니다.", unknownStatus: "상태 확인 불가", notSet: "확인 예정", retry: "다시 시도", loadError: "수강 정보를 불러오지 못했습니다. 다시 시도해 주세요.",
    statuses: { pending: "대기 중", contract_review: "계약 확인 중", payment_pending: "결제 대기", active: "수강 중", completed: "완료", cancelled: "취소" },
  },
  zh: {
    portal: "学员中心", title: "一起走过的学习旅程", introduction: "在这里查看学员信息、课程套餐和剩余课时。",
    loginTitle: "欢迎回来。", loginIntro: "登录查看课程和学习记录。", email: "电子邮箱", password: "密码", signIn: "登录", signingIn: "正在登录…", signOut: "退出登录", home: "首页", language: "语言", learners: "学员",
    credentials: "登录失败。请检查邮箱和密码后重试。", unavailable: "此账号暂时无法使用学员中心。请联系 Hamkke。", connection: "无法加载账号信息，请重试。", help: "需要开通账号或找回密码？请联系 Hamkke。",
    noLearners: "正在关联您的学员信息。", noLearnersHelp: "如果您已有课程但这里没有显示，请联系 Hamkke。", noPackages: "暂无课程套餐。", noPackagesHelp: "完成课程登记后，您可以在这里查看。",
    packages: "课程套餐", shared: "共享套餐", individual: "个人套餐", total: "总课时", used: "已用课时", remaining: "剩余课时", starts: "开始日期", duration: "每节课时长", minutes: "{count}分钟", sharedNote: "此套餐内的所有学员共用剩余课时。",
    unknownStatus: "状态暂不可用", notSet: "待确认", retry: "重试", loadError: "无法加载课程套餐，请重试。",
    statuses: { pending: "待处理", contract_review: "合同确认中", payment_pending: "待付款", active: "学习中", completed: "已完成", cancelled: "已取消" },
  },
  ja: {
    portal: "受講者ポータル", title: "一緒に歩む、英語の学び。", introduction: "受講者ごとのコース情報と残りのレッスン数を確認できます。",
    loginTitle: "おかえりなさい。", loginIntro: "ログインしてレッスンや学習記録を確認しましょう。", email: "メールアドレス", password: "パスワード", signIn: "ログイン", signingIn: "ログイン中…", signOut: "ログアウト", home: "ホーム", language: "言語", learners: "受講者",
    credentials: "ログインできませんでした。メールアドレスとパスワードを確認して、もう一度お試しください。", unavailable: "このアカウントではポータルを利用できません。Hamkkeにお問い合わせください。", connection: "アカウント情報を読み込めませんでした。もう一度お試しください。", help: "アカウントの開設やパスワードについては、Hamkkeにお問い合わせください。",
    noLearners: "受講者情報を連携しています。", noLearnersHelp: "受講中のレッスンが表示されない場合は、Hamkkeにお問い合わせください。", noPackages: "登録済みのコースはまだありません。", noPackagesHelp: "受講登録が完了すると、ここに表示されます。",
    packages: "受講コース", shared: "共有パッケージ", individual: "個人パッケージ", total: "合計レッスン数", used: "利用済み", remaining: "残り", starts: "開始日", duration: "レッスン時間", minutes: "{count}分", sharedNote: "このパッケージの残りのレッスン数は、登録された受講者全員で共有しています。",
    unknownStatus: "状況を確認できません", notSet: "確認中", retry: "再試行", loadError: "コース情報を読み込めませんでした。もう一度お試しください。",
    statuses: { pending: "手続き待ち", contract_review: "契約確認中", payment_pending: "お支払い待ち", active: "受講中", completed: "修了", cancelled: "キャンセル済み" },
  },
};
export const portalLanguages = [
  { locale: "en", label: "EN" }, { locale: "ko", label: "한국어" },
  { locale: "zh", label: "中文" }, { locale: "ja", label: "日本語" },
] as const;
