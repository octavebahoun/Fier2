import { ChevronDown } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import SectionCard from '../../components/ui/SectionCard.jsx'
import { Building2 } from 'lucide-react'
import { champ, etiquette } from '../espace-cite/shared.jsx'

/**
 * Écran de choix d'université, montré uniquement à qui n'en administre pas une
 * en propre — c'est-à-dire l'ADMIN global. Un chef universitaire ne le voit
 * jamais : son université est connue.
 */
export default function UniversitySelector({ scope, titre }) {
  const { countries, countryId, setCountryId, universities, setUniversityId, error } = scope

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <PageHeader
        tag="Gouvernance"
        icon={Building2}
        title={titre}
        description="Votre compte n’est rattaché à aucune université. Choisissez celle que vous souhaitez administrer."
      />

      <SectionCard icon={Building2} title="Périmètre" subtitle="Pays, puis université">
        <div className="flex flex-col gap-4">
          {error && (
            <p className="border border-red-500 bg-red-500/12 px-3 py-2 text-sm text-red-300" role="alert">
              {error}
            </p>
          )}

          <div>
            <label className={etiquette} htmlFor="scope-pays">Pays</label>
            <div className="relative">
              <select
                id="scope-pays"
                value={countryId}
                onChange={(e) => setCountryId(e.target.value)}
                className={`${champ} cursor-pointer pr-9`}
              >
                <option value="">Choisir un pays…</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>{c.name || c.nom || c.id}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
            </div>
          </div>

          <div>
            <label className={etiquette} htmlFor="scope-universite">Université</label>
            <div className="relative">
              <select
                id="scope-universite"
                disabled={!universities.length}
                onChange={(e) => setUniversityId(e.target.value)}
                defaultValue=""
                className={`${champ} cursor-pointer pr-9 disabled:opacity-50`}
              >
                <option value="">
                  {countryId ? 'Choisir une université…' : 'Choisissez d’abord un pays'}
                </option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>{u.name || u.nom || u.id}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
