import type { Locale } from "@/lib/i18n";

type ContactCopy = {
  teamsLabel: string;
  kakaoLabel: string;
  teamsHelp: string;
  kakaoHelp: string;
  teamsRequired: string;
  kakaoRequired: string;
};

const COPY: Record<Locale, ContactCopy> = {
  en: {
    teamsLabel: "Teams email or ID",
    kakaoLabel: "KakaoTalk ID",
    teamsHelp: "Enter the email address or ID you use for Microsoft Teams so your teacher can contact you.",
    kakaoHelp: "Enter your KakaoTalk ID, not your display name, so your teacher can add you.",
    teamsRequired: "Please enter your Teams email or ID.",
    kakaoRequired: "Please enter your KakaoTalk ID.",
  },
  ko: {
    teamsLabel: "Teams 이메일 또는 ID",
    kakaoLabel: "카카오톡 ID",
    teamsHelp: "선생님이 연락할 수 있도록 Microsoft Teams에서 사용하는 이메일 주소 또는 ID를 입력해 주세요.",
    kakaoHelp: "선생님이 친구로 추가할 수 있도록 프로필 이름이 아닌 카카오톡 ID를 입력해 주세요.",
    teamsRequired: "Teams 이메일 또는 ID를 입력해 주세요.",
    kakaoRequired: "카카오톡 ID를 입력해 주세요.",
  },
  zh: {
    teamsLabel: "Teams 邮箱或 ID",
    kakaoLabel: "KakaoTalk ID",
    teamsHelp: "请输入您在 Microsoft Teams 使用的邮箱或 ID，方便老师联系您。",
    kakaoHelp: "请输入您的 KakaoTalk ID，而不是昵称，方便老师添加您。",
    teamsRequired: "请输入您的 Teams 邮箱或 ID。",
    kakaoRequired: "请输入您的 KakaoTalk ID。",
  },
  ja: {
    teamsLabel: "TeamsのメールアドレスまたはID",
    kakaoLabel: "カカオトークID",
    teamsHelp: "先生が連絡できるよう、Microsoft Teamsで使用しているメールアドレスまたはIDを入力してください。",
    kakaoHelp: "先生が友だち追加できるよう、表示名ではなくカカオトークIDを入力してください。",
    teamsRequired: "TeamsのメールアドレスまたはIDを入力してください。",
    kakaoRequired: "カカオトークIDを入力してください。",
  },
};

export function getPlatformContact(platform: string, locale: Locale = "en") {
  const copy = COPY[locale];
  if (platform === "microsoft_teams") {
    return { label: copy.teamsLabel, help: copy.teamsHelp, requiredMessage: copy.teamsRequired };
  }
  if (platform === "kakaotalk") {
    return { label: copy.kakaoLabel, help: copy.kakaoHelp, requiredMessage: copy.kakaoRequired };
  }
  return null;
}

// Ignore stale contact IDs from platforms that do not require one.
export function normalizePlatformContact(platform: string, value: unknown) {
  if (!getPlatformContact(platform)) return null;
  return typeof value === "string" ? value.trim() || null : null;
}
