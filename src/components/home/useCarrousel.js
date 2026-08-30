import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * La mécanique d'un carrousel de l'accueil : combien de cartes tiennent, quelle
 * largeur elles font, comment on avance d'un pas, et comment on fait glisser à
 * la souris.
 *
 * Elle vivait en double dans le Journal et les CITE — au mot près. Le troisième
 * carrousel, celui des partenaires, aurait fait une troisième copie ; deux
 * exemplaires de la même chose finissent toujours par diverger, et ce projet en
 * a déjà payé le prix sur les catégories du Journal.
 *
 * Le glissement à la souris pose un problème que le survol n'a pas : après
 * avoir tiré la piste, le relâchement déclenche un `click` sur la carte qui se
 * trouve dessous. `aBouge()` permet à l'appelant de distinguer un vrai clic
 * d'une fin de glissement.
 *
 * @param {{ seuils?: [number, number] }} options
 *   `seuils` : largeurs sous lesquelles on montre 1 puis 2 cartes.
 */
export function useCarrousel({ seuils = [640, 1024] } = {}) {
  const pisteRef = useRef(null)
  const [parVue, setParVue] = useState(3)

  const enfonce = useRef(false)
  const departX = useRef(0)
  const departDefilement = useRef(0)
  const bouge = useRef(false)

  useEffect(() => {
    const [petit, moyen] = seuils
    const calculer = () => {
      const l = window.innerWidth
      setParVue(l < petit ? 1 : l < moyen ? 2 : 3)
    }
    calculer()
    window.addEventListener('resize', calculer)
    return () => window.removeEventListener('resize', calculer)
    // `seuils` est un littéral : on le lit par ses deux valeurs, pas par sa
    // référence, sinon l'effet se rejoue à chaque rendu.
  }, [seuils[0], seuils[1]]) // eslint-disable-line react-hooks/exhaustive-deps

  /** L'écart entre deux cartes, en rem — il doit suivre le `gap-6` du rendu. */
  const ECART_REM = 1.5

  const largeurCarte = `calc((100% - ${(parVue - 1) * ECART_REM}rem) / ${parVue})`

  const defiler = useCallback((sens) => {
    const el = pisteRef.current
    if (!el) return
    const premiere = el.children[0]
    const pas = premiere ? premiere.offsetWidth + ECART_REM * 16 : el.clientWidth
    el.scrollBy({ left: sens * pas, behavior: 'smooth' })
  }, [])

  const liaisons = {
    onPointerDown: (e) => {
      const el = pisteRef.current
      if (!el) return
      enfonce.current = true
      bouge.current = false
      departX.current = e.clientX
      departDefilement.current = el.scrollLeft
    },
    onPointerMove: (e) => {
      const el = pisteRef.current
      if (!enfonce.current || !el) return
      const parcours = e.clientX - departX.current
      if (!bouge.current && Math.abs(parcours) > 4) {
        bouge.current = true
        // La capture n'arrive QU'ICI, une fois le glissement avéré.
        //
        // Prise dès l'appui — ce que faisait le carrousel du Journal — elle
        // reciblait le `click` sur la piste : aucune de ses cartes n'était
        // cliquable, alors qu'elles annonçaient toutes mener quelque part.
        // Un clic n'a pas de mouvement ; il ne déclenche donc plus de capture,
        // et atteint enfin sa carte.
        el.setPointerCapture?.(e.pointerId)
      }
      if (bouge.current) el.scrollLeft = departDefilement.current - parcours
    },
    onPointerUp: () => { enfonce.current = false },
    onPointerLeave: () => { enfonce.current = false },
  }

  return { pisteRef, parVue, largeurCarte, defiler, liaisons, aBouge: () => bouge.current }
}

/** Les classes de la piste : un défilement horizontal qui s'aimante. */
export const PISTE =
  'flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 ' +
  'cursor-grab active:cursor-grabbing [scrollbar-width:none]'
