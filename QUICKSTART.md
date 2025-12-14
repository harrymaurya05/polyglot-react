# Quick Start Guide - @polyglot/react

Get started in 5 minutes! ⚡

## Step 1: Install the Library

```bash
npm install @polyglot/react
# or
yarn add @polyglot/react
```

## Step 2: Configure Vite Plugin

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { extractTranslatableText } from "@polyglot/react/plugin";

export default defineConfig({
  plugins: [
    react(),
    extractTranslatableText({
      include: ["src/**/*.{jsx,tsx}"],
      output: "src/translations/texts.json",
    }),
  ],
});
```

## Step 3: Get Translation API Key

Choose one provider:

### Google Translate (Easiest)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project
3. Enable "Cloud Translation API"
4. Create API key
5. Copy the key

### DeepL (Best Quality)

1. Go to [DeepL API](https://www.deepl.com/pro-api)
2. Sign up for free account
3. Copy your API key

### AWS Translate

1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Create IAM user with Translate permissions
3. Get access key and secret key

## Step 4: Create .env File

```bash
# .env
VITE_TRANSLATE_API_KEY=your_api_key_here
```

## Step 5: Wrap Your App

Update your `App.tsx`:

```tsx
import { TranslateProvider, createTranslator } from "@polyglot/react";
import textsToTranslate from "./translations/texts.json";

const translator = createTranslator({
  sourceLang: "en",
  targetLang: "hi", // Hindi
  provider: "google",
  apiKey: import.meta.env.VITE_TRANSLATE_API_KEY,
  textToTranslate: textsToTranslate,
  cache: {
    enabled: true,
    storage: "localStorage",
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
});

function App() {
  return (
    <TranslateProvider translator={translator}>
      {/* Your app components */}
    </TranslateProvider>
  );
}
```

## Step 6: Use in Components

```tsx
import { useTranslate } from "@polyglot/react";

function MyComponent() {
  const t = useTranslate();

  return (
    <div>
      <h1>{t("Welcome to Our App!")}</h1>
      <p>{t("This text will be automatically translated.")}</p>
      <button>{t("Get Started")}</button>
    </div>
  );
}
```

## Step 7: Build and Run

```bash
npm run dev
```

That's it! Your app now has automatic AI-powered translation! 🎉

## Optional: Add Language Switcher

```tsx
import { useTranslator } from "@polyglot/react";

function LanguageSwitcher() {
  const { changeLanguage, currentLang, isLoading } = useTranslator();

  return (
    <select
      value={currentLang}
      onChange={(e) => changeLanguage(e.target.value)}
      disabled={isLoading}
    >
      <option value="en">English</option>
      <option value="hi">हिंदी</option>
      <option value="es">Español</option>
      <option value="fr">Français</option>
    </select>
  );
}
```

## How It Works

1. **Build**: Vite plugin scans your code and extracts all text to `texts.json`
2. **Startup**: Library makes ONE batch API call to translate everything
3. **Runtime**: Translations served instantly from cache
4. **Refresh**: No API calls needed - everything loads from cache!

## Supported Languages

Over 100+ languages supported including:

- Hindi (hi)
- Spanish (es)
- French (fr)
- German (de)
- Chinese (zh)
- Japanese (ja)
- Korean (ko)
- Arabic (ar)
- And many more!

## Tips

- **Start Simple**: Begin with one target language
- **Use Cache**: Enable caching to save API costs
- **Check Extraction**: Look at `texts.json` to see what's extracted
- **Test Offline**: Refresh page to see instant loading from cache
- **Monitor Costs**: One batch call vs per-text = 90% savings!

## Troubleshooting

### "texts.json not found"

- Run `npm run dev` once to generate the file
- Check `output` path in plugin config

### "API key invalid"

- Verify your API key is correct
- Check `.env` file exists and is loaded
- Ensure key has proper permissions

### "Translations not working"

- Check browser console for errors
- Verify TranslateProvider wraps your app
- Ensure translator is initialized before rendering

## Next Steps

- Read full [README.md](./README.md) for advanced features
- Check out [examples/](./examples/) for complete working app
- Add variable interpolation: `t('Hello {{name}}', { name: 'John' })`
- Implement pluralization
- Use `useTranslateDynamic()` for user content

## Need Help?

- 📖 [Full Documentation](./README.md)
- 💬 [GitHub Discussions](https://github.com/yourusername/@polyglot/react/discussions)
- 🐛 [Report Issues](https://github.com/yourusername/@polyglot/react/issues)

---

**Happy translating! 🌍✨**
