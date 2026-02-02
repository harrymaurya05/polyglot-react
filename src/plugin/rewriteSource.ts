import * as fs from "fs";
import { parse } from "@babel/parser";
import generate from "@babel/generator";
import traverse from "@babel/traverse";
import * as t from "@babel/types";

// Handle both default and named exports
const traverseFn = (traverse as any).default || traverse;
const generateFn = (generate as any).default || generate;

/**
 * Auto-wrap text in a source file with translation calls
 * This modifies the actual source file on disk
 */
export function autoWrapTextInFile(
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
          ["placeholder", "title", "aria-label", "alt", "label"].includes(
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
      ObjectProperty(path: any) {
        // Check for translatable strings in object properties like message, error, title, etc.
        if (
          path.node.key.type === "Identifier" &&
          [
            "message",
            "error",
            "title",
            "description",
            "label",
            "text",
            "name",
          ].includes(path.node.key.name)
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
      // Add useTranslate hook to all function components
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
              if (decl.init) {
                // Handle direct arrow/function expressions
                if (
                  decl.init.type === "ArrowFunctionExpression" ||
                  decl.init.type === "FunctionExpression"
                ) {
                  addUseTranslateHook({ node: decl.init });
                  needsImport = true;
                }
                // Handle React.memo() wrapped components
                else if (
                  decl.init.type === "CallExpression" &&
                  decl.init.callee.type === "MemberExpression" &&
                  decl.init.callee.object.name === "React" &&
                  decl.init.callee.property.name === "memo" &&
                  decl.init.arguments.length > 0
                ) {
                  const wrappedComponent = decl.init.arguments[0];
                  if (
                    wrappedComponent.type === "ArrowFunctionExpression" ||
                    wrappedComponent.type === "FunctionExpression"
                  ) {
                    addUseTranslateHook({ node: wrappedComponent });
                    needsImport = true;
                  }
                }
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
            // Handle export default React.memo()
            else if (
              statement.declaration.type === "CallExpression" &&
              statement.declaration.callee.type === "MemberExpression" &&
              statement.declaration.callee.object.name === "React" &&
              statement.declaration.callee.property.name === "memo" &&
              statement.declaration.arguments.length > 0
            ) {
              const wrappedComponent = statement.declaration.arguments[0];
              if (
                wrappedComponent.type === "ArrowFunctionExpression" ||
                wrappedComponent.type === "FunctionExpression"
              ) {
                addUseTranslateHook({ node: wrappedComponent });
                needsImport = true;
              }
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
          ["placeholder", "title", "aria-label", "alt", "label"].includes(
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
      // Transform object properties
      ObjectProperty(path: any) {
        if (
          path.node.key.type === "Identifier" &&
          [
            "message",
            "error",
            "title",
            "description",
            "label",
            "text",
            "name",
          ].includes(path.node.key.name)
        ) {
          if (
            path.node.value &&
            path.node.value.type === "StringLiteral" &&
            path.node.value.value.length >= minLength
          ) {
            const text = path.node.value.value;
            path.node.value = t.callExpression(t.identifier("t"), [
              t.stringLiteral(text),
            ]);
            transformedCount++;
          }
        }
      },
    });

    // Add import statement if needed (check if it already exists)
    if (needsImport) {
      const hasUseTranslateImport = ast.program.body.some(
        (node: any) =>
          node.type === "ImportDeclaration" &&
          node.source.value === "i18nsolutions" &&
          node.specifiers.some(
            (spec: any) =>
              spec.type === "ImportSpecifier" &&
              spec.imported.name === "useTranslate",
          ),
      );

      if (!hasUseTranslateImport) {
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
  if (!node) return;

  let body = node.body;

  // Handle arrow functions with implicit return: () => (...)
  if (body && body.type !== "BlockStatement") {
    try {
      // Convert implicit return to explicit block statement
      const returnStatement = t.returnStatement(body);
      const blockBody = t.blockStatement([returnStatement]);
      node.body = blockBody;
      body = blockBody;
    } catch (error) {
      // If we can't modify the node, skip it
      return;
    }
  }

  if (!body || body.type !== "BlockStatement") return;
  if (!body.body || !Array.isArray(body.body)) return;

  // Check if function has 't' as a parameter
  const params = node.params || [];
  for (const param of params) {
    if (!param) continue;
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
