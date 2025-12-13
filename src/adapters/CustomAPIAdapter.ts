import type { TranslationAdapter, Translation } from "../types";
import { retryWithBackoff } from "../utils/helpers";

export interface CustomAPIAdapterOptions {
  baseUrl: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export class CustomAPIAdapter implements TranslationAdapter {
  private baseUrl: string;
  private headers: Record<string, string>;
  private timeout: number;

  constructor(options: string | CustomAPIAdapterOptions) {
    if (typeof options === "string") {
      this.baseUrl = options;
      this.headers = {};
      this.timeout = 60000;
    } else {
      this.baseUrl = options.baseUrl;
      this.headers = options.headers || {};
      this.timeout = options.timeout || 60000;
    }
  }

  async translateBatch(
    texts: string[],
    sourceLang: string,
    targetLang: string
  ): Promise<Translation[]> {
    return retryWithBackoff(
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
          const requestBody = {
            texts,
            sourceLang,
            targetLang,
          };

          console.log("[CustomAPIAdapter] API Request:", {
            url: `${this.baseUrl}/api/translate`,
            method: "POST",
            body: requestBody,
            timestamp: new Date().toISOString(),
          });

          const startTime = performance.now();

          const response = await fetch(`${this.baseUrl}/api/translate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...this.headers,
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
          });

          const duration = performance.now() - startTime;
          clearTimeout(timeoutId);

          console.log("[CustomAPIAdapter] API Response:", {
            status: response.status,
            statusText: response.statusText,
            duration: `${duration.toFixed(2)}ms`,
            timestamp: new Date().toISOString(),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("[CustomAPIAdapter] API Error:", {
              status: response.status,
              error: errorData,
            });
            throw new Error(
              `Custom API error: ${response.status} - ${
                errorData.error || response.statusText
              }`
            );
          }

          const data = await response.json();
          const translations = data.translations;

          console.log("[CustomAPIAdapter] Translations received:", {
            count: Object.keys(translations).length,
            translations,
          });

          // Convert Record<string, string> to Translation[]
          return texts.map((original) => ({
            original,
            translated: translations[original] || original,
            lang: targetLang,
          }));
        } catch (error: any) {
          clearTimeout(timeoutId);
          console.error("[CustomAPIAdapter] Request failed:", {
            error: error.message,
            name: error.name,
            timestamp: new Date().toISOString(),
          });
          if (error.name === "AbortError") {
            throw new Error(
              `Custom API request timeout after ${this.timeout}ms`
            );
          }
          throw error;
        }
      },
      3,
      1000
    );
  }
}
