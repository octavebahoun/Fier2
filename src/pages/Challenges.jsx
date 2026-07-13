import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, FlaskConical, CalendarDays, Upload, CheckCircle2,
  AlertCircle, X, ChevronRight, ArrowLeft, Award, Star,
  Loader2, Lock, Crown
} from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

// ───────────────────────────── Toast ─────────────────────────────
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    error:   'bg-rose-500/10 border-rose-500/30 text-rose-400',
    info:    'bg-fieri-blue/10 border-fieri-blue/30 text-fieri-blue',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  };
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md border ${styles[type] || styles.success}`}
      role="alert"
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="text-xs font-bold">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// ───────────────────────────── Spinner ─────────────────────────────
function Spinner({ label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-text-secondary">
      <Loader2 className="w-8 h-8 animate-spin text-fieri-blue" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}

// ───────────────────────────── Status pill ─────────────────────────────
function StatusPill({ status }) {
  const map = {
    OPEN:   { label: 'Ouvert', cls: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' },
    CLOSED: { label: 'Clôturé', cls: 'bg-slate-500/10 border-slate-500/30 text-slate-400' },
  };
  const s = map[status] || { label: status || '—', cls: 'bg-white/5 border-white/10 text-text-secondary' };
  return (
    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${s.cls}`}>
      {s.label}
    </span>
  );
}

function fmtDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ───────────────────────────── Create Challenge Modal ─────────────────────────────
function CreateChallengeModal({ clubId, onClose, onCreated }) {
  const { BADGE_TYPES } = useAuth();
  const [form, setForm] = useState({
    title: '', description: '', rules: '', dueDate: '', rewardBadgeType: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim() || !form.description.trim() || !form.rules.trim() || !form.dueDate) {
      setError('Titre, description, consignes et date limite sont requis.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.challenges.create(clubId, {
        title: form.title.trim(),
        description: form.description.trim(),
        rules: form.rules.trim(),
        dueDate: new Date(form.dueDate).toISOString(),
        rewardBadgeType: form.rewardBadgeType || undefined,
      });
      if (res.success) {
        onCreated();
      } else {
        setError(res.message || 'Échec de la création du challenge.');
      }
    } catch (err) {
      setError(err?.serverMessage || err?.message || 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl border border-white/10 p-7 shadow-2xl bg-bg-secondary/80 backdrop-blur-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-accent-primary/15 border border-accent-primary/30">
            <FlaskConical className="w-5 h-5 text-fieri-blue" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-fieri-blue">Nouveau</p>
            <h2 className="text-lg font-extrabold text-text-primary">Créer un challenge</h2>
          </div>
          <button onClick={onClose} className="ml-auto opacity-60 hover:opacity-100 transition-opacity">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-2 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Titre *">
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-fieri-blue/50"
              placeholder="Défi d'optimisation d'algorithmes"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
            />
          </Field>

          <Field label="Description *">
            <textarea
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-fieri-blue/50 resize-none"
              placeholder="Présentez l'objectif du challenge…"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </Field>

          <Field label="Consignes / règles *">
            <textarea
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-fieri-blue/50 resize-none"
              placeholder="Décrivez les règles et critères…"
              value={form.rules}
              onChange={(e) => update('rules', e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Date limite *">
              <input
                type="datetime-local"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-fieri-blue/50"
                value={form.dueDate}
                onChange={(e) => update('dueDate', e.target.value)}
              />
            </Field>

            <Field label="Badge de récompense">
              <select
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-fieri-blue/50"
                value={form.rewardBadgeType}
                onChange={(e) => update('rewardBadgeType', e.target.value)}
              >
                <option value="">Aucun</option>
                {(BADGE_TYPES || []).map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-text-secondary bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-fieri-blue hover:bg-fieri-blue/85 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
              {submitting ? 'Création…' : 'Créer le challenge'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

// ───────────────────────────── Challenge Card ─────────────────────────────
function ChallengeCard({ challenge, onOpen, index }) {
  return (
    <motion.button
      onClick={() => onOpen(challenge.id)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative text-left rounded-2xl overflow-hidden backdrop-blur-xl border border-white/5 bg-bg-secondary/60 shadow-lg hover:border-fieri-blue/30 transition-colors"
    >
      <div className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(108,76,241,0.12) 0%, transparent 70%)' }} />
      <div className="relative p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-fieri-blue">
            <FlaskConical className="w-5 h-5" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Challenge</span>
          </div>
          <StatusPill status={challenge.status} />
        </div>

        <h3 className="text-text-primary font-bold text-lg leading-snug mb-2">{challenge.title}</h3>
        <p className="text-text-secondary text-sm leading-relaxed line-clamp-3 mb-4">
          {challenge.description}
        </p>

        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            {fmtDate(challenge.dueDate)}
          </span>
          <span className="flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            {challenge.submissionCount ?? 0} soumission{(challenge.submissionCount ?? 0) > 1 ? 's' : ''}
          </span>
        </div>

        {challenge.rewardBadgeType && (
          <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            <Award className="w-3 h-3" /> {challenge.rewardBadgeType}
          </div>
        )}
      </div>
    </motion.button>
  );
}

// ───────────────────────────── Submission Row ─────────────────────────────
function SubmissionRow({ submission, isManager, onEvaluate, onToggleWinner, isWinnerSelected, busyId, setBusyId }) {
  const [grade, setGrade] = useState(submission.grade ?? '');
  const [feedback, setFeedback] = useState(submission.feedback ?? '');
  const [showEval, setShowEval] = useState(false);

  const handleEval = async () => {
    setBusyId(submission.id);
    await onEvaluate({
      grade: grade === '' ? undefined : Number(grade),
      feedback: feedback.trim() || undefined,
      isWinner: submission.isWinner,
    });
    setBusyId(null);
  };

  return (
    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-text-primary font-semibold text-sm truncate">{submission.memberName || 'Membre'}</p>
          {submission.fileUrl && (
            <a
              href={submission.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-fieri-blue hover:underline break-all inline-flex items-center gap-1 mt-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <Upload className="w-3 h-3 shrink-0" /> Voir le rendu
            </a>
          )}
          {submission.grade !== null && submission.grade !== undefined && (
            <p className="text-xs text-text-secondary mt-1">Note : <span className="text-text-primary font-bold">{submission.grade}/20</span></p>
          )}
          {submission.feedback && (
            <p className="text-xs text-text-secondary mt-1 italic">« {submission.feedback} »</p>
          )}
        </div>
        {submission.isWinner && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full shrink-0">
            <Crown className="w-3 h-3" /> Gagnant
          </span>
        )}
      </div>

      {isManager && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => setShowEval((s) => !s)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-fieri-blue/15 text-fieri-blue border border-fieri-blue/30 hover:bg-fieri-blue/25 transition-all"
          >
            Évaluer
          </button>
          <label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={isWinnerSelected}
              onChange={() => onToggleWinner(submission.memberId)}
              className="accent-fieri-blue w-3.5 h-3.5"
            />
            Désigner gagnant
          </label>
        </div>
      )}

      {isManager && showEval && (
        <div className="space-y-2 pt-1" onClick={(e) => e.stopPropagation()}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="number" min="0" max="20" step="0.5"
              placeholder="Note /20"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-fieri-blue/50"
            />
            <input
              placeholder="Commentaire"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-fieri-blue/50"
            />
          </div>
          <button
            onClick={handleEval}
            disabled={busyId === submission.id}
            className="text-xs font-bold px-4 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all disabled:opacity-60 flex items-center gap-1.5"
          >
            {busyId === submission.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Enregistrer l'évaluation
          </button>
        </div>
      )}
    </div>
  );
}

// ───────────────────────────── Hackathon Card ─────────────────────────────
function HackathonCard({ hackathon }) {
  return (
    <div className="p-5 rounded-2xl border border-white/5 bg-bg-secondary/60 backdrop-blur-xl shadow-lg">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 text-fieri-orange">
          <CalendarDays className="w-5 h-5" />
          <span className="text-[11px] font-bold uppercase tracking-widest">Hackathon</span>
        </div>
        <StatusPill status={hackathon.status} />
      </div>
      <h4 className="text-text-primary font-bold text-base leading-snug mb-1">{hackathon.title}</h4>
      {hackathon.theme && (
        <p className="text-xs font-semibold text-fieri-blue mb-2">Thème : {hackathon.theme}</p>
      )}
      <p className="text-xs text-text-secondary mb-3">{hackathon.description}</p>
      <div className="flex items-center gap-4 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5" /> Début : {fmtDate(hackathon.startDate)}
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5" /> Fin : {fmtDate(hackathon.endDate)}
        </span>
      </div>
    </div>
  );
}

// ───────────────────────────── Main Page ─────────────────────────────
export default function Challenges({ navigate }) {
  const { user, isAdmin, isClubResponsible } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [clubId, setClubId] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [hackathons, setHackathons] = useState([]);

  const [loadingClubs, setLoadingClubs] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState(null);

  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [winnerIds, setWinnerIds] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [closing, setClosing] = useState(false);

  const [toast, setToast] = useState(null);

  // Gérer un challenge est réservé au RESPONSABLE du club sélectionné (ou ADMIN),
  // aligné sur l'autorisation réelle du backend — plus un simple niveau de rôle.
  const isManager = isClubResponsible(clubId);
  const isMember = !!user;

  // ── Charger les clubs + sélection par défaut ──
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.clubs.getAll();
        if (!active) return;
        const all = res.success ? (res.data || []) : [];
        setClubs(all);
        const preferred =
          all.find((c) => String(c.id) === String(user?.clubId || user?.club?.id))?.id ||
          all[0]?.id ||
          null;
        setClubId(preferred);
      } catch (err) {
        if (!active) return;
        setError(err?.serverMessage || err?.message || 'Impossible de charger les clubs.');
      } finally {
        if (active) setLoadingClubs(false);
      }
    })();
    return () => { active = false; };
  }, [user]);

  // ── Charger challenges + hackathons du club sélectionné ──
  const loadClubData = useCallback(async (id) => {
    if (!id) return;
    setLoadingList(true);
    setError(null);
    try {
      const [chRes, hkRes] = await Promise.all([
        api.challenges.listByClub(id),
        api.hackathons.listByClub(id),
      ]);
      setChallenges(chRes.success ? (chRes.data || []) : []);
      setHackathons(hkRes.success ? (hkRes.data || []) : []);
    } catch (err) {
      setError(err?.serverMessage || err?.message || 'Erreur de chargement des données du club.');
      setChallenges([]);
      setHackathons([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (clubId) loadClubData(clubId);
  }, [clubId, loadClubData]);

  // ── Charger le détail d'un challenge ──
  const openChallenge = async (id) => {
    setSelectedChallenge(null);
    setWinnerIds([]);
    setLoadingDetail(true);
    try {
      const res = await api.challenges.getById(id);
      if (res.success) {
        setSelectedChallenge(res.data);
      } else {
        setToast({ message: res.message || 'Challenge introuvable.', type: 'error' });
      }
    } catch (err) {
      setToast({ message: err?.serverMessage || err?.message || 'Erreur de chargement du challenge.', type: 'error' });
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeDetail = () => {
    setSelectedChallenge(null);
    if (clubId) loadClubData(clubId);
  };

  // ── Soumettre une solution ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (!fileUrl.trim()) {
      setSubmitError('Veuillez fournir un lien de rendu (fileUrl).');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.challenges.submit(selectedChallenge.id, { fileUrl: fileUrl.trim() });
      if (res.success) {
        setToast({ message: 'Votre solution a été soumise !', type: 'success' });
        setShowSubmit(false);
        setFileUrl('');
        openChallenge(selectedChallenge.id);
      } else {
        setSubmitError(res.message || 'Échec de la soumission.');
      }
    } catch (err) {
      setSubmitError(err?.serverMessage || err?.message || 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Évaluer une soumission ──
  const handleEvaluate = async (submissionId, dto) => {
    try {
      const res = await api.challenges.evaluate(selectedChallenge.id, submissionId, dto);
      if (res.success) {
        setToast({ message: 'Évaluation enregistrée.', type: 'success' });
        openChallenge(selectedChallenge.id);
      } else {
        setToast({ message: res.message || 'Échec de l\'évaluation.', type: 'error' });
      }
    } catch (err) {
      setToast({ message: err?.serverMessage || err?.message || 'Erreur.', type: 'error' });
    }
  };

  const toggleWinner = (memberId) => {
    setWinnerIds((ids) =>
      ids.includes(memberId) ? ids.filter((m) => m !== memberId) : [...ids, memberId]
    );
  };

  // ── Clôturer le challenge ──
  const handleClose = async () => {
    setClosing(true);
    try {
      const res = await api.challenges.close(selectedChallenge.id, { winnerMemberIds: winnerIds });
      if (res.success) {
        const n = res.data?.winners?.length ?? winnerIds.length;
        setToast({
          message: n > 0 ? `Challenge clôturé — ${n} gagnant(s) désigné(s).` : 'Challenge clôturé.',
          type: 'success',
        });
        closeDetail();
      } else {
        setToast({ message: res.message || 'Échec de la clôture.', type: 'error' });
      }
    } catch (err) {
      setToast({ message: err?.serverMessage || err?.message || 'Erreur de clôture.', type: 'error' });
    } finally {
      setClosing(false);
    }
  };

  const handleChallengeCreated = () => {
    setShowCreate(false);
    setToast({ message: 'Challenge créé avec succès !', type: 'success' });
    loadClubData(clubId);
  };

  // ── Render ──
  return (
    <main className="min-h-screen">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.06] blur-[100px]"
          style={{ background: 'radial-gradient(circle, #6C4CF1, transparent)' }} />
        <div className="absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full opacity-[0.05] blur-[120px]"
          style={{ background: 'radial-gradient(circle, #e05a2b, transparent)' }} />
      </div>

      <div className="relative z-10 max-w-[92rem] mx-auto w-full py-16 px-6 md:px-12 lg:px-24">
        <div className="mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-fieri-blue/10 text-fieri-blue border border-fieri-blue/25">
            <Trophy className="w-3.5 h-3.5" />
            Compétitions & Défis
          </div>
          <h1 className="text-text-primary font-extrabold text-4xl md:text-5xl leading-tight">
            Challenges & Hackathons
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
            Participez aux défis de votre CITE, soumettez vos solutions et mesurez-vous aux autres membres.
          </p>
        </div>

        {/* Sélecteur de CITE */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-sm font-bold text-text-secondary flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-fieri-blue" /> CITE (club) :
          </label>
          {loadingClubs ? (
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
            </div>
          ) : clubs.length === 0 ? (
            <span className="text-sm text-text-secondary">Aucun club disponible.</span>
          ) : (
            <select
              value={clubId || ''}
              onChange={(e) => setClubId(e.target.value)}
              className="bg-bg-secondary/60 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-fieri-blue/50 min-w-[220px]"
            >
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>{c.name || c.title || c.kicker || c.id}</option>
              ))}
            </select>
          )}

          {isManager && (
            <button
              onClick={() => setShowCreate(true)}
              disabled={!clubId}
              className="sm:ml-auto text-xs font-bold px-4 py-2.5 rounded-xl bg-fieri-blue text-white hover:bg-fieri-blue/85 transition-all disabled:opacity-60 flex items-center gap-2"
            >
              <FlaskConical className="w-4 h-4" /> Créer un challenge
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 text-sm font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-4 py-3 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* ── Détail d'un challenge ── */}
        <AnimatePresence mode="wait">
          {selectedChallenge ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="rounded-3xl border border-white/5 bg-bg-secondary/60 backdrop-blur-xl p-7 shadow-xl"
            >
              <button
                onClick={closeDetail}
                className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-5"
              >
                <ArrowLeft className="w-4 h-4" /> Retour aux challenges
              </button>

              <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                <div>
                  <div className="flex items-center gap-2 text-fieri-blue mb-1">
                    <FlaskConical className="w-5 h-5" />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Challenge</span>
                  </div>
                  <h2 className="text-text-primary font-extrabold text-2xl leading-tight">{selectedChallenge.title}</h2>
                </div>
                <StatusPill status={selectedChallenge.status} />
              </div>

              <p className="text-text-secondary text-sm leading-relaxed mb-4">{selectedChallenge.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 text-sm">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">Date limite</p>
                  <p className="text-text-primary flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4 text-fieri-blue" /> {fmtDate(selectedChallenge.dueDate)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1">Badge de récompense</p>
                  <p className="text-text-primary flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" /> {selectedChallenge.rewardBadgeType || 'Aucun'}
                  </p>
                </div>
              </div>

              {selectedChallenge.rules && (
                <div className="p-4 rounded-xl bg-fieri-blue/[0.06] border border-fieri-blue/20 mb-6">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-fieri-blue mb-1.5">Règles & consignes</p>
                  <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">{selectedChallenge.rules}</p>
                </div>
              )}

              {/* Actions membre */}
              {isMember && selectedChallenge.status === 'OPEN' && (
                <div className="mb-6">
                  {!showSubmit ? (
                    <button
                      onClick={() => { setShowSubmit(true); setSubmitError(null); }}
                      className="text-xs font-bold px-4 py-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" /> Soumettre une solution
                    </button>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-3 p-4 rounded-xl bg-white/[0.03] border border-white/5"
                      onClick={(e) => e.stopPropagation()}>
                      <p className="text-sm font-bold text-text-primary">Votre lien de rendu</p>
                      {submitError && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-2 rounded-lg">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {submitError}
                        </div>
                      )}
                      <input
                        type="url"
                        placeholder="https://… (lien vers votre fichier)"
                        value={fileUrl}
                        onChange={(e) => setFileUrl(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-fieri-blue/50"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowSubmit(false)}
                          className="flex-1 py-2 rounded-xl text-xs font-bold text-text-secondary bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-500/85 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                          {submitting ? 'Envoi…' : 'Envoyer ma solution'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Soumissions */}
              <div className="mb-6">
                <h3 className="text-text-primary font-bold text-lg mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-fieri-blue" />
                  Soumissions ({selectedChallenge.submissions?.length ?? 0})
                </h3>
                {loadingDetail ? (
                  <Spinner label="Chargement du challenge…" />
                ) : (selectedChallenge.submissions?.length ?? 0) === 0 ? (
                  <p className="text-text-secondary text-sm italic">Aucune soumission pour le moment.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedChallenge.submissions.map((s) => (
                      <SubmissionRow
                        key={s.id}
                        submission={s}
                        isManager={isManager && selectedChallenge.status === 'OPEN'}
                        onEvaluate={(dto) => handleEvaluate(s.id, dto)}
                        onToggleWinner={toggleWinner}
                        isWinnerSelected={winnerIds.includes(s.memberId)}
                        busyId={busyId}
                        setBusyId={setBusyId}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Clôture (responsable) */}
              {isManager && selectedChallenge.status === 'OPEN' && (
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <button
                    onClick={handleClose}
                    disabled={closing}
                    className="text-xs font-bold px-4 py-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-all disabled:opacity-60 flex items-center gap-2"
                  >
                    {closing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {closing ? 'Clôture…' : 'Clôturer le challenge'}
                  </button>
                  {winnerIds.length > 0 && (
                    <span className="text-xs text-text-secondary">
                      {winnerIds.length} gagnant(s) désigné(s) au clôture.
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* ── Liste des challenges ── */}
              <section className="mb-12">
                <h2 className="text-text-primary font-bold text-xl mb-4 flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-fieri-blue" /> Challenges
                </h2>
                {loadingList ? (
                  <Spinner label="Chargement des challenges…" />
                ) : challenges.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-white/5 bg-bg-secondary/60 text-center text-text-secondary">
                    <FlaskConical className="w-8 h-8 mx-auto mb-3 opacity-60" />
                    <p className="text-sm">Aucun challenge pour cette CITE pour le moment.</p>
                    {isManager && (
                      <button
                        onClick={() => setShowCreate(true)}
                        className="mt-4 text-xs font-bold px-4 py-2 rounded-xl bg-fieri-blue text-white hover:bg-fieri-blue/85 transition-all"
                      >
                        Créer le premier challenge
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {challenges.map((c, i) => (
                      <ChallengeCard key={c.id} challenge={c} index={i} onOpen={openChallenge} />
                    ))}
                  </div>
                )}
              </section>

              {/* ── Section Hackathons ── */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-text-primary font-bold text-xl flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-fieri-orange" /> Hackathons
                  </h2>
                  {isAdmin() && (
                    <span className="text-[11px] text-text-secondary italic">
                      Création réservée Chef Universitaire
                    </span>
                  )}
                </div>
                {loadingList ? (
                  <Spinner label="Chargement des hackathons…" />
                ) : hackathons.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-white/5 bg-bg-secondary/60 text-center text-text-secondary">
                    <CalendarDays className="w-8 h-8 mx-auto mb-3 opacity-60" />
                    <p className="text-sm">Aucun hackathon associé à cette CITE.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {hackathons.map((h) => (
                      <HackathonCard key={h.id} hackathon={h} />
                    ))}
                  </div>
                )}
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showCreate && clubId && (
          <CreateChallengeModal
            clubId={clubId}
            onClose={() => setShowCreate(false)}
            onCreated={handleChallengeCreated}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
