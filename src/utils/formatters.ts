/**
 * Standard internationalization formatters using Intl API
 * This is the same approach used by React Intl, i18next, and other major i18n libraries
 */

// Language to locale mapping (ISO 639-1 to BCP 47)
export const languageToLocale: Record<string, string> = {
  en: "en-US",
  es: "es-ES",
  hi: "hi-IN",
  fr: "fr-FR",
  de: "de-DE",
  ja: "ja-JP",
  zh: "zh-CN",
  ar: "ar-SA",
  pt: "pt-BR",
  ru: "ru-RU",
  it: "it-IT",
  ko: "ko-KR",
  tr: "tr-TR",
  nl: "nl-NL",
  pl: "pl-PL",
};

// Language to default currency mapping
export const languageToCurrency: Record<string, string> = {
  en: "USD",
  es: "EUR",
  hi: "INR",
  fr: "EUR",
  de: "EUR",
  ja: "JPY",
  zh: "CNY",
  ar: "SAR",
  pt: "BRL",
  ru: "RUB",
  it: "EUR",
  ko: "KRW",
  tr: "TRY",
  nl: "EUR",
  pl: "PLN",
};

/**
 * Format currency using native Intl.NumberFormat
 */
export function formatCurrency(
  amount: number,
  targetLang: string,
  currency?: string
): string {
  const locale = languageToLocale[targetLang] || "en-US";
  const curr = currency || languageToCurrency[targetLang] || "USD";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: curr,
  }).format(amount);
}

/**
 * Format number using native Intl.NumberFormat
 */
export function formatNumber(
  num: number,
  targetLang: string,
  options?: Intl.NumberFormatOptions
): string {
  const locale = languageToLocale[targetLang] || "en-US";
  return new Intl.NumberFormat(locale, options).format(num);
}

/**
 * Format date using native Intl.DateTimeFormat
 */
export function formatDate(
  date: Date | string,
  targetLang: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const locale = languageToLocale[targetLang] || "en-US";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Format percentage using native Intl.NumberFormat
 */
export function formatPercent(
  value: number,
  targetLang: string,
  options?: Intl.NumberFormatOptions
): string {
  const locale = languageToLocale[targetLang] || "en-US";
  return new Intl.NumberFormat(locale, {
    style: "percent",
    ...options,
  }).format(value);
}
