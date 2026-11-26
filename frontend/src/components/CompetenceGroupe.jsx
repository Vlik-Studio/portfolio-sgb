import useEnVue from "../hooks/useEnVue.js";

// niveau : 1 = notions, 2 = autonome, 3 = avancé
const LIBELLES = ["", "Notions", "Autonome", "Avancé"];

export default function CompetenceGroupe({ groupe, items, numero }) {
  const [ref, enVue] = useEnVue({ seuil: 0.3 });
  return (
    <div ref={ref} className={`card competences ${enVue ? "visible" : ""}`}>
      <span className="domaine-num mono">{String(numero).padStart(2, "0")}</span>
      <h3>{groupe}</h3>
      <ul className="skills">
        {items.map(({ nom, niveau }, i) => (
          <li key={nom}>
            <div className="skill-ligne">
              <span>{nom}</span>
              <span className="mono niveau">{LIBELLES[niveau]}</span>
            </div>
            <div className="jauge" role="meter" aria-label={nom} aria-valuemin={1} aria-valuemax={3} aria-valuenow={niveau} aria-valuetext={LIBELLES[niveau]}>
              <div
                className="jauge-remplie"
                style={{ width: enVue ? `${(niveau / 3) * 100}%` : "0%", transitionDelay: `${i * 120}ms` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
