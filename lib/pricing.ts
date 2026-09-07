export const HAMKKE_PRICING = {
  private25: {
    basePrice: 7000,
    currency: "PHP",
    lessons: 20,
    minutesPerLesson: 25,
    baseYear: 2026,
  },
} as const;

/* -------------------------------------------------------------------------- */
/* OFFICIAL TUITION                                                           */
/* -------------------------------------------------------------------------- */

export function getCurrentTuition() {
  return HAMKKE_PRICING.private25.basePrice;
}

/* -------------------------------------------------------------------------- */
/* CURRENCY FORMATTERS                                                        */
/* -------------------------------------------------------------------------- */

export function formatPHP(amount: number) {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function formatUSD(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatKRW(amount: number) {
  return `₩${Math.round(amount).toLocaleString(
    "ko-KR"
  )}`;
}

export function formatCNY(amount: number) {
  return `¥${amount.toLocaleString("zh-CN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/* -------------------------------------------------------------------------- */
/* EXCHANGE RATES                                                             */
/* -------------------------------------------------------------------------- */

export type SupportedDisplayCurrency =
  | "USD"
  | "KRW"
  | "CNY";

interface FrankfurterRateResponse {
  date: string;
  base: string;
  quote: string;
  rate: number;
}

/**
 * Returns the exchange rate from PHP to the requested
 * display currency.
 *
 * Exchange rates are used for reference only.
 * Hamkke's official tuition remains PHP.
 *
 * Next.js caches the exchange-rate response for 24 hours.
 */
export async function getExchangeRate(
  currency: SupportedDisplayCurrency
): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.frankfurter.dev/v2/rate/PHP/${currency}`,
      {
        next: {
          revalidate: 86400,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data =
      (await response.json()) as FrankfurterRateResponse;

    if (
      typeof data.rate !== "number" ||
      !Number.isFinite(data.rate) ||
      data.rate <= 0
    ) {
      return null;
    }

    return data.rate;
  } catch {
    return null;
  }
}