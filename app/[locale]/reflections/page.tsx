import { notFound } from "next/navigation";

import Navbar from "@/components/Navbar";
import ReflectionsGallery from "@/components/ReflectionsGallery";
import { getPublicReflections } from "@/lib/getPublicReflections";
import { isValidLocale, type Locale } from "@/lib/i18n";

interface ReflectionsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

interface ReflectionsCopy {
  eyebrow: string;
  title: string;
  description: string;
  storiesShared: string;
  empty: string;
}

const translations: Record<Locale, ReflectionsCopy> = {
  en: {
    eyebrow: "Passed Along",
    title: "Kind words, passed along.",
    description:
      "Experiences, milestones, and thoughts shared by learners and families along the way.",
    storiesShared: "Stories shared",
    empty: "No learner stories have been shared yet.",
  },
  ko: {
    eyebrow: "함께 나누는 이야기",
    title: "마음을 담아 전하는 말들.",
    description:
      "배움의 여정에서 만난 경험과 작은 성장, 그동안 느낀 생각들을 학생과 가족들이 나누어 주셨어요.",
    storiesShared: "함께 나눈 이야기",
    empty: "아직 나누어 주신 이야기가 없어요.",
  },
  zh: {
    eyebrow: "把温暖传递下去",
    title: "温暖的话，真诚的分享。",
    description:
      "学员和家人分享的学习经历、成长点滴，以及一路走来的感受。",
    storiesShared: "已分享的故事",
    empty: "目前还没有学员分享故事。",
  },
  ja: {
    eyebrow: "つながる想い",
    title: "あたたかな言葉を、次の誰かへ。",
    description:
      "学びの中での体験や小さな成長、その時々に感じたこと。受講者やご家族が寄せてくださった声をご紹介します。",
    storiesShared: "寄せられた声",
    empty: "まだ受講者の声は寄せられていません。",
  },
};

export default async function ReflectionsPage({
  params,
}: ReflectionsPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const t = translations[locale];

  const { reflections, total } = await getPublicReflections({
    limit: null,
  });

  return (
    <>
      <Navbar />

      <main lang={locale} className="min-h-screen bg-[#F3EDDD]">
        {/* INTRO */}

        <section
          className="
            mx-auto
            max-w-[1440px]
            px-5
            pb-9
            pt-12
            sm:px-10
            sm:pb-11
            sm:pt-16
            lg:px-16
            lg:pb-12
            lg:pt-20
          "
        >
          <div
            className="
              flex
              flex-col
              gap-7
              border-b
              border-[#718A73]/20
              pb-9
              sm:flex-row
              sm:items-end
              sm:justify-between
              lg:pb-11
            "
          >
            <div className="min-w-0 flex-1">
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
                {t.eyebrow}
              </p>

              <h1
                className={`
                  mt-3
                  font-serif
                  text-[44px]
                  tracking-[-0.035em]
                  text-[#304A39]
                  [text-wrap:balance]
                  sm:text-[58px]
                  lg:text-[64px]
                  xl:text-[68px]
                  ${
                    locale === "en"
                      ? "leading-[0.96]"
                      : "break-keep leading-[1.2]"
                  }
                `}
              >
                {t.title}
              </h1>

              <p
                className="
                  mt-5
                  max-w-[660px]
                  text-[14px]
                  leading-6
                  text-[#758477]
                  sm:text-[15px]
                  sm:leading-7
                "
              >
                {t.description}
              </p>
            </div>

            <div className="shrink-0 sm:text-right">
              <p
                className="
                  font-serif
                  text-[64px]
                  leading-[0.8]
                  tracking-[-0.055em]
                  text-[#304A39]
                  sm:text-[76px]
                "
              >
                {new Intl.NumberFormat(locale).format(total)}
              </p>

              <p
                className="
                  mt-3
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-[#718A73]
                "
              >
                {t.storiesShared}
              </p>
            </div>
          </div>
        </section>

        {/* COLLECTION */}

        <section
          className="
            mx-auto
            max-w-[1440px]
            px-5
            pb-20
            sm:px-10
            sm:pb-24
            lg:px-16
            lg:pb-28
          "
        >
          {reflections.length > 0 ? (
            <ReflectionsGallery
              reflections={reflections}
              locale={locale}
            />
          ) : (
            <div
              className="
                rounded-[24px]
                bg-[#FFFDF8]
                px-6
                py-16
                text-center
              "
            >
              <p className="font-serif text-[24px] text-[#304A39]">
                {t.empty}
              </p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}