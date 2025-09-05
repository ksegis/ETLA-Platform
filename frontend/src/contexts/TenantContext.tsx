'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'
import { Tenant } from '@/types'

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

  // Demo tenant for demo mode - will be replaced with real tenant data when authenticated
  const demoTenant: Tenant = {
    id: 'demo-tenant-id',
    name: 'Demo Company',
    domain: 'demo.company.com',
    status: 'active',
    subscription_plan: 'professional',
    subscription_start_date: new Date().toISOString(),
    max_users: 100,
    current_users: 5,
    settings: {},
    tenant_id: 'demo-tenant-id',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
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
          .order('name')

        if (error) throw error
        setAvailableTenants(data || [])
        
        // Set first tenant as default for host admin
        const defaultTenant = data?.[0] || null
        setSelectedTenant(defaultTenant)
      } 
      // For other roles, get tenants they have access to
      else {
        // First, get the user's tenant access records
        const { data: accessData, error: accessError } = await supabase
          .from('tenant_users')
          .select('tenant_id')
          .eq('user_id', user.id)
          .eq('is_active', true)

        if (accessError) throw accessError
        
        if (accessData && accessData.length > 0) {
          const tenantIds = accessData.map(item => item.tenant_id)
          
          // Then get the actual tenant records
          const { data: tenantsData, error: tenantsError } = await supabase
            .from('tenants')
            .select('*')
            .in('id', tenantIds)
            .order('name')

          if (tenantsError) throw tenantsError
          
          setAvailableTenants(tenantsData || [])
          
          // Set user's primary tenant or first available
          const primaryTenant = tenantsData?.find(t => t.id === tenantUser?.tenant_id) || tenantsData?.[0] || null
          setSelectedTenant(primaryTenant)
        } else {
          setAvailableTenants([])
          setSelectedTenant(null)
        }
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

