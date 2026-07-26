import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Sun, Moon, PanelLeft, LogOut, User as UserIcon } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { NavHistory } from "@/components/common/NavHistory";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTheme } from "@/hooks/use-theme";
import { DEFAULT_ROUTE_FOR_ROLE, useAuth } from "@/hooks/use-auth";

const links = [
  { to: "/menu", label: "Menu" },
  { to: "/reservations", label: "Reserve" },
  { to: "/queue", label: "Queue" },
  { to: "/orders", label: "Track order" },
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

function initials(name?: string | null, email?: string | null) {
  const base = (name || email || "U").trim();
  const parts = base.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}

function MenuTrigger() {
  const [open, setOpen] = useState(false);
  const { user, role } = useAuth();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Open menu"
          className="h-9 w-9 shrink-0 rounded-md"
        >
          <PanelLeft className="h-4 w-4" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle>
            <Logo />
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              activeProps={{ className: "bg-accent text-accent-foreground font-medium" }}
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-2 h-px bg-border" />
          {user && role && role !== "customer" ? (
            <Link
              to={DEFAULT_ROUTE_FOR_ROLE[role]}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Go to dashboard
            </Link>
          ) : !user ? (
            <>
              <Link to="/auth/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                Sign in
              </Link>
              <Link to="/auth/signup" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                Create account
              </Link>
            </>
          ) : null}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function AccountArea() {
  const navigate = useNavigate();
  const { user, role, profile, signOut, loading } = useAuth();

  if (loading) {
    return <div className="h-9 w-9 animate-pulse rounded-full bg-muted" aria-hidden />;
  }

  if (!user) {
    return (
      <>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/auth/login">Sign in</Link>
        </Button>
        <Button size="sm" asChild className="bg-brand-gradient text-primary-foreground shadow-warm hover:opacity-95">
          <Link to="/auth/signup">Get started</Link>
        </Button>
      </>
    );
  }

  return (
    <>
      {role && role !== "customer" && (
        <Button size="sm" asChild className="bg-brand-gradient text-primary-foreground shadow-warm hover:opacity-95">
          <Link to={DEFAULT_ROUTE_FOR_ROLE[role]}>Dashboard</Link>
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button aria-label="Open profile menu" className="rounded-full outline-none ring-primary/40 focus-visible:ring-2">
            <Avatar className="h-9 w-9 ring-2 ring-primary/20">
              <AvatarFallback className="bg-brand-gradient text-primary-foreground">
                {initials(profile?.full_name, user.email)}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 backdrop-blur-2xl bg-card/80">
          <DropdownMenuLabel className="flex flex-col">
            <span className="truncate">{profile?.full_name || user.email}</span>
            <span className="text-xs font-normal text-muted-foreground capitalize">{role ?? "no role"}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/onboarding" className="flex w-full cursor-pointer items-center">
              <UserIcon className="mr-2 h-4 w-4" />
              Change role
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export function PublicShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { user, role, profile, loading } = useAuth();

  // Signed in but no role picked yet → send straight to role selection.
  useEffect(() => {
    if (loading || !user) return;
    if (!role || !profile?.onboarded) {
      navigate({ to: "/onboarding", replace: true });
    }
  }, [loading, user, role, profile?.onboarded, navigate]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-background/70 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4">
          <MenuTrigger />
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>
          <NavHistory />
          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                activeProps={{ className: "bg-accent text-accent-foreground font-medium" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <AccountArea />
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t bg-background/60">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center">
          <Logo />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SoR. Crafted for hospitality teams.
          </p>
        </div>
      </footer>
    </div>
  );
}
