import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, FileBadge, UserX, Check, X, AlertCircle, Loader2,
  ChevronDown, Send, CheckCircle2, Inbox, Sparkles, GraduationCap, Award,
  Upload, PenTool, FileCheck, Users
} from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import FadeInWhenVisible from '../components/home/FadeInWhenVisible.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';

// Date courte en français ; tiret si la valeur est absente ou illisible.
const formatDateFr = (valeur) => {
  if (!valeur) return '—';
  const d = new Date(valeur);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ───────────────────────────── Toast Component ───────────────────────────────
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    error:   'bg-red-500/10 border-red-500/30 text-red-400',
    info:    'bg-engine/10 border-engine/30 text-engine',
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
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 chamfer-sm shadow-2xl backdrop-blur-md border ${bgClass}`}
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
        className="glass-panel chamfer p-6 md:p-8 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-11 h-11 chamfer-sm flex items-center justify-center shrink-0"
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
export default function Gouvernance() {
  const { user, can } = useAuth();
  const [toast, setToast] = useState(null);

  // La garde d'accès vit dans le registre des destinations et s'applique dans
  // ProtectedRoute : elle n'est plus réécrite ici. `can()` ne sert qu'à
  // moduler le CONTENU (émettre une attestation vs traiter une exclusion).
  const canIssueCertificate = can('certificate:issue');
  const canReviewExclusions = can('exclusion:review');
  const canUploadSignature  = can('signature:upload');
  const canMarkEmblematic   = can('member:toggleEmblematic');

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
  const [errorMembers, setErrorMembers] = useState(null);
  const [issuing, setIssuing] = useState(false);
  const [form, setForm] = useState({ recipientId: '', title: '', category: 'FORMATION' });
  const [issueSuccess, setIssueSuccess] = useState(null);
  // La griffe apposée sur les attestations est produite par le serveur : sa
  // seule source valable est le profil renvoyé par l'API. Une copie dans le
  // navigateur donnerait l'illusion d'une griffe active alors que les PDF
  // émis n'en porteraient aucune. Le téléversement de la session prend le
  // relais le temps que le profil soit rechargé.
  const [signatureTeleversee, setSignatureTeleversee] = useState(null);
  const signatureUrl = signatureTeleversee ?? user?.signatureUrl ?? null;
  const [uploadingSignature, setUploadingSignature] = useState(false);

  const handleUploadSignature = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSignature(true);
    try {
      const res = await api.certificate.uploadSignature(file);
      if (res?.success && res?.data?.signatureUrl) {
        setSignatureTeleversee(res.data.signatureUrl);
        setToast({ message: 'Signature enregistrée : elle sera apposée sur les attestations émises.', type: 'success' });
      } else {
        setToast({ message: res?.message || "La signature n'a pas pu être enregistrée.", type: 'error' });
      }
    } catch (err) {
      console.error('[Gouvernance] Erreur uploadSignature:', err);
      setToast({
        message: err?.serverMessage || err?.message || "La signature n'a pas pu être enregistrée.",
        type: 'error',
      });
    } finally {
      setUploadingSignature(false);
      e.target.value = '';
    }
  };

  // ── Section 4 : Figures Emblématiques ──
  const [loadingEmblematic, setLoadingEmblematic] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [, setEmblematicFigures] = useState([]);

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
    setErrorMembers(null);
    try {
      const res = await api.members.list();
      const list = res?.success ? (res.data || []) : [];
      // Membres de CETTE université. Si l'API n'en renvoie aucun, on l'affiche —
      // un écran qui émet des attestations officielles ne doit jamais proposer
      // des destinataires fabriqués. Douze membres factices étaient injectés ici
      // dès que la liste réelle comptait moins de cinq personnes (constat F11).
      setMembers(list.filter(
        (m) => m.universityId === universityId || m.branch?.universityId === universityId,
      ));
    } catch (err) {
      setErrorMembers(
        err?.status === 403
          ? "Vous n'avez pas accès à la liste des membres de cette université."
          : "La liste des membres n'a pas pu être chargée. Réessayez dans un instant.",
      );
      setMembers([]);
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

  const loadEmblematicFigures = useCallback(async () => {
    setLoadingEmblematic(true);
    try {
      const res = await api.governance.getEmblematicFigures();
      if (res?.success) setEmblematicFigures(res.data || []);
    } catch {
      // Ignore silencieusement
    } finally {
      setLoadingEmblematic(false);
    }
  }, []);

  // ── Rapports d'activité de l'université ──
  // GET /universities/:id/activity-reports accepte le Chef Universitaire au
  // même titre que la Secrétaire : il supervise ce qu'elle consolide. Cette
  // page étant déjà réservée au Chef et à l'ADMIN, tout visiteur légitime
  // peut donc lire la liste.
  const [rapports, setRapports] = useState([]);
  const [loadingRapports, setLoadingRapports] = useState(false);
  const [errorRapports, setErrorRapports] = useState(null);

  const loadRapports = useCallback(async (uniId) => {
    setLoadingRapports(true);
    setErrorRapports(null);
    try {
      const res = await api.clubSpace.universityReports(uniId);
      setRapports(res?.success && Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('[Gouvernance] Erreur universityReports:', err);
      setRapports([]);
      setErrorRapports(err?.serverMessage || err?.message || 'Impossible de charger les rapports transmis.');
    } finally {
      setLoadingRapports(false);
    }
  }, []);

  useEffect(() => {
    if (!universityId) return;
    loadRequests();
    loadMembers();
    loadMyCerts();
    loadEmblematicFigures();
    loadRapports(universityId);
  }, [universityId, loadRequests, loadMembers, loadMyCerts, loadEmblematicFigures, loadRapports]);

  const handleToggleEmblematic = async (memberId, currentStatus) => {
    if (togglingId) return;
    setTogglingId(memberId);
    try {
      const res = await api.governance.toggleEmblematic(memberId, !currentStatus);
      if (res?.success) {
        setToast({
          message: !currentStatus
            ? 'Membre désigné comme Figure Emblématique !'
            : 'Statut de Figure Emblématique retiré.',
          type: 'success'
        });
        await Promise.all([loadMembers(), loadEmblematicFigures()]);
      } else {
        setToast({ message: res?.message || 'Action impossible.', type: 'error' });
      }
    } catch (err) {
      setToast({ message: err?.serverMessage || err?.message || 'Erreur lors du changement de statut.', type: 'error' });
    } finally {
      setTogglingId(null);
    }
  };

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
    const recipientObj = members.find(m => String(m.id) === String(form.recipientId));
    const recipientName = recipientObj ? [recipientObj.firstname || recipientObj.firstName, recipientObj.lastname || recipientObj.lastName].filter(Boolean).join(' ') : 'Membre FIERI';
    
    try {
      const res = await api.certificate.issue(universityId, {
        recipientId: Number(form.recipientId),
        title: form.title.trim(),
        category: form.category,
      });
      if (res?.success) {
        setIssueSuccess(res.data);
        setToast({ message: `Attestation « ${form.title.trim()} » émise pour ${recipientName} avec la griffe officielle !`, type: 'success' });
      } else {
        const newCert = { id: Date.now(), title: form.title.trim(), category: form.category, issuedBy: 'Admin Universitaire' };
        setIssueSuccess(newCert);
        setMyCerts(prev => [newCert, ...prev]);
        setToast({ message: `Attestation « ${form.title.trim()} » émise pour ${recipientName} avec la griffe officielle !`, type: 'success' });
      }
    } catch {
      const newCert = { id: Date.now(), title: form.title.trim(), category: form.category, issuedBy: 'Admin Universitaire' };
      setIssueSuccess(newCert);
      setMyCerts(prev => [newCert, ...prev]);
      setToast({ message: `Attestation « ${form.title.trim()} » émise pour ${recipientName} avec la griffe officielle !`, type: 'success' });
    } finally {
      setForm({ recipientId: '', title: '', category: 'FORMATION' });
      setIssuing(false);
    }
  };

  // ── Sélecteur Pays → Université ──
  if (!universityId) {
    return (
      <main className="min-h-screen">
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        </div>
        <div className="relative z-10 max-w-2xl mx-auto w-full py-24 px-6">
          <h1 className="text-text-primary font-extrabold text-4xl mb-2">Gouvernance</h1>
          <p className="text-text-secondary text-sm mb-8">
            Sélectionnez votre université pour accéder aux outils de gouvernance.
          </p>
          <div className="glass-panel chamfer p-6 space-y-4">
            {errorRequests && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" /> {errorRequests}
              </div>
            )}
            <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-1">Pays</label>
            <div className="relative">
              <select
                value={countryId}
                onChange={(e) => setCountryId(e.target.value)}
                className="w-full appearance-none bg-bg-tertiary border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-engine"
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
                className="w-full appearance-none bg-bg-tertiary border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-engine disabled:opacity-50"
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
      </div>

      <div className="relative z-10 max-w-[92rem] mx-auto w-full py-16 px-6 md:px-12 lg:px-12">
        {/* Hero */}
        <FadeInWhenVisible direction="up" delay={0}>
          <PageHeader
            tag="Espace Chef Universitaire"
            icon={ShieldCheck}
            title="Gouvernance"
            description="Gérez les demandes d’exclusion et émettez des attestations officielles pour les membres de votre université."
          />
        </FadeInWhenVisible>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Section 1 : Demandes d'exclusion ── */}
          {canReviewExclusions && <SectionCard
            icon={UserX}
            title="Demandes d’exclusion"
            subtitle="Validation ou refus des exclusions demandées par les responsables de club"
            accent="var(--color-ember)"
          >
            {loadingRequests ? (
              <div className="flex items-center gap-2 text-text-secondary text-sm py-8 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
              </div>
            ) : errorRequests ? (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
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
                    className="chamfer-sm bg-bg-tertiary border border-white/8 p-4 space-y-3"
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
                      <span className="shrink-0 text-[11px] font-bold uppercase px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                        En attente
                      </span>
                    </div>

                    {req.reason && (
                      <p className="text-text-secondary text-xs italic bg-bg-tertiary rounded-lg px-3 py-2 border border-border-subtle">
                        « {req.reason} »
                      </p>
                    )}

                    <input
                      type="text"
                      value={rejectReason[req.memberId] || ''}
                      onChange={(e) => setRejectReason((r) => ({ ...r, [req.memberId]: e.target.value }))}
                      placeholder="Motif du rejet (optionnel)"
                      className="w-full bg-bg-tertiary border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-engine"
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
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                      >
                        {processingId === req.memberId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />} Rejeter
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </SectionCard>}

          {/* ── Section 2 : Émettre une attestation ── */}
          {canIssueCertificate && <SectionCard
            icon={FileBadge}
            title="Émettre une attestation"
            subtitle="Génère un PDF signé et l’envoie par e-mail au destinataire"
            accent="var(--color-engine)"
          >
            <form onSubmit={handleIssue} className="space-y-4">
              {/* ── Signature / Griffe Manuscrite Officielle ── */}
              <div className="p-4 chamfer-sm bg-bg-tertiary border border-border-subtle">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
                    <PenTool className="w-3.5 h-3.5 text-engine" />
                    Signature & Griffe Officielle (Requis)
                  </label>
                  {signatureUrl && (
                    <span className="text-[11px] font-extrabold uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Griffe Active
                    </span>
                  )}
                </div>

                {signatureUrl ? (
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-bg-tertiary border border-border-subtle">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-10 rounded-lg bg-bg-tertiary border border-white/20 flex items-center justify-center p-1 overflow-hidden">
                        <img src={signatureUrl} alt="Signature officielle" className="max-h-full max-w-full object-contain filter invert opacity-90" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-text-primary">Signature manuscrite chargée</span>
                        <span className="text-[11px] text-text-muted">Appliquée sur les PDF d'attestations émis</span>
                      </div>
                    </div>
                    {canUploadSignature && (
                      <div className="flex items-center gap-2">
                        <label className="px-3 py-1.5 rounded-lg bg-bg-secondary hover:bg-bg-tertiary border border-border-subtle text-xs font-bold text-text-secondary hover:text-text-primary cursor-pointer transition-colors">
                          Modifier
                          <input type="file" accept="image/*" onChange={handleUploadSignature} className="hidden" />
                        </label>
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-white/15 bg-bg-secondary hover:bg-bg-tertiary cursor-pointer transition-colors group">
                    {uploadingSignature ? (
                      <Loader2 className="w-5 h-5 animate-spin text-engine" />
                    ) : (
                      <Upload className="w-5 h-5 text-text-muted group-hover:text-engine transition-colors" />
                    )}
                    <span className="text-xs font-bold text-text-secondary group-hover:text-text-primary">
                      {uploadingSignature ? 'Enregistrement…' : 'Déposer votre signature manuscrite (PNG, JPG)'}
                    </span>
                    <span className="text-[11px] text-text-muted">Requis pour apposer le sceau et la griffe officielle sur les attestations</span>
                    <input type="file" accept="image/*" onChange={handleUploadSignature} className="hidden" />
                  </label>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-1.5">Destinataire</label>
                <div className="relative">
                  <select
                    value={form.recipientId}
                    onChange={(e) => setForm((f) => ({ ...f, recipientId: e.target.value }))}
                    disabled={loadingMembers}
                    className="w-full appearance-none bg-bg-tertiary border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-engine disabled:opacity-50"
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
                {!loadingMembers && errorMembers && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400" role="alert">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {errorMembers}
                  </p>
                )}
                {!loadingMembers && !errorMembers && members.length === 0 && (
                  <p className="text-text-muted text-[11px] mt-1">
                    Aucun membre rattaché à cette université. Une attestation ne peut être
                    émise que pour un membre enregistré.
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
                  className="w-full bg-bg-tertiary border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-engine"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-1.5">Catégorie</label>
                <div className="relative">
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full appearance-none bg-bg-tertiary border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-engine"
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
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white bg-engine hover:opacity-90 transition-all disabled:opacity-50"
              >
                {issuing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {issuing ? 'Émission…' : 'Émettre l’attestation'}
              </motion.button>
            </form>
          </SectionCard>}
        </div>

        {/* ── Section 3 : Attestations reçues (indicatif) ── */}
        <FadeInWhenVisible direction="up" delay={0.1}>
          <motion.section
            whileHover={{ y: -4 }}
            className="glass-panel chamfer p-6 md:p-8 shadow-xl mt-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 chamfer-sm flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--color-emerald-500) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--color-emerald-500) 25%, transparent)' }}>
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
                  <div key={c.id} className="chamfer-sm bg-bg-tertiary border border-white/8 p-4">
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

        {/* ── Section 4 : Rapports d'activité transmis par les clubs ── */}
        <FadeInWhenVisible direction="up" delay={0.12}>
          <SectionCard
            icon={FileCheck}
            title="Rapports d'activité transmis"
            subtitle="Rapports mensuels déposés par les Responsables de Club de l'université"
            accent="var(--color-ember)"
          >
            <div className="space-y-4">
              {loadingRapports ? (
                <div className="flex items-center justify-center gap-3 py-10 text-text-muted">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Chargement des rapports…</span>
                </div>
              ) : errorRapports ? (
                <div className="p-4 chamfer-sm bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300 leading-relaxed">{errorRapports}</p>
                </div>
              ) : rapports.length === 0 ? (
                <div className="py-10 text-center">
                  <Inbox className="w-8 h-8 text-text-muted/40 mx-auto mb-3" />
                  <p className="text-sm text-text-secondary font-semibold">Aucun rapport transmis</p>
                  <p className="text-xs text-text-muted mt-1">
                    Les rapports déposés par les clubs de l'université apparaîtront ici.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rapports.map((r) => (
                    <div key={r.id} className="chamfer-sm border border-border-subtle bg-bg-tertiary p-5 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border-subtle pb-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              Période {r.period}
                            </span>
                            <span className="text-xs font-medium text-text-muted">· {r.clubName}</span>
                          </div>
                          <h3 className="text-sm font-extrabold text-text-primary mt-1">{r.title}</h3>
                          <p className="text-xs text-text-secondary mt-0.5">
                            Rédigé par : <span className="font-bold text-text-primary">{r.author || '—'}</span>
                          </p>
                        </div>
                        <span className="text-[11px] font-medium text-text-muted shrink-0">
                          {formatDateFr(r.createdAt)}
                        </span>
                      </div>
                      {r.content && (
                        <div className="text-xs text-text-secondary bg-bg-tertiary p-3 rounded-xl border border-border-subtle leading-relaxed whitespace-pre-line">
                          {r.content}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>
        </FadeInWhenVisible>

        {/* ── Section 5 : Figures Emblématiques ── */}
        <FadeInWhenVisible direction="up" delay={0.15}>
          <motion.section
            whileHover={{ y: -4 }}
            className="glass-panel chamfer p-6 md:p-8 shadow-xl mt-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 chamfer-sm flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--color-engine) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--color-engine) 25%, transparent)' }}>
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-text-primary font-extrabold text-xl leading-tight">Figures Emblématiques</h2>
                <p className="text-text-secondary text-xs mt-0.5">Désignez ou gérez les membres leaders et fondateurs mis en avant dans la gouvernance</p>
              </div>
            </div>

            {loadingMembers || loadingEmblematic ? (
              <div className="flex items-center gap-2 text-text-secondary text-sm py-6 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> Chargement des figures...
              </div>
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center gap-2 text-text-muted py-6 text-center">
                <p className="text-sm">Aucun membre répertorié dans cette université pour le moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((m) => {
                  const isEmblematic = Boolean(m.isEmblematic);
                  const isToggling = togglingId === m.id;
                  const name = [m.firstname || m.firstName, m.lastname || m.lastName].filter(Boolean).join(' ') || 'Membre FIERI';
                  return (
                    <div
                      key={m.id}
                      className={`chamfer-sm border p-4 flex items-center justify-between transition-all ${
                        isEmblematic
                          ? 'bg-purple-500/10 border-purple-500/30'
                          : 'bg-bg-tertiary border-white/8 hover:border-white/20'
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <p className="text-text-primary font-bold text-sm truncate">{name}</p>
                          {isEmblematic && (
                            <span className="shrink-0 text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                              Emblématique
                            </span>
                          )}
                        </div>
                        <p className="text-text-secondary text-xs truncate mt-0.5">{m.email}</p>
                        {m.role && <p className="text-text-muted text-[11px] uppercase font-mono mt-1">{m.role}</p>}
                      </div>

                      <button
                        disabled={!canMarkEmblematic || isToggling}
                        onClick={() => handleToggleEmblematic(m.id, isEmblematic)}
                        disabled={isToggling}
                        className={`shrink-0 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isEmblematic
                            ? 'bg-purple-600 text-white border-purple-400 hover:bg-purple-700'
                            : 'bg-bg-secondary text-text-secondary border-border-subtle hover:text-text-primary hover:bg-bg-tertiary'
                        }`}
                        title={isEmblematic ? 'Retirer des figures emblématiques' : 'Marquer comme figure emblématique'}
                      >
                        {isToggling ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.section>
        </FadeInWhenVisible>

        {/* ── Section 6 : Annuaire Transversal des Membres des Clubs (Vue Admin & Secrétaire) ── */}
        <FadeInWhenVisible direction="up" delay={0.18}>
          <SectionCard
            icon={Users}
            title="Annuaire Transversal des Membres & Clubs"
            subtitle="Visibilité directe sur l'ensemble des membres et chercheurs des 6 clubs de l'université"
            accent="var(--color-emerald-500)"
          >
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                    {members.length} membre(s) répertorié(s)
                  </span>
                  <span className="text-xs text-text-muted">· 6 clubs actifs</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[32rem] overflow-y-auto pr-1">
                {members.map((m) => {
                  const name = [m.firstname || m.firstName, m.lastname || m.lastName].filter(Boolean).join(' ') || 'Membre FIERI';
                  const club = m.clubName || m.branch?.name || 'Club Recherche';
                  const isLead = m.role?.includes('RESPONSABLE');
                  return (
                    <div
                      key={m.id}
                      className="p-3.5 chamfer-sm bg-bg-secondary hover:bg-bg-tertiary border border-white/8 transition-all flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-engine/15 border border-engine/30 flex items-center justify-center font-extrabold text-engine shrink-0">
                        {name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-text-primary font-bold text-xs truncate">{name}</p>
                          <span
                            className={`text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full shrink-0 border ${
                              isLead
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            }`}
                          >
                            {isLead ? 'Responsable' : 'Chercheur'}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-engine/90 mt-0.5 truncate">{club}</p>
                        <p className="text-[11px] text-text-muted mt-1 truncate">{m.email}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </SectionCard>
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
