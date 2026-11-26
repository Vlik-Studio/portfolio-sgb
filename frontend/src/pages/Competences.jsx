import useApi from "../hooks/useApi.js";
import Etat from "../components/Etat.jsx";
import Reveal from "../components/Reveal.jsx";
import CompetenceGroupe from "../components/CompetenceGroupe.jsx";
import Seo from "../components/Seo.jsx";

export default function Competences() {
  const { t } = useLangue();
  const { data: competences, loading, error } = useApi("/api/competences");

  if (!competences) return <div className="container"><Etat loading={loading} error={error} /></div>;

  return (
    <div className="container page-haut">
      <Seo titre={t("nav.competences")} description={t("seo.competences")} />
      <header className="page-tete">
        <p className="surtitre mono entree" style={{ "--i": 0 }}>{t("competences.surtitre")}</p>
        <h1 className="entree" style={{ "--i": 1 }}>{t("competences.titreA")} <span className="degrade">{t("competences.titreB")}</span></h1>
        <p className="intro entree" style={{ "--i": 2 }}>{t("competences.intro")}</p>
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
