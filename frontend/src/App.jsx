import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ScrollProgress from "./components/ScrollProgress.jsx";
import Accueil from "./pages/Accueil.jsx";
import APropos from "./pages/APropos.jsx";
import Projets from "./pages/Projets.jsx";
import ProjetDetail from "./pages/ProjetDetail.jsx";
import Competences from "./pages/Competences.jsx";
import Contact from "./pages/Contact.jsx";
import NotFound from "./pages/NotFound.jsx";
import DemoBatiment from "./pages/DemoBatiment.jsx";
import DemoComptage from "./pages/DemoComptage.jsx";

export default function App() {
  const { pathname } = useLocation();

  // à chaque changement de page : retour en haut
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <ScrollProgress />
      <Navbar />
      {/* key = pathname : l'animation d'entrée rejoue à chaque page */}
      <main key={pathname} className="page">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/a-propos" element={<APropos />} />
          <Route path="/parcours" element={<Navigate to="/a-propos" replace />} />
          <Route path="/projets" element={<Projets />} />
          <Route path="/projets/:slug" element={<ProjetDetail />} />
          <Route path="/demo" element={<Navigate to="/demo/batiment" replace />} />
          <Route path="/demo/batiment" element={<DemoBatiment />} />
          <Route path="/demo/comptage" element={<DemoComptage />} />
          <Route path="/competences" element={<Competences />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
