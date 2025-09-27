'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { User, Session, AuthError, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { setServiceAuthContext } from '@/utils/serviceAuth'

interface Tenant {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
}

interface TenantUser {
  id: string
  tenant_id: string
  user_id: string
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  tenant: Tenant | null
  tenantUser: TenantUser | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  refreshTenant: () => Promise<void>
  refreshSession: () => Promise<void>
  isStable: boolean
  isAuthenticated: boolean
  isDemoMode: boolean
  currentUserId: string | null
  currentTenantId: string | null
  currentUserRole: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isStable, setIsStable] = useState(false)
  
  // Tenant state - will be managed by TenantContext
  const [tenant, setTenant] = useState<Tenant | null>(null)
  
  // Tenant user state - will be loaded dynamically based on authentication
  const [tenantUser, setTenantUser] = useState<TenantUser | null>(null)

  // Computed properties for RBAC
  const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                     process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://demo.supabase.co' ||
                     process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') ||
                     process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project') ||
                     process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co'
  const isAuthenticated = !!user && !!session && !loading
  const currentUserId = user?.id || null
  const currentTenantId = tenantUser?.tenant_id || null
  const currentUserRole = tenantUser?.role || null

  // Helper function to update service auth context
  const updateServiceAuthContext = () => {
    setServiceAuthContext({
      userId: currentUserId,
      tenantId: currentTenantId,
      userRole: currentUserRole,
      isAuthenticated,
      isDemoMode
    })
  }

  const loadTenantUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('tenant_users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching tenant user:', error);
        setTenantUser(null);
      } else if (data) {
        setTenantUser(data);
      }
    } catch (error) {
      console.error('Unexpected error fetching tenant user:', error);
      setTenantUser(null);
    }
  };

  // Initialize authentication state
  useEffect(() => {
    console.log('🔐 AuthProvider: Initializing authentication state')
    
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ AuthProvider: Error getting session:', error)
          setUser(null)
          setSession(null)
          setTenantUser(null)
        } else if (initialSession) {
          console.log('✅ AuthProvider: Found existing session')
          setSession(initialSession)
          setUser(initialSession.user)
          await loadTenantUser(initialSession.user.id)
        } else {
          console.log('⚠️ AuthProvider: No existing session')
          setUser(null)
          setSession(null)
          setTenantUser(null)
        }
        
        setLoading(false)
        setIsStable(true)
        updateServiceAuthContext()
        console.log('✅ AuthProvider: Authentication state stabilized')
        
      } catch (error) {
        console.error('❌ AuthProvider: Unexpected error during initialization:', error)
        setUser(null)
        setSession(null)
        setTenantUser(null)
        setLoading(false)
        setIsStable(true)
        updateServiceAuthContext()
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        console.log('🔄 AuthProvider: Auth state changed:', event)
        
        if (newSession) {
          setSession(newSession)
          setUser(newSession.user)
          await loadTenantUser(newSession.user.id)
        } else {
          console.log('⚠️ AuthProvider: User signed out')
          setUser(null)
          setSession(null)
          setTenantUser(null)
        }
        
        setLoading(false)
        setIsStable(true)
        updateServiceAuthContext()
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      console.error('❌ AuthProvider: Sign in error:', error)
      return { error: error as AuthError }
    }
  }

  const signUp = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      return { error }
    } catch (error) {
      console.error('❌ AuthProvider: Sign up error:', error)
      return { error: error as AuthError }
    }
  }

  const signOut = async () => {
    console.log('🔐 AuthProvider: Signing out')
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setTenantUser(null)
      setLoading(false)
      setIsStable(true)
      updateServiceAuthContext()
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('❌ AuthProvider: Error during sign out:', error)
      // Still redirect even if there's an error
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  }

  const refreshTenant = async () => {
    console.log('🔄 AuthProvider: Refreshing tenant information')
    if (user) {
      await loadTenantUser(user.id);
    }
  }

  const refreshSession = async () => {
    console.log('🔄 AuthProvider: Refreshing session')
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error('❌ AuthProvider: Error refreshing session:', error)
      } else {
        setSession(session)
        if (session?.user) {
          setUser(session.user)
          await loadTenantUser(session.user.id);
        }
      }
    } catch (error) {
      console.error('❌ AuthProvider: Unexpected error refreshing session:', error)
    }
  }

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
    currentUserRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext

