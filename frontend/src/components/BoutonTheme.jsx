import useTheme from "../hooks/useTheme.js";
import { useLangue } from "../i18n/Langue.jsx";

export default function BoutonTheme() {
  const { theme, basculer } = useTheme();
  const { t } = useLangue();
  const sombre = theme === "sombre";
  const libelle = sombre ? t("theme.versClair") : t("theme.versSombre");
  return (
    <button className="bouton-theme" onClick={basculer} aria-label={libelle} title={libelle}>
      {sombre ? "☀" : "☾"}
    </button>
  );
}
