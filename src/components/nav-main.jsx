import { useEffect, useState } from "react"
import { ChevronRightIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { getDestination } from "@/navigation/destinations.js"

// L'état actif suit la chaîne `parent` du registre : une page de détail
// éclaire son entrée de menu parente, et rien d'autre. Auparavant une table
// écrite à la main faisait briller « Tableau de bord » sur le portail
// étudiant — la navigation mentait sur la position (constat F13).
function isPageActive(id, currentPage) {
  if (currentPage === id) return true
  let cursor = getDestination(currentPage)
  const seen = new Set()
  while (cursor?.parent && !seen.has(cursor.id)) {
    seen.add(cursor.id)
    if (cursor.parent === id) return true
    cursor = getDestination(cursor.parent)
  }
  return false
}

export function NavMain({ groups, currentPage, navigate }) {
  // Un groupe s'ouvre automatiquement quand il contient la page active ;
  // l'utilisateur peut ensuite ouvrir/fermer librement chaque groupe.
  // Ouverts par défaut. La navigation primaire d'un back-office se lit, elle
  // ne se déplie pas : un étudiant avait six destinations réparties dans trois
  // accordéons fermés, soit deux clics pour atteindre n'importe quoi (F12).
  const [openGroups, setOpenGroups] = useState(() =>
    Object.fromEntries(groups.map((g) => [g.id, true]))
  )

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev }
      let changed = false
      groups.forEach((g) => {
        if (g.items.some((i) => isPageActive(i.id, currentPage)) && !next[g.id]) {
          next[g.id] = true
          changed = true
        }
      })
      return changed ? next : prev
    })
  }, [currentPage, groups])

  return (
    <SidebarGroup>
      <SidebarMenu>
        {groups.map((group) => {
          const hasActiveChild = group.items.some((i) => isPageActive(i.id, currentPage))
          const isOpen = !!openGroups[group.id]

          return (
            <Collapsible
              key={group.id}
              open={isOpen}
              onOpenChange={(open) => setOpenGroups((prev) => ({ ...prev, [group.id]: open }))}
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={group.label}
                    isActive={hasActiveChild}
                    className="chamfer-sm cursor-pointer rounded-none border border-transparent data-active:border-engine/25 data-active:bg-engine-wash data-active:text-engine hover:bg-bg-tertiary"
                  >
                    <group.icon className={hasActiveChild ? "text-engine" : "text-text-muted"} />
                    <span className="truncate text-sm font-semibold">{group.label}</span>
                    <ChevronRightIcon
                      className={`ml-auto shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="border-l-0 pl-0">
                    {group.items.map((item) => {
                      const active = isPageActive(item.id, currentPage)
                      return (
                        <SidebarMenuSubItem key={item.id}>
                          <SidebarMenuSubButton
                            isActive={active}
                            onClick={() => navigate(item.id, item.params || {})}
                            className="chamfer-sm relative cursor-pointer rounded-none border border-transparent pl-3 data-active:border-engine/25 data-active:bg-engine-wash data-active:font-semibold hover:bg-bg-tertiary"
                          >
                            {active && (
                              <span
                                className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 bg-engine"
                                aria-hidden="true"
                              />
                            )}
                            <item.icon className={active ? "text-engine" : "text-text-muted"} />
                            <span className="truncate">{item.label}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
