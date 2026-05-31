import { useEffect, useState, useRef } from 'react'
import { notifications } from '../../services/notifications.js'
import NotificationItem from './NotificationItem.jsx'

export default function NotificationsCenter({ navigate }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmClear, setConfirmClear] = useState(false)
  const confirmRef = useRef(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await notifications.getNotifications()
      setList(data || [])
    } catch {
      console.error('Failed loading notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(() => { void load() }, 0)
    return () => clearTimeout(t)
  }, [])

  const markRead = async (id) => {
    // optimistic
    setList(l => l.map(n => n.id === id ? { ...n, read: true } : n))
    try {
      await notifications.markAsRead(id)
    } catch {
      // rollback on error
      setList(l => l.map(n => n.id === id ? { ...n, read: false } : n))
    }
  }

  const handleOpen = (target) => {
    if (target && typeof target === 'object') {
      // follow navigation pattern from App.jsx
      if (target.page) {
        navigate(target.page, target.params || {})
      }
    }
  }

  const handleMarkAll = async () => {
    try {
      await notifications.markAllRead()
      setList(l => l.map(n => ({ ...n, read: true })))
    } catch {
      console.error('markAllRead failed')
    }
  }

  const handleClear = async () => {
    setConfirmClear(false)
    try {
      await notifications.clearNotifications()
      setList([])
    } catch {
      console.error('clearNotifications failed')
    }
  }

  return (
    <section className="p-4 bg-white/5 rounded">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Notifications</h3>
        <div className="flex items-center gap-2">
          <button className="text-sm text-gray-400" onClick={handleMarkAll}>Tout marquer lu</button>
          <button className="text-sm text-red-400" onClick={() => setConfirmClear(true)}>Tout effacer</button>
        </div>
      </div>

      {loading ? (
        <div>Chargement...</div>
      ) : list.length === 0 ? (
        <div className="text-gray-400">Aucune notification</div>
      ) : (
        <div>
          {list.map(item => (
            <NotificationItem key={item.id} item={item} onMarkRead={markRead} onOpen={handleOpen} />
          ))}
        </div>
      )}

      {confirmClear && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div ref={confirmRef} className="bg-white/5 p-6 rounded max-w-md w-full">
            <p className="mb-4">Confirmer la suppression de toutes les notifications ?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmClear(false)}>Annuler</button>
              <button className="text-red-500" onClick={handleClear}>Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
