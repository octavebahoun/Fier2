import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // backend_fieri a sa propre config lint/CI (eslint + prettier) : on l'exclut
  // du lint racine pour ne pas mélanger les deux référentiels.
  globalIgnores(['**/dist/**', '**/coverage/**', 'backend_fieri/**']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Chargement de données initiales dans des useEffect (pattern fetch-on-mount
      // du projet) : garde-fou non bloquant, rétrogradé en warning.
      'react-hooks/set-state-in-effect': 'warn',
      // Contexts React exportant hook + provider (et constantes partagées) :
      // pattern standard, Fast Refresh le gère sans problème.
      'react-refresh/only-export-components': 'warn',
      // Mémorisations manuelles que le compilateur React ne peut pas préserver
      // (useCallback/useMemo) : garde-fou non bloquant, rétrogradé en warning.
      'react-hooks/preserve-manual-memoization': 'warn',
    },
  },
])
