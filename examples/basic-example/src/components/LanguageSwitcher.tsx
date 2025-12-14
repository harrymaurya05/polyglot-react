import { useTranslator } from "@polyglot/react";

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिंदी" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
];

function LanguageSwitcher() {
  const { changeLanguage, currentLang, isLoading } = useTranslator();

  const handleLanguageChange = async (lang: string) => {
    try {
      await changeLanguage(lang);
    } catch (error) {
      console.error("Failed to change language:", error);
    }
  };

  return (
    <div className="language-switcher">
      <label htmlFor="language-select">Language:</label>
      <select
        id="language-select"
        value={currentLang}
        onChange={(e) => handleLanguageChange(e.target.value)}
        disabled={isLoading}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
      {isLoading && <span className="loading">Loading...</span>}
    </div>
  );
}

export default LanguageSwitcher;
