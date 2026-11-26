import { Link } from "react-router";
import Seo from "../components/Seo.jsx";

export default function NotFound() {
  const { t } = useLangue();
  return (
    <section className="container notfound">
      <Seo titre={t("seo.introuvable")} />
      <p className="mono entree" style={{ "--i": 0 }}>{t("404.code")}</p>
      <h1 className="entree" style={{ "--i": 1 }}>{t("404.titre")}</h1>
      <Link to="/" className="btn entree" style={{ "--i": 2 }}>{t("404.retour")}</Link>
    </section>
  );
}
