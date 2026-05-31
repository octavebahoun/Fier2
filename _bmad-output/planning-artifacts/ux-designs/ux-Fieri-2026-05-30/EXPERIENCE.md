---
title: 'EXPERIENCE - FIERI Research'
status: 'final'
sources:
  - {planning_artifacts}/prds/prd-Fieri-2026-05-30/prd.md
updated: '2026-05-30'
---

# EXPERIENCE.md — FIERI Research Interaction & IA Specifications

> [!NOTE]
> Ce document est la spécification fonctionnelle d'interaction de **FIERI Research** rédigée selon le standard Google Labs `EXPERIENCE.md`. Il définit l'architecture d'information, les composants dynamiques, la gestion des états de l'application et les flux de parcours utilisateur clés.

---

## Foundation

**FIERI Research** est une application web monopage (SPA) fluide, hautement réactive et immersive. Elle s'appuie sur une architecture hybride de données : en développement, elle appelle l'API réelle et bascule automatiquement sur des données simulées locales (mocks) en cas de code retour `404` (non trouvé) pour garantir une expérience continue sans interruption de flux. En production, elle repose exclusivement sur des appels réels et affiche des toasts d'erreur informatifs en cas de rupture de réseau ou de défaillance de service.

Le système de navigation s'adapte dynamiquement selon **quatre profils utilisateurs (rôles)**, protégeant l'accès aux écrans avancés tout en maximisant la fluidité pour le public externe grâce à un découpage Bento Grid intelligent.

---

## Information Architecture

La plateforme s'articule autour de **12 pages principales (routes SPA)**. La navigation supérieure (Navbar) gère la découverte publique, tandis que la barre latérale déployable (Sidebar) gère l'espace chercheur et l'administration.

### Table de Navigation & Droits d'Accès

| Page | Route | Rôle d'Accès | Objectif d'Interaction |
|---|---|---|---|
| **P01 — Accueil Principal** | `/` | Tout public | Vitrine de la recherche nationale. Grille Bento interactive mettant en valeur les projets phares, les actualités majeures et les prochains événements. |
| **P02 — Accueil Étudiant / Clubs** | `/clubs-hub` | Membre, Chercheur, Admin | Tableau de bord communautaire pour les clubs de recherche et l'accès rapide aux ressources. |
| **P03 — Actualités Scientifiques** | `/news` | Tout public | Flux d'actualités et d'articles vulgarisés. Filtres rapides par catégorie scientifique. |
| **P04 — Clubs de Recherche** | `/clubs` | Tout public | Annuaire immersif des clubs universitaires. Cartes Bento animées au survol. |
| **P05 — Projets & Innovations** | `/projects` | Tout public | Galerie des travaux de recherche nationaux en cours ou finalisés. Filtres de recherche croisés. |
| **P06 — Détail d'un Projet** | `/projects/:id` | Tout public | Vue immersive d'un projet avec description détaillée, membres participants, publications associées et tracé SVG interactif. |
| **P07 — Formations & Ateliers** | `/training` | Tout public | Catalogue des ateliers scientifiques disponibles à l'inscription. |
| **P08 — Événements & Conférences**| `/events` | Tout public | Calendrier des hackathons, conférences et séminaires avec inscription en un clic. |
| **P09 — Espace Membres** | `/members` | Membre, Chercheur, Admin | Annuaire des chercheurs et étudiants du réseau avec système de filtres par spécialité. |
| **P10 — Tableau de Bord Membre** | `/dashboard` | Membre, Chercheur, Admin | Espace personnel : suivi des formations suivies, événements à venir et contributions. |
| **P11 — Profil Chercheur** | `/researcher/:id` | Tout public (lecture) | Page profil publique ou privée du chercheur avec sa biographie, ses projets actifs, et la liste de ses publications académiques. |
| **P12 — Aide / Contact** | `/contact` | Tout public | Formulaire de support et base de connaissances interactive pour l'onboarding. |

---

## Voice and Tone

La voix de **FIERI Research** est **précise**, **scientifique** et **inspirante**. Elle s'exprime en français d'une manière à la fois institutionnelle (pour rassurer les partenaires universitaires) et extrêmement vivante (pour capter l'intérêt des étudiants et innovateurs).

| Ce que l'on dit (Do) | Ce qu'il faut éviter (Don't) |
|---|---|
| *"✦ Découvrir l'innovation scientifique nationale."* (Inspirant et clair) | *"Bienvenue sur notre site Web ! 🚀"* (Trop enfantin et générique) |
| *"3 publications en revue de pairs ce mois-ci"* (Factuel et crédible) | *"On a cartonné ce mois-ci ! Consultez nos articles !"* (Trop familier) |
| *"Recherche en cours · En direct du Lab"* (Dynamique de flux) | *"Statut : Traitement en cours par le serveur"* (Trop froid / informatique brut) |
| *"Inscription confirmée. Votre badge d'accès est prêt."* (Pratique) | *"L'opération d'insertion SQL a réussi ✓"* (Technique sans valeur d'usage) |

---

## Component Patterns

### 1. Grille Bento Dynamique (Bento Grid)
Toutes les pages d'accueil (P01, P02) et la galerie de projets utilisent un découpage en blocs rectangulaires (Bento Grid) de largeurs variables (`col-span-4`, `col-span-8` ou `col-span-12`).
*   **Comportement :** Au survol de la souris (`md+`), la carte s'élève de `-4px` avec une transition de `200ms ease-out`. Une lueur active (`box-shadow` ambre ou orange selon le statut) et une bordure fine et lumineuse apparaissent pour indiquer l'interactivité.
*   **Priorité visuelle :** Le premier élément de la grille (par exemple, le projet le plus récent ou l'événement vedette) occupe automatiquement un conteneur plus grand (`col-span-8` sur desktop) pour guider le regard.

### 2. Sidebar Chercheur & Administrateur (Barre Latérale)
La navigation des utilisateurs connectés (Chercheur et Administrateur) est gérée par une barre latérale rétractable.
*   **Comportement :** Par défaut, elle est minimisée à `40px` de large, affichant uniquement des icônes filaires (Lucide Icons) et une ligne d'énergie fine (dot orange pulsant en haut).
*   **Déploiement :** Au survol ou au clic sur le bouton d'expansion, elle s'élargit en 300ms vers `240px` avec une transition `cubic-bezier(0.16, 1, 0.3, 1)`. Les textes s'affichent avec une transition en opacité (fade-in) de 150ms.

### 3. Carrousel des Membres Actifs
Présent sur la page d'accueil et le détail des projets pour valoriser l'humain.
*   **Comportement :** Affichage horizontal de cartes de membres de style glassmorphism. Le glissement (swipe) sur mobile et les boutons fléchés subtils sur desktop permettent une navigation fluide sans rechargement.

### 4. Carte d'Événement avec "Dot Live"
*   **Comportement :** Si l'événement ou la conférence se déroule en ce moment même, la carte affiche un badge avec un dot vert/bleu de 6px qui pulse de manière continue (`scale(1 → 1.5 → 1)` en boucle de 2 secondes).

---

## State Patterns

### 1. Résilience API & Mocks (Mode Développement)
*   **État :** En développement, un appel API échoue (code `404`).
*   **Traitement :** La SPA intercepte l'erreur, charge instantanément les données correspondantes du fichier local `ancien_contenu.json`, et affiche un badge discret dans la console ou dans un coin de l'interface en mode développement : `Mocks activés`. Pour l'utilisateur final en production, aucun badge n'est affiché et le basculement est invisible (les données de secours s'affichent de façon transparente).

### 2. Chargement Initial (Skeleton States)
*   **État :** L'application récupère les données des projets ou des actualités.
*   **Traitement :** Remplacement des cartes Bento par des conteneurs "Squelettes" (Skeleton components) translucides qui s'animent en pulsation d'opacité de 30% à 70% toutes les 1.5 seconde. Aucun indicateur de chargement circulaire (spinner) n'est toléré au milieu de l'écran principal.

### 3. Recherche Sans Résultat (Empty Search)
*   **État :** L'utilisateur tape un mot-clé qui ne correspond à aucun projet.
*   **Traitement :** La grille Bento s'estompe et laisse place à une illustration filaire d'un circuit brisé avec le message : *"✦ Aucun tracé scientifique ne correspond à votre recherche. Essayez un autre domaine (ex. IA, Physique, Énergie)."* Un bouton d'action principal invite à réinitialiser les filtres.

---

## Interaction Primitives

*   **Raccourci Universel (`⌘K` ou `Ctrl+K`) :** Ouvre une barre de commande centrale (Command Palette) permettant de naviguer instantanément entre les pages, de rechercher un projet ou de basculer le thème (Clair/Sombre) au clavier.
*   **Touches de Navigation Rapide :**
    *   `g` puis `h` : Retour à l'accueil principal.
    *   `g` puis `d` : Aller au tableau de bord.
    *   `Esc` : Ferme instantanément toute modale ou la barre de commande ouverte.
*   **Transitions d'Écran :** Le changement de route SPA applique un effet de fondu enchaîné léger (`fade-in` de 200ms) avec un léger glissement vertical de 10px vers le haut pour donner une sensation de vitesse et de légèreté.

---

## Accessibility Floor

*   **Ratios de Contraste :** Conformes à la norme WCAG 2.2 AA (Violet Royal `#6C4CF1` et Orange Brûlé `#E76F00` à plus de 4.5:1 sur blanc). L'Ambre Premium (`#FF8A3D`) est interdit pour du texte de petite taille.
*   **Focus Visible :** Tous les boutons et champs de saisie possèdent un contour de focus distinctif `{colors.brand-violet-light}` à 100% d'opacité avec un décalage (offset) de 2px lors de la navigation au clavier (`Tab`).
*   **Navigation au Clavier :** L'intégralité des modales, formulaires et carrousels est entièrement utilisable sans souris.

---

## Responsive & Platform

*   **Desktop (> 1024px) :** Affichage Bento complet sur 12 colonnes. Sidebar déployable visible pour les utilisateurs connectés.
*   **Tablette (768px - 1023px) :** La grille Bento passe automatiquement sur 2 colonnes (`col-span-6`). La Sidebar se rétracte et ne s'ouvre que sous forme de volet flottant.
*   **Mobile (< 768px) :** Disposition sur une seule colonne verticale (`col-span-12`). La navigation supérieure se transforme en menu burger glissant. Les effets de flou de verre (`backdrop-filter`) sont simplifiés pour économiser la batterie des appareils mobiles.

---

## Key Flows

### Parcours 1 — Découverte & Inscription Étudiante (Sofia, Étudiante, 14h15)
1.  Sofia arrive sur la page d'accueil claire de **FIERI** (`/`). Elle est accueillie par le dégradé "Aube Cosmique" chaleureux et la grille Bento présentant le projet phare en grand.
2.  Elle clique sur la carte Bento *"Clubs de Recherche"*, ce qui la dirige vers la route `/clubs`.
3.  Elle explore les clubs nationaux. Au survol d'une carte de club, celle-ci s'élève subtilement et révèle un bouton *"Rejoindre"*.
4.  Elle clique sur le bouton de son choix. Une modale d'inscription de type glassmorphism s'ouvre en fondu enchaîné. Elle saisit ses coordonnées universitaires.
5.  **AHA Moment :** Lors de la validation, l'application effectue l'appel API. Si l'API renvoie 404 en développement, le système intercepte l'erreur, simule une inscription réussie avec les mocks locaux, et affiche un badge d'accès étudiant violet avec un tracé SVG s'illuminant au clic. L'effet est gratifiant, ludique et immédiat.

### Parcours 2 — Publication d'un Chercheur (Dr. Quinn, Chercheur, 21h30)
1.  Le Dr. Quinn se connecte à la plateforme et accède à son tableau de bord (`/dashboard`). Sa Sidebar est active en mode sombre "Dark Cosmique" pour favoriser sa concentration en soirée.
2.  Il clique sur l'icône *"Publier"* dans la Sidebar déployée.
3.  Le formulaire de publication s'ouvre. Il saisit le titre, le résumé de sa recherche et téléverse son article.
4.  Il clique sur *"Diffuser sur le réseau"*.
5.  **AHA Moment :** L'application envoie les données. Une transition dynamique simule l'envoi sous la forme d'une onde énergétique ambre pulsant le long d'un tracé géométrique. Dès que l'API confirme l'enregistrement (ou que le mock prend le relais de manière transparente en développement), la nouvelle publication apparaît instantanément en première position de sa grille Bento de profil public, prête à être partagée avec la communauté nationale.
