import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Sparkles, Plus,   
  User, Mail, FileText, CheckCircle2, X, ShieldAlert,
  ArrowRight, Briefcase
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/ui/Toast.jsx'
import StatePanel from '../components/ui/StatePanel.jsx';


// ─────────────────────────── Offers Page Component ───────────────────────────
export default function Offers({ navigate }) {
  const { user, can } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { notify } = useToast()
  const [appliedOpportunityIds, setAppliedOpportunityIds] = useState(new Set());

  // Application Modal state
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [applyForm, setApplyForm] = useState({ name: '', email: '', achievements: '' });
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
    setLoadingList(true);
    setLoadError(null);
    try {
      const res = await api.opportunities.getAll();
      if (!res?.success) throw new Error(res?.message);
      setOpportunities(res.data || []);
    } catch (err) {
      // Une liste vide et une liste illisible ne se ressemblent pas.
      setOpportunities([]);
      setLoadError(err?.serverMessage || err?.message || "La liste n'a pas pu être chargée.");
    } finally {
      setLoadingList(false);
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
      setAppliedOpportunityIds(new Set());
      notify(
        err?.serverMessage
          || "Vos candidatures déjà déposées n'ont pas pu être vérifiées.",
        'warning',
      );
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
        // La colonne `cvUrl` n'accepte pas null — chaîne vide, que l'écran
        // d'examen des candidatures affiche « aucun document ».
        cvUrl: '',
      });

      if (res.success) {
        notify("Votre demande d'activation a été transmise au partenaire social avec succès ! Vous recevrez les instructions de l'offre par email.");
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
    const isResearcher = can('opportunity:create');
    if (!isResearcher) {
      notify("Accès refusé. Cette fonctionnalité est réservée aux chercheurs certifiés.", 'error');
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
        notify("Nouvelle exclusivité de partenariat publiée avec succès !");
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
    <div className="flex flex-col gap-12 relative w-full">


      {/* Hero Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative z-10">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-3 w-fit">
            <span className="w-8 h-px bg-ember inline-block" aria-hidden="true" />
            <span className="eyebrow flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-engine" />
              AVANTAGES SOCIAUX & PARTENARIATS
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary font-display leading-tight">
            Offres & <span className="text-gradient-orange">Exclusivités</span>
          </h1>
          <p className="text-text-secondary text-sm leading-relaxed">
            Profitez des avantages exclusifs, réductions de loyer, bourses d'adhésion et subventions négociés pour les membres de la CITE FIERI auprès de nos partenaires sociaux.
          </p>
        </div>

        <button
          onClick={openPublishModal}
          className="px-5 py-3 chamfer-sm chamfer-shadow text-xs font-extrabold uppercase tracking-wider text-on-accent transition-all cursor-pointer flex items-center gap-2 bg-ember hover:bg-ember-deep"
        >
          <Plus className="w-4 h-4" />
          Proposer une exclusivité
        </button>
      </div>

      {/* Social Partners Directory Section */}
      <div className="flex flex-col gap-4 relative z-10">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">
          Nos partenaires sociaux à la CITE FIERI
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "MUA", role: "Mutuelle & Santé", desc: "Mutuelle Universitaire d'Afrique", color: "from-success to-success/5 hover:border-success", textColor: "text-success" },
            { name: "COUS", role: "Logement & Social", desc: "Centre des Œuvres Universitaires", color: "from-warning to-ember hover:border-warning", textColor: "text-warning" },
            { name: "Trans-Metro", role: "Mobilité Urbaine", desc: "Navettes & mobilités durables", color: "bg-engine-wash hover:border-engine", textColor: "text-engine" },
            { name: "Valkyrie R&D Labs", role: "Équipement & Logiciels", desc: "Dotation technologique", color: "from-ember/10 to-engine/5 hover:border-ember", textColor: "text-ember" }
          ].map(partner => (
            <div key={partner.name} className={`p-5 chamfer-sm bg-gradient-to-br ${partner.color} border border-border-subtle flex flex-col gap-2 transition-all`}>
              <div className="flex justify-between items-start">
                <span className={`text-base font-extrabold tracking-wider ${partner.textColor}`}>{partner.name}</span>
                <span className="text-xs uppercase tracking-wider font-extrabold bg-bg-tertiary px-2 py-0.5 rounded text-text-muted">Partenaire Officiel</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-primary">{partner.role}</h4>
                <p className="text-xs text-text-muted mt-1 leading-normal">{partner.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Selection Filter Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel border border-border-subtle chamfer-sm p-4 relative z-10 bg-bg-secondary">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input aria-label="Rechercher une exclusivité, un partenaire"
            type="text"
            placeholder="Rechercher une exclusivité, un partenaire..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-secondary border border-border-subtle focus:border-engine rounded-xl py-2.5 pl-11 pr-4 text-xs text-text-primary focus:outline-none transition-all"
          />
        </div>

        <div className="text-xs font-extrabold uppercase tracking-wider text-ember bg-ember-wash border border-ember px-3.5 py-2 rounded-xl flex items-center gap-1.5 shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Offres Partenaires Socialement Engagés</span>
        </div>
      </div>

      {/* Interactive Opportunities Grid */}
      <div className="relative z-10">
        {loadingList ? (
          <StatePanel state="loading" />
        ) : loadError ? (
          <StatePanel state="error" message={loadError} onRetry={fetchOpportunities} />
        ) : filteredOpportunities.length > 0 ? (
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
                className="glass-panel border bg-bg-secondary chamfer p-6 md:p-8 flex flex-col justify-between gap-6 transition-all border-ember"
              >
                <div className="space-y-4">
                  {/* Top info row */}
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md border text-ember bg-ember-wash border-ember">
                      Partenaire Social
                    </span>
                    <span className="text-xs font-extrabold uppercase tracking-wider bg-bg-tertiary px-2 py-0.5 rounded text-ember-soft">
                      {opt.discipline}
                    </span>
                  </div>

                  {/* Title and author */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold tracking-tight text-text-primary">
                      {opt.title}
                    </h3>
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      Partenaire : <strong className="text-ember font-bold">{opt.author}</strong>
                    </p>
                  </div>

                  {/* Body details */}
                  <div className="space-y-3 pt-3 border-t border-border-subtle">
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-1">
                        Avantage exclusif
                      </h4>
                      <p className="text-xs text-text-secondary leading-relaxed line-clamp-3 font-medium">
                        {opt.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-1">
                        Conditions d'accès
                      </h4>
                      <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                        {opt.requirements}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Info & Application CTA */}
                <div className="flex justify-between items-center pt-4 border-t border-border-subtle">
                  <div className="flex items-center gap-1.5 text-xs text-ember font-extrabold">
                    <Sparkles className="w-4 h-4 text-ember" />
                    <span>{opt.salary}</span>
                  </div>

                  {appliedOpportunityIds.has(opt.id) ? (
                    <span className="px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-success bg-success-wash border border-success rounded-xl flex items-center gap-1.5">
                      Offre activée
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <button
                      onClick={() => openApplyModal(opt)}
                      className="px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-on-accent transition-all rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer bg-ember hover:bg-ember-deep"
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
                  Bénéficier de l'offre partenaire
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Demande d'activation pour l'exclusivité : <strong className="text-ember font-bold">{selectedOpportunity.title}</strong>.
                </p>
              </div>

              <form onSubmit={handleApplySubmit} className="flex flex-col gap-4">
                {applyError && (
                  <div className="p-3 bg-ember-wash border border-ember text-ember rounded-xl text-xs font-bold flex items-center gap-1.5">
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
                        className="w-full bg-bg-secondary border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-text-primary focus:outline-none focus:border-engine"
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
                        className="w-full bg-bg-secondary border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-text-primary focus:outline-none focus:border-engine"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="student-achievements" className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">
                    Motivations & Justification de la demande d'avantage
                  </label>
                  <textarea
                    id="student-achievements"
                    rows="3"
                    required
                    placeholder="Veuillez indiquer vos motivations ou préciser vos besoins par rapport à cet avantage social."
                    value={applyForm.achievements}
                    onChange={(e) => setApplyForm({ ...applyForm, achievements: e.target.value })}
                    className="w-full bg-bg-secondary border border-border-subtle rounded-xl p-3 text-xs font-semibold text-text-primary focus:outline-none focus:border-engine placeholder:text-text-muted"
                  />
                </div>

                <div className="flex items-start gap-3 border border-border-strong bg-bg-secondary p-4">
                  <FileText className="mt-0.5 h-5 w-5 shrink-0 text-ember" aria-hidden="true" />
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
                    className="flex-1 py-3 rounded-xl text-on-accent text-xs font-extrabold uppercase tracking-wider shadow-lg cursor-pointer bg-ember hover:bg-ember-deep"
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
                  Proposer une exclusivité partenaire
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Renseignez les détails de l'avantage social proposé aux membres de la CITE FIERI.
                </p>
              </div>

              <form onSubmit={handlePublishSubmit} className="flex flex-col gap-4">
                {publishError && (
                  <div className="p-3 bg-ember-wash border border-ember text-ember rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    {publishError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="publish-title" className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">Titre de l'Offre</label>
                    <input
                      ref={publishInputRef}
                      id="publish-title"
                      type="text"
                      required
                      placeholder="ex. Réduction Logement COUS"
                      value={publishForm.title}
                      onChange={(e) => setPublishForm({ ...publishForm, title: e.target.value })}
                      className="w-full bg-bg-secondary border border-border-subtle rounded-xl py-2.5 px-4 text-xs font-semibold text-text-primary focus:outline-none focus:border-engine"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="publish-discipline" className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">Catégorie</label>
                    <input
                      id="publish-discipline"
                      type="text"
                      required
                      placeholder="ex. Logement / Transport"
                      value={publishForm.discipline}
                      onChange={(e) => setPublishForm({ ...publishForm, discipline: e.target.value })}
                      className="w-full bg-bg-secondary border border-border-subtle rounded-xl py-2.5 px-4 text-xs font-semibold text-text-primary focus:outline-none focus:border-engine"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="publish-salary" className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">Valeur de l'avantage (ex. Remise -50%)</label>
                  <input
                    id="publish-salary"
                    type="text"
                    required
                    placeholder="Remise de 30% / Loyer subventionné"
                    value={publishForm.salary}
                    onChange={(e) => setPublishForm({ ...publishForm, salary: e.target.value })}
                    className="w-full bg-bg-secondary border border-border-subtle rounded-xl py-2.5 px-4 text-xs font-semibold text-text-primary focus:outline-none focus:border-engine"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="publish-desc" className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">Description détaillée de l'avantage</label>
                  <textarea
                    id="publish-desc"
                    rows="3"
                    required
                    placeholder="Décrivez précisément l'avantage exclusif et comment en bénéficier."
                    value={publishForm.description}
                    onChange={(e) => setPublishForm({ ...publishForm, description: e.target.value })}
                    className="w-full bg-bg-secondary border border-border-subtle rounded-xl p-3 text-xs font-semibold text-text-primary focus:outline-none focus:border-engine"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="publish-req" className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">Conditions d'éligibilité / Justificatifs requis</label>
                  <textarea
                    id="publish-req"
                    rows="2"
                    required
                    placeholder="ex. Réservé aux étudiants boursiers, carte d'adhérent requise."
                    value={publishForm.requirements}
                    onChange={(e) => setPublishForm({ ...publishForm, requirements: e.target.value })}
                    className="w-full bg-bg-secondary border border-border-subtle rounded-xl p-3 text-xs font-semibold text-text-primary focus:outline-none focus:border-engine"
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
                    className="flex-1 py-3 rounded-xl bg-ember hover:bg-ember-deep text-on-accent text-xs font-extrabold uppercase tracking-wider shadow-lg cursor-pointer"
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
