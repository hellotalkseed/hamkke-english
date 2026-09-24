"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Locale } from "@/lib/i18n";

const copy = {
  en: { title: "Create your password", intro: "Your Hamkke student portal account is ready. Create a password to finish setting up your account.", password: "New password", confirm: "Confirm password", save: "Create password", saving: "Saving...", short: "Use at least 8 characters.", mismatch: "The passwords do not match.", invalid: "This invitation is invalid or has expired. Please ask your teacher for a new invitation.", error: "We could not finish setting up your account. Please try again.", verify: "Your password was saved, but we could not sign you in automatically. Please use Forgot password if needed.", wrongAccount: "Another Hamkke account was already signed in on this device. For security, we did not make any changes. Please ask your teacher to send you a new invitation, then open the new invitation after signing out of any other Hamkke account." },
  ko: { title: "비밀번호 만들기", intro: "Hamkke 학생 포털 계정이 준비되었습니다. 계정 설정을 완료하려면 비밀번호를 만들어 주세요.", password: "새 비밀번호", confirm: "비밀번호 확인", save: "비밀번호 만들기", saving: "저장 중...", short: "8자 이상 입력해 주세요.", mismatch: "비밀번호가 일치하지 않습니다.", invalid: "초대 링크가 유효하지 않거나 만료되었습니다. 선생님께 새 초대 링크를 요청해 주세요.", error: "계정 설정을 완료할 수 없습니다. 다시 시도해 주세요.", verify: "비밀번호는 저장되었지만 자동 로그인할 수 없습니다. 필요한 경우 비밀번호 찾기를 이용해 주세요.", wrongAccount: "이 기기에 다른 Hamkke 계정이 로그인되어 있었습니다. 보안을 위해 아무것도 변경하지 않았습니다. 선생님께 새 초대 링크를 요청한 뒤, 다른 Hamkke 계정에서 로그아웃한 상태로 새 초대 링크를 열어 주세요." },
  zh: { title: "创建密码", intro: "您的 Hamkke 学生门户账户已准备好。请创建密码以完成账户设置。", password: "新密码", confirm: "确认密码", save: "创建密码", saving: "保存中...", short: "密码至少需要 8 个字符。", mismatch: "两次输入的密码不一致。", invalid: "邀请链接无效或已过期。请联系老师重新发送邀请。", error: "无法完成账户设置，请重试。", verify: "密码已保存，但无法自动登录。如有需要，请使用忘记密码功能。", wrongAccount: "此设备上已有另一个 Hamkke 账户登录。为确保安全，我们没有进行任何更改。请联系老师重新发送邀请，并在退出其他 Hamkke 账户后打开新的邀请链接。" },
  ja: { title: "パスワードを作成", intro: "Hamkkeの生徒ポータルアカウントの準備ができました。パスワードを作成して設定を完了してください。", password: "新しいパスワード", confirm: "パスワードを確認", save: "パスワードを作成", saving: "保存中...", short: "8文字以上で入力してください。", mismatch: "パスワードが一致しません。", invalid: "招待リンクが無効か期限切れです。先生に新しい招待を依頼してください。", error: "アカウント設定を完了できませんでした。もう一度お試しください。", verify: "パスワードは保存されましたが、自動ログインできませんでした。必要に応じてパスワードを再設定してください。", wrongAccount: "この端末では別の Hamkke アカウントにサインインしていました。安全のため、変更は行っていません。先生に新しい招待を依頼し、他の Hamkke アカウントからサインアウトした状態で新しい招待リンクを開いてください。" },
} as const;

export default function PortalInviteSetupForm({ locale, expectedEmail, initialInvalid = false }: { locale: Locale; expectedEmail: string; initialInvalid?: boolean }) {
  const t = copy[locale];
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialInvalid ? t.invalid : "");
  const [blocked, setBlocked] = useState(initialInvalid);
  const input = "mt-2 w-full rounded-xl border border-[#DCD8D2] bg-[#FFFDF8] px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#718A73]";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || blocked) return;
    const values = new FormData(event.currentTarget);
    const password = String(values.get("password") ?? "");
    const confirm = String(values.get("confirm") ?? "");
    setError("");
    if (password.length < 8) { setError(t.short); return; }
    if (password !== confirm) { setError(t.mismatch); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) { setError(t.invalid); return; }
      const email = user.email;
      if (!email) { setError(t.invalid); return; }

      // Never let an invitation setup page change the password of a different
      // Hamkke account that happens to already be signed in on this browser.
      const normalizedExpectedEmail = expectedEmail.trim().toLowerCase();
      if (!normalizedExpectedEmail || email.trim().toLowerCase() !== normalizedExpectedEmail) {
        await supabase.auth.signOut({ scope: "local" });
        setBlocked(true);
        setError(t.wrongAccount);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) { setError(updateError.message || t.error); return; }

      // Verify the newly created password immediately instead of assuming the
      // update succeeded. This also establishes a fresh password-authenticated
      // session before entering the portal.
      const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
      if (signOutError) { setError(t.verify); return; }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) { setError(t.verify); return; }

      const activation = await fetch("/api/portal/setup-complete", { method: "POST" });
      if (!activation.ok) { setError(t.error); return; }

      router.replace(`/${locale}/portal`);
      router.refresh();
    } catch { setError(t.error); }
    finally { setLoading(false); }
  }

  return (
    <>
      <h1 className="font-serif text-4xl leading-tight sm:text-5xl">{t.title}</h1>
      <p className="mt-5 leading-7 text-[#607568]">{t.intro}</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <div><label htmlFor="invite-password" className="text-sm">{t.password}</label><input id="invite-password" name="password" type="password" autoComplete="new-password" minLength={8} required disabled={blocked} className={input} /></div>
        <div><label htmlFor="invite-confirm" className="text-sm">{t.confirm}</label><input id="invite-confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required disabled={blocked} className={input} /></div>
        {error && <p role="alert" className="rounded-xl bg-[#F6EAE4] p-4 text-sm leading-6 text-[#874C3D]">{error}</p>}
        <button type="submit" disabled={loading || blocked} className="min-h-12 w-full rounded-full bg-[#31463A] px-6 py-3 font-semibold text-white disabled:opacity-60">{loading ? t.saving : t.save}</button>
      </form>
    </>
  );
}
