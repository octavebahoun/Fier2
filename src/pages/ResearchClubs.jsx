import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, CheckCircle, Lock, Cpu, Leaf, Building2,
  Brain, Rocket, Zap, ChevronRight, Star, AlertCircle, X
} from 'lucide-react';
import { mockDb } from '../services/mockDb';
import { useAuth } from '../context/AuthContext.jsx';
import FadeInWhenVisible from '../components/home/FadeInWhenVisible.jsx';

// ───────────────────────────── Toast Component ───────────────────────────────
function Toast({ message, type = 'success', onClose }) {
  React.useEffect(() => {
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

// ────────────────────────────── Join Confirm Modal ────────────────────────────
function JoinConfirmModal({ club, onConfirm, onCancel }) {
  const Icon = CLUB_ICONS[club?.id] || Star;
  if (!club) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl border p-8 shadow-2xl backdrop-blur-xl"
        style={{
          background: 'rgba(13, 17, 32, 0.95)',
          borderColor: `${club.accent}40`,
          boxShadow: `0 0 60px ${club.accent}20`,
        }}
      >
        {/* Glow accent */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${club.accent}12 0%, transparent 65%)` }}
        />

        {/* Icone + titre */}
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: `${club.accent}1A`, border: `1.5px solid ${club.accent}50` }}
          >
            <Icon className="w-7 h-7" style={{ color: club.accent }} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: club.accent }}>
              Rejoindre
            </p>
            <h2 className="text-lg font-extrabold text-text-primary leading-snug">{club.kicker}</h2>
          </div>
        </div>

        {/* Charte */}
        <div
          className="p-4 rounded-xl text-xs text-text-secondary leading-relaxed mb-6 relative z-10"
          style={{ background: `${club.accent}0D`, border: `1px solid ${club.accent}20` }}
        >
          <p className="font-bold text-text-primary mb-1.5">En rejoignant ce club, vous vous engagez à :</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Participer activement aux activités et réunions du club.</li>
            <li>Respecter les membres et le règlement intérieur.</li>
            <li>Contribuer à au moins un projet ou atelier par trimestre.</li>
          </ul>
        </div>

        {/* Boutons */}
        <div className="flex gap-3 relative z-10">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-xs font-bold text-text-secondary bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
            style={{ background: club.accent }}
          >
            Confirmer l’adhésion
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
function ClubCard({ club, user, onJoin, joiningId }) {
  const Icon = CLUB_ICONS[club.id] || Star;
  const isJoining = joiningId === club.id;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }}
      className="relative flex flex-col rounded-2xl overflow-hidden backdrop-blur-xl border"
      style={{
        background: 'rgba(13, 17, 32, 0.65)',
        borderColor: `${club.accent}38`,
        boxShadow: `0 4px 32px ${club.accent}12`,
      }}
    >
      {/* Halo lumineux accent en arrière-plan */}
      <div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${club.accent}14 0%, transparent 70%)`,
        }}
      />

      {/* Header : bande accent + icône + kicker */}
      <div
        className="flex items-center gap-4 px-6 pt-6 pb-4"
        style={{ borderBottom: `1px solid ${club.accent}28` }}
      >
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
          style={{ background: `${club.accent}1A`, border: `1px solid ${club.accent}40` }}
        >
          <Icon className="w-6 h-6" style={{ color: club.accent }} />
        </div>
        <div className="flex-1 min-w-0">
          <span
            className="inline-block text-[11px] font-bold uppercase tracking-widest rounded-full px-2.5 py-0.5 mb-1"
            style={{
              background: `${club.accent}18`,
              color: club.accent,
              border: `1px solid ${club.accent}35`,
            }}
          >
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
          {club.title}
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
                className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/5 text-text-secondary border border-white/8"
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
          <div
            className="flex items-start gap-2 p-3 rounded-xl text-xs"
            style={{ background: `${club.accent}10`, border: `1px solid ${club.accent}20` }}
          >
            <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: club.accent }} />
            <p className="text-text-secondary leading-relaxed italic">
              <span className="font-semibold not-italic" style={{ color: club.accent }}>
                Projet phare :{' '}
              </span>
              {club.projetPhare}
            </p>
          </div>
        )}

        {/* Bouton d'adhésion */}
        {club.joined ? (
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: club.accent }}
          >
            <CheckCircle className="w-4 h-4" />
            Membre actif
          </motion.div>
        ) : user ? (
          <motion.button
            onClick={() => onJoin(club.id)}
            disabled={isJoining}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2"
            style={{
              background: `${club.accent}1C`,
              color: club.accent,
              border: `1.5px solid ${club.accent}55`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = club.accent;
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `${club.accent}1C`;
              e.currentTarget.style.color = club.accent;
            }}
            aria-label={`Rejoindre le club ${club.kicker}`}
          >
            {isJoining ? (
              <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Users className="w-4 h-4" />
            )}
            {isJoining ? 'Adhésion…' : 'Rejoindre le Club'}
          </motion.button>
        ) : (
          <button
            disabled
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-text-secondary bg-white/5 border border-white/10 cursor-not-allowed"
            aria-label="Connexion requise pour rejoindre ce club"
          >
            <Lock className="w-4 h-4" />
            Connexion requise
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────── ResearchClubs Page ───────────────────────────────
export default function ResearchClubs({ navigate }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [clubs, setClubs] = useState(() => mockDb.clubs.getAll(userId));
  const [toast, setToast] = useState(null);
  const [joiningId, setJoiningId] = useState(null);
  const [confirmClub, setConfirmClub] = useState(null); // Club en attente de confirmation

  const joinedCount = clubs.filter((c) => c.joined).length;
  const totalMembers = clubs.reduce((acc, c) => acc + c.membersCount, 0);

  // Ouvrir la modale de confirmation
  const handleJoinClick = (clubId) => {
    if (!user || joiningId) return;
    const club = clubs.find(c => c.id === clubId);
    if (!club) return;
    // Si déjà membre : quitter directement sans confirmation
    if (club.joined) {
      handleJoinConfirm(clubId);
    } else {
      setConfirmClub(club);
    }
  };

  // Exécuter l'adhésion après confirmation
  const handleJoinConfirm = (clubIdOverride = null) => {
    const clubId = clubIdOverride ?? confirmClub?.id;
    if (!clubId || !user || joiningId) return;
    setConfirmClub(null);
    setJoiningId(clubId);

    setTimeout(() => {
      const updated = mockDb.clubs.toggleJoin(clubId, userId);
      if (updated) {
        setClubs((prev) =>
          prev.map((c) => (c.id === clubId ? updated : c))
        );

        if (updated.joined) {
          mockDb.notifications.add(
            `Vous avez rejoint le club « ${updated.kicker} » avec succès !`
          );
          setToast({ message: `Bienvenue dans le club ${updated.kicker} !`, type: 'success' });
        } else {
          setToast({ message: `Vous avez quitté le club ${updated.kicker}.`, type: 'info' });
        }
      }
      setJoiningId(null);
    }, 320);
  };

  return (
    <main id="clubs" className="min-h-screen">
      {/* ── Halos de fond ── */}
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

        {/* ── Hero Section ── */}
        <FadeInWhenVisible direction="up" delay={0}>
          <div className="text-center mb-16 space-y-5">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-fieri-blue/10 text-fieri-blue border border-fieri-blue/25">
              <Zap className="w-3.5 h-3.5" />
              Student Hub · Epic 4
            </div>

            <h1 className="text-text-primary font-extrabold text-4xl md:text-5xl leading-tight">
              Clubs de Recherche
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
              Rejoignez l'une de nos{' '}
              <span className="text-text-primary font-semibold">6 communautés thématiques</span>{' '}
              et collaborez avec les meilleurs chercheurs et ingénieurs de la plateforme FIERI.
            </p>

            {/* Stats rapides */}
            <div className="flex items-center justify-center flex-wrap gap-6 pt-2">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Users className="w-4 h-4 text-fieri-blue" />
                <span>
                  <strong className="text-text-primary font-bold">
                    {totalMembers.toLocaleString('fr-FR')}
                  </strong>{' '}
                  membres actifs
                </span>
              </div>
              <div className="w-px h-4 bg-white/15 hidden sm:block" />
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Star className="w-4 h-4 text-fieri-orange" />
                <span>
                  <strong className="text-text-primary font-bold">6</strong> pôles scientifiques
                </span>
              </div>
              {user && joinedCount > 0 && (
                <>
                  <div className="w-px h-4 bg-white/15 hidden sm:block" />
                  <div className="flex items-center gap-2 text-sm text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      <strong className="font-bold">{joinedCount}</strong> club
                      {joinedCount > 1 ? 's' : ''} rejoint{joinedCount > 1 ? 's' : ''}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </FadeInWhenVisible>

        {/* ── Bandeau invitation connexion (visiteur) ── */}
        {!user && (
          <FadeInWhenVisible direction="up" delay={0.1}>
            <div className="mb-10 flex items-center gap-4 p-4 rounded-2xl bg-fieri-blue/8 border border-fieri-blue/20 text-sm">
              <Lock className="w-5 h-5 text-fieri-blue shrink-0" />
              <p className="text-text-secondary">
                <span className="text-text-primary font-semibold">Connectez-vous</span> pour rejoindre
                un club et accéder à vos avantages membres.
              </p>
              {navigate && (
                <button
                  onClick={() => navigate('auth')}
                  className="ml-auto shrink-0 px-4 py-1.5 rounded-xl bg-fieri-blue text-white text-xs font-bold hover:bg-fieri-blue/85 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fieri-blue"
                >
                  Se connecter
                </button>
              )}
            </div>
          </FadeInWhenVisible>
        )}

        {/* ── Grille des clubs ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {clubs.map((club, index) => (
            <FadeInWhenVisible key={club.id} direction="up" delay={0.08 * index}>
              <ClubCard
                club={club}
                user={user}
                onJoin={handleJoinClick}
                joiningId={joiningId}
              />
            </FadeInWhenVisible>
          ))}
        </div>

        {/* ── Section CTA bas de page ── */}
        <FadeInWhenVisible direction="up" delay={0.15}>
          <div className="mt-16 text-center p-8 rounded-3xl bg-white/[0.03] border border-white/8">
            <p className="text-text-secondary text-sm leading-relaxed max-w-xl mx-auto">
              Chaque club dispose de ses propres projets de recherche, ateliers et publications.
              Explorez les{' '}
              <button
                onClick={() => navigate && navigate('projects')}
                className="text-fieri-blue font-semibold hover:underline underline-offset-2 transition-all"
              >
                projets R&D
              </button>{' '}
              ou les{' '}
              <button
                onClick={() => navigate && navigate('student-portal')}
                className="text-fieri-orange font-semibold hover:underline underline-offset-2 transition-all"
              >
                ateliers pratiques
              </button>{' '}
              pour aller plus loin.
            </p>
          </div>
        </FadeInWhenVisible>
      </div>

      {/* ── Toast notifications ── */}
      <AnimatePresence>
        {toast && (
          <Toast
            key={toast.message}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

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
