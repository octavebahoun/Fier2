import React, { useState, useEffect } from 'react'
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
    desc: 'Rejoignez nos 6 clubs thématiques et collaborez avec des chercheurs passionnés.',
    color: '#6C4CF1',
    features: ['6 pôles scientifiques', 'Adhésion en un clic', 'Accents distinctifs'],
    link: 'clubs',
    icon: Users
  },
  {
    id: 'workshops',
    title: 'Ateliers Académiques',
    desc: 'Développez vos compétences grâce à nos ateliers interactifs animés par des experts.',
    color: '#10b981',
    features: ['Débutant à Avancé', 'Inscription directe', 'Liste d\'attente'],
    link: 'workshops',
    icon: BookOpen
  },
  {
    id: 'events',
    title: 'Événements & Live',
    desc: 'Participez aux hackathons, webinaires et conférences en direct.',
    color: '#f5a623',
    features: ['Streaming live', 'Badges Live', 'Calendrier interactif'],
    link: 'events',
    icon: Calendar
  }
]

export default function StudentPortal({ navigate }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [clubs, setClubs] = useState([])

  useEffect(() => {
    const loadClubs = async () => {
      try {
        const res = await api.clubs.getAll();
        if (res.success) {
          setClubs(Array.isArray(res.data) ? res.data.slice(0, 3) : []);
        }
      } catch (err) {
        setClubs([]);
      }
    };
    loadClubs();
  }, [userId])

  return (
    <div className="max-w-[88rem] mx-auto w-full py-28 px-6 md:px-12 lg:px-24 relative min-h-screen">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[30rem] halo-radial pointer-events-none opacity-40 z-0" />

      <div className="relative z-10">
        <div className="flex flex-col gap-4 mb-16 max-w-3xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-fieri-blue/10 border border-fieri-blue/20 text-fieri-blue">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black tracking-[0.25em] uppercase text-fieri-blue">
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
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-fieri-blue/8 border border-fieri-blue/20 text-sm mt-2">
              <Lock className="w-5 h-5 text-fieri-blue shrink-0" />
              <p className="text-text-secondary text-xs">
                <span className="text-text-primary font-semibold">Connectez-vous</span> pour rejoindre des clubs, vous inscrire aux ateliers et accéder à votre tableau de bord.
              </p>
              <button
                onClick={() => navigate('auth')}
                className="ml-auto shrink-0 px-4 py-1.5 rounded-xl bg-fieri-blue text-white text-xs font-bold hover:bg-fieri-blue/85 transition-colors"
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
                className="glass-panel rounded-3xl p-7 border border-white/5 text-left group cursor-pointer relative overflow-hidden"
                whileHover={{ y: -4 }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl"
                  style={{ background: `radial-gradient(ellipse at top, ${section.color}15, transparent 70%)` }}
                />
                <div className="relative z-10 flex flex-col gap-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: `${section.color}20`, border: `1px solid ${section.color}40` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: section.color }} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-extrabold text-text-primary">{section.title}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{section.desc}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {section.features.map((f) => (
                      <span
                        key={f}
                        className="text-[9px] font-semibold text-text-muted bg-white/5 px-2 py-1 rounded-full border border-white/5"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-fieri-blue group-hover:gap-2.5 transition-all">
                    <span>Explorer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>

        {clubs.length > 0 && (
          <div className="glass-panel rounded-3xl p-8 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-fieri-blue/5 blur-[60px] rounded-full pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-fieri-blue" />
                  <h2 className="text-lg font-black tracking-tight text-text-primary">
                    CITE populaires
                  </h2>
                </div>
                <button
                  onClick={() => navigate('clubs')}
                  className="flex items-center gap-1.5 text-xs font-bold text-fieri-blue hover:text-fieri-blue/80 transition-colors cursor-pointer"
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
                      className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4 group hover:bg-white/10 transition-all cursor-pointer"
                      onClick={() => navigate('clubs')}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${club.accent}20`, border: `1px solid ${club.accent}40` }}
                      >
                        <IconComp className="w-4 h-4" style={{ color: club.accent }} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-text-primary truncate">{club.kicker}</span>
                        <span className="text-[9px] text-text-muted truncate">{club.membersCount || 0} membres</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 glass-panel rounded-3xl p-8 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent-secondary/5 blur-[60px] rounded-full pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-2">
            <h3 className="text-lg font-extrabold text-text-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-secondary" />
              Prêt à rejoindre l'aventure ?
            </h3>
            <p className="text-sm text-text-secondary max-w-xl">
              Connectez-vous pour accéder à l'ensemble des clubs, ateliers et événements FIERI.
            </p>
          </div>
          <button
            onClick={() => navigate('auth')}
            className="relative z-10 px-6 py-3 rounded-2xl text-xs font-bold text-white bg-fieri-blue hover:bg-fieri-blue/90 shadow-lg shadow-fieri-blue/20 transition-all cursor-pointer shrink-0"
          >
            Commencer
          </button>
        </div>
      </div>
    </div>
  )
}
