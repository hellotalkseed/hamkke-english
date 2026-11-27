import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import UpdatesDock from "@/components/admin/notifications/UpdatesDock";
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

  if (profile?.status !== "active" || !["owner", "teacher"].includes(profile.role)) {
    return children;
  }
  if (profile.role === "teacher") {
    return <>{children}<UpdatesDock key={user.id} userId={user.id} role="teacher" locale={locale}/></>;
  }

  return (
    <OwnerAdminShell locale={locale}>
      {children}
      <UpdatesDock key={user.id} userId={user.id} role="owner" locale={locale}/>
    </OwnerAdminShell>
  );
}
