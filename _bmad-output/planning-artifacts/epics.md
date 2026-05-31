---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - '_bmad-output/planning-artifacts/prds/prd-Fieri-2026-05-30/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-Fieri-2026-05-30/DESIGN.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-Fieri-2026-05-30/EXPERIENCE.md'
---

# Fieri - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Fieri, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: [Orchestration de la SPA par état centralisé dans `src/App.jsx` via l'état `currentPage` avec repositionnement doux au sommet de la page (`window.scrollTo(0, 0)`) et transition fluide de 200ms.]
FR2: [Matrice d'accès à 4 rôles (Visiteur public, Membre connecté, Chercheur certifié, Admin) contrôlée par `AuthContext`, adaptant l'UI et verrouillant les actions transactionnelles (adhérer, s'inscrire, financer).]
FR3: [Intercepteur API hybride résilient en environnement local de développement (`import.meta.env.DEV`) basculant de façon invisible vers le mock local (`mockDb.js` exploitant `localStorage` et initialisé avec `ancien_contenu.json`) lors d'une erreur 404 ou réseau.]
FR4: [Comportement API strict en production (`import.meta.env.PROD`) levant et propageant les exceptions réseau sans aucun repli mocké, afin d'afficher un état dégradé propre avec Toast informatif.]
FR5: [Pré-chargement des métadonnées d'organisation (Pays, Universités, Branches d'études) dès le chargement initial de l'application, stockées en cache local pour éliminer les temps de chargement des formulaires.]
FR6: [Pôle Opportunités (`/opportunities`) sous forme de grille filtrable (Type, Discipline, Statut), avec soumission d'offres par les chercheurs connectés et envoi de candidatures scientifiques avec CV/Portfolio par les membres.]
FR7: [Pôle Projets de Recherche (`/projects` & `/projects/:id`) incluant une Bento Grid asymétrique (premier projet en grand), gestion d'abonnement (Follow/Unfollow) synchronisée avec le Dashboard, et formulaire de promesse de soutien financier par modale incrémentant le budget accumulé fictif.]
FR8: [Pôle Clubs Scientifiques (`/clubs`) présentant les 6 clubs thématiques avec des chartes d'accents distinctes, adhésion globale en un clic pour les membres connectés et synchronisation avec le Dashboard.]
FR9: [Pôle Académie & Formations (`/workshops`) sous forme de catalogue filtrable avec inscription directe (décrémentant les places disponibles) ou mise en liste d'attente interactive si complet, avec réallocation automatique au premier membre de la waitlist lors d'une désinscription.]
FR10: [Pôle Événements & Hackathons (`/events`) avec calendrier, timeline d'activités, et bouton d'accès au flux live streaming réservé sélectivement aux membres connectés enregistrés à cet événement spécifique.]
FR11: [Espace Privé Dashboard (`/dashboard`) regroupant un panneau de statistiques d'activité, des raccourcis vers mes clubs, projets suivis et formations, un flux de notifications privées interactif (marquer comme lu, tout effacer), et un onglet privé de gestion de profil Chercheur (`PUT /researchers/me`).]
FR12: [Pôle Actualités & Publications (`/news`) filtrable, avec circuit de validation obligatoire (comité de lecture) : création d'articles en statut `PENDING` par un chercheur connecté et validation manuelle administrative via `PATCH /news/:id/approve` pour passage au statut `APPROVED`.]
FR13: [Annuaire et Profils Chercheurs (`/members` & `/profile`) présentant la communauté R&D avec affichage en direct des statistiques d'abonnés et boutons d'abonnements interactifs.]
FR14: [Pôle Contact & Support (`/contact`) permettant d'adresser des messages au Bureau FIERI avec pré-remplissage des champs Nom et Email pour les membres connectés.]
FR15: [Cycle de Vie Session (`/auth`) gérant l'authentification multi-étapes universitaire et le stockage du token JWT dans `localStorage` pour injection automatique dans les headers HTTP `Authorization: Bearer <token>`.]

### NonFunctional Requirements

NFR1: [Authentification par Jeton JWT transmis obligatoirement dans les en-têtes de requêtes transactionnelles sous la forme `Authorization: Bearer <token>`.]
NFR2: [Redirection silencieuse vers la vue `auth` pour tout accès non authentifié aux vues restreintes (Dashboard, Profile privé).]
NFR3: [Transition douce de changement de page SPA en 200ms avec décalage de translation vertical de 10px.]
NFR4: [Double palette thématique contrôlée par une classe `.dark` sur la racine du document, s'appuyant strictement sur les tokens Tailwind v4 du mode Clair Aube Cosmique (primaire `#6C4CF1`, fond `#FAFBFF`) et Sombre Cosmique (fond `#080B14`, surface `#0D1120`, actif `#111827`).]
NFR5: [Respect strict de la conformité WCAG 2.2 AA (ratio de contraste >= 4.5:1) pour le Violet Royal (`#6C4CF1`) et l'Orange Brûlé (`#E76F00`) sur fonds clairs/sombres, interdiction d'utiliser l'Ambre Premium (`#FF8A3D`) pour les petits textes.]
NFR6: [Accessibilité totale au clavier (Tabulation, escape) pour la navigation de l'ensemble des modales, formulaires complexes et carrousels.]
NFR7: [Conception adaptative premium s'adaptant sur mobile (1 colonne, menu burger), tablette (2 colonnes Bento, Sidebar flottante) et desktop (12 colonnes, Sidebar déployable).]
NFR8: [Immuabilité stricte des états réactifs React pour optimiser automatiquement le rendu grâce au compilateur React 19.]

### Additional Requirements

- [Arch-R1 : Utilisation impérative du socle existant React 19 + Vite 8 + Tailwind v4 en ciblant environnementalement `import.meta.env.DEV` au lieu de `process.env.NODE_ENV`.]
- [Arch-R2 : Implémentation du pattern Layout Shell stable (`src/components/layout/AppLayout.jsx`) enveloppant de manière permanente la Navbar et la Sidebar pour éliminer les sauts d'interface.]
- [Arch-R3 : Utilisation systématique de l'alias de chemins d'accès `@/*` pointant sur `/src` pour tout import entre répertoires.]
- [Arch-R4 : Isolation stricte du LocalStorage avec le préfixe obligatoire `fieri_` (ex : `fieri_auth_token`, `fieri_db_projects`).]
- [Arch-R5 : Implémentation du mock local `mockDb.js` gérant les flux CRUD pour la persistance locale et exploitant le fichier JSON initial `ancien_contenu.json`.]

### UX Design Requirements

UX-DR1: [Typographie unique Google Fonts *Plus Jakarta Sans* s'appuyant sur l'échelle stricte des graisses et tailles spécifiées dans `DESIGN.md` (H1: 52px, H2: 36px, H3: 24px, Body: 16px, Caption: 12px, Accent: 14px).]
UX-DR2: [Dégradé de transition stellaire pour le Hero de la section d'accueil clair : `linear-gradient(135deg, #F8F7FF 0%, #EEF2FF 40%, #FFF3E8 100%)`.]
UX-DR3: [Composant BentoGrid de style glassmorphic (`rgba(13,17,32,0.6)` avec flou de 20px et bordure fine) s'élevant de `-4px` au survol avec halo lumineux d'accentuation en 200ms ease-out.]
UX-DR4: [Sidebar rétractée à `40px` (icônes seules et point d'énergie pulsant orange/ambre) se déployant à `240px` en 300ms (`cubic-bezier(0.16, 1, 0.3, 1)`) avec fade-in des textes en 150ms.]
UX-DR5: [Badge d'activité doté d'un dot de 6px vert/bleu pulsant de `scale(1)` à `scale(1.5)` en boucle toutes les 2 secondes pour signaler les événements en direct (Live).]
UX-DR6: [Carrousel de membres en glassmorphism supportant la navigation tactile par glissement (swipe) et flèches de commande subtiles sur desktop.]
UX-DR7: [Illustration de circuit brisé en traits fins et message scientifique chaleureux pour les états de recherche ou filtrage sans résultats (Empty Search State).]
UX-DR8: [Skeleton loading components translucides animés en pulsation d'opacité (30% à 70% toutes les 1.5s) remplaçant tout spinner central de chargement.]
UX-DR9: [Command Palette globale via le raccourci `⌘K` / `Ctrl+K` permettant la navigation rapide au clavier et le basculement instantané des thèmes.]

### FR Coverage Map

- **FR1 (Central SPA Routing)**: Epic 1 - Routage réactif SPA et Layout Shell dans App.jsx / AppLayout.jsx.
- **FR2 (User Access Gating)**: Epic 1 - Session globale et garde-barrières dans AuthContext.
- **FR3 (Hybrid API Resilience in Dev)**: Epic 1 - Moteur d'interception api.js et mockDb.js.
- **FR4 (Strict API in Prod)**: Epic 1 - Gestion des échecs réels en environnement de production dans api.js.
- **FR5 (Global Metadata Pre-loading)**: Epic 1 - Pré-chargement et cache des métadonnées dans DataContext.
- **FR6 (Opportunities Hub)**: Epic 3 - Grille filtrable d'opportunités et candidatures dans Opportunities.jsx.
- **FR7 (Research Projects)**: Epic 3 - Bento Grid, Follow et promesses de financement dans Projects.jsx / ProjectDetail.jsx.
- **FR8 (Research Clubs)**: Epic 4 - Adhésion globale et identités distinctes dans ResearchClubs.jsx.
- **FR9 (Academy & Workshops)**: Epic 4 - Inscriptions, désinscriptions et liste d'attente réactive dans Workshops.jsx.
- **FR10 (Events & Hackathons)**: Epic 5 - Conférences, timeline interactive et accès au live streaming dans Events.jsx.
- **FR11 (Member Dashboard)**: Epic 5 - Centre de notifications, statistiques et édition privée de profil chercheur dans Dashboard.jsx.
- **FR12 (News & Publications)**: Epic 5 - Flux d'actualités et comité de validation dans News.jsx.
- **FR13 (Community Directory)**: Epic 2 - Annuaire communauté, abonnés et profil public chercheur dans Members.jsx / ResearcherProfile.jsx.
- **FR14 (Contact & Support)**: Epic 1 - Formulaire de contact intelligent pré-rempli dans Contact.jsx.
- **FR15 (Authentication System)**: Epic 1 - Inscription universitaire multi-étape et login dans Auth.jsx.

## Epic List

### Epic 1: Foundations, Dual-Theme, and Resilient Auth System
Mise en place du socle d'architecture réactive (React 19 + Vite 8 + Tailwind v4), de la double thémisation, du wrapper d'interception réseau `api.js` avec résilience `mockDb.js`, et du cycle complet de session (AuthContext, authentification universitaire, formulaire de contact et routage SPA).
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR14, FR15

### Epic 2: Community Directory and Researcher Profiles
Implémentation de l'annuaire communautaire interactif et des profils publics des chercheurs avec statistiques d'abonnés en temps réel, carrousel de membres en glassmorphism, et squelettes de pulsation progressive pour les chargements.
**FRs covered:** FR13

### Epic 3: Research Projects and Opportunities (Bento Platform)
Création du centre de R&D avec Bento Grid asymétrique animée, suivi de jalons, formulaires de promesses de soutien financier par modale glassmorphic, et grille d'opportunités de recherche avec dépôt de candidatures.
**FRs covered:** FR6, FR7

### Epic 4: Research Clubs and Academic Academy (Student Hub)
Déploiement des 6 clubs de recherche avec identités d'accents distinctes et adhésion en un clic, et du catalogue d'ateliers interactifs gérant les désinscriptions et réallocations automatiques de listes d'attente (waitlist).
**FRs covered:** FR8, FR9

### Epic 5: Live Events, Editorial News, and Dashboard Notifications
Implémentation de l'onglet événements avec accès streaming sécurisé, du flux d'actualités avec circuit de validation manuelle par administrateur (comité de lecture), et du Dashboard privé réunissant statistiques, centre de notifications interactif et modifications de profils.
**FRs covered:** FR10, FR11, FR12

## Epic 1: Foundations, Dual-Theme, and Resilient Auth System

Goal: Mise en place du socle d'architecture réactive (React 19 + Vite 8 + Tailwind v4), de la double thémisation, du wrapper d'interception réseau `api.js` avec résilience `mockDb.js`, et du cycle complet de session (AuthContext, authentification universitaire, formulaire de contact et routage SPA).

### Story 1.1: Core Shell, Dual-Theme & Design System Setup

As a visiteur du site,
I want disposer d'une interface unifiée premium avec barre de navigation et barre latérale fluide, réactive au clic et supportant instantanément le basculement entre les modes clair "Aube Cosmique" et sombre "Dark Cosmique",
So that pouvoir naviguer agréablement et sans saccade sur tous mes écrans (mobile, tablette, desktop).

**Acceptance Criteria:**

**Given** un projet React 19 configuré avec Vite 8, Tailwind v4 et `@/*` path aliasing
**When** l'application se charge
**Then** l'élément structurel stable `AppLayout.jsx` est rendu, englobant la `Navbar` supérieure et la `Sidebar` latérale de façon persistante
**And** le texte utilise la police unique *Plus Jakarta Sans* conformément à l'échelle typographique de `DESIGN.md`
**And** au clic sur l'icône de rétractation de la `Sidebar`, celle-ci effectue une transition fluide de `40px` (icônes seules et point d'énergie orange/ambre) à `240px` (textes visibles) en 300ms via `cubic-bezier(0.16, 1, 0.3, 1)` avec un fondu des textes en 150ms
**And** au clic sur le commutateur de thème, la classe `.dark` est ajoutée/retirée sur la racine HTML pour appliquer instantanément le dégradé Hero stellaire clair ou le fond sombre opaque

### Story 1.2: Hybrid API Engine & Local Mock Database

As a développeur travaillant en local ou utilisateur final,
I want que l'application charge en cache les métadonnées dès son initialisation et intercepte les requêtes réseau pour basculer de façon invisible sur une base mockée en cas de déconnexion ou de pannes API locales,
So that garantir une continuité de service irréprochable sans perturber mon expérience utilisateur.

**Acceptance Criteria:**

**Given** l'application en cours d'initialisation en mode développement local (`import.meta.env.DEV`)
**When** le composant racine se monte
**Then** les métadonnées (Pays, Universités, Branches d'études) sont récupérées et stockées en cache local (`DataContext.jsx`)
**And** si un appel API vers `https://backend-fieri.vercel.app` échoue en 404 ou réseau, le wrapper `api.js` bascule silencieusement sur `mockDb.js` (persistance `localStorage` préfixée par `fieri_` et initialisée par `ancien_contenu.json`)
**And** en production (`import.meta.env.PROD`), aucun repli n'est toléré ; l'erreur réseau est propagée pour être capturée par un Toast utilisateur informatif

### Story 1.3: University Authentication & Gating Engine (AuthContext)

As a visiteur universitaire,
I want m'inscrire via le parcours multi-étapes universitaire et me connecter de manière sécurisée pour obtenir mes droits d'accès sélectifs,
So that accéder aux vues restreintes (Dashboard, Profile) et de débloquer les boutons transactionnels selon mon rôle.

**Acceptance Criteria:**

**Given** un utilisateur non connecté tentant d'accéder au `/dashboard` ou `/profile`
**When** la tentative d'accès est initiée
**Then** l'application redirige silencieusement et immédiatement l'utilisateur vers la vue `/auth`
**And** le formulaire d'inscription `/auth` gère la validation multi-étapes de manière accessible au clavier, valide les identifiants universitaires fictifs et stocke le token JWT avec le préfixe `fieri_auth_token`
**And** après connexion, l'état global `AuthContext` injecte automatiquement le header `Authorization: Bearer <token>` sur toutes les requêtes et adapte dynamiquement l'affichage de l'UI selon les rôles (Visiteur, Membre, Chercheur, Admin)

### Story 1.4: Universal Command Palette (⌘K)

As a utilisateur adepte des raccourcis clavier,
I want ouvrir à tout moment un panneau de contrôle global par la combinaison `⌘K` ou `Ctrl+K`,
So that naviguer rapidement, basculer les thèmes et lancer des raccourcis de recherche sans lâcher mon clavier.

**Acceptance Criteria:**

**Given** l'application active à l'écran
**When** l'utilisateur appuie simultanément sur `⌘K` (ou `Ctrl+K`)
**Then** une modale glassmorphic centrée s'ouvre instantanément en fondu enchaîné de 150ms
**And** le focus clavier est automatiquement placé sur l'input de recherche de la palette
**And** l'utilisateur peut naviguer avec les flèches du clavier (`Haut` / `Bas`) et valider par `Entrée` ou fermer par `Échap` en toute accessibilité
**And** les options incluent : "Basculer vers le mode clair/sombre", "Naviguer vers les opportunités/projets/actualités/clubs"

### Story 1.5: Intelligent Contact & Support Panel

As a membre connecté ou visiteur,
I want pouvoir soumettre un formulaire de support avec mes champs d'identité automatiquement pré-remplis si je dispose d'une session active,
So that envoyer rapidement des demandes de renseignements sans devoir saisir mes informations de contact à chaque fois.

**Acceptance Criteria:**

**Given** un membre connecté dont la session active contient le Nom et l'Email
**When** la page `/contact` est visitée
**Then** les champs de saisie "Nom" et "Email" sont pré-remplis de manière immuable et le curseur est placé sur le champ de message
**And** à la soumission du message, les données sont persistées dans `mockDb.js` sous la clé `fieri_contact_messages`
**And** un Toast de confirmation de succès "Message envoyé" apparaît avec une animation douce

## Epic 2: Community Directory and Researcher Profiles

Goal: Implémentation de l'annuaire communautaire interactif et des profils publics des chercheurs avec statistiques d'abonnés en temps réel, carrousel de membres en glassmorphism, et squelettes de pulsation progressive pour les chargements.

### Story 2.1: Community Directory & Interactive Filters

As a visiteur ou membre,
I want rechercher et filtrer les chercheurs par nom, discipline et institution au sein de l'annuaire `/members`,
So that découvrir et d'entrer facilement en relation avec des spécialistes de mon domaine.

**Acceptance Criteria:**

**Given** un visiteur naviguant vers la page `/members`
**When** la page se charge
**Then** l'annuaire complet de la communauté est rendu sous forme de cartes d'identité interactives affichant l'avatar, le rôle, l'université et les spécialités de chaque chercheur
**And** l'utilisateur peut filtrer en temps réel les cartes via des inputs ou sélecteurs de disciplines/branches d'études
**And** si la recherche ne renvoie aucun résultat, l'écran affiche une illustration de circuit brisé en traits fins et un message scientifique chaleureux ("Aucun chercheur ne correspond à vos filtres")

### Story 2.2: Researcher Profiles & Subscriber Statistics

As a membre de la communauté,
I want pouvoir visiter la page publique `/profile/:id` de n'importe quel chercheur, consulter ses statistiques d'abonnés et m'abonner/me désabonner instantanément en un clic,
So that suivre ses travaux de recherche et voir l'évolution de ses abonnements en temps réel.

**Acceptance Criteria:**

**Given** un membre connecté visitant le profil public d'un chercheur (ex. `/profile/jean-valjean`)
**When** il clique sur le bouton "S'abonner" (ou "Follow")
**Then** le compteur de Followers du chercheur s'incrémente instantanément de `+1` de manière immuable en base mockée (`mockDb.js`)
**And** le libellé du bouton change pour "Se désabonner" (ou "Unfollow") avec une transition de couleur douce
**And** si l'utilisateur n'est pas connecté, le bouton d'abonnement est masqué ou grisé conformément à la matrice de gating

### Story 2.3: Scientific Carousel & Micro-Animations

As a visiteur sur mobile ou desktop,
I want faire défiler les profils des chercheurs vedettes via un carrousel fluide par glissement (swipe) tactile ou clics sur des flèches,
So that parcourir rapidement les membres clés de la communauté.

**Acceptance Criteria:**

**Given** le composant carrousel de profils présent sur la page d'accueil ou de l'annuaire
**When** un utilisateur mobile glisse son doigt (swipe) vers la gauche ou la droite, ou un utilisateur desktop clique sur les boutons de navigation
**Then** le carrousel fait défiler les cartes de membres de manière fluide
**And** chaque carte dispose d'une micro-animation de zoom/survol d'avatar au focus ou hover en 200ms
**And** l'ensemble du carrousel est entièrement navigable au clavier via les touches fléchées (`Gauche` / `Droite`)

### Story 2.4: Progressive Skeleton Loading

As a utilisateur avec une connexion fluctuante,
I want voir des squelettes de chargement translucides et animés en pulsation d'opacité à la place des loaders ou spinners classiques pendant le chargement des profils ou de l'annuaire,
So that percevoir un chargement fluide, harmonieux et anticiper la structure finale de la page.

**Acceptance Criteria:**

**Given** une requête de chargement de données vers l'annuaire ou le profil chercheur
**When** la page est en attente de réponse (état `isLoading`)
**Then** les cartes réelles sont temporairement remplacées par des boîtes grises translucides (Skeletons) qui oscillent doucement en opacité (de 30% à 70% toutes les 1.5s)
**And** au chargement complet des données, les Skeletons s'effacent pour laisser place aux vrais profils via un fondu enchaîné de transition verticale en 200ms

## Epic 3: Research Projects and Opportunities (Bento Platform)

Goal: Création du centre de R&D avec Bento Grid asymétrique animée, suivi de jalons, formulaires de promesses de soutien financier par modale glassmorphic, et grille d'opportunités de recherche avec dépôt de candidatures.

### Story 3.1: Bento Grid Research Projects Hub

As a visiteur ou membre,
I want découvrir les projets R&D de FIERI présentés dans une grille Bento asymétrique animée et glassmorphic,
So that avoir un aperçu visuel premium immédiat et percutant des projets à fort impact.

**Acceptance Criteria:**

**Given** un utilisateur naviguant vers la page `/projects`
**When** la page se charge
**Then** les projets sont affichés sous forme de Bento Grid asymétrique où le premier projet (à la Une) est affiché en grand format (largeur double)
**And** les cartes adoptent un style glassmorphic (`rgba(13,17,32,0.6)` avec flou de fond de 20px et fine bordure)
**And** au survol d'une carte, celle-ci s'élève verticalement de `-4px` avec l'apparition d'un halo lumineux d'accentuation en 200ms ease-out

### Story 3.2: Project Details & Interactive Follow

As a membre connecté,
I want consulter la page de détail `/projects/:id` d'un projet pour suivre sa timeline de jalons et m'abonner à ses actualités,
So that être notifié de son avancement directement sur mon Dashboard.

**Acceptance Criteria:**

**Given** un membre connecté visitant `/projects/projet-fieri-mars`
**When** il consulte la page
**Then** une timeline interactive verticale des jalons du projet (Jalon validé, En cours, Futur) est affichée
**And** au clic sur le bouton "Suivre ce projet", l'état d'abonnement bascule sur "Projet suivi", et le projet est automatiquement ajouté à la liste des projets suivis dans le `mockDb.js` sous la clé `fieri_followed_projects` pour synchronisation ultérieure avec le Dashboard

### Story 3.3: Interactive Financial Pledge Modale

As a investisseur ou sponsor connecté,
I want ouvrir une modale glassmorphic de promesse de soutien financier, spécifier un montant et valider mon investissement fictif,
So that soutenir virtuellement un projet R&D et voir sa jauge budgétaire augmenter en temps réel.

**Acceptance Criteria:**

**Given** un membre connecté sur `/projects/:id`
**When** il clique sur "Soutenir ce projet"
**Then** une modale glassmorphic de promesse de don s'ouvre, gérant l'accessibilité clavier intégrale (`Échap` pour fermer, focus interne)
**And** la saisie d'un montant positif et la validation incrémentent instantanément le montant fictif récolté par le projet en base locale
**And** la modale se ferme avec un effet de fondu et la barre de progression budgétaire du projet s'animera pour refléter le nouveau total accumulé

### Story 3.4: Scientific Opportunities Hub & Applications

As a chercheur ou étudiant,
I want consulter, filtrer et postuler aux opportunités scientifiques (CDD R&D, doctorat) ou en soumettre de nouvelles si j'ai un statut de chercheur certifié,
So that rejoindre des équipes scientifiques performantes.

**Acceptance Criteria:**

**Given** la page `/opportunities` chargée avec sa grille d'opportunités
**When** un étudiant connecté clique sur "Postuler"
**Then** un formulaire modulaire s'ouvre, demandant des informations scientifiques et permettant de simuler l'envoi d'un CV/Portfolio avec confirmation de succès par Toast
**And** si un chercheur certifié connecté clique sur "Publier une opportunité", il accède à un formulaire de création qui valide les champs de discipline et de salaire, et ajoute l'opportunité dans le `mockDb.js` sous statut actif

## Epic 4: Research Clubs and Academic Academy (Student Hub)

Goal: Déploiement des 6 clubs de recherche avec identités d'accents distinctes et adhésion en un clic, et du catalogue d'ateliers interactifs gérant les désinscriptions et réallocations automatiques de listes d'attente (waitlist).

### Story 4.1: Specialized Clubs Hub & Accent Themes

As a membre de la communauté ou visiteur,
I want découvrir les 6 clubs scientifiques thématiques avec leur identité d'accent unique, et pouvoir y adhérer instantanément si je suis connecté,
So that intégrer des communautés de recherche dynamiques adaptées à mes passions.

**Acceptance Criteria:**

**Given** un visiteur naviguant vers la page `/clubs`
**When** la page se charge
**Then** les 6 clubs scientifiques (ex. Robotique, Bio-Tech, IA) sont rendus sous forme de grandes cartes d'identité
**And** chaque club dispose de sa propre palette d'accent distincte (par exemple, des bordures et lueurs de boutons de nuances de couleurs uniques respectant les contrastes WCAG)
**And** si le membre est connecté, un clic sur le bouton "Rejoindre" l'ajoute instantanément au club en base mockée (`mockDb.js`) sous la clé `fieri_club_memberships` et le bouton bascule en statut "Membre actif" avec effet haptique visuel

### Story 4.2: Academic Workshops Catalogue & Filters

As a étudiant ou passionné,
I want naviguer dans le catalogue d'ateliers scientifiques de l'Académie et les filtrer par discipline ou niveau,
So that trouver rapidement des ateliers pertinents pour monter en compétences.

**Acceptance Criteria:**

**Given** un utilisateur sur la page `/workshops`
**When** les données d'ateliers se chargent
**Then** le catalogue d'ateliers est affiché sous forme de liste interactive détaillant l'instructeur (profil chercheur lié), le nombre de places total, et le nombre de places restantes
**And** l'utilisateur peut filtrer en temps réel les ateliers par thématique de club de rattachement ou difficulté (Débutant, Avancé)

### Story 4.3: Interactive Workshop Registration & Waitlist Engine

As a membre connecté,
I want m'inscrire en un clic à un atelier ou être placé en liste d'attente interactive si l'atelier est complet,
So that réserver ma place ou d'être notifié dès qu'une place se libère.

**Acceptance Criteria:**

**Given** un membre connecté sur `/workshops`
**When** il clique sur "S'inscrire" sur un atelier dont les places sont disponibles
**Then** sa réservation est validée, le nombre de places restantes est décrémenté de `-1` en base locale et son statut passe à "Inscrit"
**And** s'il clique sur "S'inscrire" sur un atelier dont le nombre de places restantes est égal à `0`, il est automatiquement basculé sur l'état "Sur liste d'attente (Waitlist)" et son rang d'attente fictif est affiché

### Story 4.4: Automatic Waiting List Reallocation

As a membre inscrit à un atelier complet,
I want pouvoir me désinscrire facilement et savoir que le système attribue immédiatement ma place au premier membre en attente,
So that libérer équitablement les places pour mes pairs.

**Acceptance Criteria:**

**Given** un atelier complet (`places = 0`) comportant 3 personnes en liste d'attente
**When** l'un des membres inscrits clique sur "Se désinscrire"
**Then** le membre est retiré de la liste des inscrits de manière immuable
**And** le système sélectionne automatiquement le premier membre de la waitlist (FIFO), le passe au statut "Inscrit", et maintient le nombre de places à `0`
**And** le nouveau membre inscrit reçoit une notification système interne de cooptation automatique

## Epic 5: Live Events, Editorial News, and Dashboard Notifications

Goal: Implémentation de l'onglet événements avec accès streaming sécurisé, du flux d'actualités avec circuit de validation manuelle par administrateur (comité de lecture), et du Dashboard privé réunissant statistiques, centre de notifications interactif et modifications de profils.

### Story 5.1: Scientific News Hub & Peer-Review Flow

As a chercheur connecté ou administrateur,
I want soumettre des publications scientifiques qui passent par un circuit de relecture strict avant d'être validées par un administrateur et publiées,
So that garantir la rigueur scientifique et l'excellence éditoriale du portail FIERI.

**Acceptance Criteria:**

**Given** un chercheur certifié connecté sur `/news`
**When** il soumet un projet d'article via le formulaire d'écriture
**Then** l'article est créé avec l'état de validation `PENDING` et reste invisible pour le public
**And** un administrateur connecté accède à un panneau de modération pour approuver l'article (`PATCH /news/:id/approve`)
**And** après approbation administrative, le statut passe à `APPROVED` et l'article apparaît instantanément dans le flux public des actualités `/news`

### Story 5.2: Scientific Events & Selective Live Streaming

As a membre enregistré à un événement,
I want pouvoir accéder au bouton du flux live vidéo sécurisé dès le démarrage de l'événement,
So that participer à distance aux webinaires et hackathons exclusifs.

**Acceptance Criteria:**

**Given** la page `/events` chargée
**When** un événement est en cours
**Then** il affiche un badge premium d'activité "Dot Live" doté d'un point lumineux vert/bleu de 6px qui scale de `1` à `1.5` en boucle toutes les 2s
**And** au clic sur "Rejoindre le Live", le système vérifie que l'utilisateur est connecté et enregistré pour cet événement spécifique
**And** si la validation échoue, l'accès au flux streaming est bloqué avec un Toast d'avertissement ("Inscription requise pour ce Live")

### Story 5.3: Interactive Personal Dashboard & Notifications Center

As a membre connecté,
I want visualiser toutes mes activités (projets suivis, clubs rejoints, ateliers) et gérer mes notifications sur mon Dashboard privé `/dashboard`,
So that piloter efficacement mon parcours d'innovation scientifique.

**Acceptance Criteria:**

**Given** un membre connecté accédant à son `/dashboard`
**When** la page se charge
**Then** il accède à un panneau de statistiques réactives et à la liste de ses adhésions et réservations en temps réel
**And** le centre de notifications affiche les alertes d'activités récentes (ex. cooptation waitlist, validation de publications)
**And** l'utilisateur peut marquer individuellement chaque notification comme lue ou cliquer sur "Tout effacer" pour vider le flux avec une transition d'opacité fluide

### Story 5.4: Private Researcher Profile Editing

As a chercheur certifié connecté,
I want modifier mes informations scientifiques privées (biographie, laboratoire de recherche) depuis mon espace Dashboard (`PUT /researchers/me`),
So that maintenir mon profil public à jour dans l'annuaire communautaire.

**Acceptance Criteria:**

**Given** un chercheur certifié connecté sur son Dashboard
**When** il soumet le formulaire d'édition de profil chercheur
**Then** les nouvelles informations (bio, spécialités) sont validées et mises à jour dans `mockDb.js` sous son identifiant chercheur
**And** la modification se répercute instantanément de manière transparente sur son profil public `/profile/:id` et sa carte de l'annuaire `/members`

