import { motion } from 'framer-motion';

export default function PageHeader({ tag, icon: Icon, title, description, children, className = '', align = 'left' }) {
  const centered = align === 'center';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`mb-14 ${centered ? 'text-center' : ''} ${className}`}
    >
      <div className={`flex items-center gap-3 ${centered ? 'justify-center' : ''}`}>
        <span className="w-8 h-px bg-ember inline-block" aria-hidden="true" />
        <span className="eyebrow flex items-center gap-2">
          {Icon && <Icon className="w-3.5 h-3.5 text-engine" />}
          {tag}
        </span>
        {centered && <span className="w-8 h-px bg-ember inline-block" aria-hidden="true" />}
      </div>

      <h1 className={`mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary font-display leading-tight ${centered ? 'mx-auto' : ''}`}>
        {title}
      </h1>

      {description && (
        <p className={`mt-4 text-text-secondary text-base md:text-lg leading-relaxed font-light ${centered ? 'max-w-2xl mx-auto' : 'max-w-2xl'}`}>
          {description}
        </p>
      )}

      {children}
    </motion.div>
  );
}