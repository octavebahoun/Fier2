import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartHandshake, Wallet, Fingerprint, Send, PlusCircle,
  CheckCircle, Loader2,
  ChevronDown, Building2
} from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/ui/Toast.jsx';

// ─────────────────────────────── Toast ────────────────────────────────
function UniversityField({ universityId, setUniversityId, universities, loading }) {
  if (universityId && !loading) {
    const current = universities.find((u) => u.id === Number(universityId));
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-secondary border border-border-subtle">
        <Building2 className="w-5 h-5 text-engine shrink-0" />
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
      <div className="flex items-center gap-2 p-3 rounded-xl bg-bg-secondary border border-border-subtle text-text-secondary text-sm">
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
        className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary border border-border-subtle text-text-primary text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-engine"
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
function FinancialForm({ universityId, setUniversityId, universities, user, notify }) {
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState(user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '');
  const [donorEmail, setDonorEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [univLoading, setUnivLoading] = useState(false);

  const setUniversitiesSafe = (list) => setUniversitiesInternal(list);
  const [universitiesInternal, setUniversitiesInternal] = useState(universities);

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
    } catch {
      notify("Impossible de charger la liste des universités.", 'error');
    } finally {
      setUnivLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [universityId, universities.length]);

  useEffect(() => { loadUniversities(); }, [loadUniversities]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const amt = Number(amount);
    if (!universityId) { notify('Veuillez indiquer une université bénéficiaire.', 'error'); return; }
    if (!amt || amt <= 0) { notify('Le montant du don doit être supérieur à 0.', 'error'); return; }
    if (!donorName.trim() || !donorEmail.trim()) { notify('Le nom et l\'email du donateur sont requis.', 'error'); return; }

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
        notify('Redirection vers le paiement sécurisé…', 'info');
        window.location.href = res.data.checkoutUrl;
      } else {
        notify(res?.message || 'Échec de l\'initialisation du don.', 'error');
      }
    } catch (err) {
      notify(err?.serverMessage || err?.message || 'Une erreur est survenue lors du don.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel chamfer p-7 space-y-5"
    >
      <div className="flex items-center gap-3 mb-1">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-engine/15 border border-engine/30">
          <Wallet className="w-5 h-5 text-engine" />
        </div>
        <div>
          <h3 className="text-text-primary font-bold text-lg">Soutien financier</h3>
          <p className="text-text-secondary text-xs">Paiement sécurisé via Genius Pay (Passerelle simulée pour le jury)</p>
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
          className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary border border-border-subtle text-text-primary text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-engine"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-text-secondary mb-1.5">Nom du donateur *</label>
          <input
            type="text" value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            placeholder="Jean Dupont"
            className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary border border-border-subtle text-text-primary text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-engine"
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-text-secondary mb-1.5">Email *</label>
          <input
            type="email" value={donorEmail}
            onChange={(e) => setDonorEmail(e.target.value)}
            placeholder="jean@exemple.com"
            className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary border border-border-subtle text-text-primary text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-engine"
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
          className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary border border-border-subtle text-text-primary text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-engine resize-none"
        />
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white bg-engine hover:bg-engine/85 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-engine disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {loading ? 'Initialisation…' : 'Faire un don'}
      </motion.button>
    </motion.form>
  );
}

// ─────────────────── Onglet Soutien physique / matériel ───────────────────
function PhysicalForm({ universityId, setUniversityId, universities, user, notify }) {
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
    } catch {
      notify("Impossible de charger la liste des universités.", 'error');
    } finally {
      setUnivLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [universityId, universitiesInternal.length]);

  useEffect(() => { loadUniversities(); }, [loadUniversities]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!donorName.trim() || !donorEmail.trim()) { notify('Le nom et l\'email sont requis.', 'error'); return; }
    if (!description.trim()) { notify('Veuillez décrire le bien offert.', 'error'); return; }

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
        notify('Offre enregistrée. Signez par empreinte pour finaliser.', 'success');
      } else {
        notify(res?.message || 'Échec de la déclaration.', 'error');
      }
    } catch (err) {
      notify(err?.serverMessage || err?.message || 'Une erreur est survenue.', 'error');
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
        notify('Soutien validé, reçu signé envoyé par email.', 'success');
      } else {
        notify(res?.message || 'Échec de la signature.', 'error');
      }
    } catch (err) {
      notify(err?.serverMessage || err?.message || 'Erreur lors du scan d\'empreinte.', 'error');
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
      className="glass-panel chamfer p-7 space-y-5"
    >
      <div className="flex items-center gap-3 mb-1">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-ember/15 border border-ember/30">
          <HeartHandshake className="w-5 h-5 text-ember" />
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
            className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary border border-border-subtle text-text-primary text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-engine" />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-text-secondary mb-1.5">Email *</label>
          <input type="email" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} placeholder="contact@exemple.com"
            className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary border border-border-subtle text-text-primary text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-engine" />
        </div>
      </div>

      <div>
        <label className="block text-[11px] uppercase tracking-widest text-text-secondary mb-1.5">Type de bien *</label>
        <div className="relative">
          <select
            value={physicalType}
            onChange={(e) => setPhysicalType(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary border border-border-subtle text-text-primary text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-engine appearance-none pr-9"
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
          className="w-full px-3 py-2.5 rounded-xl bg-bg-secondary border border-border-subtle text-text-primary text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-engine resize-none"
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
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white bg-ember hover:bg-ember/85 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ember disabled:opacity-60"
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
            className="p-5 chamfer-sm bg-engine/5 border border-engine/20 text-center space-y-4"
          >
            <p className="text-xs text-text-secondary">
              Offre <span className="font-mono text-text-primary">#{offerId}</span> enregistrée — dernière étape : signature par empreinte digitale.
            </p>

            <div className="flex flex-col items-center gap-3">
              <motion.div
                animate={signing && !signed ? { scale: [1, 1.08, 1], opacity: [1, 0.6, 1] } : {}}
                transition={signing && !signed ? { repeat: Infinity, duration: 1.1 } : {}}
                className={`w-20 h-20 chamfer-sm flex items-center justify-center border ${
                  signed ? 'bg-emerald-500/15 border-emerald-500/40' : 'bg-engine/10 border-engine/30'
                }`}
              >
                <Fingerprint className={`w-10 h-10 ${signed ? 'text-emerald-400' : 'text-engine'}`} />
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
                    className="text-xs text-engine hover:underline underline-offset-2"
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
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-engine hover:bg-engine/85 transition-all disabled:opacity-60"
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
export default function Soutiens() {
  const { user } = useAuth();
  const { notify } = useToast();
  const [tab, setTab] = useState('financial');

  const userUniversityId = user?.universityId ?? user?.universityPost?.universityId ?? null;
  const [universityId, setUniversityId] = useState(userUniversityId);

  // Le profil se charge de façon asynchrone : dès que l'université du membre est
  // connue, on la pré-sélectionne (sans écraser un choix manuel déjà fait).
  useEffect(() => {
    if (userUniversityId) setUniversityId((prev) => prev ?? userUniversityId);
  }, [userUniversityId]);

  // Traitement automatique du retour de simulation de paiement (Genius Pay Mock)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isMock = params.get('mock_payment');
    const offerId = params.get('offerId');
    if (isMock && offerId) {
      api.support
        .confirmMockPayment(offerId)
        .then((res) => {
          if (res?.success) {
            const formatted = res.amount ? `${Number(res.amount).toLocaleString('fr-FR')} FCFA` : '';
            notify(`Paiement validé. Don de ${formatted} crédité à la trésorerie.`, 'success');
          }
        })
        .catch((err) => {
          notify(err?.serverMessage || err?.message || "Le paiement n'a pas pu être validé.", 'error');
        })
        .finally(() => {
          window.history.replaceState({}, document.title, window.location.pathname);
        });
    }
  }, []);

  const tabs = [
    { id: 'financial', label: 'Soutien financier', icon: Wallet },
    { id: 'physical', label: 'Soutien physique', icon: HeartHandshake },
  ];

  return (
    <main id="soutiens" className="min-h-screen">
      {/* Halos de fond */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full py-16 px-6 md:px-12">
        {/* Hero */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-engine/10 text-engine border border-engine/25">
            <HeartHandshake className="w-3.5 h-3.5" />
            Engagement & Mécénat
          </div>
          <h1 className="text-text-primary font-extrabold text-4xl md:text-5xl leading-tight font-display">Soutenir FIERI</h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
            Votre générosité alimente la recherche. Faites un don en ligne ou proposez un soutien matériel,
            validé par signature numérique.
          </p>
        </div>

        {/* Onglets */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="inline-flex p-1 chamfer-sm bg-bg-secondary border border-border-subtle">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    active ? 'bg-engine text-white shadow-lg' : 'text-text-secondary hover:text-text-primary'
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
                notify={notify}
              />
            ) : (
              <PhysicalForm
                key="physical"
                universityId={universityId}
                setUniversityId={setUniversityId}
                universities={[]}
                user={user}
                notify={notify}
              />
            )}
          </AnimatePresence>
        </div>

      </div>
    </main>
  );
}
