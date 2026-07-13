import { useEffect, useState, useRef, useCallback } from 'react'
import { X, Bell, Check, CheckCheck, Trash2, Inbox } from 'lucide-react'
import { notifications as notifService } from '../../services/notifications.js'

/**
 * NotificationsModal — modal/dropdown légère pour les notifications.
 * S'ouvre depuis la TopBar (cloche), se superpose au contenu sans déplacer le layout.
 * Pattern : overlay sombre + panneau latéral droit (slide-in), conforme aux normes
 * UX 2025 (non-intrusif, catégorisé, facilement dismissible).
 */
export default function NotificationsModal({ open, onClose, navigate }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const panelRef = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await notifService.getNotifications()
      setList(data || [])
    } catch {
      console.error('[FIERI] Erreur chargement notifications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      load()
      // Empêcher le scroll du body quand la modal est ouverte
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open, load])

  // Fermer avec Escape
  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  const markRead = async (id) => {
    setList(l => l.map(n => n.id === id ? { ...n, read: true } : n))
    try {
      await notifService.markAsRead(id)
      window.dispatchEvent(new CustomEvent('fieri:notifications:updated'))
    } catch {
      setList(l => l.map(n => n.id === id ? { ...n, read: false } : n))
    }
  }

  const markAllRead = async () => {
    try {
      await notifService.markAllRead()
      setList(l => l.map(n => ({ ...n, read: true })))
      window.dispatchEvent(new CustomEvent('fieri:notifications:updated'))
    } catch {
      console.error('[FIERI] markAllRead échoué')
    }
  }

  const clearAll = async () => {
    try {
      await notifService.clearNotifications()
      setList([])
      window.dispatchEvent(new CustomEvent('fieri:notifications:updated'))
    } catch {
      console.error('[FIERI] clearNotifications échoué')
    }
  }

  const handleNotifClick = (notif) => {
    if (notif?.target?.page) {
      markRead(notif.id)
      navigate(notif.target.page, notif.target.params || {})
      onClose()
    }
  }

  const unreadCount = list.filter(n => !n.read).length

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panneau latéral droit */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Centre de notifications"
        className="fixed top-0 right-0 bottom-0 z-[61] w-full max-w-md bg-bg-secondary/98 backdrop-blur-xl border-l border-border-subtle flex flex-col shadow-2xl animate-slide-in-right"
      >
        {/* En-tête */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-fieri-blue/15 border border-fieri-blue/30 flex items-center justify-center">
              <Bell className="w-4.5 h-4.5 text-fieri-blue" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-text-primary tracking-tight">Notifications</h2>
              {unreadCount > 0 && (
                <p className="text-[10px] text-fieri-blue font-bold">
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-all cursor-pointer"
            aria-label="Fermer les notifications"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions rapides */}
        {list.length > 0 && (
          <div className="flex items-center gap-2 px-5 py-2.5 border-b border-border-subtle/40 shrink-0">
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Tout marquer lu
            </button>
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Tout effacer
            </button>
          </div>
        )}

        {/* Liste des notifications */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-fieri-blue/30 border-t-fieri-blue rounded-full animate-spin" />
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center">
                <Inbox className="w-6 h-6 text-text-muted" />
              </div>
              <p className="text-sm font-semibold text-text-secondary">Aucune notification</p>
              <p className="text-xs text-text-muted max-w-[220px]">
                Vous serez notifié des activités importantes ici.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {list.map((notif) => (
                <div
                  key={notif.id}
                  className={`relative p-3.5 rounded-xl border transition-all cursor-pointer group
                    ${notif.read
                      ? 'border-transparent bg-transparent opacity-60 hover:opacity-80 hover:bg-white/3'
                      : 'border-fieri-blue/15 bg-fieri-blue/5 hover:bg-fieri-blue/8 hover:border-fieri-blue/25'
                    }`}
                  onClick={() => handleNotifClick(notif)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNotifClick(notif) } }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-start gap-3">
                    {/* Indicateur non lu */}
                    <div className="mt-1.5 shrink-0">
                      {!notif.read ? (
                        <span className="block w-2 h-2 rounded-full bg-fieri-blue shadow-[0_0_6px_rgba(27,111,216,0.6)]" />
                      ) : (
                        <span className="block w-2 h-2 rounded-full bg-text-muted/30" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-text-primary truncate">
                        {notif.title || notif.text || 'Notification'}
                      </p>
                      {notif.body && (
                        <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-2">{notif.body}</p>
                      )}
                      <p className="text-[10px] text-text-muted mt-1">{notif.createdAt || notif.date}</p>
                    </div>

                    {/* Action rapide marquer lu */}
                    {!notif.read && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markRead(notif.id) }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-text-muted hover:text-fieri-blue hover:bg-fieri-blue/10 transition-all cursor-pointer shrink-0"
                        title="Marquer comme lu"
                        aria-label="Marquer comme lu"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0.8; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .animate-slide-in-right { animation: slide-in-right 0.28s cubic-bezier(0.16,1,0.3,1) forwards; }
        .animate-fade-in { animation: fade-in 0.18s ease-out forwards; }
      `}</style>
    </>
  )
}
