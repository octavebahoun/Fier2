import { ChevronsUpDownIcon, UserIcon, Edit3Icon, LogOutIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { useAuth, getRolePresentation, getPostPresentation } from "@/context/AuthContext.jsx"

/**
 * NavUser — le menu du COMPTE, et rien d'autre.
 *
 * Il dupliquait auparavant l'intégralité du groupe « Gouvernance » de la barre
 * latérale, avec des libellés différents pour les mêmes pages, et deux entrées
 * distinctes qui menaient à la même destination (constats F09, F10).
 * La navigation vit dans la barre latérale ; ici, on gère son identité.
 */
export function NavUser({ user, navigate, handleLogout }) {
  const { isMobile } = useSidebar()
  const { identity, logout, can } = useAuth()

  const onLogout = handleLogout || logout
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "U"

  const rolePres = getRolePresentation(identity?.role)
  const postPres = getPostPresentation(identity?.universityPost || identity?.countryPost)

  const identityRow = (
    <>
      <Avatar className="chamfer-sm h-8 w-8 rounded-none border border-engine/30 bg-engine/15">
        <AvatarFallback className="rounded-none bg-transparent text-[12px] font-bold text-engine">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-display font-bold tracking-tight">
          {user?.firstName} {user?.lastName}
        </span>
        <span className="truncate font-mono text-[11px] text-muted-foreground">{user?.email}</span>
      </div>
    </>
  )

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="chamfer-sm cursor-pointer rounded-none border border-border-subtle hover:bg-bg-tertiary data-[state=open]:border-engine/25 data-[state=open]:bg-engine/10"
            >
              {identityRow}
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="chamfer w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-none"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex flex-col gap-2 px-1 py-1.5">
                <div className="flex items-center gap-2 text-left text-sm">{identityRow}</div>
                {/* Ce que la personne EST, et ce qu'elle ADMINISTRE — les deux
                    axes du modèle, affichés côte à côte. Le poste de
                    gouvernance n'apparaissait nulle part jusqu'ici. */}
                <div className="flex flex-wrap gap-1.5">
                  <span className={`border px-2 py-0.5 text-[11px] font-bold ${rolePres.badgeClassName}`}>
                    {rolePres.label}
                  </span>
                  {postPres && (
                    <span className={`border px-2 py-0.5 text-[11px] font-bold ${postPres.badgeClassName}`}>
                      {postPres.label}
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => navigate("profile", { researcherId: "me" })}
                className="cursor-pointer"
              >
                <UserIcon className="text-engine" />
                Mon profil
              </DropdownMenuItem>
              {can("profile:editOwn") && (
                <DropdownMenuItem
                  onClick={() => navigate("researcher-profile-edit")}
                  className="cursor-pointer"
                >
                  <Edit3Icon />
                  Modifier mon profil
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onLogout} className="cursor-pointer">
              <LogOutIcon />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
