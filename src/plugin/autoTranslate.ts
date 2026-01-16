import * as path from "path";
import * as crypto from "crypto";
import type { TranslationAdapter, Translation } from "../types";
import {
  loadTranslationStore,
  saveTranslationStore,
  detectChanges,
  updateTranslationStore,
  cleanupDeletedTexts,
  getExistingTranslations,
  type TranslationStore,
} from "./translationTracker";

export interface AutoTranslateConfig {
  adapter: TranslationAdapter;
  sourceLang: string;
  targetLangs: string[];
  textsFilePath: string;
  storeFilePath?: string;
  verbose?: boolean;
  onProgress?: (current: number, total: number, lang: string) => void;
}

/**
 * Automatically translate new or changed texts
 */
export async function autoTranslate(
  config: AutoTranslateConfig
): Promise<void> {
  const {
    adapter,
    sourceLang,
    targetLangs,
    textsFilePath,
    storeFilePath,
    verbose = false,
    onProgress,
  } = config;

  // Default store path is next to texts.json
  const storePath =
    storeFilePath ||
    path.join(path.dirname(textsFilePath), ".translation-store.json");

  if (verbose) {
    console.log("\n🌍 Auto-Translation Service");
    console.log(`📄 Texts file: ${textsFilePath}`);
    console.log(`💾 Store file: ${storePath}`);
  }

  // Load existing translation store
  const store = loadTranslationStore(storePath);

  // Read current texts
  const fs = await import("fs");
  let currentTexts: string[] = [];
  try {
    const content = fs.readFileSync(textsFilePath, "utf-8");
    currentTexts = JSON.parse(content);
  } catch (error) {
    console.error(`❌ Failed to read texts file:`, error);
    return;
  }

  if (currentTexts.length === 0) {
    if (verbose) {
      console.log("ℹ️  No texts to translate");
    }
    return;
  }

  // Detect changes
  const changes = detectChanges(currentTexts, store);

  if (verbose) {
    console.log(`\n📊 Change Detection:`);
    console.log(`  ✨ New texts: ${changes.newTexts.length}`);
    console.log(`  🔄 Changed texts: ${changes.changedTexts.length}`);
    console.log(`  ✅ Unchanged texts: ${changes.unchangedTexts.length}`);
    console.log(`  🗑️  Deleted texts: ${changes.deletedHashes.length}`);
  }

  // Check which languages need translation
  const languagesNeedingTranslation: string[] = [];
  for (const lang of targetLangs) {
    // Check if any text is missing translation for this language
    const hasAllTranslations = currentTexts.every((text) => {
      const hash = crypto.createHash("md5").update(text).digest("hex");
      const metadata = store.metadata[hash];
      return metadata && metadata.translations[lang];
    });

    if (!hasAllTranslations) {
      languagesNeedingTranslation.push(lang);
    }
  }

  if (verbose && languagesNeedingTranslation.length > 0) {
    console.log(
      `  🌍 Languages needing translation: ${languagesNeedingTranslation.join(
        ", "
      )}`
    );
  }

  // Texts that need translation
  const textsToTranslate = [...changes.newTexts, ...changes.changedTexts];

  // If no texts changed but we have new languages, we need to translate all texts for those languages
  const needsTranslation =
    textsToTranslate.length > 0 || languagesNeedingTranslation.length > 0;

  if (!needsTranslation) {
    if (verbose) {
      console.log("\n✅ All texts are up to date. No translation needed.");
    }
    return;
  }

  if (verbose) {
    if (textsToTranslate.length > 0) {
      console.log(
        `\n🔄 Translating ${textsToTranslate.length} new/changed texts...`
      );
    }
  }

  // Translate for each target language
  let updatedStore: TranslationStore = store;

  for (const targetLang of targetLangs) {
    // Skip if this language doesn't need translation
    if (!languagesNeedingTranslation.includes(targetLang)) {
      if (verbose) {
        console.log(`\n  ✓ ${targetLang} - already up to date`);
      }
      continue;
    }

    if (verbose) {
      console.log(`\n  → Translating to ${targetLang}...`);
    }

    try {
      // Find which texts need translation for this language
      const textsNeedingTranslation: string[] = [];
      for (const text of currentTexts) {
        const hash = crypto.createHash("md5").update(text).digest("hex");
        const metadata = store.metadata[hash];
        if (!metadata || !metadata.translations[targetLang]) {
          textsNeedingTranslation.push(text);
        }
      }

      if (textsNeedingTranslation.length === 0) {
        continue;
      }

      // Get existing translations for texts that already have them
      const existingTranslations = getExistingTranslations(
        currentTexts.filter((t) => !textsNeedingTranslation.includes(t)),
        store,
        targetLang
      );

      // Build key-value object for API call (use short hash as key)
      const textsToTranslateObj: Record<string, string> = {};
      for (const text of textsNeedingTranslation) {
        const hash = crypto
          .createHash("md5")
          .update(text)
          .digest("hex")
          .substring(0, 8);
        textsToTranslateObj[hash] = text;
      }

      // Translate only new/changed texts using key-value format
      const translations = await adapter.translateBatch(
        textsToTranslateObj,
        sourceLang,
        targetLang
      );

      // Build translation map
      const translationMap: Record<string, string> = {
        ...existingTranslations,
      };

      for (const translation of translations) {
        translationMap[translation.original] = translation.translated;
      }

      // Update store
      updatedStore = updateTranslationStore(
        updatedStore,
        textsNeedingTranslation,
        translationMap,
        targetLang
      );

      if (verbose) {
        console.log(
          `  ✅ Translated ${textsNeedingTranslation.length} texts to ${targetLang}`
        );
      }

      if (onProgress) {
        onProgress(
          targetLangs.indexOf(targetLang) + 1,
          targetLangs.length,
          targetLang
        );
      }
    } catch (error) {
      console.error(`  ❌ Failed to translate to ${targetLang}:`, error);
    }
  }

  // Clean up deleted texts
  if (changes.deletedHashes.length > 0) {
    updatedStore = cleanupDeletedTexts(updatedStore, changes.deletedHashes);
    if (verbose) {
      console.log(
        `\n🗑️  Cleaned up ${changes.deletedHashes.length} deleted texts`
      );
    }
  }

  // Save updated store
  saveTranslationStore(storePath, updatedStore);

  if (verbose) {
    console.log(`\n💾 Translation store updated: ${storePath}`);
  }

  // Export translations to individual language files
  const translationsDir = path.join(path.dirname(textsFilePath), "locales");
  await exportTranslations(storePath, translationsDir, targetLangs);

  if (verbose) {
    console.log(`✅ Auto-translation completed!\n`);
  }
}

/**
 * Export translations in a format compatible with the library
 */
export async function exportTranslations(
  storePath: string,
  outputDir: string,
  targetLangs: string[]
): Promise<void> {
  const fs = await import("fs");
  const store = loadTranslationStore(storePath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const targetLang of targetLangs) {
    const translations: Record<string, string> = {};

    for (const metadata of Object.values(store.metadata)) {
      if (metadata.translations[targetLang]) {
        translations[metadata.text] = metadata.translations[targetLang];
      }
    }

    const outputPath = path.join(outputDir, `${targetLang}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(translations, null, 2));
    console.log(`✅ Exported ${targetLang} translations to ${outputPath}`);
  }
}
