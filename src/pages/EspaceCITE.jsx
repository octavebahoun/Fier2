import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, FolderKanban, Users, FileText, Send, AlertCircle,
  CheckCircle, X, ChevronRight,  UserPlus, BookOpen,
  ChevronDown, ChevronUp, Star, Check
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
    error:   'bg-red-500/10 border-red-500/30 text-red-400',
    info:    'bg-engine/10 border-engine/30 text-engine',
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
  IN_PROGRESS: { label: 'En cours',     className: 'bg-engine/10 border-engine/30 text-engine' },
  DONE:        { label: 'Terminée',     className: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
  ACTIVE:      { label: 'Actif',        className: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
  ARCHIVED:    { label: 'Archivé',      className: 'bg-bg-tertiary border-border-subtle text-text-muted' },
};

const statusBadge = (status) =>
  STATUS_META[status] || { label: status || '—', className: 'bg-bg-tertiary border-border-subtle text-text-muted' };

// Date courte en français. Renvoie un tiret si la valeur est absente ou
// illisible : on n'affiche jamais une date qu'on n'a pas.
const formatDateFr = (valeur) => {
  if (!valeur) return '—';
  const d = new Date(valeur);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatRoleBadge = (m) => {
  const post = m.universityPost?.post || m.universityPost || '';
  const role = m.role || '';
  const email = m.email || '';

  if (post === 'SECRETAIRE' || role === 'SECRETAIRE') {
    return { label: 'Secrétaire Générale', className: 'bg-engine/10 text-engine border border-engine/20' };
  }
  if (post === 'CHEF_UNIVERSITAIRE' || role === 'CHEF_UNIVERSITAIRE' || role === 'ADMIN_UNIVERSITAIRE') {
    return { label: 'Chef Universitaire', className: 'bg-red-500/10 text-red-400 border border-red-500/20' };
  }
  if (role === 'ADMIN') {
    return { label: 'Administrateur', className: 'bg-red-500/10 text-red-400 border border-red-500/20' };
  }
  if (
    role === 'RESPONSABLE_CLUB' ||
    role === 'RESPONSABLE' ||
    (m.responsibleClubIds && m.responsibleClubIds.length > 0) ||
    email.toLowerCase().includes('resp.') ||
    m.isClubResponsible
  ) {
    return { label: 'Responsable de Club', className: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' };
  }

  return { label: 'Étudiant Chercheur', className: 'bg-bg-tertiary text-text-muted border border-border-subtle' };
};

// ───────────────────────────── Section Card ────────────────────────────────
function SectionCard({ icon: Icon, title, subtitle, children, accent = 'var(--color-engine)' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative rounded-2xl overflow-hidden glass-panel bg-bg-secondary/60 backdrop-blur-xl border border-border-subtle"
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
  const { user, isClubResponsible, isSecretary, isChefUniversitaire, universityPost, universityId } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [projects, setProjects] = useState([]);
  const [, setAssignedActivities] = useState([]);

  // Rôle d'administration centrale (Secrétariat & Chef Universitaire).
  // On passe par les helpers du contexte : `user.universityPost` est un objet
  // { post, universityId }, le comparer à une chaîne ne matchait jamais.
  const isSecretaryOrAdmin = isSecretary() || isChefUniversitaire();

  // Poste exact du membre : décide à qui les documents sont transmis.
  const estSecretaire = universityPost === 'SECRETAIRE';

  // Lecture des rapports de toute l'université : Secrétariat, Chef
  // Universitaire et ADMIN, conformément à
  // @UniversityPosts('SECRETAIRE', 'CHEF_UNIVERSITAIRE') sur
  // GET /universities/:id/activity-reports.
  const canReadUniversityReports = isSecretary() || isChefUniversitaire();

  // Détermination du club de l'utilisateur
  const userAssignedClubId = user?.clubId || (user?.responsibleClubIds && user.responsibleClubIds[0]) || (user?.memberships && user.memberships[0]?.clubId) || '';
  const [clubId, setClubId] = useState(userAssignedClubId);
  const [clubsList, setClubsList] = useState([]);
  const [clubLoading, setClubLoading] = useState(false);

  // Membres du club
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // Demandes d'adhésion en attente pour le club
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  // Accordéon des autres clubs
  const [showOtherClubs, setShowOtherClubs] = useState(false);
  const [joiningClubId, setJoiningClubId] = useState(null);

  // Annuaire Transversal & Rapports Réceptionnés de l'université (réservé Secrétariat / Admin)
  const [allMembers, setAllMembers] = useState([]);
  const [allMembersLoading, setAllMembersLoading] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [receivedReports, setReceivedReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState(null);

  const [toast, setToast] = useState(null);

  // Est responsable du club sélectionné
  const isClubManager = isClubResponsible(clubId) || isSecretaryOrAdmin;

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

  // ── Chargement de la liste de tous les clubs ──
  useEffect(() => {
    (async () => {
      setClubLoading(true);
      try {
        const res = await api.clubs.getAll();
        const list = res?.success && Array.isArray(res.data) ? res.data : [];
        setClubsList(list);
        if (list.length > 0 && !clubId) {
          if (userAssignedClubId) {
            setClubId(userAssignedClubId);
          } else if (isSecretaryOrAdmin) {
            // Le Secrétariat supervise tous les clubs : ouvrir sur le premier
            // est un point de départ, pas une appartenance.
            setClubId(list[0].id);
          }
          // Sinon on ne présélectionne rien : un membre sans club doit voir
          // qu'il n'a pas de club, pas celui d'un autre.
        }
      } catch (err) {
        console.error('[EspaceCITE] Erreur clubs.getAll:', err);
        setClubsList([]);
      } finally {
        setClubLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAssignedClubId, isSecretaryOrAdmin]);

  // Sync clubId quand user change
  useEffect(() => {
    if (userAssignedClubId && !isSecretaryOrAdmin) {
      setClubId(userAssignedClubId);
    }
  }, [userAssignedClubId, isSecretaryOrAdmin]);

  // ── Chargement des membres du club ──
  useEffect(() => {
    if (!clubId) {
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
  }, [clubId]);

  // ── Chargement des demandes d'adhésion en attente ──
  const loadPendingRequests = async () => {
    if (!clubId || !isClubManager) return;
    setPendingLoading(true);
    try {
      const res = await api.memberships.getPendingRequests(clubId);
      if (res?.success && Array.isArray(res.data)) {
        setPendingRequests(res.data);
      } else {
        setPendingRequests([]);
      }
    } catch (err) {
      console.error('[EspaceCITE] Erreur getPendingRequests:', err);
      setPendingRequests([]);
    } finally {
      setPendingLoading(false);
    }
  };

  useEffect(() => {
    if (isClubManager && clubId) {
      loadPendingRequests();
    }
  }, [isClubManager, clubId]);

  // ── Rapports d'activité réceptionnés (Secrétariat / ADMIN) ──
  // Source unique : GET /universities/:id/activity-reports. Ce que la page
  // affiche est donc exactement ce que la base contient.
  const loadReceivedReports = async () => {
    if (!canReadUniversityReports || !universityId) {
      setReceivedReports([]);
      return;
    }
    setReportsLoading(true);
    setReportsError(null);
    try {
      const res = await api.clubSpace.universityReports(universityId);
      setReceivedReports(res?.success && Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('[EspaceCITE] Erreur universityReports:', err);
      setReceivedReports([]);
      setReportsError(err?.serverMessage || err?.message || 'Impossible de charger les rapports transmis.');
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    loadReceivedReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canReadUniversityReports, universityId]);

  // ── Chargement global pour le Secrétariat / Admin ──
  useEffect(() => {
    if (!isSecretaryOrAdmin) return;
    loadDashboard();
    (async () => {
      setAllMembersLoading(true);
      try {
        const res = await api.members.list();
        const list = res?.success && Array.isArray(res.data) ? res.data : [];
        setAllMembers(list);
      } catch {
        setAllMembers([]);
      } finally {
        setAllMembersLoading(false);
      }
    })();
  }, [isSecretaryOrAdmin]);

  // Initial load dashboard for regular users
  useEffect(() => {
    if (!isSecretaryOrAdmin) {
      loadDashboard();
    }
  }, [isSecretaryOrAdmin]);

  // ── Validation / Refus Adhésions ──
  const handleApproveRequest = async (reqId) => {
    try {
      const res = await api.memberships.approve(reqId);
      if (res?.success) {
        setToast({ message: 'Demande d\'adhésion approuvée avec succès !', type: 'success' });
        loadPendingRequests();
        // Recharger membres
        const mRes = await api.clubSpace.membersList(clubId);
        if (mRes?.success && mRes.data?.members) setMembers(mRes.data.members);
      } else {
        setToast({ message: res?.message || 'Erreur lors de la validation.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Erreur lors de la validation.', type: 'error' });
    }
  };

  const handleRejectRequest = async (reqId) => {
    try {
      const res = await api.memberships.reject(reqId, 'Candidature non retenue');
      if (res?.success) {
        setToast({ message: 'Demande d\'adhésion refusée.', type: 'warning' });
        loadPendingRequests();
      } else {
        setToast({ message: res?.message || 'Erreur lors du refus.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Erreur lors du refus.', type: 'error' });
    }
  };

  // ── Demander à rejoindre un autre club ──
  const handleJoinClub = async (targetClubId) => {
    if (joiningClubId) return;
    setJoiningClubId(targetClubId);
    try {
      const res = await api.memberships.requestJoin(targetClubId, { id: user?.id });
      if (res?.success) {
        setToast({ message: 'Demande d\'adhésion transmise au responsable du club avec succès.', type: 'success' });
      } else {
        setToast({ message: res?.message || 'Demande déjà envoyée ou erreur.', type: 'warning' });
      }
    } catch {
      setToast({ message: 'Impossible d\'envoyer la demande d\'adhésion.', type: 'error' });
    } finally {
      setJoiningClubId(null);
    }
  };

  // ── Recensement mensuel ──
  const [censusBusy, setCensusBusy] = useState(false);
  const handleSubmitCensus = async () => {
    if (!clubId || censusBusy) return;
    setCensusBusy(true);
    const dest = estSecretaire ? "au Chef Universitaire (Admin)" : "à la Secrétaire Générale";
    try {
      const res = await api.clubSpace.submitCensus(clubId);
      if (res?.success) {
        setToast({ message: `Recensement mensuel transmis ${dest} (${res.data?.memberCount ?? 0} membre(s)).`, type: 'success' });
      } else {
        setToast({ message: res?.message || "Le recensement n'a pas pu être transmis.", type: 'error' });
      }
    } catch (err) {
      console.error('[EspaceCITE] Erreur submitCensus:', err);
      setToast({
        message: err?.serverMessage || err?.message || "Le recensement n'a pas pu être transmis.",
        type: 'error',
      });
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
        setToast({
          message: res.message || "Rapport mensuel d'activité transmis à la Secrétaire Générale.",
          type: 'success',
        });
        setReportForm({ period: '', title: '', content: '' });
        // On relit la liste au lieu de l'inventer : elle reflète la base.
        await loadReceivedReports();
      } else {
        setToast({
          message: res?.message || "Le rapport n'a pas pu être transmis.",
          type: 'error',
        });
      }
    } catch (err) {
      console.error('[EspaceCITE] Erreur submitReport:', err);
      setToast({
        message: err?.serverMessage || err?.message || "Le rapport n'a pas pu être transmis.",
        type: 'error',
      });
    } finally {
      setReportBusy(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 rounded-xl bg-bg-tertiary border border-border-subtle text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-engine/50';
  const labelClass = 'block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5';
  const btnPrimary =
    'flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white bg-engine hover:bg-engine/85 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-engine disabled:opacity-50 disabled:cursor-not-allowed';

  // Annuaire filtré : sert au tableau (12 premières lignes) et à la mention
  // de troncature, pour que le nombre affiché corresponde au nombre réel.
  const membresFiltres = allMembers.filter((m) => {
    const q = memberSearch.toLowerCase();
    const nomComplet = `${m.firstname || ''} ${m.lastname || m.name || ''}`.toLowerCase();
    const club = (m.clubName || m.club?.name || '').toLowerCase();
    return nomComplet.includes(q) || club.includes(q);
  });

  const selectedClubObj = clubsList.find(c => String(c.id) === String(clubId));

  return (
    <main id="espace-cite" className="min-h-screen">

      <div className="relative z-10 max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Espace CITE */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-engine/10 border border-engine/20 text-engine text-xs font-bold uppercase tracking-wider mb-2">
              <ClipboardList className="w-3.5 h-3.5" />
              FIERI Community OS — CITE R&D
            </div>
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
              {isSecretaryOrAdmin ? "Espace Administration CITE" : (selectedClubObj?.name || "Espace Club de Recherche CITE")}
            </h1>
            <p className="text-text-muted text-sm mt-1">
              {isSecretaryOrAdmin
                ? "Coordination centrale et supervision des clubs de recherche universitaire."
                : "Espace réservé à la gestion des membres, projets, activités et rapports de votre club."}
            </p>
          </div>

          {/* Sélecteur de club pour Secrétariat & Admin */}
          {isSecretaryOrAdmin && (
            <div className="flex items-center gap-3 bg-white/[0.03] p-3 rounded-2xl border border-border-subtle">
              <label className={labelClass + ' mb-0 shrink-0'}>Club Supervisé :</label>
              {clubLoading ? (
                <span className="text-sm text-text-muted">Chargement…</span>
              ) : (
                <select
                  value={clubId}
                  onChange={(e) => setClubId(e.target.value)}
                  className={inputClass + ' w-auto min-w-[220px] font-bold text-engine'}
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
          <div className="mb-8 flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-sm">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-red-300">{error}</p>
            <button
              onClick={loadDashboard}
              className="ml-auto px-4 py-1.5 rounded-xl bg-red-500/20 text-red-300 text-xs font-bold hover:bg-red-500/30 transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* État de chargement */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-20 text-text-muted">
            <span className="inline-block w-5 h-5 border-2 border-engine border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Chargement de votre espace…</span>
          </div>
        )}

        {!loading && (
          <div className="space-y-8">
            {/* Membre rattaché à aucun club : le dire, plutôt que d'ouvrir
                l'espace d'un club auquel il n'appartient pas. */}
            {!clubId && !isSecretaryOrAdmin && (
              <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center gap-4">
                <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-text-primary">Vous n'êtes membre d'aucun club de recherche.</p>
                  <p className="text-xs text-text-muted mt-1">
                    L'Espace CITE présente la vie de votre club. Rejoignez-en un pour y accéder :
                    votre demande sera validée par le Responsable du club.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate && navigate('clubs')}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-engine hover:bg-engine/85 transition-colors shrink-0"
                >
                  Découvrir les clubs
                </button>
              </div>
            )}

            {/* VUE MEMBRES & RESPONSABLES DU CLUB ACTIF */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ── 1. Liste des membres actifs du club ── */}
              <SectionCard icon={Users} title="Membres du Club" subtitle="Chercheurs et responsables inscrits" accent="var(--color-emerald-500)">
                {membersLoading ? (
                  <p className="text-xs text-text-muted py-6 text-center">Chargement des membres du club...</p>
                ) : members.length === 0 ? (
                  <div className="py-8 text-center text-xs text-text-muted">
                    Aucun membre inscrit dans ce club pour le moment.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                    {members.map((m, idx) => {
                      const badge = formatRoleBadge(m);
                      return (
                        <div key={m.memberId || m.id || idx} className="p-3 rounded-xl bg-white/[0.02] border border-border-subtle flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-text-primary truncate">
                              {m.name || [m.firstName, m.lastName].filter(Boolean).join(' ') || 'Membre'}
                            </p>
                            <p className="text-[11px] text-text-muted truncate">{m.email || 'Pas d\'email'}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold uppercase shrink-0 ${badge.className}`}>
                            {badge.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </SectionCard>

              {/* ── 2. Demandes d'adhésion en attente (si Responsable) ── */}
              <SectionCard icon={UserPlus} title="Validation des Adhésions" subtitle="Candidatures en attente" accent="var(--color-ember-soft)">
                {pendingLoading ? (
                  <p className="text-xs text-text-muted py-6 text-center">Vérification des demandes...</p>
                ) : pendingRequests.length === 0 ? (
                  <div className="py-8 text-center text-xs text-text-muted">
                    <CheckCircle className="w-6 h-6 text-emerald-400/50 mx-auto mb-2" />
                    Aucune candidature en attente de validation.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {pendingRequests.map((req) => (
                      <div key={req.id} className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex flex-col gap-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs font-bold text-text-primary">
                              {[req.user?.firstname, req.user?.lastname].filter(Boolean).join(' ') || req.user?.email || 'Chercheur'}
                            </p>
                            <p className="text-[11px] text-text-muted">{req.user?.email}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            En Attente
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t border-amber-500/10">
                          <button
                            onClick={() => handleApproveRequest(req.id)}
                            className="flex-1 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Approuver
                          </button>
                          <button
                            onClick={() => handleRejectRequest(req.id)}
                            className="flex-1 py-1.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 text-[11px] font-bold hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Refuser
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              {/* ── 3. Projets en cours du club ── */}
              <SectionCard icon={FolderKanban} title="Projets R&D du Club" subtitle="Travaux de recherche actifs" accent="var(--color-ember)">
                {projects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <FolderKanban className="w-8 h-8 text-text-muted/50 mb-3" />
                    <p className="text-xs text-text-muted">Aucun projet actif pour ce club.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {projects.map((p) => {
                      const badge = statusBadge(p.status);
                      return (
                        <div key={p.id} className="p-3.5 rounded-xl bg-white/[0.02] border border-border-subtle">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-text-primary font-semibold text-xs leading-snug">{p.title}</h3>
                            <span className={`text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0 ${badge.className}`}>
                              {badge.label}
                            </span>
                          </div>
                          {navigate && (
                            <button
                              onClick={() => navigate('project-detail', { projectId: p.id })}
                              className="flex items-center gap-1 text-[11px] text-engine hover:underline underline-offset-2 transition-all mt-2 ml-auto"
                            >
                              Ouvrir <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </SectionCard>
            </div>

            {/* ── SECTION EXCLUSIVE RESPONSABLE : OUILS DE DECLARATION & TACHES ── */}
            {isClubManager && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-border-subtle">
                {/* Recensement mensuel */}
                <SectionCard 
                  icon={Users} 
                  title={estSecretaire ? "Recensement Global CITE" : "Recensement Mensuel"} 
                  subtitle={estSecretaire ? "Consolidation et transmission à l'Admin" : "Transmission à la Secrétaire Générale"} 
                  accent="var(--color-emerald-500)"
                >
                  <p className="text-text-secondary text-xs leading-relaxed mb-4">
                    {estSecretaire
                      ? "Fige et transmet le recensement des effectifs consolidés des clubs de l'université à l'Admin Universitaire (Chef Univ.)."
                      : "Fige et transmet le recensement des membres actifs de votre club à la Secrétaire Générale de l'université."}
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
                    {censusBusy ? 'Soumission…' : estSecretaire ? 'Transmettre le recensement global' : 'Transmettre à la Secrétaire'}
                  </button>
                </SectionCard>

                {/* Assignation d'activité */}
                <SectionCard icon={ClipboardList} title="Assigner une Activité" subtitle="Attribuer une tâche à un membre" accent="var(--color-engine)">
                  <form onSubmit={handleCreateActivity} className="space-y-3">
                    <div>
                      <label className={labelClass}>Titre *</label>
                      <input
                        type="text"
                        value={activityForm.title}
                        onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                        placeholder="Ex : Synthèse du livre blanc"
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
                          <option key={m.memberId || m.id} value={m.memberId || m.id}>
                            {m.name || [m.firstName, m.lastName].filter(Boolean).join(' ')}{m.email ? ` (${m.email})` : ''}
                          </option>
                        ))}
                      </select>
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

                {/* Rapport mensuel d'activité */}
                <SectionCard 
                  icon={FileText} 
                  title={estSecretaire ? "Rapport Mensuel Global" : "Rapport d'Activité du Club"} 
                  subtitle={estSecretaire ? "Synthèse transmise au Chef Universitaire" : "Soumission à la Secrétaire Générale"} 
                  accent="var(--color-ember)"
                >
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
                        placeholder="Ex : Bilan mensuel R&D"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Contenu du rapport *</label>
                      <textarea
                        value={reportForm.content}
                        onChange={(e) => setReportForm({ ...reportForm, content: e.target.value })}
                        rows={3}
                        placeholder={estSecretaire
                          ? "Synthèse d'activité des clubs..."
                          : "Bilan d'activité du club..."}
                        className={inputClass + ' resize-none'}
                      />
                    </div>
                    <button type="submit" disabled={reportBusy} className={btnPrimary}>
                      {reportBusy ? (
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <BookOpen className="w-4 h-4" />
                      )}
                      {reportBusy ? 'Transmission…' : estSecretaire ? 'Transmettre au Chef Univ.' : 'Transmettre à la Secrétaire'}
                    </button>
                  </form>
                </SectionCard>
              </div>
            )}

            {/* ── SECTIONS AUTRES CLUBS : AFFICHÉ UNIQUEMENT SI AUCUN CLUB N'EST ENCORE REJOINTS ── */}
            {!userAssignedClubId && !isSecretaryOrAdmin && (
              <div className="pt-6 border-t border-border-subtle">
                <button
                  onClick={() => setShowOtherClubs(!showOtherClubs)}
                  className="w-full p-4 rounded-2xl bg-white/[0.03] border border-border-subtle hover:bg-white/[0.06] transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-engine/10 border border-engine/20 flex items-center justify-center text-engine group-hover:scale-105 transition-transform">
                      <Star className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-text-primary">Découvrir / Rejoindre un club de la CITE</h3>
                      <p className="text-xs text-text-muted">Explorez les domaines d'innovation R&D et postulez en un clic.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-engine">
                    <span>{showOtherClubs ? "Masquer" : "Afficher les clubs"}</span>
                    {showOtherClubs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                <AnimatePresence>
                  {showOtherClubs && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden mt-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {clubsList
                          .map((c) => (
                            <div key={c.id} className="p-4 rounded-2xl bg-bg-secondary/80 border border-border-subtle flex flex-col justify-between gap-4">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-engine/10 text-engine border border-engine/20">
                                    Club R&D
                                  </span>
                                </div>
                                <h4 className="text-sm font-extrabold text-text-primary">{c.name || c.title}</h4>
                                <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2">
                                  {c.description || "Club de recherche spécialisé au sein de la Cité FIERI."}
                                </p>
                              </div>
                              <button
                                onClick={() => handleJoinClub(c.id)}
                                disabled={joiningClubId === c.id}
                                className="w-full py-2 rounded-xl text-xs font-bold text-white bg-engine hover:bg-engine/85 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                {joiningClubId === c.id ? (
                                  <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <UserPlus className="w-3.5 h-3.5" />
                                )}
                                Rejoindre ce club
                              </button>
                            </div>
                          ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ── PANNEAU GLOBAL SECRÉTARIAT / ADMIN ── */}
            {isSecretaryOrAdmin && (
              <div className="space-y-8 pt-6 border-t border-border-subtle">
                {/* Rapports d'activité transmis — lecture directe de la base */}
                {canReadUniversityReports && (
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-border-subtle backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                        <FileText className="w-5 h-5 text-engine" />
                        Rapports d'activité transmis par les clubs
                      </h3>
                      <p className="text-xs text-text-muted">
                        Rapports mensuels déposés par les Responsables de Club de votre université.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-engine/10 text-engine border border-engine/20">
                        {receivedReports.length} rapport{receivedReports.length > 1 ? 's' : ''}
                      </span>
                      <button
                        type="button"
                        onClick={loadReceivedReports}
                        disabled={reportsLoading}
                        className="px-3 py-1 rounded-full text-xs font-bold border border-border-subtle text-text-muted hover:text-text-primary hover:border-engine/40 transition-colors disabled:opacity-50"
                      >
                        Actualiser
                      </button>
                    </div>
                  </div>

                  {reportsLoading ? (
                    <p className="text-xs text-text-muted py-4 text-center">Chargement des rapports…</p>
                  ) : reportsError ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{reportsError}</span>
                    </div>
                  ) : receivedReports.length === 0 ? (
                    <p className="text-xs text-text-muted italic py-4 text-center">
                      Aucun rapport n'a encore été transmis par les clubs de votre université.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {receivedReports.map((rep) => (
                        <div key={rep.id} className="p-4 rounded-xl bg-black/40 border border-border-subtle flex flex-col justify-between gap-3">
                          <div>
                            <div className="flex items-center justify-between text-[11px] text-text-muted mb-1">
                              <span className="font-bold text-engine">{rep.clubName}</span>
                              <span>Période : {rep.period}</span>
                            </div>
                            <h4 className="text-sm font-bold text-text-primary">{rep.title}</h4>
                            {rep.content && <p className="text-xs text-text-secondary mt-1 line-clamp-3">{rep.content}</p>}
                          </div>
                          <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-text-muted">
                            <span>Par : {rep.author || '—'}</span>
                            <span>{formatDateFr(rep.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                )}

                {/* Annuaire Transversal : Membres de l'université */}
                <div className="p-6 rounded-2xl bg-white/[0.03] border border-border-subtle backdrop-blur-xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-400" />
                        Annuaire Transversal des Membres
                      </h3>
                      <p className="text-xs text-text-muted">
                        Vue centralisée accessible à la Secrétaire Générale et à l'Admin Universitaire.
                      </p>
                    </div>
                    <div className="w-full sm:w-64">
                      <input
                        type="text"
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        placeholder="Rechercher membre ou club..."
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {allMembersLoading ? (
                    <p className="text-xs text-text-muted py-4 text-center">Chargement de l'annuaire…</p>
                  ) : allMembers.length === 0 ? (
                    <p className="text-xs text-text-muted italic py-6 text-center">
                      Aucun membre enregistré pour le moment.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-border-subtle text-text-muted font-bold uppercase">
                            <th className="py-2.5 px-3">Membre / Chercheur</th>
                            <th className="py-2.5 px-3">Club Métier</th>
                            <th className="py-2.5 px-3">Email</th>
                            <th className="py-2.5 px-3">Rôle</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-text-secondary">
                          {membresFiltres
                            .slice(0, 12)
                            .map((m, idx) => {
                              const badge = formatRoleBadge(m);
                              return (
                                <tr key={m.id || idx} className="hover:bg-white/[0.02]">
                                  <td className="py-2.5 px-3 font-semibold text-text-primary">
                                    {[m.firstname, m.lastname].filter(Boolean).join(' ') || m.name || 'Membre'}
                                  </td>
                                  <td className="py-2.5 px-3 text-engine font-medium">
                                    {m.clubName || m.club?.name || 'Club R&D'}
                                  </td>
                                  <td className="py-2.5 px-3 text-text-muted">{m.email || '—'}</td>
                                  <td className="py-2.5 px-3">
                                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${badge.className}`}>
                                      {badge.label}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                      {membresFiltres.length > 12 && (
                        <p className="text-[11px] text-text-muted italic pt-3 text-center">
                          12 membres affichés sur {membresFiltres.length}. Affinez la recherche pour voir les autres.
                        </p>
                      )}
                      {membresFiltres.length === 0 && (
                        <p className="text-[11px] text-text-muted italic py-4 text-center">
                          Aucun membre ne correspond à cette recherche.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
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
