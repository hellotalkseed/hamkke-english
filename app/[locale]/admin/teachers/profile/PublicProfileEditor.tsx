"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Camera, Check, Loader2, Mic2, Pencil, Plus, RefreshCw, Trash2, Upload, X } from "lucide-react";

type Qualification = { title?: string; institution?: string; year?: string };
type Props = {
  initialFullName: string;
  initialCardLabel: string;
  initialLearnerGroups: string[];
  initialTeachingFocus: string[];
  initialAbout: string;
  initialIntroQuote: string;
  initialQualifications: Qualification[];
  hasAudio: boolean;
  updateAction: (formData: FormData) => Promise<void>;
};

const learnerGroupOptions = ["Kids", "Teens", "Adults"];
const teachingFocusOptions = ["Conversation", "Speaking Confidence", "Pronunciation", "Vocabulary", "Grammar in Conversation", "Beginner English", "Interview Preparation", "Exam Speaking", "Business English"];



export default function PublicProfileEditor({ initialFullName, initialCardLabel, initialLearnerGroups = [] as string[], initialTeachingFocus = [], initialAbout, initialIntroQuote, initialQualifications = [], hasAudio, updateAction }: Props) {
  const [isPending, startTransition] = useTransition();
  const [fullName, setFullName] = useState(initialFullName);
  const [learnerGroups, setLearnerGroups] = useState(initialLearnerGroups);
  const [teachingFocus, setTeachingFocus] = useState<string[]>(initialTeachingFocus);
  const [about, setAbout] = useState(initialAbout);
  const [introQuote, setIntroQuote] = useState(initialIntroQuote);
  const [introDraft, setIntroDraft] = useState("");
  const [introGenerating, setIntroGenerating] = useState(false);
  const [qualifications, setQualifications] = useState<Qualification[]>(initialQualifications.length ? initialQualifications : []);
  const [saved, setSaved] = useState({ fullName: initialFullName, learnerGroups: initialLearnerGroups, teachingFocus: initialTeachingFocus, about: initialAbout, introQuote: initialIntroQuote, qualifications: initialQualifications });
  const [editingName, setEditingName] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const avatarInput = useRef<HTMLInputElement>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(hasAudio ? "__loading__" : null);
  const [audioBusy, setAudioBusy] = useState(false);
  const audioInput = useRef<HTMLInputElement>(null);

  useEffect(() => { fetch("/api/admin/teachers/avatar", { cache: "no-store" }).then((r) => r.ok ? r.json() : null).then((d) => setAvatarUrl(d?.avatar_url ?? null)).catch(() => undefined); }, []);
  useEffect(() => { fetch("/api/admin/teachers/audio", { cache: "no-store" }).then((r) => r.ok ? r.json() : null).then((d) => setAudioUrl(d?.audio_url ?? null)).catch(() => setAudioUrl(null)); }, []);

  function toggleLearner(value: string) { setLearnerGroups((c) => c.includes(value) ? c.filter((x) => x !== value) : [...c, value]); }
  function toggleFocus(value: string) { setTeachingFocus((c) => c.includes(value) ? c.filter((x) => x !== value) : c.length >= 5 ? c : [...c, value]); }

  async function generateIntro() {
    const source = about.trim();

    if (!source || introGenerating) return;

    setIntroGenerating(true);
    setMessage(null);

    try {
      const response = await fetch(
        "/api/admin/teachers/profile/generate-intro",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            about: source,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to generate an introduction."
        );
      }

      if (
        typeof data?.introduction !== "string" ||
        !data.introduction.trim()
      ) {
        throw new Error(
          "The AI did not return an introduction."
        );
      }

      setIntroDraft(data.introduction.trim());
    } catch (error) {
      console.error(
        "Introduction generation failed:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to generate an introduction."
      );
    } finally {
      setIntroGenerating(false);
    }
  }

  const dirty = useMemo(() => fullName.trim() !== saved.fullName || JSON.stringify([...learnerGroups].sort()) !== JSON.stringify([...saved.learnerGroups].sort()) || JSON.stringify([...teachingFocus].sort()) !== JSON.stringify([...saved.teachingFocus].sort()) || about !== saved.about || introQuote !== saved.introQuote || JSON.stringify(qualifications) !== JSON.stringify(saved.qualifications), [fullName, learnerGroups, teachingFocus, about, introQuote, qualifications, saved]);

  function save() {
    setMessage(null);
    const name = fullName.trim();
    if (!name) return setMessage("Please enter your display name.");
    if (!learnerGroups.length) return setMessage("Select at least one learner group.");
    const formData = new FormData();
    formData.set("full_name", name);
    formData.set("card_label", initialCardLabel);
    formData.set("learner_groups", JSON.stringify(learnerGroups));
    formData.set("teaching_focus", JSON.stringify(teachingFocus));
    formData.set("about", about.trim());
    formData.set("intro_quote", introQuote.trim());
    formData.set("qualifications", JSON.stringify(qualifications));
    startTransition(async () => {
      try {
        await updateAction(formData);
        setSaved({ fullName: name, learnerGroups: [...learnerGroups], teachingFocus: [...teachingFocus], about: about.trim(), introQuote: introQuote.trim(), qualifications: qualifications.map((q) => ({...q})) });
        setEditingName(false); setIntroDraft(""); setMessage("Profile information saved.");
      } catch (error) {
        console.error("Profile save failed:", error);

        setMessage(
          error instanceof Error
            ? error.message
            : "We couldn't save your changes. Please try again."
        );
      }
    });
  }

  async function uploadAvatar(file?: File) {
    if (!file) return; setAvatarBusy(true); setMessage(null);
    try { const body = new FormData(); body.set("file", file); const response = await fetch("/api/admin/teachers/avatar", { method: "POST", body }); const data = await response.json(); if (!response.ok) throw new Error(data?.error || "Upload failed"); setAvatarUrl(data.avatar_url ?? null); setMessage("Profile photo updated."); }
    catch (e) { setMessage(e instanceof Error ? e.message : "We couldn't upload the profile photo."); }
    finally { setAvatarBusy(false); if (avatarInput.current) avatarInput.current.value = ""; }
  }

  async function uploadAudio(file?: File) {
    if (!file) return;
    setAudioBusy(true);
    setMessage(null);
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/admin/teachers/audio", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Upload failed");
      setAudioUrl(data.audio_url ?? null);
      setMessage("Audio introduction updated.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "We couldn't upload the audio introduction.");
    } finally {
      setAudioBusy(false);
      if (audioInput.current) audioInput.current.value = "";
    }
  }

  async function removeAudio() {
    setAudioBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/teachers/audio", { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Remove failed");
      setAudioUrl(null);
      setMessage("Audio introduction removed.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "We couldn't remove the audio introduction.");
    } finally {
      setAudioBusy(false);
    }
  }

  function updateQualification(index: number, key: keyof Qualification, value: string) { setQualifications((c) => c.map((q, i) => i === index ? {...q, [key]: value} : q)); }

  return <div>
    <div className="grid items-start gap-5 lg:grid-cols-2">
      <Card eyebrow="Profile Basics" description="Your photo, display name, and spoken introduction.">
        <div className="mt-7 flex items-center gap-4"><div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E2EBDD] font-serif text-[25px] text-[#55705A]">{avatarUrl ? <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover"/> : (saved.fullName || "T").charAt(0).toUpperCase()}</div><div><input ref={avatarInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => uploadAvatar(e.target.files?.[0])}/><button type="button" disabled={avatarBusy} onClick={() => avatarInput.current?.click()} className={outlineButton}>{avatarBusy ? <Loader2 size={14} className="animate-spin"/> : <Camera size={14}/>} {avatarUrl ? "Replace photo" : "Upload photo"}</button><p className="mt-2 text-[11px] text-[#98928A]">JPG, PNG or WebP · up to 5 MB</p></div></div>
        <Divider/><p className={labelClass}>Display name</p>{editingName ? <div className="mt-3 flex gap-2"><input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass}/><button type="button" onClick={() => setEditingName(false)} className="px-3 text-[#77736C]"><X size={16}/></button></div> : <button type="button" onClick={() => setEditingName(true)} className="mt-3 flex items-center gap-2 font-serif text-[19px] text-[#333630]">{fullName || "Add display name"}<Pencil size={14} className="text-[#718A73]"/></button>}<p className="mt-2 text-[11px] leading-5 text-[#98928A]">Enter your preferred name only. &quot;Teacher&quot; will be added automatically on your public profile. <span className="whitespace-nowrap">Example: Jes → Teacher Jes</span></p>
        <Divider/><p className={labelClass}>Audio introduction</p><div className="mt-3 rounded-[14px] bg-[#F7F7F3] px-4 py-4"><input ref={audioInput} type="file" accept="audio/mpeg,audio/mp4,audio/x-m4a,audio/wav,audio/x-wav,audio/webm,.mp3,.m4a,.wav,.webm" className="hidden" onChange={(e) => uploadAudio(e.target.files?.[0])}/><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E2EBDD] text-[#5F7F63]"><Mic2 size={17}/></div><div className="min-w-0 flex-1"><p className="text-[13px] font-medium text-[#444640]">{audioUrl ? "Audio introduction uploaded" : "No audio introduction yet"}</p><p className="mt-0.5 text-[11px] text-[#8A857E]">{audioUrl ? "Available on your public profile." : "Add a short hello for prospective learners."}</p></div><button type="button" disabled={audioBusy} onClick={() => audioInput.current?.click()} className={outlineButton}>{audioBusy ? <Loader2 size={12} className="animate-spin"/> : <Upload size={12}/>} {audioUrl ? "Replace" : "Upload"}</button></div>{audioUrl && audioUrl !== "__loading__" ? <div className="mt-4"><audio controls preload="metadata" src={audioUrl} className="h-10 w-full"/><div className="mt-2 flex items-center justify-between gap-3"><p className="text-[11px] text-[#98928A]">MP3, M4A, WAV or WebM · up to 10 MB</p><button type="button" disabled={audioBusy} onClick={removeAudio} className="inline-flex items-center gap-1 text-[11px] text-[#9A817A] hover:text-[#765F59]"><Trash2 size={12}/>Remove</button></div></div> : <p className="mt-3 text-[11px] text-[#98928A]">MP3, M4A, WAV or WebM · up to 10 MB</p>}</div>
      </Card>

      <Card eyebrow="Teaching Profile" description="Choose who you teach and the areas you most want learners to know you for.">
        <div className="mt-7"><p className={labelClass}>Learner groups</p><div className="mt-3 flex flex-wrap gap-2">{learnerGroupOptions.map((o) => <Choice key={o} label={o} selected={learnerGroups.includes(o)} onClick={() => toggleLearner(o)}/>)}</div></div>
        <Divider/><div className="flex items-end justify-between gap-3"><p className={labelClass}>Teaching focus</p><p className="text-[11px] text-[#98928A]">Choose up to 5</p></div><div className="mt-3 flex flex-wrap gap-2">{teachingFocusOptions.map((o) => <Choice key={o} label={o} selected={teachingFocus.includes(o)} disabled={!teachingFocus.includes(o) && teachingFocus.length >= 5} onClick={() => toggleFocus(o)}/>)}</div>
      </Card>

      <Card eyebrow="About Me" description="Tell learners about yourself, your approach, and the learning environment you create.">
        <textarea value={about} onChange={(e) => { setAbout(e.target.value); setIntroDraft(""); }} rows={9} placeholder="Write your About Me here..." className={`${inputClass} mt-6 resize-y font-sans text-[13px] leading-6`}/>
        <Divider/><div className="flex flex-wrap items-center justify-between gap-3"><div><p className={labelClass}>Public Introduction</p><p className="mt-1 text-[11px] text-[#98928A]">Turn your About Me into a short, warm introduction for your public profile. You can regenerate it until it feels like you.</p></div><button type="button" disabled={!about.trim() || introGenerating} onClick={generateIntro} className={outlineButton}>{introGenerating ? <Loader2 size={13} className="animate-spin"/> : <RefreshCw size={13}/>} {introGenerating ? "Generating..." : introDraft ? "Regenerate" : "Generate"}</button></div>
        {introDraft ? <div className="mt-4 rounded-[14px] border border-[#DDE4D8] bg-[#F5F7F1] p-4"><p className="font-serif text-[18px] italic leading-7 text-[#444640]">{introDraft}</p><button type="button" onClick={() => { setIntroQuote(introDraft); setIntroDraft(""); }} className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-medium text-[#58705C]"><Check size={13}/>Use this</button></div> : null}
        <div className="mt-4 rounded-[14px] bg-[#F8F7F3] p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A8A84]">Current public introduction</p><p className="mt-2 font-serif text-[17px] italic leading-7 text-[#555650]">{introQuote || "No public introduction selected yet."}</p></div>
      </Card>

      <Card eyebrow="Qualifications" description="Add credentials and experience shown on your public teacher profile.">
        <div className="mt-6 space-y-3">{qualifications.length ? qualifications.map((q, i) => <div key={i} className="rounded-[14px] border border-[#E3DED7] bg-[#FFFDF9] p-4"><div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_110px_auto]"><input value={q.title ?? ""} onChange={(e) => updateQualification(i, "title", e.target.value)} placeholder="Qualification" className={smallInput}/><input value={q.institution ?? ""} onChange={(e) => updateQualification(i, "institution", e.target.value)} placeholder="Institution" className={smallInput}/><input value={q.year ?? ""} onChange={(e) => updateQualification(i, "year", e.target.value)} placeholder="Year" className={smallInput}/><button type="button" onClick={() => setQualifications((c) => c.filter((_, x) => x !== i))} className="flex h-10 w-10 items-center justify-center rounded-full text-[#9A817A] hover:bg-[#F5ECE8]" aria-label="Remove qualification"><Trash2 size={15}/></button></div></div>) : <div className="rounded-[14px] bg-[#F8F7F3] px-4 py-5 text-[12px] text-[#8A857E]">No qualifications added yet.</div>}</div>
        <button type="button" onClick={() => setQualifications((c) => [...c, {title:"", institution:"", year:""}])} className={`${outlineButton} mt-4`}><Plus size={14}/>Add qualification</button>
      </Card>
    </div>

    <div className="sticky bottom-4 z-10 mt-6 flex flex-wrap items-center justify-end gap-3 rounded-[18px] border border-[#DED9D1] bg-[rgba(250,248,245,0.94)] px-5 py-4 shadow-[0_10px_35px_rgba(70,65,58,0.08)] ">{message ? <p className="mr-auto text-[12px] text-[#6F8F72]">{message}</p> : <p className="mr-auto text-[11px] text-[#98928A]">Changes appear on your public profile after you save.</p>}<button type="button" disabled={isPending || !dirty} onClick={save} className="inline-flex min-w-[126px] items-center justify-center gap-2 rounded-full bg-[#718A73] px-5 py-3 text-[13px] font-medium text-white hover:bg-[#5F7863] disabled:cursor-not-allowed disabled:opacity-45">{isPending ? <><Loader2 size={14} className="animate-spin"/>Saving</> : "Save Changes"}</button></div>
  </div>;
}

function Card({eyebrow, description, children}:{eyebrow:string; description:string; children:React.ReactNode}) { return <section className="self-start rounded-[22px] border border-[#DED9D1] bg-white p-6 sm:p-7"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#718A73]">{eyebrow}</p><p className="mt-2 text-[13px] leading-6 text-[#817B74]">{description}</p>{children}</section>; }
function Divider(){ return <div className="my-6 border-t border-[#ECE8E1]"/>; }
function Choice({label,selected,disabled,onClick}:{label:string;selected:boolean;disabled?:boolean;onClick:()=>void}) { return <button type="button" disabled={disabled} onClick={onClick} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[12px] transition ${selected ? "border-[#718A73] bg-[#DCE4D7] font-medium text-[#3F5944]" : "border-[#D8D4CD] bg-[#FFFDF8] text-[#68655F] hover:border-[#AEBDAA] hover:bg-[#F7F8F3]"} disabled:cursor-not-allowed disabled:opacity-40`}>{selected ? <Check size={13}/> : null}{label}</button>; }
const labelClass="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A8A84]";
const inputClass="w-full rounded-[12px] border border-[#D8D4CD] bg-[#FFFDF8] px-4 py-3 text-[#333630] outline-none focus:border-[#8FA58F] focus:ring-2 focus:ring-[#DCE4D7]";
const smallInput="min-w-0 rounded-[10px] border border-[#DDD8D0] bg-white px-3 py-2.5 text-[12px] text-[#444640] outline-none focus:border-[#8FA58F] focus:ring-2 focus:ring-[#DCE4D7]";
const outlineButton="inline-flex items-center gap-2 rounded-full border border-[#C8D4C3] px-4 py-2 text-[12px] font-medium text-[#526B55] hover:bg-[#EEF2EA] disabled:cursor-not-allowed disabled:opacity-45";






