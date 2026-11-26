import { useEffect, useRef, useState } from "react";

// Renvoie [ref, enVue] : enVue passe à true quand l'élément entre à l'écran (une seule fois)
export default function useEnVue({ seuil = 0.15, marge = "0px 0px -8% 0px" } = {}) {
  const ref = useRef(null);
  const [enVue, setEnVue] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || enVue) return;
    if (!("IntersectionObserver" in window)) {
      setEnVue(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entree]) => {
        if (entree.isIntersecting) {
          setEnVue(true);
          obs.disconnect();
        }
      },
      { threshold: seuil, rootMargin: marge }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [enVue, seuil, marge]);

  return [ref, enVue];
}
