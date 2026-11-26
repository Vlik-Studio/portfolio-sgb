import { useState } from "react";
import { Link, NavLink } from "react-router";
import BoutonTheme from "./BoutonTheme.jsx";

const LIENS = [
  { to: "/", libelle: "Accueil" },
  { to: "/a-propos", libelle: "À propos" },
  { to: "/projets", libelle: "Projets" },
  { to: "/competences", libelle: "Compétences" },
  { to: "/contact", libelle: "Contact" },
];

export default function Navbar() {
  const [ouvert, setOuvert] = useState(false);
  const fermer = () => setOuvert(false);

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo" onClick={fermer}>
          <span className="logo-badge">LG</span>
          <span>Ludovic Grambert</span>
        </Link>

        <nav className={ouvert ? "nav-liens ouvert" : "nav-liens"}>
          {LIENS.map(({ to, libelle }) => (
            <NavLink key={to} to={to} end={to === "/"} onClick={fermer}>
              {libelle}
            </NavLink>
          ))}
          <a className="btn btn-petit" href="/CV_Ludovic_Grambert.pdf" target="_blank" rel="noreferrer">
            CV (PDF)
          </a>
        </nav>

        <div className="nav-droite">
          <BoutonTheme />
          <button
            className="burger"
            aria-label="Ouvrir le menu"
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
