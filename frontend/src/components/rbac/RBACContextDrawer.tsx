'use client'

import React from 'react'
import { X, User, Shield, Calendar, Mail, Building, AlertCircle, Check, Minus } from 'lucide-react'
import { RBACUserDetail, RBACPermissionCell } from '@/types'

interface RBACContextDrawerProps {
  isOpen: boolean
  onClose: () => void
  userDetail: RBACUserDetail | null
  userPermissions: RBACPermissionCell[]
  onPermissionToggle: (permissionId: string) => void
  onRevertOverride: (permissionId: string) => void
  loading?: boolean
}

export default function RBACContextDrawer({
  isOpen,
  onClose,
  userDetail,
  userPermissions,
  onPermissionToggle,
  onRevertOverride,
  loading = false
}: RBACContextDrawerProps) {
  if (!isOpen) return null

  const overridePermissions = userPermissions.filter((p: any) => p.origin === 'override')
  const rolePermissions = userPermissions.filter((p: any) => p.origin === 'role' && p.state === 'allow')

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">User Permissions</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : userDetail ? (
          <div className="p-6 space-y-6">
            {/* User Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {userDetail.profile.first_name && userDetail.profile.last_name 
                      ? `${userDetail.profile.first_name} ${userDetail.profile.last_name}`
                      : userDetail.profile.email}
                  </h3>
                  <p className="text-xs text-gray-500">{userDetail.profile.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Role:</span>
                  <span className="font-medium">{userDetail.membership.role.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${
                    userDetail.membership.is_active ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {userDetail.membership.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Permission Overrides */}
            {overridePermissions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
                  Permission Overrides ({overridePermissions.length})
                </h4>
                <div className="space-y-2">
                  {overridePermissions.map((permission: any) => (
                    <div
                      key={permission.permissionId}
                      className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-md"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {permission.resource.replace('-', ' ')} - {permission.action}
                        </div>
                        <div className="text-xs text-gray-500">
                          Override: {permission.state}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded flex items-center justify-center ${
                          permission.state === 'allow'
                            ? 'bg-green-500 text-white'
                            : permission.state === 'deny'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-400 text-white'
                        }`}>
                          {permission.state === 'allow' ? (
                            <Check className="h-3 w-3" />
                          ) : permission.state === 'deny' ? (
                            <X className="h-3 w-3" />
                          ) : (
                            <Minus className="h-3 w-3" />
                          )}
                        </div>
                        <button
                          onClick={() => onRevertOverride(permission.permissionId)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Revert
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Role-based Permissions */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <Shield className="h-4 w-4 text-blue-500 mr-2" />
                Role Permissions ({rolePermissions.length})
              </h4>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {rolePermissions.map((permission: any) => (
                  <div
                    key={permission.permissionId}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
                  >
                    <div className="flex-1">
                      <div className="text-sm text-gray-900">
                        {permission.resource.replace('-', ' ')} - {permission.action}
                      </div>
                    </div>
                    <div className="w-6 h-6 bg-green-100 text-green-700 rounded flex items-center justify-center">
                      <Check className="h-3 w-3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All Permissions (for bulk actions) */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">All Permissions</h4>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {userPermissions.map((permission: any) => (
                  <div
                    key={permission.permissionId}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
                  >
                    <div className="flex-1">
                      <div className="text-sm text-gray-900">
                        {permission.resource.replace('-', ' ')} - {permission.action}
                      </div>
                      <div className="text-xs text-gray-500">
                        {permission.origin === 'role' ? `From role: ${permission.roleNames?.join(', ')}` : 
                         permission.origin === 'override' ? 'User override' : 'Not granted'}
                      </div>
                    </div>
                    <button
                      onClick={() => onPermissionToggle(permission.permissionId)}
                      className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${
                        permission.state === 'allow'
                          ? permission.origin === 'override'
                            ? 'bg-green-500 text-white border-green-600'
                            : 'bg-green-100 text-green-700 border-green-200'
                          : permission.state === 'deny'
                          ? permission.origin === 'override'
                            ? 'bg-red-500 text-white border-red-600'
                            : 'bg-red-100 text-red-700 border-red-200'
                          : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {permission.state === 'allow' ? (
                        <Check className="h-3 w-3" />
                      ) : permission.state === 'deny' ? (
                        <X className="h-3 w-3" />
                      ) : (
                        <Minus className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Bulk Actions */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Bulk Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    userPermissions.forEach((p: any) => {
                      if (p.state !== 'allow') {
                        onPermissionToggle(p.permissionId)
                      }
                    })
                  }}
                  className="px-3 py-2 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                >
                  Grant All
                </button>
                <button
                  onClick={() => {
                    userPermissions.forEach((p: any) => {
                      if (p.state !== 'deny') {
                        onPermissionToggle(p.permissionId)
                      }
                    })
                  }}
                  className="px-3 py-2 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                >
                  Deny All
                </button>
                <button
                  onClick={() => {
                    overridePermissions.forEach((p: any) => {
                      onRevertOverride(p.permissionId)
                    })
                  }}
                  className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 col-span-2"
                  disabled={overridePermissions.length === 0}
                >
                  Clear All Overrides
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-sm font-medium text-gray-900">No user selected</h3>
              <p className="text-sm text-gray-500">Click on a user to view their permissions</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

