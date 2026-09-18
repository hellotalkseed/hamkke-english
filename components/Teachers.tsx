import type { Locale } from "../lib/i18n";
import TeachersCarousel, {
  type PublicTeacher,
} from "./TeachersCarousel";

type TeachersProps = {
  locale: Locale;
};

async function getTeachers(): Promise<PublicTeacher[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const response = await fetch(
      `${baseUrl}/api/teachers`,
      {
        next: {
          revalidate: 60,
        },
      }
    );

    if (!response.ok) {
      console.error(
        "Unable to load public teachers:",
        response.status,
        response.statusText
      );

      return [];
    }

    const data = (await response.json()) as {
      teachers?: PublicTeacher[];
    };

    return data.teachers || [];
  } catch (error) {
    console.error(
      "Unable to load public teachers:",
      error
    );

    return [];
  }
}

export default async function Teachers({
  locale,
}: TeachersProps) {
  const teachers = await getTeachers();

  return (
    <section
      id="teachers"
      className="
        relative
        overflow-hidden
        bg-[#EEF2EA]
        py-11
        sm:py-12
        lg:py-14
      "
    >
      {/* Heading */}
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[900px] text-center">
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
            Meet Our Teachers
          </p>

          <div className="mx-auto mt-3 h-px w-12 bg-[#718A73]/50" />

          <h2
            className="
              mt-4
              font-serif
              text-[40px]
              leading-[0.98]
              tracking-[-0.035em]
              text-[#304A39]
              sm:text-5xl
              lg:text-[50px]
            "
          >
            The people behind the conversations.
          </h2>
        </div>
      </div>

      {/*
       * Carousel
       *
       * Intentionally wider than the normal section container.
       * This lets the navigation controls sit close to the
       * left and right edges of the section, matching the
       * approved visual.
       */}
      <div
        className="
          relative
          mx-auto
          mt-8
          w-full
          max-w-[1740px]
          px-[58px]
          sm:px-[76px]
          lg:px-[112px]
          xl:px-[128px]
        "
      >
        <TeachersCarousel
          locale={locale}
          teachers={teachers}
          teacherSlots={3}
        />
      </div>

      {/* Quiet growth note */}
      {teachers.length < 3 && (
        <div
          className="
            mt-4
            hidden
            items-center
            justify-center
            gap-3
            lg:flex
          "
        >
          <span className="h-px w-8 bg-[#718A73]/40" />

          <p className="font-serif text-[15px] italic text-[#718A73]">
            More conversations are coming.
          </p>

          <span className="h-px w-8 bg-[#718A73]/40" />
        </div>
      )}
    </section>
  );
}