import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { getMessages } from "../../../lib/getMessages";
import { isValidLocale } from "../../../lib/i18n";

interface PlatformPageProps {
  params: Promise<{
    locale: string;
  }>;
}

const platforms = [
  {
    name: "Microsoft Teams",
    logo: "/platforms/microsoft-teams.svg",
  },
  {
    name: "Zoom",
    logo: "/platforms/zoom.svg",
  },
  {
    name: "Google Meet",
    logo: "/platforms/google-meet.svg",
  },
  {
    name: "KakaoTalk",
    logo: "/platforms/kakaotalk.svg",
  },
  {
    name: "VooV Meeting",
    logo: "/platforms/voov.svg",
  },
];

export default async function PlatformPage({
  params,
}: PlatformPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const t = getMessages(locale);
  const platform = t.platform;

  return (
    <main
      className="
        min-h-screen
        bg-[#FAF8F5]
        text-[#292929]
      "
    >
      {/* =====================================================
          HEADER
          ===================================================== */}

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
            relative
            flex
            w-full
            items-center
            justify-between
          "
        >
          {/* BACK TO HAMKKE */}

          <Link
            href={`/${locale}`}
            className="
              shrink-0
              font-sans
              text-[15px]
              text-[#5F655F]
              transition-colors
              duration-200
              hover:text-[#6F8F72]

              sm:text-[16px]
            "
          >
            ← Hamkke
          </Link>

          {/* DESKTOP BRAND */}

          <div
            className="
              absolute
              left-1/2
              -translate-x-1/2
              whitespace-nowrap

              hidden

              font-sans
              text-[15px]
              font-medium
              text-[#6F8F72]

              sm:block
              sm:text-[16px]
            "
          >
            Hamkke │ 함께
          </div>

          {/* LANGUAGE SELECTOR */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-3

              font-sans
              text-[14px]
              text-[#5F655F]

              sm:gap-4
              sm:text-[15px]
            "
          >
            <Link
              href="/en/platform"
              className={
                locale === "en"
                  ? "font-medium text-[#6F8F72]"
                  : "transition-colors hover:text-[#6F8F72]"
              }
            >
              EN
            </Link>

            <Link
              href="/ko/platform"
              className={
                locale === "ko"
                  ? "font-medium text-[#6F8F72]"
                  : "transition-colors hover:text-[#6F8F72]"
              }
            >
              한국어
            </Link>

            <Link
              href="/zh/platform"
              className={
                locale === "zh"
                  ? "font-medium text-[#6F8F72]"
                  : "transition-colors hover:text-[#6F8F72]"
              }
            >
              中文
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          INTRO
          ===================================================== */}

      <section
        className="
          mx-auto
          w-full
          max-w-[1040px]
          px-6
          pb-12
          pt-10

          sm:px-8
          sm:pb-14
          sm:pt-20

          lg:px-10
          lg:pb-16
          lg:pt-24
        "
      >
        {/* MOBILE BRAND */}

        <div
          className="
            mb-0
            text-center

            font-sans
            text-[14px]
            font-medium
            tracking-[0.02em]
            text-[#6F8F72]

            sm:hidden
          "
        >
          Hamkke │ 함께
        </div>

        {/* PAGE TITLE */}

        <h1
          className="
            text-center

            font-serif
            text-[52px]
            font-normal
            leading-[1.05]
            tracking-[-0.035em]

            text-[#292929]

            sm:text-[62px]

            lg:text-[70px]
          "
        >
          {platform.title}
        </h1>

        {/* INTRO */}

        <p
          className="
            mx-auto
            mt-8
            max-w-[850px]

            text-center

            font-serif
            text-[21px]
            font-normal
            leading-8

            text-[#4A4A4A]

            sm:text-[23px]
            sm:leading-9

            lg:text-[25px]
            lg:leading-10
          "
        >
          {platform.intro}
        </p>
      </section>

      {/* =====================================================
          PLATFORM OPTIONS
          ===================================================== */}

      <section
        className="
          mx-auto
          w-full
          max-w-[1040px]
          px-6
          pb-20

          sm:px-8

          lg:px-10
          lg:pb-24
        "
      >
        {/* SECTION LABEL */}

        <div className="mb-10">
          <p
            className="
              font-sans
              text-[11px]
              font-medium
              uppercase
              tracking-[0.2em]
              text-[#6F8F72]
            "
          >
            {platform.available.title}
          </p>

          <h2
            className="
              mt-4
              font-serif
              text-[42px]
              font-normal
              leading-tight
              tracking-[-0.025em]

              sm:text-[50px]

              lg:text-[56px]
            "
          >
            {platform.available.subtitle}
          </h2>

          <p
            className="
              mt-5
              max-w-[680px]
              font-serif
              text-[19px]
              leading-8
              text-[#4A4A4A]

              sm:text-[21px]
              sm:leading-9
            "
          >
            {platform.available.description}
          </p>
        </div>

        {/* =================================================
            PLATFORM CARDS
            ================================================= */}

        <div
          className="
            grid
            gap-5

            sm:grid-cols-2

            lg:grid-cols-3
          "
        >
          {platforms.map((item) => (
            <div
              key={item.name}
              className="
                group
                flex
                min-h-[250px]
                flex-col
                items-center
                justify-center
                rounded-[24px]
                border
                border-[#E7DDD1]
                bg-white/40
                px-7
                py-10
                text-center
                transition-all
                duration-300

                hover:-translate-y-1
                hover:border-[#D8CCBE]
                hover:shadow-lg
              "
            >
              {/* =================================================
                  LARGE OFFICIAL LOGO
                  ================================================= */}

              <div
                className="
                  flex
                  h-[120px]
                  w-[120px]
                  items-center
                  justify-center
                  transition-transform
                  duration-300
                  group-hover:scale-105
                "
              >
                <Image
                  src={item.logo}
                  alt={`${item.name} logo`}
                  width={110}
                  height={110}
                  className="
                    h-[110px]
                    w-[110px]
                    object-contain
                  "
                />
              </div>

              {/* NAME */}

              <h3
                className="
                  mt-7
                  font-serif
                  text-[27px]
                  font-normal
                  leading-tight
                  tracking-[-0.02em]
                  text-[#292929]
                "
              >
                {item.name}
              </h3>
            </div>
          ))}
        </div>

        {/* ===================================================
            NOTE
            =================================================== */}

        <div
          className="
            mt-12
            rounded-[24px]
            border
            border-[#E7DDD1]
            bg-[#F0F4ED]
            px-7
            py-8

            sm:px-9
            sm:py-9
          "
        >
          <p
            className="
              font-serif
              text-[18px]
              leading-8
              text-[#4A4A4A]

              sm:text-[20px]
              sm:leading-9
            "
          >
            {platform.note}
          </p>
        </div>

        {/* ===================================================
            WHAT YOU NEED
            =================================================== */}

        <div
          className="
            mt-20
            border-t
            border-[#E7DDD1]
            pt-16

            sm:mt-24
            sm:pt-20

            lg:mt-28
          "
        >
          <div className="max-w-[720px]">
            <p
              className="
                font-sans
                text-[11px]
                font-medium
                uppercase
                tracking-[0.2em]
                text-[#6F8F72]
              "
            >
              {platform.beforeLesson.title}
            </p>

            <h2
              className="
                mt-4
                font-serif
                text-[42px]
                font-normal
                leading-tight
                tracking-[-0.025em]

                sm:text-[50px]

                lg:text-[56px]
              "
            >
              {platform.beforeLesson.subtitle}
            </h2>

            <p
              className="
                mt-5
                font-serif
                text-[19px]
                leading-8
                text-[#4A4A4A]

                sm:text-[21px]
                sm:leading-9
              "
            >
              {platform.beforeLesson.description}
            </p>
          </div>

          {/* REQUIREMENTS */}

          <div
            className="
              mt-12
              grid
              gap-8

              sm:grid-cols-2

              lg:grid-cols-4
            "
          >
            {platform.beforeLesson.items.map(
              (item: {
                number: string;
                title: string;
                text: string;
              }) => (
                <div key={item.number}>
                  <span
                    className="
                      font-sans
                      text-[13px]
                      font-medium
                      tracking-[0.15em]
                      text-[#6F8F72]
                    "
                  >
                    {item.number}
                  </span>

                  <h3
                    className="
                      mt-3
                      font-serif
                      text-[28px]
                      font-normal
                    "
                  >
                    {item.title}
                  </h3>

                  <p
                    className="
                      mt-3
                      font-sans
                      text-[14px]
                      leading-7
                      text-[#666]
                    "
                  >
                    {item.text}
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        {/* ===================================================
            CLOSING
            =================================================== */}

        <div
          className="
            mt-20
            border-t
            border-[#E7DDD1]
            pt-16
            text-center

            sm:mt-24
            sm:pt-20
          "
        >
          <p
            className="
              font-serif
              text-[22px]
              leading-8
              text-[#4A4A4A]

              sm:text-[25px]
              sm:leading-9
            "
          >
            {platform.closing.text}
          </p>
        </div>
      </section>
    </main>
  );
}