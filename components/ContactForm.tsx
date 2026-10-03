"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import type { Locale } from "../lib/i18n";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

type Props = {
  locale: Locale;
  onSubmitted?: () => void;
};

const copy = {
  en: {
    title: "Have a question?",
    intro:
      "Send Hamkke a message and we'll get back to you as soon as we can.",
    name: "Your name",
    email: "Email address",
    message: "How can we help?",
    send: "Send message",
    sending: "Sending…",
    success: "Message sent.",
    successBody:
      "Thank you for reaching out. We'll get back to you soon.",
    error:
      "We couldn't send your message right now. Please try again.",
  },
  ko: {
    title: "궁금한 점이 있으신가요?",
    intro:
      "Hamkke에 메시지를 남겨 주세요. 확인 후 답변드릴게요.",
    name: "이름",
    email: "이메일 주소",
    message: "어떤 도움이 필요하신가요?",
    send: "메시지 보내기",
    sending: "보내는 중…",
    success: "메시지를 보냈어요.",
    successBody:
      "문의해 주셔서 감사합니다. 확인 후 답변드릴게요.",
    error:
      "지금은 메시지를 보낼 수 없어요. 다시 시도해 주세요.",
  },
  zh: {
    title: "有问题想咨询吗？",
    intro: "给 Hamkke 留言，我们会尽快回复你。",
    name: "姓名",
    email: "电子邮箱",
    message: "我们可以如何帮助你？",
    send: "发送消息",
    sending: "发送中…",
    success: "消息已发送。",
    successBody: "感谢你的联系，我们会尽快回复。",
    error: "暂时无法发送消息，请稍后再试。",
  },
  ja: {
    title: "ご質問がありますか？",
    intro:
      "Hamkkeへメッセージをお送りください。確認後、できるだけ早くご返信します。",
    name: "お名前",
    email: "メールアドレス",
    message: "どのようなご相談ですか？",
    send: "メッセージを送る",
    sending: "送信中…",
    success: "メッセージを送信しました。",
    successBody:
      "お問い合わせありがとうございます。確認後、ご返信します。",
    error:
      "現在メッセージを送信できません。もう一度お試しください。",
  },
} as const;

export default function ContactForm({
  locale,
  onSubmitted,
}: Props) {
  const t = copy[locale] ?? copy.en;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] =
    useState("");

  const turnstileContainerRef =
    useRef<HTMLDivElement | null>(null);

  const turnstileWidgetIdRef =
    useRef<string | null>(null);

  useEffect(() => {
    const siteKey =
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

    if (!siteKey) {
      console.error(
        "NEXT_PUBLIC_TURNSTILE_SITE_KEY is not configured."
      );
      return;
    }

    function renderTurnstile() {
      if (
        !window.turnstile ||
        !turnstileContainerRef.current ||
        turnstileWidgetIdRef.current
      ) {
        return;
      }

      turnstileWidgetIdRef.current =
        window.turnstile.render(
          turnstileContainerRef.current,
          {
            sitekey: siteKey,
            theme: "light",

            callback: (token) => {
              setTurnstileToken(token);
              setError("");
            },

            "expired-callback": () => {
              setTurnstileToken("");
            },

            "error-callback": () => {
              setTurnstileToken("");
            },
          }
        );
    }

    const scriptSelector =
      'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"]';

    const existingScript =
      document.querySelector<HTMLScriptElement>(
        scriptSelector
      );

    let addedScript: HTMLScriptElement | null = null;

    if (existingScript) {
      if (window.turnstile) {
        renderTurnstile();
      } else {
        existingScript.addEventListener(
          "load",
          renderTurnstile
        );
      }
    } else {
      const script =
        document.createElement("script");

      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

      script.async = true;
      script.defer = true;

      script.addEventListener(
        "load",
        renderTurnstile
      );

      document.head.appendChild(script);
      addedScript = script;
    }

    return () => {
      existingScript?.removeEventListener(
        "load",
        renderTurnstile
      );

      addedScript?.removeEventListener(
        "load",
        renderTurnstile
      );

      if (
        window.turnstile &&
        turnstileWidgetIdRef.current
      ) {
        window.turnstile.remove(
          turnstileWidgetIdRef.current
        );

        turnstileWidgetIdRef.current = null;
      }
    };
  }, []);

  async function submit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!turnstileToken) {
      setError(t.error);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
          contactMethod: "email",
          contactId: email,
          level: "",
          goal: "",
          inquirySource: "start-a-conversation",
          turnstileToken,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error();
      }

      setSubmitted(true);
      onSubmitted?.();
    } catch {
      setError(t.error);

      setTurnstileToken("");

      if (
        window.turnstile &&
        turnstileWidgetIdRef.current
      ) {
        window.turnstile.reset(
          turnstileWidgetIdRef.current
        );
      }
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="px-6 py-14 text-center">
        <CheckCircle2
          className="mx-auto h-12 w-12 text-[#6F8F72]"
          strokeWidth={1.5}
        />

        <h2 className="mt-5 font-serif text-3xl text-[#31463A]">
          {t.success}
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#607568]">
          {t.successBody}
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-2xl border border-[#DDE5D9] bg-white px-4 py-3.5 text-sm text-[#2B2B2B] outline-none transition focus:border-[#6F8F72] focus:ring-2 focus:ring-[#6F8F72]/10";

  return (
    <form
      onSubmit={submit}
      className="p-6 sm:p-8"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6F8F72]">
        Hamkke │ 함께
      </p>

      <h2 className="mt-3 font-serif text-3xl text-[#31463A] sm:text-4xl">
        {t.title}
      </h2>

      <p className="mt-2 max-w-lg text-sm leading-6 text-[#607568]">
        {t.intro}
      </p>

      <div className="mt-7 space-y-3">
        <input
          className={field}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.name}
          required
        />

        <input
          className={field}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.email}
          required
        />

        <textarea
          className={`${field} min-h-32 resize-y`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t.message}
          required
        />
      </div>

      <div
        ref={turnstileContainerRef}
        className="mt-4 flex min-h-[65px] justify-center"
      />

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-xl bg-[#F6EAE4] p-3 text-sm text-[#874C3D]"
        >
          {error}
        </p>
      )}

      <button
        disabled={loading || !turnstileToken}
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#31463A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#465D4D] disabled:opacity-60"
      >
        {loading ? t.sending : t.send}
        {!loading && <Send size={16} />}
      </button>
    </form>
  );
}
