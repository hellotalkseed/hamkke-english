"use client";

import { useEffect, useId, useRef, type RefObject } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { portalMessages } from "@/lib/portal/messages";
import PortalLoginForm from "@/components/portal/PortalLoginForm";

const closeLabels: Record<Locale, string> = {
  en: "Close login",
  ko: "로그인 창 닫기",
  zh: "关闭登录窗口",
  ja: "ログイン画面を閉じる",
};

interface PortalLoginModalProps {
  id: string;
  locale: Locale;
  onDismiss: () => void;
  returnFocusRef: RefObject<HTMLElement | null>;
}

// Mounted only after a Login button is pressed in the browser.
export default function PortalLoginModal({
  id,
  locale,
  onDismiss,
  returnFocusRef,
}: PortalLoginModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const descriptionId = useId();
  const t = portalMessages[locale];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const returnFocus = returnFocusRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Native modal behavior makes the rest of the document inert
    // and keeps keyboard navigation inside the dialog.
    dialog.showModal();
    // Focus the heading so mobile users can read the introduction
    // before the on-screen keyboard opens.
    dialog.querySelector<HTMLElement>("[data-login-heading]")?.focus();

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    };
  }, [returnFocusRef]);

  return createPortal(
    <dialog
      id={id}
      ref={dialogRef}
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < rect.left || event.clientX > rect.right ||
          event.clientY < rect.top || event.clientY > rect.bottom
        ) onDismiss();
      }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[540px] overflow-hidden rounded-2xl border border-[#E7DDD1] bg-[#FFFDF8] p-0 text-[#293A30] shadow-2xl backdrop:bg-[#1F3027]/50 backdrop:backdrop-blur-sm sm:rounded-3xl"
    >
      <div className="relative px-6 pb-6 pt-7 sm:px-9 sm:pb-7 sm:pt-8">
        <button
          type="button"
          onClick={onDismiss}
          aria-label={closeLabels[locale]}
          className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full text-[#607568] transition-colors hover:bg-[#EEF2EA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#718A73] sm:right-3 sm:top-3"
        >
          <X size={21} strokeWidth={1.8} aria-hidden="true" />
        </button>
        <p className="pr-9 text-xs font-semibold uppercase tracking-[0.18em] text-[#718A73]">{t.loginBrand}</p>
        <h2 id={headingId} tabIndex={-1} data-login-heading
          className="mt-3 font-serif text-4xl leading-tight outline-none sm:text-5xl">
          {t.loginTitle}
        </h2>
        <p id={descriptionId} className="mt-3 leading-7 text-[#607568]">{t.loginIntro}</p>
        <PortalLoginForm locale={locale} denied={false} />
      </div>
    </dialog>,
    document.body
  );
}
