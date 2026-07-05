import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Sparkles, Plus, Award, Coins, BookOpen,
  User, Mail, FileText, CheckCircle2, X, ShieldAlert,
  MapPin, Clock, ArrowRight, Briefcase
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';

// ─────────────────────────── Toast Notification Component ───────────────────────────
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgClass = type === 'success'
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
      <CheckCircle2 className="w-5 h-5 shrink-0" />
      <span className="text-xs font-bold">{message}</span>
    </motion.div>
  );
}

// ─────────────────────────── Offers Page Component ───────────────────────────
export default function Offers({ navigate }) {
  const { user, hasMinRole } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [appliedOpportunityIds, setAppliedOpportunityIds] = useState(new Set());

  // Application Modal state
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [applyForm, setApplyForm] = useState({ name: '', email: '', achievements: '', cvFile: '' });
  const [applyError, setApplyError] = useState('');

  // Publication Modal state (for researchers/partners)
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishForm, setPublishForm] = useState({ title: '', type: 'Exclusivités Partenaires', discipline: '', salary: '', description: '', requirements: '' });
  const [publishError, setPublishError] = useState('');

  // Refs for modal keyboard accessibility & focus traps
  const applyModalRef = useRef(null);
  const applyInputRef = useRef(null);
  const publishModalRef = useRef(null);
  const publishInputRef = useRef(null);
  const applyTriggerRef = useRef(null);
  const publishTriggerRef = useRef(null);

  const fetchOpportunities = async () => {
    try {
      const res = await api.opportunities.getAll();
      if (res.success) {
        setOpportunities(res.data);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des opportunités:", err);
    }
  };

  const fetchMyApplications = async () => {
    if (!user) {
      setAppliedOpportunityIds(new Set());
      return;
    }
    try {
      const res = await api.applications.getMyApplications();
      if (res.success && res.data) {
        setAppliedOpportunityIds(new Set(res.data.map(app => app.opportunityId)));
      }
    } catch (err) {
      console.error("Erreur lors de la récupération de mes candidatures:", err);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  useEffect(() => {
    fetchMyApplications();
  }, [user]);

  // Autofill student form fields once user changes
  useEffect(() => {
    if (user) {
      setApplyForm(prev => ({
        ...prev,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : (user.name || ''),
        email: user.email || ''
      }));
    }
  }, [user]);

  // Filter offers by text query
  const filteredOpportunities = opportunities.filter(opt => {
    const matchesSearch =
      opt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.discipline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.author.toLowerCase().includes(searchQuery.toLowerCase());

    return opt.type === 'Exclusivités Partenaires' && matchesSearch;
  });

  // Modal keydowns for Escape closing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedOpportunity) closeApplyModal();
        if (isPublishModalOpen) closePublishModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOpportunity, isPublishModalOpen]);

  // Focus trap helpers
  useEffect(() => {
    if (selectedOpportunity && applyInputRef.current) {
      setTimeout(() => applyInputRef.current.focus(), 50);
    }
  }, [selectedOpportunity]);

  useEffect(() => {
    if (isPublishModalOpen && publishInputRef.current) {
      setTimeout(() => publishInputRef.current.focus(), 50);
    }
  }, [isPublishModalOpen]);

  // --- ACTIONS FOR APPLYING (STUDENT / MEMBER CONNECTED) ---
  const openApplyModal = (opt) => {
    if (!user) {
      navigate?.('auth');
      return;
    }
    applyTriggerRef.current = document.activeElement;
    setSelectedOpportunity(opt);
    setApplyError('');
    setApplyForm({
      name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : (user.name || ''),
      email: user.email || '',
      achievements: '',
      cvFile: ''
    });
  };

  const closeApplyModal = () => {
    setSelectedOpportunity(null);
    if (applyTriggerRef.current) applyTriggerRef.current.focus();
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyForm.name || !applyForm.email || !applyForm.achievements) {
      setApplyError("Veuillez remplir tous les champs requis.");
      return;
    }
    try {
      const res = await api.applications.submit({
        opportunityId: selectedOpportunity.id,
        coverLetter: applyForm.achievements,
        cvUrl: applyForm.cvFile ? `https://fieri-storage.local/${applyForm.cvFile}` : null
      });

      if (res.success) {
        setToast("Votre demande d'activation a été transmise au partenaire social avec succès ! Vous recevrez les instructions de l'offre par email.");
        setAppliedOpportunityIds(prev => new Set([...prev, selectedOpportunity.id]));
        closeApplyModal();
      } else {
        setApplyError(res.message || "Impossible de soumettre la candidature.");
      }
    } catch (err) {
      setApplyError("Erreur réseau ou serveur lors de l'envoi de la candidature.");
    }
  };

  // --- ACTIONS FOR CREATING (RESEARCHER CONNECTED) ---
  const openPublishModal = () => {
    if (!user) {
      navigate?.('auth');
      return;
    }
    const isResearcher = hasMinRole('CHERCHEUR');
    if (!isResearcher) {
      setToast("Accès refusé. Cette fonctionnalité est réservée aux chercheurs certifiés.");
      return;
    }
    publishTriggerRef.current = document.activeElement;
    setIsPublishModalOpen(true);
    setPublishError('');
    setPublishForm({
      title: '',
      type: 'Exclusivités Partenaires',
      discipline: '',
      salary: '',
      description: '',
      requirements: ''
    });
  };

  const closePublishModal = () => {
    setIsPublishModalOpen(false);
    if (publishTriggerRef.current) publishTriggerRef.current.focus();
  };

  const handlePublishSubmit = async (e) => {
    e.preventDefault();
    if (!publishForm.title || !publishForm.discipline || !publishForm.description || !publishForm.requirements || !publishForm.salary) {
      setPublishError("Tous les champs sont requis.");
      return;
    }

    try {
      const res = await api.opportunities.create({
        title: publishForm.title,
        type: 'Exclusivités Partenaires',
        discipline: publishForm.discipline,
        salary: publishForm.salary,
        description: publishForm.description,
        requirements: publishForm.requirements,
        author: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : (user.name || "Chercheur FIERI")
      });

      if (res.success) {
        setToast("Nouvelle exclusivité de partenariat publiée avec succès !");
        fetchOpportunities();
        closePublishModal();
      } else {
        setPublishError(res.message || "Erreur lors de la sauvegarde.");
      }
    } catch (err) {
      setPublishError("Erreur réseau ou serveur lors de la publication de l'opportunité.");
    }
  };

  // Motion variants
  const gridVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="flex flex-col gap-12 relative w-full">
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative z-10">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold w-fit">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>AVANTAGES SOCIAUX & PARTENARIATS</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-text-secondary to-rose-400 bg-clip-text text-transparent leading-tight">
            Offres & Exclusivités
          </h1>
          <p className="text-text-secondary text-sm leading-relaxed">
            Profitez des avantages exclusifs, réductions de loyer, bourses d'adhésion et subventions négociés pour les membres de la Cité FIERI auprès de nos partenaires sociaux.
          </p>
        </div>

        <button
          onClick={openPublishModal}
          className="px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-white transition-all cursor-pointer flex items-center gap-2 shadow-lg bg-rose-500 hover:bg-rose-500/90 shadow-rose-500/20"
        >
          <Plus className="w-4 h-4" />
          Proposer une exclusivité
        </button>
      </div>

      {/* Social Partners Directory Section */}
      <div className="flex flex-col gap-4 relative z-10">
        <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary">
          Nos partenaires sociaux à la Cité FIERI
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "MUA", role: "Mutuelle & Santé", desc: "Mutuelle Universitaire d'Afrique", color: "from-emerald-500/10 to-teal-500/5 hover:border-emerald-500/30", textColor: "text-emerald-400" },
            { name: "COUS", role: "Logement & Social", desc: "Centre des Œuvres Universitaires", color: "from-amber-500/10 to-orange-500/5 hover:border-amber-500/30", textColor: "text-amber-400" },
            { name: "Trans-Metro", role: "Mobilité Urbaine", desc: "Navettes & mobilités durables", color: "from-cyan-500/10 to-blue-500/5 hover:border-cyan-500/30", textColor: "text-cyan-400" },
            { name: "Valkyrie R&D Labs", role: "Équipement & Logiciels", desc: "Dotation technologique", color: "from-rose-500/10 to-purple-500/5 hover:border-rose-500/30", textColor: "text-rose-400" }
          ].map(partner => (
            <div key={partner.name} className={`p-5 rounded-2xl bg-gradient-to-br ${partner.color} border border-white/5 flex flex-col gap-2 transition-all`}>
              <div className="flex justify-between items-start">
                <span className={`text-base font-black tracking-wider ${partner.textColor}`}>{partner.name}</span>
                <span className="text-[8px] uppercase tracking-wider font-extrabold bg-white/5 px-2 py-0.5 rounded text-text-muted">Partenaire Officiel</span>
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-text-primary">{partner.role}</h4>
                <p className="text-[10px] text-text-muted mt-1 leading-normal">{partner.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Selection Filter Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel border border-white/5 rounded-2xl p-4 relative z-10 bg-[#0d1120]/40">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher une exclusivité, un partenaire..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/3 border border-white/5 focus:border-fieri-blue/30 rounded-xl py-2.5 pl-11 pr-4 text-xs text-text-primary focus:outline-none transition-all"
          />
        </div>

        <div className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3.5 py-2 rounded-xl flex items-center gap-1.5 shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Offres Partenaires Socialement Engagés</span>
        </div>
      </div>

      {/* Interactive Opportunities Grid */}
      <div className="relative z-10">
        {filteredOpportunities.length > 0 ? (
          <motion.div
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {filteredOpportunities.map((opt) => (
              <motion.div
                key={opt.id}
                variants={cardVariants}
                whileHover={{
                  y: -4,
                  borderColor: "rgba(244, 63, 94, 0.25)",
                  boxShadow: "0 0 30px rgba(244, 63, 94, 0.1)"
                }}
                className="glass-panel border bg-[#0d1120]/60 backdrop-blur-xl rounded-3xl p-6 md:p-8 flex flex-col justify-between gap-6 transition-all border-rose-500/15"
              >
                <div className="space-y-4">
                  {/* Top info row */}
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border text-rose-400 bg-rose-500/10 border-rose-500/10">
                      Partenaire Social
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded text-rose-300">
                      {opt.discipline}
                    </span>
                  </div>

                  {/* Title and author */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-black tracking-tight text-text-primary">
                      {opt.title}
                    </h3>
                    <p className="text-[10px] text-text-muted flex items-center gap-1">
                      Partenaire : <strong className="text-rose-400 font-bold">{opt.author}</strong>
                    </p>
                  </div>

                  {/* Body details */}
                  <div className="space-y-3 pt-3 border-t border-white/5">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-text-secondary mb-1">
                        Avantage exclusif
                      </h4>
                      <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-3 font-medium">
                        {opt.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-text-secondary mb-1">
                        Conditions d'accès
                      </h4>
                      <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">
                        {opt.requirements}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Info & Application CTA */}
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-xs text-rose-400 font-black">
                    <Sparkles className="w-4 h-4 text-rose-400" />
                    <span>{opt.salary}</span>
                  </div>

                  {appliedOpportunityIds.has(opt.id) ? (
                    <span className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-1.5">
                      Offre activée
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <button
                      onClick={() => openApplyModal(opt)}
                      className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-white transition-all rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer bg-rose-500 hover:bg-rose-500/95 shadow-rose-500/10"
                    >
                      En profiter
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* Empty state */
          <div className="text-center py-20 glass-panel border border-white/5 rounded-3xl flex flex-col items-center justify-center gap-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-text-muted">
              <Briefcase className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-text-primary">Aucune offre active</h3>
              <p className="text-xs text-text-secondary mt-1">Ajustez vos termes de recherche ou sélectionnez une autre catégorie d'offre.</p>
            </div>
          </div>
        )}
      </div>

      {/* STUDENT APPLICATION MODAL */}
      <AnimatePresence>
        {selectedOpportunity && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 relative">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeApplyModal}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            <motion.div
              ref={applyModalRef}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="glass-panel border border-white/10 rounded-3xl p-8 max-w-lg w-full relative bg-[#090d1a]/85 backdrop-blur-2xl shadow-2xl z-10 flex flex-col gap-6"
              role="dialog"
              aria-modal="true"
            >
              <button
                onClick={closeApplyModal}
                className="absolute top-4 right-4 text-text-muted hover:text-text-primary p-2 rounded-xl bg-white/3 border border-white/5 cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-text-primary tracking-tight leading-tight">
                  Bénéficier de l'offre partenaire
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Demande d'activation pour l'exclusivité : <strong className="text-rose-400 font-bold">{selectedOpportunity.title}</strong>.
                </p>
              </div>

              <form onSubmit={handleApplySubmit} className="flex flex-col gap-4">
                {applyError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-[10px] font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    {applyError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="student-name" className="text-[9px] font-black uppercase tracking-wider text-text-secondary">Nom Complet</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        ref={applyInputRef}
                        id="student-name"
                        type="text"
                        required
                        value={applyForm.name}
                        onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })}
                        className="w-full bg-white/3 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-text-primary focus:outline-none focus:border-fieri-blue/30"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="student-email" className="text-[9px] font-black uppercase tracking-wider text-text-secondary">Email de contact</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        id="student-email"
                        type="email"
                        required
                        value={applyForm.email}
                        onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                        className="w-full bg-white/3 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-text-primary focus:outline-none focus:border-fieri-blue/30"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="student-achievements" className="text-[9px] font-black uppercase tracking-wider text-text-secondary">
                    Motivations & Justification de la demande d'avantage
                  </label>
                  <textarea
                    id="student-achievements"
                    rows="3"
                    required
                    placeholder="Veuillez indiquer vos motivations ou préciser vos besoins par rapport à cet avantage social."
                    value={applyForm.achievements}
                    onChange={(e) => setApplyForm({ ...applyForm, achievements: e.target.value })}
                    className="w-full bg-white/3 border border-white/5 rounded-xl p-3 text-xs font-semibold text-text-primary focus:outline-none focus:border-fieri-blue/30 placeholder:text-text-muted"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-text-secondary">
                    Justificatif d'adhésion / Carte d'étudiant
                  </span>
                  <div className="border border-dashed border-white/10 rounded-2xl p-4 bg-white/2 text-center flex flex-col items-center justify-center gap-2 hover:border-fieri-blue/30 hover:bg-white/3 transition-colors cursor-pointer relative">
                    <FileText className="w-6 h-6 text-rose-500" />
                    <div>
                      <p className="text-[10px] text-text-primary font-bold">
                        Déposer un justificatif d'adhésion (PDF, JPG...)
                      </p>
                      <p className="text-[8px] text-text-muted mt-0.5">Taille max: 10 Mo (Simulation de validation)</p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.zip,.jpg,.png"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => setApplyForm({ ...applyForm, cvFile: e.target.files[0]?.name || '' })}
                    />
                  </div>
                  {applyForm.cvFile && (
                    <span className="text-[10px] text-emerald-400 font-bold mt-1 flex items-center gap-1.5 bg-emerald-500/5 px-3 py-1.5 rounded-xl border border-emerald-500/10 w-fit">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Fichier lié : {applyForm.cvFile}
                    </span>
                  )}
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={closeApplyModal}
                    className="flex-1 py-3 rounded-xl border border-white/5 bg-white/3 hover:bg-white/5 text-xs font-black uppercase text-text-secondary tracking-wider cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl text-white text-xs font-black uppercase tracking-wider shadow-lg cursor-pointer bg-rose-500 hover:bg-rose-500/90 shadow-rose-500/20"
                  >
                    Activer l'offre
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PARTNER PUBLISH OFFER MODAL */}
      <AnimatePresence>
        {isPublishModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 relative">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePublishModal}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            <motion.div
              ref={publishModalRef}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="glass-panel border border-white/10 rounded-3xl p-8 max-w-xl w-full relative bg-[#090d1a]/85 backdrop-blur-2xl shadow-2xl z-10 flex flex-col gap-6"
              role="dialog"
              aria-modal="true"
            >
              <button
                onClick={closePublishModal}
                className="absolute top-4 right-4 text-text-muted hover:text-text-primary p-2 rounded-xl bg-white/3 border border-white/5 cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-text-primary tracking-tight leading-tight">
                  Proposer une exclusivité partenaire
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Renseignez les détails de l'avantage social proposé aux membres de la Cité FIERI.
                </p>
              </div>

              <form onSubmit={handlePublishSubmit} className="flex flex-col gap-4">
                {publishError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-[10px] font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    {publishError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="publish-title" className="text-[9px] font-black uppercase tracking-wider text-text-secondary">Titre de l'Offre</label>
                    <input
                      ref={publishInputRef}
                      id="publish-title"
                      type="text"
                      required
                      placeholder="ex. Réduction Logement COUS"
                      value={publishForm.title}
                      onChange={(e) => setPublishForm({ ...publishForm, title: e.target.value })}
                      className="w-full bg-white/3 border border-white/5 rounded-xl py-2.5 px-4 text-xs font-semibold text-text-primary focus:outline-none focus:border-fieri-blue/30"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="publish-discipline" className="text-[9px] font-black uppercase tracking-wider text-text-secondary">Catégorie</label>
                    <input
                      id="publish-discipline"
                      type="text"
                      required
                      placeholder="ex. Logement / Transport"
                      value={publishForm.discipline}
                      onChange={(e) => setPublishForm({ ...publishForm, discipline: e.target.value })}
                      className="w-full bg-white/3 border border-white/5 rounded-xl py-2.5 px-4 text-xs font-semibold text-text-primary focus:outline-none focus:border-fieri-blue/30"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="publish-salary" className="text-[9px] font-black uppercase tracking-wider text-text-secondary">Valeur de l'avantage (ex. Remise -50%)</label>
                  <input
                    id="publish-salary"
                    type="text"
                    required
                    placeholder="Remise de 30% / Loyer subventionné"
                    value={publishForm.salary}
                    onChange={(e) => setPublishForm({ ...publishForm, salary: e.target.value })}
                    className="w-full bg-white/3 border border-white/5 rounded-xl py-2.5 px-4 text-xs font-semibold text-text-primary focus:outline-none focus:border-fieri-blue/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="publish-desc" className="text-[9px] font-black uppercase tracking-wider text-text-secondary">Description détaillée de l'avantage</label>
                  <textarea
                    id="publish-desc"
                    rows="3"
                    required
                    placeholder="Décrivez précisément l'avantage exclusif et comment en bénéficier."
                    value={publishForm.description}
                    onChange={(e) => setPublishForm({ ...publishForm, description: e.target.value })}
                    className="w-full bg-white/3 border border-white/5 rounded-xl p-3 text-xs font-semibold text-text-primary focus:outline-none focus:border-fieri-blue/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="publish-req" className="text-[9px] font-black uppercase tracking-wider text-text-secondary">Conditions d'éligibilité / Justificatifs requis</label>
                  <textarea
                    id="publish-req"
                    rows="2"
                    required
                    placeholder="ex. Réservé aux étudiants boursiers, carte d'adhérent requise."
                    value={publishForm.requirements}
                    onChange={(e) => setPublishForm({ ...publishForm, requirements: e.target.value })}
                    className="w-full bg-white/3 border border-white/5 rounded-xl p-3 text-xs font-semibold text-text-primary focus:outline-none focus:border-fieri-blue/30"
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={closePublishModal}
                    className="flex-1 py-3 rounded-xl border border-white/5 bg-white/3 hover:bg-white/5 text-xs font-black uppercase text-text-secondary tracking-wider cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-500/90 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-rose-500/20 cursor-pointer"
                  >
                    Créer l'exclusivité
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
