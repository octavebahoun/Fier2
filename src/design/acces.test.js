/**
 * Ce qu'un écran doit à quelqu'un qui n'utilise pas une souris, ou qui a
 * demandé moins de mouvement à son système.
 *
 * Ces règles ne remplacent pas un essai au clavier : elles empêchent
 * seulement de reperdre ce qui a été gagné.
 */

import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

function sourceFiles(dir = 'src', acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) { sourceFiles(full, acc); continue }
    if (!/\.jsx$/.test(entry)) continue
    if (entry.includes('.test.')) continue
    acc.push(full)
  }
  return acc
}

const FICHIERS = sourceFiles()

/** Chaque balise de champ, en suivant accolades et guillemets — un attribut
 *  JSX contient des `>` (les flèches), qu'une regex naïve prend pour une fin. */
function champs(code) {
  const out = []
  for (const m of code.matchAll(/<(input|textarea|select)\b/g)) {
    let i = m.index + m[0].length
    let profondeur = 0
    let guillemet = null
    while (i < code.length) {
      const c = code[i]
      if (guillemet) { if (c === guillemet && code[i - 1] !== '\\') guillemet = null }
      else if (c === '"' || c === "'" || c === '`') guillemet = c
      else if (c === '{') profondeur++
      else if (c === '}') profondeur--
      else if (c === '>' && profondeur === 0) { out.push({ debut: m.index, balise: code.slice(m.index, i + 1) }); break }
      i++
    }
  }
  return out
}

/** Les balises d'un type donné, ouvrantes, avec tous leurs attributs. */
function balisesDe(code, types) {
  const out = []
  for (const m of code.matchAll(new RegExp(`<(${types})\\b`, 'g'))) {
    let i = m.index + m[0].length
    let profondeur = 0
    let guillemet = null
    while (i < code.length) {
      const c = code[i]
      if (guillemet) { if (c === guillemet && code[i - 1] !== '\\') guillemet = null }
      else if (c === '"' || c === "'" || c === '`') guillemet = c
      else if (c === '{') profondeur++
      else if (c === '}') profondeur--
      else if (c === '>' && profondeur === 0) { out.push({ debut: m.index, balise: code.slice(m.index, i + 1) }); break }
      i++
    }
  }
  return out
}

describe('accès — les champs se présentent', () => {
  it('aucun champ ne repose sur son seul placeholder', () => {
    // Un placeholder disparaît à la première frappe et n'est pas annoncé de
    // façon fiable : il ne remplace pas une étiquette.
    const fautifs = []
    for (const f of FICHIERS) {
      if (f.endsWith(join('ui', 'input.jsx'))) continue // primitive : l'appelant étiquette
      const code = readFileSync(f, 'utf8')
      for (const { debut, balise } of champs(code)) {
        if (/aria-label|\sid=/.test(balise)) continue
        if (/type="(hidden|file|checkbox|radio)"/.test(balise)) continue
        if (!/placeholder=/.test(balise)) continue
        fautifs.push(`${f}:${code.slice(0, debut).split('\n').length}`)
      }
    }
    expect(fautifs, `Ajouter une étiquette :\n${fautifs.join('\n')}`).toEqual([])
  })

  it('aucune étiquette ne pend dans le vide', () => {
    // Un <label> sans htmlFor qui n'enveloppe pas son champ n'étiquette rien :
    // le lecteur d'écran ne l'annonce pas, et cliquer dessus ne fait rien.
    const fautifs = []
    for (const f of FICHIERS) {
      const code = readFileSync(f, 'utf8')
      for (const m of code.matchAll(/<label\b(?![^>]*htmlFor)([^>]*)>([\s\S]{0,400}?)<\/label>/g)) {
        // Étiquetage implicite : le champ est à l'intérieur.
        if (/<(input|select|textarea)\b|\{\s*children\s*\}/.test(m[2])) continue
        fautifs.push(`${f}:${code.slice(0, m.index).split('\n').length}`)
      }
    }
    expect(fautifs, `Relier par htmlFor / id, ou envelopper le champ :\n${fautifs.join('\n')}`).toEqual([])
  })
})

describe('accès — la souris n’est pas obligatoire', () => {
  it('aucune action n’est portée par un élément non focusable', () => {
    // Un onClick sur un <div> est invisible au clavier. Les seules exceptions
    // sont les gardes de propagation, qui ne déclenchent aucune action.
    const fautifs = []
    for (const f of FICHIERS) {
      const code = readFileSync(f, 'utf8')
      for (const { debut, balise } of balisesDe(code, 'div|span|li|p')) {
        if (!/onClick=/.test(balise)) continue
        // Un garde de propagation ne déclenche rien ; un fond de modale est
        // masqué aux lecteurs d'écran et se ferme par Échap.
        if (/stopPropagation/.test(balise)) continue
        if (/aria-hidden="true"/.test(balise)) continue
        if (/tabIndex|role="button"/.test(balise)) continue
        fautifs.push(`${f}:${code.slice(0, debut).split('\n').length}`)
      }
    }
    expect(fautifs, `Utiliser <button> :\n${fautifs.join('\n')}`).toEqual([])
  })
})

describe('accès — le mouvement se demande', () => {
  it('les animations respectent la préférence système, en un seul endroit', () => {
    // 38 fichiers animent, 4 consultaient la préférence. `MotionConfig` la
    // fait respecter par toutes les animations Framer Motion à la fois — le
    // CSS ne neutralise que les transitions et keyframes, pas le JavaScript.
    const racine = readFileSync(join('src', 'main.jsx'), 'utf8')
    expect(racine).toMatch(/<MotionConfig\s+reducedMotion="user"/)
  })
})
