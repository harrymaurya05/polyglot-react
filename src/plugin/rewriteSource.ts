import * as fs from "fs";
import { parse } from "@babel/parser";
import generate from "@babel/generator";
import traverse from "@babel/traverse";
import * as t from "@babel/types";

// Handle both default and named exports
const traverseFn = (traverse as any).default || traverse;
const generateFn = (generate as any).default || generate;

/**
 * Rewrite a source file to add translation calls
 * This modifies the actual source file on disk
 */
export function rewriteSourceFile(
  filePath: string,
  minLength: number = 3,
  verbose: boolean = false,
): boolean {
  // Only process .tsx and .jsx files
  if (!filePath.match(/\.(tsx|jsx)$/)) {
    return false;
  }

  try {
    const code = fs.readFileSync(filePath, "utf-8");

    // Skip if already uses useTranslate
    if (code.includes("useTranslate")) {
      if (verbose) {
        console.log(`  ⏭️  Already transformed: ${filePath}`);
      }
      return false;
    }

    const ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx", "typescript", "decorators-legacy"],
    });

    let hasTranslatableText = false;
    let needsImport = false;
    let transformedCount = 0;

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
        console.log(`  ⏭️  No translatable text: ${filePath}`);
      }
      return false;
    }

    // Second pass: transform the code
    traverseFn(ast, {
      // Add useTranslate hook to top-level function components only
      Program(path: any) {
        // Find all top-level function declarations and arrow functions
        for (const statement of path.node.body) {
          if (
            statement.type === "FunctionDeclaration" &&
            isReactComponent(statement)
          ) {
            addUseTranslateHook({ node: statement });
            needsImport = true;
          } else if (statement.type === "VariableDeclaration") {
            for (const decl of statement.declarations) {
              if (
                decl.init &&
                (decl.init.type === "ArrowFunctionExpression" ||
                  decl.init.type === "FunctionExpression")
              ) {
                addUseTranslateHook({ node: decl.init });
                needsImport = true;
              }
            }
          } else if (statement.type === "ExportDefaultDeclaration") {
            if (
              statement.declaration.type === "FunctionDeclaration" ||
              statement.declaration.type === "ArrowFunctionExpression"
            ) {
              addUseTranslateHook({ node: statement.declaration });
              needsImport = true;
            }
          }
        }
      },
      // Transform JSX text nodes
      JSXText(path: any) {
        const text = path.node.value.trim();
        if (text.length >= minLength && !isIgnorableText(text)) {
          path.replaceWith(
            t.jsxExpressionContainer(
              t.callExpression(t.identifier("t"), [t.stringLiteral(text)]),
            ),
          );
          transformedCount++;
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
            transformedCount++;
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
    }

    // Generate the new code
    const output = generateFn(ast as any, {
      retainLines: false,
      compact: false,
    });

    // Write back to the source file
    fs.writeFileSync(filePath, output.code, "utf-8");

    if (verbose) {
      console.log(
        `  ✅ Rewrote source file: ${filePath} (${transformedCount} texts wrapped)`,
      );
    }

    return true;
  } catch (error) {
    if (verbose) {
      console.error(`  ❌ Error rewriting ${filePath}:`, error);
    }
    return false;
  }
}

function isIgnorableText(text: string): boolean {
  if (!text.trim()) return true;
  if (text.length < 3) return true;
  if (/^[^\w]+$/.test(text)) return true;
  return false;
}

function isReactComponent(node: any): boolean {
  if (!node.body) return false;
  if (node.id && node.id.name && /^[A-Z]/.test(node.id.name)) {
    return true;
  }
  return false;
}

function addUseTranslateHook(path: any) {
  const node = path.node;
  const body = node.body;

  if (!body || body.type !== "BlockStatement") return;

  // Check if function has 't' as a parameter
  const params = node.params || [];
  for (const param of params) {
    if (param.type === "Identifier" && param.name === "t") {
      return;
    }
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
    const useTranslateCall = t.variableDeclaration("const", [
      t.variableDeclarator(
        t.identifier("t"),
        t.callExpression(t.identifier("useTranslate"), []),
      ),
    ]);

    body.body.unshift(useTranslateCall);
  }
}
