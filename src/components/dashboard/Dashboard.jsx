import { useEffect, useState } from 'react'
import DashboardSummary from './DashboardSummary.jsx'
import NotificationsCenter from './NotificationsCenter.jsx'
import api from '../../services/api.js'

export default function Dashboard({ navigate }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await api.dashboard.getStats()
        if (mounted && res && res.success) setStats(res.data)
      } catch (e) {
        console.error('Failed to load dashboard stats', e)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-extrabold mb-4">Mon Dashboard</h1>
          <div className="mb-6">
            <DashboardSummary stats={stats} />
          </div>

          <div className="bg-bg-secondary border border-border-subtle rounded-lg p-4">
            {/* Placeholder for other dashboard panels */}
            <p className="text-text-secondary">Ici: activités récentes, projets suivis et widgets personnalisés.</p>
          </div>
        </div>

        <aside className="lg:col-span-1">
          <NotificationsCenter navigate={navigate} />
        </aside>
      </div>
    </div>
  )
}

