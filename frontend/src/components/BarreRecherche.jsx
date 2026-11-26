// Champ contrôlé : la valeur vient du state du parent (value + onChange)
export default function BarreRecherche({ valeur, onChange }) {
  return (
    <div className="recherche">
      <label htmlFor="recherche" className="sr-only">Rechercher un projet</label>
      <input
        id="recherche"
        type="search"
        placeholder="Rechercher : MQTT, BACS, Flutter, EBO…"
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
