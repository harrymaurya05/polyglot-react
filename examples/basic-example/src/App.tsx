import { useState } from "react";
import Header from "./components/Header";
import LanguageSwitcher from "./components/LanguageSwitcher";
import translationStore from "./translations/.translation-store.json";

// Extract translations from the store
function getTranslationsMap() {
  const translations: Record<string, Record<string, string>> = {};

  for (const metadata of Object.values(translationStore.metadata)) {
    for (const [lang, translated] of Object.entries(metadata.translations)) {
      if (!translations[lang]) {
        translations[lang] = {};
      }
      translations[lang][metadata.text] = translated;
    }
  }

  return translations;
}

const translationsMap = getTranslationsMap();
const supportedLanguages = Object.keys(translationsMap);

function App() {
  const [currentLang, setCurrentLang] = useState("en");

  const t = (text: string): string => {
    // Return translated text from pre-built translations
    return translationsMap[currentLang]?.[text] || text;
  };

  return (
    <div className="app">
      <div style={{ padding: "20px", background: "#f0f0f0" }}>
        <label>{t("Language")}: </label>
        <select
          value={currentLang}
          onChange={(e) => setCurrentLang(e.target.value)}
          style={{ padding: "5px", fontSize: "16px" }}
        >
          {supportedLanguages.map((lang) => (
            <option key={lang} value={lang}>
              {lang.toUpperCase()}
            </option>
          ))}
        </select>
        <span style={{ marginLeft: "10px", color: "#666" }}>
          {t("⚡ Using pre-translated texts (no API calls!")}
        </span>
      </div>

      <Header t={t} />

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

export default App;
