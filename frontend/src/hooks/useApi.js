import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useLangue } from "../i18n/Langue.jsx";

// Charge une route de l'API dans la langue courante et renvoie { data, loading, error }
export default function useApi(chemin) {
  const { langue } = useLangue();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // /api/projets -> /api/projets?lang=en
  const url = `${chemin}${chemin.includes("?") ? "&" : "?"}lang=${langue}`;

  useEffect(() => {
    let annule = false; // évite de mettre à jour un composant démonté
    setLoading(true);
    setError(null);

    api(url)
      .then((resultat) => { if (!annule) setData(resultat); })
      .catch((err) => { if (!annule) setError(err.message); })
      .finally(() => { if (!annule) setLoading(false); });

    return () => { annule = true; };
  }, [url]);

  return { data, loading, error };
}
