import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';

export default function PAFSection({ paf, navigate }) {
  return (
    <section className="py-24 px-6 md:px-12 lg:px-24 border-b border-border-subtle relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 via-transparent to-accent-secondary/5 pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] rounded-full bg-radial from-accent-primary/10 to-transparent blur-[120px] pointer-events-none" />

      <FadeInWhenVisible direction="up">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-accent-primary uppercase bg-accent-primary/10 border border-accent-primary/30 px-4 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3 h-3" />
            {paf.tag}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary mb-4">
            {paf.title}
          </h2>
          <p className="text-text-secondary text-base font-light leading-relaxed mb-8 max-w-2xl mx-auto">
            {paf.description}
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('paf')}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-accent-primary text-text-primary text-xs font-bold hover:bg-accent-primary/95 transition-all shadow-lg shadow-accent-primary/20 cursor-pointer"
          >
            {paf.cta}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </FadeInWhenVisible>
    </section>
  );
}