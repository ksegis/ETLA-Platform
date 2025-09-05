'use client'

import React from 'react'
import { useTenant } from '@/contexts/TenantContext'
import { Building } from 'lucide-react'

interface TenantDisplayProps {
  tenantId?: string
  showIcon?: boolean
  className?: string
}

export function TenantDisplay({ tenantId, showIcon = true, className = '' }: TenantDisplayProps) {
  const { availableTenants, selectedTenant } = useTenant()
  
  // Use provided tenantId or fall back to selected tenant
  const targetTenantId = tenantId || selectedTenant?.id
  
  // Find the tenant in available tenants
  const tenant = availableTenants.find(t => t.id === targetTenantId)
  
  // Generate friendly display name
  const getFriendlyName = (tenant: any, tenantId: string) => {
    if (tenant) {
      // Use tenant name and code if available
      if (tenant.name && tenant.code) {
        return `${tenant.name} (${tenant.code})`
      }
      if (tenant.name) {
        return tenant.name
      }
      if (tenant.code) {
        return tenant.code
      }
    }
    
    // Fall back to shortened ID with friendly prefix
    if (tenantId) {
      if (tenantId.includes('demo')) {
        return 'Demo Tenant'
      }
      // Show first 8 characters of ID with prefix
      return `Tenant ${tenantId.slice(0, 8)}`
    }
    
    return 'Unknown Tenant'
  }
  
  const displayName = getFriendlyName(tenant, targetTenantId || '')
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && <Building className="h-4 w-4 text-gray-500" />}
      <span className="text-sm font-medium text-gray-700">
        {displayName}
      </span>
    </div>
  )
}

// Hook to get friendly tenant name
export function useFriendlyTenantName(tenantId?: string): string {
  const { availableTenants, selectedTenant } = useTenant()
  
  const targetTenantId = tenantId || selectedTenant?.id
  const tenant = availableTenants.find(t => t.id === targetTenantId)
  
  if (tenant) {
    // Type assertion to handle extended tenant properties
    const extendedTenant = tenant as any
    if (tenant.name && extendedTenant.code) {
      return `${tenant.name} (${extendedTenant.code})`
    }
    if (tenant.name) {
      return tenant.name
    }
    if (extendedTenant.code) {
      return extendedTenant.code
    }
  }
  
  if (targetTenantId) {
    if (targetTenantId.includes('demo')) {
      return 'Demo Tenant'
    }
    return `Tenant ${targetTenantId.slice(0, 8)}`
  }
  
  return 'Unknown Tenant'
}

