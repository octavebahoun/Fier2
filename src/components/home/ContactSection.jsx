import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import FadeInWhenVisible from './FadeInWhenVisible.jsx';

export default function ContactSection({ contact }) {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Simulate API request or integration
    setFormSubmitted(true);
  };

  return (
    <section className="py-24 px-6 md:px-12 lg:px-24 bg-bg-secondary/5 border-b border-border-subtle relative">
      {/* Glow Spots */}
      <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] rounded-full bg-radial from-accent-primary/24 to-transparent blur-[100px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[35vw] h-[35vw] max-w-[400px] rounded-full bg-radial from-fieri-blue/28 to-transparent blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] left-[10%] w-[35vw] h-[35vw] max-w-[400px] rounded-full bg-radial from-accent-secondary/22 to-transparent blur-[100px] pointer-events-none z-0" />

      <div className="max-w-[92rem] mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left information panel */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <FadeInWhenVisible direction="left">
                <span className="text-xs font-bold tracking-[0.2em] text-accent-primary uppercase">{contact.tag}</span>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-3 mb-4">
                  {contact.title}
                </h2>
                <p className="text-text-secondary text-sm sm:text-base font-light leading-relaxed mb-8">
                  {contact.subtitle}
                </p>

                {/* Info lines */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-bg-secondary border border-border-subtle flex items-center justify-center text-accent-primary">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-text-muted uppercase">Adresse E-mail</div>
                      <a href={`mailto:${contact.info.email}`} className="text-xs sm:text-sm text-text-primary hover:text-accent-primary font-medium font-mono">
                        {contact.info.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-bg-secondary border border-border-subtle flex items-center justify-center text-accent-primary">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-text-muted uppercase">Téléphone</div>
                      <a href={`tel:${contact.info.tel}`} className="text-xs sm:text-sm text-text-primary hover:text-accent-primary font-medium font-mono">
                        {contact.info.tel}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-bg-secondary border border-border-subtle flex items-center justify-center text-accent-primary">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-text-muted uppercase">Localisation</div>
                      <div className="text-xs sm:text-sm text-text-primary font-medium">
                        {contact.info.adresse}
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInWhenVisible>
            </div>

            <FadeInWhenVisible direction="left" delay={0.15}>
              <div className="mt-6 border-t border-border-subtle/50 pt-6">
                <a
                  href="https://wa.me/+22941642355?text=Bonjour,%20FIERI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-accent-tertiary hover:bg-accent-tertiary/90 text-text-primary font-bold text-sm transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-accent-tertiary/20 cursor-pointer animate-pulse"
                >
                  <MessageIcon className="w-5 h-5 fill-current" />
                  Échanger directement sur WhatsApp
                </a>
              </div>
            </FadeInWhenVisible>
          </div>

          {/* Right form panel */}
          <div className="lg:col-span-7">
            <FadeInWhenVisible direction="right">
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-border-subtle relative overflow-hidden shadow-lg">
                <AnimatePresence mode="wait">
                  {!formSubmitted ? (
                    <motion.form
                      key="contact-form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleFormSubmit}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold tracking-widest text-text-secondary uppercase mb-2">Votre Nom</label>
                          <input
                            type="text"
                            required
                            value={formState.name}
                            onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                            placeholder="Nom complet"
                            className="w-full px-4 py-3 rounded-lg bg-bg-primary/80 border border-border-subtle focus:border-accent-primary focus:outline-none text-text-primary text-xs sm:text-sm font-medium transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold tracking-widest text-text-secondary uppercase mb-2">Adresse E-mail</label>
                          <input
                            type="email"
                            required
                            value={formState.email}
                            onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                            placeholder="adresse@mail.com"
                            className="w-full px-4 py-3 rounded-lg bg-bg-primary/80 border border-border-subtle focus:border-accent-primary focus:outline-none text-text-primary text-xs sm:text-sm font-medium transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold tracking-widest text-text-secondary uppercase mb-2">Sujet de discussion</label>
                        <input
                          type="text"
                          value={formState.subject}
                          onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                          placeholder="Ex: Candidature R&D, Partenariat..."
                          className="w-full px-4 py-3 rounded-lg bg-bg-primary/80 border border-border-subtle focus:border-accent-primary focus:outline-none text-text-primary text-xs sm:text-sm font-medium transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold tracking-widest text-text-secondary uppercase mb-2">Message détaillé</label>
                        <textarea
                          required
                          rows="4"
                          value={formState.message}
                          onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                          placeholder="Décrivez votre idée de projet, vos besoins..."
                          className="w-full px-4 py-3 rounded-lg bg-bg-primary/80 border border-border-subtle focus:border-accent-primary focus:outline-none text-text-primary text-xs sm:text-sm font-medium transition-all resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 rounded-lg bg-accent-primary hover:bg-accent-primary/95 text-text-primary font-bold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-md cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        Envoyer le message
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="form-success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-12 text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-accent-primary/20 border border-accent-primary/40 flex items-center justify-center mx-auto text-accent-primary mb-6">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-text-primary mb-2">Message transmis avec succès !</h3>
                      <p className="text-sm text-text-secondary font-light max-w-sm mx-auto leading-relaxed">
                        Merci pour votre message. Notre secrétariat scientifique traitera votre demande et vous recontactera dans les plus brefs délais.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeInWhenVisible>
          </div>

        </div>
      </div>
    </section>
  );
}

// Simple custom SVG Messenger/WhatsApp Icon
function MessageIcon(props) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      width="24" 
      height="24" 
      {...props}
    >
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.385 5.393.003 12.007.003c3.204.002 6.216 1.248 8.482 3.518 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.612-5.396 11.997-12.01 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.858.002-2.634-1.02-5.11-2.88-6.973C16.577 1.91 14.1 .887 11.477.887 6.042.887 1.615 5.309 1.611 10.748c-.001 1.706.46 3.376 1.334 4.869l-1.01 3.69 3.774-1.009zM15.8 13.06c-.208-.104-1.233-.609-1.423-.679-.19-.07-.33-.104-.469.104-.139.208-.538.679-.66 1.815-.121.139-.243.156-.451.052-1.02-.511-1.745-1.012-2.42-2.181-.177-.305-.177-.521.035-.744.19-.201.417-.486.625-.729.07-.083.125-.139.173-.222.083-.139.041-.26-.02-.364-.062-.104-.469-1.129-.643-1.545-.168-.406-.336-.35-.461-.35-.119-.002-.256-.002-.394-.002-.139 0-.364.052-.555.26-.191.208-.729.712-.729 1.735s.746 2.012.85 2.151c.104.139 1.467 2.24 3.553 3.14.496.214.883.342 1.184.438.498.158.951.135 1.309.082.399-.059 1.233-.504 1.406-.991.173-.486.173-.903.121-.991-.051-.087-.19-.139-.398-.243z"/>
    </svg>
  );
}
