# Incremental Auto-Translation Feature

## Overview

The incremental auto-translation feature automatically translates your extracted texts while intelligently tracking changes. It only translates new or modified texts, avoiding redundant API calls and reducing translation costs.

## Key Features

✅ **Smart Change Detection**: Tracks which texts are new, changed, or deleted  
✅ **Incremental Translation**: Only translates new/changed texts, not everything  
✅ **Multi-Language Support**: Translate to multiple target languages in one go  
✅ **Persistent Storage**: Maintains translation history in `.translation-store.json`  
✅ **Automatic Cleanup**: Removes translations for deleted texts  
✅ **Zero Configuration**: Works seamlessly with Vite plugin

## How It Works

1. **Text Extraction**: The Vite plugin extracts translatable texts from your code
2. **Change Detection**: Compares current texts with stored metadata using MD5 hashes
3. **Incremental Translation**: Only new/changed texts are sent to the translation API
4. **Store Update**: Translation metadata is saved with timestamps and results
5. **Automatic Trigger**: Runs automatically when texts.json changes (optional)

## Quick Start

### With Vite Plugin (Recommended)

Add auto-translation to your `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { extractTranslatableText } from "i18nsolutions/plugin";
import { PolyglotAPIAdapter } from "i18nsolutions";

export default defineConfig({
  plugins: [
    react(),
    extractTranslatableText({
      include: ["src/**/*.{tsx,jsx}"],
      output: "src/translations/texts.json",
      verbose: true,
      // Enable auto-translation
      autoTranslate: {
        enabled: true,
        adapter: new PolyglotAPIAdapter(import.meta.env.VITE_POLYGLOT_API_KEY),
        sourceLang: "en",
        targetLangs: ["es", "fr", "de", "hi", "ja"],
        // Optional: custom store path
        storeFilePath: "src/translations/.translation-store.json",
      },
    }),
  ],
});
```

### Standalone Usage

You can also use the auto-translation service directly:

```typescript
import { autoTranslate } from "i18nsolutions/plugin";
import { PolyglotAPIAdapter } from "i18nsolutions";

const adapter = new PolyglotAPIAdapter("your-api-key");

await autoTranslate({
  adapter,
  sourceLang: "en",
  targetLangs: ["es", "fr", "de"],
  textsFilePath: "./src/translations/texts.json",
  storeFilePath: "./src/translations/.translation-store.json",
  verbose: true,
  onProgress: (current, total, lang) => {
    console.log(`Translating ${lang}: ${current}/${total}`);
  },
});
```

## Configuration Options

### `autoTranslate` Config

| Option          | Type                 | Required | Description                                                     |
| --------------- | -------------------- | -------- | --------------------------------------------------------------- |
| `enabled`       | `boolean`            | Yes      | Enable/disable auto-translation                                 |
| `adapter`       | `TranslationAdapter` | Yes      | Translation service adapter (Polyglot, Google, DeepL, AWS)      |
| `sourceLang`    | `string`             | Yes      | Source language code (e.g., "en")                               |
| `targetLangs`   | `string[]`           | Yes      | Array of target language codes                                  |
| `storeFilePath` | `string`             | No       | Custom path for translation store (default: next to texts.json) |

### Supported Adapters

All translation adapters are supported:

```typescript
// Polyglot API (Recommended)
new PolyglotAPIAdapter("your-api-key");

// Google Translate
new GoogleTranslateAdapter("your-api-key");

// DeepL
new DeepLAdapter("your-api-key");

// AWS Translate
new AWSTranslateAdapter({
  accessKeyId: "...",
  secretAccessKey: "...",
  region: "us-east-1",
});
```

## Translation Store

The translation store (`.translation-store.json`) maintains metadata about all translations:

```json
{
  "version": "1.0.0",
  "metadata": {
    "5d41402abc4b2a76b9719d911017c592": {
      "hash": "5d41402abc4b2a76b9719d911017c592",
      "text": "Hello World",
      "lastTranslated": 1737849600000,
      "translations": {
        "es": "Hola Mundo",
        "fr": "Bonjour le monde",
        "de": "Hallo Welt"
      }
    }
  }
}
```

### Store Location

By default, the store is created at:

```
src/translations/.translation-store.json
```

**Important**: Add this to your `.gitignore` if you don't want to commit translations:

```gitignore
# Translation cache
*/.translation-store.json
```

Or commit it to avoid re-translating on different machines.

## Change Detection Logic

### New Texts

- Text doesn't exist in the store → **Translate**
- Example: Adding a new component with new strings

### Changed Texts

- Text hash exists but content changed → **Translate**
- Example: Fixing a typo in existing text

### Unchanged Texts

- Text exists with same hash → **Skip translation** (reuse cached)
- Example: No changes to the text

### Deleted Texts

- Text in store but not in current texts → **Remove from store**
- Example: Deleted component or removed text

## Workflow Examples

### First Time Setup

1. Extract texts:

   ```bash
   npm run dev  # or build
   ```

2. texts.json is created with all extracted texts:

   ```json
   ["Welcome", "Login", "Sign Up", ...]
   ```

3. Auto-translation runs:

   ```
   🌍 Auto-Translation Service
   📊 Change Detection:
     ✨ New texts: 24
     🔄 Changed texts: 0
     ✅ Unchanged texts: 0
   🔄 Translating 24 texts...
     → Translating to es...
     ✅ Translated 24 texts to es
   ```

4. Translation store is created with all translations

### Subsequent Changes

You add a new button: `<button>Cancel</button>`

1. Texts extraction runs:

   ```
   ✨ Extracted 25 unique texts (was 24)
   ```

2. Auto-translation detects changes:

   ```
   📊 Change Detection:
     ✨ New texts: 1
     ✅ Unchanged texts: 24
   🔄 Translating 1 text...
   ```

3. **Only "Cancel" is translated** - saves 24 API calls! 💰

### Modifying Existing Text

You fix a typo: `"Welcme"` → `"Welcome"`

1. Auto-translation detects change:

   ```
   📊 Change Detection:
     🔄 Changed texts: 1
     ✅ Unchanged texts: 23
   ```

2. Only the changed text is re-translated

## Cost Optimization

### Without Incremental Translation

- 100 texts × 5 languages = 500 API calls on each build
- Adding 1 new text = 505 API calls (translates everything again)

### With Incremental Translation

- 100 texts × 5 languages = 500 API calls (first time)
- Adding 1 new text = **5 API calls** (only the new text)
- **99% reduction in API calls!** 🎉

## Export Translations

Export translations to separate language files:

```typescript
import { exportTranslations } from "i18nsolutions/plugin";

exportTranslations(
  "./src/translations/.translation-store.json",
  "./src/translations/locales",
  ["es", "fr", "de"]
);
```

Creates:

```
src/translations/locales/
  es.json  # Spanish translations
  fr.json  # French translations
  de.json  # German translations
```

## Best Practices

### 1. Commit the Translation Store

✅ **Recommended**: Commit `.translation-store.json` to git

- Team members don't re-translate
- CI/CD builds use cached translations
- Consistent translations across environments

❌ **Not Recommended**: Add to .gitignore

- Every developer re-translates from scratch
- Higher API costs
- Slower builds

### 2. Use Environment Variables

```typescript
// vite.config.ts
autoTranslate: {
  enabled: process.env.NODE_ENV === "development",
  adapter: new PolyglotAPIAdapter(import.meta.env.VITE_POLYGLOT_API_KEY),
  // ...
}
```

### 3. Handle Translation Failures Gracefully

The system automatically:

- Continues translating other languages if one fails
- Preserves existing translations
- Logs errors without breaking your build

### 4. Monitor Translation Changes

Add a script to see what changed:

```json
{
  "scripts": {
    "translate": "node scripts/translate.js",
    "translate:check": "git diff src/translations/.translation-store.json"
  }
}
```

## Troubleshooting

### Store gets out of sync

**Solution**: Delete `.translation-store.json` and rebuild

### Translations not updating

**Solution**: Check that `autoTranslate.enabled` is `true` and adapter is configured

### API rate limits

**Solution**: The system automatically retries with exponential backoff

### Missing translations

**Solution**: Check the console for translation errors. Verify API key is valid.

## Advanced Usage

### Custom Store Management

```typescript
import {
  loadTranslationStore,
  saveTranslationStore,
  detectChanges,
} from "i18nsolutions/plugin";

// Load store
const store = loadTranslationStore("./store.json");

// Detect changes
const changes = detectChanges(currentTexts, store);

console.log(`New: ${changes.newTexts.length}`);
console.log(`Changed: ${changes.changedTexts.length}`);
```

### Selective Translation

```typescript
// Only translate specific languages
await autoTranslate({
  // ... config
  targetLangs: ["es"], // Only Spanish this time
});
```

### Pre-build Translation Script

Create `scripts/translate.js`:

```javascript
import { autoTranslate } from "i18nsolutions/plugin";
import { PolyglotAPIAdapter } from "i18nsolutions";

const adapter = new PolyglotAPIAdapter(process.env.POLYGLOT_API_KEY);

await autoTranslate({
  adapter,
  sourceLang: "en",
  targetLangs: ["es", "fr", "de", "hi", "ja", "zh"],
  textsFilePath: "./src/translations/texts.json",
  verbose: true,
});

console.log("✅ Translation complete!");
```

Run before deployment:

```json
{
  "scripts": {
    "prebuild": "node scripts/translate.js",
    "build": "vite build"
  }
}
```

## FAQ

**Q: How are text changes detected?**  
A: Using MD5 hashes of the text content. If the hash matches, the text hasn't changed.

**Q: What happens if I change a text slightly?**  
A: It's detected as changed and re-translated. Old translation is replaced.

**Q: Can I use this without the Vite plugin?**  
A: Yes! Use the `autoTranslate()` function directly in your build scripts.

**Q: Does this work with all translation providers?**  
A: Yes! Works with Polyglot API, Google Translate, DeepL, and AWS Translate.

**Q: How much does this save?**  
A: Typically 90-99% reduction in API calls after initial setup.

**Q: Can I translate to different languages at different times?**  
A: Yes! The store tracks translations per language independently.

## Support

For issues or questions:

- GitHub Issues: [polyglot/react](https://github.com/polyglot/react/issues)
- Documentation: [usepolyglot.dev](https://usepolyglot.dev)
- Discord: [Join our community](https://discord.gg/polyglot)

---

Built with ❤️ by the Polyglot team
