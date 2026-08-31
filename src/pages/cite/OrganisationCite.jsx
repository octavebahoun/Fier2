import { useMemo, useState } from 'react'
import { GraduationCap, Sparkles, Users } from 'lucide-react'
import citeImage from '../../assets/fieri_student_hub.webp'
import { api } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import StatePanel from '../../components/ui/StatePanel.jsx'
import { useCiteSelection, useCiteTree, titreDe } from './useCiteTree.js'
import {
  BackButton, ChiefView, ClubView, CountryView, Crumb,
  LevelHeader, PeopleView, UniversityView, WorldView,
} from './views.jsx'

/**
 * Organisation CITE — l'exploration publique : monde → pays → université →
 * club, puis le responsable ou la demande d'adhésion.
 *
 * L'écran précédent tenait 1 062 lignes et neuf vues dans un `useState`.
 * Le niveau où l'on se trouvait n'était donc ni partageable, ni atteignable
 * par le bouton « précédent » du navigateur : sur un parcours dont le but
 * EST d'envoyer un lien vers son club, c'était le défaut principal. La
 * position vit maintenant dans l'URL.
 */
export default function OrganisationCite({ navigate }) {
  const { user } = useAuth()
  const { notify } = useToast()
  const { tree, globalGovernance, loading, error, partiel, reload } = useCiteTree()
  const sel = useCiteSelection()
  const [envoi, setEnvoi] = useState(false)

  const pays = tree.find((c) => String(c.id) === String(sel.countryId)) || null
  const universite = pays?.universities.find((u) => String(u.id) === String(sel.universityId)) || null
  const club = universite?.clubs.find((c) => String(c.id) === String(sel.clubId)) || null

  /** Le responsable du club, ou rien. Aucun nom de repli. */
  const responsable = useMemo(() => {
    if (!club) return null
    const m = club.responsible
      || (club.responsibleId
        ? universite?.leaders.find((l) => Number(l.id) === Number(club.responsibleId))?.member
        : null)
    if (!m) return null
    return {
      name: [m.firstName ?? m.firstname, m.lastName ?? m.lastname].filter(Boolean).join(' ') || m.email,
      title: titreDe(m),
      member: m,
    }
  }, [club, universite])

  const filtre = (liste, ...champs) => {
    const q = sel.query.trim().toLowerCase()
    if (!q) return liste
    return liste.filter((x) => champs.some((f) => String(x[f] ?? '').toLowerCase().includes(q)))
  }

  const demanderAdhesion = async () => {
    if (envoi || !club) return
    setEnvoi(true)
    try {
      const res = await api.memberships.requestJoin(club.id, { id: user.id })
      if (!res?.success) throw new Error(res?.message)
      notify(`Demande envoyée au bureau de ${club.name}.`, 'success')
      sel.goClub(club.id)
    } catch (err) {
      // L'ancienne version utilisait alert() et annonçait « enregistrée dans
      // le prototype » — y compris quand le serveur avait refusé.
      notify(err?.serverMessage || err?.message || "La demande n'a pas pu être envoyée.", 'error')
    } finally {
      setEnvoi(false)
    }
  }

  const contenu = () => {
    if (sel.panel === 'gouvernance') {
      return (
        <PeopleView
          title="Gouvernance mondiale"
          subtitle="Les membres emblématiques de FIERI, tels qu'enregistrés dans l'annuaire."
          people={globalGovernance}
          onBack={sel.goWorld}
        />
      )
    }
    if (sel.panel === 'bureau' && pays) {
      return (
        <PeopleView
          title={`Bureau national — ${pays.name}`}
          subtitle="Les personnes qui détiennent un poste au niveau du pays."
          people={pays.bureau}
          onBack={() => sel.goCountry(pays.id)}
        />
      )
    }
    if (sel.panel === 'responsables' && universite) {
      return (
        <PeopleView
          title={`Responsables — ${universite.name}`}
          subtitle="Postes de gouvernance de l'université et responsables de club."
          people={universite.leaders}
          onBack={() => sel.goUniversity(universite.id)}
        />
      )
    }
    if (sel.panel === 'chef' && club) {
      return <ChiefView club={club} chief={responsable} onBack={() => sel.goClub(club.id)} />
    }
    if (sel.panel === 'adhesion' && club) {
      return (
        <div className="flex max-w-2xl flex-col gap-6">
          <BackButton onClick={() => sel.goClub(club.id)} label="Retour au club" />
          <LevelHeader icon={Users} title={`Rejoindre ${club.name}`} />
          {/* Le serveur ne prend que l'identifiant du club et déduit le membre
              du jeton : demander cinq champs qui ne partent nulle part — dont
              une lettre de motivation — était une perte de temps pour le
              candidat. */}
          {!user ? (
            <div className="chamfer-sm flex flex-col items-start gap-4 border border-border-strong bg-bg-secondary p-6">
              <p className="text-sm leading-relaxed text-text-secondary">
                Une demande d’adhésion est rattachée à votre compte FIERI.
                Connectez-vous, puis revenez sur cette page.
              </p>
              <button
                type="button"
                onClick={() => navigate?.('auth')}
                className="chamfer-sm inline-flex min-h-11 cursor-pointer items-center bg-engine px-5 text-sm font-bold text-on-accent transition-colors hover:bg-engine-deep"
              >
                Se connecter
              </button>
            </div>
          ) : (
            <div className="chamfer-sm flex flex-col items-start gap-4 border border-border-strong bg-bg-secondary p-6">
              <p className="text-sm leading-relaxed text-text-secondary">
                Votre demande partira au bureau de <strong className="text-text-primary">{club.name}</strong>{' '}
                au nom de <strong className="text-text-primary">{user.firstName} {user.lastName}</strong>.
                Le bureau l’accepte ou la refuse ; vous en serez informé.
              </p>
              <button
                type="button"
                onClick={demanderAdhesion}
                disabled={envoi}
                className="chamfer-sm inline-flex min-h-11 cursor-pointer items-center bg-engine px-5 text-sm font-bold text-on-accent transition-colors hover:bg-engine-deep disabled:cursor-not-allowed disabled:opacity-50"
              >
                {envoi ? 'Envoi…' : 'Envoyer ma demande'}
              </button>
            </div>
          )}
        </div>
      )
    }

    if (club) {
      return (
        <ClubView
          club={club}
          onChief={() => sel.goPanel('chef')}
          onJoin={() => sel.goPanel('adhesion')}
        />
      )
    }
    if (universite) {
      return (
        <UniversityView
          university={universite}
          clubs={filtre(universite.clubs, 'name', 'discipline')}
          query={sel.query}
          setQuery={sel.setQuery}
          onClub={sel.goClub}
          onLeaders={() => sel.goPanel('responsables')}
        />
      )
    }
    if (pays) {
      return (
        <CountryView
          country={pays}
          universities={filtre(pays.universities, 'name')}
          query={sel.query}
          setQuery={sel.setQuery}
          onUniversity={sel.goUniversity}
          onBureau={() => sel.goPanel('bureau')}
        />
      )
    }
    return (
      <WorldView
        countries={filtre(tree, 'name')}
        query={sel.query}
        setQuery={sel.setQuery}
        onCountry={sel.goCountry}
        onGovernance={() => sel.goPanel('gouvernance')}
      />
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-primary text-text-primary">
      <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="relative z-10 mx-auto w-full max-w-[92rem] px-4 py-10 md:px-12 md:py-14">
        <div className="flex flex-col gap-8">

          <header className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl lg:max-w-[45%]">
              <BackButton onClick={() => navigate?.('home')} label="Retour à l’accueil" />
              <p className="mt-5 inline-flex items-center gap-2 border border-engine bg-engine-wash px-4 py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-ember" aria-hidden="true" />
                <span className="text-xs font-extrabold uppercase tracking-widest">Parcours d’intégration FIERI</span>
              </p>
              <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
                Intégrer notre cité, de l’international jusqu’au club local.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary md:text-base">
                Choisissez un pays, explorez ses universités, trouvez un club et envoyez votre demande d’adhésion.
              </p>
            </div>
            <div className="relative lg:max-w-[48%]">
              <div className="chamfer-sm chamfer-shadow overflow-hidden border border-border-subtle">
                <img src={citeImage} alt="" className="aspect-[16/10] h-auto w-full object-cover" />
              </div>
            </div>
          </header>

          <nav aria-label="Position dans l’organisation" className="glass-panel chamfer-sm min-w-0 p-4">
            <p className="eyebrow mb-3">Position actuelle</p>
            <div className="flex flex-wrap items-center gap-2">
              <Crumb label="International" active={!pays} onClick={sel.goWorld} />
              {pays && <Crumb label={pays.name} active={!!pays && !universite} onClick={() => sel.goCountry(pays.id)} />}
              {universite && <Crumb label={universite.name} active={!!universite && !club} onClick={() => sel.goUniversity(universite.id)} />}
              {club && <Crumb label={club.name} active={!!club} onClick={() => sel.goClub(club.id)} />}
            </div>
          </nav>

          {/* Une partie des donnees a manque, mais l'arbre est la : on le dit,
              sans remplacer la page par un panneau d'erreur. */}
          {!loading && !error && partiel && (
            <p
              role="status"
              className="mb-6 border border-warning bg-warning-wash px-4 py-3 text-sm text-warning"
            >
              {partiel}{' '}
              <button
                type="button"
                onClick={reload}
                className="cursor-pointer font-bold underline underline-offset-2"
              >
                Réessayer
              </button>
            </p>
          )}

          {loading ? (
            <StatePanel state="loading" />
          ) : error ? (
            <StatePanel state="error" message={error} onRetry={reload} />
          ) : tree.length === 0 ? (
            <StatePanel
              state="empty"
              icon={GraduationCap}
              message="Aucun pays n’est encore enregistré dans l’organisation CITE."
            />
          ) : (
            contenu()
          )}
        </div>
      </div>
    </div>
  )
}
