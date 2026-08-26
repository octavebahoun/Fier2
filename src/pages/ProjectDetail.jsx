import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ChevronRight, 
  Coins, Heart,  Info, Landmark, 
  Star, Trophy, Users, X, 
  ShieldAlert, Check 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import { useAuthGate } from '../context/AuthGateContext.jsx';
import { useToast } from '../components/ui/Toast.jsx'


// ─────────────────────────── Project Detail Skeleton ───────────────────────────
function ProjectDetailSkeleton() {
  return (
    <motion.div
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      className="max-w-[88rem] mx-auto w-full py-24 px-6 md:px-12 lg:px-12 flex flex-col gap-12"
    >
      <div className="h-10 bg-bg-tertiary rounded-xl w-36 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="h-14 bg-bg-tertiary chamfer-sm w-3/4 animate-pulse" />
          <div className="h-6 bg-bg-tertiary rounded-md w-1/4 animate-pulse" />
          <div className="h-44 bg-bg-tertiary chamfer w-full animate-pulse" />
          <div className="h-72 bg-bg-tertiary chamfer w-full animate-pulse" />
        </div>
        <div className="flex flex-col gap-8">
          <div className="h-48 bg-bg-tertiary chamfer w-full animate-pulse" />
          <div className="h-32 bg-bg-tertiary chamfer w-full animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────── Main Component ───────────────────────────
export default function ProjectDetail({ navigate, projectId }) {
  const { user } = useAuth();
  const { promptLogin } = useAuthGate();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowed, setIsFollowed] = useState(false);
  const [isPledgeModalOpen, setIsPledgeModalOpen] = useState(false);
  const [pledgeAmount, setPledgeAmount] = useState('');
  const { notify } = useToast()
  const [pledgeError, setPledgeError] = useState('');

  // Refs for modal keyboard accessibility / focus trapping
  const modalRef = useRef(null);
  const inputRef = useRef(null);
  const triggerRef = useRef(null);

  // Helper to map project names to specific researcher profiles in the annuaire
  const getResearcherIdByName = (name) => {
    if (!name) return 'r1';
    if (name.includes("Marie-Claire") || name.includes("Ousmane")) return "r1";
    if (name.includes("Alexis") || name.includes("Dr. Alexis")) return "r2";
    if (name.includes("Amadou") || name.includes("Kane")) return "r3";
    return "r1"; // Fallback to Marie-Claire
  };

  useEffect(() => {
    const loadProjectDetails = async () => {
      try {
        const projectRes = await api.projects.getById(projectId);
        if (projectRes.success) {
          setProject(projectRes.data);
          const followRes = await api.projects.isFollowed(projectRes.data.id);
          if (followRes.success) {
            setIsFollowed(followRes.data);
          }
        } else {
          setError(projectRes.message || "Ce projet R&D n'est pas répertorié ou a été archivé.");
        }
      } catch {
        setError("Erreur réseau ou serveur lors du chargement du projet.");
      } finally {
        setIsLoading(false);
      }
    };
    loadProjectDetails();
  }, [projectId]);

  // Handle follow / unfollow toggle with localStorage
  const handleFollowToggle = async () => {
    if (!user) {
      promptLogin("Connectez-vous pour suivre ce projet.");
      return;
    }

    try {
      const res = await api.projects.toggleFollow(project.id);
      if (res.success) {
        setIsFollowed(res.data);
        notify(res.message);
      } else {
        notify(res.message || "Impossible de modifier le statut de suivi.", 'error');
      }
    } catch {
      notify("Erreur lors de la modification de votre abonnement au projet.", 'error');
    }
  };

  // Open modal and set focus inside
  const openPledgeModal = () => {
    if (!user) {
      promptLogin("Connectez-vous pour soutenir ce projet.");
      return;
    }
    setIsPledgeModalOpen(true);
    setPledgeError('');
    setPledgeAmount('');
    // Save current active element to restore focus later
    triggerRef.current = document.activeElement;
  };

  // Close modal and restore focus
  const closePledgeModal = () => {
    setIsPledgeModalOpen(false);
    if (triggerRef.current) {
      triggerRef.current.focus();
    }
  };

  // Keyboard accessibility handler for Esc key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isPledgeModalOpen) {
        closePledgeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPledgeModalOpen]);

  // Trap focus inside modal
  useEffect(() => {
    if (isPledgeModalOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 50);
    }
  }, [isPledgeModalOpen]);

  // Handle donation / pledge submit
  const handlePledgeSubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(pledgeAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setPledgeError("Veuillez saisir un montant positif valide supérieur à 0.");
      return;
    }

    try {
      const res = await api.projects.support(project.id, amount);
      if (res.success) {
        setProject(p => ({ ...p, budgetRaised: res.data.newBudget }));
        notify(res.message || `Merci ! Votre promesse de soutien de ${amount} $ a été enregistrée.`);
        closePledgeModal();
      } else {
        setPledgeError(res.message || "Erreur lors de la transaction fictive.");
      }
    } catch {
      setPledgeError("Erreur réseau ou serveur lors de la validation du soutien.");
    }
  };

  if (isLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (error || !project) {
    return (
      <div className="max-w-2xl mx-auto w-full py-32 px-6 flex flex-col items-center justify-center text-center gap-8 min-h-screen">
        <div className="w-20 h-20 rounded-full bg-danger-wash border border-danger flex items-center justify-center text-danger animate-pulse">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-extrabold tracking-tight text-text-primary">Projet Non Référencé</h2>
          <p className="text-sm text-text-secondary max-w-md">
            {error || "Les détails de cette initiative scientifique ne sont plus disponibles."}
          </p>
        </div>
        <button
          onClick={() => navigate('projects')}
          className="px-6 py-3 chamfer-sm chamfer-shadow text-xs font-bold text-on-accent bg-engine hover:bg-engine transition-all cursor-pointer flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retourner au Hub R&D
        </button>
      </div>
    );
  }

  const budgetGoal = project.budgetGoal || 10000;
  const budgetPercentage = Math.min(100, Math.round((project.budgetRaised / budgetGoal) * 100));

  return (
    <div className="max-w-[88rem] mx-auto w-full py-24 px-6 md:px-12 lg:px-12 relative min-h-screen">
      
      {/* Dynamic notification toasts */}


      {/* Breadcrumbs and navigation back */}
      <div className="flex flex-col gap-6 relative z-10 mb-8">
        <button
          onClick={() => navigate('projects')}
          className="w-fit flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-engine transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retourner au Hub R&D
        </button>
        
        <div className="flex items-center gap-2 text-xs font-extrabold text-text-muted uppercase tracking-widest">
          <span>Projets</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-engine font-extrabold truncate max-w-[200px]">{project.title}</span>
        </div>
      </div>

      {/* Main detail content grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key="detail-layout"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10"
        >
          
          {/* Left Column - 2/3 Width */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Project Cover Image */}
            {project.image && (
              <div className="relative h-64 md:h-80 chamfer chamfer-shadow overflow-hidden bg-bg-secondary ">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="absolute inset-0 w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-transparent to-transparent opacity-80" />
              </div>
            )}

            {/* Header info */}
            <div className="glass-panel chamfer p-8 flex flex-col gap-6">
              <div className="flex justify-between items-start gap-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-success bg-success-wash border border-success px-3 py-1 rounded-md">
                  {project.status}
                </span>
                <span className="text-xs font-bold text-text-muted bg-bg-tertiary border border-border-subtle px-3 py-1 rounded-md">
                  ID: {project.id}
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight leading-tight">
                  {project.title}
                </h1>
                <p className="text-sm text-text-secondary leading-relaxed font-semibold">
                  {project.summary}
                </p>
              </div>

              {/* Technologies list */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border-subtle">
                {project.technologies && project.technologies.map((tech, idx) => (
                  <span key={idx} className="text-xs font-extrabold text-text-muted bg-bg-tertiary px-2.5 py-1 rounded-md border border-border-subtle">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* In-depth research description */}
            <div className="glass-panel chamfer p-8 flex flex-col gap-6">
              <h2 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
                <Info className="w-5 h-5 text-engine" />
                Description de l'Initiative
              </h2>
              <p className="text-xs md:text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {project.description || "Aucun descriptif complémentaire disponible pour ce projet de recherche scientifique."}
              </p>
            </div>

            {/* Milestone Timeline Component */}
            <div className="glass-panel chamfer p-8 flex flex-col gap-8">
              <h2 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
                <Trophy className="w-5 h-5 text-engine animate-pulse" />
                Jalons & Avancement Scientifique
              </h2>

              {/* Milestones Vertical Stack */}
              <div className="relative pl-6 md:pl-8 flex flex-col gap-8 border-l border-border-subtle ml-2">
                {project.timeline && project.timeline.map((step, idx) => {
                  const isCurrent = !step.completed && (idx === 0 || project.timeline[idx - 1]?.completed);
                  
                  return (
                    <div key={idx} className="relative group">
                      
                      {/* Interactive glowing node dot representation */}
                      <span className={`absolute -left-[31px] md:-left-[39px] top-1 w-[18px] h-[18px] rounded-full border flex items-center justify-center transition-all ${
                        step.completed
                          ? 'bg-success border-success text-on-accent'
                          : isCurrent
                            ? 'bg-engine border-engine text-on-accent animate-pulse'
                            : 'bg-slate-900 border-border-subtle text-text-muted'
                      }`}>
                        {step.completed ? (
                          <Check className="w-2.5 h-2.5" />
                        ) : isCurrent ? (
                          <ChevronRight className="w-2.5 h-2.5" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-bg-secondary" />
                        )}
                      </span>

                      {/* Milestone details block */}
                      <div className="space-y-1.5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                          <h4 className={`text-xs md:text-sm font-extrabold transition-colors ${
                            step.completed
                              ? 'text-text-primary'
                              : isCurrent
                                ? 'text-engine font-extrabold'
                                : 'text-text-muted'
                          }`}>
                            {step.title}
                          </h4>
                          <span className="text-xs font-bold text-text-muted bg-bg-secondary border border-border-subtle px-2 py-0.5 rounded w-fit shrink-0">
                            {step.date}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted leading-relaxed">
                          {step.completed 
                            ? "Jalon validé avec succès par le laboratoire." 
                            : isCurrent
                              ? "Phase active en cours de développement." 
                              : "Étape prévisionnelle planifiée."}
                        </p>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Team Members Section */}
            <div className="glass-panel chamfer p-8 flex flex-col gap-6">
              <h2 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
                <Users className="w-5 h-5 text-engine" />
                Membres de l'Équipe
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.team && project.team.map((member, idx) => {
                  const researcherId = getResearcherIdByName(member.name);
                  
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => navigate('profile', { researcherId })}
                      className="bg-bg-secondary hover:bg-bg-tertiary border border-border-subtle hover:border-engine/20 p-4 chamfer-sm flex items-center gap-3 transition-all cursor-pointer group/member"
                    >
                      <div className="w-9 h-9 rounded-full bg-engine-wash border border-engine/10 flex items-center justify-center font-extrabold text-xs text-on-accent group-hover/member:bg-engine group-hover/member:text-on-accent transition-all">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-text-primary group-hover/member:text-engine transition-colors">
                          {member.name}
                        </h4>
                        <p className="text-xs text-text-secondary">{member.role}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column - 1/3 Width (Bento Cards) */}
          <div className="flex flex-col gap-8 col-span-1">
            
            {/* Financial Pledge Progress Bento */}
            <div className="glass-panel border border-border-subtle chamfer p-6 bg-bg-secondary flex flex-col gap-6 justify-between relative overflow-hidden">
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-2 text-xs font-extrabold text-engine uppercase tracking-wider">
                  <Landmark className="w-4 h-4" />
                  Campagne de Financement
                </div>
                <h3 className="text-xl font-extrabold text-text-primary leading-tight">
                  Budget & Financement Co-opératif
                </h3>
              </div>

              {/* Progress and values */}
              <div className="space-y-4 relative z-10 pt-4">
                <div className="flex justify-between items-end text-xs">
                  <span className="text-text-secondary font-bold">Récolté</span>
                  <span className="text-engine font-extrabold text-lg">{project.budgetRaised} $</span>
                </div>
                
                <div className="w-full h-2.5 bg-bg-tertiary rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-engine to-engine-deep rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${budgetPercentage}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs font-bold text-text-muted">
                  <span>Cible : {budgetGoal} $</span>
                  <span>{budgetPercentage}% atteints</span>
                </div>
              </div>

              <div className="space-y-3 relative z-10 pt-4 border-t border-border-subtle">
                <button
                  onClick={openPledgeModal}
                  className="w-full py-3.5 chamfer-sm chamfer-shadow text-xs font-extrabold uppercase tracking-wider text-on-accent bg-engine hover:bg-engine transition-all cursor-pointer text-center flex items-center justify-center gap-2"
                >
                  <Coins className="w-4 h-4" />
                  Soutenir ce projet
                </button>
                <p className="text-xs text-text-muted text-center leading-relaxed font-medium">
                  * Simulation académique de promesse d'investissement financier. Aucun fonds réel n'est engagé.
                </p>
              </div>
            </div>

            {/* Interactive Subscription / Follow Card */}
            <div className="glass-panel border border-border-subtle chamfer p-6 bg-bg-secondary flex flex-col gap-6 relative overflow-hidden">
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-2 text-xs font-extrabold text-engine uppercase tracking-wider">
                  <Star className="w-4 h-4" />
                  Abonnements
                </div>
                <h3 className="text-xl font-extrabold text-text-primary leading-tight">
                  Suivi R&D en Direct
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                  Abonnez-vous à ce projet pour recevoir des notifications en direct lors de la validation des prochains jalons de recherche.
                </p>
              </div>

              <div className="space-y-2 relative z-10 pt-4 border-t border-border-subtle">
                <button
                  onClick={handleFollowToggle}
                  className={`w-full py-3 chamfer-sm text-xs font-extrabold uppercase tracking-wider border transition-all cursor-pointer text-center flex items-center justify-center gap-2 ${
                    isFollowed
                      ? 'bg-success-wash border-success text-success'
                      : 'bg-bg-secondary border-border-subtle hover:bg-bg-tertiary text-text-primary'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFollowed ? 'fill-success' : ''}`} />
                  {isFollowed ? 'Projet Suivi' : 'Suivre ce projet'}
                </button>
              </div>
            </div>

            {/* Associated Research Club Bento */}
            <div className="glass-panel border border-border-subtle chamfer p-6 bg-bg-secondary flex flex-col justify-between relative overflow-hidden group/club">
              <div className="space-y-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-text-muted">
                  Laboratoire Parent
                </span>
                <h3 className="text-base font-extrabold text-text-primary leading-tight group-hover/club:text-engine transition-colors">
                  Club {project.clubName}
                </h3>
              </div>

              <div className="pt-6 border-t border-border-subtle mt-4 flex items-center justify-between">
                <button
                  onClick={() => navigate('clubs')}
                  className="text-xs font-extrabold uppercase tracking-wider text-engine hover:text-engine/80 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  Visiter le club
                  <ArrowLeft className="w-3 h-3 rotate-180" />
                </button>
              </div>
            </div>

          </div>

        </motion.div>
      </AnimatePresence>

      {/* ─────────────────────────── GLASSMORPHIC PLEDGE MODAL ─────────────────────────── */}
      <AnimatePresence>
        {isPledgeModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 relative">
            
            {/* Dark glass backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePledgeModal}
              className="absolute inset-0 bg-bg-primary/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="glass-panel border border-border-subtle chamfer chamfer-shadow p-8 max-w-md w-full relative bg-bg-secondary z-10 flex flex-col gap-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              
              {/* Close Button */}
              <button
                onClick={closePledgeModal}
                className="absolute top-4 right-4 text-text-muted hover:text-text-primary p-2 rounded-xl bg-bg-secondary border border-border-subtle cursor-pointer"
                aria-label="Fermer la modale"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Title Header */}
              <div className="space-y-2 text-center">
                <div className="mx-auto w-12 h-12 bg-engine-wash border border-engine/20 rounded-full flex items-center justify-center text-engine animate-bounce">
                  <Landmark className="w-6 h-6" />
                </div>
                <h3 id="modal-title" className="text-xl font-extrabold text-text-primary tracking-tight">
                  Soutien Financier Virtuel
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
                  Déclarez une promesse d'investissement financier pour le projet <strong className="text-engine font-bold">{project.title}</strong>.
                </p>
              </div>

              {/* Input & Presets form */}
              <form onSubmit={handlePledgeSubmit} className="flex flex-col gap-5">
                
                <div className="flex flex-col gap-2">
                  <label htmlFor="pledge-input" className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">
                    Montant de la promesse ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-xs text-text-muted">$</span>
                    <input
                      ref={inputRef}
                      id="pledge-input"
                      type="number"
                      min="1"
                      placeholder="0.00"
                      value={pledgeAmount}
                      onChange={(e) => {
                        setPledgeAmount(e.target.value);
                        setPledgeError('');
                      }}
                      className="w-full bg-bg-secondary border border-border-subtle focus:border-engine/30 rounded-xl py-3 pl-9 pr-4 text-xs font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-engine/25 transition-all"
                    />
                  </div>
                  {pledgeError && (
                    <span className="text-xs text-danger font-bold mt-1 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {pledgeError}
                    </span>
                  )}
                </div>

                {/* Preset quick buttons */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-text-muted">
                    Montants Prédéfinis
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {[100, 500, 1000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          setPledgeAmount(val.toString());
                          setPledgeError('');
                        }}
                        className="py-2.5 rounded-xl border border-border-subtle bg-bg-secondary hover:bg-bg-tertiary hover:border-engine/30 text-xs font-extrabold text-text-primary transition-all cursor-pointer"
                      >
                        + {val} $
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-border-subtle">
                  <button
                    type="button"
                    onClick={closePledgeModal}
                    className="flex-1 py-3 rounded-xl border border-border-subtle bg-bg-secondary hover:bg-bg-tertiary text-xs font-extrabold uppercase text-text-secondary tracking-wider transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-engine hover:bg-engine text-on-accent text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all cursor-pointer"
                  >
                    Valider
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
