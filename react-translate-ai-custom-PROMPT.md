# Prompt for Building react-translate-ai-custom Library

## Project Overview

Create a React library called `react-translate-ai-custom` that provides automatic AI-powered translation with intelligent caching and zero-maintenance workflow. The library should eliminate the need for developers to manually maintain translation JSON files.

## Core Concept

The library works in three phases:

1. **Build Time**: A Vite/Webpack plugin scans the codebase and automatically extracts all translatable text
2. **App Startup**: Makes a single batch API call to translate all extracted text and caches the results
3. **Runtime**: Serves translations instantly from cache with fallback to original text

## Key Features to Implement

### 1. Vite Plugin for Auto-Extraction

Create a Vite plugin (`extractTranslatableText`) that:

- Scans all `.jsx` and `.tsx` files during build
- Uses AST parsing (Babel or TypeScript compiler) to extract:
  - Text content inside JSX elements: `<h1>Welcome</h1>`
  - String values in specific JSX attributes: `placeholder`, `title`, `aria-label`
  - Optionally: string literals marked for translation
- Generates a JSON file (`texts.json`) with all unique translatable strings
- Supports configuration for include/exclude patterns, minimum text length, and regex filters

**Plugin Interface:**

```typescript
interface PluginConfig {
  include: string[]; // File patterns to scan
  exclude?: string[]; // File patterns to ignore
  output: string; // Output JSON file path
  patterns?: {
    jsxText: boolean;
    jsxAttribute: string[];
    stringLiterals: boolean;
  };
  minLength?: number;
  ignore?: RegExp[];
  verbose?: boolean;
}
```

### 2. Core Translation Library

**Main Components:**

#### `createTranslator(config)`

Factory function that:

- Accepts configuration (target language, API provider, cache settings)
- Reads the auto-generated `texts.json`
- Makes batch API call to translation service
- Caches translations in LocalStorage or IndexedDB
- Returns translator instance

**Configuration Interface:**

```typescript
interface TranslatorConfig {
  sourceLang: string; // Default: 'en'
  targetLang: string; // e.g., 'hi', 'es', 'fr'
  provider: "google" | "deepl" | "aws";
  apiKey: string;
  credentials?: AWSCredentials; // For AWS only
  textToTranslate: string[]; // From texts.json
  cache: {
    enabled: boolean;
    storage: "localStorage" | "indexedDB";
    ttl: number; // Time to live in milliseconds
  };
  fallbackToOriginal?: boolean;
}
```

#### `TranslateProvider` Component

React Context provider that:

- Wraps the entire app
- Provides translator instance to all child components
- Manages loading states during initial translation fetch
- Handles errors gracefully

#### `useTranslate()` Hook

Returns translation function:

```typescript
const t = useTranslate();
// Usage: t('Welcome') returns translated text from cache
```

Features:

- Look up translation in cache
- Support for variable interpolation: `t('Hello {{name}}', { name: 'John' })`
- Support for pluralization: `t('{{count}} item', { count: 5, plural: true })`
- Fallback to original text if translation not found

#### `useTranslator()` Hook

Returns translator control methods:

```typescript
const { changeLanguage, currentLang, isLoading, error } = useTranslator();
```

Features:

- `changeLanguage(lang)`: Fetches and caches new language translations
- `currentLang`: Current active language
- `isLoading`: Loading state during translation fetch
- `error`: Error state if translation fails

#### `useTranslateDynamic()` Hook

For translating dynamic content not extracted at build time:

```typescript
const translateDynamic = useTranslateDynamic();
const translated = await translateDynamic("User generated content");
```

### 3. Translation Provider Adapters

Create adapters for multiple translation APIs:

#### Google Translate Adapter

```typescript
class GoogleTranslateAdapter {
  async translateBatch(
    texts: string[],
    targetLang: string
  ): Promise<Translation[]>;
  // Uses Google Cloud Translation API v2
}
```

#### DeepL Adapter

```typescript
class DeepLAdapter {
  async translateBatch(
    texts: string[],
    targetLang: string
  ): Promise<Translation[]>;
  // Uses DeepL API
}
```

#### AWS Translate Adapter

```typescript
class AWSTranslateAdapter {
  async translateBatch(
    texts: string[],
    targetLang: string
  ): Promise<Translation[]>;
  // Uses AWS Translate service
}
```

**Common Interface:**

```typescript
interface TranslationAdapter {
  translateBatch(
    texts: string[],
    sourceLang: string,
    targetLang: string
  ): Promise<Translation[]>;
}

interface Translation {
  original: string;
  translated: string;
  lang: string;
}
```

### 4. Cache Management

Implement two storage strategies:

#### LocalStorage Cache

```typescript
class LocalStorageCache {
  set(key: string, value: any, ttl: number): void;
  get(key: string): any | null;
  has(key: string): boolean;
  clear(): void;
  isExpired(key: string): boolean;
}
```

#### IndexedDB Cache

```typescript
class IndexedDBCache {
  async set(key: string, value: any, ttl: number): Promise<void>;
  async get(key: string): Promise<any | null>;
  async has(key: string): Promise<boolean>;
  async clear(): Promise<void>;
  async isExpired(key: string): Promise<boolean>;
}
```

**Cache Key Structure:**

```
translate_cache_{targetLang}_{hash_of_texts}
```

### 5. Testing Utilities

Provide mocking utilities for testing:

```typescript
// MockTranslateProvider for tests
<MockTranslateProvider translations={{ Welcome: "स्वागत है" }}>
  <YourComponent />
</MockTranslateProvider>
```

## Technical Implementation Details

### AST Parsing for Text Extraction

Use `@babel/parser` and `@babel/traverse` to parse JSX:

```javascript
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

function extractTexts(code) {
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  const texts = new Set();

  traverse(ast, {
    JSXText(path) {
      const text = path.node.value.trim();
      if (text.length >= minLength) {
        texts.add(text);
      }
    },
    JSXAttribute(path) {
      if (targetAttributes.includes(path.node.name.name)) {
        if (path.node.value.type === "StringLiteral") {
          texts.add(path.node.value.value);
        }
      }
    },
  });

  return Array.from(texts);
}
```

### Batch Translation Optimization

To avoid API rate limits and reduce costs:

- Split large text arrays into chunks (e.g., 100 texts per batch)
- Make parallel API calls with Promise.all()
- Implement retry logic with exponential backoff
- Handle API errors gracefully

```javascript
async function translateInBatches(texts, adapter, batchSize = 100) {
  const batches = chunkArray(texts, batchSize);
  const results = await Promise.all(
    batches.map((batch) => adapter.translateBatch(batch))
  );
  return results.flat();
}
```

### Cache Invalidation Strategy

Cache should be invalidated when:

- TTL expires
- App version changes (check package.json version)
- Text content changes (compare hash of texts.json)

```javascript
function getCacheKey(targetLang, textsHash, appVersion) {
  return `translate_${targetLang}_${textsHash}_v${appVersion}`;
}
```

## Project Structure

```
react-translate-ai-custom/
├── src/
│   ├── core/
│   │   ├── createTranslator.ts
│   │   ├── TranslateProvider.tsx
│   │   └── TranslateContext.ts
│   ├── hooks/
│   │   ├── useTranslate.ts
│   │   ├── useTranslator.ts
│   │   └── useTranslateDynamic.ts
│   ├── adapters/
│   │   ├── GoogleTranslateAdapter.ts
│   │   ├── DeepLAdapter.ts
│   │   ├── AWSTranslateAdapter.ts
│   │   └── index.ts
│   ├── cache/
│   │   ├── LocalStorageCache.ts
│   │   ├── IndexedDBCache.ts
│   │   └── CacheManager.ts
│   ├── plugin/
│   │   ├── vitePlugin.ts
│   │   ├── extractText.ts
│   │   └── astParser.ts
│   ├── utils/
│   │   ├── interpolation.ts
│   │   ├── pluralization.ts
│   │   └── helpers.ts
│   ├── testing/
│   │   └── MockTranslateProvider.tsx
│   └── index.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Package Dependencies

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@babel/parser": "^7.23.0",
    "@babel/traverse": "^7.23.0",
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  }
}
```

## API Provider Requirements

### Google Translate API

- Endpoint: `https://translation.googleapis.com/language/translate/v2`
- Method: POST
- Body: `{ q: string[], target: string, source: string }`
- Auth: API Key in query param

### DeepL API

- Endpoint: `https://api-free.deepl.com/v2/translate`
- Method: POST
- Body: `{ text: string[], target_lang: string, source_lang: string }`
- Auth: API Key in header

### AWS Translate

- Use AWS SDK for JavaScript v3
- Service: `@aws-sdk/client-translate`
- Method: `TranslateTextCommand` (call in loop for batch)

## Performance Requirements

- Initial translation fetch: < 2 seconds for 100 texts
- Cache lookup: < 5ms
- Memory usage: < 5MB for cached translations
- Bundle size: < 50KB (minified + gzipped)

## Error Handling

Implement robust error handling:

- Network failures: Retry with exponential backoff
- API errors: Log error, use fallback text
- Cache errors: Fall back to API calls
- Invalid translations: Use original text

## Testing Requirements

Write tests for:

- Text extraction plugin (various JSX patterns)
- Translation adapters (mock API responses)
- Cache strategies (LocalStorage and IndexedDB)
- Hooks (useTranslate, useTranslator)
- Variable interpolation and pluralization
- Error scenarios

## Documentation Requirements

Generate:

- Full API documentation with TypeScript types
- Usage examples for common scenarios
- Migration guide from react-i18next
- Performance optimization guide
- Troubleshooting guide

## Success Criteria

The library should:

1. ✅ Automatically extract 95%+ of translatable text
2. ✅ Reduce API calls by 90% through caching
3. ✅ Support language switching in < 500ms
4. ✅ Work offline after initial load
5. ✅ Require zero manual translation file maintenance
6. ✅ Provide TypeScript types for all APIs
7. ✅ Be framework-agnostic (works with Vite, Webpack, etc.)
8. ✅ Handle 1000+ translatable strings efficiently

## Future Enhancements (Nice to Have)

- React Native support
- Server-side rendering (SSR) support
- Webpack plugin variant
- CLI tool for cache management
- Translation quality feedback mechanism
- Automatic language detection from browser
- Support for RTL languages
- Integration with translation management platforms (Lokalise, Crowdin)

---

**Use this prompt to generate a production-ready translation library that eliminates manual translation file maintenance while providing excellent performance and developer experience.**
