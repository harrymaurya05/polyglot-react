# Basic Example - React Translate AI Custom

This example demonstrates the basic usage of react-translate-ai-custom library.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file with your translation API key:

```
VITE_TRANSLATE_API_KEY=your_api_key_here
```

3. Run the development server:

```bash
npm run dev
```

## What This Example Shows

- **Automatic Text Extraction**: The Vite plugin scans JSX files and generates `texts.json`
- **Translation Provider Setup**: Configured with Google Translate (can switch to DeepL or AWS)
- **Caching**: Translations are cached in localStorage for 7 days
- **Language Switching**: LanguageSwitcher component allows users to change languages
- **React Hooks**: Using `useTranslate()` and `useTranslator()` hooks

## File Structure

- `vite.config.ts` - Vite plugin configuration
- `App.tsx` - Main app with TranslateProvider
- `components/Header.tsx` - Example using useTranslate hook
- `components/LanguageSwitcher.tsx` - Language selector with useTranslator
- `translations/texts.json` - Auto-generated translatable texts

## Supported Languages

- English (en)
- Hindi (hi)
- Spanish (es)
- French (fr)
- German (de)

## How It Works

1. **Build Time**: Vite plugin scans all `.tsx` files and extracts text into `texts.json`
2. **App Startup**: TranslateProvider makes a single batch API call to translate all texts
3. **Runtime**: Components use `useTranslate()` to get translated text from cache
4. **Language Switch**: User changes language → new translations fetched and cached

## Try It Out

1. Open the app in your browser
2. Notice all text is in the default language (Hindi)
3. Use the language switcher to change to English, Spanish, etc.
4. Refresh the page → translations load instantly from cache
5. Open DevTools → Network → See no API calls after initial load (cached!)
