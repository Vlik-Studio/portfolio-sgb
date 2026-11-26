import { useEffect, useRef } from "react";

// Fine barre en haut de l'écran qui se remplit pendant le scroll
export default function ScrollProgress() {
  const ref = useRef(null);

  useEffect(() => {
    let attente = 0;
    const maj = () => {
      attente = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (ref.current) ref.current.style.transform = `scaleX(${p})`;
    };
    const auScroll = () => { if (!attente) attente = requestAnimationFrame(maj); };
    maj();
    window.addEventListener("scroll", auScroll, { passive: true });
    window.addEventListener("resize", auScroll);
    return () => {
      window.removeEventListener("scroll", auScroll);
      window.removeEventListener("resize", auScroll);
      cancelAnimationFrame(attente);
    };
  }, []);

  return <div ref={ref} className="scroll-progress" aria-hidden="true" />;
}
