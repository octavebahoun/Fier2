import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Calendar, User, Search, PlusCircle, X,
  Clock, ArrowRight, BookMarked, Layers, FileText, CheckCircle, Image,
  Newspaper, CalendarDays
} from 'lucide-react';
import Events from './Events.jsx';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import FadeInWhenVisible from '../components/home/FadeInWhenVisible.jsx';

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

// ─────────────────────────── Category Color Mapping ───────────────────────────
const CATEGORY_COLORS = {
  "Intelligence Artificielle": "from-indigo-500/20 to-blue-500/20 border-indigo-500/30 text-indigo-400",
  "Lancement R&D": "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400",
  "Éco-énergie": "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400",
  "Bio-Tech": "from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-400",
  "Robotique": "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400"
};

const getCategoryClass = (cat) => {
  return CATEGORY_COLORS[cat] || "from-slate-500/20 to-zinc-500/20 border-slate-500/30 text-slate-400";
};

// Preset images for science publications
const IMAGE_PRESETS = [
  {
    name: "IA & Réseaux",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Robotique & Smart Tech",
    url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Énergies & Solaire",
    url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&auto=format&fit=crop&q=80"
  },
  {
    name: "Laboratoire & Biotech",
    url: "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=800&auto=format&fit=crop&q=80"
  }
];

export default function News({ navigate }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('actualites');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  
  // Write modal states
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: '',
    categorie: 'Intelligence Artificielle',
    image: IMAGE_PRESETS[0].url,
    excerpt: '',
    content: ''
  });

  // Reading modal state
  const [readingArticle, setReadingArticle] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await api.news.getAll(false); // Only fetch APPROVED news for public newsfeed
      if (res.success) {
        setNews(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    if (!newArticle.title || !newArticle.excerpt || !newArticle.content) {
      setToast({ message: "Veuillez remplir tous les champs requis.", type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const authorName = user?.name || "Chercheur FIERI";
      const payload = {
        ...newArticle,
        author: authorName,
      };

      const res = await api.news.submit(payload);
      if (res.success) {
        setToast({
          message: "Article soumis avec succès au comité de lecture !",
          type: "success"
        });
        // Reset form
        setNewArticle({
          title: '',
          categorie: 'Intelligence Artificielle',
          image: IMAGE_PRESETS[0].url,
          excerpt: '',
          content: ''
        });
        setShowWriteModal(false);
        // We do not refresh public feed because newly submitted articles are PENDING
      } else {
        setToast({ message: "Erreur lors de la soumission de l'article.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Une erreur inattendue est survenue.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // Get unique categories from current news
  const categories = ['Tous', ...new Set(news.map(item => item.categorie))];

  // Filtered news list
  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || item.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const canWrite = user && (user.role === 'CHERCHEUR' || user.role === 'ADMIN');

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pt-24 pb-16 px-4 md:px-8 relative overflow-hidden">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-pink-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Tab Filter: Actualités / Événements */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-bg-secondary/60 border border-border-subtle backdrop-blur-md">
          <button
            onClick={() => setActiveTab('actualites')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'actualites'
                ? 'bg-accent-primary/20 border border-accent-primary/30 text-accent-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary border border-transparent'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            Actualités & Publications
          </button>
          <button
            onClick={() => setActiveTab('evenements')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'evenements'
                ? 'bg-accent-primary/20 border border-accent-primary/30 text-accent-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary border border-transparent'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Événements
          </button>
        </div>
      </div>

      {activeTab === 'actualites' ? (
      <>
      {/* Hero Header */}
      <FadeInWhenVisible>
        <div className="max-w-7xl mx-auto mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border-subtle pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 mb-4">
              <BookMarked className="w-3.5 h-3.5" />
              Journal Scientifique & R&D
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-indigo-100 to-purple-200 bg-clip-text text-transparent">
              Actualités & Publications
            </h1>
            <p className="text-sm md:text-base text-text-secondary mt-3 max-w-2xl">
              Suivez les percées technologiques de nos chercheurs, les comptes-rendus de R&D des clubs scientifiques et les annonces de la Cité Fieri.
            </p>
          </div>

          {canWrite && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowWriteModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition-all cursor-pointer w-full md:w-auto"
            >
              <PlusCircle className="w-4.5 h-4.5" />
              Rédiger un article
            </motion.button>
          )}
        </div>
      </FadeInWhenVisible>

      {/* Filters and Search Bar */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-thin scrollbar-thumb-border-subtle">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400'
                  : 'bg-bg-secondary/40 border-border-subtle text-text-secondary hover:text-text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre, résumé ou chercheur..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-border-subtle bg-bg-secondary/30 text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-indigo-500/60 focus:bg-bg-secondary/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* News Articles Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-panel border border-border-subtle bg-bg-secondary/20 rounded-3xl p-6 h-[400px] animate-pulse flex flex-col justify-between">
                <div className="w-full h-44 rounded-2xl bg-white/5 mb-4" />
                <div className="h-4 w-1/3 bg-white/5 rounded-md mb-2" />
                <div className="h-6 w-3/4 bg-white/5 rounded-md mb-4" />
                <div className="h-4 w-full bg-white/5 rounded-md mb-2" />
                <div className="h-4 w-5/6 bg-white/5 rounded-md mb-6" />
                <div className="h-10 w-full bg-white/5 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="glass-panel border border-border-subtle bg-bg-secondary/10 p-12 rounded-3xl text-center max-w-xl mx-auto">
            <BookOpen className="w-12 h-12 text-indigo-500/40 mx-auto mb-4" />
            <h3 className="text-base font-bold text-text-primary mb-1">Aucune publication trouvée</h3>
            <p className="text-xs text-text-secondary">
              Aucun article ne correspond à votre recherche ou à la thématique sélectionnée.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map((item, idx) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -6 }}
                className="glass-panel border border-border-subtle bg-bg-secondary/25 hover:bg-bg-secondary/40 rounded-3xl overflow-hidden flex flex-col justify-between group transition-all duration-300"
              >
                <div>
                  {/* Article Image Header */}
                  <div className="relative w-full h-48 overflow-hidden bg-white/5">
                    <img
                      src={item.image || "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=800"}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/90 via-bg-primary/20 to-transparent" />
                    
                    {/* Category Pill */}
                    <div className="absolute top-4 left-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-extrabold border backdrop-blur-md bg-bg-primary/60 shadow-lg ${getCategoryClass(item.categorie)}`}>
                        {item.categorie}
                      </span>
                    </div>
                  </div>

                  {/* Info Metadata */}
                  <div className="px-6 pt-5 pb-3 flex items-center justify-between text-[11px] text-text-secondary">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="font-semibold text-text-primary/90">{item.author}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.date}</span>
                    </div>
                  </div>

                  {/* Main Title & Excerpt */}
                  <div className="px-6 py-2">
                    <h3 className="text-base font-bold text-text-primary leading-snug group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-text-secondary mt-2 line-clamp-3 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>
                </div>

                {/* Card Button */}
                <div className="px-6 pb-6 pt-4">
                  <button
                    onClick={() => setReadingArticle(item)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border-subtle hover:border-indigo-500/40 bg-white/5 hover:bg-indigo-600/10 text-xs font-bold text-text-primary hover:text-indigo-400 transition-all cursor-pointer"
                  >
                    <span>Consulter la publication</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      {/* ─────────────────────────── Article Reading Drawer / Modal ─────────────────────────── */}
      <AnimatePresence>
        {readingArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-md bg-black/60"
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="glass-panel border border-border-subtle bg-bg-secondary w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl relative max-h-[85vh] flex flex-col"
            >
              {/* Image banner inside Detail Modal */}
              <div className="relative w-full h-64 md:h-72 overflow-hidden shrink-0">
                <img
                  src={readingArticle.image || "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=800"}
                  alt={readingArticle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-bg-secondary/30 to-black/60" />
                
                {/* Close Button */}
                <button
                  onClick={() => setReadingArticle(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 border border-white/10 hover:border-white/30 text-white hover:scale-105 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Category badge */}
                <div className="absolute bottom-6 left-6 flex flex-col gap-2">
                  <span className={`self-start inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-extrabold border bg-bg-primary/80 backdrop-blur-md shadow-md ${getCategoryClass(readingArticle.categorie)}`}>
                    {readingArticle.categorie}
                  </span>
                  <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight leading-tight pr-4">
                    {readingArticle.title}
                  </h2>
                </div>
              </div>

              {/* Detail Content Scrollable container */}
              <div className="p-6 md:p-8 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-border-subtle leading-relaxed">
                {/* Metadata details */}
                <div className="flex flex-wrap items-center gap-6 text-xs text-text-secondary border-b border-border-subtle pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-[11px] text-indigo-400 font-bold uppercase shadow-sm">
                      {readingArticle.author.substring(0, 2)}
                    </div>
                    <div>
                      <div className="text-[10px] text-text-secondary">Auteur</div>
                      <div className="font-semibold text-text-primary">{readingArticle.author}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-text-secondary">Publié le</div>
                      <div className="font-semibold text-text-primary">{readingArticle.date}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-text-secondary">Temps de lecture</div>
                      <div className="font-semibold text-text-primary">4 min</div>
                    </div>
                  </div>
                </div>

                {/* Excerpt Section */}
                <div className="bg-indigo-600/5 border-l-2 border-indigo-500/50 p-4 rounded-r-xl text-xs font-semibold text-text-primary/90 italic mb-6">
                  {readingArticle.excerpt}
                </div>

                {/* Body paragraph content */}
                <div className="text-xs md:text-sm text-text-secondary space-y-4 font-normal">
                  <p>
                    {readingArticle.content || "Ce rapport scientifique présente les conclusions intermédiaires de notre pôle de recherche. Les premiers livrables et architectures techniques associées démontrent des gains de performances encourageants. Des analyses complémentaires sur échantillons réels ou dans des scénarios de simulation extrême sont en cours de déploiement afin de consolider la base de données académique globale."}
                  </p>
                  <p>
                    L'équipe a mis l'accent sur la résilience et la scalabilité de l'approche afin de permettre une intégration fluide au sein des infrastructures existantes. Les prochaines étapes de R&D consisteront à valider l'approche par des tests en situation opérationnelle.
                  </p>
                </div>
              </div>

              {/* Detail Footer */}
              <div className="p-6 border-t border-border-subtle bg-bg-secondary/40 flex items-center justify-end shrink-0">
                <button
                  onClick={() => setReadingArticle(null)}
                  className="px-6 py-2.5 rounded-xl border border-border-subtle text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all cursor-pointer"
                >
                  Fermer la publication
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────── Researcher Article Submission Modal / Drawer ─────────────────────────── */}
      <AnimatePresence>
        {showWriteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-md bg-black/60"
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="glass-panel border border-border-subtle bg-bg-secondary w-full max-w-2xl rounded-3xl shadow-2xl relative max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-border-subtle flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-bold text-text-primary">Rédiger un nouvel article scientifique</h2>
                </div>
                <button
                  onClick={() => setShowWriteModal(false)}
                  className="p-1 rounded-full hover:bg-white/5 text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content Scrollable */}
              <form onSubmit={handleCreateArticle} className="p-6 overflow-y-auto flex-1 space-y-5 scrollbar-thin scrollbar-thumb-border-subtle">
                
                {/* Notice Board */}
                <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 text-[11px] text-indigo-400 flex items-start gap-3">
                  <Layers className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Circuit de relecture scientifique (Peer-review) :</span> Votre article sera soumis pour validation au comité de lecture. Il sera automatiquement marqué avec le statut <span className="font-bold text-white bg-indigo-500/30 px-1.5 py-0.5 rounded">PENDING</span> et ne sera visible publiquement qu'après approbation par un administrateur.
                  </div>
                </div>

                {/* Form Inputs */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Titre de la publication *</label>
                  <input
                    type="text"
                    required
                    value={newArticle.title}
                    onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                    placeholder="ex: Modélisation d'un réseau maillé LoRaWAN résilient"
                    className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-bg-secondary/40 text-xs text-text-primary focus:outline-none focus:border-indigo-500/60 focus:bg-bg-secondary/60 transition-all"
                  />
                </div>

                {/* Category & Preset Image Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Thématique scientifique *</label>
                    <select
                      value={newArticle.categorie}
                      onChange={(e) => setNewArticle({ ...newArticle, categorie: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-bg-secondary/40 text-xs text-text-primary focus:outline-none focus:border-indigo-500/60 focus:bg-bg-secondary/60 transition-all"
                    >
                      <option value="Intelligence Artificielle">Intelligence Artificielle</option>
                      <option value="Lancement R&D">Lancement R&D</option>
                      <option value="Éco-énergie">Éco-énergie</option>
                      <option value="Bio-Tech">Bio-Tech</option>
                      <option value="Robotique">Robotique</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Illustration / Image</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newArticle.image}
                        onChange={(e) => setNewArticle({ ...newArticle, image: e.target.value })}
                        placeholder="URL de l'image..."
                        className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-bg-secondary/40 text-xs text-text-primary focus:outline-none focus:border-indigo-500/60 focus:bg-bg-secondary/60 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Preset choice row */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5 text-indigo-400" />
                    Ou choisir un visuel scientifique prédéfini :
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {IMAGE_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setNewArticle({ ...newArticle, image: preset.url })}
                        className={`group relative h-16 rounded-xl overflow-hidden border transition-all cursor-pointer ${
                          newArticle.image === preset.url
                            ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                            : 'border-border-subtle opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-1 text-center">
                          <span className="text-[9px] font-bold text-white leading-tight group-hover:scale-105 transition-transform">{preset.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Excerpt Textarea */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Résumé de l'article (Excerpt) *</label>
                  <textarea
                    required
                    rows={2}
                    value={newArticle.excerpt}
                    onChange={(e) => setNewArticle({ ...newArticle, excerpt: e.target.value })}
                    placeholder="Synthèse courte de vos travaux pour la carte de prévisualisation (max. 150 caractères)..."
                    className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-bg-secondary/40 text-xs text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-indigo-500/60 focus:bg-bg-secondary/60 transition-all resize-none"
                  />
                </div>

                {/* Content Textarea */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Contenu complet de l'article *</label>
                  <textarea
                    required
                    rows={6}
                    value={newArticle.content}
                    onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                    placeholder="Détail complet de la publication : méthodologie, protocoles expérimentaux, conclusions de recherche..."
                    className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-bg-secondary/40 text-xs text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-indigo-500/60 focus:bg-bg-secondary/60 transition-all"
                  />
                </div>

                {/* Footer Buttons inside Scrollable Form */}
                <div className="pt-2 flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowWriteModal(false)}
                    className="px-5 py-3 rounded-xl border border-border-subtle text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/10 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "Soumission en cours..." : "Soumettre à l'approbation"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      </>
      ) : (
        <Events navigate={navigate} />
      )}

      {/* Toast popup */}
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
