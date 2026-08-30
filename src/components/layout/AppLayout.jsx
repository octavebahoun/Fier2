import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Navbar from './Navbar.jsx'
import SiteHeader from './SiteHeader.jsx'
import Logo from '../Logo.jsx'
import CommandPalette from '../CommandPalette.jsx'
import { AppSidebar } from '../app-sidebar.jsx'
import { SidebarInset, SidebarProvider, useSidebar } from '../ui/sidebar.jsx'
import { TooltipProvider } from '../ui/tooltip.jsx'
import { ToastProvider } from '../ui/Toast.jsx'
import api from '../../services/api.js'
import NewsletterInvite from './NewsletterInvite.jsx'

// ─── Pages « vitrine » : elles gardent la navbar marketing + le footer MÊME
// connecté. Ce sont des pages pleine largeur avec leur propre mise en page
// (hero, sections full-bleed, écran de login) : les enfermer dans le shell
// applicatif donnerait une landing page encadrée par un tableau de bord.
const MARKETING_PAGES = new Set(['home', 'auth', 'programmes'])

// Referme le tiroir mobile de la sidebar à chaque navigation (le clic sur un
// lien dans le Sheet ne le fait pas fermer tout seul).
function AutoCloseMobileSidebar({ currentPage }) {
  const { setOpenMobile } = useSidebar()
  useEffect(() => {
    setOpenMobile(false)
  }, [currentPage, setOpenMobile])
  return null
}

export default function AppLayout({
  children,
  currentPage,
  navigate,
  user,
  handleLogout,
  mobileMenuOpen,
  setMobileMenuOpen
}) {
  // ─── App-shell : connecté, la navigation marketing (navbar) laisse la place à
  // un shell « back-office » (sidebar shadcn + site header) — sauf sur les pages
  // vitrine, qui restent en présentation publique.
  const isAuthed = !!user
  const useAppShell = isAuthed && !MARKETING_PAGES.has(currentPage)
  const mainRef = useRef(null)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true })
  }, [currentPage])

  // État de la newsletter — colocalisé ici (le formulaire ne vit que dans ce footer).
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false)
  const [newsletterError, setNewsletterError] = useState(null)

  const [newsletterSending, setNewsletterSending] = useState(false)

  /*
   * Ce formulaire ne faisait rien : il attendait 800 ms, annonçait « Abonnement
   * validé » et jetait l'adresse. Elle part maintenant vers le serveur, qui la
   * garde — et un échec se voit, au lieu d'être toujours un succès.
   */
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()
    setNewsletterError(null)
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setNewsletterError('Veuillez entrer une adresse e-mail valide.')
      return
    }
    setNewsletterSending(true)
    try {
      const res = await api.newsletter.subscribe(newsletterEmail.trim(), 'footer')
      if (!res?.success) throw new Error(res?.message)
      setNewsletterSubscribed(true)
      setNewsletterEmail('')
      setTimeout(() => setNewsletterSubscribed(false), 4500)
    } catch (err) {
      setNewsletterError(
        err?.serverMessage || err?.message || "L'abonnement n'a pas pu être enregistré.",
      )
    } finally {
      setNewsletterSending(false)
    }
  }

  const pageTransition = (
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
  )

  const skipLink = (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-3 focus:left-3 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-engine focus:text-on-accent focus:font-bold focus:shadow-lg"
    >
      Aller au contenu principal
    </a>
  )

  // ─── Espace connecté : sidebar repliable/tiroir (shadcn) + en-tête + contenu. ──
  if (useAppShell) {
    return (
      <ToastProvider>
      <TooltipProvider delayDuration={0}>
        <SidebarProvider>
          {skipLink}
          <CommandPalette navigate={navigate} />
          <AutoCloseMobileSidebar currentPage={currentPage} />
          <AppSidebar currentPage={currentPage} navigate={navigate} user={user} handleLogout={handleLogout} />
          <SidebarInset>
            <SiteHeader currentPage={currentPage} navigate={navigate} user={user} />
            <main
              id="main-content"
              ref={mainRef}
              tabIndex={-1}
              className="flex-1 p-4 md:p-6 w-full"
            >
              {pageTransition}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
      </ToastProvider>
    )
  }

  // ─── Marketing / public : navbar fixe + contenu pleine largeur + footer. ──
  const mainPadTop = (currentPage === 'home' || currentPage === 'auth') ? 'pt-0' : 'pt-20'
  const showFooter = currentPage !== 'auth'

  return (
    <ToastProvider>
    <div className="min-h-screen flex flex-col relative bg-bg-primary text-text-primary selection:bg-engine selection:text-on-accent">
      {skipLink}
      <CommandPalette navigate={navigate} />
      <NewsletterInvite user={user} />
      <Navbar
        currentPage={currentPage}
        navigate={navigate}
        user={user}
        handleLogout={handleLogout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="flex-grow flex flex-col">
        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          className={`flex-grow ${mainPadTop} ${currentPage === 'auth' ? 'pb-0' : 'pb-16'} z-10 w-full`}
        >
          {pageTransition}
        </main>

        {showFooter && (
          <footer className="w-full bg-bg-primary border-t border-border-subtle z-10 py-14 relative shrink-0">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-10 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Column 1: Info and Brand */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2.5 select-none text-text-primary">
                    <Logo className="h-5" />
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed max-w-xs mt-2">
                    La plateforme officielle de FIERI Research : projets de recherche appliquée,
                    clubs scientifiques et opportunités R&D.
                  </p>

                  {/* Newsletter Form */}
                  <div className="mt-4 flex flex-col gap-2 max-w-xs text-left">
                    <label htmlFor="footer-newsletter-email" className="eyebrow">
                      Newsletter
                    </label>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Une lettre par mois : les projets qui aboutissent, les appels à
                      participation et les prochaines formations. C’est le moyen le plus
                      simple de ne rien manquer quand on n’est pas encore membre.
                    </p>
                    {newsletterSubscribed ? (
                      <div className="text-sm text-ember bg-ember-wash border border-ember p-2.5 rounded-lg font-medium" role="status" aria-live="polite">
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
                            className={`bg-bg-secondary border ${newsletterError ? 'border-danger' : 'border-border-subtle hover:border-border-strong focus:border-engine'} rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-[border-color,background-color,box-shadow] flex-grow min-w-0`}
                          />
                          <button
                            type="submit"
                            disabled={newsletterSending}
                            className="min-h-11 min-w-11 bg-engine hover:bg-engine-deep text-on-accent px-4 rounded-lg text-sm font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                          >
                            {newsletterSending ? '…' : 'OK'}
                          </button>
                        </div>
                        {newsletterError && (
                          <span id="footer-newsletter-error" className="text-xs text-danger" role="alert">{newsletterError}</span>
                        )}
                      </form>
                    )}
                  </div>
                </div>

                {/* Column 2: Public Navigation Links */}
                <div className="flex flex-col gap-3">
                  <span className="eyebrow">Plateforme</span>
                  <ul className="flex flex-col gap-2">
                    <li><button onClick={() => navigate('home')} className="text-sm text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Accueil Général</button></li>
                    <li><button onClick={() => navigate('student-portal')} className="text-sm text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Portail Étudiant</button></li>
                    <li><button onClick={() => navigate('programmes')} className="text-sm text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Nos Programmes</button></li>
                    <li><button onClick={() => navigate('projects')} className="text-sm text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Projets & Brevets</button></li>
                    <li><button onClick={() => navigate('opportunities')} className="text-sm text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Annonces Recherche</button></li>
                  </ul>
                </div>

                {/* Column 3: Community and Academy */}
                <div className="flex flex-col gap-3">
                  <span className="eyebrow">Ressources</span>
                  <ul className="flex flex-col gap-2">
                    <li><button onClick={() => navigate('news')} className="text-sm text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Actualités</button></li>
                    <li><button onClick={() => navigate('workshops')} className="text-sm text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Ateliers & Formations</button></li>
                    <li><button onClick={() => navigate('events')} className="text-sm text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Événements</button></li>
                    <li><button onClick={() => navigate('clubs')} className="text-sm text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">CITE Scientifiques</button></li>
                  </ul>
                </div>

                {/* Column 4: Account and Support */}
                <div className="flex flex-col gap-3">
                  <span className="eyebrow">Espace privé</span>
                  <ul className="flex flex-col gap-2">
                    <li><button onClick={() => navigate(user ? 'dashboard' : 'auth')} className="text-sm text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">{user ? 'Mon Dashboard' : 'Se Connecter'}</button></li>
                    <li><button onClick={() => navigate('researchers')} className="text-sm text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Annuaire des Membres</button></li>
                    <li><button onClick={() => navigate('contact')} className="text-sm text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Aide & FAQ</button></li>
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
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
    </ToastProvider>
  )
}
