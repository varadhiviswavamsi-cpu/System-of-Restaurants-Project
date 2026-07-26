import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { DEFAULT_ROUTE_FOR_ROLE, type AppRole } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth/login")({
  head: () => ({
    meta: [
      { title: "Sign in · SoR" },
      { name: "description", content: "Sign in to your SoR workspace." },
      { property: "og:title", content: "Sign in · SoR" },
      { property: "og:description", content: "Sign in to your SoR workspace." },
    ],
  }),
  component: Login,
});

const schema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email" }).max(255),
  password: z.string().min(1, { message: "Password is required" }).max(128),
});

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.31 0-6-2.74-6-6.1s2.69-6.1 6-6.1c1.88 0 3.14.8 3.86 1.49l2.63-2.54C16.9 3.35 14.7 2.4 12 2.4 6.98 2.4 2.9 6.48 2.9 11.5S6.98 20.6 12 20.6c6.93 0 9.1-4.86 9.1-7.4 0-.5-.05-.88-.13-1.26H12z"/>
    </svg>
  );
}

async function routeAfterLogin(navigate: ReturnType<typeof useNavigate>) {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return;
  const { data: prof } = await supabase.from("profiles").select("onboarded").eq("id", uid).maybeSingle();
  const { data: roleRow } = await supabase
    .from("user_roles").select("role").eq("user_id", uid).limit(1).maybeSingle();
  const role = roleRow?.role as AppRole | undefined;
  if (!prof?.onboarded || !role) {
    navigate({ to: "/onboarding" });
  } else {
    navigate({ to: DEFAULT_ROUTE_FOR_ROLE[role] });
  }
}

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      const fe: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof typeof errors;
        fe[key] = issue.message;
      }
      setErrors(fe);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message.includes("Invalid") ? "Invalid email or password." : error.message);
      return;
    }
    toast.success("Welcome back!");
    await routeAfterLogin(navigate);
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
    // Popup flow — session already set
    setGoogleLoading(false);
    await routeAfterLogin(navigate);
  };

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
          <h2 className="font-display text-4xl font-bold leading-tight">Welcome back. Your team is ready.</h2>
          <p className="mt-3 max-w-md opacity-90">
            One warm workspace for reservations, floor, kitchen, and inventory.
          </p>
        </div>
        <div className="text-sm opacity-80">© {new Date().getFullYear()} SoR</div>
      </div>
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden"><Logo /></div>
          <h1 className="mt-8 font-display text-3xl font-bold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter your credentials to continue.</p>

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
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@restaurant.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email} required />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/auth/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot?
                </Link>
              </div>
              <Input id="password" type="password" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password} required />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-gradient text-primary-foreground shadow-warm hover:opacity-95"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
