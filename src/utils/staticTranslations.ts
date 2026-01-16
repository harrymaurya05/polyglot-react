/**
 * Static translations loader for pre-translated texts
 * Use this when you have pre-translated files from build-time translation
 */

export interface StaticTranslations {
  [lang: string]: Record<string, string>;
}

/**
 * Create a simple translate function from static translations
 */
export function createStaticTranslator(
  translations: StaticTranslations,
  defaultLang: string = "en"
) {
  let currentLang = defaultLang;

  return {
    translate: (text: string, targetLang?: string): string => {
      const lang = targetLang || currentLang;
      return translations[lang]?.[text] || text;
    },

    setLanguage: (lang: string) => {
      currentLang = lang;
    },

    getCurrentLanguage: () => currentLang,

    getSupportedLanguages: () => Object.keys(translations),
  };
}
