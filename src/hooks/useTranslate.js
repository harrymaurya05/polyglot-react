import { useContext } from "react";
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
    return (text, params) => {
        return context.translator?.translate(text, params) || text;
    };
}
