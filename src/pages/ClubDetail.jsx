import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, GraduationCap, Check, LogIn } from 'lucide-react'
import { api } from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useAuthGate } from '../context/AuthGateContext.jsx'

export default function ClubDetail({ navigate, clubId }) {
  const { user } = useAuth()
  const { promptLogin } = useAuthGate()
  const [club, setClub] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState(null)

  const load = async () => {
    if (!clubId) { setError('Club introuvable.'); setIsLoading(false); return }
    try {
      setIsLoading(true)
      const res = await api.clubs.getById(clubId)
      if (res?.success && res.data) { setClub(res.data); setError(null) }
      else setError(res?.message || "Ce club n'est pas disponible.")
    } catch {
      setError('Erreur réseau lors du chargement du club.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [clubId])

  const handleJoinToggle = async () => {
    if (!user) { promptLogin('Connectez-vous pour rejoindre ce club.'); return }
    if (busy) return
    setBusy(true)
    try {
      const res = club.joined ? await api.clubs.leave(club.id) : await api.clubs.join(club.id)
      setToast(res?.message || (club.joined ? 'Vous avez quitté le club.' : 'Adhésion enregistrée.'))
      await load()
    } catch {
      setToast('Action impossible pour le moment.')
    } finally {
      setBusy(false)
      setTimeout(() => setToast(null), 3000)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-8 w-1/2 rounded-lg bg-bg-tertiary" />
          <div className="h-40 w-full rounded-2xl bg-bg-tertiary" />
        </div>
      </div>
    )
  }

  if (error || !club) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center flex flex-col items-center gap-4">
        <h1 className="text-xl font-extrabold text-text-primary">Club inaccessible</h1>
        <p className="text-sm text-text-secondary">{error}</p>
        <button onClick={() => navigate?.('clubs')} className="px-4 py-2 rounded-xl bg-accent-primary text-white text-xs font-bold">
          Retour aux clubs
        </button>
      </div>
    )
  }

  const accent = club.accent || '#1B6FD8'
  const members = Array.isArray(club.members) ? club.members : []

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-6">
      <button onClick={() => navigate?.('clubs')} className="flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors self-start">
        <ArrowLeft className="w-4 h-4" /> Retour aux clubs
      </button>

      {/* En-tête */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col gap-4" style={{ borderColor: `${accent}30` }}>
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${accent}1A`, border: `1px solid ${accent}40` }}>
            <Users className="w-7 h-7" style={{ color: accent }} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">{club.title || club.kicker}</h1>
            <div className="flex items-center gap-3 mt-1 text-xs text-text-muted flex-wrap">
              {club.discipline && <span className="inline-flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> {club.discipline}</span>}
              <span>{(club.membersCount ?? 0).toLocaleString('fr-FR')} membres</span>
              {club.responsible && (
                <span className="inline-flex items-center gap-1.5 font-bold" style={{ color: accent }}>
                  Responsable&nbsp;: {`${club.responsible.firstName ?? ''} ${club.responsible.lastName ?? ''}`.trim() || '—'}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleJoinToggle}
            disabled={busy}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 ${
              club.joined ? 'bg-bg-tertiary text-text-secondary border border-border-subtle' : 'bg-accent-primary text-white'
            }`}
          >
            {!user ? <span className="inline-flex items-center gap-1.5"><LogIn className="w-3.5 h-3.5" /> Se connecter</span>
              : club.joined ? 'Quitter' : 'Rejoindre'}
          </button>
        </div>
        {club.desc && <p className="text-sm text-text-secondary leading-relaxed">{club.desc}</p>}
      </div>

      {/* Divisions / axes */}
      {Array.isArray(club.divisions) && club.divisions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {club.divisions.map((d, i) => (
            <span key={i} className="text-[11px] font-bold px-3 py-1 rounded-full" style={{ background: `${accent}12`, color: accent, border: `1px solid ${accent}25` }}>{d}</span>
          ))}
        </div>
      )}

      {/* Membres */}
      <section className="glass-panel rounded-3xl p-6">
        <h2 className="text-base font-extrabold text-text-primary tracking-tight mb-4">Membres</h2>
        {members.length === 0 ? (
          <p className="text-xs text-text-muted">La liste des membres n'est pas encore disponible.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {members.map((m) => {
              const name = m.name || `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim() || 'Membre'
              return (
                <button
                  key={m.id}
                  onClick={() => navigate?.('profile', { researcherId: m.id })}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-bg-tertiary/50 border border-border-subtle hover:border-accent-primary/40 transition-all text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-accent-primary/15 border border-accent-primary/25 flex items-center justify-center shrink-0 text-xs font-bold text-text-primary uppercase">
                    {name[0]}
                  </div>
                  <span className="text-xs font-bold text-text-primary truncate">{name}</span>
                </button>
              )
            })}
          </div>
        )}
      </section>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl bg-bg-secondary border border-border-subtle shadow-xl text-xs font-bold text-text-primary">
          <Check className="w-4 h-4 text-emerald-500" /> {toast}
        </div>
      )}
    </motion.div>
  )
}
