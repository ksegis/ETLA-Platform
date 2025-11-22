'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Shield, Save, RotateCcw, Info } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { loadAllRolePermissions, saveRolePermissions } from '@/services/role_permissions_service'

// Define all features/screens in the system (matches new navigation structure)
const FEATURES = [
  // ===== OPERATIONS & PROJECTS =====
  // Work Management Sub-Group
  { id: 'work-requests', name: 'Work Requests', category: 'Operations & Projects', subCategory: 'Work Management' },
  { id: 'project-management', name: 'Project Management', category: 'Operations & Projects', subCategory: 'Work Management' },
  { id: 'customer-projects', name: 'My Projects', category: 'Operations & Projects', subCategory: 'Work Management' },
  { id: 'customer-portfolio', name: 'Portfolio Overview', category: 'Operations & Projects', subCategory: 'Work Management' },
  
  // Reporting & Analytics Sub-Group
  { id: 'reporting', name: 'Reporting', category: 'Operations & Projects', subCategory: 'Reporting & Analytics' },
  { id: 'hr-analytics', name: 'HR Analytics Dashboard', category: 'Operations & Projects', subCategory: 'Reporting & Analytics' },
  
  // ===== TALENT & RECRUITMENT =====
  { id: 'talent-dashboard', name: 'Talent Dashboard', category: 'Talent & Recruitment' },
  { id: 'job-management', name: 'Job Postings', category: 'Talent & Recruitment' },
  { id: 'candidates', name: 'Candidates', category: 'Talent & Recruitment' },
  { id: 'pipeline', name: 'Pipeline', category: 'Talent & Recruitment' },
  { id: 'interviews', name: 'Interviews', category: 'Talent & Recruitment' },
  { id: 'offers', name: 'Offers', category: 'Talent & Recruitment' },
  
  // ===== ETL & DATA PLATFORM =====
  // Monitoring & Insights Sub-Group
  { id: 'etl-dashboard', name: 'ETL Dashboard', category: 'ETL & Data Platform', subCategory: 'Monitoring & Insights' },
  { id: 'etl-progress-monitor', name: 'Progress Monitor', category: 'ETL & Data Platform', subCategory: 'Monitoring & Insights' },
  { id: 'audit-log', name: 'Audit Trail', category: 'ETL & Data Platform', subCategory: 'Monitoring & Insights' },
  { id: 'system-health', name: 'System Health', category: 'ETL & Data Platform', subCategory: 'Monitoring & Insights' },
  
  // Data Processing Sub-Group
  { id: 'talent-data-import', name: 'Talent Data Import', category: 'ETL & Data Platform', subCategory: 'Data Processing' },
  { id: 'employee-records', name: 'Employee Data Processing', category: 'ETL & Data Platform', subCategory: 'Data Processing' },
  { id: 'etl-jobs', name: 'Job Management (ETL)', category: 'ETL & Data Platform', subCategory: 'Data Processing' },
  { id: 'file-upload', name: 'File Upload', category: 'ETL & Data Platform', subCategory: 'Data Processing' },
  
  // Configuration & Tools Sub-Group
  { id: 'etl-scheduling', name: 'Scheduling', category: 'ETL & Data Platform', subCategory: 'Configuration & Tools' },
  { id: 'data-transformations', name: 'Transformations', category: 'ETL & Data Platform', subCategory: 'Configuration & Tools' },
  { id: 'data-validation', name: 'Data Validation', category: 'ETL & Data Platform', subCategory: 'Configuration & Tools' },
  { id: 'analytics', name: 'Data Analytics', category: 'ETL & Data Platform', subCategory: 'Configuration & Tools' },
  
  // ===== SYSTEM CONFIGURATION =====
  { id: 'system-settings', name: 'System Settings', category: 'System Configuration' },
  { id: 'api-config', name: 'API Configuration', category: 'System Configuration' },
  { id: 'integrations', name: 'Integration Settings', category: 'System Configuration' },
  
  // ===== ADMINISTRATION =====
  // Access & Security Sub-Group
  { id: 'access-control', name: 'Access Control', category: 'Administration', subCategory: 'Access & Security' },
  { id: 'role-management', name: 'Role Management', category: 'Administration', subCategory: 'Access & Security' },
  { id: 'tenant-management', name: 'Tenant Management', category: 'Administration', subCategory: 'Access & Security' },
  { id: 'tenant-features', name: 'Tenant Features', category: 'Administration', subCategory: 'Access & Security' },
  
  // HR & Payroll Sub-Group
  { id: 'employee-directory', name: 'Employee Directory', category: 'Administration', subCategory: 'HR & Payroll' },
  { id: 'benefits-management', name: 'Benefits Management', category: 'Administration', subCategory: 'HR & Payroll' },
  { id: 'payroll-processing', name: 'Payroll Management', category: 'Administration', subCategory: 'HR & Payroll' },
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
      
      // Load permissions from database
      const dbPermissions = await loadAllRolePermissions()
      
      // Convert database format to UI format
      const uiPermissions: RolePermissions = {}
      
      ROLES.forEach(role => {
        uiPermissions[role.id] = {}
        FEATURES.forEach(feature => {
          const dbPerm = dbPermissions[role.id]?.[feature.id]
          
          if (dbPerm) {
            // Use database permissions
            uiPermissions[role.id][feature.id] = {
              feature: feature.id,
              create: dbPerm.can_create,
              read: dbPerm.can_read,
              update: dbPerm.can_update,
              delete: dbPerm.can_delete,
              enabled: dbPerm.can_read || dbPerm.can_create || dbPerm.can_update || dbPerm.can_delete,
            }
          } else {
            // Feature not in database - disabled by default
            uiPermissions[role.id][feature.id] = {
              feature: feature.id,
              create: false,
              read: false,
              update: false,
              delete: false,
              enabled: false,
            }
          }
        })
      })
      
      setPermissions(uiPermissions)
    } catch (error) {
      console.error('Failed to load permissions:', error)
      alert('Failed to load permissions from database')
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
      
      // Save each role's permissions to database
      for (const role of ROLES) {
        const rolePerms = permissions[role.id]
        
        // Convert UI format to database format
        const featurePermissions = Object.entries(rolePerms)
          .filter(([_, perm]) => perm.enabled) // Only save enabled features
          .map(([featureId, perm]) => ({
            feature_id: featureId,
            can_create: perm.create,
            can_read: perm.read,
            can_update: perm.update,
            can_delete: perm.delete,
          }))
        
        await saveRolePermissions(role.id, featurePermissions)
      }
      
      alert('Permissions saved successfully!')
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to save permissions:', error)
      alert('Failed to save permissions. Please try again.')
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

  // Group features by category and sub-category
  const featuresByCategory = FEATURES.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = []
    }
    acc[feature.category].push(feature)
    return acc
  }, {} as Record<string, typeof FEATURES>)

  // Group by sub-category within each category
  const featuresGrouped = Object.entries(featuresByCategory).map(([category, features]) => {
    const withSubCategories = features.filter(f => f.subCategory)
    const withoutSubCategories = features.filter(f => !f.subCategory)
    
    const subCategoryGroups = withSubCategories.reduce((acc, feature) => {
      const subCat = feature.subCategory!
      if (!acc[subCat]) {
        acc[subCat] = []
      }
      acc[subCat].push(feature)
      return acc
    }, {} as Record<string, typeof FEATURES>)
    
    return {
      category,
      subCategories: subCategoryGroups,
      flatFeatures: withoutSubCategories
    }
  })

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
          <div className="space-y-8">
            {featuresGrouped.map(({ category, subCategories, flatFeatures }) => (
              <div key={category}>
                <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-300">
                  {category}
                </h3>
                
                {/* Sub-Categories */}
                {Object.entries(subCategories).map(([subCategory, features]) => (
                  <div key={subCategory} className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3 ml-4">
                      {subCategory}
                    </h4>
                    <div className="space-y-2 ml-4">
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
                
                {/* Flat Features (no sub-category) */}
                {flatFeatures.length > 0 && (
                  <div className="space-y-2">
                    {flatFeatures.map(feature => {
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
                )}
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
