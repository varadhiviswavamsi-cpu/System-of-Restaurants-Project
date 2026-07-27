import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset password · SoR" },
      { name: "description", content: "Reset your SoR password by email." },
      { property: "og:title", content: "Reset password · SoR" },
      { property: "og:description", content: "Reset your SoR password by email." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ForgotPassword,
});

const schema = z.object({ email: z.string().trim().email("Enter a valid email").max(255) });

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      setErr(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("Reset link sent — check your inbox.");
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center p-6">
      <Link
        to="/auth/login"
        className="absolute left-4 top-4 inline-flex h-10 items-center gap-2 rounded-full border border-white/50 bg-gradient-to-b from-white/40 to-white/5 px-3 text-sm font-medium text-foreground backdrop-blur-2xl hover:shadow-[0_0_22px_-2px_rgba(255,255,255,0.75)] dark:border-white/20 dark:from-white/15 dark:to-white/5"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <div className="w-full max-w-sm">
        <Logo />
        <h1 className="mt-8 font-display text-3xl font-bold">Forgot password?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we'll send a link to reset it.
        </p>
        {sent ? (
          <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
            If an account exists for <span className="font-medium">{email}</span>, you'll get a reset link shortly.
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={submit} noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@restaurant.com" required />
              {err && <p className="text-xs text-destructive">{err}</p>}
            </div>
            <Button type="submit" disabled={loading}
              className="w-full bg-brand-gradient text-primary-foreground shadow-warm hover:opacity-95">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Send reset link
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
