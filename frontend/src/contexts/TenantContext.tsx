// contexts/TenantContext.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase, Tenant, User } from '@/lib/supabase'

interface TenantContextType {
  currentTenant: string | null
  userRole: string | null
  userProfile: User | null
  switchTenant: (tenantId: string) => void
  availableTenants: Tenant[]
  loading: boolean
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export function TenantProvider({ children }: { children: ReactNode }) {
  const [currentTenant, setCurrentTenant] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (profile) {
            setUserProfile(profile)
            setUserRole(profile.role)
            setCurrentTenant(profile.tenant_id)
            
            // If host user, get available tenants
            if (profile.role === 'host_admin' || profile.role === 'program_manager') {
              const { data: tenants } = await supabase
                .from('tenants')
                .select('*')
                .eq('status', 'active')
                .order('company_name')
              
              setAvailableTenants(tenants || [])
            }
          }
        }
      } catch (error) {
        console.error('Error initializing user:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setCurrentTenant(null)
          setUserRole(null)
          setUserProfile(null)
          setAvailableTenants([])
        } else if (event === 'SIGNED_IN' && session?.user) {
          await initializeUser()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const switchTenant = (tenantId: string) => {
    setCurrentTenant(tenantId)
  }

  return (
    <TenantContext.Provider value={{
      currentTenant,
      userRole,
      userProfile,
      switchTenant,
      availableTenants,
      loading
    }}>
      {children}
    </TenantContext.Provider>
  )
}

export const useTenant = () => {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider')
  }
  return context
}

