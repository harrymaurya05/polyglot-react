import { type ReactNode } from "react";
import { TranslateContext } from "../core/TranslateContext";
import type {
  Translator,
  TranslationParams,
  TranslateContextValue,
} from "../types";
import { processTranslation } from "../utils";

export interface MockTranslateProviderProps {
  translations: { [key: string]: string };
  children: ReactNode;
  currentLang?: string;
  isLoading?: boolean;
  error?: Error | null;
}

/**
 * Mock translation provider for testing
 * Usage:
 * <MockTranslateProvider translations={{ 'Welcome': 'स्वागत है' }}>
 *   <YourComponent />
 * </MockTranslateProvider>
 */
export function MockTranslateProvider({
  translations,
  children,
  currentLang = "en",
  isLoading = false,
  error = null,
}: MockTranslateProviderProps) {
  const mockTranslator: Translator = {
    translate: (text: string, params?: TranslationParams): string => {
      const translated = translations[text] || text;
      return processTranslation(translated, params);
    },
    translateDynamic: async (text: string): Promise<string> => {
      return translations[text] || text;
    },
    changeLanguage: async (_lang: string): Promise<void> => {
      // No-op in mock
    },
    getCurrentLanguage: (): string => currentLang,
    isReady: (): boolean => !isLoading && !error,
    getError: (): Error | null => error,
  };

  const contextValue: TranslateContextValue = {
    translator: mockTranslator,
    isLoading,
    error,
    changeLanguage: async (_lang: string) => {
      // No-op in mock
    },
    currentLang,
  };

  return (
    <TranslateContext.Provider value={contextValue}>
      {children}
    </TranslateContext.Provider>
  );
}

/**
 * Create a mock translator instance for testing
 */
export function createMockTranslator(
  translations: { [key: string]: string },
  options: {
    currentLang?: string;
    isReady?: boolean;
    error?: Error | null;
  } = {}
): Translator {
  const { currentLang = "en", isReady = true, error = null } = options;

  return {
    translate: (text: string, params?: TranslationParams): string => {
      const translated = translations[text] || text;
      return processTranslation(translated, params);
    },
    translateDynamic: async (text: string): Promise<string> => {
      return translations[text] || text;
    },
    changeLanguage: async (_lang: string): Promise<void> => {
      // No-op in mock
    },
    getCurrentLanguage: (): string => currentLang,
    isReady: (): boolean => isReady,
    getError: (): Error | null => error,
  };
}
