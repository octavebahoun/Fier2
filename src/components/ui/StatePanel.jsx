import { Loader2, Inbox, AlertTriangle, RefreshCw } from 'lucide-react';

export default function StatePanel({ state = 'loading', message, onRetry, icon: Icon, className = '' }) {
  if (state === 'loading') {
    return (
      <div className={`flex flex-col items-center justify-center py-16 gap-4 ${className}`} role="status" aria-live="polite">
        <Loader2 className="w-6 h-6 text-engine animate-spin" />
        <p className="text-sm text-text-secondary font-light">Chargement en cours…</p>
      </div>
    );
  }

  if (state === 'empty') {
    const EmptyIcon = Icon || Inbox;
    return (
      <div className={`flex flex-col items-center justify-center py-16 gap-4 ${className}`}>
        <div className="w-14 h-14 chamfer-sm bg-bg-secondary border border-border-subtle flex items-center justify-center">
          <EmptyIcon className="w-6 h-6 text-text-muted" />
        </div>
        <p className="text-sm text-text-secondary font-light max-w-sm text-center">
          {message || 'Aucune donnée disponible pour le moment.'}
        </p>
      </div>
    );
  }

  const ErrorIcon = Icon || AlertTriangle;
  return (
    <div className={`flex flex-col items-center justify-center py-16 gap-4 ${className}`} role="alert">
      <div className="w-14 h-14 chamfer-sm bg-ember-wash border border-ember/30 flex items-center justify-center">
        <ErrorIcon className="w-6 h-6 text-ember" />
      </div>
      <p className="text-sm text-text-secondary font-light max-w-sm text-center">
        {message || 'Une erreur est survenue.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold bg-engine-wash border border-engine/30 text-engine px-5 py-2.5 chamfer-xs hover:bg-engine-wash transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Réessayer
        </button>
      )}
    </div>
  );
}