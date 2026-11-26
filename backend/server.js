// server.js — point d'entrée de l'API du portfolio
import express from "express";
import cors from "cors";
import contenu from "./routes/contenu.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

// Autorise le frontend à appeler l'API (FRONTEND_URL en production)
app.use(cors({ origin: process.env.FRONTEND_URL?.split(",") ?? "*" }));

app.get("/", (req, res) => {
  res.json({ message: "API Portfolio de Ludovic Grambert", routes: ["/api/profil", "/api/projets", "/api/competences", "/api/parcours"] });
});

app.use("/api", contenu);

// Toute autre route -> 404 en JSON
app.use((req, res) => {
  res.status(404).json({ erreur: "Route introuvable" });
});

// En local : on écoute un port.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`API prête sur http://localhost:${PORT}`);
  });
}

// Sur Vercel : l'app exportée devient une fonction serverless.
export default app;
