"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ImagePlus, QrCode, Upload, X } from "lucide-react";
import { contactCopy, contactName, QR_METHODS, QR_MAX_BYTES, emptyContact, type ContactDraft } from "@/lib/assessments/contactDetails";
import type { Locale } from "@/lib/i18n";

const UPLOAD_COPY = {
  en: { choose: "Choose QR image", drop: "or drop your image here", replace: "Replace", remove: "Remove", ready: "Ready to upload", preview: "Contact QR preview", failed: "This image cannot be previewed. Please choose another image." },
  ko: { choose: "QR 이미지 선택", drop: "또는 이미지를 여기에 끌어다 놓으세요", replace: "변경", remove: "삭제", ready: "업로드 준비 완료", preview: "연락처 QR 미리보기", failed: "이미지를 미리 볼 수 없습니다. 다른 이미지를 선택해 주세요." },
  zh: { choose: "选择二维码图片", drop: "或将图片拖到这里", replace: "更换", remove: "移除", ready: "可以上传", preview: "联系二维码预览", failed: "无法预览此图片，请选择其他图片。" },
  ja: { choose: "QR画像を選択", drop: "または画像をここにドロップ", replace: "変更", remove: "削除", ready: "アップロード準備完了", preview: "連絡用QRコードのプレビュー", failed: "この画像は表示できません。別の画像を選んでください。" },
};

export default function ContactDetailInput({ method, locale, value, file, email, onChange, onFile }: {
  method: string; locale: Locale; value?: ContactDraft; file?: File; email: string;
  onChange: (value: ContactDraft) => void; onFile: (file?: File) => void;
}) {
  const copy = contactCopy(locale);
  const ui = UPLOAD_COPY[locale];
  const draft = value ?? emptyContact();
  const canQR = (QR_METHODS as readonly string[]).includes(method);
  const teams = method === "microsoft_teams";
  const inputRef = useRef<HTMLInputElement>(null);
  const hintId = useId();
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function chooseFile(next?: File) {
    if (!next) return;
    setDragging(false);
    if (next.size < 1 || next.size > QR_MAX_BYTES ||
        !["image/png", "image/jpeg", "image/webp"].includes(next.type)) {
      setError(copy.invalidQR);
      return;
    }
    setError("");
    onFile(next);
  }

  const inputClass = "w-full rounded-xl border border-[#D8D4CC] bg-white px-4 py-3 text-sm text-[#333B36] outline-none focus:border-[#7F9782] focus:ring-2 focus:ring-[#DDE7DE]";
  const buttonClass = "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7F9782] focus-visible:ring-offset-2";

  return (
    <div className="min-w-0 space-y-4 rounded-2xl border border-[#E2DFD7] bg-[#FAF9F6] p-4 font-sans sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-[#414A44]">{contactName(method)}</p>
        {canQR && (
          <div className="inline-flex max-w-full rounded-xl bg-[#ECEDE7] p-1">
            {(["id", "qr"] as const).map(mode => (
              <button key={mode} type="button" aria-pressed={draft.mode === mode}
                onClick={() => { setError(""); onChange({ ...draft, mode }); }}
                className={buttonClass + " " + (draft.mode === mode
                  ? "bg-white text-[#3E5746] shadow-sm"
                  : "text-[#77756F] hover:text-[#414A44]")}>
                {mode === "qr" && <QrCode size={14} aria-hidden="true" />}
                {mode === "id" ? copy.enter : copy.upload}
              </button>
            ))}
          </div>
        )}
      </div>

      {teams && (
        <label className="flex items-center gap-2 text-sm text-[#414A44]">
          <input key="use-email" type="checkbox" checked={!!draft.useEmail}
            onChange={e => onChange({ ...draft, mode: "id", useEmail: e.target.checked })} />
          {copy.useEmail}
        </label>
      )}

      {draft.mode === "qr" && canQR ? (
        <div key="qr-panel" className="space-y-3">
          <input key="contact-qr-upload" ref={inputRef} type="file"
            accept="image/png,image/jpeg,image/webp" className="hidden"
            aria-label={ui.choose} aria-describedby={hintId}
            onChange={e => {
              chooseFile(e.target.files?.[0]);
              e.target.value = "";
            }} />

          {file ? (
            <div className="flex flex-col gap-4 rounded-xl border border-[#DCE5DA] bg-white p-4 sm:flex-row sm:items-center">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center self-center rounded-lg border border-[#ECEDE7] bg-white p-2 sm:self-auto">
                {preview ? (
                  // A local object URL is used only for the selected image preview.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt={ui.preview} className="h-full w-full object-contain"
                    onError={() => { setError(ui.failed); onFile(undefined); }} />
                ) : <QrCode size={32} className="text-[#7F9782]" aria-hidden="true" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-xs font-medium text-[#66816A]">
                  <Check size={14} aria-hidden="true" />{ui.ready}
                </p>
                <p className="mt-2 break-all text-sm text-[#414A44]">{file.name}</p>
                <p className="mt-1 text-xs text-[#8A8A83]">{Math.max(1, Math.round(file.size / 1024))} KB</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className={buttonClass + " border border-[#D8DFD5] text-[#506852] hover:bg-[#F0F4ED]"}
                    onClick={() => inputRef.current?.click()}>
                    <Upload size={13} aria-hidden="true" />{ui.replace}
                  </button>
                  <button type="button" className={buttonClass + " text-[#7D746D] hover:bg-[#F5F0EC]"}
                    onClick={() => { setError(""); onFile(undefined); }}>
                    <X size={13} aria-hidden="true" />{ui.remove}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button type="button" aria-describedby={hintId}
              onClick={() => inputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); chooseFile(e.dataTransfer.files?.[0]); setDragging(false); }}
              className={"flex w-full flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-7 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7F9782] " +
                (dragging ? "border-[#6F8F72] bg-[#E7EEE3]" : "border-[#BDCCB9] bg-[#F2F5EE] hover:bg-[#EAF0E5]")}>
              <span className="mb-1 rounded-full bg-white p-3 text-[#789172]"><ImagePlus size={22} strokeWidth={1.5} aria-hidden="true" /></span>
              <span className="text-sm font-medium text-[#435C49]">{ui.choose}</span>
              <span className="text-xs text-[#8A8A83]">{ui.drop}</span>
            </button>
          )}
          <p id={hintId} className="text-xs leading-5 text-[#8A8A83]">{copy.qrHelp}</p>
          {error && <p role="alert" className="text-xs leading-5 text-[#9A5149]">{error}</p>}
        </div>
      ) : teams && draft.useEmail ? (
        <p key="email-summary" className="break-all text-sm text-[#77756F]">{email || copy.useEmail}</p>
      ) : (
        <label key="id-panel" className="block space-y-2 text-sm">
          <span className="text-[#59615A]">{teams ? copy.teams : method === "whatsapp" ? copy.phone : copy.id}</span>
          <input key="contact-id-input" type={method === "whatsapp" ? "tel" : "text"}
            value={draft.text ?? ""} maxLength={200} autoComplete="off" required
            onChange={e => onChange({ ...draft, text: e.target.value })}
            className={inputClass} />
          {canQR && <span className="block text-xs leading-5 text-[#8A8A83]">{copy.idHelp}</span>}
        </label>
      )}
    </div>
  );
}
