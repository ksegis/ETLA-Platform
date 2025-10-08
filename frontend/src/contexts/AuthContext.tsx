"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { User, Session, AuthError, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { setServiceAuthContext } from "@/utils/serviceAuth";
import { ROLES } from "@/lib/rbac"; // Import ROLES

interface Tenant {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

interface TenantUser {
  id: string;
  tenant_id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  tenantUser: TenantUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshTenant: () => Promise<void>;
  refreshSession: () => Promise<void>;
  isStable: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  currentUserId: string | null;
  currentTenantId: string | null;
  currentUserRole: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setloading] = useState(true);
  const [isStable, setIsStable] = useState(false);

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenantUser, setTenantUser] = useState<TenantUser | null>(null);

  const isDemoMode =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === "https://demo.supabase.co" ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project") ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === "https://your-project.supabase.co";
  const isAuthenticated = !!user && !!session && !loading;
  const currentUserId = user?.id || null;
  const currentTenantId = tenantUser?.tenant_id || null;
  const currentUserRole = tenantUser?.role || null;

  const updateServiceAuthContext = () => {
    setServiceAuthContext({
      userId: currentUserId,
      tenantId: currentTenantId,
      userRole: currentUserRole,
      isAuthenticated,
      isDemoMode,
    });
  };

  const loadTenantUser = async (userId: string) => {
    try {
      console.log(
        `🔍 AuthProvider: Starting loadTenantUser for userId: ${userId}`,
      );
      const startTime = Date.now();
      const { data, error } = await supabase
        .from("tenant_users")
        .select("*")
        .eq("user_id", userId)
        .single();
      const endTime = Date.now();
      console.log(
        `🔍 AuthProvider: loadTenantUser for userId: ${userId} completed in ${endTime - startTime}ms`,
      );

      if (error) {
        console.error("Error fetching tenant user:", error);
        setTenantUser(null);
      } else if (data) {
        setTenantUser(data);
      }
    } catch (error) {
      console.error("Unexpected error fetching tenant user:", error);
      setTenantUser(null);
    }
  };

  useEffect(() => {
    console.log("🔐 AuthProvider: Initializing authentication state");

    const getInitialSession = async () => {
      console.log("🔍 AuthProvider: Starting getInitialSession");
      const sessionStartTime = Date.now();
      try {
        if (isDemoMode) {
          console.log(
            "🎭 AuthProvider: Demo mode detected - skipping session check",
          );
          setUser(null);
          setSession(null);
          setTenantUser(null);

          setloading(false);
          setIsStable(true);
          updateServiceAuthContext();
          console.log("✅ AuthProvider: Demo mode initialization completed");
          return;
        }

        const {
          data: { session: initialSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("❌ AuthProvider: Error getting session:", error);
          setUser(null);
          setSession(null);
          setTenantUser(null);
        } else if (initialSession) {
          console.log("✅ AuthProvider: Found existing session");
          setSession(initialSession);
          setUser(initialSession.user);
          await loadTenantUser(initialSession.user.id);
        } else {
          console.log("⚠️ AuthProvider: No existing session");
          setUser(null);
          setSession(null);
          setTenantUser(null);
        }

        setloading(false);
        setIsStable(true);
        updateServiceAuthContext();
        console.log(
          `✅ AuthProvider: Authentication state stabilized. getInitialSession completed in ${Date.now() - sessionStartTime}ms`,
        );
      } catch (error) {
        console.error(
          "❌ AuthProvider: Unexpected error during initialization:",
          error,
        );
        setUser(null);
        setSession(null);
        setTenantUser(null);

        setloading(false);
        setIsStable(true);
        updateServiceAuthContext();
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        console.log("🔄 AuthProvider: Auth state changed:", event);

        try {
          if (newSession) {
            console.log("✅ AuthProvider: Setting new session and user");
            setSession(newSession);
            setUser(newSession.user);

            try {
              await loadTenantUser(newSession.user.id);
              console.log(
                "✅ AuthProvider: Tenant user loaded successfully (no timeout applied)",
              );
            } catch (tenantError) {
              console.warn(
                "❌ AuthProvider: Failed to load tenant user (no timeout applied):",
                tenantError,
              );
              setTenantUser(null);
            }
          } else {
            console.log("⚠️ AuthProvider: User signed out");
            setUser(null);
            setSession(null);
            setTenantUser(null);
          }
        } catch (error) {
          console.error("❌ AuthProvider: Error in auth state change:", error);
        } finally {
          setloading(false);
          setIsStable(true);
          updateServiceAuthContext();
          console.log("✅ AuthProvider: Auth state change completed");
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log("🔐 AuthProvider: Starting sign in process");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ AuthProvider: Sign in failed:", error);
        setloading(false);
        setIsStable(true);
      } else {
        console.log(
          "✅ AuthProvider: Sign in successful, waiting for auth state change",
        );
      }

      return { error };
    } catch (error) {
      console.error("❌ AuthProvider: Sign in error:", error);
      setloading(false);
      setIsStable(true);
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { error };
    } catch (error) {
      console.error("❌ AuthProvider: Sign up error:", error);
      return { error };
    }
  };

  const signOut = async () => {
    console.log("🔐 AuthProvider: Signing out");
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setTenantUser(null);
      setloading(false);
      setIsStable(true);
      updateServiceAuthContext();

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("❌ AuthProvider: Error during sign out:", error);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  const refreshTenant = async () => {
    console.log("🔄 AuthProvider: Refreshing tenant information");
    if (user) {
      await loadTenantUser(user.id);
    }
  };

  const refreshSession = async () => {
    console.log("🔄 AuthProvider: Refreshing session");
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession();
      if (error) {
        console.error("❌ AuthProvider: Error refreshing session:", error);
      } else {
        setSession(session);
        if (session?.user) {
          setUser(session.user);
          await loadTenantUser(session.user.id);
        }
      }
    } catch (error) {
      console.error(
        "❌ AuthProvider: Unexpected error refreshing session:",
        error,
      );
    }
  };

  const value: AuthContextType = {
    user,
    tenant,
    tenantUser,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshTenant,
    refreshSession,
    isStable,
    isAuthenticated,
    isDemoMode,
    currentUserId,
    currentTenantId,
    currentUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;

