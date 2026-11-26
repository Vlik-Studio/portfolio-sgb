import Reveal from "./Reveal.jsx";

// Frise chronologique du parcours : chaque étape apparaît au scroll
export default function Frise({ etapes }) {
  return (
    <ol className="frise">
      {etapes.map((etape, i) => (
        <Reveal as="li" key={etape.titre} effet={i % 2 ? "droite" : "gauche"} className={`frise-etape ${etape.type}`}>
          <span className="frise-point" aria-hidden="true" />
          <div className="card">
            <div className="frise-tete">
              <span className="mono periode">{etape.periode}</span>
              <span className="badge-type">{etape.type === "formation" ? "Formation" : "Expérience"}</span>
            </div>
            <h3>{etape.titre}</h3>
            <p className="role">{etape.lieu}</p>
            <p>{etape.description}</p>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}
