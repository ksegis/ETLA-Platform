'use client'

import React from 'react'
import RBACTestPanel from '@/components/RBACTestPanel'
import { PermissionGuard, FeatureGuard } from '@/components/PermissionGuards'
import { FEATURES, PERMISSIONS } from '@/hooks/usePermissions'

export default function RBACTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            RBAC Testing Dashboard
          </h1>
          <p className="text-gray-600">
            Verify that Role-Based Access Control is working correctly
          </p>
        </div>

        {/* Main Test Panel */}
        <RBACTestPanel />

        {/* Permission Guard Examples */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Permission Guard Examples</h2>
            <div className="space-y-4">
              
              {/* Host Admin Only */}
              <div className="border rounded p-4">
                <h3 className="font-medium mb-2">Host Admin Only Content</h3>
                <PermissionGuard 
                  feature={FEATURES.SYSTEM_SETTINGS} 
                  permission={PERMISSIONS.MANAGE}
                  fallback={<div className="text-red-600 italic">❌ Access Denied - Host Admin Required</div>}
                >
                  <div className="text-green-600">✅ You have Host Admin access! You can see this content.</div>
                </PermissionGuard>
              </div>

              {/* Program Manager or Higher */}
              <div className="border rounded p-4">
                <h3 className="font-medium mb-2">Project Management Access</h3>
                <PermissionGuard 
                  feature={FEATURES.PROJECT_MANAGEMENT} 
                  permission={PERMISSIONS.MANAGE}
                  fallback={<div className="text-red-600 italic">❌ Access Denied - Project Management Permission Required</div>}
                >
                  <div className="text-green-600">✅ You can manage projects! This content is visible.</div>
                </PermissionGuard>
              </div>

              {/* All Users */}
              <div className="border rounded p-4">
                <h3 className="font-medium mb-2">Basic Reporting Access</h3>
                <PermissionGuard 
                  feature={FEATURES.REPORTING} 
                  permission={PERMISSIONS.VIEW}
                  fallback={<div className="text-red-600 italic">❌ Access Denied - No Reporting Access</div>}
                >
                  <div className="text-green-600">✅ You can view reports! This is available to all users.</div>
                </PermissionGuard>
              </div>

              {/* Feature Guard Example */}
              <div className="border rounded p-4">
                <h3 className="font-medium mb-2">Work Requests Feature Access</h3>
                <FeatureGuard 
                  feature={FEATURES.WORK_REQUESTS}
                  fallback={<div className="text-red-600 italic">❌ Access Denied - No Work Requests Access</div>}
                >
                  <div className="text-green-600">✅ You have access to Work Requests feature!</div>
                </FeatureGuard>
              </div>

              {/* User Management (Admin Only) */}
              <div className="border rounded p-4">
                <h3 className="font-medium mb-2">User Management Access</h3>
                <PermissionGuard 
                  feature={FEATURES.USER_MANAGEMENT} 
                  permission={PERMISSIONS.MANAGE}
                  fallback={<div className="text-red-600 italic">❌ Access Denied - User Management Permission Required</div>}
                >
                  <div className="text-green-600">✅ You can manage users! Admin access confirmed.</div>
                </PermissionGuard>
              </div>

            </div>
          </div>
        </div>

        {/* Browser Console Testing Instructions */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-yellow-800">Browser Console Testing</h2>
            <div className="space-y-2 text-sm">
              <p className="text-yellow-700">Open your browser's developer console (F12) and run these commands:</p>
              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs space-y-1">
                <div>// Check current user role</div>
                <div>console.log('Role:', JSON.parse(localStorage.getItem('authState') || '&#123;&#125;').user?.role)</div>
                <div></div>
                <div>// Check permissions</div>
                <div>console.log('Permissions:', JSON.parse(localStorage.getItem('authState') || '&#123;&#125;').permissions)</div>
                <div></div>
                <div>// Test specific permission</div>
                <div>window.testPermission = (feature, permission) =&gt; &#123;</div>
                <div>  const auth = JSON.parse(localStorage.getItem('authState') || '&#123;&#125;')</div>
                <div>  return auth.permissions?.some(p =&gt; p.feature === feature && p.permission === permission)</div>
                <div>&#125;</div>
                <div>testPermission('project-management', 'manage')</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

