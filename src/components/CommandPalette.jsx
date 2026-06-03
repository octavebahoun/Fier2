import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Sun,
  Moon,
  Home,
  Briefcase,
  FolderGit2,
  Rss,
  Users,
  Compass,
  Calendar,
  HelpCircle,
  Shield,
  LayoutDashboard
} from 'lucide-react'

export default function CommandPalette({ navigate, theme, toggleTheme }) {
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

  // Define commands list
  const commands = [
    {
      id: 'theme',
      label: `Basculer vers le mode ${theme === 'dark' ? 'clair' : 'sombre'}`,
      category: 'Préférences',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => {
        toggleTheme()
        setIsOpen(false)
      }
    },
    {
      id: 'nav-home',
      label: "Naviguer vers l'Accueil",
      category: 'Navigation',
      icon: Home,
      action: () => {
        navigate('home')
        setIsOpen(false)
      }
    },
    {
      id: 'nav-projects',
      label: 'Naviguer vers les Projets & Brevets',
      category: 'Navigation',
      icon: FolderGit2,
      action: () => {
        navigate('projects')
        setIsOpen(false)
      }
    },
    {
      id: 'nav-news',
      label: 'Naviguer vers les Actualités & Publications',
      category: 'Navigation',
      icon: Rss,
      action: () => {
        navigate('news')
        setIsOpen(false)
      }
    },
    {
      id: 'nav-clubs',
      label: 'Naviguer vers les Clubs Scientifiques',
      category: 'Navigation',
      icon: Compass,
      action: () => {
        navigate('clubs')
        setIsOpen(false)
      }
    },
    {
      id: 'nav-opportunities',
      label: 'Naviguer vers les Opportunités de Recherche',
      category: 'Navigation',
      icon: Briefcase,
      action: () => {
        navigate('opportunities')
        setIsOpen(false)
      }
    },
    {
      id: 'nav-members',
      label: "Naviguer vers l'Annuaire de la Communauté",
      category: 'Navigation',
      icon: Users,
      action: () => {
        navigate('members')
        setIsOpen(false)
      }
    },
    {
      id: 'nav-workshops',
      label: 'Naviguer vers les Ateliers & Formations',
      category: 'Navigation',
      icon: Calendar,
      action: () => {
        navigate('workshops')
        setIsOpen(false)
      }
    },
    {
      id: 'nav-dashboard',
      label: 'Naviguer vers mon Dashboard',
      category: 'Espace Privé',
      icon: LayoutDashboard,
      action: () => {
        navigate('dashboard')
        setIsOpen(false)
      }
    },
    {
      id: 'nav-contact',
      label: 'Naviguer vers Aide & Contact',
      category: 'Support',
      icon: HelpCircle,
      action: () => {
        navigate('contact')
        setIsOpen(false)
      }
    }
  ]

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
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
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
            className="relative w-full max-w-xl bg-bg-secondary/90 border border-border-subtle rounded-2xl shadow-2xl overflow-hidden glass-panel flex flex-col pointer-events-auto max-h-[480px]"
          >
            {/* Header / Search Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-subtle">
              <Search className="w-5 h-5 text-text-muted shrink-0" />
              <input
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
              <span className="text-[10px] bg-white/5 border border-border-subtle text-text-muted px-2 py-0.5 rounded-md font-mono shrink-0">
                ÉCHAP
              </span>
            </div>

            {/* Commands List */}
            <div
              ref={listRef}
              className="flex-grow overflow-y-auto p-2 max-h-[360px] custom-scrollbar"
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
                      <span className="text-[9px] uppercase tracking-widest text-text-muted font-black px-3 py-2">
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
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-accent-primary/10 text-text-primary font-bold border border-accent-primary/20'
                                : 'bg-transparent text-text-secondary border border-transparent hover:text-text-primary hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-lg border transition-colors ${
                                isSelected
                                  ? 'bg-accent-primary/20 border-accent-primary/30 text-fieri-blue'
                                  : 'bg-white/5 border-border-subtle text-text-muted'
                              }`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span>{cmd.label}</span>
                            </div>
                            {isSelected && (
                              <span className="text-[10px] text-accent-primary font-black uppercase tracking-widest">
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
                  <span className="text-2xl">🔍</span>
                  <p className="text-xs font-bold text-text-primary">Aucune commande trouvée</p>
                  <p className="text-[10px] text-text-secondary">
                    Aucune action ne correspond à votre recherche "{search}"
                  </p>
                </div>
              )}
            </div>

            {/* Footer / Instructions */}
            <div className="px-4 py-2 bg-white/2 border-t border-border-subtle flex items-center justify-between text-[9px] text-text-muted">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="px-1 py-0.5 bg-white/5 rounded border border-border-subtle">↑↓</span> Naviguer
                </span>
                <span className="flex items-center gap-1">
                  <span className="px-1 py-0.5 bg-white/5 rounded border border-border-subtle">↵</span> Choisir
                </span>
              </div>
              <div>
                Raccourci : <span className="px-1.5 py-0.5 bg-white/5 rounded border border-border-subtle font-mono">⌘K</span> ou <span className="px-1.5 py-0.5 bg-white/5 rounded border border-border-subtle font-mono">Ctrl+K</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
