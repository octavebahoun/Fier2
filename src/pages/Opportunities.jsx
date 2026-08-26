import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Sparkles, Plus,  Coins, 
  User, Mail, FileText, CheckCircle2, X, ShieldAlert,
  ArrowRight, Briefcase
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import Offers from './Offers.jsx';
import { useToast } from '../components/ui/Toast.jsx'


// ─────────────────────────── Opportunities Page Component ───────────────────────────
export default function Opportunities({ navigate }) {
  const { user, can } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('partners'); // 'partners' (Offers) by default, or 'research' (R&D)
  const [activeType, setActiveType] = useState('all');
  const { notify } = useToast()
  const [appliedOpportunityIds, setAppliedOpportunityIds] = useState(new Set());

  // Application Modal state
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [applyForm, setApplyForm] = useState({ name: '', email: '', achievements: '' });
  const [applyError, setApplyError] = useState('');

  // Publication Modal state (for researchers)
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishForm, setPublishForm] = useState({ title: '', type: 'CDD R&D', discipline: '', salary: '', description: '', requirements: '' });
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

  // Filter opportunities by text query & type select (excluding partners here since they are in Offers.jsx)
  const filteredOpportunities = opportunities.filter(opt => {
    const matchesSearch =
      opt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.discipline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = activeType === 'all'
      ? opt.type !== 'Exclusivités Partenaires'
      : opt.type === activeType;

    return opt.type !== 'Exclusivités Partenaires' && matchesSearch && matchesType;
  });

  const closeApplyModal = () => {
    setSelectedOpportunity(null);
    if (applyTriggerRef.current) applyTriggerRef.current.focus();
  };

  const closePublishModal = () => {
    setIsPublishModalOpen(false);
    if (publishTriggerRef.current) publishTriggerRef.current.focus();
  };

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
      achievements: ''
    });
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
        // Pas de pièce jointe : la plateforme ne sait pas encore en recevoir.
        cvUrl: null,
      });

      if (res.success) {
        notify(res.message || "Votre candidature scientifique a été transmise au laboratoire avec succès !");
        setAppliedOpportunityIds(prev => new Set([...prev, selectedOpportunity.id]));
        closeApplyModal();
      } else {
        setApplyError(res.message || "Impossible de soumettre la candidature.");
      }
    } catch {
      setApplyError("Erreur réseau ou serveur lors de l'envoi de la candidature.");
    }
  };

  // --- ACTIONS FOR CREATING (RESEARCHER CONNECTED) ---
  const openPublishModal = () => {
    if (!user) {
      navigate?.('auth');
      return;
    }
    if (!can('opportunity:create')) {
      notify("Accès refusé. Cette fonctionnalité est réservée aux chercheurs certifiés.", 'error');
      return;
    }
    publishTriggerRef.current = document.activeElement;
    setIsPublishModalOpen(true);
    setPublishError('');
    setPublishForm({
      title: '',
      type: 'CDD R&D',
      discipline: '',
      salary: '',
      description: '',
      requirements: ''
    });
  };

  const handlePublishSubmit = async (e) => {
    e.preventDefault();
    const sal = parseFloat(publishForm.salary);
    if (!publishForm.title || !publishForm.discipline || !publishForm.description || !publishForm.requirements) {
      setPublishError("Tous les champs sont requis.");
      return;
    }
    if (isNaN(sal) || sal <= 0) {
      setPublishError("Le salaire mensuel indiqué doit être supérieur à zéro.");
      return;
    }

    try {
      const res = await api.opportunities.create({
        title: publishForm.title,
        type: publishForm.type,
        discipline: publishForm.discipline,
        salary: sal,
        description: publishForm.description,
        requirements: publishForm.requirements,
        author: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : (user.name || "Chercheur FIERI")
      });

      if (res.success) {
        notify("Nouvelle opportunité publiée avec succès !");
        fetchOpportunities();
        closePublishModal();
      } else {
        setPublishError(res.message || "Erreur lors de la sauvegarde.");
      }
    } catch {
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
    <div className="max-w-[88rem] mx-auto w-full py-24 px-6 md:px-12 lg:px-12 flex flex-col gap-12 relative min-h-screen">


      {/* Tab Filter: Research / Social Partners Switcher */}
      <div className="inline-flex items-center gap-1 p-1 chamfer-sm bg-bg-secondary border border-border-subtle w-fit relative z-10">
        <button
          onClick={() => {
            setActiveTab('partners');
            setActiveType('all');
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'partners'
              ? 'bg-danger-wash border border-danger text-danger shadow-sm'
              : 'text-text-secondary hover:text-text-primary border border-transparent'
          }`}
        >
          <Sparkles className="w-4.5 h-4.5" />
          Offres & Exclusivités
        </button>
        <button
          onClick={() => {
            setActiveTab('research');
            setActiveType('all');
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'research'
              ? 'bg-engine-wash border border-engine/30 text-engine shadow-sm'
              : 'text-text-secondary hover:text-text-primary border border-transparent'
          }`}
        >
          <Briefcase className="w-4.5 h-4.5" />
          Opportunités R&D
        </button>
      </div>

      {activeTab === 'partners' ? (
        <Offers navigate={navigate} />
      ) : (
        <>
          {/* Hero Header */}
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative z-10">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-3 w-fit">
                <span className="w-8 h-px bg-ember inline-block" aria-hidden="true" />
                <span className="eyebrow flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-engine" />
                  CARRIÈRES & MATCHMAKING R&D
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary font-display leading-tight">
                Opportunités de <span className="text-gradient-cosmic">Recherche</span>
              </h1>
              <p className="text-text-secondary text-sm leading-relaxed">
                Rejoignez nos laboratoires et contribuez aux ruptures scientifiques. Postulez à nos offres de Doctorat, CDD R&D, et stages avancés.
              </p>
            </div>

            {can('opportunity:create') && (
              <button
                onClick={openPublishModal}
                className="px-5 py-3 chamfer-sm chamfer-shadow text-xs font-extrabold uppercase tracking-wider text-on-accent transition-all cursor-pointer flex items-center gap-2 bg-engine hover:bg-engine"
              >
                <Plus className="w-4 h-4" />
                Publier une offre
              </button>
            )}
          </div>

          {/* Search & Selection Filter Header */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel border border-border-subtle chamfer-sm p-4 relative z-10 bg-bg-secondary">
            {/* Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Rechercher par discipline, mot clé, superviseur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-bg-secondary border border-border-subtle focus:border-engine/40 rounded-xl py-2.5 pl-11 pr-4 text-xs text-text-primary focus:outline-none transition-all"
              />
            </div>

            {/* Buttons filters */}
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {['all', 'CDD R&D', 'Doctorat', 'Stage de Recherche'].map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${activeType === type
                      ? 'bg-engine border-engine text-on-accent shadow-lg'
                      : 'bg-bg-secondary border-border-subtle text-text-secondary hover:text-text-primary'
                    }`}
                >
                  {type === 'all' ? 'Toutes les offres' : type}
                </button>
              ))}
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
                      borderColor: "rgba(59, 130, 246, 0.25)",
                      boxShadow: "0 0 30px rgba(59, 130, 246, 0.1)"
                    }}
                    className="glass-panel border bg-bg-secondary chamfer p-6 md:p-8 flex flex-col justify-between gap-6 transition-all border-border-subtle"
                  >
                    <div className="space-y-4">
                      {/* Top info row */}
                      <div className="flex justify-between items-center gap-4">
                        <span className={`text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                          opt.type === 'CDD R&D'
                            ? 'text-engine bg-engine-wash border-engine/10'
                            : opt.type === 'Doctorat'
                              ? 'text-engine bg-engine-wash border-engine/10'
                              : 'text-warning bg-warning-wash border-warning'
                        }`}>
                          {opt.type}
                        </span>

                        <span className="text-xs font-extrabold uppercase tracking-wider bg-bg-tertiary px-2 py-0.5 rounded text-text-muted">
                          {opt.discipline}
                        </span>
                      </div>

                      {/* Title and author */}
                      <div className="space-y-2">
                        <h3 className="text-xl font-extrabold tracking-tight text-text-primary">
                          {opt.title}
                        </h3>
                        <p className="text-xs text-text-muted flex items-center gap-1">
                          Proposé par : <strong className="text-engine font-bold">{opt.author}</strong>
                        </p>
                      </div>

                      {/* Body details */}
                      <div className="space-y-3 pt-3 border-t border-border-subtle">
                        <div>
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-1">
                            Mission
                          </h4>
                          <p className="text-xs text-text-secondary leading-relaxed line-clamp-3 font-medium">
                            {opt.description}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-1">
                            Pré-requis
                          </h4>
                          <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                            {opt.requirements}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Footer Info & Application CTA */}
                    <div className="flex justify-between items-center pt-4 border-t border-border-subtle">
                      <div className="flex items-center gap-1.5 text-xs text-success font-extrabold">
                        <Coins className="w-4 h-4 text-success" />
                        <span>{opt.salary} $ / mois</span>
                      </div>

                      {appliedOpportunityIds.has(opt.id) ? (
                        <span className="px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-success bg-success-wash border border-success rounded-xl flex items-center gap-1.5">
                          Candidature transmise
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <button
                          onClick={() => openApplyModal(opt)}
                          className="px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-on-accent transition-all rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer bg-engine hover:bg-engine"
                        >
                          Postuler
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              /* Empty state */
              <div className="text-center py-20 glass-panel border border-border-subtle chamfer flex flex-col items-center justify-center gap-4 max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center text-text-muted">
                  <Briefcase className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-text-primary">Aucune offre active</h3>
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
                  className="absolute inset-0 bg-scrim backdrop-blur-md"
                />

                <motion.div
                  ref={applyModalRef}
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="glass-panel border border-border-subtle chamfer chamfer-shadow p-8 max-w-lg w-full relative bg-bg-secondary z-10 flex flex-col gap-6"
                  role="dialog"
                  aria-modal="true"
                >
                  <button
                    onClick={closeApplyModal}
                    className="absolute top-4 right-4 text-text-muted hover:text-text-primary p-2 rounded-xl bg-bg-secondary border border-border-subtle cursor-pointer"
                    aria-label="Fermer"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="space-y-1">
                    <h3 className="text-xl font-extrabold text-text-primary tracking-tight leading-tight">
                      Rejoindre le Laboratoire
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Candidature scientifique pour : <strong className="text-engine font-bold">{selectedOpportunity.title}</strong>.
                    </p>
                  </div>

                  <form onSubmit={handleApplySubmit} className="flex flex-col gap-4">
                    {applyError && (
                      <div className="p-3 bg-danger-wash border border-danger text-danger rounded-xl text-xs font-bold flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        {applyError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="student-name" className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">Nom Complet</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                          <input
                            ref={applyInputRef}
                            id="student-name"
                            type="text"
                            required
                            value={applyForm.name}
                            onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })}
                            className="w-full bg-bg-secondary border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-text-primary focus:outline-none focus:border-engine/40"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="student-email" className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">Email de contact</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                          <input
                            id="student-email"
                            type="email"
                            required
                            value={applyForm.email}
                            onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                            className="w-full bg-bg-secondary border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-text-primary focus:outline-none focus:border-engine/40"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="student-achievements" className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">
                        Réalisations Scientifiques Majeures / Motivations
                      </label>
                      <textarea
                        id="student-achievements"
                        rows="3"
                        required
                        placeholder="Décrivez vos projets académiques, contributions open source ou publications en lien avec cette discipline."
                        value={applyForm.achievements}
                        onChange={(e) => setApplyForm({ ...applyForm, achievements: e.target.value })}
                        className="w-full bg-bg-secondary border border-border-subtle rounded-xl p-3 text-xs font-semibold text-text-primary focus:outline-none focus:border-engine/40 placeholder:text-text-muted"
                      />
                    </div>

                    <div className="flex items-start gap-3 border border-border-strong bg-bg-secondary p-4">
                      <FileText className="mt-0.5 h-5 w-5 shrink-0 text-engine" aria-hidden="true" />
                      <p className="text-sm leading-relaxed text-text-secondary">
                        Aucune pièce jointe à ce stade : si un document est nécessaire, il vous
                        sera demandé par e-mail après examen de votre candidature.
                      </p>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-border-subtle">
                      <button
                        type="button"
                        onClick={closeApplyModal}
                        className="flex-1 py-3 rounded-xl border border-border-subtle bg-bg-secondary hover:bg-bg-tertiary text-xs font-extrabold uppercase text-text-secondary tracking-wider cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 rounded-xl text-on-accent text-xs font-extrabold uppercase tracking-wider shadow-lg bg-engine hover:bg-engine cursor-pointer"
                      >
                        Transmettre
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* RESEARCHER PUBLISH OFFER MODAL */}
          <AnimatePresence>
            {isPublishModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 relative">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={closePublishModal}
                  className="absolute inset-0 bg-scrim backdrop-blur-md"
                />

                <motion.div
                  ref={publishModalRef}
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="glass-panel border border-border-subtle chamfer chamfer-shadow p-8 max-w-xl w-full relative bg-bg-secondary z-10 flex flex-col gap-6"
                  role="dialog"
                  aria-modal="true"
                >
                  <button
                    onClick={closePublishModal}
                    className="absolute top-4 right-4 text-text-muted hover:text-text-primary p-2 rounded-xl bg-bg-secondary border border-border-subtle cursor-pointer"
                    aria-label="Fermer"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="space-y-1">
                    <h3 className="text-xl font-extrabold text-text-primary tracking-tight leading-tight">
                      Publier une opportunité de recherche
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Renseignez les critères et les détails scientifiques pour attirer des candidats talentueux.
                    </p>
                  </div>

                  <form onSubmit={handlePublishSubmit} className="flex flex-col gap-4">
                    {publishError && (
                      <div className="p-3 bg-danger-wash border border-danger text-danger rounded-xl text-xs font-bold flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        {publishError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="publish-title" className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">Intitulé du Poste</label>
                        <input
                          ref={publishInputRef}
                          id="publish-title"
                          type="text"
                          required
                          placeholder="ex. Doctorat en Edge Computing"
                          value={publishForm.title}
                          onChange={(e) => setPublishForm({ ...publishForm, title: e.target.value })}
                          className="w-full bg-bg-secondary border border-border-subtle rounded-xl py-2.5 px-4 text-xs font-semibold text-text-primary focus:outline-none focus:border-engine/40"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="publish-type" className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">Type de contrat</label>
                        <select
                          id="publish-type"
                          value={publishForm.type}
                          onChange={(e) => setPublishForm({ ...publishForm, type: e.target.value })}
                          className="w-full bg-bg-secondary border border-border-subtle rounded-xl py-2.5 px-4 text-xs font-semibold text-text-primary focus:outline-none focus:border-engine/40"
                        >
                          <option value="CDD R&D">CDD R&D</option>
                          <option value="Doctorat">Doctorat</option>
                          <option value="Stage de Recherche">Stage de Recherche</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="publish-discipline" className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">Discipline</label>
                        <input
                          id="publish-discipline"
                          type="text"
                          required
                          placeholder="ex. Vision / Robotique"
                          value={publishForm.discipline}
                          onChange={(e) => setPublishForm({ ...publishForm, discipline: e.target.value })}
                          className="w-full bg-bg-secondary border border-border-subtle rounded-xl py-2.5 px-4 text-xs font-semibold text-text-primary focus:outline-none focus:border-engine/40"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="publish-salary" className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">Salaire indicatif ($ / mois)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-extrabold text-xs text-text-muted">$</span>
                          <input
                            id="publish-salary"
                            type="number"
                            min="1"
                            required
                            placeholder="2400"
                            value={publishForm.salary}
                            onChange={(e) => setPublishForm({ ...publishForm, salary: e.target.value })}
                            className="w-full bg-bg-secondary border border-border-subtle rounded-xl py-2.5 pl-8 pr-4 text-xs font-semibold text-text-primary focus:outline-none focus:border-engine/40"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="publish-desc" className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">Description détaillée des missions</label>
                      <textarea
                        id="publish-desc"
                        rows="3"
                        required
                        placeholder="Décrivez précisément les problématiques scientifiques que le candidat devra aborder."
                        value={publishForm.description}
                        onChange={(e) => setPublishForm({ ...publishForm, description: e.target.value })}
                        className="w-full bg-bg-secondary border border-border-subtle rounded-xl p-3 text-xs font-semibold text-text-primary focus:outline-none focus:border-engine/40"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="publish-req" className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">Pré-requis techniques / diplômes requis</label>
                      <textarea
                        id="publish-req"
                        rows="2"
                        required
                        placeholder="Compétences recherchées, langages, frameworks et expérience demandée."
                        value={publishForm.requirements}
                        onChange={(e) => setPublishForm({ ...publishForm, requirements: e.target.value })}
                        className="w-full bg-bg-secondary border border-border-subtle rounded-xl p-3 text-xs font-semibold text-text-primary focus:outline-none focus:border-engine/40"
                      />
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-border-subtle">
                      <button
                        type="button"
                        onClick={closePublishModal}
                        className="flex-1 py-3 rounded-xl border border-border-subtle bg-bg-secondary hover:bg-bg-tertiary text-xs font-extrabold uppercase text-text-secondary tracking-wider cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 rounded-xl bg-engine hover:bg-engine text-on-accent text-xs font-extrabold uppercase tracking-wider shadow-lg cursor-pointer"
                      >
                        Créer l'opportunité
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      )}

    </div>
  );
}
