import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, User, Clock, CheckCircle, Info, Lock, BookOpen,
  GraduationCap, Zap, Filter, Search, Award, AlertCircle, Users
} from 'lucide-react';
import mockDb from '../services/mockDb.js';
import { useAuth } from '../context/AuthContext.jsx';
import FadeInWhenVisible from '../components/home/FadeInWhenVisible.jsx';

// ─────────────────────────── Toast Component ───────────────────────────
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgClass =
    type === 'success'
      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
      : type === 'warning'
      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
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

// ─────────────────────────── Card Component ───────────────────────────
function WorkshopCard({ workshop, club, user, onToggleRegister, isToggling, navigate }) {
  const isFull = workshop.placesLeft === 0;
  
  // Dynamic styling based on club accent color
  const clubAccent = club ? club.accent : '#6C4CF1';
  const progressPercent = Math.min(100, Math.round(((workshop.totalPlaces - workshop.placesLeft) / workshop.totalPlaces) * 100));

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }}
      className="relative flex flex-col rounded-2xl overflow-hidden backdrop-blur-xl border flex-1"
      style={{
        background: 'rgba(13, 17, 32, 0.65)',
        borderColor: `${clubAccent}30`,
        boxShadow: `0 4px 32px ${clubAccent}08`,
      }}
    >
      {/* Top Border Glow Ribbon */}
      <div 
        className="absolute top-0 left-0 w-full h-[3px] transition-opacity duration-350"
        style={{
          background: `linear-gradient(90deg, ${clubAccent}aa, ${clubAccent}30)`
        }}
      />

      {/* Radiant Glow on Hover */}
      <div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${clubAccent}10 0%, transparent 65%)`,
        }}
      />

      {/* Card Header */}
      <div className="p-6 pb-4 flex items-start justify-between gap-4">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span 
              className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full"
              style={{
                background: `${clubAccent}12`,
                color: clubAccent,
                border: `1px solid ${clubAccent}30`
              }}
            >
              {workshop.level}
            </span>
            {club && (
              <span className="text-[10px] font-bold text-text-secondary bg-white/5 border border-white/8 px-2.5 py-0.5 rounded-full truncate">
                {club.kicker}
              </span>
            )}
          </div>
          <h3 className="text-text-primary font-extrabold text-lg leading-snug group-hover:text-text-primary pt-1">
            {workshop.title}
          </h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="px-6 py-2 flex-1 flex flex-col justify-between">
        <p className="text-text-secondary text-xs sm:text-sm font-light leading-relaxed mb-5 line-clamp-3">
          {workshop.desc}
        </p>

        {/* Occupancy Indicator Block */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">Remplissage de l'atelier</span>
            <span className="font-bold text-text-primary">
              {workshop.totalPlaces - workshop.placesLeft} / {workshop.totalPlaces} places
            </span>
          </div>
          
          {/* Custom Accent Styled Progress Bar */}
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${progressPercent}%`,
                background: isFull 
                  ? 'linear-gradient(90deg, #f43f5e, #be123c)'
                  : `linear-gradient(90deg, ${clubAccent}, ${clubAccent}80)` 
              }}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            {isFull ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                <AlertCircle className="w-3 h-3 shrink-0" />
                Complet (Waitlist Active)
              </span>
            ) : (
              <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/18 px-2 py-0.5 rounded-full">
                {workshop.placesLeft} places restantes
              </span>
            )}

            {/* List count display */}
            {workshop.waitlistUsers && workshop.waitlistUsers.length > 0 && (
              <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                <Users className="w-3.5 h-3.5 shrink-0" />
                {workshop.waitlistUsers.length} en attente
              </span>
            )}
          </div>
        </div>

        {/* Technical Metadata Column */}
        <div className="border-t border-white/5 pt-4 pb-2 space-y-2.5">
          <div className="flex items-center gap-2.5 text-xs text-text-secondary">
            <User className="w-4 h-4 text-text-muted shrink-0" />
            <span className="truncate">Instructeur : <strong className="text-text-primary font-medium">{workshop.instructor}</strong></span>
          </div>

          <div className="flex items-center justify-between text-xs text-text-secondary">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-text-muted shrink-0" />
              <span>{workshop.date}</span>
            </div>
            <div className="flex items-center gap-1 text-text-secondary font-medium">
              <Clock className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span>{workshop.duration}</span>
            </div>
          </div>
        </div>

        {/* Mini waitlist preview inside card for real-time visual verification (AC 4.4 proof of FIFO) */}
        {workshop.waitlistUsers && workshop.waitlistUsers.length > 0 && (
          <div className="mt-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <div className="text-[9px] font-black uppercase tracking-widest text-text-muted">
              Liste d'attente ordonnée (FIFO) :
            </div>
            <div className="flex flex-col gap-1">
              {workshop.waitlistUsers.slice(0, 3).map((name, i) => (
                <div key={i} className="flex items-center justify-between text-[11px] text-text-secondary pl-1 font-mono">
                  <span>{i + 1}. {name}</span>
                  {i === 0 && <span className="text-[9px] text-amber-500 uppercase font-black tracking-wider animate-pulse">Premier en attente</span>}
                </div>
              ))}
              {workshop.waitlistUsers.length > 3 && (
                <div className="text-[10px] text-text-muted italic pl-1">
                  + {workshop.waitlistUsers.length - 3} autres membres en attente
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="px-6 pb-6 pt-4">
        {user ? (
          workshop.registered ? (
            <motion.button
              onClick={() => onToggleRegister(workshop.id)}
              disabled={isToggling}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 cursor-pointer focus:outline-none"
              style={{
                background: 'linear-gradient(90deg, #10b981, #059669)',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)'
              }}
              aria-label={`Se désinscrire de ${workshop.title}`}
            >
              {isToggling ? (
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {isToggling ? 'Mise à jour…' : 'Inscrit — Se désinscrire'}
            </motion.button>
          ) : workshop.inWaitlist ? (
            <motion.button
              onClick={() => onToggleRegister(workshop.id)}
              disabled={isToggling}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer focus:outline-none"
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                color: '#f59e0b',
                border: '1.5px solid rgba(245, 158, 11, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f59e0b';
                e.currentTarget.style.color = '#000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
                e.currentTarget.style.color = '#f59e0b';
              }}
              aria-label={`Quitter la file d'attente pour ${workshop.title}`}
            >
              {isToggling ? (
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
              {isToggling 
                ? 'Mise à jour…' 
                : `En attente (Position #${workshop.waitlistPosition})`
              }
            </motion.button>
          ) : (
            <motion.button
              onClick={() => onToggleRegister(workshop.id)}
              disabled={isToggling}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer focus:outline-none"
              style={{
                background: `${clubAccent}1a`,
                color: clubAccent,
                border: `1.5px solid ${clubAccent}45`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = clubAccent;
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${clubAccent}1a`;
                e.currentTarget.style.color = clubAccent;
              }}
              aria-label={`S'inscrire à l'atelier ${workshop.title}`}
            >
              {isToggling ? (
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <BookOpen className="w-4 h-4" />
              )}
              {isToggling
                ? 'Réservation…'
                : isFull
                ? 'Rejoindre la file d\'attente'
                : 'S\'inscrire à la session'
              }
            </motion.button>
          )
        ) : (
          <motion.button
            onClick={() => navigate?.('auth')}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-text-secondary bg-white/5 border border-white/10 hover:bg-white/8 hover:text-text-primary transition-all duration-200 cursor-pointer focus:outline-none"
            aria-label="Connexion requise pour réserver"
          >
            <Lock className="w-4 h-4" />
            Connexion requise
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────── Workshops Page ───────────────────────────
export default function Workshops({ navigate }) {
  const { user } = useAuth();
  
  // Data lists loaded dynamically
  const [workshops, setWorkshops] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClubId, setSelectedClubId] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');

  // Load static data from mock database
  useEffect(() => {
    const loadData = () => {
      try {
        setWorkshops(mockDb.workshops.getAll());
        setClubs(mockDb.clubs.getAll());
      } catch (err) {
        console.error("Erreur lors de la récupération des ateliers:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filtered and searched workshops list
  const filteredWorkshops = useMemo(() => {
    return workshops.filter(w => {
      const matchesSearch = 
        w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.instructor.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesClub = selectedClubId === 'ALL' || w.clubId === selectedClubId;
      const matchesLevel = selectedLevel === 'ALL' || w.level === selectedLevel;

      return matchesSearch && matchesClub && matchesLevel;
    });
  }, [workshops, searchQuery, selectedClubId, selectedLevel]);

  // General counts and stats
  const registeredCount = useMemo(() => {
    return workshops.filter(w => w.registered).length;
  }, [workshops]);

  const waitlistCount = useMemo(() => {
    return workshops.filter(w => w.inWaitlist).length;
  }, [workshops]);

  const openPlacesSum = useMemo(() => {
    return workshops.reduce((acc, w) => acc + w.placesLeft, 0);
  }, [workshops]);

  // Handle registration action (registers, waitlists or deregisters user)
  const handleToggleRegister = (workshopId) => {
    if (!user || togglingId) return;

    setTogglingId(workshopId);

    // Simulate subtle latency for Visual Haptic effect
    setTimeout(() => {
      try {
        const userFullName = `${user.firstName} ${user.lastName}`;
        const res = mockDb.workshops.toggleRegister(workshopId, userFullName);
        
        if (res && res.success) {
          // Re-load list locally to preserve integrity
          setWorkshops(mockDb.workshops.getAll());

          let feedbackText = '';
          let feedbackType = 'success';

          if (res.action === 'registered') {
            feedbackText = `Inscription confirmée pour '${res.workshop.title}' !`;
          } else if (res.action === 'waitlisted') {
            feedbackText = `Vous êtes placé en liste d'attente (Position #${res.position}) !`;
            feedbackType = 'warning';
          } else if (res.action === 'deregistered') {
            feedbackText = `Vous êtes désinscrit de l'atelier '${res.workshop.title}'.`;
            feedbackType = 'warning';

            if (res.promotedUser) {
              feedbackText = `Place libérée et réattribuée automatiquement au premier membre en attente (${res.promotedUser}) !`;
              feedbackType = 'success';
            }
          } else if (res.action === 'removed_from_waitlist') {
            feedbackText = `Vous avez quitté la file d'attente de '${res.workshop.title}'.`;
            feedbackType = 'warning';
          }

          setToast({ message: feedbackText, type: feedbackType });
        }
      } catch (err) {
        console.error("Failed to register for workshop", err);
        setToast({ message: "Une erreur s'est produite lors de l'enregistrement.", type: 'danger' });
      } finally {
        setTogglingId(null);
      }
    }, 350);
  };

  return (
    <main id="workshops" className="min-h-screen">
      {/* ── Halos de fond Cosmique ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-40 right-10 w-[550px] h-[550px] rounded-full opacity-[0.06] blur-[100px]"
          style={{ background: 'radial-gradient(circle, #6C4CF1, transparent)' }}
        />
        <div
          className="absolute top-1/2 left-[-150px] w-[600px] h-[600px] rounded-full opacity-[0.05] blur-[120px]"
          style={{ background: 'radial-gradient(circle, #10b981, transparent)' }}
        />
      </div>

      <div className="relative z-10 max-w-[92rem] mx-auto w-full py-16 px-6 md:px-12 lg:px-24">
        
        {/* ── Hero / Title Block ── */}
        <FadeInWhenVisible direction="up" delay={0}>
          <div className="text-center mb-16 space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
              <GraduationCap className="w-3.5 h-3.5" />
              Student Hub · Academic Academy
            </div>

            <h1 className="text-text-primary font-extrabold text-4xl md:text-5xl leading-tight">
              Académie Académique
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
              Développez des compétences de pointe dans nos bootcamps techniques.
              Inscrivez-vous en un clic ou rejoignez la file d'attente FIFO interactive.
            </p>

            {/* Quick Stats Grid */}
            <div className="flex items-center justify-center flex-wrap gap-6 pt-2">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>
                  <strong className="text-text-primary font-bold">{workshops.length}</strong> bootcamps programmés
                </span>
              </div>
              <div className="w-px h-4 bg-white/15 hidden sm:block" />
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Users className="w-4 h-4 text-fieri-blue" />
                <span>
                  <strong className="text-text-primary font-bold">{openPlacesSum}</strong> places disponibles
                </span>
              </div>
              
              {user && (registeredCount > 0 || waitlistCount > 0) && (
                <>
                  <div className="w-px h-4 bg-white/15 hidden sm:block" />
                  <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      {registeredCount > 0 && (
                        <span><strong className="text-text-primary font-bold">{registeredCount}</strong> atelier{registeredCount > 1 ? 's' : ''} inscrit{registeredCount > 1 ? 's' : ''}</span>
                      )}
                      {registeredCount > 0 && waitlistCount > 0 && " | "}
                      {waitlistCount > 0 && (
                        <span className="text-amber-400"><strong className="text-text-primary font-bold">{waitlistCount}</strong> en attente</span>
                      )}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </FadeInWhenVisible>

        {/* ── Connect Banner for Guest Visitors ── */}
        {!user && (
          <FadeInWhenVisible direction="up" delay={0.05}>
            <div className="mb-10 flex items-center gap-4 p-4.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-sm">
              <Lock className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-text-secondary flex-1">
                <span className="text-text-primary font-semibold">Une session active est requise</span> pour vous inscrire aux ateliers, réserver vos places et participer aux bootcamps.
              </p>
              <button
                onClick={() => navigate('auth')}
                className="shrink-0 px-4.5 py-1.5 rounded-xl bg-emerald-500 text-bg-primary text-xs font-black hover:bg-emerald-400 transition-colors cursor-pointer"
              >
                Se connecter
              </button>
            </div>
          </FadeInWhenVisible>
        )}

        {/* ── Search & Dual Filters Block ── */}
        <FadeInWhenVisible direction="up" delay={0.1}>
          <div className="mb-10 p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
            
            {/* Row 1: Search and Level Filter */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted" />
                <input
                  type="text"
                  placeholder="Rechercher un atelier, instructeur, thème..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/8 text-sm text-text-primary focus:outline-none focus:border-emerald-500/60 focus:bg-white/8 transition-all font-light"
                />
              </div>

              {/* Difficulty Level Selector */}
              <div className="flex items-center gap-2.5 self-start md:self-auto overflow-x-auto pb-1 md:pb-0 w-full md:w-auto">
                <span className="text-xs font-bold text-text-muted flex items-center gap-1.5 shrink-0">
                  <Filter className="w-3.5 h-3.5 text-text-muted" />
                  Difficulté :
                </span>
                <div className="flex bg-white/5 border border-white/8 rounded-xl p-1 text-xs">
                  {['ALL', 'Débutant', 'Intermédiaire', 'Avancé'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        selectedLevel === level
                          ? 'bg-emerald-500 text-bg-primary font-black shadow-md'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {level === 'ALL' ? 'Tout' : level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Club Accented Filters (Dynamic alignment) */}
            <div className="space-y-2.5 border-t border-white/5 pt-5">
              <span className="text-xs font-bold text-text-secondary block">
                Filtrer par Thématique Scientifique (Club R&D) :
              </span>
              
              <div className="flex flex-wrap gap-2.5">
                {/* Reset button */}
                <button
                  onClick={() => setSelectedClubId('ALL')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedClubId === 'ALL'
                      ? 'bg-white text-bg-primary border-white font-black shadow-lg shadow-white/5'
                      : 'bg-white/5 border-white/8 text-text-secondary hover:text-text-primary hover:bg-white/8'
                  }`}
                >
                  Tous les thèmes
                </button>

                {/* Dynamic Club Pills colored by accent */}
                {clubs.map((club) => {
                  const isActive = selectedClubId === club.id;
                  const accentColor = club.accent;
                  
                  return (
                    <button
                      key={club.id}
                      onClick={() => setSelectedClubId(club.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer focus:outline-none"
                      style={{
                        background: isActive ? accentColor : 'rgba(255, 255, 255, 0.03)',
                        borderColor: isActive ? accentColor : 'rgba(255, 255, 255, 0.08)',
                        color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.65)',
                        boxShadow: isActive ? `0 0 16px ${accentColor}35` : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = accentColor;
                          e.currentTarget.style.color = '#fff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)';
                        }
                      }}
                    >
                      {club.kicker}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </FadeInWhenVisible>

        {/* ── Workshops List Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6.5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-panel h-96 rounded-2xl animate-pulse bg-bg-secondary/40 border border-border-subtle" />
            ))}
          </div>
        ) : filteredWorkshops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6.5">
            {filteredWorkshops.map((w, index) => {
              const matchedClub = clubs.find(c => c.id === w.clubId);
              return (
                <FadeInWhenVisible key={w.id} direction="up" delay={0.06 * index}>
                  <WorkshopCard
                    workshop={w}
                    club={matchedClub}
                    user={user}
                    onToggleRegister={handleToggleRegister}
                    isToggling={togglingId === w.id}
                    navigate={navigate}
                  />
                </FadeInWhenVisible>
              );
            })}
          </div>
        ) : (
          <FadeInWhenVisible direction="up" delay={0.05}>
            <div className="text-center py-16 px-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <Info className="w-8 h-8 text-text-muted mx-auto mb-3" />
              <h3 className="text-text-primary font-bold text-base">Aucun atelier trouvé</h3>
              <p className="text-text-secondary text-sm font-light max-w-sm mx-auto mt-1.5 leading-relaxed">
                Aucun bootcamp ne correspond à vos filtres de recherche actuels. Essayez de réinitialiser vos critères.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedClubId('ALL');
                  setSelectedLevel('ALL');
                }}
                className="mt-4 px-5 py-2 text-xs font-bold rounded-xl bg-white/5 border border-white/8 hover:bg-white/8 text-text-primary transition-all cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </FadeInWhenVisible>
        )}

        {/* ── Interactive Waitlist FAQ Panel ── */}
        <FadeInWhenVisible direction="up" delay={0.15}>
          <div className="mt-16 p-7.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <h4 className="text-sm font-black uppercase tracking-widest text-text-primary flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400 animate-bounce" />
              Comment fonctionne le Moteur de File d'Attente FIFO ?
            </h4>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-light">
              Notre système attribue de façon automatique et équitable les places libérées. Si un participant inscrit décide de <strong className="text-emerald-400">se désinscrire</strong> d'un atelier complet, sa place est instantanément retirée de façon immuable. 
              Le premier membre enregistré sur la <strong className="text-amber-400 font-semibold">liste d'attente</strong> (First-In, First-Out) est immédiatement promu au rang d'inscrit sans que le nombre de places restantes ne change. 
              Le nouveau membre promu reçoit instantanément une notification système dans son centre de contrôle.
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
