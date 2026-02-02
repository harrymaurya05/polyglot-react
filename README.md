# i18nsolutions

AI-powered automatic translation library for React applications with intelligent caching and zero-maintenance workflow.

## 📦 Quick Start

```bash
npm install i18nsolutions
# or
yarn add i18nsolutions
```

## 🚀 Features

- **Single API Call at Startup** - All translations fetched once and cached
- **Auto-Extract Translatable Text** - Build-time plugin scans your code automatically
- **🎯 Auto-Wrap Text Feature** - Automatically wraps JSX text, attributes, and object strings with `t()` calls
- **⚡ Incremental Auto-Translation** - Only translate new/changed texts (90-99% cost savings)
- **Smart Caching** - LocalStorage/IndexedDB persistence across sessions
- **Zero Maintenance** - No manual translation files to manage
- **Multiple Translation Providers** - Support for Google Translate, DeepL, AWS Translate, Polyglot API
- **Offline-Ready** - Works offline after initial translation load
- **Dynamic Language Switching** - Change languages on the fly
- **Type-Safe** - Full TypeScript support
- **90% Cost Reduction** - Single batch call vs. per-text translation
- **Professional Quality** - Enterprise-grade accuracy and context awareness

## 🎯 Integration Guide for Existing React Projects

### Prerequisites

- React 16.8+ (hooks support)
- Vite or Create React App (Webpack plugin coming soon)
- Node.js 14+
- Translation API key (Google Translate, DeepL, or Polyglot API)

### Step 1: Install the Package

```bash
npm install i18nsolutions
# or
yarn add i18nsolutions
# or
pnpm add i18nsolutions
```

### Step 2: Configure Build Plugin

The plugin automatically extracts translatable text from your JSX components and can optionally wrap them with translation calls.

#### For Vite Projects

Update your [vite.config.js](vite.config.js) or [vite.config.ts](vite.config.ts):

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { extractTranslatableText } from "i18nsolutions/plugin";

export default defineConfig({
  plugins: [
    react(),
    extractTranslatableText({
      include: ["src/**/*.{jsx,tsx}"],
      output: "src/translations/texts.json",
      exclude: ["src/**/*.test.{jsx,tsx}"], // Optional: skip test files
      autoWrapText: true, // 🆕 Automatically wrap text with t() calls
      verbose: true, // Optional: see what's being processed
    }),
  ],
});
```

#### Plugin Configuration Options

```typescript
{
  include: string[];           // File patterns to scan (required)
  output: string;              // Output JSON file path (required)
  exclude?: string[];          // File patterns to ignore
  minLength?: number;          // Minimum text length to extract (default: 3)
  verbose?: boolean;           // Show detailed logs (default: false)
  autoWrapText?: boolean;      // 🆕 Auto-wrap text with t() (default: false)
  autoTranslate?: {            // Optional: auto-translate extracted texts
    enabled: boolean;
    adapter: TranslationAdapter;
    sourceLang: string;
    targetLangs: string[];
  }
}
```

#### For Create React App (CRA)

Since CRA doesn't easily allow custom build plugins, you have two options:

**Option A: Use CRACO (Recommended)**

```bash
npm install @craco/craco
```

Create [craco.config.js](craco.config.js):

```js
const { extractTranslatableText } = require("i18nsolutions/plugin");

module.exports = {
  webpack: {
    plugins: [
      extractTranslatableText({
        include: ["src/**/*.{jsx,tsx}"],
        output: "src/translations/texts.json",
      }),
    ],
  },
};
```

Update [package.json](package.json):

```json
{
  "scripts": {
    "start": "craco start",
    "build": "craco build",
    "test": "craco test"
  }
}
```

**Option B: Manual Text Extraction**

Create [src/translations/texts.json](src/translations/texts.json) manually:

```json
["Welcome", "Sign In", "Sign Up", "Get Started", "Learn More"]
```

### Step 3: Get Translation API Key

Choose one of the following providers:

#### Polyglot API (Recommended - Easiest)

1. Visit https://usepolyglot.dev
2. Sign up for free account
3. Get your API key from dashboard
4. Free tier: 500,000 characters/month

#### Google Translate

1. Go to Google Cloud Console
2. Enable "Cloud Translation API"
3. Create API credentials
4. Pricing: $20 per 1M characters

#### DeepL (Best Quality)

1. Visit https://www.deepl.com/pro-api
2. Sign up for API access
3. Get your authentication key
4. Free tier: 500,000 characters/month

### Step 4: Configure Environment Variables

Create or update [.env](/.env) file in your project root:

```env
# Choose your provider: 'polyglot', 'google', 'deepl', or 'aws'
VITE_TRANSLATE_PROVIDER=polyglot

# Your API key
VITE_TRANSLATE_API_KEY=your_api_key_here

# Default source language (your app's current language)
VITE_SOURCE_LANG=en

# Default target language
VITE_TARGET_LANG=es
```

**For Create React App**, use `REACT_APP_` prefix:

```env
REACT_APP_TRANSLATE_PROVIDER=polyglot
REACT_APP_TRANSLATE_API_KEY=your_api_key_here
REACT_APP_SOURCE_LANG=en
REACT_APP_TARGET_LANG=es
```

### Step 5: Wrap Your App with TranslateProvider

Update your main app file (usually [src/App.jsx](src/App.jsx) or [src/main.jsx](src/main.jsx)):

```jsx
import React from "react";
import { TranslateProvider, createTranslator } from "i18nsolutions";
import textsToTranslate from "./translations/texts.json";

// Create translator instance
const translator = createTranslator({
  sourceLang: import.meta.env.VITE_SOURCE_LANG || "en",
  targetLang: import.meta.env.VITE_TARGET_LANG || "es",
  provider: import.meta.env.VITE_TRANSLATE_PROVIDER || "polyglot",
  apiKey: import.meta.env.VITE_TRANSLATE_API_KEY,
  textsToTranslate,
  cache: {
    enabled: true,
    storage: "localStorage",
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  fallbackToOriginal: true,
});

function App() {
  return (
    <TranslateProvider translator={translator}>
      {/* Your existing app components */}
      <YourExistingApp />
    </TranslateProvider>
  );
}

export default App;
```

**For Create React App** (using `REACT_APP_` prefix):

```jsx
const translator = createTranslator({
  sourceLang: process.env.REACT_APP_SOURCE_LANG || "en",
  targetLang: process.env.REACT_APP_TARGET_LANG || "es",
  provider: process.env.REACT_APP_TRANSLATE_PROVIDER || "polyglot",
  apiKey: process.env.REACT_APP_TRANSLATE_API_KEY,
  textsToTranslate,
  // ... rest of config
});
```

### Step 6: Use Translations in Your Components

Replace hardcoded text with the translation hook:

**Before:**

```jsx
function Header() {
  return (
    <header>
      <h1>Welcome to Our App</h1>
      <button>Get Started</button>
      <p>Join thousands of happy users</p>
    </header>
  );
}
```

**After:**

```jsx
import { useTranslate } from "i18nsolutions";

function Header() {
  const t = useTranslate();

  return (
    <header>
      <h1>{t("Welcome to Our App")}</h1>
      <button>{t("Get Started")}</button>
      <p>{t("Join thousands of happy users")}</p>
    </header>
  );
}
```

### Step 7: Add Language Switcher (Optional)

Create a language selector component:

```jsx
import { useTranslator } from "i18nsolutions";

function LanguageSwitcher() {
  const { changeLanguage, currentLang, isLoading } = useTranslator();

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
    { code: "hi", name: "हिंदी" },
  ];

  return (
    <select
      value={currentLang}
      onChange={(e) => changeLanguage(e.target.value)}
      disabled={isLoading}
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
}
```

### Step 8: Build and Test

```bash
# Development mode
npm run dev

# Production build
npm run build
```

That's it! Your app now supports automatic translation with intelligent caching.

## 🎯 Auto-Wrap Text Feature (New!)

The `autoWrapText` feature automatically modifies your source files to wrap translatable text with `t()` calls. This eliminates manual wrapping!

### How It Works

When you enable `autoWrapText: true` in your plugin configuration and run `npm run build`, the plugin:

1. **Scans** all files matching your `include` patterns
2. **Detects** translatable text (JSX text, attributes, and object properties)
3. **Modifies** your source files to wrap text with `t()` calls
4. **Adds** `useTranslate` import and hook if missing
5. **Extracts** all text to `texts.json` for translation

### What Gets Wrapped

#### ✅ JSX Text Content

**Before:**

```jsx
function Header() {
  return <h1>Welcome to Our App</h1>;
}
```

**After:**

```jsx
import { useTranslate } from "i18nsolutions";

function Header() {
  const t = useTranslate();
  return <h1>{t("Welcome to Our App")}</h1>;
}
```

#### ✅ JSX Attributes

Automatically wraps these attributes:

- `placeholder`
- `title`
- `aria-label`
- `alt`
- `label`

**Before:**

```jsx
<input placeholder="Enter your name" />
<button title="Click me" />
<img alt="Profile picture" />
<label label="First Name" />
```

**After:**

```jsx
<input placeholder={t("Enter your name")} />
<button title={t("Click me")} />
<img alt={t("Profile picture")} />
<label label={t("First Name")} />
```

#### ✅ Object Properties

Automatically wraps these object properties:

- `message`
- `error`
- `title`
- `description`
- `label`
- `text`
- `name`

**Before:**

```jsx
showAlert({
  message: "Operation completed successfully",
  type: "success",
});

const config = {
  title: "Settings",
  description: "Configure your preferences",
  error: "Invalid input",
};
```

**After:**

```jsx
showAlert({
  message: t("Operation completed successfully"),
  type: "success",
});

const config = {
  title: t("Settings"),
  description: t("Configure your preferences"),
  error: t("Invalid input"),
};
```

### Smart Features

- ✅ **No Duplicates** - Checks if `useTranslate` is already imported before adding
- ✅ **Skip Already Wrapped** - Won't wrap text that's already inside `t()` calls
- ✅ **Works with Existing Code** - Processes files even if they already use `useTranslate`
- ✅ **Minimum Length** - Only wraps text longer than `minLength` (default: 3 characters)
- ✅ **Source Modification** - Actually modifies your source files (commit to see changes)

### Usage

```typescript
// vite.config.ts
extractTranslatableText({
  include: ["src/**/*.{jsx,tsx}"],
  output: "src/translations/texts.json",
  autoWrapText: true, // Enable auto-wrapping
  minLength: 3, // Only wrap text with 3+ characters
  verbose: true, // See detailed logs
});
```

### Important Notes

⚠️ **Source Files Are Modified** - The `autoWrapText` feature modifies your actual source files. Always commit your code before running it for the first time, so you can review the changes.

💡 **Run Once** - After the initial run, you can disable `autoWrapText` or leave it enabled. It won't re-wrap already wrapped text.

🎯 **Best Practice** - Use `autoWrapText: true` initially to wrap all existing text, then disable it and manually wrap new text as needed.

## 📋 Complete Integration Checklist

- [ ] Install `i18nsolutions` package
- [ ] Configure build plugin in vite.config.js (or CRACO for CRA)
- [ ] Enable `autoWrapText: true` for automatic text wrapping (optional)
- [ ] Get translation API key from your chosen provider
- [ ] Create .env file with API credentials
- [ ] Wrap app with TranslateProvider
- [ ] If not using `autoWrapText`, manually replace hardcoded text with `t()` function
- [ ] Add language switcher component (optional)
- [ ] Test translation in development
- [ ] Build and deploy

## 🔧 Configuration Options

## 🔧 Configuration Options

### createTranslator() API

```typescript
createTranslator({
  // REQUIRED: Source language (your app's default language)
  sourceLang: string, // e.g., 'en', 'es', 'fr'

  // REQUIRED: Target language for translation
  targetLang: string, // e.g., 'hi', 'es', 'fr', 'de'

  // REQUIRED: Translation provider
  provider: 'polyglot' | 'google' | 'deepl' | 'aws' | 'custom',

  // REQUIRED: API key or credentials
  apiKey: string, // For polyglot, google, deepl
  // OR
  credentials: { // For AWS
    accessKeyId: string,
    secretAccessKey: string,
    region: string,
  },
  // OR
  customAPIOptions: { // For custom backend
    baseUrl: string,
    headers?: Record<string, string>,
  },

  // REQUIRED: Texts to translate (from extracted JSON)
  textsToTranslate: string[],

  // OPTIONAL: Cache configuration
  cache: {
    enabled: boolean, // Default: true
    storage: 'localStorage' | 'indexedDB', // Default: 'localStorage'
    ttl: number, // Cache duration in ms, Default: 7 days
  },

  // OPTIONAL: Fallback to original text if translation fails
  fallbackToOriginal: boolean, // Default: true

  // OPTIONAL: Custom error handler
  onError: (error: Error) => void,

  // OPTIONAL: Loading state handler
  onLoadingChange: (isLoading: boolean) => void,
});
```

### extractTranslatableText() Plugin Options

```typescript
extractTranslatableText({
  // REQUIRED: Files to scan
  include: string[], // Glob patterns, e.g., ['src/**/*.{jsx,tsx}']

  // REQUIRED: Output file path
  output: string, // e.g., 'src/translations/texts.json'

  // OPTIONAL: Files to exclude
  exclude: string[], // Default: ['**/*.test.{jsx,tsx}', '**/node_modules/**']

  // OPTIONAL: Auto-translation configuration
  autoTranslate: {
    enabled: boolean,
    adapter: TranslationAdapter, // Polyglot, Google, DeepL, etc.
    sourceLang: string,
    targetLangs: string[],
  },

  // OPTIONAL: Extraction patterns
  patterns: {
    jsxText: boolean, // Extract from <div>Text</div>, Default: true
    jsxAttribute: string[], // Extract from attributes, e.g., ['title', 'placeholder']
    stringLiterals: boolean, // Extract from const text = "Hello", Default: false
  },

  // OPTIONAL: Minimum text length to extract
  minLength: number, // Default: 2

  // OPTIONAL: Ignore patterns (regex)
  ignore: RegExp[], // e.g., [/^[0-9]+$/, /^[A-Z_]+$/]

  // OPTIONAL: Debug mode
  verbose: boolean, // Default: false
});
```

## 🌍 Translation Provider Setup

### 1. Polyglot API (Recommended)

Simple, purpose-built for this library with no complex setup.

```jsx
import { createTranslator } from "i18nsolutions";
import { PolyglotAPIAdapter } from "i18nsolutions";

const translator = createTranslator({
  provider: "polyglot",
  apiKey: "YOUR_POLYGLOT_API_KEY",
  sourceLang: "en",
  targetLang: "es",
  textsToTranslate,
});
```

**Get API Key:** https://usepolyglot.dev

### 2. Google Translate

Professional translation with wide language support.

```jsx
import { createTranslator } from "i18nsolutions";

const translator = createTranslator({
  provider: "google",
  apiKey: "YOUR_GOOGLE_API_KEY",
  sourceLang: "en",
  targetLang: "es",
  textsToTranslate,
});
```

**Get API Key:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Cloud Translation API"
4. Create credentials → API Key
5. Copy the API key

### 3. DeepL (Best Quality)

Premium translation quality, ideal for professional content.

```jsx
import { createTranslator } from "i18nsolutions";

const translator = createTranslator({
  provider: "deepl",
  apiKey: "YOUR_DEEPL_API_KEY",
  sourceLang: "en",
  targetLang: "es",
  textsToTranslate,
});
```

**Get API Key:** https://www.deepl.com/pro-api

### 4. AWS Translate

Enterprise-grade translation with AWS infrastructure.

```jsx
import { createTranslator } from "i18nsolutions";

const translator = createTranslator({
  provider: "aws",
  credentials: {
    accessKeyId: "YOUR_AWS_ACCESS_KEY",
    secretAccessKey: "YOUR_AWS_SECRET_KEY",
    region: "us-east-1",
  },
  sourceLang: "en",
  targetLang: "es",
  textsToTranslate,
});
```

### 5. Custom Backend API

Use your own translation service.

```jsx
import { createTranslator } from "i18nsolutions";

const translator = createTranslator({
  provider: "custom",
  customAPIOptions: {
    baseUrl: "https://your-api.com/translate",
    headers: {
      "X-API-Key": "your_api_key",
      "Content-Type": "application/json",
    },
  },
  sourceLang: "en",
  targetLang: "es",
  textsToTranslate,
});
```

Your API should accept POST requests with this format:

```json
{
  "texts": ["Hello", "Welcome"],
  "sourceLang": "en",
  "targetLang": "es"
}
```

And return:

```json
{
  "translations": ["Hola", "Bienvenido"]
}
```

## 🎨 Advanced Usage

### Dynamic Content Translation

For user-generated content or API data not in your source code:

```jsx
import { useTranslateDynamic } from "i18nsolutions";

function UserComment({ comment }) {
  const translateDynamic = useTranslateDynamic();
  const [translated, setTranslated] = useState(comment);

  useEffect(() => {
    translateDynamic(comment).then(setTranslated);
  }, [comment]);

  return <p>{translated}</p>;
}
```

### Variables in Translations

```jsx
import { useTranslate } from "i18nsolutions";

function Welcome({ username }) {
  const t = useTranslate();

  return <h1>{t("Welcome, {{name}}!", { name: username })}</h1>;
  // Output: "Welcome, John!" → "¡Bienvenido, John!" (in Spanish)
}
```

### Pluralization Support

```jsx
import { useTranslate } from "i18nsolutions";

function ItemCount({ count }) {
  const t = useTranslate();

  return (
    <p>
      {t("{{count}} item", { count, plural: true })}
      {/* Handles singular/plural automatically */}
    </p>
  );
}
```

### Date and Number Formatting

```jsx
import { useFormat } from "i18nsolutions";

function Invoice({ amount, date }) {
  const { formatCurrency, formatDate } = useFormat();

  return (
    <div>
      <p>Amount: {formatCurrency(amount)}</p>
      <p>Date: {formatDate(date)}</p>
    </div>
  );
}
```

### Loading States

```jsx
import { useTranslator } from "i18nsolutions";

function App() {
  const { isLoading, error } = useTranslator();

  if (isLoading) {
    return <div>Loading translations...</div>;
  }

  if (error) {
    return <div>Error loading translations: {error.message}</div>;
  }

  return <YourApp />;
}
```

### Programmatic Language Change

```jsx
import { useTranslator } from "i18nsolutions";

function Settings() {
  const { changeLanguage, currentLang, availableLanguages } = useTranslator();

  const handleSave = async (newLang) => {
    try {
      await changeLanguage(newLang);
      // Language changed successfully
      // Translations are automatically updated
    } catch (error) {
      console.error("Failed to change language:", error);
    }
  };

  return (
    <div>
      <h2>Language Settings</h2>
      <select value={currentLang} onChange={(e) => handleSave(e.target.value)}>
        {availableLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
    </div>
  );
}
```

## ⚡ Incremental Auto-Translation

Save 90-99% on translation costs by only translating new or changed texts.

### Enable Auto-Translation

```js
// vite.config.js
import { extractTranslatableText } from "i18nsolutions/plugin";
import { PolyglotAPIAdapter } from "i18nsolutions";

export default defineConfig({
  plugins: [
    react(),
    extractTranslatableText({
      include: ["src/**/*.{jsx,tsx}"],
      output: "src/translations/texts.json",

      // Enable auto-translation
      autoTranslate: {
        enabled: true,
        adapter: new PolyglotAPIAdapter(process.env.VITE_POLYGLOT_API_KEY),
        sourceLang: "en",
        targetLangs: ["es", "fr", "de", "hi"],
      },
    }),
  ],
});
```

**How it works:**

1. Plugin extracts texts from your code
2. Compares with previously translated texts
3. Only translates new/changed texts
4. Updates translation files automatically

**Cost Savings Example:**

- Initial extraction: 1000 texts → Translates all 1000
- After adding 10 new texts → Translates only 10 (99% savings)
- After changing 5 texts → Translates only 5 (99.5% savings)

[📖 Full Incremental Translation Guide](./INCREMENTAL-TRANSLATION.md)

## 💾 Caching Strategies

### LocalStorage (Default)

Fast and simple, best for most applications.

```jsx
const translator = createTranslator({
  // ... other config
  cache: {
    enabled: true,
    storage: "localStorage",
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
});
```

**Pros:** Fast, synchronous, simple  
**Cons:** ~5-10MB limit  
**Best for:** Small to medium apps

### IndexedDB

Larger storage capacity for extensive translations.

```jsx
const translator = createTranslator({
  // ... other config
  cache: {
    enabled: true,
    storage: "indexedDB",
    ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
});
```

**Pros:** Large capacity (50MB+), structured storage  
**Cons:** Asynchronous, more complex  
**Best for:** Large apps with many languages

### Clear Cache

```jsx
import { useTranslator } from "i18nsolutions";

function Settings() {
  const { clearCache } = useTranslator();

  return <button onClick={clearCache}>Clear Translation Cache</button>;
}
```

## 🧪 Testing

### Mock Translations in Tests

```jsx
import { render, screen } from "@testing-library/react";
import { MockTranslateProvider } from "i18nsolutions/testing";
import Header from "./Header";

test("renders translated welcome message", () => {
  render(
    <MockTranslateProvider
      translations={{
        "Welcome to Our App": "स्वागत है हमारे ऐप में",
        "Get Started": "शुरू करें",
      }}
    >
      <Header />
    </MockTranslateProvider>,
  );

  expect(screen.getByText("स्वागत है हमारे ऐप में")).toBeInTheDocument();
});
```

### Test Language Switching

```jsx
import { render, screen, fireEvent } from "@testing-library/react";
import { MockTranslateProvider } from "i18nsolutions/testing";
import LanguageSwitcher from "./LanguageSwitcher";

test("switches language", async () => {
  const { rerender } = render(
    <MockTranslateProvider currentLang="en">
      <LanguageSwitcher />
    </MockTranslateProvider>,
  );

  const select = screen.getByRole("combobox");
  fireEvent.change(select, { target: { value: "es" } });

  // Test language change logic
  expect(select.value).toBe("es");
});
```

## 📊 Performance & Cost Comparison

### Traditional Approach (Per-Text Translation)

```
1000 texts × 10 API calls per session × 30 users = 300,000 API calls/day
Cost: ~$60/day
```

### With i18nsolutions

```
1 API call per language per session × 30 users = 30 API calls/day
Cost: ~$0.06/day (with caching)
Savings: 99.98%
```

### Performance Metrics

- **Initial Load:** ~500ms (one-time batch translation)
- **Subsequent Loads:** <5ms (served from cache)
- **Cache Size:** 50-200KB for typical apps
- **Bundle Size:** ~15KB (gzipped)

## 🌐 Supported Languages

All major languages supported by your chosen provider:

**Common Languages:**

- English (en), Spanish (es), French (fr), German (de)
- Hindi (hi), Chinese (zh), Japanese (ja), Korean (ko)
- Arabic (ar), Russian (ru), Portuguese (pt), Italian (it)
- Dutch (nl), Polish (pl), Turkish (tr), Swedish (sv)
- And 100+ more...

Check your provider's documentation for the complete list.

## 🚨 Common Issues & Troubleshooting

### Issue: "Texts not extracted"

**Solution:**

- Ensure build plugin is properly configured
- Check `include` patterns match your files
- Run `npm run build` to trigger extraction
- Verify `texts.json` is created in output path

### Issue: "API key not working"

**Solution:**

- Verify API key is correct and active
- Check environment variables are loaded (restart dev server)
- For Vite: use `VITE_` prefix
- For CRA: use `REACT_APP_` prefix
- Ensure API key has proper permissions/billing enabled

### Issue: "Translations not loading"

**Solution:**

- Check browser console for errors
- Verify `TranslateProvider` wraps your app
- Ensure `textsToTranslate` is properly imported
- Check network tab for API call failures
- Clear cache and reload: `localStorage.clear()`

### Issue: "Build fails with plugin error"

**Solution:**

- Update to latest version: `npm install i18nsolutions@latest`
- Check Vite version compatibility (requires Vite 4+)
- Verify plugin configuration syntax
- Check for conflicting plugins

### Issue: "Cache not persisting"

**Solution:**

- Check browser settings allow localStorage
- Verify cache configuration is enabled
- Try IndexedDB if localStorage is full
- Check TTL hasn't expired

## 🛠️ Migration Guide

### From react-i18next

```jsx
// Before (react-i18next)
import { useTranslation } from "react-i18next";
const { t } = useTranslation();
t("welcome.message");

// After (i18nsolutions)
import { useTranslate } from "i18nsolutions";
const t = useTranslate();
t("Welcome message");
```

### From react-intl

```jsx
// Before (react-intl)
import { FormattedMessage } from "react-intl";
<FormattedMessage id="welcome" defaultMessage="Welcome" />;

// After (i18nsolutions)
import { useTranslate } from "i18nsolutions";
const t = useTranslate();
{
  t("Welcome");
}
```

## 📚 API Reference

### Hooks

#### `useTranslate()`

Returns translation function.

```typescript
const t = useTranslate();
t(text: string, variables?: Record<string, any>): string
```

#### `useTranslator()`

Returns translator instance and control methods.

```typescript
const { currentLang, changeLanguage, isLoading, error, clearCache } =
  useTranslator();
```

#### `useTranslateDynamic()`

Translates dynamic runtime content.

```typescript
const translateDynamic = useTranslateDynamic();
const result = await translateDynamic(text: string): Promise<string>
```

#### `useFormat()`

Returns formatting utilities.

```typescript
const { formatCurrency, formatDate, formatNumber } = useFormat();
```

### Components

#### `<TranslateProvider>`

Context provider for translations.

```typescript
<TranslateProvider
  translator={translator}
  loadingComponent={<CustomLoader />} // Optional
>
  {children}
</TranslateProvider>
```

#### `<MockTranslateProvider>` (Testing)

Mock provider for tests.

```typescript
<MockTranslateProvider
  translations={{ "Hello": "Hola" }}
  currentLang="es"
>
  {children}
</MockTranslateProvider>
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md).

## 📄 License

MIT © 2025

## 🙋 Support & Resources

- 📖 [Full Documentation](./README.md)
- 🚀 [Quick Start Guide](./QUICKSTART.md)
- 🔄 [Incremental Translation Guide](./INCREMENTAL-TRANSLATION.md)
- 🔌 [Integration Guide](./INTEGRATION-GUIDE.md)
- 🌐 [Polyglot API Guide](./POLYGLOT-API-GUIDE.md)
- 💬 [GitHub Issues](https://github.com/yourusername/i18nsolutions/issues)
- 📧 Email: support@usepolyglot.dev

## 🗺️ Roadmap

- [ ] Support for more translation providers (Microsoft, Yandex)
- [ ] CLI tool for managing translations
- [ ] React Native support
- [ ] Webpack plugin support (for CRA without CRACO)
- [ ] Translation quality feedback system
- [ ] Automatic language detection based on browser settings
- [ ] Server-side rendering (SSR) support for Next.js
- [ ] Gatsby plugin
- [ ] Translation management dashboard
- [ ] A/B testing for translations

## � Recent Updates

### v1.0.13 (Latest)

- ✅ **Auto-wrap processes all files** - Now works with files that already have `useTranslate` imported
- ✅ **Smart duplicate prevention** - Won't add duplicate imports or hooks
- ✅ **Improved wrapping logic** - Better detection of already-wrapped text

### v1.0.12

- ✅ **Object property wrapping** - Auto-wraps strings in objects (`message`, `error`, `title`, etc.)
- ✅ **Enhanced detection** - Supports common property names in alerts, configs, and notifications

### v1.0.11

- ✅ **Removed autoTransform** - Simplified to single `autoWrapText` feature
- ✅ **Label attribute support** - Added `label` to supported JSX attributes
- ✅ **Source file modification** - Direct modification for better visibility

### v1.0.10

- ✅ **Fixed TypeScript error** - Corrected `useTranslate` hook usage from `const { t }` to `const t`
- ✅ **Renamed feature** - Changed `rewriteSource` to more descriptive `autoWrapText`
- ✅ **Mutual exclusivity** - Better validation for feature options

### v1.0.9

- ✅ **Introduced autoWrapText** - Automatic source file modification feature
- ✅ **Smart text detection** - Detects JSX text and attributes automatically

## �💡 Why Choose i18nsolutions?

### vs Chrome's Built-in Translator

- ✅ Consistent, controlled translations
- ✅ Professional quality (DeepL, Google Cloud)
- ✅ SEO-friendly pre-rendered content
- ✅ Brand protection (no mistranslations)
- ✅ Integrates with app logic (dates, currency, formatting)

### vs Traditional i18n Libraries

- ✅ **90% cost reduction** (single batch API call)
- ✅ **Zero maintenance** (auto-extract, auto-translate)
- ✅ **Smart caching** (offline-ready after first load)
- ✅ **No JSON files to manage** (automated workflow)
- ✅ **Incremental updates** (only translate what changed)

### vs Manual Translation

- ✅ **10x faster** (automated extraction and translation)
- ✅ **No human translators needed** (AI-powered)
- ✅ **Instant updates** (add text, translation happens automatically)
- ✅ **Multiple languages** (support 100+ languages easily)
- ✅ **Always up-to-date** (no stale translations)

---

**Made with ❤️ for developers who hate maintaining translation files**

```

```
