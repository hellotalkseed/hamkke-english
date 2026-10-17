"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
export default function ContractLink({ contractId, className, children }: { contractId: string; className?: string; children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = new URLSearchParams(searchParams.toString());
  query.set("contractId", contractId);
  return <Link href={`${pathname}?${query}`} scroll={false} className={className} aria-haspopup="dialog">{children}</Link>;
}
