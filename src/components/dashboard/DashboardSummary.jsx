// React import not required with new JSX runtime

export default function DashboardSummary({ stats }) {
  if (!stats) {
    return <div className="p-4 bg-bg-secondary border border-border-subtle rounded-lg">Chargement...</div>
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="p-4 bg-bg-secondary border border-border-subtle rounded-lg">
        <div className="text-xs text-text-secondary">Pôles rejoints</div>
        <div className="text-xl font-bold">{stats.clubsCount || 0}</div>
      </div>
      <div className="p-4 bg-bg-secondary border border-border-subtle rounded-lg">
        <div className="text-xs text-text-secondary">Projets suivis</div>
        <div className="text-xl font-bold">{stats.projectsCount || 0}</div>
      </div>
      <div className="p-4 bg-bg-secondary border border-border-subtle rounded-lg">
        <div className="text-xs text-text-secondary">Ateliers inscrits</div>
        <div className="text-xl font-bold">{stats.workshopsCount || 0}</div>
      </div>
    </div>
  )
}
