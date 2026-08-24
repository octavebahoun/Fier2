import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  GraduationCap,
  Megaphone,
  Rocket,
  Tag,
  Newspaper,

} from 'lucide-react';
import api from '../../services/api.js';

// Configuration des badges & catégories du Journal
export const JOURNAL_CATEGORIES = [
  { id: 'all', label: 'Tout', color: 'var(--color-engine)' },
  { id: 'atelier', label: 'Ateliers', color: 'var(--color-engine)', icon: GraduationCap, badgeLabel: 'ATELIER' },
  { id: 'appel', label: 'Appels', color: 'var(--color-ember)', icon: Megaphone, badgeLabel: 'APPEL À PARTICIPATION' },
  { id: 'bootcamp', label: 'Bootcamps', color: 'var(--color-engine-deep)', icon: Rocket, badgeLabel: 'BOOTCAMP' },
  { id: 'offre', label: 'Offres', color: 'var(--color-emerald-500)', icon: Tag, badgeLabel: 'OFFRE SPÉCIALE' }
];

const CATEGORY_MAP = {
  atelier: { color: 'var(--color-engine)', icon: GraduationCap, badgeLabel: 'ATELIER' },
  appel: { color: 'var(--color-ember)', icon: Megaphone, badgeLabel: 'APPEL À PARTICIPATION' },
  bootcamp: { color: 'var(--color-engine-deep)', icon: Rocket, badgeLabel: 'BOOTCAMP' },
  offre: { color: 'var(--color-emerald-500)', icon: Tag, badgeLabel: 'OFFRE SPÉCIALE' },
  actu: { color: 'var(--color-ember)', icon: Newspaper, badgeLabel: 'ACTUALITÉ' }
};

export default function JournalCarousel({ navigate }) {
  const [activeTab, setActiveTab] = useState('all');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [perView, setPerView] = useState(3);

  const trackRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const moved = useRef(false);

  // Charger et assembler les flux du Journal (Workshops, Opportunités, News)
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [wRes, oRes, nRes] = await Promise.allSettled([
          api.workshops.getAll(),
          api.opportunities.getAll(),
          api.news.getAll()
        ]);

        const merged = [];

        if (wRes.status === 'fulfilled' && wRes.value?.success) {
          (wRes.value.data || []).slice(0, 6).forEach((w) => {
            const isBootcamp = (w.title || '').toLowerCase().includes('bootcamp') || (w.desc || '').toLowerCase().includes('bootcamp');
            merged.push({
              kind: isBootcamp ? 'bootcamp' : 'atelier',
              title: w.title,
              desc: w.desc || w.description,
              meta: [w.instructor, w.date].filter(Boolean).join(' · '),
              route: 'workshops'
            });
          });
        }

        if (oRes.status === 'fulfilled' && oRes.value?.success) {
          (oRes.value.data || []).slice(0, 6).forEach((o) => {
            merged.push({
              kind: 'offre',
              title: o.title,
              desc: o.description || o.desc,
              meta: [o.type, o.location].filter(Boolean).join(' · '),
              route: 'opportunities'
            });
          });
        }

        if (nRes.status === 'fulfilled' && nRes.value?.success) {
          (nRes.value.data || []).slice(0, 6).forEach((n) => {
            const isAppel = (n.title || '').toLowerCase().includes('appel') || (n.categorie || '').toLowerCase().includes('appel');
            merged.push({
              kind: isAppel ? 'appel' : 'actu',
              title: n.title,
              desc: n.excerpt || n.desc,
              meta: [n.categorie, n.date].filter(Boolean).join(' · '),
              route: 'news'
            });
          });
        }

        if (active) setCards(merged);
      } catch {
        if (active) setError('Impossible de charger le Journal pour le moment.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // Détection réactive de la taille de l'écran
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      setPerView(w < 640 ? 1 : w < 1024 ? 2 : 3);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  const filteredCards = cards.filter((card) => {
    if (activeTab === 'all') return true;
    return card.kind === activeTab;
  });

  const cardWidth = `calc((100% - ${(perView - 1) * 1.5}rem) / ${perView})`;

  const scrollByStep = useCallback((dir) => {
    const el = trackRef.current;
    if (!el) return;
    const first = el.children[0];
    const step = first ? first.offsetWidth + 24 : el.clientWidth;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  }, []);

  const onPointerDown = (e) => {
    const el = trackRef.current;
    if (!el) return;
    isDown.current = true;
    moved.current = false;
    startX.current = e.clientX;
    scrollStart.current = el.scrollLeft;
    el.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    const el = trackRef.current;
    if (!isDown.current || !el) return;
    const walk = e.clientX - startX.current;
    if (Math.abs(walk) > 4) moved.current = true;
    el.scrollLeft = scrollStart.current - walk;
  };

  const endDrag = () => { isDown.current = false; };

  const safeNavigate = (route) => {
    if (moved.current) return;
    if (navigate) navigate(route);
  };

  return (
    <div className="w-full">
      {/* Onglets de filtrage multicritères */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full">
          {JOURNAL_CATEGORIES.map((cat) => {
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
                  isActive
                    ? 'bg-engine text-on-accent border-engine'
                    : 'bg-bg-secondary/70 text-text-secondary border-border-subtle hover:text-text-primary hover:bg-bg-tertiary'
                }`}
              >
                {cat.icon && <cat.icon className="w-3.5 h-3.5" style={{ color: isActive ? '#fff' : cat.color }} />}
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Boutons de navigation manuelle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => scrollByStep(-1)}
            aria-label="Précédent"
            className="p-3 rounded-full bg-bg-secondary/80 border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-tertiary backdrop-blur-md transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scrollByStep(1)}
            aria-label="Suivant"
            className="p-3 rounded-full bg-bg-secondary/80 border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-tertiary backdrop-blur-md transition-all cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Contenu du Carousel */}
      {loading ? (
        <div className="flex gap-6 overflow-hidden">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="glass-panel h-72 rounded-2xl animate-pulse bg-bg-secondary/40 border border-border-subtle/60 shrink-0"
              style={{ width: cardWidth }}
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-engine-wash border border-engine/20 mb-4">
            <Newspaper className="w-6 h-6 text-engine" />
          </div>
          <p className="text-text-secondary text-sm font-light mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold bg-engine-wash border border-engine/30 text-engine px-5 py-2.5 chamfer-xs hover:bg-engine-wash transition-all cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl border border-border-subtle/60 bg-bg-secondary/30">
          <p className="text-text-secondary text-sm font-light">Aucun contenu trouvé dans cette catégorie.</p>
        </div>
      ) : (
        <div
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 cursor-grab active:cursor-grabbing [scrollbar-width:none]"
          style={{ scrollbarWidth: 'none' }}
        >
          <AnimatePresence mode="popLayout">
            {filteredCards.map((card, i) => {
              const meta = CATEGORY_MAP[card.kind] || CATEGORY_MAP.actu;
              const Icon = meta.icon;
              return (
                <motion.article
                  key={`${card.kind}-${i}`}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => safeNavigate(card.route)}
                  whileHover={{ y: -6 }}
                  className="glass-panel group relative shrink-0 snap-center rounded-2xl border border-border-subtle bg-bg-secondary p-7 flex flex-col justify-between overflow-hidden transition-colors hover:border-border-strong cursor-pointer select-none"
                  style={{ width: cardWidth }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span
                        className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-sm border"
                        style={{
                          color: meta.color,
                          borderColor: `${meta.color}55`,
                          background: `${meta.color}14`
                        }}
                      >
                        {meta.badgeLabel}
                      </span>
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center border border-border-subtle/70"
                        style={{ background: `${meta.color}1a` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: meta.color }} />
                      </div>
                    </div>

                    <h3 className="text-lg font-extrabold text-text-primary mb-3 leading-snug group-hover:text-engine transition-colors line-clamp-2 font-display">
                      {card.title}
                    </h3>

                    <p className="text-sm text-text-secondary font-light leading-relaxed line-clamp-3 mb-6">
                      {card.desc}
                    </p>
                  </div>

                  <div className="border-t border-border-subtle/50 pt-4 mt-auto flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase text-text-muted truncate pr-2">
                      {card.meta || 'FIERI Community'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-engine shrink-0">
                      Découvrir
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
