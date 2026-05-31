// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle,
  HelpCircle,
  MapPin
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api.js'


// ─────────────────────────── Toast Component ───────────────────────────
function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md"
      role="alert"
      aria-live="polite"
    >
      <CheckCircle className="w-5 h-5 shrink-0" />
      <span className="text-sm font-bold">{message}</span>
    </motion.div>
  )
}

// ─────────────────────────── FAQ Data ───────────────────────────
const FAQ_ITEMS = [
  {
    id: 'faq-1',
    question: 'Comment rejoindre un club de recherche FIERI ?',
    answer: 'Rendez-vous sur la page Clubs Scientifiques, sélectionnez le club qui correspond à votre domaine et cliquez sur "Rejoindre le pôle". Votre candidature sera automatiquement validée si vous êtes membre connecté.'
  },
  {
    id: 'faq-2',
    question: 'Comment soumettre un projet de recherche ?',
    answer: 'La soumission de projets est réservée aux chercheurs inscrits (rôle CHERCHEUR). Connectez-vous, naviguez vers votre profil et utilisez le bouton "Proposer un projet R&D". Le comité de lecture valide sous 15 jours ouvrés.'
  },
  {
    id: 'faq-3',
    question: 'Comment accéder aux formations et ateliers ?',
    answer: 'Les ateliers sont accessibles via la page Formations. L\'inscription est ouverte à tous les membres connectés. Les places étant limitées, nous vous conseillons de vous inscrire rapidement dès l\'annonce.'
  },
  {
    id: 'faq-4',
    question: 'Puis-je participer sans être étudiant ou chercheur ?',
    answer: 'Absolument ! FIERI accueille toute personne passionnée par la recherche scientifique et l\'innovation technologique. Créez un compte Membre pour accéder aux actualités, événements et à l\'annuaire communautaire.'
  },
  {
    id: 'faq-5',
    question: 'Combien de temps faut-il pour obtenir une réponse de l\'équipe de support ?',
    answer: 'Notre équipe répond généralement dans les 24 à 48 heures ouvrées. Pour les demandes urgentes, nous vous recommandons de préciser la nature de l\'urgence dans le champ Sujet de votre message.'
  }
]

// ─────────────────────────── FAQ Item Component ───────────────────────────
function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div className="border border-border-subtle rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${item.id}`}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/3 transition-colors cursor-pointer"
      >
        <span className="text-sm font-bold text-text-primary pr-4">{item.question}</span>
        {isOpen
          ? <ChevronUp className="w-4 h-4 text-fieri-blue shrink-0" />
          : <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />
        }
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-answer-${item.id}`}
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-xs text-text-secondary leading-relaxed">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────── Main Contact Page ───────────────────────────
// eslint-disable-next-line no-unused-vars
export default function Contact({ navigate }) {
  const { user } = useAuth()

  const [openFaq, setOpenFaq] = useState(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState(null)
  const [errors, setErrors] = useState({})

  const messageRef = useRef(null)

  const nameValue = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : form.name
  const emailValue = user ? (user.email || '') : form.email

  // Auto-focus le champ Message si l'utilisateur est déjà connecté
  useEffect(() => {
    if (user && messageRef.current) {
      const timer = setTimeout(() => messageRef.current?.focus(), 120)
      return () => clearTimeout(timer)
    }
  }, [user])

  const validate = () => {
    const errs = {}
    if (!nameValue.trim()) errs.name = 'Le nom est requis.'
    if (!emailValue.trim() || !emailValue.includes('@')) errs.email = 'Une adresse e-mail valide est requise.'
    if (!form.subject.trim()) errs.subject = 'Veuillez renseigner un sujet.'
    if (!form.message.trim() || form.message.trim().length < 20) errs.message = 'Le message doit contenir au moins 20 caractères.'
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSending(true)
    const payload = {
      name: nameValue,
      email: emailValue,
      subject: form.subject,
      message: form.message
    }
    try {
      await api.contact.sendMessage(payload)
      setToast('Message envoyé ! Notre équipe vous répond sous 48h.')
      setForm(prev => ({ ...prev, subject: '', message: '' }))
    } catch {
      setToast('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setSending(false)
    }
  }


  return (
    <div className="max-w-[88rem] mx-auto w-full py-24 px-6 md:px-12 lg:px-24 relative">
      {/* Toast de confirmation */}
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* En-tête */}
      <div className="flex flex-col gap-3 mb-16 max-w-2xl">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-xl bg-fieri-blue/10 border border-fieri-blue/20 text-fieri-blue">
            <MessageCircle className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-black tracking-[0.25em] uppercase text-fieri-blue">
            SUPPORT & AIDE
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight">
          Comment pouvons-nous<br />
          <span className="text-gradient-blue">vous aider ?</span>
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed max-w-xl">
          Consultez notre FAQ ou envoyez-nous un message. Notre équipe s'engage à vous répondre dans les 48 heures ouvrées.
        </p>
      </div>

      {/* Bento Grid : FAQ + Formulaire */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* ── Colonne Gauche : FAQ ── */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-4 h-4 text-text-muted" />
            <h2 className="text-xs font-black uppercase tracking-widest text-text-muted">Questions fréquentes</h2>
          </div>
          {FAQ_ITEMS.map(item => (
            <FAQItem
              key={item.id}
              item={item}
              isOpen={openFaq === item.id}
              onToggle={() => setOpenFaq(prev => prev === item.id ? null : item.id)}
            />
          ))}

          {/* Infos de contact directes */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-panel border border-border-subtle p-5 rounded-2xl flex items-start gap-3">
              <div className="p-2 rounded-lg bg-fieri-blue/10 border border-fieri-blue/20 text-fieri-blue shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Email</p>
                <p className="text-xs font-bold text-text-primary mt-0.5">contact@fieri.research</p>
              </div>
            </div>
            <div className="glass-panel border border-border-subtle p-5 rounded-2xl flex items-start gap-3">
              <div className="p-2 rounded-lg bg-fieri-orange/10 border border-fieri-orange/20 text-fieri-bleue shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Localisation</p>
                <p className="text-xs font-bold text-text-primary mt-0.5">Abomey-Calavi, Bénin</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Colonne Droite : Formulaire ── */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            noValidate
            aria-label="Formulaire de contact"
            className="glass-panel border border-border-subtle rounded-3xl p-8 flex flex-col gap-5 sticky top-24"
          >
            <div className="flex items-center gap-2 mb-2">
              <Send className="w-4 h-4 text-fieri-blue" />
              <h2 className="text-xs font-black uppercase tracking-widest text-text-primary">Envoyer un message</h2>
            </div>

            {/* Champ Nom */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="contact-name" className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                Nom complet
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                value={nameValue}
                onChange={handleChange}
                readOnly={!!user}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'error-name' : undefined}
                placeholder="Jean Dupont"
                className={`bg-bg-primary/60 border rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted transition-all focus:outline-none ${
                  user
                    ? 'border-border-subtle text-text-secondary cursor-not-allowed opacity-70'
                    : errors.name
                    ? 'border-red-500/50 focus:border-red-500'
                    : 'border-border-subtle hover:border-accent-primary/30 focus:border-accent-primary'
                }`}
              />
              {errors.name && (
                <span id="error-name" role="alert" className="text-[10px] text-red-400">{errors.name}</span>
              )}
            </div>

            {/* Champ Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="contact-email" className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                Adresse e-mail
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                value={emailValue}
                onChange={handleChange}
                readOnly={!!user}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'error-email' : undefined}
                placeholder="vous@universite.edu"
                className={`bg-bg-primary/60 border rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted transition-all focus:outline-none ${
                  user
                    ? 'border-border-subtle text-text-secondary cursor-not-allowed opacity-70'
                    : errors.email
                    ? 'border-red-500/50 focus:border-red-500'
                    : 'border-border-subtle hover:border-accent-primary/30 focus:border-accent-primary'
                }`}
              />
              {errors.email && (
                <span id="error-email" role="alert" className="text-[10px] text-red-400">{errors.email}</span>
              )}
            </div>

            {/* Champ Sujet */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="contact-subject" className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                Sujet
              </label>
              <input
                id="contact-subject"
                name="subject"
                type="text"
                value={form.subject}
                onChange={handleChange}
                aria-invalid={!!errors.subject}
                aria-describedby={errors.subject ? 'error-subject' : undefined}
                placeholder="Demande d'information — Rejoindre un club"
                className={`bg-bg-primary/60 border rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted transition-all focus:outline-none ${
                  errors.subject
                    ? 'border-red-500/50 focus:border-red-500'
                    : 'border-border-subtle hover:border-accent-primary/30 focus:border-accent-primary'
                }`}
              />
              {errors.subject && (
                <span id="error-subject" role="alert" className="text-[10px] text-red-400">{errors.subject}</span>
              )}
            </div>

            {/* Champ Message */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="contact-message" className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                ref={messageRef}
                value={form.message}
                onChange={handleChange}
                rows={5}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? 'error-message' : undefined}
                placeholder="Décrivez votre demande en détail..."
                className={`bg-bg-primary/60 border rounded-xl px-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted transition-all focus:outline-none resize-none leading-relaxed ${
                  errors.message
                    ? 'border-red-500/50 focus:border-red-500'
                    : 'border-border-subtle hover:border-accent-primary/30 focus:border-accent-primary'
                }`}
              />
              {errors.message && (
                <span id="error-message" role="alert" className="text-[10px] text-red-400">{errors.message}</span>
              )}
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={sending}
              className="mt-1 w-full py-3 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white text-xs font-black uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-accent-primary/20"
            >
              {sending ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Envoi en cours…
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Envoyer le message
                </>
              )}
            </button>

            {/* Indicateur de sécurité */}
            <p className="text-[9.5px] text-text-muted text-center">
              Vos données sont protégées et ne seront jamais partagées.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
