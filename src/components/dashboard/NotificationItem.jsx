import React from 'react'

export default function NotificationItem({ item, onMarkRead, onOpen }) {
  const handleOpen = () => {
    if (onMarkRead) onMarkRead(item.id)
    if (onOpen && item.metadata && item.metadata.target) onOpen(item.metadata.target)
  }

  return (
    <div className={`p-3 rounded mb-2 ${item.read ? 'bg-gray-800/40' : 'bg-white/5'}`}>
      <button className="w-full text-left" onClick={handleOpen}>
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold">{item.title || item.text || 'Notification'}</div>
            <div className="text-sm text-gray-400">{item.body || item.text || ''}</div>
          </div>
          <div className="text-xs text-gray-500 ml-2">{new Date(item.createdAt || item.date || Date.now()).toLocaleString()}</div>
        </div>
      </button>
    </div>
  )
}
