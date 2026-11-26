import { useEffect, useState } from "react";
import useEnVue from "../hooks/useEnVue.js";

// "55" compte de 0 à 55, "4 ans" de 0 à 4 puis " ans". Un texte sans nombre ("BACS") s'affiche tel quel.
export default function Compteur({ valeur, duree = 1400 }) {
  const [ref, enVue] = useEnVue({ seuil: 0.5 });
  const correspondance = String(valeur).match(/^(\d+)(.*)$/);
  const cible = correspondance ? Number(correspondance[1]) : null;
  const suffixe = correspondance ? correspondance[2] : "";
  const [nombre, setNombre] = useState(0);

  useEffect(() => {
    if (!enVue || cible === null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setNombre(cible);
      return;
    }
    let depart;
    let animation;
    const etape = (t) => {
      depart ??= t;
      const p = Math.min((t - depart) / duree, 1);
      const adouci = 1 - Math.pow(1 - p, 3); // démarre vite, finit doucement
      setNombre(Math.round(adouci * cible));
      if (p < 1) animation = requestAnimationFrame(etape);
    };
    animation = requestAnimationFrame(etape);
    return () => cancelAnimationFrame(animation);
  }, [enVue, cible, duree]);

  return (
    <span ref={ref} className="compteur-valeur">
      {cible === null ? valeur : `${nombre}${suffixe}`}
    </span>
  );
}
