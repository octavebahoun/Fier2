import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';

export default function FAQSection({ faq }) {
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(null);

  return (
    <section id="faq" className="py-24 px-6 md:px-12 lg:px-12 border-b border-border-subtle dot-grid relative overflow-hidden">
      {/* Glow Spots */}
      <div className="absolute top-1/3 right-[5%] w-[40vw] h-[40vw] max-w-[450px] rounded-full bg-radial from-accent-secondary/22 to-transparent blur-[110px] pointer-events-none z-0" />
      <div className="absolute bottom-1/3 left-[5%] w-[40vw] h-[40vw] max-w-[450px] rounded-full bg-radial from-fieri-blue/26 to-transparent blur-[110px] pointer-events-none z-0" />
      {/* Abstract glowing math image in the background, s'échappant from the left edge */}
      <div className="absolute top-1/2 -left-28 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.25] pointer-events-none z-0">
        <div className="relative w-full h-full">
          {/* Outer glowing technical framework overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-bg-primary/95 to-bg-primary z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-bg-primary z-10" />
          <img 
            src="/faq_science_abstract.webp" 
            alt="Sciences et Mathématiques FIERI" 
            className="w-full h-full object-cover rounded-full filter blur-[1.5px] brightness-[0.85] contrast-[1.05]"
          />
          {/* Embedded glowing blueprint dots */}
          <div className="absolute inset-0 bg-[radial-gradient(#1b6fd8_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-15" />
        </div>
      </div>

      <div className="max-w-[92rem] mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: spacer to leave room for the background science image to emerge */}
          <div className="hidden lg:block lg:col-span-5" />

          {/* Right Column: FAQ Accordion */}
          <div className="lg:col-span-7 space-y-6">
            <FadeInWhenVisible direction="right">
              <span className="text-xs font-bold tracking-[0.2em] text-accent-primary uppercase">{faq.tag}</span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-3 mb-8 text-text-primary">
                {faq.title}
              </h2>
            </FadeInWhenVisible>

            <div className="space-y-4">
              {faq.questions.map((item, index) => {
                const isExpanded = expandedFaqIndex === index;
                const panelId = `faq-panel-${index}`;
                const triggerId = `faq-trigger-${index}`;
                return (
                  <FadeInWhenVisible key={index} delay={index * 0.05} direction="up">
                    <div className="bg-bg-secondary/40 backdrop-blur-md rounded-xl border border-border-subtle overflow-hidden hover:border-accent-primary/20 transition-all">
                      <button
                        id={triggerId}
                        onClick={() => setExpandedFaqIndex(isExpanded ? null : index)}
                        aria-expanded={isExpanded}
                        aria-controls={panelId}
                        className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-text-primary hover:text-accent-primary transition-colors cursor-pointer"
                      >
                        <span>{item.q}</span>
                        <ChevronDown className={`w-4 h-4 text-text-secondary shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-accent-primary' : ''}`} />
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
                            className="border-t border-border-subtle/50 bg-bg-secondary/15"
                          >
                            <p className="p-5 text-xs sm:text-sm text-text-secondary leading-relaxed font-light">
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
