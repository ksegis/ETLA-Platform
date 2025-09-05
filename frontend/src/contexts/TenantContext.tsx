'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from './AuthContext'

export interface Tenant {
  id: string
  company_name: string
  subdomain?: string
  industry?: string
  company_size?: string
  status: 'active' | 'trial' | 'suspended' | 'cancelled'
  subscription_plan: 'trial' | 'professional' | 'enterprise'
  created_at: string
}

interface TenantContextType {
  // Current selected tenant
  selectedTenant: Tenant | null
  setSelectedTenant: (tenant: Tenant | null) => void
  
  // Available tenants for current user
  availableTenants: Tenant[]
  
  // Loading states
  isLoading: boolean
  
  // Functions
  loadAvailableTenants: () => Promise<void>
  canSelectTenant: () => boolean
  
  // Demo mode
  isDemoMode: boolean
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

interface TenantProviderProps {
  children: ReactNode
}

export function TenantProvider({ children }: TenantProviderProps) {
  const { user, tenantUser, isAuthenticated, isDemoMode } = useAuth()
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Demo tenant for demo mode - will be replaced with real tenant data when authenticated
  const demoTenant: Tenant = {
    id: 'demo-tenant-id',
    company_name: 'Demo Company',
    subdomain: 'demo',
    industry: 'Technology',
    company_size: '50-100',
    status: 'active',
    subscription_plan: 'professional',
    created_at: new Date().toISOString()
  }

  // Load available tenants for current user
  const loadAvailableTenants = async () => {
    if (isDemoMode) {
      setAvailableTenants([demoTenant])
      setSelectedTenant(demoTenant)
      setIsLoading(false)
      return
    }

    if (!isAuthenticated || !user) {
      setAvailableTenants([])
      setSelectedTenant(null)
      setIsLoading(false)
      return
    }

    try {
      // For host_admin, get all tenants
      if (tenantUser?.role === 'host_admin') {
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .order('company_name')

        if (error) throw error
        setAvailableTenants(data || [])
        
        // Set first tenant as default for host admin
        const defaultTenant = data?.[0] || null
        setSelectedTenant(defaultTenant)
      } 
      // For other roles, get tenants they have access to
      else {
        const { data, error } = await supabase
          .from('user_tenant_access')
          .select(`
            tenant:tenants(*)
          `)
          .eq('user_id', user.id)
          .eq('is_active', true)

        if (error) throw error
        
        const tenants = (data?.map(item => item.tenant).filter(Boolean) as Tenant[]) || []
        setAvailableTenants(tenants)
        
        // Set user's primary tenant or first available
        const primaryTenant = tenants.find(t => t.id === tenantUser?.tenant_id) || tenants[0] || null
        setSelectedTenant(primaryTenant)
      }
    } catch (error) {
      console.error('Error loading tenants:', error)
      setAvailableTenants([])
      setSelectedTenant(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Check if user can select different tenants
  const canSelectTenant = (): boolean => {
    if (isDemoMode) return false
    return tenantUser?.role === 'host_admin' || tenantUser?.role === 'program_manager'
  }

  // Load tenants when auth state changes
  useEffect(() => {
    loadAvailableTenants()
  }, [isAuthenticated, user, tenantUser, isDemoMode])

  const value: TenantContextType = {
    selectedTenant,
    setSelectedTenant,
    availableTenants,
    isLoading,
    loadAvailableTenants,
    canSelectTenant,
    isDemoMode
  }

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}

// Hook to get current tenant ID for database queries
export function useCurrentTenantId(): string | null {
  const { selectedTenant, isDemoMode } = useTenant()
  
  if (isDemoMode) {
    return 'demo-tenant-id'
  }
  
  return selectedTenant?.id || null
}

