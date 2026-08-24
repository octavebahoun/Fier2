import { useState, useCallback, useEffect, useMemo } from 'react'
import { ThemeContext } from './useTheme.js'
import { THEME_STORAGE_KEY, applyTheme, readStoredTheme, hasExplicitTheme } from './theme.js'

/**
 * ThemeProvider — état de thème global (dark/light).
 * Le thème est une préoccupation transverse (Navbar, CommandPalette, shell
 * connecté) : il vit ici plutôt que d'être remonté dans App puis propagé.
 *
 * Toute la résolution est dans `theme.js`, partagée avec le script anti-flash
 * de `index.html`.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readStoredTheme)

  // Appliquer, sans mémoriser : n'est mémorisé que ce que l'utilisateur choisit.
  // Écrire ici marquerait chaque visite comme un choix explicite et gèlerait à
  // jamais le suivi de la préférence système.
  useEffect(() => { applyTheme(theme) }, [theme])

  // Tant que l'utilisateur n'a pas tranché, le site suit son système.
  useEffect(() => {
    if (typeof matchMedia !== 'function' || hasExplicitTheme()) return
    const requete = matchMedia('(prefers-color-scheme: light)')
    const suivre = (e) => setTheme(e.matches ? 'light' : 'dark')
    requete.addEventListener('change', suivre)
    return () => requete.removeEventListener('change', suivre)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const suivant = prev === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(THEME_STORAGE_KEY, suivant)
      } catch {
        // Le thème reste correct pour la session, simplement non mémorisé.
      }
      return suivant
    })
  }, [])

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
