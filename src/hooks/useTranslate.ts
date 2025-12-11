import { useContext } from "react";
import type { TranslationParams } from "../types";
import { TranslateContext } from "../core/TranslateContext";

/**
 * Hook to get the translate function
 * Usage: const t = useTranslate();
 */
export function useTranslate() {
  const context = useContext(TranslateContext);

  if (!context) {
    throw new Error("useTranslate must be used within a TranslateProvider");
  }

  return (text: string, params?: TranslationParams): string => {
    return context.translator?.translate(text, params) || text;
  };
}
