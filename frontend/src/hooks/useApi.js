import { useEffect, useState } from "react";
import { api } from "../api.js";

// Charge une route de l'API et renvoie { data, loading, error }
export default function useApi(chemin) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let annule = false; // évite de mettre à jour un composant démonté
    setLoading(true);
    setError(null);

    api(chemin)
      .then((resultat) => { if (!annule) setData(resultat); })
      .catch((err) => { if (!annule) setError(err.message); })
      .finally(() => { if (!annule) setLoading(false); });

    return () => { annule = true; };
  }, [chemin]);

  return { data, loading, error };
}
