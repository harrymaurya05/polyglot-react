# Testing Auto-Translation in the Example

## Prerequisites

1. Get a Polyglot API key from [usepolyglot.dev](https://usepolyglot.dev)

2. Create `.env` file:

```bash
cp .env.example .env
```

3. Add your API key to `.env`:

```
VITE_POLYGLOT_API_KEY=your_actual_api_key
```

## Test Scenario 1: First Build (All New Texts)

1. Delete the translation store if it exists:

```bash
rm -f src/translations/.translation-store.json
rm -f src/translations/texts.json
```

2. Start the dev server:

```bash
npm run dev
```

3. Watch the console output:

```
📄 Found 7 files to scan
✅ Extracted 24 unique translatable texts
💾 Saved to src/translations/texts.json

🌍 Auto-Translation Service
📊 Change Detection:
  ✨ New texts: 24
  🔄 Changed texts: 0
  ✅ Unchanged texts: 0

🔄 Translating 24 texts...
  → Translating to es... ✅
  → Translating to fr... ✅
  → Translating to de... ✅
  → Translating to hi... ✅
  → Translating to ja... ✅

✅ Auto-translation completed!
```

4. Check generated files:

```bash
ls -la src/translations/
# Should see:
# - texts.json
# - .translation-store.json
```

## Test Scenario 2: Add New Text (Incremental)

1. Add a new component or text in an existing file:

```tsx
// src/App.tsx - add a new button
<button>{t("Cancel")}</button>
```

2. Save the file (triggers HMR)

3. Watch the console:

```
🔄 Hot reload: Re-extracting...
📄 Found 7 files to scan
✅ Extracted 25 unique translatable texts

🌍 Auto-Translation Service
📊 Change Detection:
  ✨ New texts: 1          ← Only "Cancel" is new!
  🔄 Changed texts: 0
  ✅ Unchanged texts: 24

🔄 Translating 1 text...
  → Translating to es... ✅
  (Only 5 API calls instead of 125!)
```

## Test Scenario 3: Change Existing Text

1. Modify existing text:

```tsx
// Change "Welcome to Our App!" to "Welcome to My App!"
<h2>{t("Welcome to My App!")}</h2>
```

2. Save and watch:

```
📊 Change Detection:
  ✨ New texts: 1
  🔄 Changed texts: 0
  ✅ Unchanged texts: 24
  🗑️  Deleted texts: 1

🔄 Translating 1 text...
```

## Test Scenario 4: No Changes

1. Stop and restart the dev server without code changes:

```bash
# Ctrl+C
npm run dev
```

2. Watch the console:

```
📊 Change Detection:
  ✨ New texts: 0
  🔄 Changed texts: 0
  ✅ Unchanged texts: 25

✅ All texts are up to date. No translation needed.
```

**No API calls made!** 🎉

## Verify Translations

1. Open browser at http://localhost:5173

2. Use the Language Switcher to test different languages

3. Check that all translations work correctly

## Inspect Translation Store

```bash
cat src/translations/.translation-store.json
```

You should see:

```json
{
  "version": "1.0.0",
  "metadata": {
    "hash123...": {
      "text": "Welcome to Our App!",
      "lastTranslated": 1737849600000,
      "translations": {
        "es": "¡Bienvenido a nuestra aplicación!",
        "fr": "Bienvenue dans notre application !",
        "de": "Willkommen in unserer App!",
        "hi": "हमारे ऐप में आपका स्वागत है!",
        "ja": "私たちのアプリへようこそ！"
      }
    }
  }
}
```

## Troubleshooting

### Error: Invalid API key

- Check your `.env` file has the correct key
- Make sure you're using `VITE_POLYGLOT_API_KEY` (not just `POLYGLOT_API_KEY`)
- Restart the dev server after adding the key

### No translations happening

- Check that `autoTranslate.enabled` is `true` in `vite.config.ts`
- Check console for errors
- Verify the API key is loaded: `console.log(process.env.VITE_POLYGLOT_API_KEY)`

### Translations not updating

- Delete `.translation-store.json` and rebuild
- Check that you saved the file to trigger HMR

## Cost Comparison

Without incremental translation:

- Initial: 24 texts × 5 languages = 120 API calls
- Add 1 text: 25 texts × 5 languages = **125 API calls**
- **Total: 245 API calls**

With incremental translation:

- Initial: 24 texts × 5 languages = 120 API calls
- Add 1 text: 1 text × 5 languages = **5 API calls**
- **Total: 125 API calls**

**Saved 120 API calls (49%)** on just one change! 💰

## Next Steps

- Try modifying different components
- Add more languages to `targetLangs`
- Test with different translation providers
- Commit `.translation-store.json` to share with team
