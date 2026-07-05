import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, LogIn, UserPlus, X } from 'lucide-react'
import { useAppNavigate } from '../navigation.js'

const AuthGateContext = createContext(null)

/**
 * AuthGateProvider — modale « Connexion requise » déclenchable partout via
 * useAuthGate().promptLogin(message). Remplace les redirections brutales vers
 * la page de login pour les actions réservées aux membres (wireframe).
 * Doit être monté SOUS le routeur (utilise useAppNavigate).
 */
export function AuthGateProvider({ children }) {
  const navigate = useAppNavigate()
  const [state, setState] = useState({ open: false, message: '' })

  const promptLogin = useCallback((message = '') => setState({ open: true, message }), [])
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), [])
  const goToLogin = () => { close(); navigate('members') }

  return (
    <AuthGateContext.Provider value={{ promptLogin }}>
      {children}
      <AnimatePresence>
        {state.open && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60" onClick={close}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
              role="dialog" aria-modal="true" aria-label="Connexion requise"
              className="relative w-full max-w-sm bg-bg-secondary border border-border-subtle rounded-3xl shadow-2xl p-6 flex flex-col gap-4 pointer-events-auto"
            >
              <button onClick={close} className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors" aria-label="Fermer">
                <X className="w-4 h-4" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-accent-primary/12 border border-accent-primary/25 flex items-center justify-center">
                <Lock className="w-5 h-5 text-accent-primary" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-text-primary">Connexion requise</h2>
                <p className="text-sm text-text-secondary mt-1">
                  {state.message || 'Cette action est réservée aux membres. Connectez-vous ou créez un compte pour continuer.'}
                </p>
              </div>
              <div className="flex flex-col gap-2 mt-1">
                <button onClick={goToLogin} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent-primary text-white text-xs font-black uppercase tracking-wider hover:bg-accent-primary/90 transition-all">
                  <LogIn className="w-4 h-4" /> Se connecter
                </button>
                <button onClick={goToLogin} className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border-subtle text-text-primary text-xs font-bold hover:bg-bg-tertiary transition-all">
                  <UserPlus className="w-4 h-4" /> Créer un compte
                </button>
                <button onClick={close} className="text-[11px] text-text-muted hover:text-text-secondary mt-1 transition-colors">
                  Continuer la visite
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AuthGateContext.Provider>
  )
}

export function useAuthGate() {
  return useContext(AuthGateContext) || { promptLogin: () => {} }
}

export default AuthGateContext
