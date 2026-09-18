import Link from "next/link";
import {
  redirect,
} from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Image as ImageIcon,
  Quote,
  UserRound,
  GraduationCap,
  Mic2,
  CalendarDays,
  HeartHandshake,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
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
    redirect(`/${locale}/admin/login`);
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

  const hasAvatar = Boolean(
    profile.avatar_path
  );

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

    if (!fullName) {
      throw new Error(
        "Name is required."
      );
    }

    if (!cardLabel) {
      throw new Error(
        "Profile label is required."
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

    const { error: profileError } =
      await supabase
        .from("profiles")
        .update({
          full_name: fullName,
        })
        .eq("id", user.id);

    if (profileError) {
      throw new Error(
        profileError.message
      );
    }

    const {
      error: publicProfileError,
    } = await supabase
      .from(
        "teacher_public_profiles"
      )
      .update({
        card_label: cardLabel,
        learner_groups:
          learnerGroups,
      })
      .eq("teacher_id", user.id);

    if (publicProfileError) {
      throw new Error(
        publicProfileError.message
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#292929]">
      {/* HEADER */}

      <header
        className="
          w-full
          px-6
          pt-7
          sm:px-8
          sm:pt-8
          lg:px-10
          xl:px-12
        "
      >
        <div
          className="
            flex
            w-full
            items-start
            justify-between
            gap-8
          "
        >
          <Link
            href={`/${locale}/admin/teachers`}
            className="
              inline-flex
              items-center
              gap-2
              font-sans
              text-[15px]
              text-[#5F655F]
              transition-colors
              hover:text-[#6F8F72]
              sm:text-[16px]
            "
          >
            <ArrowLeft
              size={16}
              strokeWidth={1.7}
            />

            Teacher Dashboard
          </Link>

          <Link
            href={`/${locale}`}
            className="
              shrink-0
              text-right
              transition-opacity
              duration-200
              hover:opacity-75
            "
            aria-label="Go to Hamkke homepage"
          >
            <p
              className="
                font-sans
                text-[16px]
                font-semibold
                leading-none
                tracking-[0.18em]
                text-[#6F8F72]
              "
            >
              HAMKKE │ 함께
            </p>

            <p
              className="
                mt-2
                font-serif
                text-[13px]
                font-normal
                leading-none
                tracking-[0.02em]
                text-[#6F8F72]
              "
            >
              From Small Talk to Big Ideas
            </p>
          </Link>
        </div>
      </header>

      {/* INTRO */}

      <section
        className="
          mx-auto
          w-full
          max-w-[1040px]
          px-6
          pb-12
          pt-16
          sm:px-8
          sm:pb-14
          sm:pt-20
          lg:px-10
          lg:pb-16
          lg:pt-24
        "
      >
        <div
          className="
            flex
            flex-col
            gap-8
            md:flex-row
            md:items-end
            md:justify-between
          "
        >
          <div>
            <p
              className="
                font-sans
                text-[13px]
                font-medium
                uppercase
                tracking-[0.14em]
                text-[#8A8A84]
              "
            >
              Public Teacher Profile
            </p>

            <h1
              className="
                mt-4
                font-serif
                text-[48px]
                font-normal
                leading-[1.05]
                tracking-[-0.035em]
                sm:text-[58px]
                lg:text-[64px]
              "
            >
              My Profile
            </h1>

            <p
              className="
                mt-6
                max-w-[680px]
                font-serif
                text-[19px]
                leading-8
                text-[#5F5D58]
                sm:text-[21px]
              "
            >
              Manage the information learners
              see when they visit your Hamkke
              teacher profile.
            </p>
          </div>

          {publicProfileHref ? (
            <Link
              href={publicProfileHref}
              target="_blank"
              className="
                inline-flex
                w-fit
                shrink-0
                items-center
                gap-2
                rounded-full
                border
                border-[#C8D4C3]
                px-5
                py-3
                font-sans
                text-[14px]
                font-medium
                text-[#526B55]
                transition-colors
                hover:bg-[#EEF2EA]
              "
            >
              View Public Profile

              <ExternalLink
                size={15}
                strokeWidth={1.6}
              />
            </Link>
          ) : null}
        </div>
      </section>

      {/* PROFILE STATUS */}

      <section
        className="
          mx-auto
          w-full
          max-w-[1040px]
          px-6
          pb-8
          sm:px-8
          lg:px-10
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

      {/* PROFILE SECTIONS */}

      <section
        className="
          mx-auto
          w-full
          max-w-[1040px]
          px-6
          pb-24
          sm:px-8
          lg:px-10
        "
      >
        {/* BASIC PROFILE */}

        <div
          className="
            border-t
            border-[#DCD8D2]
            py-10
          "
        >
          <div
            className="
              grid
              gap-8
              md:grid-cols-[220px_minmax(0,1fr)]
              md:gap-12
            "
          >
            <div>
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  bg-[#E2EBDD]
                  text-[#6F8F72]
                "
              >
                <UserRound
                  size={19}
                  strokeWidth={1.5}
                />
              </div>

              <h2
                className="
                  mt-4
                  font-serif
                  text-[27px]
                  font-normal
                "
              >
                Public Profile
              </h2>
            </div>

            <PublicProfileEditor
              initialFullName={
                profile.full_name || ""
              }
              initialCardLabel={
                publicProfile?.card_label ||
                ""
              }
              initialLearnerGroups={
                learnerGroups
              }
              updateAction={
                updatePublicProfile
              }
            />
          </div>
        </div>

        {/* PROFILE PHOTO */}

        <div
          className="
            border-t
            border-[#DCD8D2]
            py-10
          "
        >
          <SectionRow
            icon={
              <ImageIcon
                size={19}
                strokeWidth={1.5}
              />
            }
            title="Profile Photo"
          >
            <StatusLine
              complete={hasAvatar}
              completeText="Profile photo uploaded"
              incompleteText="No profile photo uploaded"
            />
          </SectionRow>
        </div>

        {/* INTRO QUOTE */}

        <div
          className="
            border-t
            border-[#DCD8D2]
            py-10
          "
        >
          <SectionRow
            icon={
              <Quote
                size={19}
                strokeWidth={1.5}
              />
            }
            title="Introduction"
          >
            <ProfileField
              label="Profile quote"
              value={
                publicProfile?.intro_quote ||
                "Not added"
              }
            />
          </SectionRow>
        </div>

        {/* ABOUT */}

        <div
          className="
            border-t
            border-[#DCD8D2]
            py-10
          "
        >
          <SectionRow
            icon={
              <UserRound
                size={19}
                strokeWidth={1.5}
              />
            }
            title="About Me"
          >
            <div>
              <p className={fieldLabelClass}>
                About
              </p>

              {publicProfile?.about ? (
                <div
                  className="
                    mt-3
                    space-y-4
                    whitespace-pre-line
                    font-serif
                    text-[17px]
                    leading-8
                    text-[#4F4D48]
                  "
                >
                  {publicProfile.about}
                </div>
              ) : (
                <p className={fieldValueClass}>
                  Not added
                </p>
              )}
            </div>
          </SectionRow>
        </div>

        {/* QUALIFICATIONS */}

        <div
          className="
            border-t
            border-[#DCD8D2]
            py-10
          "
        >
          <SectionRow
            icon={
              <GraduationCap
                size={19}
                strokeWidth={1.5}
              />
            }
            title="Qualifications & Credentials"
          >
            {qualifications.length >
            0 ? (
              <div
                className="
                  divide-y
                  divide-[#E2DED7]
                  border-y
                  border-[#E2DED7]
                "
              >
                {qualifications.map(
                  (
                    qualification,
                    index
                  ) => (
                    <div
                      key={`${qualification.title}-${index}`}
                      className="
                        flex
                        flex-col
                        gap-2
                        py-5
                        sm:flex-row
                        sm:items-start
                        sm:justify-between
                        sm:gap-6
                      "
                    >
                      <div>
                        <p
                          className="
                            font-serif
                            text-[18px]
                            leading-7
                            text-[#333630]
                          "
                        >
                          {qualification.title ||
                            "Untitled qualification"}
                        </p>

                        <p
                          className="
                            mt-1
                            font-sans
                            text-[13px]
                            leading-6
                            text-[#74716B]
                          "
                        >
                          {qualification.institution ||
                            "Institution not added"}
                        </p>
                      </div>

                      {qualification.year ? (
                        <span
                          className="
                            shrink-0
                            font-sans
                            text-[13px]
                            font-medium
                            text-[#718A73]
                          "
                        >
                          {
                            qualification.year
                          }
                        </span>
                      ) : null}
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className={fieldValueClass}>
                No qualifications added
                yet.
              </p>
            )}
          </SectionRow>
        </div>

        {/* AUDIO INTRO */}

        <div
          className="
            border-t
            border-[#DCD8D2]
            py-10
          "
        >
          <SectionRow
            icon={
              <Mic2
                size={19}
                strokeWidth={1.5}
              />
            }
            title="Audio Introduction"
          >
            <StatusLine
              complete={hasAudio}
              completeText="Audio introduction uploaded"
              incompleteText="No audio introduction uploaded"
            />
          </SectionRow>
        </div>

        {/* AVAILABILITY */}

        <div
          className="
            border-t
            border-[#DCD8D2]
            py-10
          "
        >
          <SectionRow
            icon={
              <CalendarDays
                size={19}
                strokeWidth={1.5}
              />
            }
            title="Availability"
          >
            <p
              className="
                font-serif
                text-[17px]
                leading-7
                text-[#5F5D58]
              "
            >
              Your public availability is
              managed separately from your
              profile information.
            </p>

            <Link
              href={`/${locale}/admin/teachers/availability`}
              className="
                mt-4
                inline-block
                font-sans
                text-[14px]
                font-medium
                text-[#6F8F72]
                underline
                underline-offset-4
                transition-colors
                hover:text-[#526B55]
              "
            >
              Manage availability
            </Link>
          </SectionRow>
        </div>

        {/* LEARNER STORIES */}

        <div
          className="
            border-y
            border-[#DCD8D2]
            py-10
          "
        >
          <SectionRow
            icon={
              <HeartHandshake
                size={19}
                strokeWidth={1.5}
              />
            }
            title="Learner Stories"
          >
            <p
              className="
                font-serif
                text-[17px]
                leading-7
                text-[#5F5D58]
              "
            >
              Learner Stories come from
              Hamkke&apos;s approved student
              reflections and are not manually
              written from this profile page.
            </p>
          </SectionRow>
        </div>
      </section>
    </main>
  );
}

/* ------------------------------------------------------------------------- */
/* SMALL PRESENTATIONAL HELPERS                                              */
/* ------------------------------------------------------------------------- */

const fieldLabelClass = `
  font-sans
  text-[11px]
  font-semibold
  uppercase
  tracking-[0.12em]
  text-[#8A8A84]
`;

const fieldValueClass = `
  mt-2
  font-serif
  text-[18px]
  leading-7
  text-[#444640]
`;

function ProfileField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className={fieldLabelClass}>
        {label}
      </p>

      <p className={fieldValueClass}>
        {value}
      </p>
    </div>
  );
}

function SectionRow({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        grid
        gap-8
        md:grid-cols-[220px_minmax(0,1fr)]
        md:gap-12
      "
    >
      <div>
        <div
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            bg-[#E2EBDD]
            text-[#6F8F72]
          "
        >
          {icon}
        </div>

        <h2
          className="
            mt-4
            font-serif
            text-[27px]
            font-normal
            leading-tight
          "
        >
          {title}
        </h2>
      </div>

      <div>{children}</div>
    </div>
  );
}

function StatusLine({
  complete,
  completeText,
  incompleteText,
}: {
  complete: boolean;
  completeText: string;
  incompleteText: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`
          h-2.5
          w-2.5
          rounded-full
          ${
            complete
              ? "bg-[#718A73]"
              : "bg-[#C7C2BA]"
          }
        `}
      />

      <p
        className="
          font-serif
          text-[17px]
          text-[#5F5D58]
        "
      >
        {complete
          ? completeText
          : incompleteText}
      </p>
    </div>
  );
}