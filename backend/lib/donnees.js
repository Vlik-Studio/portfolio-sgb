// lib/donnees.js — charge les fichiers JSON du dossier data/
// Imports statiques : Vercel voit ces fichiers et les embarque dans la fonction serverless,
// et `node --watch` redémarre l'API dès qu'on modifie un JSON en local.
import profil from "../data/profil.json" with { type: "json" };
import projets from "../data/projets.json" with { type: "json" };
import competences from "../data/competences.json" with { type: "json" };
import parcours from "../data/parcours.json" with { type: "json" };

export { profil, projets, competences, parcours };
