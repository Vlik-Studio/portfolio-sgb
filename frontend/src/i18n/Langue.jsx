import { createContext, useContext, useEffect, useState } from "react";
import { TEXTES } from "./textes.js";

const LangueContext = createContext(null);

// Langue au premier chargement : choix enregistré, sinon celle du navigateur
function langueInitiale() {
  try {
    const enregistree = localStorage.getItem("langue");
    if (enregistree === "fr" || enregistree === "en") return enregistree;
  } catch {
    // localStorage indisponible : on suit le navigateur
  }
  return navigator.language?.startsWith("fr") ? "fr" : "en";
}

export function LangueProvider({ children }) {
  const [langue, setLangue] = useState(langueInitiale);

  useEffect(() => {
    document.documentElement.lang = langue; // <html lang="en"> : utile pour l'accessibilité et le SEO
    try {
      localStorage.setItem("langue", langue);
    } catch {
      // pas grave : la langue ne sera simplement pas mémorisée
    }
  }, [langue]);

  // t("cle", { n: 3 }) -> texte traduit, avec {n} remplacé par 3
  const t = (cle, variables = {}) => {
    const texte = TEXTES[langue][cle] ?? TEXTES.fr[cle] ?? cle;
    return texte.replace(/\{(\w+)\}/g, (_, nom) => variables[nom] ?? "");
  };

  const basculer = () => setLangue(langue === "fr" ? "en" : "fr");

  return <LangueContext.Provider value={{ langue, t, basculer }}>{children}</LangueContext.Provider>;
}

export function useLangue() {
  return useContext(LangueContext);
}
