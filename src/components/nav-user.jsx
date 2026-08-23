import {
  ChevronsUpDownIcon,
  UserIcon,
  Edit3Icon,
  LayoutListIcon,
  HeartHandshakeIcon,
  ShieldCheckIcon,
  ShieldIcon,
  LogOutIcon,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/context/AuthContext.jsx"

export function NavUser({ user, navigate, handleLogout }) {
  const { isMobile } = useSidebar()
  const { can, isAnyClubResponsible, isChefUniversitaire, isTreasurer, isSecretary, logout } = useAuth()

  const onLogout = handleLogout || logout
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "U"

  const userRole = user?.role?.toUpperCase() || "ETUDIANT"
  const isResponsable = isAnyClubResponsible?.() || userRole === "RESPONSABLE"
  const isAdminUser = can("admin:access")
  const isChef = isChefUniversitaire?.()
  const isTreas = isTreasurer?.()
  const isSec = isSecretary?.()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="chamfer-sm cursor-pointer rounded-none border border-border-subtle hover:bg-bg-tertiary data-[state=open]:border-engine/25 data-[state=open]:bg-engine/10"
            >
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
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
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
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate("profile", { researcherId: "me" })} className="cursor-pointer">
                <UserIcon className="text-engine" />
                Mon Profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("profile", { researcherId: "me" })} className="cursor-pointer">
                <Edit3Icon />
                Éditer mes informations
              </DropdownMenuItem>
              {(isResponsable || isSec) && (
                <DropdownMenuItem onClick={() => navigate("espace-cite")} className="cursor-pointer">
                  <LayoutListIcon />
                  Mon Espace CITE (Rapports & Club)
                </DropdownMenuItem>
              )}
              {(isResponsable || isTreas || isSec || isChef || isAdminUser) && (
                <DropdownMenuItem onClick={() => navigate("soutiens")} className="cursor-pointer">
                  <HeartHandshakeIcon className="text-ember" />
                  Soutiens & Trésorerie
                </DropdownMenuItem>
              )}
              {(isAdminUser || isChef) && (
                <DropdownMenuItem onClick={() => navigate("gouvernance")} className="cursor-pointer">
                  <ShieldCheckIcon />
                  Gouvernance & Validation
                </DropdownMenuItem>
              )}
              {isAdminUser && (
                <DropdownMenuItem onClick={() => navigate("admin")} className="cursor-pointer">
                  <ShieldIcon />
                  Console d'Administration
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
  );
}
