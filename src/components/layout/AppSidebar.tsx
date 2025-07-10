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
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{item.title}</div>
                          {item.supplier && (
                            <div className="text-xs opacity-70 truncate">
                              {item.supplier}
                            </div>
                          )}
                        </div>
                      )}
                      {!collapsed && item.deadline && item.deadline !== "Flexible" && item.deadline !== "As needed" && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {item.deadline}
                        </Badge>
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