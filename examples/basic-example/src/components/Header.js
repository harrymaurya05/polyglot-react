import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslate } from "react-translate-ai-custom";
function Header() {
    const t = useTranslate();
    return (_jsxs("header", { children: [_jsx("h1", { children: t("React Translate AI") }), _jsxs("nav", { children: [_jsx("a", { href: "/", children: t("Home") }), _jsx("a", { href: "/about", children: t("About") }), _jsx("a", { href: "/contact", children: t("Contact") })] })] }));
}
export default Header;
