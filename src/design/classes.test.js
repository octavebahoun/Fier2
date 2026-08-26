/**
 * Les règles du système, appliquées au code plutôt qu'écrites dans un document.
 *
 * Chacune correspond à un défaut réellement trouvé dans l'audit. Un document de
 * design ne se relit pas ; un test échoue.
 */

import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

function sourceFiles(dir = 'src', acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) { sourceFiles(full, acc); continue }
    if (!/\.jsx?$/.test(entry)) continue
    if (entry.includes('.test.')) continue
    acc.push(full)
  }
  return acc
}

const FICHIERS = sourceFiles()

/**
 * Chaque littéral entre guillemets, avec son fichier et sa ligne.
 *
 * Le saut de ligne est autorisé à l'intérieur : une classe s'écrit souvent sur
 * plusieurs lignes, et une première version de ce test, qui analysait ligne à
 * ligne, laissait passer exactement ces cas-là.
 */
function segments() {
  const out = []
  for (const f of FICHIERS) {
    const code = readFileSync(f, 'utf8')
    for (const m of code.matchAll(/(['"`])((?:[^'"`\\]|\\.)*?)\1/gs)) {
      if (!m[2].trim()) continue
      const ligne = code.slice(0, m.index).split('\n').length
      out.push({ fichier: f, ligne, texte: m[2].replace(/\s+/g, ' ') })
    }
  }
  return out
}

const SEGMENTS = segments()
const TOUT = FICHIERS.map((f) => `${f}\n${readFileSync(f, 'utf8')}`).join('\n')

/**
 * Le code seul, commentaires retirés.
 *
 * Sans cela, une règle se déclenche sur le commentaire qui explique pourquoi
 * elle existe — et l'explication devient impossible à écrire.
 */
function sansCommentaires(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1')
}

const ACCENTS = ['engine', 'ember', 'success', 'warning', 'danger']
const A = ACCENTS.join('|')

/** Formate les infractions pour que l'échec dise où aller. */
const lister = (infractions) =>
  infractions.slice(0, 8).map((i) => `${i.fichier}:${i.ligne} — ${i.texte.trim().slice(0, 90)}`).join('\n')

describe('couleurs — une seule palette', () => {
  it('n’utilise aucune famille de couleurs Tailwind en dur', () => {
    // Le système admet deux accents et trois états. `text-emerald-400` ne suit
    // pas le thème : c'est ce qui imposait une couche de !important.
    const familles = 'emerald|green|red|rose|amber|yellow|cyan|indigo|violet|purple|orange|blue|teal|lime|pink|fuchsia|sky'
    const motif = new RegExp(`(?<![-\\w])(bg|text|border|ring|from|to|via|fill|stroke|shadow)-(${familles})-[0-9]{2,3}(?![-\\w])`, 'g')
    const trouves = SEGMENTS.filter((s) => motif.test(s.texte) && (motif.lastIndex = 0) === 0)
    expect(trouves.length, `Utiliser les tokens (text-success, bg-danger-wash…) :\n${lister(trouves)}`).toBe(0)
  })

  it('n’utilise ni blanc ni noir comme surface', () => {
    const motif = /(?<![-\w])(bg|border|hover:bg)-(white|black)(\/\d+)?(?![-\w])/
    const trouves = SEGMENTS.filter((s) => motif.test(s.texte))
    expect(trouves.length, `Passer par un token (bg-bg-tertiary, bg-scrim…) :\n${lister(trouves)}`).toBe(0)
  })

  it('ne pose pas de teinte d’accent translucide', () => {
    // `bg-engine/10` ne dépasse pas 1,11:1 sur INK : le panneau ne se voit pas.
    // C'est la cause mécanique de « rien n'est opaque ».
    const motif = new RegExp(`(?<![-\\w])bg-(${A})/\\d`)
    const trouves = SEGMENTS.filter((s) => motif.test(s.texte))
    expect(trouves.length, `Utiliser bg-<accent>-wash, qui est opaque :\n${lister(trouves)}`).toBe(0)
  })
})

describe('couleurs — un libellé lisible sur son aplat', () => {
  // `:` dans l'antéslash exclut `hover:bg-…` : une variante d'état est
  // appariée à sa propre couleur de texte, et ne se juge pas au repos.
  const aplatSolide = new RegExp(`(?<![-\\w:])bg-(${A})(?![-\\w/])`)

  it('ne pose jamais de texte blanc sur un aplat d’accent', () => {
    // Blanc sur ENGINE tombe à 3,65:1 en thème sombre. `text-on-accent` vaut
    // l'encre en sombre et le papier en clair : une classe, deux thèmes.
    const trouves = SEGMENTS.filter(
      (s) => aplatSolide.test(s.texte) && /(?<![-\w:])text-white(?![-\w])/.test(s.texte),
    )
    expect(trouves.length, `Remplacer text-white par text-on-accent :\n${lister(trouves)}`).toBe(0)
  })

  it('ne pose jamais un texte de la couleur de son propre aplat', () => {
    const trouves = SEGMENTS.filter((s) => {
      const fond = s.texte.match(aplatSolide)
      return fond && new RegExp(`(?<![-\\w:])text-${fond[1]}(?![-\\w])`).test(s.texte)
    })
    expect(trouves.length, `Texte invisible sur son fond :\n${lister(trouves)}`).toBe(0)
  })
})

describe('chanfrein — la signature reste lisible', () => {
  it('ne combine pas une découpe avec une ombre Tailwind', () => {
    // Une box-shadow est peinte dans la boîte, donc rognée par le clip-path.
    // Sur une surface chanfreinée, l'ombre passe par `chamfer-shadow`.
    const trouves = SEGMENTS.filter(
      (s) => /(?<![-\w])chamfer(-sm|-xs)?(?![-\w])/.test(s.texte)
        && /(?<![-\w])shadow-(sm|md|lg|xl|2xl)(?![-\w/])/.test(s.texte),
    )
    expect(trouves.length, `Remplacer shadow-* par chamfer-shadow :\n${lister(trouves)}`).toBe(0)
  })

  it('n’expose que les trois tailles du système', () => {
    const tailles = [...TOUT.matchAll(/(?<![-\w])chamfer-([a-z]+)(?![-\w])/g)].map((m) => m[1])
    expect([...new Set(tailles)].sort()).toEqual(['shadow', 'sm', 'xs'])
  })
})

describe('typographie — l’échelle est fermée', () => {
  it('n’utilise aucune taille de texte arbitraire', () => {
    // MASTER.md : « Aucun texte < 12px ». 285 `text-[11px]`, `text-[8px]` et
    // consorts contournaient l'échelle ; le plus petit d'entre eux portait
    // l'avertissement « Simulation de validation » sur un dépôt de fichier.
    const trouves = SEGMENTS.filter((s) => /(?<![-\w])text-\[[0-9.]+(px|rem|em)\]/.test(s.texte))
    expect(trouves.length, `Utiliser l'échelle (text-xs = 12px, plancher) :\n${lister(trouves)}`).toBe(0)
  })
})

describe('données — rien d’inventé', () => {
  it('ne fabrique aucune URL de stockage', () => {
    // Deux écrans de candidature ne gardaient que le NOM du fichier déposé,
    // en fabriquaient une URL `https://fieri-storage.local/…` envoyée au
    // serveur et stockée en base, puis affichaient « Fichier lié ».
    const trouves = SEGMENTS.filter((s) => /fieri-storage\.local|\.local\//.test(s.texte))
    expect(trouves.length, `URL fabriquée :\n${lister(trouves)}`).toBe(0)
  })
})

describe('erreurs — un echec se voit', () => {
  it('aucun ecran ne rattrape une erreur sans le dire', () => {
    // Un `catch` qui se contente d'un console.error laisse l'ecran vide :
    // « aucun projet » devient indiscernable de « les projets n'ont pas pu
    // etre lus ». C'est le meme defaut que « 42 Approuvees » et « 0 CITE ».
    const ecrans = FICHIERS.filter((f) => f.startsWith(join('src', 'pages')))
    const muets = []
    for (const f of ecrans) {
      const code = sansCommentaires(readFileSync(f, 'utf8'))
      for (const m of code.matchAll(/catch\s*(?:\([^)]*\))?\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g)) {
        const corps = m[1]
        // `error:` dans un objet d'etat compte aussi : ce qui importe est
        // qu'un message parvienne a l'ecran, pas la forme du setter.
        if (/error|notify\(|throw|setStatus/i.test(corps)) continue
        // Seule exemption, justifiee : la liste d'articles similaires est une
        // suggestion. Absente, elle n'affirme rien de faux — contrairement a
        // une liste principale vide.
        if (f === join('src', 'pages', 'NewsDetail.jsx') && /setRelated/.test(corps)) continue
        // Un `catch` qui remet simplement l'etat a vide, sans appel reseau
        // derriere lui, n'a rien a annoncer.
        if (!/await |\.then\(|api\./.test(code.slice(Math.max(0, m.index - 400), m.index))) continue
        muets.push(`${f}:${code.slice(0, m.index).split('\n').length}`)
      }
    }
    expect(muets, `Poser un etat d'erreur :\n${muets.join('\n')}`).toEqual([])
  })
})

describe('erreurs — jamais un alert()', () => {
  it('n’utilise pas alert() pour dire qu’une action a échoué', () => {
    // Un alert() bloque la page, ne dit pas d'où il vient et sort du système.
    // Toute notification passe par useToast().
    const fautifs = FICHIERS.filter((f) => /(?<![.\w])alert\(/.test(sansCommentaires(readFileSync(f, 'utf8'))))
    expect(fautifs, `Utiliser notify() :\n${fautifs.join('\n')}`).toEqual([])
  })
})

describe('identité — une seule autorité', () => {
  it('aucun écran ne compare un rôle à la main', () => {
    // `m.role === 'CHEF_UNIVERSITAIRE'` et `m.role === 'MENTOR'` ne pouvaient
    // pas être vrais : l'un est un poste, l'autre un badge. Les écrans lisent
    // readIdentity() ou can(), qui savent la différence.
    const fautifs = []
    for (const f of FICHIERS) {
      if (f.startsWith(join('src', 'auth'))) continue
      if (f === join('src', 'context', 'AuthContext.jsx')) continue
      const code = sansCommentaires(readFileSync(f, 'utf8'))
      for (const m of code.matchAll(/(\w+)\.role\s*[=!]==\s*['"]/g)) {
        if (m[1] === 'identity') continue
        fautifs.push(`${f} — ${m[0]}…`)
      }
    }
    expect(fautifs, `Passer par readIdentity() / can() :\n${fautifs.join('\n')}`).toEqual([])
  })
})

describe('lumière — pas de néon', () => {
  it('n’utilise pas d’ombre colorée par un accent', () => {
    // MASTER.md, liste des anti-patterns : « pas de néon, pas de verre ».
    // Une ombre teintée d'accent est un halo, pas une élévation.
    const motif = new RegExp(`(?<![-\\w])shadow-(${A})(/\\d+)?(?![-\\w])`)
    const trouves = SEGMENTS.filter((s) => motif.test(s.texte))
    expect(trouves.length, `Ombre = élévation, pas couleur :\n${lister(trouves)}`).toBe(0)
  })

  it('n’utilise pas d’ombre sans décalage', () => {
    // `0 0 15px rgba(...)` ne pose rien sur le fond : c'est une lueur.
    const trouves = SEGMENTS.filter((s) => /(?<![-\w])shadow-\[0_0_/.test(s.texte))
    expect(trouves.length, `Halo interdit :\n${lister(trouves)}`).toBe(0)
  })
})

describe('composants — une implémentation par intention', () => {
  it('ne redéfinit le Toast nulle part ailleurs', () => {
    // Il en existait quatorze copies, avec quatre durées différentes et,
    // dans six écrans, un échec annoncé par une coche verte.
    const copies = FICHIERS.filter(
      (f) => f !== join('src', 'components', 'ui', 'Toast.jsx')
        && /(?:^|\n)(?:export )?(?:function Toast\b|const Toast\s*=)/.test(readFileSync(f, 'utf8')),
    )
    expect(copies, `Utiliser useToast() :\n${copies.join('\n')}`).toEqual([])
  })
})

describe('thème — un seul mécanisme', () => {
  it('ne pose la classe de thème qu’à un seul endroit', () => {
    // Deux mécanismes concurrents (`light-theme` posée, `.dark` attendue par
    // Tailwind et shadcn) faisaient que ni l'un ni l'autre ne s'appliquait.
    const poseurs = FICHIERS.filter((f) => /classList\.(toggle|add|remove)\(\s*['"](dark|light-theme)['"]/.test(readFileSync(f, 'utf8')))
    expect(poseurs).toEqual(['src/context/theme.js'])
  })
})
