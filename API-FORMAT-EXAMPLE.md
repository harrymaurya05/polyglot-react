# API Format (Polyglot / Custom Backends)

## Request Format

### Static Translations (from JSON file)

When translating static texts from your `texts.json` file, the library sends them as key-value pairs where key = value (this is compatible with the Polyglot API and similar custom backends):

```json
POST /api/translate
{
  "texts": {
    "Hello": "Hello",
    "Goodbye": "Goodbye",
    "Thank you": "Thank you"
  },
  "sourceLang": "en",
  "targetLang": "es"
}
```

### Dynamic Translations (from database/runtime)

When translating dynamic content (using `translateDynamic()`), the library sends **hash-text pairs** to handle long texts efficiently:

```json
POST /api/translate
{
  "texts": {
    "1k2m3n": "High performance laptop for professionals with extended battery life and powerful GPU",
    "4p5q6r": "Latest model smartphone with amazing camera capabilities and 5G support",
    "7s8t9u": "Noise cancelling wireless headphones with premium sound quality"
  },
  "sourceLang": "en",
  "targetLang": "hi"
}
```

**Key benefits:**

- Hash keys (like `1k2m3n`) are short and efficient for caching
- Your API can use the hash as the cache key in Redis/database
- The actual text is still sent so translation is accurate

## Response Format

Your API should return translations with the **same keys** that were sent:

### For Static Translations

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

### For Dynamic Translations (with hash keys)

```json
{
  "translations": {
    "1k2m3n": "पेशेवरों के लिए विस्तारित बैटरी जीवन और शक्तिशाली GPU के साथ उच्च प्रदर्शन वाला लैपटॉप",
    "4p5q6r": "अद्भुत कैमरा क्षमताओं और 5G समर्थन के साथ नवीनतम मॉडल स्मार्टफोन",
    "7s8t9u": "प्रीमियम ध्वनि गुणवत्ता के साथ शोर रद्द करने वाला वायरलेस हेडफ़ोन"
  },
  "cached": true,
  "charCount": 238
}
```

## Backend Caching Strategy

```java
@PostMapping("/api/translate")
public ResponseEntity<?> translate(@RequestBody TranslateRequest request) {
    Map<String, String> translations = new HashMap<>();
    boolean allCached = true;
    int charCount = 0;

    for (Map.Entry<String, String> entry : request.getTexts().entrySet()) {
        String hashKey = entry.getKey();
        String textToTranslate = entry.getValue();

        // Use hash as cache key in Redis
        String cacheKey = String.format("translate:%s:%s:%s",
            request.getTargetLang(),
            request.getSourceLang(),
            hashKey  // Short hash instead of long text
        );

        // Check cache
        String cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            translations.put(hashKey, cached);
        } else {
            // Translate using AWS/Google/DeepL
            String translated = translationService.translate(
                textToTranslate,
                request.getSourceLang(),
                request.getTargetLang()
            );

            // Cache with hash key (efficient!)
            redisTemplate.opsForValue().set(cacheKey, translated, 30, TimeUnit.DAYS);
            translations.put(hashKey, translated);
            allCached = false;
            charCount += textToTranslate.length();
        }
    }

    return ResponseEntity.ok(new TranslateResponse(translations, allCached, charCount));
}
```

## Why Hash Keys?

1. **Efficient Caching**: `translate:hi:en:1k2m3n` is much shorter than `translate:hi:en:High performance laptop for professionals...`
2. **Database Friendly**: Hash keys work better as database/Redis keys
3. **No Length Limits**: Long product descriptions don't cause cache key size issues
4. **Consistent**: Same text always generates same hash = reliable caching
