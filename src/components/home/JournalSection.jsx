import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, GraduationCap, Newspaper, Tag } from 'lucide-react';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';
import { api } from '../../services/api.js';

// Catégories du Journal unifié
const KINDS = {
  atelier: { label: 'BOOTCAMP · ATELIER', icon: GraduationCap, color: '#1b6fd8' },
  offre: { label: 'OFFRE SPÉCIALE', icon: Tag, color: '#10b981' },
  actu: { label: 'JOURNAL', icon: Newspaper, color: '#e05a2b' }
};

export default function JournalSection({ journal, navigate }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [perView, setPerView] = useState(3);

  const trackRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const moved = useRef(false);

  // ── Fusion des ateliers, offres spéciales et actualités en UN seul Journal ──
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
          wRes.value.data.slice(0, 4).forEach((w) => merged.push({
            kind: 'atelier',
            title: w.title,
            desc: w.desc,
            meta: [w.instructor, w.date].filter(Boolean).join(' · '),
            route: 'workshops'
          }));
        }
        if (oRes.status === 'fulfilled' && oRes.value?.success) {
          oRes.value.data.slice(0, 4).forEach((o) => merged.push({
            kind: 'offre',
            title: o.title,
            desc: o.description,
            meta: [o.type, o.location].filter(Boolean).join(' · '),
            route: 'opportunities'
          }));
        }
        if (nRes.status === 'fulfilled' && nRes.value?.success) {
          nRes.value.data.slice(0, 4).forEach((n) => merged.push({
            kind: 'actu',
            title: n.title,
            desc: n.excerpt,
            meta: [n.categorie, n.date].filter(Boolean).join(' · '),
            route: 'news'
          }));
        }

        if (active) setCards(merged);
      } catch {
        if (active) setError("Impossible de charger le Journal pour le moment.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      setPerView(w < 640 ? 1 : w < 1024 ? 2 : 3);
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

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
    navigate(route);
  };

  return (
    <section id="journal" className="py-24 px-6 md:px-12 lg:px-24 border-b border-border-subtle bg-bg-secondary/20 relative overflow-hidden">
      {/* Glow Spots */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] max-w-[600px] rounded-full bg-radial from-fieri-blue/22 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-1/3 right-[10%] w-[40vw] h-[40vw] max-w-[500px] rounded-full bg-radial from-accent-primary/20 to-transparent blur-[120px] pointer-events-none z-0" />

      <div className="max-w-[92rem] mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <FadeInWhenVisible direction="left">
            <span className="text-xs font-bold tracking-[0.2em] text-accent-primary uppercase">{journal.tag}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-3">
              {journal.title}
            </h2>
            <p className="text-text-secondary text-sm font-light mt-3 max-w-xl">
              Bootcamps, ateliers, offres spéciales et actualités — retrouvez toute l'actualité FIERI en un seul flux.
            </p>
          </FadeInWhenVisible>

          <FadeInWhenVisible direction="right" delay={0.1}>
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollByStep(-1)}
                aria-label="Précédent"
                className="p-3 rounded-full bg-bg-secondary/80 border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-secondary backdrop-blur-md transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollByStep(1)}
                aria-label="Suivant"
                className="p-3 rounded-full bg-bg-secondary/80 border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-bg-secondary backdrop-blur-md transition-all cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </FadeInWhenVisible>
        </div>

        {/* CAROUSEL unifié — défilement manuel uniquement (pas d'autoplay) */}
        {loading ? (
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-panel h-72 rounded-2xl animate-pulse bg-bg-secondary/40 border border-border-subtle/60 shrink-0" style={{ width: cardWidth }} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent-primary/10 border border-accent-primary/20 mb-4">
              <Newspaper className="w-6 h-6 text-accent-primary" />
            </div>
            <p className="text-text-secondary text-sm font-light mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-black bg-accent-primary/10 border border-accent-primary/30 text-accent-primary px-5 py-2.5 rounded-full hover:bg-accent-primary/20 transition-all cursor-pointer"
            >
              Réessayer
            </button>
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-secondary text-sm font-light">Le Journal est temporairement vide.</p>
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
            {cards.map((card, i) => {
              const kind = KINDS[card.kind] || KINDS.actu;
              const Icon = kind.icon;
              return (
                <motion.article
                  key={`${card.kind}-${i}`}
                  onClick={() => safeNavigate(card.route)}
                  whileHover={{ y: -6 }}
                  className="glass-panel group relative shrink-0 snap-center rounded-2xl border border-border-subtle/70 bg-bg-secondary/30 backdrop-blur-xl p-7 flex flex-col justify-between overflow-hidden transition-colors hover:border-accent-primary/35 cursor-pointer select-none"
                  style={{ width: cardWidth }}
                >
                  <div
                    className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-[40px] opacity-25 group-hover:opacity-50 transition-opacity pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${kind.color}55, transparent 70%)` }}
                  />

                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span
                        className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border"
                        style={{ color: kind.color, borderColor: `${kind.color}55`, background: `${kind.color}14` }}
                      >
                        {kind.label}
                      </span>
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center border border-border-subtle/70"
                        style={{ background: `${kind.color}1a` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: kind.color }} />
                      </div>
                    </div>

                    <h3 className="text-lg font-extrabold text-text-primary mb-3 leading-snug group-hover:text-accent-primary transition-colors line-clamp-2">
                      {card.title}
                    </h3>

                    <p className="text-sm text-text-secondary font-light leading-relaxed line-clamp-3 mb-6">
                      {card.desc}
                    </p>
                  </div>

                  <div className="border-t border-border-subtle/50 pt-4 mt-auto flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-text-muted truncate pr-2">
                      {card.meta}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-accent-primary shrink-0">
                      Voir
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('news')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary hover:underline cursor-pointer"
          >
            Consulter tout le Journal
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
