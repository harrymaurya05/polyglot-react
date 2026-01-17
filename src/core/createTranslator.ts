import type {
  TranslatorConfig,
  Translator,
  TranslationAdapter,
  TranslationParams,
} from "../types";
import { GoogleTranslateAdapter } from "../adapters/GoogleTranslateAdapter";
import { DeepLAdapter } from "../adapters/DeepLAdapter";
import { AWSTranslateAdapter } from "../adapters/AWSTranslateAdapter";
import { PolyglotAPIAdapter } from "../adapters/PolyglotAPIAdapter";
import { processTranslation } from "../utils";

/**
 * Create a translator instance
 */
export function createTranslator(config: TranslatorConfig): Translator {
  return new TranslatorImpl(config);
}

class TranslatorImpl implements Translator {
  private config: TranslatorConfig;
  private adapter: TranslationAdapter;
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
          throw new Error("API key is required for Google Translate");
        }
        return new GoogleTranslateAdapter(this.config.apiKey);

      case "deepl":
        if (!this.config.apiKey) {
          throw new Error("API key is required for DeepL");
        }
        return new DeepLAdapter(this.config.apiKey);

      case "aws":
        if (!this.config.credentials) {
          throw new Error("AWS credentials are required for AWS Translate");
        }
        return new AWSTranslateAdapter(this.config.credentials);

      case "polyglot":
        if (!this.config.polyglotAPIOptions && !this.config.apiKey) {
          throw new Error(
            "polyglotAPIOptions or apiKey is required for Polyglot API"
          );
        }
        // Use polyglotAPIOptions if provided, otherwise use apiKey
        return new PolyglotAPIAdapter(
          this.config.polyglotAPIOptions || this.config.apiKey!
        );

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

    // Check in-memory map first
    const memCached = this.translations.get(text);
    if (memCached) return memCached;

    try {
      // Translate dynamically via API
      const results = await this.adapter.translateBatch(
        [text],
        this.config.sourceLang,
        this.currentLang
      );

      if (results.length > 0) {
        const translated = results[0].translated;

        // Store in memory map
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
