import { useState } from "react";
import useApi from "../hooks/useApi.js";
import Etat from "../components/Etat.jsx";
import ProjetCard from "../components/ProjetCard.jsx";
import BarreRecherche from "../components/BarreRecherche.jsx";
import FiltreTags, { TOUS } from "../components/FiltreTags.jsx";
import Reveal from "../components/Reveal.jsx";
import Seo from "../components/Seo.jsx";
import { useLangue } from "../i18n/Langue.jsx";

// Texte d'un projet dans lequel on cherche, en minuscules
const texteDe = (p) =>
  [p.titre, p.resume, p.role, ...p.tags, ...p.technos].join(" ").toLowerCase();

export default function Projets() {
  const { t } = useLangue();
  const { data: projets, loading, error } = useApi("/api/projets");
  const [tagActif, setTagActif] = useState(TOUS);
  const [recherche, setRecherche] = useState("");

  if (!projets) return <div className="container"><Etat loading={loading} error={error} /></div>;

  const tags = [...new Set(projets.flatMap((p) => p.tags))].sort((a, b) => a.localeCompare(b));
  // après un changement de langue, le tag choisi peut ne plus exister ("Énergie" -> "Energy")
  const tagValide = tags.includes(tagActif) ? tagActif : TOUS;

  // Les deux filtres s'appliquent l'un après l'autre
  const mot = recherche.trim().toLowerCase();
  const visibles = projets
    .filter((p) => tagValide === TOUS || p.tags.includes(tagValide))
    .filter((p) => texteDe(p).includes(mot));

  return (
    <div className="container page-haut">
      <Seo titre={t("nav.projets")} description={t("seo.projets")} />
      <header className="page-tete">
        <p className="surtitre mono entree" style={{ "--i": 0 }}>{t("projets.surtitre", { n: projets.length })}</p>
        <h1 className="entree" style={{ "--i": 1 }}>{t("projets.titreA")} <span className="degrade">{t("projets.titreB")}</span></h1>
        <p className="intro entree" style={{ "--i": 2 }}>{t("projets.intro")}</p>
      </header>

      <div className="barre-outils entree" style={{ "--i": 3 }}>
        <BarreRecherche valeur={recherche} onChange={setRecherche} />
        <FiltreTags tags={tags} actif={tagValide} onChange={setTagActif} />
        <p className="compteur mono" aria-live="polite">
          {t(visibles.length > 1 ? "projets.compteurN" : "projets.compteur1", { n: visibles.length })}
        </p>
      </div>

      {visibles.length === 0 ? (
        <div className="vide card">
          <p>{t("projets.vide")}</p>
          <button className="btn btn-contour btn-petit" onClick={() => { setRecherche(""); setTagActif(TOUS); }}>
            {t("projets.reset")}
          </button>
        </div>
      ) : (
        <div className="grille">
          {visibles.map((projet, i) => (
            <Reveal key={projet.slug} delai={(i % 3) * 100}>
              <ProjetCard projet={projet} numero={projets.indexOf(projet) + 1} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
