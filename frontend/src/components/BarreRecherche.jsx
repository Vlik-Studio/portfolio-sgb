import { useLangue } from "../i18n/Langue.jsx";

// Champ contrôlé : la valeur vient du state du parent (value + onChange)
export default function BarreRecherche({ valeur, onChange }) {
  const { t } = useLangue();
  return (
    <div className="recherche">
      <label htmlFor="recherche" className="sr-only">{t("projets.recherche")}</label>
      <input
        id="recherche"
        type="search"
        placeholder={t("projets.placeholder")}
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
