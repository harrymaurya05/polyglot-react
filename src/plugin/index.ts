export { extractTranslatableText } from "./vitePlugin";
export { extractTextsFromCode, deduplicateTexts } from "./extractText";
export { autoTranslate, exportTranslations } from "./autoTranslate";
export { autoWrapTextInFile } from "./rewriteSource";
export type { AutoTranslateConfig } from "./autoTranslate";
export type { ExtractOptions } from "./extractText";
export type {
  TranslationMetadata,
  TranslationStore,
} from "./translationTracker";
