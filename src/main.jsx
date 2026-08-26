import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { DataProvider } from './context/DataContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

/*
 * `reducedMotion="user"` fait respecter la préférence système à TOUTES les
 * animations Framer Motion de l'application. Le CSS neutralisait déjà les
 * transitions et les keyframes, mais pas les animations pilotées en
 * JavaScript : 38 fichiers animaient, 4 seulement consultaient la préférence.
 * Un utilisateur ayant demandé moins de mouvement en recevait quand même.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <DataProvider>
              <App />
            </DataProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
      </MotionConfig>
    </ErrorBoundary>
  </StrictMode>,
)
