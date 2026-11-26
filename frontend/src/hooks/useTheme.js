import { useEffect, useState } from "react";

// Thème au premier chargement : choix enregistré, sinon celui du système
function themeInitial() {
  try {
    const enregistre = localStorage.getItem("theme");
    if (enregistre) return enregistre;
  } catch {
    // localStorage indisponible (navigation privée stricte) : on suit le système
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "sombre" : "clair";
}

export default function useTheme() {
  const [theme, setTheme] = useState(themeInitial);

  useEffect(() => {
    document.documentElement.dataset.theme = theme; // <html data-theme="sombre">
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // pas grave : le thème ne sera simplement pas mémorisé
    }
  }, [theme]);

  const basculer = () => setTheme(theme === "sombre" ? "clair" : "sombre");
  return { theme, basculer };
}
