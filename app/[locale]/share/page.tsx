import { notFound } from "next/navigation";

import ReflectionForm from "@/components/ReflectionForm";

import { getMessages } from "../../../lib/getMessages";
import { isValidLocale } from "../../../lib/i18n";

interface SharePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function SharePage({
  params,
}: SharePageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const t = getMessages(locale);

  return (
    <main className="min-h-screen bg-[#FAF8F5]">
      {/* =====================================================
          HAMKKE HEADER
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
            flex
            w-full
            items-start
            justify-between
            gap-8
          "
        >
          {/* =================================================
              BRAND + TAGLINE
              ================================================= */}

          <a
            href={`/${locale}`}
            className="
              shrink-0
              text-left
              transition-opacity
              duration-200
              hover:opacity-75
            "
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
          </a>

          {/* =================================================
              LANGUAGE SELECTOR
              ================================================= */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-3
              font-sans
              text-[12px]
            "
          >
            <a
              href="/en/share"
              className={
                locale === "en"
                  ? "font-semibold text-[#6F8F72]"
                  : "text-[#8A8A84] transition-colors hover:text-[#6F8F72]"
              }
            >
              EN
            </a>

            <span className="text-[#DCD8D2]">│</span>

            <a
              href="/ko/share"
              className={
                locale === "ko"
                  ? "font-semibold text-[#6F8F72]"
                  : "text-[#8A8A84] transition-colors hover:text-[#6F8F72]"
              }
            >
              한국어
            </a>

            <span className="text-[#DCD8D2]">│</span>

            <a
              href="/zh/share"
              className={
                locale === "zh"
                  ? "font-semibold text-[#6F8F72]"
                  : "text-[#8A8A84] transition-colors hover:text-[#6F8F72]"
              }
            >
              中文
            </a>
          </div>
        </div>
      </header>

      {/* =====================================================
          HERO
          ===================================================== */}

      <section
        className="
          mx-auto
          max-w-2xl
          px-6
          pb-16
          pt-8
          text-center
          sm:pt-0
        "
      >
        {/* TITLE */}

        <h1
          className="
            text-5xl
            leading-tight
            text-[#2B2B2B]
            [font-family:var(--font-cormorant)]
            md:text-6xl
          "
        >
          {t.reflections.galleryTitleLineOne}
          <br />
          {t.reflections.galleryTitleLineTwo}
        </h1>

        {/* INTRODUCTION */}

        <p
          className="
            mx-auto
            mt-6
            max-w-xl
            text-center
            text-lg
            leading-8
            text-[#5B5B5B]
          "
        >
          {t.reflections.galleryDescription}
        </p>
      </section>

      {/* =====================================================
          REFLECTION FORM
          ===================================================== */}

      <section
        className="
          mx-auto
          max-w-4xl
          px-6
          pb-24
        "
      >
        <ReflectionForm locale={locale} />
      </section>
    </main>
  );
}