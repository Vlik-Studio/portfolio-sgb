import useApi from "../hooks/useApi.js";
import Etat from "../components/Etat.jsx";
import Reveal from "../components/Reveal.jsx";
import Seo from "../components/Seo.jsx";

export default function Contact() {
  const { data: profil, loading, error } = useApi("/api/profil");

  if (!profil) return <div className="container"><Etat loading={loading} error={error} /></div>;

  const { email, linkedin, github, localisation, cv, disponibilite, permis } = profil;

  return (
    <div className="container page-haut contact">
      <Seo titre="Contact" description="Contacter Ludovic Grambert, technicien GTB en alternance — email et CV." />
      <header className="page-tete">
        <p className="surtitre mono entree" style={{ "--i": 0 }}>Contact</p>
        <h1 className="entree" style={{ "--i": 1 }}>Travaillons <span className="degrade">ensemble</span></h1>
        <p className="intro entree" style={{ "--i": 2 }}>Une question, un projet GTB ou une opportunité ? Écrivez-moi.</p>
      </header>

      <Reveal effet="zoom">
        <a className="contact-email" href={`mailto:${email}?subject=Contact depuis votre portfolio`}>
          {email} <span aria-hidden="true">↗</span>
        </a>
      </Reveal>

      <div className="grille grille-2">
        <Reveal className="card">
          <h3>Coordonnées</h3>
          <ul className="liste-simple">
            <li><span className="mono label">EMAIL</span> <a href={`mailto:${email}`}>{email}</a></li>
            {linkedin && <li><span className="mono label">LINKEDIN</span> <a href={linkedin} target="_blank" rel="noreferrer">Mon profil</a></li>}
            {github && <li><span className="mono label">GITHUB</span> <a href={github} target="_blank" rel="noreferrer">Mon GitHub</a></li>}
            <li><span className="mono label">LIEU</span> {localisation} · {permis}</li>
          </ul>
        </Reveal>
        <Reveal className="card" delai={120}>
          <h3>Mon CV</h3>
          <p>{disponibilite}</p>
          <a className="btn btn-contour" href={cv} target="_blank" rel="noreferrer">Ouvrir le CV (PDF)</a>
        </Reveal>
      </div>
    </div>
  );
}
