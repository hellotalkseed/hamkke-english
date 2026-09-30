"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";

const PendingContext = createContext(false);
type Result = { error: string };
export default function StudentCreateForm({ action, children }: {
  action: (previous: Result, formData: FormData) => Promise<Result>;
  children: ReactNode;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  return <PendingContext.Provider value={pending}>
    <form className="space-y-12" aria-busy={pending} onSubmit={async event => {
      event.preventDefault();
      if (submitting.current) return;
      submitting.current = true;
      const formData = new FormData(event.currentTarget);
      setPending(true); setError("");
      try {
        const result = await action({ error: "" }, formData);
        if (result?.error) {
          setError(result.error);
          submitting.current = false; setPending(false);
        }
        // A successful action redirects. Keep the button locked until navigation.
      } catch {
        setError("Unable to finish the request. Try again on this form; your entries are still here.");
        submitting.current = false; setPending(false);
      }
    }}>
      {children}
      {error && <p role="alert" className="rounded-xl border border-[#E4CBC5] bg-[#FFF8F5] px-5 py-4 text-sm leading-6 text-[#8D5148]">{error}</p>}
    </form>
  </PendingContext.Provider>;
}

export function CreateStudentButton() {
  const pending = useContext(PendingContext);
  return <button type="submit" disabled={pending}
    className="rounded-full bg-[#6F8F72] px-7 py-3 font-sans text-sm font-medium text-white transition-opacity hover:opacity-85 disabled:cursor-wait disabled:opacity-60">
    <span role="status">{pending ? "Creating student…" : "Create Student"}</span>
  </button>;
}
