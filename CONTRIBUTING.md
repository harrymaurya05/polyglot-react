# Contributing to i18nsolutions

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/i18nsolutions.git
cd i18nsolutions
```

2. **Install dependencies**

```bash
npm install
```

3. **Build the library**

```bash
npm run build
```

4. **Run tests**

```bash
npm test
```

## Project Structure

```
src/
├── core/               # Core translator implementation
│   ├── createTranslator.ts
│   ├── TranslateProvider.tsx
│   └── TranslateContext.ts
├── hooks/              # React hooks
│   ├── useTranslate.ts
│   ├── useTranslator.ts
│   └── useTranslateDynamic.ts
├── adapters/           # Translation provider adapters
│   ├── GoogleTranslateAdapter.ts
│   ├── DeepLAdapter.ts
│   └── AWSTranslateAdapter.ts
├── cache/              # Cache implementations
│   ├── LocalStorageCache.ts
│   ├── IndexedDBCache.ts
│   └── CacheManager.ts
├── plugin/             # Vite plugin
│   ├── vitePlugin.ts
│   ├── extractText.ts
│   └── astParser.ts
├── utils/              # Utility functions
│   ├── interpolation.ts
│   ├── pluralization.ts
│   └── helpers.ts
├── testing/            # Testing utilities
│   └── MockTranslateProvider.tsx
└── types/              # TypeScript types
    └── index.ts
```

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/i18nsolutions/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Code samples if applicable
   - Environment details (OS, Node version, etc.)

### Suggesting Enhancements

1. Open an issue with the "enhancement" label
2. Clearly describe:
   - The problem you're trying to solve
   - Your proposed solution
   - Any alternatives you've considered
   - Examples of how it would be used

### Pull Requests

1. **Fork the repository** and create a branch from `main`

2. **Make your changes**

   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed

3. **Commit your changes**

   - Use clear, descriptive commit messages
   - Follow conventional commits format:
     ```
     feat: add support for Azure Translator
     fix: handle API rate limiting correctly
     docs: update README with new examples
     test: add tests for cache invalidation
     ```

4. **Run tests and linting**

   ```bash
   npm test
   npm run lint
   npm run type-check
   ```

5. **Push to your fork** and submit a pull request

6. **Wait for review**
   - Address any feedback from maintainers
   - Make requested changes
   - Keep your branch up to date with main

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Provide proper type definitions
- Avoid `any` types when possible
- Use interfaces for public APIs

### React

- Use functional components and hooks
- Follow React best practices
- Memoize expensive computations
- Keep components focused and reusable

### Testing

- Write tests for all new features
- Aim for >80% code coverage
- Test both success and error cases
- Use descriptive test names

### Documentation

- Update README for user-facing changes
- Add JSDoc comments for public APIs
- Include examples for complex features
- Keep documentation up to date

## Adding New Translation Providers

To add support for a new translation service:

1. Create a new adapter in `src/adapters/`
2. Implement the `TranslationAdapter` interface
3. Add types to `src/types/index.ts`
4. Export from `src/adapters/index.ts`
5. Add documentation and examples
6. Write tests

Example:

```typescript
// src/adapters/AzureTranslateAdapter.ts
import type { TranslationAdapter, Translation } from "../types";

export class AzureTranslateAdapter implements TranslationAdapter {
  async translateBatch(
    texts: string[],
    sourceLang: string,
    targetLang: string
  ): Promise<Translation[]> {
    // Implementation
  }
}
```

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create a git tag: `git tag v1.x.x`
4. Push tag: `git push origin v1.x.x`
5. GitHub Actions will automatically publish to npm

## Questions?

- Open a [Discussion](https://github.com/yourusername/i18nsolutions/discussions)
- Join our [Discord](https://discord.gg/your-server)
- Email: support@i18nsolutions.com

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Code of Conduct

Please note that this project has a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to abide by its terms.
