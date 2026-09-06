import Link from "next/link";
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
    return null;
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("id, full_name, role, status, teacher_number")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileData as Profile | null;

  if (
    !profile ||
    profile.role !== "teacher" ||
    profile.status !== "active"
  ) {
    return (
      <main className="min-h-screen bg-[#FAF8F5] px-6 py-16 text-[#292929]">
        <div className="mx-auto max-w-[760px] text-center">
          <p className="font-serif text-[28px]">
            Access unavailable
          </p>

          <p className="mt-3 font-sans text-[14px] leading-7 text-[#666]">
            This page is available only to active teachers.
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

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
      <header className="mx-auto flex w-full max-w-[1200px] items-start justify-between px-6 pt-6 sm:px-8 sm:pt-8 lg:px-10">
        <Link
          href={`/${locale}/admin/teachers`}
          className="font-sans text-[15px] text-[#5F655F] transition hover:text-[#6F8F72] sm:text-[16px]"
        >
          ← Teacher Dashboard
        </Link>

        <div className="text-right">
          <div className="font-sans text-[16px] font-semibold tracking-[0.18em] text-[#6F8F72]">
            HAMKKE │ 함께
          </div>

          <div className="mt-1 font-serif text-[13px] text-[#6F8F72]">
            From Small Talk to Big Ideas
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1200px] px-6 pb-10 pt-14 sm:px-8 sm:pb-12 sm:pt-16 lg:px-10">
        <div className="max-w-[760px]">
          <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-[#7A807A]">
            Teacher Dashboard
          </p>

          <h1 className="mt-3 font-serif text-[36px] leading-tight text-[#292929] sm:text-[42px]">
            Teacher Agreement
          </h1>

          <p className="mt-4 max-w-[680px] font-sans text-[14px] leading-7 text-[#666]">
            Review your teaching agreement with Hamkke. Once you have
            read and understood the agreement, you can formally accept
            it using your teacher account.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 pb-16 sm:px-8 lg:px-10">
        <TeacherAgreement
          teacher={teacher}
          viewer="teacher"
        />
      </section>
    </main>
  );
}