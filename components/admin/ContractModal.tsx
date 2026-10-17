"use client";
import { useEffect, useRef, useTransition, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AttendancePrintDocument from "@/components/admin/AttendancePrintDocument";
import styles from "./EnrollmentTable.module.css";
export default function ContractModal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  function close() {
    const query = new URLSearchParams(searchParams.toString());
    query.delete("contractId");
    startTransition(() => router.replace(`${pathname}${query.size ? `?${query}` : ""}`, {scroll: false}));
  }
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();
    const beforePrint = () => { if (dialog.open) dialog.close(); };
    const afterPrint = () => { if (dialog.isConnected && !dialog.open) dialog.showModal(); };
    window.addEventListener("beforeprint", beforePrint);
    window.addEventListener("afterprint", afterPrint);
    return () => {
      window.removeEventListener("beforeprint", beforePrint);
      window.removeEventListener("afterprint", afterPrint);
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);
  return <>
    <dialog ref={ref} className={styles.dialog} aria-labelledby="contract-modal-title" onCancel={e => {e.preventDefault(); close();}}>
      <header className={styles.modalHeader}>
        <h2 id="contract-modal-title">Enrollment contract</h2>
        <div className={styles.contractActions}>
          <button type="button" className={styles.view} onClick={() => window.print()}>Print contract</button>
          <button type="button" className={styles.close} disabled={pending} onClick={close} aria-label="Close contract">✕</button>
        </div>
      </header>
      <div>{children}</div>
    </dialog>
    <AttendancePrintDocument>{children}</AttendancePrintDocument>
  </>;
}
