import { useState, useCallback, useEffect, useMemo } from 'react'
import { ThemeContext } from './useTheme.js'

/**
 * ThemeProvider — état de thème global (dark/light).
 * Le thème est une préoccupation transverse (Navbar, CommandPalette, body class) :
 * il vit ici plutôt que d'être remonté dans App puis propagé en props.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark')

  // Applique/retire la classe sur <html> et <body> à chaque changement de thème.
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.add('light-theme')
      document.body.classList.add('light-theme')
      root.style.colorScheme = 'light'
    } else {
      root.classList.remove('light-theme')
      document.body.classList.remove('light-theme')
      root.style.colorScheme = 'dark'
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
