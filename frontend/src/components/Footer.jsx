import useApi from "../hooks/useApi.js";

export default function Footer() {
  const { data: profil } = useApi("/api/profil");

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>© {new Date().getFullYear()} Ludovic Grambert</span>
        {profil && (
          <span className="footer-liens">
            <a href={`mailto:${profil.email}`}>{profil.email}</a>
            {profil.github && <a href={profil.github} target="_blank" rel="noreferrer">GitHub</a>}
            {profil.linkedin && <a href={profil.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
          </span>
        )}
      </div>
    </footer>
  );
}
