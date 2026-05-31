---
project_name: 'Fieri'
user_name: 'Kavt'
date: '2026-05-30'
sections_completed: ['technology_stack', 'implementation_rules', 'language_framework_rules', 'code_quality_style', 'critical_dont_miss_rules']
status: 'complete'
rule_count: 17
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Stack technique & Versions

- **Framework principal** : React 19 (`react` & `react-dom` `^19.2.6`)
  - *Règle critique* : Utiliser la syntaxe native React 19 — les refs sont passées en props simples (`<Component ref={myRef} />`), `forwardRef` est obsolète.
- **Outil de build** : Vite 8 (`vite` `^8.0.12`)
- **Styling** : Tailwind CSS v4 (`tailwindcss` & `@tailwindcss/vite` `^4.3.0`)
  - *Règle critique* : Aucun fichier `tailwind.config.js` ni `postcss.config.js`. Tout jeton de thème (couleur, police, animation) se déclare exclusivement dans le bloc `@theme` de `/src/index.css`.
- **Animations & Icônes** : Framer Motion 12 (`framer-motion` `^12.40.0`) et Lucide React (`lucide-react` `^1.17.0`)
- **Compilateur & Qualité** : React Compiler activé (`babel-plugin-react-compiler` `^1.0.0` & `@rolldown/plugin-babel`) — ESLint 10 (`eslint` `^10.3.0`)
  - *Règle critique* : Écrire du code strictement pur (pas de mutation des props, fonctions de rendu sans effets de bord) pour ne pas invalider l'optimisation automatique du compilateur.

## Règles d'implémentation critiques

- **Tailwind CSS v4** : Interdiction absolue de `tailwind.config.js`. Extensions de thème dans `@theme { }` de `/src/index.css` uniquement.
- **Pas de routeur client-side** : Le routage est géré par l'état React local dans `src/App.jsx`. Ne pas installer React Router ou tout autre package de routage sans validation explicite.
- **Contenu centralisé** : Les textes statiques de la landing page sont dans `src/content/landing.json`. Ne jamais hardcoder des chaînes directement dans un composant JSX.
- **Design System « Dark Cosmique »** : Respecter l'identité visuelle définie dans `src/index.css` (`.glass-panel`, halos radiaux, tracés de circuits SVG). Utiliser les variables CSS sémantiques (`bg-bg-primary`, `text-text-primary`, `fieri-blue`, etc.).
- **React Compiler** : Tout code doit respecter la pureté stricte React. Exécuter `npm run build` avant de soumettre pour vérifier que le compilateur valide sans erreur.

## Règles Langage & Framework (React / JSX)

### Patterns d'import/export

- Tous les composants utilisent `export default` — pas d'exports nommés.
- Inclure `import React from 'react'` explicitement dans chaque fichier JSX (requis avec le React Compiler).
- Toujours spécifier l'extension `.jsx` dans les chemins d'import (ex. `'../components/home/HeroSection.jsx'`).

### Structure des composants

- Les sections de la landing page sont des composants autonomes dans `src/components/home/`.
- Chaque section reçoit ses données via props depuis `Home.jsx`, qui les extrait de `landing.json` à la racine.
- La prop `navigate` est transmise uniquement aux sections qui déclenchent une navigation inter-pages.
- Toute nouvelle section doit être : (1) créée dans `src/components/home/`, (2) importée et rendue dans `Home.jsx`, et (3) son écran cible enregistré dans le `renderPage()` de `App.jsx`.

### Patterns d'animation Framer Motion

- Utiliser le composant `<FadeInWhenVisible>` (`src/components/home/FadeInWhenVisible.jsx`) pour toutes les animations d'entrée au scroll. Ne pas recréer cette logique inline.
  - Props : `direction` (`'up'|'down'|'left'|'right'`), `delay` (nombre, secondes), `duration` (nombre, secondes).
  - Configuré avec `{ once: true, margin: '-80px' }` — ne pas modifier ce comportement par défaut.
- La courbe d'accélération standard du projet est `ease: [0.16, 1, 0.3, 1]` (cubic easeOut). À utiliser systématiquement pour toute nouvelle transition.
- Utiliser `<AnimatedCounter>` (`src/components/home/AnimatedCounter.jsx`) pour les valeurs numériques animées ; il gère automatiquement le parsing du suffixe (ex. `"5000+"`, `"98%"`).

### Gestion de l'état

- Aucun store global (pas de Zustand, Redux, Jotai, etc.). L'état applicatif global est géré dans `App.jsx` via `useState`.
- Les données utilisateur authentifié (`user`) et le thème actif sont stockés dans `App.jsx` et transmis aux pages via props.
- Toute nouvelle page nécessitant l'état utilisateur doit recevoir les props `user`, `navigate` et `setUser` depuis `App.jsx`.

## Règles de qualité & style de code

### Configuration ESLint

- Format de config flat ESLint v10 (`eslint.config.js`) — ne pas créer de `.eslintrc.json` ou `.eslintrc.js`.
- Plugins actifs : `eslint-plugin-react-hooks` (règles de Hooks) et `eslint-plugin-react-refresh` (HMR Vite).
- Fichiers lintés : `**/*.{js,jsx}` uniquement. Le répertoire `dist/` est ignoré.

### Conventions de nommage

- **Composants React** : `PascalCase` (ex. `HeroSection`, `FadeInWhenVisible`).
- **Fonctions utilitaires** : `camelCase` avec verbe d'action (ex. `getClubIcon`, `handleSubmit`).
- **IDs HTML de sections** : `kebab-case` minuscules (ex. `id="clubs"`, `id="contact"`).
- **Props** : `camelCase`, correspondant exactement aux clés de `landing.json` quand elles viennent du JSON.

### Organisation des fichiers

- Sections de page : `src/components/home/NomSection.jsx`.
- Composants utilitaires transversaux : `src/components/NomComposant.jsx` (ex. `Logo.jsx`).
- Aucun fichier `.module.css` — tout le styling passe par les classes Tailwind et les classes utilitaires globales de `src/index.css`.
- Assets statiques (images, SVG) : `src/assets/`.

### Patterns de mise en page

- **Conteneur standard de section** : `max-w-[92rem] mx-auto w-full` avec padding `py-24 px-6 md:px-12 lg:px-24`.
- **Halos lumineux de fond** : `<div>` absolus avec classes `pointer-events-none` et `z-0` — ne jamais omettre ces deux classes pour éviter de bloquer les interactions.
- **Basculement Desktop/Mobile** : `hidden lg:flex` / `lg:hidden` pour les layouts fondamentalement différents. Réserver `md:` aux ajustements fins de padding ou de taille.
- **Boutons CTA primaires** : `bg-accent-primary text-text-primary font-bold cursor-pointer` avec `hover:bg-accent-primary/95 transition-all`.

## Règles critiques — Anti-patterns & cas limites

### Navigation inter-pages

- Toujours appeler `navigate('nom-page')` pour changer de page — ne jamais appeler `setCurrentPage` directement depuis un composant enfant.
- `navigate()` accepte un second argument `params` pour transmettre un contexte de détail :
  - `navigate('project-detail', { projectId: 'p1' })` → charge `selectedProjectId`.
  - `navigate('profile', { researcherId: 'r1' })` → charge `selectedResearcherId`.
- Les identifiants de pages dans `navigate()` doivent correspondre **exactement** aux `case` du switch `renderPage()` dans `App.jsx` : `'home'`, `'clubs'`, `'project-detail'`, `'student-portal'`, etc. (format kebab-case).
- Ne **jamais** appeler `window.scrollTo()` dans un composant : `navigate()` le déclenche automatiquement.

### Thème clair/sombre

- Le thème est géré exclusivement par ajout/suppression de la classe `light-theme` sur `document.body`.
- Aucun composant ne doit gérer le thème via des props ou un état local. Les variables CSS (`var(--color-bg-primary)`, etc.) changent automatiquement.
- Utiliser exclusivement les classes Tailwind sémantiques (`bg-bg-primary`, `text-text-secondary`, etc.) — jamais de valeurs de couleur codées en dur (`#080B14`, `rgba(...)`).

### Session utilisateur & API

- La session est restaurée au démarrage depuis `localStorage` via `api.auth.getLocalUser()` (initializer de `useState`).
- La déconnexion utilise `api.auth.logout()` puis `setUser(null)` — ne pas manipuler `localStorage` directement.
- Tous les appels réseau passent par `src/services/api.js`. Ne pas utiliser `fetch` ou `axios` directement dans les composants.

### Navbar & overlays

- La navbar est une capsule `fixed top-3` avec fermeture automatique par détection de clic en dehors via un listener `mousedown` global ciblé sur `.pointer-events-auto`.
- Tout nouvel overlay ou panel flottant doit contenir la classe `pointer-events-auto` pour ne pas être fermé intempestivement par ce mécanisme.

---

## Directives d'utilisation

**Pour les agents IA :**

- Lire ce fichier **avant** d'implémenter tout code dans ce projet.
- Respecter **toutes** les règles telles qu'elles sont documentées.
- En cas de doute, préférer l'option la plus restrictive.
- Signaler toute règle manquante ou tout nouveau pattern émergent.

**Pour les développeurs humains :**

- Maintenir ce fichier concis et centré sur les besoins des agents.
- Mettre à jour en cas de changement de stack technique ou d'ajout d'un pattern structurant.
- Réviser trimestriellement pour retirer les règles devenues évidentes.
- Ne pas documenter ici ce que tout développeur React connaît déjà — concentrer sur l'**inobvieux**.

_Dernière mise à jour : 2026-05-30 — Kavt_
