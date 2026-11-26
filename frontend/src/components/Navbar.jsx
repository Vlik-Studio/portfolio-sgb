import { useState } from "react";
import { Link, NavLink } from "react-router";
import BoutonTheme from "./BoutonTheme.jsx";
import BoutonLangue from "./BoutonLangue.jsx";
import { useLangue } from "../i18n/Langue.jsx";

const LIENS = [
  { to: "/", cle: "nav.accueil" },
  { to: "/a-propos", cle: "nav.apropos" },
  { to: "/projets", cle: "nav.projets" },
  { to: "/demo", cle: "nav.demo" },
  { to: "/competences", cle: "nav.competences" },
  { to: "/contact", cle: "nav.contact" },
];

export default function Navbar() {
  const [ouvert, setOuvert] = useState(false);
  const { t } = useLangue();
  const fermer = () => setOuvert(false);

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo" onClick={fermer}>
          <span className="logo-badge">LG</span>
          <span>Ludovic Grambert</span>
        </Link>

        <nav className={ouvert ? "nav-liens ouvert" : "nav-liens"}>
          {LIENS.map(({ to, cle }) => (
            <NavLink key={to} to={to} end={to === "/"} onClick={fermer}>
              {t(cle)}
            </NavLink>
          ))}
          <a className="btn btn-petit" href="/CV_Ludovic_Grambert.pdf" target="_blank" rel="noreferrer">
            {t("nav.cv")}
          </a>
        </nav>

        <div className="nav-droite">
          <BoutonLangue />
          <BoutonTheme />
          <button
            className="burger"
            aria-label={t("nav.menu")}
            aria-expanded={ouvert}
            onClick={() => setOuvert(!ouvert)}
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}
