import * as fs from "fs";
import * as path from "path";
import type { Plugin } from "vite";
import { extractTextsFromCode } from "./extractText";
import type { PluginConfig } from "../types";

const DEFAULT_CONFIG: Partial<PluginConfig> = {
  exclude: ["**/node_modules/**", "**/*.test.{jsx,tsx}", "**/*.spec.{jsx,tsx}"],
  patterns: {
    jsxText: true,
    jsxAttribute: ["placeholder", "title", "aria-label", "alt", "label"],
    stringLiterals: false,
  },
  minLength: 2,
  ignore: [],
  verbose: false,
};

/**
 * Vite plugin to extract translatable text from JSX/TSX files
 */
export function extractTranslatableText(config: PluginConfig): Plugin {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  let extractedTexts: string[] = [];

  // Shared extraction logic
  const performExtraction = async () => {
    extractedTexts = [];
    const allExtracted: string[] = [];

    // Get all files matching include patterns
    const files = await getMatchingFiles(
      mergedConfig.include!,
      mergedConfig.exclude || []
    );

    if (mergedConfig.verbose) {
      console.log(`📄 Found ${files.length} files to scan`);
    }

    // Extract texts from each file
    for (const file of files) {
      try {
        const code = fs.readFileSync(file, "utf-8");
        const extracted = extractTextsFromCode(code, file, {
          minLength: mergedConfig.minLength,
          patterns: mergedConfig.patterns,
          ignore: mergedConfig.ignore,
          verbose: mergedConfig.verbose,
        });

        allExtracted.push(...extracted.map((e) => e.text));
      } catch (error) {
        console.error(`❌ Error reading ${file}:`, error);
      }
    }

    // Deduplicate and sort
    extractedTexts = Array.from(new Set(allExtracted)).sort();

    if (mergedConfig.verbose) {
      console.log(
        `✅ Extracted ${extractedTexts.length} unique translatable texts`
      );
    }

    // Write to output file
    const outputPath = path.resolve(process.cwd(), mergedConfig.output!);
    const outputDir = path.dirname(outputPath);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
      outputPath,
      JSON.stringify(extractedTexts, null, 2),
      "utf-8"
    );

    if (mergedConfig.verbose) {
      console.log(`💾 Saved to ${outputPath}\n`);
    }
  };

  return {
    name: "extract-translatable-text",

    enforce: "pre",

    configResolved(_resolvedConfig) {
      if (mergedConfig.verbose) {
        console.log("\n🌍 React Translate AI - Text Extraction Plugin");
        console.log("📁 Scanning patterns:", mergedConfig.include);
      }
    },

    async buildStart() {
      await performExtraction();
    },

    // Also extract during development for HMR
    handleHotUpdate({ file }) {
      if (
        isMatchingFile(file, mergedConfig.include!, mergedConfig.exclude || [])
      ) {
        if (mergedConfig.verbose) {
          console.log(`🔄 Hot reload: Re-extracting from ${file}`);
        }
        // Re-run extraction in background
        performExtraction().catch((error) => {
          console.error("Error during hot reload extraction:", error);
        });
      }
    },
  };
}

/**
 * Get all files matching glob patterns
 */
async function getMatchingFiles(
  include: string[],
  exclude: string[]
): Promise<string[]> {
  const glob = await import("fast-glob");

  return glob.default(include, {
    ignore: exclude,
    absolute: true,
  });
}

/**
 * Check if file matches include/exclude patterns
 */
function isMatchingFile(
  file: string,
  include: string[],
  exclude: string[]
): boolean {
  const minimatch = require("minimatch");

  // Check if file matches any include pattern
  const included = include.some((pattern) =>
    minimatch(file, pattern, { matchBase: true })
  );

  if (!included) return false;

  // Check if file matches any exclude pattern
  const excluded = exclude.some((pattern) =>
    minimatch(file, pattern, { matchBase: true })
  );

  return !excluded;
}
