import type { TranslationAdapter, Translation } from "../types";

/**
 * No-op adapter that returns original texts unchanged.
 * Useful for local development when API keys are not available.
 */
export class NoopAdapter implements TranslationAdapter {
  async translateBatch(
    texts: string[],
    _sourceLang: string,
    targetLang: string
  ): Promise<Translation[]> {
    return texts.map((t) => ({ original: t, translated: t, lang: targetLang }));
  }
}
