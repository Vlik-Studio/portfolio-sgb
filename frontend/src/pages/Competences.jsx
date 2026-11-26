import useApi from "../hooks/useApi.js";
import Etat from "../components/Etat.jsx";
import Reveal from "../components/Reveal.jsx";
import CompetenceGroupe from "../components/CompetenceGroupe.jsx";
import Seo from "../components/Seo.jsx";

export default function Competences() {
  const { data: competences, loading, error } = useApi("/api/competences");

  if (!competences) return <div className="container"><Etat loading={loading} error={error} /></div>;

  return (
    <div className="container page-haut">
      <Seo titre="Compétences" description="GTB et régulation, énergie et décret BACS, IoT et domotique, développement." />
      <header className="page-tete">
        <p className="surtitre mono entree" style={{ "--i": 0 }}>Savoir-faire</p>
        <h1 className="entree" style={{ "--i": 1 }}>Mes <span className="degrade">compétences</span></h1>
        <p className="intro entree" style={{ "--i": 2 }}>Un profil terrain en GTB, qui s'ouvre à l'IoT, aux données et au développement.</p>
      </header>
      <div className="grille grille-2">
        {competences.map(({ groupe, items }, i) => (
          <Reveal key={groupe} delai={(i % 2) * 120}>
            <CompetenceGroupe groupe={groupe} items={items} numero={i + 1} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
