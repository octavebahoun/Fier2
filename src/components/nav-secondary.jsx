import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({ items, currentPage, navigate, ...props }) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                size="sm"
                isActive={currentPage === item.id}
                onClick={() => navigate(item.id)}
                className="chamfer-sm cursor-pointer rounded-none border border-transparent data-active:border-engine/25 data-active:bg-engine/10 data-active:text-engine hover:bg-bg-tertiary"
              >
                <item.icon className={currentPage === item.id ? "text-engine" : "text-text-muted"} />
                <span className="truncate">{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
