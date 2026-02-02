import { parse } from "@babel/parser";
import generate from "@babel/generator";
import traverse from "@babel/traverse";
import * as t from "@babel/types";

// Handle both default and named exports
const traverseFn = (traverse as any).default || traverse;
const generateFn = (generate as any).default || generate;

/**
 * Transform JSX code to automatically wrap translatable text with useTranslate hook
 */
export function transformCodeForTranslation(
  code: string,
  id: string,
  minLength: number = 3,
  verbose: boolean = false,
): string | null {
  // Only transform .tsx and .jsx files
  if (!id.match(/\.(tsx|jsx)$/)) {
    return null;
  }

  // Skip if file already imports useTranslate (already manually handled)
  if (code.includes("useTranslate")) {
    if (verbose) {
      console.log(`  ⏭️  Skipping ${id} - already uses useTranslate`);
    }
    return null;
  }

  if (verbose) {
    console.log(`  🔄 Transforming ${id}...`);
  }

  try {
    const ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript", "decorators-legacy"],
    });

    let hasTranslatableText = false;
    let needsImport = false;

    // First pass: check if there's any translatable text
    traverseFn(ast, {
      JSXText(path: any) {
        const text = path.node.value.trim();
        if (text.length >= minLength && !isIgnorableText(text)) {
          hasTranslatableText = true;
        }
      },
      JSXAttribute(path: any) {
        if (
          path.node.name.type === "JSXIdentifier" &&
          ["placeholder", "title", "aria-label", "alt"].includes(
            path.node.name.name,
          )
        ) {
          if (
            path.node.value &&
            path.node.value.type === "StringLiteral" &&
            path.node.value.value.length >= minLength
          ) {
            hasTranslatableText = true;
          }
        }
      },
    });

    if (!hasTranslatableText) {
      if (verbose) {
        console.log(`  ⏭️  Skipping ${id} - no translatable text found`);
      }
      return null;
    }

    if (verbose) {
      console.log(`  ✅ Found translatable text in ${id}`);
    }

    // Second pass: transform the code
    traverseFn(ast, {
      // Add useTranslate hook to function components
      FunctionDeclaration(path: any) {
        if (isReactComponent(path.node)) {
          addUseTranslateHook(path);
          needsImport = true;
        }
      },
      ArrowFunctionExpression(path: any) {
        // Check if it's exported as a component
        const parent = path.parent;
        if (
          parent &&
          (parent.type === "VariableDeclarator" ||
            parent.type === "ExportDefaultDeclaration")
        ) {
          addUseTranslateHook(path);
          needsImport = true;
        }
      },
      // Transform JSX text nodes
      JSXText(path: any) {
        const text = path.node.value.trim();
        if (text.length >= minLength && !isIgnorableText(text)) {
          // Replace with {t("text")}
          path.replaceWith(
            t.jsxExpressionContainer(
              t.callExpression(t.identifier("t"), [t.stringLiteral(text)]),
            ),
          );
        }
      },
      // Transform JSX attributes
      JSXAttribute(path: any) {
        if (
          path.node.name.type === "JSXIdentifier" &&
          ["placeholder", "title", "aria-label", "alt"].includes(
            path.node.name.name,
          )
        ) {
          if (
            path.node.value &&
            path.node.value.type === "StringLiteral" &&
            path.node.value.value.length >= minLength
          ) {
            const text = path.node.value.value;
            path.node.value = t.jsxExpressionContainer(
              t.callExpression(t.identifier("t"), [t.stringLiteral(text)]),
            );
          }
        }
      },
    });

    // Add import statement if needed
    if (needsImport) {
      const importDeclaration = t.importDeclaration(
        [
          t.importSpecifier(
            t.identifier("useTranslate"),
            t.identifier("useTranslate"),
          ),
        ],
        t.stringLiteral("i18nsolutions"),
      );
      ast.program.body.unshift(importDeclaration);

      if (verbose) {
        console.log(`  ✨ Added useTranslate hook and import to ${id}`);
      }
    }

    const output = generateFn(ast as any, {
      retainLines: true,
      compact: false,
    });

    if (verbose) {
      console.log(`  ✅ Transformed ${id} successfully`);
    }

    return output.code;
  } catch (error) {
    console.error(`Error transforming ${id}:`, error);
    return null;
  }
}

function isIgnorableText(text: string): boolean {
  // Ignore whitespace-only text
  if (!text.trim()) return true;

  // Ignore very short text
  if (text.length < 3) return true;

  // Ignore text that's just punctuation
  if (/^[^\w]+$/.test(text)) return true;

  return false;
}

function isReactComponent(node: any): boolean {
  // Check if function returns JSX
  if (!node.body) return false;

  // Simple heuristic: component names start with uppercase
  if (node.id && node.id.name && /^[A-Z]/.test(node.id.name)) {
    return true;
  }

  return false;
}

function addUseTranslateHook(path: any) {
  const body = path.node.body;

  if (!body || body.type !== "BlockStatement") return;

  // Check if function has 't' as a parameter
  const params = path.node.params || [];
  for (const param of params) {
    // Check for direct identifier 't'
    if (param.type === "Identifier" && param.name === "t") {
      return; // Don't add hook if 't' is already a parameter
    }
    // Check for destructured 't' in object pattern (e.g., { t })
    if (param.type === "ObjectPattern") {
      for (const prop of param.properties) {
        if (
          prop.type === "ObjectProperty" &&
          prop.key.type === "Identifier" &&
          prop.key.name === "t"
        ) {
          return;
        }
      }
    }
  }

  // Check if useTranslate is already called
  let hasUseTranslate = false;
  for (const stmt of body.body) {
    if (
      stmt.type === "VariableDeclaration" &&
      stmt.declarations.some(
        (decl: any) =>
          decl.init &&
          decl.init.type === "CallExpression" &&
          decl.init.callee.name === "useTranslate",
      )
    ) {
      hasUseTranslate = true;
      break;
    }
  }

  if (!hasUseTranslate) {
    // Add: const t = useTranslate();
    const useTranslateCall = t.variableDeclaration("const", [
      t.variableDeclarator(
        t.identifier("t"),
        t.callExpression(t.identifier("useTranslate"), []),
      ),
    ]);

    body.body.unshift(useTranslateCall);
  }
}
