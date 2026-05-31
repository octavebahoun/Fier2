import os

filepath = '/home/precieux/excellence team/essaie/Fieri/src/App.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports
content = content.replace(
    "import { Menu, X, ChevronDown, LogIn, LayoutDashboard, Sparkles, GraduationCap, Compass, Rss, Search, Sun, Moon } from 'lucide-react'",
    "import { Menu, X, ChevronDown, LogIn, LayoutDashboard, Sparkles, GraduationCap, Compass, Rss, Search, Sun, Moon, LogOut } from 'lucide-react'"
)

content = content.replace(
    "import './App.css'",
    "import './App.css'\nimport api from './services/api.js'"
)

# 2. Update user state initialization to restore session automatically
content = content.replace(
    "  // Simulated User Session: null, or { name: \"Dr. Alexis V.\", role: \"Chercheur\" }, etc.\n  const [user, setUser] = useState(null)",
    "  // Restore user session automatically from localStorage on startup\n  const [user, setUser] = useState(() => api.auth.getLocalUser())"
)

# 3. Add handleLogout function
logout_function = """  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
    navigate('home');
  };"""

content = content.replace(
    "  const toggleTheme = () => {",
    logout_function + "\n\n  const toggleTheme = () => {"
)

# 4. Inject Logout button into Desktop Navbar right after the Theme Toggle button
desktop_target = """                  {/* Theme Toggle */}
                  <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-white/5 border border-transparent hover:border-border-subtle text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                    title={theme === 'dark' ? "Passer au mode clair" : "Passer au mode sombre"}
                  >
                    {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  </button>"""

desktop_replacement = """                  {/* Theme Toggle */}
                  <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-white/5 border border-transparent hover:border-border-subtle text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                    title={theme === 'dark' ? "Passer au mode clair" : "Passer au mode sombre"}
                  >
                    {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  </button>

                  {/* Logout Button (Desktop) */}
                  {user && (
                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-full hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-red-400 hover:text-red-300 transition-all cursor-pointer"
                      title="Se déconnecter"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  )}"""

content = content.replace(desktop_target, desktop_replacement)

# 5. Inject Logout button into Mobile Dropdown right after the Theme Toggle card
mobile_target = """                {/* Theme Toggle for Mobile */}
                <div className="flex items-center justify-between bg-white/5 border border-border-subtle rounded-xl px-3 py-2 relative z-10">
                  <span className="text-xs text-text-secondary">Thème de l'interface</span>
                  <button 
                    onClick={toggleTheme}
                    className="p-1.5 rounded-full bg-white/5 border border-border-subtle text-text-primary cursor-pointer"
                  >
                    {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  </button>
                </div>"""

mobile_replacement = """                {/* Theme Toggle for Mobile */}
                <div className="flex items-center justify-between bg-white/5 border border-border-subtle rounded-xl px-3 py-2 relative z-10">
                  <span className="text-xs text-text-secondary">Thème de l'interface</span>
                  <button 
                    onClick={toggleTheme}
                    className="p-1.5 rounded-full bg-white/5 border border-border-subtle text-text-primary cursor-pointer"
                  >
                    {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Logout Button for Mobile */}
                {user && (
                  <div className="flex items-center justify-between bg-red-500/5 border border-red-500/15 rounded-xl px-3 py-2 relative z-10">
                    <span className="text-xs text-red-400 font-medium">Déconnexion</span>
                    <button 
                      onClick={handleLogout}
                      className="p-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}"""

content = content.replace(mobile_target, mobile_replacement)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Logout button successfully injected!")
