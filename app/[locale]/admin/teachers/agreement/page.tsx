import Link from "next/link";
import { redirect } from "next/navigation";
import { Home, Users, FileText, Wallet, UserRound, CalendarDays, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

import TeacherAgreement from "@/components/admin/TeacherAgreement";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

type Profile = {
  id: string;
  full_name: string | null;
  role: string;
  status: string;
  teacher_number: string | null;
};

export default async function TeacherAgreementPage({
  params,
}: PageProps) {
  const { locale } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/admin/login`);
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("id, full_name, role, status, teacher_number")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileData as Profile | null;

  const canAccessAgreement =
  profile?.role === "teacher" &&
  (
    profile.status === "pending" ||
    profile.status === "active"
  );

if (!canAccessAgreement) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] px-6 py-16 text-[#292929]">
        <div className="mx-auto max-w-[760px] text-center">
          <p className="font-serif text-[28px]">
            Access unavailable
          </p>

          <p className="mt-3 font-sans text-[14px] leading-7 text-[#666]">
            This page is available only to authorized teacher accounts.
          </p>

          <Link
            href={`/${locale}/admin/teachers`}
            className="mt-8 inline-flex font-sans text-[14px] text-[#5F655F] transition hover:text-[#6F8F72]"
          >
            ← Teacher Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const teacher = {
    id: profile.id,
    full_name: profile.full_name,
    email: user.email ?? null,
    teacher_number: profile.teacher_number,
  };

  const firstName = profile.full_name?.trim().split(/\s+/)[0] || "T";

  const teacherNav = [
    {
      label: "Home",
      href: `/${locale}/admin/teachers`,
      icon: Home,
    },
    {
      label: "My Lessons",
      href: `/${locale}/admin/teachers/lessons`,
      icon: CalendarDays,
    },
    {
      label: "My Students",
      href: `/${locale}/admin/teachers/students`,
      icon: Users,
    },
    {
      label: "Progress Reports",
      href: `/${locale}/admin/teachers/progress-reports`,
      icon: FileText,
    },
    {
      label: "Availability",
      href: `/${locale}/admin/teachers/availability`,
      icon: CalendarDays,
    },
    {
      label: "My Profile",
      href: `/${locale}/admin/teachers/profile`,
      icon: UserRound,
    },
    {
      label: "Teacher Agreement",
      href: `/${locale}/admin/teachers/agreement`,
      icon: FileText,
    },
    {
      label: "Payroll",
      href: `/${locale}/admin/teachers/payroll`,
      icon: Wallet,
    },
  ];

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <aside className="hidden w-[250px] shrink-0 border-r border-[#E4DDD4] bg-[#F4F1EC] px-5 py-7 lg:sticky lg:top-0 lg:flex lg:h-screen lg:self-start lg:flex-col lg:overflow-y-auto">
          <div>
  <p className="font-sans text-[14px] font-semibold tracking-[0.16em] text-[#5F7F63]">
    HAMKKE │ 함께
  </p>
  <p className="mt-1 font-serif text-[13px] text-[#6F8F72]">
    Teacher Portal
  </p>
</div>

          <nav aria-label="Teacher portal" className="mt-9 space-y-1.5">
            {teacherNav.map(
              ({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  aria-current={label === "Teacher Agreement" ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition ${
                    label === "Teacher Agreement"
                      ? "bg-[#E2EBDD] font-medium text-[#49614D]"
                      : "text-[#5F5C57] hover:bg-[#ECE8E2]"
                  }`}
                >
                  <Icon
                    size={16}
                    strokeWidth={1.6}
                  />
                  {label}
                </Link>
              )
            )}
          </nav>

          <div className="mt-auto border-t border-[#DED7CF] pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E2EBDD] font-serif text-[#55705A]">
                {firstName
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium">
                  {profile.full_name ||
                    "Teacher"}
                </p>
                <p className="text-[11px] text-[#8A857E]">
                  Teacher
                </p>
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          <div className="mx-auto max-w-[1100px]">
            <header className="no-print mb-7">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6F8F72]">Teacher Portal</p>
              <h1 className="sr-only">Teacher Agreement</h1>
              <details className="mt-4 rounded-xl border border-[#E4DDD4] bg-[#F4F1EC] lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-[#49614D] [&::-webkit-details-marker]:hidden">
                  Teacher Agreement <ChevronDown size={16} aria-hidden="true" />
                </summary>
                <nav aria-label="Teacher portal mobile" className="grid gap-1 border-t border-[#E4DDD4] p-2 sm:grid-cols-2">
                  {teacherNav.map(({ label, href, icon: Icon }) => (
                    <Link key={label} href={href} aria-current={label === "Teacher Agreement" ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm ${label === "Teacher Agreement" ? "bg-[#E2EBDD] font-medium text-[#49614D]" : "text-[#5F5C57] hover:bg-[#ECE8E2]"}`}>
                      <Icon size={16} strokeWidth={1.6} aria-hidden="true" />{label}
                    </Link>
                  ))}
                </nav>
              </details>
            </header>
            <div className="rounded-2xl border border-[#E4DDD4] bg-white px-5 sm:px-8 [&>.teacher-agreement-container]:border-0">
              <TeacherAgreement teacher={teacher} viewer="teacher" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
