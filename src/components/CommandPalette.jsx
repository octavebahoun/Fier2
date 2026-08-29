import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Sun, Moon, Compass, Sparkles,
  LayoutDashboard, UserRound, FolderGit2, Users, GraduationCap, Briefcase,
  Newspaper, CalendarDays, Contact, Shield, Trophy, HeartHandshake, ShieldCheck,
  LayoutList, LifeBuoy, Layers, UserPlus, ClipboardList, FileText, Award,
  UserX, Star, Wallet,
} from 'lucide-react'
import { useTheme } from '../context/useTheme.js'
import { useAuth } from '../context/AuthContext.jsx'
import { DESTINATIONS, SECTIONS, navAccessOf } from '../navigation/destinations.js'

const ICONS = {
  Sparkles, LayoutDashboard, UserRound, FolderGit2, Users, GraduationCap, Briefcase,
  Newspaper, CalendarDays, Contact, Shield, Trophy, HeartHandshake, ShieldCheck,
  LayoutList, LifeBuoy, Layers, UserPlus, ClipboardList, FileText, Award,
  UserX, Star, Wallet,
}

const SECTION_BY_ID = Object.fromEntries(Object.values(SECTIONS).map((x) => [x.id, x]))

export default function CommandPalette({ navigate }) {
  const { theme, toggleTheme } = useTheme()
  const { can } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  // Expose open function globally for navbar button
  useEffect(() => {
    window.__openPalette = () => { setSearch(''); setIsOpen(true) }
    return () => { delete window.__openPalette }
  }, [])

  // Listen for Cmd+K / Ctrl+K and Esc keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsOpen((prev) => {
          if (!prev) setSearch('') // Reset search on open
          return !prev
        })
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault()
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Les destinations viennent du registre et sont filtrées par les mêmes
  // droits que la barre latérale. La palette exposait auparavant huit pages en
  // dur, sans aucun filtrage : un étudiant pouvait s'y téléporter partout.
  const commands = useMemo(() => {
    const reachable = DESTINATIONS.filter((dest) => {
      if (!dest.inPalette) return false
      const access = navAccessOf(dest.id)
      if (access === 'public') return true
      const required = access?.anyOf ?? (access?.capability ? [access.capability] : [])
      return required.length === 0 || required.some((cap) => can(cap))
    })

    return [
      {
        id: 'theme',
        label: `Basculer vers le mode ${theme === 'dark' ? 'clair' : 'sombre'}`,
        category: 'Préférences',
        icon: theme === 'dark' ? Sun : Moon,
        action: () => { toggleTheme(); setIsOpen(false) },
      },
      ...reachable.map((dest) => ({
        id: `nav-${dest.id}`,
        // Le nom canonique de la destination, le même que dans la barre
        // latérale et le fil d'Ariane (constat F09).
        label: dest.label,
        category: SECTION_BY_ID[dest.section]?.label || 'Navigation',
        icon: ICONS[dest.icon] || Compass,
        action: () => { navigate(dest.id, dest.navParams || {}); setIsOpen(false) },
      })),
    ]
  }, [can, theme, toggleTheme, navigate])

  // Filter commands based on user input
  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  )

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0)
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Handle keyboard navigation inside the open palette
  useEffect(() => {
    const handleNavigation = (e) => {
      if (!isOpen || filteredCommands.length === 0) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        filteredCommands[selectedIndex].action()
      }
    }
    window.addEventListener('keydown', handleNavigation)
    return () => window.removeEventListener('keydown', handleNavigation)
  }, [isOpen, selectedIndex, filteredCommands])

  // Auto-scroll to selected item
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[aria-selected="true"]')
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-bg-primary/70 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />

          {/* Palette Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Palette de commandes"
            className="relative w-full max-w-xl bg-bg-secondary border border-border-subtle rounded-2xl shadow-2xl overflow-hidden glass-panel flex flex-col pointer-events-auto max-h-[480px]"
          >
            {/* Header / Search Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-subtle">
              <Search className="w-5 h-5 text-text-muted shrink-0" />
              <input aria-label="Tapez une commande ou naviguez"
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setSelectedIndex(0)
                }}
                placeholder="Tapez une commande ou naviguez..."
                className="w-full bg-transparent border-none text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-0"
              />
              <span className="text-xs bg-bg-tertiary border border-border-subtle text-text-muted px-2 py-0.5 rounded font-mono shrink-0">
                ÉCHAP
              </span>
            </div>

            {/* Commands List */}
            <div
              ref={listRef}
              className="flex-grow overflow-y-auto p-2 max-h-[360px]"
            >
              {filteredCommands.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {/* Group items by category */}
                  {Object.entries(
                    filteredCommands.reduce((groups, item) => {
                      if (!groups[item.category]) groups[item.category] = []
                      groups[item.category].push(item)
                      return groups
                    }, {})
                  ).map(([category, items]) => (
                    <div key={category} className="flex flex-col">
                      {/* Category Label */}
                      <span className="eyebrow px-3 py-2">
                        {category}
                      </span>
                      {/* Category Items */}
                      {items.map((cmd) => {
                        const globalIndex = filteredCommands.findIndex((c) => c.id === cmd.id)
                        const isSelected = globalIndex === selectedIndex
                        const Icon = cmd.icon

                        return (
                          <button
                            key={cmd.id}
                            role="option"
                            aria-selected={isSelected}
                            onClick={cmd.action}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-engine-wash text-text-primary font-semibold border border-engine'
                                : 'bg-transparent text-text-secondary border border-transparent hover:text-text-primary hover:bg-bg-tertiary'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-lg border transition-colors ${
                                isSelected
                                  ? 'bg-engine-wash border-engine text-engine'
                                  : 'bg-bg-tertiary border-border-subtle text-text-muted'
                              }`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span>{cmd.label}</span>
                            </div>
                            {isSelected && (
                              <span className="text-xs text-engine font-bold uppercase tracking-widest">
                                Valider
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 px-4 text-center flex flex-col items-center justify-center gap-2">
                  <Search className="w-6 h-6 text-text-muted" />
                  <p className="text-sm font-bold text-text-primary">Aucune commande trouvée</p>
                  <p className="text-sm text-text-secondary">
                    Aucune action ne correspond à votre recherche « {search} »
                  </p>
                </div>
              )}
            </div>

            {/* Footer / Instructions */}
            <div className="px-4 py-2 bg-bg-tertiary border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="px-1 py-0.5 bg-bg-tertiary rounded border border-border-subtle">↑↓</span> Naviguer
                </span>
                <span className="flex items-center gap-1">
                  <span className="px-1 py-0.5 bg-bg-tertiary rounded border border-border-subtle">↵</span> Choisir
                </span>
              </div>
              <div>
                Raccourci : <span className="px-1.5 py-0.5 bg-bg-tertiary rounded border border-border-subtle font-mono">⌘K</span> ou <span className="px-1.5 py-0.5 bg-bg-tertiary rounded border border-border-subtle font-mono">Ctrl+K</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
