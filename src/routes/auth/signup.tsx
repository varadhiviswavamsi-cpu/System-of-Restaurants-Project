import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { DEFAULT_ROUTE_FOR_ROLE, useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({
    meta: [
      { title: "Create account · SoR" },
      { name: "description", content: "Start your SoR workspace in minutes." },
      { property: "og:title", content: "Create account · SoR" },
      { property: "og:description", content: "Start your SoR workspace in minutes." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Signup,
});

const schema = z.object({
  fullName: z.string().trim().min(1, "Enter your name").max(100),
  restaurantName: z.string().trim().min(1, "Enter your restaurant name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .max(128)
    .regex(/[A-Za-z]/, "Include at least one letter")
    .regex(/\d/, "Include at least one number"),
});

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.31 0-6-2.74-6-6.1s2.69-6.1 6-6.1c1.88 0 3.14.8 3.86 1.49l2.63-2.54C16.9 3.35 14.7 2.4 12 2.4 6.98 2.4 2.9 6.48 2.9 11.5S6.98 20.6 12 20.6c6.93 0 9.1-4.86 9.1-7.4 0-.5-.05-.88-.13-1.26H12z"/>
    </svg>
  );
}

function Signup() {
  const navigate = useNavigate();
  const { user, role, profile, loading: authLoading } = useAuth();

  // Already signed in → skip the signup form.
  useEffect(() => {
    if (authLoading || !user) return;
    if (!role || !profile?.onboarded) navigate({ to: "/onboarding", replace: true });
    else navigate({ to: DEFAULT_ROUTE_FOR_ROLE[role], replace: true });
  }, [authLoading, user, role, profile?.onboarded, navigate]);

  const [fullName, setFullName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const parsed = schema.safeParse({ fullName, restaurantName, email, password });
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.error.issues) fe[issue.path[0] as string] = issue.message;
      setErrors(fe);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: parsed.data.fullName,
          restaurant_name: parsed.data.restaurantName,
        },
      },
    });
    setLoading(false);
    if (error) {
      if (error.message.toLowerCase().includes("registered")) {
        toast.error("This email is already registered. Try signing in.");
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success("Account created — let's set up your role.");
    navigate({ to: "/onboarding" });
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth/callback",
    });
    if (result.error) {
      setGoogleLoading(false);
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/onboarding" });
  };

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

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="mt-6 w-full gap-2"
          >
            {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </Button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Rivera" required />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rest">Restaurant name</Label>
              <Input id="rest" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)}
                placeholder="Trattoria Sole" required />
              {errors.restaurantName && <p className="text-xs text-destructive">{errors.restaurantName}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@restaurant.com" required />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="8+ chars, letters & numbers" required />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            <Button type="submit" disabled={loading}
              className="w-full bg-brand-gradient text-primary-foreground shadow-warm hover:opacity-95">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create workspace
            </Button>
          </form>
          <p className="mt-6 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/auth/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
      <div className="hidden bg-brand-gradient p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="ml-auto text-sm opacity-80">One workspace · four roles</div>
        <div>
          <h2 className="font-display text-4xl font-bold leading-tight">Warm hospitality, powered by clarity.</h2>
          <p className="mt-3 max-w-md opacity-90">
            Give every seat, ticket, and pantry item a home. Your team stays calm; guests feel it.
          </p>
        </div>
        <div className="text-sm opacity-80">© {new Date().getFullYear()} SoR</div>
      </div>
    </div>
  );
}
