import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import landingData from '../content/landing.json';

// Modular Home Sections
import HeroSection from '../components/home/HeroSection.jsx';
import DiscoverSection from '../components/home/DiscoverSection.jsx';
import OrgSection from '../components/home/OrgSection.jsx';
import MissionsSection from '../components/home/MissionsSection.jsx';
import VisionSection from '../components/home/VisionSection.jsx';
import StatsSection from '../components/home/StatsSection.jsx';
import ResearchClubsSection from '../components/home/ResearchClubsSection.jsx';
import JournalSection from '../components/home/JournalSection.jsx';
import ProgrammesSection from '../components/home/ProgrammesSection.jsx';
import PartnersSection from '../components/home/PartnersSection.jsx';
import FAQSection from '../components/home/FAQSection.jsx';
import ContactSection from '../components/home/ContactSection.jsx';

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 800);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-accent-primary/90 border border-accent-primary/40 text-white flex items-center justify-center shadow-lg backdrop-blur-md hover:bg-accent-primary transition-all cursor-pointer"
          aria-label="Retour en haut"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function Home({ navigate }) {
  const { 
    hero, 
    decouvrir, 
    organisation, 
    mission, 
    vision, 
    stats, 
    clubs, 
    journal, 
    programmes, 
    partenaires, 
    faq, 
    contact 
  } = landingData;

  return (
    <div className="relative w-full overflow-hidden bg-bg-primary text-text-primary selection:bg-accent-primary/20 selection:text-accent-primary">
      {/* SECTION 1 : HERO */}
      <HeroSection hero={hero} navigate={navigate} />

      {/* SECTION 2 : NOUS DÉCOUVRIR */}
      <DiscoverSection decouvrir={decouvrir} navigate={navigate} />

      {/* SECTION 3 : NOTRE ORGANISATION */}
      <OrgSection organisation={organisation} navigate={navigate} />

      {/* SECTION 4 : NOS MISSIONS */}
      <MissionsSection mission={mission} />

      {/* SECTION 5 : NOTRE VISION */}
      <VisionSection vision={vision} />

      {/* SECTION 6 : LES CHIFFRES CLÉS (STATS) */}
      <StatsSection stats={stats} />

      {/* SECTION 7 : GRAND CAROUSEL DE TOUTES LES CITE */}
      <ResearchClubsSection clubs={clubs} navigate={navigate} />

      {/* SECTION 8 : JOURNAL UNIFIÉ (ateliers, offres, actualités) */}
      <JournalSection journal={journal} navigate={navigate} />

      {/* SECTION 9 : NOS PROGRAMMES (ambassadeur, bénévolat, mentorat…) */}
      <ProgrammesSection programmes={programmes} navigate={navigate} />

      {/* SECTION 10 : PARTENAIRES COMMERCIAUX */}
      <PartnersSection partenaires={partenaires} />

      {/* SECTION 12 : FOIRE AUX QUESTIONS (FAQ) */}
      <FAQSection faq={faq} />

      {/* SECTION 13 : CONTACT DIRECT & FORMULAIRE */}
      <ContactSection contact={contact} />

      <ScrollToTop />
    </div>
  );
}
