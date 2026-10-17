"use client";

import { useEffect, useRef, useTransition, type ReactNode } from "react";
import ContractLink from "./ContractLink";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import styles from "./EnrollmentTable.module.css";

type EnrollmentRow = {
  id: string;
  number: string;
  kind: string;
  contractNumber: string | null;
  contractHref: string | null;
  status: string;
  payment: string;
};

export default function EnrollmentTable({ rows, selectedId, studentName, children }: {
  rows: EnrollmentRow[];
  selectedId: string | null;
  studentName: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const contractOpen = Boolean(searchParams.get("contractId"));
  const selected = rows.find((row) => row.id === selectedId);

  function select(id: string | null) {
    if (pending) return;
    const query = new URLSearchParams(searchParams.toString());
    if (id) query.set("enrollmentId", id);
    else query.delete("enrollmentId");
    const next = query.toString();
    startTransition(() => router.replace(`${pathname}${next ? `?${next}` : ""}`, { scroll: false }));
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!selectedId || !dialog || contractOpen) {
      triggerRef.current?.focus();
      return;
    }
    if (!dialog.open) dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Print the existing enrollment-specific attendance document outside the modal.
    const beforePrint = () => { if (dialog.open) dialog.close(); };
    const afterPrint = () => { if (dialog.isConnected && !dialog.open) dialog.showModal(); };
    window.addEventListener("beforeprint", beforePrint);
    window.addEventListener("afterprint", afterPrint);
    return () => {
      window.removeEventListener("beforeprint", beforePrint);
      window.removeEventListener("afterprint", afterPrint);
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, [selectedId, contractOpen]);

  if (!rows.length) return <div className={styles.empty}>No enrollments yet. Create an enrollment when this student is ready.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.tableWrap} aria-busy={pending}>
        <table className={styles.table}>
          <caption className={styles.srOnly}>Student enrollments, newest first</caption>
          <thead><tr><th scope="col">Enrollment</th><th scope="col">Contract</th><th scope="col">Payment</th><th scope="col">Status</th><th scope="col"><span className={styles.srOnly}>Details</span></th></tr></thead>
          <tbody>{rows.map((row) => (
            <tr key={row.id}>
              <td>{row.number}{row.kind && <span className={styles.kind}>{row.kind}</span>}</td>
              <td>{row.contractHref ? <ContractLink contractId={row.contractHref.split("/").pop()!} className={styles.contract}>{row.contractNumber || "View contract"}</ContractLink> : <span className={styles.muted}>Not created</span>}</td>
              <td className={styles.amount}>{row.payment}</td>
              <td><span className={styles.badge}><span aria-hidden="true">●</span> {row.status}</span></td>
              <td className={styles.actionCell}><button type="button" className={styles.view} disabled={pending} aria-haspopup="dialog" onClick={(event) => { triggerRef.current = event.currentTarget; select(row.id); }} aria-label={`View ${row.number}`}>View</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <p className={styles.notice} role="status" aria-live="polite">{pending ? "Loading enrollment…" : ""}</p>
      {selected && (
        <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="enrollment-modal-title" aria-describedby="enrollment-modal-student" onCancel={(event) => { event.preventDefault(); select(null); }}>
          <header className={styles.modalHeader}>
            <div><p id="enrollment-modal-student" className={styles.muted}>{studentName} · Enrollment details</p><h2 id="enrollment-modal-title">{selected.number}{selected.kind && <span className={styles.modalKind}>{selected.kind}</span>}</h2></div>
            <button type="button" className={styles.close} aria-label="Close enrollment details" disabled={pending} onClick={() => select(null)}><X size={20} /></button>
          </header>
          <div className={styles.details}>{children}</div>
        </dialog>
      )}
    </div>
  );
}
