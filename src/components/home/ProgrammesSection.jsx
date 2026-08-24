import { ArrowRight, Sparkles, HeartHandshake, GraduationCap, Network, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';

const ICONS = {
  ambassador: Sparkles,
  volunteer: HeartHandshake,
  mentor: GraduationCap,
  network: Network,
  incubation: Rocket
};

export default function ProgrammesSection({ programmes, navigate }) {
  return (
    <section id="programmes" className="py-24 px-6 md:px-12 lg:px-12 border-b border-border-subtle relative overflow-hidden">
      <FadeInWhenVisible direction="up">
        <div className="max-w-[92rem] mx-auto w-full relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="eyebrow flex items-center gap-3 justify-center">
              <span className="w-8 h-px bg-ember inline-block" aria-hidden="true" />
              {programmes.tag}
              <span className="w-8 h-px bg-ember inline-block" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary font-display">
              {programmes.title}
            </h2>
            <p className="text-text-secondary text-base font-light leading-relaxed max-w-2xl mx-auto">
              {programmes.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {programmes.items.map((item, index) => {
              const Icon = ICONS[item.icon] || Sparkles;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="glass-panel group relative rounded-2xl border border-border-subtle bg-bg-secondary p-7 flex flex-col justify-between overflow-hidden transition-colors hover:border-border-strong"
                >
                  <div>
                    <div className="w-12 h-12 rounded-sm chamfer-sm flex items-center justify-center bg-engine-wash border border-engine/25 mb-5">
                      <Icon className="w-6 h-6 text-engine" />
                    </div>
                    <h3 className="text-lg font-extrabold text-text-primary mb-3 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-sm text-text-secondary font-light leading-relaxed mb-6">
                      {item.desc}
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(item.route)}
                    className="inline-flex items-center gap-2 text-xs font-bold text-engine hover:text-engine-deep transition-colors cursor-pointer"
                  >
                    {item.cta}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </FadeInWhenVisible>
    </section>
  );
}
