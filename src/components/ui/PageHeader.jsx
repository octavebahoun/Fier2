import { motion } from 'framer-motion';

/**
 * PageHeader — en-tête de page.
 *
 * `variant="page"` (défaut) : en-tête COMPACT pour l'espace connecté. Le fil
 * d'Ariane de la SiteHeader annonce déjà la section, donc pas de titre de
 * 48px ni de marge de 56px : le contenu doit être visible sans scroller.
 *
 * `variant="hero"` : échelle éditoriale (grand titre, centrable) réservée aux
 * pages vitrine (accueil, PAF) qui n'ont pas de fil d'Ariane au-dessus.
 */
export default function PageHeader({
  tag,
  icon: Icon,
  title,
  description,
  children,
  className = '',
  align = 'left',
  variant = 'page',
}) {
  const isHero = variant === 'hero';
  const centered = align === 'center';

  return (
    <motion.div
      initial={{ opacity: 0, y: isHero ? 20 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: isHero ? 0.5 : 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`${isHero ? 'mb-14' : 'mb-8'} ${centered ? 'text-center' : ''} ${className}`}
    >
      {tag && (
        <div className={`flex items-center gap-3 ${centered ? 'justify-center' : ''}`}>
          <span className="w-8 h-px bg-ember inline-block" aria-hidden="true" />
          <span className="eyebrow flex items-center gap-2">
            {Icon && <Icon className="w-3.5 h-3.5 text-engine" />}
            {tag}
          </span>
          {centered && <span className="w-8 h-px bg-ember inline-block" aria-hidden="true" />}
        </div>
      )}

      <h1
        className={`${tag ? (isHero ? 'mt-4' : 'mt-2.5') : ''} font-extrabold tracking-tight text-text-primary font-display leading-tight ${
          isHero ? 'text-3xl sm:text-4xl md:text-5xl' : 'text-2xl md:text-3xl'
        } ${centered ? 'mx-auto' : ''}`}
      >
        {title}
      </h1>

      {description && (
        <p
          className={`${isHero ? 'mt-4 text-base md:text-lg font-light' : 'mt-2 text-sm'} text-text-secondary leading-relaxed ${
            centered ? 'max-w-2xl mx-auto' : 'max-w-2xl'
          }`}
        >
          {description}
        </p>
      )}

      {children}
    </motion.div>
  );
}
