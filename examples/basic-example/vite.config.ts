import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// Import the plugin from source; cast to `any` to avoid Vite type incompatibilities
// between different `vite` instances in the root and example workspace.
import { extractTranslatableText as _extractTranslatableText } from "../../src/plugin";
const extractTranslatableText: any = _extractTranslatableText;

export default defineConfig({
  plugins: [
    react(),
    extractTranslatableText({
      include: ["src/**/*.{jsx,tsx}"],
      output: "src/translations/texts.json",
      exclude: ["src/**/*.test.{jsx,tsx}"],
      verbose: true,
    }),
  ],
});
