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
      <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 via-transparent to-accent-secondary/5 pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] rounded-full bg-radial from-accent-primary/10 to-transparent blur-[120px] pointer-events-none" />

      <FadeInWhenVisible direction="up">
        <div className="max-w-[92rem] mx-auto w-full relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-accent-primary uppercase bg-accent-primary/10 border border-accent-primary/30 px-4 py-1.5 rounded-full mb-6">
              <Sparkles className="w-3 h-3" />
              {programmes.tag}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary mb-4">
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
                  className="glass-panel group relative rounded-2xl border border-border-subtle/70 bg-bg-secondary/30 backdrop-blur-xl p-7 flex flex-col justify-between overflow-hidden transition-colors hover:border-accent-primary/35"
                >
                  <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-radial from-accent-primary/18 to-transparent blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-accent-primary/10 border border-accent-primary/25 mb-5">
                      <Icon className="w-6 h-6 text-accent-primary" />
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
                    className="inline-flex items-center gap-2 text-xs font-bold text-accent-primary hover:text-accent-primary/80 transition-colors cursor-pointer"
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
