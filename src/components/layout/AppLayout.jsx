import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'
import PerspectiveGrid from '../PerspectiveGrid.jsx'
import Logo from '../Logo.jsx'
import CommandPalette from '../CommandPalette.jsx'

export default function AppLayout({
  children,
  currentPage,
  navigate,
  theme,
  toggleTheme,
  user,
  handleLogout,
  isScrolled,
  isNavExpanded,
  setIsNavExpanded,
  mobileMenuOpen,
  setMobileMenuOpen,
  newsletterEmail,
  setNewsletterEmail,
  newsletterSubscribed,
  handleNewsletterSubmit
}) {
  const showSidebar = !!user
  const showFooter = currentPage !== 'auth'

  return (
    <div className="min-h-screen flex flex-col relative bg-bg-primary text-text-primary selection:bg-accent-bleue selection:text-white">
      {/* Universal Command Palette */}
      <CommandPalette navigate={navigate} theme={theme} toggleTheme={toggleTheme} />
      {/* 1. Navigation Shell */}
      <Navbar
        currentPage={currentPage}
        navigate={navigate}
        theme={theme}
        toggleTheme={toggleTheme}
        user={user}
        handleLogout={handleLogout}
        isScrolled={isScrolled}
        isNavExpanded={isNavExpanded}
        setIsNavExpanded={setIsNavExpanded}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* 2. Sidebar Shell (Connected profiles only) */}
      {showSidebar && (
        <Sidebar
          currentPage={currentPage}
          navigate={navigate}
          user={user}
          handleLogout={handleLogout}
        />
      )}

      {/* 3. Main Dynamic Content Area */}
      <div
        className={`flex-grow flex flex-col transition-all duration-300 ease-[0.16,1,0.3,1] ${
          showSidebar ? 'pl-10' : 'pl-0'
        }`}
      >
        <main
          className={`flex-grow ${
            currentPage === 'home' || currentPage === 'auth' ? 'pt-0' : 'pt-20'
          } ${currentPage === 'auth' ? 'pb-0' : 'pb-16'} z-10 w-full`}
        >
          {/* Framer Motion Cross-Fade Transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* 4. Footer Area */}
        {showFooter && (
          <footer className="w-full bg-bg-secondary border-t border-border-subtle z-10 py-12 relative overflow-hidden shrink-0">
            {/* Dovetail-style 3D wireframe room depth effect */}
            <PerspectiveGrid />

            <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-10 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Column 1: Info and Brand */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2.5 select-none">
                    <div className="w-6.5 h-6.5 flex items-center justify-center rounded-lg bg-accent-bleue/20 border border-accent-bleue/40">
                      <span className="text-fieri-blue text-xs font-black">F</span>
                    </div>
                    <Logo className="h-5" />
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed max-w-xs mt-2">
                    Plateforme officielle de FIERI Research. Un espace de pointe pour la recherche scientifique, l'innovation technologique et la cooptation académique.
                  </p>

                  {/* Newsletter Form */}
                  <div className="mt-4 flex flex-col gap-2 max-w-xs text-left">
                    <span className="text-[10px] font-black tracking-widest text-accent-primary uppercase">Newsletter</span>
                    {newsletterSubscribed ? (
                      <div className="text-xs text-accent-secondary bg-accent-secondary/10 border border-accent-secondary/20 p-2.5 rounded-lg font-medium animate-pulse">
                        ✓ Abonnement validé avec succès !
                      </div>
                    ) : (
                      <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                        <input
                          type="email"
                          required
                          placeholder="Votre e-mail..."
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          className="bg-bg-primary/60 border border-border-subtle hover:border-accent-primary/40 focus:border-accent-primary focus:outline-none rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted transition-all flex-grow min-w-0"
                        />
                        <button
                          type="submit"
                          className="bg-accent-primary hover:bg-accent-primary/95 text-text-primary px-3 rounded-lg text-xs font-black transition-all cursor-pointer shadow-md hover:shadow-accent-primary/20 shrink-0"
                        >
                          OK
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {/* Column 2: Public Navigation Links */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-bold tracking-widest text-text-primary uppercase">Plateforme</span>
                  <ul className="flex flex-col gap-2">
                    <li><button onClick={() => navigate('home')} className="text-xs text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Accueil Général</button></li>
                    <li><button onClick={() => navigate('student-portal')} className="text-xs text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Portail Étudiant</button></li>
                    <li><button onClick={() => navigate('projects')} className="text-xs text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Projets & Brevets</button></li>
                    <li><button onClick={() => navigate('opportunities')} className="text-xs text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Annonces Recherche</button></li>
                  </ul>
                </div>

                {/* Column 3: Community and Academy */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-bold tracking-widest text-text-primary uppercase">Ressources</span>
                  <ul className="flex flex-col gap-2">
                    <li><button onClick={() => navigate('news')} className="text-xs text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Actualités</button></li>
                    <li><button onClick={() => navigate('workshops')} className="text-xs text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Ateliers & Formations</button></li>
                    <li><button onClick={() => navigate('events')} className="text-xs text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Événements</button></li>
                    <li><button onClick={() => navigate('clubs')} className="text-xs text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Clubs Scientifiques</button></li>
                  </ul>
                </div>

                {/* Column 4: Account and Support */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-bold tracking-widest text-text-primary uppercase">Espace Privé</span>
                  <ul className="flex flex-col gap-2">
                    <li><button onClick={() => navigate(user ? 'dashboard' : 'auth')} className="text-xs text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">{user ? 'Mon Dashboard' : 'Se Connecter'}</button></li>
                    <li><button onClick={() => navigate('members')} className="text-xs text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Annuaire des Membres</button></li>
                    <li><button onClick={() => navigate('contact')} className="text-xs text-text-secondary hover:text-text-primary transition-colors text-left cursor-pointer">Aide & FAQ</button></li>
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
                  <span className="text-[10px] text-text-muted hover:text-text-secondary cursor-pointer uppercase tracking-wider">Charte Graphique v1.0</span>
                  <span className="text-[10px] text-text-muted">•</span>
                  <span className="text-[10px] text-text-muted hover:text-text-secondary cursor-pointer uppercase tracking-wider">Politique de Confidentialité</span>
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  )
}
