/*
  Moteur de simulation de la GTB du bâtiment de démo (aucune donnée réelle).
  - 6 zones sur 3 niveaux : éclairage, stores, CVC, ventilation (CTA), sondes T° et CO₂, occupation
  - comptage par usage (éclairage, CVC, ventilation, prises) en kW et kWh
  - alarmes (CO₂, température), scénarios (confort, éco, inoccupation) et journal d'événements
  Une étape = 1 minute de temps simulé.
*/

export const ZONES = [
  { id: "accueil", etage: 0, cote: 0, capacite: 3, nom: { fr: "Accueil", en: "Reception" } },
  { id: "atelier", etage: 0, cote: 1, capacite: 6, nom: { fr: "Atelier", en: "Workshop" } },
  { id: "bureaux-nord", etage: 1, cote: 0, capacite: 8, nom: { fr: "Bureaux Nord", en: "North offices" } },
  { id: "bureaux-sud", etage: 1, cote: 1, capacite: 8, nom: { fr: "Bureaux Sud", en: "South offices" } },
  { id: "reunion", etage: 2, cote: 0, capacite: 10, reunion: true, nom: { fr: "Salle de réunion", en: "Meeting room" } },
  { id: "openspace", etage: 2, cote: 1, capacite: 12, nom: { fr: "Open space", en: "Open space" } },
];

export const USAGES = ["eclairage", "cvc", "ventilation", "prises"];

export const SEUIL_CO2 = 1000; // ppm : alarme qualité d'air
export const ECART_T_BAS = 2; // °C sous la consigne : alarme température basse
export const T_MAX = 26;

const borne = (v, min, max) => Math.min(max, Math.max(min, v));

// Petit générateur pseudo-aléatoire reproductible
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

export function creerEtat() {
  const zones = {};
  ZONES.forEach((z, i) => {
    zones[z.id] = {
      eclairage: 0, eclairageAuto: true,
      store: 20, storeCible: 20, storeAuto: true,
      cvc: "auto", consigne: 21,
      ventil: 20, ventilAuto: true,
      temp: 19.6 + i * 0.2, co2: 450 + i * 12,
      occupants: 0, occupantsForces: null,
      demandeChaud: 0, demandeFroid: 0,
    };
  });
  return {
    minutes: 7 * 60 + 40, // 07:40
    text: 7,
    soleil: 0,
    zones,
    puissances: { eclairage: 0, cvc: 0, ventilation: 0, prises: 0 },
    index: { eclairage: 1284.2, cvc: 5310.7, ventilation: 942.5, prises: 2106.9 },
    historique: [],
    alarmes: [],
    journal: [],
    scenario: "confort",
    hasard: aleatoire(2026),
  };
}

export function formaterHeure(minutes) {
  const m = Math.floor(minutes) % (24 * 60);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

function journaliser(etat, evenement) {
  etat.journal.unshift({ heure: formaterHeure(etat.minutes), ...evenement });
  etat.journal.length = Math.min(etat.journal.length, 40);
}

// Occupation prévue selon l'heure (journée de bureau)
function occupationPrevue(zone, h) {
  const ouvert = (h >= 8 && h < 12) || (h >= 13.5 && h < 18.5);
  if (!ouvert) return 0;
  if (zone.reunion) return (h >= 10 && h < 11.5) || (h >= 14 && h < 16) ? zone.capacite : 0;
  return Math.round(zone.capacite * (h < 9 || h > 17.5 ? 0.4 : 0.85));
}

// ----- Une minute de simulation ---------------------------------------------
export function etape(etat) {
  const r = etat.hasard;
  etat.minutes += 1;
  const h = (etat.minutes % 1440) / 60;

  // Météo de novembre : soleil entre 8h et 17h, 4 à 11 °C dehors
  etat.soleil = h > 8 && h < 17 ? 0.85 * Math.sin((Math.PI * (h - 8)) / 9) : 0;
  etat.text = 7.5 + 3.5 * Math.sin((Math.PI * (h - 9)) / 12);

  const p = { eclairage: 0, cvc: 0, ventilation: 0, prises: 0 };

  for (const def of ZONES) {
    const z = etat.zones[def.id];

    // Occupation : suit le planning, ou la valeur forcée par l'utilisateur
    const cible = z.occupantsForces ?? occupationPrevue(def, h);
    if (z.occupants < cible && r() < 0.35) z.occupants += 1;
    if (z.occupants > cible && r() < 0.35) z.occupants -= 1;

    // Stores : en auto, ils descendent quand le soleil chauffe trop, se ferment la nuit
    if (z.storeAuto) {
      if (etat.scenario === "inoccupation") z.storeCible = 100;
      else if (etat.soleil > 0.55) z.storeCible = 60; // soleil fort : anti-éblouissement et limitation des apports
      else if (etat.soleil > 0) z.storeCible = 15;
      else z.storeCible = 100; // la nuit : stores fermés (isolation)
    }
    z.store += borne(z.storeCible - z.store, -4, 4); // un store descend progressivement

    // Éclairage : en auto, complète la lumière du jour quand la zone est occupée
    if (z.eclairageAuto) {
      const jour = etat.soleil * (1 - z.store / 100);
      z.eclairage = z.occupants > 0 ? Math.round(borne(((0.65 - jour) / 0.65) * 100, 0, 100)) : 0;
      if (etat.scenario === "inoccupation") z.eclairage = 0;
    }

    // CVC : régulation de la température autour de la consigne
    // en auto, programmation horaire : consigne réduite à 17 °C entre 19h et 7h
    z.consigneEffective = z.cvc === "auto" && (h < 7 || h >= 19) ? Math.min(z.consigne, 17) : z.consigne;
    z.demandeChaud = 0;
    z.demandeFroid = 0;
    if (z.cvc === "chaud" || z.cvc === "auto") z.demandeChaud = borne((z.consigneEffective + 0.3 - z.temp) / 0.6, 0, 1);
    if (z.cvc === "froid" || z.cvc === "auto") z.demandeFroid = borne((z.temp - (z.consigneEffective + 1)) / 0.6, 0, 1);

    // Ventilation : en auto, le débit suit le CO₂ (régulation sur la qualité d'air)
    if (z.ventilAuto) {
      z.ventil = Math.round(borne(20 + ((z.co2 - 600) / 400) * 80, etat.scenario === "inoccupation" ? 0 : 20, 100));
    }

    // Thermique de la zone (°C par minute)
    z.temp +=
      0.0015 * (etat.text - z.temp) +
      0.03 * etat.soleil * (1 - z.store / 100) +
      0.0015 * z.occupants +
      0.0006 * (z.eclairage / 100) +
      0.05 * z.demandeChaud -
      0.05 * z.demandeFroid -
      0.002 * (z.ventil / 100) * (z.temp - etat.text) * 0.3;

    // CO₂ : 6 ppm/min par personne, évacué par la ventilation
    z.co2 += 6 * z.occupants - (0.01 + 0.0012 * z.ventil) * (z.co2 - 420);
    z.co2 = Math.max(410, z.co2);

    // Puissances électriques (kW)
    p.eclairage += (z.eclairage / 100) * 0.8;
    p.cvc += (z.demandeChaud + z.demandeFroid) * 2.2;
    p.ventilation += Math.pow(z.ventil / 100, 3) * 1.3; // loi en cube des ventilateurs
    p.prises += 0.15 + z.occupants * 0.12;
  }

  // Comptage : kWh = kW × durée (1 minute = 1/60 h)
  for (const u of USAGES) {
    etat.puissances[u] = p[u];
    etat.index[u] += p[u] / 60;
  }
  const total = USAGES.reduce((s, u) => s + p[u], 0);
  etat.historique.push(total);
  if (etat.historique.length > 180) etat.historique.shift();

  verifierAlarmes(etat);
  return etat;
}

function verifierAlarmes(etat) {
  for (const def of ZONES) {
    const z = etat.zones[def.id];
    const conditions = [
      { type: "co2", actif: z.co2 > SEUIL_CO2 },
      { type: "tempBasse", actif: z.temp < (z.consigneEffective ?? z.consigne) - ECART_T_BAS },
      { type: "tempHaute", actif: z.temp > T_MAX },
    ];
    for (const { type, actif } of conditions) {
      const id = `${def.id}-${type}`;
      const existante = etat.alarmes.find((a) => a.id === id);
      if (actif && !existante) {
        etat.alarmes.unshift({ id, zone: def.id, type, heure: formaterHeure(etat.minutes), acquittee: false });
        journaliser(etat, { type: "alarme", zone: def.id, alarme: type });
      } else if (!actif && existante) {
        etat.alarmes = etat.alarmes.filter((a) => a.id !== id);
        journaliser(etat, { type: "retour", zone: def.id, alarme: type });
      }
    }
  }
}

// ----- Commandes de l'utilisateur -------------------------------------------
export function commander(etat, zoneId, champ, valeur) {
  const z = etat.zones[zoneId];
  z[champ] = valeur;
  if (champ === "occupantsForces" && valeur !== null) z.occupants = valeur; // effet immédiat
  // une commande manuelle repasse l'équipement en mode manuel
  if (champ === "eclairage") z.eclairageAuto = false;
  if (champ === "store") { z.storeAuto = false; z.storeCible = valeur; }
  if (champ === "storeCible") z.storeAuto = false;
  if (champ === "ventil") z.ventilAuto = false;
  if (champ === "storeAuto" && valeur === false) z.storeCible = Math.round(z.store);
  journaliser(etat, { type: "commande", zone: zoneId, champ, valeur });
}

export function appliquerScenario(etat, scenario) {
  etat.scenario = scenario;
  for (const def of ZONES) {
    const z = etat.zones[def.id];
    z.eclairageAuto = true;
    z.storeAuto = true;
    z.ventilAuto = true;
    z.cvc = "auto";
    z.consigne = scenario === "confort" ? 21 : scenario === "eco" ? 19 : 16;
  }
  journaliser(etat, { type: "scenario", scenario });
}

export function acquitterAlarmes(etat) {
  etat.alarmes.forEach((a) => { a.acquittee = true; });
  journaliser(etat, { type: "acquit" });
}
