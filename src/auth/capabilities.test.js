import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { CAPABILITIES, CAPABILITY_LIST, PENDING_UI } from './capabilities.js'
import { DESTINATIONS, getDestination, navAccessOf, routeAccessOf } from '../navigation/destinations.js'

/** Tout le code applicatif, hors tests et hors table elle-même. */
function sourceFiles(dir = 'src', acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) { sourceFiles(full, acc); continue }
    if (!/\.jsx?$/.test(entry)) continue
    if (entry.includes('.test.')) continue
    if (full.endsWith(join('src', 'auth', 'capabilities.js'))) continue
    acc.push(full)
  }
  return acc
}

const CODE = sourceFiles().map((f) => readFileSync(f, 'utf8')).join('\n')

const isUsed = (cap) => CODE.includes(`'${cap}'`) || CODE.includes(`"${cap}"`)

describe('la table des capacités reste vivante', () => {
  // C'est le test qui empêche le retour du constat F02 : sur 17 capacités
  // déclarées, 14 n'étaient appelées nulle part. Une table que personne ne lit
  // n'est pas un contrôle d'accès, c'est de la décoration.
  it('toute capacité est soit utilisée, soit déclarée en dette', () => {
    const orphelines = CAPABILITY_LIST.filter((cap) => !isUsed(cap) && !PENDING_UI.includes(cap))
    expect(
      orphelines,
      `Capacités déclarées mais jamais appelées : ${orphelines.join(', ')}.\n` +
      `Branchez-les à un écran, supprimez-les, ou inscrivez-les dans PENDING_UI.`,
    ).toEqual([])
  })

  it('la dette PENDING_UI ne contient que des capacités réellement inutilisées', () => {
    // Sans quoi la liste deviendrait un tapis sous lequel tout glisse.
    const branchees = PENDING_UI.filter((cap) => isUsed(cap))
    expect(
      branchees,
      `Ces capacités ont maintenant un écran : retirez-les de PENDING_UI → ${branchees.join(', ')}`,
    ).toEqual([])
  })

  it('PENDING_UI ne référence que des capacités existantes', () => {
    for (const cap of PENDING_UI) {
      expect(CAPABILITY_LIST, `PENDING_UI cite « ${cap} », absente de la table`).toContain(cap)
    }
  })

  it('chaque capacité nomme la route serveur qu’elle reflète', () => {
    for (const [cap, spec] of Object.entries(CAPABILITIES)) {
      expect(spec.route, `« ${cap} » ne dit pas quelle garde backend elle reflète`).toBeTruthy()
      expect(spec.label, `« ${cap} » n’a pas de libellé lisible`).toBeTruthy()
    }
  })

  it('aucune capacité ne répète ADMIN — la règle est centrale', () => {
    for (const [cap, spec] of Object.entries(CAPABILITIES)) {
      expect(spec.roles ?? [], `« ${cap} » liste ADMIN inutilement`).not.toContain('ADMIN')
    }
  })
})

describe('le registre des destinations et la table se répondent', () => {
  const capsOf = (access) => {
    if (!access || access === 'public') return []
    return access.anyOf ?? (access.capability ? [access.capability] : [])
  }

  it('toute capacité citée par une destination existe', () => {
    for (const dest of DESTINATIONS) {
      for (const cap of [...capsOf(routeAccessOf(dest.id)), ...capsOf(navAccessOf(dest.id))]) {
        expect(CAPABILITY_LIST, `« ${dest.id} » exige « ${cap} », absente de la table`).toContain(cap)
      }
    }
  })

  it('chaque destination a un nom et un identifiant unique', () => {
    const ids = DESTINATIONS.map((d) => d.id)
    expect(new Set(ids).size, 'identifiants de destination en double').toBe(ids.length)
    for (const dest of DESTINATIONS) {
      expect(dest.label, `« ${dest.id} » n’a pas de nom`).toBeTruthy()
    }
  })

  it('deux destinations ne portent jamais le même nom', () => {
    // Un chemin, un nom — mais aussi : un nom, un chemin. Deux « Annuaire »
    // dans la même barre latérale laissent le lecteur deviner lequel est lequel.
    const parLabel = new Map()
    for (const dest of DESTINATIONS) {
      const liste = parLabel.get(dest.label) || []
      liste.push(dest.id)
      parLabel.set(dest.label, liste)
    }
    const doublons = [...parLabel.entries()].filter(([, ids]) => ids.length > 1)
    expect(
      doublons.map(([label, ids]) => `« ${label} » → ${ids.join(', ')}`),
      'des destinations différentes portent le même nom',
    ).toEqual([])
  })

  it('chaque destination sait construire son URL', () => {
    for (const dest of DESTINATIONS) {
      const ok = typeof dest.build === 'function' || typeof dest.path === 'string'
      expect(ok, `« ${dest.id} » n’a ni path ni build()`).toBe(true)
    }
  })

  it('une entrée de menu n’est jamais plus permissive que sa route (F04, F06)', () => {
    // C'est l'invariant central du chantier : un lien visible mène toujours à
    // une page qui s'ouvre. `navAccess` ne peut que RESTREINDRE.
    for (const dest of DESTINATIONS.filter((d) => d.inNav || d.inPalette)) {
      const route = routeAccessOf(dest.id)
      const nav = navAccessOf(dest.id)
      if (route === 'public') continue
      const routeCaps = capsOf(route)
      const navCaps = capsOf(nav)
      expect(
        navCaps.length > 0,
        `« ${dest.id} » : la route est gardée mais le lien ne l’est pas`,
      ).toBe(true)
      for (const cap of navCaps) {
        expect(
          routeCaps.includes(cap),
          `« ${dest.id} » : le lien exige « ${cap} », que la route ne demande pas`,
        ).toBe(true)
      }
    }
  })

  it('aucun rôle ni poste codé en dur ne subsiste dans les vues', () => {
    // Le vocabulaire mort du constat F05 ne doit pas revenir.
    const interdits = ['ADMIN_UNIVERSITAIRE', 'ADMINISTRATEUR', 'RESPONSABLE_CLUB']
    for (const mot of interdits) {
      // On cherche le mot en LITTÉRAL DE CHAÎNE : c'est là qu'il servirait de
      // comparaison. Le citer dans un commentaire d'explication est légitime.
      const fautifs = sourceFiles()
        .filter((f) => !f.includes(join('src', 'auth')))
        .filter((f) => new RegExp(`['"\`]${mot}['"\`]`).test(readFileSync(f, 'utf8')))
      expect(fautifs, `« ${mot} » n’existe pas côté backend — trouvé dans ${fautifs.join(', ')}`)
        .toEqual([])
    }
  })
})

describe('navigation — aucune cible écrite en dur ne ment', () => {
  it('chaque navigate(\'…\') désigne une destination du registre', () => {
    // Le découpage du chantier 02 a déplacé des écrans ; deux appels du
    // tableau de bord ont continué de pointer sur l'ancienne cible, dont
    // « Trésorerie » qui ouvrait la page PUBLIQUE de dons. La sidebar et la
    // palette étaient vérifiées ; ces chaînes-là ne l'étaient pas.
    const inconnues = []
    for (const f of sourceFiles()) {
      const code = readFileSync(f, 'utf8')
      for (const m of code.matchAll(/navigate\??\.?\(\s*'([a-z0-9-]+)'/g)) {
        // getDestination résout aussi les alias historiques.
        if (!getDestination(m[1])) {
          inconnues.push(`${f} — navigate('${m[1]}')`)
        }
      }
    }
    expect(inconnues, `Destination inconnue :\n${inconnues.join('\n')}`).toEqual([])
  })
})
