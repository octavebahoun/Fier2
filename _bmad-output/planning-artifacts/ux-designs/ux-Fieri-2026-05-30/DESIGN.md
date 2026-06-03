---
name: FIERI Research
description: Immersive, cosmic digital ecosystem transforming traditional academic platforms into a premium "SaaS Scientifique" or "Innovation Hub".
status: final
updated: '2026-06-03'
colors:
  # Dark Mode (Cosmique)
  bg-primary-dark: '#080B14'
  bg-secondary-dark: '#0D1120'
  bg-tertiary-dark: '#111827'
  accent-orange-dark: '#E8640C'
  accent-amber-dark: '#F5A623'
  accent-blue-marine-dark: '#1B4F8A'
  text-primary-dark: '#F0EDE8'
  text-secondary-dark: '#A0A8B8'
  text-muted-dark: '#5A6070'
  
  # Light Mode (Aube Cosmique)
  bg-primary-light: '#FAFBFF'        # Fond principal : Blanc cassé
  bg-secondary-light: '#FFFFFF'      # Surface/Card : Blanc
  bg-tertiary-light: '#EAF0FF'       # Secondaire : Bleu Glacé
  brand-violet-light: '#6C4CF1'      # Primaire : Violet Royal
  brand-indigo-light: '#4F46E5'      # Primaire foncé : Indigo
  accent-orange-light: '#E76F00'     # Tertiaire : Orange Brûlé
  accent-orange-light-soft: '#FFB566' # Tertiaire clair : Orange Doux
  accent-amber-light: '#FF8A3D'      # Accent Premium : Ambre
  text-primary-light: '#111827'      # Texte principal : Navy
  text-secondary-light: '#6B7280'    # Texte secondaire : Gris
  text-muted-light: '#9CA3AF'
  
  # Brand
  fieri-blue: '#1B6FD8'
  fieri-orange: '#F5821F'
typography:
  display:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: 52px
    fontWeight: '800'
    lineHeight: '1.0'
    letterSpacing: '-2px'
  section:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: '-1px'
  card:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: '-0.5px'
  body:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.7'
  caption:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: '1.5px'
  accent:
    fontFamily: 'Plus Jakarta Sans'
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: '0.5px'
rounded:
  sm: 8px
  md: 12px
  lg: 16px
spacing:
  base: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  huge: 64px
  colossal: 96px
components:
  btn-primary:
    background: '{colors.fieri-blue}'
    foreground: '#FFFFFF'
    radius: '{rounded.sm}'
  btn-secondary:
    background: 'transparent'
    foreground: '{colors.text-primary-dark}'
    border: '1px solid rgba(255, 255, 255, 0.15)'
    radius: '{rounded.sm}'
  btn-ghost:
    background: 'transparent'
    foreground: '{colors.accent-orange-dark}'
    border: '1px solid rgba(232, 100, 12, 0.35)'
    radius: '{rounded.sm}'
  card-glass:
    background: 'rgba(13, 17, 32, 0.6)'
    blur: '20px'
    border: '1px solid rgba(255, 255, 255, 0.08)'
    radius: '{rounded.lg}'
---

# DESIGN.md — FIERI Research Visual Specifications

> [!NOTE]
> Ce document est le contrat visuel de **FIERI Research** rédigé selon le standard Google Labs `DESIGN.md`. Toute implémentation graphique doit s'y conformer de manière stricte.

---

## Brand & Style

**FIERI Research** est conçu comme un écosystème numérique immersif et fluide, transformant le modèle académique traditionnel en une expérience premium de style "SaaS Scientifique" ou "Hub d'Innovation".

L'identité visuelle repose sur une double signature d'inspiration cosmique :
*   **Mode Sombre ("Dark Cosmique") :** Alliance de fonds abyssaux d'un noir bleuté profond (`#080B14` et `#0D1120`) à des touches chaudes d'énergie scientifique (*Orange Brûlé* et *Ambre*) et de connectivité structurelle (*Bleu Marin*).
*   **Mode Clair ("Aube Cosmique / Stellaire") :** Une identité haut de gamme alliant le *Violet Royal* (`#6C4CF1`) pour la marque institutionnelle, le *Bleu Glacé* (`#EAF0FF`) pour les surfaces douces, et des éclats d'un élégant *Orange Brûlé* (`#E76F00`) et d'un *Ambre Premium* (`#FF8A3D`) pour attirer l'œil sur les actions clés et les chiffres en vedette.

Un commutateur de thème fluide permet de basculer instantanément entre ces deux atmosphères complémentaires.

---

## Colors

Le système de couleurs est optimisé pour garantir le contraste (norme WCAG AA) et la cohérence de marque à travers les deux modes.

### 1. Palette Sombre — "Dark Cosmique"
*   **Abyssal** (`{colors.bg-primary-dark}` | `#080B14`) : Fond principal de la plateforme. 
*   **Cosmos** (`{colors.bg-secondary-dark}` | `#0D1120`) : Surfaces Bento et conteneurs.
*   **Nébuleuse** (`{colors.bg-tertiary-dark}` | `#111827`) : États actifs ou survol.
*   **Accents Énergétiques :** *Orange Brûlé* (`#E8640C`, CTA, focus), *Ambre* (`#F5A623`, statuts "En cours", halos glows) et *Bleu Marin* (`#1B4F8A`, direct, info).
*   **Textes :** *Blanc Chaud* (`#F0EDE8`, titre), *Gris Stellaire* (`#A0A8B8`, corps), *Gris Mute* (`#5A6070`, bordures et métadonnées).

### 2. Palette Claire — "Aube Cosmique"
*   **Fond principal (Blanc cassé)** (`{colors.bg-primary-light}` | `#FAFBFF`) : Arrière-plan épuré et doux.
*   **Surface/Card (Blanc)** (`{colors.bg-secondary-light}` | `#FFFFFF`) : Assure une découpe géométrique nette des cartes Bento.
*   **Secondaire (Bleu Glacé)** (`{colors.bg-tertiary-light}` | `#EAF0FF`) : Bordures, séparateurs légers et sous-surfaces.
*   **Marque (Violet Royal / Indigo) :** `{colors.brand-violet-light}` (`#6C4CF1`) comme signature principale et `{colors.brand-indigo-light}` (`#4F46E5`) pour les textes actifs et les contrastes élevés.
*   **Accents Énergétiques (Orange / Ambre) :** *Orange Brûlé* (`#E76F00`, CTA secondaires, hover) et *Ambre Premium* (`#FF8A3D`, chiffres clés, icônes premium, graphiques).
*   **Textes :** *Navy* (`#111827`, titres et contenu principal) et *Gris* (`#6B7280`, descriptions secondaires).

### 3. Dégradé de la section Hero (Mode Clair)
Pour habiller le Hero d'une transition stellaire chaleureuse :
```css
background: linear-gradient(135deg, #F8F7FF 0%, #EEF2FF 40%, #FFF3E8 100%);
```

---

## Typography

L'application utilise une unique famille de polices moderne et géométrique : **Plus Jakarta Sans** importée de Google Fonts. L'expression de la marque se fait uniquement à travers la maîtrise des graisses et des approches (tracking).

### 1. Échelle Typographique
*   **H1 — Hero** (`{typography.display}`) : `52px` | Graisse `800` | Interligne `1.0` | Approche `-2px`
    *   *Usage :* Titres de pages principaux et accroches hero.
*   **H2 — Section** (`{typography.section}`) : `36px` | Graisse `700` | Interligne `1.2` | Approche `-1px`
    *   *Usage :* Titres des sections de la page.
*   **H3 — Carte** (`{typography.card}`) : `24px` | Graisse `600` | Interligne `1.3` | Approche `-0.5px`
    *   *Usage :* Titres de cartes Bento et composants.
*   **Body — Contenu** (`{typography.body}`) : `16px` | Graisse `400` | Interligne `1.7`
    *   *Usage :* Paragraphes, descriptions et articles.
*   **Caption — Légende** (`{typography.caption}`) : `12px` | Graisse `500` | Interligne `1.4` | Approche `+1.5px uppercase`
    *   *Usage :* Catégories, dates, badges et petits labels.
*   **Accent** (`{typography.accent}`) : `14px` | Graisse `600` | Interligne `1.4` | Approche `+0.5px`
    *   *Usage :* Liens, boutons, actions et tags.

---

## Layout & Spacing

L'architecture géométrique structure l'espace de manière claire et aérée.

*   **Largeur de Conteneur Maximale :** `1280px` centrée avec un padding latéral de `24px` sur desktop.
*   **Système de Grille :** Grille fluide de `12 colonnes` avec des gouttières (gutters) de `24px`.
*   **Padding de Section :** `96px` verticaux sur desktop (`48px` sur mobile) pour donner du souffle aux sections.
*   **Échelle d'Espacement de Base (Basée sur 4px) :**
    *   `4px` (`{spacing.base}`) : Micro-ajustements.
    *   `8px` (`{spacing.sm}`) : Espacement interne des badges et petits boutons.
    *   `16px` (`{spacing.md}`) : Espacement interne des cartes et des groupes de formulaires.
    *   `24px` (`{spacing.lg}`) : Marges standard entre composants et colonnes de grilles.
    *   `32px` (`{spacing.xl}`) : Espacements internes de grands conteneurs.
    *   `48px` (`{spacing.xxl}`) : Espacements entre sous-blocs.
    *   `64px` (`{spacing.huge}`) : Marges sous en-têtes de section.
    *   `96px` (`{spacing.colossal}`) : Marges de sections principales.

---

## Elevation & Depth

La profondeur visuelle est obtenue grâce au chevauchement de couches translucides et de lueurs colorées simulées.

1.  **Couche Fondatrice :** Fond abyssal sombre et statique (`#080B14`) habillé d'une fine grille Blueprint (`rgba(255,255,255,0.03)`).
2.  **Couche de Surface (Glassmorphism) :** 
    *   *Spécification :* `rgba(13, 17, 32, 0.6)` avec un flou de verre de `backdrop-filter: blur(20px)` et une bordure subtile `border: 1px solid rgba(255, 255, 255, 0.08)`.
3.  **Lueur Active (Active Glow) :** 
    *   *Spécification :* `box-shadow: 0 8px 24px rgba(232, 100, 12, 0.35)` pour faire ressortir les actions principales et le survol des boutons.
4.  **Ombre Portée des Cartes (Card Hover Shadow) :** 
    *   *Spécification au survol :* `box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(232, 100, 12, 0.2);` avec une translation vers le haut de `-4px` pour un effet d'apesanteur.

---

## Shapes

Le niveau d'arrondi des angles définit la personnalité "technologique et précise" de la plateforme.

*   **Petit arrondi (`{rounded.sm}` | `8px`) :** Boutons, champs de saisie (inputs), petits badges. Apporte de la rigueur et de la netteté aux outils d'interaction.
*   **Moyen arrondi (`{rounded.md}` | `12px`) :** Boutons de menu, modales d'avertissement rapides, sous-cartes internes.
*   **Grand arrondi (`{rounded.lg}` | `16px`) :** Cartes de projets principales, conteneurs Bento, sidebar, modales d'action complexes.

---

## Components

### 1. Boutons (Buttons)
*   **Bouton Principal (CTA) :** Remplissage `{colors.fieri-blue}` (`#1B6FD8`), texte blanc, arrondi `{rounded.sm}`. Au survol, `hover:bg-fieri-blue/90` avec une lueur active `box-shadow: 0 4px 20px rgba(27,111,216,0.35)`. Utilisé pour les actions principales (Connexion, Rejoindre, Envoyer).
*   **Bouton Secondaire :** Fond transparent, texte `{colors.text-primary-dark}`, bordure subtile `rgba(255, 255, 255, 0.15)`. Au survol, fond `rgba(255, 255, 255, 0.06)`.
*   **Bouton Ghost :** Fond transparent, texte `{colors.accent-orange-dark}`, bordure `{colors.accent-orange-dark}` à 35% d'opacité.
*   **Bouton Live / En Direct :** Fond `{colors.accent-blue-marine-dark}` à 25% d'opacité, texte bleu clair `#4A90D9`, bordure bleue à 40% d'opacité, dot pulsant.

### 2. Badges & Statuts
*   **Badge En Direct (Live) :** Fond `{colors.accent-blue-marine-dark}` (20%), texte `#5BA3F0`, bordure à 40% d'opacité, dot bleu pulsant de 6px.
*   **Badge En Cours (Ongoing) :** Fond `{colors.accent-amber-dark}` à 12%, texte `{colors.accent-amber-dark}`, bordure à 25% d'opacité.
*   **Badge Innovation :** Fond `{colors.accent-orange-dark}` à 15%, texte `{colors.accent-orange-dark}`, bordure à 30% d'opacité, préfixé du glyphe `✦`.
*   **Badge Terminé (Done) :** Fond gris à 5%, texte `{colors.text-secondary-dark}`, bordure subtile.

### 3. Cartes Glassmorphism (Glassmorphism Cards)
Les cartes de projets et d'événements suivent le style `{components.card-glass}`. Au survol, elles s'élèvent de `-4px` et leur bordure s'illumine subtilement en `{colors.accent-orange-dark}` (opacité 30%) avec un léger halo arrière.

### 4. Sidebar Chercheur / Administrateur
Composant clé pour les profils connectés de haut niveau. 
*   **État Contracté :** Largeur `40px`, affiche uniquement les icônes (Lucide Icons) et un cercle d'activation pulsant de style ambre/orange.
*   **État Déployé :** Largeur `240px`, s'étend horizontalement en 300ms (`cubic-bezier(0.16, 1, 0.3, 1)`) avec apparition progressive (fade-in) des libellés textuels.

---

## Do's and Don'ts

| À faire (Do) | À éviter (Don't) |
|---|---|
| Maintenir le fond sombre abyssal (`#080B14`) pour conserver l'atmosphère cosmique du mode sombre. | Utiliser du noir pur (`#000000`) ou des teintes de blanc brut en arrière-plan principal sombre. |
| **Conserver le Violet Royal (`#6C4CF1`) comme couleur principale de marque en mode clair, et n'utiliser l'orange que pour les accents significatifs.** | **Remplacer le violet par l'orange en mode clair : l'orange doit servir uniquement à attirer l'œil sur les actions clés.** |
| Utiliser les accents chauds (Orange, Ambre) exclusivement pour les appels à l'action, indicateurs, chiffres clés ou les éléments actifs. | Utiliser les accents chauds de manière purement décorative ou répétitive (saturation visuelle). |
| Respecter la transition des boutons avec un léger déplacement vertical vers le haut de 1px. | Utiliser des ombres portées noires opaques ou des bordures trop épaisses pour simuler la profondeur. |
| Composer les pages sous forme de Bento Grids en calculant l'ordre de priorité côté client (le premier projet en grand). | Créer des tableaux administratifs bruts ou des listes linéaires sans hiérarchie visuelle. |
| Conserver les angles nets et précis de 8px pour les contrôles de formulaire et 16px pour les conteneurs. | Utiliser des arrondis excessifs de style "bulle de savon" (`rounded-3xl` ou plus) hors badges. |
| Appliquer le flou de verre (`backdrop-filter`) uniquement sur les éléments de surface au-dessus du fond. | Omettre le flou de verre sur les éléments collés (Navbar, Modales) ce qui briserait l'effet de profondeur. |
