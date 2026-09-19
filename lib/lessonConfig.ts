import type { Locale } from "./i18n";

/* =====================================================
   LESSON TYPES
   ===================================================== */

export type LessonDuration =
  | 25
  | 30
  | 35
  | 40
  | 45
  | 50;

export type LessonCount = 10 | 20;

/* =====================================================
   LESSON DURATIONS
   ===================================================== */

export const lessonDurationOptions: {
  minutes: LessonDuration;
}[] = [
  { minutes: 25 },
  { minutes: 30 },
  { minutes: 35 },
  { minutes: 40 },
  { minutes: 45 },
  { minutes: 50 },
];

/* =====================================================
   TERM RULES
   ===================================================== */

export const TEN_LESSON_MINIMUM_DURATION: LessonDuration =
  40;

export function allowsTenLessonTerm(
  duration: LessonDuration
) {
  return duration >= TEN_LESSON_MINIMUM_DURATION;
}

/* =====================================================
   PRICING

   This is business configuration, not translated copy.

   All public lesson-pricing interfaces should use this
   configuration so tuition remains consistent across
   the website.
   ===================================================== */

export const lessonPricing = {
  en: {
    currency: "USD",
    symbol: "$",
    locale: "en-US",

    tuitionPer20: {
      25: 88,
      30: 105,
      35: 123,
      40: 140,
      45: 158,
      50: 176,
    },
  },

  ko: {
    currency: "KRW",
    symbol: "₩",
    locale: "ko-KR",

    tuitionPer20: {
      25: 120000,
      30: 144000,
      35: 168000,
      40: 192000,
      45: 216000,
      50: 240000,
    },
  },

  zh: {
    currency: "CNY",
    symbol: "¥",
    locale: "zh-CN",

    tuitionPer20: {
      25: 580,
      30: 696,
      35: 812,
      40: 928,
      45: 1044,
      50: 1160,
    },
  },

  ja: {
    currency: "JPY",
    symbol: "¥",
    locale: "ja-JP",

    tuitionPer20: {
      25: 13500,
      30: 16200,
      35: 18900,
      40: 21600,
      45: 24300,
      50: 27000,
    },
  },
} satisfies Record<
  Locale,
  {
    currency: string;
    symbol: string;
    locale: string;
    tuitionPer20: Record<
      LessonDuration,
      number
    >;
  }
>;

/* =====================================================
   TUITION HELPERS
   ===================================================== */

export function getLessonTuition(
  locale: Locale,
  duration: LessonDuration,
  lessonCount: LessonCount
) {
  const tuitionPer20 =
    lessonPricing[locale].tuitionPer20[duration];

  return lessonCount === 10
    ? tuitionPer20 / 2
    : tuitionPer20;
}

export function formatLessonTuition(
  locale: Locale,
  tuition: number
) {
  const pricing = lessonPricing[locale];

  const formattedAmount = tuition.toLocaleString(
    pricing.locale,
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  );

  return `${pricing.symbol}${formattedAmount}`;
}