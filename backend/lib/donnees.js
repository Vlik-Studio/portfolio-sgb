// lib/donnees.js — charge les fichiers JSON, en français (data/) et en anglais (data/en/)
// Imports statiques : Vercel voit ces fichiers et les embarque dans la fonction serverless,
// et `node --watch` redémarre l'API dès qu'on modifie un JSON en local.
import profil from "../data/profil.json" with { type: "json" };
import projets from "../data/projets.json" with { type: "json" };
import competences from "../data/competences.json" with { type: "json" };
import parcours from "../data/parcours.json" with { type: "json" };
import profilEn from "../data/en/profil.json" with { type: "json" };
import projetsEn from "../data/en/projets.json" with { type: "json" };
import competencesEn from "../data/en/competences.json" with { type: "json" };
import parcoursEn from "../data/en/parcours.json" with { type: "json" };

const contenus = {
  fr: { profil, projets, competences, parcours },
  en: { profil: profilEn, projets: projetsEn, competences: competencesEn, parcours: parcoursEn },
};

// Renvoie le contenu dans la langue demandée (français par défaut)
export function contenu(langue) {
  return contenus[langue] ?? contenus.fr;
}
