// Affiche le chargement ou l'erreur d'un appel à l'API
export default function Etat({ loading, error }) {
  if (loading) return <p className="etat">Chargement…</p>;
  if (error) return <p className="etat etat-erreur">Impossible de charger les données ({error}). Le backend est-il lancé ?</p>;
  return null;
}
