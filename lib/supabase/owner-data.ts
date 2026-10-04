import "server-only";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Never create a privileged data client until the session and owner role pass.
export async function requireOwnerDataClient(locale: string) {
  const session = await createClient();
  const { data: { user }, error: authError } = await session.auth.getUser();
  if (authError || !user) redirect(`/${locale}/admin/login`);

  const { data: profile, error } = await session
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();
  if (error || profile?.role !== "owner" || profile.status !== "active") {
    notFound();
  }
  return createAdminClient();
}
