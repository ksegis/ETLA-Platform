import React, { useState } from 'react'
import { ChevronDown, Building, Check } from 'lucide-react'
import { useTenant } from '@/contexts/TenantContext'
import { Button } from '@/components/ui/Button'

export default function TenantSelector() {
  const { 
    selectedTenant, 
    setSelectedTenant, 
    availableTenants, 
    canSelectTenant, 
    isDemoMode 
  } = useTenant()
  
  const [isOpen, setIsOpen] = useState(false)

  // Don't show selector if user can't select tenants or in demo mode
  if (!canSelectTenant() || isDemoMode || availableTenants.length <= 1) {
    return null
  }

  const handleTenantSelect = (tenant: any) => {
    setSelectedTenant(tenant)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 min-w-[200px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          <span className="truncate">
            {selectedTenant?.company_name || 'Select Tenant'}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
            {availableTenants.map((tenant) => (
              <button
                key={tenant.id}
                onClick={() => handleTenantSelect(tenant)}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between group"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">
                    {tenant.company_name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {tenant.industry} • {tenant.subscription_plan}
                  </span>
                </div>
                
                {selectedTenant?.id === tenant.id && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

