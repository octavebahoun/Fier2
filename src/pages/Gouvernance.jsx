import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, FileBadge, UserX, Check, X, AlertCircle, Loader2,
  ChevronDown, Send, CheckCircle2, Inbox, Sparkles, GraduationCap, Award
} from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import FadeInWhenVisible from '../components/home/FadeInWhenVisible.jsx';

// ───────────────────────────── Toast Component ───────────────────────────────
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    error:   'bg-rose-500/10 border-rose-500/30 text-rose-400',
    info:    'bg-fieri-blue/10 border-fieri-blue/30 text-fieri-blue',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  };
  const icons = {
    success: CheckCircle2, error: AlertCircle, info: AlertCircle, warning: AlertCircle,
  };
  const Icon = icons[type] || CheckCircle2;
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

// ─────────────────────────── Section Card ───────────────────────────
function SectionCard({ icon: Icon, title, subtitle, accent, children }) {
  return (
    <FadeInWhenVisible direction="up" delay={0.05}>
      <motion.section
        whileHover={{ y: -4 }}
        className="glass-panel bg-bg-secondary/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: `${accent}1A`, border: `1px solid ${accent}40` }}
          >
            <Icon className="w-5 h-5" style={{ color: accent }} />
          </div>
          <div>
            <h2 className="text-text-primary font-extrabold text-xl leading-tight">{title}</h2>
            {subtitle && <p className="text-text-secondary text-xs mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {children}
      </motion.section>
    </FadeInWhenVisible>
  );
}

// ─────────────────────────── Gouvernance Page ───────────────────────────
export default function Gouvernance({ navigate }) {
  const { user, isAdmin } = useAuth();
  const [toast, setToast] = useState(null);

  // Garde : réservé CHEF_UNIVERSITAIRE / ADMIN
  const hasGovAccess = isAdmin() || user?.universityPost?.post === 'CHEF_UNIVERSITAIRE';

  // ── Sélection d'université (si user.universityId absent) ──
  const [countries, setCountries] = useState([]);
  const [countryId, setCountryId] = useState('');
  const [universities, setUniversities] = useState([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState(null);

  const universityId =
    user?.universityId ?? selectedUniversityId ?? null;

  // ── Section 1 : demandes d'exclusion ──
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [errorRequests, setErrorRequests] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [rejectReason, setRejectReason] = useState({}); // { [memberId]: reason }

  // ── Section 2 : émission d'attestation ──
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [form, setForm] = useState({ recipientId: '', title: '', category: 'FORMATION' });
  const [issueSuccess, setIssueSuccess] = useState(null);

  // ── Section 3 : attestations reçues (indicatif) ──
  const [myCerts, setMyCerts] = useState([]);
  const [loadingCerts, setLoadingCerts] = useState(false);

  // ── Chargement initial des pays (si sélecteur nécessaire) ──
  useEffect(() => {
    if (!user?.universityId) {
      (async () => {
        try {
          const res = await api.org.getCountries();
          if (res?.success) setCountries(res.data || []);
          else setErrorRequests(res?.message || 'Impossible de charger les pays.');
        } catch (err) {
          setErrorRequests(err?.serverMessage || err?.message || 'Erreur de chargement des pays.');
        }
      })();
    }
  }, [user?.universityId]);

  // ── Charger universités quand un pays est choisi ──
  useEffect(() => {
    if (!countryId) { setUniversities([]); return; }
    (async () => {
      try {
        const res = await api.org.getUniversities(countryId);
        if (res?.success) setUniversities(res.data || []);
        else setErrorRequests(res?.message || 'Impossible de charger les universités.');
      } catch (err) {
        setErrorRequests(err?.serverMessage || err?.message || 'Erreur de chargement des universités.');
      }
    })();
  }, [countryId]);

  // ── Charger les données de la gouvernance ──
  const loadRequests = useCallback(async () => {
    if (!universityId) return;
    setLoadingRequests(true);
    setErrorRequests(null);
    try {
      const res = await api.governance.listDeletionRequests(universityId);
      if (res?.success) setRequests(res.data || []);
      else setErrorRequests(res?.message || 'Impossible de charger les demandes d’exclusion.');
    } catch (err) {
      setErrorRequests(err?.serverMessage || err?.message || 'Erreur lors du chargement des demandes.');
    } finally {
      setLoadingRequests(false);
    }
  }, [universityId]);

  const loadMembers = useCallback(async () => {
    if (!universityId) return;
    setLoadingMembers(true);
    try {
      const res = await api.members.list();
      let list = res?.success ? (res.data || []) : [];
      // Filtre best-effort sur l'université du chef.
      const filtered = list.filter(
        (m) =>
          m.universityId === universityId ||
          m.branch?.universityId === universityId
      );
      setMembers(filtered.length ? filtered : list);
    } catch (err) {
      setToast({ message: err?.serverMessage || err?.message || 'Erreur de chargement des membres.', type: 'error' });
    } finally {
      setLoadingMembers(false);
    }
  }, [universityId]);

  const loadMyCerts = useCallback(async () => {
    if (!user?.id) return;
    setLoadingCerts(true);
    try {
      const res = await api.certificate.listForMember(user.id);
      if (res?.success) setMyCerts(res.data || []);
    } catch {
      // Section indicative : on ignore silencieusement en cas d'erreur.
    } finally {
      setLoadingCerts(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!hasGovAccess || !universityId) return;
    loadRequests();
    loadMembers();
    loadMyCerts();
  }, [hasGovAccess, universityId, loadRequests, loadMembers, loadMyCerts]);

  // ── Actions section 1 ──
  const handleConfirmDeletion = async (memberId, approved) => {
    if (processingId) return;
    setProcessingId(memberId);
    const reason = approved ? '' : (rejectReason[memberId] || '');
    try {
      const res = await api.governance.confirmDeletion(memberId, approved, reason);
      if (res?.success) {
        setToast({
          message: approved
            ? 'Exclusion validée — compte archivé.'
            : 'Demande d’exclusion rejetée — accès rétabli.',
          type: approved ? 'success' : 'info',
        });
        await loadRequests();
      } else {
        setToast({ message: res?.message || 'Action impossible.', type: 'error' });
      }
    } catch (err) {
      setToast({ message: err?.serverMessage || err?.message || 'Erreur lors de l’action.', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  // ── Action section 2 ──
  const handleIssue = async (e) => {
    e.preventDefault();
    if (issuing || !universityId) return;
    if (!form.recipientId || !form.title.trim()) {
      setToast({ message: 'Veuillez choisir un destinataire et saisir un intitulé.', type: 'warning' });
      return;
    }
    setIssuing(true);
    setIssueSuccess(null);
    try {
      const res = await api.certificate.issue(universityId, {
        recipientId: Number(form.recipientId),
        title: form.title.trim(),
        category: form.category,
      });
      if (res?.success) {
        setIssueSuccess(res.data);
        setForm({ recipientId: '', title: '', category: 'FORMATION' });
        setToast({ message: 'Attestation émise — le PDF a été envoyé par e-mail au destinataire.', type: 'success' });
        loadMyCerts();
      } else {
        setToast({ message: res?.message || 'Émission impossible.', type: 'error' });
      }
    } catch (err) {
      setToast({ message: err?.serverMessage || err?.message || 'Erreur lors de l’émission.', type: 'error' });
    } finally {
      setIssuing(false);
    }
  };

  // ── Garde d'accès ──
  if (!hasGovAccess) {
    return (
      <main className="min-h-screen">
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.06] blur-[100px]" style={{ background: 'radial-gradient(circle, #6C4CF1, transparent)' }} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto w-full py-24 px-6 text-center">
          <div className="glass-panel bg-bg-secondary/60 backdrop-blur-xl border border-white/5 rounded-3xl p-10">
            <ShieldCheck className="w-12 h-12 text-rose-400 mx-auto mb-4" />
            <h1 className="text-text-primary font-extrabold text-2xl mb-2">Accès réservé</h1>
            <p className="text-text-secondary text-sm leading-relaxed">
              Cette page est réservée aux <span className="text-text-primary font-semibold">Chefs Universitaires</span> et aux <span className="text-text-primary font-semibold">Administrateurs</span>.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ── Sélecteur Pays → Université ──
  if (!universityId) {
    return (
      <main className="min-h-screen">
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.06] blur-[100px]" style={{ background: 'radial-gradient(circle, #6C4CF1, transparent)' }} />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto w-full py-24 px-6">
          <h1 className="text-text-primary font-extrabold text-4xl mb-2">Gouvernance</h1>
          <p className="text-text-secondary text-sm mb-8">
            Sélectionnez votre université pour accéder aux outils de gouvernance.
          </p>
          <div className="glass-panel bg-bg-secondary/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 space-y-4">
            {errorRequests && (
              <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" /> {errorRequests}
              </div>
            )}
            <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-1">Pays</label>
            <div className="relative">
              <select
                value={countryId}
                onChange={(e) => setCountryId(e.target.value)}
                className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              >
                <option value="">— Choisir un pays —</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>{c.name || c.nom || c.id}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-1">Université</label>
            <div className="relative">
              <select
                value={selectedUniversityId ?? ''}
                onChange={(e) => setSelectedUniversityId(Number(e.target.value))}
                disabled={!universities.length}
                className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary disabled:opacity-50"
              >
                <option value="">— Choisir une université —</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>{u.name || u.nom || u.id}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Page principale ──
  return (
    <main className="min-h-screen">
      {/* Halos de fond */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.06] blur-[100px]" style={{ background: 'radial-gradient(circle, #6C4CF1, transparent)' }} />
        <div className="absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full opacity-[0.05] blur-[120px]" style={{ background: 'radial-gradient(circle, #e05a2b, transparent)' }} />
      </div>

      <div className="relative z-10 max-w-[92rem] mx-auto w-full py-16 px-6 md:px-12 lg:px-24">
        {/* Hero */}
        <FadeInWhenVisible direction="up" delay={0}>
          <div className="mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-accent-primary/10 text-accent-primary border border-accent-primary/25">
              <ShieldCheck className="w-3.5 h-3.5" />
              Espace Chef Universitaire
            </div>
            <h1 className="text-text-primary font-extrabold text-4xl md:text-5xl leading-tight">Gouvernance</h1>
            <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
              Gérez les demandes d’exclusion et émettez des attestations officielles pour les membres de votre université.
            </p>
          </div>
        </FadeInWhenVisible>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Section 1 : Demandes d'exclusion ── */}
          <SectionCard
            icon={UserX}
            title="Demandes d’exclusion"
            subtitle="Validation ou refus des exclusions demandées par les responsables de club"
            accent="#e05a2b"
          >
            {loadingRequests ? (
              <div className="flex items-center gap-2 text-text-secondary text-sm py-8 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
              </div>
            ) : errorRequests ? (
              <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" /> {errorRequests}
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center gap-2 text-text-muted py-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400/70" />
                <p className="text-sm">Aucune demande d’exclusion en attente.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
                {requests.map((req) => (
                  <motion.div
                    key={req.memberId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-white/[0.03] border border-white/8 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-text-primary font-bold text-sm truncate">{req.name}</p>
                        <p className="text-text-secondary text-xs truncate">{req.email}</p>
                        {req.branch && <p className="text-text-muted text-[11px] mt-0.5">Branche : {req.branch}</p>}
                        {req.requestedBy && (
                          <p className="text-text-muted text-[11px] mt-0.5">Demandé par : {req.requestedBy}</p>
                        )}
                      </div>
                      <span className="shrink-0 text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                        En attente
                      </span>
                    </div>

                    {req.reason && (
                      <p className="text-text-secondary text-xs italic bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                        « {req.reason} »
                      </p>
                    )}

                    <input
                      type="text"
                      value={rejectReason[req.memberId] || ''}
                      onChange={(e) => setRejectReason((r) => ({ ...r, [req.memberId]: e.target.value }))}
                      placeholder="Motif du rejet (optionnel)"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
                    />

                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleConfirmDeletion(req.memberId, true)}
                        disabled={processingId === req.memberId}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" /> Approuver
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleConfirmDeletion(req.memberId, false)}
                        disabled={processingId === req.memberId}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                      >
                        {processingId === req.memberId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />} Rejeter
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* ── Section 2 : Émettre une attestation ── */}
          <SectionCard
            icon={FileBadge}
            title="Émettre une attestation"
            subtitle="Génère un PDF signé et l’envoie par e-mail au destinataire"
            accent="#6C4CF1"
          >
            <form onSubmit={handleIssue} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-1.5">Destinataire</label>
                <div className="relative">
                  <select
                    value={form.recipientId}
                    onChange={(e) => setForm((f) => ({ ...f, recipientId: e.target.value }))}
                    disabled={loadingMembers}
                    className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary disabled:opacity-50"
                  >
                    <option value="">— Choisir un membre —</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {(m.firstname || m.firstName || '') + ' ' + (m.lastname || m.lastName || '')} {m.email ? `(${m.email})` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {loadingMembers && (
                  <p className="text-text-muted text-[11px] mt-1 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Chargement des membres…
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-1.5">Intitulé</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ex : Attestation de participation au projet X"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-1.5">Catégorie</label>
                <div className="relative">
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  >
                    <option value="FORMATION">Formation</option>
                    <option value="MANDAT">Mandat</option>
                    <option value="PROJET">Projet</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {issueSuccess && (
                <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Attestation « {issueSuccess.title} » émise (ID #{issueSuccess.id}).
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={issuing}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white bg-accent-primary hover:opacity-90 transition-all disabled:opacity-50"
              >
                {issuing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {issuing ? 'Émission…' : 'Émettre l’attestation'}
              </motion.button>
            </form>
          </SectionCard>
        </div>

        {/* ── Section 3 : Attestations reçues (indicatif) ── */}
        <FadeInWhenVisible direction="up" delay={0.1}>
          <motion.section
            whileHover={{ y: -4 }}
            className="glass-panel bg-bg-secondary/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl mt-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: '#10b9811A', border: '1px solid #10b98140' }}>
                <Award className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-text-primary font-extrabold text-xl leading-tight">Attestations reçues</h2>
                <p className="text-text-secondary text-xs mt-0.5">À titre indicatif — attestations dont vous êtes bénéficiaire</p>
              </div>
            </div>

            {loadingCerts ? (
              <div className="flex items-center gap-2 text-text-secondary text-sm py-6 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
              </div>
            ) : myCerts.length === 0 ? (
              <div className="flex flex-col items-center gap-2 text-text-muted py-6 text-center">
                <Inbox className="w-8 h-8 text-text-muted/70" />
                <p className="text-sm">Vous n’avez pas encore d’attestation enregistrée.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {myCerts.map((c) => (
                  <div key={c.id} className="rounded-2xl bg-white/[0.03] border border-white/8 p-4">
                    <div className="flex items-start gap-3">
                      <GraduationCap className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-text-primary font-bold text-sm truncate">{c.title}</p>
                        <p className="text-text-secondary text-[11px] mt-0.5">
                          {c.category} · délivrée par {c.issuedBy}
                        </p>
                        {c.createdAt && (
                          <p className="text-text-muted text-[11px] mt-0.5">
                            {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.section>
        </FadeInWhenVisible>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>
    </main>
  );
}
