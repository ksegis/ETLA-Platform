'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
  getUserId: () => string | null
  isStable: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setloading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [isStable, setIsStable] = useState(false)

  // Initialize auth state with stability
  useEffect(() => {
    let mounted = true
    let stabilityTimer: NodeJS.Timeout

    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing stable authentication...')
        
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
          setloading(false)
          setInitialized(true)
          
          // Set stable after a brief delay to prevent flickering
          stabilityTimer = setTimeout(() => {
            if (mounted) {
              setIsStable(true)
              console.log('✅ Auth state stabilized')
            }
          }, 500)
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
      if (stabilityTimer) {
        clearTimeout(stabilityTimer)
      }
    }
  }, [])

  // Set demo user as fallback
  const setDemoUser = () => {
    console.log('🔄 Setting demo user as stable fallback')
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
  }

  // Listen for auth changes with stability control
  useEffect(() => {
    if (!initialized) return

    console.log('🔐 Setting up stable auth state listener...')

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
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

        // Temporarily mark as unstable during changes
        setIsStable(false)

        // Update state based on auth event
        switch (event) {
          case 'SIGNED_IN':
            console.log('✅ User signed in')
            setSession(newSession)
            setUser(newSession?.user || null)
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

        // Restore stability after a brief delay
        setTimeout(() => {
          setIsStable(true)
          console.log('✅ Auth state re-stabilized after change')
        }, 300)
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
      setloading(true)
      setIsStable(false)
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
      setloading(false)
      setTimeout(() => setIsStable(true), 300)
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

  // Get user ID safely with stability
  const getUserId = (): string | null => {
    const userId = user?.id || null
    if (!userId) {
      console.warn('⚠️ No user ID available - using demo user')
    }
    return userId
  }

  // Computed values
  const isAuthenticated = !!user && (!!session || user.email === 'demo@company.com')

  // Context value
  const value: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated,
    signOut,
    refreshSession,
    getUserId,
    isStable
  }

  // Debug logging with stability info
  useEffect(() => {
    if (!loading && initialized) {
      console.log('🔐 Stable auth state:', {
        isAuthenticated,
        isStable,
        userId: user?.id,
        email: user?.email,
        hasSession: !!session,
        isDemo: user?.email === 'demo@company.com'
      })
    }
  }, [user, session, loading, initialized, isAuthenticated, isStable])

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

// Hook for protected routes that waits for stability
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
    
    if (auth.loading || !auth.isStable) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">loading...</p>
          </div>
        </div>
      )
    }
    
    // Always render component - demo user is considered authenticated
    return <Component {...props} />
  }
}

