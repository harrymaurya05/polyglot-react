import {
  TranslateProvider,
  createTranslator,
  useTranslate,
} from "react-translate-ai-custom";
import Header from "./components/Header";
import LanguageSwitcher from "./components/LanguageSwitcher";
import textsToTranslate from "./translations/texts.json";

// Create translator instance

// Custom API translator (commented out)
// const translator = createTranslator({
//   sourceLang: "en",
//   targetLang: "hi", // Hindi
//   provider: "custom",
//   apiKey: "http://localhost:8000", // Your API base URL
//   textToTranslate: textsToTranslate,
//   cache: {
//     enabled: true,
//     storage: "localStorage",
//     ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
//   },
//   fallbackToOriginal: true,
// });

// AWS Translate
const translator = createTranslator({
  sourceLang: "en",
  targetLang: "hi", // Hindi
  provider: "aws",
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    region: import.meta.env.VITE_AWS_REGION || "us-east-1",
  },
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
            <li>{t("Latest Technology")}</li>
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
      loadingComponent={
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            gap: "1rem",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "5px solid #f3f3f3",
              borderTop: "5px solid #3498db",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <p>Loading translations...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      }
      errorComponent={(error) => <div>Translation error: {error.message}</div>}
    >
      <AppContent />
    </TranslateProvider>
  );
}

export default App;
