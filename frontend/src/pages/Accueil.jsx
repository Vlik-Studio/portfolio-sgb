import { Link } from "react-router";
import useApi from "../hooks/useApi.js";
import Etat from "../components/Etat.jsx";
import Hero3D from "../components/Hero3D.jsx";
import Reveal from "../components/Reveal.jsx";
import Compteur from "../components/Compteur.jsx";
import Defilant from "../components/Defilant.jsx";
import ProjetCard from "../components/ProjetCard.jsx";
import Seo from "../components/Seo.jsx";

export default function Accueil() {
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
        <Hero3D />
        <div className="container hero-contenu">
          <p className="surtitre mono entree" style={{ "--i": 0 }}>
            <span className="voyant-point" /> {localisation} · en alternance chez Caldya
          </p>
          <h1 className="hero-nom">
            <span className="entree" style={{ "--i": 1 }}>{prenom}</span>{" "}
            <span className="entree degrade" style={{ "--i": 2 }}>{nom}</span>
          </h1>
          <p className="hero-titre entree" style={{ "--i": 3 }}>{titre}</p>
          <p className="hero-accroche entree" style={{ "--i": 4 }}>{accroche}</p>
          <div className="hero-actions entree" style={{ "--i": 5 }}>
            <Link to="/projets" className="btn">Voir mes projets</Link>
            <a href={cv} className="btn btn-contour" download>Télécharger mon CV</a>
          </div>
        </div>
        <a href="#chiffres" className="scroll-indice" aria-label="Descendre">
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

        {/* ===== PRÉSENTATION + DOMAINES ===== */}
        <section className="section">
          <Reveal className="section-tete">
            <p className="surtitre mono">01 — Ce que je fais</p>
            <h2 className="titre-section">Des bâtiments qui consomment moins, <span className="degrade">pilotés intelligemment.</span></h2>
            <p className="intro">{presentation}</p>
          </Reveal>
          <div className="domaines">
            {domaines?.map(({ titre: t, texte }, i) => (
              <Reveal key={t} className="card domaine" delai={i * 120}>
                <span className="domaine-num mono">0{i + 1}</span>
                <h3>{t}</h3>
                <p>{texte}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ===== PROJETS PHARES ===== */}
        <section className="section">
          <Reveal className="section-tete section-tete-ligne">
            <div>
              <p className="surtitre mono">02 — Projets phares</p>
              <h2 className="titre-section">Du terrain à la donnée</h2>
            </div>
            <Link to="/projets" className="lien-fleche">Les {projets?.length ?? ""} projets →</Link>
          </Reveal>
          <div className="grille">
            {phares.map((projet, i) => (
              <Reveal key={projet.slug} delai={i * 120}>
                <ProjetCard projet={projet} numero={i + 1} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* ===== PARCOURS EN BREF ===== */}
        {parcours && (
          <section className="section">
            <Reveal className="section-tete section-tete-ligne">
              <div>
                <p className="surtitre mono">03 — Parcours</p>
                <h2 className="titre-section">Toujours en alternance</h2>
              </div>
              <Link to="/a-propos" className="lien-fleche">Mon parcours complet →</Link>
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
          <h2>Un projet GTB, une alternance, une question ?</h2>
          <p>Je réponds rapidement par email.</p>
          <div className="hero-actions">
            <a className="btn" href={`mailto:${email}?subject=Contact depuis votre portfolio`}>M'écrire</a>
            <Link className="btn btn-contour" to="/contact">Toutes mes coordonnées</Link>
          </div>
        </Reveal>
      </div>
    </>
  );
}
