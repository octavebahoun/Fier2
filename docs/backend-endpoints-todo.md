# Backend — Endpoints à fournir / corriger

> Établi à partir des wireframes « API Full » vs l'état réel du backend
> (`https://backend-fieri.vercel.app`) testé en direct. Le frontend est déjà
> câblé sur les endpoints réels ; les points ci-dessous le débloquent.

---

## 1. 🐞 Bugs à corriger (endpoints existants qui échouent)

Constatés en appel réel (les autres GET publics répondent 200) :

| Endpoint | Statut observé | Attendu |
|----------|----------------|---------|
| `GET /projects` | **500** | 200 `{ success, data: [...] }` |
| `GET /projects/:id` | **500** (à confirmer) | 200 `{ success, data }` |
| `GET /researchers/:id` | **500** | 200 `{ success, data }` (la liste `/researchers` fonctionne) |

➡️ Tant que ces 3 renvoient 500, les pages **Projets**, **Détail projet** et
**Détail chercheur** restent en erreur côté front (le mapping est prêt).

---

## 2. 🆕 Endpoints manquants (fonctionnalités du wireframe)

### Statistiques live (accueil, espace membres, impact formations)
- `GET /stats` → `{ membersCount, publicationsCount, patentsCount, eventsCount, trainedParticipants, satisfaction }`

### Publications (nouvelle entité — journal scientifique, profils, projets, clubs)
- `GET /publications?authorId=&clubId=&projectId=&newsId=&limit=&page=`
- `GET /publications/:id`
- `POST /publications` *(auth chercheur)* → publie, visible sur `/news` + profil

### Contributions (dons & partenariats)
- `POST /contributions/donate` → `{ amount, message }`
- `POST /contributions/partner` → `{ organisation, email, message }`
- `GET /contributions/me` *(auth)* → historique des contributions du membre

### Événements — accès live
- `GET /events/:id/stream` *(auth + inscrit)* → URL/flux du live

### Chercheurs — distinctions
- `GET /researchers/:id/distinctions` → `[{ title, year, issuer }]`

### Filtres « mis en avant » (utilisés par les accueils)
- `GET /news?featured=true`, `GET /projects?featured=true`, `GET /clubs?featured=true`
- support de `?limit=` et `?page=` sur `/news`, `/projects`, `/clubs`, `/formations`

---

## 3. 🔧 Enrichissements d'endpoints existants

| Endpoint | Manque | Besoin wireframe |
|----------|--------|------------------|
| `GET /dashboard/me` | ne renvoie que des **compteurs** | ajouter `followedProjects[]`, `upcomingEvents[]`, `recentPublications[]` |
| `GET /clubs/:id` | membres ? | garantir `data.members[]` avec `{ id, firstName, lastName, role }` |
| `GET /clubs/:id` | contenu lié | exposer projets liés (`/projects?clubId=`) et publications (`/publications?clubId=`) |
| `GET /projects` | filtres | confirmer `?clubId=`, `?status=`, `?search=`, `?featured=` |
| `GET /news/:id` | auteur | `data.author` doit inclure l'`id` chercheur (lien vers `/researchers/:id`) |
| `GET /workshops` (formations) | waitlist | confirmer `POST /workshops/:id/waitlist` ou action dédiée liste d'attente |

---

## 4. 📛 Décisions de nommage (front aligné sur wireframe via alias)

| Wireframe | Backend actuel | Proposition |
|-----------|----------------|-------------|
| `/formations` | `/workshops` | exposer `/formations` (ou garder `/workshops`, le front gère l'alias d'URL) |
| `/researchers/:id` | `/researchers/:id` | ✅ identique |
| `/help` (contact) | `/contact` | ✅ le front mappe, backend inchangé |
| `/members` (login/conversion) | `/auth/*` | ✅ pur front (routing) |

---

## 5. ✅ Endpoints confirmés fonctionnels (référence)

`GET /countries`, `/countries/:id/universities`, `/universities/:id/branches`,
`/clubs`, `/clubs/:id`, `/events`, `/news`, `/news/:id`, `/researchers`,
`/workshops`, `/dashboard/me`, `/notifications`, `/auth/login`, `/auth/register`,
`/members/me` — tous en enveloppe `{ success, data, message }`.

---

### Priorité suggérée
1. **Corriger les 3 × 500** (§1) — débloque Projets & profils chercheurs.
2. `GET /stats` + filtres `featured/limit` (§2) — accueils complets.
3. Enrichir `GET /dashboard/me` (§3) — dashboard réellement personnalisé.
4. Publications & contributions (§2) — nouvelles fonctionnalités.
