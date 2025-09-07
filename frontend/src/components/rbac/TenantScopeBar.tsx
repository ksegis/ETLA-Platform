'use client'

import React from 'react'
import { Building, ChevronDown, Search } from 'lucide-react'

interface Tenant {
  id: string
  name: string
}

interface TenantScopeBarProps {
  tenants: Tenant[]
  selectedTenant: Tenant | null
  onTenantChange: (tenant: Tenant) => void
  searchTerm: string
  onSearchChange: (search: string) => void
  loading?: boolean
}

export default function TenantScopeBar({
  tenants,
  selectedTenant,
  onTenantChange,
  searchTerm,
  onSearchChange,
  loading = false
}: TenantScopeBarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Tenant Selector */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <Building className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900">
                {selectedTenant ? selectedTenant.name : 'Select Tenant'}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="max-h-60 overflow-y-auto">
                  {tenants.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      No tenants available
                    </div>
                  ) : (
                    tenants.map(tenant => (
                      <button
                        key={tenant.id}
                        onClick={() => {
                          onTenantChange(tenant)
                          setIsDropdownOpen(false)
                        }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                          selectedTenant?.id === tenant.id
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-900'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span>{tenant.name}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {selectedTenant && (
            <div className="text-sm text-gray-500">
              Managing access for <span className="font-medium">{selectedTenant.name}</span>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  )
}

