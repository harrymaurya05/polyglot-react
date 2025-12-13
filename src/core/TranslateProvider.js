import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { TranslateContext } from "./TranslateContext";
/**
 * Translation provider component
 * Wraps the app and provides translation context
 */
export function TranslateProvider({ translator, children, loadingComponent, errorComponent, }) {
    const [isLoading, setIsLoading] = useState(!translator.isReady());
    const [error, setError] = useState(translator.getError());
    const [currentLang, setCurrentLang] = useState(translator.getCurrentLanguage());
    useEffect(() => {
        // Wait for translator to be ready
        const checkReady = setInterval(() => {
            if (translator.isReady()) {
                setIsLoading(false);
                setError(null);
                clearInterval(checkReady);
            }
            else if (translator.getError()) {
                setError(translator.getError());
                setIsLoading(false);
                clearInterval(checkReady);
            }
        }, 100);
        return () => clearInterval(checkReady);
    }, [translator]);
    const handleChangeLanguage = async (lang) => {
        setIsLoading(true);
        setError(null);
        try {
            await translator.changeLanguage(lang);
            setCurrentLang(lang);
            setIsLoading(false);
        }
        catch (err) {
            setError(err);
            setIsLoading(false);
        }
    };
    const contextValue = {
        translator,
        isLoading,
        error,
        changeLanguage: handleChangeLanguage,
        currentLang,
    };
    // Show loading component while initializing
    if (isLoading && loadingComponent) {
        return _jsx(_Fragment, { children: loadingComponent });
    }
    // Show error component if initialization failed
    if (error && errorComponent) {
        return _jsx(_Fragment, { children: errorComponent(error) });
    }
    return (_jsx(TranslateContext.Provider, { value: contextValue, children: children }));
}
