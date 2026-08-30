import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Calendar, User, Search, PlusCircle, X,
  Clock, ArrowRight, BookMarked, Layers, FileText, Image,
  Newspaper, CalendarDays
} from 'lucide-react';
import Events from './Events.jsx';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import FadeInWhenVisible from '../components/home/FadeInWhenVisible.jsx';
import { useToast } from '../components/ui/Toast.jsx'
import StatePanel from '../components/ui/StatePanel.jsx';


// ─────────────────────────── Category Color Mapping ───────────────────────────
const CATEGORY_COLORS = {
  "Intelligence Artificielle": "bg-engine-wash border-engine text-engine",
  "Lancement R&D": "from-warning to-ember border-warning text-warning",
  "Éco-énergie": "bg-success-wash border-success text-success",
  "Bio-Tech": "bg-ember-wash border-ember text-ember",
  "Robotique": "bg-ember-wash border-ember text-ember"
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
  const { user, can } = useAuth();
  const [activeTab, setActiveTab] = useState('actualites');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
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
  const { notify } = useToast()

  const fetchNews = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await api.news.getAll(false); // Only fetch APPROVED news for public newsfeed
      if (!res?.success) throw new Error(res?.message);
      setNews(res.data || []);
    } catch (err) {
      // « Aucune publication » et « publications illisibles » diffèrent.
      setNews([]);
      setLoadError(err?.serverMessage || err?.message || "Les publications n'ont pas pu être chargées.");
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
      notify("Veuillez remplir tous les champs requis.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const authorName = user?.name || "Chercheur FIERI";
      const { categorie, ...rest } = newArticle;
      const payload = {
        ...rest,
        category: categorie,
        author: authorName,
      };

      const res = await api.news.submit(payload);
      if (res.success) {
        notify("Article soumis avec succès au comité de lecture !", "success");
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
        notify("Erreur lors de la soumission de l'article.", "error");
      }
    } catch (err) {
      console.error(err);
      notify("Une erreur inattendue est survenue.", "error");
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

  const canWrite = can('news:submit');

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pt-24 pb-16 px-4 md:px-8 relative overflow-hidden">
      {/* Tab Filter: Actualités / Événements */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1 p-1 chamfer-sm bg-bg-secondary border border-border-subtle">
          <button
            onClick={() => setActiveTab('actualites')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'actualites'
                ? 'bg-engine-wash border border-engine text-engine shadow-sm'
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
                ? 'bg-engine-wash border border-engine text-engine shadow-sm'
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
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-px bg-ember inline-block" aria-hidden="true" />
              <span className="eyebrow flex items-center gap-2">
                <BookMarked className="w-3.5 h-3.5 text-engine" />
                Journal Scientifique & R&D
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary font-display">
              Actualités & <span className="text-gradient-cosmic">Publications</span>
            </h1>
            <p className="text-sm md:text-base text-text-secondary mt-3 max-w-2xl">
              Suivez les percées technologiques de nos chercheurs, les comptes-rendus de R&D des CITE scientifiques et les annonces de la CITE Fieri.
            </p>
          </div>

          {canWrite && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowWriteModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3.5 chamfer-sm chamfer-shadow bg-gradient-to-r bg-engine hover:bg-engine-deep text-xs font-bold text-on-accent transition-all cursor-pointer w-full md:w-auto"
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
                  ? 'bg-engine-wash border-engine text-engine'
                  : 'bg-bg-secondary border-border-subtle text-text-secondary hover:text-text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input aria-label="Rechercher par titre, résumé ou chercheur"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre, résumé ou chercheur..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-border-subtle bg-bg-secondary text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-engine focus:bg-bg-secondary transition-all"
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
              <div key={n} className="glass-panel border border-border-subtle bg-bg-secondary chamfer p-6 h-[400px] animate-pulse flex flex-col justify-between">
                <div className="w-full h-44 chamfer-sm bg-bg-tertiary mb-4" />
                <div className="h-4 w-1/3 bg-bg-tertiary rounded-md mb-2" />
                <div className="h-6 w-3/4 bg-bg-tertiary rounded-md mb-4" />
                <div className="h-4 w-full bg-bg-tertiary rounded-md mb-2" />
                <div className="h-4 w-5/6 bg-bg-tertiary rounded-md mb-6" />
                <div className="h-10 w-full bg-bg-tertiary rounded-xl" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          <StatePanel state="error" message={loadError} onRetry={fetchNews} />
        ) : filteredNews.length === 0 ? (
          <div className="glass-panel border border-border-subtle bg-bg-secondary p-12 chamfer text-center max-w-xl mx-auto">
            <BookOpen className="w-12 h-12 text-engine/40 mx-auto mb-4" />
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
                className="glass-panel border border-border-subtle bg-bg-secondary hover:bg-bg-tertiary chamfer overflow-hidden flex flex-col justify-between group transition-all duration-300"
              >
                <div>
                  {/* Article Image Header */}
                  <div className="relative w-full h-48 overflow-hidden bg-bg-tertiary">
                    <img
                      src={item.image || "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=800"}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/90 via-bg-primary/20 to-transparent" />
                    
                    {/* Category Pill */}
                    <div className="absolute top-4 left-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-extrabold border bg-bg-primary shadow-lg ${getCategoryClass(item.categorie)}`}>
                        {item.categorie}
                      </span>
                    </div>
                  </div>

                  {/* Info Metadata */}
                  <div className="px-6 pt-5 pb-3 flex items-center justify-between text-xs text-text-secondary">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-engine" />
                      <span className="font-semibold text-text-primary/90">{item.author}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.date}</span>
                    </div>
                  </div>

                  {/* Main Title & Excerpt */}
                  <div className="px-6 py-2">
                    <h3 className="text-base font-bold text-text-primary leading-snug group-hover:text-engine transition-colors line-clamp-2">
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
                    onClick={() => navigate?.('news-detail', { newsId: item.id })}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border-subtle hover:border-engine bg-bg-tertiary hover:bg-engine-wash text-xs font-bold text-text-primary hover:text-engine transition-all cursor-pointer"
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
            className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-md bg-scrim"
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="glass-panel border border-border-subtle bg-bg-secondary w-full max-w-3xl chamfer chamfer-shadow overflow-hidden relative max-h-[85vh] flex flex-col"
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
                  className="absolute top-4 right-4 p-2 rounded-full bg-bg-tertiary border border-border-subtle hover:border-border-strong text-white hover:scale-105 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Category badge */}
                <div className="absolute bottom-6 left-6 flex flex-col gap-2">
                  <span className={`self-start inline-flex items-center px-3 py-1 rounded-xl text-xs font-extrabold border bg-bg-primary shadow-md ${getCategoryClass(readingArticle.categorie)}`}>
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
                    <div className="w-8 h-8 rounded-full bg-engine-wash border border-engine flex items-center justify-center text-xs text-engine font-bold uppercase shadow-sm">
                      {readingArticle.author.substring(0, 2)}
                    </div>
                    <div>
                      <div className="text-xs text-text-secondary">Auteur</div>
                      <div className="font-semibold text-text-primary">{readingArticle.author}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-engine shrink-0" />
                    <div>
                      <div className="text-xs text-text-secondary">Publié le</div>
                      <div className="font-semibold text-text-primary">{readingArticle.date}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-engine shrink-0" />
                    <div>
                      <div className="text-xs text-text-secondary">Temps de lecture</div>
                      <div className="font-semibold text-text-primary">4 min</div>
                    </div>
                  </div>
                </div>

                {/* Excerpt Section */}
                <div className="bg-engine-wash border-l-2 border-engine p-4 rounded-r-xl text-xs font-semibold text-text-primary/90 italic mb-6">
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
              <div className="p-6 border-t border-border-subtle bg-bg-secondary flex items-center justify-end shrink-0">
                <button
                  onClick={() => setReadingArticle(null)}
                  className="px-6 py-2.5 rounded-xl border border-border-subtle text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all cursor-pointer"
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
            className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-md bg-scrim"
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="glass-panel border border-border-subtle bg-bg-secondary w-full max-w-2xl chamfer chamfer-shadow relative max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-border-subtle flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-engine" />
                  <h2 className="text-lg font-bold text-text-primary">Rédiger un nouvel article scientifique</h2>
                </div>
                <button
                  onClick={() => setShowWriteModal(false)}
                  className="p-1 rounded-full hover:bg-bg-tertiary text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content Scrollable */}
              <form onSubmit={handleCreateArticle} className="p-6 overflow-y-auto flex-1 space-y-5 scrollbar-thin scrollbar-thumb-border-subtle">
                
                {/* Notice Board */}
                <div className="p-4 chamfer-xs bg-engine-wash border border-engine text-xs text-engine flex items-start gap-3">
                  <Layers className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Circuit de relecture scientifique (Peer-review) :</span> Votre article sera soumis pour validation au comité de lecture. Il sera automatiquement marqué avec le statut <span className="font-bold text-engine bg-engine-wash px-1.5 py-0.5 rounded">PENDING</span> et ne sera visible publiquement qu'après approbation par un administrateur.
                  </div>
                </div>

                {/* Form Inputs */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider" htmlFor="news-titre-de-la-publication">Titre de la publication *</label>
                  <input id="news-titre-de-la-publication"
                    type="text"
                    required
                    value={newArticle.title}
                    onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                    placeholder="ex: Modélisation d'un réseau maillé LoRaWAN résilient"
                    className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-bg-secondary text-xs text-text-primary focus:outline-none focus:border-engine focus:bg-bg-secondary transition-all"
                  />
                </div>

                {/* Category & Preset Image Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider" htmlFor="news-thematique-scientifique">Thématique scientifique *</label>
                    <select id="news-thematique-scientifique"
                      value={newArticle.categorie}
                      onChange={(e) => setNewArticle({ ...newArticle, categorie: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-bg-secondary text-xs text-text-primary focus:outline-none focus:border-engine focus:bg-bg-secondary transition-all"
                    >
                      <option value="Intelligence Artificielle">Intelligence Artificielle</option>
                      <option value="Lancement R&D">Lancement R&D</option>
                      <option value="Éco-énergie">Éco-énergie</option>
                      <option value="Bio-Tech">Bio-Tech</option>
                      <option value="Robotique">Robotique</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="news-illustration" className="text-xs font-bold text-text-secondary uppercase tracking-wider">Illustration / Image</label>
                    <div className="flex items-center gap-2">
                      <input
                        id="news-illustration"
                        type="text"
                        value={newArticle.image}
                        onChange={(e) => setNewArticle({ ...newArticle, image: e.target.value })}
                        placeholder="URL de l'image..."
                        className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-bg-secondary text-xs text-text-primary focus:outline-none focus:border-engine focus:bg-bg-secondary transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Preset choice row */}
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5 text-engine" />
                    Ou choisir un visuel scientifique prédéfini :
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {IMAGE_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setNewArticle({ ...newArticle, image: preset.url })}
                        className={`group relative h-16 rounded-xl overflow-hidden border transition-all cursor-pointer ${
                          newArticle.image === preset.url
                            ? 'border-engine ring-2 ring-engine/30'
                            : 'border-border-subtle opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-scrim flex items-center justify-center p-1 text-center">
                          <span className="text-xs font-bold text-white leading-tight group-hover:scale-105 transition-transform">{preset.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Excerpt Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider" htmlFor="news-resume-de-l-article-excerpt">Résumé de l'article (Excerpt) *</label>
                  <textarea id="news-resume-de-l-article-excerpt"
                    required
                    rows={2}
                    value={newArticle.excerpt}
                    onChange={(e) => setNewArticle({ ...newArticle, excerpt: e.target.value })}
                    placeholder="Synthèse courte de vos travaux pour la carte de prévisualisation (max. 150 caractères)..."
                    className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-bg-secondary text-xs text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-engine focus:bg-bg-secondary transition-all resize-none"
                  />
                </div>

                {/* Content Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider" htmlFor="news-contenu-complet-de-l-article">Contenu complet de l'article *</label>
                  <textarea id="news-contenu-complet-de-l-article"
                    required
                    rows={6}
                    value={newArticle.content}
                    onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                    placeholder="Détail complet de la publication : méthodologie, protocoles expérimentaux, conclusions de recherche..."
                    className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-bg-secondary text-xs text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-engine focus:bg-bg-secondary transition-all"
                  />
                </div>

                {/* Footer Buttons inside Scrollable Form */}
                <div className="pt-2 flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowWriteModal(false)}
                    className="px-5 py-3 rounded-xl border border-border-subtle text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r bg-engine hover:bg-engine-deep text-xs font-bold text-on-accent shadow-lg transition-all cursor-pointer disabled:opacity-50"
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

    </div>
  );
}
