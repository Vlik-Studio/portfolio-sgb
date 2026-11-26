import { useLangue } from "../i18n/Langue.jsx";

// Affiche le chargement ou l'erreur d'un appel à l'API
export default function Etat({ loading, error }) {
  const { t } = useLangue();
  if (loading) return <p className="etat">{t("etat.chargement")}</p>;
  if (error) return <p className="etat etat-erreur">{t("etat.erreur", { e: error })}</p>;
  return null;
}
