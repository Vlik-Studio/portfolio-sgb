import { useState } from "react";
import useApi from "../hooks/useApi.js";
import Etat from "../components/Etat.jsx";
import ProjetCard from "../components/ProjetCard.jsx";
import BarreRecherche from "../components/BarreRecherche.jsx";
import FiltreTags from "../components/FiltreTags.jsx";
import Reveal from "../components/Reveal.jsx";
import Seo from "../components/Seo.jsx";

// Texte d'un projet dans lequel on cherche, en minuscules
const texteDe = (p) =>
  [p.titre, p.resume, p.role, ...p.tags, ...p.technos].join(" ").toLowerCase();

export default function Projets() {
  const { data: projets, loading, error } = useApi("/api/projets");
  const [tagActif, setTagActif] = useState("Tous");
  const [recherche, setRecherche] = useState("");

  if (!projets) return <div className="container"><Etat loading={loading} error={error} /></div>;

  const tags = ["Tous", ...[...new Set(projets.flatMap((p) => p.tags))].sort((a, b) => a.localeCompare(b))];

  // Les deux filtres s'appliquent l'un après l'autre
  const mot = recherche.trim().toLowerCase();
  const visibles = projets
    .filter((p) => tagActif === "Tous" || p.tags.includes(tagActif))
    .filter((p) => texteDe(p).includes(mot));

  return (
    <div className="container page-haut">
      <Seo titre="Projets" description="10 projets en GTB, IoT, énergie, données et développement : du comptage électrique à la supervision énergétique." />
      <header className="page-tete">
        <p className="surtitre mono entree" style={{ "--i": 0 }}>Réalisations · {projets.length} projets</p>
        <h1 className="entree" style={{ "--i": 1 }}>Mes <span className="degrade">projets</span></h1>
        <p className="intro entree" style={{ "--i": 2 }}>
          En entreprise chez Caldya, en équipe à l'école ou en solo : GTB, IoT, énergie, données et développement.
        </p>
      </header>

      <div className="barre-outils entree" style={{ "--i": 3 }}>
        <BarreRecherche valeur={recherche} onChange={setRecherche} />
        <FiltreTags tags={tags} actif={tagActif} onChange={setTagActif} />
        <p className="compteur mono" aria-live="polite">{visibles.length} projet{visibles.length > 1 ? "s" : ""}</p>
      </div>

      {visibles.length === 0 ? (
        <div className="vide card">
          <p>Aucun projet ne correspond à votre recherche.</p>
          <button className="btn btn-contour btn-petit" onClick={() => { setRecherche(""); setTagActif("Tous"); }}>
            Réinitialiser les filtres
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
