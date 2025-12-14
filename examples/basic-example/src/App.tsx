import React from "react";
import {
  TranslateProvider,
  createTranslator,
  useTranslate,
  useTranslateDynamic,
} from "@polyglot/react";
import Header from "./components/Header";
import LanguageSwitcher from "./components/LanguageSwitcher";
import textsToTranslate from "./translations/texts.json";

// Create translator instance

// To use a self-hosted backend, follow POLYGLOT-API-GUIDE.md for the
// request/response format. The library now ships with `PolyglotAPIAdapter`.

//AWS Translate (commented out)
const translator = createTranslator({
  sourceLang: "en",
  targetLang: "hi",
  provider: "polyglot",
  polyglotAPIOptions: {
    baseUrl: import.meta.env.VITE_POLYGLOT_API_URL,
    timeout: 10000,
    apiKey: import.meta.env.VITE_POLYGLOT_API_KEY,
  },
  textToTranslate: textsToTranslate,
  cache: {
    enabled: true,
    storage: "localStorage",
    ttl: 30 * 24 * 60 * 60 * 1000,
  },
  fallbackToOriginal: true,
});

// Simulate API call to database
const fetchProductsFromDatabase = async () => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // This would be: return fetch('/api/products').then(r => r.json())
  return [
    {
      id: 1,
      name: "Laptop",
      description: "High performance laptop for professionals",
      price: 999,
    },
    {
      id: 2,
      name: "Smartphone",
      description: "Latest model with amazing camera",
      price: 699,
    },
    {
      id: 3,
      name: "Headphones",
      description: "Noise cancelling wireless headphones",
      price: 199,
    },
    {
      id: 4,
      name: "Tablet",
      description: "Portable device for work and entertainment",
      price: 499,
    },
  ];
};

function AppContent() {
  const t = useTranslate();
  const translateDynamic = useTranslateDynamic();

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
            <li>{t("Latest Technology")}</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

function App() {
  return (
    <TranslateProvider translator={translator}>
      <AppContent />
    </TranslateProvider>
  );
}

export default App;
