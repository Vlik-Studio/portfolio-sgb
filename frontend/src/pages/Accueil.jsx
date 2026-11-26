import { Link } from "react-router";
import useApi from "../hooks/useApi.js";
import Etat from "../components/Etat.jsx";
import Hero3D from "../components/Hero3D.jsx";
import Reveal from "../components/Reveal.jsx";
import Compteur from "../components/Compteur.jsx";
import Defilant from "../components/Defilant.jsx";
import ProjetCard from "../components/ProjetCard.jsx";
import TiltCard from "../components/TiltCard.jsx";
import Seo from "../components/Seo.jsx";
import { useLangue } from "../i18n/Langue.jsx";

export default function Accueil() {
  const { t, langue } = useLangue();
  const { data: profil, loading, error } = useApi("/api/profil");
  const { data: projets } = useApi("/api/projets");
  const { data: parcours } = useApi("/api/parcours");

  if (!profil) return <div className="container"><Etat loading={loading} error={error} /></div>;

  const { prenom, nom, titre, accroche, presentation, chiffres, domaines, technos, cv, localisation, email } = profil;
  const phares = projets?.filter((p) => p.mise_en_avant) ?? [];

  return (
    <>
      <Seo description={presentation} />

      {/* ===== HERO ===== */}
      <section className="hero">
        <Hero3D libelle={langue === "fr" ? "GTB" : "BMS"} />
        <div className="container hero-contenu">
          <p className="surtitre mono entree" style={{ "--i": 0 }}>
            <span className="voyant-point" /> {localisation} · {t("accueil.alternance")}
          </p>
          <h1 className="hero-nom">
            <span className="entree" style={{ "--i": 1 }}>{prenom}</span>{" "}
            <span className="entree degrade" style={{ "--i": 2 }}>{nom}</span>
          </h1>
          <p className="hero-titre entree" style={{ "--i": 3 }}>{titre}</p>
          <p className="hero-accroche entree" style={{ "--i": 4 }}>{accroche}</p>
          <div className="hero-actions entree" style={{ "--i": 5 }}>
            <Link to="/projets" className="btn">{t("accueil.voirProjets")}</Link>
            <a href={cv} className="btn btn-contour" download>{t("accueil.cv")}</a>
          </div>
        </div>
        <a href="#chiffres" className="scroll-indice" aria-label={t("accueil.descendre")}>
          <span className="scroll-souris" aria-hidden="true" />
        </a>
      </section>

      {technos && <Defilant elements={technos} />}

      <div className="container">
        {/* ===== CHIFFRES ===== */}
        <section id="chiffres" className="section">
          <div className="chiffres">
            {chiffres.map(({ valeur, libelle }, i) => (
              <Reveal key={libelle} className="chiffre" delai={i * 100}>
                <Compteur valeur={valeur} />
                <span className="chiffre-libelle">{libelle}</span>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ===== CE QUE JE FAIS ===== */}
        <section className="section">
          <Reveal className="section-tete">
            <p className="surtitre mono">{t("accueil.s1")}</p>
            <h2 className="titre-section">{t("accueil.s1a")} <span className="degrade">{t("accueil.s1b")}</span></h2>
            <p className="intro">{presentation}</p>
          </Reveal>
          <div className="domaines">
            {domaines?.map(({ titre: d, texte }, i) => (
              <Reveal key={d} className="card domaine" delai={i * 120}>
                <span className="domaine-num mono">0{i + 1}</span>
                <h3>{d}</h3>
                <p>{texte}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ===== PROJETS PHARES ===== */}
        <section className="section">
          <Reveal className="section-tete section-tete-ligne">
            <div>
              <p className="surtitre mono">{t("accueil.s2")}</p>
              <h2 className="titre-section">{t("accueil.s2titre")}</h2>
            </div>
            <Link to="/projets" className="lien-fleche">{t("accueil.s2lien", { n: projets?.length ?? "" })}</Link>
          </Reveal>
          <div className="grille">
            {phares.map((projet, i) => (
              <Reveal key={projet.slug} delai={i * 120}>
                <ProjetCard projet={projet} numero={i + 1} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* ===== DÉMO GTB ===== */}
        <section className="section">
          <Reveal className="section-tete">
            <p className="surtitre mono">{t("accueil.s3")}</p>
            <h2 className="titre-section">{t("accueil.s3titre")}</h2>
            <p className="intro">{t("accueil.s3texte")}</p>
          </Reveal>
          <div className="grille grille-2">
            <Reveal>
              <TiltCard className="card demo-carte">
                <Link to="/demo/batiment" className="demo-carte-lien">
                  <span className="demo-icone" aria-hidden="true">▦</span>
                  <h3>{t("accueil.s3bat")}</h3>
                  <p>{t("accueil.s3batTexte")}</p>
                  <span className="lien-fleche">{t("accueil.s3ouvrir")}</span>
                </Link>
              </TiltCard>
            </Reveal>
            <Reveal delai={120}>
              <TiltCard className="card demo-carte">
                <Link to="/demo/comptage" className="demo-carte-lien">
                  <span className="demo-icone" aria-hidden="true">⚡</span>
                  <h3>{t("accueil.s3td")}</h3>
                  <p>{t("accueil.s3tdTexte")}</p>
                  <span className="lien-fleche">{t("accueil.s3ouvrir")}</span>
                </Link>
              </TiltCard>
            </Reveal>
          </div>
        </section>

        {/* ===== PARCOURS EN BREF ===== */}
        {parcours && (
          <section className="section">
            <Reveal className="section-tete section-tete-ligne">
              <div>
                <p className="surtitre mono">{t("accueil.s4")}</p>
                <h2 className="titre-section">{t("accueil.s4titre")}</h2>
              </div>
              <Link to="/a-propos" className="lien-fleche">{t("accueil.s4lien")}</Link>
            </Reveal>
            <ol className="mini-frise">
              {[...parcours].reverse().sort((a, b) => parseInt(a.periode) - parseInt(b.periode)).map((etape, i) => (
                <Reveal as="li" key={etape.titre} effet="zoom" delai={i * 90} className={`mini-etape ${etape.type}`}>
                  <span className="mini-periode mono">{etape.periode}</span>
                  <span className="mini-titre">{etape.titre}</span>
                </Reveal>
              ))}
            </ol>
          </section>
        )}

        {/* ===== APPEL À L'ACTION ===== */}
        <Reveal as="section" effet="zoom" className="cta">
          <h2>{t("cta.titre")}</h2>
          <p>{t("cta.texte")}</p>
          <div className="hero-actions">
            <a className="btn" href={`mailto:${email}?subject=${encodeURIComponent(t("email.sujet"))}`}>{t("cta.ecrire")}</a>
            <Link className="btn btn-contour" to="/contact">{t("cta.coordonnees")}</Link>
          </div>
        </Reveal>
      </div>
    </>
  );
}
