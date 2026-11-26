import useApi from "../hooks/useApi.js";
import Etat from "../components/Etat.jsx";
import Reveal from "../components/Reveal.jsx";
import Seo from "../components/Seo.jsx";
import { useLangue } from "../i18n/Langue.jsx";

export default function Contact() {
  const { t } = useLangue();
  const { data: profil, loading, error } = useApi("/api/profil");

  if (!profil) return <div className="container"><Etat loading={loading} error={error} /></div>;

  const { email, linkedin, github, localisation, cv, disponibilite, permis } = profil;

  return (
    <div className="container page-haut contact">
      <Seo titre={t("nav.contact")} description={t("seo.contact")} />
      <header className="page-tete">
        <p className="surtitre mono entree" style={{ "--i": 0 }}>{t("nav.contact")}</p>
        <h1 className="entree" style={{ "--i": 1 }}>{t("contact.titreA")} <span className="degrade">{t("contact.titreB")}</span></h1>
        <p className="intro entree" style={{ "--i": 2 }}>{t("contact.intro")}</p>
      </header>

      <Reveal effet="zoom">
        <a className="contact-email" href={`mailto:${email}?subject=${encodeURIComponent(t("email.sujet"))}`}>
          {email} <span aria-hidden="true">↗</span>
        </a>
      </Reveal>

      <div className="grille grille-2">
        <Reveal className="card">
          <h3>{t("contact.coordonnees")}</h3>
          <ul className="liste-simple">
            <li><span className="mono label">EMAIL</span> <a href={`mailto:${email}`}>{email}</a></li>
            {linkedin && <li><span className="mono label">LINKEDIN</span> <a href={linkedin} target="_blank" rel="noreferrer">{t("contact.profil")}</a></li>}
            {github && <li><span className="mono label">GITHUB</span> <a href={github} target="_blank" rel="noreferrer">{t("contact.github")}</a></li>}
            <li><span className="mono label">{t("contact.lieu")}</span> {localisation} · {permis}</li>
          </ul>
        </Reveal>
        <Reveal className="card" delai={120}>
          <h3>{t("contact.cv")}</h3>
          <p>{disponibilite}</p>
          <a className="btn btn-contour" href={cv} target="_blank" rel="noreferrer">{t("contact.ouvrirCv")}</a>
        </Reveal>
      </div>
    </div>
  );
}
