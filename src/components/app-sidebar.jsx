import { useMemo } from "react"
import {
  LayoutDashboard,
  UserRound,
  FolderGit2,
  Users,
  GraduationCap,
  Briefcase,
  Newspaper,
  CalendarDays,
  Contact,
  Shield,
  Trophy,
  HeartHandshake,
  ShieldCheck,
  LayoutList,
  LifeBuoy,
  Sparkles,
  Layers,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import Logo from "@/components/Logo.jsx"
import { useAuth } from "@/context/AuthContext.jsx"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const SECONDARY_ITEMS = [
  { id: "contact", label: "Aide & Contact", icon: LifeBuoy },
]

export function AppSidebar({ currentPage, navigate, user, handleLogout, ...props }) {
  const { can, hasMinRole, isAnyClubResponsible, isChefUniversitaire, isTreasurer, isSecretary } = useAuth()

  const groups = useMemo(() => {
    const userRole = user?.role?.toUpperCase() || "ETUDIANT"
    const isResponsable = isAnyClubResponsible?.() || userRole === "RESPONSABLE"
    const isChercheur = hasMinRole("CHERCHEUR")
    const isAdminUser = can("admin:access")
    const canManageGouvernance = isAdminUser || isChefUniversitaire?.()
    const isSecr = isSecretary?.()

    return [
      {
        id: "Personnel",
        label: "Mon Espace",
        icon: Sparkles,
        items: [
          { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, show: true },
          { id: "profile", label: "Mon profil", icon: UserRound, params: { researcherId: "me" }, show: isChercheur },
        ],
      },
      {
        id: "Gouvernance",
        label: "Gouvernance & Secrétariat",
        icon: Shield,
        items: [
          { id: "gouvernance", label: "Attestations", icon: ShieldCheck, show: canManageGouvernance },
          { id: "espace-cite", label: "Rapports CITE", icon: LayoutList, show: isResponsable || isSecr || isAdminUser },
          { id: "soutiens", label: "Trésorerie", icon: HeartHandshake, show: isResponsable || isTreasurer?.() || isSecr || isAdminUser },
          { id: "admin", label: "Console admin", icon: Shield, show: isAdminUser },
        ],
      },
      {
        id: "Recherche",
        label: "Recherche & R&D",
        icon: Layers,
        items: [
          { id: "projects", label: "Projets R&D", icon: FolderGit2, show: isChercheur },
          { id: "workshops", label: "Formations", icon: GraduationCap, show: true },
          { id: "opportunities", label: "Opportunités", icon: Briefcase, show: isChercheur },
          { id: "clubs", label: "Clubs CITE", icon: Users, show: true },
        ],
      },
      {
        id: "Communauté",
        label: "Communauté & Réseau",
        icon: Users,
        items: [
          { id: "news", label: "Actualités", icon: Newspaper, show: true },
          { id: "events", label: "Événements", icon: CalendarDays, show: true },
          { id: "challenges", label: "Challenges", icon: Trophy, show: isChercheur },
          { id: "researchers", label: "Annuaire", icon: Contact, show: true },
        ],
      },
    ]
      .map((g) => ({ ...g, items: g.items.filter((i) => i.show) }))
      .filter((g) => g.items.length > 0)
  }, [can, hasMinRole, user, isAnyClubResponsible, isChefUniversitaire, isTreasurer, isSecretary])

  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" onClick={() => navigate("dashboard")} className="chamfer-sm cursor-pointer rounded-none border border-transparent hover:bg-bg-tertiary">
              <Logo className="h-5 shrink-0" />
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-display font-extrabold tracking-tight">FIERI Hub</span>
                <span className="eyebrow truncate">Espace connecté</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={groups} currentPage={currentPage} navigate={navigate} />
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary items={SECONDARY_ITEMS} currentPage={currentPage} navigate={navigate} className="mt-auto" />
        <NavUser user={user} navigate={navigate} handleLogout={handleLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
