import { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

/**
 * Toast — une seule implémentation pour toute l'application.
 *
 * Il en existait quatorze copies, avec quatre durées différentes (4 s, 4,5 s,
 * 5 s, et une sans fermeture automatique) et un coin arrondi divergent. Le
 * provider est monté une fois dans AppLayout ; les écrans appellent `notify()`.
 *
 *   const { notify } = useToast()
 *   notify('Rapport transmis.', 'success')
 */

const ToastContext = createContext(null)

const VARIANTS = {
  success: { icon: CheckCircle,   className: 'border-emerald-500 bg-emerald-500/12 text-emerald-300' },
  error:   { icon: AlertCircle,   className: 'border-red-500 bg-red-500/12 text-red-300' },
  warning: { icon: AlertTriangle, className: 'border-amber-500 bg-amber-500/12 text-amber-300' },
  info:    { icon: Info,          className: 'border-engine bg-engine/12 text-engine' },
}

// 5 s : au-dessus de la fourchette de 3–5 s recommandée, on lit encore ; en
// dessous, un message d'erreur disparaît avant d'avoir été compris.
const DUREE_MS = 5000

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])

  const dismiss = useCallback((id) => {
    setItems((list) => list.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback((message, type = 'success') => {
    if (!message) return
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setItems((list) => [...list, { id, message, type }])
    return id
  }, [])

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* aria-live sur le conteneur, pas sur chaque message : le lecteur
          d'écran annonce l'arrivée sans que le focus ne soit déplacé. */}
      <div
        className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-[min(24rem,calc(100vw-3rem))] flex-col gap-2"
        role="status"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {items.map((toast) => (
            <ToastItem key={toast.id} {...toast} onDismiss={() => dismiss(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ message, type, onDismiss }) {
  const variant = VARIANTS[type] || VARIANTS.success
  const Icon = variant.icon

  useEffect(() => {
    const timer = setTimeout(onDismiss, DUREE_MS)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      className={`pointer-events-auto flex items-start gap-3 border px-4 py-3 shadow-lg ${variant.className}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="flex-1 text-sm font-medium leading-snug">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="-m-2 shrink-0 cursor-pointer p-2 opacity-70 transition-opacity hover:opacity-100"
        aria-label="Fermer la notification"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </motion.div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast doit être utilisé sous un ToastProvider.')
  return ctx
}
