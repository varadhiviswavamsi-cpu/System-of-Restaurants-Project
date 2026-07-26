import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ChefHat,
  Users,
  Package,
  BarChart3,
  UtensilsCrossed,
  CalendarClock,
  Clock,
  ClipboardList,
  Home,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { NavHistory } from "@/components/common/NavHistory";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/hooks/use-theme";

const nav = [
  {
    label: "Management",
    items: [
      { title: "Manager", url: "/dashboard/manager", icon: LayoutDashboard },
      { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
      { title: "Inventory", url: "/dashboard/inventory", icon: Package },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Staff floor", url: "/dashboard/staff", icon: Users },
      { title: "Kitchen", url: "/dashboard/kitchen", icon: ChefHat },
    ],
  },
  {
    label: "Guest experience",
    items: [
      { title: "Menu", url: "/menu", icon: UtensilsCrossed },
      { title: "Reservations", url: "/reservations", icon: CalendarClock },
      { title: "Queue", url: "/queue", icon: Clock },
      { title: "Order tracking", url: "/orders", icon: ClipboardList },
    ],
  },
];

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="h-9 w-9 shrink-0 rounded-full border-border/70 bg-background/80 backdrop-blur-sm hover:bg-accent"
    >
      {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  );
}

function AppSidebar() {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b p-3">
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        {nav.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={currentPath === item.url}>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/">
                    <Home />
                    <span>Landing</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function DashboardShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <NavHistory />
            <div className="min-w-0 flex-1">
              <div className="truncate font-display text-lg font-semibold">{title}</div>
              {subtitle && <div className="truncate text-xs text-muted-foreground">{subtitle}</div>}
            </div>
            <div className="hidden items-center gap-2 sm:flex">{actions}</div>
            <ThemeToggle />
            <Button variant="outline" size="sm" asChild className="hidden md:inline-flex">
              <Link to="/auth/login">Sign in</Link>
            </Button>
            <Avatar className="h-9 w-9 ring-2 ring-primary/20">
              <AvatarFallback className="bg-brand-gradient text-primary-foreground">RO</AvatarFallback>
            </Avatar>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
