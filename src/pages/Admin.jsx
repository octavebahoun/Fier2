import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, CheckCircle, AlertTriangle, Users, BookOpen, 
  Check, Trash2, Calendar, User, ChevronDown, ChevronUp 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api';
import MembersManager from '../components/admin/MembersManager.jsx';
import { useToast } from '../components/ui/Toast.jsx'
import StatePanel from '../components/ui/StatePanel.jsx';


export default function Admin() {
  const { user } = useAuth();
  const [pendingArticles, setPendingArticles] = useState([]);
  const [approvedCount, setApprovedCount] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(null); // ID of article being approved/rejected
  const [expandedArticleId, setExpandedArticleId] = useState(null); // ID of expanded article for reading
  const { notify } = useToast()
  const [tab, setTab] = useState('moderation'); // 'moderation' | 'members'

  // Load pending articles and statistics
  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await api.news.getAll(true); // Fetch all including PENDING
      if (!res.success) throw new Error(res.message);
      const allArticles = res.data;
      setPendingArticles(allArticles.filter(a => a.status === 'PENDING'));
      setApprovedCount(allArticles.filter(a => a.status === 'APPROVED').length);
    } catch (err) {
      // Un compteur faux est pire qu'un compteur absent : on remonte l'échec.
      setApprovedCount(null);
      setPendingArticles([]);
      setLoadError(err?.serverMessage || err?.message || "Les publications n'ont pas pu être chargées.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // L'accès à la page est garanti par ProtectedRoute : plus de re-test ici.
    loadData();
  }, [user]);

  const handleApprove = async (id) => {
    setActionInProgress(id);
    try {
      const res = await api.news.approve(id);
      if (res.success) {
        notify("Article approuvé avec succès ! Il est désormais publié.", "success");
        // Filter out of pending list
        setPendingArticles(prev => prev.filter(a => a.id !== id));
        setApprovedCount(prev => prev + 1);
        if (expandedArticleId === id) setExpandedArticleId(null);
      } else {
        notify("Erreur lors de l'approbation de l'article.", "error");
      }
    } catch (err) {
      console.error(err);
      notify("Erreur lors de l'appel API.", "error");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir rejeter et supprimer cet article définitivement ?")) {
      return;
    }
    setActionInProgress(id);
    try {
      const res = await api.news.reject(id);
      if (res.success) {
        notify("Article rejeté et supprimé.", "success");
        setPendingArticles(prev => prev.filter(a => a.id !== id));
        if (expandedArticleId === id) setExpandedArticleId(null);
      } else {
        notify("Erreur lors du rejet de l'article.", "error");
      }
    } catch (err) {
      console.error(err);
      notify("Erreur lors de l'appel API.", "error");
    } finally {
      setActionInProgress(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedArticleId(prev => (prev === id ? null : id));
  };

  return (
    <div className="max-w-[92rem] mx-auto w-full py-24 px-6 md:px-12 lg:px-12">
      {/* En-tête */}
      <div className="flex flex-col gap-2 mb-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-danger-wash border border-danger text-danger">
            <Shield className="w-6 h-6" />
          </div>
          <span className="text-xs font-extrabold tracking-[0.25em] uppercase text-danger">
            ESPACE DE CONTRÔLE
          </span>
        </div>
        <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">
          Console d'Administration
        </h1>
        <p className="text-xs text-text-secondary">
          Gestion de la plateforme, validation éditoriale et modération des publications scientifiques.
        </p>
      </div>

      {/* Onglets de la console d'administration */}
      <div className="flex items-center gap-1 p-1 chamfer-sm bg-bg-secondary border border-border-subtle w-fit mb-8">
        {[
          { id: 'moderation', label: 'Comité de lecture', icon: BookOpen },
          { id: 'members', label: 'Membres', icon: Users },
        ].map((t) => {
          const TabIcon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                active
                  ? 'bg-engine-wash border border-engine text-text-primary'
                  : 'text-text-secondary hover:text-text-primary border border-transparent'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'members' ? (
        <MembersManager />
      ) : (
      <>
      {/* Grid d'administration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel border border-border-subtle bg-bg-secondary p-6 chamfer-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-engine-wash border border-engine text-engine">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">Membres</span>
          </div>
          <h3 className="text-2xl font-extrabold text-text-primary">1 240</h3>
          <p className="text-xs text-text-secondary mt-1">Utilisateurs inscrits sur la plateforme</p>
        </div>

        <div className="glass-panel border border-border-subtle bg-bg-secondary p-6 chamfer-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-success-wash border border-success text-success">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">Publications</span>
          </div>
          <h3 className="text-2xl font-extrabold text-text-primary">
            {approvedCount === null ? '—' : `${approvedCount} Approuvées`}
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            {approvedCount === null
              ? 'Chiffre indisponible'
              : `${pendingArticles.length} en attente de comité de lecture`}
          </p>
        </div>

        <div className="glass-panel border border-border-subtle bg-bg-secondary p-6 chamfer-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-warning-wash border border-warning text-warning">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-text-secondary">Système</span>
          </div>
          <h3 className="text-2xl font-extrabold text-text-primary">100% En Ligne</h3>
          <p className="text-xs text-text-secondary mt-1">Base de données hybride locale</p>
        </div>
      </div>

      {/* Comité de lecture Section */}
      <div className="glass-panel border border-border-subtle bg-bg-secondary chamfer p-6 md:p-8">
        <div className="flex items-center justify-between border-b border-border-subtle pb-6 mb-6">
          <div>
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-engine" />
              Comité de lecture et validation
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Examinez les articles de recherche soumis par les membres du pôle de recherche avant publication.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full bg-engine-wash border border-engine text-xs font-extrabold text-engine">
            {pendingArticles.length} En attente
          </span>
        </div>

        {loading ? (
          <StatePanel state="loading" />
        ) : loadError ? (
          <StatePanel state="error" message={loadError} onRetry={loadData} />
        ) : pendingArticles.length === 0 ? (
          <div className="py-16 text-center max-w-md mx-auto">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
            <h3 className="text-sm font-bold text-text-primary mb-1">Tout est en ordre</h3>
            <p className="text-xs text-text-secondary">
              Aucun article de recherche n'est en attente d'approbation pour le moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingArticles.map((article) => {
              const isExpanded = expandedArticleId === article.id;
              const isProcessing = actionInProgress === article.id;
              
              return (
                <motion.div
                  key={article.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-border-subtle bg-bg-secondary chamfer-sm overflow-hidden transition-colors hover:border-engine"
                >
                  {/* Article Summary Row */}
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border border-engine bg-engine-wash text-engine">
                          {article.categorie}
                        </span>
                        <span className="inline-flex items-center text-xs text-text-secondary gap-1">
                          <User className="w-3 h-3 text-engine" />
                          {article.author}
                        </span>
                        <span className="inline-flex items-center text-xs text-text-secondary gap-1 ml-2">
                          <Calendar className="w-3 h-3" />
                          {article.date}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-text-primary leading-tight">
                        {article.title}
                      </h3>
                      <p className="text-xs text-text-secondary mt-1.5 line-clamp-2">
                        {article.excerpt}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => toggleExpand(article.id)}
                        className={`p-2.5 rounded-xl border border-border-subtle hover:text-text-primary hover:bg-bg-tertiary transition-all cursor-pointer flex items-center gap-1.5 text-xs text-text-secondary font-bold ${isExpanded ? 'bg-bg-secondary' : ''}`}
                      >
                        {isExpanded ? (
                          <>
                            <span>Masquer</span>
                            <ChevronUp className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            <span>Lire</span>
                            <ChevronDown className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleApprove(article.id)}
                        disabled={isProcessing}
                        className="p-2.5 rounded-xl border border-success hover:border-success bg-success-wash hover:bg-success-wash text-success hover:scale-105 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                        title="Approuver la publication"
                      >
                        <Check className="w-4.5 h-4.5" />
                      </button>

                      <button
                        onClick={() => handleReject(article.id)}
                        disabled={isProcessing}
                        className="p-2.5 rounded-xl border-danger hover:border-danger bg-danger-wash hover:bg-danger-wash text-danger hover:scale-105 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                        title="Rejeter et supprimer"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Body Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-border-subtle bg-bg-primary"
                      >
                        <div className="p-6 md:p-8 space-y-6">
                          {/* Image and core info block */}
                          <div className="flex flex-col md:flex-row gap-6">
                            {article.image && (
                              <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden bg-bg-tertiary shrink-0 border border-border-subtle">
                                <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1 space-y-4">
                              <div>
                                <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Résumé de pre-visualisation</h4>
                                <p className="text-xs text-text-primary leading-relaxed bg-bg-secondary p-3.5 rounded-xl border border-border-subtle">
                                  {article.excerpt}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Full text body */}
                          <div>
                            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Contenu de la publication</h4>
                            <div className="text-xs md:text-sm text-text-secondary bg-bg-secondary p-5 chamfer-sm border border-border-subtle leading-relaxed whitespace-pre-wrap">
                              {article.content || "Aucun contenu étendu fourni."}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      </>
      )}

      {/* Toast Popups */}

    </div>
  );
}
