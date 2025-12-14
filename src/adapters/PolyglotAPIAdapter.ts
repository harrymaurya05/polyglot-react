import type { TranslationAdapter, Translation } from "../types";
import { retryWithBackoff } from "../utils/helpers";

export interface PolyglotAPIAdapterOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

/**
 * Polyglot API Adapter
 * Official adapter for usepolyglot.dev API
 */
export class PolyglotAPIAdapter implements TranslationAdapter {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(options: string | PolyglotAPIAdapterOptions) {
    if (typeof options === "string") {
      // Simple API key provided
      this.apiKey = options;
      this.baseUrl = "https://api.usepolyglot.dev"; // Official production URL
      this.timeout = 60000;
    } else {
      // Full options provided
      this.apiKey = options.apiKey;
      this.baseUrl = options.baseUrl || "https://api.usepolyglot.dev";
      this.timeout = options.timeout || 60000;
    }

    if (!this.apiKey) {
      throw new Error("Polyglot API key is required");
    }
  }

  async translateBatch(
    texts: string[] | Record<string, string>,
    sourceLang: string,
    targetLang: string
  ): Promise<Translation[]> {
    return retryWithBackoff(
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
          // Convert array to object format (key = value for static texts)
          const textsObj = Array.isArray(texts)
            ? Object.fromEntries(texts.map((t) => [t, t]))
            : texts;

          const requestBody = {
            texts: textsObj,
            sourceLang,
            targetLang,
          };

          console.log("[PolyglotAPI] API Request:", {
            url: `${this.baseUrl}/api/translate`,
            method: "POST",
            textCount: Object.keys(textsObj).length,
            sourceLang,
            targetLang,
            timestamp: new Date().toISOString(),
          });

          const startTime = performance.now();

          const response = await fetch(`${this.baseUrl}/api/translate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": this.apiKey,
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
          });

          const duration = performance.now() - startTime;
          clearTimeout(timeoutId);

          console.log("[PolyglotAPI] API Response:", {
            status: response.status,
            statusText: response.statusText,
            duration: `${duration.toFixed(2)}ms`,
            timestamp: new Date().toISOString(),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("[PolyglotAPI] API Error:", {
              status: response.status,
              error: errorData,
            });

            // Handle specific error cases
            if (response.status === 401) {
              throw new Error(
                "Invalid API key. Get your key at https://usepolyglot.dev"
              );
            } else if (response.status === 429) {
              throw new Error("Rate limit exceeded. Please upgrade your plan.");
            } else if (response.status === 402) {
              throw new Error(
                "Payment required. Please check your billing at https://usepolyglot.dev"
              );
            }

            throw new Error(
              `Polyglot API error: ${response.status} - ${
                errorData.error || response.statusText
              }`
            );
          }

          const data = await response.json();
          const translations = data.translations;

          console.log("[PolyglotAPI] Translations received:", {
            count: Object.keys(translations).length,
            cached: data.cached,
            charCount: data.charCount,
          });

          // Convert Record<string, string> to Translation[]
          // Handle both array and object inputs
          if (Array.isArray(texts)) {
            return texts.map((original) => ({
              original,
              translated: translations[original] || original,
              lang: targetLang,
            }));
          } else {
            // For object format (hash: text), map back using the hash keys
            return Object.entries(texts).map(([hash, original]) => ({
              original,
              translated: translations[hash] || original,
              lang: targetLang,
            }));
          }
        } catch (error: any) {
          clearTimeout(timeoutId);
          console.error("[PolyglotAPI] Request failed:", {
            error: error.message,
            name: error.name,
            timestamp: new Date().toISOString(),
          });

          if (error.name === "AbortError") {
            throw new Error(
              `Polyglot API request timeout after ${this.timeout}ms`
            );
          }
          throw error;
        }
      },
      3, // 3 retry attempts
      1000 // 1 second base delay
    );
  }
}
