import { useEffect, useRef } from "react";

/*
  Bâtiment intelligent en 3D, dessiné à la main dans un <canvas> (sans librairie).
  - un bâtiment en fil de fer de 5 niveaux posé sur une grille
  - des capteurs sur les façades qui envoient des "paquets de données" vers la GTB (sur le toit)
  - la scène tourne doucement et suit la souris
  Les couleurs viennent des variables CSS : elles changent avec le mode clair / sombre.
*/

const NIVEAUX = 5;
const LARGEUR = 2.2; // axe x
const PROFONDEUR = 1.5; // axe z
const HAUTEUR_NIVEAU = 0.5;
const BAS = -1.2; // y du sol
const HUB = [0, BAS + NIVEAUX * HAUTEUR_NIVEAU + 0.75, 0]; // la GTB au-dessus du toit

// --- Géométrie -------------------------------------------------------------
function construireScene() {
  const aretes = [];
  const x = LARGEUR / 2;
  const z = PROFONDEUR / 2;
  const coins = [[-x, -z], [x, -z], [x, z], [-x, z]];

  // contour de chaque plancher
  for (let n = 0; n <= NIVEAUX; n++) {
    const y = BAS + n * HAUTEUR_NIVEAU;
    for (let i = 0; i < 4; i++) {
      const [ax, az] = coins[i];
      const [bx, bz] = coins[(i + 1) % 4];
      aretes.push({ a: [ax, y, az], b: [bx, y, bz], fort: n === 0 || n === NIVEAUX });
    }
  }
  // poteaux d'angle
  const haut = BAS + NIVEAUX * HAUTEUR_NIVEAU;
  coins.forEach(([cx, cz]) => aretes.push({ a: [cx, BAS, cz], b: [cx, haut, cz], fort: true }));
  // meneaux de façade (fenêtres)
  for (const fx of [-x / 3, x / 3]) {
    for (const fz of [-z, z]) aretes.push({ a: [fx, BAS, fz], b: [fx, haut, fz], fort: false });
  }
  for (const fx of [-x, x]) aretes.push({ a: [fx, BAS, 0], b: [fx, haut, 0], fort: false });
  // antenne vers la GTB
  aretes.push({ a: [0, haut, 0], b: HUB, fort: false });

  // capteurs : sur les façades, à mi-hauteur de chaque niveau
  const capteurs = [];
  for (let n = 0; n < NIVEAUX; n++) {
    const y = BAS + (n + 0.5) * HAUTEUR_NIVEAU;
    capteurs.push([(-x * 2) / 3, y, -z], [0, y, z], [x, y, (n % 2 ? -1 : 1) * z / 2], [-x, y, 0]);
  }

  // grille au sol
  const grille = [];
  for (let i = -4; i <= 4; i++) {
    grille.push({ a: [i * 0.75, BAS, -3], b: [i * 0.75, BAS, 3] });
    grille.push({ a: [-3, BAS, i * 0.75], b: [3, BAS, i * 0.75] });
  }

  // poussière de données qui flotte autour
  const particules = Array.from({ length: 70 }, () => [
    (Math.random() - 0.5) * 7,
    BAS + Math.random() * 4.2,
    (Math.random() - 0.5) * 7,
  ]);

  return { aretes, capteurs, grille, particules };
}

function lireCouleurs() {
  const s = getComputedStyle(document.documentElement);
  const v = (nom) => s.getPropertyValue(nom).trim();
  return { accent: v("--accent"), ambre: v("--ambre"), bord: v("--bord"), texte: v("--texte-doux") };
}

// --- Composant -------------------------------------------------------------
export default function Hero3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const scene = construireScene();
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let largeur = 0;
    let hauteur = 0;
    let couleurs = lireCouleurs();
    const souris = { x: 0, y: 0, cibleX: 0, cibleY: 0 };
    // paquets de données : un capteur de départ et une progression de 0 à 1
    const paquets = [];
    let visible = true;
    let animation = 0;
    let dernier = performance.now();
    let temps = 0;

    // adapte la taille du canvas à son conteneur (net sur les écrans Retina)
    function redimensionner() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      largeur = rect.width;
      hauteur = rect.height;
      canvas.width = largeur * ratio;
      canvas.height = hauteur * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (reduit) dessiner();
    }

    // 3D -> 2D : rotation autour de Y puis de X, puis perspective
    function projeter([x, y, z], angleY, angleX) {
      const cy = Math.cos(angleY), sy = Math.sin(angleY);
      const x1 = x * cy - z * sy;
      const z1 = x * sy + z * cy;
      const cx = Math.cos(angleX), sx = Math.sin(angleX);
      const y2 = y * cx - z1 * sx;
      const z2 = y * sx + z1 * cx + 7.5; // recul de la caméra
      const focale = Math.min(largeur, hauteur) * 1.45;
      return { x: largeur / 2 + (x1 * focale) / z2, y: hauteur * 0.52 - (y2 * focale) / z2, z: z2 };
    }

    function ligne(p, q, couleur, alpha, epaisseur) {
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = couleur;
      ctx.lineWidth = epaisseur;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(q.x, q.y);
      ctx.stroke();
    }

    // plus un point est loin, plus il est transparent
    const profondeur = (z) => Math.max(0.15, Math.min(1, 1.6 - (z - 5.5) / 4));

    function dessiner() {
      ctx.clearRect(0, 0, largeur, hauteur);
      const angleY = temps * 0.18 + souris.x * 0.6 + 0.6;
      const angleX = -0.32 + souris.y * 0.18;
      const P = (pt) => projeter(pt, angleY, angleX);

      // grille au sol
      for (const { a, b } of scene.grille) {
        const p = P(a), q = P(b);
        ligne(p, q, couleurs.bord, 0.55 * profondeur((p.z + q.z) / 2), 1);
      }

      // particules
      ctx.fillStyle = couleurs.texte;
      for (const pt of scene.particules) {
        const p = P([pt[0], pt[1] + Math.sin(temps * 0.6 + pt[0]) * 0.08, pt[2]]);
        ctx.globalAlpha = 0.35 * profondeur(p.z);
        ctx.fillRect(p.x, p.y, 1.6, 1.6);
      }

      // bâtiment
      for (const { a, b, fort } of scene.aretes) {
        const p = P(a), q = P(b);
        ligne(p, q, couleurs.accent, (fort ? 0.95 : 0.4) * profondeur((p.z + q.z) / 2), fort ? 1.8 : 1);
      }

      // liaisons capteurs -> GTB (très discrètes)
      const hub = P(HUB);
      for (const c of scene.capteurs) {
        const p = P(c);
        ligne(p, hub, couleurs.accent, 0.07, 1);
      }

      // paquets de données en route vers la GTB
      for (const pq of paquets) {
        const c = scene.capteurs[pq.capteur];
        const t = pq.t;
        const pos = [c[0] + (HUB[0] - c[0]) * t, c[1] + (HUB[1] - c[1]) * t, c[2] + (HUB[2] - c[2]) * t];
        const p = P(pos);
        ctx.globalAlpha = Math.sin(t * Math.PI);
        ctx.fillStyle = couleurs.ambre;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // capteurs (pulsation)
      scene.capteurs.forEach((c, i) => {
        const p = P(c);
        const pulse = 0.5 + 0.5 * Math.sin(temps * 2.2 + i * 1.7);
        ctx.globalAlpha = profondeur(p.z);
        ctx.fillStyle = couleurs.accent;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.25 * pulse * profondeur(p.z);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4 + pulse * 6, 0, Math.PI * 2);
        ctx.fill();
      });

      // la GTB
      const halo = 0.5 + 0.5 * Math.sin(temps * 3);
      ctx.globalAlpha = 0.18 + 0.2 * halo;
      ctx.fillStyle = couleurs.ambre;
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, 10 + halo * 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "500 11px 'IBM Plex Mono', monospace";
      ctx.fillStyle = couleurs.texte;
      ctx.fillText("GTB", hub.x + 12, hub.y + 4);
      ctx.globalAlpha = 1;
    }

    function boucle(maintenant) {
      const dt = Math.min((maintenant - dernier) / 1000, 0.05);
      dernier = maintenant;
      temps += dt;
      // la scène suit la souris en douceur
      souris.x += (souris.cibleX - souris.x) * 0.05;
      souris.y += (souris.cibleY - souris.y) * 0.05;
      // nouveaux paquets de temps en temps
      if (Math.random() < dt * 5) paquets.push({ capteur: Math.floor(Math.random() * scene.capteurs.length), t: 0 });
      for (const pq of paquets) pq.t += dt * 0.55;
      while (paquets.length && paquets[0].t >= 1) paquets.shift();
      // toutes les secondes environ, relit les couleurs (changement de thème)
      if (Math.floor(temps) !== Math.floor(temps - dt)) couleurs = lireCouleurs();
      dessiner();
      if (visible) animation = requestAnimationFrame(boucle);
    }

    function bougerSouris(e) {
      souris.cibleX = (e.clientX / window.innerWidth - 0.5) * 2;
      souris.cibleY = (e.clientY / window.innerHeight - 0.5) * 2;
    }

    const observateurTaille = new ResizeObserver(redimensionner);
    observateurTaille.observe(canvas);
    redimensionner();

    // thème changé : on redessine tout de suite
    const observateurTheme = new MutationObserver(() => {
      couleurs = lireCouleurs();
      if (reduit) dessiner();
    });
    observateurTheme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    // on n'anime que si le canvas est à l'écran (économise la batterie)
    const observateurVue = new IntersectionObserver(([entree]) => {
      visible = entree.isIntersecting;
      if (visible && !reduit) {
        dernier = performance.now();
        cancelAnimationFrame(animation);
        animation = requestAnimationFrame(boucle);
      }
    });

    if (reduit) {
      temps = 2; // image fixe, sans animation
      dessiner();
    } else {
      observateurVue.observe(canvas);
      window.addEventListener("pointermove", bougerSouris);
    }

    return () => {
      cancelAnimationFrame(animation);
      observateurTaille.disconnect();
      observateurTheme.disconnect();
      observateurVue.disconnect();
      window.removeEventListener("pointermove", bougerSouris);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-3d" aria-hidden="true" />;
}
