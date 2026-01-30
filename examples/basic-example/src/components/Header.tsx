interface HeaderProps {
  t: (text: string) => string;
}

function Header({ t }: HeaderProps) {
  return (
    <header>
      <h1>{t("React Translate AI")}</h1>
      <nav>
        <a href="/">{t("New")}</a>
        <a href="/contact">{t("Contact")}</a>
        <a href="/contact">{t("Sandeep")}</a>
        <a href="/contact">{t("$1,234.56")}</a>
        <a href="/contact">{t("Christmas")}</a>
        <a href="/contact">{t("March 15, 2026")}</a>
      </nav>
    </header>
  );
}

export default Header;
