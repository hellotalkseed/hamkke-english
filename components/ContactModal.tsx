"use client";
import { X } from "lucide-react";
import ContactForm from "./ContactForm";
import type { Locale } from "../lib/i18n";

export default function ContactModal({ isOpen, onClose, locale }: { isOpen: boolean; onClose: () => void; locale: Locale }) {
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#253026]/45 p-4 backdrop-blur-[4px] sm:p-6" role="presentation" onClick={onClose}>
    <div className="flex min-h-full items-center justify-center">
      <div role="dialog" aria-modal="true" className="relative w-full max-w-[600px] rounded-[28px] bg-[#FAF9F6] shadow-[0_24px_80px_rgba(40,55,42,0.22)]" onClick={e=>e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Close contact form" className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF3EB] text-[#6F8F72] hover:bg-[#E2EBDF]"><X size={18}/></button>
        <ContactForm locale={locale}/>
      </div>
    </div>
  </div>;
}
