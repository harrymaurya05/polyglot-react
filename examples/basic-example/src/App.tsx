import {
  TranslateProvider,
  createTranslator,
  useTranslate,
} from "react-translate-ai-custom";
import Header from "./components/Header";
import LanguageSwitcher from "./components/LanguageSwitcher";
import textsToTranslate from "./translations/texts.json";

// Create translator instance
const translator = createTranslator({
  sourceLang: "en",
  targetLang: "hi", // Hindi
  provider: "custom",
  apiKey: "http://localhost:8000", // Your API base URL
  textToTranslate: textsToTranslate,
  cache: {
    enabled: true,
    storage: "localStorage",
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  fallbackToOriginal: true,
});

function AppContent() {
  const t = useTranslate();

  return (
    <div className="app">
      <LanguageSwitcher />
      <Header />
      <main>
        <section className="hero">
          <h2>{t("Welcome to Our App!")}</h2>
          <p>{t("This is an example of automatic AI-powered translation.")}</p>
          <button>{t("Get Started")}</button>
        </section>

        <section className="features">
          <h3>{t("Features")}</h3>
          <ul>
            <li>{t("Automatic text extraction")}</li>
            <li>{t("Smart caching for offline use")}</li>
            <li>{t("Multiple translation providers")}</li>
            <li>{t("Zero maintenance")}</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

function App() {
  return (
    <TranslateProvider
      translator={translator}
      loadingComponent={<div>Loading translations...</div>}
      errorComponent={(error) => <div>Translation error: {error.message}</div>}
    >
      <AppContent />
    </TranslateProvider>
  );
}

export default App;
