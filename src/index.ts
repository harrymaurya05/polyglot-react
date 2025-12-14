// Core exports
export { createTranslator } from "./core/createTranslator";
export { TranslateProvider } from "./core/TranslateProvider";

// Adapters
export { PolyglotAPIAdapter } from "./adapters/PolyglotAPIAdapter";

// Hooks
export { useTranslate } from "./hooks/useTranslate";
export { useTranslator } from "./hooks/useTranslator";
export { useTranslateDynamic } from "./hooks/useTranslateDynamic";
export { useFormat } from "./hooks/useFormat";

// Formatters (can be used standalone)
export {
  formatCurrency,
  formatNumber,
  formatDate,
  formatPercent,
} from "./utils/formatters";

// Types
export type {
  TranslatorConfig,
  TranslationProvider,
  AWSCredentials,
  CacheStorage,
  CacheConfig,
  Translation,
  TranslationAdapter,
  Translator,
  TranslationParams,
  TranslateContextValue,
} from "./types";

export type { TranslateProviderProps } from "./core";
export type { PolyglotAPIAdapterOptions } from "./adapters/PolyglotAPIAdapter";
