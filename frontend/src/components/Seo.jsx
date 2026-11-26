import { useLangue } from "../i18n/Langue.jsx";

// React 19 place automatiquement <title> et <meta> dans le <head> de la page
export default function Seo({ titre, description }) {
  const { t } = useLangue();
  const site = t("seo.site");
  const titreComplet = titre ? `${titre} · ${site}` : site;
  return (
    <>
      <title>{titreComplet}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={titreComplet} />
      {description && <meta property="og:description" content={description} />}
    </>
  );
}
