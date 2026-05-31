// React import not required with new JSX runtime

export default function NotificationItem({ notification, onMarkRead, onClick }) {
  const { id, title, body, text, read, createdAt, date } = notification || {}

  const displayTitle = title || text || 'Notification'
  const displayBody = body || ''

  return (
    <div className={`p-3 rounded-lg border ${read ? 'opacity-60' : 'bg-white/2 border-border-subtle'} mb-2`}> 
      <button onClick={() => onClick && onClick(notification)} className="w-full text-left">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-sm font-semibold text-text-primary">{displayTitle}</div>
            {displayBody && <div className="text-xs text-text-secondary mt-1">{displayBody}</div>}
            <div className="text-[11px] text-text-muted mt-1">{createdAt || date}</div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {!read && <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />}
            <button onClick={(e) => { e.stopPropagation(); onMarkRead && onMarkRead(id); }} className="text-xs text-text-secondary hover:text-text-primary">Marquer lu</button>
          </div>
        </div>
      </button>
    </div>
  )
}
