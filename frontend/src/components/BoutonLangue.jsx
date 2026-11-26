import { useLangue } from "../i18n/Langue.jsx";

// Bouton FR / EN : affiche la langue vers laquelle on bascule
export default function BoutonLangue() {
  const { langue, t, basculer } = useLangue();
  return (
    <button className="bouton-langue mono" onClick={basculer} aria-label={t("langue.aria")} title={t("langue.aria")}>
      <span className={langue === "fr" ? "actif" : ""}>FR</span>
      <span className="separateur" aria-hidden="true">/</span>
      <span className={langue === "en" ? "actif" : ""}>EN</span>
    </button>
  );
}
