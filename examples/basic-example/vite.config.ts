import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
// Import the plugin from source; cast to `any` to avoid Vite type incompatibilities
// between different `vite` instances in the root and example workspace.
import { extractTranslatableText as _extractTranslatableText } from "../../src/plugin";
import {
  AWSTranslateAdapter as _AWSTranslateAdapter,
  PolyglotAPIAdapter,
} from "../../src/adapters";
const extractTranslatableText: any = _extractTranslatableText;
const AWSTranslateAdapter: any = _AWSTranslateAdapter;

// For development only: Disable SSL verification to fix certificate errors
// DO NOT use this in production!
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      extractTranslatableText({
        include: ["src/components/TestAutoTransform-clean.tsx"],
        output: "src/translations/texts.json",
        exclude: ["src/**/*.test.{jsx,tsx}"],
        verbose: true,
        autoTransform: false, // Build-time transformation (source stays clean)
        autoWrapText: true, // Modify source files to wrap text with t() calls
        // Enable auto-translation - translates only new/changed texts
        autoTranslate: {
          enabled: true,
          adapter: new PolyglotAPIAdapter({
            apiKey: env.VITE_POLYGLOT_API_KEY,
            baseUrl: env.VITE_POLYGLOT_API_URL,
          }),
          sourceLang: "en",
          targetLangs: [
            "es",
            "fr",
            "de",
            "hi",
            "ja",
            "zh",
            "ru",
            "ur",
            "fr-CA",
          ], // Add your target languages
          // Store will be created at src/translations/.translation-store.json
        },
      }),
    ],
  };
});
