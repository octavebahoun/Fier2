# Spine Pair Review — FIERI Research

## Overall verdict

The spine pair is **adequate with notable gaps**. DESIGN.md has a strong visual foundation (complete color/typography/rounded/spacing tokens, clear brand duality) but suffers from 3 broken prose token references (`accent-orange`, `accent-blue-marine`, `accent-amber`) that exist only as `-dark`/`-light` variants, and 6 prose-described component types missing YAML tokens. EXPERIENCE.md provides a thorough 12-page IA and 7 component patterns but is missing failure paths on both key flows and lacks coverage of offline, permission-denied, and focus-as-state patterns. No visual reference files (mockups/wireframes/imports) exist, and neither spine links to any.

## 1. Flow coverage — thin

Checked: EXPERIENCE.md Key Flows — named protagonist, numbered steps, climax beat (AHA Moment), failure path.

### Findings
- **high** Both flows (Parcours 1 — Sofia, Parcours 2 — Dr. Quinn) lack an explicit failure path block after the climax. Examples show `Failure: …` paragraphs; these are absent. *Fix:* Add a failure paragraph to each, e.g., "Échec : l'appel API renvoie une erreur → le mock transparent prend le relais avec un badge discret 'Mocks activés'."
- **medium** Flow naming uses "Parcours" instead of "Flow" — cosmetic but diverges from the standard. *Fix:* Rename to "Flow 1 — …" / "Flow 2 — …" for scanner compatibility.
- **low** Only 2 flows for a 12-page, 4-role SPA — coverage is thin. Missing flows: navigation entre pages (Sidebar/Command Palette), admin workflow, error-recovery walkthrough. *Fix:* Add at least Flow 3 (admin publishing workflow) and Flow 4 (offline/error recovery).

## 2. Token completeness — broken (3 unresolved)

Checked: Every YAML frontmatter token in DESIGN.md. Every `{path.to.token}` in prose. Color tokens must have hex values.

### Findings
- **critical** `{colors.accent-orange}` referenced 4 times in prose (lines 219, 225×2, 230) and in `btn-ghost.foreground` YAML — does not exist. Token is split into `accent-orange-dark` (#E8640C) and `accent-orange-light` (#E76F00). *Fix:* Replace all `{colors.accent-orange}` with `{colors.accent-orange-dark}` (or the correct contextual variant).
- **critical** `{colors.accent-blue-marine}` referenced twice in prose (lines 220, 223) — does not exist. Only `accent-blue-marine-dark` (#1B4F8A) is defined. *Fix:* Replace with `{colors.accent-blue-marine-dark}` or define a bare `accent-blue-marine` alias.
- **critical** `{colors.accent-amber}` referenced in prose (line 224) — does not exist. Only `accent-amber-dark` (#F5A623) and `accent-amber-light` (#FF8A3D) are defined. *Fix:* Replace with the correct variant.
- **medium** `{colors.fieri-orange}` (#F5821F) is defined in YAML but never referenced in prose. *Fix:* Either use it or remove it.
- **low** `{colors.accent-orange-light-soft}` (#FFB566) defined but never referenced. *Fix:* Either use it or remove it.
- **low** All color tokens have hex values — good. No missing hex values.

## 3. Component coverage — partial overlap

Checked: Every component name extracted from DESIGN.md (prose + YAML) and EXPERIENCE.md (Component Patterns).

### Findings
- **high** 6 prose-described component types in DESIGN.md have no YAML token: Bouton Live, Badge En Direct, Badge En Cours, Badge Innovation, Badge Terminé, Sidebar. Only 4 components are in YAML (btn-primary, btn-secondary, btn-ghost, card-glass). *Fix:* Add YAML tokens for btn-live, badge-live, badge-ongoing, badge-innovation, badge-done, sidebar.
- **medium** Cross-spine mismatch: EXPERIENCE.md.Component Patterns lists 7 components (Bento Grid, Sidebar, Carrousel, Dot Live, ScrollToTop, Notification Badge, Newsletter). DESIGN.md does not describe Carrousel, Dot Live, ScrollToTop, Notification Badge, or Newsletter visually. *Fix:* Add visual specs (colors, radii, spacing) in DESIGN.md for these components.
- **medium** DESIGN.md prose describes Badge statuts (4 variants) and Sidebar — neither appears in EXPERIENCE.md.Component Patterns. *Fix:* Add behavioral rows for badges and sidebar in EXPERIENCE.md.
- **low** Bento Grid is described in EXPERIENCE.md but DESIGN.md only mentions Bento in Do's/Don'ts — no visual token for it. *Fix:* Consider a `bento-card` token in DESIGN.md YAML.

## 4. State coverage — 3 gaps

Checked: Walk every IA surface (12 pages), list expected states. Standard set: empty, loading, error, focus, offline, permission-denied.

### Findings
- **high** No **offline** state pattern. EXPERIENCE.md Foundation mentions production toasts for network failure but there is no dedicated State Pattern entry for offline behavior. *Fix:* Add "État Hors-Ligne" — specify skeleton persistence, local storage fallback, reconnection toast.
- **high** No **permission-denied** state pattern. The IA table assigns roles per page but no treatment for attempted unauthorized access (e.g., a Membre hitting an Admin page). *Fix:* Add "État Accès Refusé" — redirect to home with a toast, or show a blocked-state component.
- **medium** No **focus** state pattern. Accessibility section mentions visible focus but there is no dedicated state entry for focused element chrome. *Fix:* Add "État Focus" — specify focus ring color, offset, and behavior per component type.
- **low** Empty state (line 125) and empty search (line 129) are both covered and well-differentiated from error/loading. ✓
- **low** Loading state (skeleton, line 105) is covered with explicit anti-spinner rule. ✓
- **low** Error state (line 109) covered with retry button. ✓

## 5. Visual reference coverage — absent

Checked: mockups/, wireframes/, imports/ directories. Spine links to them.

### Findings
- **high** No `mockups/`, `wireframes/`, or `imports/` directories exist in the UX design folder. Neither spine contains a `→ Composition reference:` link (both Quill and Drift examples do). *Fix:* Create a `mockups/` directory with wireframes for at least the home page and dashboard; add reference line to EXPERIENCE.md Foundation or IA section.
- **medium** The `index.md` references the two spines but does not link to any visual assets. *Fix:* Add a visual assets section to index.md.

## 6. Bloat & overspecification — moderate

- **medium** DESIGN.md Elevation section (lines 194–200) embeds raw CSS property values (`backdrop-filter: blur(20px)`, `box-shadow: 0 8px 24px …`, `-4px` translation). The example spines use descriptive language ("subtle shadow", "slightly elevated"), not CSS. Overspecification locks the implementer's hand. *Fix:* Abstract to "flou de verre avec halo ambre sur les actions principales" and let implementation decide the exact values.
- **low** 248 lines for DESIGN.md is within bounds but the 10 prose component types (vs 4 YAML tokens) suggest YAML coverage is incomplete, not that prose is bloated.
- **low** EXPERIENCE.md at 178 lines is lean. No overspecification issues.

## 7. Inheritance discipline — absent

- **high** DESIGN.md does not name any inherited UI library or system. Unlike the shadcn example (which explicitly states "shadcn defaults are the contract" and lists inherited components), FIERI appears wholly custom but never says so. This creates ambiguity — is there a base framework? Which components are custom vs inherited? *Fix:* Add an "Héritage" section at the top of DESIGN.md stating the stack (e.g., shadcn/ui on Tailwind, or fully custom) and what is inherited vs overridden.
- **low** EXPERIENCE.md mentions Framer Motion — good, but does not name its component library inheritance.

## 8. Shape fit — ambitious, thin on validation

- **medium** The spine pair covers a 12-page, 4-role SPA — significantly more complex than the example spines (Quill: 4 surfaces; Drift: 5 surfaces). Yet the number of flows (2) and component patterns (7 behavioral / 4 YAML) is comparable to the simpler examples. The shape is ambitious but under-validated for its surface area.
- **medium** No Mermaid diagrams, flowcharts, or state machine representations — acceptable for v1 but the complexity of role-based IA (4 roles × 12 pages = 48 permission boundaries) would benefit from a visual matrix.

## Mechanical notes

- **high** Frontmatter inconsistency: DESIGN.md uses `name: FIERI Research`; EXPERIENCE.md uses `title: 'EXPERIENCE - FIERI Research'` — the key should be `name` in both for tooling consistency (bmad-ux scanner expects `name`).
- **low** Frontmatter quoting inconsistency: DESIGN.md `updated: '2026-06-03'` (single quotes); EXPERIENCE.md `status: 'final'` (single quotes). The examples use unquoted values. Single quotes are valid YAML but add unnecessary noise.
- **medium** No Mermaid syntax in either spine — acceptable but a 12-page IA would benefit from a `stateDiagram-v2` or `flowchart` LR for navigation flows.
- **low** EXPERIENCE.md Foundation line 22 lists 13 section anchor IDs in a comma-separated inline list — fragile. A table or bullet list would be more maintainable.
- **low** DESIGN.md line 108: "Toute implémentation graphique doit s'y conformer de manière stricte" — strong language, good.
- **low** Decision log entry 2026-06-03 (line 13) confirms btn-primary token was fixed from `accent-orange` to `fieri-blue` — but `btn-ghost` still uses `accent-orange`, suggesting the fix was incomplete.
