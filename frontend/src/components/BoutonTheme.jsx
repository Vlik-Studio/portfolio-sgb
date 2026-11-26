import useTheme from "../hooks/useTheme.js";

export default function BoutonTheme() {
  const { theme, basculer } = useTheme();
  const sombre = theme === "sombre";
  return (
    <button
      className="bouton-theme"
      onClick={basculer}
      aria-label={sombre ? "Passer en mode clair" : "Passer en mode sombre"}
      title={sombre ? "Mode clair" : "Mode sombre"}
    >
      {sombre ? "☀" : "☾"}
    </button>
  );
}
