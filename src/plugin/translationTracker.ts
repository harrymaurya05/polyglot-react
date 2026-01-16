import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

/**
 * Metadata for tracking translations
 */
export interface TranslationMetadata {
  hash: string;
  text: string;
  lastTranslated: number;
  translations: Record<string, string>; // targetLang -> translated text
}

/**
 * Translation tracking store
 */
export interface TranslationStore {
  version: string;
  metadata: Record<string, TranslationMetadata>; // key = text hash
}

/**
 * Generate a hash for a text string
 */
export function generateTextHash(text: string): string {
  return crypto.createHash("md5").update(text).digest("hex");
}

/**
 * Load translation metadata from disk
 */
export function loadTranslationStore(filePath: string): TranslationStore {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn(`⚠️  Failed to load translation store:`, error);
  }

  return {
    version: "1.0.0",
    metadata: {},
  };
}

/**
 * Save translation metadata to disk
 */
export function saveTranslationStore(
  filePath: string,
  store: TranslationStore
): void {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(store, null, 2), "utf-8");
  } catch (error) {
    console.error(`❌ Failed to save translation store:`, error);
  }
}

/**
 * Detect new or changed texts compared to the stored metadata
 */
export function detectChanges(
  currentTexts: string[],
  store: TranslationStore
): {
  newTexts: string[];
  changedTexts: string[];
  unchangedTexts: string[];
  deletedHashes: string[];
} {
  const newTexts: string[] = [];
  const changedTexts: string[] = [];
  const unchangedTexts: string[] = [];
  const currentHashes = new Set<string>();

  for (const text of currentTexts) {
    const hash = generateTextHash(text);
    currentHashes.add(hash);

    const existing = store.metadata[hash];

    if (!existing) {
      // Text is completely new
      newTexts.push(text);
    } else if (existing.text !== text) {
      // Hash collision or text changed (shouldn't happen with MD5 but checking)
      changedTexts.push(text);
    } else {
      // Text exists and hasn't changed
      unchangedTexts.push(text);
    }
  }

  // Find deleted texts (exist in store but not in current texts)
  const deletedHashes = Object.keys(store.metadata).filter(
    (hash) => !currentHashes.has(hash)
  );

  return { newTexts, changedTexts, unchangedTexts, deletedHashes };
}

/**
 * Update the translation store with new translations
 */
export function updateTranslationStore(
  store: TranslationStore,
  texts: string[],
  translations: Record<string, string>,
  targetLang: string
): TranslationStore {
  const updatedStore = { ...store };

  for (const text of texts) {
    const hash = generateTextHash(text);
    const translated = translations[text] || text;

    if (!updatedStore.metadata[hash]) {
      updatedStore.metadata[hash] = {
        hash,
        text,
        lastTranslated: Date.now(),
        translations: {},
      };
    }

    updatedStore.metadata[hash].translations[targetLang] = translated;
    updatedStore.metadata[hash].lastTranslated = Date.now();
  }

  return updatedStore;
}

/**
 * Clean up deleted texts from the store
 */
export function cleanupDeletedTexts(
  store: TranslationStore,
  deletedHashes: string[]
): TranslationStore {
  const updatedStore = { ...store };

  for (const hash of deletedHashes) {
    delete updatedStore.metadata[hash];
  }

  return updatedStore;
}

/**
 * Get existing translations from the store
 */
export function getExistingTranslations(
  texts: string[],
  store: TranslationStore,
  targetLang: string
): Record<string, string> {
  const existing: Record<string, string> = {};

  for (const text of texts) {
    const hash = generateTextHash(text);
    const metadata = store.metadata[hash];

    if (metadata && metadata.translations[targetLang]) {
      existing[text] = metadata.translations[targetLang];
    }
  }

  return existing;
}
