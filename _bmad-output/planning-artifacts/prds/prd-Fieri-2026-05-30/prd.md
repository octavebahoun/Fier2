---
title: 'PRD - FIERI Research'
status: 'draft'
created: '2026-05-30'
updated: '2026-05-30'
---

# Product Requirements Document (PRD) — FIERI Research

> Ce document définit les exigences produit pour la refonte premium de la plateforme **FIERI Research**, axée sur une expérience "SaaS Scientifique" avec une esthétique "Dark Cosmique". Il sert de contrat de développement pour l'unification des écrans et la connexion à l'API de production.

---

## 1. Cartographie des Écrans et Modèles d'Accès

La plateforme est construite comme une Single Page Application (SPA) réactive orchestrée par état dans `src/App.jsx`. L'architecture définit 15 écrans majeurs, chacun associé à un niveau d'accès et des endpoints spécifiques.

### 1.1 Tableau de Synthèse des Écrans

| # | Identifiant Page (`App.jsx`) | Composant React (`src/pages/`) | Rôle Minimum Requis | État de Connexion Actuel | Endpoints Associés (Vercel) |
|---|---|---|---|---|---|
| 1 | `home` | `Home.jsx` | Visiteur | 🟢 Connecté (Metadonnées) | `GET /stats` |
| 2 | `student-portal` | `StudentPortal.jsx` | Visiteur | 🟡 Mock Hybride | `GET /clubs`, `GET /formations` |
| 3 | `news` | `News.jsx` | Visiteur | 🟡 Mock Hybride | `GET /news` |
| 4 | `clubs` | `ResearchClubs.jsx` | Visiteur (Adhésion: Membre) | 🟡 Mock Hybride | `GET /clubs`, `POST /clubs/:id/join` |
| 5 | `projects` | `Projects.jsx` | Visiteur | 🟡 Mock Hybride | `GET /projects` |
| 6 | `project-detail` | `ProjectDetail.jsx` | Visiteur (Actions: Membre) | 🟡 Mock Hybride | `GET /projects/:id`, `POST /projects/:id/support` |
| 7 | `workshops` | `Workshops.jsx` | Visiteur (Inscript: Membre) | 🟡 Mock Hybride | `GET /formations`, `POST /formations/:id/register` |
| 8 | `events` | `Events.jsx` | Visiteur (Inscript: Membre) | 🟡 Mock Hybride | `GET /events`, `POST /events/:id/register` |
| 9 | `members` | `Members.jsx` | Visiteur | 🟡 Mock Hybride | `GET /researchers` |
| 10 | `dashboard` | `Dashboard.jsx` | 🔒 Membre (Auth) | 🟢 Connecté (Profil) + 🟡 Mocks | `GET /members/me`, `GET /dashboard/me` |
| 11 | `profile` | `ResearcherProfile.jsx` | Visiteur | 🟡 Mock Hybride | `GET /researchers/:id` |
| 12 | `contact` | `Contact.jsx` | Visiteur | 🟡 Mock Hybride | `POST /contact` |
| 13 | `auth` | `Auth.jsx` | Visiteur | 🟢 Connecté (Réel Vercel) | `POST /auth/register`, `POST /auth/login` |
| 14 | `opportunities` | `Opportunities.jsx` | Visiteur | 🟡 Mock Hybride | `GET /opportunities` |

### 1.2 Matrice d'Accès par Rôle (Gating de Sécurité)

La plateforme supporte 4 rôles distincts. Le passage d'un rôle public à un rôle privé modifie dynamiquement la barre de navigation et autorise l'accès aux boutons d'actions transactionnels (adhérer, s'inscrire, contribuer).

1. **Visiteur (Public) :** Accès en lecture seule à tous les hubs d'information.
2. **Membre (Connecté) :** Peut s'inscrire aux hackathons, rejoindre un club de recherche, soutenir financièrement un projet.
3. **Chercheur (Membre certifié) :** Membre possédant un profil de chercheur public. Accède aux boutons d'ajout/modification d'articles, projets, et publications.
4. **Admin (Gestionnaire) :** Droits absolus d'administration sur le backend (non représenté sur la SPA cliente, contrôlé par des rôles JWT).

---

## 2. Stratégie de Connexion API et Résilience

Pour concilier la rapidité du développement frontend et la robustesse de la production, la couche API cliente (`src/services/api.js`) implémente une stratégie d'intégration hybride intelligente et sensible à l'environnement.

### 2.1 Comportement par Environnement

```mermaid
graph TD
    A[Appel API Client] --> B{Environnement ?}
    B -- Production -- Strict --> C[Requête Réelle Vercel]
    C --> D{Succès ?}
    D -- Oui --> E[Retourner Données]
    D -- Non/Erreur --> F[Propager Erreur & Alerte UI]
    
    B -- Développement -- Hybride --> G[Requête Réelle Vercel]
    G --> H{Erreur 404 ou Réseau ?}
    H -- Oui --> I[Chargement Silencieux du Mock local]
    H -- Non --> E
```

#### 2.1.1 Mode Développement (`NODE_ENV === 'development'`)
*   **Bascule automatique sur 404 :** Le client tente d'appeler l'API de production Vercel (`https://backend-fieri.vercel.app`). Si l'endpoint renvoie une erreur `404 Not Found` (car non encore déployé sur le backend) ou échoue à cause d'une interruption réseau, le client intercepte l'erreur et charge automatiquement le mock de données locales (`mockDb`).
*   **Objectif :** Éviter de bloquer l'équipe frontend durant le chantier d'intégration progressive des 60 endpoints.

#### 2.1.2 Mode Production (`NODE_ENV === 'production'`)
*   **Exclusivité Réelle :** Aucun mock de secours n'est toléré en production. Tous les appels doivent obligatoirement aboutir sur l'API réelle.
*   **Gestion Stricte des Erreurs :** Si un appel échoue (404, 500, erreur réseau), une erreur explicite est levée et propagée jusqu'aux composants UI pour afficher un état dégradé propre (State Empty ou message d'erreur utilisateur), sans jamais masquer la panne par des données fictives.

---

## 3. Exigences des Modules et Contrats d'API

### 3.1 Pôle Opportunités (`/opportunities`)

L'écran `opportunities` (`Opportunities.jsx`) centralise les offres de recherche, appels à candidatures, stages scientifiques et cooptations de membres.

#### 3.1.1 Fonctionnalités Clés
*   **Grille Dynamique & Filtres :** Affichage d'une grille de cartes d'opportunités avec des filtres interactifs (Type d'opportunité, Discipline, Statut de l'offre).
*   **Espace Chercheur :** Les chercheurs connectés peuvent publier une offre de recherche (stage de R&D au sein d'un club, appel à contributeur).
*   **Candidature Intégrée :** Les membres connectés peuvent postuler en ligne en téléchargeant un CV/Portfolio scientifique.

#### 3.1.2 Contrat d'API du Pôle Opportunités
*   `GET /opportunities` : Récupérer la liste des opportunités (Filtres optionnels : `type`, `domain`, `status`).
*   `GET /opportunities/:id` : Récupérer le détail complet d'une offre.
*   `POST /opportunities` : Publier une opportunité (Rôle requis : `CHERCHEUR` ou `ADMIN`).
*   `PUT /opportunities/:id` : Modifier une opportunité publiée (Propriétaire de l'offre ou `ADMIN`).
*   `DELETE /opportunities/:id` : Supprimer une opportunité (Propriétaire de l'offre ou `ADMIN`).

---

### 3.2 Pôle Projets de Recherche (`/projects`)

L'écran `projects` (`Projects.jsx`) et son écran de détail `project-detail` (`ProjectDetail.jsx`) forment le cœur de l'expérience vitrine et R&D de la plateforme.

#### 3.2.1 Fonctionnalités Clés
*   **Bento Grid Asymétrique :** Affichage premium et moderne des projets scientifiques. L'agencement sous forme de Bento Grid (cellules col-span-2 pour les projets phares, col-span-1 pour les projets standards) est calculé entièrement par le client frontend pour préserver la simplicité de l'API.
*   **Suivi de Projet (Follow) :** Les membres connectés peuvent suivre un projet. Cette action incrémente le nombre de followers en direct et l'ajoute instantanément à l'onglet "Projets suivis" de leur Dashboard privé.
*   **Formulaire de Soutien (Promesse de Financement) :** Tout visiteur ou membre peut soumettre une promesse de soutien financier via une modale de contribution. La soumission envoie une promesse `{ nom, email, montant, message }` au backend. L'incrémentation effective du budget global affiché (`budgetRaised`) est soumise à une approbation manuelle par un administrateur en backend.
*   **Dossier Scientifique Complet :** La page détaillée du projet regroupe dynamiquement sa timeline de R&D (jalons terminés vs prévus), son équipe scientifique de cooptation (chercheurs et rôles précis), et ses publications académiques ou brevets associés.

#### 3.2.2 Contrat d'API du Pôle Projets
*   `GET /projects` : Récupérer la liste filtrable (Thème, statut) de tous les projets de R&D.
*   `GET /projects/:id` : Détail complet d'un projet incluant l'équipe, la timeline, les publications et les statistiques de soutien.
*   `POST /projects` : Créer un projet scientifique (Rôle requis : `CHERCHEUR` ou `ADMIN`).
*   `PUT /projects/:id` : Modifier la timeline, l'équipe ou le contenu (Propriétaire ou `ADMIN`).
*   `DELETE /projects/:id` : Supprimer un projet (Propriétaire ou `ADMIN`).
*   `POST /projects/:id/follow` : S'abonner aux actualités du projet (Rôle requis : `MEMBRE`).
*   `DELETE /projects/:id/follow` : Se désabonner du projet (Rôle requis : `MEMBRE`).
*   `POST /projects/:id/support` : Soumettre une promesse de financement (Public / Membre).

---

### 3.3 Pôle Clubs Scientifiques (`/clubs`)

L'écran `clubs` (`ResearchClubs.jsx`) présente les 6 pôles de recherche thématiques de la Cité FIERI.

#### 3.3.1 Fonctionnalités Clés
*   **Identités Visuelles Distinctes :** Cartes de clubs élégantes reprenant les chartes de couleurs d'accents spécifiques définies par la marque (ex. Robotique: Orange brûlé, IoT: Bleu Fieri, Éco-énergie: Vert éco).
*   **Adhésion Globale Simplifiée :** Un clic sur "Rejoindre le club" permet à un membre connecté d'intégrer instantanément le pôle de recherche de façon globale. Les divisions du club (ex. *Deep Learning* ou *Computer Vision* pour le club IA) restent des informations d'orientation techniques affichées sur la carte.
*   **Synchronisation Dashboard & Alertes :** L'action d'adhésion ajoute automatiquement le pôle à l'espace membre de l'étudiant et déclenche une notification interne au Dashboard ("Votre inscription au club a été approuvée !").

#### 3.3.2 Contrat d'API du Pôle Clubs
*   `GET /clubs` : Récupérer la liste des 6 clubs spécialisés de la Cité.
*   `GET /clubs/:id` : Récupérer le détail complet du club avec ses membres, divisions et publications affiliées.
*   `POST /clubs` : Créer un pôle de recherche (Rôle requis : `ADMIN`).
*   `PUT /clubs/:id` : Modifier les métadonnées et divisions d'un club (Rôle requis : `ADMIN` ou Responsable).
*   `POST /clubs/:id/join` : Rejoindre le club (Rôle requis : `MEMBRE`).
*   `DELETE /clubs/:id/join` : Quitter le club (Rôle requis : `MEMBRE`).

---

### 3.4 Pôle Académie & Formations (`/workshops`)

L'écran `workshops` (`Workshops.jsx`) gère le catalogue des formations et bootcamps intensifs dispensés par les chercheurs scientifiques de la Cité.

#### 3.4.1 Fonctionnalités Clés
*   **Catalogue R&D :** Présentation claire des sessions avec instructeur associé, durée, niveau technique requis (Débutant, Intermédiaire, Avancé) et places encore disponibles.
*   **Inscription en un Clic :** Les membres connectés s'inscrivent directement depuis l'atelier. Cette action décrémente instantanément la quantité de places disponibles `placesLeft` en base de données réelle.
*   **Modale d'Attente interactive :** Si un atelier affiche complet (`placesLeft === 0`), le bouton d'action se transforme en bouton de mise en attente. Un clic ouvre une boîte de dialogue demandant à l'étudiant de valider formellement son inscription sur liste d'attente (`waitlist`) pour être notifié par email si un désistement libère une place.
*   **Désinscription et Réallocation :** Possibilité de se désinscrire à tout moment. L'action recrée une place libre et réaffecte automatiquement le premier membre en liste d'attente.

#### 3.4.2 Contrat d'API du Pôle Académie
*   `GET /formations` : Récupérer la liste filtrable (Thème, niveau, date) de toutes les sessions.
*   `GET /formations/:id` : Détail complet de la formation avec profil complet de l'instructeur.
*   `POST /formations` : Créer une session de formation (Rôle requis : `CHERCHEUR` ou `ADMIN`).
*   `PUT /formations/:id` : Modifier une formation planifiée (Rôle requis : `ADMIN` ou Enseignant).
*   `POST /formations/:id/register` : S'inscrire à une formation (Rôle requis : `MEMBRE`).
*   `POST /formations/:id/waitlist` : S'inscrire en liste d'attente (Rôle requis : `MEMBRE`).
*   `DELETE /formations/:id/register` : Se désinscrire d'une formation (Rôle requis : `MEMBRE`).

---

### 3.5 Pôle Événements & Hackathons (`/events`)

L'écran `events` (`Events.jsx`) centralise l'accès aux symposiums scientifiques, conférences en ligne et hackathons technologiques (ex: GreenTech Hackathon 2026).

#### 3.5.1 Fonctionnalités Clés
*   **Promotion Interactive :** Présentation du prix de l'événement (ex. Prize Pool en FCFA), du planning heure par heure (Timeline), et du nombre total de participants.
*   **Accès Sélectif au Flux Streaming :** L'événement propose un bouton d'accès au direct vidéo. Ce bouton effectue un appel `GET /events/:id/stream` pour obtenir le lien de diffusion. L'accès à ce flux live est strictement réservé aux membres connectés préalablement enregistrés à cet événement spécifique. Si le membre n'est pas inscrit, le bouton de streaming reste inactif et l'invite à s'enregistrer.

#### 3.5.2 Contrat d'API du Pôle Événements
*   `GET /events` : Récupérer la liste filtrable (Type, date, lieu) des événements.
*   `GET /events/:id` : Détail de l'événement incluant la timeline et les conditions d'accès.
*   `POST /events` : Créer un nouvel événement (Rôle requis : `ADMIN`).
*   `PUT /events/:id` : Modifier un événement ou son planning (Rôle requis : `ADMIN`).
*   `POST /events/:id/register` : S'enregistrer pour participer (Rôle requis : `MEMBRE`).
*   `DELETE /events/:id/register` : Annuler sa participation (Rôle requis : `MEMBRE`).
*   `GET /events/:id/stream` : Récupérer le lien secret de diffusion en direct (Rôle requis : `MEMBRE` inscrit).

---

### 3.6 Espace Privé, Dashboard & Notifications (`/dashboard`)

L'écran privé `dashboard` (`Dashboard.jsx`) est le hub de contrôle de chaque membre et chercheur au sein de la Cité FIERI.

#### 3.6.1 Fonctionnalités Clés
*   **Panneau de Statistiques :** Indicateurs synthétiques en direct (nombre de clubs rejoints, projets suivis, ateliers réservés).
*   **Espaces Personnalisés :**
    *   *Mes Clubs :* Raccourcis vers tous les pôles de recherche de recherche rejoints par le membre.
    *   *Projets Suivis :* Tableau de bord regroupant les projets suivis avec notification lors d'une mise à jour de jalon sur leur timeline.
    *   *Ateliers & Formations :* Détails et dates des cours réservés par l'apprenant.
*   **Centre de Notifications Privées :**
    *   Flux interactif des notifications (approbations de clubs, recrutements, ateliers programmés).
    *   Actions interactives pour marquer une notification comme lue en un clic ou tout effacer.
*   **Édition de Profil Chercheur (Centralisée) :** Un onglet d'administration privé est rendu disponible uniquement pour les membres ayant le rôle `CHERCHEUR`. Cet onglet centralise la modification de leur biographie scientifique publique, de leur pôle et de leurs publications académiques (liaison directe avec `PUT /researchers/me`), évitant ainsi d'encombrer la page publique de profil.

#### 3.6.2 Contrat d'API du Pôle Dashboard
*   `GET /dashboard/me` : Synthèse globale des activités du membre (clubs rejoints, projets suivis, formations).
*   `GET /notifications` : Récupérer la liste des notifications de l'utilisateur.
*   `PUT /notifications/:id/read` : Marquer une notification comme lue.
*   `DELETE /notifications` : Supprimer toutes les notifications du compte.
*   `PUT /researchers/me` : Mettre à jour les données du profil de Chercheur (Rôle requis : `CHERCHEUR`).

---

### 3.7 Pôle Actualités & Publications Scientifiques (`/news`)

L'écran `news` (`News.jsx`) regroupe les annonces officielles de la Cité et la production intellectuelle (articles de vulgarisation, comptes-rendus).

#### 3.7.1 Fonctionnalités Clés
*   **Comité de Lecture (Circuit de Validation) :** Tout chercheur connecté peut soumettre un nouvel article scientifique via `POST /news`. Par défaut, la création attribue obligatoirement le statut `PENDING`. L'article n'est pas rendu public. Pour s'afficher sur le site, l'article doit être validé manuellement par un administrateur via l'endpoint d'approbation dédié `PATCH /news/:id/approve` (faisant basculer son statut en `APPROVED`).
*   **Filtres par Thématiques :** Les actualités peuvent être filtrées par pôle scientifique ou par date de parution.

#### 3.7.2 Contrat d'API du Pôle Actualités
*   `GET /news` : Récupérer la liste des articles approuvés (`status === 'APPROVED'`).
*   `GET /news/:id` : Détail complet d'un article.
*   `POST /news` : Soumettre un nouvel article scientifique (Rôle requis : `CHERCHEUR` ou `ADMIN`, statut initial : `PENDING`).
*   `PUT /news/:id` : Modifier un article (Propriétaire ou `ADMIN`).
*   `DELETE /news/:id` : Supprimer un article (Propriétaire ou `ADMIN`).
*   `PATCH /news/:id/approve` : Valider et publier un article en attente (Rôle requis : `ADMIN`).

---

### 3.8 Pôle Authentification & Métadonnées d'Organisation (`/auth`)

L'écran `auth` (`Auth.jsx`) gère le cycle de vie de la session membre (connexion et enregistrement multi-étape).

#### 3.8.1 Fonctionnalités Clés
*   **Mise en Cache Globale :** Afin de garantir une fluidité absolue, l'application charge et stocke localement toutes les métadonnées d'organisation (Liste des Pays `GET /countries`, Universités `GET /universities` et Branches `GET /branches`) dès le chargement initial de la plateforme. Cela élimine les latences de requêtes séquentielles lors du remplissage du formulaire d'inscription.
*   **Inscription Universitaire Multi-Étape :** Demande à l'utilisateur de spécifier son pays, puis son université et sa branche d'étude à partir des listes d'organisation.
*   **Session Persistante :** Stockage sécurisé du jeton JWT dans le `localStorage` de l'application cliente.

#### 3.8.2 Contrat d'API du Pôle Authentification
*   `POST /auth/register` : Créer un compte membre lié à une affiliation universitaire.
*   `POST /auth/login` : Connecter un membre existant et renvoyer le profil et le jeton JWT.
*   `GET /countries` : Liste des pays d'Afrique représentés.
*   `GET /universities` : Liste globale des universités affiliées.
*   `GET /branches` : Liste globale des filières scientifiques d'études.

---

### 3.9 Pôle Profils Scientifiques (`/members`, `/profile`)

L'écran `members` (`Members.jsx`) liste la communauté de recherche tandis que `profile` (`ResearcherProfile.jsx`) affiche les détails académiques de chaque chercheur.

#### 3.9.1 Fonctionnalités Clés
*   **Statistiques Publiques d'Abonnés :** La fiche publique affiche fièrement et en direct le nombre d'abonnés du chercheur ("86 Followers") pour valoriser son influence scientifique.
*   **Abonnement R&D :** Tout membre connecté peut suivre les travaux d'un chercheur scientifique (l'action incrémente le compteur public et ajoute le chercheur dans le dashboard de l'étudiant).

#### 3.9.2 Contrat d'API du Pôle Profils
*   `GET /researchers` : Liste complète des profils de chercheurs publics.
*   `GET /researchers/:id` : Détail complet d'un chercheur (biographie, distinctions, publications).
*   `POST /researchers/:id/follow` : S'abonner aux travaux d'un chercheur (Rôle requis : `MEMBRE`).
*   `DELETE /researchers/:id/follow` : Se désabonner des travaux d'un chercheur (Rôle requis : `MEMBRE`).

---

### 3.10 Pôle Contact & Support (`/contact`)

L'écran `contact` (`Contact.jsx`) permet aux visiteurs et membres connectés de poser une question de support technique ou d'adresser une requête au Bureau FIERI.

#### 3.10.1 Fonctionnalités Clés
*   **Remplissage Intelligent :** L'interface pré-remplit les champs Nom et Email si l'utilisateur possède une session membre active.

#### 3.10.2 Contrat d'API du Pôle Contact
*   `POST /contact` : Transmettre un message de contact ou une demande d'aide.

---

## 4. Exigences Non-Fonctionnelles

### 4.1 Sécurité & Authentification
*   **Stockage du Token :** Le token JWT doit être transmis dans les headers HTTP de toutes les requêtes transactionnelles sous la forme `Authorization: Bearer <token>`.
*   **Garde-Barrières Frontend (Gating) :** Empêcher le rendu du composant Dashboard (`Dashboard.jsx`) si aucun JWT valide n'est détecté localement. Rediriger silencieusement l'utilisateur vers l'écran `auth`.

### 4.2 Performances & UX Premium
*   **Routage SPA Fluide :** Changement de page instantané via l'état global `currentPage` avec effet de transition fondu et retour automatique en haut de page en mode défilement doux (*Smooth Scroll*).
*   **Esthétique Dark Cosmique :** Respect strict des variables CSS définies dans `src/index.css` (Glassmorphism, ombres portées douces, coins arrondis uniformisés).
