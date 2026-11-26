import { Link } from "react-router";
import TiltCard from "./TiltCard.jsx";
import { useLangue } from "../i18n/Langue.jsx";

export default function ProjetCard({ projet, numero }) {
  const { t } = useLangue();
  const { slug, titre, resume, tags, annee, role, image, imageAlt } = projet;
  return (
    <TiltCard className="card projet-card">
      <Link to={`/projets/${slug}`} className="projet-lien" aria-label={`${t("carte.voir")} : ${titre}`}>
        {image && (
          <div className="projet-visuel">
            <img src={image} alt={imageAlt ?? ""} width="800" height="450" loading="lazy" />
          </div>
        )}
        <div className="projet-corps">
          <div className="projet-head">
            {numero && <span className="projet-numero mono">{String(numero).padStart(2, "0")}</span>}
            {annee && <span className="annee mono">{annee}</span>}
          </div>
          <h3>{titre}</h3>
          <p className="role">{role}</p>
          <p className="projet-resume">{resume}</p>
          <ul className="tags">
            {tags.map((tag) => <li key={tag} className="tag">{tag}</li>)}
          </ul>
          <span className="lien-fleche">{t("carte.voir")} <span aria-hidden="true">→</span></span>
        </div>
      </Link>
    </TiltCard>
  );
}
