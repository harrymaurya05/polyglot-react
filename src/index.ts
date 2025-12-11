// Core exports
export { createTranslator } from "./core/createTranslator";
export { TranslateProvider } from "./core/TranslateProvider";

// Hooks
export { useTranslate } from "./hooks/useTranslate";
export { useTranslator } from "./hooks/useTranslator";
export { useTranslateDynamic } from "./hooks/useTranslateDynamic";

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
