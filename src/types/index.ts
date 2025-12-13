/**
 * Translation provider types
 */
export type TranslationProvider = "google" | "deepl" | "aws" | "custom";

/**
 * AWS credentials for AWS Translate
 */
export interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

/**
 * Cache storage type
 */
export type CacheStorage = "localStorage" | "indexedDB";

/**
 * Cache configuration
 */
export interface CacheConfig {
  enabled: boolean;
  storage: CacheStorage;
  ttl: number; // Time to live in milliseconds
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
  textToTranslate: string[]; // From texts.json
  cache: CacheConfig;
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
    texts: string[],
    sourceLang: string,
    targetLang: string
  ): Promise<Translation[]>;
}

/**
 * Cache interface
 */
export interface CacheInterface {
  set(key: string, value: any, ttl: number): Promise<void> | void;
  get(key: string): Promise<any | null> | any | null;
  has(key: string): Promise<boolean> | boolean;
  clear(): Promise<void> | void;
  isExpired(key: string): Promise<boolean> | boolean;
}

/**
 * Cached data structure
 */
export interface CachedData<T = any> {
  value: T;
  timestamp: number;
  ttl: number;
  version?: string;
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
