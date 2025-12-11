import { useContext } from "react";
import { TranslateContext } from "../core/TranslateContext";

/**
 * Hook to access translator instance and control methods
 * Usage: const { changeLanguage, currentLang, isLoading, error } = useTranslator();
 */
export function useTranslator() {
  const context = useContext(TranslateContext);

  if (!context) {
    throw new Error("useTranslator must be used within a TranslateProvider");
  }

  return {
    changeLanguage: context.changeLanguage,
    currentLang: context.currentLang,
    isLoading: context.isLoading,
    error: context.error,
    isReady: context.translator?.isReady() || false,
  };
}
