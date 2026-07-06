import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Loader2, ShieldAlert, RefreshCw, ChevronDown } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth, getRolePresentation, ROLE_LEVELS } from '../../context/AuthContext.jsx';

// Rôles attribuables par un ADMIN (VISITEUR n'est pas un rôle de compte).
// Alignés sur les rôles du backend (RolesGuard).
const ASSIGNABLE_ROLES = ['ETUDIANT', 'CHERCHEUR', 'MENTOR', 'CHEF_DE_PROJET', 'RESPONSABLE', 'ADMIN'];

/**
 * MembersManager — onglet Admin ▸ Membres.
 * Liste tous les membres et permet à un ADMIN de promouvoir / rétrograder.
 * Câblé sur GET /members et PATCH /members/:id/role. Dégrade proprement si
 * l'endpoint n'est pas (encore) déployé (404 → message explicite).
 *
 * @param {(message:string, type:'success'|'error') => void} notify  Toast du parent.
 */
export default function MembersManager({ notify }) {
  const { user } = useAuth();
  const [members, setMembers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async (searchTerm = '') => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.members.list({ search: searchTerm.trim() || undefined, limit: 100 });
      if (res?.success) {
        // Tri décroissant par niveau de rôle (ADMIN en tête), puis par nom.
        const sorted = [...(res.data || [])].sort((a, b) => {
          const la = ROLE_LEVELS[a.role?.toUpperCase()] ?? -1;
          const lb = ROLE_LEVELS[b.role?.toUpperCase()] ?? -1;
          if (lb !== la) return lb - la;
          return `${a.lastName}`.localeCompare(`${b.lastName}`);
        });
        setMembers(sorted);
      } else {
        setError(res?.message || 'Réponse inattendue du serveur.');
        setMembers([]);
      }
    } catch (e) {
      if (e?.status === 404) {
        setError("L'endpoint « GET /members » n'est pas encore déployé côté backend. La gestion des membres s'activera automatiquement une fois le serveur en ligne.");
      } else if (e?.status === 403) {
        setError("Accès refusé : seul un administrateur peut lister les membres.");
      } else {
        setError(e?.serverMessage || "Erreur lors du chargement des membres.");
      }
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    load(search);
  };

  const changeRole = async (member, newRole) => {
    if (!newRole || newRole === member.role) return;
    const previous = member.role;
    setUpdatingId(member.id);
    // Mise à jour optimiste
    setMembers((ms) => ms.map((m) => (m.id === member.id ? { ...m, role: newRole } : m)));
    try {
      const res = await api.members.setRole(member.id, newRole);
      if (res?.success) {
        notify?.(`${member.firstName} ${member.lastName} est désormais ${getRolePresentation(newRole).label}.`, 'success');
      } else {
        throw new Error(res?.message || 'Échec de la mise à jour.');
      }
    } catch (e) {
      // Revert en cas d'échec (ex. « dernier admin » côté backend)
      setMembers((ms) => ms.map((m) => (m.id === member.id ? { ...m, role: previous } : m)));
      const msg = e?.status === 404
        ? "Endpoint « PATCH /members/:id/role » indisponible (backend non déployé)."
        : (e?.serverMessage || e?.message || "Impossible de changer le rôle.");
      notify?.(msg, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="glass-panel border border-border-subtle bg-bg-secondary/30 rounded-3xl p-6 md:p-8">
      {/* En-tête + recherche */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-6 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Users className="w-5 h-5 text-fieri-blue" />
            Gestion des membres
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Promouvoir ou rétrograder un membre. Toute inscription démarre en <strong className="text-emerald-400">Étudiant</strong> ; les privilèges sont attribués ici.
          </p>
        </div>
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom, e-mail…"
              className="w-full md:w-56 bg-bg-secondary/50 border border-border-subtle focus:border-fieri-blue/40 rounded-xl py-2 pl-9 pr-3 text-xs text-text-primary outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            className="p-2 rounded-xl border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all cursor-pointer"
            title="Rechercher"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* États : chargement / erreur / liste */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-text-secondary">
          <Loader2 className="w-6 h-6 animate-spin text-fieri-blue" />
          <span className="text-xs font-semibold">Chargement des membres…</span>
        </div>
      ) : error ? (
        <div className="py-12 max-w-lg mx-auto text-center flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">{error}</p>
          <button
            onClick={() => load(search)}
            className="mt-1 px-4 py-2 rounded-xl border border-border-subtle text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all cursor-pointer flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Réessayer
          </button>
        </div>
      ) : members.length === 0 ? (
        <div className="py-16 text-center text-xs text-text-secondary">Aucun membre trouvé.</div>
      ) : (
        <div className="space-y-2">
          {/* En-têtes de colonnes (desktop) */}
          <div className="hidden md:grid grid-cols-[1fr_auto] gap-4 px-4 pb-2 text-[10px] font-black uppercase tracking-wider text-text-muted">
            <span>Membre</span>
            <span className="text-right pr-2">Rôle</span>
          </div>

          {members.map((member) => {
            const pres = getRolePresentation(member.role);
            const isSelf = member.id === user?.id;
            const isBusy = updatingId === member.id;
            const initials = `${member.firstName?.[0] ?? ''}${member.lastName?.[0] ?? ''}`.toUpperCase() || 'U';
            return (
              <motion.div
                key={member.id}
                layout
                className="grid grid-cols-[1fr_auto] gap-4 items-center px-4 py-3 rounded-2xl border border-border-subtle/70 bg-bg-secondary/40 hover:border-fieri-blue/20 transition-colors"
              >
                {/* Identité */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 shrink-0 rounded-full bg-accent-primary/15 border border-accent-primary/30 flex items-center justify-center">
                    <span className="text-text-primary font-bold text-[11px]">{initials}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-text-primary truncate">
                      {member.firstName} {member.lastName}
                      {isSelf && <span className="ml-2 text-[9px] font-black uppercase tracking-wider text-fieri-blue">(vous)</span>}
                    </p>
                    <p className="text-[10px] text-text-muted truncate">{member.email}</p>
                  </div>
                </div>

                {/* Rôle : badge courant + sélecteur */}
                <div className="flex items-center gap-2.5 justify-end">
                  <span className={`hidden sm:inline text-[8.5px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border ${pres.badgeClassName}`}>
                    {pres.short}
                  </span>
                  <div className="relative">
                    <select
                      value={ASSIGNABLE_ROLES.includes(member.role?.toUpperCase()) ? member.role.toUpperCase() : ''}
                      disabled={isBusy}
                      onChange={(e) => changeRole(member, e.target.value)}
                      className="appearance-none bg-bg-secondary/60 border border-border-subtle focus:border-fieri-blue/40 rounded-lg py-1.5 pl-3 pr-8 text-[11px] font-bold text-text-primary outline-none cursor-pointer transition-all disabled:opacity-50 disabled:cursor-wait"
                      title={isSelf ? "Attention : modifier votre propre rôle" : "Changer le rôle"}
                    >
                      {!ASSIGNABLE_ROLES.includes(member.role?.toUpperCase()) && (
                        <option value="" disabled>{member.role || '—'}</option>
                      )}
                      {ASSIGNABLE_ROLES.map((r) => (
                        <option key={r} value={r}>{getRolePresentation(r).label}</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-muted">
                      {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
