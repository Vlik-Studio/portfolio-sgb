import { useEffect, useRef, useState } from "react";

// Fait avancer une simulation à intervalle régulier et force le rafraîchissement de l'écran
// creer : fonction qui crée l'état initial ; avancer : fonction qui fait une étape
export default function useSimulation(creer, avancer, { intervalle = 250 } = {}) {
  const simRef = useRef(null);
  if (simRef.current === null) simRef.current = creer();
  const [, setVersion] = useState(0);
  const [vitesse, setVitesse] = useState(1); // étapes par intervalle
  const [enPause, setPause] = useState(false);

  useEffect(() => {
    if (enPause) return;
    const id = setInterval(() => {
      for (let i = 0; i < vitesse; i++) avancer(simRef.current);
      setVersion((v) => v + 1);
    }, intervalle);
    return () => clearInterval(id);
  }, [enPause, vitesse, avancer, intervalle]);

  const actualiser = () => setVersion((v) => v + 1);
  return { simRef, sim: simRef.current, vitesse, setVitesse, enPause, setPause, actualiser };
}
