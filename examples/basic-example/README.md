# Basic Example - React Translate AI Custom

This example demonstrates the basic usage of i18nsolutions library with **incremental auto-translation**.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file with your translation API key:

```
# For auto-translation feature (recommended)
VITE_POLYGLOT_API_KEY=your_polyglot_api_key_here

# Or use other providers
VITE_TRANSLATE_API_KEY=your_google_or_deepl_key
```

Get your API key: [usepolyglot.dev](https://usepolyglot.dev)

3. Run the development server:

```bash
npm run dev
```

## What This Example Shows

- **Automatic Text Extraction**: The Vite plugin scans JSX files and generates `texts.json`
- **⚡ NEW: Auto-Translation**: Automatically translates texts when they're extracted
- **Incremental Updates**: Only translates new or changed texts (90-99% cost savings)
- **Translation Provider Setup**: Configured with Polyglot API (can switch to DeepL, Google, or AWS)
- **Caching**: Translations are cached in localStorage for 30 days
- **Language Switching**: LanguageSwitcher component allows users to change languages
- **React Hooks**: Using `useTranslate()` and `useTranslator()` hooks

## File Structure

- `vite.config.ts` - Vite plugin with auto-translation enabled
- `App.tsx` - Main app with TranslateProvider
- `components/Header.tsx` - Example using useTranslate hook
- `components/LanguageSwitcher.tsx` - Language selector with useTranslator
- `translations/texts.json` - Auto-generated translatable texts
- `translations/.translation-store.json` - Translation cache (auto-created)

## Auto-Translation Feature

The example now includes incremental auto-translation:

```typescript
// vite.config.ts
autoTranslate: {
  enabled: true,
  adapter: new PolyglotAPIAdapter(process.env.VITE_POLYGLOT_API_KEY),
  sourceLang: "en",
  targetLangs: ["es", "fr", "de", "hi", "ja"],
}
```

### How It Works

1. **First Build**: Extracts 24 texts → Translates all to 5 languages (120 API calls)
2. **Add New Text**: Extracts 25 texts → Translates only 1 new text (5 API calls) ✨
3. **Change Text**: Detects change → Re-translates only that text
4. **Result**: 95%+ reduction in API calls!

### Generated Files

- `texts.json` - Source texts extracted from code
- `.translation-store.json` - Translation metadata and cache

**Tip**: Commit `.translation-store.json` to share translations with your team!

## Supported Languages

- English (en)
- Hindi (hi)
- Spanish (es)
- French (fr)
- German (de)

## How It Works

1. **Build Time**:

   - Vite plugin scans all `.tsx` files and extracts text into `texts.json`
   - Auto-translation detects new/changed texts
   - Only new/changed texts are translated via API
   - Translations saved to `.translation-store.json`

2. **App Startup**:

   - TranslateProvider loads from runtime (uses translations from store)
   - All texts available instantly from cache

3. **Runtime**:

   - Components use `useTranslate()` to get translated text
   - Translations served from cache (no API calls)

4. **Language Switch**:
   - User changes language → translations already cached
   - No additional API calls needed!

## Try It Out

1. Open the app in your browser
2. Notice all text is in the default language (Hindi)
3. Use the language switcher to change to English, Spanish, etc.
4. Refresh the page → translations load instantly from cache
5. Open DevTools → Network → See no API calls after initial load (cached!)
