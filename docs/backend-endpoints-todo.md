# 🛠️ Rapport Backend — FIERI Research

> **Destinataire :** développeur backend (`https://backend-fieri.vercel.app`).
> **Établi le :** 2026-07-06, par tests HTTP en direct sur la production.
> **Contexte :** le frontend est déjà entièrement câblé sur ces endpoints. Ce
> document liste, par priorité, ce qui **bloque** ou **manque** pour finaliser la
> plateforme en un vrai écosystème avec contrôle d'accès par rôle.
>
> Légende priorité : 🔴 critique · 🟠 important · 🟢 confort.

---

## 0. 🔴 SÉCURITÉ — Élévation de privilèges à l'inscription (CRITIQUE)

**Constat (reproduit en direct) :**

- `POST /auth/register` **accepte et applique un champ `role` fourni par le client**.
  Un body `{ …, "role": "ADMIN" }` crée réellement un compte **ADMIN** (vérifié : le
  JWT renvoyé contient `"role":"ADMIN"`, et `GET /members/me` confirme).
  ➡️ **N'importe qui peut s'auto-attribuer le rôle ADMIN** par un simple appel HTTP.
- Sans champ `role`, l'inscription est créée en **`CHERCHEUR`** (et non `ETUDIANT`).
  ➡️ Tout nouvel inscrit obtient d'emblée des droits de production (publier des
  articles/opportunités, éditer une fiche chercheur…).

**Correctifs attendus côté serveur :**

1. **Ignorer tout `role` reçu du client** sur `/auth/register`. L'attribution de rôle
   est une décision serveur exclusive.
2. **Rôle par défaut = `ETUDIANT`** pour toute nouvelle inscription.
3. La montée en rôle passe **uniquement** par un endpoint réservé ADMIN (cf. §1).
4. **Enforcement serveur systématique** : re-vérifier le rôle depuis le JWT sur
   **toutes** les mutations protégées. Le front masque déjà les actions interdites,
   mais un appel direct (curl/Postman) ne doit **jamais** passer.

> ℹ️ *Mesure temporaire côté front* : tant que (1)+(2) ne sont pas livrés, l'UI force
> `role: 'ETUDIANT'` à l'inscription (moindre privilège) — voir `src/services/api.js`.
> À retirer une fois le serveur corrigé, car cela ne protège pas des appels directs.

---

## 1. 🔴 Gestion des membres & promotion de rôle (MANQUANT)

Modèle cible : **ETUDIANT par défaut → l'ADMIN promeut**. Aujourd'hui, **aucun** moyen
de lister les membres ni de changer un rôle (tous testés en direct → **404**) :
`GET /members`, `PATCH /members/:id`, `PATCH /members/:id/role`.

Endpoints à créer :

- **`GET /members`** *(ADMIN)* — liste paginée de tous les membres.
  ```json
  { "success": true, "data": [
    { "id": 14, "firstName": "Octave", "lastName": "Admin", "email": "…",
      "role": "ADMIN", "branchId": 1, "createdAt": "…" }
  ], "message": "…" }
  ```
  Query utiles : `?search=`, `?role=`, `?page=`, `?limit=`.
- **`PATCH /members/:id/role`** *(ADMIN)* — change le rôle d'un membre.
  Body : `{ "role": "ETUDIANT" | "CHERCHEUR" | "MENTOR" | "ADMIN" }`
  → `{ "success": true, "data": { "id": 14, "role": "CHERCHEUR" }, "message": "…" }`
  Garde-fous : interdire de retirer le **dernier** ADMIN ; valider la valeur de `role`.
- *(option)* **`GET /members/:id`** *(ADMIN)* — détail d'un membre.

> Dès que ces 2 endpoints existent, le front branche l'onglet **Admin ▸ Membres**
> (promouvoir / rétrograder). L'UI n'a pas été construite pour l'instant afin de ne
> pas exposer un bouton non fonctionnel.

**Hiérarchie de rôles utilisée par le front (référence) :**
`VISITEUR(0) < ETUDIANT(1) < CHERCHEUR(2) ≈ MENTOR(2) < ADMIN(3)`

**Matrice de capacités appliquée côté front** (à répliquer dans l'enforcement serveur) :

| Capacité | Rôle min. | Endpoints concernés |
|---|---|---|
| **Participer** (rejoindre, s'inscrire, candidater, suivre) | ETUDIANT | `POST /clubs/:id/join`, `POST /workshops/:id/register`, `POST /events/:id/register`, `POST /applications`, `POST /projects/:id/follow`, `POST /researchers/:id/follow` |
| **Produire** (publier articles / opportunités / projets, éditer sa fiche) | CHERCHEUR | `POST /news`, `POST /opportunities`, `POST /projects`, `PUT /researchers/me` |
| **Encadrer** (valider les adhésions d'un club) | MENTOR / Responsable | `PATCH /memberships/requests/:id/approve`, `…/reject` |
| **Gouverner** (modérer, administrer, gérer les membres) | ADMIN | `PATCH /news/:id/approve`, `DELETE /news/:id`, `PATCH /members/:id/role` |

---

## 2. 🔴 Bugs — endpoints existants qui renvoient 500

Constatés en appel réel (les autres GET publics répondent 200) :

| Endpoint | Statut observé | Attendu |
|----------|----------------|---------|
| `GET /projects` | **500** | 200 `{ success, data: [...] }` |
| `GET /projects/:id` | **500** | 200 `{ success, data }` |
| `GET /researchers/:id` | **500** | 200 `{ success, data }` (la liste `/researchers` fonctionne) |
| `GET /opportunities` | **500** | 200 `{ success, data: [...] }` |
| `GET /opportunities/:id` | **500** (à confirmer) | 200 `{ success, data }` |

➡️ Tant que ces routes renvoient 500, les pages **Projets**, **Détail projet**,
**Détail chercheur** et **Opportunités** restent en erreur (le mapping front est prêt).

---

## 3. 🟠 Endpoints manquants (fonctionnalités du wireframe)

### Opportunités & candidatures (le front les utilise déjà)
- `GET /opportunities`, `GET /opportunities/:id`, `POST /opportunities` *(CHERCHEUR)*,
  `PUT /opportunities/:id`, `DELETE /opportunities/:id` — actuellement 500/non fiables.

### Statistiques live (accueil, espace membres, impact formations)
- `GET /stats` → `{ membersCount, publicationsCount, patentsCount, eventsCount, trainedParticipants, satisfaction }`

### Publications (journal scientifique, profils, projets, clubs)
- `GET /publications?authorId=&clubId=&projectId=&newsId=&limit=&page=`
- `GET /publications/:id`
- `POST /publications` *(CHERCHEUR)* → publie, visible sur `/news` + profil

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
- support de `?limit=` et `?page=` sur `/news`, `/projects`, `/clubs`, `/workshops`

---

## 4. 🟠 Enrichissements d'endpoints existants

| Endpoint | Manque | Besoin |
|----------|--------|--------|
| `GET /dashboard/me` | ne renvoie que des **compteurs** | ajouter `followedProjects[]`, `upcomingEvents[]`, `recentPublications[]`, et le détail des **clubs rejoints** (le dashboard ne peut afficher que des nombres aujourd'hui) |
| `GET /clubs/:id` | membres ? | garantir `data.members[]` avec `{ id, firstName, lastName, role }` |
| `GET /clubs/:id` | contenu lié | exposer projets liés (`/projects?clubId=`) et publications (`/publications?clubId=`) |
| `GET /news/:id` | auteur | `data.author` doit inclure l'`id` chercheur (lien vers `/researchers/:id`) |
| `GET /researchers` | rôle/e-mail | pour un futur annuaire admin, exposer `role` et `email` (aujourd'hui absents) |
| `GET /workshops` | waitlist | confirmer `POST /workshops/:id/waitlist` ou action dédiée liste d'attente |

---

## 5. 📛 Décisions de nommage (front aligné via alias)

| Wireframe | Backend actuel | Statut |
|-----------|----------------|--------|
| `/formations` | `/workshops` | ✅ le front gère l'alias d'URL |
| `/researchers/:id` | `/researchers/:id` | ✅ identique |
| `/help` (contact) | `/contact` | ✅ le front mappe |
| `/members` (login/conversion) | `/auth/*` | ✅ pur front (routing) |

---

## 6. ✅ Endpoints confirmés fonctionnels (référence)

`GET /countries`, `/countries/:id/universities`, `/universities/:id/branches`,
`/clubs`, `/clubs/:id`, `/events`, `/news`, `/news/:id`, `/researchers` (liste),
`/workshops`, `/dashboard/me`, `/notifications`, `POST /auth/login`,
`POST /auth/register`, `GET /members/me` — tous en enveloppe `{ success, data, message }`.

---

## 🎯 Ordre de priorité recommandé

1. 🔴 **Sécurité inscription** (§0) — ignorer `role` client, défaut `ETUDIANT`, enforcement serveur.
2. 🔴 **Membres & promotion** (§1) — `GET /members` + `PATCH /members/:id/role` → débloque « l'admin promeut ».
3. 🔴 **Corriger les 500** (§2) — débloque Projets, profils chercheurs, Opportunités.
4. 🟠 `GET /stats` + filtres `featured/limit/page` (§3) — accueils complets.
5. 🟠 Enrichir `GET /dashboard/me` et `GET /clubs/:id` (§4) — dashboard & clubs réellement personnalisés.
6. 🟠 Publications & contributions (§3) — nouvelles fonctionnalités.

---

### 🧹 Ménage (comptes de test créés pendant l'audit)

Comptes créés en production lors des tests de ce rapport, à **supprimer** côté BDD
quand vous le pourrez :
- ids **12** et **13** — comptes de sondage (`probe_norole_*`, `probe_admin_*@fieri.test`).
- ids **`probe_etu_*`**, **`etu_ui_*@fieri.test`** — étudiants de test.
- id **14** — `admin@fieri.dev` (compte ADMIN de travail ; **à conserver** tant qu'il
  n'existe pas d'autre admin, sinon la plateforme n'a plus d'administrateur).
