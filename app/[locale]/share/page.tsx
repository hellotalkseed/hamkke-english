import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReflectionForm from "@/components/ReflectionForm";
import { isValidLocale, type Locale } from "@/lib/i18n";

interface SharePageProps {
  params: Promise<{ locale: string }>;
}

const languages: { locale: Locale; label: string; name: string }[] = [
  { locale: "en", label: "EN", name: "English" },
  { locale: "ko", label: "한국어", name: "한국어" },
  { locale: "zh", label: "中文", name: "中文" },
  { locale: "ja", label: "日本語", name: "日本語" },
];

const copy: Record<Locale, {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  closing: string;
  language: string;
  home: string;
}> = {
  en: {
    eyebrow: "A moment to reflect",
    title: "Your story,",
    accent: "in your own words.",
    description: "A small moment of confidence. A conversation that felt easier. Something you noticed along the way. We'd love to hear what learning with Hamkke has been like for you.",
    closing: "Thank you for being part of our story.",
    language: "Choose your language",
    home: "Hamkke home",
  },
  ko: {
    eyebrow: "잠시 돌아보는 시간",
    title: "함께한 시간,",
    accent: "여러분의 말로 들려주세요.",
    description: "조금 더 자신 있게 말했던 순간, 전보다 편안해진 대화, 배우면서 느낀 작은 변화까지. Hamkke와 함께한 시간이 여러분에게 어땠는지 편하게 들려주세요.",
    closing: "Hamkke의 이야기를 함께 만들어 주셔서 감사합니다.",
    language: "언어 선택",
    home: "Hamkke 홈",
  },
  zh: {
    eyebrow: "留一点时间，回想一下",
    title: "你的故事，",
    accent: "用自己的话来说。",
    description: "一次更自信的表达，一段更轻松的对话，或是学习路上的一点小变化。我们很想听听，和 Hamkke 一起学习对你来说是什么样的体验。",
    closing: "谢谢你成为 Hamkke 故事的一部分。",
    language: "选择语言",
    home: "Hamkke 首页",
  },
  ja: {
    eyebrow: "少し立ち止まって、振り返る時間",
    title: "あなたの体験を、",
    accent: "あなたの言葉で。",
    description: "少し自信を持って話せた瞬間。前よりも自然に続いた会話。学ぶ中で気づいた小さな変化。Hamkkeで過ごした時間がどのようなものだったか、気軽に聞かせてください。",
    closing: "Hamkkeの物語を一緒につくってくださり、ありがとうございます。",
    language: "言語を選択",
    home: "Hamkke ホーム",
  },
};

export default async function SharePage({ params }: SharePageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const t = copy[locale];

  return (
    <main lang={locale} className="min-h-screen bg-[#FFFDF8] text-[#304A39]">
      <header className="w-full px-4 sm:px-8 lg:px-10 xl:px-12">
        <div className="flex items-center justify-between gap-3 border-b border-[#DCE4D7] py-4 sm:items-center sm:gap-8 sm:py-5">
          <Link href={`/${locale}`} aria-label={t.home} className="block min-w-0 text-left transition-opacity hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#718A73]">
            <span className="flex items-center gap-0 text-[#293A30]">
              <Image src="/logo/hamkke-icon.svg" alt="" width={72} height={72} priority className="h-[30px] w-[30px] shrink-0 object-contain md:h-[36px] md:w-[36px]" />
              <span className="ml-1 text-[21px] font-semibold leading-none [font-family:var(--font-cormorant)] md:ml-0 md:text-[25px]">Hamkke</span>
              <span aria-hidden="true" className="mx-2 h-[15px] w-px shrink-0 bg-[#A8BCA5] opacity-60 md:mx-2.5 md:h-[18px]" />
              <span className="whitespace-nowrap text-[13px] font-medium leading-none text-[#718A73] md:text-[16px]">함께</span>
            </span>
          </Link>
          <details className="group relative ml-auto shrink-0 md:hidden">
            <summary aria-label={t.language} className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full bg-[#E5EBDD] px-3 text-[12px] font-medium text-[#304A39] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#718A73] [&::-webkit-details-marker]:hidden">
              {languages.find((language) => language.locale === locale)?.label}
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="transition-transform group-open:rotate-180">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <nav aria-label={t.language} className="absolute right-0 top-full z-50 mt-2 min-w-[140px] overflow-hidden rounded-xl border border-[#DCE4D7] bg-[#FFFDF8] py-1 shadow-[0_12px_30px_rgba(41,58,48,0.10)]">
              {languages.map((language) => (
                <Link key={language.locale} href={`/${language.locale}/share`} hrefLang={language.locale} lang={language.locale} aria-label={language.name} aria-current={locale === language.locale ? "page" : undefined} className={`flex min-h-11 items-center px-4 text-[13px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#718A73] ${locale === language.locale ? "bg-[#E5EBDD] font-medium text-[#304A39]" : "text-[#758477] hover:bg-[#F3F4EB] hover:text-[#304A39]"}`}>
                  {language.label}
                </Link>
              ))}
            </nav>
          </details>
          <nav aria-label={t.language} className="ml-auto hidden shrink-0 items-center gap-1 text-center md:flex">
            {languages.map((language) => (
              <Link key={language.locale} href={`/${language.locale}/share`} hrefLang={language.locale} lang={language.locale} aria-label={language.name} aria-current={locale === language.locale ? "page" : undefined} className={`whitespace-nowrap rounded-full px-2 py-1.5 text-[11px] font-medium leading-5 transition-colors sm:px-3 sm:py-2 sm:text-[12px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#718A73] ${locale === language.locale ? "bg-[#E5EBDD] text-[#304A39]" : "text-[#758477] hover:bg-[#F3F4EB] hover:text-[#304A39]"}`}>
                {language.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1440px] gap-9 px-5 pt-8 sm:px-8 sm:pt-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,13fr)] lg:items-start lg:gap-16 lg:px-10 lg:pt-10 xl:gap-24 xl:px-12">
        <section aria-labelledby="share-heading" className="min-w-0">
          <p className="text-xs font-semibold uppercase leading-6 tracking-[0.2em] text-[#718A73]">{t.eyebrow}</p>
          <h1 id="share-heading" className="mt-4 text-[38px] font-medium leading-[1.08] tracking-[-0.035em] [font-family:var(--font-cormorant)] sm:text-[46px] lg:text-[48px] xl:text-[54px]">
            <span className="block">{t.title}</span>
            <span className="mt-2 block italic text-[#718A73]">{t.accent}</span>
          </h1>
          <div aria-hidden="true" className="mt-6 h-px w-14 bg-[#B8C9B5]" />
          <p className="mt-5 max-w-[420px] text-[15px] leading-8 text-[#758477]">{t.description}</p>
        </section>

        <div className="min-w-0">
          <ReflectionForm locale={locale} />
        </div>
      </div>

      <footer className="px-5 pb-6 pt-8 text-center">
        <p className="mt-4 text-[10px] tracking-[0.08em] text-[#758477]">Hamkke │ 함께 · From Small Talk to Big Ideas</p>
      </footer>
    </main>
  );
}
