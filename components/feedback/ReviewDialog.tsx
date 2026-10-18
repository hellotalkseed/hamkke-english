"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";
import styles from "./FeedbackReview.module.css";
export default function ReviewDialog({title, busy, onClose, children}: {title:string; busy:boolean; onClose:()=>void; children:ReactNode}) {
  const ref=useRef<HTMLDialogElement>(null); const titleId=useId();
  useEffect(()=>{const d=ref.current;if(!d)return;const focus=document.activeElement as HTMLElement|null;const overflow=document.body.style.overflow;document.body.style.overflow="hidden";d.showModal();return()=>{d.close();document.body.style.overflow=overflow;if(focus?.isConnected)focus.focus();};},[]);
  return <dialog ref={ref} className={styles.dialog} aria-labelledby={titleId} onCancel={e=>{e.preventDefault();if(!busy)onClose();}}>
    <header className={styles.modalHeader}><h3 id={titleId}>{title}</h3><button type="button" className={styles.close} disabled={busy} onClick={onClose} aria-label="Close feedback">✕</button></header>
    <div className={styles.body}>{children}</div>
  </dialog>;
}
