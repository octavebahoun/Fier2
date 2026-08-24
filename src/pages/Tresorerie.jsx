import { useCallback, useEffect, useState } from 'react'
import { Wallet, PlusCircle, Loader2, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import api from '../services/api.js'
import PageHeader from '../components/ui/PageHeader.jsx'
import SectionCard from '../components/ui/SectionCard.jsx'
import StatePanel from '../components/ui/StatePanel.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { champ, etiquette, boutonPrimaire, formatDateFr } from './espace-cite/shared.jsx'

const fcfa = (n) => `${Number(n || 0).toLocaleString('fr-FR')} FCFA`

/**
 * Trésorerie — le grand livre de l'université.
 *
 * Cet écran était la moitié basse d'une page publique de collecte de dons :
 * un donateur extérieur et un trésorier partageaient la même URL, l'un voyant
 * un formulaire de mécénat, l'autre un registre comptable. Deux publics, deux
 * écrans (constat F08).
 *
 * Lire et écrire restent deux droits : le chef universitaire consulte, seul le
 * trésorier enregistre.
 */
export default function Tresorerie() {
  const { notify } = useToast()
  const { can, universityId } = useAuth()
  const canRecord = can('treasury:write', { universityId })

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({ type: 'DON', amount: '', label: '' })
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (!universityId) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const res = await api.treasury.getTreasury(Number(universityId))
      if (!res?.success) throw new Error(res?.message)
      setData(res.data)
    } catch (err) {
      setData(null)
      setError(err?.serverMessage || err?.message || "La trésorerie n'a pas pu être chargée.")
    } finally {
      setLoading(false)
    }
  }, [universityId])

  useEffect(() => { load() }, [load])

  const enregistrer = async (e) => {
    e.preventDefault()
    if (busy) return
    const montant = Number(form.amount)
    if (!montant) return notify('Indiquez un montant différent de zéro.', 'warning')
    if (!form.label.trim()) return notify('Un libellé est nécessaire pour retrouver l’opération.', 'warning')
    setBusy(true)
    try {
      // L'interface parle de dépense ; le backend attend « DEPENSE ».
      const res = await api.treasury.recordTransaction(Number(universityId), {
        type: form.type === 'EXPENSE' ? 'DEPENSE' : 'DON',
        amount: montant,
        label: form.label.trim(),
      })
      if (!res?.success) throw new Error(res?.message)
      notify(`Opération « ${form.label.trim()} » enregistrée.`, 'success')
      setForm({ type: 'DON', amount: '', label: '' })
      await load()
    } catch (err) {
      notify(err?.serverMessage || err?.message || "L'opération n'a pas pu être enregistrée.", 'error')
    } finally {
      setBusy(false)
    }
  }

  const estDepense = (t) => t.type === 'DEPENSE' || t.type === 'EXPENSE'
  const transactions = data?.transactions || []

  if (!universityId) {
    return (
      <div className="mx-auto w-full max-w-xl">
        <PageHeader
          tag="Gouvernance"
          icon={Wallet}
          title="Trésorerie"
          description="Votre compte n’est rattaché à aucune université : il n’y a pas de trésorerie à afficher."
        />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        tag="Gouvernance"
        icon={Wallet}
        title="Trésorerie"
        description="Solde, entrées et dépenses de votre université."
      />

      {loading ? (
        <StatePanel state="loading" />
      ) : error ? (
        <StatePanel state="error" message={error} onRetry={load} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-px border border-border-strong bg-border-strong sm:grid-cols-3">
            {[
              { label: 'Solde', value: data?.balance, accent: 'text-text-primary' },
              { label: 'Entrées', value: data?.totalIn, accent: 'text-emerald-400' },
              { label: 'Dépenses', value: data?.totalOut, accent: 'text-ember' },
            ].map((tuile) => (
              <div key={tuile.label} className="bg-bg-secondary px-5 py-4">
                <p className="text-sm font-semibold text-text-secondary">{tuile.label}</p>
                <p className={`mt-1 font-display text-2xl font-extrabold tabular-nums ${tuile.accent}`}>
                  {fcfa(tuile.value)}
                </p>
              </div>
            ))}
          </div>

          <div className={`grid grid-cols-1 gap-6 ${canRecord ? 'lg:grid-cols-[20rem_1fr]' : ''}`}>
            {canRecord && (
              <SectionCard icon={PlusCircle} title="Enregistrer une opération" subtitle="Entrée ou dépense">
                <form onSubmit={enregistrer} className="flex flex-col gap-4">
                  <div>
                    <label className={etiquette} htmlFor="tresorerie-type">Nature</label>
                    <select
                      id="tresorerie-type"
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className={`${champ} cursor-pointer`}
                    >
                      <option value="DON">Entrée (don, subvention)</option>
                      <option value="EXPENSE">Dépense</option>
                    </select>
                  </div>
                  <div>
                    <label className={etiquette} htmlFor="tresorerie-montant">Montant</label>
                    <input
                      id="tresorerie-montant"
                      type="number"
                      inputMode="numeric"
                      min="1"
                      required
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      placeholder="50000"
                      className={`${champ} tabular-nums`}
                    />
                    <p className="mt-1 text-sm text-text-muted">En FCFA.</p>
                  </div>
                  <div>
                    <label className={etiquette} htmlFor="tresorerie-libelle">Libellé</label>
                    <input
                      id="tresorerie-libelle"
                      type="text"
                      required
                      value={form.label}
                      onChange={(e) => setForm({ ...form, label: e.target.value })}
                      placeholder="Ex : achat de composants robotique"
                      className={champ}
                    />
                  </div>
                  <button type="submit" disabled={busy} className={boutonPrimaire}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <PlusCircle className="h-4 w-4" aria-hidden="true" />}
                    {busy ? 'Enregistrement…' : 'Enregistrer'}
                  </button>
                </form>
              </SectionCard>
            )}

            <SectionCard
              icon={Wallet}
              title="Grand livre"
              subtitle={transactions.length ? `${transactions.length} opération${transactions.length > 1 ? 's' : ''}` : undefined}
              accent="var(--color-ember)"
            >
              {transactions.length === 0 ? (
                <StatePanel
                  state="empty"
                  icon={Wallet}
                  message="Aucune opération enregistrée. Les dons reçus et les dépenses apparaîtront ici."
                />
              ) : (
                <div className="max-h-[32rem] overflow-auto">
                  <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
                    <thead className="sticky top-0 bg-bg-secondary">
                      <tr className="border-b border-border-strong text-text-secondary">
                        <th scope="col" className="px-3 py-2.5 font-semibold">Libellé</th>
                        <th scope="col" className="px-3 py-2.5 font-semibold">Date</th>
                        <th scope="col" className="px-3 py-2.5 text-right font-semibold">Montant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => {
                        const depense = estDepense(t)
                        const Fleche = depense ? ArrowDownRight : ArrowUpRight
                        return (
                          <tr key={t.id} className="border-b border-border-subtle last:border-0">
                            <td className="px-3 py-2.5">
                              <span className="flex items-center gap-2 font-medium text-text-primary">
                                <Fleche
                                  className={`h-4 w-4 shrink-0 ${depense ? 'text-ember' : 'text-emerald-400'}`}
                                  aria-hidden="true"
                                />
                                {t.label}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-text-secondary">{formatDateFr(t.createdAt)}</td>
                            <td className={`px-3 py-2.5 text-right font-mono font-semibold tabular-nums ${depense ? 'text-ember' : 'text-emerald-400'}`}>
                              {/* Le signe porte l'information autant que la couleur. */}
                              {depense ? '−' : '+'}{fcfa(Math.abs(t.amount))}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          </div>
        </>
      )}
    </div>
  )
}
