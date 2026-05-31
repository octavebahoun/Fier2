import React from 'react'

export default function DashboardSummary({ stats }) {
  if (!stats) return <div className="p-6 bg-white/5 rounded">Chargement des statistiques...</div>

  return (
    <section className="p-6 bg-white/5 rounded">
      <h2 className="text-lg font-semibold mb-4">Résumé rapide</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 bg-gray-800 rounded">
          <div className="text-sm text-gray-400">Pôles rejoints</div>
          <div className="text-xl font-bold">{stats.clubsCount}</div>
        </div>
        <div className="p-3 bg-gray-800 rounded">
          <div className="text-sm text-gray-400">Projets suivis</div>
          <div className="text-xl font-bold">{stats.projectsCount}</div>
        </div>
        <div className="p-3 bg-gray-800 rounded">
          <div className="text-sm text-gray-400">Ateliers inscrits</div>
          <div className="text-xl font-bold">{stats.workshopsCount}</div>
        </div>
      </div>
    </section>
  )
}
