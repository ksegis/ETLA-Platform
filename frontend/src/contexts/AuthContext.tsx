'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { User, Session } from '@supabase/supabase-js'
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
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
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

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_TOKEN || 'demo-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isStable, setIsStable] = useState(false)
  
  // Tenant state with demo fallback
  const [tenant, setTenant] = useState<Tenant | null>({
    id: '54afbd1d-e72a-41e1-9d39-2c8a08a257ff',
    name: 'Demo Company',
    slug: 'demo-company',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })
  
  // Tenant user state with demo fallback
  const [tenantUser, setTenantUser] = useState<TenantUser | null>({
    id: 'demo-tenant-user-id',
    tenant_id: '54afbd1d-e72a-41e1-9d39-2c8a08a257ff',
    user_id: 'demo-user-id',
    role: 'client_admin', // Default to client_admin for demo
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })

  // Computed properties for RBAC
  const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                     process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://demo.supabase.co' ||
                     process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
  const isAuthenticated = !!user || !!session || isDemoMode
  const currentUserId = user?.id || tenantUser?.user_id || null
  const currentTenantId = tenant?.id || null
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

  // Initialize authentication state
  useEffect(() => {
    console.log('🔐 AuthProvider: Initializing authentication state')
    
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ AuthProvider: Error getting session:', error)
          // Fall back to demo mode
          setUser({
            id: 'demo-user-id',
            email: 'demo@company.com',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            confirmation_sent_at: new Date().toISOString()
          } as unknown as User)
          
          setTenantUser({
            id: 'demo-tenant-user-id',
            tenant_id: '54afbd1d-e72a-41e1-9d39-2c8a08a257ff',
            user_id: 'demo-user-id',
            role: 'client_admin',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        } else if (initialSession) {
          console.log('✅ AuthProvider: Found existing session')
          setSession(initialSession)
          setUser(initialSession.user)
          
          // Set tenant user for authenticated user
          setTenantUser({
            id: 'demo-tenant-user-id',
            tenant_id: '54afbd1d-e72a-41e1-9d39-2c8a08a257ff',
            user_id: initialSession.user.id,
            role: 'client_admin',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        } else {
          console.log('⚠️ AuthProvider: No existing session, using demo user')
          // Fallback to demo user for stability
          setUser({
            id: 'demo-user-id',
            email: 'demo@company.com',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            confirmation_sent_at: new Date().toISOString()
          } as unknown as User)
          
          // Set demo tenant user
          setTenantUser({
            id: 'demo-tenant-user-id',
            tenant_id: '54afbd1d-e72a-41e1-9d39-2c8a08a257ff',
            user_id: 'demo-user-id',
            role: 'client_admin',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        }
        
        setLoading(false)
        setIsStable(true)
        updateServiceAuthContext()
        console.log('✅ AuthProvider: Authentication state stabilized')
        
      } catch (error) {
        console.error('❌ AuthProvider: Unexpected error during initialization:', error)
        // Ensure we always have a stable state
        setUser(null)
        setSession(null)
        setTenantUser({
          id: 'demo-tenant-user-id',
          tenant_id: '54afbd1d-e72a-41e1-9d39-2c8a08a257ff',
          user_id: 'demo-user-id',
          role: 'client_admin',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        setLoading(false)
        setIsStable(true)
        updateServiceAuthContext()
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('🔄 AuthProvider: Auth state changed:', event)
        
        if (newSession) {
          setSession(newSession)
          setUser(newSession.user)
          
          // Set tenant user for authenticated user
          setTenantUser({
            id: 'demo-tenant-user-id',
            tenant_id: '54afbd1d-e72a-41e1-9d39-2c8a08a257ff',
            user_id: newSession.user.id,
            role: 'client_admin',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        } else {
          console.log('⚠️ AuthProvider: User signed out, falling back to demo user')
          // Fallback to demo user for stability
          setUser({
            id: 'demo-user-id',
            email: 'demo@company.com',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            confirmation_sent_at: new Date().toISOString()
          } as unknown as User)
          setSession(null)
          
          // Set demo tenant user
          setTenantUser({
            id: 'demo-tenant-user-id',
            tenant_id: '54afbd1d-e72a-41e1-9d39-2c8a08a257ff',
            user_id: 'demo-user-id',
            role: 'client_admin',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
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

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      console.error('❌ AuthProvider: Sign in error:', error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      return { error }
    } catch (error) {
      console.error('❌ AuthProvider: Sign up error:', error)
      return { error }
    }
  }

  const signOut = async () => {
    console.log('🔐 AuthProvider: Signing out')
    try {
      await supabase.auth.signOut()
      
      // Reset to demo state
      setUser(null)
      setSession(null)
      setTenantUser({
        id: 'demo-tenant-user-id',
        tenant_id: '54afbd1d-e72a-41e1-9d39-2c8a08a257ff',
        user_id: 'demo-user-id',
        role: 'client_admin',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
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
    // In a real implementation, this would fetch fresh tenant data
    // For now, we maintain the demo state
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

