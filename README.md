# Ludovic Grambert — Portfolio GTB & Smart Building

Technicien GTB en alternance chez Caldya et étudiant en Master Smart & Green Building (ESIEE-IT), je présente ici mon parcours et 10 projets, du comptage électrique sur chantier à la supervision énergétique IoT.
Le site est une application full-stack : un frontend React qui consomme une API Express.

**🌐 Site en ligne : https://ludovic-grambert.vercel.app** *(adresse à mettre à jour après le déploiement)*

## Stack

| Partie | Technologies |
|---|---|
| Frontend | React 19, React Router 7, Vite, CSS (sans framework), Canvas 2D pour la 3D |
| Backend | Node.js, Express 5, CORS |
| Données | Fichiers JSON (`backend/data/`), sans base de données |
| Hébergement | Vercel : frontend statique + API en fonction serverless |

## Fonctionnalités

- 6 pages : Accueil, À propos, Projets, Détail d'un projet, Compétences, Contact (+ page 404)
- Bâtiment intelligent en 3D animé (Canvas, sans librairie) qui suit la souris
- Animations au scroll, compteurs animés, cartes inclinables en 3D
- Recherche de projets combinée à un filtre par thème
- Mode clair / sombre mémorisé dans le navigateur
- CV téléchargeable en PDF
- Responsive (testé à 390 px), navigation au clavier, réglage « réduire les animations » respecté
- Un titre et une description par page (SEO)

## Lancer le projet en local

Prérequis : Node.js 22 ou plus récent.

**Avec VS Code (le plus simple)** : ouvrir le dossier, puis **Terminal > Run Task… > Démarrer le portfolio**.

**Ou dans deux terminaux :**
```bash
# Terminal 1 — API sur http://localhost:3000
cd backend
npm install
npm run dev

# Terminal 2 — site sur http://localhost:5173
cd frontend
npm install
npm run dev
```

L'API se teste avec `backend/tests.http` (extension VS Code *REST Client*).

## API

| Route | Réponse |
|---|---|
| `GET /api/profil` | profil, chiffres clés, domaines |
| `GET /api/projets` | tous les projets (`?tag=IoT` pour filtrer) |
| `GET /api/projets/:slug` | un projet, ou 404 |
| `GET /api/competences` | compétences par groupe |
| `GET /api/parcours` | formations et expériences |

## Modifier le contenu

Tout le texte du site se trouve dans `backend/data/`. Pour ajouter un projet, ajouter un objet dans `projets.json`, puis :
```bash
git add backend/data/projets.json
git commit -m "Ajout du projet ..."
git push
```
Vercel redéploie tout seul en une minute environ. Les images vont dans `frontend/public/images/projets/`.

## Déploiement sur Vercel

Un seul dépôt GitHub, mais deux projets Vercel :

| Projet Vercel | Root Directory | Variable d'environnement |
|---|---|---|
| API | `backend` | `FRONTEND_URL` = adresse du site (pour CORS) |
| Site | `frontend` (preset Vite) | `VITE_API_URL` = adresse de l'API |

- `frontend/vercel.json` renvoie toutes les adresses vers `index.html` : React Router gère les pages, sans erreur 404 au rechargement.
- Après avoir modifié une variable, il faut faire **Deployments > Redeploy**.
- `VITE_API_URL` est publique : ne jamais y mettre de secret.

## Structure

```
portfolio-sgb/
├── backend/
│   ├── server.js            ← app Express (exportée pour Vercel)
│   ├── routes/contenu.js    ← routes /api/...
│   ├── lib/donnees.js       ← chargement des JSON
│   ├── data/                ← tout le contenu du site
│   └── tests.http
└── frontend/
    ├── index.html
    ├── vercel.json          ← réécritures pour React Router
    ├── vite.config.js       ← proxy /api -> localhost:3000 en local
    ├── public/              ← CV, favicon, images des projets
    └── src/
        ├── App.jsx, main.jsx, api.js, index.css
        ├── hooks/           ← useApi, useTheme, useEnVue
        ├── components/      ← Hero3D, Reveal, Compteur, TiltCard, ProjetCard, Navbar…
        └── pages/           ← Accueil, APropos, Projets, ProjetDetail, Competences, Contact, NotFound
```

## Auteur

**Ludovic Grambert** — Technicien GTB · Master Smart & Green Building, ESIEE-IT
ludovic.grambert@orange.fr
