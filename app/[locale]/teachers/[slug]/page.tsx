import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Navbar from "@/components/Navbar";
import TeacherAudioPlayer from "@/components/TeacherAudioPlayer";
import TeacherProfileTabs from "@/components/TeacherProfileTabs";
import { isValidLocale } from "@/lib/i18n";
import { createAdminClient } from "@/lib/supabase/admin";

const TEACHER_AVATAR_BUCKET = "teacher-avatars";
const TEACHER_AUDIO_BUCKET = "teacher-audio";

type Qualification = {
  title: string;
  institution: string;
  year: string;
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
      qualifications,
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

  const audioIntroUrl =
    teacher.audio_intro_path
      ? admin.storage
          .from(TEACHER_AUDIO_BUCKET)
          .getPublicUrl(
            teacher.audio_intro_path
          ).data.publicUrl
      : null;

  const qualifications = Array.isArray(
    teacher.qualifications
  )
    ? (teacher.qualifications as Qualification[])
    : [];

  const aboutParagraphs =
    typeof teacher.about === "string"
      ? teacher.about
          .split(/\n\s*\n/)
          .map((paragraph) => paragraph.trim())
          .filter(Boolean)
      : [];

  return (
    <>
      {/* ================================================================
          SAME SITE NAVBAR
          ================================================================ */}

      <Navbar />

      <main className="min-h-screen bg-[#FFFDF8] text-[#293A30]">
        <div
          className="
            mx-auto
            max-w-[1480px]
            px-6
            pb-24
            pt-5
            sm:px-10
            sm:pt-6
            lg:px-12
            lg:pt-7
            xl:px-14
          "
        >
          {/* ============================================================
              BREADCRUMB
              ============================================================ */}

          <nav
            aria-label="Breadcrumb"
            className="
              flex
              items-center
              gap-2
              text-[12px]
              font-medium
              text-[#8A968C]
            "
          >
            <Link
              href={`/${locale}`}
              className="
                transition-colors
                duration-200
                hover:text-[#304A39]
              "
            >
              Home
            </Link>

            <span
              className="text-[#B5BDB6]"
              aria-hidden="true"
            >
              /
            </span>

            <Link
              href={`/${locale}/teachers`}
              className="
                transition-colors
                duration-200
                hover:text-[#304A39]
              "
            >
              Teachers
            </Link>

            <span
              className="text-[#B5BDB6]"
              aria-hidden="true"
            >
              /
            </span>

            <span className="text-[#5E6D61]">
              {firstName}
            </span>
          </nav>

          {/* ============================================================
              PROFILE LAYOUT
              ============================================================ */}

          <div
            className="
              mt-12
              grid
              items-start
              gap-9
              sm:mt-14
              lg:mt-16
              lg:grid-cols-[200px_minmax(0,1fr)_280px]
              lg:gap-10
              xl:grid-cols-[220px_minmax(0,1fr)_300px]
              xl:gap-12
            "
          >
            {/* ==========================================================
                LEFT
                ========================================================== */}

            <aside
              className="
                min-w-0
                lg:pt-1
              "
            >
              {/* Teacher portrait */}

              <div
                className="
                  mx-auto
                  w-full
                  max-w-[200px]
                  xl:max-w-[215px]
                "
              >
                <div
                  className="
                    relative
                    aspect-square
                    overflow-hidden
                    rounded-full
                    bg-[#E8EDE5]
                  "
                >
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={`${fullName}, Hamkke teacher`}
                      fill
                      priority
                      sizes="
                        (max-width: 1024px) 200px,
                        215px
                      "
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className="
                        flex
                        h-full
                        items-center
                        justify-center
                        font-serif
                        text-5xl
                        text-[#718A73]
                      "
                    >
                      {firstName.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              {/* Audio introduction */}

              <div className="mt-5">
                {audioIntroUrl ? (
                  <TeacherAudioPlayer
                    src={audioIntroUrl}
                    firstName={firstName}
                  />
                ) : (
                  <div
                    className="
                      rounded-[22px]
                      border
                      border-[#304A39]/8
                      bg-white
                      px-4
                      py-4
                    "
                  >
                    <p
                      className="
                        text-[13px]
                        font-semibold
                        leading-5
                        text-[#304A39]
                      "
                    >
                      A short hello from {firstName}
                    </p>

                    <p
                      className="
                        mt-1
                        text-[11px]
                        leading-4
                        text-[#758477]
                      "
                    >
                      Audio introduction coming soon
                    </p>
                  </div>
                )}
              </div>
            </aside>

            {/* ==========================================================
                CENTER
                ========================================================== */}

            <section className="min-w-0">
              {/* Teacher identity */}

              <div className="max-w-[760px]">
                <p
                  className="
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.24em]
                    text-[#718A73]
                  "
                >
                  Hamkke Teacher
                </p>

                <h1
                  className="
                    mt-2
                    font-serif
                    text-[52px]
                    leading-[0.95]
                    tracking-[-0.04em]
                    text-[#304A39]
                    sm:text-[60px]
                    lg:text-[64px]
                  "
                >
                  {firstName}
                </h1>

                {teacher.intro_quote && (
                  <p
                    className="
                      mt-5
                      max-w-[700px]
                      font-serif
                      text-[21px]
                      italic
                      leading-[1.45]
                      text-[#526756]
                      sm:text-[23px]
                    "
                  >
                    “{teacher.intro_quote}”
                  </p>
                )}
              </div>

              {/* Profile content tabs */}

              <div className="mt-9">
                <TeacherProfileTabs
                  about={aboutParagraphs}
                  qualifications={qualifications}
                  reflections={reflections}
                  teacherSlug={teacher.slug}
                />
              </div>
            </section>

            {/* ==========================================================
                RIGHT
                ========================================================== */}

            <aside
              className="
                min-w-0
                lg:pt-1
              "
            >
              <div
                className="
                  rounded-[26px]
                  bg-[#E7EDE2]
                  p-6
                  lg:sticky
                  lg:top-6
                  xl:p-7
                "
              >
                <p
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.24em]
                    text-[#718A73]
                  "
                >
                  Start Here
                </p>

                <h2
                  className="
                    mt-3
                    font-serif
                    text-[28px]
                    leading-[1.08]
                    tracking-[-0.03em]
                    text-[#304A39]
                  "
                >
                  Start a conversation
                  <br />
                  with {firstName}
                </h2>

                <p
                  className="
                    mt-4
                    text-[13px]
                    leading-[1.65]
                    text-[#5F6E62]
                  "
                >
                  Book a free assessment and let&apos;s
                  see how I can support your goals.
                </p>

                <div className="my-5 h-px bg-[#304A39]/10" />

                <div
                  className="
                    space-y-3
                    text-[13px]
                    text-[#435447]
                  "
                >
                  <p>1:1 online class</p>

                  <p>25–50 minutes</p>

                  <p>
                    No pressure, just a friendly chat
                  </p>
                </div>

                <div className="relative mt-6">
                  <div
                    className="
                      absolute
                      inset-0
                      translate-y-[5px]
                      rounded-[16px]
                      bg-[#718A73]
                    "
                    aria-hidden="true"
                  />

                  <Link
                    href={`/${locale}#get-started`}
                    className="
                      relative
                      z-10
                      flex
                      min-h-[48px]
                      items-center
                      justify-between
                      rounded-[16px]
                      bg-[#304A39]
                      px-5
                      text-[13px]
                      font-semibold
                      text-[#FFFDF8]
                      transition-transform
                      duration-200
                      hover:-translate-y-[1px]
                      active:translate-y-[2px]
                    "
                  >
                    <span>
                      Book a Free Assessment
                    </span>

                    <span
                      className="
                        ml-3
                        text-[18px]
                        font-normal
                        leading-none
                      "
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}