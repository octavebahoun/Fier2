# FIERI Research — Endpoints API Manquants
> Basé sur le CDC v1 · Comparé à l'API actuelle

---

## ✅ Déjà implémenté

```
GET/POST  /countries
GET       /countries/:id
GET       /countries/:id/universities
GET/POST  /universities
GET       /universities/:id
GET       /universities/:id/branches
GET/POST  /branches
GET       /branches/:id
POST      /auth/register
POST      /auth/login
GET       /members/me
```

---

## ❌ À implémenter

---

### 📰 MODULE : ACTUALITÉS (`/news`)

```
GET    /news                  → liste paginée (filtres: theme, domain, date)
GET    /news/:id              → détail article
POST   /news                  → créer un article       [auth]
PUT    /news/:id              → modifier               [auth]
DELETE /news/:id              → supprimer              [auth]
```

---

### 🔬 MODULE : PROJETS (`/projects`)

```
GET    /projects              → liste (filtres: theme, status)
GET    /projects/:id          → détail + équipe + timeline + publications
POST   /projects              → créer un projet        [auth]
PUT    /projects/:id          → modifier               [auth]
DELETE /projects/:id          → supprimer              [auth]

POST   /projects/:id/follow   → suivre un projet       [auth]
DELETE /projects/:id/follow   → ne plus suivre         [auth]
POST   /projects/:id/support  → soutenir / contribuer  [auth]
```

---

### 🏛️ MODULE : CLUBS (`/clubs`)

```
GET    /clubs                 → liste (filtres: discipline, university)
GET    /clubs/:id             → détail + membres + publications
POST   /clubs                 → créer un club          [auth]
PUT    /clubs/:id             → modifier               [auth]

POST   /clubs/:id/join        → rejoindre un club      [auth]
DELETE /clubs/:id/join        → quitter un club        [auth]
```

---

### 🎓 MODULE : FORMATIONS (`/formations`)

```
GET    /formations            → liste (filtres: theme, level, date)
GET    /formations/:id        → détail + intervenants + places
POST   /formations            → créer                  [auth]
PUT    /formations/:id        → modifier               [auth]

POST   /formations/:id/register    → s'inscrire        [auth]
POST   /formations/:id/waitlist    → liste d'attente   [auth]
DELETE /formations/:id/register    → se désinscrire    [auth]
```

---

### 📅 MODULE : ÉVÉNEMENTS (`/events`)

```
GET    /events                → liste (filtres: type, date, lieu)
GET    /events/:id            → détail + places + stream
POST   /events                → créer                  [auth]
PUT    /events/:id            → modifier               [auth]

POST   /events/:id/register   → s'inscrire             [auth]
DELETE /events/:id/register   → se désinscrire         [auth]
GET    /events/:id/stream     → accès lien live        [auth]
```

---

### 👤 MODULE : CHERCHEURS (`/researchers`)

```
GET    /researchers           → liste publique
GET    /researchers/:id       → profil complet (projets + publications + distinctions)
PUT    /researchers/me        → modifier son profil    [auth]

POST   /researchers/:id/follow    → suivre             [auth]
DELETE /researchers/:id/follow    → ne plus suivre     [auth]
```

---

### 📄 MODULE : PUBLICATIONS (`/publications`)

```
GET    /publications          → liste (filtres: domain, date, author)
GET    /publications/:id      → détail
POST   /publications          → publier               [auth]
PUT    /publications/:id      → modifier              [auth]
DELETE /publications/:id      → supprimer             [auth]
```

---

### 📊 MODULE : DASHBOARD (`/dashboard`)

```
GET    /dashboard/me          → données agrégées membre connecté [auth]
                                (projets suivis, événements à venir,
                                 publications récentes, contributions)
```

---

### 💰 MODULE : CONTRIBUTIONS (`/contributions`)

```
GET    /contributions/me      → historique dons / participations  [auth]
POST   /contributions/donate  → faire un don
POST   /contributions/partner → formulaire partenariat
```

---

### 📬 MODULE : CONTACT (`/contact`)

```
POST   /contact               → envoyer un message (nom + email + sujet + message)
```

---

### 🏅 MODULE : DISTINCTIONS (`/distinctions`)

```
GET    /distinctions          → liste publique
GET    /researchers/:id/distinctions → distinctions d'un chercheur
POST   /distinctions          → ajouter               [auth]
```

---

### 🔔 MODULE : NOTIFICATIONS (`/notifications`)

```
GET    /notifications         → mes notifications     [auth]
PUT    /notifications/:id/read → marquer comme lu     [auth]
DELETE /notifications         → tout effacer          [auth]
```

---

### 📈 MODULE : STATS PUBLIQUES (`/stats`)

```
GET    /stats                 → compteurs globaux publics
                                (membres · publications · brevets · événements)
```

---

## Résumé

| Module | Endpoints | Auth requis |
|--------|-----------|-------------|
| Actualités | 5 | POST/PUT/DELETE |
| Projets | 8 | POST/PUT/DELETE + follow/support |
| Clubs | 6 | POST/PUT + join |
| Formations | 7 | POST/PUT + register/waitlist |
| Événements | 7 | POST/PUT + register/stream |
| Chercheurs | 5 | PUT/me + follow |
| Publications | 5 | POST/PUT/DELETE |
| Dashboard | 1 | Toujours |
| Contributions | 3 | GET/me |
| Contact | 1 | Non |
| Distinctions | 3 | POST |
| Notifications | 3 | Toujours |
| Stats | 1 | Non |
| **TOTAL** | **~55** | |
