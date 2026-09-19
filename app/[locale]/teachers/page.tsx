import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Navbar from "../../../components/Navbar";
import { getMessages } from "../../../lib/getMessages";
import { getPublicTeachers } from "../../../lib/getPublicTeachers";
import {
  isValidLocale,
  type Locale,
} from "../../../lib/i18n";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

type SpecialtyItem = {
  title: string;
  description: string;
};

function renderHighlightedText(
  text: string,
  highlight: string
) {
  const index = text.indexOf(highlight);

  if (index === -1) {
    return text;
  }

  const before = text.slice(0, index);
  const after = text.slice(
    index + highlight.length
  );

  return (
    <>
      {before}
      <strong className="font-semibold text-[#304A39]">
        {highlight}
      </strong>
      {after}
    </>
  );
}

function interpolate(
  template: string,
  values: Record<string, string>
) {
  return template.replace(
    /\{(\w+)\}/g,
    (_, key: string) => values[key] ?? `{${key}}`
  );
}

function getDescriptionHighlight(
  description: unknown
) {
  if (
    !description ||
    typeof description !== "object"
  ) {
    return "";
  }

  const value = description as {
    highlight?: unknown;
    highlights?: unknown;
  };

  if (typeof value.highlight === "string") {
    return value.highlight;
  }

  if (
    Array.isArray(value.highlights) &&
    typeof value.highlights[0] === "string"
  ) {
    return value.highlights[0];
  }

  return "";
}

function getSpecialties(
  specialties: unknown
): SpecialtyItem[] {
  if (Array.isArray(specialties)) {
    return specialties.map((specialty) => {
      const item = specialty as {
        title?: unknown;
        description?: unknown;
        detail?: unknown;
      };

      return {
        title:
          typeof item.title === "string"
            ? item.title
            : "",
        description:
          typeof item.description === "string"
            ? item.description
            : typeof item.detail === "string"
              ? item.detail
              : "",
      };
    });
  }

  if (
    specialties &&
    typeof specialties === "object"
  ) {
    return Object.values(
      specialties
    ).map((specialty) => {
      const item = specialty as {
        title?: unknown;
        description?: unknown;
        detail?: unknown;
      };

      return {
        title:
          typeof item.title === "string"
            ? item.title
            : "",
        description:
          typeof item.description === "string"
            ? item.description
            : typeof item.detail === "string"
              ? item.detail
              : "",
      };
    });
  }

  return [];
}

function getEmptyState(
  empty: unknown
): {
  title: string;
  description: string;
} {
  if (
    empty &&
    typeof empty === "object"
  ) {
    const value = empty as {
      title?: unknown;
      description?: unknown;
    };

    return {
      title:
        typeof value.title === "string"
          ? value.title
          : "",
      description:
        typeof value.description === "string"
          ? value.description
          : "",
    };
  }

  if (typeof empty === "string") {
    return {
      title: empty,
      description: "",
    };
  }

  return {
    title: "",
    description: "",
  };
}

export default async function TeachersPage({
  params,
}: PageProps) {
  const { locale: localeParam } = await params;

  if (!isValidLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const teachers = await getPublicTeachers();

  const messages = getMessages(locale);
  const content = messages.teachers;

  const descriptionHighlight =
    getDescriptionHighlight(
      content.directory.description
    );

  const emptyState = getEmptyState(
    content.directory.empty
  );

  function getLearnerGroupLabel(
    audience: string
  ) {
    const normalized = audience
      .trim()
      .toLowerCase();

    if (
      normalized === "kid" ||
      normalized === "kids" ||
      normalized === "child" ||
      normalized === "children"
    ) {
      return content.learnerGroups.kids;
    }

    if (
      normalized === "teen" ||
      normalized === "teens" ||
      normalized === "teenager" ||
      normalized === "teenagers"
    ) {
      return content.learnerGroups.teens;
    }

    if (
      normalized === "adult" ||
      normalized === "adults"
    ) {
      return content.learnerGroups.adults;
    }

    return audience;
  }

  return (
    <>
      {/* ================================================================
          SAME NAVBAR AS THE HOMEPAGE
          ================================================================ */}

      <Navbar />

      <main className="min-h-screen bg-[#EEF2EA]">
        {/* ==============================================================
            PAGE INTRO
            ============================================================== */}

        <section
          className="
            relative
            overflow-hidden
            px-6
            pb-0
            pt-5
            sm:px-10
            sm:pt-6
            lg:px-16
            lg:pt-5
          "
        >
          <div
            className="
              mx-auto
              grid
              max-w-[1280px]
              items-center
              gap-4
              sm:gap-5
              lg:grid-cols-[minmax(0,1fr)_360px]
              lg:gap-10
            "
          >
            {/* ==========================================================
                INTRO COPY
                ========================================================== */}

            <div
              className="
                relative
                z-10
                text-center
                lg:-translate-y-3
                lg:text-left
              "
            >
              <p
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.28em]
                  text-[#718A73]
                  sm:text-xs
                "
              >
                {content.section.eyebrow}
              </p>

              <h1
                className="
                  mt-3
                  font-serif
                  text-[36px]
                  leading-[0.98]
                  tracking-[-0.035em]
                  text-[#304A39]
                  sm:text-[44px]
                  lg:whitespace-nowrap
                  lg:text-[48px]
                  xl:text-[52px]
                "
              >
                {content.section.title}
              </h1>

              <p
                className="
                  mx-auto
                  mt-4
                  max-w-[610px]
                  text-[14px]
                  leading-[1.7]
                  text-[#758477]
                  sm:text-[15px]
                  lg:mx-0
                "
              >
                {renderHighlightedText(
                  content.directory.description.text,
                  descriptionHighlight
                )}
              </p>
            </div>

            {/* ==========================================================
                HAMKKE TEACHERS MASCOT
                ========================================================== */}

            <div
              className="
                relative
                mx-auto
                flex
                w-full
                max-w-[330px]
                items-center
                justify-center
                sm:max-w-[350px]
                lg:-translate-y-3
                lg:mx-0
                lg:max-w-[360px]
                lg:justify-end
              "
            >
              <div
                className="
                  relative
                  h-[205px]
                  w-full
                  sm:h-[225px]
                  lg:h-[235px]
                "
              >
                <Image
                  src="/mascot/hamkke-teachers.png"
                  alt={content.directory.mascotAlt}
                  fill
                  priority
                  sizes="
                    (max-width: 640px) 330px,
                    (max-width: 1024px) 350px,
                    360px
                  "
                  className="
                    object-contain
                    object-center
                    lg:object-right
                  "
                />
              </div>
            </div>
          </div>
        </section>

        {/* ==============================================================
            TEACHER DIRECTORY
            ============================================================== */}

        <section
          className="
            px-6
            pb-20
            pt-0
            sm:px-10
            lg:px-16
            lg:pb-24
          "
        >
          <div className="mx-auto max-w-[1280px]">
            {teachers.length > 0 ? (
              <div
                className="
                  flex
                  flex-wrap
                  justify-center
                  gap-6
                "
              >
                {teachers.map((teacher) => {
                  const presentation =
                    teacher.slug === "jesica"
                      ? content.presentations.jesica
                      : content.presentations.default;

                  const specialties =
                    getSpecialties(
                      presentation.specialties
                    );

                  const firstName =
                    teacher.name
                      .trim()
                      .split(/\s+/)[0] ||
                    teacher.name;

                  return (
                    <article
                      key={teacher.id}
                      className="
                        group
                        flex
                        min-h-[410px]
                        w-full
                        max-w-[405px]
                        flex-col
                        overflow-hidden
                        rounded-[26px]
                        border
                        border-[#304A39]/8
                        bg-white
                        shadow-[0_8px_30px_rgba(48,74,57,0.06)]
                        transition
                        duration-200
                        hover:-translate-y-[2px]
                        hover:shadow-[0_12px_34px_rgba(48,74,57,0.09)]
                      "
                    >
                      {/* ==================================================
                          MAIN CONTENT
                          ================================================== */}

                      <div className="flex flex-1 flex-col p-6">
                        {/* Portrait + identity */}

                        <div className="flex items-start gap-5">
                          <div
                            className="
                              relative
                              h-[118px]
                              w-[118px]
                              shrink-0
                            "
                          >
                            <div
                              className="
                                relative
                                h-full
                                w-full
                                overflow-hidden
                                rounded-full
                                bg-[#EDE3D2]
                              "
                            >
                              {teacher.avatar_url ? (
                                <Image
                                  src={teacher.avatar_url}
                                  alt={`${teacher.name}, ${presentation.role}`}
                                  fill
                                  sizes="118px"
                                  className="object-cover"
                                />
                              ) : (
                                <div
                                  className="
                                    flex
                                    h-full
                                    w-full
                                    items-center
                                    justify-center
                                    text-[34px]
                                    font-semibold
                                    text-[#718A73]
                                  "
                                  aria-hidden="true"
                                >
                                  {firstName
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="min-w-0 pt-1">
                            <span
                              className="
                                inline-flex
                                rounded-full
                                bg-[#E5EBDD]
                                px-3
                                py-1.5
                                text-[10px]
                                font-semibold
                                uppercase
                                tracking-[0.12em]
                                text-[#52685A]
                              "
                            >
                              {presentation.role}
                            </span>

                            <h2
                              className="
                                mt-3
                                font-serif
                                text-[31px]
                                leading-none
                                text-[#304A39]
                              "
                            >
                              {firstName}
                            </h2>

                            <p
                              className="
                                mt-2
                                font-serif
                                text-[16px]
                                italic
                                leading-[1.25]
                                text-[#718A73]
                              "
                            >
                              “{presentation.quote}”
                            </p>
                          </div>
                        </div>

                        {/* Learner groups */}

                        {teacher.learner_groups.length >
                          0 && (
                          <div className="mt-5 flex flex-wrap gap-2">
                            {teacher.learner_groups.map(
                              (audience) => (
                                <span
                                  key={audience}
                                  className="
                                    rounded-full
                                    bg-[#F3EDDD]
                                    px-4
                                    py-1.5
                                    text-[11px]
                                    font-medium
                                    text-[#304A39]
                                  "
                                >
                                  {getLearnerGroupLabel(
                                    audience
                                  )}
                                </span>
                              )
                            )}
                          </div>
                        )}

                        {/* Divider */}

                        <div className="my-5 h-px bg-[#DCE4D7]" />

                        {/* Specialties */}

                        <div className="grid grid-cols-3 gap-3">
                          {specialties.map(
                            (
                              specialty: SpecialtyItem,
                              index: number
                            ) => (
                              <div
                                key={`${specialty.title}-${index}`}
                                className={
                                  index !==
                                  specialties.length - 1
                                    ? "border-r border-[#DCE4D7] pr-3"
                                    : ""
                                }
                              >
                                <div
                                  className="
                                    mb-2
                                    flex
                                    h-7
                                    w-7
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-[#F3EDDD]
                                    text-[13px]
                                    text-[#304A39]
                                  "
                                  aria-hidden="true"
                                >
                                  {index === 0
                                    ? "○"
                                    : index === 1
                                      ? "◎"
                                      : "◇"}
                                </div>

                                <p
                                  className="
                                    text-[11.5px]
                                    font-semibold
                                    leading-[1.2]
                                    text-[#304A39]
                                  "
                                >
                                  {specialty.title}
                                </p>

                                <p
                                  className="
                                    mt-1
                                    text-[9.5px]
                                    leading-[1.35]
                                    text-[#758477]
                                  "
                                >
                                  {specialty.description}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* ==================================================
                          PROFILE BUTTON
                          ================================================== */}

                      <div className="px-5 pb-5">
                        <div className="relative">
                          <div
                            className="
                              absolute
                              inset-0
                              translate-y-[7px]
                              rounded-[19px]
                              bg-[#718A73]
                            "
                            aria-hidden="true"
                          />

                          <Link
                            href={`/${locale}/teachers/${teacher.slug}`}
                            className="
                              group/button
                              relative
                              z-10
                              flex
                              min-h-[52px]
                              w-full
                              items-center
                              justify-between
                              rounded-[19px]
                              bg-[#304A39]
                              px-6
                              text-[14px]
                              font-semibold
                              text-[#FFFDF8]
                              transition-transform
                              duration-200
                              hover:-translate-y-[2px]
                              active:translate-y-[3px]
                            "
                          >
                            <span>
                              {interpolate(
                                content.ui.meetTeacher,
                                {
                                  name: firstName,
                                }
                              )}
                            </span>

                            <span
                              className="
                                text-[20px]
                                font-normal
                                leading-none
                                transition-transform
                                duration-200
                                group-hover/button:translate-x-1
                              "
                              aria-hidden="true"
                            >
                              →
                            </span>
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div
                className="
                  mx-auto
                  max-w-[620px]
                  rounded-[24px]
                  bg-[#DCE4D7]
                  px-8
                  py-12
                  text-center
                "
              >
                <p
                  className="
                    font-serif
                    text-[28px]
                    text-[#304A39]
                  "
                >
                  {emptyState.title}
                </p>

                {emptyState.description && (
                  <p
                    className="
                      mt-3
                      text-[14px]
                      leading-7
                      text-[#758477]
                    "
                  >
                    {emptyState.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}