import { Link } from "react-router";
import Seo from "../components/Seo.jsx";

export default function NotFound() {
  return (
    <section className="container notfound">
      <Seo titre="Page introuvable" />
      <p className="mono entree" style={{ "--i": 0 }}>ERREUR 404 · POINT INCONNU</p>
      <h1 className="entree" style={{ "--i": 1 }}>Cette page n'existe pas</h1>
      <Link to="/" className="btn entree" style={{ "--i": 2 }}>Retour à l'accueil</Link>
    </section>
  );
}
