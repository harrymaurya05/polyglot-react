import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TranslateProvider, createTranslator } from "react-translate-ai-custom";
import Header from "./components/Header";
import LanguageSwitcher from "./components/LanguageSwitcher";
import textsToTranslate from "./translations/texts.json";
// Create translator instance
const translator = createTranslator({
    sourceLang: "en",
    targetLang: "hi", // Hindi
    provider: "google", // or 'deepl', 'aws'
    apiKey: import.meta.env.VITE_TRANSLATE_API_KEY,
    textToTranslate: textsToTranslate,
    cache: {
        enabled: true,
        storage: "localStorage",
        ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
    fallbackToOriginal: true,
});
function App() {
    return (_jsx(TranslateProvider, { translator: translator, loadingComponent: _jsx("div", { children: "Loading translations..." }), errorComponent: (error) => _jsxs("div", { children: ["Translation error: ", error.message] }), children: _jsxs("div", { className: "app", children: [_jsx(LanguageSwitcher, {}), _jsx(Header, {}), _jsxs("main", { children: [_jsxs("section", { className: "hero", children: [_jsx("h2", { children: "Welcome to Our App!" }), _jsx("p", { children: "This is an example of automatic AI-powered translation." }), _jsx("button", { children: "Get Started" })] }), _jsxs("section", { className: "features", children: [_jsx("h3", { children: "Features" }), _jsxs("ul", { children: [_jsx("li", { children: "Automatic text extraction" }), _jsx("li", { children: "Smart caching for offline use" }), _jsx("li", { children: "Multiple translation providers" }), _jsx("li", { children: "Zero maintenance" })] })] })] })] }) }));
}
export default App;
