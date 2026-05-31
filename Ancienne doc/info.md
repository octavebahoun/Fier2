


FIERI RESEARCH
Cahier des Charges Fonctionnel & Technique

Plateforme Web Scientifique — Version 1.0
2025


Référence
FIERI-CDC-2025-V1
Statut
En cours de validation
Audience
Équipe projet, développeurs, designers, stakeholders
Auteur
Excellence Team
Date
2025



1. Contexte & Présentation du projet
FIERI Research est une plateforme web dédiée à la recherche scientifique, à l'innovation, aux clubs étudiants et chercheurs, aux événements et à l'espace membre. Le projet existant repose sur des pages HTML statiques visuellement abouties dont les fonctionnalités seront utilisées dans la suite du processus . L'objectif est de les structurer, connecter et rendre pleinement fonctionnelles.

Le projet s'inscrit dans une démarche de valorisation de la recherche scientifique en offrant une expérience numérique premium, crédible et évolutive.

2. Objectifs du projet
La plateforme doit permettre de :
Présenter FIERI et ses activités de manière claire et institutionnelle
Valoriser les projets, publications et actualités scientifiques
Faciliter l'adhésion aux clubs, formations et événements
Offrir un espace membre avec tableau de bord de suivi
Donner un accès rapide au support et au contact

3. État actuel & périmètre de travail
3.1 Écrans existants
Le workspace doit contenir les écrans suivants :
Accueil principal
Accueil version étudiants / clubs
Actualités scientifiques / feed
Aide et contact
Clubs de recherche
Détail d'un projet
Espace membres
Formations et ateliers
Profil chercheur
Projets & innovations
Tableau de bord membre
Événements & conférences

3.2 Design system
Le design system est défini actuellement peut varier mais nous avons actuellement.
Palette : bleu profond (#1A3A6B), cyan (#00B4D8), surfaces tonales
Typographies : Manrope (titres) + Inter (contenu)
Style éditorial scientifique, glassmorphism discret
Cartes sans bordures marquées, profondeur tonale

4. Périmètre fonctionnel
4.1 Pages à livrer
12 pages principales constituent le périmètre du projet :
Accueil principal FIERI
Accueil version étudiant / clubs
Flux d'actualités scientifiques
Clubs de recherche
Projets & innovations
Détail d'un projet
Formations & ateliers
Événements & conférences
Espace membres
Tableau de bord membre
Profil chercheur
Aide / contact

4.2 Fonctionnalités transverses
Navigation principale cohérente sur tout le site
Navigation mobile avec menu adaptatif ou bottom nav
Boutons d'action visibles et hiérarchisés
Cartes interactives pour projets, actualités, événements, formations
Filtres par catégorie dans toutes les listes
États visuels : survol, activation, focus
Formulaire de connexion membre et points de contact
Indicateurs live / en cours / innovation pulse pour contenus actifs


5. Besoins détaillés par page
5.1 Accueil principal
Présenter la mission FIERI avec un hero fort et clair
Mettre en avant les projets phares
Afficher les dernières actualités scientifiques
CTA : découvrir les projets, rejoindre FIERI
Résumé visuel de l'activité en cours

5.2 Accueil étudiant / clubs
Positionner FIERI comme réseau étudiant-recherche
Mettre en avant : rejoindre un club, se former, entrepreneuriat
Afficher les succès de clubs et opportunités
Accès rapides vers clubs, ateliers et membres

5.3 Actualités scientifiques
Recherche dans le flux d'articles
Filtres par thème ou domaine
Article principal mis en avant (hero éditorial)
Grille d'articles avec auteur, date, catégorie et résumé

5.4 Clubs de recherche
Filtres par discipline
Club principal mis en avant
Liste des clubs avec membres, publications et CTA d'adhésion
Accès mentorat

5.5 Projets & innovations
Filtres par thématique
Projet phare mis en avant
Projets secondaires en bento grid
Consultation détaillée d'une fiche projet
Bloc inspiration / proposition d'idée

5.6 Détail d'un projet
Résumé, objectifs et résultats clés
Équipe de recherche
Chronologie des phases du projet
Publications associées
CTA de soutien / contribution

5.7 Formations & ateliers
Filtres par thème
Catalogue des formations : date, catégorie, intervenants, CTA
Module d'impact et statistiques
Inscription à une session ou liste d'attente

5.8 Événements & conférences
Filtres par type d'événement
Événement en direct mis en avant
Liste verticale : date, horaire, lieu, places restantes
Inscription et accès au stream

5.9 Espace membres
Avantages de l'adhésion clairement présentés
Formulaires : inscription, don, partenariat
Formulaire de connexion membre
Statistiques de l'association

5.10 Tableau de bord membre
Projets suivis
Accès rapide aux outils de recherche et publication
Contributions financières
Événements à venir
Dernières publications

5.11 Profil chercheur
Identité : photo, nom, titre, affiliations
Spécialités, biographie, statistiques académiques
Projets en cours et publications récentes
Distinctions et récompenses
Actions : partager, contacter, suivre

5.12 Aide / contact
Aide contextuelle par section
FAQ, contact direct et support
Raccourcis de navigation et d'assistance
Présentation légère et rassurante


6. Contenus attendus
Logos et identité visuelle cohérente FIERI
Titres de sections courts, éditoriaux, en français
Résumés de projets, articles, formations, événements et profils
Données chiffrées : membres, publications, brevets, participants
Images illustratives scientifiques de bonne qualité (libres de droits)
Badges de catégories et statuts (live, en cours, terminé, etc.)

7. Exigences UX / UI
Style premium, scientifique et éditorial
Hiérarchie claire : hero > cartes > listes > CTA
Responsive mobile-first, desktop optimisé
Surfaces tonales plutôt que bordures lourdes
Cyan réservé aux états actifs, live et interactifs
Micro-interactions : hover, pulse, transitions, focus
Navigation stable, rapide, lisible

8. Règles de conception
Respecter le design system 
Manrope pour les titres, Inter pour le contenu courant
Préférer les surfaces tonales aux bordures visibles
Cyan uniquement pour les états actifs ou live
Éviter les arrondis excessifs et séparateurs trop marqués
Identité homogène sur toutes les pages et composants

9. Exigences techniques
9.1 Architecture
Site responsive, mobile-first
Utilisation cohérente de Tailwind CSS ou équivalent
Navigation fonctionnelle entre toutes les pages
Contenus sous forme de composants réutilisables
Architecture compatible ajout de données dynamiques (backend-ready)

9.2 Accessibilité
Contrastes conformes WCAG AA
Focus visibles sur éléments interactifs
Textes alternatifs sur toutes les images
Tailles de police lisibles (min. 14px corps de texte)

9.3 SEO de base
Balises title et meta description par page
Structure sémantique HTML5 (h1, h2, main, nav, article)
Données structurées minimales pour les projets et événements

9.4 Performances
Temps de chargement initial < 3 secondes
Images optimisées (WebP, lazy loading)
Pas de dépendances inutiles


10. Priorités de réalisation

Priorité
Description
Statut
P1 — Indispensable
Définition d’un design finale , Structurer les wireframes du site 
À faire en premier
P2 
Implémentation et Filtres interactifs réels, système de détail, préparation gestion de contenu réel
Après P1
P3 — Évolution
Auth complète, dashboard backend, gestion inscriptions/dons/notifs, recherche globale
Phase suivante



11. Critères d'acceptation
Le projet sera considéré conforme si :
Toutes les pages principales sont présentes et reliées
Le design est homogène sur l'ensemble du site
Le responsive fonctionne correctement sur mobile et desktop
Les contenus clés sont compréhensibles et hiérarchisés
Les actions principales sont accessibles en moins de 3 clics
Aucun écran critique n'est cassé visuellement
Les éléments support, inscription, consultation et suivi sont clairement identifiables

13. Livrables attendus
Pages SPA ou application intégrée selon la cible technique
Composants communs : navigation, cartes, filtres, boutons
Documentation du design system et des contenus
Cahier des charges fonctionnel et visuel mis à jour
Guide d'intégration pour passage aux données dynamiques

14. Résumé exécutif
FIERI Research n'est pas une simple vitrine. C'est une plateforme scientifique cohérente, crédible et évolutive, pensée pour valoriser la recherche, les clubs, les événements et l'engagement des membres dans un univers visuel premium. Le chantier prioritaire est la connexion et l'uniformisation des écrans existants avant toute nouvelle fonctionnalité.

