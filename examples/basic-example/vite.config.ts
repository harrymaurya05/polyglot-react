import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
// Import the plugin from source; cast to `any` to avoid Vite type incompatibilities
// between different `vite` instances in the root and example workspace.
import { extractTranslatableText as _extractTranslatableText } from "../../src/plugin";
import { PolyglotAPIAdapter as _PolyglotAPIAdapter } from "../../src/adapters";
const extractTranslatableText: any = _extractTranslatableText;
const PolyglotAPIAdapter: any = _PolyglotAPIAdapter;

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      extractTranslatableText({
        include: ["src/**/*.{jsx,tsx}"],
        output: "src/translations/texts.json",
        exclude: ["src/**/*.test.{jsx,tsx}"],
        verbose: true,

        // Enable auto-translation - translates only new/changed texts
        autoTranslate: {
          enabled: true,
          adapter: new PolyglotAPIAdapter({
            apiKey:
              env.VITE_POLYGLOT_API_KEY ||
              "sk_524d4566e8634fcb957040fe02d55498",
            baseUrl: env.VITE_POLYGLOT_API_URL || "http://localhost:8080",
            timeout: 60000,
          }),
          sourceLang: "en",
          targetLangs: ["es", "fr", "de", "hi", "ja", "zh", "ru", "ur", "en"], // Add your target languages
          // Store will be created at src/translations/.translation-store.json
        },
      }),
    ],
  };
});
