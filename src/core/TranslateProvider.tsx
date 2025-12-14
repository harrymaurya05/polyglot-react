import { useState, useEffect, type ReactNode } from "react";
import { TranslateContext } from "./TranslateContext";
import type { Translator, TranslateContextValue } from "../types";
import { DefaultLoadingComponent } from "../components/DefaultLoadingComponent";

export interface TranslateProviderProps {
  translator: Translator;
  children: ReactNode;
  loadingComponent?: ReactNode;
  errorComponent?: (error: Error) => ReactNode;
}

/**
 * Translation provider component
 * Wraps the app and provides translation context
 */
export function TranslateProvider({
  translator,
  children,
  loadingComponent,
  errorComponent,
}: TranslateProviderProps) {
  const [isLoading, setIsLoading] = useState(!translator.isReady());
  const [error, setError] = useState<Error | null>(translator.getError());
  const [currentLang, setCurrentLang] = useState(
    translator.getCurrentLanguage()
  );

  useEffect(() => {
    // Wait for translator to be ready
    const checkReady = setInterval(() => {
      if (translator.isReady()) {
        setIsLoading(false);
        setError(null);
        clearInterval(checkReady);
      } else if (translator.getError()) {
        setError(translator.getError());
        setIsLoading(false);
        clearInterval(checkReady);
      }
    }, 100);

    return () => clearInterval(checkReady);
  }, [translator]);

  const handleChangeLanguage = async (lang: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await translator.changeLanguage(lang);
      setCurrentLang(lang);
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  };

  const contextValue: TranslateContextValue = {
    translator,
    isLoading,
    error,
    changeLanguage: handleChangeLanguage,
    currentLang,
  };

  // Show loading component while initializing
  if (isLoading) {
    return <>{loadingComponent || <DefaultLoadingComponent />}</>;
  }

  // Show error component if initialization failed
  if (error && errorComponent) {
    return <>{errorComponent(error)}</>;
  }

  // Show default error if no custom error component
  if (error) {
    return <div>Translation error: {error.message}</div>;
  }

  return (
    <TranslateContext.Provider value={contextValue}>
      {children}
    </TranslateContext.Provider>
  );
}
