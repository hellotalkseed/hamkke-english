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
          TOP NAVIGATION
          ===================================================== */}

      <div
        className="
          mx-auto
          max-w-7xl
          px-6
          pt-8
          lg:px-10
        "
      >
        <div
          className="
            relative
            flex
            flex-col
            sm:grid
            sm:grid-cols-[1fr_auto_1fr]
            sm:items-center
          "
        >
          {/* =================================================
              TOP ROW
              ================================================= */}

          <div
            className="
              flex
              items-center
              justify-between
              sm:contents
            "
          >
            {/* BACK */}

            <div className="sm:justify-self-start">
              <a
                href={`/${locale}`}
                className="
                  text-sm
                  text-[#6B6B6B]
                  transition-colors
                  duration-200
                  hover:text-[#6F8F72]
                  sm:text-base
                "
              >
                ← Go to Hamkke
              </a>
            </div>

            {/* LANGUAGE SELECTOR */}

            <div
              className="
                flex
                items-center
                gap-3
                text-sm
                sm:col-start-3
                sm:row-start-1
                sm:justify-self-end
              "
            >
              <a
                href="/en/share"
                className={
                  locale === "en"
                    ? "font-medium text-[#6F8F72]"
                    : "text-[#6B6B6B] transition-colors hover:text-[#6F8F72]"
                }
              >
                EN
              </a>

              <a
                href="/ko/share"
                className={
                  locale === "ko"
                    ? "font-medium text-[#6F8F72]"
                    : "text-[#6B6B6B] transition-colors hover:text-[#6F8F72]"
                }
              >
                한국어
              </a>

              <a
                href="/zh/share"
                className={
                  locale === "zh"
                    ? "font-medium text-[#6F8F72]"
                    : "text-[#6B6B6B] transition-colors hover:text-[#6F8F72]"
                }
              >
                中文
              </a>
            </div>
          </div>

          {/* =================================================
              BRAND
              ================================================= */}

          <div
            className="
              mt-5
              text-center
              text-sm
              font-medium
              text-[#6F8F72]
              sm:col-start-2
              sm:row-start-1
              sm:mt-0
              sm:text-left
              sm:text-base
            "
          >
            Hamkke │ 함께
          </div>
        </div>
      </div>

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