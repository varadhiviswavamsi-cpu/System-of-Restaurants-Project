import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/reset-password")({
  head: () => ({
    meta: [
      { title: "Set new password · SoR" },
      { name: "description", content: "Choose a new password for your SoR account." },
      { property: "og:title", content: "Set new password · SoR" },
      { property: "og:description", content: "Choose a new password for your SoR account." },
    ],
  }),
  component: ResetPassword,
});

const schema = z.object({
  password: z.string().min(8, "At least 8 characters").regex(/[A-Za-z]/, "Include a letter").regex(/\d/, "Include a number"),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: "Passwords must match", path: ["confirm"] });

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const parsed = schema.safeParse({ password, confirm });
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.error.issues) fe[issue.path[0] as string] = issue.message;
      setErrors(fe);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated. You're signed in.");
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Logo />
        <h1 className="mt-8 font-display text-3xl font-bold">Set a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">Use at least 8 characters with letters and numbers.</p>
        <form className="mt-6 space-y-4" onSubmit={submit} noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
          </div>
          <Button type="submit" disabled={loading}
            className="w-full bg-brand-gradient text-primary-foreground shadow-warm hover:opacity-95">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Update password
          </Button>
        </form>
      </div>
    </div>
  );
}
