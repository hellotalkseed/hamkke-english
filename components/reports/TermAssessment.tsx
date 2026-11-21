import RephraseComment from "./RephraseComment";
import { ReportAssistant } from "./ReportAssistant";
import ConversationDocument from "./ConversationDocument";
import { sectionsFor, reportChoices, rephraseFields, observationPrompts, type TermAssessment } from "@/lib/reports/termAssessment";

export function ReportBrand() {
  return <div className="flex items-center gap-3">
    <img src="/logo/hamkke-icon.svg" alt="" width={52} height={52} />
    <div><p className="font-serif text-xl font-semibold text-[#344B3D]">Hamkke English │ 함께</p>
      <p className="text-sm text-[#526458]">From Small Talk to Big Ideas.</p></div>
  </div>;
}

export function TermEditor({ data, onChange, attendance, participant, observations }: {
  data: TermAssessment;
  onChange: (data: TermAssessment) => void;
  attendance: string; participant:string; observations:{lesson_id:string;lesson_date:string;observation:string}[];
}) {
  return <>{data.format && <ReportAssistant data={data} onChange={onChange} attendance={attendance} participant={participant} observations={observations}/>}<div className="grid gap-4 sm:grid-cols-2">
    {sectionsFor(data).map(([title, fields]) => <fieldset key={title} className="min-w-0 rounded-xl border bg-white p-4">
      <legend className="px-2 font-semibold text-[#506951]">{title}</legend>
      {data.format && title === "Package details" && <dl className="mb-4"><dt>English / preferred name</dt><dd className="mb-2 font-medium">{data.studentName || "—"}</dd><dt>Lesson package</dt><dd className="font-medium">{data.packageName || "—"}</dd></dl>}
      {title === "Attendance and participation" && attendance &&
        <p className="mb-3 text-sm">Package attendance record · {attendance}</p>}
      {Object.entries(fields).map(([key, label]) => <div key={key}><label className="mb-3 block text-sm">
        {label}
        {data.format && reportChoices[key] ? <select className="mt-1 block w-full rounded-lg border p-2" value={data[key] || ""} onChange={e=>onChange({...data,[key]:e.target.value})}>
          <option value="">Select an option</option>
          {data[key] && !reportChoices[key].includes(data[key]!) && <option value={data[key]}>{data[key]}</option>}
          {reportChoices[key].map(choice=><option key={choice} value={choice}>{choice}</option>)}
        </select> : <textarea placeholder={observationPrompts[key]} rows={title === "Conversation skills" || title === "Term review" ? 3 : label === "Comments and examples" || title === "Looking ahead" ? 3 : 1}
          value={data[key] ?? ""} onChange={e => onChange({ ...data, [key]: e.target.value })}
          className="mt-1 block w-full rounded-lg border p-2 text-base" />}
      </label>{rephraseFields.has(key) && <RephraseComment field={key} participant={participant} value={data[key] || ""} onApply={text => onChange({...data,[key]:text})}/>}</div>)}
    </fieldset>)}
  </div></>;
}

export function TermDocument({ data, student, enrollment, teacher }: {
  data: TermAssessment; student: string; enrollment: string; teacher: string;
}) {
  if (data.format === "conversation-v1") return <ConversationDocument data={data} student={student} enrollment={enrollment} teacher={teacher}/>;
  return <article className="hamkke-progress-print mx-auto max-w-3xl bg-white p-5 sm:p-9 print:p-0">
    <header className="mb-5 border-b pb-4"><ReportBrand/>
      <h1 className="my-2 font-serif text-3xl">{data.format ? "End-of-Term Conversation Report" : "End-of-Term Assessment"}</h1>
      <p className="mt-4 font-medium">{student}</p><p className="text-sm">Lesson package · {enrollment}</p><p className="text-sm">Teacher · {teacher}</p>
    </header>
    {sectionsFor(data).map(([title, fields]) => {
      const entries = Object.entries(fields).filter(([key]) => data[key]?.trim());
      if (!entries.length) return null;
      return <section key={title} className="mb-5">
        <h2 className="rounded bg-[#EEF2EA] px-3 py-2 font-serif text-xl">{title}</h2>
        <dl>{entries.map(([key, label]) => <div key={key} className="report-section grid gap-1 border-b px-3 py-2 sm:grid-cols-[11rem_1fr]">
          <dt className="font-medium">{label}</dt><dd className="whitespace-pre-wrap break-words">{data[key]}</dd>
        </div>)}</dl>
      </section>;
    })}
  </article>;
}
