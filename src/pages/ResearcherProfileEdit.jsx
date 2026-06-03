// eslint-disable-next-line no-unused-vars
import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, CheckCircle, Save } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../services/api.js'

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())
}

function isValidHttpUrl(url) {
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export function validateResearcherProfileEdit(values) {
  const errors = {}

  const email = String(values.email || '').trim()
  if (!email) errors.email = 'Email requis.'
  else if (!isValidEmail(email)) errors.email = 'Email invalide.'

  const portfolioUrl = String(values.portfolioUrl || '').trim()
  if (portfolioUrl && !isValidHttpUrl(portfolioUrl)) {
    errors.portfolioUrl = 'Lien invalide (http/https requis).'
  }

  const cvUrl = String(values.cvUrl || '').trim()
  if (cvUrl && !isValidHttpUrl(cvUrl)) {
    errors.cvUrl = 'Lien invalide (http/https requis).'
  }

  const bio = String(values.bio || '')
  if (bio.length > 1200) errors.bio = 'Bio trop longue (1200 caractères max).'

  return errors
}

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgClass =
    type === 'success'
      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md border ${bgClass}`}
      role="alert"
      aria-live="polite"
    >
      <CheckCircle className="w-5 h-5 shrink-0" />
      <span className="text-sm font-bold">{message}</span>
    </motion.div>
  )
}

export default function ResearcherProfileEdit({ navigate }) {
  const { user, hasMinRole } = useAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const [values, setValues] = useState({
    name: '',
    email: '',
    university: '',
    role: '',
    bio: '',
    specialties: '',
    portfolioUrl: '',
    cvUrl: ''
  })
  const [errors, setErrors] = useState({})

  const canEdit = useMemo(() => {
    if (!user) return false
    if (typeof hasMinRole === 'function') return hasMinRole('CHERCHEUR')
    return true
  }, [user, hasMinRole])

  useEffect(() => {
    if (!user) {
      navigate?.('auth')
      return
    }
    if (!canEdit) {
      setIsLoading(false)
      setToast({ type: 'error', message: 'Accès réservé aux chercheurs.' })
      navigate?.('dashboard')
      return
    }

    let active = true
    const load = async () => {
      try {
        setIsLoading(true)
        const res = await api.researchers.getMe()
        if (!active) return
        if (res?.success && res.data) {
          const me = res.data
          setValues((prev) => ({
            ...prev,
            name: me.name || prev.name,
            email: me.email || user.email || prev.email,
            university: me.university || prev.university,
            role: me.role || user.role || prev.role,
            bio: me.bio || prev.bio,
            specialties: Array.isArray(me.specialties) ? me.specialties.join(', ') : (me.specialties || prev.specialties),
            portfolioUrl: me.portfolioUrl || prev.portfolioUrl,
            cvUrl: me.cvUrl || prev.cvUrl
          }))
        } else {
          setToast({ type: 'error', message: res?.message || 'Impossible de charger votre profil.' })
        }
      } catch (e) {
        console.error(e)
        if (active) setToast({ type: 'error', message: 'Erreur réseau lors du chargement du profil.' })
      } finally {
        if (active) setIsLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [user, canEdit, navigate])

  const setField = (field) => (e) => {
    const next = e?.target?.value
    setValues((v) => ({ ...v, [field]: next }))
    setErrors((prev) => {
      if (!prev[field]) return prev
      const copy = { ...prev }
      delete copy[field]
      return copy
    })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (isSaving) return

    const nextErrors = validateResearcherProfileEdit(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setIsSaving(true)
    try {
      const payload = {
        name: String(values.name || '').trim(),
        email: String(values.email || '').trim(),
        university: String(values.university || '').trim(),
        role: String(values.role || '').trim(),
        bio: String(values.bio || ''),
        specialties: String(values.specialties || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        portfolioUrl: String(values.portfolioUrl || '').trim(),
        cvUrl: String(values.cvUrl || '').trim()
      }

      const res = await api.researchers.updateMe(payload)
      if (res?.success) {
        setToast({ type: 'success', message: 'Profil mis à jour.' })
      } else {
        setToast({ type: 'error', message: res?.message || 'Erreur lors de la mise à jour du profil.' })
      }
    } catch (err) {
      console.error(err)
      setToast({ type: 'error', message: 'Une erreur réseau est survenue.' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-12 py-10">
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          type="button"
          onClick={() => navigate?.('dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-subtle bg-bg-secondary hover:bg-white/5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-bold">Retour</span>
        </button>

        <h1 className="text-xl md:text-2xl font-extrabold">Modifier mon profil</h1>
        <div className="w-24" />
      </div>

      <div className="bg-bg-secondary border border-border-subtle rounded-xl p-6">
        {isLoading ? (
          <div className="text-text-secondary">Chargement…</div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold" htmlFor="rpe-name">Nom complet</label>
                <input
                  id="rpe-name"
                  type="text"
                  value={values.name}
                  onChange={setField('name')}
                  className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-border-subtle"
                  placeholder="Votre nom"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold" htmlFor="rpe-email">Email</label>
                <input
                  id="rpe-email"
                  type="email"
                  value={values.email}
                  onChange={setField('email')}
                  className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-border-subtle"
                  placeholder="vous@exemple.com"
                  autoComplete="email"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'rpe-email-error' : undefined}
                  required
                />
                {errors.email ? (
                  <div id="rpe-email-error" className="text-sm text-rose-400 font-bold">
                    {errors.email}
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold" htmlFor="rpe-university">Université</label>
                <input
                  id="rpe-university"
                  type="text"
                  value={values.university}
                  onChange={setField('university')}
                  className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-border-subtle"
                  placeholder="Votre établissement"
                  autoComplete="organization"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold" htmlFor="rpe-role">Rôle</label>
                <input
                  id="rpe-role"
                  type="text"
                  value={values.role}
                  onChange={setField('role')}
                  className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-border-subtle"
                  placeholder="Votre rôle"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold" htmlFor="rpe-specialties">Spécialités (séparées par des virgules)</label>
              <input
                id="rpe-specialties"
                type="text"
                value={values.specialties}
                onChange={setField('specialties')}
                className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-border-subtle"
                placeholder="Robotique, IoT, Vision…"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold" htmlFor="rpe-bio">Bio</label>
              <textarea
                id="rpe-bio"
                value={values.bio}
                onChange={setField('bio')}
                className="w-full min-h-[140px] px-4 py-3 rounded-lg bg-bg-primary border border-border-subtle"
                placeholder="Présentez brièvement vos travaux, thématiques et objectifs…"
              />
              {errors.bio ? (
                <div className="text-sm text-rose-400 font-bold">{errors.bio}</div>
              ) : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold" htmlFor="rpe-portfolio">Portfolio (URL)</label>
                <input
                  id="rpe-portfolio"
                  type="url"
                  value={values.portfolioUrl}
                  onChange={setField('portfolioUrl')}
                  className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-border-subtle"
                  placeholder="https://…"
                  aria-invalid={errors.portfolioUrl ? 'true' : 'false'}
                />
                {errors.portfolioUrl ? (
                  <div className="text-sm text-rose-400 font-bold">{errors.portfolioUrl}</div>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold" htmlFor="rpe-cv">CV (URL)</label>
                <input
                  id="rpe-cv"
                  type="url"
                  value={values.cvUrl}
                  onChange={setField('cvUrl')}
                  className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-border-subtle"
                  placeholder="https://…"
                  aria-invalid={errors.cvUrl ? 'true' : 'false'}
                />
                {errors.cvUrl ? (
                  <div className="text-sm text-rose-400 font-bold">{errors.cvUrl}</div>
                ) : null}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white/10 hover:bg-white/15 border border-border-subtle font-extrabold disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Enregistrement…' : 'Enregistrer'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      <AnimatePresence>
        {toast ? (
          <Toast
            key={toast.message}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}
