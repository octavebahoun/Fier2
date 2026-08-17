import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'
import TopBar from './TopBar.jsx'
import Logo from '../Logo.jsx'
import CommandPalette from '../CommandPalette.jsx'

export default function AppLayout({
  children,
  currentPage,
  navigate,
  user,
  handleLogout,
  mobileMenuOpen,
  setMobileMenuOpen
}) {
  // ─── App-shell : dès qu'on est connecté, la navigation marketing (navbar) laisse
  // la place à un shell « back-office » : sidebar (nav principale) + topbar fine.
  const isAuthed = !!user
  const [collapsed, setCollapsed] = useState(false)   // sidebar repliée (desktop)
  const [mobileOpen, setMobileOpen] = useState(false) // tiroir sidebar (mobile)
  const mainRef = useRef(null)
  const shouldReduceMotion = useReducedMotion()

  // Referme le tiroir mobile à chaque navigation.
  useEffect(() => {
    const timer = window.setTimeout(() => setMobileOpen(false), 0)
    return () => window.clearTimeout(timer)
  }, [currentPage])

  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true })
  }, [currentPage])

  const showFooter = currentPage !== 'auth'
  // Décalage horizontal du contenu = largeur de la sidebar (uniquement connecté, ≥ md).
  const contentOffset = isAuthed ? (collapsed ? 'md:pl-[76px]' : 'md:pl-64') : ''
  // Marge haute du contenu : sous la topbar si connecté, sinon comportement marketing.
  const mainPadTop = isAuthed ? 'pt-16' : ((currentPage === 'home' || currentPage === 'auth') ? 'pt-0' : 'pt-20')

  // État de la newsletter — colocalisé ici (le formulaire ne vit que dans ce footer).
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false)
  const [newsletterError, setNewsletterError] = useState(null)

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()
    setNewsletterError(null)
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setNewsletterError('Veuillez entrer une adresse e-mail valide.')
      return
    }
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      setNewsletterSubscribed(true)
      setNewsletterEmail('')
      setTimeout(() => setNewsletterSubscribed(false), 4500)
    } catch {
      setNewsletterError("Erreur lors de l'inscription. Veuillez réessayer.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-bg-primary text-text-primary selection:bg-engine selection:text-white">
      {/* Lien d'évitement (a11y) : caché, apparaît au focus clavier pour sauter
          directement au contenu sans re-tabuler toute la navigation. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-3 focus:left-3 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-engine focus:text-white focus:font-bold focus:shadow-lg"
      >
        Aller au contenu principal
      </a>
      {/* Universal Command Palette */}
      <CommandPalette navigate={navigate} />
      {/* 1. Navigation : navbar marketing (déconnecté) OU shell sidebar+topbar (connecté) */}
      {isAuthed ? (
        <>
          <Sidebar
            currentPage={currentPage}
            navigate={navigate}
            user={user}
            handleLogout={handleLogout}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
          />
          <TopBar
            currentPage={currentPage}
            navigate={navigate}
            user={user}
            collapsed={collapsed}
            onOpenMobile={() => setMobileOpen(true)}
          />
        </>
      ) : (
        <Navbar
          currentPage={currentPage}
          navigate={navigate}
          user={user}
          handleLogout={handleLogout}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      )}

      {/* 2. Zone de contenu (décalée à droite de la sidebar quand connecté) */}
      <div
        className={`flex-grow flex flex-col transition-[padding] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${contentOffset}`}
      >
        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          className={`flex-grow ${mainPadTop} ${currentPage === 'auth' ? 'pb-0' : 'pb-16'} z-10 w-full`}
        >
          {/* Framer Motion Cross-Fade Transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* 4. Footer Area */}
        {showFooter && (
          <footer className="w-full bg-bg-primary border-t border-border-subtle z-10 py-14 relative shrink-0">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-10 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Column 1: Info and Brand */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2.5 select-none text-text-primary">
                    <Logo className="h-5" />
                  </div>
                  <p className="text-[13px] text-text-secondary leading-relaxed max-w-xs mt-2">
                    La plateforme officielle de FIERI Research : projets de recherche appliquée,
                    clubs scientifiques et opportunités R&D.
                  </p>

                  {/* Newsletter Form */}
                  <div className="mt-4 flex flex-col gap-2 max-w-xs text-left">
                    <label htmlFor="footer-newsletter-email" className="eyebrow">
                      Newsletter
                    </label>
                    {newsletterSubscribed ? (
                      <div className="text-[13px] text-ember bg-ember/10 border border-ember/25 p-2.5 rounded-lg font-medium" role="status" aria-live="polite">
                        ✓ Abonnement validé avec succès !
                      </div>
                    ) : (
                      <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <input
                            id="footer-newsletter-email"
                            name="newsletterEmail"
                            type="email"
                            required
                            autoComplete="email"
                            inputMode="email"
                            placeholder="vous@exemple.com"
                            value={newsletterEmail}
                            aria-invalid={!!newsletterError}
                            aria-describedby={newsletterError ? 'footer-newsletter-error' : undefined}
                            onChange={(e) => { setNewsletterEmail(e.target.value); if (newsletterError) setNewsletterError(null); }}
                            className={`bg-bg-secondary border ${newsletterError ? 'border-red-500/60' : 'border-border-subtle hover:border-border-strong focus:border-engine'} rounded-lg px-3 py-2 text-[13px] text-text-primary placeholder:text-text-muted transition-[border-color,background-color,box-shadow] flex-grow min-w-0`}
                          />
                          <button
                            type="submit"
                            className="min-h-11 min-w-11 bg-engine hover:bg-engine-deep text-white px-4 rounded-lg text-[13px] font-bold transition-colors cursor-pointer shrink-0"
                          >
                            OK
                          </button>
                        </div>
                        {newsletterError && (
                          <span id="footer-newsletter-error" className="text-xs text-red-400" role="alert">{newsletterError}</span>
                        )}
                      </form>
                    )}
                  </div>
                </div>

                {/* Column 2: Public Navigation Links */}
                <div className="flex flex-col gap-3">
                  <span className="eyebrow">Plateforme</span>
                  <ul className="flex flex-col gap-2">
                    <li><button onClick={() => navigate('home')} className="text-[13px] text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Accueil Général</button></li>
                    <li><button onClick={() => navigate('student-portal')} className="text-[13px] text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Portail Étudiant</button></li>
                    <li><button onClick={() => navigate('projects')} className="text-[13px] text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Projets & Brevets</button></li>
                    <li><button onClick={() => navigate('opportunities')} className="text-[13px] text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Annonces Recherche</button></li>
                  </ul>
                </div>

                {/* Column 3: Community and Academy */}
                <div className="flex flex-col gap-3">
                  <span className="eyebrow">Ressources</span>
                  <ul className="flex flex-col gap-2">
                    <li><button onClick={() => navigate('news')} className="text-[13px] text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Actualités</button></li>
                    <li><button onClick={() => navigate('workshops')} className="text-[13px] text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Ateliers & Formations</button></li>
                    <li><button onClick={() => navigate('events')} className="text-[13px] text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Événements</button></li>
                    <li><button onClick={() => navigate('clubs')} className="text-[13px] text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">CITE Scientifiques</button></li>
                  </ul>
                </div>

                {/* Column 4: Account and Support */}
                <div className="flex flex-col gap-3">
                  <span className="eyebrow">Espace privé</span>
                  <ul className="flex flex-col gap-2">
                    <li><button onClick={() => navigate(user ? 'dashboard' : 'auth')} className="text-[13px] text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">{user ? 'Mon Dashboard' : 'Se Connecter'}</button></li>
                    <li><button onClick={() => navigate('researchers')} className="text-[13px] text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Annuaire des Membres</button></li>
                    <li><button onClick={() => navigate('contact')} className="text-[13px] text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Aide & FAQ</button></li>
                  </ul>
                </div>
              </div>

              <hr className="border-border-subtle" />

              {/* Footer bottom */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-text-muted">
                  © {new Date().getFullYear()} FIERI Research. Tous droits réservés.
                </span>
                <div className="flex gap-4">
                  <span className="text-xs text-text-muted hover:text-text-secondary cursor-pointer transition-colors">Politique de Confidentialité</span>
                  <span className="text-xs text-text-muted">•</span>
                  <span className="text-xs text-text-muted hover:text-text-secondary cursor-pointer transition-colors">Charte Graphique v2</span>
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  )
}
