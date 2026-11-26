import useApi from "../hooks/useApi.js";
import Etat from "../components/Etat.jsx";
import Frise from "../components/Frise.jsx";
import Reveal from "../components/Reveal.jsx";
import Seo from "../components/Seo.jsx";

export default function APropos() {
  const { t } = useLangue();
  const { data: profil, loading, error } = useApi("/api/profil");
  const parcours = useApi("/api/parcours");

  if (!profil) return <div className="container"><Etat loading={loading} error={error} /></div>;

  const { prenom, nom, titre, apropos, langues, interets, permis, localisation, cv } = profil;
  const initiales = `${prenom[0]}${nom[0]}`; // "LG"

  return (
    <div className="container page-haut apropos">
      <Seo titre={t("nav.apropos")} description={`${titre} — ${t("seo.apropos")}`} />
      <header className="apropos-tete">
        <div className="avatar entree" style={{ "--i": 0 }} aria-hidden="true">{initiales}</div>
        <div>
          <p className="surtitre mono entree" style={{ "--i": 1 }}>{t("apropos.surtitre")}</p>
          <h1 className="entree" style={{ "--i": 2 }}>{prenom} <span className="degrade">{nom}</span></h1>
          <p className="role entree" style={{ "--i": 3 }}>{titre}</p>
        </div>
      </header>

      <div className="apropos-grille">
        <div className="apropos-texte">
          {apropos?.map((paragraphe, i) => (
            <Reveal as="p" key={paragraphe} delai={i * 100}>{paragraphe}</Reveal>
          ))}
          <Reveal delai={300}>
            <a className="btn btn-contour" href={cv} download>{t("apropos.cv")}</a>
          </Reveal>
        </div>

        <Reveal as="aside" effet="droite" className="card apropos-infos">
          <h3>{t("apropos.langues")}</h3>
          <ul className="liste-simple">
            {langues?.map(({ langue, niveau }) => (
              <li key={langue}><strong>{langue}</strong> — {niveau}</li>
            ))}
          </ul>
          <h3>{t("apropos.interets")}</h3>
          <ul className="tags">
            {interets?.map((i) => <li key={i} className="tag">{i}</li>)}
          </ul>
          <p className="role">{localisation} · {permis}</p>
        </Reveal>
      </div>

      <Reveal as="h2" className="titre-section">{t("apropos.parcoursA")} <span className="degrade">{t("apropos.parcoursB")}</span></Reveal>
      {parcours.data
        ? <Frise etapes={parcours.data} />
        : <Etat loading={parcours.loading} error={parcours.error} />}
    </div>
  );
}
