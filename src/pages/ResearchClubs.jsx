import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, CheckCircle, Lock, Cpu, Leaf, Building2,
  Brain, Rocket, Zap, ChevronRight, Star,
  Clock, ShieldCheck, Check, Ban
} from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import FadeInWhenVisible from '../components/home/FadeInWhenVisible.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import { useToast } from '../components/ui/Toast.jsx'


// ────────────────────────────── Join Confirm Modal ────────────────────────────
function JoinConfirmModal({ club, onConfirm, onCancel }) {
  const Icon = CLUB_ICONS[club?.id] || Star;
  if (!club) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-scrim backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md chamfer chamfer-shadow border border-border-strong bg-bg-secondary p-8"
      >

        {/* Icone + titre */}
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="w-14 h-14 chamfer-sm flex items-center justify-center shrink-0 border border-engine bg-engine-wash">
            <Icon className="w-7 h-7 text-engine" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-engine">
              Rejoindre
            </p>
            <h2 className="text-lg font-extrabold text-text-primary leading-snug">{club.kicker}</h2>
          </div>
        </div>

        {/* Charte */}
        <div className="p-4 rounded-xl text-xs text-text-secondary leading-relaxed mb-6 relative z-10 border border-border-strong bg-bg-tertiary">
<p className="font-bold text-text-primary mb-1.5">En demandant votre adhésion, vous vous engagez à&nbsp;:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Participer activement aux activités et réunions du club.</li>
            <li>Respecter les membres et le règlement intérieur.</li>
            <li>Votre demande sera validée sous 48h par le Responsable.</li>
          </ul>
        </div>

        {/* Boutons */}
        <div className="flex gap-3 relative z-10">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-xs font-bold text-text-secondary bg-bg-secondary border border-border-subtle hover:bg-bg-tertiary transition-all"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 min-h-11 rounded-xl text-xs font-bold bg-engine text-on-accent hover:bg-engine-deep transition-colors cursor-pointer"
          >
            Soumettre la demande
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────── Club Icon Map ───────────────────────────
const CLUB_ICONS = {
  'club-1': Cpu,
  'club-2': Zap,
  'club-3': Leaf,
  'club-4': Building2,
  'club-5': Brain,
  'club-6': Rocket,
};

// ─────────────────────────── Club Card Component ───────────────────────────
function ClubCard({ club, user, navigate, onJoin, onLeave, isPending, joiningId, isManager, pendingMembers = [], onApproveRequest, onRejectRequest }) {
  const Icon = CLUB_ICONS[club.id] || Star;
  const isJoining = joiningId === club.id;
  const [showManage, setShowManage] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }}
      className="relative flex flex-col chamfer-sm chamfer-shadow overflow-hidden border border-border-strong bg-bg-secondary"
    >
      {/* Header : icône + kicker */}
      <div className="flex items-center gap-4 px-6 pt-6 pb-4 border-b border-border-subtle">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0 border border-engine bg-engine-wash">
          <Icon className="w-6 h-6 text-engine" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="inline-block text-xs font-bold uppercase tracking-widest rounded-full px-2.5 py-0.5 mb-1 border border-engine bg-engine-wash text-engine">
            {club.kicker}
          </span>
          <div className="flex items-center gap-1.5 text-text-secondary text-xs">
            <Users className="w-3.5 h-3.5" />
            <span>{club.membersCount.toLocaleString('fr-FR')} membres</span>
          </div>
        </div>
      </div>

      {/* Corps : titre + description */}
      <div className="flex-1 px-6 py-4 space-y-3">
        <h3 className="text-text-primary font-bold text-base leading-snug line-clamp-2">
          <button
            onClick={() => navigate?.('club-detail', { clubId: club.id })}
            className="text-left hover:text-engine transition-colors cursor-pointer"
          >
            {club.title}
          </button>
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">
          {club.desc}
        </p>

        {/* Divisions / Tags */}
        {club.divisions && club.divisions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {club.divisions.map((div) => (
              <span
                key={div}
                className="text-xs font-medium px-2 py-0.5 rounded-full bg-bg-tertiary text-text-secondary border border-border-subtle"
              >
                {div}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer : projet phare + bouton */}
      <div className="px-6 pb-6 pt-2 space-y-4">
        {/* Projet phare */}
        {club.projetPhare && (
          <div className="flex items-start gap-2 p-3 rounded-xl text-xs border border-border-strong bg-bg-tertiary">
            <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-engine" />
            <p className="text-text-secondary leading-relaxed italic">
              <span className="font-semibold not-italic text-engine">
                Projet phare :{' '}
              </span>
              {club.projetPhare}
            </p>
          </div>
        )}

        {/* Bouton d'adhésion ou statut */}
        {club.joined ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onLeave(club.id)}
            disabled={isJoining}
            className="flex items-center justify-center gap-2 w-full min-h-11 rounded-xl text-sm font-bold bg-engine text-on-accent hover:bg-engine-deep transition-colors cursor-pointer"
            title="Cliquez pour quitter le club"
          >
            <CheckCircle className="w-4 h-4" />
            Membre actif (Quitter)
          </motion.button>
        ) : isPending ? (
          <div
            className="flex items-center justify-center gap-2 w-full min-h-11 rounded-xl text-sm font-bold border border-ember bg-ember-wash text-ember cursor-default"
          >
            <Clock className="w-4 h-4 animate-pulse" />
            Demande en attente
          </div>
        ) : user ? (
          <motion.button
            onClick={() => onJoin(club.id)}
            disabled={isJoining}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-2 w-full min-h-11 rounded-xl text-sm font-bold border border-engine bg-engine-wash text-engine hover:bg-engine hover:text-on-accent transition-colors cursor-pointer"
            aria-label={`Rejoindre le club ${club.kicker}`}
          >
            {isJoining ? (
              <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Users className="w-4 h-4" />
            )}
            {isJoining ? 'Traitement…' : 'Rejoindre le Club'}
          </motion.button>
        ) : (
          <button
            disabled
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-text-secondary bg-bg-tertiary border border-border-subtle cursor-not-allowed"
            aria-label="Connexion requise pour rejoindre ce club"
          >
            <Lock className="w-4 h-4" />
            Connexion requise
          </button>
        )}

        {/* Section Administration du Club pour Mentors et Admins */}
        {isManager && (
          <div className="pt-4 border-t border-border-subtle space-y-2">
            <button
              onClick={() => setShowManage(!showManage)}
              className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-bg-secondary border border-border-subtle text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all"
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-success" />
                <span>Gérer les adhésions</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-success-wash border border-success text-xs text-success">
                {pendingMembers.length} en attente
              </span>
            </button>

            <AnimatePresence>
              {showManage && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-2 pt-1"
                >
                  {pendingMembers.length === 0 ? (
                    <p className="text-xs text-success italic text-center py-1">
                      Aucune demande d'adhésion en attente.
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {pendingMembers.map((req) => (
                        <div
                          key={req.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-bg-tertiary border border-border-subtle text-xs"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            {(() => {
                              // Le backend renvoie le demandeur sous req.user {firstName, lastName, email}.
                              // On reste tolérant aux anciennes formes (userName/userEmail).
                              const name = req.user
                                ? `${req.user.firstName ?? ''} ${req.user.lastName ?? ''}`.trim()
                                : ''
                              const displayName = name || req.userName || req.user?.email || 'Membre'
                              const email = req.user?.email || req.userEmail || ''
                              return (
                                <>
                                  <p className="font-bold text-text-primary truncate">{displayName}</p>
                                  {email && <p className="text-xs text-text-secondary truncate">{email}</p>}
                                </>
                              )
                            })()}
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => onApproveRequest(req.id)}
                              className="inline-flex h-11 w-11 items-center justify-center rounded border border-success bg-success-wash text-success hover:bg-success hover:text-on-accent transition-colors cursor-pointer"
                              aria-label={`Approuver l’adhésion de ${req.memberName || 'ce membre'}`}
                              title="Approuver"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onRejectRequest(req.id)}
                              className="inline-flex h-11 w-11 items-center justify-center rounded border border-danger bg-danger-wash text-danger hover:bg-danger hover:text-on-accent transition-colors cursor-pointer"
                              aria-label={`Rejeter l’adhésion de ${req.memberName || 'ce membre'}`}
                              title="Rejeter"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────── ResearchClubs Page ───────────────────────────────
export default function ResearchClubs({ navigate }) {
  const { user, can } = useAuth();
  const userId = user?.id ?? null;
  const [clubs, setClubs] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState({});
  const { notify } = useToast()
  const [joiningId, setJoiningId] = useState(null);
  const [confirmClub, setConfirmClub] = useState(null); // Club en attente de confirmation

  // Vue transversale sur tous les clubs de l'université : c'est le droit de
  // lire les rapports qui la définit. L'ancien test comparait l'objet
  // `universityPost` à une chaîne — toujours faux — et inventait deux rôles
  // inexistants (constat F05) : ce bloc n'a jamais rien accordé à personne.
  const canSeeAllClubs = can('report:read');

  // Gère-t-on CE club ? La capacité fait foi ; `responsibleId` reste un repli
  // tant que `/members/me` ne renseigne pas toujours `responsibleClubIds`.
  const managesClub = (club) =>
    can('membership:review', { clubId: club.id }) || club.responsibleId === userId;

  const userAssignedClubId =
    user?.clubId ||
    (user?.responsibleClubIds && user.responsibleClubIds[0]) ||
    (user?.memberships && user.memberships[0]?.clubId) ||
    '';

  // Si l'utilisateur appartient déjà à un club et n'est pas admin/secrétariat :
  // IL N'A AUCUNE VUE SUR LES AUTRES CLUBS. Seul son propre club est affiché.
  const displayClubs = (user && userAssignedClubId && !canSeeAllClubs)
    ? clubs.filter((c) => String(c.id) === String(userAssignedClubId) || c.joined || c.responsibleId === userId)
    : clubs;

  const joinedCount = displayClubs.filter((c) => c.joined).length;
  const totalMembers = displayClubs.reduce((acc, c) => acc + c.membersCount, 0);

  // Charger toutes les données (clubs, demandes de l'utilisateur connecté, et demandes en attente pour les managers)
  const loadData = async () => {
    const clubsRes = await api.clubs.getAll();
    const allClubs = clubsRes.success ? clubsRes.data : [];
    setClubs(allClubs);

    if (userId) {
      const res = await api.memberships.getUserRequests(userId);
      if (res.success) {
        setMyRequests(res.data);
      }
    } else {
      setMyRequests([]);
    }

    // Demandes en attente : uniquement pour les clubs que l'utilisateur gère
    // (ADMIN → tous ; RESPONSABLE → uniquement le(s) club(s) dont il est responsable).
    // On filtre en amont pour éviter les appels qui renverraient 403.
    if (user) {
      const managed = allClubs.filter(managesClub);
      const pendingMap = {};
      for (const club of managed) {
        const res = await api.memberships.getPendingRequests(club.id);
        if (res.success) {
          pendingMap[club.id] = res.data;
        }
      }
      setPendingRequests(pendingMap);
    } else {
      setPendingRequests({});
    }
  };

  useEffect(() => {
    loadData();
  }, [userId, user]);

  // Déclencher la demande d'adhésion (rejoindre)
  const handleJoinClick = (clubId) => {
    if (!user || joiningId) return;
    const club = clubs.find(c => c.id === clubId);
    if (!club) return;
    setConfirmClub(club);
  };

  // Quitter le club (direct)
  const handleLeaveClick = async (clubId) => {
    if (!user || !userId || joiningId) return;
    setJoiningId(clubId);
    const res = await api.memberships.leave(clubId, userId);
    if (res.success) {
      notify(res.message, 'info');
      loadData();
    } else {
      notify(res.message, 'error');
    }
    setJoiningId(null);
  };

  // Exécuter l'adhésion (création demande) après confirmation
  const handleJoinConfirm = async () => {
    const clubId = confirmClub?.id;
    if (!clubId || !user || joiningId) return;
    setConfirmClub(null);
    setJoiningId(clubId);

    const res = await api.memberships.requestJoin(clubId, user);
    if (res.success) {
      notify(res.message, 'success');
      loadData();
    } else {
      notify(res.message, 'error');
    }
    setJoiningId(null);
  };

  // Approuver une demande (Manager / Admin / Mentor)
  const handleApproveRequest = async (requestId) => {
    const res = await api.memberships.approve(requestId);
    if (res.success) {
      notify('Adhésion approuvée avec succès !', 'success');
      loadData();
    } else {
      notify(res.message, 'error');
    }
  };

  // Rejeter une demande (Manager / Admin / Mentor)
  const handleRejectRequest = async (requestId) => {
    const res = await api.memberships.reject(requestId, 'Demande rejetée par le Responsable.');
    if (res.success) {
      notify('Demande d\'adhésion refusée.', 'info');
      loadData();
    } else {
      notify(res.message, 'error');
    }
  };

  return (
    <main id="clubs" className="min-h-screen">

      <div className="relative z-10 max-w-[92rem] mx-auto w-full py-16 px-6 md:px-12 lg:px-12">

        {/* ── Hero Section ── */}
        <PageHeader
          align="center"
          tag="Student Hub · Epic 4"
          icon={Zap}
          title="CITE de Recherche"
          description={<>Rejoignez l'une de nos <span className="text-text-primary font-semibold">6 communautés thématiques</span> et collaborez avec les meilleurs chercheurs et ingénieurs de la plateforme FIERI.</>}
        >
          {/* Stats rapides */}
          <div className="flex items-center justify-center flex-wrap gap-6 pt-2">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Users className="w-4 h-4 text-engine" />
                <span>
                  <strong className="text-text-primary font-bold">
                    {totalMembers.toLocaleString('fr-FR')}
                  </strong>{' '}
                  membres actifs
                </span>
              </div>
              <div className="w-px h-4 bg-border-subtle hidden sm:block" />
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Star className="w-4 h-4 text-ember" />
                <span>
                  <strong className="text-text-primary font-bold">6</strong> pôles scientifiques
                </span>
              </div>
              {user && joinedCount > 0 && (
                <>
                  <div className="w-px h-4 bg-border-subtle hidden sm:block" />
                  <div className="flex items-center gap-2 text-sm text-success">
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      <strong className="font-bold">{joinedCount}</strong> club
                      {joinedCount > 1 ? 's' : ''} rejoint{joinedCount > 1 ? 's' : ''}
                    </span>
                  </div>
                </>
              )}
            </div>
        </PageHeader>

        {/* ── Bandeau invitation connexion (visiteur) ── */}
        {!user && (
          <FadeInWhenVisible direction="up" delay={0.1}>
            <div className="mb-10 flex items-center gap-4 p-4 chamfer-sm bg-engine-wash border border-engine/20 text-sm">
              <Lock className="w-5 h-5 text-engine shrink-0" />
              <p className="text-text-secondary">
                <span className="text-text-primary font-semibold">Connectez-vous</span> pour rejoindre
                un club et accéder à vos avantages membres.
              </p>
              {navigate && (
                <button
                  onClick={() => navigate('auth')}
                  className="ml-auto shrink-0 px-4 py-1.5 rounded-xl bg-engine text-on-accent text-xs font-bold hover:bg-engine transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-engine"
                >
                  Se connecter
                </button>
              )}
            </div>
          </FadeInWhenVisible>
        )}

        {/* ── Grille des clubs ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {displayClubs.map((club, index) => {
            const isPending = myRequests.some(r => r.clubId === club.id && r.status === 'PENDING');
            const isManager = user && managesClub(club);
            const pendingMembers = pendingRequests[club.id] || [];

            return (
              <FadeInWhenVisible key={club.id} direction="up" delay={0.08 * index}>
                <ClubCard
                  club={club}
                  user={user}
                  navigate={navigate}
                  onJoin={handleJoinClick}
                  onLeave={handleLeaveClick}
                  isPending={isPending}
                  joiningId={joiningId}
                  isManager={isManager}
                  pendingMembers={pendingMembers}
                  onApproveRequest={handleApproveRequest}
                  onRejectRequest={handleRejectRequest}
                />
              </FadeInWhenVisible>
            );
          })}
        </div>

        {/* ── Section CTA bas de page ── */}
        <FadeInWhenVisible direction="up" delay={0.15}>
          <div className="mt-16 text-center p-8 chamfer bg-bg-tertiary border border-border-subtle">
            <p className="text-text-secondary text-sm leading-relaxed max-w-xl mx-auto">
              Chaque club dispose de ses propres projets de recherche, ateliers et publications.
              Explorez les{' '}
              <button
                onClick={() => navigate && navigate('projects')}
                className="text-engine font-semibold hover:underline underline-offset-2 transition-all cursor-pointer"
              >
                projets R&D
              </button>{' '}
              ou les{' '}
              <button
                onClick={() => navigate && navigate('student-portal')}
                className="text-ember font-semibold hover:underline underline-offset-2 transition-all cursor-pointer"
              >
                ateliers pratiques
              </button>{' '}
              pour aller plus loin.
            </p>
          </div>
        </FadeInWhenVisible>
      </div>

      {/* ── Toast notifications ── */}


      {/* ── Modale de confirmation d'adhésion ── */}
      <AnimatePresence>
        {confirmClub && (
          <JoinConfirmModal
            club={confirmClub}
            onConfirm={() => handleJoinConfirm()}
            onCancel={() => setConfirmClub(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

