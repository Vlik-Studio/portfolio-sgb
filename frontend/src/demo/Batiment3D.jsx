import { useEffect, useRef } from "react";
import { ZONES, SEUIL_CO2 } from "./simulationGtb.js";

/*
  Bâtiment de démo en 3D (Canvas 2D, sans librairie), relié à la simulation GTB.
  - éclairage : les zones et les fenêtres s'allument selon le niveau des luminaires
  - stores : les lames descendent devant les fenêtres selon la position
  - CVC : flux d'air rouge (chaud) ou bleu (froid) sous le plafond
  - ventilation : ventilateur de la CTA sur le toit qui tourne selon le débit
  - sondes : point coloré selon le CO₂ et étiquette température / CO₂
  Glisser pour tourner autour du bâtiment, cliquer sur une zone pour la sélectionner.
*/

const L = 4.4; // largeur (x)
const P = 2.2; // profondeur (z)
const HN = 1; // hauteur d'un niveau
const NIV = 3;
const BAS = -1.5;
const HAUT = BAS + NIV * HN;

// boîte 3D d'une zone : x de -L/2 à 0 (côté 0) ou de 0 à L/2 (côté 1)
function boite(z) {
  const x0 = z.cote === 0 ? -L / 2 : 0;
  return { x0, x1: x0 + L / 2, y0: BAS + z.etage * HN, y1: BAS + (z.etage + 1) * HN, z0: -P / 2, z1: P / 2 };
}

function lireCouleurs() {
  const s = getComputedStyle(document.documentElement);
  const v = (n) => s.getPropertyValue(n).trim();
  return { accent: v("--accent"), ambre: v("--ambre"), bord: v("--bord"), texte: v("--texte"), doux: v("--texte-doux"), carte: v("--carte"), sombre: document.documentElement.dataset.theme === "sombre" };
}

export const couleurCo2 = (co2) => (co2 > SEUIL_CO2 ? "#ef4444" : co2 > 800 ? "#f59e0b" : "#22c55e");

// enveloppe convexe (pour savoir sur quelle zone on clique)
function enveloppe(points) {
  const pts = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  const croix = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const bas = [];
  for (const p of pts) { while (bas.length >= 2 && croix(bas.at(-2), bas.at(-1), p) <= 0) bas.pop(); bas.push(p); }
  const haut = [];
  for (const p of pts.reverse()) { while (haut.length >= 2 && croix(haut.at(-2), haut.at(-1), p) <= 0) haut.pop(); haut.push(p); }
  return bas.slice(0, -1).concat(haut.slice(0, -1));
}
function dedans(pt, poly) {
  let ok = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if (a.y > pt.y !== b.y > pt.y && pt.x < ((b.x - a.x) * (pt.y - a.y)) / (b.y - a.y) + a.x) ok = !ok;
  }
  return ok;
}

export default function Batiment3D({ simRef, selection, onSelection, langue, aria }) {
  const canvasRef = useRef(null);
  const selectionRef = useRef(selection);
  const langueRef = useRef(langue);
  const onSelectionRef = useRef(onSelection);
  selectionRef.current = selection;
  langueRef.current = langue;
  onSelectionRef.current = onSelection;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let largeur = 0, hauteur = 0, animation = 0, temps = 0, dernier = performance.now();
    let couleurs = lireCouleurs();
    const camera = { yaw: -0.62, pitch: -0.38, cibleYaw: -0.62, ciblePitch: -0.38 };
    const glisse = { actif: false, x: 0, y: 0, distance: 0 };
    let survol = null;
    let rotationFan = 0;

    function redimensionner() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      largeur = r.width; hauteur = r.height;
      canvas.width = largeur * ratio; canvas.height = hauteur * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function P3([x, y, z]) {
      const cy = Math.cos(camera.yaw), sy = Math.sin(camera.yaw);
      const x1 = x * cy - z * sy, z1 = x * sy + z * cy;
      const cx = Math.cos(camera.pitch), sx = Math.sin(camera.pitch);
      const y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx + 9;
      const f = Math.min(largeur * 0.95, hauteur * 1.25) * 1.35;
      return { x: largeur / 2 + (x1 * f) / z2, y: hauteur * 0.53 - (y2 * f) / z2, z: z2 };
    }

    const ligne = (a, b, c, alpha = 1, w = 1) => {
      const p = P3(a), q = P3(b);
      ctx.globalAlpha = alpha; ctx.strokeStyle = c; ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
    };
    const poly = (pts3, remplissage, alpha) => {
      const pts = pts3.map(P3);
      ctx.globalAlpha = alpha; ctx.fillStyle = remplissage;
      ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath(); ctx.fill();
      return pts;
    };
    const cube = (b, c, alpha, w) => {
      const { x0, x1, y0, y1, z0, z1 } = b;
      const s = [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]];
      const t = s.map(([x, , z]) => [x, y1, z]);
      for (let i = 0; i < 4; i++) { ligne(s[i], s[(i + 1) % 4], c, alpha, w); ligne(t[i], t[(i + 1) % 4], c, alpha, w); ligne(s[i], t[i], c, alpha, w); }
    };

    function zoneSous(px, py) {
      let meilleure = null;
      for (const z of ZONES) {
        const b = boite(z);
        const coins = [];
        for (const x of [b.x0, b.x1]) for (const y of [b.y0, b.y1]) for (const zz of [b.z0, b.z1]) coins.push(P3([x, y, zz]));
        const env = enveloppe(coins);
        if (dedans({ x: px, y: py }, env)) {
          const prof = coins.reduce((s, c) => s + c.z, 0) / 8;
          if (!meilleure || prof < meilleure.prof) meilleure = { id: z.id, prof };
        }
      }
      return meilleure?.id ?? null;
    }

    function dessiner() {
      const sim = simRef.current;
      ctx.clearRect(0, 0, largeur, hauteur);
      const sel = selectionRef.current;

      // sol
      for (let i = -5; i <= 5; i++) {
        ligne([i * 0.7, BAS, -3.5], [i * 0.7, BAS, 3.5], couleurs.bord, 0.5);
        ligne([-3.5, BAS, i * 0.7], [3.5, BAS, i * 0.7], couleurs.bord, 0.5);
      }

      // zones de la plus éloignée à la plus proche
      const ordre = [...ZONES].sort((a, b) => {
        const ba = boite(a), bb = boite(b);
        return P3([(bb.x0 + bb.x1) / 2, (bb.y0 + bb.y1) / 2, 0]).z - P3([(ba.x0 + ba.x1) / 2, (ba.y0 + ba.y1) / 2, 0]).z;
      });

      for (const def of ordre) {
        const z = sim.zones[def.id];
        const b = boite(def);
        const lum = z.eclairage / 100;
        const plancher = [[b.x0, b.y0 + 0.01, b.z0], [b.x1, b.y0 + 0.01, b.z0], [b.x1, b.y0 + 0.01, b.z1], [b.x0, b.y0 + 0.01, b.z1]];

        // lumière dans la zone
        poly(plancher, "#ffd36b", 0.04 + lum * 0.32);
        if (lum > 0) {
          const plafond = b.y1 - 0.04;
          for (const fx of [0.3, 0.7]) {
            const p = P3([b.x0 + (b.x1 - b.x0) * fx, plafond, 0]);
            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 26 * lum + 4);
            g.addColorStop(0, "rgba(255, 214, 110, 0.9)"); g.addColorStop(1, "rgba(255, 214, 110, 0)");
            ctx.globalAlpha = 0.5 + lum * 0.5; ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(p.x, p.y, 26 * lum + 4, 0, Math.PI * 2); ctx.fill();
          }
        }

        // fenêtres en façade avant (z = -P/2, côté caméra) avec stores
        for (const [fa, fb] of [[0.12, 0.44], [0.56, 0.88]]) {
          const wx0 = b.x0 + (b.x1 - b.x0) * fa, wx1 = b.x0 + (b.x1 - b.x0) * fb;
          const wy0 = b.y0 + 0.22, wy1 = b.y1 - 0.18, fz = -P / 2;
          const vitre = [[wx0, wy0, fz], [wx1, wy0, fz], [wx1, wy1, fz], [wx0, wy1, fz]];
          poly(vitre, lum > 0 ? "#ffd36b" : couleurs.sombre ? "#4aa8ff" : "#8fc7ff", lum > 0 ? 0.12 + lum * 0.4 : 0.1);
          const yStore = wy1 - (wy1 - wy0) * (z.store / 100);
          if (z.store > 1) {
            poly([[wx0, yStore, fz], [wx1, yStore, fz], [wx1, wy1, fz], [wx0, wy1, fz]], couleurs.sombre ? "#cbd5e1" : "#64748b", 0.55);
            for (let y = wy1 - 0.04; y > yStore; y -= 0.05) ligne([wx0, y, fz], [wx1, y, fz], couleurs.sombre ? "#0b1116" : "#ffffff", 0.35, 0.8);
            ligne([wx0, yStore, fz], [wx1, yStore, fz], couleurs.doux, 0.9, 1.5);
          }
          cube({ x0: wx0, x1: wx1, y0: wy0, y1: wy1, z0: fz, z1: fz }, couleurs.doux, 0.6, 1);
        }

        // CVC : flux d'air sous le plafond
        const chaud = z.demandeChaud, froid = z.demandeFroid;
        const flux = Math.max(chaud, froid);
        if (flux > 0.02) {
          const c = chaud > froid ? "#ff6b4a" : "#4aa8ff";
          const n = Math.round(4 + flux * 8);
          for (let i = 0; i < n; i++) {
            const t = (temps * (0.25 + flux * 0.35) + i / n) % 1;
            const x = b.x0 + 0.15 + (b.x1 - b.x0 - 0.3) * t;
            const y = b.y1 - 0.14 - Math.sin(t * Math.PI) * 0.12;
            const p = P3([x, y, P / 2 - 0.35 - (i % 3) * 0.5]);
            ctx.globalAlpha = 0.85 * Math.sin(t * Math.PI); ctx.fillStyle = c;
            ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2); ctx.fill();
          }
        }

        // occupants (petits points)
        for (let i = 0; i < z.occupants; i++) {
          const px = b.x0 + 0.25 + ((i * 0.37) % 1) * (b.x1 - b.x0 - 0.5);
          const pz = -P / 2 + 0.3 + (((i * 0.61) % 1) * (P - 0.6));
          const p = P3([px, b.y0 + 0.18, pz]);
          ctx.globalAlpha = 0.85; ctx.fillStyle = couleurs.texte;
          ctx.beginPath(); ctx.arc(p.x, p.y, 2.6, 0, Math.PI * 2); ctx.fill();
        }

        // sonde T° / CO₂ sur le mur du fond
        const ps = P3([(b.x0 + b.x1) / 2, b.y0 + 0.55, P / 2 - 0.02]);
        const cc = couleurCo2(z.co2);
        const pulse = 0.5 + 0.5 * Math.sin(temps * 3 + def.etage);
        ctx.globalAlpha = 0.25 * pulse; ctx.fillStyle = cc;
        ctx.beginPath(); ctx.arc(ps.x, ps.y, 7 + pulse * 4, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(ps.x, ps.y, 3.5, 0, Math.PI * 2); ctx.fill();

        // contour de la zone
        const estSel = sel === def.id, estSurvol = survol === def.id;
        cube(b, estSel ? couleurs.ambre : couleurs.accent, estSel ? 1 : estSurvol ? 0.85 : 0.45, estSel ? 2.4 : estSurvol ? 1.6 : 1);
      }

      // CTA sur le toit avec son ventilateur
      const cta = { x0: -0.7, x1: 0.7, y0: HAUT, y1: HAUT + 0.45, z0: -0.5, z1: 0.5 };
      cube(cta, couleurs.doux, 0.8, 1.2);
      const ventilMoy = ZONES.reduce((s, z) => s + sim.zones[z.id].ventil, 0) / ZONES.length;
      const centre = [0, HAUT + 0.46, 0];
      for (let i = 0; i < 4; i++) {
        const a = rotationFan + (i * Math.PI) / 2;
        ligne(centre, [Math.cos(a) * 0.32, HAUT + 0.46, Math.sin(a) * 0.32], couleurs.accent, 0.9, 2);
      }
      const pc = P3(centre);
      ctx.font = "500 11px 'IBM Plex Mono', monospace";
      ctx.fillStyle = couleurs.doux; ctx.globalAlpha = 1;
      ctx.fillText(`CTA ${Math.round(ventilMoy)}%`, pc.x + 30, pc.y - 8);

      // étiquettes des sondes (par-dessus tout)
      for (const def of ZONES) {
        const z = sim.zones[def.id];
        const b = boite(def);
        const ps = P3([(b.x0 + b.x1) / 2, b.y0 + 0.55, P / 2 - 0.02]);
        const texte = `${z.temp.toFixed(1)}°C · ${Math.round(z.co2)} ppm`;
        ctx.font = "500 11px 'IBM Plex Mono', monospace";
        const w = ctx.measureText(texte).width + 12;
        ctx.globalAlpha = 0.9; ctx.fillStyle = couleurs.carte;
        ctx.beginPath(); ctx.roundRect(ps.x - w / 2, ps.y - 30, w, 18, 6); ctx.fill();
        ctx.strokeStyle = sel === def.id ? couleurs.ambre : couleurs.bord; ctx.lineWidth = 1; ctx.stroke();
        ctx.globalAlpha = 1; ctx.fillStyle = couleurs.texte;
        ctx.fillText(texte, ps.x - w / 2 + 6, ps.y - 17);
        if (sel === def.id || survol === def.id) {
          ctx.font = "700 12px 'Space Grotesk', sans-serif";
          ctx.fillStyle = sel === def.id ? couleurs.ambre : couleurs.accent;
          const nom = def.nom[langueRef.current];
          ctx.fillText(nom, ps.x - ctx.measureText(nom).width / 2, ps.y - 36);
        }
      }
      ctx.globalAlpha = 1;
    }

    function boucle(t) {
      const dt = Math.min((t - dernier) / 1000, 0.05);
      dernier = t; temps += dt;
      camera.yaw += (camera.cibleYaw - camera.yaw) * 0.15;
      camera.pitch += (camera.ciblePitch - camera.pitch) * 0.15;
      const sim = simRef.current;
      const ventilMoy = ZONES.reduce((s, z) => s + sim.zones[z.id].ventil, 0) / ZONES.length;
      rotationFan += dt * (ventilMoy / 100) * 12;
      if (Math.floor(temps) !== Math.floor(temps - dt)) couleurs = lireCouleurs();
      dessiner();
      animation = requestAnimationFrame(boucle);
    }

    // ----- souris / doigt -----
    const position = (e) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    function appui(e) {
      glisse.actif = true; glisse.distance = 0;
      glisse.x = e.clientX; glisse.y = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    }
    function mouvement(e) {
      if (glisse.actif) {
        const dx = e.clientX - glisse.x, dy = e.clientY - glisse.y;
        glisse.distance += Math.abs(dx) + Math.abs(dy);
        glisse.x = e.clientX; glisse.y = e.clientY;
        camera.cibleYaw += dx * 0.008;
        camera.ciblePitch = Math.max(-0.9, Math.min(-0.05, camera.ciblePitch + dy * 0.005));
      } else {
        const p = position(e);
        survol = zoneSous(p.x, p.y);
        canvas.style.cursor = survol ? "pointer" : "grab";
      }
    }
    function relache(e) {
      if (glisse.actif && glisse.distance < 6) {
        const p = position(e);
        const id = zoneSous(p.x, p.y);
        if (id) onSelectionRef.current(id);
      }
      glisse.actif = false;
    }
    const sortie = () => { survol = null; };

    canvas.addEventListener("pointerdown", appui);
    canvas.addEventListener("pointermove", mouvement);
    canvas.addEventListener("pointerup", relache);
    canvas.addEventListener("pointerleave", sortie);
    const obs = new ResizeObserver(redimensionner);
    obs.observe(canvas);
    redimensionner();
    if (reduit) { dessiner(); animation = setInterval(dessiner, 500); }
    else animation = requestAnimationFrame(boucle);

    return () => {
      cancelAnimationFrame(animation); clearInterval(animation);
      obs.disconnect();
      canvas.removeEventListener("pointerdown", appui);
      canvas.removeEventListener("pointermove", mouvement);
      canvas.removeEventListener("pointerup", relache);
      canvas.removeEventListener("pointerleave", sortie);
    };
  }, [simRef]);

  return <canvas ref={canvasRef} className="batiment-3d" role="img" aria-label={aria} />;
}
