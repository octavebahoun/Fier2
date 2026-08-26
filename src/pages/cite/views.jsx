import {
  ArrowLeft, ArrowRight, Award, Building2, ChevronRight, Crown,
  GraduationCap, Globe2, Mail, Phone, Search, Users,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import StatePanel from '../../components/ui/StatePanel.jsx'

/* Les vues de l'exploration. Elles n'affichent que ce que le serveur fournit :
   un champ absent disparaît, il n'est jamais remplacé par une valeur écrite
   dans le source. */

export function Crumb({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex min-h-11 cursor-pointer items-center gap-1.5 border px-3 text-xs font-extrabold uppercase tracking-wider transition-colors ${
        active
          ? 'border-engine bg-engine-wash text-text-primary'
          : 'border-border-strong text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
      }`}
    >
      {label}
      <ChevronRight className="h-3 w-3" aria-hidden="true" />
    </button>
  )
}

export function SearchBox({ value, onChange, placeholder, id }) {
  return (
    <div className="relative w-full md:max-w-md">
      <label htmlFor={id} className="sr-only">{placeholder}</label>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-11 w-full border border-border-strong bg-bg-secondary pl-11 pr-4 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus-visible:border-engine"
      />
    </div>
  )
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="chamfer-sm border border-border-strong bg-bg-secondary p-4">
      <Icon className="mb-3 h-5 w-5 text-ember" aria-hidden="true" />
      <p className="font-display text-2xl font-extrabold">{value}</p>
      <p className="eyebrow mt-1">{label}</p>
    </div>
  )
}

export function LevelHeader({ icon: Icon, title, subtitle, metrics = [] }) {
  return (
    <div className="glass-panel chamfer p-6 md:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="mb-3 flex items-center gap-3">
            <span className="chamfer-sm flex h-9 w-9 shrink-0 items-center justify-center border border-ember bg-ember-wash">
              <Icon className="h-4 w-4 text-ember" aria-hidden="true" />
            </span>
            <h2 className="font-display text-2xl font-extrabold leading-tight md:text-4xl">{title}</h2>
          </div>
          {subtitle && <p className="text-sm leading-relaxed text-text-secondary md:text-base">{subtitle}</p>}
        </div>
        {metrics.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {metrics.map((m) => (
              <li key={m} className="border border-border-strong bg-bg-tertiary px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-text-secondary">
                {m}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function CardButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-panel chamfer-sm group cursor-pointer p-5 text-left transition-colors hover:bg-bg-tertiary"
    >
      {children}
    </button>
  )
}

export function WorldView({ countries, query, setQuery, onCountry, onGovernance }) {
  const universites = countries.reduce((n, c) => n + c.universities.length, 0)
  const clubs = countries.reduce((n, c) => n + c.universities.reduce((k, u) => k + u.clubs.length, 0), 0)

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Metric icon={Globe2} label="Pays" value={countries.length} />
        <Metric icon={GraduationCap} label="Universités" value={universites} />
        <Metric icon={Users} label="CITE ouvertes" value={clubs} />
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-extrabold">Choisissez votre pays</h2>
          <p className="mt-1 text-sm text-text-secondary">La première porte d’entrée dans la cité FIERI.</p>
        </div>
        <SearchBox id="recherche-pays" value={query} onChange={setQuery} placeholder="Rechercher un pays…" />
      </div>

      {countries.length === 0 ? (
        <StatePanel state="empty" icon={Globe2} message="Aucun pays ne correspond à cette recherche." />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {countries.map((pays) => (
            <CardButton key={pays.id} onClick={() => onCountry(pays.id)}>
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-xl font-extrabold">{pays.name}</h3>
                <ArrowRight className="h-4 w-4 shrink-0 text-text-muted transition-colors group-hover:text-ember" aria-hidden="true" />
              </div>
              <p className="mt-4 text-sm text-text-secondary">
                {pays.universities.length} université{pays.universities.length > 1 ? 's' : ''}
                {' · '}
                {pays.universities.reduce((n, u) => n + u.clubs.length, 0)} club
                {pays.universities.reduce((n, u) => n + u.clubs.length, 0) > 1 ? 's' : ''}
              </p>
            </CardButton>
          ))}
        </div>
      )}

      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={onGovernance}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 border border-ember bg-ember-wash px-6 text-xs font-extrabold uppercase tracking-widest text-text-primary transition-colors hover:bg-bg-tertiary"
        >
          <Crown className="h-4 w-4" aria-hidden="true" />
          Gouvernance mondiale
        </button>
      </div>
    </div>
  )
}

export function CountryView({ country, universities, query, setQuery, onUniversity, onBureau }) {
  return (
    <div className="flex flex-col gap-8">
      <LevelHeader
        icon={Building2}
        title={country.name}
        metrics={[
          `${country.universities.length} université${country.universities.length > 1 ? 's' : ''}`,
          `${country.bureau.length} au bureau national`,
        ]}
      />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="font-display text-2xl font-extrabold">Universités</h2>
        <SearchBox id="recherche-universite" value={query} onChange={setQuery} placeholder="Rechercher une université…" />
      </div>
      {universities.length === 0 ? (
        <StatePanel state="empty" icon={Building2} message="Aucune université ne correspond à cette recherche." />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {universities.map((u) => (
            <CardButton key={u.id} onClick={() => onUniversity(u.id)}>
              <Building2 className="h-6 w-6 text-ember" aria-hidden="true" />
              <h3 className="mt-4 font-display text-xl font-extrabold">{u.name}</h3>
              <div className="mt-5 flex items-center justify-between">
                <span className="eyebrow">{u.clubs.length} club{u.clubs.length > 1 ? 's' : ''}</span>
                <ArrowRight className="h-4 w-4 text-text-muted transition-colors group-hover:text-ember" aria-hidden="true" />
              </div>
            </CardButton>
          ))}
        </div>
      )}
      <FooterButton icon={Crown} label="Bureau national" onClick={onBureau} />
    </div>
  )
}

export function UniversityView({ university, clubs, query, setQuery, onClub, onLeaders }) {
  return (
    <div className="flex flex-col gap-8">
      <LevelHeader
        icon={GraduationCap}
        title={university.name}
        subtitle="Les clubs de recherche de cette université, et les personnes qui y exercent une responsabilité."
        metrics={[
          `${university.clubs.length} club${university.clubs.length > 1 ? 's' : ''}`,
          `${university.leaders.length} responsable${university.leaders.length > 1 ? 's' : ''}`,
        ]}
      />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="font-display text-2xl font-extrabold">CITE de l’université</h2>
        <SearchBox id="recherche-club" value={query} onChange={setQuery} placeholder="Rechercher un club…" />
      </div>
      {clubs.length === 0 ? (
        <StatePanel state="empty" icon={Award} message="Aucun club ne correspond à cette recherche." />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {clubs.map((club) => (
            <CardButton key={club.id} onClick={() => onClub(club.id)}>
              <Award className="h-6 w-6 text-ember" aria-hidden="true" />
              <h3 className="mt-4 font-display text-xl font-extrabold">{club.name}</h3>
              {club.discipline && <p className="mt-2 text-sm text-text-secondary">{club.discipline}</p>}
              {club.memberCount !== null && (
                <span className="mt-5 inline-block border border-engine bg-engine-wash px-3 py-1 text-xs font-extrabold uppercase tracking-wider">
                  {club.memberCount} membre{club.memberCount > 1 ? 's' : ''}
                </span>
              )}
            </CardButton>
          ))}
        </div>
      )}
      <FooterButton icon={Users} label="Responsables de l’université" onClick={onLeaders} />
    </div>
  )
}

export function ClubView({ club, onChief, onJoin }) {
  return (
    <div className="flex flex-col gap-7">
      <LevelHeader icon={Award} title={club.name} subtitle={club.discipline || undefined} />

      {club.description ? (
        <div className="chamfer-sm border border-border-strong bg-bg-secondary p-5">
          <h3 className="eyebrow mb-2">Le club</h3>
          <p className="text-sm leading-relaxed text-text-secondary">{club.description}</p>
        </div>
      ) : (
        <StatePanel state="empty" icon={Award} message="Ce club n’a pas encore rédigé sa présentation." />
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={onChief}
          className="chamfer-sm cursor-pointer border border-border-strong bg-bg-secondary p-5 text-left transition-colors hover:bg-bg-tertiary"
        >
          <Users className="mb-3 h-5 w-5 text-ember" aria-hidden="true" />
          <span className="block text-sm font-extrabold">Voir le responsable du club</span>
          <span className="mt-2 block text-sm text-text-secondary">Qui dirige ce club, et comment le joindre.</span>
        </button>
        <button
          type="button"
          onClick={onJoin}
          className="chamfer-sm chamfer-shadow cursor-pointer border border-transparent bg-engine p-5 text-left text-on-accent transition-colors hover:bg-engine-deep"
        >
          <ArrowRight className="mb-3 h-5 w-5" aria-hidden="true" />
          <span className="block text-sm font-extrabold">Demander à rejoindre le club</span>
          <span className="mt-2 block text-sm text-on-accent/80">Votre demande part au bureau du club.</span>
        </button>
      </div>
    </div>
  )
}

export function PeopleView({ title, subtitle, people, onBack }) {
  const { can } = useAuth()
  const canSeeContacts = can('directory:viewContacts')

  return (
    <div className="flex flex-col gap-6">
      <BackButton onClick={onBack} label="Retour" />
      <div>
        <h2 className="font-display text-2xl font-extrabold md:text-4xl">{title}</h2>
        {subtitle && <p className="mt-3 max-w-2xl text-sm text-text-secondary">{subtitle}</p>}
      </div>
      {people.length === 0 ? (
        <StatePanel
          state="empty"
          icon={Users}
          message="Aucune nomination enregistrée à ce niveau pour le moment."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {people.map((p) => (
            <article key={p.id} className="glass-panel chamfer-sm p-5">
              <span className="chamfer-sm mb-5 flex h-12 w-12 items-center justify-center border border-engine bg-engine-wash">
                <Users className="h-5 w-5 text-ember" aria-hidden="true" />
              </span>
              <h3 className="font-display text-lg font-extrabold">{p.name}</h3>
              <p className="eyebrow mt-1 text-ember">{p.title}</p>
              {p.bio && <p className="mt-4 text-sm text-text-secondary">{p.bio}</p>}
              {canSeeContacts && p.member?.email && (
                <p className="mt-4 break-words text-sm text-text-secondary">{p.member.email}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export function ChiefView({ club, chief, onBack }) {
  const { can } = useAuth()
  const canSeeContacts = can('directory:viewContacts')

  if (!chief) {
    return (
      <div className="flex flex-col gap-6">
        <BackButton onClick={onBack} label="Retour au club" />
        <StatePanel
          state="empty"
          icon={Users}
          message={`Aucun responsable n’est désigné pour ${club.name} à ce jour.`}
        />
      </div>
    )
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <BackButton onClick={onBack} label="Retour au club" />
      <article className="glass-panel chamfer-sm p-6">
        <span className="chamfer-sm mb-5 flex h-14 w-14 items-center justify-center border border-engine bg-engine-wash">
          <Users className="h-6 w-6 text-ember" aria-hidden="true" />
        </span>
        <h2 className="font-display text-2xl font-extrabold md:text-3xl">{chief.name}</h2>
        <p className="eyebrow mt-1 text-ember">{chief.title}</p>

        {/* Aucun numéro de repli : la version précédente affichait
            « +229 01 00 00 00 » quand le vrai était inconnu. */}
        {!canSeeContacts ? (
          <p className="mt-6 border border-border-strong bg-bg-tertiary p-4 text-sm text-text-secondary">
            Connectez-vous avec un compte FIERI pour voir les coordonnées.
          </p>
        ) : (
          <dl className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <ContactTile icon={Mail} label="E-mail" value={chief.member?.email} />
            <ContactTile icon={Phone} label="Téléphone" value={chief.member?.phone} />
          </dl>
        )}
      </article>
    </div>
  )
}

function ContactTile({ icon: Icon, label, value }) {
  return (
    <div className="chamfer-sm border border-border-strong bg-bg-primary p-4">
      <dt className="eyebrow flex items-center gap-2">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1.5 break-words text-sm font-semibold text-text-primary">
        {value || 'Non renseigné'}
      </dd>
    </div>
  )
}

export function BackButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 w-fit cursor-pointer items-center gap-2 text-sm font-semibold text-text-secondary transition-colors hover:text-text-primary"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  )
}

function FooterButton({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="chamfer-sm inline-flex min-h-11 w-fit cursor-pointer items-center gap-2 border border-border-strong bg-bg-secondary px-5 text-sm font-bold text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  )
}
