import type { TranslationAdapter, Translation } from "../types";
import { chunkArray, retryWithBackoff } from "../utils";

/**
 * DeepL API Adapter
 * Provides higher quality translations than Google Translate
 */
export class DeepLAdapter implements TranslationAdapter {
  private apiKey: string;
  private endpoint: string;

  constructor(apiKey: string, useFreeApi: boolean = true) {
    if (!apiKey) {
      throw new Error("DeepL API key is required");
    }
    this.apiKey = apiKey;
    // DeepL has separate endpoints for free and pro accounts
    this.endpoint = useFreeApi
      ? "https://api-free.deepl.com/v2/translate"
      : "https://api.deepl.com/v2/translate";
  }

  async translateBatch(
    texts: string[],
    sourceLang: string,
    targetLang: string
  ): Promise<Translation[]> {
    if (texts.length === 0) return [];

    // DeepL allows up to 50 texts per request
    const chunks = chunkArray(texts, 50);
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
    // DeepL requires uppercase language codes
    const formattedSource = this.formatLanguageCode(sourceLang);
    const formattedTarget = this.formatLanguageCode(targetLang);

    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: texts,
        source_lang: formattedSource,
        target_lang: formattedTarget,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepL API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return texts.map((original, index) => ({
      original,
      translated: data.translations[index].text,
      lang: targetLang,
    }));
  }

  /**
   * Format language code for DeepL API
   * DeepL uses uppercase codes like 'EN', 'DE', 'FR'
   */
  private formatLanguageCode(code: string): string {
    return code.toUpperCase();
  }
}
