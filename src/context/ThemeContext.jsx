import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'

const ThemeContext = createContext(null)

/**
 * ThemeProvider — état de thème global (dark/light).
 * Le thème est une préoccupation transverse (Navbar, CommandPalette, body class) :
 * il vit ici plutôt que d'être remonté dans App puis propagé en props.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark')

  // Applique/retire la classe sur <body> à chaque changement de thème.
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme')
    } else {
      document.body.classList.remove('light-theme')
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme doit être utilisé au sein d\'un ThemeProvider.')
  }
  return context
}

export default ThemeContext
