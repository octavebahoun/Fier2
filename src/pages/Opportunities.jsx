import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Sparkles, Plus, Award, Coins, BookOpen, 
  User, Mail, FileText, CheckCircle2, X, ShieldAlert, 
  MapPin, Clock, ArrowRight, Briefcase 
} from 'lucide-react';
import { mockDb } from '../services/mockDb';
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

// ─────────────────────────── Opportunities Page Component ───────────────────────────
export default function Opportunities() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [toast, setToast] = useState(null);

  // Application Modal state
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [applyForm, setApplyForm] = useState({ name: '', email: '', achievements: '', cvFile: '' });
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

  useEffect(() => {
    // Fetch opportunities list from mockDb
    setOpportunities(mockDb.opportunities.getAll());
  }, []);

  // Autofill student form fields once user changes
  useEffect(() => {
    if (user) {
      setApplyForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // Filter opportunities by text query & type select
  const filteredOpportunities = opportunities.filter(opt => {
    const matchesSearch = 
      opt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.discipline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = activeType === 'all' || opt.type === activeType;

    return matchesSearch && matchesType;
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
      setToast("Veuillez vous connecter pour postuler à cette offre.");
      return;
    }
    applyTriggerRef.current = document.activeElement;
    setSelectedOpportunity(opt);
    setApplyError('');
    setApplyForm({
      name: user.name || '',
      email: user.email || '',
      achievements: '',
      cvFile: ''
    });
  };

  const closeApplyModal = () => {
    setSelectedOpportunity(null);
    if (applyTriggerRef.current) applyTriggerRef.current.focus();
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!applyForm.name || !applyForm.email || !applyForm.achievements) {
      setApplyError("Veuillez remplir tous les champs requis.");
      return;
    }
    setToast("Votre candidature scientifique a été transmise au laboratoire avec succès !");
    closeApplyModal();
  };

  // --- ACTIONS FOR CREATING (RESEARCHER CONNECTED) ---
  const openPublishModal = () => {
    if (!user) {
      setToast("Veuillez vous connecter pour publier une offre.");
      return;
    }
    const isResearcher = user.role === 'CHERCHEUR' || user.role === 'ADMIN';
    if (!isResearcher) {
      setToast("Accès refusé. Cette fonctionnalité est réservée aux chercheurs certifiés.");
      return;
    }
    publishTriggerRef.current = document.activeElement;
    setIsPublishModalOpen(true);
    setPublishError('');
    setPublishForm({ title: '', type: 'CDD R&D', discipline: '', salary: '', description: '', requirements: '' });
  };

  const closePublishModal = () => {
    setIsPublishModalOpen(false);
    if (publishTriggerRef.current) publishTriggerRef.current.focus();
  };

  const handlePublishSubmit = (e) => {
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

    const newOpt = mockDb.opportunities.add({
      title: publishForm.title,
      type: publishForm.type,
      discipline: publishForm.discipline,
      salary: sal,
      description: publishForm.description,
      requirements: publishForm.requirements,
      author: user.name || "Chercheur FIERI"
    });

    if (newOpt) {
      setOpportunities(mockDb.opportunities.getAll());
      setToast("Nouvelle opportunité publiée avec succès !");
      closePublishModal();
    } else {
      setPublishError("Erreur interne lors de la sauvegarde.");
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
    <div className="max-w-[88rem] mx-auto w-full py-24 px-6 md:px-12 lg:px-24 flex flex-col gap-12 relative min-h-screen">
      
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-fieri-blue/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative z-10">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-fieri-blue/10 border border-fieri-blue/20 text-fieri-blue text-xs font-bold w-fit">
            <Briefcase className="w-3.5 h-3.5" />
            <span>CARRIÈRES & MATCHMAKING R&D</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-text-secondary to-fieri-blue bg-clip-text text-transparent leading-tight">
            Opportunités de Recherche
          </h1>
          <p className="text-text-secondary text-sm leading-relaxed">
            Rejoignez nos laboratoires et contribuez aux ruptures scientifiques. Postulez à nos offres de Doctorat, CDD R&D, et stages avancés.
          </p>
        </div>

        <button
          onClick={openPublishModal}
          className="px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-white bg-fieri-blue hover:bg-fieri-blue/90 shadow-lg shadow-fieri-blue/20 transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Publier une offre
        </button>
      </div>

      {/* Search & Selection Filter Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel border border-white/5 rounded-2xl p-4 relative z-10 bg-[#0d1120]/40">
        
        {/* Input */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher par discipline, mot clé, superviseur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/3 border border-white/5 focus:border-fieri-blue/30 rounded-xl py-2.5 pl-11 pr-4 text-xs text-text-primary focus:outline-none transition-all"
          />
        </div>

        {/* Buttons filters */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {['all', 'CDD R&D', 'Doctorat', 'Stage de Recherche'].map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${
                activeType === type
                  ? 'bg-fieri-blue border-fieri-blue text-white shadow-lg shadow-fieri-blue/10'
                  : 'bg-white/3 border-white/5 text-text-secondary hover:text-text-primary'
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
                whileHover={{ y: -4, borderColor: "rgba(59, 130, 246, 0.25)", boxShadow: "0 0 30px rgba(59, 130, 246, 0.1)" }}
                className="glass-panel border border-white/5 bg-[#0d1120]/60 backdrop-blur-xl rounded-3xl p-6 md:p-8 flex flex-col justify-between gap-6 transition-all"
              >
                <div className="space-y-4">
                  {/* Top info row */}
                  <div className="flex justify-between items-center gap-4">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                      opt.type === 'CDD R&D'
                        ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/10'
                        : opt.type === 'Doctorat'
                          ? 'text-fieri-blue bg-fieri-blue/10 border-fieri-blue/10'
                          : 'text-amber-400 bg-amber-500/10 border-amber-500/10'
                    }`}>
                      {opt.type}
                    </span>
                    
                    <span className="text-[9px] font-black uppercase tracking-wider text-text-muted bg-white/5 px-2 py-0.5 rounded">
                      {opt.discipline}
                    </span>
                  </div>

                  {/* Title and author */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-black tracking-tight text-text-primary">
                      {opt.title}
                    </h3>
                    <p className="text-[10px] text-text-muted flex items-center gap-1">
                      Proposé par : <strong className="text-fieri-blue font-bold">{opt.author}</strong>
                    </p>
                  </div>

                  {/* Body details */}
                  <div className="space-y-3 pt-3 border-t border-white/5">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-text-secondary mb-1">Mission</h4>
                      <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-3 font-medium">
                        {opt.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-text-secondary mb-1">Pré-requis</h4>
                      <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">
                        {opt.requirements}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Info & Application CTA */}
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-black">
                    <Coins className="w-4 h-4 text-emerald-400" />
                    <span>{opt.salary} $ / mois</span>
                  </div>

                  <button
                    onClick={() => openApplyModal(opt)}
                    className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-white bg-fieri-blue hover:bg-fieri-blue/95 transition-all rounded-xl shadow-lg shadow-fieri-blue/10 flex items-center gap-1.5 cursor-pointer"
                  >
                    Postuler
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
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

      {/* ─────────────────────────── STUDENT APPLICATION MODAL ─────────────────────────── */}
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
                  Rejoindre le Laboratoire
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Candidature scientifique pour : <strong className="text-fieri-blue font-bold">{selectedOpportunity.title}</strong>.
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
                    Réalisations Scientifiques Majeures / Motivations
                  </label>
                  <textarea
                    id="student-achievements"
                    rows="3"
                    required
                    placeholder="Décrivez vos projets académiques, contributions open source ou publications en lien avec cette discipline."
                    value={applyForm.achievements}
                    onChange={(e) => setApplyForm({ ...applyForm, achievements: e.target.value })}
                    className="w-full bg-white/3 border border-white/5 rounded-xl p-3 text-xs font-semibold text-text-primary focus:outline-none focus:border-fieri-blue/30 placeholder:text-text-muted"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-text-secondary">Curriculum Vitae / Portfolio</span>
                  <div className="border border-dashed border-white/10 rounded-2xl p-4 bg-white/2 text-center flex flex-col items-center justify-center gap-2 hover:border-fieri-blue/30 hover:bg-white/3 transition-colors cursor-pointer relative">
                    <FileText className="w-6 h-6 text-fieri-blue" />
                    <div>
                      <p className="text-[10px] text-text-primary font-bold">Simuler le dépôt d'un fichier PDF</p>
                      <p className="text-[8px] text-text-muted mt-0.5">Taille max: 10 Mo (Simulation de validation)</p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.zip"
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
                    className="flex-1 py-3 rounded-xl bg-fieri-blue hover:bg-fieri-blue/90 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-fieri-blue/20 cursor-pointer"
                  >
                    Transmettre
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────── RESEARCHER PUBLISH OFFER MODAL ─────────────────────────── */}
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
                  Publier une opportunité de recherche
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Renseignez les critères et les détails scientifiques pour attirer des candidats talentueux.
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
                    <label htmlFor="publish-title" className="text-[9px] font-black uppercase tracking-wider text-text-secondary">Intitulé du Poste</label>
                    <input
                      ref={publishInputRef}
                      id="publish-title"
                      type="text"
                      required
                      placeholder="ex. Doctorat en Edge Computing"
                      value={publishForm.title}
                      onChange={(e) => setPublishForm({ ...publishForm, title: e.target.value })}
                      className="w-full bg-white/3 border border-white/5 rounded-xl py-2.5 px-4 text-xs font-semibold text-text-primary focus:outline-none focus:border-fieri-blue/30"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="publish-type" className="text-[9px] font-black uppercase tracking-wider text-text-secondary">Type de contrat</label>
                    <select
                      id="publish-type"
                      value={publishForm.type}
                      onChange={(e) => setPublishForm({ ...publishForm, type: e.target.value })}
                      className="w-full bg-[#0d1120] border border-white/5 rounded-xl py-2.5 px-4 text-xs font-semibold text-text-primary focus:outline-none focus:border-fieri-blue/30"
                    >
                      <option value="CDD R&D">CDD R&D</option>
                      <option value="Doctorat">Doctorat</option>
                      <option value="Stage de Recherche">Stage de Recherche</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="publish-discipline" className="text-[9px] font-black uppercase tracking-wider text-text-secondary">Discipline</label>
                    <input
                      id="publish-discipline"
                      type="text"
                      required
                      placeholder="ex. Vision / Robotique"
                      value={publishForm.discipline}
                      onChange={(e) => setPublishForm({ ...publishForm, discipline: e.target.value })}
                      className="w-full bg-white/3 border border-white/5 rounded-xl py-2.5 px-4 text-xs font-semibold text-text-primary focus:outline-none focus:border-fieri-blue/30"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="publish-salary" className="text-[9px] font-black uppercase tracking-wider text-text-secondary">Salaire indicatif ($ / mois)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-xs text-text-muted">$</span>
                      <input
                        id="publish-salary"
                        type="number"
                        min="1"
                        required
                        placeholder="2400"
                        value={publishForm.salary}
                        onChange={(e) => setPublishForm({ ...publishForm, salary: e.target.value })}
                        className="w-full bg-white/3 border border-white/5 rounded-xl py-2.5 pl-8 pr-4 text-xs font-semibold text-text-primary focus:outline-none focus:border-fieri-blue/30"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="publish-desc" className="text-[9px] font-black uppercase tracking-wider text-text-secondary">Description détaillée des missions</label>
                  <textarea
                    id="publish-desc"
                    rows="3"
                    required
                    placeholder="Décrivez précisément les problématiques scientifiques que le candidat devra aborder."
                    value={publishForm.description}
                    onChange={(e) => setPublishForm({ ...publishForm, description: e.target.value })}
                    className="w-full bg-white/3 border border-white/5 rounded-xl p-3 text-xs font-semibold text-text-primary focus:outline-none focus:border-fieri-blue/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="publish-req" className="text-[9px] font-black uppercase tracking-wider text-text-secondary">Pré-requis techniques / diplômes requis</label>
                  <textarea
                    id="publish-req"
                    rows="2"
                    required
                    placeholder="Compétences recherchées, langages, frameworks et expérience demandée."
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
                    className="flex-1 py-3 rounded-xl bg-fieri-blue hover:bg-fieri-blue/90 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-fieri-blue/20 cursor-pointer"
                  >
                    Créer l'opportunité
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
