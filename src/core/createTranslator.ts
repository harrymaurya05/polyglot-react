import type {
  TranslatorConfig,
  Translator,
  TranslationAdapter,
  TranslationParams,
} from "../types";
import { GoogleTranslateAdapter } from "../adapters/GoogleTranslateAdapter";
import { DeepLAdapter } from "../adapters/DeepLAdapter";
import { AWSTranslateAdapter } from "../adapters/AWSTranslateAdapter";
import { NoopAdapter } from "../adapters/NoopAdapter";
import { CacheManager } from "../cache/CacheManager";
import {
  processTranslation,
  hashString,
  getCacheKey,
  getAppVersion,
} from "../utils";

/**
 * Create a translator instance
 */
export function createTranslator(config: TranslatorConfig): Translator {
  return new TranslatorImpl(config);
}

class TranslatorImpl implements Translator {
  private config: TranslatorConfig;
  private adapter: TranslationAdapter;
  private cacheManager: CacheManager;
  private translations: Map<string, string>;
  private currentLang: string;
  private ready: boolean;
  private error: Error | null;
  private initPromise: Promise<void> | null;

  constructor(config: TranslatorConfig) {
    this.config = {
      fallbackToOriginal: true,
      batchSize: 100,
      retryAttempts: 3,
      ...config,
    };

    this.adapter = this.createAdapter();
    this.cacheManager = new CacheManager(config.cache);
    this.translations = new Map();
    this.currentLang = config.targetLang;
    this.ready = false;
    this.error = null;
    this.initPromise = null;

    // Start initialization
    this.initialize();
  }

  private createAdapter(): TranslationAdapter {
    switch (this.config.provider) {
      case "google":
        if (!this.config.apiKey) {
          if (this.config.fallbackToOriginal) {
            console.warn(
              "Google API key missing — falling back to NoopAdapter"
            );
            return new NoopAdapter();
          }
          throw new Error("API key is required for Google Translate");
        }
        return new GoogleTranslateAdapter(this.config.apiKey);

      case "deepl":
        if (!this.config.apiKey) {
          if (this.config.fallbackToOriginal) {
            console.warn("DeepL API key missing — falling back to NoopAdapter");
            return new NoopAdapter();
          }
          throw new Error("API key is required for DeepL");
        }
        return new DeepLAdapter(this.config.apiKey);

      case "aws":
        if (!this.config.credentials) {
          if (this.config.fallbackToOriginal) {
            console.warn(
              "AWS credentials missing — falling back to NoopAdapter"
            );
            return new NoopAdapter();
          }
          throw new Error("AWS credentials are required for AWS Translate");
        }
        return new AWSTranslateAdapter(this.config.credentials);

      default:
        throw new Error(
          `Unknown translation provider: ${this.config.provider}`
        );
    }
  }

  private async initialize(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.doInitialize();
    return this.initPromise;
  }

  private async doInitialize(): Promise<void> {
    try {
      // Generate cache key
      const textsHash = hashString(JSON.stringify(this.config.textToTranslate));
      const cacheKey = getCacheKey(
        this.currentLang,
        textsHash,
        getAppVersion()
      );

      // Try to load from cache
      const cached = await this.cacheManager.get(cacheKey);

      if (cached) {
        this.translations = new Map(Object.entries(cached));
        this.ready = true;
        return;
      }

      // Fetch translations from API
      const results = await this.adapter.translateBatch(
        this.config.textToTranslate,
        this.config.sourceLang,
        this.currentLang
      );

      // Store in memory
      for (const result of results) {
        this.translations.set(result.original, result.translated);
      }

      // Cache the translations
      const translationsObj = Object.fromEntries(this.translations);
      await this.cacheManager.set(cacheKey, translationsObj);

      this.ready = true;
    } catch (error) {
      this.error = error as Error;
      console.error("Translation initialization error:", error);

      if (!this.config.fallbackToOriginal) {
        throw error;
      }
    }
  }

  translate(text: string, params?: TranslationParams): string {
    if (!text) return "";

    // Get translated text from cache
    let translated = this.translations.get(text);

    // Fallback to original if not found
    if (!translated) {
      if (this.config.fallbackToOriginal) {
        translated = text;
      } else {
        console.warn(`Translation not found for: "${text}"`);
        return text;
      }
    }

    // Apply interpolation and pluralization
    return processTranslation(translated, params);
  }

  async translateDynamic(text: string): Promise<string> {
    if (!text) return "";

    // Check if already in cache
    const cached = this.translations.get(text);
    if (cached) return cached;

    try {
      // Translate single text
      const results = await this.adapter.translateBatch(
        [text],
        this.config.sourceLang,
        this.currentLang
      );

      if (results.length > 0) {
        const translated = results[0].translated;
        this.translations.set(text, translated);
        return translated;
      }

      return text;
    } catch (error) {
      console.error("Dynamic translation error:", error);
      return this.config.fallbackToOriginal ? text : "";
    }
  }

  async changeLanguage(lang: string): Promise<void> {
    if (lang === this.currentLang) return;

    this.currentLang = lang;
    this.ready = false;
    this.error = null;
    this.translations.clear();
    this.initPromise = null;

    // Re-initialize with new language
    await this.initialize();
  }

  getCurrentLanguage(): string {
    return this.currentLang;
  }

  isReady(): boolean {
    return this.ready;
  }

  getError(): Error | null {
    return this.error;
  }
}
