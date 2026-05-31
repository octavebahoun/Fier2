---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - '_bmad-output/planning-artifacts/prds/prd-Fieri-2026-05-30/prd.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-Fieri-2026-05-30/index.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-Fieri-2026-05-30/DESIGN.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-Fieri-2026-05-30/EXPERIENCE.md'
  - 'api suite.md'
  - 'doc_api_fieri.http'
  - 'ancien_contenu.json'
workflowType: 'architecture'
project_name: 'Fieri'
user_name: 'Kavt'
date: '2026-05-30'
lastStep: 8
status: 'complete'
completedAt: '2026-05-30'
---

# Architecture Decision Document — FIERI Research

_Ce document est le contrat de conception d'architecture technique (Solution Design) pour la plateforme **FIERI Research**, construit de manière collaborative et incrémentale par étape de découverte._

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
- **Routage SPA par état centralisé :** Orchestration de 14 écrans majeurs au sein de `src/App.jsx` pilotés par des états de navigation réactifs (Home, StudentPortal, News, ResearchClubs, Projects, ProjectDetail, Workshops, Events, Members, Dashboard, Profile, Contact, Auth, Opportunities).
- **Matrice d'accès à 4 rôles (Gating) :** Gestion dynamique de l'interface et blocage des actions transactionnelles (adhérer, s'inscrire, financer) selon le profil utilisateur (Visiteur, Membre, Chercheur, Admin).
- **Résilience API Hybride :** Conception d'un intercepteur client (`src/services/api.js`) capable de basculer silencieusement sur le fichier local de secours `ancien_contenu.json` / `mockDb` en mode développement lors d'une erreur `404` ou d'une panne réseau, tout en garantissant des échecs stricts en production pour l'API Vercel (`https://backend-fieri.vercel.app`).
- **Pré-chargement des Métadonnées globales :** Mise en cache dès l'initialisation des listes d'organisation (Pays, Universités, Branches) pour éradiquer les latences de requêtes lors des étapes d'inscription.

**Non-Functional Requirements:**
- **Sécurité et Authentification :** Injection automatique du jeton JWT via l'en-tête `Authorization: Bearer <token>` pour toutes les requêtes transactionnelles, et garde-barrière (Guard) sur `/dashboard` redirigeant vers `/auth` en cas de session absente.
- **Charte Esthétique Premium :** Application uniforme du style "SaaS Scientifique" (Glassmorphism, coins carrés nets à 4px-8px, police Plus Jakarta Sans, élévation Bento à `-4px` au survol, et voyant d'événement live pulsant).
- **Performance et Accessibilité :** Transition de page douce en 200ms avec défilement automatique vers le haut, respect scrupuleux des ratios de contraste WCAG 2.2 AA pour le Violet Royal `#6C4CF1` et l'Orange Brûlé `#E76F00` sur fonds clairs/sombres.

**Scale & Complexity:**
- **Domaine Technique Primaire :** Application Web Frontend React Single-Page Application (SPA) connectée à une API Serverless externe et disposant d'un moteur de fallback résilient local.
- **Niveau de Complexité :** **Moyen-Élevé (Medium-High)**. Gérer 14 écrans interactifs, un système de rôles avec gating de sécurité, un système de cache de métadonnées, une double palette thématique (Cosmique Sombre & Aube Claire), et un intercepteur de secours API hybride nécessite une architecture propre et découplée pour éviter les conflits d'intégration.
- **Composants d'Architecture Estimés :**
  1. **Router & View Manager (`App.jsx`)** : Gestionnaire d'affichage basé sur l'état.
  2. **API Client Interceptor (`services/api.js`)** : Point d'accès réseau avec logique de résilience.
  3. **Auth Context Provider (`context/AuthContext.jsx`)** : Stockage du JWT, rôle utilisateur et routeguards.
  4. **Mock Database Adapter (`services/mockDb.js`)** : Parseur de secours lisant `ancien_contenu.json`.
  5. **Bento Layout Engine & Collapsible Sidebar** : Bibliothèque de composants graphiques.

### Technical Constraints & Dependencies
- Exécution stricte de la variable `NODE_ENV === 'development'` pour le déclenchement de la résilience mock.
- Cache persistent du JWT et de l'état de thème dans le `localStorage` du navigateur.
- Respect strict des ratios d'accessibilité WCAG AA (contraste >= 4.5:1).

### Cross-Cutting Concerns Identified
- Interception globale des exceptions HTTP sans blocage UI (Toasts d'alerte).
- Squelettes de chargement unifiés (translucides à pulsation douce).
- Directives d'écriture microcopy de style scientifique rigoureux et vivant (en français).

---

## Starter Template Evaluation

### Primary Technology Domain
**Application Web SPA (Single Page Application)** moderne avec rendu interactif côté client, alimentée par des services d'API externes (Vercel) et une résilience locale intégrée.

### Starter Options Considered
1. **Création à partir de zéro (Vite standard) :** Rejeté car il nécessiterait de configurer manuellement le compilateur React 19, Tailwind v4 et Framer Motion, avec un risque élevé d'incompatibilité de versions.
2. **Frameworks lourds (Next.js / Remix) :** Rejeté car les exigences actuelles demandent une Single Page Application réactive orchestrée côté client (`src/App.jsx`) et hébergable de façon statique simple sans dépendance serveur Node.js lourde.
3. **Socle Pré-configuré Existant (Sélectionné) :** Solution idéale. Notre dépôt dispose déjà d'un environnement minutieusement configuré, prêt à l'emploi et d'une modernité absolue.

### Selected Starter: Existing Pre-configured React 19 + Vite 8 + Tailwind v4 Workspace

**Rationale for Selection:**
Le socle déjà présent élimine tout travail de plomberie technique. L'intégration conjointe de **React 19** (et de son compilateur automatique de mémoïsation), de **Vite 8** (le bundler ultra-rapide de nouvelle génération), et de **Tailwind CSS v4** (architecture CSS-first ultra-rapide) fournit la fondation parfaite pour supporter nos contraintes d'animations premium (Framer Motion v12) et de Bento Grid dynamiques, tout en restant extrêmement léger et fluide.

**Initialization Command:**
Le projet étant déjà initialisé, l'installation des dépendances se fait via :
```bash
npm install
```

**Architectural Decisions Provided by Starter:**

- **Language & Runtime :** JavaScript moderne (ESM, `"type": "module"`) s'exécutant sur Node.js (v18+) avec des configurations typées pour React (`@types/react` v19 et `@types/react-dom` v19).
- **Styling Solution (Tailwind CSS v4) :** Intégration moderne CSS-first via le plugin officiel `@tailwindcss/vite` v4.3.0. Fini le fichier lourd `tailwind.config.js` ; la configuration des jetons de design (couleurs, polices, thèmes clair/sombre) est gérée directement via les directives `@theme` dans `src/index.css`, garantissant des performances de build exceptionnelles et un code plus propre.
- **Build Tooling (Vite 8 & React Compiler) :** Utilisation de Vite v8.0.12 combiné à `@vitejs/plugin-react` v6.0.1 et `@rolldown/plugin-babel`. Intégration de `babel-plugin-react-compiler` v1.0.0 pour la mémoïsation automatique des composants, évitant aux développeurs d'écrire des hooks complexes de performance (`useMemo`, `useCallback`).
- **Testing & Animations :** Support natif de Framer Motion v12.4.0 pour des micro-interactions cinématiques fluides et de Lucide React v1.17 pour des icônes filaires élégantes.
- **Code Organization :** Structure orientée composants et services (séparation claire de `src/components`, `src/pages`, `src/services`, et `src/context`).
- **Development Experience :** ESLint v10.3.0 configuré avec le parseur moderne pour une détection stricte des anomalies et le respect des règles de hooks React (`eslint-plugin-react-hooks`).

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- **Moteur d'Affichage & Routage SPA :** Routage interne par états réactifs (`view` ou `page`) au sein de `src/App.jsx` plutôt qu'un routeur externe lourd, afin d'optimiser le contrôle du cycle de vie des transitions cinématiques (Framer Motion v12).
- **Moteur de Résilience API Hybride :** Conception de l'intercepteur client (`src/services/api.js`) capable de basculer silencieusement de l'API de Production Vercel vers un Mock local en lisant `ancien_contenu.json` uniquement sous l'environnement de développement local (`NODE_ENV === 'development'`).
- **Système de Rôles et Autorisations (Gating) :** Définition d'un contexte global de session (`AuthContext`) gérant 4 niveaux d'accès distincts (Visiteur, Membre, Chercheur, Admin) pour filtrer l'accès aux interfaces transactionnelles.

**Important Decisions (Shape Architecture):**
- **Thémisation à Double Palette (Dark Cosmique & Light Aube) :** Intégration de la charte de couleurs via les directives CSS `@theme` de Tailwind v4, contrôlée par un état global `theme` commuté via une classe CSS `.dark` appliquée sur l'élément racine `<html>`.
- **Stratégie de Cache des Métadonnées :** Mise en cache permanente dans le `localStorage` des listes d'Universités, Pays et Branches d'études après la première requête d'initialisation, pour éradiquer tout temps d'attente utilisateur sur les formulaires complexes.

**Deferred Decisions (Post-MVP):**
- **Persistance SQL/NoSQL côté serveur :** La structure des données d'écriture (comme les nouveaux projets ou inscriptions) sera temporairement stockée dans une base locale simulée via `localStorage` (moteur de secours) en attendant le branchement définitif des endpoints d'écriture de l'API Serverless externe de FIERI.

---

### Data Architecture

#### 1. Stockage Local & Persistance Simulée
- **Technologie :** Adaptateur de secours local `src/services/mockDb.js` + Stockage `localStorage` pour les données modifiées (ex: nouveaux projets de recherche, inscriptions aux clubs).
- **Version :** API native Web LocalStorage.
- **Rationale :** Permet une fidélité d'usage 100% autonome en environnement local de développement sans avoir besoin d'écrire immédiatement un middleware d'écriture côté serveur.
- **Affects :** Écrans `Projects`, `ResearchClubs`, `Members`, et `Opportunities`.

#### 2. Cache de Métadonnées Globale (Pre-loading)
- **Approche :** Chargement asynchrone des métadonnées (Pays, Universités, Spécialités académiques) au montage de l'application dans un contexte de données (`DataContext`).
- **Rationale :** Évite les requêtes HTTP redondantes à chaque ouverture de formulaire d'inscription ou d'édition, rendant les transitions instantanées.

---

### Authentication & Security

#### 1. Contexte d'Authentification (`AuthContext.jsx`)
- **Technologie :** React Context API natif (React 19).
- **Structure :** Stocke l'état d'authentification (`user`, `token`, `role`). Le rôle par défaut en l'absence de session est `Visiteur`. Le jeton JWT est persisté dans le `localStorage`.
- **Rationale :** Offre un "Single Source of Truth" léger et facilement accessible par tous les composants enfants pour adapter dynamiquement l'interface (ex: masquer ou désactiver un bouton d'adhésion pour les simples Visiteurs).

#### 2. Gating et RouteGuards
- **Approche :** Guard fonctionnel intégré au Router de `App.jsx`. Toute tentative d'affichage d'un écran restreint (ex: `Dashboard`, `Profile`) sans session active redirige immédiatement vers l'écran `Auth`.
- **Rôles Applicatifs :**
  - **Visiteur** : Lecture seule des clubs, projets, actualités et opportunités.
  - **Membre** : Peut adhérer à un club, rejoindre un projet, s'inscrire à des ateliers.
  - **Chercheur** : Membre + Capacité de publier un projet de recherche et proposer une opportunité de stage/thèse.
  - **Admin** : Tous droits d'administration (approbation des clubs, projets, gestion des rôles).

---

### API & Communication Patterns

#### 1. Intercepteur de Résilience Hybride (`services/api.js`)
- **Technologie :** Module d'appel HTTP natif basé sur `fetch` avec encapsulation de requête (Wrapper de service réseau).
- **Logique de Fallback :**
  ```javascript
  // Schéma de principe de l'intercepteur résilient :
  async function apiRequest(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, options);
      if (!response.ok && process.env.NODE_ENV === 'development') {
        throw new Error(`API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn("API indisponible. Activation du moteur de résilience local.");
        return mockDb.fallback(endpoint, options);
      }
      throw error; // En production, on lève l'exception pour notification UI
    }
  }
  ```
- **Rationale :** Assure une robustesse parfaite durant les démonstrations de l'excellence team et permet aux développeurs de travailler hors ligne en mode mock sans casser les appels réseau réels configurés pour la production.

#### 2. Standards de Gestion des Erreurs
- **Technologie :** Notifications Toasts non bloquantes et fluides (micro-toasts stylisés avec des animations douces de sortie).
- **Rationale :** Fournit un retour instantané à l'utilisateur sans rompre l'immersion esthétique ou figer l'interface.

---

### Frontend Architecture

#### 1. State Management & Navigation SPA
- **Technologie :** Double Contexte React (`AuthContext` + `DataContext`) associé à un système d'état de vue centralisé dans `src/App.jsx`.
- **Rationale :** Évite la sur-complexité de Redux ou Zustand pour une SPA de 14 écrans où la réactivité et les micro-interactions de Framer Motion sont prioritaires.
- **Routage :**
  - L'URL n'est pas modifiée par un routeur physique lourd ; la navigation se fait par transitions d'états réactifs (ex: `setCurrentView('Dashboard')`), avec déclenchement de transitions fluides et repositionnement automatique de la vue au sommet de l'écran (`window.scrollTo(0, 0)`).

#### 2. Moteur de Styles (Tailwind CSS v4 CSS-first)
- **Thémisation :** Les couleurs et polices issues de la charte FIERI Brandboard sont enregistrées sous forme de variables CSS sous la directive `@theme` dans `src/index.css`.
- **Dark/Light Mode :** Utilisation d'un sélecteur `.dark` appliqué sur le document HTML.
- **Aesthetics :** Les éléments graphiques (cartes Bento, boutons) utilisent des ombres subtiles, des bordures semi-transparentes de type verre (glassmorphism) et des élévations de survol interactives.

---

### Infrastructure & Deployment

#### 1. Hébergement
- **Hébergement Frontend :** Vercel (déploiement continu lié à la branche `main` de GitHub).
- **Rationale :** Vercel offre des performances de chargement inégalées pour les applications SPA grâce à son réseau de distribution CDN mondial et son intégration native et instantanée avec les variables d'environnement de production.

---

### Decision Impact Analysis

**Implementation Sequence:**
1. **Étape 1 :** Définir la structure globale de thémisation Tailwind v4 dans `src/index.css` (variables `@theme` du mode sombre Cosmique et du mode clair Aube).
2. **Étape 2 :** Implémenter le `Mock Database Adapter` et le chargeur du fichier `ancien_contenu.json`.
3. **Étape 3 :** Créer le service d'interception API hybride (`src/services/api.js`) avec le mécanisme de fallback.
4. **Étape 4 :** Mettre en place l'architecture du `AuthContext` et les règles d'autorisations d'accès.
5. **Étape 5 :** Concevoir la structure de navigation SPA principale et l'orchestration des 14 écrans dans `src/App.jsx`.

**Cross-Component Dependencies:**
- L'adaptateur de résilience local est dépendant de la présence physique de `ancien_contenu.json`.
- Tous les écrans transactionnels dépendent étroitement du rôle exposé par `AuthContext`.

---

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
**5 zones à haut risque** de divergences techniques entre agents autonomes ont été identifiées et neutralisées par ces règles de conformité :

---

### Naming Patterns

#### 1. Persistance & LocalStorage Keys
- **Convention :** Préfixe strict `fieri_` suivi du nom en snake_case.
- **Clés autorisées :**
  - `fieri_auth_token` : Jeton JWT.
  - `fieri_auth_user` : Objet utilisateur sérialisé.
  - `fieri_theme_mode` : `"dark"` ou `"light"`.
  - `fieri_db_projects` : Cache local des projets soumis.
  - `fieri_db_clubs` : Cache local des adhésions aux clubs.
- **Anti-Pattern à éviter :** Clés génériques sans préfixe comme `token` ou `theme` (risques de collision avec d'autres apps locales).

#### 2. Code Naming Conventions
- **Composants React :** **PascalCase** avec extension `.jsx` (ex: `BentoGrid.jsx`, `MemberCarousel.jsx`).
- **Fichiers Utilitaires & Services :** **camelCase** (ex: `api.js`, `mockDb.js`).
- **Hooks Personnalisés :** **camelCase** préfixé par `use` (ex: `useAuth.js`, `useData.js`).
- **Variables et Propriétés :** **camelCase** (ex: `projectId`, `memberCount`).

---

### Structure Patterns

#### 1. Organisation du Répertoire `src`
Le code source doit se diviser scrupuleusement selon cette arborescence :
- `src/components/common/` : Boutons glassmorphismes, entrées de formulaires, barres de défilement, toasts globaux.
- `src/components/layout/` : Composants structurels réutilisables (`Sidebar.jsx`, `Navbar.jsx`).
- `src/components/dashboard/`, `src/components/clubs/`, etc. : Composants spécifiques découpés par domaine fonctionnel.
- `src/pages/` : Les 14 écrans majeurs de navigation (ex: `src/pages/Home.jsx`, `src/pages/Dashboard.jsx`).
- `src/services/` : Modules de communication externe et d'accès local (`api.js`, `mockDb.js`).
- `src/context/` : États globaux (`AuthContext.jsx`, `DataContext.jsx`).

#### 2. Règle de Co-localisation des Styles
Toutes les règles esthétiques complexes doivent être déclarées au sein du fichier central `src/index.css` via la directive `@theme` ou des classes utilitaires personnalisées, plutôt que d'utiliser des blocs de styles inline (`style={{ ... }}`) ou des déclarations ad-hoc dans les fichiers composants.

---

### Format Patterns

#### 1. Payload d'échange API & JSON
- **Format JSON :** Utilisation systématique du **camelCase** pour les propriétés d'objet.
- **Structure type de l'API (et de MockDB) :**
  - Requête réussie : `{ success: true, data: [...] }`
  - Requête en échec : `{ success: false, error: "Description explicite de l'erreur" }`
- **Format de Date :** Chaînes normalisées ISO-8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`).

---

### Process Patterns

#### 1. Gestion des états de Chargement (UX Pulse)
- **Règle :** Ne jamais utiliser de simple texte comme "Chargement..." ou un écran blanc.
- **Standard :** Conception d'un composant de chargement squelette (`src/components/common/SkeletonCard.jsx`) utilisant la classe d'animation de pulsation Tailwind `.animate-pulse` avec opacité translucide pour conserver l'esprit "SaaS Scientifique" immersif.

#### 2. Gestion et notification des exceptions
- **Règle :** Tout échec d'appel API intercepté par `services/api.js` doit être remonté de façon non bloquante.
- **Standard :** Notification immédiate via un Toast dynamique placé en bas à droite de l'écran, avec masquage automatique après 4000ms.

#### 3. Mises à jour d'état React 19
- **Règle :** Pour permettre au compilateur React 19 d'optimiser le graphe de dépendance et d'éviter les rerendus futiles, les états locaux doivent toujours être mis à jour de manière **strictement immuable** (ex: `setList(prev => [...prev, newItem])`).

---

### Pattern Examples

**Good Code Example (Composant Conforme) :**
```javascript
// src/components/clubs/ClubCard.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';

export function ClubCard({ club, onJoin }) {
  const { user } = useAuth();
  
  // Utilisation immuable et typage camelCase conforme
  const isAlreadyMember = club.members.includes(user?.email);

  return (
    <div className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg hover:-translate-y-1 transition-all duration-300">
      <h3 className="text-xl font-semibold text-navy dark:text-white">{club.name}</h3>
      <p className="text-gray dark:text-gray-400 mt-2 text-sm">{club.description}</p>
      
      {user && !isAlreadyMember && (
        <button 
          onClick={() => onJoin(club.id)}
          className="mt-4 px-4 py-2 bg-violet-royal hover:bg-indigo text-white text-xs font-semibold rounded transition-colors"
        >
          Rejoindre le Club
        </button>
      )}
    </div>
  );
}
```

**Anti-Patterns à Proscrire :**
```javascript
// À PROSCRIRE ABSOLUMENT :
// ❌ Extension .js au lieu de .jsx pour un fichier contenant du JSX.
// ❌ Nom de fichier camelCase (clubCard.js) au lieu de PascalCase (ClubCard.jsx).
// ❌ Styles inline modifiant le design global (style={{backgroundColor: '#6C4CF1'}}).
// ❌ Clé de localStorage non préfixée (localStorage.setItem("token", jwt)).
```

---

## Project Structure & Boundaries

### Complete Project Directory Structure

Le projet utilise des **alias de chemins d'accès** configurés sous la clé `@/*` pointant directement vers le répertoire `/src` pour éliminer le "Relative Import Hell".

```
Fieri/
├── package.json                         # Dépendances React 19, Vite 8, Tailwind v4
├── eslint.config.js                    # Standard syntaxique et de qualité pour les agents
├── vite.config.js                      # Config de build, plugin Tailwind v4 et alias de chemins (@/*)
├── index.html                           # Entrée DOM racine de la SPA
├── ancien_contenu.json                 # Base de données de secours locale au format JSON
├── doc_api_fieri.http                  # Spécifications d'appels HTTP pour l'API de Production
├── fieri-brandboard (1).html           # Palette et spécifications graphiques
├── public/                              # Assets statiques globaux
└── src/
    ├── main.jsx                         # Point d'entrée JavaScript montant App
    ├── App.jsx                          # Router réactif SPA central, Layout Shell principal et transitions
    ├── App.css                          # Styles globaux génériques
    ├── index.css                        # Fichier maître de thémisation Tailwind v4 et modes Dark/Light
    ├── assets/                          # Images et vecteurs spécifiques à l'application
    ├── content/
    │   └── landing.json                 # Structure de contenu de la page d'accueil
    ├── services/
    │   ├── api.js                       # Service client HTTP enveloppant fetch avec résilience de secours
    │   └── mockDb.js                    # Adaptateur local gérant le CRUD mocké dans localStorage
    ├── context/
    │   ├── AuthContext.jsx              # Contexte global d'authentification et de gating de rôles
    │   └── DataContext.jsx              # Cache des métadonnées globales (Universités, Branches)
    ├── components/
    │   ├── Logo.jsx                     # Logotype de la plateforme Fieri
    │   ├── PerspectiveGrid.jsx          # Fond esthétique spatial 3D
    │   ├── common/                      # Composants d'UI atomiques partagés
    │   │   ├── Toast.jsx                # Notification éphémère non bloquante animée
    │   │   ├── Button.jsx               # Boutons standards avec micro-interactions
    │   │   └── SkeletonCard.jsx         # Squelettes de pulsation translative pour états de chargement
    │   └── layout/                      # Éléments d'encapsulation de l'interface
    │       ├── AppLayout.jsx            # Conteneur principal (Layout Shell) hébergeant Sidebar et Navbar
    │       ├── Sidebar.jsx              # Barre latérale repliable cinématique
    │       └── Navbar.jsx               # Barre supérieure avec commutateur de thème
    └── pages/                           # Les 14 Écrans majeurs de la plateforme
        ├── Auth.jsx                     # Formulaire de connexion/inscription avec token
        ├── Contact.jsx                  # Formulaire de contact et retours utilisateurs
        ├── Dashboard.jsx                # Espace utilisateur personnalisé selon le rôle
        ├── Events.jsx                   # Liste des conférences et événements live
        ├── Home.jsx                     # Accueil avec Bento Grid et Hero Header
        ├── Members.jsx                  # Annuaire dynamique des chercheurs et membres
        ├── News.jsx                     # Portail d'actualités et publications scientifiques
        ├── Opportunities.jsx            # Offres d'emploi, de stages et de thèses
        ├── ProjectDetail.jsx            # Fiche détaillée d'un projet de recherche
        ├── Projects.jsx                 # Liste filtrable des projets de recherche
        ├── ResearchClubs.jsx            # Portail d'adhésion aux clubs de recherche
        ├── ResearcherProfile.jsx        # Fiche de profil chercheur et statistiques
        ├── StudentPortal.jsx            # Hub étudiant avec accès aux ateliers
        └── Workshops.jsx                # Liste et inscription aux ateliers pratiques
```

---

### Architectural Boundaries

**API Boundaries & Environment Mocks:**
- La communication réseau passe exclusivement par `src/services/api.js`.
- **Ciblage Environnemental Strict :** Pour éviter tout échec ou comportement imprévu sous Vite 8, l'activation de la résilience locale mockée doit utiliser l'objet de métadonnées Vite `import.meta.env.DEV` (vrai en mode développement) plutôt que la variable Node.js legacy `process.env.NODE_ENV`.
- Si `import.meta.env.DEV` est vrai, un échec de l'API lointaine dévie automatiquement l'appel vers `mockDb.js`. En production (`import.meta.env.PROD`), les erreurs réseau échouent de façon stricte.

**Component Boundaries & Central Layout Shell:**
- Pour garantir des animations d'écrans fluides sans sauts visuels ni ré-initialisation d'états d'UI, le projet adopte le pattern de **Layout Shell**.
- Le composant `src/components/layout/AppLayout.jsx` encapsule la structure globale : il maintient montés de façon stable la `Sidebar` et la `Navbar`.
- Seule la zone d'affichage centrale est dynamique, injectant le composant de page active (ex: `Home`, `Dashboard`) via une transition douce de 200ms orchestrée par Framer Motion.

**Path Alias Boundaries:**
- Les imports relatifs complexes sont formellement interdits pour franchir les couches (ex: interdiction de faire `../../context/AuthContext` depuis un composant UI).
- Tous les agents d'implémentation doivent utiliser l'alias racine `@/` configuré dans `vite.config.js` (ex: `import { useAuth } from '@/context/AuthContext'`).

---

### Requirements to Structure Mapping

**Layout Shell & Routage SPA :**
- **Emplacement :** `src/App.jsx` (Orchestrateur central), `src/components/layout/AppLayout.jsx` (Structure stable) et `src/pages/*` (Vues individuelles).

**Authentification JWT & Gating de Rôles :**
- **Emplacement :** `src/context/AuthContext.jsx` (Gating applicatif) et `src/pages/Auth.jsx` (Formulaire).

**Intercepteur et Résilience Réseau :**
- **Emplacement :** `src/services/api.js` (Intercepteur HTTP avec check `import.meta.env.DEV`) et `src/services/mockDb.js` ( CRUD localStorage indexé sur `ancien_contenu.json`).

**Design System & Dual Thémisation (Dark/Light) :**
- **Emplacement :** `src/index.css` (Déclaration `@theme` Tailwind v4) et `src/components/layout/Navbar.jsx` (Interrupteur de classe `.dark`).

---

### Integration Points

**Internal Communication (React Context Flow with Path Aliasing) :**
```mermaid
graph TD
    App[src/App.jsx] --> AppLayout[src/components/layout/AppLayout.jsx]
    AppLayout --> AuthProvider[src/context/AuthContext.jsx]
    AuthProvider --> DataProvider[src/context/DataContext.jsx]
    DataProvider --> Pages[src/pages/* via alias @/]
    Pages --> API[@/services/api.js]
    API --> MockDB[@/services/mockDb.js]
```

**External Integrations:**
- **API Production Vercel :** `https://backend-fieri.vercel.app` (JWT Authorization Bearer).
- **LocalStorage :** Indexation locale préfixée par `fieri_`.

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
Toutes les technologies sélectionnées (React 19.2, Vite 8.0, Tailwind v4.3, Framer Motion 12.4) sont entièrement compatibles. L'usage du compilateur React 19 et de `@tailwindcss/vite` garantit une intégration fluide sans fichiers de configuration legacy (pas de postcss.config.js ni de tailwind.config.js). L'ajustement sur `import.meta.env.DEV` sécurise le build sous Vite 8.

**Pattern Consistency:**
Les patterns d'implémentation (PascalCase pour les composants, camelCase pour l'API et les attributs, structure de dossiers modulaire) sont standardisés. L'isolation du `localStorage` par le préfixe strict `fieri_` est requise pour tous les agents.

**Structure Alignment:**
Le découpage en pages sous `src/pages/` et composants d'encapsulation sous `src/components/layout/` (AppLayout Shell) élimine la duplication de code et garantit la persistance stable de la Sidebar et de la Navbar lors des transitions d'écrans.

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**
L'intégralité des 14 écrans interactifs décrits dans le PRD et la charte d'utilisation du mode clair (Aube Claire) sont cartographiés vers des fichiers physiques spécifiques de l'application.

**Functional Requirements Coverage:**
Le gating de sécurité à 4 rôles (Admin, Chercheur, Étudiant, Invité) est nativement géré par `src/context/AuthContext.jsx`. La persistance transactionnelle hybride (API distante / localStorage mocké localement) est gérée au niveau de la frontière réseau `src/services/api.js`.

**Non-Functional Requirements Coverage:**
- **Performance :** Optimisée grâce à l'élimination du runtime Tailwind via le compilateur CSS-first v4 et à l'optimisation automatique du rendu par le compilateur React 19.
- **Sécurité :** JWT Bearer Token sécurisé avec garde de routage réactif centralisé.

### Implementation Readiness Validation ✅

**Decision Completeness:**
Toutes les décisions techniques cruciales sont consignées avec des numéros de version précis et des explications sur les compromis (trade-offs) associés.

**Structure Completeness:**
L'arborescence complète du dossier `src/` est documentée, incluant les emplacements des contextes globaux, des services résilients, et du layout shell.

**Pattern Completeness:**
Les règles de gestion des erreurs (Toasts réactifs non-bloquants), les animations d'attente (Pulse loaders), et les conventions d'écriture asynchrones sont accompagnées d'exemples de code concrets.

### Gap Analysis Results

*Aucune anomalie critique ou bloquante n'a été détectée lors de l'audit de cohérence.*

**Critical Gaps :**
- Aucun. La couverture fonctionnelle et technique est complète.

**Important Gaps :**
- Aucun. Les modèles CRUD locaux et la déviation d'environnement ont été entièrement spécifiés.

**Nice-to-Have Gaps :**
- Prévoir l'implémentation de squelettes de pulsation (`SkeletonCard.jsx`) hautement stylisés en gradient ambre/orange doux pour sublimer l'expérience visuelle lors de la bascule vers le mock local en développement.

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION (Les 16 critères de complétude sont validés, aucun écart critique n'est identifié).

**Confidence Level:** High (Confiance totale basée sur la cohérence de la stack moderne et des frontières d'isolation réseau).

**Key Strengths:**
- Isolation hermétique du réseau via le wrapper `api.js`.
- Layout Shell centralisé pour des animations cinématiques fluides de l'interface utilisateur.
- Charte graphique "Aube Claire" élégante préservant l'identité Fieri bleu/violet avec des touches d'orange brûlé et d'ambre.

**Areas for Future Enhancement:**
- Introduction d'un cache de requêtes plus sophistiqué (ex: implémentation d'un mini-React Query maison léger) si le nombre de requêtes distantes simultanées surpasse 50 appels/seconde.

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented.
- Use implementation patterns consistently across all components.
- Respect project structure and boundaries.
- Refer to this document for all architectural questions.

**First Implementation Priority:**
- Initialiser le service d'authentification `src/context/AuthContext.jsx` et l'adaptateur de persistence locale `src/services/mockDb.js` pour rendre le site immédiatement navigable et fonctionnel en local à partir de `ancien_contenu.json`.

---
