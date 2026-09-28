"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function PortalSignOut({ locale, owner = false }: { locale: string; owner?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => setMounted(true), []);

  async function signOut() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const { error: authError } = await createClient().auth.signOut();
      if (authError) throw authError;
      window.location.replace(`/${locale}/${owner ? "admin/login" : "portal/login"}`);
    } catch {
      setError("Could not sign out. Please try again.");
      setBusy(false);
    }
  }

  const button = (mobile = false) => (
    <button type="button" onClick={signOut} disabled={busy} aria-label={busy ? "Signing out" : "Sign out"} title="Sign out"
      className={`flex items-center gap-3 rounded-xl text-[13px] text-[#5F5C57] transition hover:bg-[#E8E4DD] focus-visible:outline-2 focus-visible:outline-[#6F8F72] disabled:opacity-60 ${mobile ? "border border-[#DCD8D2] bg-[#FAF8F5] px-4 py-3 shadow-sm" : "w-full px-3 py-3"}`}>
      <LogOut size={18} className="shrink-0" aria-hidden="true" />
      <span className={owner && !mobile ? "whitespace-nowrap opacity-0 group-hover/adminrail:opacity-100 group-focus-within/adminrail:opacity-100" : ""}>{busy ? "Signing out…" : "Sign out"}</span>
    </button>
  );

  return <>
    <div className="mt-5 border-t border-[#DED7CF] pt-3 print:hidden">{button()}
      {error && <p role="alert" className="px-3 py-2 text-xs text-[#9B4138]">{error}</p>}
    </div>
    {mounted && !owner && createPortal(<div className="fixed bottom-4 right-4 z-50 lg:hidden print:hidden" style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}>
      {error && <p role="alert" className="mb-2 max-w-[230px] rounded-lg border bg-[#FFFDF8] p-3 text-xs text-[#9B4138]">{error}</p>}
      {button(true)}
    </div>, document.body)}
  </>;
}
