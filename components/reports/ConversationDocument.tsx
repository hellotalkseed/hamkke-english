"use client";

import { familyLabel } from "@/lib/reports/familyLabels";
import { hasTranslation,isFamilyLanguage, type TermAssessment } from "@/lib/reports/termAssessment";
import "./conversation-document.css";

const skills = [
  ["comprehension", "Listening and responding"],
  ["interaction", "Conversation and turn-taking"],
  ["expression", "Expressing ideas"],
  ["language", "Vocabulary and grammar"],
  ["clarity", "Fluency and pronunciation"],
] as const;

export default function ConversationDocument({ data:original, student, enrollment, teacher }: {
  data: TermAssessment; student: string; enrollment: string; teacher: string;
}) {
  const data=original;
  const language=hasTranslation(data) && isFamilyLanguage(data.familyLanguage) ? data.familyLanguage : undefined;
  function pair(english:string|undefined, translated:string|undefined) {
    return <>{english}{language && translated && translated.trim()!==english?.trim() &&
      <span className="ht-translation" lang={language}>{translated}</span>}</>;
  }
  const t=(text:string)=>pair(text,language?familyLabel(text,language):undefined);
  const value=(key:string)=>pair(data[key],data["translated_"+key]);
  const observed=skills.filter(([key])=>data[key]?.trim());
  const participation=[["Attendance","attendance"],["Participation","participation"],["Speaking initiative","initiative"]].filter(([,key])=>data[key]?.trim());
  return <article lang="en" className="hamkke-progress-print hamkke-term">
    <header className="contract-report-head">
      <div className="report-identity"><img src="/logo/hamkke-icon.svg" alt="" width="42" height="42"/><div><div className="contract-wordmark">Hamkke │ <span lang="ko">함께</span></div><p>From Small Talk to Big Ideas</p></div></div>
      <div className="report-period"><p>Term covered</p><span>{data.period || enrollment}</span></div>
    </header>
    <div className="report-intro"><h1>End-of-Term Conversation Report</h1><div className="ht-byline"><b>{data.studentName || student}</b><span>Teacher · {teacher}</span></div></div>
    <dl className="ht-details"><div><dt>Lesson package</dt><dd>{data.packageName || enrollment}</dd></div>
      {data.level && <div><dt>CEFR level</dt><dd>{data.level}</dd></div>}
      {data.book && <div><dt>Materials</dt><dd>{data.book}</dd></div>}</dl>
    {data.strengths && <section className="ht-finding"><h2>{t("Progress this term")}</h2><p>{value("strengths")}</p></section>}
    {observed.length > 0 && <section className="ht-skills"><h2>{t("Conversation skills")}</h2><dl>{observed.map(([key,label])=><div key={key}><dt>{t(label)}</dt><dd>{value(key)}</dd></div>)}</dl></section>}
    {participation.length>0 && <dl className="ht-participation">{participation.map(([label,key])=><div key={label}><dt>{t(label)}</dt><dd>{value(key)}</dd></div>)}</dl>}
    {(data.goals || data.comment) && <footer className="ht-close">
      {data.goals && <section><h2>{t("Next package goals")}</h2><p>{value("goals")}</p></section>}
      {data.comment && <section><h2>{t("Teacher’s comment")}</h2><p>{value("comment")}</p><strong>{teacher}</strong></section>}
    </footer>}
  </article>;
}
