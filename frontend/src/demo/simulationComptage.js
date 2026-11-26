/*
  Supervision du comptage électrique d'un site logistique (données simulées).
  Inspirée d'un autocontrôle réel : 55 compteurs à impulsions remontés par 4 automates
  Modicon M221 vers EcoStruxure Building Operation (AS-P), un mot %MD par compteur.
  Statuts : "compte" (l'index %MD augmente), "nonCompte" (index figé, jamais compté),
  "progHoraire" (éclairage extérieur piloté par programmation horaire).
  Une étape = 2 minutes de temps simulé.
*/

const MIN_PAR_ETAPE = 2;

// Usages possibles d'un départ : nom FR/EN, puissance nominale (kW) et profil horaire
const USAGES = {
  eclQuai: { fr: "Éclairage quai", en: "Dock lighting", kw: 2.4, profil: "jour" },
  eclStock: { fr: "Éclairage stockage", en: "Storage lighting", kw: 4.2, profil: "jour" },
  porte: { fr: "Porte sectionnelle", en: "Sectional door", kw: 0.9, profil: "impulsion" },
  niveleur: { fr: "Niveleur de quai", en: "Dock leveller", kw: 0.7, profil: "impulsion" },
  chargeur: { fr: "Chargeurs chariots", en: "Forklift chargers", kw: 6.5, profil: "nuit" },
  rideau: { fr: "Rideau d'air chaud", en: "Warm air curtain", kw: 3.2, profil: "jour" },
  aerotherme: { fr: "Aérothermes", en: "Unit heaters", kw: 5.5, profil: "continu" },
  pcQuai: { fr: "Bureau de quai", en: "Dock office", kw: 1.1, profil: "jour" },
  cvcBur: { fr: "CVC bureaux", en: "Office HVAC", kw: 3.4, profil: "jour" },
  eclBur: { fr: "Éclairage bureaux", en: "Office lighting", kw: 1.6, profil: "jour" },
  prisesBur: { fr: "Prises bureaux", en: "Office sockets", kw: 1.8, profil: "jour" },
  baie: { fr: "Baie informatique", en: "IT rack", kw: 0.8, profil: "continu" },
  extraction: { fr: "Extraction locaux sociaux", en: "Staff room exhaust", kw: 0.9, profil: "jour" },
  sprinkler: { fr: "Local sprinkler", en: "Sprinkler room", kw: 0.3, profil: "continu" },
  eclParking: { fr: "Éclairage parking", en: "Car park lighting", kw: 1.4, profil: "horaire" },
  ceext: { fr: "TD 05 CEEXT", en: "TD 05 CEEXT (outdoor)", kw: 2.2, profil: "horaire" },
  auvent1: { fr: "Auvent CE1", en: "Canopy CE1", kw: 1.2, profil: "horaire" },
  auvent2: { fr: "Auvent CE2", en: "Canopy CE2", kw: 1.2, profil: "horaire" },
};

// Composition des 4 tableaux (TD), un automate M221 par tableau : 16 + 16 + 13 + 10 = 55 compteurs
const TABLEAUX = [
  { id: "C1", automate: "M221 Cellule 1", td: { fr: "TD Cellule 1", en: "Panel Cell 1" },
    departs: ["eclQuai", "eclQuai", "eclQuai", "eclQuai", "eclStock", "eclStock", "eclStock", "porte", "porte", "niveleur", "niveleur", "chargeur", "chargeur", "rideau", "aerotherme", "pcQuai"] },
  { id: "C3", automate: "M221 Cellule 3", td: { fr: "TD Cellule 3", en: "Panel Cell 3" },
    departs: ["eclQuai", "eclQuai", "eclQuai", "eclQuai", "eclStock", "eclStock", "eclStock", "porte", "porte", "niveleur", "niveleur", "chargeur", "chargeur", "rideau", "aerotherme", "pcQuai"] },
  { id: "C5", automate: "M221 Cellule 5", td: { fr: "TD Cellule 5", en: "Panel Cell 5" },
    departs: ["eclQuai", "eclQuai", "eclQuai", "eclStock", "eclStock", "porte", "porte", "porte", "niveleur", "chargeur", "rideau", "aerotherme", "pcQuai"] },
  { id: "TD06", automate: "M221 TD06", td: { fr: "TD06 — Bureaux et extérieurs", en: "TD06 — Offices and outdoor" },
    departs: ["cvcBur", "eclBur", "prisesBur", "baie", "extraction", "sprinkler", "eclParking", "ceext", "auvent1", "auvent2"] },
];

// Départs qui n'ont jamais compté (constat d'autocontrôle) : index %MD figé
const NON_COMPTANTS = ["C1-14", "C3-11", "C5-08"];

function aleatoire(graine) {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function formaterHeure(minutes) {
  const m = Math.floor(minutes) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export function creerEtat() {
  const r = aleatoire(55);
  const compteurs = [];
  for (const tab of TABLEAUX) {
    const numeros = {};
    tab.departs.forEach((usage, i) => {
      const u = USAGES[usage];
      numeros[usage] = (numeros[usage] ?? 0) + 1;
      const plusieurs = tab.departs.filter((d) => d === usage).length > 1;
      const id = `${tab.id}-${String(i + 1).padStart(2, "0")}`;
      compteurs.push({
        id,
        tableau: tab.id,
        usage,
        nom: { fr: plusieurs ? `${u.fr} ${numeros[usage]}` : u.fr, en: plusieurs ? `${u.en} ${numeros[usage]}` : u.en },
        entree: `%MD${100 + i * 2}`,
        statut: NON_COMPTANTS.includes(id) ? "nonCompte" : u.profil === "horaire" ? "progHoraire" : "compte",
        ferme: true, // disjoncteur du départ
        kwNominal: u.kw * (0.8 + r() * 0.4),
        puissance: 0,
        index: Math.round(2000 + r() * 48000),
        indexDepart: 0,
        historique: [],
        phase: r() * Math.PI * 2,
      });
    });
  }
  compteurs.forEach((c) => { c.indexDepart = c.index; });
  return {
    minutes: 6 * 60 + 30, // 06:30
    compteurs,
    historique: [],
    journal: [],
    hasard: aleatoire(2027),
  };
}

export const tableaux = () => TABLEAUX;

// Facteur de charge (0 à 1) selon le profil et l'heure
function charge(profil, h, r, c) {
  const journee = h >= 6 && h < 21;
  switch (profil) {
    case "jour": return journee ? 0.75 + 0.25 * Math.sin(h + c.phase) : 0.05;
    case "nuit": return h >= 21 || h < 5 ? 0.9 : h >= 12 && h < 14 ? 0.5 : 0.15; // recharge la nuit et à midi
    case "impulsion": return journee && r() < 0.25 ? 1 : 0.02; // manœuvres ponctuelles
    case "continu": return 0.55 + 0.15 * Math.sin(h / 3 + c.phase);
    case "horaire": return h >= 17.25 || h < 7.75 ? 1 : 0; // allumé de 17h15 à 7h45 (novembre)
    default: return 0.5;
  }
}

export function etape(etat) {
  const r = etat.hasard;
  etat.minutes += MIN_PAR_ETAPE;
  const h = (etat.minutes % 1440) / 60;
  let total = 0;

  for (const c of etat.compteurs) {
    const u = USAGES[c.usage];
    const facteur = c.ferme ? charge(u.profil, h, r, c) : 0;
    c.puissance = c.kwNominal * facteur * (0.95 + r() * 0.1);
    total += c.puissance;
    // un compteur "nonCompte" consomme mais l'automate ne voit pas ses impulsions : index figé
    if (c.statut !== "nonCompte") c.index += (c.puissance * MIN_PAR_ETAPE) / 60;
    c.historique.push(c.statut === "nonCompte" ? 0 : c.puissance);
    if (c.historique.length > 90) c.historique.shift();
  }
  etat.historique.push(total);
  if (etat.historique.length > 180) etat.historique.shift();
  return etat;
}

export function basculerDepart(etat, id) {
  const c = etat.compteurs.find((x) => x.id === id);
  c.ferme = !c.ferme;
  etat.journal.unshift({ heure: formaterHeure(etat.minutes), id, ferme: c.ferme });
  etat.journal.length = Math.min(etat.journal.length, 20);
}

// Synthèse pour les indicateurs du haut de page
export function synthese(etat) {
  const cs = etat.compteurs;
  const parTableau = {};
  for (const t of TABLEAUX) parTableau[t.id] = 0;
  let mesure = 0;
  for (const c of cs) {
    parTableau[c.tableau] += c.puissance;
    if (c.statut !== "nonCompte") mesure += c.puissance;
  }
  return {
    total: etat.historique.at(-1) ?? 0,
    mesure, // puissance réellement vue par la GTB
    energie: cs.reduce((s, c) => s + (c.index - c.indexDepart), 0),
    comptant: cs.filter((c) => c.statut !== "nonCompte").length,
    nonComptant: cs.filter((c) => c.statut === "nonCompte"),
    ouverts: cs.filter((c) => !c.ferme).length,
    parTableau,
  };
}
