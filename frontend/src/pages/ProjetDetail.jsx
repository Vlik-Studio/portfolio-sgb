import { Link, useParams } from "react-router";
import useApi from "../hooks/useApi.js";
import Etat from "../components/Etat.jsx";
import Reveal from "../components/Reveal.jsx";
import Seo from "../components/Seo.jsx";

export default function ProjetDetail() {
  const { slug } = useParams(); // /projets/supervision-energetique
  const { data: projet, loading, error } = useApi(`/api/projets/${slug}`);
  const { data: projets } = useApi("/api/projets");

  if (!projet) {
    return (
      <div className="container page-haut">
        <Etat loading={loading} error={error === "Erreur 404" ? "projet introuvable" : error} />
        {!loading && <Link to="/projets" className="lien-fleche">← Retour aux projets</Link>}
      </div>
    );
  }

  const { titre, annee, role, contexte, realisations, resultat, technos, tags, image, imageAlt } = projet;

  // projets précédent / suivant (en boucle)
  const index = projets?.findIndex((p) => p.slug === slug) ?? -1;
  const precedent = index >= 0 ? projets[(index - 1 + projets.length) % projets.length] : null;
  const suivant = index >= 0 ? projets[(index + 1) % projets.length] : null;

  return (
    <article className="container page-haut detail">
      <Seo titre={titre} description={projet.resume} />
      <Link to="/projets" className="lien-fleche entree" style={{ "--i": 0 }}>← Tous les projets</Link>

      <header className="detail-tete">
        {index >= 0 && (
          <p className="surtitre mono entree" style={{ "--i": 1 }}>
            Projet {String(index + 1).padStart(2, "0")} / {String(projets.length).padStart(2, "0")}
          </p>
        )}
        <h1 className="entree" style={{ "--i": 2 }}>{titre}</h1>
        <p className="role entree" style={{ "--i": 3 }}>{role}{annee ? ` · ${annee}` : ""}</p>
        <ul className="tags entree" style={{ "--i": 4 }}>
          {tags.map((tag) => <li key={tag} className="tag">{tag}</li>)}
        </ul>
      </header>

      {image && (
        <div className="detail-visuel entree" style={{ "--i": 5 }}>
          <img src={image} alt={imageAlt ?? ""} width="800" height="450" />
        </div>
      )}

      <div className="detail-grille">
        <div>
          <Reveal>
            <h2>Contexte</h2>
            <p>{contexte}</p>
          </Reveal>
          <Reveal>
            <h2>Ce que j'ai réalisé</h2>
            <ol className="etapes">
              {realisations.map((r, i) => (
                <Reveal as="li" key={r} effet="gauche" delai={i * 90}>
                  <span className="etape-num mono">{String(i + 1).padStart(2, "0")}</span>
                  <span>{r}</span>
                </Reveal>
              ))}
            </ol>
          </Reveal>
        </div>

        <aside className="detail-cote">
          <Reveal effet="droite" className="resultat">
            <span className="mono">RÉSULTAT</span>
            <strong>{resultat}</strong>
          </Reveal>
          <Reveal effet="droite" delai={120} className="card">
            <h3>Technologies et outils</h3>
            <ul className="tags">
              {technos.map((t) => <li key={t} className="tag tag-techno">{t}</li>)}
            </ul>
          </Reveal>
        </aside>
      </div>

      {precedent && suivant && (
        <nav className="detail-nav" aria-label="Autres projets">
          <Link to={`/projets/${precedent.slug}`} className="card detail-nav-lien">
            <span className="mono">← Précédent</span>
            <strong>{precedent.titre}</strong>
          </Link>
          <Link to={`/projets/${suivant.slug}`} className="card detail-nav-lien suivant">
            <span className="mono">Suivant →</span>
            <strong>{suivant.titre}</strong>
          </Link>
        </nav>
      )}
    </article>
  );
}
