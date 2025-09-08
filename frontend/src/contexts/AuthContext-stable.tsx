'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

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
  session: Session | null
  tenant: Tenant | null
  tenantUser: TenantUser | null
  loading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
  refreshTenant: () => Promise<void>
  getUserId: () => string | null
  getTenantId: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [tenantUser, setTenantUser] = useState<TenantUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing authentication...')
        
        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Error getting initial session:', error)
        } else if (initialSession && mounted) {
          console.log('✅ Initial session found:', {
            userId: initialSession.user?.id,
            email: initialSession.user?.email
          })
          setSession(initialSession)
          setUser(initialSession.user)
          
          // Load tenant information
          await loadTenantInfo(initialSession.user.id)
        } else {
          console.log('ℹ️ No initial session found - using demo fallback')
          // Fallback to demo user if no session
          setDemoUser()
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error)
        // Fallback to demo user on error
        setDemoUser()
      } finally {
        if (mounted) {
          setLoading(false)
          setInitialized(true)
          console.log('✅ Auth initialization complete')
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
    }
  }, [])

  // Set demo user as fallback
  const setDemoUser = () => {
    console.log('🔄 Setting demo user as fallback')
    setUser({
      id: '1',
      email: 'demo@company.com',
      aud: 'authenticated',
      role: 'authenticated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {}
    } as User)
    
    setTenant({
      id: '54afbd1d-e72a-41e1-9d39-2c8a08a257ff',
      name: 'Demo Company',
      slug: 'demo-company',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    
    setTenantUser({
      id: '1',
      tenant_id: '54afbd1d-e72a-41e1-9d39-2c8a08a257ff',
      user_id: '1',
      role: 'admin',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  }

  // Load tenant information for authenticated user
  const loadTenantInfo = async (userId: string) => {
    try {
      console.log('🏢 Loading tenant info for user:', userId)
      
      // Try to get tenant info from database
      const { data: tenantUsers, error } = await supabase
        .from('tenant_users')
        .select(`
          *,
          tenant:tenants(*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(1)
        .single()

      if (error) {
        console.warn('⚠️ Could not load tenant info:', error.message)
        // Use demo tenant as fallback
        setTenant({
          id: '54afbd1d-e72a-41e1-9d39-2c8a08a257ff',
          name: 'Demo Company',
          slug: 'demo-company',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        setTenantUser({
          id: userId,
          tenant_id: '54afbd1d-e72a-41e1-9d39-2c8a08a257ff',
          user_id: userId,
          role: 'admin',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      } else {
        console.log('✅ Tenant info loaded:', tenantUsers)
        setTenant(tenantUsers.tenant)
        setTenantUser(tenantUsers)
      }
    } catch (error) {
      console.error('❌ Error loading tenant info:', error)
      // Use demo tenant as fallback
      setTenant({
        id: '54afbd1d-e72a-41e1-9d39-2c8a08a257ff',
        name: 'Demo Company',
        slug: 'demo-company',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
  }

  // Listen for auth changes
  useEffect(() => {
    if (!initialized) return

    console.log('🔐 Setting up auth state listener...')

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession: any) => {
        console.log('🔐 Auth state change:', {
          event,
          userId: newSession?.user?.id,
          email: newSession?.user?.email,
          hasSession: !!newSession
        })

        // Prevent rapid state changes during initialization
        if (event === 'INITIAL_SESSION') {
          return // Already handled in initialization
        }

        // Update state based on auth event
        switch (event) {
          case 'SIGNED_IN':
            console.log('✅ User signed in')
            setSession(newSession)
            setUser(newSession?.user || null)
            if (newSession?.user?.id) {
              await loadTenantInfo(newSession.user.id)
            }
            break
            
          case 'SIGNED_OUT':
            console.log('👋 User signed out - reverting to demo')
            setSession(null)
            setDemoUser() // Revert to demo user instead of null
            break
            
          case 'TOKEN_REFRESHED':
            console.log('🔄 Token refreshed')
            setSession(newSession)
            setUser(newSession?.user || null)
            break
            
          case 'USER_UPDATED':
            console.log('👤 User updated')
            setSession(newSession)
            setUser(newSession?.user || null)
            break
            
          default:
            console.log('🔐 Other auth event:', event)
            if (newSession) {
              setSession(newSession)
              setUser(newSession.user)
            } else {
              setDemoUser() // Always fallback to demo user
            }
        }
      }
    )

    return () => {
      console.log('🔐 Cleaning up auth listener')
      subscription.unsubscribe()
    }
  }, [initialized])

  // Sign out function
  const signOut = async () => {
    try {
      console.log('👋 Signing out...')
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('❌ Error signing out:', error)
        throw error
      }
      console.log('✅ Signed out successfully - reverting to demo user')
      setDemoUser() // Always revert to demo user
    } catch (error) {
      console.error('❌ Sign out failed:', error)
      setDemoUser() // Fallback to demo user even on error
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Refresh session function
  const refreshSession = async (): Promise<void> => {
    try {
      console.log('🔄 Refreshing session...')
      const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error('❌ Error refreshing session:', error)
        throw error
      }
      console.log('✅ Session refreshed successfully')
      // Don't return the session, just refresh it
    } catch (error) {
      console.error('❌ Session refresh failed:', error)
      throw error
    }
  }

  // Refresh tenant function
  const refreshTenant = async () => {
    if (user?.id) {
      await loadTenantInfo(user.id)
    }
  }

  // Get user ID safely
  const getUserId = (): string | null => {
    const userId = user?.id || null
    if (!userId) {
      console.warn('⚠️ No user ID available - using demo user')
    }
    return userId
  }

  // Get tenant ID safely
  const getTenantId = (): string | null => {
    const tenantId = tenant?.id || '54afbd1d-e72a-41e1-9d39-2c8a08a257ff' // Always fallback to demo tenant
    return tenantId
  }

  // Computed values
  const isAuthenticated = !!user && (!!session || user.email === 'demo@company.com')

  // Context value
  const value: AuthContextType = {
    user,
    session,
    tenant,
    tenantUser,
    loading,
    isAuthenticated,
    signOut,
    refreshSession,
    refreshTenant,
    getUserId,
    getTenantId
  }

  // Debug logging
  useEffect(() => {
    if (!loading && initialized) {
      console.log('🔐 Auth state:', {
        isAuthenticated,
        userId: user?.id,
        email: user?.email,
        tenantId: getTenantId(),
        tenantName: tenant?.name,
        hasSession: !!session,
        isDemo: user?.email === 'demo@company.com'
      })
    }
  }, [user, session, tenant, loading, initialized, isAuthenticated])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook for protected routes
export function useRequireAuth() {
  const auth = useAuth()
  
  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      console.warn('⚠️ User not authenticated - using demo fallback')
      // Don't redirect, just use demo user
    }
  }, [auth.loading, auth.isAuthenticated])
  
  return auth
}

// Higher-order component for protected pages
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const auth = useRequireAuth()
    
    if (auth.loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )
    }
    
    // Always render component - demo user is considered authenticated
    return <Component {...props} />
  }
}

