/**
 * Le thème, réduit à une seule règle.
 *
 * L'état précédent en tenait trois, dont deux se contredisaient : la classe
 * posée était `light-theme`, alors que Tailwind attend `.dark`
 * (`@custom-variant dark (&:is(.dark *))`) et que shadcn déclare sa palette
 * sombre sous `.dark`. Aucune des deux ne s'appliquait jamais.
 *
 * Ce module est la seule autorité. Il est volontairement sans dépendance :
 * le petit script de `index.html` le rejoue à l'identique avant le premier
 * rendu, pour qu'aucun flash de thème clair ne précède React.
 */

export const THEME_STORAGE_KEY = 'fieri-theme'

/** Thème de marque, si l'on ne sait rien de l'utilisateur. */
export const DEFAULT_THEME = 'dark'

/** L'utilisateur a-t-il déjà tranché lui-même ? */
export function hasExplicitTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return stored === 'dark' || stored === 'light'
  } catch {
    return false
  }
}

/**
 * Choix explicite mémorisé > préférence du système > thème de marque.
 * Le stockage peut lever (navigation privée, cookies bloqués) : on retombe
 * alors sur la préférence système plutôt que de casser le rendu.
 */
export function readStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    // Stockage indisponible : on continue avec la préférence système.
  }
  if (typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light'
  }
  return DEFAULT_THEME
}

/**
 * Pose les classes sur <html> ET <body>.
 *
 * `dark` est celle que lisent Tailwind et shadcn. `light-theme` reste posée
 * en clair : la couche de compatibilité de index.css s'y accroche encore.
 * Les deux racines sont marquées parce qu'un `var()` déclaré sur `:root` se
 * résout au niveau de `:root` — s'il n'y avait que <body>, les composants
 * shadcn resteraient sur la palette de l'autre thème.
 */
export function applyTheme(theme) {
  const dark = theme === 'dark'
  for (const el of [document.documentElement, document.body]) {
    if (!el) continue
    el.classList.toggle('dark', dark)
    el.classList.toggle('light-theme', !dark)
  }
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
}
