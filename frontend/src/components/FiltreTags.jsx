export default function FiltreTags({ tags, actif, onChange }) {
  return (
    <div className="filtres" role="group" aria-label="Filtrer par thème">
      {tags.map((tag) => (
        <button
          key={tag}
          className={tag === actif ? "filtre actif" : "filtre"}
          aria-pressed={tag === actif}
          onClick={() => onChange(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
