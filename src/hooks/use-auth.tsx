import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "customer" | "staff" | "kitchen" | "manager";

export type Profile = {
  id: string;
  full_name: string | null;
  restaurant_name: string | null;
  avatar_url: string | null;
  onboarded: boolean;
};

type AuthState = {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  profile: Profile | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export const DEFAULT_ROUTE_FOR_ROLE: Record<AppRole, string> = {
  customer: "/",
  staff: "/dashboard/staff",
  kitchen: "/dashboard/kitchen",
  manager: "/dashboard/manager",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async (uid: string) => {
    // Fetch role
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setRole((roleRow?.role as AppRole) ?? null);

    // Fetch profile
    const { data: prof } = await supabase
      .from("profiles")
      .select("id, full_name, restaurant_name, avatar_url, onboarded")
      .eq("id", uid)
      .maybeSingle();
    setProfile((prof as Profile) ?? null);
  };

  useEffect(() => {
    // Register listener FIRST so we don't miss events
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (sess?.user) {
        // Defer db call to avoid deadlock inside callback
        setTimeout(() => void loadUserData(sess.user.id), 0);
      } else {
        setRole(null);
        setProfile(null);
      }
    });

    // Then hydrate current session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        void loadUserData(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const refresh = async () => {
    if (session?.user) await loadUserData(session.user.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setRole(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, role, profile, loading, refresh, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

/** Which dashboards a role is allowed to access. Manager = all. */
export function canAccessDashboardPath(role: AppRole | null, path: string): boolean {
  if (!role) return false;
  if (role === "manager") return true;
  if (role === "staff") return path.startsWith("/dashboard/staff");
  if (role === "kitchen") return path.startsWith("/dashboard/kitchen");
  return false; // customer
}
