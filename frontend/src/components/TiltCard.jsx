import { useRef } from "react";

// Carte qui s'incline en 3D en suivant la souris, avec un reflet lumineux
export default function TiltCard({ className = "", children, intensite = 8 }) {
  const ref = useRef(null);

  function bouger(e) {
    if (e.pointerType !== "mouse") return; // pas d'effet au doigt
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width; // 0 -> 1
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - py) * intensite}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * intensite}deg`);
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
  }

  function quitter() {
    const el = ref.current;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <div ref={ref} className={`tilt ${className}`} onPointerMove={bouger} onPointerLeave={quitter}>
      {children}
      <span className="tilt-reflet" aria-hidden="true" />
    </div>
  );
}
