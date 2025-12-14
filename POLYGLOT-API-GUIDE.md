# Polyglot API Adapter - Official usepolyglot.dev Integration

The **Polyglot API Adapter** is the official adapter for connecting to the usepolyglot.dev translation service. It provides professional AI-powered translations with built-in caching, monitoring, and billing management.

## Features

✅ **Simple Setup** - Just provide your API key  
✅ **Hash-based Caching** - Efficient caching for long texts  
✅ **Auto Retry** - 3 automatic retries with exponential backoff  
✅ **Error Handling** - Clear error messages for auth, rate limits, and billing  
✅ **Production Ready** - Uses official https://api.usepolyglot.dev endpoint  
✅ **Development Support** - Can point to localhost for testing

---

## Installation

```bash
npm install @polyglot/react
```

## Quick Start

### 1. Get Your API Key

Sign up at [usepolyglot.dev](https://usepolyglot.dev) to get your API key.

### 2. Simple Usage (API Key Only)

```tsx
import { createTranslator, TranslateProvider } from "@polyglot/react";
import textsToTranslate from "./translations/texts.json";

const translator = createTranslator({
  sourceLang: "en",
  targetLang: "es",
  provider: "polyglot",
  apiKey: "your_api_key_here", // Simple setup
  textToTranslate: textsToTranslate,
  cache: {
    enabled: true,
    storage: "localStorage",
    ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
});

function App() {
  return (
    <TranslateProvider translator={translator}>
      <YourApp />
    </TranslateProvider>
  );
}
```

### 3. Advanced Usage (Full Options)

```tsx
const translator = createTranslator({
  sourceLang: "en",
  targetLang: "hi",
  provider: "polyglot",
  polyglotAPIOptions: {
    apiKey: "your_api_key_here",
    baseUrl: "https://api.usepolyglot.dev", // Optional: defaults to production
    timeout: 30000, // Optional: 30 seconds
  },
  textToTranslate: textsToTranslate,
  cache: {
    enabled: true,
    storage: "localStorage",
    ttl: 30 * 24 * 60 * 60 * 1000,
  },
});
```

### 4. Development/Testing with Local Backend

```tsx
const translator = createTranslator({
  sourceLang: "en",
  targetLang: "es",
  provider: "polyglot",
  polyglotAPIOptions: {
    apiKey: "test_api_key_12345",
    baseUrl: "http://localhost:8080", // Your local Spring Boot backend
    timeout: 60000,
  },
  textToTranslate: textsToTranslate,
  cache: {
    enabled: true,
    storage: "localStorage",
    ttl: 7 * 24 * 60 * 60 * 1000,
  },
});
```

---

## API Request/Response Format

### Static Translations (from texts.json)

**Request:**

```bash
curl --location 'https://api.usepolyglot.dev/api/translate' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: your_api_key_here' \
--data '{
    "texts": {
        "Hello": "Hello",
        "Goodbye": "Goodbye",
        "Thank you": "Thank you"
    },
    "sourceLang": "en",
    "targetLang": "es"
}'
```

**Response:**

```json
{
  "translations": {
    "Hello": "Hola",
    "Goodbye": "Adiós",
    "Thank you": "Gracias"
  },
  "cached": false,
  "charCount": 25
}
```

### Dynamic Translations (with hash keys)

**Request:**

```bash
curl --location 'https://api.usepolyglot.dev/api/translate' \
--header 'Content-Type: application/json' \
--header 'X-API-Key: your_api_key_here' \
--data '{
    "texts": {
        "1k2m3n": "High performance laptop for professionals",
        "4p5q6r": "Latest model smartphone with amazing camera"
    },
    "sourceLang": "en",
    "targetLang": "hi"
}'
```

**Response:**

```json
{
  "translations": {
    "1k2m3n": "पेशेवरों के लिए उच्च प्रदर्शन वाला लैपटॉप",
    "4p5q6r": "अद्भुत कैमरे के साथ नवीनतम मॉडल स्मार्टफोन"
  },
  "cached": true,
  "charCount": 82
}
```

---

## Error Handling

The adapter provides clear error messages:

### 401 - Invalid API Key

```
Error: Invalid API key. Get your key at https://usepolyglot.dev
```

### 429 - Rate Limit Exceeded

```
Error: Rate limit exceeded. Please upgrade your plan.
```

### 402 - Payment Required

```
Error: Payment required. Please check your billing at https://usepolyglot.dev
```

### Timeout

```
Error: Polyglot API request timeout after 60000ms
```

---

## Environment Variables

Store your API key securely in `.env`:

```env
VITE_POLYGLOT_API_KEY=your_api_key_here
```

Then use it in your app:

```tsx
const translator = createTranslator({
  sourceLang: "en",
  targetLang: "es",
  provider: "polyglot",
  apiKey: import.meta.env.VITE_POLYGLOT_API_KEY,
  textToTranslate: textsToTranslate,
  cache: {
    enabled: true,
    storage: "localStorage",
    ttl: 30 * 24 * 60 * 60 * 1000,
  },
});
```

---

## Complete Example

```tsx
import React from "react";
import {
  TranslateProvider,
  createTranslator,
  useTranslate,
  useTranslateDynamic,
} from "@polyglot/react";
import textsToTranslate from "./translations/texts.json";

// Create translator with Polyglot API
const translator = createTranslator({
  sourceLang: "en",
  targetLang: "es",
  provider: "polyglot",
  apiKey: import.meta.env.VITE_POLYGLOT_API_KEY,
  textToTranslate: textsToTranslate,
  cache: {
    enabled: true,
    storage: "localStorage",
    ttl: 30 * 24 * 60 * 60 * 1000,
  },
  fallbackToOriginal: true,
});

function AppContent() {
  const t = useTranslate();
  const translateDynamic = useTranslateDynamic();
  const [dynamicText, setDynamicText] = React.useState("");

  const handleTranslate = async () => {
    const translated = await translateDynamic("User entered text here");
    setDynamicText(translated);
  };

  return (
    <div>
      <h1>{t("Welcome to Our App!")}</h1>
      <p>{t("This is powered by Polyglot API")}</p>
      <button onClick={handleTranslate}>{t("Translate Dynamic Text")}</button>
      {dynamicText && <p>{dynamicText}</p>}
    </div>
  );
}

function App() {
  return (
    <TranslateProvider translator={translator}>
      <AppContent />
    </TranslateProvider>
  );
}

export default App;
```

---

## Pricing & Plans

Visit [usepolyglot.dev/pricing](https://usepolyglot.dev/pricing) for current pricing.

**Features:**

- ✅ Pay-as-you-go pricing
- ✅ Free tier for testing
- ✅ Usage dashboard
- ✅ Billing alerts
- ✅ Team collaboration
- ✅ Priority support

---

## TypeScript Support

Full TypeScript support included:

```tsx
import type { PolyglotAPIAdapterOptions } from "@polyglot/react";

const options: PolyglotAPIAdapterOptions = {
  apiKey: "your_key",
  baseUrl: "https://api.usepolyglot.dev",
  timeout: 30000,
};
```

---

## Support

- 📧 Email: support@usepolyglot.dev
- 🌐 Website: https://usepolyglot.dev
- 📚 Docs: https://docs.usepolyglot.dev
- 💬 Discord: https://discord.gg/polyglot

---

## Comparison with Other Providers

| Feature            | Polyglot API | Google          | AWS            | DeepL         |
| ------------------ | ------------ | --------------- | -------------- | ------------- |
| Setup Complexity   | ⭐ Simple    | ⭐⭐ Moderate   | ⭐⭐⭐ Complex | ⭐⭐ Moderate |
| Built-in Caching   | ✅ Yes       | ❌ No           | ❌ No          | ❌ No         |
| Dashboard          | ✅ Yes       | ⚠️ Google Cloud | ⚠️ AWS Console | ✅ Yes        |
| Billing Management | ✅ Simple    | ⚠️ Complex      | ⚠️ Complex     | ✅ Simple     |
| Free Tier          | ✅ Yes       | ✅ Yes          | ✅ Yes         | ✅ Yes        |

---

**Made with ❤️ by the Polyglot Team**
