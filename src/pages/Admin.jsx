import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, CheckCircle, AlertTriangle, Users, BookOpen, 
  Check, Trash2, Eye, Calendar, User, ChevronDown, ChevronUp 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api';

// ─────────────────────────── Toast Component ───────────────────────────
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgClass =
    type === 'success'
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
      <CheckCircle className="w-5 h-5 shrink-0" />
      <span className="text-xs font-bold">{message}</span>
    </motion.div>
  );
}

export default function Admin({ navigate }) {
  const { user, hasMinRole } = useAuth();
  const [pendingArticles, setPendingArticles] = useState([]);
  const [approvedCount, setApprovedCount] = useState(42); // Default fallback stats
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(null); // ID of article being approved/rejected
  const [expandedArticleId, setExpandedArticleId] = useState(null); // ID of expanded article for reading
  const [toast, setToast] = useState(null);

  // Load pending articles and statistics
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.news.getAll(true); // Fetch all including PENDING
      if (res.success) {
        const allArticles = res.data;
        const pending = allArticles.filter(a => a.status === 'PENDING');
        const approved = allArticles.filter(a => a.status === 'APPROVED');
        setPendingArticles(pending);
        setApprovedCount(approved.length);
      }
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasMinRole('ADMIN')) {
      loadData();
    }
  }, [user]);

  const handleApprove = async (id) => {
    setActionInProgress(id);
    try {
      const res = await api.news.approve(id);
      if (res.success) {
        setToast({ message: "Article approuvé avec succès ! Il est désormais publié.", type: "success" });
        // Filter out of pending list
        setPendingArticles(prev => prev.filter(a => a.id !== id));
        setApprovedCount(prev => prev + 1);
        if (expandedArticleId === id) setExpandedArticleId(null);
      } else {
        setToast({ message: "Erreur lors de l'approbation de l'article.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Erreur lors de l'appel API.", type: "error" });
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
        setToast({ message: "Article rejeté et supprimé.", type: "success" });
        setPendingArticles(prev => prev.filter(a => a.id !== id));
        if (expandedArticleId === id) setExpandedArticleId(null);
      } else {
        setToast({ message: "Erreur lors du rejet de l'article.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Erreur lors de l'appel API.", type: "error" });
    } finally {
      setActionInProgress(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedArticleId(prev => (prev === id ? null : id));
  };

  // component protection
  if (!hasMinRole('ADMIN')) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
        <h1 className="text-2xl font-bold text-text-primary mb-2">Accès Interdit</h1>
        <p className="text-text-secondary max-w-md">
          Vous devez disposer d'un compte Administrateur pour accéder à cet espace.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[92rem] mx-auto w-full py-24 px-6 md:px-12 lg:px-24">
      {/* En-tête */}
      <div className="flex flex-col gap-2 mb-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            <Shield className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black tracking-[0.25em] uppercase text-red-400">
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

      {/* Grid d'administration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel border border-border-subtle bg-bg-secondary/40 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary">Membres</span>
          </div>
          <h3 className="text-2xl font-black text-text-primary">1 240</h3>
          <p className="text-[10px] text-text-secondary mt-1">Utilisateurs inscrits sur la plateforme</p>
        </div>

        <div className="glass-panel border border-border-subtle bg-bg-secondary/40 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary">Publications</span>
          </div>
          <h3 className="text-2xl font-black text-text-primary">{approvedCount} Approuvées</h3>
          <p className="text-[10px] text-text-secondary mt-1">
            {pendingArticles.length} en attente de comité de lecture
          </p>
        </div>

        <div className="glass-panel border border-border-subtle bg-bg-secondary/40 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary">Système</span>
          </div>
          <h3 className="text-2xl font-black text-text-primary">100% En Ligne</h3>
          <p className="text-[10px] text-text-secondary mt-1">Base de données hybride locale</p>
        </div>
      </div>

      {/* Comité de lecture Section */}
      <div className="glass-panel border border-border-subtle bg-bg-secondary/30 rounded-3xl p-6 md:p-8">
        <div className="flex items-center justify-between border-b border-border-subtle pb-6 mb-6">
          <div>
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Comité de lecture et validation
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Examinez les articles de recherche soumis par les membres du pôle de recherche avant publication.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-extrabold text-indigo-400">
            {pendingArticles.length} En attente
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-text-secondary animate-pulse text-xs font-semibold">
            Chargement des articles en attente...
          </div>
        ) : pendingArticles.length === 0 ? (
          <div className="py-16 text-center max-w-md mx-auto">
            <CheckCircle className="w-12 h-12 text-emerald-500/30 mx-auto mb-4" />
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
                  className="border border-border-subtle/80 bg-bg-secondary/40 rounded-2xl overflow-hidden transition-colors hover:border-indigo-500/20"
                >
                  {/* Article Summary Row */}
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                          {article.categorie}
                        </span>
                        <span className="inline-flex items-center text-[10px] text-text-secondary gap-1">
                          <User className="w-3 h-3 text-indigo-400/70" />
                          {article.author}
                        </span>
                        <span className="inline-flex items-center text-[10px] text-text-secondary gap-1 ml-2">
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
                        className={`p-2.5 rounded-xl border border-border-subtle hover:text-text-primary hover:bg-white/5 transition-all cursor-pointer flex items-center gap-1.5 text-xs text-text-secondary font-bold ${isExpanded ? 'bg-white/5' : ''}`}
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
                        className="p-2.5 rounded-xl border border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:scale-105 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                        title="Approuver la publication"
                      >
                        <Check className="w-4.5 h-4.5" />
                      </button>

                      <button
                        onClick={() => handleReject(article.id)}
                        disabled={isProcessing}
                        className="p-2.5 rounded-xl border-rose-500/30 hover:border-rose-500/60 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:scale-105 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
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
                        className="overflow-hidden border-t border-border-subtle bg-bg-primary/20"
                      >
                        <div className="p-6 md:p-8 space-y-6">
                          {/* Image and core info block */}
                          <div className="flex flex-col md:flex-row gap-6">
                            {article.image && (
                              <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden bg-white/5 shrink-0 border border-border-subtle">
                                <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1 space-y-4">
                              <div>
                                <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Résumé de pre-visualisation</h4>
                                <p className="text-xs text-text-primary leading-relaxed bg-bg-secondary/40 p-3.5 rounded-xl border border-border-subtle">
                                  {article.excerpt}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Full text body */}
                          <div>
                            <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Contenu de la publication</h4>
                            <div className="text-xs md:text-sm text-text-secondary bg-bg-secondary/20 p-5 rounded-2xl border border-border-subtle leading-relaxed whitespace-pre-wrap">
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

      {/* Toast Popups */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
