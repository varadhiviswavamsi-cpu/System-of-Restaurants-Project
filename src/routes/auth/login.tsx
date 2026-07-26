import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { enterSudo } from "@/lib/sudo";

export const Route = createFileRoute("/auth/login")({
  head: () => ({
    meta: [
      { title: "Sign in · RestaurantOS" },
      { name: "description", content: "Sign in to your RestaurantOS workspace." },
      { property: "og:title", content: "Sign in · RestaurantOS" },
      { property: "og:description", content: "Sign in to your RestaurantOS workspace." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <Link
        to="/"
        aria-label="Back to home"
        className="absolute left-4 top-4 z-20 inline-flex h-10 items-center gap-2 rounded-full border border-white/50 bg-gradient-to-b from-white/40 to-white/5 px-3 text-sm font-medium text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65),0_8px_28px_-14px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all hover:shadow-[0_0_0_1px_rgba(255,255,255,0.75),0_0_22px_-2px_rgba(255,255,255,0.75)] active:scale-95 dark:border-white/20 dark:from-white/15 dark:to-white/5"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <div className="hidden bg-brand-gradient p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <Logo />
        <div>
          <h2 className="font-display text-4xl font-bold leading-tight">
            Welcome back. Your team is ready.
          </h2>
          <p className="mt-3 max-w-md opacity-90">
            One warm workspace for reservations, floor, kitchen, and inventory.
          </p>
        </div>
        <div className="text-sm opacity-80">© {new Date().getFullYear()} RestaurantOS</div>
      </div>
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <Logo />
          </div>
          <h1 className="mt-8 font-display text-3xl font-bold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter your credentials to continue.</p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              enterSudo();
              navigate({ to: "/dashboard/manager" });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@restaurant.com" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full bg-brand-gradient text-primary-foreground shadow-warm hover:opacity-95">
              Sign in
            </Button>
          </form>
          <p className="mt-6 text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/auth/signup" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
