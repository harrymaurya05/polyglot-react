import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslator } from "react-translate-ai-custom";
const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिंदी" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
];
function LanguageSwitcher() {
    const { changeLanguage, currentLang, isLoading } = useTranslator();
    const handleLanguageChange = async (lang) => {
        try {
            await changeLanguage(lang);
        }
        catch (error) {
            console.error("Failed to change language:", error);
        }
    };
    return (_jsxs("div", { className: "language-switcher", children: [_jsx("label", { htmlFor: "language-select", children: "Language:" }), _jsx("select", { id: "language-select", value: currentLang, onChange: (e) => handleLanguageChange(e.target.value), disabled: isLoading, children: languages.map((lang) => (_jsx("option", { value: lang.code, children: lang.name }, lang.code))) }), isLoading && _jsx("span", { className: "loading", children: "Loading..." })] }));
}
export default LanguageSwitcher;
