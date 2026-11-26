import { useLangue } from "../i18n/Langue.jsx";

// Bandeau de technologies qui défile en continu (la liste est doublée pour boucler sans saut)
export default function Defilant({ elements }) {
  const { t } = useLangue();
  const liste = [...elements, ...elements];
  return (
    <div className="defilant" aria-label={t("defilant.aria")}>
      <ul className="defilant-piste">
        {liste.map((el, i) => (
          <li key={i} aria-hidden={i >= elements.length}>
            <span className="defilant-point" aria-hidden="true">◆</span>
            {el}
          </li>
        ))}
      </ul>
    </div>
  );
}
