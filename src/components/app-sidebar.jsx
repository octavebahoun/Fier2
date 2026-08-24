import { useMemo } from "react"
import {
  LayoutDashboard, UserRound, FolderGit2, Users, GraduationCap, Briefcase,
  Newspaper, CalendarDays, Contact, Shield, Trophy, HeartHandshake, ShieldCheck,
  LayoutList, LifeBuoy, Sparkles, Layers, Compass,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import Logo from "@/components/Logo.jsx"
import { useAuth } from "@/context/AuthContext.jsx"
import {
  DESTINATIONS,
  SECTIONS,
  SECTION_ORDER,
  navAccessOf,
} from "@/navigation/destinations.js"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail,
} from "@/components/ui/sidebar"

/** Les icônes nommées par le registre. */
const ICONS = {
  LayoutDashboard, UserRound, FolderGit2, Users, GraduationCap, Briefcase,
  Newspaper, CalendarDays, Contact, Shield, Trophy, HeartHandshake, ShieldCheck,
  LayoutList, LifeBuoy, Layers, Compass,
}

const SECTION_ICONS = {
  espace: Sparkles,
  gouvernance: Shield,
  recherche: Layers,
  communaute: Users,
  support: LifeBuoy,
}

const SECTION_BY_ID = Object.fromEntries(Object.values(SECTIONS).map((s) => [s.id, s]))

/**
 * AppSidebar — la navigation de l'espace connecté.
 *
 * Elle ne décide plus rien : elle parcourt le registre des destinations et
 * demande `can()` pour chacune. Le lien s'affiche exactement quand la route
 * l'ouvrira, puisque les deux lisent la même règle (constats F04, F08).
 */
export function AppSidebar({ currentPage, navigate, user, handleLogout, ...props }) {
  const { can } = useAuth()

  const groups = useMemo(() => {
    const visible = DESTINATIONS.filter((dest) => {
      if (!dest.inNav) return false
      const access = navAccessOf(dest.id)
      if (access === "public") return true
      const required = access?.anyOf ?? (access?.capability ? [access.capability] : [])
      return required.length === 0 || required.some((cap) => can(cap))
    })

    return SECTION_ORDER
      .map((sectionId) => {
        const items = visible
          .filter((d) => d.section === sectionId)
          .map((d) => ({
            id: d.id,
            label: d.label,
            icon: ICONS[d.icon] || Compass,
            params: d.navParams || {},
          }))
        return {
          id: sectionId,
          label: SECTION_BY_ID[sectionId]?.label || sectionId,
          icon: SECTION_ICONS[sectionId] || Compass,
          items,
        }
      })
      .filter((g) => g.items.length > 0)
  }, [can])

  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={() => navigate("dashboard")}
              className="chamfer-sm cursor-pointer rounded-none border border-transparent hover:bg-bg-tertiary"
            >
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
        <NavUser user={user} navigate={navigate} handleLogout={handleLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
