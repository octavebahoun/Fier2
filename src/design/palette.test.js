/**
 * La palette est vérifiée, pas jugée.
 *
 * Ce test lit src/index.css — la source unique — et mesure chaque token dans
 * son rôle. Il échoue si quelqu'un modifie une couleur sans vérifier ce qu'elle
 * devient au contact des surfaces sur lesquelles elle est posée.
 *
 * L'audit avait relevé des bordures à 1,20:1 et des panneaux teintés à 1,11:1 :
 * invisibles à l'écran, mais parfaitement mesurables. D'où ce test.
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { contrast, round2 } from './contrast.js'

// Chemin depuis la racine du projet, comme les autres tests qui lisent le code.
const css = readFileSync('src/index.css', 'utf-8')

/** Extrait les `--color-*: #xxxxxx` d'un bloc délimité par son sélecteur. */
function lireTokens(marqueur) {
  const debut = css.indexOf(marqueur)
  expect(debut, `bloc introuvable : ${marqueur}`).toBeGreaterThan(-1)
  const fin = css.indexOf('\n}', debut)
  const bloc = css.slice(debut, fin)
  const tokens = {}
  for (const m of bloc.matchAll(/--color-([\w-]+):\s*(#[0-9A-Fa-f]{3,8})\s*;/g)) {
    tokens[m[1]] = m[2]
  }
  return tokens
}

const SOMBRE = lireTokens('@theme {')
const CLAIR = lireTokens('html.light-theme,')

const THEMES = [
  ['sombre', SOMBRE],
  ['clair', CLAIR],
]

const SURFACES = ['bg-primary', 'bg-secondary', 'bg-tertiary']
const ACCENTS = ['engine', 'ember', 'success', 'warning', 'danger']

describe('palette — les deux thèmes parlent la même langue', () => {
  it('déclare exactement les mêmes tokens de part et d’autre', () => {
    // Le thème clair n'a pas à redéclarer les surfaces de grille ni les
    // aliases : on ne compare que ce qui porte une décision de couleur.
    const pertinents = (t) => Object.keys(t).filter((k) => !k.startsWith('grid')).sort()
    expect(pertinents(CLAIR)).toEqual(pertinents(SOMBRE))
  })

  it('nomme les cinq accents et leurs panneaux teintés', () => {
    for (const [nom, t] of THEMES) {
      for (const a of ACCENTS) {
        expect(t[a], `${nom} : --color-${a} manquant`).toBeTruthy()
        expect(t[`${a}-wash`], `${nom} : --color-${a}-wash manquant`).toBeTruthy()
      }
      expect(t['on-accent'], `${nom} : --color-on-accent manquant`).toBeTruthy()
    }
  })
})

describe.each(THEMES)('palette — thème %s', (nom, t) => {
  const mesure = (fg, bg) => round2(contrast(t[fg], t[bg]))

  it.each(['text-primary', 'text-secondary', 'text-muted'])(
    '%s se lit sur les trois surfaces (≥ 4.5:1)',
    (texte) => {
      for (const s of SURFACES) {
        expect(mesure(texte, s), `${texte} sur ${s}`).toBeGreaterThanOrEqual(4.5)
      }
    },
  )

  it.each(ACCENTS)('%s se lit comme texte sur les trois surfaces (≥ 4.5:1)', (accent) => {
    for (const s of SURFACES) {
      expect(mesure(accent, s), `${accent} sur ${s}`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it.each(ACCENTS)('un libellé on-accent se lit sur l’aplat %s (≥ 4.5:1)', (accent) => {
    expect(mesure('on-accent', accent), `on-accent sur ${accent}`).toBeGreaterThanOrEqual(4.5)
  })

  it('border-strong cerne un composant : ≥ 3:1 (WCAG 1.4.11)', () => {
    for (const s of SURFACES) {
      expect(mesure('border-strong', s), `border-strong sur ${s}`).toBeGreaterThanOrEqual(3)
    }
  })

  it('border-subtle sépare : il doit au moins se voir (≥ 1.5:1)', () => {
    for (const s of SURFACES) {
      expect(mesure('border-subtle', s), `border-subtle sur ${s}`).toBeGreaterThanOrEqual(1.5)
    }
  })

  it.each(ACCENTS)('le panneau %s-wash est une vraie surface, pas un voile', (accent) => {
    const wash = `${accent}-wash`
    // Se distingue du fond de page — c'est tout l'objet du remplacement des
    // `bg-engine/10`, qui plafonnaient à 1,11:1.
    expect(mesure(wash, 'bg-primary'), `${wash} vs fond`).toBeGreaterThanOrEqual(1.25)
    // On y lit le texte courant…
    expect(mesure('text-primary', wash), `text-primary sur ${wash}`).toBeGreaterThanOrEqual(4.5)
    // …et l'accent y sert d'icône ou de bordure, pas de texte : seuil non-texte.
    expect(mesure(accent, wash), `${accent} sur ${wash}`).toBeGreaterThanOrEqual(3)
  })

  it('l’anneau de focus se voit sur les trois surfaces (≥ 3:1)', () => {
    for (const s of SURFACES) {
      expect(mesure('engine', s), `focus sur ${s}`).toBeGreaterThanOrEqual(3)
    }
  })
})
