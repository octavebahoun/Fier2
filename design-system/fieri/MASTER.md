# FIERI Research — Design System Master

> Source of truth de l'identité **« La Preuve »** — refonte totale validée le 2026-08-17.
> Ce document fait foi pour toute décision visuelle. Les tokens vivent dans `src/index.css` (`@theme`), ce fichier documente le *pourquoi* et les règles d'usage.

---

## 1. Direction

**Sujet** : plateforme de recherche appliquée — robotique, IoT, IA embarquée. Passage **Lab → Market**. Public : étudiants-ingénieurs, chercheurs, industriels.

**Thèse** : *le laboratoire précis* — plaques de prototypage, cotes techniques, étiquettes d'échantillon. Pas de néon, pas de verre, pas de "cosmique".

**Refus explicites** (clusters IA) :
- ❌ Crème `#F4F1EA` + serif + terracotta
- ❌ Noir + vert acide / vermillon
- ❌ Broadsheet à filets + colonnes denses
- ❌ Glassmorphism forcé, glows néon, circuits SVG animés, `rounded-full` partout

## 2. Tokens

### Couleur — 6 nommées (2 accents max)

| Rôle | Dark | Light |
|---|---|---|
| `bg-primary` (INK / PAPER) | `#0B1220` | `#F5F3EE` |
| `bg-secondary` (PANEL / CARD) | `#111A2E` | `#FFFFFF` |
| `bg-tertiary` (ELEVATED) | `#16203A` | `#ECE9E1` |
| `engine` (accent bleu ingénierie) | `#2E7CF6` | `#1E5BB8` |
| `ember` (accent chaleur Lab→Market) | `#E8640C` | `#C2500C` |
| `text-primary` | `#E8ECF4` | `#1A2130` |
| `text-secondary` (STEEL) | `#A9B6CC` | `#3A4356` |
| `text-muted` | `#8490A5` | `#67718A` |
| `border-subtle` | `#1D2942` | `#DCD7CC` |
| `border-strong` | `#2A3A5E` | `#C4BCAC` |

**Règles** :
- 2 accents par écran max : ENGINE pour l'action/le focus, EMBER pour la chaleur/les faits saillants.
- Jamais de couleur hex en dur dans les composants (`#1B6FD8`, `#FFB800`… interdits — remplacer par token).
- Fini le "rainbow" par carte (ex. `CLUB_ICONS`).

### Typographie

| Rôle | Fonte | Usage |
|---|---|---|
| Display | **Exo** (400–800) | Titres, chiffres marquants |
| Corps | **Inter** (400–700) | Tout le reste |
| Données/cotes | **Roboto Mono** (400–700) | Eyebrows, annotations, valeurs, code, étiquettes |

- Base 16px, line-height 1.5–1.6. **Aucun texte < 12px** (les `text-[9px]`/`text-[10px]` sont interdits).
- `.eyebrow` : mono 11px, `letter-spacing 0.18em`, majuscules — l'annotation technique.

### Signature

**Coins chanfreinés** (`.chamfer` 16px / `.chamfer-sm` 10px) sur cartes, boutons primaires, images — comme une plaque de PCB. C'est LE mémorable ; tout le reste reste calme.
⚠️ `clip-path` rogne les ombres : utiliser des ombres **inset** ou un wrapper pour les surfaces chanfreinées.

## 3. Layout

- Grille 12 col, `max-w-[92rem]`, sections à hauteur généreuse (`py-24`).
- Structure = information : les numéros de séquence (01—04) en mono sont **légitimes** (parcours réel CITE → Académie → Institut).
- Seuls les avatars/pastilles de statut restent ronds ; surfaces = coins chanfreinés ou arrondis doux (`rounded-xl`/`2xl`).
- 1 section = 1 argument. Zéro décoration qui ne sert pas le propos.

## 4. Motion

- 1 moment orchestré : entrée du hero (l'étiquette d'échantillon se dessine, annotations en stagger `back.out(1.4)`).
- Le reste : reveal doux au scroll, micro-interactions 150–300ms, `exit faster than enter`.
- Tout derrière `prefers-reduced-motion` (état final rendu immédiatement).

## 5. Copy (règles)

- Français, bénéfice avant label, phrase active, sentence case.
- CTA = [Verbe] + [Ce qu'on obtient] : « Rejoindre la CITE de votre campus », « Candidater à un projet R&D ».
- Zéro emoji dans l'UI, zéro jargon (« écosystème immersif » interdit), zéro point d'exclamation.
- Un état vide = une invitation à agir ; une erreur = explication + correctif.

## 6. Anti-patterns (checklist de review)

- [ ] Aucun `!important` de combat dans `index.css`
- [ ] Aucun hex en dur dans les composants
- [ ] Aucun texte < 12px
- [ ] Aucun emoji-icon (SVG lucide uniquement)
- [ ] Aucun `backdrop-blur` non intentionnel
- [ ] Aucun `rounded-full` sur des surfaces (hors pastilles/avatars)
- [ ] Contraste 4.5:1 dans les 2 thèmes
- [ ] Focus visible (ring `engine`), cibles ≥ 44×44px
- [ ] `prefers-reduced-motion` respecté
## 7. Patrons partagés (Phase 3)

- `src/components/ui/PageHeader.jsx` — en-tête de page : tiret ember + `.eyebrow` (icône engine optionnelle), titre `font-display`, description, slot `children` pour stats/actions. Prop `align="center"` pour les pages centrées.
- `src/components/ui/StatePanel.jsx` — états `loading` / `empty` / `error` (chamfer-sm, icône engine/ember, bouton « Réessayer »). Utiliser pour uniformiser les états de données.
- En-têtes de page = `PageHeader` (pas de barre latérale gauche, pas de pill colorée, pas de h1 en dégradé blanc→couleur : mots-clés en `text-gradient-cosmic` engine→ember, ou `text-gradient-orange` ember→ember-soft pour les sujets « chaleur »).

## 8. Composants supprimés (refonte)

`DiscoverSection`, `PillarsSection`, `EcosystemSection`, `ClubBackgroundMotif`, `WireframeSVG` — code mort de l'ancienne home, supprimés (données `decouvrir` toujours présentes dans `landing.json`).
