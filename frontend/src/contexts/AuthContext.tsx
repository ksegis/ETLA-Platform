'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { User, Session } from '@supabase/supabase-js'

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
  isStable: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

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
  
  const [tenantUser, setTenantUser] = useState<TenantUser | null>(null)
  
  // Create Supabase client with environment variables
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_TOKEN || ''
  )

  useEffect(() => {
    console.log('🔧 AuthProvider: Initializing authentication...')
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ AuthProvider: Error getting initial session:', error)
          // Fallback to demo user for stability
          setUser({
            id: 'demo-user-id',
            email: 'demo@company.com',
            user_metadata: { name: 'Demo User' }
          } as unknown as User)
          setSession(null)
        } else if (initialSession) {
          console.log('✅ AuthProvider: Found existing session for:', initialSession.user.email)
          setUser(initialSession.user)
          setSession(initialSession)
          
          // Set tenant user for authenticated user
          setTenantUser({
            id: 'demo-tenant-user-id',
            tenant_id: '54afbd1d-e72a-41e1-9d39-2c8a08a257ff',
            user_id: initialSession.user.id,
            role: 'admin',
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
            user_metadata: { name: 'Demo User' }
          } as unknown as User)
          setSession(null)
          
          // Set demo tenant user
          setTenantUser({
            id: 'demo-tenant-user-id',
            tenant_id: '54afbd1d-e72a-41e1-9d39-2c8a08a257ff',
            user_id: 'demo-user-id',
            role: 'admin',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        }
        
        setLoading(false)
        setIsStable(true)
        console.log('✅ AuthProvider: Authentication state stabilized')
        
      } catch (error) {
        console.error('❌ AuthProvider: Error during initialization:', error)
        // Fallback to demo user for stability
        setUser({
          id: 'demo-user-id',
          email: 'demo@company.com',
          user_metadata: { name: 'Demo User' }
        } as unknown as User)
        setSession(null)
        setTenantUser({
          id: 'demo-tenant-user-id',
          tenant_id: '54afbd1d-e72a-41e1-9d39-2c8a08a257ff',
          user_id: 'demo-user-id',
          role: 'admin',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        setLoading(false)
        setIsStable(true)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('🔄 AuthProvider: Auth state change:', event, newSession?.user?.email || 'no user')
        
        // Prevent rapid state changes during token refresh
        if (event === 'TOKEN_REFRESHED' && user && newSession?.user?.id === user.id) {
          console.log('🔄 AuthProvider: Token refreshed for same user, maintaining stability')
          setSession(newSession)
          return
        }
        
        // Handle significant auth changes
        if (newSession) {
          console.log('✅ AuthProvider: User authenticated:', newSession.user.email)
          setUser(newSession.user)
          setSession(newSession)
          
          // Set tenant user for authenticated user
          setTenantUser({
            id: 'demo-tenant-user-id',
            tenant_id: '54afbd1d-e72a-41e1-9d39-2c8a08a257ff',
            user_id: newSession.user.id,
            role: 'admin',
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
            user_metadata: { name: 'Demo User' }
          } as unknown as User)
          setSession(null)
          
          // Set demo tenant user
          setTenantUser({
            id: 'demo-tenant-user-id',
            tenant_id: '54afbd1d-e72a-41e1-9d39-2c8a08a257ff',
            user_id: 'demo-user-id',
            role: 'admin',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        }
        
        setLoading(false)
        setIsStable(true)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('🔐 AuthProvider: Attempting sign in for:', email)
    setLoading(true)
    setIsStable(false)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('❌ AuthProvider: Sign in error:', error)
      setLoading(false)
      setIsStable(true)
    }
    
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    console.log('📝 AuthProvider: Attempting sign up for:', email)
    setLoading(true)
    setIsStable(false)
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) {
      console.error('❌ AuthProvider: Sign up error:', error)
      setLoading(false)
      setIsStable(true)
    }
    
    return { error }
  }

  const signOut = async () => {
    console.log('🚪 AuthProvider: Signing out user')
    setLoading(true)
    setIsStable(false)
    
    await supabase.auth.signOut()
    
    // Immediately set demo user for stability
    setUser({
      id: 'demo-user-id',
      email: 'demo@company.com',
      user_metadata: { name: 'Demo User' }
    } as unknown as User)
    setSession(null)
    setTenantUser({
      id: 'demo-tenant-user-id',
      tenant_id: '54afbd1d-e72a-41e1-9d39-2c8a08a257ff',
      user_id: 'demo-user-id',
      role: 'admin',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    setLoading(false)
    setIsStable(true)
  }

  const refreshTenant = async () => {
    console.log('🔄 AuthProvider: Refreshing tenant information')
    // Mock implementation - in real app would fetch from database
    setTenant({
      id: '54afbd1d-e72a-41e1-9d39-2c8a08a257ff',
      name: 'Demo Company',
      slug: 'demo-company',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  }

  const value = {
    user,
    tenant,
    tenantUser,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshTenant,
    isStable
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

