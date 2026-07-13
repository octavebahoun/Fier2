import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, ChevronLeft, ChevronRight, ArrowRight, Layers, Cpu, Zap, Flame, Atom, Binary, Building2, Beaker } from 'lucide-react';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';
import { api } from '../../services/api.js';

const ICONS = [Cpu, Zap, Flame, Layers, Binary, Atom, Beaker, Building2, Users];

const getClubIcon = (i) => ICONS[i % ICONS.length];

export default function ResearchClubsSection({ clubs, navigate }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [perView, setPerView] = useState(3);

  const trackRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const moved = useRef(false);

  // ── Récupération de TOUTES les CITE depuis l'API (pas de mock) ──
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.clubs.getAll();
        if (res.success && active) setItems(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (active) setError("Impossible de charger les CITE pour le moment.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // ── Nombre de cartes visibles selon la largeur (responsive) ──
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

  // ── Drag-to-scroll (navigation manuelle, aucun autoplay) ──
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
    <section
      id="clubs"
      className="py-24 px-6 md:px-12 lg:px-24 border-b border-border-subtle bg-bg-secondary/10 relative overflow-hidden"
    >
      {/* Ambient halos */}
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] rounded-full bg-radial from-accent-primary/22 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-[15%] left-[10%] w-[45vw] h-[45vw] max-w-[550px] rounded-full bg-radial from-fieri-blue/26 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[15%] right-[10%] w-[45vw] h-[45vw] max-w-[550px] rounded-full bg-radial from-accent-secondary/20 to-transparent blur-[120px] pointer-events-none z-0" />

      <div className="max-w-[92rem] mx-auto w-full relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <FadeInWhenVisible direction="left">
            <span className="text-xs font-bold tracking-[0.2em] text-accent-primary uppercase">{clubs.tag}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-3">
              {clubs.title}
            </h2>
            <p className="text-text-secondary text-sm font-light mt-3 max-w-xl">
              Explorez l'ensemble de nos CITE (Clubs d'Innovation, de Recherche et d'Excellence) déployés sur le terrain.
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

        {/* GRAND carousel — défilement manuel uniquement (pas d'autoplay) */}
        {loading ? (
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-panel h-80 rounded-2xl animate-pulse bg-bg-secondary/40 border border-border-subtle/60 shrink-0" style={{ width: cardWidth }} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent-primary/10 border border-accent-primary/20 mb-4">
              <Layers className="w-6 h-6 text-accent-primary" />
            </div>
            <p className="text-text-secondary text-sm font-light mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-black bg-accent-primary/10 border border-accent-primary/30 text-accent-primary px-5 py-2.5 rounded-full hover:bg-accent-primary/20 transition-all cursor-pointer"
            >
              Réessayer
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-secondary text-sm font-light">Aucune CITE disponible pour le moment.</p>
          </div>
        ) : (
          <div
            ref={trackRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 cursor-grab active:cursor-grabbing [scrollbar-width:none] [-ms-overflow-style:none]"
            style={{ scrollbarWidth: 'none' }}
          >
            {items.map((club, i) => {
              const Icon = getClubIcon(i);
              const accent = club.accent || '#e05a2b';
              return (
                <motion.article
                  key={club.id ?? i}
                  onClick={() => safeNavigate('clubs')}
                  whileHover={{ y: -6 }}
                  className="glass-panel group relative shrink-0 snap-center rounded-2xl border border-border-subtle/70 bg-bg-secondary/30 backdrop-blur-xl p-7 flex flex-col justify-between overflow-hidden transition-colors hover:border-accent-primary/35 cursor-pointer select-none"
                  style={{ width: cardWidth }}
                >
                  {/* Halo d'accent */}
                  <div
                    className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-[40px] opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${accent}55, transparent 70%)` }}
                  />

                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center border border-border-subtle/70"
                        style={{ background: `${accent}1a` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: accent }} />
                      </div>
                      <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted">
                        CITE_{String(i + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-text-primary mb-3 leading-snug group-hover:text-accent-primary transition-colors">
                      {club.title}
                    </h3>

                    <p className="text-sm text-text-secondary font-light leading-relaxed line-clamp-4 mb-6">
                      {club.desc}
                    </p>
                  </div>

                  <div className="border-t border-border-subtle/50 pt-4 mt-auto flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                      <Users className="w-4 h-4 text-accent-secondary" />
                      {club.membersCount || 0} membres
                    </span>
                    <span
                      className="inline-flex items-center gap-1 text-xs font-bold"
                      style={{ color: accent }}
                    >
                      Découvrir
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        <p className="text-center text-[10px] text-text-muted font-mono uppercase mt-6">
          fieri // glissez ou utilisez les flèches pour parcourir les CITE
        </p>
      </div>
    </section>
  );
}
