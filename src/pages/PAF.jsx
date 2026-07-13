import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Target, Users, Trophy, Globe, CheckCircle2, Award } from 'lucide-react';

export default function PAF({ navigate }) {
  const perks = [
    { icon: <Users className="w-5 h-5" />, title: "Réseau d'excellence", desc: "Intégrez un cercle de talents sélectionnés parmi les meilleurs chercheurs et ingénieurs." },
    { icon: <Target className="w-5 h-5" />, title: "Missions stratégiques", desc: "Représentez FIERI dans les universités, salons et événements d'innovation." },
    { icon: <Trophy className="w-5 h-5" />, title: "Accès prioritaire", desc: "Bénéficiez d'un accès exclusif aux laboratoires, formations et ressources R&D." },
    { icon: <Globe className="w-5 h-5" />, title: "Visibilité internationale", desc: "Portez la voix de la CITE FIERI sur la scène scientifique mondiale." }
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pt-24 pb-16 px-4 md:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent-primary/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-accent-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-accent-primary uppercase bg-accent-primary/10 border border-accent-primary/30 px-4 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3 h-3" />
            PROGRAMME AMBASSADEUR FIERI
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-tertiary bg-clip-text text-transparent">
            Programme Ambassadeur FIERI
          </h1>
          <p className="text-text-secondary text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto">
            Un programme d'élite pour les talents qui souhaitent porter les valeurs de l'excellence scientifique et devenir les ambassadeurs de la CITE FIERI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {perks.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-bg-secondary/40 backdrop-blur-md border border-border-subtle hover:border-accent-primary/30 rounded-2xl p-6 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary mb-4 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-base font-bold text-text-primary mb-2">{item.title}</h3>
              <p className="text-sm text-text-secondary font-light">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 p-1 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 backdrop-blur-md">
            <span className="text-xs text-text-secondary font-light px-3">Prêt à rejoindre l'élite ?</span>
            <button
              onClick={() => navigate('auth')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent-primary text-text-primary text-xs font-bold hover:bg-accent-primary/95 transition-all shadow-md cursor-pointer"
            >
              Postuler maintenant
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}