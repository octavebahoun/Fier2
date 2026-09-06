import { useState, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { useAuth } from './context/AuthContext.jsx'
import { AuthGateProvider } from './context/AuthGateContext.jsx'
import { useAppNavigate, pathToPageName } from './navigation.js'

// ─── Pages ───────────────────────────────────────────────────────────────────
// La page d'accueil reste chargée d'emblée (point d'entrée le plus fréquent :
// aucun écran d'attente au premier rendu). Toutes les autres pages sont
// découpées en fragments chargés à la demande via `lazy()` : le bundle initial
// ne portait plus qu'un seul fichier de ~1,15 Mo pour TOUTE l'application, ce
// qui ralentissait le premier écran. Chaque route devient désormais son propre
// fragment, téléchargé seulement quand on y navigue.
import Home from './pages/Home.jsx'

const OrganisationCite = lazy(() => import('./pages/cite/OrganisationCite.jsx'))
const StudentPortal = lazy(() => import('./pages/StudentPortal.jsx'))
const News = lazy(() => import('./pages/News.jsx'))
const NewsDetail = lazy(() => import('./pages/NewsDetail.jsx'))
const ResearchClubs = lazy(() => import('./pages/ResearchClubs.jsx'))
const ClubDetail = lazy(() => import('./pages/ClubDetail.jsx'))
const Projects = lazy(() => import('./pages/Projects.jsx'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail.jsx'))
const Workshops = lazy(() => import('./pages/Workshops.jsx'))
const Events = lazy(() => import('./pages/Events.jsx'))
const Members = lazy(() => import('./pages/Members.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const ResearcherProfile = lazy(() => import('./pages/ResearcherProfile.jsx'))
const ResearcherProfileEdit = lazy(() => import('./pages/ResearcherProfileEdit.jsx'))
const Contact = lazy(() => import('./pages/Contact.jsx'))
const Auth = lazy(() => import('./pages/Auth.jsx'))
const Opportunities = lazy(() => import('./pages/Opportunities.jsx'))
const Admin = lazy(() => import('./pages/Admin.jsx'))
const PAF = lazy(() => import('./pages/PAF.jsx'))
const MonClub = lazy(() => import('./pages/espace-cite/MonClub.jsx'))
const Adhesions = lazy(() => import('./pages/espace-cite/Adhesions.jsx'))
const Activites = lazy(() => import('./pages/espace-cite/Activites.jsx'))
const Rapports = lazy(() => import('./pages/espace-cite/Rapports.jsx'))
const Annuaire = lazy(() => import('./pages/espace-cite/Annuaire.jsx'))
const Attestations = lazy(() => import('./pages/gouvernance/Attestations.jsx'))
const Exclusions = lazy(() => import('./pages/gouvernance/Exclusions.jsx'))
const Figures = lazy(() => import('./pages/gouvernance/Figures.jsx'))
const Tresorerie = lazy(() => import('./pages/Tresorerie.jsx'))
const Taches = lazy(() => import('./pages/projets/Taches.jsx'))
const Candidatures = lazy(() => import('./pages/projets/Candidatures.jsx'))
const Challenges = lazy(() => import('./pages/Challenges.jsx'))
const Soutiens = lazy(() => import('./pages/Soutiens.jsx'))

/** Écran d'attente pendant le téléchargement d'un fragment de page. */
function PageFallback() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-border-subtle border-t-engine" />
      <span className="sr-only">Chargement…</span>
    </div>
  )
}

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
      <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Home navigate={navigate} />} />
        <Route path="/cite" element={<OrganisationCite navigate={navigate} />} />
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

        {/* ── Espace CITE : une intention par écran ── */}
        <Route path="/espace-cite" element={
          <ProtectedRoute destination="espace-cite"><MonClub navigate={navigate} /></ProtectedRoute>
        } />
        <Route path="/espace-cite/adhesions" element={
          <ProtectedRoute destination="cite-adhesions"><Adhesions /></ProtectedRoute>
        } />
        <Route path="/espace-cite/activites" element={
          <ProtectedRoute destination="cite-activites"><Activites /></ProtectedRoute>
        } />
        <Route path="/espace-cite/rapports" element={
          <ProtectedRoute destination="cite-rapports"><Rapports /></ProtectedRoute>
        } />
        <Route path="/espace-cite/annuaire" element={
          <ProtectedRoute destination="cite-annuaire"><Annuaire /></ProtectedRoute>
        } />

        {/* ── Gouvernance de l'université ── */}
        <Route path="/gouvernance" element={
          <ProtectedRoute destination="gouvernance"><Attestations /></ProtectedRoute>
        } />
        <Route path="/gouvernance/attestations" element={
          <ProtectedRoute destination="gouvernance"><Attestations /></ProtectedRoute>
        } />
        <Route path="/gouvernance/exclusions" element={
          <ProtectedRoute destination="gouvernance-exclusions"><Exclusions /></ProtectedRoute>
        } />
        <Route path="/gouvernance/figures" element={
          <ProtectedRoute destination="gouvernance-figures"><Figures /></ProtectedRoute>
        } />

        {/* ── Trésorerie : l'outil interne, séparé de la page de dons ── */}
        <Route path="/tresorerie" element={
          <ProtectedRoute destination="tresorerie"><Tresorerie /></ProtectedRoute>
        } />

        {/* Chef de projet : deux droits reels qui n'avaient aucune interface. */}
        <Route path="/projets/taches" element={
          <ProtectedRoute destination="projet-taches"><Taches /></ProtectedRoute>
        } />
        <Route path="/candidatures" element={
          <ProtectedRoute destination="candidatures"><Candidatures /></ProtectedRoute>
        } />

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
      </Suspense>
    </AppLayout>
    </AuthGateProvider>
  )
}

export default App
