'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Shield, Save, RotateCcw, Info } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Define all features/screens in the system
const FEATURES = [
  { id: 'dashboard', name: 'Dashboard', category: 'Core' },
  { id: 'work_requests', name: 'Work Requests', category: 'Operations' },
  { id: 'project_management', name: 'Project Management', category: 'Operations' },
  { id: 'reporting', name: 'Reporting', category: 'Operations' },
  { id: 'talent_dashboard', name: 'Talent Dashboard', category: 'Talent Management' },
  { id: 'job_management', name: 'Job Management', category: 'Talent Management' },
  { id: 'candidates', name: 'Candidates', category: 'Talent Management' },
  { id: 'pipeline', name: 'Pipeline', category: 'Talent Management' },
  { id: 'interviews', name: 'Interviews', category: 'Talent Management' },
  { id: 'offers', name: 'Offers', category: 'Talent Management' },
  { id: 'etl_dashboard', name: 'ETL Dashboard', category: 'ETL Cockpit' },
  { id: 'etl_job_management', name: 'ETL Job Management', category: 'ETL Cockpit' },
  { id: 'hr_analytics', name: 'HR Analytics Dashboard', category: 'Analytics' },
  { id: 'customer_projects', name: 'My Projects', category: 'Customer Portal' },
  { id: 'customer_portfolio', name: 'Portfolio Overview', category: 'Customer Portal' },
  { id: 'user_management', name: 'User Management', category: 'Administration' },
  { id: 'access_control', name: 'Access Control & Security', category: 'Administration' },
  { id: 'role_management', name: 'Role Management', category: 'Administration' },
]

// Define all roles
const ROLES = [
  { id: 'host_admin', name: 'Host Admin', description: 'Full system access' },
  { id: 'client_admin', name: 'Client Admin', description: 'Tenant administration' },
  { id: 'primary_client_admin', name: 'Primary Client Admin', description: 'Primary customer contact' },
  { id: 'program_manager', name: 'Program Manager', description: 'Project oversight' },
  { id: 'client_user', name: 'Client User', description: 'Standard customer user' },
]

// CRUD permissions
const CRUD_PERMISSIONS = ['create', 'read', 'update', 'delete']

interface Permission {
  feature: string
  create: boolean
  read: boolean
  update: boolean
  delete: boolean
  enabled: boolean
}

interface RolePermissions {
  [roleId: string]: {
    [featureId: string]: Permission
  }
}

export default function RoleManagementPage() {
  const [selectedRole, setSelectedRole] = useState<string>('primary_client_admin')
  const [permissions, setPermissions] = useState<RolePermissions>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Load permissions from database
  useEffect(() => {
    loadPermissions()
  }, [])

  const loadPermissions = async () => {
    try {
      setLoading(true)
      
      // TODO: Load from database
      // For now, initialize with default permissions
      const defaultPermissions: RolePermissions = {}
      
      ROLES.forEach(role => {
        defaultPermissions[role.id] = {}
        FEATURES.forEach(feature => {
          defaultPermissions[role.id][feature.id] = getDefaultPermission(role.id, feature.id)
        })
      })
      
      setPermissions(defaultPermissions)
    } catch (error) {
      console.error('Failed to load permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get default permissions based on role
  const getDefaultPermission = (roleId: string, featureId: string): Permission => {
    const base: Permission = {
      feature: featureId,
      create: false,
      read: false,
      update: false,
      delete: false,
      enabled: false,
    }

    // Host Admin - full access to everything
    if (roleId === 'host_admin') {
      return { ...base, create: true, read: true, update: true, delete: true, enabled: true }
    }

    // Primary Client Admin - only customer portal
    if (roleId === 'primary_client_admin') {
      if (featureId === 'dashboard' || featureId === 'customer_projects' || featureId === 'customer_portfolio') {
        return { ...base, read: true, enabled: true }
      }
      return base
    }

    // Client Admin - customer portal + user management
    if (roleId === 'client_admin') {
      if (featureId === 'dashboard' || featureId === 'customer_projects' || featureId === 'customer_portfolio') {
        return { ...base, read: true, update: true, enabled: true }
      }
      if (featureId === 'user_management') {
        return { ...base, create: true, read: true, update: true, enabled: true }
      }
      return base
    }

    // Program Manager - operations access
    if (roleId === 'program_manager') {
      if (['dashboard', 'work_requests', 'project_management', 'reporting'].includes(featureId)) {
        return { ...base, create: true, read: true, update: true, enabled: true }
      }
      return base
    }

    // Client User - read-only customer portal
    if (roleId === 'client_user') {
      if (featureId === 'dashboard' || featureId === 'customer_projects') {
        return { ...base, read: true, enabled: true }
      }
      return base
    }

    return base
  }

  const toggleFeature = (roleId: string, featureId: string) => {
    setPermissions(prev => {
      const newPerms = { ...prev }
      const current = newPerms[roleId][featureId]
      
      if (current.enabled) {
        // Disable feature - turn off all CRUD
        newPerms[roleId][featureId] = {
          ...current,
          enabled: false,
          create: false,
          read: false,
          update: false,
          delete: false,
        }
      } else {
        // Enable feature - turn on read by default
        newPerms[roleId][featureId] = {
          ...current,
          enabled: true,
          read: true,
        }
      }
      
      setHasChanges(true)
      return newPerms
    })
  }

  const toggleCRUD = (roleId: string, featureId: string, permission: string) => {
    setPermissions(prev => {
      const newPerms = { ...prev }
      const current = newPerms[roleId][featureId]
      
      newPerms[roleId][featureId] = {
        ...current,
        [permission]: !current[permission as keyof Permission],
      }
      
      setHasChanges(true)
      return newPerms
    })
  }

  const savePermissions = async () => {
    try {
      setSaving(true)
      
      // TODO: Save to database
      console.log('Saving permissions:', permissions)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert('Permissions saved successfully!')
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to save permissions:', error)
      alert('Failed to save permissions')
    } finally {
      setSaving(false)
    }
  }

  const resetPermissions = () => {
    if (confirm('Reset all permissions to defaults? This will discard unsaved changes.')) {
      loadPermissions()
      setHasChanges(false)
    }
  }

  const selectedRoleData = ROLES.find(r => r.id === selectedRole)
  const selectedPermissions = permissions[selectedRole] || {}

  // Group features by category
  const featuresByCategory = FEATURES.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = []
    }
    acc[feature.category].push(feature)
    return acc
  }, {} as Record<string, typeof FEATURES>)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Role & Permission Management
          </h1>
          <p className="text-gray-600 mt-1">
            Configure screen access and CRUD permissions for each role
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={resetPermissions}
            disabled={!hasChanges || saving}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={savePermissions}
            disabled={!hasChanges || saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-900">Unsaved Changes</p>
            <p className="text-sm text-yellow-700">
              You have unsaved permission changes. Click "Save Changes" to apply them.
            </p>
          </div>
        </div>
      )}

      {/* Role Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Role</CardTitle>
          <CardDescription>Choose a role to configure its permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {ROLES.map(role => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedRole === role.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-gray-900">{role.name}</div>
                <div className="text-sm text-gray-600 mt-1">{role.description}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permission Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions for {selectedRoleData?.name}</CardTitle>
          <CardDescription>
            Toggle features on/off and configure CRUD permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(featuresByCategory).map(([category, features]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b">
                  {category}
                </h3>
                <div className="space-y-2">
                  {features.map(feature => {
                    const perm = selectedPermissions[feature.id]
                    if (!perm) return null

                    return (
                      <div
                        key={feature.id}
                        className={`p-4 rounded-lg border ${
                          perm.enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            {/* Feature Toggle */}
                            <button
                              onClick={() => toggleFeature(selectedRole, feature.id)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                perm.enabled ? 'bg-green-600' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  perm.enabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>

                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{feature.name}</div>
                            </div>
                          </div>

                          {/* CRUD Permissions */}
                          {perm.enabled && (
                            <div className="flex gap-2">
                              {CRUD_PERMISSIONS.map(crud => (
                                <button
                                  key={crud}
                                  onClick={() => toggleCRUD(selectedRole, feature.id, crud)}
                                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                    perm[crud as keyof Permission]
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                  }`}
                                  title={crud.charAt(0).toUpperCase() + crud.slice(1)}
                                >
                                  {crud.charAt(0).toUpperCase()}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="font-semibold text-gray-900">C - Create</div>
              <div className="text-sm text-gray-600">Can create new records</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">R - Read</div>
              <div className="text-sm text-gray-600">Can view records</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">U - Update</div>
              <div className="text-sm text-gray-600">Can edit records</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">D - Delete</div>
              <div className="text-sm text-gray-600">Can delete records</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
