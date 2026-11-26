import useApi from "../hooks/useApi.js";
import { useLangue } from "../i18n/Langue.jsx";

// Lien vers le GitHub (adresse lue dans profil.json)
// variante "icone" : petit bouton rond (barre de menu) ; sinon : bouton avec texte
export default function BoutonGithub({ variante = "texte", className = "" }) {
  const { t } = useLangue();
  const { data: profil } = useApi("/api/profil");
  if (!profil?.github) return null;

  if (variante === "icone") {
    return (
      <a className={`bouton-github ${className}`} href={profil.github} target="_blank" rel="noreferrer" aria-label={t("github.aria")} title="GitHub">
        <span aria-hidden="true">&lt;/&gt;</span>
      </a>
    );
  }
  return (
    <a className={`btn btn-contour ${className}`} href={profil.github} target="_blank" rel="noreferrer" aria-label={t("github.aria")}>
      <span aria-hidden="true" className="mono">&lt;/&gt;</span> {t("github.voir")} <span aria-hidden="true">↗</span>
    </a>
  );
}
