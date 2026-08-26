import { useEffect, useState } from "react"
import { ChevronRight } from "lucide-react"

import { useSidebar } from "@/components/ui/sidebar"
import { getDestination } from "@/navigation/destinations.js"

/**
 * La navigation de l'espace connecté.
 *
 * Deux exigences, données par le client, et une contrainte du système.
 *
 * • Un seul groupe ouvert à la fois. Neuf destinations réparties dans quatre
 *   accordéons tous ouverts font une colonne qu'on ne lit plus. Le groupe où
 *   l'on se trouve s'ouvre seul ; en ouvrir un autre referme le précédent.
 *   La page courante reste donc toujours visible, et ses voisines à un clic.
 *
 * • L'esthétique du projet, pas celle de shadcn. MASTER.md décrit « le
 *   laboratoire précis » : plaques de prototypage, cotes, étiquettes
 *   d'échantillon. D'où les coins chanfreinés, les numéros de séquence en
 *   mono — que le document déclare légitimes quand ils portent une vraie
 *   structure — et le filet vertical qui tient les entrées d'un groupe comme
 *   une ligne de cote tient une série.
 *
 * • Repliée en icônes, la barre perd ses groupes : à 48 px, un intitulé de
 *   section ne se lit pas. Les destinations s'affichent alors à plat.
 */

// L'état actif suit la chaîne `parent` du registre : une page de détail
// éclaire son entrée de menu parente, et rien d'autre. Cette mise en avant est
// visuelle ; `aria-current="page"` reste réservé à l'entrée qui EST la page
// courante, sans quoi deux éléments se déclarent courants à la fois.
function isPageActive(id, currentPage) {
  if (currentPage === id) return true
  let cursor = getDestination(currentPage)
  const seen = new Set()
  while (cursor?.parent && !seen.has(cursor.id)) {
    seen.add(cursor.id)
    if (cursor.parent === id) return true
    cursor = getDestination(cursor.parent)
  }
  return false
}

const numero = (i) => String(i + 1).padStart(2, "0")

export function NavMain({ groups, currentPage, navigate }) {
  const { state, isMobile } = useSidebar()
  const enIcones = state === "collapsed" && !isMobile

  const groupeActif = (liste, page) =>
    liste.find((g) => g.items.some((i) => isPageActive(i.id, page)))?.id

  const [ouvert, setOuvert] = useState(() => groupeActif(groups, currentPage) ?? groups[0]?.id)

  // Naviguer ouvre le groupe d'arrivée. On ne referme rien de plus : si la
  // destination est déjà dans le groupe ouvert, rien ne bouge.
  useEffect(() => {
    const cible = groupeActif(groups, currentPage)
    if (cible) setOuvert(cible)
  }, [currentPage, groups])

  if (enIcones) {
    return (
      <nav aria-label="Navigation principale" className="flex flex-col gap-1 px-2 py-2">
        {groups.flatMap((g) => g.items).map((item) => {
          const active = isPageActive(item.id, currentPage)
          return (
            <button
              key={item.id}
              type="button"
              title={item.label}
              aria-label={item.label}
              aria-current={item.id === currentPage ? "page" : undefined}
              onClick={() => navigate(item.id, item.params || {})}
              className={`chamfer-xs flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center border transition-colors ${
                active
                  ? "border-engine bg-engine text-on-accent"
                  : "border-transparent text-text-muted hover:border-border-strong hover:bg-bg-tertiary hover:text-text-primary"
              }`}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
            </button>
          )
        })}
      </nav>
    )
  }

  return (
    <nav aria-label="Navigation principale" className="flex flex-col gap-1.5 px-2 py-2">
      {groups.map((group, index) => {
        const contientActif = group.items.some((i) => isPageActive(i.id, currentPage))
        const estOuvert = ouvert === group.id
        const panneauId = `groupe-${group.id}`

        return (
          <section key={group.id}>
            <h2>
              <button
                type="button"
                aria-expanded={estOuvert}
                aria-controls={panneauId}
                onClick={() => setOuvert(estOuvert ? null : group.id)}
                className={`chamfer-sm flex min-h-11 w-full cursor-pointer items-center gap-2.5 border px-2.5 text-left transition-colors ${
                  contientActif
                    ? "border-engine bg-engine-wash"
                    : "border-border-subtle bg-bg-secondary hover:bg-bg-tertiary"
                }`}
              >
                {/* Le numéro de séquence : une plaque porte sa référence. */}
                <span
                  className={`font-mono text-xs font-bold tabular-nums ${
                    contientActif ? "text-engine" : "text-text-muted"
                  }`}
                  aria-hidden="true"
                >
                  {numero(index)}
                </span>
                <group.icon
                  className={`h-4 w-4 shrink-0 ${contientActif ? "text-engine" : "text-text-muted"}`}
                  aria-hidden="true"
                />
                <span
                  className={`flex-1 truncate text-sm font-semibold ${
                    contientActif ? "text-text-primary" : "text-text-secondary"
                  }`}
                >
                  {group.label}
                </span>
                <span className="font-mono text-xs tabular-nums text-text-muted" aria-hidden="true">
                  {group.items.length}
                </span>
                <ChevronRight
                  className={`h-3.5 w-3.5 shrink-0 text-text-muted transition-transform ${estOuvert ? "rotate-90" : ""}`}
                  aria-hidden="true"
                />
              </button>
            </h2>

            {estOuvert && (
              /* Le filet de gauche tient la série, comme une ligne de cote. */
              <ul id={panneauId} className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-border-strong pl-2">
                {group.items.map((item) => {
                  const active = isPageActive(item.id, currentPage)
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        aria-current={item.id === currentPage ? "page" : undefined}
                        onClick={() => navigate(item.id, item.params || {})}
                        className={`chamfer-xs flex min-h-11 w-full cursor-pointer items-center gap-2.5 border px-2.5 text-left text-sm transition-colors ${
                          active
                            ? "border-engine bg-engine font-semibold text-on-accent"
                            : "border-transparent text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                        }`}
                      >
                        <item.icon
                          className={`h-4 w-4 shrink-0 ${active ? "text-on-accent" : "text-text-muted"}`}
                          aria-hidden="true"
                        />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        )
      })}
    </nav>
  )
}
