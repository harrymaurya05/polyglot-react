#!/usr/bin/env node

/**
 * Standalone translation script
 *
 * This script can be used to translate texts independently of the Vite build process.
 * Useful for:
 * - CI/CD pipelines
 * - Pre-deployment translation
 * - Batch translation jobs
 *
 * Usage:
 *   node scripts/translate.js
 *
 * Or add to package.json:
 *   "scripts": {
 *     "translate": "node scripts/translate.js"
 *   }
 */

import { autoTranslate } from "../src/plugin/autoTranslate.js";
import { PolyglotAPIAdapter } from "../src/adapters/PolyglotAPIAdapter.js";

// Configuration
const config = {
  // Translation API adapter
  adapter: new PolyglotAPIAdapter(
    process.env.VITE_POLYGLOT_API_KEY || process.env.POLYGLOT_API_KEY
  ),

  // Source language
  sourceLang: "en",

  // Target languages to translate to
  targetLangs: ["es", "fr", "de", "hi", "ja", "zh", "ar", "pt"],

  // Path to texts.json file
  textsFilePath: "./examples/basic-example/src/translations/texts.json",

  // Optional: custom store path
  storeFilePath:
    "./examples/basic-example/src/translations/.translation-store.json",

  // Verbose logging
  verbose: true,

  // Progress callback
  onProgress: (current, total, lang) => {
    const percentage = ((current / total) * 100).toFixed(0);
    console.log(
      `  📊 Progress: ${current}/${total} languages (${percentage}%) - Current: ${lang}`
    );
  },
};

// Run translation
async function main() {
  console.log("🚀 Starting translation process...\n");

  const startTime = Date.now();

  try {
    await autoTranslate(config);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Translation completed successfully in ${duration}s`);
  } catch (error) {
    console.error("\n❌ Translation failed:", error);
    process.exit(1);
  }
}

// Check for API key
if (!config.adapter) {
  console.error(
    "❌ Error: POLYGLOT_API_KEY or VITE_POLYGLOT_API_KEY environment variable is required"
  );
  console.error("\nSet it in your environment:");
  console.error("  export POLYGLOT_API_KEY=your-api-key");
  console.error("\nOr create a .env file:");
  console.error("  VITE_POLYGLOT_API_KEY=your-api-key");
  process.exit(1);
}

main();
