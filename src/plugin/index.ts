export { extractTranslatableText } from "./vitePlugin";
export { extractTextsFromCode, deduplicateTexts } from "./extractText";
export { autoTranslate, exportTranslations } from "./autoTranslate";
export { rewriteSourceFile } from "./rewriteSource";
export type { AutoTranslateConfig } from "./autoTranslate";
export type { ExtractOptions } from "./extractText";
export type {
  TranslationMetadata,
  TranslationStore,
} from "./translationTracker";
