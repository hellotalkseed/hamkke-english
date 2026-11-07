"use client";

import { useEffect, useState } from "react";
import { Check, MessageCircle, Pencil, QrCode } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { contactCopy, type ContactDraft } from "@/lib/assessments/contactDetails";

const COPY = {
  en: { title: "KakaoTalk contact", shared: "Shared with your contact details", missing: "Add your KakaoTalk ID or QR code in Contact details.", qr: "QR image selected", preview: "KakaoTalk QR preview", add: "Add details" },
  ko: { title: "카카오톡 연락처", shared: "입력한 연락처 정보를 함께 사용합니다", missing: "연락처 정보에 카카오톡 ID 또는 QR 코드를 추가해 주세요.", qr: "QR 이미지 선택됨", preview: "카카오톡 QR 미리보기", add: "정보 추가" },
  zh: { title: "KakaoTalk 联系方式", shared: "使用已填写的联系方式", missing: "请在联系信息中添加 KakaoTalk ID 或二维码。", qr: "已选择二维码图片", preview: "KakaoTalk 二维码预览", add: "添加信息" },
  ja: { title: "KakaoTalkの連絡先", shared: "入力済みの連絡先情報を使用します", missing: "連絡先情報にKakaoTalk IDまたはQRコードを追加してください。", qr: "QR画像を選択済み", preview: "KakaoTalk QRプレビュー", add: "情報を追加" },
};

export default function SharedContactSummary({ locale, draft, file, onEdit }: {
  locale: Locale; draft?: ContactDraft; file?: File; onEdit: () => void;
}) {
  const ui = COPY[locale];
  const copy = contactCopy(locale);
  const isQR = draft?.mode === "qr";
  const text = draft?.text?.trim() ?? "";
  const ready = isQR ? !!file : !!text;
  const [preview, setPreview] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    if (!isQR || !file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [isQR, file]);

  return (
    <div className="rounded-2xl border border-[#DCE4D9] bg-[#F3F6F0] p-4 font-sans sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#71866D]">
          <MessageCircle size={18} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[#414A44]">{ui.title}</p>
          <p className="mt-1 text-xs leading-5 text-[#7B8378]">{ui.shared}</p>
        </div>
        <button type="button" onClick={onEdit}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#D2DCCD] bg-white px-3 py-2 text-xs font-medium text-[#506852] transition hover:bg-[#E9EFE4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7F9782]">
          <Pencil size={12} aria-hidden="true" />{ready ? copy.edit : ui.add}
        </button>
      </div>
      {ready ? (
        <div className="mt-4 flex items-center gap-4 rounded-xl border border-[#E1E7DD] bg-white p-3">
          {isQR && (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-[#ECEDE7] p-1.5">
              {preview && !failed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt={ui.preview} onError={() => setFailed(true)}
                  className="h-full w-full object-contain" />
              ) : <QrCode size={24} className="text-[#789172]" aria-hidden="true" />}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-xs text-[#71866D]">
              <Check size={13} aria-hidden="true" />{isQR ? ui.qr : copy.id}
            </p>
            <p className="mt-1 break-all text-sm text-[#414A44]">{isQR ? file?.name : text}</p>
          </div>
        </div>
      ) : <p className="mt-4 text-sm leading-6 text-[#77756F]">{ui.missing}</p>}
    </div>
  );
}
