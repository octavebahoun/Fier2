# FIERI Research

Plateforme numérique de gestion de la recherche académique — un écosystème immersif mêlant veille scientifique, gestion de projets, mise en réseau des chercheurs et valorisation de l'innovation.

## Stack technique

- **React 19** avec compilateur React et HMR
- **Vite 8** — build ultra-rapide, alias `@/` vers `src/`
- **Tailwind CSS v4** — CSS-first, zero config legacy, compilé via `@tailwindcss/vite`
- **Framer Motion 12** — animations déclaratives et transitions de page
- **Lucide React** — icônes légères et cohérentes
- **Vitest** — tests unitaires

## Fonctionnalités principales

- 18 pages interactives (Accueil, Projets, Ateliers, Événements, Profil Chercheur, Dashboard, Admin…)
- Double thème sombre/clair (Cosmique / Aube Cosmique) avec glassmorphism
- Authentification à 4 rôles (Admin, Chercheur, Étudiant, Invité)
- Sidebar Chercheur/Admin avec états contracté/déployé
- API backend NestJS : `http://localhost:3000` en développement, Vercel en production (aucun mock réseau)
- États systématiques : chargement, erreur, vide, validation de formulaire
- Accessibilité : skip-to-content, focus trap, ARIA, `prefers-reduced-motion`, touch targets ≥44×44px

## Démarrer

```bash
npm install
npm run dev        # http://localhost:5173
```

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualisation du build |
| `npm run lint` | Vérification ESLint |

## Structure

```
src/
├── App.jsx              # Routes et état global (router dans main.jsx)
├── main.jsx             # Point d'entrée, providers (Auth, Data), BrowserRouter
├── index.css            # Thèmes (dark/light), animations, glassmorphism
├── pages/               # 18 écrans (Home, Projects, Dashboard, Admin…)
├── components/
│   ├── home/            # Sections de la page d'accueil
│   ├── layout/          # AppLayout, Navbar, Footer, Sidebar
│   ├── dashboard/       # Composants du Dashboard
│   ├── CommandPalette.jsx
│   ├── Logo.jsx
│   ├── PerspectiveGrid.jsx
│   └── ResearchersCarousel.jsx
├── context/
│   ├── AuthContext.jsx  # Authentification et rôles
│   └── DataContext.jsx  # Données globales
├── services/
│   ├── api.js           # Wrapper réseau (API backend NestJS)
│   ├── adapters.js      # Normalisation des réponses backend
│   └── notifications.js
└── assets/
```

## Backend

L'API NestJS + Prisma vit dans [`backend_fieri/`](./backend_fieri/) (dépôt git séparé) : voir [backend_fieri/README.md](./backend_fieri/README.md) pour la stack, le démarrage, les variables d'environnement et le déploiement Vercel.

## Design system

Le design est spécifié dans les documents canoniques :
- **DESIGN.md** — couleurs, typographie (Plus Jakarta Sans), espacement, glassmorphism, composants
- **EXPERIENCE.md** — patterns d'état, animations, accessibilité, comportements

Palette sombre fondée sur des abyssaux (`#080B14`, `#0D1120`) avec accents Orange Brûlé et Ambre. Palette claire sur blanc cassé (`#FAFBFF`) avec Violet Royal (`#6C4CF1`) pour la marque.
