import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_ROUTE_FOR_ROLE, type AppRole } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [
      { title: "Signing you in · SoR" },
      { name: "description", content: "Completing sign-in." },
      { property: "og:title", content: "Signing you in · SoR" },
      { property: "og:description", content: "Completing sign-in." },
    ],
  }),
  component: Callback,
});

function Callback() {
  const navigate = useNavigate();
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      // Wait briefly for onAuthStateChange to hydrate the session
      for (let i = 0; i < 20; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session) break;
        await new Promise((r) => setTimeout(r, 150));
      }
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) {
        if (!cancelled) navigate({ to: "/auth/login" });
        return;
      }
      const { data: prof } = await supabase.from("profiles").select("onboarded").eq("id", uid).maybeSingle();
      const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", uid).limit(1).maybeSingle();
      const role = roleRow?.role as AppRole | undefined;
      if (cancelled) return;
      if (!prof?.onboarded || !role) navigate({ to: "/onboarding" });
      else navigate({ to: DEFAULT_ROUTE_FOR_ROLE[role] });
    };
    void run();
    return () => { cancelled = true; };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      Signing you in…
    </div>
  );
}
