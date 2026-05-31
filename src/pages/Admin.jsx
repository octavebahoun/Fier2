import React from 'react';
import { Shield, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Admin({ navigate }) {
  const { user } = useAuth();

  // Protection supplémentaire au niveau du composant
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
        <h1 className="text-2xl font-bold text-text-primary mb-2">Accès Interdit</h1>
        <p className="text-text-secondary max-w-md">
          Vous devez disposer d'un compte Administrateur pour accéder à cet espace.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[92rem] mx-auto w-full py-24 px-6 md:px-12 lg:px-24">
      {/* En-tête */}
      <div className="flex flex-col gap-2 mb-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            <Shield className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black tracking-[0.25em] uppercase text-red-400">
            ESPACE DE CONTRÔLE
          </span>
        </div>
        <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">
          Console d'Administration
        </h1>
        <p className="text-xs text-text-secondary">
          Gestion de la plateforme, validation éditoriale et modération des publications scientifiques.
        </p>
      </div>

      {/* Grid d'administration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel border border-border-subtle bg-bg-secondary/40 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-fieri-blue/10 border border-fieri-blue/30 text-fieri-blue">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary">Membres</span>
          </div>
          <h3 className="text-2xl font-black text-text-primary">1 240</h3>
          <p className="text-[10px] text-text-secondary mt-1">Utilisateurs inscrits sur la plateforme</p>
        </div>

        <div className="glass-panel border border-border-subtle bg-bg-secondary/40 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary">Publications</span>
          </div>
          <h3 className="text-2xl font-black text-text-primary">42 Approved</h3>
          <p className="text-[10px] text-text-secondary mt-1">3 en attente de comité de lecture</p>
        </div>

        <div className="glass-panel border border-border-subtle bg-bg-secondary/40 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary">Système</span>
          </div>
          <h3 className="text-2xl font-black text-text-primary">100% Online</h3>
          <p className="text-[10px] text-text-secondary mt-1">Mock database active en local</p>
        </div>
      </div>

      <div className="glass-panel border border-border-subtle bg-bg-secondary/40 p-8 rounded-3xl text-center">
        <h2 className="text-lg font-bold text-text-primary mb-2">Comité de lecture et Validation</h2>
        <p className="text-xs text-text-secondary max-w-md mx-auto mb-6">
          Les fonctionnalités avancées de validation d'articles de recherche et de modération des clubs seront disponibles dans l'Epic 5.
        </p>
        <button
          onClick={() => navigate('news')}
          className="px-6 py-2.5 rounded-full border border-border-subtle text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all cursor-pointer"
        >
          Voir le flux d'actualités
        </button>
      </div>
    </div>
  );
}
