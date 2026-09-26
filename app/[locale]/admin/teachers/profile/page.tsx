import Link from "next/link";
import {
  redirect,
} from "next/navigation";
import {
  ExternalLink,
  Home,
  Users,
  FileText,
  Wallet,
  UserRound,
  CalendarDays,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import PublicProfileEditor from "./PublicProfileEditor";

interface TeacherProfilePageProps {
  params: Promise<{
    locale: string;
  }>;
}

type Qualification = {
  title?: string;
  institution?: string;
  year?: string;
};

export default async function TeacherProfilePage({
  params,
}: TeacherProfilePageProps) {
  const { locale } = await params;

  const supabase = await createClient();

  /* ----------------------------------------------------------------------- */
  /* AUTH                                                                    */
  /* ----------------------------------------------------------------------- */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/portal/login`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, full_name, role, status, avatar_path"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (
    !profile ||
    profile.role !== "teacher" ||
    profile.status !== "active"
  ) {
    redirect(`/${locale}/admin`);
  }

  /* ----------------------------------------------------------------------- */
  /* PUBLIC TEACHER PROFILE                                                  */
  /* ----------------------------------------------------------------------- */

  const { data: publicProfile } =
    await supabase
      .from("teacher_public_profiles")
      .select(`
        teacher_id,
        slug,
        card_label,
        learner_groups,
        teaching_focus,
        is_published,
        intro_quote,
        about,
        qualifications,
        audio_intro_path
      `)
      .eq("teacher_id", user.id)
      .maybeSingle();

  const learnerGroups = Array.isArray(
    publicProfile?.learner_groups
  )
    ? publicProfile.learner_groups.filter(
        (group): group is string =>
          typeof group === "string"
      )
    : [];

  const teachingFocus = Array.isArray(
    publicProfile?.teaching_focus
  )
    ? publicProfile.teaching_focus.filter(
        (focus): focus is string =>
          typeof focus === "string"
      )
    : [];

  const qualifications = Array.isArray(
    publicProfile?.qualifications
  )
    ? (publicProfile.qualifications as Qualification[])
    : [];

  const publicProfileHref =
    publicProfile?.slug &&
    publicProfile.is_published
      ? `/${locale}/teachers/${publicProfile.slug}`
      : null;

  const hasAudio = Boolean(
    publicProfile?.audio_intro_path
  );

  /* ----------------------------------------------------------------------- */
  /* UPDATE PUBLIC PROFILE                                                   */
  /* ----------------------------------------------------------------------- */

  async function updatePublicProfile(
    formData: FormData
  ) {
    "use server";

    const supabase =
      await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error(
        "Authentication required."
      );
    }

    const { data: currentProfile } =
      await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", user.id)
        .maybeSingle();

    if (
      currentProfile?.role !==
        "teacher" ||
      currentProfile?.status !==
        "active"
    ) {
      throw new Error(
        "Teacher access required."
      );
    }

    const fullName = String(
      formData.get("full_name") ?? ""
    ).trim();

    const cardLabel = String(
      formData.get("card_label") ?? ""
    ).trim();

    const learnerGroupsRaw = String(
      formData.get("learner_groups") ??
        "[]"
    );

    const teachingFocusRaw = String(
      formData.get("teaching_focus") ?? "[]"
    );

    const about = String(
      formData.get("about") ?? ""
    ).trim();

    const introQuote = String(
      formData.get("intro_quote") ?? ""
    ).trim();

    const qualificationsRaw = String(
      formData.get("qualifications") ?? "[]"
    );

    if (!fullName) {
      throw new Error(
        "Name is required."
      );
    }


    let learnerGroups: string[] = [];

    try {
      const parsed = JSON.parse(
        learnerGroupsRaw
      );

      if (Array.isArray(parsed)) {
        learnerGroups =
          parsed.filter(
            (group): group is string =>
              typeof group ===
                "string" &&
              [
                "Kids",
                "Teens",
                "Adults",
              ].includes(group)
          );
      }
    } catch {
      throw new Error(
        "Invalid learner groups."
      );
    }

    if (
      learnerGroups.length === 0
    ) {
      throw new Error(
        "Select at least one learner group."
      );
    }

    const allowedTeachingFocus = [
      "Conversation",
      "Speaking Confidence",
      "Pronunciation",
      "Vocabulary",
      "Grammar in Conversation",
      "Beginner English",
      "Interview Preparation",
      "Exam Speaking",
      "Business English",
    ];

    let teachingFocus: string[] = [];

    try {
      const parsed = JSON.parse(teachingFocusRaw);

      if (Array.isArray(parsed)) {
        teachingFocus = parsed.filter(
          (focus): focus is string =>
            typeof focus === "string" &&
            allowedTeachingFocus.includes(focus)
        );
      }
    } catch {
      throw new Error("Invalid teaching focus.");
    }

    if (teachingFocus.length > 5) {
      throw new Error(
        "Select no more than five teaching focus areas."
      );
    }

    let nextQualifications: Qualification[] = [];

    try {
      const parsed = JSON.parse(qualificationsRaw);
      if (Array.isArray(parsed)) {
        nextQualifications = parsed
          .filter((item) => item && typeof item === "object")
          .map((item) => ({
            title: String(item.title ?? "").trim(),
            institution: String(item.institution ?? "").trim(),
            year: String(item.year ?? "").trim(),
          }))
          .filter((item) => item.title || item.institution || item.year);
      }
    } catch {
      throw new Error("Invalid qualifications.");
    }

    const admin = createAdminClient();

    const {
      data: updatedProfile,
      error: profileError,
    } = await admin
      .from("profiles")
      .update({
        full_name: fullName,
      })
      .eq("id", user.id)
      .select("id, full_name")
      .maybeSingle();

    if (profileError) {
      throw new Error(
        profileError.message
      );
    }

    if (!updatedProfile) {
      throw new Error(
        "Display name was not updated."
      );
    }

    if (updatedProfile.full_name !== fullName) {
      throw new Error(
        "Display name was not stored correctly."
      );
    }

    const {
      data: updatedPublicProfile,
      error: publicProfileError,
    } = await supabase
      .from(
        "teacher_public_profiles"
      )
      .update({
        card_label: cardLabel,
        learner_groups:
          learnerGroups,
        teaching_focus: teachingFocus,
        about,
        intro_quote: introQuote,
        qualifications: nextQualifications,
      })
      .eq("teacher_id", user.id)
      .select("teacher_id, teaching_focus")
      .maybeSingle();

    if (publicProfileError) {
      throw new Error(
        publicProfileError.message
      );
    }

    if (!updatedPublicProfile) {
      throw new Error(
        "No teacher public profile row was updated."
      );
    }

    if (
      JSON.stringify(
        [...(updatedPublicProfile.teaching_focus ?? [])].sort()
      ) !==
      JSON.stringify([...teachingFocus].sort())
    ) {
      throw new Error(
        "Teaching Focus was not stored correctly."
      );
    }
  }

  const firstName =
    profile.full_name?.trim().split(/\\s+/)[0] ||
    "T";

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

          <nav className="mt-9 space-y-1.5">
            {teacherNav.map(
              ({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition ${
                    label === "My Profile"
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
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#6F8F72]">
                  Teacher Portal
                </p>

                <h1 className="mt-2 font-serif text-[34px] font-normal tracking-[-0.025em] sm:text-[40px]">
                  My Profile
                </h1>

                <p className="mt-2 max-w-2xl font-sans text-[13px] leading-6 text-[#817B74]">
                  Manage the profile information learners see when they visit your Hamkke teacher page.
                </p>
              </div>

              {publicProfileHref ? (
                <Link
                  href={publicProfileHref}
                  target="_blank"
                  className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-[#C8D4C3] px-4 py-2.5 font-sans text-[13px] font-medium text-[#526B55] transition-colors hover:bg-[#EEF2EA]"
                >
                  View Public Profile
                  <ExternalLink
                    size={14}
                    strokeWidth={1.6}
                  />
                </Link>
              ) : null}
            </div>

      {/* PROFILE STATUS */}

      <section
        className="
          mx-auto
          w-full
          max-w-none
          px-0
          pb-8
        "
      >
        <div
          className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-4
            rounded-[18px]
            bg-[#EEF2EA]
            px-6
            py-5
          "
        >
          <div>
            <p
              className="
                font-sans
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-[#718A73]
              "
            >
              Profile Status
            </p>

            <p
              className="
                mt-2
                font-serif
                text-[18px]
                text-[#3F4D42]
              "
            >
              {publicProfile?.is_published
                ? "Your teacher profile is currently published."
                : "Your teacher profile is not currently published."}
            </p>
          </div>

          <span
            className={`
              rounded-full
              px-4
              py-2
              font-sans
              text-[12px]
              font-semibold
              uppercase
              tracking-[0.1em]
              ${
                publicProfile?.is_published
                  ? "bg-[#DCE4D7] text-[#526B55]"
                  : "bg-[#E8E4DD] text-[#77736C]"
              }
            `}
          >
            {publicProfile?.is_published
              ? "Published"
              : "Not Published"}
          </span>
        </div>
      </section>

      {/* PUBLIC PROFILE CONTENT */}

      <section className="mx-auto w-full max-w-none pb-24">
        <div className="border-t border-[#DCD8D2] py-10">
          <PublicProfileEditor
            initialFullName={profile.full_name || ""}
            initialCardLabel={publicProfile?.card_label || ""}
            initialLearnerGroups={learnerGroups}
            initialTeachingFocus={teachingFocus}
            initialAbout={publicProfile?.about || ""}
            initialIntroQuote={publicProfile?.intro_quote || ""}
            initialQualifications={qualifications}
            hasAudio={hasAudio}
            updateAction={updatePublicProfile}
          />
        </div>
      </section>
          </div>
        </section>
      </div>
    </main>
  );
}



