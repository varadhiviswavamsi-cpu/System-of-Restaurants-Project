import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/menu", label: "Menu" },
  { to: "/reservations", label: "Reserve" },
  { to: "/queue", label: "Queue" },
  { to: "/orders", label: "Track order" },
];

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-background/70 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4">
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>
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
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild className="bg-brand-gradient text-primary-foreground shadow-warm hover:opacity-95">
              <Link to="/dashboard/manager">Open app</Link>
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
