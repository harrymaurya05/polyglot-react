import { useContext } from "react";
import { TranslateContext } from "../core/TranslateContext";
import {
  formatCurrency,
  formatNumber,
  formatDate,
  formatPercent,
} from "../utils/formatters";

/**
 * Hook for locale-aware formatting (standard Intl API)
 * Automatically uses current language for formatting
 */
export function useFormat() {
  const context = useContext(TranslateContext);

  if (!context) {
    throw new Error("useFormat must be used within a TranslateProvider");
  }

  const currentLang = context.currentLang;

  return {
    formatCurrency: (amount: number, currency?: string) =>
      formatCurrency(amount, currentLang, currency),
    formatNumber: (num: number, options?: Intl.NumberFormatOptions) =>
      formatNumber(num, currentLang, options),
    formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) =>
      formatDate(date, currentLang, options),
    formatPercent: (value: number, options?: Intl.NumberFormatOptions) =>
      formatPercent(value, currentLang, options),
    currentLang,
  };
}
