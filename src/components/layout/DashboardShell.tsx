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
  Sparkles,
  Sun,
  Moon,
  LogOut,
  Loader2,
  User as UserIcon,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/use-theme";
import { canAccessDashboardPath, DEFAULT_ROUTE_FOR_ROLE, useAuth, type AppRole } from "@/hooks/use-auth";

type NavItem = { title: string; url: string; icon: React.ComponentType<{ className?: string }>; roles?: AppRole[] };
type NavGroup = { label: string; items: NavItem[] };

const nav: NavGroup[] = [
  {
    label: "Management",
    items: [
      { title: "Manager", url: "/dashboard/manager", icon: LayoutDashboard, roles: ["manager"] },
      { title: "AI Insights", url: "/dashboard/ai-insights", icon: Sparkles, roles: ["manager"] },
      { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3, roles: ["manager"] },
      { title: "Inventory", url: "/dashboard/inventory", icon: Package, roles: ["manager"] },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Staff floor", url: "/dashboard/staff", icon: Users, roles: ["manager", "staff"] },
      { title: "Kitchen", url: "/dashboard/kitchen", icon: ChefHat, roles: ["manager", "kitchen"] },
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

function AppSidebar({ role }: { role: AppRole }) {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b p-3">
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={currentPath === "/menu"}>
                  <Link to="/menu">
                    <Home />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {nav.map((group) => {
          const items = group.items.filter((i) => !i.roles || i.roles.includes(role));
          if (items.length === 0) return null;
          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
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
          );
        })}
      </SidebarContent>

    </Sidebar>
  );
}

function initials(name?: string | null, email?: string | null) {
  const base = (name || email || "U").trim();
  const parts = base.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
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
  const navigate = useNavigate();
  const { user, role, profile, loading, signOut } = useAuth();
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const isDashboardRoute = currentPath.startsWith("/dashboard");

  // Gate: must be signed in
  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth/login" });
      return;
    }
    if (!role) {
      navigate({ to: "/onboarding" });
      return;
    }
    if (isDashboardRoute && !canAccessDashboardPath(role, currentPath)) {
      navigate({ to: DEFAULT_ROUTE_FOR_ROLE[role] });
    }
  }, [loading, user, role, currentPath, isDashboardRoute, navigate]);

  if (loading || !user || !role || (isDashboardRoute && !canAccessDashboardPath(role, currentPath))) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading…
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const displayName = profile?.full_name || user.email || "";

  return (
    <SidebarProvider>
      <div className="flex min-h-dvh w-full max-w-full overflow-x-hidden">
        <AppSidebar role={role} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur sm:gap-3 sm:px-4">
            <SidebarTrigger className="shrink-0" />
            <div className="hidden sm:block">
              <NavHistory />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-display text-base font-semibold sm:text-lg">{title}</div>
              {subtitle && <div className="hidden truncate text-xs text-muted-foreground sm:block">{subtitle}</div>}
            </div>
            <div className="hidden shrink-0 items-center gap-2 lg:flex">{actions}</div>
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: "/menu" })}
              className="hidden shrink-0 xl:inline-flex"
              aria-label="Return to customer view"
            >
              Customer's view
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Open profile menu"
                  className="rounded-full outline-none ring-primary/40 focus-visible:ring-2"
                >
                  <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-brand-gradient text-primary-foreground">
                      {initials(profile?.full_name, user.email)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 backdrop-blur-2xl bg-card/80">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="truncate">{displayName}</span>
                  <span className="text-xs font-normal text-muted-foreground capitalize">{role}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/onboarding" className="flex w-full cursor-pointer items-center">
                    <UserIcon className="mr-2 h-4 w-4" />
                    Change role
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          {actions && (
            <div className="flex w-full min-w-0 flex-wrap items-center gap-2 border-b bg-background/60 px-3 py-2 lg:hidden">
              {actions}
            </div>
          )}
          <main className="w-full min-w-0 flex-1 overflow-x-hidden p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="mx-auto w-full min-w-0 max-w-7xl space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
