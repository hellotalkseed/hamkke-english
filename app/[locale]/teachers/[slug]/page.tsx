import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { isValidLocale } from "@/lib/i18n";
import TeacherProfileTabs from "@/components/TeacherProfileTabs";

const TEACHER_AVATAR_BUCKET = "teacher-avatars";

type TeachingPoint = {
  title: string;
  description: string;
};

type TeacherReflection = {
  id: string;
  rating: number;
  name: string;
  role: string;
  country: string | null;
  reflection: string;
  photo_url: string | null;
  created_at: string | null;
};

type TeacherProfilePageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export default async function TeacherProfilePage({
  params,
}: TeacherProfilePageProps) {
  const { locale, slug } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const admin = createAdminClient();

  /*
   * -------------------------------------------------------
   * Teacher public profile
   * -------------------------------------------------------
   */

  const { data: teacher, error } = await admin
    .from("teacher_public_profiles")
    .select(`
      teacher_id,
      slug,
      card_label,
      learner_groups,
      intro_quote,
      about,
      teaching,
      audio_intro_path,
      profiles!teacher_public_profiles_teacher_id_fkey (
        full_name,
        avatar_path,
        role,
        status
      )
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    console.error(
      "Teacher profile fetch error:",
      error
    );

    notFound();
  }

  if (!teacher) {
    notFound();
  }

  const profile = Array.isArray(teacher.profiles)
    ? teacher.profiles[0]
    : teacher.profiles;

  if (
    !profile ||
    profile.role !== "teacher" ||
    profile.status !== "active"
  ) {
    notFound();
  }

  /*
   * -------------------------------------------------------
   * Teacher learner stories
   * -------------------------------------------------------
   */

  const {
    data: reflectionData,
    error: reflectionsError,
  } = await admin
    .from("reflections")
    .select(`
      id,
      rating,
      name,
      role,
      country,
      reflection,
      photo_url,
      created_at
    `)
    .eq("teacher_id", teacher.teacher_id)
    .eq("approved", true)
    .order("created_at", {
      ascending: false,
    });

  if (reflectionsError) {
    console.error(
      "Teacher reflections fetch error:",
      reflectionsError
    );
  }

  const reflections =
    (reflectionData ?? []) as TeacherReflection[];

  /*
   * -------------------------------------------------------
   * Teacher presentation data
   * -------------------------------------------------------
   */

  const fullName = profile.full_name || "";

  const firstName =
    fullName.trim().split(/\s+/)[0] || fullName;

  const avatarUrl = profile.avatar_path
    ? admin.storage
        .from(TEACHER_AVATAR_BUCKET)
        .getPublicUrl(profile.avatar_path)
        .data.publicUrl
    : null;

  const teachingPoints = Array.isArray(
    teacher.teaching
  )
    ? (teacher.teaching as TeachingPoint[])
    : [];

  const aboutParagraphs =
    typeof teacher.about === "string"
      ? teacher.about
          .split(/\n\s*\n/)
          .map((paragraph) => paragraph.trim())
          .filter(Boolean)
      : [];

  return (
    <main className="min-h-screen bg-[#FFFDF8] text-[#293A30]">
      {/* Profile navigation */}
      <header className="border-b border-[#304A39]/10 bg-[#F3EDDD]">
        <div className="mx-auto flex h-[76px] max-w-[1560px] items-center justify-between px-6 sm:px-10 lg:px-12 xl:px-14">
          <Link
            href={`/${locale}`}
            className="font-serif text-[25px] font-semibold tracking-[-0.02em] text-[#304A39]"
          >
            Hamkke │ 함께
          </Link>

          <Link
            href={`/${locale}#get-started`}
            className="rounded-full bg-[#DCE4D7] px-5 py-2.5 text-sm font-semibold text-[#304A39] transition hover:bg-[#D2DDCE]"
          >
            Get Started
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1560px] px-6 pb-20 pt-7 sm:px-10 lg:px-12 xl:px-14">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-7 flex items-center gap-2 text-[13px] text-[#758477]"
        >
          <Link
            href={`/${locale}`}
            className="transition hover:text-[#304A39]"
          >
            Home
          </Link>

          <span>/</span>

          <Link
            href={`/${locale}#teachers`}
            className="transition hover:text-[#304A39]"
          >
            Teachers
          </Link>

          <span>/</span>

          <span className="text-[#304A39]">
            {firstName}
          </span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)_270px] xl:grid-cols-[240px_minmax(0,1fr)_290px] xl:gap-10">
          {/* LEFT */}
          <aside className="min-w-0">
            {/* Circular teacher portrait */}
            <div className="mx-auto w-full max-w-[220px]">
              <div className="relative aspect-square overflow-hidden rounded-full bg-[#E8EDE5]">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={`${fullName}, Hamkke teacher`}
                    fill
                    priority
                    sizes="220px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-serif text-5xl text-[#718A73]">
                    {firstName.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Audio introduction */}
            <div className="mt-5 rounded-[22px] border border-[#304A39]/10 bg-white px-4 py-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={!teacher.audio_intro_path}
                  aria-label={
                    teacher.audio_intro_path
                      ? `Play ${firstName}'s audio introduction`
                      : "Teacher audio introduction coming soon"
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#304A39] text-white disabled:cursor-default disabled:opacity-50"
                >
                  <span className="ml-0.5 text-[12px]">
                    ▶
                  </span>
                </button>

                <div className="min-w-0">
                  <p className="text-[13px] font-semibold leading-5 text-[#304A39]">
                    A short hello from {firstName}
                  </p>

                  {!teacher.audio_intro_path && (
                    <p className="mt-1 text-[11px] leading-4 text-[#758477]">
                      Audio introduction coming soon
                    </p>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* CENTER */}
          <section className="min-w-0 pt-1">
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#718A73]">
              Hamkke Teacher
            </p>

            <h1 className="mt-2 font-serif text-[54px] leading-none tracking-[-0.04em] text-[#304A39] sm:text-[62px]">
              {firstName}
            </h1>

            {teacher.intro_quote && (
              <p className="mt-5 max-w-[760px] font-serif text-[24px] italic leading-[1.35] text-[#526756]">
                “{teacher.intro_quote}”
              </p>
            )}

            <TeacherProfileTabs
              about={aboutParagraphs}
              teaching={teachingPoints}
              reflections={reflections}
              teacherSlug={teacher.slug}
            />
          </section>

          {/* RIGHT */}
          <aside className="lg:pt-1">
            <div className="sticky top-6 rounded-[28px] bg-[#E7EDE2] p-6 xl:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#718A73]">
                Start Here
              </p>

              <h2 className="mt-3 font-serif text-[29px] leading-[1.05] tracking-[-0.03em] text-[#304A39]">
                Start a conversation
                <br />
                with {firstName}
              </h2>

              <p className="mt-4 text-[14px] leading-6 text-[#5F6E62]">
                Book a free assessment and let&apos;s
                see how I can support your goals.
              </p>

              <div className="my-6 h-px bg-[#304A39]/10" />

              <div className="space-y-3 text-[13px] text-[#435447]">
                <p>1:1 online class</p>
                <p>25–50 minutes</p>
                <p>
                  No pressure, just a friendly chat
                </p>
              </div>

              <div className="relative mt-7">
                <div className="absolute inset-x-0 top-[4px] h-full rounded-full bg-[#243B2E]" />

                <Link
                  href={`/${locale}#get-started`}
                  className="relative flex min-h-[48px] items-center justify-center rounded-full bg-[#304A39] px-4 text-center text-[13px] font-semibold text-white transition-transform hover:-translate-y-[1px]"
                >
                  Book a Free Assessment →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}