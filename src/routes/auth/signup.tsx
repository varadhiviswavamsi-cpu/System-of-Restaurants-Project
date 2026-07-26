import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { enterSudo } from "@/lib/sudo";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({
    meta: [
      { title: "Create account · SoR" },
      { name: "description", content: "Start your SoR workspace in minutes." },
      { property: "og:title", content: "Create account · SoR" },
      { property: "og:description", content: "Start your SoR workspace in minutes." },
    ],
  }),
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <Link
        to="/auth/login"
        aria-label="Back to sign in"
        className="absolute left-4 top-4 z-20 inline-flex h-10 items-center gap-2 rounded-full border border-white/50 bg-gradient-to-b from-white/40 to-white/5 px-3 text-sm font-medium text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65),0_8px_28px_-14px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all hover:shadow-[0_0_0_1px_rgba(255,255,255,0.75),0_0_22px_-2px_rgba(255,255,255,0.75)] active:scale-95 dark:border-white/20 dark:from-white/15 dark:to-white/5"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <Logo />
          <h1 className="mt-8 font-display text-3xl font-bold">Create your workspace</h1>
          <p className="mt-1 text-sm text-muted-foreground">Free 14-day trial. No card required.</p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              enterSudo();
              navigate({ to: "/dashboard/manager" });
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" placeholder="Alex Rivera" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rest">Restaurant name</Label>
              <Input id="rest" placeholder="Trattoria Sole" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Your role</Label>
              <Select defaultValue="manager">
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager / Owner</SelectItem>
                  <SelectItem value="staff">Front-of-house staff</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" placeholder="you@restaurant.com" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="At least 8 characters" required />
            </div>
            <Button type="submit" className="w-full bg-brand-gradient text-primary-foreground shadow-warm hover:opacity-95">
              Create workspace
            </Button>
          </form>
          <p className="mt-6 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/auth/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden bg-brand-gradient p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="ml-auto text-sm opacity-80">One workspace · four roles</div>
        <div>
          <h2 className="font-display text-4xl font-bold leading-tight">
            Warm hospitality, powered by clarity.
          </h2>
          <p className="mt-3 max-w-md opacity-90">
            Give every seat, ticket, and pantry item a home. Your team stays calm; guests feel it.
          </p>
        </div>
        <div className="text-sm opacity-80">© {new Date().getFullYear()} SoR</div>
      </div>
    </div>
  );
}
