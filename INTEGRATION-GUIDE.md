# Integration Guide

Complete guide to integrate the AI-powered translation library into your React application.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Vite Plugin Setup](#vite-plugin-setup)
- [Translation Providers](#translation-providers)
- [React Integration](#react-integration)
- [Usage Examples](#usage-examples)
- [Advanced Features](#advanced-features)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- **React**: 16.8+ (hooks support required)
- **Build Tool**: Vite (for auto-extraction plugin)
- **Node.js**: 16+ recommended
- **Translation API**: Account with one of:
  - Google Cloud Translation API
  - AWS Translate
  - DeepL API
  - Polyglot API (self-hosted or cloud)

## Installation

```bash
npm install i18nsolutions
# or
yarn add i18nsolutions
# or
pnpm add i18nsolutions
```

### Install Translation Provider SDK (if needed)

```bash
# For AWS Translate
npm install @aws-sdk/client-translate

# For DeepL (adapter includes HTTP client)
# No additional SDK needed

# For Google Translate
# API key authentication via HTTP, no SDK needed
```

## Quick Start

### Step 1: Configure Vite Plugin

Create or update your `vite.config.ts`:

```typescript
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { extractTranslatableText } from "i18nsolutions/plugin";
import { AWSTranslateAdapter } from "i18nsolutions";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      extractTranslatableText({
        // Files to scan for translatable text
        include: ["src/**/*.{jsx,tsx}"],

        // Where to save extracted texts
        output: "src/translations/texts.json",

        // Optional: files to exclude
        exclude: ["src/**/*.test.{jsx,tsx}", "src/**/*.spec.{jsx,tsx}"],

        // Optional: verbose logging
        verbose: true,

        // Enable auto-translation at build time
        autoTranslate: {
          enabled: true,
          adapter: new AWSTranslateAdapter({
            region: env.VITE_AWS_REGION || "us-east-1",
            accessKeyId: env.VITE_AWS_ACCESS_KEY_ID,
            secretAccessKey: env.VITE_AWS_SECRET_ACCESS_KEY,
          }),
          sourceLang: "en",
          targetLangs: ["es", "fr", "de", "hi", "ja", "zh"], // Add your target languages
          // Translation store will be created at src/translations/.translation-store.json
        },
      }),
    ],
  };
});
```

### Step 2: Create Environment File

Create `.env` in your project root:

```bash
# For AWS Translate
VITE_AWS_ACCESS_KEY_ID=your_access_key_id
VITE_AWS_SECRET_ACCESS_KEY=your_secret_access_key
VITE_AWS_REGION=us-east-1

# For Google Translate (if using)
# VITE_GOOGLE_TRANSLATE_API_KEY=your_api_key

# For DeepL (if using)
# VITE_DEEPL_API_KEY=your_api_key

# For Polyglot API (if using)
# VITE_POLYGLOT_API_KEY=your_api_key
# VITE_POLYGLOT_API_URL=http://localhost:8080
```

### Step 3: Setup React App

Update your main `App.tsx`:

```typescript
import { useState } from "react";
import translationStore from "./translations/.translation-store.json";

// Extract translations from the store
function getTranslationsMap() {
  const translations: Record<string, Record<string, string>> = {};

  for (const metadata of Object.values(translationStore.metadata)) {
    for (const [lang, translated] of Object.entries(metadata.translations)) {
      if (!translations[lang]) {
        translations[lang] = {};
      }
      translations[lang][metadata.text] = translated;
    }
  }

  return translations;
}

const translationsMap = getTranslationsMap();
const supportedLanguages = Object.keys(translationsMap);

function App() {
  const [currentLang, setCurrentLang] = useState("en");

  const t = (text: string): string => {
    // Return translated text from pre-built translations
    return translationsMap[currentLang]?.[text] || text;
  };

  return (
    <div className="app">
      <header>
        <h1>{t("Welcome to My App")}</h1>

        {/* Language Switcher */}
        <select
          value={currentLang}
          onChange={(e) => setCurrentLang(e.target.value)}
        >
          {supportedLanguages.map((lang) => (
            <option key={lang} value={lang}>
              {lang.toUpperCase()}
            </option>
          ))}
        </select>
      </header>

      <main>
        <p>{t("This is a sample application with automated translations.")}</p>
        <button>{t("Get Started")}</button>
      </main>
    </div>
  );
}

export default App;
```

### Step 4: Run Your App

```bash
# Start development server (will auto-translate on first run)
npm run dev

# Build for production
npm run build
```

## Vite Plugin Setup

### Basic Configuration

```typescript
extractTranslatableText({
  include: ["src/**/*.{jsx,tsx}"],
  output: "src/translations/texts.json",
});
```

### Advanced Configuration

```typescript
extractTranslatableText({
  // Required: Files to scan
  include: ["src/**/*.{jsx,tsx}"],

  // Required: Output file for extracted texts
  output: "src/translations/texts.json",

  // Optional: Files to exclude
  exclude: [
    "src/**/*.test.{jsx,tsx}",
    "src/**/*.spec.{jsx,tsx}",
    "src/**/__tests__/**",
  ],

  // Optional: What to extract
  patterns: {
    jsxText: true, // Extract JSX text content
    jsxAttribute: ["title", "alt", "placeholder"], // Extract specific attributes
    stringLiterals: false, // Extract all string literals (noisy)
  },

  // Optional: Minimum text length to extract
  minLength: 2,

  // Optional: Regex patterns to ignore
  ignore: [
    /^[0-9]+$/, // Pure numbers
    /^[a-z0-9-_]+$/i, // IDs/slugs
    /\.(jpg|png|svg|css)$/, // File extensions
  ],

  // Optional: Verbose logging
  verbose: true,

  // Optional: Auto-translation configuration
  autoTranslate: {
    enabled: true,
    adapter: new AWSTranslateAdapter({
      region: process.env.VITE_AWS_REGION || "us-east-1",
      accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY!,
    }),
    sourceLang: "en",
    targetLangs: ["es", "fr", "de", "hi", "ja", "zh"],

    // Optional: Custom store file path
    storeFilePath: "src/translations/.translation-store.json",
  },
});
```

## Translation Providers

### AWS Translate

```typescript
import { AWSTranslateAdapter } from "i18nsolutions";

const adapter = new AWSTranslateAdapter({
  region: "us-east-1",
  accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY!,
});
```

**Setup:**

1. Create AWS account at [aws.amazon.com](https://aws.amazon.com)
2. Go to IAM → Users → Create access key
3. Attach policy: `TranslateFullAccess`
4. Add credentials to `.env`

**Pros:**

- Pay-as-you-go pricing ($15 per million characters)
- High quality translations
- Supports 75+ languages
- No rate limits for standard usage

**Cons:**

- Requires AWS account setup
- SSL certificate issues in development (can be bypassed)

### Google Translate

```typescript
import { GoogleTranslateAdapter } from "i18nsolutions";

const adapter = new GoogleTranslateAdapter(
  process.env.VITE_GOOGLE_TRANSLATE_API_KEY!
);
```

**Setup:**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable Cloud Translation API
3. Create API key in Credentials
4. Add to `.env`

**Pros:**

- Simple setup
- 500,000 characters free per month
- Excellent translation quality
- Wide language support

**Cons:**

- Requires Google Cloud account
- Paid after free tier

### DeepL

```typescript
import { DeepLAdapter } from "i18nsolutions";

const adapter = new DeepLAdapter(process.env.VITE_DEEPL_API_KEY!);
```

**Setup:**

1. Sign up at [deepl.com/pro](https://www.deepl.com/pro)
2. Get API key from account
3. Add to `.env`

**Pros:**

- Best translation quality (especially for European languages)
- 500,000 characters free per month
- Simple API

**Cons:**

- Supports fewer languages (30+)
- More expensive after free tier

### Polyglot API (Self-Hosted)

```typescript
import { PolyglotAPIAdapter } from "i18nsolutions";

const adapter = new PolyglotAPIAdapter({
  apiKey: process.env.VITE_POLYGLOT_API_KEY!,
  baseUrl: process.env.VITE_POLYGLOT_API_URL || "http://localhost:8080",
  timeout: 60000,
});
```

**Setup:**

1. Deploy Polyglot API server
2. Get API key from server admin
3. Add to `.env`

**Pros:**

- Self-hosted (full control)
- Can integrate multiple providers
- Customizable
- No vendor lock-in

**Cons:**

- Requires infrastructure setup
- Must maintain server

## React Integration

### Using Translation Store (Recommended - Build-Time)

This approach uses pre-translated texts from the build process:

```typescript
import translationStore from "./translations/.translation-store.json";

function getTranslationsMap() {
  const translations: Record<string, Record<string, string>> = {};

  for (const metadata of Object.values(translationStore.metadata)) {
    for (const [lang, translated] of Object.entries(metadata.translations)) {
      if (!translations[lang]) {
        translations[lang] = {};
      }
      translations[lang][metadata.text] = translated;
    }
  }

  return translations;
}

const translationsMap = getTranslationsMap();

function App() {
  const [currentLang, setCurrentLang] = useState("en");

  const t = (text: string): string => {
    return translationsMap[currentLang]?.[text] || text;
  };

  return <div>{t("Hello World")}</div>;
}
```

**Benefits:**

- ✅ No runtime API calls
- ✅ Instant translations (no loading state)
- ✅ Works offline
- ✅ Zero cost at runtime
- ✅ Pre-translated at build time

## Usage Examples

### Basic Text Translation

```tsx
function Header() {
  const t = useTranslateFunction(); // Your custom hook

  return (
    <header>
      <h1>{t("Welcome")}</h1>
      <p>{t("Get started with our amazing platform")}</p>
    </header>
  );
}
```

### Lists and Mapping

```tsx
function ProductList({ products }) {
  const t = useTranslateFunction();

  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          <h3>{product.name}</h3>
          <button>{t("Add to Cart")}</button>
          <button>{t("View Details")}</button>
        </li>
      ))}
    </ul>
  );
}
```

### Forms

```tsx
function ContactForm() {
  const t = useTranslateFunction();

  return (
    <form>
      <label>{t("Name")}</label>
      <input placeholder={t("Enter your name")} />

      <label>{t("Email")}</label>
      <input type="email" placeholder={t("Enter your email")} />

      <label>{t("Message")}</label>
      <textarea placeholder={t("Your message here...")} />

      <button type="submit">{t("Send Message")}</button>
    </form>
  );
}
```

### Language Switcher Component

```tsx
function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState("en");
  const t = useTranslateFunction();

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
    { code: "hi", name: "हिन्दी" },
    { code: "ja", name: "日本語" },
    { code: "zh", name: "中文" },
  ];

  return (
    <div>
      <label>{t("Language")}: </label>
      <select
        value={currentLang}
        onChange={(e) => setCurrentLang(e.target.value)}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
```

### Conditional Rendering

```tsx
function Dashboard({ user }) {
  const t = useTranslateFunction();

  return (
    <div>
      {user.isPremium ? (
        <p>{t("Welcome back, Premium member!")}</p>
      ) : (
        <p>{t("Upgrade to Premium for more features")}</p>
      )}
    </div>
  );
}
```

## Advanced Features

### Custom Translation Helper

Create a reusable translation helper:

```typescript
// src/utils/translation.ts
import translationStore from "../translations/.translation-store.json";

let currentLanguage = "en";

export function getTranslationsMap() {
  const translations: Record<string, Record<string, string>> = {};

  for (const metadata of Object.values(translationStore.metadata)) {
    for (const [lang, translated] of Object.entries(metadata.translations)) {
      if (!translations[lang]) {
        translations[lang] = {};
      }
      translations[lang][metadata.text] = translated;
    }
  }

  return translations;
}

const translationsMap = getTranslationsMap();

export function setLanguage(lang: string) {
  currentLanguage = lang;
  localStorage.setItem("preferredLanguage", lang);
}

export function getLanguage() {
  return currentLanguage;
}

export function t(text: string): string {
  return translationsMap[currentLanguage]?.[text] || text;
}

export function getSupportedLanguages() {
  return Object.keys(translationsMap);
}

// Initialize language from localStorage
const savedLang = localStorage.getItem("preferredLanguage");
if (savedLang && translationsMap[savedLang]) {
  currentLanguage = savedLang;
}
```

### React Context for Translations

```typescript
// src/contexts/TranslationContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";
import { getTranslationsMap } from "../utils/translation";

interface TranslationContextType {
  currentLang: string;
  changeLanguage: (lang: string) => void;
  t: (text: string) => string;
  supportedLanguages: string[];
}

const TranslationContext = createContext<TranslationContextType | null>(null);

const translationsMap = getTranslationsMap();
const supportedLanguages = Object.keys(translationsMap);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem("preferredLanguage") || "en";
  });

  const changeLanguage = (lang: string) => {
    setCurrentLang(lang);
    localStorage.setItem("preferredLanguage", lang);
  };

  const t = (text: string): string => {
    return translationsMap[currentLang]?.[text] || text;
  };

  return (
    <TranslationContext.Provider
      value={{ currentLang, changeLanguage, t, supportedLanguages }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within TranslationProvider");
  }
  return context;
}
```

Usage:

```tsx
// main.tsx
import { TranslationProvider } from "./contexts/TranslationContext";

root.render(
  <TranslationProvider>
    <App />
  </TranslationProvider>
);

// In components
function MyComponent() {
  const { t, currentLang, changeLanguage } = useTranslation();

  return <div>{t("Hello World")}</div>;
}
```

### Persisting Language Preference

```typescript
// Save to localStorage
localStorage.setItem("preferredLanguage", selectedLang);

// Load on app start
const savedLang = localStorage.getItem("preferredLanguage") || "en";
setCurrentLang(savedLang);

// Or use browser language
const browserLang = navigator.language.split("-")[0]; // "en-US" -> "en"
if (supportedLanguages.includes(browserLang)) {
  setCurrentLang(browserLang);
}
```

## Troubleshooting

### Issue: "Cannot find module './translations/texts.json'"

**Solution:** Run the dev server once to generate the translations:

```bash
npm run dev
```

The Vite plugin will automatically extract texts and create the files.

### Issue: "AWS Translate error: unable to get local issuer certificate"

**Solution:** For development only, disable SSL verification in `vite.config.ts`:

```typescript
// For development only - DO NOT use in production!
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export default defineConfig({
  // ... rest of config
});
```

**Better solution:** Use proper SSL certificates in production or switch to a different provider.

### Issue: Translations not updating

**Solution:**

1. Delete `.translation-store.json` to force re-translation
2. Restart the dev server
3. Check if texts were properly extracted in `texts.json`

### Issue: Some text not being extracted

**Solution:**

1. Check if the file is included in `include` patterns
2. Verify text is not in `exclude` patterns
3. Check `minLength` setting
4. Look at `ignore` regex patterns
5. Use JSX text content instead of template literals when possible

### Issue: Build errors after removing cache

**Solution:** If you see TypeScript errors about cache types, make sure to:

1. Run `npm run build` to regenerate type definitions
2. Restart your IDE/editor
3. Clear TypeScript cache: `rm -rf node_modules/.cache`

### Issue: Translation API rate limits

**Solution:**

- Use auto-translation which only translates new/changed texts
- Commit `.translation-store.json` to version control
- Consider caching translations on your backend

### Issue: Large bundle size

**Solution:**

- The translation store is included in your bundle
- Consider lazy-loading translations for some languages
- Use code splitting if you have many languages

## Best Practices

1. **Commit translation store**: Add `.translation-store.json` to git so translations persist across builds

2. **Use meaningful text**: Extract complete sentences, not fragments:

   ```tsx
   // ✅ Good
   <p>{t("Welcome to our platform! Get started today.")}</p>

   // ❌ Bad (fragments don't translate well)
   <p>{t("Welcome")} {t("to our platform")}!</p>
   ```

3. **Avoid string concatenation**: Keep context together:

   ```tsx
   // ✅ Good
   <p>{t("You have 5 messages")}</p>

   // ❌ Bad (loses context)
   <p>{t("You have")} {count} {t("messages")}</p>
   ```

4. **Keep UI text simple**: Avoid technical terms in user-facing text

5. **Test multiple languages**: Check that your UI doesn't break with longer translations (German, Russian)

6. **Exclude non-translatable content**:

   - API endpoints
   - CSS classes
   - IDs and technical identifiers
   - Code snippets

7. **Use environment variables**: Never commit API keys to version control

## Next Steps

- ✅ [View Example App](./examples/basic-example)
- 📖 [Read Full API Documentation](./README.md)
- 🔧 [Incremental Translation Guide](./INCREMENTAL-TRANSLATION.md)
- 🎯 [Best Practices Guide](./CONTRIBUTING.md)

## Support

For issues, questions, or feature requests:

- GitHub Issues: [Create an issue](https://github.com/yourusername/ai-translator-lib/issues)
- Documentation: [Full README](./README.md)

## License

MIT License - see [LICENSE](./LICENSE) file for details.
