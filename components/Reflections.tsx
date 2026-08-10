import { supabase } from "@/lib/supabase";
import FadeUp from "./animations/FadeUp";
import ReflectionCarousel from "./ReflectionCarousel";

import { getMessages } from "../lib/getMessages";
import type { Locale } from "../lib/i18n";

interface ReflectionsProps {
  locale: Locale;
}

export default async function Reflections({
  locale,
}: ReflectionsProps) {
  const t = getMessages(locale);

  const { data } = await supabase
    .from("reflections")
    .select("*")
    .eq("approved", true);

  const reflections =
    data
      ?.sort(() => Math.random() - 0.5)
      .slice(0, 10) ?? [];

  if (!reflections.length) return null;

  return (
    <section
      id="student-stories"
      className="
        bg-white
        py-24
        lg:py-32
      "
    >
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            INTRODUCTION
            ===================================================== */}

        <FadeUp>
  <div className="mb-16 px-6 lg:px-10">

    {/* Brand */}

    <p
      className="
        text-xs
        uppercase
        tracking-[0.35em]
        text-[#6F8F72]
      "
    >
      {t.reflections.brand}
    </p>

    {/* Title */}

    <h2
      className="
        mt-5
        max-w-[760px]
        text-[42px]
        leading-[1.05]
        text-[#2B2B2B]
        [font-family:var(--font-cormorant)]

        sm:text-[54px]
        lg:text-[62px]
      "
    >
      {t.reflections.title}
    </h2>

    {/* Introduction */}

    <div
      className="
        mt-8
        max-w-2xl
        text-lg
        leading-8
        text-[#5B5B5B]
      "
    >
      <p>
        {t.reflections.description.lineOne}
      </p>

      <p className="mt-2">
        {t.reflections.description.lineTwo}
      </p>
    </div>

  </div>
</FadeUp>

        {/* =====================================================
            REFLECTION CARDS
            ===================================================== */}

        <ReflectionCarousel
  reflections={reflections}
  locale={locale}
/>

        {/* =====================================================
            READ MORE
            ===================================================== */}

        <div className="mt-20 text-center">

          <a
            href={`/${locale}/reflections`}
            className="
              inline-flex
              items-center
              justify-center
              rounded-full
              bg-[#6F8F72]
              px-10
              py-4
              text-sm
              font-medium
              text-white
              shadow-md
              transition-all
              duration-300
              hover:bg-[#5F7F62]
              hover:shadow-lg
              active:scale-95
            "
          >
            {t.reflections.readMore}
          </a>

        </div>

      </div>
    </section>
  );
}