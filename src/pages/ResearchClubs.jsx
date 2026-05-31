import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, CheckCircle, Lock, Cpu, Leaf, Building2,
  Brain, Rocket, Zap, ChevronRight, Star
} from 'lucide-react';
import { mockDb } from '../services/mockDb';
import { useAuth } from '../context/AuthContext.jsx';
import FadeInWhenVisible from '../components/home/FadeInWhenVisible.jsx';

// ─────────────────────────── Toast Component ───────────────────────────
function Toast({ message, type = 'success', onClose }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgClass =
    type === 'success'
      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
      : 'bg-rose-500/10 border-rose-500/30 text-rose-400';

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
      <CheckCircle className="w-5 h-5 shrink-0" />
      <span className="text-xs font-bold">{message}</span>
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

// ─────────────────────────── ResearchClubs Page ───────────────────────────
export default function ResearchClubs({ navigate }) {
  const { user } = useAuth();
  const [clubs, setClubs] = useState(() => mockDb.clubs.getAll());
  const [toast, setToast] = useState(null);
  const [joiningId, setJoiningId] = useState(null);

  const joinedCount = clubs.filter((c) => c.joined).length;
  const totalMembers = clubs.reduce((acc, c) => acc + c.membersCount, 0);

  const handleJoin = (clubId) => {
    if (!user || joiningId) return;

    setJoiningId(clubId);

    // Simulation d'une légère latence pour l'effet haptique visuel
    setTimeout(() => {
      const updated = mockDb.clubs.toggleJoin(clubId);
      if (updated) {
        setClubs((prev) =>
          prev.map((c) => (c.id === clubId ? updated : c))
        );

        if (updated.joined) {
          mockDb.notifications.add(
            `Vous avez rejoint le club "${updated.kicker}" avec succès !`
          );
          setToast({ message: `Bienvenue dans le club ${updated.kicker} !`, type: 'success' });
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
                onJoin={handleJoin}
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
    </main>
  );
}
