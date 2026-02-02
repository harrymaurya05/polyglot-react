# Auto-Wrap Text Feature

The `autoWrapText` feature is a powerful automation tool that eliminates the need to manually wrap translatable text with `t()` calls in your React components.

## 🎯 Overview

When enabled, the plugin automatically:

- Detects translatable text in your JSX/TSX files
- Wraps it with `t()` translation calls
- Adds necessary imports and hooks
- Modifies your source files directly

## 📋 Supported Text Patterns

### 1. JSX Text Content

Any text content inside JSX elements.

```jsx
// Before
<div>Hello World</div>
<h1>Welcome to our app</h1>
<p>This is a paragraph</p>

// After
<div>{t("Hello World")}</div>
<h1>{t("Welcome to our app")}</h1>
<p>{t("This is a paragraph")}</p>
```

### 2. JSX Attributes

The following attributes are automatically wrapped:

- `placeholder` - Form input placeholders
- `title` - Tooltip text
- `aria-label` - Accessibility labels
- `alt` - Image alt text
- `label` - Label text

```jsx
// Before
<input placeholder="Enter your name" />
<button title="Click to submit" />
<img src="logo.png" alt="Company logo" />
<span aria-label="Close dialog" />
<Field label="Email Address" />

// After
<input placeholder={t("Enter your name")} />
<button title={t("Click to submit")} />
<img src="logo.png" alt={t("Company logo")} />
<span aria-label={t("Close dialog")} />
<Field label={t("Email Address")} />
```

### 3. Object Properties

The following object property names are automatically wrapped:

- `message` - Messages in alerts, toasts, notifications
- `error` - Error messages
- `title` - Titles in configs, modals, sections
- `description` - Descriptions
- `label` - Labels in forms, fields
- `text` - General text content
- `name` - Display names

```jsx
// Before
showAlert({
  message: "Operation completed successfully",
  type: "success",
});

const formConfig = {
  title: "User Settings",
  description: "Manage your account preferences",
  fields: [{ name: "username", label: "Username" }],
};

throw new Error({
  error: "Invalid credentials",
});

// After
showAlert({
  message: t("Operation completed successfully"),
  type: "success",
});

const formConfig = {
  title: t("User Settings"),
  description: t("Manage your account preferences"),
  fields: [{ name: t("username"), label: t("Username") }],
};

throw new Error({
  error: t("Invalid credentials"),
});
```

## ⚙️ Configuration

### Basic Setup

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { extractTranslatableText } from "i18nsolutions/plugin";

export default defineConfig({
  plugins: [
    react(),
    extractTranslatableText({
      include: ["src/**/*.{jsx,tsx}"],
      output: "src/translations/texts.json",
      autoWrapText: true, // Enable the feature
      minLength: 3, // Minimum text length (default: 3)
      verbose: true, // Show detailed logs
    }),
  ],
});
```

### Configuration Options

```typescript
{
  autoWrapText?: boolean;    // Enable/disable auto-wrapping (default: false)
  minLength?: number;        // Min characters to wrap (default: 3)
  verbose?: boolean;         // Show processing logs (default: false)
  include: string[];         // File patterns to process
  exclude?: string[];        // File patterns to skip
}
```

## 🧠 Smart Features

### 1. Duplicate Prevention

The plugin checks if `useTranslate` is already imported before adding it.

```jsx
// If your file already has:
import { useTranslate } from "i18nsolutions";

// It won't add another import
// ✅ Smart detection prevents duplicates
```

### 2. Hook Detection

Checks if the component already has `const t = useTranslate()` before adding it.

```jsx
function MyComponent() {
  const t = useTranslate(); // Already exists

  // Plugin won't add another one
  return <div>{t("Hello")}</div>;
}
```

### 3. Skip Already Wrapped Text

Won't re-wrap text that's already inside `t()` calls.

```jsx
// Already wrapped - plugin skips it
<div>{t("Already wrapped")}</div>

// Not wrapped - plugin wraps it
<div>Needs wrapping</div>  →  <div>{t("Needs wrapping")}</div>
```

### 4. Works with Existing Code

Processes files even if they already use `useTranslate` - useful for wrapping newly added text.

```jsx
// File already imports useTranslate
import { useTranslate } from "i18nsolutions";

function MyComponent() {
  const t = useTranslate();

  return (
    <div>
      {t("Existing wrapped text")}
      New text added later {/* ← Plugin will wrap this */}
    </div>
  );
}
```

### 5. Minimum Length Filter

Only wraps text longer than `minLength` (default: 3 characters).

```jsx
// minLength: 3

<div>Hi</div>        // ❌ Too short (2 chars) - not wrapped
<div>Hey</div>       // ✅ 3 chars - wrapped
<div>Hello</div>     // ✅ 5 chars - wrapped
```

## 🚀 Usage Workflow

### First-Time Setup

1. **Commit your code** (important - so you can review changes)

```bash
git add .
git commit -m "Before autoWrapText"
```

2. **Enable autoWrapText**

```typescript
extractTranslatableText({
  include: ["src/**/*.{jsx,tsx}"],
  output: "src/translations/texts.json",
  autoWrapText: true,
  verbose: true,
});
```

3. **Run build**

```bash
npm run build
```

4. **Review changes**

```bash
git diff
```

5. **Commit wrapped code**

```bash
git add .
git commit -m "Auto-wrapped translatable text"
```

### Ongoing Development

You have two options:

**Option A: Keep autoWrapText enabled**

- Automatically wraps new text as you add it
- Re-run `npm run build` periodically to wrap new content

**Option B: Disable and wrap manually**

- Set `autoWrapText: false`
- Manually wrap new text with `t()` calls as needed
- More control, but requires manual work

## 📊 Build Output

When `verbose: true`, you'll see detailed logs:

```bash
🌍 React Translate AI - Text Extraction Plugin
📁 Scanning patterns: [ 'src/**/*.{jsx,tsx}' ]

📄 Found 47 files to scan
✅ Extracted 156 unique translatable texts
💾 Saved to src/translations/texts.json

✍️  Auto-wrapping text in source files...
  ✅ src/components/Header.tsx (8 texts wrapped)
  ✅ src/components/Footer.tsx (5 texts wrapped)
  ⏭️  src/components/Auth.tsx - no translatable text
  ✅ src/pages/Home.tsx (12 texts wrapped)
✅ Auto-wrapped text in 32 source files
```

## ⚠️ Important Notes

### Source Files Are Modified

This feature **modifies your actual source files** on disk. Always:

- ✅ Commit before first run
- ✅ Review changes with `git diff`
- ✅ Test thoroughly after wrapping
- ✅ Have a backup or version control

### Not Reversible Automatically

Once text is wrapped, you can't automatically unwrap it. To undo:

- Use `git reset --hard` before committing
- Or manually remove `t()` calls

### Build vs Dev Mode

Auto-wrapping happens during the **build process**, not dev mode:

```bash
npm run build    # ✅ Wraps text
npm run dev      # ❌ Doesn't wrap (but shows already wrapped text)
```

### TypeScript/ESLint Errors

After wrapping, you might see:

- Missing import errors → Plugin adds them automatically
- Unused variable warnings → If component doesn't use `t` yet

Run build again to fix: `npm run build`

## 🎯 Best Practices

### 1. Start Fresh

Begin with a clean git state so you can review all changes.

### 2. Test Incrementally

Enable autoWrapText on a small directory first:

```typescript
include: ["src/components/Auth/**/*.{jsx,tsx}"]; // Start small
```

### 3. Use Verbose Mode Initially

Set `verbose: true` to understand what's being processed.

### 4. Review Before Committing

Always review wrapped changes:

```bash
git diff src/
```

### 5. Exclude Test Files

Don't wrap test files:

```typescript
exclude: ["**/*.test.{jsx,tsx}", "**/*.spec.{jsx,tsx}"];
```

### 6. Consider Minimum Length

Adjust `minLength` based on your needs:

```typescript
minLength: 5; // Skip very short text (buttons like "OK", "No")
```

## 🐛 Troubleshooting

### Issue: "Nothing gets wrapped"

**Causes:**

- `autoWrapText: false` (not enabled)
- Text doesn't meet `minLength` requirement
- Files don't match `include` patterns
- Text is already wrapped

**Solution:**

- Verify `autoWrapText: true`
- Check `verbose: true` logs
- Ensure file paths match `include` patterns

### Issue: "Duplicate imports added"

**Cause:** Plugin bug (should be fixed in v1.0.13+)

**Solution:**

- Update to latest: `npm install i18nsolutions@latest`
- Manually remove duplicate imports

### Issue: "TypeScript errors after wrapping"

**Cause:** Import not added or hook not declared

**Solution:**

- Run build again: `npm run build`
- Manually add import if needed:
  ```typescript
  import { useTranslate } from "i18nsolutions";
  ```

### Issue: "Text wrapped incorrectly"

**Cause:** Edge case in detection logic

**Solution:**

- Manually fix the specific case
- Report issue on GitHub

## 📚 Examples

### Example 1: Simple Component

**Before:**

```jsx
function Welcome() {
  return (
    <div>
      <h1>Welcome</h1>
      <p>Thanks for joining us</p>
    </div>
  );
}
```

**After:**

```jsx
import { useTranslate } from "i18nsolutions";

function Welcome() {
  const t = useTranslate();
  return (
    <div>
      <h1>{t("Welcome")}</h1>
      <p>{t("Thanks for joining us")}</p>
    </div>
  );
}
```

### Example 2: Form with Attributes

**Before:**

```jsx
function LoginForm() {
  return (
    <form>
      <input placeholder="Email" />
      <input placeholder="Password" type="password" />
      <button title="Submit form">Login</button>
    </form>
  );
}
```

**After:**

```jsx
import { useTranslate } from "i18nsolutions";

function LoginForm() {
  const t = useTranslate();
  return (
    <form>
      <input placeholder={t("Email")} />
      <input placeholder={t("Password")} type="password" />
      <button title={t("Submit form")}>{t("Login")}</button>
    </form>
  );
}
```

### Example 3: Alert with Object Properties

**Before:**

```jsx
function handleError() {
  showAlert({
    message: "Something went wrong",
    type: "error",
  });
}
```

**After:**

```jsx
import { useTranslate } from "i18nsolutions";

function handleError() {
  const t = useTranslate();
  showAlert({
    message: t("Something went wrong"),
    type: "error",
  });
}
```

## 🔗 Related Documentation

- [Main README](./README.md) - Full library documentation
- [Integration Guide](./INTEGRATION-GUIDE.md) - Step-by-step setup
- [API Reference](./API-REFERENCE.md) - Complete API docs

## 💬 Support

Need help?

- GitHub Issues: Report bugs or request features
- Stack Overflow: Tag your question with `i18nsolutions`

---

**Auto-wrap your way to multilingual apps! 🌍**
