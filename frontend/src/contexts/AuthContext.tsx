"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'

interface User {
  id: string
  email: string
  role: string
}

/** ---------- Types (unchanged) ---------- */
interface Tenant {
  id: string
  name: string
  status: string
}

interface AuthContextType {
  user: User | null
  tenant: Tenant | null
  isAuthenticated: boolean
  isDemoMode: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  setCurrentTenant: (tenant: Tenant) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
        const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: 'user'
        })
        // Set a default tenant for demo purposes
        setTenant({
          id: '1',
          name: 'Demo Company',
          status: 'active'
        })
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = createSupabaseBrowserClient().auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        console.log("🔄 AuthProvider: Auth state changed:", event)
        
        try {
          if (newSession) {
            console.log("✅ AuthProvider: Setting new session and user")
            setSession(newSession)
            setUser(newSession.user)
            
            // Load tenant user with timeout protection
            try {
              await Promise.race([
                loadTenantUser(newSession.user.id),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error("Tenant user load timeout")), 15000)
                )
              ])
              console.log("✅ AuthProvider: Tenant user loaded successfully")
            } catch (tenantError) {
              console.warn("⚠️ AuthProvider: Failed to load tenant user:", tenantError)
              // Continue with login even if tenant user fails to load
              setTenantUser(null)
            }
          } else {
            console.log("⚠️ AuthProvider: User signed out")
            setUser(null)
            setSession(null)
            setTenantUser(null)
          }
        } catch (error) {
          console.error("❌ AuthProvider: Error in auth state change:", error)
        } finally {
          // Always clear loading state
          clearTimeout(initTimeout)
          setLoading(false)
          setIsStable(true)
          updateServiceAuthContext()
          console.log("✅ AuthProvider: Auth state change completed")
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signOut = async () => {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setTenant(null)
  }

  const setCurrentTenant = (newTenant: Tenant) => {
    setTenant(newTenant)
  }

  const isAuthenticated = !!user;
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  const value = {
    user,
    tenant,
    isAuthenticated,
    isDemoMode,
    loading,
    signIn,
    signOut,
    setCurrentTenant,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
