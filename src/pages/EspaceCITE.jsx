import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, FolderKanban, Users, FileText, Send, AlertCircle,
  CheckCircle, X, ChevronRight, Calendar, UserPlus, BookOpen,
} from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

// ───────────────────────────── Toast Component ───────────────────────────────
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    error:   'bg-rose-500/10 border-rose-500/30 text-rose-400',
    info:    'bg-fieri-blue/10 border-fieri-blue/30 text-fieri-blue',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  };
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: AlertCircle,
    warning: AlertCircle,
  };
  const Icon = icons[type] || CheckCircle;
  const bgClass = styles[type] || styles.success;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md border ${bgClass}`}
      role="alert"
      aria-live="polite"
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="text-xs font-bold">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// ─────────────────────────── Helpers d'affichage ───────────────────────────
const STATUS_META = {
  TODO:        { label: 'À faire',      className: 'bg-amber-500/10 border-amber-500/30 text-amber-400' },
  IN_PROGRESS: { label: 'En cours',     className: 'bg-fieri-blue/10 border-fieri-blue/30 text-fieri-blue' },
  DONE:        { label: 'Terminée',     className: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
  ACTIVE:      { label: 'Actif',        className: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
  ARCHIVED:    { label: 'Archivé',      className: 'bg-white/5 border-white/10 text-text-muted' },
};

const statusBadge = (status) =>
  STATUS_META[status] || { label: status || '—', className: 'bg-white/5 border-white/10 text-text-muted' };

const formatDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
};

// ───────────────────────────── Section Card ────────────────────────────────
function SectionCard({ icon: Icon, title, subtitle, children, accent = '#6C4CF1' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative rounded-2xl overflow-hidden glass-panel bg-bg-secondary/60 backdrop-blur-xl border border-white/5"
    >
      <div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent}14 0%, transparent 70%)` }}
      />
      <div className="relative p-6">
        <div className="flex items-center gap-3 mb-5">
          <div
            className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
            style={{ background: `${accent}1A`, border: `1px solid ${accent}40` }}
          >
            <Icon className="w-5 h-5" style={{ color: accent }} />
          </div>
          <div>
            <h2 className="text-text-primary font-bold text-lg leading-snug">{title}</h2>
            {subtitle && <p className="text-text-muted text-xs">{subtitle}</p>}
          </div>
        </div>
        {children}
      </div>
    </motion.div>
  );
}

// ───────────────────────────── EspaceCITE Page ──────────────────────────────
export default function EspaceCITE({ navigate }) {
  const { user, isClubResponsible } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [assignedActivities, setAssignedActivities] = useState([]);
  const [projects, setProjects] = useState([]);

  // Sélection de club (si l'utilisateur n'a pas de clubId direct).
  const [clubId, setClubId] = useState(user?.clubId || '');
  const [clubsList, setClubsList] = useState([]);
  const [clubLoading, setClubLoading] = useState(false);

  // Membres du club (pour le sélecteur d'activité).
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const [toast, setToast] = useState(null);

  // Gérer la Cité (activités, recensement, rapports) est réservé au RESPONSABLE
  // du club sélectionné (ou ADMIN) — aligné sur l'autorisation réelle du backend.
  const isClubManager = isClubResponsible(clubId);

  // ── Chargement du tableau de bord ──
  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.clubSpace.myDashboard();
      if (res?.success && res.data) {
        setAssignedActivities(Array.isArray(res.data.assignedActivities) ? res.data.assignedActivities : []);
        setProjects(Array.isArray(res.data.projects) ? res.data.projects : []);
      } else if (res?.success && (res.assignedActivities || res.projects)) {
        // Tolérance à une forme alternative de réponse.
        setAssignedActivities(Array.isArray(res.assignedActivities) ? res.assignedActivities : []);
        setProjects(Array.isArray(res.projects) ? res.projects : []);
      } else {
        setAssignedActivities([]);
        setProjects([]);
      }
    } catch (err) {
      console.error('[EspaceCITE] Erreur myDashboard:', err);
      setError(err?.serverMessage || err?.message || "Impossible de charger votre espace CITE.");
      setAssignedActivities([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Chargement de la liste des clubs (si pas de clubId) ──
  useEffect(() => {
    if (user?.clubId) {
      setClubId(user.clubId);
      return;
    }
    (async () => {
      setClubLoading(true);
      try {
        const res = await api.clubs.getAll();
        const list = res?.success && Array.isArray(res.data) ? res.data : [];
        setClubsList(list);
        if (list.length > 0 && !clubId) setClubId(list[0].id);
      } catch (err) {
        console.error('[EspaceCITE] Erreur clubs.getAll:', err);
        setClubsList([]);
      } finally {
        setClubLoading(false);
      }
    })();
  }, [user?.clubId]);

  // ── Chargement de la liste des membres du club (pour le sélecteur) ──
  useEffect(() => {
    if (!isClubManager || !clubId) {
      setMembers([]);
      return;
    }
    (async () => {
      setMembersLoading(true);
      try {
        const res = await api.clubSpace.membersList(clubId);
        const list = res?.success && res.data?.members ? res.data.members : [];
        setMembers(list);
      } catch (err) {
        console.error('[EspaceCITE] Erreur membersList:', err);
        setMembers([]);
      } finally {
        setMembersLoading(false);
      }
    })();
  }, [isClubManager, clubId]);

  useEffect(() => {
    loadDashboard();
  }, []);

  // ── Recensement mensuel ──
  const [censusBusy, setCensusBusy] = useState(false);
  const handleSubmitCensus = async () => {
    if (!clubId || censusBusy) return;
    setCensusBusy(true);
    try {
      const res = await api.clubSpace.submitCensus(clubId);
      if (res?.success) {
        setToast({ message: `Recensement soumis (${res.data?.memberCount ?? 0} membre(s)).`, type: 'success' });
      } else {
        setToast({ message: res?.message || "Échec de la soumission du recensement.", type: 'error' });
      }
    } catch (err) {
      console.error('[EspaceCITE] Erreur submitCensus:', err);
      setToast({ message: err?.serverMessage || err?.message || "Impossible de soumettre le recensement.", type: 'error' });
    } finally {
      setCensusBusy(false);
    }
  };

  // ── Nouvelle activité assignée ──
  const [activityForm, setActivityForm] = useState({ title: '', description: '', memberId: '', dueDate: '' });
  const [activityBusy, setActivityBusy] = useState(false);
  const handleCreateActivity = async (e) => {
    e.preventDefault();
    if (!clubId) return;
    if (!activityForm.title.trim()) {
      setToast({ message: 'Le titre de l\'activité est requis.', type: 'warning' });
      return;
    }
    if (!activityForm.memberId) {
      setToast({ message: 'Veuillez sélectionner un membre.', type: 'warning' });
      return;
    }
    setActivityBusy(true);
    try {
      const res = await api.clubSpace.createAssignedActivity(clubId, {
        title: activityForm.title.trim(),
        description: activityForm.description.trim() || undefined,
        memberId: Number(activityForm.memberId),
        dueDate: activityForm.dueDate || undefined,
      });
      if (res?.success) {
        setToast({ message: 'Activité assignée avec succès.', type: 'success' });
        setActivityForm({ title: '', description: '', memberId: '', dueDate: '' });
        loadDashboard();
      } else {
        setToast({ message: res?.message || "Échec de la création de l'activité.", type: 'error' });
      }
    } catch (err) {
      console.error('[EspaceCITE] Erreur createAssignedActivity:', err);
      setToast({ message: err?.serverMessage || err?.message || "Impossible de créer l'activité.", type: 'error' });
    } finally {
      setActivityBusy(false);
    }
  };

  // ── Rapport mensuel d'activité ──
  const [reportForm, setReportForm] = useState({ period: '', title: '', content: '' });
  const [reportBusy, setReportBusy] = useState(false);
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!clubId) return;
    if (!reportForm.period.trim() || !reportForm.title.trim() || !reportForm.content.trim()) {
      setToast({ message: 'Période, titre et contenu sont requis.', type: 'warning' });
      return;
    }
    setReportBusy(true);
    try {
      const res = await api.clubSpace.submitReport(clubId, {
        period: reportForm.period.trim(),
        title: reportForm.title.trim(),
        content: reportForm.content.trim(),
      });
      if (res?.success) {
        setToast({ message: 'Rapport mensuel soumis à la secrétaire.', type: 'success' });
        setReportForm({ period: '', title: '', content: '' });
      } else {
        setToast({ message: res?.message || "Échec de la soumission du rapport.", type: 'error' });
      }
    } catch (err) {
      console.error('[EspaceCITE] Erreur submitReport:', err);
      setToast({ message: err?.serverMessage || err?.message || "Impossible de soumettre le rapport.", type: 'error' });
    } finally {
      setReportBusy(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/50';
  const labelClass = 'block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5';
  const btnPrimary =
    'flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white bg-fieri-blue hover:bg-fieri-blue/85 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-fieri-blue disabled:opacity-50 disabled:cursor-not-allowed';

  const activeProjects = projects.filter((p) => !p.status || p.status === 'ACTIVE');

  return (
    <main id="espace-cite" className="min-h-screen">
      {/* Halos de fond */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.06] blur-[100px]"
          style={{ background: 'radial-gradient(circle, #6C4CF1, transparent)' }}
        />
        <div
          className="absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full opacity-[0.05] blur-[120px]"
          style={{ background: 'radial-gradient(circle, #e05a2b, transparent)' }}
        />
      </div>

      <div className="relative z-10 max-w-[92rem] mx-auto w-full py-16 px-6 md:px-12 lg:px-24">
        {/* En-tête */}
        <div className="mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-fieri-blue/10 text-fieri-blue border border-fieri-blue/25">
            <FolderKanban className="w-3.5 h-3.5" />
            Espace membre · CITE
          </div>
          <h1 className="text-text-primary font-extrabold text-4xl md:text-5xl leading-tight">
            Mon espace CITE
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
            Retrouvez vos activités assignées, vos projets en cours et les outils de gestion de votre club de recherche.
          </p>

          {/* Sélecteur de club (si pas de clubId direct) */}
          {!user?.clubId && (
            <div className="flex items-center gap-3 pt-2">
              <label className={labelClass + ' mb-0'}>Club CITE</label>
              {clubLoading ? (
                <span className="text-sm text-text-muted">Chargement…</span>
              ) : (
                <select
                  value={clubId}
                  onChange={(e) => setClubId(e.target.value)}
                  className={inputClass + ' w-auto min-w-[200px]'}
                >
                  <option value="">Sélectionner un club…</option>
                  {clubsList.map((c) => (
                    <option key={c.id} value={c.id}>{c.name || c.title}</option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {/* Erreur globale */}
        {error && (
          <div className="mb-8 flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <p className="text-rose-300">{error}</p>
            <button
              onClick={loadDashboard}
              className="ml-auto px-4 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-bold hover:bg-rose-500/30 transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* État de chargement */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-20 text-text-muted">
            <span className="inline-block w-5 h-5 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Chargement de votre espace…</span>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Mes activités assignées ── */}
            <SectionCard icon={ClipboardList} title="Mes activités assignées" subtitle="Tâches qui vous ont été confiées" accent="#6C4CF1">
              {assignedActivities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <ClipboardList className="w-8 h-8 text-text-muted/50 mb-3" />
                  <p className="text-sm text-text-muted">Aucune activité assignée pour le moment.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {assignedActivities.map((a) => {
                    const badge = statusBadge(a.status);
                    return (
                      <motion.div
                        key={a.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4 }}
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-text-primary font-semibold text-sm leading-snug">{a.title}</h3>
                          <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0 ${badge.className}`}>
                            {badge.label}
                          </span>
                        </div>
                        {a.description && (
                          <p className="text-text-secondary text-xs mt-1.5 leading-relaxed">{a.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-text-muted">
                          {a.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {formatDate(a.dueDate)}
                            </span>
                          )}
                          {a.club?.name && (
                            <span className="flex items-center gap-1">
                              <FolderKanban className="w-3 h-3" /> {a.club.name}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            {/* ── Mes projets en cours ── */}
            <SectionCard icon={FolderKanban} title="Mes projets en cours" subtitle="Projets de recherche actifs" accent="#e05a2b">
              {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <FolderKanban className="w-8 h-8 text-text-muted/50 mb-3" />
                  <p className="text-sm text-text-muted">Vous ne participez à aucun projet pour l'instant.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {projects.map((p) => {
                    const badge = statusBadge(p.status);
                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4 }}
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-text-primary font-semibold text-sm leading-snug">{p.title}</h3>
                          <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0 ${badge.className}`}>
                            {badge.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {p.role && (
                            <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-fieri-blue/10 border border-fieri-blue/30 text-fieri-blue">
                              {p.role === 'OWNER' ? 'Responsable' : 'Suivi'}
                            </span>
                          )}
                          {navigate && (
                            <button
                              onClick={() => navigate('project-detail', { projectId: p.id })}
                              className="flex items-center gap-1 text-xs text-accent-primary hover:underline underline-offset-2 transition-all ml-auto"
                            >
                              Ouvrir <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </SectionCard>
          </div>
        )}

        {/* ── Zone Responsable de CITE ── */}
        {!loading && isClubManager && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/40">
                <UserPlus className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-text-primary font-extrabold text-2xl">Responsable de CITE</h2>
                <p className="text-text-muted text-xs">Outils de gestion et de déclaration de votre club</p>
              </div>
            </div>

            {!clubId ? (
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 text-center text-text-muted text-sm">
                Sélectionnez un club pour accéder aux outils de gestion.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recensement mensuel */}
                <SectionCard icon={Users} title="Recensement mensuel" subtitle="Soumettre la liste des membres" accent="#10b981">
                  <p className="text-text-secondary text-xs leading-relaxed mb-4">
                    Fige et transmet le recensement des membres actifs de votre club à la secrétaire de l'université.
                  </p>
                  <button
                    onClick={handleSubmitCensus}
                    disabled={censusBusy}
                    className={btnPrimary}
                  >
                    {censusBusy ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {censusBusy ? 'Soumission…' : 'Soumettre le recensement mensuel'}
                  </button>
                </SectionCard>

                {/* Nouvelle activité assignée */}
                <SectionCard icon={ClipboardList} title="Nouvelle activité assignée" subtitle="Attribuer une tâche à un membre" accent="#6C4CF1">
                  <form onSubmit={handleCreateActivity} className="space-y-3">
                    <div>
                      <label className={labelClass}>Titre *</label>
                      <input
                        type="text"
                        value={activityForm.title}
                        onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                        placeholder="Ex : Préparer la présentation"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Membre *</label>
                      <select
                        value={activityForm.memberId}
                        onChange={(e) => setActivityForm({ ...activityForm, memberId: e.target.value })}
                        className={inputClass}
                        disabled={membersLoading}
                      >
                        <option value="">{membersLoading ? 'Chargement…' : 'Sélectionner un membre…'}</option>
                        {members.map((m) => (
                          <option key={m.memberId} value={m.memberId}>
                            {m.name}{m.email ? ` (${m.email})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Description</label>
                      <textarea
                        value={activityForm.description}
                        onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                        rows={2}
                        placeholder="Détails de la tâche…"
                        className={inputClass + ' resize-none'}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Échéance</label>
                      <input
                        type="date"
                        value={activityForm.dueDate}
                        onChange={(e) => setActivityForm({ ...activityForm, dueDate: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <button type="submit" disabled={activityBusy} className={btnPrimary}>
                      {activityBusy ? (
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {activityBusy ? 'Création…' : 'Assigner l\'activité'}
                    </button>
                  </form>
                </SectionCard>

                {/* Rapport mensuel */}
                <SectionCard icon={FileText} title="Rapport mensuel d'activité" subtitle="Récapitulatif à la secrétaire" accent="#e05a2b">
                  <form onSubmit={handleSubmitReport} className="space-y-3">
                    <div>
                      <label className={labelClass}>Période * (ex : 2026-07)</label>
                      <input
                        type="text"
                        value={reportForm.period}
                        onChange={(e) => setReportForm({ ...reportForm, period: e.target.value })}
                        placeholder="2026-07"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Titre *</label>
                      <input
                        type="text"
                        value={reportForm.title}
                        onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                        placeholder="Ex : Bilan des activités juillet"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Contenu *</label>
                      <textarea
                        value={reportForm.content}
                        onChange={(e) => setReportForm({ ...reportForm, content: e.target.value })}
                        rows={4}
                        placeholder="Décrivez les activités et avancées du club…"
                        className={inputClass + ' resize-none'}
                      />
                    </div>
                    <button type="submit" disabled={reportBusy} className={btnPrimary}>
                      {reportBusy ? (
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <BookOpen className="w-4 h-4" />
                      )}
                      {reportBusy ? 'Envoi…' : 'Soumettre le rapport'}
                    </button>
                  </form>
                </SectionCard>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast key={toast.message} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>
    </main>
  );
}
