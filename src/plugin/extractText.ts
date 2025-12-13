import { parse } from "@babel/parser";
import type { JSXText, JSXAttribute, StringLiteral } from "@babel/types";
import type { ExtractedText } from "../types";

const DEFAULT_PATTERNS = {
  jsxText: true,
  jsxAttribute: ["placeholder", "title", "aria-label", "alt"],
  stringLiterals: false,
};

const DEFAULT_MIN_LENGTH = 2;

export interface ExtractOptions {
  minLength?: number;
  patterns?: {
    jsxText?: boolean;
    jsxAttribute?: string[];
    stringLiterals?: boolean;
  };
  ignore?: RegExp[];
  verbose?: boolean;
}

/**
 * Extract translatable text from source code using AST parsing
 */
export function extractTextsFromCode(
  code: string,
  filename: string,
  options: ExtractOptions = {}
): ExtractedText[] {
  const {
    minLength = DEFAULT_MIN_LENGTH,
    patterns = DEFAULT_PATTERNS,
    ignore = [],
    verbose = false,
  } = options;

  const mergedPatterns = { ...DEFAULT_PATTERNS, ...patterns };
  const extracted: ExtractedText[] = [];

  try {
    const ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript", "decorators-legacy"],
    });

    // Small recursive AST walker instead of @babel/traverse to avoid
    // module interop/runtime issues when the plugin is loaded inside
    // different package contexts (example vs root). The walker visits
    // all nodes and collects relevant text nodes.
    function simpleTraverse(node: any) {
      if (!node || typeof node !== "object") return;

      const type = node.type;
      if (type === "JSXText") {
        if (mergedPatterns.jsxText) {
          const text = (node as JSXText).value.trim();
          if (shouldExtract(text, minLength, ignore)) {
            extracted.push({
              text,
              file: filename,
              line: node.loc?.start.line || 0,
              type: "jsxText",
            });
          }
        }
      } else if (type === "JSXAttribute") {
        const nodeAttr = node as JSXAttribute;
        const attrName = (nodeAttr.name && (nodeAttr.name as any).name) || null;
        if (
          typeof attrName === "string" &&
          mergedPatterns.jsxAttribute.includes(attrName) &&
          nodeAttr.value &&
          nodeAttr.value.type === "StringLiteral"
        ) {
          const text = (nodeAttr.value as StringLiteral).value;
          if (shouldExtract(text, minLength, ignore)) {
            extracted.push({
              text,
              file: filename,
              line: nodeAttr.loc?.start.line || 0,
              type: "jsxAttribute",
            });
          }
        }
      } else if (type === "StringLiteral") {
        if (mergedPatterns.stringLiterals) {
          const text = (node as StringLiteral).value;
          if (shouldExtract(text, minLength, ignore)) {
            extracted.push({
              text,
              file: filename,
              line: node.loc?.start.line || 0,
              type: "stringLiteral",
            });
          }
        }
      }

      for (const key of Object.keys(node)) {
        const child = (node as any)[key];
        if (Array.isArray(child)) {
          for (const c of child) simpleTraverse(c);
        } else if (child && typeof child.type === "string") {
          simpleTraverse(child);
        }
      }
    }

    simpleTraverse((ast as any).program || ast);

    if (verbose && extracted.length > 0) {
      console.log(`✓ Extracted ${extracted.length} texts from ${filename}`);
    }
  } catch (error) {
    console.error(`Error parsing ${filename}:`, error);
  }

  return extracted;
}

/**
 * Check if text should be extracted based on criteria
 */
function shouldExtract(
  text: string,
  minLength: number,
  ignorePatterns: RegExp[]
): boolean {
  // Skip empty or too short text
  if (!text || text.length < minLength) return false;

  // Skip whitespace-only text
  if (!/\S/.test(text)) return false;

  // Skip text matching ignore patterns
  for (const pattern of ignorePatterns) {
    if (pattern.test(text)) return false;
  }

  // Skip common non-translatable patterns
  const commonIgnorePatterns = [
    /^[0-9]+$/, // Pure numbers
    /^[A-Z_]+$/, // Constants (e.g., API_KEY)
    /^https?:\/\//, // URLs
    /^\/[a-z\-_/]*$/, // Paths (e.g., /home, /api/users)
    /^[{].*[}]$/, // Template literals placeholders
    /^[\d\s\-+()]+$/, // Phone numbers
  ];

  for (const pattern of commonIgnorePatterns) {
    if (pattern.test(text)) return false;
  }

  return true;
}

/**
 * Deduplicate extracted texts
 */
export function deduplicateTexts(extracted: ExtractedText[]): string[] {
  const uniqueTexts = new Set<string>();

  for (const item of extracted) {
    uniqueTexts.add(item.text);
  }

  return Array.from(uniqueTexts).sort();
}
