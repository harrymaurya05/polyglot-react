import type { TranslationAdapter, Translation } from "../types";
import { chunkArray, retryWithBackoff } from "../utils";

/**
 * Google Cloud Translation API v2 Adapter
 */
export class GoogleTranslateAdapter implements TranslationAdapter {
  private apiKey: string;
  private endpoint = "https://translation.googleapis.com/language/translate/v2";

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("Google Translate API key is required");
    }
    this.apiKey = apiKey;
  }

  async translateBatch(
    texts: string[],
    sourceLang: string,
    targetLang: string
  ): Promise<Translation[]> {
    if (texts.length === 0) return [];

    // Google API can handle up to 128 texts per request
    const chunks = chunkArray(texts, 100);
    const results: Translation[] = [];

    for (const chunk of chunks) {
      const chunkResults = await retryWithBackoff(() =>
        this.translateChunk(chunk, sourceLang, targetLang)
      );
      results.push(...chunkResults);
    }

    return results;
  }

  private async translateChunk(
    texts: string[],
    sourceLang: string,
    targetLang: string
  ): Promise<Translation[]> {
    const url = `${this.endpoint}?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: texts,
        source: sourceLang,
        target: targetLang,
        format: "text",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        `Google Translate API error: ${response.status} - ${error}`
      );
    }

    const data = await response.json();

    return texts.map((original, index) => ({
      original,
      translated: data.data.translations[index].translatedText,
      lang: targetLang,
    }));
  }
}
