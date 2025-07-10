import { NavLink } from "react-router-dom";
import { 
  Beer, 
  Wine, 
  UtensilsCrossed, 
  SprayCan, 
  GraduationCap,
  BarChart3,
  Clock
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: BarChart3,
  },
  {
    title: "Beverages",
    url: "/beverages",
    icon: Beer,
    supplier: "Star Pubs-Heineken",
    deadline: "Thu 4pm",
  },
  {
    title: "Spirits & Wine",
    url: "/spirits",
    icon: Wine,
    supplier: "St Austell",
    deadline: "Sun 12pm",
  },
  {
    title: "Food Supplies",
    url: "/food",
    icon: UtensilsCrossed,
    supplier: "Salvo & Charles",
    deadline: "Sun 12pm",
  },
  {
    title: "Cleaning",
    url: "/cleaning",
    icon: SprayCan,
    supplier: "Cormack Commercial",
    deadline: "Flexible",
  },
  {
    title: "Masterclass",
    url: "/masterclass",
    icon: GraduationCap,
    supplier: "Internal",
    deadline: "As needed",
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className={collapsed ? "w-14" : "w-64"}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Smoke & Mirrors</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm leading-none mb-1">
                              {item.title}
                            </div>
                            {item.supplier && (
                              <div className="text-xs text-muted-foreground/70 truncate">
                                {item.supplier}
                              </div>
                            )}
                          </div>
                          {item.deadline && (item.deadline === "Thu 4pm" || item.deadline === "Sun 12pm") && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-orange-100 text-orange-800 border-orange-200">
                              {item.deadline}
                            </Badge>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}