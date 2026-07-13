import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartHandshake, Wallet, Fingerprint, Send, PlusCircle,
  AlertCircle, CheckCircle, Loader2, ArrowDownLeft, ArrowUpRight,
  ChevronDown, ShieldCheck, Building2, Lock
} from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

// ─────────────────────────────── Toast ────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    error:   'bg-rose-500/10 border-rose-500/30 text-rose-400',
    info:    'bg-fieri-blue/10 border-fieri-blue/30 text-fieri-blue',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  };
  const Icon = type === 'error' ? AlertCircle : CheckCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md border ${styles[type] || styles.success}`}
      role="alert"
      aria-live="polite"
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="text-xs font-bold">{message}</span>
    </motion.div>
  );
}

// ───────────────────────── Sélecteur d'université ─────────────────────────
function UniversityField({ universityId, setUniversityId, universities, loading }) {
  if (universityId && !loading) {
    const current = universities.find((u) => u.id === Number(universityId));
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-secondary/40 border border-white/5">
        <Building2 className="w-5 h-5 text-fieri-blue shrink-0" />
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-widest text-text-secondary">Université bénéficiaire</p>
          <p className="text-sm font-semibold text-text-primary truncate">
            {current?.name || `Établissement #${universityId}`}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-bg-secondary/40 border border-white/5 text-text-secondary text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Chargement des universités…
      </div>
    );
  }

  return (
    <div>
      <label className="block text-[11px] uppercase tracking-widest text-text-secondary mb-1.5">
        Université bénéficiaire *
      </label>
      <select
        value={universityId || ''}
        onChange={(e) => setUniversityId(e.target.value ? Number(e.target.value) : null)}
        className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary/60 border border-white/10 text-text-primary text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-fieri-blue"
      >
        <option value="">— Sélectionnez une université —</option>
        {universities.map((u) => (
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </select>
    </div>
  );
}

// ───────────────────────── Onglet Soutien financier ─────────────────────────
function FinancialForm({ universityId, setUniversityId, universities, user, setToast }) {
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState(user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '');
  const [donorEmail, setDonorEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [univLoading, setUnivLoading] = useState(false);

  const loadUniversities = useCallback(async () => {
    if (universityId || universities.length) return;
    setUnivLoading(true);
    try {
      const countriesRes = await api.org.getCountries();
      const countries = countriesRes?.success ? countriesRes.data : [];
      const lists = await Promise.all(
        countries.map(async (c) => {
          const r = await api.org.getUniversities(c.id);
          return r?.success ? r.data : [];
        })
      );
      const flat = lists.flat().filter(Boolean);
      if (flat.length) setUniversitiesSafe(flat);
    } catch (err) {
      setToast({ message: "Impossible de charger la liste des universités.", type: 'error' });
    } finally {
      setUnivLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [universityId, universities.length]);

  const setUniversitiesSafe = (list) => setUniversitiesInternal(list);
  const [universitiesInternal, setUniversitiesInternal] = useState(universities);

  useEffect(() => { loadUniversities(); }, [loadUniversities]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const amt = Number(amount);
    if (!universityId) { setToast({ message: 'Veuillez indiquer une université bénéficiaire.', type: 'error' }); return; }
    if (!amt || amt <= 0) { setToast({ message: 'Le montant du don doit être supérieur à 0.', type: 'error' }); return; }
    if (!donorName.trim() || !donorEmail.trim()) { setToast({ message: 'Le nom et l\'email du donateur sont requis.', type: 'error' }); return; }

    setLoading(true);
    try {
      const res = await api.support.initiateFinancial({
        universityId: Number(universityId),
        amount: amt,
        donorName: donorName.trim(),
        donorEmail: donorEmail.trim(),
        message: message.trim() || undefined,
      });
      if (res?.success && res.data?.checkoutUrl) {
        setToast({ message: 'Redirection vers le paiement sécurisé…', type: 'info' });
        window.location.href = res.data.checkoutUrl;
      } else {
        setToast({ message: res?.message || 'Échec de l\'initialisation du don.', type: 'error' });
      }
    } catch (err) {
      setToast({ message: err?.serverMessage || err?.message || 'Une erreur est survenue lors du don.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel bg-bg-secondary/60 backdrop-blur-xl border border-white/5 rounded-3xl p-7 space-y-5"
    >
      <div className="flex items-center gap-3 mb-1">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-fieri-blue/15 border border-fieri-blue/30">
          <Wallet className="w-5 h-5 text-fieri-blue" />
        </div>
        <div>
          <h3 className="text-text-primary font-bold text-lg">Soutien financier</h3>
          <p className="text-text-secondary text-xs">Paiement sécurisé via Genius Pay</p>
        </div>
      </div>

      <UniversityField
        universityId={universityId}
        setUniversityId={setUniversityId}
        universities={universitiesInternal}
        loading={univLoading}
      />

      <div>
        <label className="block text-[11px] uppercase tracking-widest text-text-secondary mb-1.5">Montant (FCFA) *</label>
        <input
          type="number" min="1" step="any"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Ex : 25000"
          className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary/60 border border-white/10 text-text-primary text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-fieri-blue"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-text-secondary mb-1.5">Nom du donateur *</label>
          <input
            type="text" value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            placeholder="Jean Dupont"
            className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary/60 border border-white/10 text-text-primary text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-fieri-blue"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-text-secondary mb-1.5">Email *</label>
          <input
            type="email" value={donorEmail}
            onChange={(e) => setDonorEmail(e.target.value)}
            placeholder="jean@exemple.com"
            className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary/60 border border-white/10 text-text-primary text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-fieri-blue"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] uppercase tracking-widest text-text-secondary mb-1.5">Message (optionnel)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Un mot pour l'université…"
          className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary/60 border border-white/10 text-text-primary text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-fieri-blue resize-none"
        />
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white bg-fieri-blue hover:bg-fieri-blue/85 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-fieri-blue disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {loading ? 'Initialisation…' : 'Faire un don'}
      </motion.button>
    </motion.form>
  );
}

// ─────────────────── Onglet Soutien physique / matériel ───────────────────
function PhysicalForm({ universityId, setUniversityId, universities, user, setToast }) {
  const [donorName, setDonorName] = useState(user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '');
  const [donorEmail, setDonorEmail] = useState(user?.email || '');
  const [physicalType, setPhysicalType] = useState('MATERIEL');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [univLoading, setUnivLoading] = useState(false);

  const [offerId, setOfferId] = useState(null);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  const setUniversitiesSafe = (list) => setUniversitiesInternal(list);
  const [universitiesInternal, setUniversitiesInternal] = useState(universities);

  const loadUniversities = useCallback(async () => {
    if (universityId || universitiesInternal.length) return;
    setUnivLoading(true);
    try {
      const countriesRes = await api.org.getCountries();
      const countries = countriesRes?.success ? countriesRes.data : [];
      const lists = await Promise.all(
        countries.map(async (c) => {
          const r = await api.org.getUniversities(c.id);
          return r?.success ? r.data : [];
        })
      );
      const flat = lists.flat().filter(Boolean);
      if (flat.length) setUniversitiesSafe(flat);
    } catch (err) {
      setToast({ message: "Impossible de charger la liste des universités.", type: 'error' });
    } finally {
      setUnivLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [universityId, universitiesInternal.length]);

  useEffect(() => { loadUniversities(); }, [loadUniversities]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!donorName.trim() || !donorEmail.trim()) { setToast({ message: 'Le nom et l\'email sont requis.', type: 'error' }); return; }
    if (!description.trim()) { setToast({ message: 'Veuillez décrire le bien offert.', type: 'error' }); return; }

    setLoading(true);
    try {
      const res = await api.support.submitPhysical({
        donorName: donorName.trim(),
        donorEmail: donorEmail.trim(),
        physicalType,
        description: description.trim(),
        universityId: universityId ? Number(universityId) : undefined,
      });
      if (res?.success && res.data?.supportOfferId) {
        setOfferId(res.data.supportOfferId);
        setToast({ message: 'Offre enregistrée. Signez par empreinte pour finaliser.', type: 'success' });
      } else {
        setToast({ message: res?.message || 'Échec de la déclaration.', type: 'error' });
      }
    } catch (err) {
      setToast({ message: err?.serverMessage || err?.message || 'Une erreur est survenue.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!offerId || signing) return;
    setSigning(true);
    try {
      const res = await api.support.signBiometric(offerId, {});
      if (res?.success) {
        setSigned(true);
        setToast({ message: 'Soutien validé, reçu signé envoyé par email.', type: 'success' });
      } else {
        setToast({ message: res?.message || 'Échec de la signature.', type: 'error' });
      }
    } catch (err) {
      setToast({ message: err?.serverMessage || err?.message || 'Erreur lors du scan d\'empreinte.', type: 'error' });
    } finally {
      setSigning(false);
    }
  };

  const reset = () => {
    setOfferId(null); setSigned(false); setDescription(''); setPhysicalType('MATERIEL');
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel bg-bg-secondary/60 backdrop-blur-xl border border-white/5 rounded-3xl p-7 space-y-5"
    >
      <div className="flex items-center gap-3 mb-1">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-accent-secondary/15 border border-accent-secondary/30">
          <HeartHandshake className="w-5 h-5 text-accent-secondary" />
        </div>
        <div>
          <h3 className="text-text-primary font-bold text-lg">Soutien physique / matériel</h3>
          <p className="text-text-secondary text-xs">Matériel, locaux, logistique…</p>
        </div>
      </div>

      <UniversityField
        universityId={universityId}
        setUniversityId={setUniversityId}
        universities={universitiesInternal}
        loading={univLoading}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-text-secondary mb-1.5">Nom du partenaire *</label>
          <input type="text" value={donorName} onChange={(e) => setDonorName(e.target.value)} placeholder="Nom / Organisation"
            className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary/60 border border-white/10 text-text-primary text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-fieri-blue" />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-text-secondary mb-1.5">Email *</label>
          <input type="email" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} placeholder="contact@exemple.com"
            className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary/60 border border-white/10 text-text-primary text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-fieri-blue" />
        </div>
      </div>

      <div>
        <label className="block text-[11px] uppercase tracking-widest text-text-secondary mb-1.5">Type de bien *</label>
        <div className="relative">
          <select
            value={physicalType}
            onChange={(e) => setPhysicalType(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary/60 border border-white/10 text-text-primary text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-fieri-blue appearance-none pr-9"
          >
            <option value="MATERIEL">Matériel</option>
            <option value="LOCAUX">Locaux</option>
            <option value="LOGISTIQUE">Logistique</option>
            <option value="AUTRE">Autre</option>
          </select>
          <ChevronDown className="w-4 h-4 text-text-secondary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <div>
        <label className="block text-[11px] uppercase tracking-widest text-text-secondary mb-1.5">Description *</label>
        <textarea
          value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
          placeholder="Décrivez le bien, sa quantité, son état…"
          className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary/60 border border-white/10 text-text-primary text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-fieri-blue resize-none"
        />
      </div>

      {/* Étape signature empreinte */}
      <AnimatePresence mode="wait">
        {!offerId ? (
          <motion.button
            key="declare"
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white bg-accent-secondary hover:bg-accent-secondary/85 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
            {loading ? 'Enregistrement…' : 'Déclarer'}
          </motion.button>
        ) : (
          <motion.div
            key="sign"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-5 rounded-2xl bg-fieri-blue/5 border border-fieri-blue/20 text-center space-y-4"
          >
            <p className="text-xs text-text-secondary">
              Offre <span className="font-mono text-text-primary">#{offerId}</span> enregistrée — dernière étape : signature par empreinte digitale.
            </p>

            <div className="flex flex-col items-center gap-3">
              <motion.div
                animate={signing && !signed ? { scale: [1, 1.08, 1], opacity: [1, 0.6, 1] } : {}}
                transition={signing && !signed ? { repeat: Infinity, duration: 1.1 } : {}}
                className={`w-20 h-20 rounded-2xl flex items-center justify-center border ${
                  signed ? 'bg-emerald-500/15 border-emerald-500/40' : 'bg-fieri-blue/10 border-fieri-blue/30'
                }`}
              >
                <Fingerprint className={`w-10 h-10 ${signed ? 'text-emerald-400' : 'text-fieri-blue'}`} />
              </motion.div>

              {signed ? (
                <div className="space-y-2">
                  <p className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-bold">
                    <CheckCircle className="w-4 h-4" /> Soutien validé
                  </p>
                  <p className="text-xs text-text-secondary max-w-xs mx-auto">
                    Reçu signé envoyé par email au donateur.
                  </p>
                  <button
                    type="button" onClick={reset}
                    className="text-xs text-fieri-blue hover:underline underline-offset-2"
                  >
                    Déclarer une nouvelle offre
                  </button>
                </div>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleSign}
                  disabled={signing}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-fieri-blue hover:bg-fieri-blue/85 transition-all disabled:opacity-60"
                >
                  {signing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4" />}
                  {signing ? 'Scan en cours…' : 'Scanner l\'empreinte'}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
}

// ───────────────────────── Section Trésorerie ─────────────────────────
function TreasurySection({ universityId, setToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [txType, setTxType] = useState('DON');
  const [txAmount, setTxAmount] = useState('');
  const [txLabel, setTxLabel] = useState('');
  const [txLoading, setTxLoading] = useState(false);

  const loadTreasury = useCallback(async () => {
    if (!universityId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.treasury.getTreasury(Number(universityId));
      if (res?.success) {
        setData(res.data);
      } else {
        setError(res?.message || 'Impossible de charger la trésorerie.');
      }
    } catch (err) {
      setError(err?.serverMessage || err?.message || 'Erreur lors du chargement de la trésorerie.');
    } finally {
      setLoading(false);
    }
  }, [universityId]);

  useEffect(() => { loadTreasury(); }, [loadTreasury]);

  const handleRecord = async (e) => {
    e.preventDefault();
    if (txLoading || !universityId) return;
    const amt = Number(txAmount);
    if (!amt || amt === 0) { setToast({ message: 'Le montant doit être non nul.', type: 'error' }); return; }
    if (!txLabel.trim()) { setToast({ message: 'Un libellé est requis.', type: 'error' }); return; }

    setTxLoading(true);
    try {
      // L'UI parle de « EXPENSE » ; le backend attend « DEPENSE ».
      const backendType = txType === 'EXPENSE' ? 'DEPENSE' : 'DON';
      const res = await api.treasury.recordTransaction(Number(universityId), {
        type: backendType,
        amount: amt,
        label: txLabel.trim(),
      });
      if (res?.success) {
        setToast({ message: 'Transaction enregistrée.', type: 'success' });
        setTxAmount(''); setTxLabel('');
        loadTreasury();
      } else {
        setToast({ message: res?.message || 'Échec de l\'enregistrement.', type: 'error' });
      }
    } catch (err) {
      setToast({ message: err?.serverMessage || err?.message || 'Erreur lors de l\'enregistrement.', type: 'error' });
    } finally {
      setTxLoading(false);
    }
  };

  const isExpense = (t) => t.type === 'DEPENSE' || t.type === 'EXPENSE';

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel bg-bg-secondary/60 backdrop-blur-xl border border-white/5 rounded-3xl p-7 space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-emerald-500/15 border border-emerald-500/30">
          <Wallet className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-text-primary font-bold text-lg">Trésorerie de l'université</h3>
          {data?.universityName && (
            <p className="text-text-secondary text-xs">{data.universityName}</p>
          )}
        </div>
      </div>

      {!universityId ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm">
          <Lock className="w-5 h-5 shrink-0" />
          Aucune université associée à votre compte : la trésorerie est inaccessible.
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-text-secondary text-sm">
          <Loader2 className="w-5 h-5 animate-spin" /> Chargement du grand livre…
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" /> {error}
        </div>
      ) : (
        <>
          {/* Solde */}
          <div className="flex items-center justify-between p-5 rounded-2xl bg-bg-secondary/40 border border-white/5">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-text-secondary">Solde actuel</p>
              <p className="text-3xl font-extrabold text-text-primary">
                {Number(data?.balance || 0).toLocaleString('fr-FR')} <span className="text-base font-bold text-text-secondary">FCFA</span>
              </p>
            </div>
            <ShieldCheck className="w-8 h-8 text-emerald-400/70" />
          </div>

          {/* Formulaire d'enregistrement */}
          <form onSubmit={handleRecord} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-3">
              <label className="block text-[11px] uppercase tracking-widest text-text-secondary mb-1.5">Type</label>
              <div className="relative">
                <select
                  value={txType}
                  onChange={(e) => setTxType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary/60 border border-white/10 text-text-primary text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-fieri-blue appearance-none pr-9"
                >
                  <option value="DON">Don (entrée)</option>
                  <option value="EXPENSE">Dépense (sortie)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-text-secondary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-[11px] uppercase tracking-widest text-text-secondary mb-1.5">Montant (FCFA)</label>
              <input type="number" min="0.01" step="any" value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)} placeholder="0"
                className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary/60 border border-white/10 text-text-primary text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-fieri-blue" />
            </div>
            <div className="sm:col-span-4">
              <label className="block text-[11px] uppercase tracking-widest text-text-secondary mb-1.5">Libellé</label>
              <input type="text" value={txLabel}
                onChange={(e) => setTxLabel(e.target.value)} placeholder="Ex : Achat de matériel"
                className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary/60 border border-white/10 text-text-primary text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-fieri-blue" />
            </div>
            <div className="sm:col-span-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit" disabled={txLoading}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white bg-fieri-blue hover:bg-fieri-blue/85 transition-all disabled:opacity-60"
              >
                {txLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              </motion.button>
            </div>
          </form>

          {/* Grand livre */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-text-secondary mb-3">Grand livre des transactions</h4>
            {!data?.transactions || data.transactions.length === 0 ? (
              <p className="text-center text-text-secondary text-sm py-8 italic">Aucune transaction enregistrée pour le moment.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {data.transactions.map((t) => {
                  const expense = isExpense(t);
                  const Icon = expense ? ArrowUpRight : ArrowDownLeft;
                  return (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-bg-secondary/40 border border-white/5"
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        expense ? 'bg-rose-500/15 text-rose-400' : 'bg-emerald-500/15 text-emerald-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-text-primary font-medium truncate">{t.label}</p>
                        <p className="text-[11px] text-text-secondary">
                          {t.recordedBy || 'Système'}
                          {t.createdAt ? ` · ${new Date(t.createdAt).toLocaleDateString('fr-FR')}` : ''}
                        </p>
                      </div>
                      <span className={`text-sm font-bold shrink-0 ${expense ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {expense ? '−' : '+'}{Number(t.amount).toLocaleString('fr-FR')} F
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </motion.section>
  );
}

// ─────────────────────────── Page Soutiens ───────────────────────────
export default function Soutiens({ navigate }) {
  const { user, can } = useAuth();
  const [tab, setTab] = useState('financial');
  const [toast, setToast] = useState(null);

  const userUniversityId = user?.universityId ?? user?.universityPost?.universityId ?? null;
  const [universityId, setUniversityId] = useState(userUniversityId);

  const isTreasurer =
    user?.universityPost?.post === 'TRESORIER' ||
    user?.universityPost?.post === 'CHEF_UNIVERSITAIRE';
  const showTreasury = can('admin:access') || isTreasurer;

  const tabs = [
    { id: 'financial', label: 'Soutien financier', icon: Wallet },
    { id: 'physical', label: 'Soutien physique', icon: HeartHandshake },
  ];

  return (
    <main id="soutiens" className="min-h-screen">
      {/* Halos de fond */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.06] blur-[100px]" style={{ background: 'radial-gradient(circle, #6C4CF1, transparent)' }} />
        <div className="absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full opacity-[0.05] blur-[120px]" style={{ background: 'radial-gradient(circle, #e05a2b, transparent)' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full py-16 px-6 md:px-12">
        {/* Hero */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-fieri-blue/10 text-fieri-blue border border-fieri-blue/25">
            <HeartHandshake className="w-3.5 h-3.5" />
            Engagement & Mécénat
          </div>
          <h1 className="text-text-primary font-extrabold text-4xl md:text-5xl leading-tight">Soutenir FIERI</h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
            Votre générosité alimente la recherche. Faites un don en ligne ou proposez un soutien matériel,
            validé par signature numérique.
          </p>
        </div>

        {/* Onglets */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="inline-flex p-1 rounded-2xl bg-bg-secondary/50 border border-white/5 backdrop-blur-xl">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    active ? 'bg-fieri-blue text-white shadow-lg' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="mb-10">
          <AnimatePresence mode="wait">
            {tab === 'financial' ? (
              <FinancialForm
                key="financial"
                universityId={universityId}
                setUniversityId={setUniversityId}
                universities={[]}
                user={user}
                setToast={setToast}
              />
            ) : (
              <PhysicalForm
                key="physical"
                universityId={universityId}
                setUniversityId={setUniversityId}
                universities={[]}
                user={user}
                setToast={setToast}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Section Trésorerie */}
        {showTreasury && (
          <div className="mt-4">
            <TreasurySection universityId={universityId} setToast={setToast} />
          </div>
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast key={toast.message} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </main>
  );
}
