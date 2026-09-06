// Thème appliqué avant le premier pixel. Sans ce script, la page s'affiche
// dans le thème par défaut du CSS puis bascule quand React monte : c'est le
// flash blanc au chargement. Il rejoue volontairement, à l'identique, la
// logique de src/context/theme.js.
//
// Externalisé (au lieu d'être inline dans index.html) pour permettre une CSP
// stricte `script-src 'self'` — aucun script en ligne n'est plus autorisé, ce
// qui coupe le principal vecteur de vol du jeton JWT via XSS. Script classique
// dans <head> : bloquant, donc exécuté avant le rendu du <body> — pas de flash.
(function () {
  var theme = 'dark'
  try {
    var stored = localStorage.getItem('fieri-theme')
    if (stored === 'dark' || stored === 'light') theme = stored
    else if (matchMedia('(prefers-color-scheme: light)').matches) theme = 'light'
  } catch (e) {
    if (window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches) theme = 'light'
  }
  var dark = theme === 'dark'
  var root = document.documentElement
  root.classList.toggle('dark', dark)
  root.classList.toggle('light-theme', !dark)
  root.style.colorScheme = dark ? 'dark' : 'light'
})()
