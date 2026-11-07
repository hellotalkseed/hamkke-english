import type { Locale } from "@/lib/i18n";

export const CONTACT_METHODS = ["email", "kakaotalk", "wechat", "whatsapp", "line"] as const;
export const QR_METHODS = ["kakaotalk", "wechat", "line"] as const;
export const QR_MAX_BYTES = 1024 * 1024;
export const QR_BUCKET = "assessment-contact-qr";
export type ContactMethod = (typeof CONTACT_METHODS)[number];
export type ContactEntry = { mode: "id" | "qr"; value: string | null; qr_path: string | null };
export type ContactDetails = Record<string, ContactEntry>;
export type ContactDraft = { mode: "id" | "qr"; text: string; useEmail?: boolean };
export type ContactDrafts = Record<string, ContactDraft>;
export const emptyContact = (): ContactDraft => ({ mode: "id", text: "" });
const CONTACT_NAMES: Record<string, string> = {
  email: "Email", kakaotalk: "KakaoTalk", wechat: "WeChat",
  whatsapp: "WhatsApp", line: "LINE", microsoft_teams: "Microsoft Teams",
};
export const contactName = (method: string) => CONTACT_NAMES[method] ?? method;

const COPY = {
  en: {
    method: "How would you prefer us to contact you?", id: "ID or profile link",
    phone: "Phone number with country code", teams: "Teams email or ID",
    enter: "Enter ID", upload: "Upload QR code", useEmail: "Use my email above",
    qrHelp: "PNG, JPG or WebP, up to 1 MB. Upload only your contact QR code.",
    idHelp: "Use your ID or profile link, not your display name.",
    shared: "Using your KakaoTalk details from Contact details.", edit: "Edit",
    qrSaved: "QR code uploaded", required: "Please enter contact details for",
    invalidPhone: "Enter a phone number with + and country code (7–15 digits).",
    invalidQR: "Choose a PNG, JPG or WebP QR image, up to 1 MB.",
    tooLong: "Contact details must be 200 characters or fewer.",
  },
  ko: {
    method: "어떤 방법으로 연락받고 싶으신가요?", id: "ID 또는 프로필 링크",
    phone: "국가번호를 포함한 전화번호", teams: "Teams 이메일 또는 ID",
    enter: "ID 입력", upload: "QR 코드 업로드", useEmail: "위에 입력한 이메일 사용",
    qrHelp: "PNG, JPG 또는 WebP, 최대 1MB. 연락용 QR 코드만 업로드해 주세요.",
    idHelp: "프로필 이름이 아닌 ID 또는 프로필 링크를 입력해 주세요.",
    shared: "연락처에 입력한 카카오톡 정보를 사용합니다.", edit: "수정",
    qrSaved: "QR 코드 업로드됨", required: "다음 앱의 연락처를 입력해 주세요:",
    invalidPhone: "+와 국가번호를 포함한 전화번호를 입력해 주세요(7~15자리).",
    invalidQR: "1MB 이하의 PNG, JPG 또는 WebP QR 이미지를 선택해 주세요.",
    tooLong: "연락처는 200자 이내로 입력해 주세요.",
  },
  zh: {
    method: "您希望我们通过哪种方式联系您？", id: "ID 或个人资料链接",
    phone: "包含国家区号的电话号码", teams: "Teams 邮箱或 ID",
    enter: "输入 ID", upload: "上传二维码", useEmail: "使用上面填写的邮箱",
    qrHelp: "PNG、JPG 或 WebP，最大 1 MB。请仅上传联系二维码。",
    idHelp: "请输入 ID 或个人资料链接，而不是昵称。",
    shared: "使用您在联系信息中填写的 KakaoTalk 信息。", edit: "编辑",
    qrSaved: "已上传二维码", required: "请填写以下应用的联系信息：",
    invalidPhone: "请输入以 + 和国家区号开头的电话号码（7–15位数字）。",
    invalidQR: "请选择不超过 1 MB 的 PNG、JPG 或 WebP 二维码图片。",
    tooLong: "联系信息不能超过200个字符。",
  },
  ja: {
    method: "ご希望の連絡方法を選んでください。", id: "IDまたはプロフィールリンク",
    phone: "国番号を含む電話番号", teams: "TeamsのメールアドレスまたはID",
    enter: "IDを入力", upload: "QRコードをアップロード", useEmail: "上記のメールアドレスを使用",
    qrHelp: "PNG、JPG、WebP形式、最大1MB。連絡用QRコードのみアップロードしてください。",
    idHelp: "表示名ではなくIDまたはプロフィールリンクを入力してください。",
    shared: "連絡先に入力したカカオトーク情報を使用します。", edit: "編集",
    qrSaved: "QRコードをアップロード済み", required: "次のアプリの連絡先を入力してください：",
    invalidPhone: "+と国番号を含む電話番号を入力してください（7～15桁）。",
    invalidQR: "1MB以下のPNG、JPG、WebP形式のQR画像を選択してください。",
    tooLong: "連絡先は200文字以内で入力してください。",
  },
} satisfies Record<Locale, Record<string, string>>;
export const contactCopy = (locale: Locale) => COPY[locale];

export function requiredContactMethods(contactMethod: string, platform: string) {
  return Array.from(new Set([
    ...(contactMethod !== "email" ? [contactMethod] : []),
    ...(["kakaotalk", "microsoft_teams"].includes(platform) ? [platform] : []),
  ]));
}

export function validateContactDrafts(
  method: string, platform: string, email: string,
  drafts: ContactDrafts, files: Record<string, { size: number; type: string } | undefined>,
  locale: Locale
): string | null {
  const copy = contactCopy(locale);
  if (!(CONTACT_METHODS as readonly string[]).includes(method)) return copy.method;
  for (const key of requiredContactMethods(method, platform)) {
    const d = drafts[key] ?? emptyContact();
    if (d.mode === "qr") {
      const f = files[key];
      if (!(QR_METHODS as readonly string[]).includes(key) || !f || f.size < 1 ||
          f.size > QR_MAX_BYTES || !["image/png", "image/jpeg", "image/webp"].includes(f.type)) return copy.invalidQR;
    } else {
      const value = (key === "microsoft_teams" && d.useEmail ? email : d.text).trim();
      if (!value) return copy.required + " " + contactName(key);
      if (value.length > (key === "microsoft_teams" && d.useEmail ? 320 : 200)) return copy.tooLong;
      if (key === "whatsapp" && !/^\+[1-9]\d{6,14}$/.test(value.replace(/[\s()-]/g, ""))) return copy.invalidPhone;
    }
  }
  return null;
}
