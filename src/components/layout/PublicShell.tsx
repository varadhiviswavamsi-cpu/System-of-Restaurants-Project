import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Sun, Moon, PanelLeft } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { NavHistory } from "@/components/common/NavHistory";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTheme } from "@/hooks/use-theme";
import { enterSudo } from "@/lib/sudo";

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

function MenuTrigger() {
  const [open, setOpen] = useState(false);
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
          <Link
            to="/auth/login"
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Sign in
          </Link>
          <Link
            to="/dashboard/manager"
            onClick={() => { enterSudo(); setOpen(false); }}
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Enter Sudo
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export function PublicShell({ children }: { children: ReactNode }) {
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
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild className="bg-brand-gradient text-primary-foreground shadow-warm hover:opacity-95">
              <Link to="/dashboard/manager" onClick={() => enterSudo()}>Enter Sudo</Link>
            </Button>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t bg-background/60">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center">
          <Logo />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} RestaurantOS. Crafted for hospitality teams.
          </p>
        </div>
      </footer>
    </div>
  );
}
