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
            grid
            grid-cols-[1fr_auto_1fr]
            items-center
          "
        >

          {/* BACK */}

          <div className="justify-self-start">
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

          {/* BRAND */}

          <div
  className="
    text-sm
    font-medium
    text-[#6F8F72]
    sm:text-base
  "
>
  Hamkke │ 함께
</div>

          {/* LANGUAGE SELECTOR */}

          <div
            className="
              flex
              items-center
              justify-self-end
              gap-3
              text-sm
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
          pt-0
          text-center

          sm:pt-12

          lg:pt-14
        "
      >

        {/* Title */}

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

        {/* Introduction */}

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

        {/* Personal invitation */}

        <p
          className="
            mt-6
            text-center
            text-2xl
            italic
            text-[#6F8F72]
            [font-family:var(--font-cormorant)]
          "
        >
          {locale === "ko"
            ? "여러분의 이야기도 들려주세요."
            : locale === "zh"
              ? "也很期待听听你的故事。"
              : "We'd love to hear yours."}
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