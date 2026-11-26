import useEnVue from "../hooks/useEnVue.js";

/*
  Fait apparaître son contenu quand on scrolle jusqu'à lui.
  effet : "monte" (défaut), "gauche", "droite", "zoom"
  delai : en millisecondes, pour décaler plusieurs éléments (effet cascade)
*/
export default function Reveal({ as: Balise = "div", effet = "monte", delai = 0, className = "", children, ...reste }) {
  const [ref, enVue] = useEnVue();
  return (
    <Balise
      ref={ref}
      className={`reveal reveal-${effet} ${enVue ? "visible" : ""} ${className}`}
      style={{ transitionDelay: `${delai}ms` }}
      {...reste}
    >
      {children}
    </Balise>
  );
}
