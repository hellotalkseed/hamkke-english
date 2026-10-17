"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/** Keeps attendance printing independent of the owner portal's layout. */
export default function AttendancePrintDocument({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = document.createElement("div");
    element.setAttribute("data-hamkke-attendance-print", "");
    element.style.display = "none";
    document.body.appendChild(element);
    setHost(element);
    return () => { element.remove(); };
  }, []);

  if (!host) return null;
  return createPortal(
    <>
      <style>{`
        @media print {
          body > :not([data-hamkke-attendance-print]) {
            display: none !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: auto !important;
            min-width: 0 !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            background: white !important;
          }
          body > [data-hamkke-attendance-print] {
            display: block !important;
            position: static !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: none !important;
            height: auto !important;
            overflow: visible !important;
            color: #292929;
            background: white;
          }
        }
      `}</style>
      {children}
    </>,
    host
  );
}
