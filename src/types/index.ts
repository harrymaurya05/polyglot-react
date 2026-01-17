import type { PolyglotAPIAdapterOptions } from "../adapters/PolyglotAPIAdapter";

/**
 * Translation provider types
 */
export type TranslationProvider = "google" | "deepl" | "aws" | "polyglot";

/**
 * AWS credentials for AWS Translate
 */
export interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

/**
 * Main translator configuration
 */
export interface TranslatorConfig {
  sourceLang: string; // Default: 'en'
  targetLang: string; // e.g., 'hi', 'es', 'fr'
  provider: TranslationProvider;
  apiKey?: string;
  credentials?: AWSCredentials; // For AWS only
  polyglotAPIOptions?: PolyglotAPIAdapterOptions; // For Polyglot API
  textToTranslate: string[]; // From texts.json
  fallbackToOriginal?: boolean;
  batchSize?: number; // Default: 100
  retryAttempts?: number; // Default: 3
}

/**
 * Translation result
 */
export interface Translation {
  original: string;
  translated: string;
  lang: string;
}

/**
 * Translation adapter interface
 */
export interface TranslationAdapter {
  translateBatch(
    texts: string[] | Record<string, string>,
    sourceLang: string,
    targetLang: string
  ): Promise<Translation[]>;
}

/**
 * Translator instance
 */
export interface Translator {
  translate(text: string, params?: TranslationParams): string;
  translateDynamic(text: string): Promise<string>;
  changeLanguage(lang: string): Promise<void>;
  getCurrentLanguage(): string;
  isReady(): boolean;
  getError(): Error | null;
}

/**
 * Translation parameters for variable interpolation and pluralization
 */
export interface TranslationParams {
  [key: string]: string | number | boolean | undefined;
  plural?: boolean;
  count?: number;
}

/**
 * Vite plugin configuration
 */
export interface PluginConfig {
  include: string[]; // File patterns to scan
  exclude?: string[]; // File patterns to ignore
  output: string; // Output JSON file path
  patterns?: {
    jsxText: boolean;
    jsxAttribute: string[];
    stringLiterals: boolean;
  };
  minLength?: number;
  ignore?: RegExp[];
  verbose?: boolean;
  autoTranslate?: {
    enabled: boolean;
    adapter: TranslationAdapter;
    sourceLang: string;
    targetLangs: string[];
    storeFilePath?: string;
  };
}

/**
 * Extracted text metadata
 */
export interface ExtractedText {
  text: string;
  file: string;
  line: number;
  type: "jsxText" | "jsxAttribute" | "stringLiteral" | "functionCall";
}

/**
 * Translation context value
 */
export interface TranslateContextValue {
  translator: Translator | null;
  isLoading: boolean;
  error: Error | null;
  changeLanguage: (lang: string) => Promise<void>;
  currentLang: string;
}

/**
 * Mock translations for testing
 */
export interface MockTranslations {
  [key: string]: string;
}
