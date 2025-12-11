import { useContext, useCallback } from "react";
import { TranslateContext } from "../core/TranslateContext";

/**
 * Hook for translating dynamic content not extracted at build time
 * Usage: const translateDynamic = useTranslateDynamic();
 *        const translated = await translateDynamic("User generated content");
 */
export function useTranslateDynamic() {
  const context = useContext(TranslateContext);

  if (!context) {
    throw new Error(
      "useTranslateDynamic must be used within a TranslateProvider"
    );
  }

  return useCallback(
    async (text: string): Promise<string> => {
      if (!context.translator) return text;
      return context.translator.translateDynamic(text);
    },
    [context.translator]
  );
}
