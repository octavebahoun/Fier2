import { useSearchParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Award, Megaphone, Network, Rocket, Sparkles, ArrowRight, Check } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import programmesContent from '../content/programmes.json'

/**
 * Les programmes FIERI — une page, un sélecteur.
 *
 * L'accueil annonçait trois programmes (Ambassadeurs, Bénévolat, Mentorat) qui
 * pointaient tous vers le formulaire de contact, et une seule page existait
 * pour le PAF, remplie d'un contenu qui ne venait d'aucun document. Les quatre
 * programmes réels vivent maintenant ici, chacun avec ses volets, et le
 * bénévolat comme le mentorat rentrent dans le PAF dont ils font partie.
 *
 * Le programme choisi est porté par l'URL (`?p=pef`) : la page reste
 * partageable, et le retour arrière du navigateur fait ce qu'on attend de lui.
 */

const ICONS = {
  award: Award,
  megaphone: Megaphone,
  network: Network,
  rocket: Rocket,
}

const { tag, title, description, items: PROGRAMMES } = programmesContent

export default function Programmes({ navigate }) {
  const reduced = useReducedMotion()
  const [params, setParams] = useSearchParams()

  const demande = String(params.get('p') || '').toLowerCase()
  const actif = PROGRAMMES.find((p) => p.id === demande) || PROGRAMMES[0]

  const choisir = (id) => {
    setParams((courant) => {
      const p = new URLSearchParams(courant)
      p.set('p', id)
      return p
    }, { replace: true })
  }

  const Icone = ICONS[actif.icon] || Sparkles

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-24 pb-16 md:px-8">
      <PageHeader
        tag={tag}
        icon={Sparkles}
        title={title}
        description={description}
        align="center"
        variant="hero"
      />

      {/* Le sélecteur. Un vrai groupe d'onglets : les flèches du clavier y
          fonctionnent parce que chaque onglet est un bouton, et le panneau
          annonce de quel onglet il dépend. */}
      <div
        role="tablist"
        aria-label="Les programmes FIERI"
        className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4"
      >
        {PROGRAMMES.map((p) => {
          const courant = p.id === actif.id
          const IconeOnglet = ICONS[p.icon] || Sparkles
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              id={`onglet-${p.id}`}
              aria-selected={courant}
              aria-controls={`panneau-${p.id}`}
              onClick={() => choisir(p.id)}
              className={`chamfer-sm flex min-h-11 cursor-pointer flex-col items-start gap-1 border px-4 py-3 text-left transition-colors ${
                courant
                  ? 'border-engine bg-engine text-on-accent'
                  : 'border-border-strong bg-bg-secondary text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
              }`}
            >
              <span className="flex items-center gap-2 font-mono text-sm font-bold tracking-wider">
                <IconeOnglet className="h-4 w-4 shrink-0" aria-hidden="true" />
                {p.code}
              </span>
              <span className="text-xs font-semibold leading-snug">{p.name}</span>
            </button>
          )
        })}
      </div>

      <motion.section
        key={actif.id}
        role="tabpanel"
        id={`panneau-${actif.id}`}
        aria-labelledby={`onglet-${actif.id}`}
        tabIndex={-1}
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-6"
      >
        {/* En-tête du programme */}
        <div className="chamfer chamfer-shadow border border-border-strong bg-bg-secondary p-7">
          <div className="flex items-start gap-4">
            <div className="chamfer-xs flex h-14 w-14 shrink-0 items-center justify-center border border-engine bg-engine-wash">
              <Icone className="h-6 w-6 text-engine" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="eyebrow">{actif.code}</span>
              <h2 className="mt-1 font-display text-2xl font-extrabold leading-snug tracking-tight text-text-primary">
                {actif.name}
              </h2>
              <p className="mt-3 text-base font-light leading-relaxed text-text-secondary">
                {actif.description}
              </p>
            </div>
          </div>
        </div>

        {/* Les volets — seul le PEF en a pour l'instant. Un programme sans
            volet n'affiche pas de grille vide : son contenu détaillé viendra. */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {(actif.volets || []).map((volet) => (
            <article
              key={volet.titre}
              className="chamfer-sm flex flex-col border border-border-strong bg-bg-secondary"
            >
              <header className="border-b border-border-subtle px-5 py-4">
                <h3 className="font-display text-base font-bold leading-snug text-text-primary">
                  {volet.titre}
                </h3>
              </header>
              <div className="flex-1 px-5 py-4">
                {volet.intro && (
                  <p className="mb-4 text-sm leading-relaxed text-text-secondary">{volet.intro}</p>
                )}

                {volet.points && (
                  <ul className="flex flex-col gap-2.5">
                    {volet.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5 text-sm text-text-secondary">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-engine" aria-hidden="true" />
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Les trois labels de Cité. Le système n'admet que deux
                    accents : c'est le nom du niveau qui distingue, pas une
                    couleur d'or, d'argent ou de bronze qu'il faudrait
                    inventer. */}
                {volet.labels && (
                  <ul className="flex flex-col gap-2.5">
                    {volet.labels.map((label) => (
                      <li
                        key={label.niveau}
                        className="chamfer-xs flex items-center gap-3 border border-border-strong bg-bg-primary px-3 py-2.5"
                      >
                        <span className="chamfer-xs shrink-0 border border-ember bg-ember-wash px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-wider text-ember">
                          {label.niveau}
                        </span>
                        <span className="min-w-0 text-sm text-text-secondary">{label.detail}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* L'action. Une seule, la même pour les quatre : il n'y a pas encore
            de dossier de candidature par programme. */}
        <div className="chamfer-sm flex flex-col items-start gap-4 border border-border-strong bg-bg-secondary p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-secondary">
            Ce programme vous intéresse&nbsp;? Écrivez-nous, nous vous dirons comment le rejoindre.
          </p>
          <button
            type="button"
            onClick={() => navigate('contact')}
            className="chamfer-sm inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 bg-engine px-6 text-sm font-bold text-on-accent transition-colors hover:bg-engine-deep"
          >
            Nous contacter
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </motion.section>
    </div>
  )
}
