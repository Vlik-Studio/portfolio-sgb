import { useLangue } from "../i18n/Langue.jsx";

export const TOUS = "__tous__"; // valeur spéciale du bouton "Tous" / "All"

export default function FiltreTags({ tags, actif, onChange }) {
  const { t } = useLangue();
  return (
    <div className="filtres" role="group" aria-label={t("projets.filtrer")}>
      {[TOUS, ...tags].map((tag) => (
        <button
          key={tag}
          className={tag === actif ? "filtre actif" : "filtre"}
          aria-pressed={tag === actif}
          onClick={() => onChange(tag)}
        >
          {tag === TOUS ? t("projets.tous") : tag}
        </button>
      ))}
    </div>
  );
}
