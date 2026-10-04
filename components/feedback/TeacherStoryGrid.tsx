"use client";

import Image from "next/image";
import styles from "./TeacherStoryGrid.module.css";
import { useId, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { feedbackMessages } from "@/lib/feedback/messages";

type Story = {
  id: string;
  name: string;
  role: string | null;
  country: string | null;
  rating: number | null;
  reflection: string;
  created_at: string | null;
  learning_context?: string | null;
  photo_url?: string | null;
};

const labels = {
  en: { more: "Read more", close: "Close", rating: "Rating" },
  ko: { more: "더 읽기", close: "닫기", rating: "평점" },
  zh: { more: "阅读更多", close: "关闭", rating: "评分" },
  ja: { more: "続きを読む", close: "閉じる", rating: "評価" },
};
const backgrounds = ["#E2EADB", "#F0E5D4", "#EEDFDA", "#E0E9E8"];

export default function TeacherStoryGrid({ stories, locale }: { stories: Story[]; locale: Locale }) {
  const [selected, setSelected] = useState<Story | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const t = feedbackMessages[locale];
  const copy = labels[locale];
  const role = (value: string | null) => value === "Student" ? t.student : value === "Parent / Guardian" ? t.parent : value;
  const date = (value: string | null) => value && !Number.isNaN(Date.parse(value))
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "Asia/Manila" }).format(new Date(value)) : "";
  function open(story: Story) {
    setSelected(story);
    dialog.current?.showModal();
  }
  return <>
    <div className={styles.grid}>
      {stories.map((story, index) => <article key={story.id} className="flex min-w-0 flex-col rounded-[24px] p-6 text-[#304A39]" style={{ backgroundColor: backgrounds[index % backgrounds.length] }}>
        <span aria-hidden="true" className="h-6 font-sans text-2xl leading-none text-[#718A73]">“</span>
        <p className="mt-3 line-clamp-5 break-words font-sans text-base font-normal leading-7">{story.reflection}</p>
        <button type="button" onClick={() => open(story)} aria-label={`${copy.more}: ${story.name}`} className="mt-3 self-start border-b border-[#A8BCA5] text-xs text-[#526D57] hover:text-[#304A39] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#526D57]">{copy.more}</button>
        <div className="mt-auto pt-5"><div aria-hidden="true" className="mb-3 h-px w-8 bg-[#A8BCA5]/60" />
          <div className="flex items-end justify-between gap-3"><div className="min-w-0"><p className="break-words text-sm font-medium">{story.name}</p><p className="mt-1 text-xs leading-5 text-[#607568]">{[role(story.role), story.country].filter(Boolean).join(" · ")}</p>{story.learning_context === "elsewhere" && <p className="mt-1 text-xs text-[#607568]">{t.externalLabel}</p>}</div>
          {story.photo_url && <Image src={story.photo_url} alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-full object-cover" />}</div>
        </div>
      </article>)}
    </div>
    <dialog ref={dialog} aria-labelledby={headingId} onClose={() => setSelected(null)} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-2xl overflow-y-auto rounded-3xl border border-[#DCE4D7] bg-[#FFFDF8] p-0 text-[#304A39] shadow-xl backdrop:bg-[#203126]/45">
      <div className="p-6 sm:p-9"><div className="flex items-start justify-between gap-4"><h2 id={headingId} className="break-words font-sans text-lg font-semibold">{selected?.name}</h2><button type="button" autoFocus onClick={() => dialog.current?.close()} className="shrink-0 rounded-full border border-[#C7D4C1] px-4 py-2 text-sm hover:bg-[#E5EBDD] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#526D57]">{copy.close}</button></div>
        {selected && <><p className="mt-2 text-sm text-[#607568]">{[role(selected.role), selected.country, date(selected.created_at)].filter(Boolean).join(" · ")}</p>{selected.rating != null && <p className="mt-3 text-sm text-[#607568]">{copy.rating}: {selected.rating} / 5</p>}{selected.learning_context === "elsewhere" && <p className="mt-3 text-sm text-[#607568]">{t.externalLabel}</p>}<p className="mt-6 whitespace-pre-wrap break-words font-sans text-base leading-7">{selected.reflection}</p></>}
      </div>
    </dialog>
  </>;
}
