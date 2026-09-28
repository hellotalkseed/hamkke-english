import Image from "next/image";
import PublicTeacherCard from "../../../components/PublicTeacherCard";
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
                {teachers.map((teacher) => <PublicTeacherCard key={teacher.id} teacher={teacher} locale={locale} />)}
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


