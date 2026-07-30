import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Callback,
});

function Callback() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        // Wait briefly for Supabase to have set the session
        for (let i = 0; i < 20; i++) {
          const { data } = await supabase.auth.getSession();
          if (data.session) break;
          await new Promise((r) => setTimeout(r, 150));
        }

        const { data: userData } = await supabase.auth.getUser();
        const uid = userData.user?.id;
        if (!uid) {
          // Could be a failure in the redirect/resume flow
          if (!cancelled) {
            setErrorMessage('Sign-in failed or was cancelled. Please try signing in again.');
            // Give the user a chance to read the message then return to login
            setTimeout(() => navigate({ to: '/auth/login' }), 2000);
          }
          return;
        }

        const { data: prof } = await supabase.from("profiles").select("onboarded").eq("id", uid).maybeSingle();
        const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", uid).limit(1).maybeSingle();
        const role = roleRow?.role as AppRole | undefined;
        if (cancelled) return;
        if (!prof?.onboarded || !role) navigate({ to: "/onboarding" });
        else navigate({ to: DEFAULT_ROUTE_FOR_ROLE[role] });
      } catch (e) {
        console.error('Error completing sign-in callback', e);
        setErrorMessage('An unexpected error occurred while signing in.');
        setTimeout(() => navigate({ to: '/auth/login' }), 3000);
      }
    };
    void run();
    return () => { cancelled = true; };
  }, [navigate]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 text-muted-foreground p-4">
      <Loader2 className="h-5 w-5 animate-spin" />
      <div>{errorMessage ?? 'Signing you in…'}</div>
    </div>
  );
}
