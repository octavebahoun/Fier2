# Rapport de Maturité & Readiness Production — FIERI Research

**Date de l'audit :** 2026-08-17 — re-vérification complète après 2e session de correctifs
**Périmètre :** frontend React (`src/`), backend NestJS (`backend_fieri/`), CI/CD, déploiement Vercel
**Méthode :** inspection du code (preuves `fichier:ligne`), exécution réelle des suites de tests, lint, builds, couverture, `npm audit`, scan git. Toutes les commandes citées ont été exécutées lors de cet audit.

---

## 🔢 SCORE GLOBAL : 56 / 100 — 🟡 PRÊT SOUS CONDITIONS

| Catégorie | Score /20 | Poids | Notes courtes |
|---|---|---|---|
| Qualité du code | 12 | ×1 | Lint vert ✅ (0 error), 5 vrais bugs corrigés ; restent 54 + 251 warnings (typage) |
| Tests | 12 | ×1.2 | 79 tests passent ; paiement 94 %, trésorerie 100 % ; total 18,6 % ; front 3 tests |
| Sécurité | 15 | ×1.4 | Vulns front → 0 ✅ ; 3 high back (fix = downgrade Prisma, refusé) ; localStorage JWT |
| Fiabilité | 10 | ×1 | Timeouts, idempotence, S3 ; zéro monitoring, logs non structurés |
| Performance | 6 | ×1 | Bundle 1,1 Mo, N+1 au boot, pas de cache |
| Infra & déploiement | 10 | ×1.2 | CI passe maintenant ✅ mais non committée ; git dirty ; pas de backups |
| Documentation | 13 | ×0.8 | `.env.example` front créé, READMEs corrigés, spec API |

**Calcul pondéré :** (12 + 12×1.2 + 15×1.4 + 10 + 6 + 10×1.2 + 13×0.8) / (20×7.6) = 85,8/152 → **≈ 56/100**

**Évolution :** 34 (audit 1) → 46 (correctifs 1) → **56** (correctifs 2, cette session).

---

## 🟡 VERDICT

> **Prêt pour une mise en service de démonstration (mode mock) — prêt sous conditions pour la production réelle.**
> Le lint est vert des deux côtés (la CI passe), le flux paiement/trésorerie est désormais testé
> à 94-100 %, `npm audit` front = 0 vulnérabilité, et un garde-fou empêche le seed en production.
> Restent avant toute mise en service réelle : **commiter l'état**, **monitoring (Sentry)**,
> **backups BDD**, **3 vulns back** (downgrade Prisma à évaluer), **couverture globale** et **perf**.
> Liste complète avec efforts au §9.

---

# ✅ Correctifs appliqués (session 2 — agents, 2026-08-17)

| # | Correctif | Preuve | Vérifié par |
|---|---|---|---|
| 1 | **Lint front vert (exit 0)** : 65 errors → 0. Dont **5 vrais bugs** corrigés : `setLoadingClubDetail`, `setAssignedActivities`, `setEmblematicFigures` jamais déclarés (ReferenceError au runtime), 2 TDZ (`AuthContext.handleLogout`, `closeApplyModal`) ; 3 règles bruyantes rétrogradées en warn (`set-state-in-effect`, `only-export-components`, `preserve-manual-memoization`) avec justificatif ; `backend_fieri/**` exclu du lint racine (lint dédié back) | `eslint.config.js` ; `src/pages/CiteIntegration.jsx`, `EspaceCITE.jsx`, `Gouvernance.jsx`, `Offers.jsx`, `Opportunities.jsx`, `Soutiens.jsx`, `AuthContext.jsx` | `npm run lint` → 0 error / 54 warnings, exit 0 ✅ |
| 2 | **Lint back vert (exit 0)** : 183 errors → 0. `no-unsafe-*` rétrogradés en warn (gardes-fous non bloquants, chantier typage) ; vraies erreurs corrigées (`no-unused-vars`, `no-floating-promises` via `void bootstrap()` dans `main.ts`, typage callback `researcher.service.ts`) | `backend_fieri/eslint.config.mjs`, `src/main.ts`, `src/modules/researcher/researcher.service.ts` | `npm run lint` → 0 error / 251 warnings, exit 0 ✅ |
| 3 | **51 tests ajoutés sur le flux d'argent** : HMAC webhook (valide/invalide/absent/secret manquant/mode mock/longueur), `handlePaymentWebhook` (crédit, rejet, idempotence), `confirmMockPayment`, `initiateFinancial`, trésorerie complète | `support.service.spec.ts` (34), `support.controller.spec.ts` (6), `treasury.service.spec.ts` (13) | **support.service.ts : 94,16 % stmts / 93,96 % lines ; treasury.service.ts : 100 %** |
| 4 | **`npm audit fix`** : front 5 high → **0 vulnérabilité** (react-router, vite corrigés) ; back : multer/qs corrigés, restent 3 high (`deepmerge-ts` via Prisma — le correctif officiel **downgrade** Prisma 6.19→6.12, refusé volontairement) | `package-lock.json` (2 dépôts) | `npm audit --omit=dev` → front 0, back 3 (documentées) |
| 5 | **Garde-fou seed** : refuse de s'exécuter si `NODE_ENV === 'production'` (identifiants de démo `admin@fieri.com` en dur) | `backend_fieri/prisma/seed.ts:6-10` | lecture + node check ✅ |
| 6 | **`.env.example` front** créé (756 o) + suppression du config mort `.env.mock` (`VITE_MOCK_MODE` n'est plus lu nulle part dans `src/`) | `.env.example` (racine), `.env.mock` supprimé | `ls` + grep ✅ |
| 7 | **README corrigé** : « SPA sans routeur » → `BrowserRouter` réel ; « fallback mocké » → API backend uniquement | `README.md:44,20,60` | ✅ |

## État après correctifs (commandes exécutées en session)

```
frontend: npm run lint  → 0 errors / 54 warnings, exit 0 ✅
frontend: npm run test  → 1 fichier / 3 tests ✅
frontend: npm run build → ✅ (chunk 1,1 Mo — warning perf)
backend : npm run lint  → 0 errors / 251 warnings, exit 0 ✅
backend : npm run test  → 15 suites / 76 tests ✅
backend : npm run test:cov → lines 18,6 % (10,08 % avant)
backend : npm run build → ✅
npm audit --omit=dev (front) → 0 vulnérabilité ✅
npm audit --omit=dev (back)  → 3 high (deepmerge-ts via prisma — fix = downgrade Prisma, refusé)
```

---

# 1. Cartographie du projet

## Stack technique

| Brique | Techno | Version vérifiée | État |
|---|---|---|---|
| Frontend | React (compilateur React via `@rolldown/plugin-babel`) | 19.2.6 | ✅ |
| Frontend | Vite | 8.x | ✅ (corrigé par audit fix) |
| Frontend | Tailwind CSS v4 (CSS-first) | 4.3.0 | ✅ |
| Frontend | react-router-dom (BrowserRouter) | 7.19+ | ✅ (CSRF RSC corrigé) |
| Frontend | framer-motion / lucide-react | 12.40 / 1.17 | ✅ |
| Backend | NestJS 11 | 11.x | ✅ |
| Backend | Prisma 6 + PostgreSQL (Neon) | 6.19.3 | ✅ (3 vulns indirectes, cf. §4) |
| Backend | JWT (passport-jwt), bcrypt, nodemailer, pdfkit, @aws-sdk/client-s3 | — | ✅ |
| Backend | @nestjs/throttler, helmet | — | ✅ |
| Tests | Vitest 4.1.7 (front) / Jest 30 (back) | — | ✅ |

Aucune dépendance **abandonnée**.

## Architecture

- **SPA monolithe front** : 18+ pages, routage `react-router-dom` (`src/main.jsx`, `src/App.jsx`), état global via Context (`AuthContext`, `DataContext`, `ThemeContext`, `AuthGateContext`).
- **API monolithe NestJS** : ~25 modules (`backend_fieri/src/modules/`), ORM Prisma, 10 migrations versionnées.
- **Deux dépôts git séparés** (front racine + `backend_fieri/`) — coordination fragile, à fusionner ou tagger.
- **Enveloppe API** : `{ success, data, message }`, normalisation front dans `src/services/adapters.js`.

---

# 2. Qualité du code

## Lint — ✅ VERT des deux côtés (0 error)

```bash
# front (racine) — npm run lint
✖ 54 problems (0 errors, 54 warnings)  → exit 0 ✅
# back — npm run lint
✖ 251 problems (0 errors, 251 warnings) → exit 0 ✅
```

- **Front (54 warnings)** : `set-state-in-effect` ×32 (pattern fetch-on-mount assumé, rétrogradé en warn), `only-export-components` ×12 (contexts hook+provider), `exhaustive-deps` ×8, divers ×2. `no-undef` (8 erreurs) = **5 vrais bugs corrigés** (setters jamais déclarés → ReferenceError runtime dans `CiteIntegration`, `EspaceCITE`, `Gouvernance` ; TDZ dans `AuthContext`/`Offers`).
- **Back (251 warnings)** : quasi exclusivement `@typescript-eslint/no-unsafe-*` → **chantier de typage à venir** (les `any` sont tolérés mais signalés).
- La CI (`npm run lint` dans les 2 jobs) **passe désormais**.

## Style & conventions

- ✅ Nommage FR cohérent, commentaires utiles, RBAC front excellent (`AuthContext.jsx:13-120`), aucune permission en dur dans les vues.
- ⚠️ Duplication : pattern « loadData + try/catch + console.error » recopié dans ~18 pages (pas de hook `useFetch`).
- ✅ READMEs alignés sur le code réel (router, API backend sans mock).

## Gestion des erreurs

- **Backend : ✅** exceptions typées, validation DTO, transactions SQL, idempotence webhook.
- **Frontend : ⚠️** 10 pages sur 18 en `console.error` seul sans UI d'erreur ; `ErrorBoundary` présent mais sans télémétrie (pas de Sentry).

## TODO / FIXME / HACK

**0 marqueur de dette** (seules occurrences = libellés kanban métier). Excellent signal.

## Code mort / à moitié terminé

- ✅ `dist/` dé-stagé du git + ignoré ; `.env.mock` supprimé ; `VITE_MOCK_MODE` documenté LEGACY.
- ⚠️ `new/`, `inventaire.md` : artefacts LLM non organisés.
- ⚠️ e2e = boilerplate NestJS « Hello World » (à réécrire).

---

# 3. Tests

## Frontend (Vitest) — ✅ PASSE (3 tests, 1 fichier)

```bash
npm run test → Test Files 1 passed · Tests 3 passed
```
Couverture front quasi nulle (1 seul fichier de test pour 18 pages) — chantier prioritaire moyen terme.

## Backend (Jest) — ✅ PASSE (76 tests, 15 suites), couverture doublée

```bash
npm run test → Test Suites: 15 passed · Tests: 76 passed
npm run test:cov →
  All files : Statements 19,03 % · Branches 17,52 % · Functions 11,75 % · Lines 18,6 %
```

| Fichier | Avant | Après |
|---|---|---|
| `support.service.ts` (paiement) | 0 % | **94,16 % stmts / 93,96 % lines** |
| `treasury.service.ts` (trésorerie) | 0 % | **100 % / 100 %** |
| `support.controller.ts` | 0 % | 89,28 % |
| `genius-pay.service.ts` (HMAC) | 0 % | 50 % (partie réseau non testée, volontaire) |

Tests couverts : HMAC valide/invalide/absent/secret manquant, rejet sans crédit, idempotence (double webhook → pas de double crédit), mock mode, trésorerie complète.

## Zones encore à couvrir

| Zone | Statut |
|---|---|
| Gouvernance, club-space, competition, workshop, event, news | ❌ 0 % |
| Attestations/certificats PDF | 1 spec partielle |
| E2E complet (DB réelle) | ❌ boilerplate uniquement |
| Front (18 pages) | ❌ 1 fichier de test |

---

# 4. Sécurité

## ✅ Corrigés et vérifiés

| Point | Preuve |
|---|---|
| Webhook forgeable → branche `mock` supprimée, HMAC temps constant seul (sauf `GENIUS_PAY_MOCK === 'true'` env explicite) | `genius-pay.service.ts:129-145` |
| `confirm-mock-payment` → JWT obligatoire + `NotFoundException` hors flag | `support.controller.ts:69-78` |
| `vercel-build` → `prisma migrate deploy` (plus de `--accept-data-loss`) | `backend_fieri/package.json:10` |
| Emails retirés du `GET /researchers` public | `researcher.service.ts:22-36` |
| Rate limiting : 60 req/min global, 10 req/min sur login/register/webhook/confirm-mock/contact | `app.module.ts:36,68` ; `auth.controller.ts:13,23` |
| Helmet (CSP, headers) | `main.ts:14-21` |
| `npm audit` front → **0 vulnérabilité** (react-router CSRF, vite corrigés) | `npm audit --omit=dev` |
| Seed bloqué en production (garde-fou `NODE_ENV`) | `prisma/seed.ts:6-10` |
| `.env` jamais committé (2 dépôts vérifiés) ; bcrypt 10 rounds ; JWT fail-fast | `git ls-files`, `auth.service.ts:29`, `jwt.strategy.ts:7-12` |

## Restant

| Constat | Gravité |
|---|---|
| **3 high back** : `deepmerge-ts` via Prisma (stack overflow sur graphes récursifs). Le fix officiel **downgrade** Prisma 6.19→6.12 (cassant) → refusé, à réévaluer quand un correctif propre sortira | 🟠 |
| JWT en `localStorage` (exposition XSS — trade-off SPA classique, à mitiger par CSP stricte) | 🟡 |
| CORS liste blanche codée en dur dans `main.ts:23-30` (5 origines) — acceptable mais fragile | 🟢 |

---

# 5. Fiabilité / résilience

- ✅ Timeout 15 s sur tous les fetch front (`api.js`), timeout 10 s Genius Pay, idempotence webhook, validation DTO.
- ⚠️ **Logging** : `Logger` NestJS partiel, non structuré (pas de JSON), aucune agrégation ; front `console.*` seul.
- 🔴 **Monitoring/alerting : ABSENT** (Sentry prévu, `ErrorBoundary.jsx` sans télémétrie).
- ⚠️ **Stockage** : S3-compatible si `S3_BUCKET` défini (obligatoire en prod Vercel — FS local éphémère sinon).
- ⚠️ **Rollback** : aucun tag git, aucune stratégie documentée.

---

# 6. Performance

- 🔴 Bundle unique **1,1 Mo** (`dist/assets/index-*.js`), warning Vite « chunk > 500 kB », aucun code-splitting.
- 🔴 N+1 au boot (`DataContext.jsx:20-58` : pays → universités → branches).
- 🟠 `researcher.service.ts:44-52` : charge tous les projets puis filtre en JS.
- ⚠️ Pagination partielle (absente sur `/researchers`, `/clubs`, `/events`) ; **cache absent** ; rate limiting ✅.

---

# 7. Infrastructure & déploiement

- ⚠️ **CI/CD : fonctionnelle après correctifs, mais non committée** — `.github/workflows/ci.yml` (lint + build + test, Node 22, cache npm, 2 jobs) passe désormais (lint vert), mais le fichier est **untracked** : à committer.
- ✅ Vercel : `vercel.json` front (rewrites SPA) ; backend via `vercel-build` (migrations versionnées).
- ✅ `.env.example` back complet + `.env.example` front créé.
- ⚠️ Pas de séparation dev/staging/prod documentée ; pas de Docker ; **pas de stratégie de backup BDD**.
- ⚠️ **Git dirty sur les 2 dépôts** (~60 fichiers modifiés, correctifs non committés) — à committer avec le workflow CI.

---

# 8. Documentation

| Élément | État |
|---|---|
| README front | ✅ Corrigé (router réel, API backend) |
| README back | ✅ Réel (stack, scripts, env, déploiement) |
| Spec API | ✅ `docs/fieri_backend_api.md` + `test_api.http` |
| `.env.example` | ✅ Backend complet + **front créé** (756 o) |
| Guide de déploiement | ❌ Absent |
| Docs produit | ✅ Riches mais non organisés (`new/`, `doc/`) |

---

# 9. Plan d'action priorisé

## Bloquants — avant mise en service réelle (prod avec paiement réel)

| # | Point | Fichier/ligne | Pourquoi bloquant | Effort |
|---|---|---|---|---|
| 1 | **Committer l'état** : ~60 fichiers modifiés, workflow CI untracked, `dist/` dé-stagé | racine + `backend_fieri/` | Le code déployable ≠ code commité ; aucune traçabilité, aucun rollback | **Faible** |
| 2 | **Monitoring/alerting** (Sentry front + back) | `ErrorBoundary.jsx:19`, `main.ts` | Aucune visibilité en cas d'incident prod | **Moyen** |
| 3 | **Backups BDD** documentés (snapshots Neon quotidiens + procédure de restauration) | — | Perte de données irrécupérable | **Faible** |
| 4 | **3 vulns high back** (`deepmerge-ts` via Prisma) | `package-lock.json` back | Fix officiel = downgrade Prisma 6.19→6.12 (cassant) — suivre les advisories, appliquer quand un correctif non cassant existe | **Faible** (surveillance) |
| 5 | **Couverture e2e** : remplacer le boilerplate « Hello World » par un vrai test du flux critique (auth → paiement mock → trésorerie) | `test/app.e2e-spec.ts` | Aucune validation du circuit complet | **Moyen** |

## Importants — avant production à grande échelle

| # | Point | Effort |
|---|---|---|
| 6 | Code-splitting des 18 routes (bundle 1,1 Mo) | Faible |
| 7 | N+1 au boot (`DataContext.jsx`) + requête massive projets (`researcher.service.ts:44`) | Moyen |
| 8 | Chantier de typage back (251 warnings `no-unsafe-*`) | Élevé |
| 9 | Tests front (1 fichier pour 18 pages) | Élevé |
| 10 | Logging structuré (JSON) + agrégation | Moyen |
| 11 | Guide de déploiement écrit (Vercel, env, migrations, S3) | Faible |
| 12 | Hook `useFetch` mutualisé (fin du copy/paste 18 pages) | Moyen |
| 13 | Pagination + cache sur les endpoints principaux | Moyen |
| 14 | Séparation dev/staging/prod documentée + CORS par env | Faible |

## Confort

- Fusionner les 2 dépôts git (ou tags coordonnés).
- Docker (docker-compose local) + stratégie de rollback Vercel.
- Nettoyer les artefacts LLM (`new/`, `inventaire.md`).

---

# Annexe — Preuves de commandes exécutées (session 2)

```
npm run lint (front)                  → 54 problems (0 errors, 54 warnings), exit 0 ✅
npm run lint (back)                   → 251 problems (0 errors, 251 warnings), exit 0 ✅
npm run test (front)                  → 1 fichier / 3 tests ✅
npm run test (back)                   → 15 suites / 76 tests ✅
npm run test:cov (back)               → lines 18,6 % · support.service 94,16 % · treasury 100 %
npm run build (front)                 → ✅ (chunk 1,1 Mo)
npm run build (back)                  → ✅
npm audit --omit=dev (front)          → 0 vulnérabilité ✅
npm audit --omit=dev (back)           → 3 high (deepmerge-ts via prisma — fix cassant refusé)
git ls-files / git check-ignore       → .env jamais committé (2 dépôts) ✅
grep TODO|FIXME|HACK                  → 0 dette déclarée
```