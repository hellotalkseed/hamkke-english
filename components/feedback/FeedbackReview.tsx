"use client";
import { useEffect, useRef, useState } from "react";
import ReviewDialog from "./ReviewDialog";
import styles from "./FeedbackReview.module.css";
type Entry = { id:string; name:string; role:string; country:string|null; rating:number; reflection:string; teacher_name:string; source:string; learning_context:string; share_with_teacher:boolean; publish_consent:boolean; review_status:string; published_reflection_id:string|null; created_at:string };
function approved(f:Entry){return f.review_status==='reviewed'&&(!(f.publish_consent&&f.share_with_teacher)||!!f.published_reflection_id);}
function status(f:Entry){return approved(f)?'Approved':'Needs review';}
function date(value:string){return new Intl.DateTimeFormat('en-US',{year:'numeric',month:'short',day:'numeric',timeZone:'Asia/Manila'}).format(new Date(value));}
export default function FeedbackReview(){
 const [rows,setRows]=useState<Entry[]>([]),[page,setPage]=useState(0),[total,setTotal]=useState(0);
 const [selected,setSelected]=useState<Entry|null>(null),[confirmDelete,setConfirmDelete]=useState(false),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState(''),[actionError,setActionError]=useState(''),[tick,setTick]=useState(0);const lock=useRef(false);
 useEffect(()=>{const abort=new AbortController();setLoading(true);setError('');fetch(`/api/admin/learner-feedback?page=${page}`,{cache:'no-store',signal:abort.signal}).then(async r=>{if(!r.ok)throw new Error();return r.json();}).then(v=>{if(abort.signal.aborted)return;if(page>0&&v.total<=page*24){setPage(Math.max(0,Math.ceil(v.total/24)-1));return;}setRows(v.feedback);setTotal(v.total);}).catch(e=>{if(e.name!=='AbortError')setError('Unable to load feedback. Please retry.');}).finally(()=>{if(!abort.signal.aborted)setLoading(false);});return()=>abort.abort();},[page,tick]);
 function open(f:Entry){setSelected(f);setConfirmDelete(false);setActionError('');}
 async function act(action:string){if(!selected||lock.current)return;lock.current=true;setBusy(true);setActionError('');try{const r=await fetch(`/api/admin/learner-feedback/${selected.id}`,{method:action==='delete'?'DELETE':'PATCH',headers:{'Content-Type':'application/json'},...(action==='delete'?{}:{body:JSON.stringify({action})})});const body=await r.json();if(!r.ok)throw new Error(body.error||'Unable to update feedback.');setSelected(null);setConfirmDelete(false);setTick(v=>v+1);}catch(e){setActionError(e instanceof Error?e.message:'Unable to update feedback.');}finally{lock.current=false;setBusy(false);}}
 return <section className={styles.section}>
  <div className={styles.heading}><div><h2>Learner feedback</h2><p className={styles.description}>Read their stories. Approve a story or delete it. Approved feedback leaves this queue.</p></div><span className={styles.count}>{loading?'…':total} stories</span></div>

  {error&&<div role="alert" className={styles.alert}>{error} <button className={styles.read} onClick={()=>setTick(v=>v+1)}>Retry</button></div>}
  {loading?<p role="status" className={styles.empty}>Loading feedback…</p>:!rows.length&&!error?<p className={styles.empty}>All caught up. No feedback is waiting for approval.</p>:<div className={styles.grid}>{rows.map(f=><article key={f.id} className={styles.card}>
   <div className={styles.cardTop}><span className={styles.quoteMark} aria-hidden="true">“</span><span className={styles.rating}>{f.rating} / 5</span></div>
   <p className={styles.preview}>{f.reflection}</p><button type="button" className={styles.read} onClick={()=>open(f)} aria-haspopup="dialog" aria-label={`Read feedback from ${f.name}`}>Read more</button>
   <div className={styles.byline}>{f.name} · For {f.teacher_name}<p className={styles.meta}>{f.role}{f.country?` · ${f.country}`:''} · {date(f.created_at)}</p><p className={styles.status}>{status(f)}</p></div>
  </article>)}</div>}
  <nav className={styles.pagination} aria-label="Feedback pages"><button className={styles.button} disabled={page===0||loading||busy} onClick={()=>setPage(v=>v-1)}>Previous</button><span>Page {page+1} of {Math.max(1,Math.ceil(total/24))}</span><button className={styles.button} disabled={(page+1)*24>=total||loading||busy} onClick={()=>setPage(v=>v+1)}>Next</button></nav>
  {selected&&<ReviewDialog title={`Feedback from ${selected.name}`} busy={busy} onClose={()=>setSelected(null)}>
   <p className={styles.description}>For {selected.teacher_name} · {selected.rating} / 5 · {date(selected.created_at)}</p><p className={styles.fullText}>{selected.reflection}</p>
   <dl className={styles.details}>{[
    ['Submitted by',`${selected.name} · ${selected.role}${selected.country?` · ${selected.country}`:''}`],
    ['Submission source',selected.source==='portal'?'Student portal · linked account':'Public feedback link · identity not verified'],
    ['Lesson context',selected.learning_context==='elsewhere'?'Lessons outside Hamkke':'Hamkke lessons'],
    ['Sharing permission',selected.share_with_teacher?'Teacher and Hamkke':'Hamkke only · private'],
    ['Public publication consent',selected.publish_consent?'Permission given':'No permission given'],
    ['Teacher visibility',selected.share_with_teacher&&selected.review_status==='reviewed'?'Visible to the assigned teacher':'Not visible to the teacher'],
    ['Review status',status(selected)],
    ['Website',selected.published_reflection_id?'Published':'Not published'],
   ].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
   {actionError&&<p role="alert" className={styles.alert}>{actionError}</p>}
   <div className={styles.actions}>
    {approved(selected)?<span className={styles.status}>Approved</span>:<button disabled={busy} className={`${styles.button} ${styles.primary}`} onClick={()=>act('approve')}>Approve</button>}
    <button disabled={busy} className={`${styles.button} ${styles.danger}`} onClick={()=>setConfirmDelete(true)}>Delete</button>
   </div>
   <p className={styles.description}>Approval shares this feedback only with the audiences the learner permitted, then removes it from this queue. Approved feedback can only be removed through Supabase.</p>
   {confirmDelete&&<div className={styles.confirm}><p>Delete feedback from {selected.name}? This cannot be undone.</p><div className={styles.actions}><button disabled={busy} className={`${styles.button} ${styles.danger}`} onClick={()=>act('delete')}>Yes, delete feedback</button><button disabled={busy} className={styles.button} onClick={()=>setConfirmDelete(false)}>Keep feedback</button></div></div>}
   {busy&&<p role="status" className={styles.description}>Saving…</p>}
  </ReviewDialog>}
 </section>;
}
