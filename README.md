# Ludovic Grambert — Portfolio GTB & Smart Building

En Master 2 Manager en ingénierie Smart & Green Building (ESIEE-IT) après 4 ans d'alternance en GTB chez Caldya, je présente ici mon parcours et 10 projets : pilotage de projet, comptage électrique, supervision énergétique IoT et démos GTB interactives.
Le site est une application full-stack : un frontend React qui consomme une API Express.

**🌐 Site en ligne : https://portfolio-sgb-pb72.vercel.app**

## Stack

| Partie | Technologies |
|---|---|
| Frontend | React 19, React Router 7, Vite, CSS (sans framework), Canvas 2D pour la 3D, simulations en JavaScript |
| Backend | Node.js, Express 5, CORS |
| Données | Fichiers JSON (`backend/data/`), sans base de données |
| Hébergement | Vercel : frontend statique + API en fonction serverless |

## Fonctionnalités

- 6 pages : Accueil, À propos, Projets, Détail d'un projet, Compétences, Contact (+ page 404)
- **Version française / anglaise** avec un bouton FR / EN (contenu servi par l'API avec `?lang=en`)
- **Démo GTB en 3D** : bâtiment de 6 zones avec éclairage, stores, CVC, ventilation, sondes de température et de CO₂, comptage par usage, alarmes, scénarios et journal d'événements (données simulées)
- **Supervision du comptage** façon TD électrique : 55 compteurs sur 4 automates M221, statut « compte / ne compte pas / prog horaire », courbe de charge et tableau d'autocontrôle (données simulées)
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

Ajouter `?lang=en` à n'importe quelle route pour la version anglaise (fichiers `backend/data/en/`).

## Modifier le contenu

Tout le texte du site se trouve dans `backend/data/` (français) et `backend/data/en/` (anglais). Les textes de l'interface (menus, boutons) sont dans `frontend/src/i18n/textes.js`.
Pour ajouter un projet, ajouter un objet dans `projets.json` **et** dans `en/projets.json` (même `slug`), puis :
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
│   ├── data/                ← tout le contenu du site (data/en/ : version anglaise)
│   └── tests.http
└── frontend/
    ├── index.html
    ├── vercel.json          ← réécritures pour React Router
    ├── vite.config.js       ← proxy /api -> localhost:3000 en local
    ├── public/              ← CV, favicon, images des projets
    └── src/
        ├── App.jsx, main.jsx, api.js, index.css
        ├── i18n/            ← langue FR / EN et textes de l'interface
        ├── demo/            ← simulations GTB et comptage, bâtiment 3D, courbes
        ├── hooks/           ← useApi, useTheme, useEnVue
        ├── components/      ← Hero3D, Reveal, Compteur, TiltCard, ProjetCard, Navbar…
        └── pages/           ← Accueil, APropos, Projets, ProjetDetail, Competences, Contact, DemoBatiment, DemoComptage, NotFound
```

## Auteur

**Ludovic Grambert** — Master 2 Smart & Green Building, ESIEE-IT · GTB, énergie et bâtiments connectés
ludovic.grambert@orange.fr
