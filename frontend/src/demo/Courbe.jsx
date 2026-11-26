// Petite courbe (sparkline) en SVG à partir d'une liste de valeurs
export default function Courbe({ valeurs, hauteur = 70, couleur = "var(--accent)", etiquette }) {
  if (valeurs.length < 2) return <div style={{ height: hauteur }} />;
  const max = Math.max(...valeurs) * 1.1 || 1;
  const pas = 100 / (valeurs.length - 1);
  const points = valeurs.map((v, i) => `${(i * pas).toFixed(2)},${(hauteur - (v / max) * hauteur).toFixed(2)}`).join(" ");
  return (
    <svg className="courbe" viewBox={`0 0 100 ${hauteur}`} preserveAspectRatio="none" style={{ height: hauteur }} role="img" aria-label={etiquette}>
      <polygon points={`0,${hauteur} ${points} 100,${hauteur}`} fill={couleur} opacity="0.12" />
      <polyline points={points} fill="none" stroke={couleur} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
