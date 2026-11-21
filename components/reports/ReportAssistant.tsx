"use client";
import RephraseComment from "./RephraseComment";
import { useState } from "react";
import { rephraseFields, englishFields, translationFields, matchesTranslation, familyLanguages, hasTranslation, isFamilyLanguage, sectionsFor, type TermAssessment } from "@/lib/reports/termAssessment";

export function ReportAssistant({data,onChange,participant,observations,attendance}:{data:TermAssessment;onChange:(value:TermAssessment)=>void;participant:string;observations:{lesson_id:string;observation:string;lesson_date:string}[];attendance:string}) {
  const [notes,setNotes]=useState("");
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState("");
  const [proposal,setProposal]=useState<Record<string,string>|null>(null);
  const labels=Object.assign({},...sectionsFor(data).map(([,fields])=>fields));
  const source=translationFields(data);
  const current=hasTranslation(data);
  // AI responses are staged. Applying them always uses the currently displayed English fields.
  const [translation,setTranslation]=useState<{language:string;snapshot:string;fields:Record<string,string>}|null>(null);
  async function generate(action:"draft"|"translate") {
    setBusy(true);setNotice("");setTranslation(null);setProposal(null);
    try {
      const response=await fetch("/api/admin/teachers/students/"+participant+"/progress-report/assist",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,language:data.familyLanguage,term:data,notes})});
      const result=await response.json();
      if(!response.ok) throw Error(result.error||"Unable to generate feedback.");
      if(action==="draft") setProposal(result.fields);
      else setTranslation({language:data.familyLanguage!,snapshot:JSON.stringify(source),fields:result.fields});
    } catch(error) {setNotice(error instanceof Error?error.message:"Please try again.");}
    finally {setBusy(false);}
  }
  const activePreview=translation?.snapshot===JSON.stringify(source) && translation.language===data.familyLanguage ? translation:null;
  return <div className="space-y-4">
    <section className="rounded-xl border bg-white p-4"><h3 className="font-semibold">Start with lesson notes</h3>
      <p className="my-2 text-sm">Write a few bullets about what changed, one moment you remember, and your next goal.</p>
      {observations.length>0 && <label className="block text-sm">Add a lesson observation<select className="ml-2 max-w-full border p-1" value="" onChange={e=>{const item=observations.find(x=>x.lesson_id===e.target.value);if(item)setNotes(n=>[n,item.observation].filter(Boolean).join("\n"));}}><option value="">Choose a lesson</option>{observations.map(x=><option key={x.lesson_id} value={x.lesson_id}>{x.lesson_date} · {x.observation.slice(0,70)}</option>)}</select></label>}
      <textarea aria-label="Working notes for draft suggestions" value={notes} onChange={e=>setNotes(e.target.value)} rows={3} className="my-2 w-full rounded border p-2"/>
      <RephraseComment participant={participant} field="working_notes" value={notes} onApply={setNotes}/>
      <button type="button" disabled={busy||!notes.trim()} onClick={()=>generate("draft")} className="rounded border px-3 py-2 disabled:opacity-50">Suggest report wording</button>
      {proposal && <div className="mt-3"><h4>Suggested wording</h4>{Object.entries(proposal).map(([k,v])=><p key={k} className="my-2 text-sm"><b>{labels[k]}</b> · {v}</p>)}<button type="button" className="underline" onClick={()=>{const next={...data};let count=0;for(const [key,text] of Object.entries(proposal))if(!next[key]?.trim()){next[key]=text;count++;}onChange(next);setProposal(null);setNotice(count+" empty fields filled. Review your wording below.");}}>Fill empty fields</button></div>}
      
    </section>
    <section className="rounded-xl border bg-white p-4"><label className="font-semibold">Translation language <select value={data.familyLanguage||""} className="ml-2 rounded border p-1" onChange={e=>{const next={...englishFields(data),studentName:data.studentName,packageName:data.packageName,format:data.format,familyLanguage:e.target.value};onChange(next);setTranslation(null);setNotice("");}}><option value="">English only</option>{Object.entries(familyLanguages).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
      {isFamilyLanguage(data.familyLanguage) && <div className="mt-3"><button type="button" disabled={busy||!Object.keys(source).length} className="rounded border px-3 py-2 disabled:opacity-50" onClick={()=>generate("translate")}>{current?"Refresh translation":"Generate translation"}</button>
      <p className="my-2 text-sm">Review the translation from “Progress this term” onward. Check each sentence against the original English.</p>
      {(activePreview||matchesTranslation(data.sourceSnapshot,source)) && Object.entries(source).map(([k,v])=>{
        const translated=activePreview?activePreview.fields[k]:data["translated_"+k]||"";
        const update=(text:string)=>activePreview?setTranslation({...activePreview,fields:{...activePreview.fields,[k]:text}}):onChange({...data,["translated_"+k]:text});
        return <div key={k}><label className="my-3 block"><strong>{labels[k]}</strong><span className="block text-sm">{v}</span><textarea rows={2} className="mt-1 w-full rounded border p-2" value={translated} onChange={e=>update(e.target.value)}/></label>
        {rephraseFields.has(k) && <RephraseComment participant={participant} field={k} value={translated} onApply={update}/>}</div>;
      })}
      {activePreview && <button type="button" className="rounded border px-3 py-2" disabled={Object.values(activePreview.fields).some(x=>!x.trim())} onClick={()=>{const next={...data,sourceSnapshot:activePreview.snapshot};Object.assign(next,Object.fromEntries(Object.entries(activePreview.fields).map(([k,v])=>["translated_"+k,v])));onChange(next);setTranslation(null);setNotice("Translation added. Save the draft or submit the report.");}}>Use reviewed translation</button>}</div>}
    </section><p role="status" className="text-sm">{busy?"Preparing suggestions…":notice}</p>
  </div>;
}
