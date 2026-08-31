import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  GraduationCap, Users, Calendar, BookOpen, ArrowRight,
  Sparkles, Cpu, Zap, Leaf, Building2, Brain, Rocket, ChevronRight, Lock
} from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext.jsx'

const CLUB_ICONS = {
  'club-1': { icon: Cpu, label: 'Robotique' },
  'club-2': { icon: Zap, label: 'IoT' },
  'club-3': { icon: Leaf, label: 'Éco-énergie' },
  'club-4': { icon: Building2, label: 'Construction 4.0' },
  'club-5': { icon: Brain, label: 'IA' },
  'club-6': { icon: Rocket, label: 'Innovation' },
}

const HUB_SECTIONS = [
  {
    id: 'clubs',
    title: 'CITE de Recherche',
    // Sans nombre : cette carte ne charge aucune donnee, elle ne peut donc pas
    // savoir combien il y a de clubs. Le « 6 » qui etait ecrit ici vieillissait
    // au premier club cree.
    desc: 'Rejoignez nos clubs thématiques et collaborez avec des chercheurs passionnés.',
    color: 'var(--color-engine)',
    features: ['Pôles scientifiques', 'Adhésion en un clic', 'Accents distinctifs'],
    link: 'clubs',
    icon: Users
  },
  {
    id: 'workshops',
    title: 'Ateliers Académiques',
    desc: 'Développez vos compétences grâce à nos ateliers interactifs animés par des experts.',
    color: 'var(--color-success)',
    features: ['Débutant à Avancé', 'Inscription directe', 'Liste d\'attente'],
    link: 'workshops',
    icon: BookOpen
  },
  {
    id: 'events',
    title: 'Événements & Live',
    desc: 'Participez aux hackathons, webinaires et conférences en direct.',
    color: 'var(--color-ember-soft)',
    features: ['Streaming live', 'Badges Live', 'Calendrier interactif'],
    link: 'events',
    icon: Calendar
  }
]

export default function StudentPortal({ navigate }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [clubs, setClubs] = useState([])
  const [clubsError, setClubsError] = useState(null)

  useEffect(() => {
    const loadClubs = async () => {
      try {
        const res = await api.clubs.getAll();
        if (res.success) {
          setClubs(Array.isArray(res.data) ? res.data.slice(0, 3) : []);
        }
      } catch (err) {
        setClubs([]);
        setClubsError(err?.serverMessage || err?.message || "Les clubs n'ont pas pu être chargés.");
      }
    };
    loadClubs();
  }, [userId])

  return (
    <div className="max-w-[88rem] mx-auto w-full py-28 px-6 md:px-12 lg:px-12 relative min-h-screen">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[30rem] halo-radial pointer-events-none opacity-40 z-0" />

      <div className="relative z-10">
        <div className="flex flex-col gap-4 mb-16 max-w-3xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-engine-wash border border-engine text-engine">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xs font-extrabold tracking-[0.25em] uppercase text-engine">
              PORTAL ÉTUDIANT
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight">
            Espace <span className="text-gradient-blue">Étudiant & CITE</span>
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
            Explorez les clubs de recherche, inscrivez-vous aux ateliers académiques et
            participez aux événements live. Votre parcours d'innovation commence ici.
          </p>

          {/* Bandeau invitation connexion si non connecté */}
          {!user && (
            <div className="flex items-center gap-4 p-4 chamfer-sm bg-engine-wash border border-engine text-sm mt-2">
              <Lock className="w-5 h-5 text-engine shrink-0" />
              <p className="text-text-secondary text-xs">
                <span className="text-text-primary font-semibold">Connectez-vous</span> pour rejoindre des clubs, vous inscrire aux ateliers et accéder à votre tableau de bord.
              </p>
              <button
                onClick={() => navigate('auth')}
                className="ml-auto shrink-0 px-4 py-1.5 rounded-xl bg-engine text-on-accent text-xs font-bold hover:bg-engine transition-colors"
              >
                Se connecter
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {HUB_SECTIONS.map((section, i) => {
            const Icon = section.icon
            return (
              <motion.button
                key={section.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 100, damping: 15 }}
                onClick={() => navigate(section.link)}
                className="glass-panel chamfer p-7 border border-border-subtle text-left group cursor-pointer relative overflow-hidden"
                whileHover={{ y: -4 }}
              >
                <div className="relative z-10 flex flex-col gap-5">
                  <div className="w-12 h-12 chamfer-sm flex items-center justify-center border border-engine bg-engine-wash">
                    <Icon className="w-5 h-5 text-engine" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-extrabold text-text-primary">{section.title}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{section.desc}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {section.features.map((f) => (
                      <span
                        key={f}
                        className="text-xs font-semibold text-text-muted bg-bg-tertiary px-2 py-1 rounded-full border border-border-subtle"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-engine group-hover:gap-2.5 transition-all">
                    <span>Explorer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>

        {clubsError && (
          <p className="border border-danger bg-danger-wash px-4 py-3 text-sm text-danger">
            {clubsError}
          </p>
        )}

        {clubs.length > 0 && (
          <div className="glass-panel chamfer p-8 border border-border-subtle relative overflow-hidden">
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-engine" />
                  <h2 className="text-lg font-extrabold tracking-tight text-text-primary">
                    CITE populaires
                  </h2>
                </div>
                <button
                  onClick={() => navigate('clubs')}
                  className="flex items-center gap-1.5 text-xs font-bold text-engine hover:text-engine/80 transition-colors cursor-pointer"
                >
                  Voir tout
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {clubs.map((club, i) => {
                  const clubIcon = CLUB_ICONS[club.id]
                  const IconComp = clubIcon?.icon || Zap
                  return (
                    <motion.div
                      key={club.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="bg-bg-secondary border border-border-subtle chamfer-sm p-5 flex items-center gap-4 group hover:bg-bg-tertiary transition-all cursor-pointer"
                      onClick={() => navigate('clubs')}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-engine bg-engine-wash"
                      >
                        <IconComp className="w-4 h-4 text-engine" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-text-primary truncate">{club.kicker}</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 glass-panel chamfer p-8 border border-border-subtle flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="relative z-10 flex flex-col gap-2">
            <h3 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-ember" />
              Prêt à rejoindre l'aventure ?
            </h3>
            <p className="text-sm text-text-secondary max-w-xl">
              Connectez-vous pour accéder à l'ensemble des clubs, ateliers et événements FIERI.
            </p>
          </div>
          <button
            onClick={() => navigate('auth')}
            className="relative z-10 px-6 py-3 chamfer-sm chamfer-shadow text-xs font-bold text-on-accent bg-engine hover:bg-engine transition-all cursor-pointer shrink-0"
          >
            Commencer
          </button>
        </div>
      </div>
    </div>
  )
}
