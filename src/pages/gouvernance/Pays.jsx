import { useCallback, useEffect, useState } from 'react'
import { Building2, ChevronDown, ChevronRight, Globe2, Loader2 } from 'lucide-react'
import api from '../../services/api.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import SectionCard from '../../components/ui/SectionCard.jsx'
import StatePanel from '../../components/ui/StatePanel.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

/**
 * Gouvernance nationale — les universités du pays.
 *
 * Le poste GOUVERNANT_PAYS existait dans le modèle, la capacité
 * `country:govern` dans la table, `GET /countries/:id/universities` côté
 * serveur — et aucun écran. Un gouvernant de pays se connectait sur un espace
 * qui ne lui montrait rien de son périmètre.
 *
 * L'écran ne montre que ce que le serveur donne à ce poste : les universités du
 * pays, et les filières de chacune. Il n'invente pas d'indicateurs qu'aucune
 * route ne calcule.
 */
export default function Pays() {
  const { identity } = useAuth()
  const countryId = identity?.countryId ?? null

  const [pays, setPays] = useState(null)
  const [universites, setUniversites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filières, chargées à la demande : une par université ouverte.
  const [ouverte, setOuverte] = useState(null)
  const [filieres, setFilieres] = useState({})
  const [filieresLoading, setFilieresLoading] = useState(null)

  const charger = useCallback(async () => {
    if (!countryId) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const [p, u] = await Promise.all([
        api.org.getCountryById(countryId),
        api.org.getUniversities(countryId),
      ])
      setPays(p?.success ? p.data : null)
      if (!u?.success) throw new Error(u?.message)
      setUniversites(Array.isArray(u.data) ? u.data : [])
    } catch (err) {
      setUniversites([])
      setError(err?.serverMessage || err?.message || "Les universités du pays n'ont pas pu être chargées.")
    } finally {
      setLoading(false)
    }
  }, [countryId])

  useEffect(() => { charger() }, [charger])

  const basculer = async (universite) => {
    if (ouverte === universite.id) { setOuverte(null); return }
    setOuverte(universite.id)
    if (filieres[universite.id]) return

    setFilieresLoading(universite.id)
    try {
      const res = await api.org.getBranches(universite.id)
      setFilieres((f) => ({ ...f, [universite.id]: res?.success && Array.isArray(res.data) ? res.data : [] }))
    } catch (err) {
      // Une filière illisible n'est pas une université absente : on le dit sur
      // la ligne concernée plutôt que de vider l'écran.
      setFilieres((f) => ({
        ...f,
        [universite.id]: { error: err?.serverMessage || err?.message || 'Filières illisibles.' },
      }))
    } finally {
      setFilieresLoading(null)
    }
  }

  if (!countryId && !loading) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <PageHeader
          tag="Gouvernance"
          icon={Globe2}
          title="Aucun pays rattaché à votre compte"
          description="Le poste de gouvernant national est attaché à un pays. Demandez à un administrateur de rattacher le vôtre pour voir ses universités."
        />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <PageHeader
        tag="Gouvernance"
        icon={Globe2}
        title={pays?.name ? `Universités — ${pays.name}` : 'Universités du pays'}
        description="Le périmètre national : chaque université du pays et ses filières."
      />

      <SectionCard
        icon={Building2}
        title="Universités"
        subtitle={universites.length ? `${universites.length} établissement${universites.length > 1 ? 's' : ''}` : undefined}
      >
        {loading ? (
          <StatePanel state="loading" />
        ) : error ? (
          <StatePanel state="error" message={error} onRetry={charger} />
        ) : universites.length === 0 ? (
          <StatePanel
            state="empty"
            icon={Building2}
            message="Aucune université enregistrée dans ce pays pour l’instant."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {universites.map((u) => {
              const ouvert = ouverte === u.id
              const contenu = filieres[u.id]
              return (
                <li key={u.id} className="border border-border-subtle bg-bg-primary">
                  <button
                    type="button"
                    onClick={() => basculer(u)}
                    aria-expanded={ouvert}
                    className="flex min-h-11 w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-bg-tertiary"
                  >
                    {ouvert
                      ? <ChevronDown className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
                      : <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />}
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-text-primary">
                      {u.name}
                    </span>
                    {filieresLoading === u.id && (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-engine" aria-hidden="true" />
                    )}
                  </button>

                  {ouvert && (
                    <div className="border-t border-border-subtle px-4 py-3 pl-11">
                      {contenu?.error ? (
                        <p className="text-sm text-danger" role="alert">{contenu.error}</p>
                      ) : !contenu ? (
                        <p className="text-sm text-text-muted">Chargement des filières…</p>
                      ) : contenu.length === 0 ? (
                        <p className="text-sm text-text-muted">Aucune filière enregistrée.</p>
                      ) : (
                        <ul className="flex flex-wrap gap-2">
                          {contenu.map((f) => (
                            <li
                              key={f.id}
                              className="chamfer-xs border border-border-strong px-2.5 py-1 text-sm text-text-secondary"
                            >
                              {f.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </SectionCard>
    </div>
  )
}
