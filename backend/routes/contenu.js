// routes/contenu.js — les routes de contenu du portfolio
import { Router } from "express";
import { profil, projets, competences, parcours } from "../lib/donnees.js";

const router = Router();

// GET /api/profil
router.get("/profil", (req, res) => res.json(profil));

// GET /api/projets            -> tous les projets
// GET /api/projets?tag=IoT    -> seulement ceux qui ont le tag IoT
router.get("/projets", (req, res) => {
  const { tag } = req.query;
  const liste = tag ? projets.filter((p) => p.tags.includes(tag)) : projets;
  res.json(liste);
});

// GET /api/projets/:slug      -> un seul projet (404 s'il n'existe pas)
router.get("/projets/:slug", (req, res) => {
  const projet = projets.find((p) => p.slug === req.params.slug);
  if (!projet) {
    return res.status(404).json({ erreur: "Projet introuvable" });
  }
  res.json(projet);
});

// GET /api/competences
router.get("/competences", (req, res) => res.json(competences));

// GET /api/parcours
router.get("/parcours", (req, res) => res.json(parcours));

export default router;
