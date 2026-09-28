import Image from "next/image";
import Link from "next/link";
import { ArrowRight, AudioLines, BookOpen, BriefcaseBusiness, Building2, ClipboardCheck, HeartHandshake, MessageCircle, MessagesSquare, Sparkles, Sprout } from "lucide-react";
import type { PublicTeacher } from "../lib/getPublicTeachers";
import type { Locale } from "../lib/i18n";
import { getMessages } from "../lib/getMessages";
type SpecialtyItem = { title: string; description: string };
const teachingFocusIcons = {
  Conversation: MessageCircle,
  "Speaking Confidence": Sparkles,
  Pronunciation: AudioLines,
  Vocabulary: BookOpen,
  "Grammar in Conversation": MessagesSquare,
  "Beginner English": Sprout,
  "Interview Preparation": BriefcaseBusiness,
  "Exam Speaking": ClipboardCheck,
  "Business English": Building2,
} as const;

type TeachingFocusName =
  keyof typeof teachingFocusIcons;

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

function interpolate(
  template: string,
  values: Record<string, string>
) {
  return template.replace(
    /\{(\w+)\}/g,
    (_, key: string) => values[key] ?? `{${key}}`
  );
}


export default function PublicTeacherCard({ teacher, locale, carousel = false }: { teacher: PublicTeacher; locale: Locale; carousel?: boolean }) {
 const content = getMessages(locale).teachers;
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

                  const presentation =
                    teacher.slug === "jesica"
                      ? content.presentations.jesica
                      : content.presentations.default;

                  const presentationSpecialties =
                    getSpecialties(
                      presentation.specialties
                    );

                  const specialtyByTitle = new Map(
                    presentationSpecialties.map(
                      (specialty) => [
                        specialty.title,
                        specialty,
                      ]
                    )
                  );

                  const specialties =
                    teacher.teaching_focus
                      .slice(0, 3)
                      .map((focus) => {
                        const existing =
                          specialtyByTitle.get(focus);

                        return {
                          title: focus,
                          description:
                            existing?.description || "",
                        };
                      });

                  const firstName =
                    teacher.name
                      .trim()
                      .split(/\s+/)[0] ||
                    teacher.name;

return (<article
                      data-teacher-card={carousel ? true : undefined}
                      className={`group flex min-h-[410px]  flex-col overflow-hidden rounded-[26px] border border-[#304A39]/8 bg-white shadow-[0_8px_30px_rgba(48,74,57,0.06)] transition duration-200 hover:-translate-y-[2px] hover:shadow-[0_12px_34px_rgba(48,74,57,0.09)] ${carousel ? "min-w-[calc(100%-12px)] snap-start sm:min-w-[72%] md:min-w-[calc((100%-16px)/2)] lg:min-w-[calc((100%-32px)/3)]" : "w-full max-w-[405px]"}`}
                    >
                      {/* ==================================================
                          MAIN CONTENT
                          ================================================== */}

                      <div className="flex flex-1 flex-col p-5 sm:p-6">
                        {/* Portrait + identity */}

                        <div className="flex items-start gap-4 sm:gap-5">
                          <div
                            className="
                              relative
                              h-[100px] sm:h-[118px]
                              w-[100px] sm:w-[118px]
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

                            <h2
                              className="
                                font-serif
                                text-[31px]
                                leading-none
                                text-[#304A39]
                              "
                            >
                              Teacher {firstName}
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
                              {teacher.intro_quote}
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
                                  {(() => {
                                    const FocusIcon =
                                      teachingFocusIcons[
                                        specialty.title as TeachingFocusName
                                      ] ?? HeartHandshake;

                                    return (
                                      <FocusIcon
                                        size={15}
                                        strokeWidth={1.8}
                                      />
                                    );
                                  })()}
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

                            <ArrowRight
                              size={19}
                              strokeWidth={1.8}
                              className="
                                transition-transform
                                duration-200
                                group-hover/button:translate-x-1
                              "
                              aria-hidden="true"
                            />
                          </Link>
                        </div>
                      </div>
                    </article>);
}
