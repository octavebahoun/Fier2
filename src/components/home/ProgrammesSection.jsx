import { ArrowRight, Award, Megaphone, Network, Rocket, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';
import programmes from '../../content/programmes.json';

const ICONS = {
  award: Award,
  megaphone: Megaphone,
  network: Network,
  rocket: Rocket,
};

/**
 * L'aperçu des programmes sur l'accueil.
 *
 * La section annonçait trois entrées — Ambassadeurs, Bénévolat, Mentorat — qui
 * menaient toutes au formulaire de contact. Elle lit maintenant la MÊME source
 * que la page Programmes : une carte par programme réel, et chacune ouvre son
 * onglet. Deux listes qui décrivent la même chose finissent par diverger.
 */
export default function ProgrammesSection({ navigate }) {
  return (
    <section
      id="programmes"
      className="relative overflow-hidden border-b border-border-subtle px-6 py-24 md:px-12"
    >
      <FadeInWhenVisible direction="up">
        <div className="relative z-10 mx-auto w-full max-w-[92rem]">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <span className="eyebrow flex items-center justify-center gap-3">
              <span className="inline-block h-px w-8 bg-ember" aria-hidden="true" />
              {programmes.tag}
              <span className="inline-block h-px w-8 bg-ember" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-text-primary md:text-4xl">
              {programmes.title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base font-light leading-relaxed text-text-secondary">
              {programmes.description}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {programmes.items.map((item, index) => {
              const Icon = ICONS[item.icon] || Sparkles;
              return (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="chamfer-sm chamfer-shadow group flex flex-col justify-between border border-border-strong bg-bg-secondary p-7 transition-colors hover:border-engine"
                >
                  <div>
                    <div className="chamfer-xs mb-5 flex h-12 w-12 items-center justify-center border border-engine bg-engine-wash">
                      <Icon className="h-6 w-6 text-engine" aria-hidden="true" />
                    </div>
                    <span className="eyebrow">{item.code}</span>
                    <h3 className="mt-1 mb-3 font-display text-lg font-extrabold leading-snug text-text-primary transition-colors group-hover:text-engine">
                      {item.name}
                    </h3>
                    <p className="texte-justifie mb-6 text-sm font-light leading-relaxed text-text-secondary">
                      {item.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('programmes', { programme: item.id })}
                    className="inline-flex min-h-11 w-fit cursor-pointer items-center gap-2 text-sm font-bold text-engine transition-colors hover:text-engine-deep"
                  >
                    Découvrir
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">le {item.name}</span>
                  </button>
                </motion.article>
              );
            })}
          </div>
        </div>
      </FadeInWhenVisible>
    </section>
  );
}
