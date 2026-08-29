import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import landingData from '../content/landing.json';

// Modular Home Sections
import HeroSection from '../components/home/HeroSection.jsx';
import StatsSection from '../components/home/StatsSection.jsx';
import DecouvrirSection from '../components/home/DecouvrirSection.jsx';
import OrgSection from '../components/home/OrgSection.jsx';
import MissionsSection from '../components/home/MissionsSection.jsx';
import VisionSection from '../components/home/VisionSection.jsx';
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
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-sm chamfer-sm chamfer-shadow bg-engine text-on-accent flex items-center justify-center hover:bg-engine-deep transition-colors cursor-pointer"
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
    stats,
    organisation,
    mission,
    vision,
    clubs,
    journal,
    partenaires,
    faq,
    contact
  } = landingData;

  return (
    <div className="relative w-full bg-bg-primary text-text-primary selection:bg-engine-wash">
      {/* 1. HERO — la thèse */}
      <HeroSection hero={hero} navigate={navigate} />

      {/* 2. NOUS DÉCOUVRIR — ce qu'est la FIERI */}
      <DecouvrirSection decouvrir={decouvrir} />

      {/* 3. ORGANISATION — les trois espaces */}
      <OrgSection organisation={organisation} navigate={navigate} />

      {/* 4. MISSIONS — les piliers */}
      <MissionsSection mission={mission} />

      {/* 5. VISION — le pourquoi */}
      <VisionSection vision={vision} />

      {/* 6. CLUBS — la solution concrète */}
      <ResearchClubsSection clubs={clubs} navigate={navigate} />

      {/* 7. JOURNAL — les preuves vivantes */}
      <JournalSection journal={journal} navigate={navigate} />

      {/* 8. PARTENAIRES — mis en vedette : ils passent avant les programmes,
             juste après les preuves du Journal. */}
      <PartnersSection partenaires={partenaires} />

      {/* 9. PROGRAMMES */}
      <ProgrammesSection navigate={navigate} />

      {/* 10. STATS — la preuve, une fois le propos posé */}
      <StatsSection stats={stats} />

      {/* 11. FAQ */}
      <FAQSection faq={faq} />

      {/* 12. CONTACT — CTA final */}
      <ContactSection contact={contact} />

      <ScrollToTop />
    </div>
  );
}