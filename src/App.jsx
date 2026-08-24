import { useState } from 'react'
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { useAuth } from './context/AuthContext.jsx'
import { AuthGateProvider } from './context/AuthGateContext.jsx'
import { useAppNavigate, pathToPageName } from './navigation.js'

// Pages
import Home from './pages/Home.jsx'
import CiteIntegration from './pages/CiteIntegration.jsx'
import StudentPortal from './pages/StudentPortal.jsx'
import News from './pages/News.jsx'
import NewsDetail from './pages/NewsDetail.jsx'
import ResearchClubs from './pages/ResearchClubs.jsx'
import ClubDetail from './pages/ClubDetail.jsx'
import Projects from './pages/Projects.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import Workshops from './pages/Workshops.jsx'
import Events from './pages/Events.jsx'
import Members from './pages/Members.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ResearcherProfile from './pages/ResearcherProfile.jsx'
import ResearcherProfileEdit from './pages/ResearcherProfileEdit.jsx'
import Contact from './pages/Contact.jsx'
import Auth from './pages/Auth.jsx'
import Opportunities from './pages/Opportunities.jsx'
import Admin from './pages/Admin.jsx'
import PAF from './pages/PAF.jsx'
import Gouvernance from './pages/Gouvernance.jsx'
import EspaceCITE from './pages/EspaceCITE.jsx'
import Challenges from './pages/Challenges.jsx'
import Soutiens from './pages/Soutiens.jsx'

// ─── Route-wrappers : injectent les paramètres d'URL dans les pages qui en ont
// besoin, sans modifier les pages elles-mêmes. ────────────────────────────────
function ProjectDetailRoute() {
  const navigate = useAppNavigate()
  const { projectId } = useParams()
  return <ProjectDetail navigate={navigate} projectId={projectId} />
}

function ProfileRoute() {
  const navigate = useAppNavigate()
  const { researcherId } = useParams()
  return <ResearcherProfile navigate={navigate} researcherId={researcherId} />
}

function NewsDetailRoute() {
  const navigate = useAppNavigate()
  const { newsId } = useParams()
  return <NewsDetail navigate={navigate} newsId={newsId} />
}

function ClubDetailRoute() {
  const navigate = useAppNavigate()
  const { clubId } = useParams()
  return <ClubDetail navigate={navigate} clubId={clubId} />
}

function AuthRoute() {
  const navigate = useAppNavigate()
  const location = useLocation()
  // `from` est un chemin mémorisé par ProtectedRoute ; buildPath l'accepte tel quel.
  const from = location.state?.from
  const redirectTo = from ? { pageName: from } : null
  return <Auth navigate={navigate} redirectTo={redirectTo} onAuthComplete={() => {}} />
}

function App() {
  const navigate = useAppNavigate()
  const location = useLocation()
  const currentPage = pathToPageName(location.pathname)

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('home')
  }

  return (
    <AuthGateProvider>
    <AppLayout
      currentPage={currentPage}
      navigate={navigate}
      user={user}
      handleLogout={handleLogout}
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
    >
      <Routes>
        <Route path="/" element={<Home navigate={navigate} />} />
        <Route path="/cite" element={<CiteIntegration navigate={navigate} />} />
        {/* Accueil étudiant */}
        <Route path="/students" element={<StudentPortal navigate={navigate} />} />
        <Route path="/student-portal" element={<StudentPortal navigate={navigate} />} />
        <Route path="/news" element={<News navigate={navigate} />} />
        <Route path="/news/:newsId" element={<NewsDetailRoute />} />
        <Route path="/clubs" element={<ResearchClubs navigate={navigate} />} />
        <Route path="/clubs/:clubId" element={<ClubDetailRoute />} />
        <Route path="/projects" element={<Projects navigate={navigate} />} />
        <Route path="/projects/:projectId" element={<ProjectDetailRoute />} />
        {/* Formations (ex-Ateliers) */}
        <Route path="/formations" element={<Workshops navigate={navigate} />} />
        <Route path="/workshops" element={<Workshops navigate={navigate} />} />
        <Route path="/events" element={<Events navigate={navigate} />} />
        <Route path="/opportunities" element={<Opportunities navigate={navigate} />} />
        <Route path="/paf" element={<PAF navigate={navigate} />} />

        {/* Gouvernance de l'université — attestations et exclusions */}
        <Route
          path="/gouvernance"
          element={
            <ProtectedRoute destination="gouvernance">
              <Gouvernance navigate={navigate} />
            </ProtectedRoute>
          }
        />
        {/* Espace CITE — dépôt et lecture des rapports de club */}
        <Route
          path="/espace-cite"
          element={
            <ProtectedRoute destination="espace-cite">
              <EspaceCITE navigate={navigate} />
            </ProtectedRoute>
          }
        />
        <Route path="/challenges" element={<Challenges navigate={navigate} />} />
        <Route path="/soutiens" element={<Soutiens navigate={navigate} />} />
        <Route path="/help" element={<Contact navigate={navigate} />} />
        <Route path="/contact" element={<Contact navigate={navigate} />} />

        {/* Espace login / conversion (wireframe : /members) + alias /auth */}
        <Route path="/members" element={<AuthRoute />} />
        <Route path="/auth" element={<AuthRoute />} />

        {/* Annuaire des chercheurs */}
        <Route path="/researchers" element={<Members navigate={navigate} />} />
        {/* /researchers/edit AVANT /researchers/:researcherId */}
        <Route
          path="/researchers/edit"
          element={
            <ProtectedRoute destination="researcher-profile-edit">
              <ResearcherProfileEdit navigate={navigate} />
            </ProtectedRoute>
          }
        />
        <Route path="/researchers/:researcherId" element={<ProfileRoute />} />
        {/* Anciens chemins /profile/* conservés en alias */}
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute destination="researcher-profile-edit">
              <ResearcherProfileEdit navigate={navigate} />
            </ProtectedRoute>
          }
        />
        <Route path="/profile/:researcherId" element={<ProfileRoute />} />

        {/* Espace membre */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute destination="dashboard">
              <Dashboard navigate={navigate} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute destination="admin">
              <Admin navigate={navigate} />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
    </AuthGateProvider>
  )
}

export default App
