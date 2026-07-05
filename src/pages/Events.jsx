import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Users, Trophy, ChevronDown, ChevronUp,
  Radio, X, Clock, CheckCircle2, Zap, ExternalLink
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext.jsx';
import { useAuthGate } from '@/context/AuthGateContext.jsx';
import { api } from '@/services/api.js';

// ─── Toast Component ────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const styles = {
    success: 'bg-emerald-900/80 border-emerald-500/40 text-emerald-100',
    warning: 'bg-amber-900/80 border-amber-500/40 text-amber-100',
    error:   'bg-red-900/80 border-red-500/40 text-red-100',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-xl text-sm font-medium
        shadow-2xl border backdrop-blur-md pointer-events-auto max-w-sm
        ${styles[toast.type] || styles.success}`}
    >
      {toast.message}
    </motion.div>
  );
}

// ─── Live Badge ──────────────────────────────────────────────────────────────
function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
      bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold tracking-wider">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-live inline-block" />
      LIVE
    </span>
  );
}

// ─── Timeline Item ───────────────────────────────────────────────────────────
function TimelineItem({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-start gap-3"
    >
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-accent-primary/20 border border-accent-primary/40
        flex items-center justify-center mt-0.5 animate-timeline-glow">
        <Clock size={12} className="text-accent-primary" />
      </div>
      <div>
        <p className="text-xs text-text-secondary font-mono">{item.time}</p>
        <p className="text-sm text-text-primary font-medium leading-tight">{item.title}</p>
      </div>
    </motion.div>
  );
}

// ─── Live Modal ──────────────────────────────────────────────────────────────
function LiveModal({ event, onClose }) {
  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-auto"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
            className="relative bg-bg-secondary/95 border border-border-subtle rounded-2xl shadow-2xl
              w-full max-w-3xl mx-4 overflow-hidden pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <LiveBadge />
                <h3 className="text-text-primary font-semibold text-sm line-clamp-1">{event.title}</h3>
              </div>
              <button
                id="live-modal-close"
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary hover:text-text-primary
                  transition-colors cursor-pointer pointer-events-auto"
              >
                <X size={18} />
              </button>
            </div>

            {/* Video player */}
            <div className="relative w-full aspect-video">
              <iframe
                src={event.liveUrl}
                title={`Live: ${event.title}`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Footer info */}
            <div className="px-5 py-3 border-t border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-secondary text-xs">
                <MapPin size={12} />
                <span>{event.location}</span>
              </div>
              <a
                href={event.liveUrl.replace('/embed/', '/watch?v=')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-accent-primary hover:underline"
              >
                Ouvrir dans YouTube <ExternalLink size={11} />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Event Card ──────────────────────────────────────────────────────────────
function EventCard({ event, user, onRegister, onLiveAccess, isRegistering }) {
  const [timelineOpen, setTimelineOpen] = React.useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.5 }}
      className="glass-panel rounded-2xl border border-border-subtle overflow-hidden
        hover:-translate-y-1 transition-transform duration-200 flex flex-col"
    >
      {/* Card Header */}
      <div className="relative px-6 pt-6 pb-4">
        {/* Ambient glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full
          bg-accent-primary/10 blur-[40px] pointer-events-none" />

        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {event.isLive && <LiveBadge />}
              {event.prizePool !== 'Accès libre' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                  bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium">
                  <Trophy size={10} />
                  {event.prizePool}
                </span>
              )}
            </div>
            <h2 className="text-text-primary font-bold text-lg leading-tight mb-1">{event.title}</h2>
            <p className="text-text-secondary text-sm">{event.tagline}</p>
          </div>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-text-secondary text-xs mt-4">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} className="text-accent-primary" />
            {event.date}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin size={12} className="text-accent-primary" />
            {event.location}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={12} className="text-accent-primary" />
            {event.participantsCount.toLocaleString()} participants
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="px-6 pb-4">
        <p className="text-text-secondary text-sm leading-relaxed">{event.desc}</p>
      </div>

      {/* Timeline accordion */}
      <div className="px-6 pb-4">
        <button
          id={`timeline-toggle-${event.id}`}
          onClick={() => setTimelineOpen(v => !v)}
          className="flex items-center gap-2 text-xs text-accent-primary font-semibold
            hover:text-accent-primary/80 transition-colors cursor-pointer w-full text-left"
        >
          <Zap size={12} />
          Programme de l'événement
          {timelineOpen
            ? <ChevronUp size={14} className="ml-auto" />
            : <ChevronDown size={14} className="ml-auto" />}
        </button>

        <AnimatePresence>
          {timelineOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-3 flex flex-col gap-3 pl-1">
                {event.timeline.map((item, i) => (
                  <TimelineItem key={i} item={item} index={i} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className="mx-6 border-t border-border-subtle" />

      {/* Action buttons */}
      <div className="px-6 py-4 flex flex-wrap gap-3 mt-auto">
        {/* Register button */}
        {!event.registered ? (
          <button
            id={`register-btn-${event.id}`}
            onClick={() => onRegister(event.id)}
            disabled={user && isRegistering === event.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
              transition-all duration-200 cursor-pointer
              ${!user
                ? 'bg-white/5 border border-border-subtle text-text-primary hover:bg-white/10 hover:border-accent-primary/50'
                : 'bg-accent-primary text-white hover:bg-accent-primary/90 active:scale-95 shadow-lg shadow-accent-primary/20'
              }`}
          >
            {isRegistering === event.id ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 size={15} />
            )}
            {!user ? 'Connectez-vous pour s\'inscrire' : 'S\'inscrire'}
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
            bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
            <CheckCircle2 size={15} />
            Inscrit ✓
          </div>
        )}

        {/* Live access button — only visible when event.isLive */}
        {event.isLive && (
          <button
            id={`live-btn-${event.id}`}
            onClick={() => onLiveAccess(event)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
              bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-200
              active:scale-95 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Radio size={15} className="animate-pulse" />
            Rejoindre le Live
          </button>
        )}
      </div>
    </motion.article>
  );
}

// ─── Main Events Page ─────────────────────────────────────────────────────────
export default function Events({ navigate }) {
  const { user } = useAuth();
  const { promptLogin } = useAuthGate();
  const [events, setEvents] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRegistering, setIsRegistering] = React.useState(null);
  const [activeLiveEvent, setActiveLiveEvent] = React.useState(null);
  const [toast, setToast] = React.useState(null);

  // App.jsx fournit navigate à toutes les pages; Events ne route pas directement.
  void navigate;

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load events on mount
  React.useEffect(() => {
    const loadEvents = async () => {
      const res = await api.events.getAll();
      if (res.success) setEvents(res.data);
      setIsLoading(false);
    };
    loadEvents();
  }, []);

  // Handle event registration
  const handleRegister = async (eventId) => {
    if (!user) {
      promptLogin("Connectez-vous pour vous inscrire à cet événement.");
      return;
    }
    setIsRegistering(eventId);
    const res = await api.events.register(eventId);
    if (res.success) {
      // Immutable state update
      setEvents(prev => prev.map(ev =>
        ev.id === eventId
          ? { ...ev, registered: true, participantsCount: ev.participantsCount + 1 }
          : ev
      ));
      showToast(res.message || 'Inscription confirmée !', 'success');
    } else {
      showToast(res.message || 'Erreur lors de l\'inscription.', 'error');
    }
    setIsRegistering(null);
  };

  // Handle live streaming access gating
  const handleLiveAccess = (event) => {
    if (!user) {
      promptLogin("Connectez-vous pour accéder au live.");
      return;
    }
    if (!event.registered) {
      showToast('Inscription requise pour ce Live. Enregistrez-vous d\'abord !', 'warning');
      return;
    }
    // Access granted
    setActiveLiveEvent(event);
  };

  // Stats derived from data
  const liveCount = events.filter(e => e.isLive).length;
  const totalParticipants = events.reduce((sum, e) => sum + e.participantsCount, 0);

  return (
    <div className="min-h-screen bg-bg-primary relative">
      {/* Background halos */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full
          bg-accent-primary/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full
          bg-emerald-500/5 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-[92rem] mx-auto w-full py-24 px-6 md:px-12 lg:px-24">

        {/* ── Hero Section ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-6 rounded-full bg-accent-primary" />
            <span className="text-accent-primary text-sm font-semibold tracking-widest uppercase">
              Pôle Événements
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4 leading-tight">
            Conférences &{' '}
            <span className="text-gradient-cosmic">Hackathons FIERI</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
            Participez aux événements scientifiques exclusifs, accédez aux flux live en direct
            et connectez-vous avec des experts de la recherche africaine.
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-6 mt-8">
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl
              bg-bg-secondary/60 border border-border-subtle">
              <Radio size={16} className="text-emerald-400" />
              <span className="text-text-secondary text-sm">
                <span className="text-text-primary font-bold">{liveCount}</span> en direct
              </span>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl
              bg-bg-secondary/60 border border-border-subtle">
              <Users size={16} className="text-accent-primary" />
              <span className="text-text-secondary text-sm">
                <span className="text-text-primary font-bold">{totalParticipants.toLocaleString()}</span> participants
              </span>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl
              bg-bg-secondary/60 border border-border-subtle">
              <Calendar size={16} className="text-accent-primary" />
              <span className="text-text-secondary text-sm">
                <span className="text-text-primary font-bold">{events.length}</span> événements
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Loading State ── */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[0, 1].map(i => (
              <div key={i} className="glass-panel rounded-2xl border border-border-subtle p-6 animate-pulse">
                <div className="h-4 w-24 bg-white/10 rounded mb-4" />
                <div className="h-6 w-3/4 bg-white/10 rounded mb-2" />
                <div className="h-4 w-1/2 bg-white/10 rounded mb-6" />
                <div className="h-20 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* ── Events Grid ── */}
        {!isLoading && (
          <>
            {/* Live events first */}
            {events.filter(e => e.isLive).length > 0 && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="mb-12"
              >
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-text-primary font-bold text-xl">En ce moment</h2>
                  <LiveBadge />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {events.filter(e => e.isLive).map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      user={user}
                      onRegister={handleRegister}
                      onLiveAccess={handleLiveAccess}
                      isRegistering={isRegistering}
                    />
                  ))}
                </div>
              </motion.section>
            )}

            {/* Upcoming events */}
            {events.filter(e => !e.isLive).length > 0 && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                <h2 className="text-text-primary font-bold text-xl mb-6">Prochainement</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {events.filter(e => !e.isLive).map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      user={user}
                      onRegister={handleRegister}
                      onLiveAccess={handleLiveAccess}
                      isRegistering={isRegistering}
                    />
                  ))}
                </div>
              </motion.section>
            )}

            {/* Empty state */}
            {events.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-16 h-16 rounded-full bg-accent-primary/10 flex items-center justify-center mb-4">
                  <Calendar size={28} className="text-accent-primary" />
                </div>
                <p className="text-text-primary font-semibold text-lg mb-2">
                  Aucun événement programmé
                </p>
                <p className="text-text-secondary text-sm max-w-xs">
                  Les prochains hackathons et conférences FIERI seront annoncés ici.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Live Modal */}
      <LiveModal
        event={activeLiveEvent}
        onClose={() => setActiveLiveEvent(null)}
      />

      {/* Toast */}
      <AnimatePresence>
        <Toast toast={toast} />
      </AnimatePresence>
    </div>
  );
}
