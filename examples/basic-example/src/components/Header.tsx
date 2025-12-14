import { useTranslate } from "@polyglot/react";

function Header() {
  const t = useTranslate();

  return (
    <header>
      <h1>{t("React Translate AI")}</h1>
      <nav>
        <a href="/">{t("Home")}</a>
        <a href="/about">{t("About")}</a>
        <a href="/contact">{t("Contact")}</a>
      </nav>
    </header>
  );
}

export default Header;
