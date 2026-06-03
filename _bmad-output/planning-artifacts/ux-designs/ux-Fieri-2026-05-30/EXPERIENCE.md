---
title: 'EXPERIENCE - FIERI Research'
status: 'final'
sources:
  - {planning_artifacts}/prds/prd-Fieri-2026-05-30/prd.md
updated: '2026-06-03'
---

# EXPERIENCE.md — FIERI Research Interaction & IA Specifications

> [!NOTE]
> Ce document est la spécification fonctionnelle d'interaction de **FIERI Research** rédigée selon le standard Google Labs `EXPERIENCE.md`. Il définit l'architecture d'information, les composants dynamiques, la gestion des états de l'application et les flux de parcours utilisateur clés.

---

## Foundation

**FIERI Research** est une application web monopage (SPA) fluide, hautement réactive et immersive. La racine du document déclare `<html lang="fr" dir="ltr">`. L'application s'appuie sur une architecture hybride de données : en développement, elle appelle l'API réelle et bascule automatiquement sur des données simulées locales (mocks) en cas de code retour `404` (non trouvé) pour garantir une expérience continue sans interruption de flux. En production, elle repose exclusivement sur des appels réels et affiche des toasts d'erreur informatifs en cas de rupture de réseau ou de défaillance de service.

Le système de navigation s'adapte dynamiquement selon **quatre profils utilisateurs (rôles)**, protégeant l'accès aux écrans avancés tout en maximisant la fluidité pour le public externe grâce à un découpage Bento Grid intelligent.

La page d'accueil se compose de **13 sections** en séquence verticale, chacune dotée d'un identifiant HTML (`id`) pour le lien d'ancrage direct : `hero`, `decouvrir`, `organisation`, `missions`, `vision`, `stats`, `clubs`, `evenements`, `ateliers`, `paf`, `partenaires`, `faq`, `contact`. Un bouton flottant **ScrollToTop** apparaît après 800px de scroll pour permettre un retour rapide en haut de page.

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

### 5. Bouton de Retour en Haut (ScrollToTop)
*   **Déclencheur :** Apparaît en `fixed bottom-6 right-6` avec un fond `accent-primary/90` et icône `ArrowUp` lorsque le défilement vertical dépasse 800px.
*   **Comportement :** Au clic, déclenche `window.scrollTo({ top: 0, behavior: 'smooth' })`. Animé via Framer Motion (fade + scale) à l'apparition et la disparition.
*   **Accessibilité :** Possède un `aria-label="Retour en haut"`.

### 6. Badge de Notifications (Navbar)
*   **Comportement :** Affiche le nombre de notifications non lues dans un cercle `bg-accent-secondary` de 20px positionné `absolute -top-2 -right-2` sur le bouton Dashboard.
*   **Seuil :** Au-delà de 99 notifications, affiche `99+`. Si `unreadCount === 0`, le badge est entièrement masqué (aucun point blanc ou zéro affiché).

### 7. Formulaire Newsletter (Footer)
*   **Comportement :** Champ email + bouton "OK" en ligne. À la soumission, validation coté client : email requis et format valide.
*   **États :**
    *   **Erreur :** Message d'erreur rouge inline sous le champ, bordure du champ passe en `border-red-500/50`.
    *   **Succès :** Message "✓ Abonnement validé avec succès !" avec fond `accent-secondary/10`, disparaît après 4.5s.
    *   **Pré-remplissage :** L'erreur se dissipe dès que l'utilisateur modifie le champ.

---

## State Patterns

### 1. Résilience API & Mocks (Mode Développement)
*   **État :** En développement, un appel API échoue (code `404`).
*   **Traitement :** La SPA intercepte l'erreur, charge instantanément les données correspondantes du fichier local `ancien_contenu.json`, et affiche un badge discret dans la console ou dans un coin de l'interface en mode développement : `Mocks activés`. Pour l'utilisateur final en production, aucun badge n'est affiché et le basculement est invisible (les données de secours s'affichent de façon transparente).

### 2. Chargement Initial (Skeleton States)
*   **État :** L'application récupère les données des projets ou des actualités.
*   **Traitement :** Remplacement des cartes Bento par des conteneurs "Squelettes" (Skeleton components) translucides qui s'animent en pulsation d'opacité de 30% à 70% toutes les 1.5 seconde. Aucun indicateur de chargement circulaire (spinner) n'est toléré au milieu de l'écran principal.

### 3. Erreur de Chargement API (Error State)
*   **État :** L'API distante ne répond pas (timeout, panne réseau, erreur serveur).
*   **Traitement :** Les données en défaut sont remplacées par un message d'erreur explicite, centré, avec une icône d'attention. Le message est rédigé dans le ton de la plateforme (ex. "Impossible de charger les ateliers pour le moment."). Un bouton **"Réessayer"** permet de relancer l'appel API sans recharger la page.
*   **Applications :** WorkshopsSection (landing page), ContactSection (envoi formulaire), Newsletter (footer).
*   **Contraste erreur/chargement :** L'état erreur n'apparaît qu'après un échec avéré — le skeleton de chargement s'affiche d'abord.

### 4. Validation de Formulaire Inline (Form Validation)
*   **État :** L'utilisateur soumet un formulaire avec des champs vides ou mal formatés.
*   **Traitement :** La validation s'effectue coté client avant tout appel API.
    *   **Champs requis :** Nom, email, message pour le contact ; email pour la newsletter.
    *   **Format :** L'email est validé par expression régulière (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
    *   **Affichage erreur :** Message rouge de 10px sous le champ concerné. Bordure du champ passe en `border-red-500/50`. L'erreur disparaît dès que l'utilisateur modifie la valeur du champ (clean-up automatique).
    *   **Bannière globale :** En cas d'échec API (ex. envoi Contact), une bannière rouge s'affiche au-dessus du formulaire avec le message d'erreur.
*   **Bouton de soumission :** Pendant l'appel API, le bouton affiche un spinner (SVG `animate-spin`) et le texte "Envoi en cours...". Le bouton est désactivé (`disabled`, `opacity-50`, `cursor-not-allowed`) pour éviter les doubles soumissions.

### 5. État Vide (Empty State)
*   **État :** Une section affiche des données dynamiques mais la liste est vide (pas de résultat).
*   **Traitement :** Un message centré informe l'utilisateur : "Aucun atelier programmé pour le moment." Aucune illustration ou skeleton n'est affiché — uniquement du texte sobre.
*   **Distinction :** L'état vide est distinct de l'état erreur (API défaillante) et de l'état chargement (skeleton).

### 6. Recherche Sans Résultat (Empty Search)
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
*   **Lien d'Évitement (Skip-to-Content) :** Le premier élément focusable de chaque page est un lien `<a href="#main-content">Aller au contenu principal</a>` masqué par défaut (classe `sr-only`). Il devient visible avec un contour `brand-violet-light` de 2px lors de la réception du focus via `Tab` (`:focus-visible`).
*   **Piégeage de Focus (Focus Trap) dans les Modales :** Lors de l'ouverture d'une modale (inscription, confirmation), le focus est déplacé vers le premier élément interactif du dialogue. La tabulation cyclique est bloquée à l'intérieur de la modale : Tab depuis le dernier élément ramène au premier. La touche `Escape` ferme la modale et restitue le focus à l'élément déclencheur. Chaque modale possède `role="dialog"`, `aria-modal="true"` et `aria-labelledby` pointant vers son titre.
*   **Formulaires Accessibles :** Chaque champ de formulaire est associé à un `<label htmlFor="id">` explicite. En cas d'erreur de validation, le champ reçoit `aria-invalid="true"` et le message d'erreur est lié au champ via `aria-describedby`. Le message d'erreur est wrappé dans un conteneur `role="alert"` pour être annoncé par les lecteurs d'écran.
*   **Zones Tactiles Minimales (Touch Targets) :** Sur mobile, toute cible interactive (bouton, lien, icône cliquable) doit mesurer au minimum `44×44px` (conforme WCAG 2.5.8). Pour les icônes seules (Sidebar contractée, badge de notification), une extension transparente (`::before`/`::after` ou `min-w-[44px] min-h-[44px]`) garantit la zone de clic minimale sans agrandir l'élément visuel.
*   **Accordéon (FAQ) :** Chaque bouton de l'accordéon FAQ possède `aria-expanded` (booléen synchronisé avec l'état d'ouverture), `aria-controls` pointant vers l'ID du panneau correspondant. Chaque panneau de réponse a `role="region"` et `aria-labelledby` pointant vers l'ID du bouton déclencheur. Les panneaux repliés ont `aria-hidden="true"`. La navigation Tab permet de passer d'un bouton à l'autre ; Enter/Spacetoggle l'ouverture.
*   **Mouvement Réduit (`prefers-reduced-motion`) :** Toute animation non essentielle (ticker infini des partenaires, compteur animé de statistiques, hover lift des cartes, expansion Sidebar, transition de page, pulse dot, ScrollToTop fade, bouton translate) détecte la préférence utilisateur via `useReducedMotion()` de Framer Motion. En mode réduit : animations immédiates, ticker immobile, compteur affiche la valeur finale sans interpolation.
*   **Repères de Navigation (Landmarks) :** La barre de navigation principale utilise `<nav aria-label="Navigation principale">`, la Sidebar chercheur utilise `<aside aria-label="Menu chercheur">`. Chaque section de la page d'accueil (identifiée par un `id`) est optionnellement déclarée comme `role="region"` avec `aria-labelledby` pointant vers le titre de la section.

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
