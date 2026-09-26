import { redirect } from "next/navigation";
import TeachersManagement from "./TeachersManagement";
import TeacherDashboardHome from "@/components/admin/teacher-portal/TeacherDashboardHome";
import { createClient } from "@/lib/supabase/server";

interface TeachersPageProps { params: Promise<{ locale: string }> }

export default async function TeachersPage({ params }: TeachersPageProps) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/portal/login`);

  const { data: profile } = await supabase.from("profiles").select("full_name, role, status, avatar_path").eq("id", user.id).maybeSingle();

  if (profile?.role === "teacher" && profile?.status === "pending") redirect(`/${locale}/admin/teachers/agreement`);
  if (profile?.role === "owner" && profile?.status === "active") return <TeachersManagement locale={locale} />;

  if (profile?.role === "teacher" && profile?.status === "active") {
    const avatarUrl = profile.avatar_path ? supabase.storage.from("teacher-avatars").getPublicUrl(profile.avatar_path).data.publicUrl : null;
    async function handleSignOut() { "use server"; const client = await createClient(); await client.auth.signOut(); redirect(`/${locale}/portal/login`); }
    return <TeacherDashboardHome locale={locale} fullName={profile.full_name} avatarUrl={avatarUrl} signOutAction={handleSignOut} />;
  }

  redirect(`/${locale}/portal/login`);
}
