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
          HERO
          ===================================================== */}

      <section
        className="
          mx-auto
          max-w-2xl
          px-6
          pb-16
          pt-28
          text-center
        "
      >
        {/* Brand */}

        <p
          className="
            text-sm
            font-medium
            uppercase
            tracking-[0.3em]
            text-[#6F8F72]
          "
        >
          {t.reflections.brand}
        </p>

        {/* Title */}

        <h1
          className="
            mt-6
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