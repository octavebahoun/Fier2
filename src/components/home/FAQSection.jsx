import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';

export default function FAQSection({ faq }) {
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(null);

  return (
    <section id="faq" className="py-24 px-6 md:px-12 lg:px-12 border-b border-border-subtle bg-bg-primary relative">
      <div className="max-w-[92rem] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Colonne gauche : titre + texte d'intro */}
          <div className="lg:col-span-5 space-y-6">
            <FadeInWhenVisible direction="left">
              <span className="eyebrow flex items-center gap-3">
                <span className="w-8 h-px bg-ember inline-block" aria-hidden="true" />
                {faq.tag}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-4 mb-3 text-text-primary font-display">
                {faq.title}
              </h2>
              <p className="text-text-secondary text-sm font-light leading-relaxed max-w-md">
                {faq.description}
              </p>
            </FadeInWhenVisible>
          </div>

          {/* Right Column: FAQ Accordion */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4">
              {faq.questions.map((item, index) => {
                const isExpanded = expandedFaqIndex === index;
                const panelId = `faq-panel-${index}`;
                const triggerId = `faq-trigger-${index}`;
                return (
                  <FadeInWhenVisible key={index} delay={index * 0.05} direction="up">
                    <div className="bg-bg-secondary rounded-xl border border-border-subtle overflow-hidden hover:border-border-strong transition-all">
                      <button
                        id={triggerId}
                        onClick={() => setExpandedFaqIndex(isExpanded ? null : index)}
                        aria-expanded={isExpanded}
                        aria-controls={panelId}
                        className="w-full text-left p-5 flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-text-primary hover:text-engine transition-colors cursor-pointer"
                      >
                        <span>{item.q}</span>
                        <ChevronDown className={`w-4 h-4 text-text-secondary shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-engine' : ''}`} />
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            id={panelId}
                            role="region"
                            aria-labelledby={triggerId}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="border-t border-border-subtle bg-bg-tertiary"
                          >
                            <p className="texte-justifie p-5 text-sm text-text-secondary leading-relaxed">
                              {item.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </FadeInWhenVisible>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
