import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { extractTranslatableText } from "react-translate-ai-custom/plugin";

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
