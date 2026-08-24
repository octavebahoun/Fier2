/**
 * Contraste WCAG 2.1 — luminance relative et rapport entre deux couleurs.
 *
 * Ce module existe pour que la palette soit vérifiable par un test plutôt que
 * jugée à l'œil : la plainte « rien n'est opaque » désignait des bordures à
 * 1,20:1 et des panneaux teintés à 1,11:1, invisibles mais indétectables sans
 * mesure.
 */

/** #RGB ou #RRGGBB → [r, g, b] sur 0-255. */
export function toRgb(hex) {
  let h = String(hex).trim().replace('#', '')
  if (h.length === 3) h = [...h].map((c) => c + c).join('')
  if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error(`Couleur illisible : ${hex}`)
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
}

const canal = (c) => {
  const v = c / 255
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

/** Luminance relative (WCAG 2.1, §relative luminance). */
export function luminance(hex) {
  const [r, g, b] = toRgb(hex)
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b)
}

/** Rapport de contraste entre deux couleurs opaques, de 1 à 21. */
export function contrast(a, b) {
  const la = luminance(a)
  const lb = luminance(b)
  const [haut, bas] = la > lb ? [la, lb] : [lb, la]
  return (haut + 0.05) / (bas + 0.05)
}

/** Arrondi à deux décimales, pour des messages d'échec lisibles. */
export const round2 = (n) => Math.round(n * 100) / 100
