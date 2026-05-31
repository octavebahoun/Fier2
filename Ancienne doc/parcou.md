# FIERI Research — Wireframes Complets (API Full)
> Parcours utilisateur complet · Toutes fonctionnalités actives

---

## Types d'utilisateurs

| Type | Accès |
|------|-------|
| **Visiteur** | Lecture publique uniquement |
| **Membre** | Connecté — suivi, inscription, dashboard |
| **Chercheur** | Membre + profil public + publications/projets |
| **Admin** | Gestion complète du contenu |

---

## 1. Accueil Principal (`/`)

**Utilisateurs :** Tous
**Objectif :** Découvrir FIERI, convertir en membre

### Sections
```
[NAV] Logo | Projets · Clubs · Formations · Événements · Membres | CTA "Rejoindre"
[HERO] Mission FIERI + CTA "Voir les projets" / "Rejoindre FIERI"
[STATS LIVE] ← GET /stats → membres · publications · brevets · événements
[PROJETS PHARES] ← GET /projects?featured=true → 3 cartes
[ACTUALITÉS] ← GET /news?limit=3 → 3 derniers articles
[FOOTER] Liens + réseaux
```

### Actions
- `→ /projects` · `→ /register` · `→ /projects/:id` · `→ /news`

---

## 2. Accueil Étudiant (`/students`)

**Utilisateurs :** Visiteur, Étudiant
**Objectif :** S'orienter, rejoindre un club ou formation

### Sections
```
[HERO] "FIERI pour les étudiants" + CTA rejoindre / se former
[CLUBS] ← GET /clubs?limit=3 → 3 clubs mis en avant
[SUCCÈS] Témoignages membres (contenu statique ou CMS)
[FORMATIONS] ← GET /formations?limit=3 → 3 prochaines sessions
[ACCÈS RAPIDES] Clubs · Ateliers · Membres · Entrepreneuriat
```

### Actions
- `→ /clubs` · `→ /formations` · `→ /register` · `→ /members`

---

## 3. Actualités (`/news`)

**Utilisateurs :** Tous
**Objectif :** Lire, filtrer, partager des articles

### Sections
```
[SEARCH] input texte libre
[FILTRES] ← thème · domaine · date
[HERO ÉDITORIAL] ← GET /news?featured=true → article principal
[GRILLE] ← GET /news?theme=X&domain=Y&page=N → cards articles
[PAGINATION] charger plus
```

### Actions
- Filtrer (dropdown thème/domaine)
- Rechercher (input)
- `→ /news/:id` (lire)
- Partager (copie lien)

---

## 4. Détail Article (`/news/:id`)

**Utilisateurs :** Tous

### Sections
```
[HEADER] Titre · auteur · date · catégorie · badge domaine
[CONTENU] Corps de l'article ← GET /news/:id
[AUTEUR] ← data.author → lien profil chercheur
[PUBLICATIONS LIÉES] ← GET /publications?newsId=X
[ARTICLES SIMILAIRES] ← GET /news?domain=X&limit=3
```

### Actions
- `→ /researchers/:id` (auteur)
- `→ /news/:id` (article similaire)
- Partager

---

## 5. Clubs (`/clubs`)

**Utilisateurs :** Tous (inscription → auth)
**Objectif :** Explorer, rejoindre un club

### Sections
```
[FILTRES] discipline · université · statut
[CLUB VEDETTE] ← GET /clubs?featured=true
[LISTE] ← GET /clubs?discipline=X → cards : nom · membres · publications · CTA
[MENTORAT] bloc accès mentors
```

### Actions
- Filtrer
- `→ /clubs/:id`
- `[Rejoindre]` → POST /clubs/:id/join *(auth)*
- `→ /researchers` (mentors)

---

## 6. Détail Club (`/clubs/:id`)

**Utilisateurs :** Tous

### Sections
```
[HEADER] Nom · discipline · université · nb membres
[DESCRIPTION] Objectifs du club
[MEMBRES] ← GET /clubs/:id → data.members → avatars + rôles
[PUBLICATIONS] ← GET /publications?clubId=X
[PROJETS LIÉS] ← GET /projects?clubId=X
[CTA] Rejoindre / Quitter
```

### Actions
- `[Rejoindre]` → POST /clubs/:id/join *(auth)*
- `[Quitter]` → DELETE /clubs/:id/join *(auth)*
- `→ /researchers/:id` (membre)
- `→ /projects/:id`

---

## 7. Projets (`/projects`)

**Utilisateurs :** Tous
**Objectif :** Explorer, suivre, soumettre une idée

### Sections
```
[FILTRES] thématique · statut (en cours / terminé / innovation)
[PROJET PHARE] ← GET /projects?featured=true
[BENTO GRID] ← GET /projects?theme=X&status=Y
[BLOC INSPIRATION] "Vous avez une idée ?" + CTA soumettre
```

### Actions
- Filtrer
- `→ /projects/:id`
- `[Soumettre une idée]` → POST /projects *(auth)* ou `→ /contact`

---

## 8. Détail Projet (`/projects/:id`)

**Utilisateurs :** Tous (actions → auth)

### Sections
```
[HEADER] Titre · statut badge · catégorie · date
[RÉSUMÉ] Objectifs + résultats clés ← GET /projects/:id
[ÉQUIPE] ← data.team → avatars + rôles
[CHRONOLOGIE] Timeline phases ← data.timeline
[PUBLICATIONS] ← GET /publications?projectId=X
[CTA] "Soutenir" / "Contribuer" / "Suivre"
```

### Actions
- `[Suivre]` → POST /projects/:id/follow *(auth)*
- `[Ne plus suivre]` → DELETE /projects/:id/follow *(auth)*
- `[Soutenir]` → POST /contributions/donate
- `→ /researchers/:id`
- `→ /publications/:id`

---

## 9. Formations (`/formations`)

**Utilisateurs :** Tous (inscription → auth)

### Sections
```
[FILTRES] thème · niveau · date · intervenant
[CATALOGUE] ← GET /formations → cards : titre · date · places · CTA
[IMPACT] ← GET /stats → participants formés · satisfaction
[MODAL INSCRIPTION] formulaire si places dispo, sinon liste d'attente
```

### Actions
- `[S'inscrire]` → POST /formations/:id/register *(auth)*
- `[Liste d'attente]` → POST /formations/:id/waitlist *(auth)*
- `[Se désinscrire]` → DELETE /formations/:id/register *(auth)*
- `→ /formations/:id` (détail)

---

## 10. Événements (`/events`)

**Utilisateurs :** Tous (inscription → auth)

### Sections
```
[FILTRES] type · date · lieu
[LIVE EN COURS] ← GET /events?status=live → badge "En direct" + stream
[LISTE] ← GET /events → date · horaire · lieu · places · CTA
```

### Actions
- `[S'inscrire]` → POST /events/:id/register *(auth)*
- `[Rejoindre le live]` → GET /events/:id/stream *(auth)*
- `[Se désinscrire]` → DELETE /events/:id/register *(auth)*
- `→ /events/:id`

---

## 11. Espace Membres (`/members`)

**Utilisateurs :** Visiteur (conversion) + Membre (connexion)

### Sections
```
[AVANTAGES] bénéfices membres
[STATS] ← GET /stats → membres actifs · événements · publications
[CONNEXION] Email + Password → POST /auth/login → JWT
[ONGLETS CONVERSION]
  - S'inscrire → POST /auth/register
  - Don → POST /contributions/donate
  - Partenariat → POST /contributions/partner
```

### Actions
- `[Se connecter]` → POST /auth/login → `→ /dashboard`
- `[S'inscrire]` → POST /auth/register → `→ /dashboard`
- `[Don]` · `[Partenariat]` → formulaires

---

## 12. Dashboard (`/dashboard`) 🔒

**Utilisateurs :** Membre connecté uniquement
**Auth :** Bearer JWT requis

### Sections
```
[HEADER] Bonjour [Prénom] · branche · université ← GET /members/me
[PROJETS SUIVIS] ← GET /dashboard/me → data.followedProjects
[ÉVÉNEMENTS À VENIR] ← data.upcomingEvents
[PUBLICATIONS RÉCENTES] ← data.recentPublications
[CONTRIBUTIONS] ← GET /contributions/me
[NOTIFICATIONS] ← GET /notifications → badge non lus
[OUTILS] Publier · Soumettre un projet · Contacter un mentor
```

### Actions
- `→ /projects/:id` (projet suivi)
- `→ /events/:id` (événement)
- `[Publier]` → POST /publications *(auth)*
- `[Soumettre]` → POST /projects *(auth)*
- `[Marquer lu]` → PUT /notifications/:id/read
- `→ /profile/me`
- `[Déconnexion]` → clear token → `→ /`

---

## 13. Profil Chercheur (`/researchers/:id`)

**Utilisateurs :** Tous (suivre → auth)

### Sections
```
[IDENTITÉ] Photo · Nom · Titre · Affiliations ← GET /researchers/:id
[BIO + STATS] biographie · publications · citations · h-index
[PROJETS EN COURS] ← data.projects
[PUBLICATIONS] ← GET /publications?authorId=X
[DISTINCTIONS] ← GET /researchers/:id/distinctions
[ACTIONS] Partager · Contacter · Suivre
```

### Actions
- `[Suivre]` → POST /researchers/:id/follow *(auth)*
- `[Ne plus suivre]` → DELETE /researchers/:id/follow *(auth)*
- `[Contacter]` → POST /contact
- `[Partager]` → copie lien
- `→ /projects/:id`

---

## 14. Aide / Contact (`/help`)

**Utilisateurs :** Tous

### Sections
```
[AIDE CONTEXTUELLE] sections thématiques cliquables
[FAQ] ← contenu statique → accordéon par catégorie
[FORMULAIRE CONTACT] Nom · Email · Sujet · Message → POST /contact
[SUPPORT] email + délai réponse
[RACCOURCIS] Dashboard · Clubs · Formations · Événements
```

### Actions
- Déplier FAQ
- `[Envoyer]` → POST /contact
- `→ /dashboard` *(si connecté)*
- `→ /members` *(si visiteur)*

---

## Parcours Complets

### Visiteur → Membre
```
/ → /members → [S'inscrire] → POST /auth/register → /dashboard
```

### Étudiant → Club
```
/students → /clubs → /clubs/:id → [Rejoindre] → auth check → POST /clubs/:id/join
```

### Membre → Suivre un projet
```
/dashboard → /projects → /projects/:id → [Suivre] → POST /projects/:id/follow → notif dashboard
```

### Chercheur → Publier
```
/dashboard → [Publier] → POST /publications → visible sur /news + profil
```

### Visiteur → Événement live
```
/events → badge LIVE → /events/:id → [S'inscrire] → auth → GET /events/:id/stream
```

---

## Auth Gates

| Page / Action | Visiteur | Membre |
|---------------|----------|--------|
| Lecture publique (news, projets, clubs...) | ✅ | ✅ |
| `/dashboard` | ❌ → `/members` | ✅ |
| Suivre projet / chercheur | ❌ modal login | ✅ |
| S'inscrire formation / événement | ❌ modal login | ✅ |
| Rejoindre un club | ❌ modal login | ✅ |
| Publier / soumettre projet | ❌ | ✅ |
| Voir stream live | ❌ modal login | ✅ |
| Don / partenariat | ✅ (form public) | ✅ |
| Contact | ✅ | ✅ |