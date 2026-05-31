import React, { useEffect, useState } from 'react'
import DashboardSummary from './DashboardSummary.jsx'
import NotificationsCenter from './NotificationsCenter.jsx'
import { api } from '../../services/api.js'

export default function Dashboard({ navigate }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await api.dashboard.getStats()
        if (mounted && res && res.success) setStats(res.data)
      } catch (e) {
        console.error('Failed loading dashboard stats', e)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <main className="max-w-[92rem] mx-auto w-full py-12 px-6 lg:px-24">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardSummary stats={stats} />
        </div>
        <aside className="lg:col-span-1">
          <NotificationsCenter navigate={navigate} />
        </aside>
      </div>
    </main>
  )
}
