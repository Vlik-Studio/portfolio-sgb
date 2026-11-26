import { NavLink } from "react-router";
import { useLangue } from "../i18n/Langue.jsx";

// Onglets communs aux deux démos
export default function DemoOnglets() {
  const { langue } = useLangue();
  const fr = langue === "fr";
  return (
    <nav className="demo-onglets" aria-label={fr ? "Démos" : "Demos"}>
      <NavLink to="/demo/batiment">▦ {fr ? "Bâtiment GTB 3D" : "3D BMS building"}</NavLink>
      <NavLink to="/demo/comptage">⚡ {fr ? "Supervision comptage" : "Metering supervision"}</NavLink>
    </nav>
  );
}
