import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChefHat, LayoutDashboard, Loader2, User, Users } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_ROUTE_FOR_ROLE, useAuth, type AppRole } from "@/hooks/use-auth";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Choose your role · SoR" },
      { name: "description", content: "Pick your role to personalize your SoR workspace." },
      { property: "og:title", content: "Choose your role · SoR" },
      { property: "og:description", content: "Pick your role to personalize your SoR workspace." },
    ],
  }),
  component: Onboarding,
});

const roles: { id: AppRole; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "customer", label: "Customer", desc: "Browse menu, reserve, join the queue, track orders.", icon: User },
  { id: "staff", label: "Front-of-house", desc: "Floor map, tables, service tickets.", icon: Users },
  { id: "kitchen", label: "Kitchen", desc: "Kitchen display, prep timers, station routing.", icon: ChefHat },
  { id: "manager", label: "Manager", desc: "Full access to analytics, inventory, everything.", icon: LayoutDashboard },
];

function Onboarding() {
  const navigate = useNavigate();
  const { user, loading, refresh } = useAuth();
  const [selected, setSelected] = useState<AppRole | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth/login" });
  }, [loading, user, navigate]);

  const save = async () => {
    if (!user || !selected) return;
    setSaving(true);
    // Wipe any prior role then insert selected
    await supabase.from("user_roles").delete().eq("user_id", user.id);
    const { error: roleErr } = await supabase.from("user_roles").insert({ user_id: user.id, role: selected });
    if (roleErr) {
      setSaving(false);
      toast.error(roleErr.message);
      return;
    }
    // Ensure profile exists + mark onboarded
    const { error: profErr } = await supabase
      .from("profiles")
      .upsert({ id: user.id, onboarded: true }, { onConflict: "id" });
    setSaving(false);
    if (profErr) {
      toast.error(profErr.message);
      return;
    }
    toast.success("You're all set!");
    await refresh();
    navigate({ to: DEFAULT_ROUTE_FOR_ROLE[selected] });
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <Logo />
        <h1 className="mt-8 font-display text-3xl font-bold sm:text-4xl">Welcome to SoR</h1>
        <p className="mt-1 text-muted-foreground">Pick the role that fits you best. You can change this later.</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {roles.map((r) => {
            const active = selected === r.id;
            const Icon = r.icon;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelected(r.id)}
                className={`group rounded-2xl border p-5 text-left transition-all backdrop-blur-xl ${
                  active
                    ? "border-primary bg-primary/10 shadow-[0_0_0_1px_var(--primary),0_10px_40px_-16px_var(--primary)]"
                    : "border-border/60 bg-card/50 hover:border-primary/40 hover:bg-card/70"
                }`}
                aria-pressed={active}
              >
                <div className="flex items-center gap-3">
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${active ? "bg-brand-gradient text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="font-display text-lg font-semibold">{r.label}</div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.desc}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={save}
            disabled={!selected || saving}
            className="bg-brand-gradient text-primary-foreground shadow-warm hover:opacity-95"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
