// React 19 place automatiquement <title> et <meta> dans le <head> de la page
const SITE = "Ludovic Grambert — GTB & Smart Building";

export default function Seo({ titre, description }) {
  const titreComplet = titre ? `${titre} · ${SITE}` : SITE;
  return (
    <>
      <title>{titreComplet}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={titreComplet} />
      {description && <meta property="og:description" content={description} />}
    </>
  );
}
