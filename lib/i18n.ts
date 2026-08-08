export const locales = ["en", "ko", "zh"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  ko: "한국어",
  zh: "中文",
};

export function isValidLocale(
  locale: string
): locale is Locale {
  return locales.includes(locale as Locale);
}