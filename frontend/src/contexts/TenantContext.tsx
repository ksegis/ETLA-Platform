'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'
import { Tenant } from '@/types'

interface TenantContextType {
  // Current selected tenant (for filtering)
  selectedTenant: Tenant | null
  setSelectedTenant: (tenant: Tenant | null) => void
  
  // Available tenants for current user
  availableTenants: Tenant[]
  
  // loading states
  Loading: boolean
  
  // Functions
  loadAvailableTenants: () => Promise<void>
  canSelectTenant: () => boolean
  
  // Multi-tenant support
  getAllAccessibleTenantIds: () => string[]
  isMultiTenant: () => boolean
  
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
  const [Loading, setIsloading] = useState(true)

  // Demo tenant for demo mode - will be replaced with real tenant data when authenticated
  const demoTenant: Tenant = {
    id: '99883779-9517-4ca9-a3f8-7fdc59051f0e', // Use actual Demo Company tenant ID
    name: 'Demo Company',
    domain: 'demo.company.com',
    status: 'active',
    subscription_plan: 'professional', // Use valid SubscriptionPlan type
    subscription_start_date: new Date().toISOString(),
    max_users: 25,
    current_users: 5,
    settings: {},
    tenant_id: '99883779-9517-4ca9-a3f8-7fdc59051f0e',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Phase 1 hierarchy fields
    tenant_tier: 2, // Primary Customer
    can_have_children: true,
    max_child_tenants: 50,
    current_child_count: 0
  }

  // Load available tenants for current user
  const loadAvailableTenants = async () => {
    if (isDemoMode) {
      setAvailableTenants([demoTenant])
      setSelectedTenant(demoTenant)
      setIsloading(false)
      return
    }

    if (!isAuthenticated || !user) {
      setAvailableTenants([])
      setSelectedTenant(null)
      setIsloading(false)
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
        
        // Set first tenant as default for host admin (needed for other pages)
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
          const tenantIds = accessData.map((item: any) => item.tenant_id)
          
          // Then get the actual tenant records
          const { data: tenantsData, error: tenantsError } = await supabase
            .from('tenants')
            .select('*')
            .in('id', tenantIds)
            .order('name')

          if (tenantsError) throw tenantsError
          
          setAvailableTenants(tenantsData || [])
          
          // Set user's primary tenant or first available
          const primaryTenant = tenantsData?.find((t: any) => t.id === tenantUser?.tenant_id) || tenantsData?.[0] || null
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
      setIsloading(false)
    }
  }

  // Check if user can select different tenants
  const canSelectTenant = (): boolean => {
    if (isDemoMode) return false
    return tenantUser?.role === 'host_admin' || tenantUser?.role === 'program_manager'
  }

  // Get all accessible tenant IDs for data loading
  const getAllAccessibleTenantIds = (): string[] => {
    if (isDemoMode) {
      return [demoTenant.id]
    }
    return availableTenants.map(tenant => tenant.id)
  }

  // Check if user has access to multiple tenants
  const isMultiTenant = (): boolean => {
    return availableTenants.length > 1
  }

  // Load tenants when auth state changes
  useEffect(() => {
    loadAvailableTenants()
  }, [isAuthenticated, user, tenantUser, isDemoMode])

  const value: TenantContextType = {
    selectedTenant,
    setSelectedTenant,
    availableTenants,
    Loading,
    loadAvailableTenants,
    canSelectTenant,
    getAllAccessibleTenantIds,
    isMultiTenant,
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

// Hook to get current tenant ID for database queries (single tenant)
export function useCurrentTenantId(): string | null {
  const { selectedTenant, isDemoMode } = useTenant()
  
  if (isDemoMode) {
    return '99883779-9517-4ca9-a3f8-7fdc59051f0e' // Use actual Demo Company tenant ID
  }
  
  return selectedTenant?.id || null
}

// Hook to get all accessible tenant IDs for multi-tenant database queries
export function useAccessibleTenantIds(): string[] {
  const { getAllAccessibleTenantIds } = useTenant()
  return getAllAccessibleTenantIds()
}

// Hook to check if user should see tenant filtering UI
export function useMultiTenantMode(): { isMultiTenant: boolean; selectedTenant: Tenant | null; availableTenants: Tenant[] } {
  const { isMultiTenant, selectedTenant, availableTenants } = useTenant()
  return {
    isMultiTenant: isMultiTenant(),
    selectedTenant,
    availableTenants
  }
}

