import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import OwnerAdminShell from "@/components/admin/owner/OwnerAdminShell";

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return children;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "owner" || profile?.status !== "active") {
    return children;
  }

  return (
    <OwnerAdminShell locale={locale}>
      {children}
    </OwnerAdminShell>
  );
}
